// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const db = cloud.database()

  try {
    // 查找用户是否已存在
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()

    if (userResult.data.length === 0) {
      // 新用户，创建记录
      await db.collection('users').add({
        data: {
          openid: openid,
          nickname: '',
          avatarUrl: '',
          credits: 3,
          plan: 'free',
          role: 'user',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return {
      code: 0,
      data: {
        openid: openid
      }
    }
  } catch (err) {
    return {
      code: -1,
      msg: err.message
    }
  }
}
