/**
 * 槽位管理器 - 移植自 agent.py 的槽位逻辑
 */

// 省份列表
const PROVINCES = [
  '北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林',
  '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西',
  '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆'
]

// 选科列表
const SUBJECTS = [
  '物理', '历史', '物化生', '物化地', '物化政', '物生政',
  '史政地', '史政生', '史地生', '理科', '文科'
]

// 地域关键词
const REGIONS = [
  '省内', '本省', '离家近', '北上广', '江浙沪', '北京', '上海',
  '深圳', '广州', '杭州', '成都', '武汉', '南京', '西安'
]

// 家庭资源关键词
const FAMILY_KEYWORDS = [
  '电力', '电网', '铁路', '医生', '教师', '老师', '做生意',
  '公务员', '烟草', '石油', '普通家庭', '没资源'
]

// 诉求关键词
const GOAL_KEYWORDS = [
  '就业', '考公', '考研', '稳定', '高薪', '赚钱', '深造', '出国'
]

/**
 * 初始槽位状态
 */
export const INITIAL_SLOTS = {
  province: null,    // 省份
  score: null,       // 分数/位次
  subject: null,     // 选科
  interest: null,    // 兴趣/厌恶
  location: null,    // 地域偏好
  family: null,      // 家庭资源
  goal: null         // 核心诉求
}

/**
 * 从消息文本中提取槽位信息
 * @param {string} text - 用户消息
 * @param {object} currentSlots - 当前槽位状态
 * @returns {{ updatedSlots: object, updates: string[] }}
 */
export function extractSlots(text, currentSlots) {
  const updatedSlots = { ...currentSlots }
  const updates = []

  // 省份检测
  if (!updatedSlots.province) {
    for (const p of PROVINCES) {
      if (text.includes(p)) {
        updatedSlots.province = p
        updates.push(`省份→${p}`)
        break
      }
    }
  }

  // 分数/位次检测
  if (!updatedSlots.score) {
    const scoreMatch = text.match(/(\d{3})\s*分/)
    const rankMatch = text.match(/(\d{4,7})\s*[位名]/)

    if (scoreMatch) {
      updatedSlots.score = scoreMatch[1] + '分'
      updates.push(`分数→${scoreMatch[1]}分`)
    }
    if (rankMatch) {
      if (updatedSlots.score) {
        updatedSlots.score += ' / 位次' + rankMatch[1]
      } else {
        updatedSlots.score = '位次' + rankMatch[1]
      }
      updates.push(`位次→${rankMatch[1]}`)
    }
  }

  // 选科检测
  if (!updatedSlots.subject) {
    for (const subj of SUBJECTS) {
      if (text.includes(subj)) {
        updatedSlots.subject = subj
        updates.push(`选科→${subj}`)
        break
      }
    }
  }

  // 地域检测
  if (!updatedSlots.location) {
    for (const r of REGIONS) {
      if (text.includes(r)) {
        updatedSlots.location = r
        updates.push(`地域→${r}`)
        break
      }
    }
  }

  // 家庭资源检测
  if (!updatedSlots.family) {
    for (const fw of FAMILY_KEYWORDS) {
      if (text.includes(fw)) {
        updatedSlots.family = fw
        updates.push(`家庭→${fw}`)
        break
      }
    }
  }

  // 诉求检测
  if (!updatedSlots.goal) {
    for (const g of GOAL_KEYWORDS) {
      if (text.includes(g)) {
        updatedSlots.goal = g
        updates.push(`诉求→${g}`)
        break
      }
    }
  }

  return { updatedSlots, updates }
}

/**
 * 判断是否有志愿咨询意图
 * @param {string} text - 用户消息
 * @returns {boolean}
 */
export function isConsultationIntent(text) {
  const keywords = [
    '高考', '志愿', '选专业', '报学校', '报志愿', '填志愿', '选科',
    '分科', '考研', '选学校', '大学', '专业', '就业', '考公',
    '能报', '能上', '推荐', '建议', '帮忙看', '帮我选'
  ]
  return keywords.some(kw => text.includes(kw))
}

/**
 * 获取槽位完成度
 * @param {object} slots
 * @returns {number} 0-7
 */
export function getSlotsCompletion(slots) {
  return Object.values(slots).filter(v => v !== null && v !== '').length
}

/**
 * 检查关键槽位是否已填满
 * 至少需要：省份 + 分数/位次 + 核心诉求
 * @param {object} slots
 * @returns {boolean}
 */
export function hasRequiredSlots(slots) {
  return !!(slots.province && slots.score && slots.goal)
}

/**
 * 获取缺失的槽位列表
 * @param {object} slots
 * @returns {string[]}
 */
export function getMissingSlots(slots) {
  const slotNames = {
    province: '省份',
    score: '分数/位次',
    subject: '选科',
    interest: '兴趣/厌恶',
    location: '地域偏好',
    family: '家庭资源',
    goal: '核心诉求'
  }

  return Object.entries(slots)
    .filter(([_, value]) => !value)
    .map(([key]) => slotNames[key] || key)
}

/**
 * 重置槽位
 * @returns {object}
 */
export function resetSlots() {
  return { ...INITIAL_SLOTS }
}
