<template>
  <view class="report-container">
    <view v-if="!report" class="empty-state">
      <text class="icon">📊</text>
      <text class="title">暂无报告</text>
      <text class="desc">完成 AI 对话后，可生成志愿报告</text>
      <view class="go-chat-btn" @tap="goToChat">
        <text>去对话</text>
      </view>
    </view>

    <view v-else class="report-content">
      <!-- 学生画像 -->
      <view class="section">
        <text class="section-title">学生画像</text>
        <text class="section-content">{{ report.profile }}</text>
      </view>

      <!-- 冲一冲 -->
      <view class="section">
        <text class="section-title">冲一冲</text>
        <view v-for="(item, index) in report.chong" :key="index" class="school-card"
          :class="{ blur: index >= 2 && !isPaid }">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
          <text v-if="item.risk" class="risk">风险: {{ item.risk }}</text>
        </view>
      </view>

      <!-- 稳妥 -->
      <view class="section" :class="{ blur: !isPaid }">
        <text class="section-title">稳妥</text>
        <view v-for="(item, index) in report.wen" :key="index" class="school-card">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
        </view>
      </view>

      <!-- 保底 -->
      <view class="section" :class="{ blur: !isPaid }">
        <text class="section-title">保底</text>
        <view v-for="(item, index) in report.bao" :key="index" class="school-card">
          <text class="school-name">{{ item.school }}</text>
          <text class="major">{{ item.major }}</text>
          <text class="reason">{{ item.reason }}</text>
        </view>
      </view>

      <!-- 付费墙 -->
      <view v-if="!isPaid" class="pay-wall">
        <view class="pay-mask"></view>
        <view class="pay-content">
          <text class="pay-title">解锁完整报告</text>
          <text class="pay-desc">包含稳妥、保底志愿详细分析</text>
          <view class="pay-btn" @tap="showPayModal">
            <text>解锁 ¥19.9</text>
          </view>
        </view>
      </view>

      <!-- 生成报告按钮 -->
      <view v-if="!report" class="generate-btn" @tap="generateReport">
        <text>生成志愿报告</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { canGenerateReport } from '@/store/slots'
import { userState } from '@/store/user'

const report = ref<any>(null)
const isPaid = ref(false)

const goToChat = () => {
  uni.switchTab({ url: '/pages/chat/index' })
}

const generateReport = async () => {
  uni.showLoading({ title: '生成中...' })
  // TODO: 调用 report-generate 云函数
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '功能开发中', icon: 'none' })
  }, 1000)
}

const showPayModal = () => {
  // TODO: 显示支付弹窗
  uni.showToast({ title: '支付功能开发中', icon: 'none' })
}
</script>

<style>
.report-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-state .icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-state .title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.empty-state .desc {
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

.generate-btn {
  margin: 40rpx 0;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  text-align: center;
}

.generate-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
