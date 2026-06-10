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
          :class="{ blur: index >= 2 && !isPaid }">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
          <text v-if="item.risk" class="risk">风险: {{ item.risk }}</text>
        </view>
      </view>

      <view class="section" :class="{ blur: !isPaid }">
        <text class="section-title">稳妥</text>
        <view v-for="(item, index) in report.wen" :key="'w'+index" class="school-card">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
        </view>
      </view>

      <view class="section" :class="{ blur: !isPaid }">
        <text class="section-title">保底</text>
        <view v-for="(item, index) in report.bao" :key="'b'+index" class="school-card">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
        </view>
      </view>

      <view v-if="report.analysis" class="section" :class="{ blur: !isPaid }">
        <text class="section-title">就业趋势分析</text>
        <text class="section-content">{{ report.analysis }}</text>
      </view>

      <view v-if="report.warning" class="section warning-section">
        <text class="section-title">风险提示</text>
        <text class="section-content warning-text">{{ report.warning }}</text>
      </view>

      <!-- 付费墙 -->
      <view v-if="!isPaid" class="pay-wall">
        <view class="pay-mask"></view>
        <view class="pay-content">
          <text class="pay-title">解锁完整报告</text>
          <text class="pay-desc">包含稳妥、保底志愿详细分析及就业趋势</text>
          <view class="pay-btn" @tap="showPayModal">
            <text>解锁 ¥19.9</text>
          </view>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-bar">
        <view class="share-btn" @tap="shareReport">
          <text>分享给朋友</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { slotsState } from '@/store/slots'
import { userState } from '@/store/user'
import { callCloudFunction, getUserReports } from '@/api/cloud'

onShareAppMessage(() => {
  return {
    title: '雪峰志愿 - AI 高考志愿顾问',
    path: '/pages/index/index'
  }
})

const report = ref<any>(null)
const isPaid = ref(false)
const isGenerating = ref(false)

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
        isPaid.value = result.data[0].isPaid || false
      }
    } catch (err) {
      console.error('获取报告失败:', err)
    }
  }

  // 从聊天页跳转过来，自动生成报告
  if (shouldGenerate && !report.value) {
    generateReport()
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
  } catch (err: any) {
    console.error('生成报告失败:', err)
    uni.showToast({ title: err.msg || '生成失败，请重试', icon: 'none' })
  } finally {
    isGenerating.value = false
  }
}

const showPayModal = () => {
  uni.showModal({
    title: '解锁完整报告',
    content: '支付 ¥19.9 解锁全部志愿推荐',
    confirmText: '去支付',
    success: (res) => {
      if (res.confirm) {
        // TODO: 接入微信支付
        uni.showToast({ title: '支付功能开发中', icon: 'none' })
      }
    }
  })
}

const shareReport = () => {
  // 由页面的 onShareAppMessage 处理
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

.pay-wall {
  position: relative;
  margin-top: -100rpx;
  padding-top: 100rpx;
}

.pay-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(transparent, #f5f5f5);
}

.pay-content {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
}

.pay-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.pay-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 32rpx;
}

.pay-btn {
  display: inline-block;
  padding: 20rpx 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
}

.pay-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
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
</style>
