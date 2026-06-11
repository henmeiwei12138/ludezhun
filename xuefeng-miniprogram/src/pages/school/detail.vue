<template>
  <view class="detail-container">
    <view v-if="school" class="school-detail">
      <view class="header">
        <text class="name">{{ school.name }}</text>
        <view class="tags">
          <text v-if="school.rank985" class="tag tag-985">985</text>
          <text v-if="school.rank211" class="tag tag-211">211</text>
          <text v-if="school.doubleFirst" class="tag tag-double">双一流</text>
        </view>
      </view>

      <view class="info-grid">
        <view class="info-item">
          <text class="label">省份</text>
          <text class="value">{{ school.province }}</text>
        </view>
        <view class="info-item">
          <text class="label">类型</text>
          <text class="value">{{ school.type }}</text>
        </view>
        <view class="info-item">
          <text class="label">层次</text>
          <text class="value">{{ school.level || '本科' }}</text>
        </view>
      </view>

      <view v-if="school.description" class="section">
        <text class="section-title">学校简介</text>
        <text class="section-content">{{ school.description }}</text>
      </view>

      <view v-if="school.majors && school.majors.length > 0" class="section">
        <text class="section-title">优势专业</text>
        <view class="major-list">
          <text v-for="(major, i) in school.majors" :key="i" class="major-tag">{{ major }}</text>
        </view>
      </view>

      <view v-if="enrollment.length > 0" class="section">
        <text class="section-title">近年录取参考</text>
        <view class="enrollment-table">
          <view class="table-header">
            <text class="th">年份</text>
            <text class="th">省份</text>
            <text class="th">最低分</text>
            <text class="th">最低位次</text>
          </view>
          <view v-for="(item, i) in enrollment" :key="i" class="table-row">
            <text class="td">{{ item.year }}</text>
            <text class="td">{{ item.province }}</text>
            <text class="td">{{ item.minScore }}</text>
            <text class="td">{{ item.minRank }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="loading-state">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/api/cloud'

const school = ref<any>(null)
const enrollment = ref<any[]>([])

onMounted(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const id = page?.options?.id

  if (!id) return

  try {
    const result = await db.collection('schools').doc(id).get()
    school.value = result.data

    // 获取录取数据
    const enrollResult = await db.collection('enrollment')
      .where({ schoolId: id })
      .orderBy('year', 'desc')
      .limit(10)
      .get()
    enrollment.value = enrollResult.data || []
  } catch (err) {
    console.error('获取院校详情失败:', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})
</script>

<style>
.detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: #fff;
  padding: 32rpx;
  display: flex;
  align-items: center;
}

.name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.tags {
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  border-radius: 8rpx;
}

.tag-985 { background: #fff3e0; color: #e65100; }
.tag-211 { background: #e3f2fd; color: #1565c0; }
.tag-double { background: #e8f5e9; color: #2e7d32; }

.info-grid {
  display: flex;
  background: #fff;
  padding: 24rpx 32rpx;
  margin-top: 2rpx;
}

.info-item {
  flex: 1;
  text-align: center;
}

.info-item .label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.info-item .value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.section {
  background: #fff;
  margin-top: 20rpx;
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 30rpx;
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

.major-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.major-tag {
  padding: 8rpx 20rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.enrollment-table {
  margin-top: 12rpx;
}

.table-header {
  display: flex;
  background: #f5f5f5;
  padding: 12rpx 0;
  border-radius: 8rpx;
}

.table-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.th, .td {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
}

.th {
  color: #999;
  font-weight: bold;
}

.td {
  color: #333;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 200rpx 0;
  color: #999;
}
</style>
