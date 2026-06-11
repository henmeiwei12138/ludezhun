/**
 * LLM 调用封装
 */
import { callCloudFunction } from './cloud'

/**
 * 调用 LLM
 * @param {Array} messages - 消息列表 [{role: 'user'|'assistant', content: '...'}]
 * @param {string} systemPrompt - 系统提示词
 * @returns {Promise<string>} - AI 回复内容
 */
export async function callLLM(messages, systemPrompt = '') {
  try {
    const result = await callCloudFunction('llm-proxy', {
      messages,
      systemPrompt
    })
    return result.content
  } catch (err) {
    console.error('LLM 调用失败:', err)
    throw err
  }
}

/**
 * 伪流式调用 LLM（逐字渲染）
 * @param {Array} messages - 消息列表
 * @param {string} systemPrompt - 系统提示词
 * @param {function} onChunk - 每次收到文字片段的回调
 * @param {number} interval - 逐字渲染间隔（毫秒）
 * @returns {Promise<string>} - 完整回复
 */
export async function callLLMWithPseudoStream(messages, systemPrompt = '', onChunk = null, interval = 50) {
  // 先获取完整回复
  const fullContent = await callLLM(messages, systemPrompt)

  // 如果没有回调，直接返回
  if (!onChunk || typeof onChunk !== 'function') {
    return fullContent
  }

  // 伪流式：逐字渲染
  return new Promise((resolve) => {
    let index = 0
    let currentContent = ''

    const timer = setInterval(() => {
      if (index < fullContent.length) {
        currentContent += fullContent[index]
        onChunk(currentContent, fullContent[index])
        index++
      } else {
        clearInterval(timer)
        resolve(fullContent)
      }
    }, interval)
  })
}

/**
 * 构建消息列表
 * @param {Array} history - 历史消息
 * @param {string} userMessage - 用户新消息
 * @returns {Array}
 */
export function buildMessages(history, userMessage) {
  const messages = []

  // 添加历史消息（保留最近 10 条）
  const recentHistory = history.slice(-10)
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    })
  }

  // 添加用户新消息
  messages.push({
    role: 'user',
    content: userMessage
  })

  return messages
}
