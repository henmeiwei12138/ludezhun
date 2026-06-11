<template>
  <view class="report-container">
    <!-- 无报告状态 -->
    <view v-if="!report && !isGenerating" class="empty-state">
      <text class="icon">📊</text>
      <text class="title">暂无报告</text>
      <text class="desc">完成 AI 对话后，可生成志愿报告</text>
      <view class="go-chat-btn" @tap="goToChat">
        <text>去对话</text>
      </view>
    </view>

    <!-- 生成中 -->
    <view v-if="isGenerating" class="generating-state">
      <view class="generating-animation">
        <view class="pulse"></view>
      </view>
      <text class="generating-title">正在生成志愿报告</text>
      <text class="generating-desc">AI 正在分析你的信息，大约需要 30 秒...</text>
    </view>

    <!-- 报告内容 -->
    <view v-if="report && !isGenerating" class="report-content">
      <view class="section">
        <text class="section-title">学生画像</text>
        <text class="section-content">{{ report.profile }}</text>
      </view>

      <view class="section">
        <text class="section-title">冲一冲</text>
        <view v-for="(item, index) in report.chong" :key="'c'+index" class="school-card"
          :class="{ blur: index >= 2 && !isUnlocked }">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
          <text v-if="item.risk" class="risk">风险: {{ item.risk }}</text>
        </view>
      </view>

      <view class="section" :class="{ blur: !isUnlocked }">
        <text class="section-title">稳妥</text>
        <view v-for="(item, index) in report.wen" :key="'w'+index" class="school-card">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
        </view>
      </view>

      <view class="section" :class="{ blur: !isUnlocked }">
        <text class="section-title">保底</text>
        <view v-for="(item, index) in report.bao" :key="'b'+index" class="school-card">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
        </view>
      </view>

      <view v-if="report.analysis" class="section" :class="{ blur: !isUnlocked }">
        <text class="section-title">就业趋势分析</text>
        <text class="section-content">{{ report.analysis }}</text>
      </view>

      <view v-if="report.warning" class="section warning-section">
        <text class="section-title">风险提示</text>
        <text class="section-content warning-text">{{ report.warning }}</text>
      </view>

      <!-- 分享按钮 -->
      <view class="share-bar">
        <view class="share-btn" @tap="shareReport">
          <text>分享给朋友</text>
        </view>
      </view>

      <!-- AI 免责声明 -->
      <view class="disclaimer">
        <text>⚠️ 本报告由 AI 生成，仅供参考，请结合实际情况综合判断。</text>
        <text class="disclaimer-link" @tap="goToAgreement">查看用户协议</text>
      </view>

      <!-- Banner 广告 -->
      <AdBanner />
    </view>

    <!-- 激励视频解锁浮层 -->
    <AdRewardModal :visible="showRewardModal" @unlocked="onUnlock" @skip="onSkip" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { slotsState } from '@/store/slots'
import { userState } from '@/store/user'
import { callCloudFunction, getUserReports } from '@/api/cloud'
import { showRewardVideo } from '@/utils/ad'
import { useFreeUnlock, inviteReward } from '@/api/cloud'
import AdRewardModal from '@/components/AdRewardModal/index.vue'
import AdBanner from '@/components/AdBanner/index.vue'

onShareAppMessage(() => {
  return {
    title: '我在用志愿助手选志愿，你也来试试',
    path: `/pages/index/index?inviter=${userState.openid}`
  }
})

const report = ref<any>(null)
const isUnlocked = ref(false)
const isGenerating = ref(false)
const showRewardModal = ref(false)

onMounted(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const shouldGenerate = page?.options?.generate === '1'

  // 检查是否已有报告
  if (userState.openid) {
    try {
      const result = await getUserReports(userState.openid)
      if (result.data && result.data.length > 0) {
        report.value = result.data[0]
        isUnlocked.value = result.data[0].isUnlocked || false
      }
    } catch (err) {
      console.error('获取报告失败:', err)
    }
  }

  // 从聊天页跳转过来，自动生成报告
  if (shouldGenerate && !report.value) {
    generateReport()
  }

  // 已有报告但未解锁时，显示解锁浮层
  if (report.value && !isUnlocked.value) {
    showRewardModal.value = true
  }
})

