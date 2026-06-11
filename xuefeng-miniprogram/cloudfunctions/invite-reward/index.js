/**
 * 邀请奖励云函数
 * - 记录邀请关系
 * - 双方各发放 1 张免广告券
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { inviterOpenid, inviteeOpenid } = event

  if (!inviterOpenid || !inviteeOpenid) {
    return { code: -1, msg: '参数不完整' }
  }

  // 不能邀请自己
  if (inviterOpenid === inviteeOpenid) {
    return { code: -1, msg: '不能邀请自己' }
  }

  try {
    // 检查被邀请者是否已有邀请人
    const inviteeRes = await db.collection('users')
      .where({ openid: inviteeOpenid })
      .get()

    if (inviteeRes.data.length > 0 && inviteeRes.data[0].invitedBy) {
      return { code: -1, msg: '该用户已有邀请人' }
    }

    // 更新被邀请者的 invitedBy 字段
    await db.collection('users')
      .where({ openid: inviteeOpenid })
      .update({
        data: {
          invitedBy: inviterOpenid,
          freeUnlocks: _.inc(1)  // 被邀请者获得 1 张券
        }
      })

    // 邀请者获得 1 张券 + 邀请人数 +1
    await db.collection('users')
      .where({ openid: inviterOpenid })
      .update({
        data: {
          freeUnlocks: _.inc(1),
          inviteCount: _.inc(1)
        }
      })

    return { code: 0, data: { success: true } }
  } catch (err) {
    console.error('邀请奖励失败:', err)
    return { code: -1, msg: '邀请奖励失败' }
  }
}
