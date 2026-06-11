<template>
  <view class="profile-container">
    <view class="user-header">
      <view class="user-info" v-if="userState.isLoggedIn">
        <image class="avatar" :src="userState.avatarUrl || '/static/logo.png'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userState.nickname || '用户' }}</text>
        </view>
      </view>
      <view class="login-btn" v-else @tap="handleLogin">
        <text>点击登录</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @tap="goTo('/pages/profile/history')">
        <text class="menu-icon">💬</text>
        <text class="menu-title">历史对话</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @tap="goTo('/pages/report/index', true)">
        <text class="menu-icon">📊</text>
        <text class="menu-title">我的报告</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @tap="goTo('/pages/profile/archive')">
        <text class="menu-icon">📝</text>
        <text class="menu-title">预填档案</text>
        <text class="menu-arrow">></text>
      </view>

      <view v-if="isAdvisor()" class="menu-item" @tap="goToAdvisor">
        <text class="menu-icon">👨‍💼</text>
        <text class="menu-title">顾问工作台</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { userState, login, initUser, isAdvisor } from '@/store/user'

onMounted(() => {
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

const goTo = (url: string, isTab = false) => {
  if (isTab) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

const goToAdvisor = () => {
  // Phase 4 实现
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-header {
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

.menu-list {
  margin: 20rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-title {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #999;
}
</style>