const goToChat = () => {
  uni.switchTab({ url: '/pages/chat/index' })
}

const generateReport = async () => {
  if (!userState.openid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  isGenerating.value = true
  try {
    const result = await callCloudFunction('report-generate', {
      slots: slotsState.slots,
      userId: userState.openid
    })
    report.value = result
    uni.showToast({ title: '报告生成成功', icon: 'success' })
    // 首次生成报告时结算邀请奖励
    settleInviteReward()
    // 生成后显示解锁浮层
    showRewardModal.value = true
  } catch (err: any) {
    console.error('生成报告失败:', err)
    uni.showToast({ title: err.msg || '生成失败，请重试', icon: 'none' })
  } finally {
    isGenerating.value = false
  }
}

const onUnlock = async () => {
  // 优先使用免广告券
  if (userState.freeUnlocks > 0) {
    try {
      await useFreeUnlock(userState.openid)
      userState.freeUnlocks -= 1
      isUnlocked.value = true
      showRewardModal.value = false
      uni.showToast({ title: '已使用免广告券解锁', icon: 'success' })
      return
    } catch (err) {
      console.error('使用免广告券失败:', err)
    }
  }

  // 无券时播放激励视频
  try {
    const watched = await showRewardVideo()
    if (watched) {
      isUnlocked.value = true
      showRewardModal.value = false
      uni.showToast({ title: '解锁成功', icon: 'success' })
    } else {
      uni.showToast({ title: '需完整观看广告才能解锁', icon: 'none' })
    }
  } catch (err) {
    console.error('广告播放失败:', err)
    uni.showToast({ title: '广告加载失败，请稍后重试', icon: 'none' })
  }
}

const onSkip = () => {
  showRewardModal.value = false
}

/**
 * 结算邀请奖励：被邀请者首次生成报告时，双方各获 1 张免广告券
 */
const settleInviteReward = async () => {
  const inviterOpenid = uni.getStorageSync('inviter_openid')
  if (!inviterOpenid || inviterOpenid === userState.openid) return

  try {
    await inviteReward(inviterOpenid, userState.openid)
    uni.removeStorageSync('inviter_openid')
    userState.freeUnlocks += 1
    uni.showToast({ title: '邀请奖励已发放，获得 1 张免广告券', icon: 'none' })
  } catch (err) {
    console.error('邀请奖励结算失败:', err)
  }
}

const shareReport = () => {
  // 由页面的 onShareAppMessage 处理
}

const goToAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/index' })
}

// 暴露给页面的 generateReport 按钮
defineExpose({ generateReport })
</script>

<style>
.report-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.empty-state, .generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.go-chat-btn {
  padding: 20rpx 60rpx;
  background: #667eea;
  border-radius: 40rpx;
}

.go-chat-btn text {
  color: #fff;
  font-size: 30rpx;
}

.generating-animation {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 32rpx;
}

.pulse {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulseAnim 1.5s infinite;
}

@keyframes pulseAnim {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

.generating-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.generating-desc {
  font-size: 26rpx;
  color: #999;
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
  margin-bottom: 16rpx;
  display: block;
}

.section-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.school-card {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.school-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.major {
  font-size: 26rpx;
  color: #667eea;
  display: block;
  margin-bottom: 8rpx;
}

.reason {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.risk {
  font-size: 24rpx;
  color: #e65100;
  margin-top: 8rpx;
  display: block;
}

.warning-section {
  border-left: 6rpx solid #ff9800;
}

.warning-text {
  color: #e65100;
}

.blur {
  filter: blur(5px);
  pointer-events: none;
}

.share-bar {
  margin-top: 32rpx;
  padding: 0 24rpx;
}

.share-btn {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  text-align: center;
  border: 2rpx solid #667eea;
}

.share-btn text {
  color: #667eea;
  font-size: 30rpx;
}

.disclaimer {
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  background: #fff8e1;
  border-radius: 12rpx;
  text-align: center;
}

.disclaimer text {
  font-size: 24rpx;
  color: #e65100;
  display: block;
}

.disclaimer-link {
  margin-top: 8rpx;
}

.disclaimer-link text {
  color: #667eea;
  text-decoration: underline;
}
</style>
