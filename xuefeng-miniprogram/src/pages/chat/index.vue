<template>
  <view class="chat-container">
    <!-- 槽位进度 -->
    <view class="slot-progress">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: (slotCount / 7 * 100) + '%' }"></view>
      </view>
      <text class="progress-text">{{ slotCount }}/7 已填</text>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollToId">
      <view v-for="(msg, index) in messages" :key="index" :id="'msg-' + index"
        :class="['message-item', msg.role === 'user' ? 'user-message' : 'ai-message']">
        <view class="message-bubble">
          <text>{{ msg.content }}</text>
        </view>
      </view>
      <view v-if="isLoading" class="message-item ai-message">
        <view class="message-bubble loading">
          <text>正在思考...</text>
          <view class="loading-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 快捷标签 -->
    <view class="quick-tags">
      <view class="tag" @tap="sendQuickMessage('冲一冲')">冲一冲</view>
      <view class="tag" @tap="sendQuickMessage('稳妥')">稳妥</view>
      <view class="tag" @tap="sendQuickMessage('就业优先')">就业优先</view>
    </view>

    <!-- 输入框 -->
    <view class="input-area">
      <input class="input-box" v-model="inputText" placeholder="描述你的情况..."
        @confirm="sendMessage" confirm-type="send" />
      <view class="send-btn" @tap="sendMessage">
        <text>发送</text>
      </view>
    </view>

    <!-- 生成报告按钮 -->
    <view v-if="canGenerateReport" class="generate-report-btn" @tap="goToReport">
      <text>资料收集完整，立即生成报告</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { XuefengAgent } from '@/agent/XuefengAgent'
import { slotCount, canGenerateReport, syncSlotsFromAgent } from '@/store/slots'
import { userState } from '@/store/user'
import { createSession, updateSession } from '@/api/cloud'

const agent = ref<XuefengAgent | null>(null)
const messages = ref<Array<{ role: string, content: string }>>([])
const inputText = ref('')
const isLoading = ref(false)
const scrollToId = ref('')
const sessionId = ref('')

onMounted(async () => {
  // 初始化 Agent
  agent.value = new XuefengAgent()

  // 创建会话
  if (userState.openid) {
    try {
      const result = await createSession({
        userId: userState.openid,
        status: 'active',
        slots: {},
        messages: []
      })
      sessionId.value = result._id
    } catch (err) {
      console.error('创建会话失败:', err)
    }
  }

  // 欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '你好！我是雪峰志愿顾问。说说你的情况吧，哪个省的？考了多少分？想学什么方向？'
  })
})

const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value || !agent.value) return

  const userMsg = inputText.value.trim()
  inputText.value = ''

  // 添加用户消息
  messages.value.push({ role: 'user', content: userMsg })

  // 滚动到底部
  await nextTick()
  scrollToId.value = 'msg-' + (messages.value.length - 1)

  // 发送给 Agent
  isLoading.value = true
  try {
    const result = await agent.value.chat(userMsg)

    // 添加 AI 回复
    messages.value.push({ role: 'assistant', content: result.reply })

    // 同步槽位状态
    syncSlotsFromAgent(result.slots)

    // 滚动到底部
    await nextTick()
    scrollToId.value = 'msg-' + (messages.value.length - 1)

    // 更新会话
    if (sessionId.value) {
      try {
        await updateSession(sessionId.value, {
          slots: result.slots,
          messages: messages.value
        })
      } catch (err) {
        console.error('更新会话失败:', err)
      }
    }
  } catch (err) {
    console.error('发送失败:', err)
    messages.value.push({
      role: 'assistant',
      content: '抱歉，出了点问题，请稍后再试。'
    })
  } finally {
    isLoading.value = false
  }
}

const sendQuickMessage = (msg: string) => {
  inputText.value = msg
  sendMessage()
}

const goToReport = () => {
  uni.navigateTo({ url: '/pages/report/index' })
}
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.slot-progress {
  padding: 16rpx 24rpx;
  background: #fff;
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #e0e0e0;
  border-radius: 6rpx;
  margin-right: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.message-item {
  margin-bottom: 20rpx;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.user-message .message-bubble {
  background: #667eea;
  color: #fff;
}

.ai-message .message-bubble {
  background: #fff;
  color: #333;
}

.loading {
  display: flex;
  align-items: center;
}

.loading-dots {
  display: flex;
  margin-left: 12rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  background: #666;
  border-radius: 50%;
  margin: 0 4rpx;
  animation: dotPulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.quick-tags {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.tag {
  padding: 12rpx 24rpx;
  background: #f0f0f0;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #666;
}

.input-area {
  display: flex;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.input-box {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.send-btn {
  margin-left: 16rpx;
  padding: 0 32rpx;
  background: #667eea;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn text {
  color: #fff;
  font-size: 28rpx;
}

.generate-report-btn {
  margin: 20rpx 24rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  text-align: center;
}

.generate-report-btn text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
</style>
