const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const REPORT_PROMPT = `你是一个资深高考志愿规划师。根据学生的个人信息，生成一份冲稳保志愿推荐报告。

你必须返回严格的 JSON 格式，不要包含任何其他文字。格式如下：
{
  "profile": "学生画像摘要（1-2句话）",
  "chong": [
    {"school": "学校名", "major": "推荐专业", "reason": "推荐理由", "risk": "风险提示"}
  ],
  "wen": [
    {"school": "学校名", "major": "推荐专业", "reason": "推荐理由"}
  ],
  "bao": [
    {"school": "学校名", "major": "推荐专业", "reason": "推荐理由"}
  ],
  "analysis": "专业就业趋势分析（2-3句话）",
  "warning": "风险提示（1-2句话）"
}

规则：
- 冲一冲：5所，录取概率 30-50% 的学校
- 稳妥：5所，录取概率 70-90% 的学校
- 保底：3所，录取概率 95%+ 的学校
- 每所学校推荐 1-2 个适合的专业
- 理由要具体，结合学生的分数、兴趣、家庭资源
- 风险提示要诚实，不要回避问题`

function callLLM(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 3000
    })

    const url = new URL('https://api.deepseek.com/chat/completions')
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
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          if (result.choices && result.choices[0]) {
            resolve(result.choices[0].message.content)
          } else {
            reject(new Error('API 返回格式错误'))
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

exports.main = async (event, context) => {
  const { slots, messages = [], userId } = event
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return { code: -1, msg: '未配置 API Key' }
  }

  if (!slots || !slots.province || !slots.score || !slots.goal) {
    return { code: -1, msg: '信息不完整，至少需要省份、分数、核心诉求' }
  }

  const db = cloud.database()
  const _ = db.command

  // 检查用户次数
  const userRes = await db.collection('users').where({ openid: userId }).get()
  if (userRes.data.length === 0) {
    return { code: -1, msg: '用户不存在' }
  }
  const user = userRes.data[0]
  if (user.plan !== 'vip' && user.credits <= 0) {
    return { code: -2, msg: '免费次数已用完' }
  }

  try {
    // 构建报告请求
    const slotSummary = Object.entries(slots)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')

    const chatSummary = messages.slice(-10).map(m =>
      `${m.role === 'user' ? '学生' : '顾问'}: ${m.content}`
    ).join('\n')

    const userContent = `学生信息：${slotSummary}

对话摘要：
${chatSummary}

请根据以上信息生成志愿报告。`

    const reply = await callLLM([
      { role: 'system', content: REPORT_PROMPT },
      { role: 'user', content: userContent }
    ], apiKey)

    // 解析 JSON
    let report
    try {
      // 尝试提取 JSON（LLM 可能会包裹在 ```json ``` 中）
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      report = JSON.parse(jsonMatch ? jsonMatch[0] : reply)
    } catch (e) {
      return { code: -1, msg: '报告生成失败，AI 返回格式异常' }
    }

    // 存储报告
    const db = cloud.database()
    const reportDoc = await db.collection('reports').add({
      data: {
        userId,
        slots,
        profile: report.profile,
        chong: report.chong || [],
        wen: report.wen || [],
        bao: report.bao || [],
        analysis: report.analysis || '',
        warning: report.warning || '',
        isPaid: false,
        createdAt: db.serverDate()
      }
    })

    return {
      code: 0,
      data: {
        reportId: reportDoc._id,
        ...report
      }
    }
  } catch (err) {
    console.error('报告生成失败:', err)
    return { code: -1, msg: err.message || '报告生成失败' }
  }
}
