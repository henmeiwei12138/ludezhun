<template>
  <view class="slot-bar">
    <view class="slots">
      <view v-for="(slot, index) in slotList" :key="index"
        :class="['slot-item', slot.filled ? 'filled' : '']">
        <view class="slot-dot"></view>
        <text class="slot-label">{{ slot.label }}</text>
      </view>
    </view>
    <text class="count">{{ filledCount }}/7</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  slots: Record<string, string | null>
}>()

const SLOT_LABELS: Record<string, string> = {
  province: '省份',
  score: '分数',
  subject: '选科',
  interest: '兴趣',
  location: '地域',
  family: '家庭',
  goal: '诉求'
}

const slotList = computed(() => {
  return Object.entries(SLOT_LABELS).map(([key, label]) => ({
    label,
    filled: !!props.slots[key]
  }))
})

const filledCount = computed(() => {
  return Object.values(props.slots).filter(v => v !== null && v !== '').length
})
</script>

<style scoped>
.slot-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.slots {
  flex: 1;
  display: flex;
  gap: 12rpx;
}

.slot-item {
  display: flex;
  align-items: center;
  padding: 6rpx 14rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  transition: all 0.3s;
}

.slot-item.filled {
  background: #e8f0fe;
}

.slot-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ddd;
  margin-right: 6rpx;
  transition: background 0.3s;
}

.slot-item.filled .slot-dot {
  background: #667eea;
}

.slot-label {
  font-size: 20rpx;
  color: #999;
}

.slot-item.filled .slot-label {
  color: #667eea;
}

.count {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
  margin-left: 12rpx;
}
</style>
