/**
 * 槽位状态管理
 */
import { reactive, computed } from 'vue'
import { INITIAL_SLOTS, getSlotsCompletion, hasRequiredSlots, getMissingSlots } from '@/agent/SlotManager'

/**
 * 槽位状态
 */
export const slotsState = reactive({
  slots: { ...INITIAL_SLOTS }
})

/**
 * 槽位完成数
 */
export const slotCount = computed(() => getSlotsCompletion(slotsState.slots))

/**
 * 是否可以生成报告
 */
export const canGenerateReport = computed(() => hasRequiredSlots(slotsState.slots))

/**
 * 缺失的槽位列表
 */
export const missingSlots = computed(() => getMissingSlots(slotsState.slots))

/**
 * 更新槽位
 * @param {object} newSlots
 */
export function updateSlots(newSlots) {
  Object.assign(slotsState.slots, newSlots)
}

/**
 * 重置槽位
 */
export function resetSlotsState() {
  Object.assign(slotsState.slots, INITIAL_SLOTS)
}

/**
 * 从 Agent 同步槽位
 * @param {object} agentSlots
 */
export function syncSlotsFromAgent(agentSlots) {
  Object.assign(slotsState.slots, agentSlots)
}
