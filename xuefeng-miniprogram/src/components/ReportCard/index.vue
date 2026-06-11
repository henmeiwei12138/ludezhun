<template>
  <view class="report-card" @tap="$emit('tap')">
    <view class="card-header">
      <text class="card-title">{{ report.profile || '志愿报告' }}</text>
      <text class="card-date">{{ formatDate(report.createdAt) }}</text>
    </view>
    <view class="card-body">
      <text class="card-summary">{{ summary }}</text>
    </view>
    <view class="card-footer">
      <text class="card-status" :class="report.isUnlocked ? 'paid' : 'free'">
        {{ report.isUnlocked ? '已解锁' : '免费预览' }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  report: {
    _id?: string
    profile?: string
    chong?: any[]
    wen?: any[]
    bao?: any[]
    isUnlocked?: boolean
    createdAt?: any
  }
}>()

defineEmits(['tap'])

const summary = computed(() => {
  const chong = props.report.chong?.length || 0
  const wen = props.report.wen?.length || 0
  const bao = props.report.bao?.length || 0
  return `冲${chong}所 / 稳${wen}所 / 保${bao}所`
})

function formatDate(date: any) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.report-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.card-date {
  font-size: 24rpx;
  color: #999;
}

.card-body {
  margin-bottom: 16rpx;
}

.card-summary {
  font-size: 26rpx;
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.card-status {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

.card-status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.card-status.free {
  background: #fff3e0;
  color: #e65100;
}
</style>
