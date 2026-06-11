<template>
  <view class="agreement-container">
    <view class="tabs">
      <view :class="['tab', activeTab === 'privacy' && 'active']" @tap="activeTab = 'privacy'">
        <text>隐私政策</text>
      </view>
      <view :class="['tab', activeTab === 'user' && 'active']" @tap="activeTab = 'user'">
        <text>用户协议</text>
      </view>
    </view>

    <view v-if="activeTab === 'privacy'" class="content">
      <text class="title">雪峰志愿 隐私政策</text>
      <text class="update-date">更新日期：2026年6月11日</text>

      <text class="section-title">一、信息收集</text>
      <text class="paragraph">我们通过微信开放能力获取以下信息：</text>
      <text class="paragraph">1. 微信昵称和头像：用于展示您的个人资料。</text>
      <text class="paragraph">2. 微信 OpenID：用于识别用户身份和数据关联。</text>
      <text class="paragraph">3. 对话内容：您在 AI 对话中输入的信息，用于生成志愿报告。</text>

      <text class="section-title">二、信息使用</text>
      <text class="paragraph">您的信息仅用于以下目的：</text>
      <text class="paragraph">1. 提供高考志愿咨询服务。</text>
      <text class="paragraph">2. 生成个性化志愿报告。</text>
      <text class="paragraph">3. 改善服务质量。</text>

      <text class="section-title">三、信息存储与保护</text>
      <text class="paragraph">您的数据存储在微信云开发环境中，受微信平台安全机制保护。我们不会将您的个人信息出售、交换或以其他方式提供给第三方。</text>

      <text class="section-title">四、AI 生成内容声明</text>
      <text class="paragraph">本小程序的志愿建议由人工智能模型生成，仅供参考。所有建议不构成任何形式的保证或承诺，请结合实际情况综合判断。</text>

      <text class="section-title">五、联系我们</text>
      <text class="paragraph">如您对本隐私政策有任何疑问，请通过小程序内的反馈功能与我们联系。</text>
    </view>

    <view v-if="activeTab === 'user'" class="content">
      <text class="title">雪峰志愿 用户协议</text>
      <text class="update-date">更新日期：2026年6月11日</text>

      <text class="section-title">一、服务说明</text>
      <text class="paragraph">雪峰志愿是一款基于人工智能技术的高考志愿辅助工具，为用户提供志愿填报参考建议。</text>

      <text class="section-title">二、免责声明</text>
      <text class="paragraph">1. 本小程序提供的所有信息和建议仅供参考，不构成任何形式的保证或承诺。</text>
      <text class="paragraph">2. AI 生成的内容可能存在偏差或不准确，请用户结合实际情况综合判断。</text>
      <text class="paragraph">3. 最终志愿填报决策由用户自行负责，本小程序不承担因志愿填报产生的任何后果。</text>

      <text class="section-title">三、用户行为规范</text>
      <text class="paragraph">1. 不得利用本小程序进行违法违规活动。</text>
      <text class="paragraph">2. 不得恶意刷取广告收益或滥用邀请机制。</text>
      <text class="paragraph">3. 不得发布不当内容或干扰其他用户使用。</text>

      <text class="section-title">四、知识产权</text>
      <text class="paragraph">本小程序的所有内容、技术、代码及相关知识产权归开发者所有。</text>

      <text class="section-title">五、协议修改</text>
      <text class="paragraph">我们保留随时修改本协议的权利，修改后的协议将在小程序内公布。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'privacy' | 'user'>('privacy')
</script>

<style>
.agreement-container {
  min-height: 100vh;
  background-color: #fff;
}

.tabs {
  display: flex;
  border-bottom: 2rpx solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
}

.tab.active {
  color: #667eea;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  right: 30%;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
}

.content {
  padding: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.update-date {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 24rpx;
  margin-bottom: 12rpx;
}

.paragraph {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  display: block;
  margin-bottom: 8rpx;
}
</style>
