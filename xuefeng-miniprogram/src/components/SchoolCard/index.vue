<template>
  <view class="school-card" @tap="$emit('tap')">
    <view class="card-main">
      <view class="name-row">
        <text class="school-name">{{ school.name }}</text>
        <view class="tags">
          <text v-if="school.rank985" class="tag tag-985">985</text>
          <text v-if="school.rank211" class="tag tag-211">211</text>
          <text v-if="school.doubleFirst" class="tag tag-double">双一流</text>
        </view>
      </view>
      <view class="info-row">
        <text class="province">{{ school.province }}</text>
        <text class="type">{{ school.type }}</text>
      </view>
    </view>
    <text class="arrow">></text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  school: {
    _id?: string
    name: string
    province?: string
    type?: string
    rank985?: boolean
    rank211?: boolean
    doubleFirst?: boolean
  }
}>()

defineEmits(['tap'])
</script>

<style scoped>
.school-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-main {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.school-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 12rpx;
}

.tags {
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 2rpx 10rpx;
  font-size: 20rpx;
  border-radius: 8rpx;
}

.tag-985 {
  background: #fff3e0;
  color: #e65100;
}

.tag-211 {
  background: #e3f2fd;
  color: #1565c0;
}

.tag-double {
  background: #e8f5e9;
  color: #2e7d32;
}

.info-row {
  display: flex;
  gap: 16rpx;
}

.province, .type {
  font-size: 24rpx;
  color: #999;
}

.arrow {
  font-size: 28rpx;
  color: #ccc;
  margin-left: 16rpx;
}
</style>
