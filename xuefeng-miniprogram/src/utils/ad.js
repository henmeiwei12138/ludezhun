/**
 * 广告工具函数
 * - 激励视频广告（报告解锁）
 * - 插屏广告（页面切换）
 * - 预加载 + 每日频次控制
 * - Mock 模式：UV < 1000 时模拟广告行为
 */

// 广告位 ID（流量主后台获取后替换）
const REWARD_VIDEO_UNIT_ID = 'adunit-xxxxx'
const INTERSTITIAL_UNIT_ID = 'adunit-xxxxx'

// 是否使用模拟模式（UV < 1000 或开发阶段）
const IS_MOCK = true

// 每日激励视频上限
const DAILY_REWARD_LIMIT = 5

// 预加载的广告实例
let preloadedRewardAd = null
// 插屏广告实例（模块级存储，避免 getApp() 问题）
let interstitialAdInstance = null

/**
 * 预加载激励视频广告（App onLaunch 调用）
 */
export function preloadRewardVideo() {
  if (IS_MOCK) return

  try {
    preloadedRewardAd = wx.createRewardedVideoAd({ adUnitId: REWARD_VIDEO_UNIT_ID })
    preloadedRewardAd.load()
    preloadedRewardAd.onLoad(() => console.log('激励视频预加载成功'))
    preloadedRewardAd.onError((err) => console.error('激励视频预加载错误:', err))
  } catch (e) {
    console.error('预加载激励视频失败:', e)
  }
}

/**
 * 获取今日已观看激励视频次数
 * @returns {number}
 */
function getTodayRewardCount() {
  const today = new Date().toISOString().slice(0, 10)
  const record = uni.getStorageSync('reward_count_date')
  if (record === today) {
    return uni.getStorageSync('reward_count') || 0
  }
  // 新的一天，重置计数
  uni.setStorageSync('reward_count_date', today)
  uni.setStorageSync('reward_count', 0)
  return 0
}

/**
 * 增加今日激励视频观看次数
 */
function incrementRewardCount() {
  const count = getTodayRewardCount() + 1
  uni.setStorageSync('reward_count', count)
  return count
}

/**
 * 展示激励视频广告
 * @returns {Promise<boolean>} true=完整观看，false=未完整观看
 */
export function showRewardVideo() {
  // 每日上限检查
  if (getTodayRewardCount() >= DAILY_REWARD_LIMIT) {
    uni.showToast({ title: '今日观看次数已达上限', icon: 'none' })
    return Promise.resolve(false)
  }

  if (IS_MOCK) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '模拟广告',
        content: '观看广告后解锁完整报告（模拟模式，点击确定即解锁）',
        success: (res) => {
          if (res.confirm) {
            incrementRewardCount()
          }
          resolve(res.confirm)
        }
      })
    })
  }

  return new Promise((resolve, reject) => {
    const ad = preloadedRewardAd || wx.createRewardedVideoAd({ adUnitId: REWARD_VIDEO_UNIT_ID })

    ad.onLoad(() => {
      console.log('激励视频加载成功')
    })

    ad.onError((err) => {
      console.error('激励视频错误:', err)
      preloadedRewardAd = null
      reject(err)
    })

    ad.onClose((res) => {
      if (res && res.isEnded) {
        incrementRewardCount()
        resolve(true)
      } else {
        resolve(false)
      }
    })

    ad.show().catch(() => {
      ad.load().then(() => ad.show()).catch(reject)
    })

    // 展示后预加载下一个
    preloadedRewardAd = null
    setTimeout(() => preloadRewardVideo(), 1000)
  })
}

/**
 * 创建插屏广告实例（App onLaunch 调用）
 * @returns {object|null} 插屏广告实例
 */
export function createInterstitialAd() {
  if (IS_MOCK) {
    return {
      show() {
        console.log('[Mock] 插屏广告展示')
      }
    }
  }

  try {
    const ad = wx.createInterstitialAd({ adUnitId: INTERSTITIAL_UNIT_ID })
    ad.onLoad(() => console.log('插屏广告加载成功'))
    ad.onError((err) => console.error('插屏广告错误:', err))
    return ad
  } catch (e) {
    console.error('创建插屏广告失败:', e)
    return null
  }
}

/**
 * 存储插屏广告实例（App onLaunch 调用）
 * @param {object} instance
 */
export function setInterstitialInstance(instance) {
  interstitialAdInstance = instance
}

/**
 * 获取插屏广告实例
 * @returns {object|null}
 */
export function getInterstitialInstance() {
  return interstitialAdInstance
}

/**
 * 展示插屏广告（每天最多 1 次）
 * @param {object} adInstance - createInterstitialAd 返回的实例
 */
export function showInterstitialOncePerDay(adInstance) {
  if (!adInstance) return

  const today = new Date().toISOString().slice(0, 10)
  const lastShown = uni.getStorageSync('interstitial_last_shown')

  if (lastShown !== today) {
    adInstance.show()
    uni.setStorageSync('interstitial_last_shown', today)
  }
}

/**
 * 获取激励视频广告位 ID（供组件使用）
 */
export function getRewardVideoUnitId() {
  return IS_MOCK ? '' : REWARD_VIDEO_UNIT_ID
}

/**
 * 是否为模拟模式
 */
export function isMockMode() {
  return IS_MOCK
}

/**
 * 获取今日剩余观看次数
 */
export function getRemainingRewardCount() {
  return Math.max(0, DAILY_REWARD_LIMIT - getTodayRewardCount())
}
