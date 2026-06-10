<template>
  <view class="container">
    <view class="header">
      <view class="user-info" v-if="userState.isLoggedIn">
        <image class="avatar" :src="userState.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userState.nickname || '用户' }}</text>
          <text class="credits">剩余次数: {{ userState.credits }}</text>
        </view>
      </view>
      <view class="login-btn" v-else @tap="handleLogin">
        <text>点击登录</text>
      </view>
    </view>

    <view class="features">
      <view class="feature-card" @tap="goToChat">
        <text class="icon">🤖</text>
        <text class="title">AI 志愿顾问</text>
        <text class="desc">智能分析，精准推荐</text>
      </view>

      <view class="feature-card" @tap="goToSchool">
        <text class="icon">🏫</text>
        <text class="title">院校查询</text>
        <text class="desc">全国高校信息一网打尽</text>
      </view>

      <view class="feature-card" @tap="goToReport">
        <text class="icon">📊</text>
        <text class="title">志愿报告</text>
        <text class="desc">个性化志愿方案</text>
      </view>

      <view class="feature-card" @tap="goToProfile">
        <text class="icon">👤</text>
        <text class="title">个人中心</text>
        <text class="desc">管理你的信息</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { userState, login, initUser } from '@/store/user'
import { initCloud } from '@/api/cloud'

onShareAppMessage(() => {
  return {
    title: '雪峰志愿 - AI 高考志愿顾问',
    path: '/pages/index/index'
  }
})

onMounted(() => {
  initCloud()
  if (userState.isLoggedIn) {
    initUser()
  }
})

const handleLogin = async () => {
  try {
    await login()
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}

const goToChat = () => {
  uni.navigateTo({ url: '/pages/chat/index' })
}

const goToSchool = () => {
  uni.switchTab({ url: '/pages/school/index' })
}

const goToReport = () => {
  uni.switchTab({ url: '/pages/report/index' })
}

const goToProfile = () => {
  uni.switchTab({ url: '/pages/profile/index' })
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  padding-top: calc(var(--status-bar-height) + 40rpx);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.info {
  margin-left: 20rpx;
}

.nickname {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  display: block;
}

.credits {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.login-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  text-align: center;
}

.login-btn text {
  color: #fff;
  font-size: 32rpx;
}

.features {
  display: flex;
  flex-wrap: wrap;
  padding: 30rpx;
  gap: 20rpx;
}

.feature-card {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.feature-card .icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.feature-card .title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.feature-card .desc {
  font-size: 24rpx;
  color: #999;
}
</style>
