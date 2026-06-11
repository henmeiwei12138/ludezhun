<template>
  <view class="ad-banner-wrap">
    <!-- 真实广告 -->
    <ad v-if="adUnitId" :unit-id="adUnitId" ad-intervals="60"
      @load="onLoad" @error="onError" @close="onClose"></ad>
    <!-- Mock 占位 -->
    <view v-else class="ad-placeholder">
      <text class="ad-placeholder-text">广告位</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { isMockMode } from '@/utils/ad'

const props = defineProps<{
  adUnitId?: string
}>()

// Mock 模式下不传 adUnitId 时显示占位
const onLoad = () => {
  console.log('Banner 广告加载成功')
}

const onError = (err: any) => {
  console.error('Banner 广告错误:', err)
}

const onClose = () => {
  console.log('Banner 广告关闭')
}
</script>

<style>
.ad-banner-wrap {
  margin: 16rpx 0;
  overflow: hidden;
}

.ad-placeholder {
  height: 100rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  margin: 0 24rpx;
}

.ad-placeholder-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>
