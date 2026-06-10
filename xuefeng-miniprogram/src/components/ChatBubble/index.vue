<template>
  <view :class="['bubble-wrapper', type === 'user' ? 'user' : 'ai']">
    <image v-if="type === 'ai'" class="avatar" src="/static/logo.png" mode="aspectFill" />
    <view class="bubble" :class="{ 'bubble-loading': loading }">
      <template v-if="loading">
        <text class="loading-text">正在思考</text>
        <view class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </template>
      <text v-else class="content">{{ content }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  type: 'user' | 'ai'
  content?: string
  loading?: boolean
}>()
</script>

<style scoped>
.bubble-wrapper {
  display: flex;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.bubble-wrapper.user {
  justify-content: flex-end;
}

.bubble-wrapper.ai {
  justify-content: flex-start;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.bubble {
  max-width: 70%;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-all;
}

.user .bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-top-right-radius: 4rpx;
}

.ai .bubble {
  background: #fff;
  color: #333;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border-top-left-radius: 4rpx;
}

.bubble-loading {
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.loading-dots {
  display: flex;
  margin-left: 8rpx;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  background: #999;
  border-radius: 50%;
  margin: 0 3rpx;
  animation: dotPulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
