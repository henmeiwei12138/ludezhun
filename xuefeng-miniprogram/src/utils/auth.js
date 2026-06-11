/**
 * 微信登录工具函数
 */
import { wxLogin, getUserInfo } from '@/api/cloud'

const OPENID_KEY = 'user_openid'

/**
 * 获取本地存储的 openid
 * @returns {string|null}
 */
export function getStoredOpenid() {
  return uni.getStorageSync(OPENID_KEY)
}

/**
 * 存储 openid 到本地
 * @param {string} openid
 */
export function storeOpenid(openid) {
  uni.setStorageSync(OPENID_KEY, openid)
}

/**
 * 清除本地存储的 openid
 */
export function clearOpenid() {
  uni.removeStorageSync(OPENID_KEY)
}

/**
 * 执行微信登录流程
 * @returns {Promise<{openid: string}>}
 */
export async function login() {
  try {
    // 调用云函数获取 openid
    const result = await wxLogin()
    if (result && result.openid) {
      storeOpenid(result.openid)
      return { openid: result.openid }
    }
    throw new Error('获取 openid 失败')
  } catch (err) {
    console.error('登录失败:', err)
    throw err
  }
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getStoredOpenid()
}

/**
 * 获取用户完整信息
 * @returns {Promise<object|null>}
 */
export async function getUserProfile() {
  const openid = getStoredOpenid()
  if (!openid) return null

  try {
    const result = await getUserInfo(openid)
    if (result.data && result.data.length > 0) {
      return result.data[0]
    }
    return null
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return null
  }
}

/**
 * 获取微信用户信息（头像、昵称）
 * @returns {Promise<{nickname: string, avatarUrl: string}>}
 */
export function getWxUserInfo() {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve({
          nickname: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
