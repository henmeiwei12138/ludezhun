<template>
  <view class="chat-container">
    <SlotProgress :slots="slotsState.slots" />

    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollToId">
      <ChatBubble v-for="(msg, index) in messages" :key="index"
        :id="'msg-' + index"
        :type="msg.role === 'user' ? 'user' : 'ai'"
        :content="msg.content" />
      <ChatBubble v-if="isLoading" type="ai" :loading="true" />
    </scroll-view>

    <view class="quick-tags">
      <view class="tag" @tap="sendQuickMessage('冲一冲')">冲一冲</view>
      <view class="tag" @tap="sendQuickMessage('稳妥')">稳妥</view>
      <view class="tag" @tap="sendQuickMessage('就业优先')">就业优先</view>
    </view>

    <view class="input-area">
      <input class="input-box" v-model="inputText" placeholder="描述你的情况..."
        @confirm="sendMessage" confirm-type="send" />
      <view class="send-btn" @tap="sendMessage">
        <text>发送</text>
      </view>
    </view>

    <view v-if="canGenerateReport" class="generate-report-btn" @tap="goToReport">
      <text>资料收集完整，立即生成报告</text>
    </view>

    <!-- Banner 广告 -->
    <AdBanner />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import ChatBubble from '@/components/ChatBubble/index.vue'
import SlotProgress from '@/components/SlotProgress/index.vue'
import { XuefengAgent } from '@/agent/XuefengAgent'
import { slotsState, slotCount, canGenerateReport, syncSlotsFromAgent } from '@/store/slots'
import { userState } from '@/store/user'
import { createSession, updateSession } from '@/api/cloud'
import { showInterstitialOncePerDay } from '@/utils/ad'
import AdBanner from '@/components/AdBanner/index.vue'

onShareAppMessage(() => {
  return {
    title: '我在用雪峰志愿选志愿，你也来试试',
    path: `/pages/index/index?inviter=${userState.openid}`
  }
})

const agent = ref<XuefengAgent | null>(null)
const messages = ref<Array<{ role: string, content: string }>>([])
const inputText = ref('')
const isLoading = ref(false)
const scrollToId = ref('')
const sessionId = ref('')

// 防抖更新会话
let updateTimer: ReturnType<typeof setTimeout> | null = null
function debouncedUpdate(data: any) {
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(async () => {
    if (!sessionId.value) return
    try {
      await updateSession(sessionId.value, data)
    } catch (err) {
      console.error('更新会话失败:', err)
    }
  }, 500)
}

onMounted(async () => {
  agent.value = new XuefengAgent()

  // 恢复历史会话
  if (userState.openid) {
    try {
      const { getUserSessions } = await import('@/api/cloud')
      const result = await getUserSessions(userState.openid)
      if (result.data && result.data.length > 0) {
        const lastSession = result.data[0]
        if (lastSession.status === 'active') {
          sessionId.value = lastSession._id
          messages.value = lastSession.messages || []
          if (lastSession.slots) {
            agent.value.restoreState({ slots: lastSession.slots, history: [] })
            syncSlotsFromAgent(lastSession.slots)
          }
          if (messages.value.length > 0) {
            await nextTick()
            scrollToId.value = 'msg-' + (messages.value.length - 1)
          }
          return
        }
      }
    } catch (err) {
      console.error('恢复会话失败:', err)
    }

    // 创建新会话
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

  messages.value.push({
    role: 'assistant',
    content: '你好！我是雪峰志愿顾问。说说你的情况吧，哪个省的？考了多少分？想学什么方向？'
  })
})

const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value || !agent.value) return

  const userMsg = inputText.value.trim()
  inputText.value = ''

  messages.value.push({ role: 'user', content: userMsg })
  await nextTick()
  scrollToId.value = 'msg-' + (messages.value.length - 1)

  isLoading.value = true
  try {
    const result = await agent.value.chat(userMsg, (partial: string) => {
      // 伪流式回调：实时更新最后一条 AI 消息
      const lastMsg = messages.value[messages.value.length - 1] as any
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg._streaming) {
        lastMsg.content = partial
      } else {
        messages.value.push({ role: 'assistant', content: partial, _streaming: true } as any)
      }
      nextTick(() => {
        scrollToId.value = 'msg-' + (messages.value.length - 1)
      })
    })

    // 确保最终内容完整
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content = result.reply
      delete (lastMsg as any)._streaming
    }

    syncSlotsFromAgent(result.slots)

    debouncedUpdate({
      slots: result.slots,
      messages: messages.value.map(m => ({ role: m.role, content: m.content }))
    })
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
  // 生成报告后触发插屏广告（每天最多 1 次）
  const app = getApp() as any
  showInterstitialOncePerDay(app?.globalData?.interstitialAd)
  uni.navigateTo({ url: '/pages/report/index?generate=1' })
}
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.quick-tags {
  display: flex;
  padding: 12rpx 24rpx;
  gap: 16rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.tag {
  padding: 10rpx 24rpx;
  background: #f0f0f0;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #666;
}

.input-area {
  display: flex;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
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
