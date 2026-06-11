<template>
  <view v-if="visible" class="reward-modal">
    <view class="reward-mask" @tap="onSkip"></view>
    <view class="reward-content">
      <view class="reward-icon">📺</view>
      <text class="reward-title">看广告解锁完整报告</text>
      <text class="reward-desc">观看 30 秒广告即可解锁全部志愿推荐</text>
      <view class="reward-btn" @tap="onUnlock">
        <text>观看广告解锁</text>
      </view>
      <view class="reward-skip" @tap="onSkip">
        <text>跳过，暂不需要</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'unlocked'): void
  (e: 'skip'): void
}>()

const onUnlock = () => {
  emit('unlocked')
}

const onSkip = () => {
  emit('skip')
}
</script>

<style>
.reward-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.reward-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.reward-content {
  position: relative;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 60rpx 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.reward-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.reward-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 48rpx;
}

.reward-btn {
  width: 100%;
  padding: 28rpx 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 48rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.reward-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.reward-skip {
  padding: 16rpx 0;
}

.reward-skip text {
  font-size: 26rpx;
  color: #999;
}
</style>
