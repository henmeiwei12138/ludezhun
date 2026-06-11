<template>
  <view class="history-container">
    <view v-if="sessions.length === 0" class="empty-state">
      <text>暂无历史对话</text>
    </view>

    <view v-for="session in sessions" :key="session._id" class="session-card" @tap="resumeSession(session)">
      <view class="card-header">
        <text class="card-date">{{ formatDate(session.createdAt) }}</text>
        <text :class="['status', session.status]">{{ statusText(session.status) }}</text>
      </view>
      <text class="card-preview">{{ getPreview(session) }}</text>
      <view class="card-slots">
        <text v-for="(val, key) in session.slots" :key="key" v-show="val" class="slot-tag">{{ val }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userState } from '@/store/user'
import { getUserSessions } from '@/api/cloud'

const sessions = ref<any[]>([])

onMounted(async () => {
  if (!userState.openid) return
  try {
    const result = await getUserSessions(userState.openid)
    sessions.value = result.data || []
  } catch (err) {
    console.error('获取历史对话失败:', err)
  }
})

function formatDate(date: any) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function statusText(status: string) {
  return status === 'active' ? '进行中' : '已完成'
}

function getPreview(session: any) {
  const msgs = session.messages || []
  if (msgs.length === 0) return '空对话'
  const last = msgs[msgs.length - 1]
  return last.content?.substring(0, 50) + (last.content?.length > 50 ? '...' : '')
}

function resumeSession(session: any) {
  // 跳转到对话页面并恢复会话
  uni.navigateTo({
    url: `/pages/chat/index?sessionId=${session._id}`
  })
}
</script>

<style>
.history-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 200rpx 0;
  color: #999;
}

.session-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.card-date {
  font-size: 24rpx;
  color: #999;
}

.status {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status.done {
  background: #f5f5f5;
  color: #999;
}

.card-preview {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.card-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.slot-tag {
  padding: 4rpx 12rpx;
  background: #e8f0fe;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #667eea;
}
</style>
