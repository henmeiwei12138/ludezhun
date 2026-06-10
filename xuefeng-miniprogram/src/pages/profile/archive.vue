<template>
  <view class="archive-container">
    <view class="form">
      <view class="form-item">
        <text class="label">省份</text>
        <picker :range="provinces" @change="onProvinceChange">
          <view class="picker-value">{{ form.province || '请选择省份' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">分数</text>
        <input class="input" v-model="form.score" type="number" placeholder="请输入高考分数" />
      </view>

      <view class="form-item">
        <text class="label">位次</text>
        <input class="input" v-model="form.rank" type="number" placeholder="请输入省排名/位次" />
      </view>

      <view class="form-item">
        <text class="label">选科</text>
        <picker :range="subjects" @change="onSubjectChange">
          <view class="picker-value">{{ form.subject || '请选择选科' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">核心诉求</text>
        <picker :range="goals" @change="onGoalChange">
          <view class="picker-value">{{ form.goal || '请选择核心诉求' }}</view>
        </picker>
      </view>
    </view>

    <view class="save-btn" @tap="saveArchive">
      <text>保存档案</text>
    </view>

    <text class="tip">保存后，下次对话将自动填入这些信息</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userState, updateUserProfile } from '@/store/user'

const provinces = [
  '北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林',
  '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西',
  '甘肃', '青海', '内蒙古', '广西', '西藏', '宁夏', '新疆'
]

const subjects = ['物理', '历史', '物化生', '物化地', '物化政', '物生政', '史政地', '史政生', '史地生', '理科', '文科']

const goals = ['就业优先', '考公', '考研', '稳定', '高薪', '深造', '出国']

const form = ref({
  province: '',
  score: '',
  rank: '',
  subject: '',
  goal: ''
})

onMounted(() => {
  // 从用户档案中恢复
  if (userState.archive) {
    Object.assign(form.value, userState.archive)
  }
})

const onProvinceChange = (e: any) => {
  form.value.province = provinces[e.detail.value]
}

const onSubjectChange = (e: any) => {
  form.value.subject = subjects[e.detail.value]
}

const onGoalChange = (e: any) => {
  form.value.goal = goals[e.detail.value]
}

const saveArchive = async () => {
  try {
    await updateUserProfile({ archive: form.value })
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style>
.archive-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.form {
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx 24rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  width: 140rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.picker-value {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}

.save-btn {
  margin: 40rpx 24rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  text-align: center;
}

.save-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.tip {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  display: block;
}
</style>
