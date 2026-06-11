/**
 * 广告工具函数
 * - 激励视频广告（报告解锁）
 * - 插屏广告（页面切换）
 * - Mock 模式：UV < 1000 时模拟广告行为
 */

// 广告位 ID（流量主后台获取后替换）
const REWARD_VIDEO_UNIT_ID = 'adunit-xxxxx'
const INTERSTITIAL_UNIT_ID = 'adunit-xxxxx'

// 是否使用模拟模式（UV < 1000 或开发阶段）
const IS_MOCK = true

/**
 * 展示激励视频广告
 * @returns {Promise<boolean>} true=完整观看，false=未完整观看
 */
export function showRewardVideo() {
  if (IS_MOCK) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '模拟广告',
        content: '观看广告后解锁完整报告（模拟模式，点击确定即解锁）',
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }

  return new Promise((resolve, reject) => {
    const ad = wx.createRewardedVideoAd({ adUnitId: REWARD_VIDEO_UNIT_ID })

    ad.onLoad(() => {
      console.log('激励视频加载成功')
    })

    ad.onError((err) => {
      console.error('激励视频错误:', err)
      reject(err)
    })

    ad.onClose((res) => {
      if (res && res.isEnded) {
        resolve(true) // 完整观看
      } else {
        resolve(false) // 未完整观看
      }
    })

    ad.show().catch(() => {
      // 加载失败时重新加载再展示
      ad.load().then(() => ad.show()).catch(reject)
    })
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
