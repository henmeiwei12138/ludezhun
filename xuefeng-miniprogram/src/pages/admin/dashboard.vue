<template>
  <view class="dashboard-container">
    <view class="header">
      <text class="title">运营数据看板</text>
      <text class="update-time">更新时间: {{ updateTime }}</text>
    </view>

    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value">{{ stats.totalUsers }}</text>
        <text class="stat-label">总用户数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.todayActive }}</text>
        <text class="stat-label">今日活跃</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.todayReports }}</text>
        <text class="stat-label">今日报告</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.todayConversations }}</text>
        <text class="stat-label">今日对话</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">广告数据</text>
      <view class="ad-stats">
        <view class="ad-row">
          <text class="ad-label">激励视频曝光</text>
          <text class="ad-value">{{ stats.rewardVideoShows }}</text>
        </view>
        <view class="ad-row">
          <text class="ad-label">激励视频完成</text>
          <text class="ad-value">{{ stats.rewardVideoCompletes }}</text>
        </view>
        <view class="ad-row">
          <text class="ad-label">Banner 曝光</text>
          <text class="ad-value">{{ stats.bannerShows }}</text>
        </view>
        <view class="ad-row">
          <text class="ad-label">插屏广告曝光</text>
          <text class="ad-value">{{ stats.interstitialShows }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">邀请数据</text>
      <view class="ad-stats">
        <view class="ad-row">
          <text class="ad-label">总邀请人数</text>
          <text class="ad-value">{{ stats.totalInvites }}</text>
        </view>
        <view class="ad-row">
          <text class="ad-label">免广告券发放</text>
          <text class="ad-value">{{ stats.freeUnlockGranted }}</text>
        </view>
        <view class="ad-row">
          <text class="ad-label">免广告券使用</text>
          <text class="ad-value">{{ stats.freeUnlockUsed }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">预估收益</text>
      <view class="revenue-card">
        <text class="revenue-value">¥ {{ stats.estimatedRevenue }}</text>
        <text class="revenue-desc">基于 eCPM ¥{{ stats.ecpm }} 预估</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userState } from '@/store/user'
import { callCloudFunction } from '@/api/cloud'

const updateTime = ref('')
const stats = ref({
  totalUsers: 0,
  todayActive: 0,
  todayReports: 0,
  todayConversations: 0,
  rewardVideoShows: 0,
  rewardVideoCompletes: 0,
  bannerShows: 0,
  interstitialShows: 0,
  totalInvites: 0,
  freeUnlockGranted: 0,
  freeUnlockUsed: 0,
  estimatedRevenue: '0.00',
  ecpm: '15.00'
})

onMounted(async () => {
  // 权限检查
  if (userState.role !== 'admin' && userState.role !== 'advisor') {
    uni.showToast({ title: '无权限访问', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  await loadStats()
})

const loadStats = async () => {
  try {
    const result = await callCloudFunction('ad-stats')
    if (result) {
      stats.value = { ...stats.value, ...result }
    }
    updateTime.value = new Date().toLocaleString('zh-CN')
  } catch (err) {
    console.error('加载统计数据失败:', err)
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  }
}
</script>

<style>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.header {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.update-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.ad-stats {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ad-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.ad-row:last-child {
  border-bottom: none;
}

.ad-label {
  font-size: 28rpx;
  color: #666;
}

.ad-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.revenue-card {
  text-align: center;
  padding: 32rpx 0;
}

.revenue-value {
  font-size: 56rpx;
  font-weight: bold;
  color: #ff9800;
  display: block;
}

.revenue-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}
</style>
