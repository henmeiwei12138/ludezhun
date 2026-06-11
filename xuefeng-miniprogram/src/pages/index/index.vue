<template>
  <view class="container">
    <view class="header">
      <view class="user-info" v-if="userState.isLoggedIn">
        <image class="avatar" :src="userState.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userState.nickname || '用户' }}</text>
              <text class="credits">欢迎使用雪峰志愿</text>
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

    <!-- Banner 广告 -->
    <AdBanner />

    <!-- 隐私政策弹窗 -->
    <view v-if="showPrivacyPopup" class="privacy-modal">
      <view class="privacy-mask"></view>
      <view class="privacy-content">
        <text class="privacy-title">隐私政策提示</text>
        <text class="privacy-text">欢迎使用雪峰志愿！我们非常重视您的隐私保护。在使用前，请您阅读并了解我们的《隐私政策》和《用户协议》。</text>
        <view class="privacy-link" @tap="goToAgreement">
          <text>查看隐私政策和用户协议</text>
        </view>
        <view class="privacy-actions">
          <view class="privacy-btn disagree" @tap="onPrivacyDisagree">
            <text>不同意</text>
          </view>
          <view class="privacy-btn agree" @tap="onPrivacyAgree">
            <text>同意并继续</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { userState, login, initUser } from '@/store/user'
import AdBanner from '@/components/AdBanner/index.vue'

onShareAppMessage(() => {
  return {
    title: '我在用雪峰志愿选志愿，你也来试试',
    path: `/pages/index/index?inviter=${userState.openid}`
  }
})

const showPrivacyPopup = ref(false)

onMounted(() => {
  if (userState.isLoggedIn) {
    initUser()
  }
  // 处理邀请参数
  handleInviteParam()
  // 检查隐私政策是否已同意
  checkPrivacyAgreement()
})

/**
 * 检查隐私政策是否已同意
 */
const checkPrivacyAgreement = () => {
  const agreed = uni.getStorageSync('privacy_agreed')
  if (!agreed) {
    showPrivacyPopup.value = true
  }
}

const onPrivacyAgree = () => {
  uni.setStorageSync('privacy_agreed', true)
  showPrivacyPopup.value = false
}

const onPrivacyDisagree = () => {
  uni.showModal({
    title: '提示',
    content: '您需要同意隐私政策才能使用本小程序',
    showCancel: false
  })
}

const goToAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/index' })
}

/**
 * 处理分享邀请参数
 */
const handleInviteParam = () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const inviter = page?.options?.inviter
  if (inviter && inviter !== userState.openid) {
    uni.setStorageSync('inviter_openid', inviter)
  }
}

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

/* 隐私政策弹窗 */
.privacy-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.privacy-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.privacy-content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
}

.privacy-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 24rpx;
}

.privacy-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 20rpx;
}

.privacy-link {
  margin-bottom: 32rpx;
}

.privacy-link text {
  font-size: 28rpx;
  color: #667eea;
  text-decoration: underline;
}

.privacy-actions {
  display: flex;
  gap: 20rpx;
}

.privacy-btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 48rpx;
  text-align: center;
}

.privacy-btn.disagree {
  background: #f5f5f5;
}

.privacy-btn.disagree text {
  color: #999;
  font-size: 30rpx;
}

.privacy-btn.agree {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.privacy-btn.agree text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
</style>
