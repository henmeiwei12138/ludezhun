// 云函数入口文件
const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

/**
 * 调用 DeepSeek API
 * @param {Array} messages - 消息列表
 * @param {string} apiKey - API Key
 * @returns {Promise<object>}
 */
function callDeepSeek(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 2000
    })

    const url = new URL(DEEPSEEK_API_URL)
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          if (result.choices && result.choices[0]) {
            resolve({
              content: result.choices[0].message.content,
              usage: result.usage
            })
          } else {
            reject(new Error('API 返回格式错误'))
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.write(data)
    req.end()
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { messages, systemPrompt } = event

  // 从环境变量获取 API Key
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return {
      code: -1,
      msg: '未配置 API Key'
    }
  }

  try {
    // 构建完整的消息列表
    const fullMessages = []

    // 添加系统提示词
    if (systemPrompt) {
      fullMessages.push({
        role: 'system',
        content: systemPrompt
      })
    }

    // 添加用户消息
    if (messages && messages.length > 0) {
      fullMessages.push(...messages)
    }

    const result = await callDeepSeek(fullMessages, apiKey)

    return {
      code: 0,
      data: {
        content: result.content,
        usage: result.usage
      }
    }
  } catch (err) {
    console.error('LLM 调用失败:', err)
    return {
      code: -1,
      msg: err.message || 'LLM 调用失败'
    }
  }
}
