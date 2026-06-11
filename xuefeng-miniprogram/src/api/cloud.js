/**
 * CloudBase 数据操作封装
 */

// 初始化云开发
export function initCloud() {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    return
  }
  wx.cloud.init({
    // env 参数说明：
    // env 参数决定接下来小程序发起的云开发调用
    // 此处请填入环境 ID, 环境 ID 可在云控制台获取
    env: 'cloudbase-d1g7i9ptr3660978a',
    traceUser: true
  })
}

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {object} data - 传递的数据
 * @returns {Promise}
 */
export function callCloudFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.code === 0) {
          resolve(res.result.data)
        } else {
          reject(res.result || { msg: '云函数调用失败' })
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 微信登录
 * @returns {Promise<{openid: string}>}
 */
export function wxLogin() {
  return callCloudFunction('wx-login')
}

/**
 * 数据库操作封装
 */
const db = wx.cloud.database()
const _ = db.command

export { db, _ }

/**
 * 获取用户信息
 * @param {string} openid
 * @returns {Promise}
 */
export function getUserInfo(openid) {
  return db.collection('users').where({ openid }).get()
}

/**
 * 更新用户信息
 * @param {string} openid
 * @param {object} data
 * @returns {Promise}
 */
export function updateUserInfo(openid, data) {
  return db.collection('users').where({ openid }).update({
    data: {
      ...data,
      updatedAt: db.serverDate()
    }
  })
}

/**
 * 创建会话
 * @param {object} data
 * @returns {Promise}
 */
export function createSession(data) {
  return db.collection('sessions').add({
    data: {
      ...data,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })
}

/**
 * 更新会话
 * @param {string} sessionId
 * @param {object} data
 * @returns {Promise}
 */
export function updateSession(sessionId, data) {
  return db.collection('sessions').doc(sessionId).update({
    data: {
      ...data,
      updatedAt: db.serverDate()
    }
  })
}

/**
 * 获取用户会话列表
 * @param {string} userId
 * @returns {Promise}
 */
export function getUserSessions(userId) {
  return db.collection('sessions')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .get()
}

/**
 * 创建报告
 * @param {object} data
 * @returns {Promise}
 */
export function createReport(data) {
  return db.collection('reports').add({
    data: {
      ...data,
      createdAt: db.serverDate()
    }
  })
}

/**
 * 获取用户报告列表
 * @param {string} userId
 * @returns {Promise}
 */
export function getUserReports(userId) {
  return db.collection('reports')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .get()
}
