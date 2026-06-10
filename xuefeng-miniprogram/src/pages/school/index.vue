<template>
  <view class="school-container">
    <!-- 搜索框 -->
    <view class="search-bar">
      <input class="search-input" v-model="searchText" placeholder="搜索院校名称..." @confirm="searchSchools" />
      <view class="search-btn" @tap="searchSchools">
        <text>搜索</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tags">
      <view :class="['tag', filter === 'all' ? 'active' : '']" @tap="setFilter('all')">全部</view>
      <view :class="['tag', filter === '985' ? 'active' : '']" @tap="setFilter('985')">985</view>
      <view :class="['tag', filter === '211' ? 'active' : '']" @tap="setFilter('211')">211</view>
      <view :class="['tag', filter === 'double' ? 'active' : '']" @tap="setFilter('double')">双一流</view>
    </view>

    <!-- 院校列表 -->
    <scroll-view class="school-list" scroll-y>
      <view v-for="school in schools" :key="school._id" class="school-card" @tap="goToDetail(school)">
        <view class="school-info">
          <text class="school-name">{{ school.name }}</text>
          <view class="school-tags">
            <text v-if="school.rank985" class="tag tag-985">985</text>
            <text v-if="school.rank211" class="tag tag-211">211</text>
            <text v-if="school.doubleFirst" class="tag tag-double">双一流</text>
          </view>
        </view>
        <text class="school-province">{{ school.province }}</text>
        <text class="school-type">{{ school.type }}</text>
      </view>

      <view v-if="schools.length === 0 && !isLoading" class="empty-state">
        <text>暂无搜索结果</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from '@/api/cloud'

const searchText = ref('')
const filter = ref('all')
const schools = ref<any[]>([])
const isLoading = ref(false)

const searchSchools = async () => {
  isLoading.value = true
  try {
    let query = db.collection('schools')

    // 搜索条件
    if (searchText.value) {
      query = query.where({
        name: db.RegExp({
          regexp: searchText.value,
          options: 'i'
        })
      })
    }

    // 筛选条件
    if (filter.value === '985') {
      query = query.where({ rank985: true })
    } else if (filter.value === '211') {
      query = query.where({ rank211: true })
    } else if (filter.value === 'double') {
      query = query.where({ doubleFirst: true })
    }

    const result = await query.limit(50).get()
    schools.value = result.data
  } catch (err) {
    console.error('搜索失败:', err)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

const setFilter = (f: string) => {
  filter.value = f
  searchSchools()
}

const goToDetail = (school: any) => {
  uni.navigateTo({
    url: `/pages/school/detail?id=${school._id}`
  })
}

// 初始加载
searchSchools()
</script>

<style>
.school-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  display: flex;
  padding: 20rpx 24rpx;
  background: #fff;
}

.search-input {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.search-btn {
  margin-left: 16rpx;
  padding: 0 32rpx;
  background: #667eea;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn text {
  color: #fff;
  font-size: 28rpx;
}

.filter-tags {
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

.tag.active {
  background: #667eea;
  color: #fff;
}

.school-list {
  padding: 20rpx;
}

.school-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.school-info {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.school-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.school-tags {
  display: flex;
  gap: 8rpx;
}

.school-tags .tag {
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  border-radius: 8rpx;
}

.tag-985 {
  background: #fff3e0;
  color: #e65100;
}

.tag-211 {
  background: #e3f2fd;
  color: #1565c0;
}

.tag-double {
  background: #e8f5e9;
  color: #2e7d32;
}

.school-province {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.school-type {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>
