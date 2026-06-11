/**
 * 雪峰 Agent 核心类 - 移植自 agent.py
 */
import { extractSlots, isConsultationIntent, getSlotsCompletion, hasRequiredSlots, getMissingSlots, resetSlots, INITIAL_SLOTS } from './SlotManager'
import { buildSystemMessage } from './prompts'
import { callLLM, callLLMWithPseudoStream, buildMessages } from '@/api/llm'

/**
 * 清理 AI 回复中的 Markdown 格式
 * @param {string} text
 * @returns {string}
 */
function cleanupFormat(text) {
  if (!text) return text

  // 去掉 **粗体**
  text = text.replace(/\*\*(.+?)\*\*/g, '$1')
  // 去掉 ### 标题
  text = text.replace(/^#{1,6}\s*/gm, '')
  // 去掉行首 - 列表标记
  text = text.replace(/^\s*[-*]\s+/gm, '')
  // 去掉行首数字编号 1. 2. 等
  text = text.replace(/^\s*\d+[\.、]\s*/gm, '')

  return text.trim()
}

/**
 * 判断是否需要搜索
 * @param {string} text
 * @returns {boolean}
 */
function shouldSearch(text) {
  const triggers = [
    '今年', '最新', '2026', '2025', '最近', '现在',
    '分数线', '录取分', '投档线', '招生计划', '录取',
    '政策', '变化', '改革', '新规',
    '就业率', '就业前景', '薪资', '月薪', '年薪',
    '排名', '第几名', '怎么样', '好不好',
    '能上', '能报', '能进', '稳不稳', '冲不冲',
    '多少分', '什么专业', '一本', '二本', '985', '211',
    '王牌专业', '优势', '缺点', '劣势', '值得', '推荐吗'
  ]
  return triggers.some(t => text.includes(t))
}

export class XuefengAgent {
  constructor(sessionId) {
    this.sessionId = sessionId
    this.slots = { ...INITIAL_SLOTS }
    this.history = []
    this.knowledgeBase = '' // 可从本地 JSON 加载
  }

  /**
   * 发送消息并获取回复
   * @param {string} userMessage - 用户消息
   * @param {function} onChunk - 伪流式回调（可选）
   * @returns {Promise<{ reply: string, slots: object, slotCount: number, updates: string[] }>}
   */
  async chat(userMessage, onChunk = null) {
    // 检查意图并提取槽位
    let updates = []
    if (isConsultationIntent(userMessage)) {
      const result = extractSlots(userMessage, this.slots)
      this.slots = result.updatedSlots
      updates = result.updates
    }

    // 构建系统消息
    const systemMessage = buildSystemMessage(this.slots, this.knowledgeBase)

    // 构建消息列表
    const messages = buildMessages(this.history, userMessage)

    // 如果有槽位更新，追加系统提示
    if (updates.length > 0) {
      messages.push({
        role: 'system',
        content: `(系统自动识别到: ${updates.join(', ')}。请在回复中确认并追问缺失信息。)`
      })
    }

    // 调用 LLM
    let reply
    if (onChunk && typeof onChunk === 'function') {
      // 伪流式调用
      reply = await callLLMWithPseudoStream(messages, systemMessage, onChunk)
    } else {
      // 普通调用
      reply = await callLLM(messages, systemMessage)
    }

    // 清理格式
    reply = cleanupFormat(reply)

    // 保存到历史
    this.history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply }
    )

    // 保留最近 20 条历史
    if (this.history.length > 20) {
      this.history = this.history.slice(-20)
    }

    return {
      reply,
      slots: { ...this.slots },
      slotCount: getSlotsCompletion(this.slots),
      updates
    }
  }

  /**
   * 获取当前槽位状态
   * @returns {object}
   */
  getSlots() {
    return { ...this.slots }
  }

  /**
   * 获取槽位完成度
   * @returns {number}
   */
  getSlotCount() {
    return getSlotsCompletion(this.slots)
  }

  /**
   * 检查是否可以生成报告
   * @returns {boolean}
   */
  canGenerateReport() {
    return hasRequiredSlots(this.slots)
  }

  /**
   * 获取缺失的槽位
   * @returns {string[]}
   */
  getMissingSlots() {
    return getMissingSlots(this.slots)
  }

  /**
   * 重置对话和槽位
   */
  reset() {
    this.slots = resetSlots()
    this.history = []
  }

  /**
   * 从存储恢复状态
   * @param {object} state
   */
  restoreState(state) {
    if (state.slots) {
      this.slots = { ...INITIAL_SLOTS, ...state.slots }
    }
    if (state.history) {
      this.history = state.history
    }
  }

  /**
   * 导出状态用于存储
   * @returns {object}
   */
  exportState() {
    return {
      slots: { ...this.slots },
      history: [...this.history]
    }
  }
}
