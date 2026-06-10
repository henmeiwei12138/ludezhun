/**
 * 用户状态管理
 */
import { reactive } from 'vue'
import { login as authLogin, getStoredOpenid, getUserProfile } from '@/utils/auth'
import { updateUserInfo } from '@/api/cloud'

/**
 * 用户状态
 */
export const userState = reactive({
  openid: getStoredOpenid() || '',
  nickname: '',
  avatarUrl: '',
  credits: 3,
  plan: 'free',
  role: 'user',
  isLoggedIn: !!getStoredOpenid()
})

/**
 * 初始化用户信息
 */
export async function initUser() {
  if (!userState.isLoggedIn) return

  try {
    const userInfo = await getUserProfile()
    if (userInfo) {
      userState.nickname = userInfo.nickname || ''
      userState.avatarUrl = userInfo.avatarUrl || ''
      userState.credits = userInfo.credits || 3
      userState.plan = userInfo.plan || 'free'
      userState.role = userInfo.role || 'user'
    }
  } catch (err) {
    console.error('初始化用户信息失败:', err)
  }
}

/**
 * 登录
 */
export async function login() {
  try {
    const result = await authLogin()
    userState.openid = result.openid
    userState.isLoggedIn = true
    await initUser()
    return result
  } catch (err) {
    console.error('登录失败:', err)
    throw err
  }
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(data) {
  if (!userState.openid) return

  try {
    await updateUserInfo(userState.openid, data)
    Object.assign(userState, data)
  } catch (err) {
    console.error('更新用户资料失败:', err)
    throw err
  }
}

/**
 * 扣减次数
 */
export function deductCredit() {
  if (userState.credits > 0) {
    userState.credits--
    return true
  }
  return false
}

/**
 * 检查是否有剩余次数
 */
export function hasCredits() {
  return userState.credits > 0 || userState.plan === 'vip'
}

/**
 * 是否是会员
 */
export function isVip() {
  return userState.plan === 'vip'
}

/**
 * 是否是顾问
 */
export function isAdvisor() {
  return userState.role === 'advisor' || userState.role === 'admin'
}
