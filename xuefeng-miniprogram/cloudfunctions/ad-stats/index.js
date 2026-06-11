/**
 * 广告统计云函数
 * - 聚合今日广告数据
 * - 统计用户、对话、报告数据
 * - 计算预估收益
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 并行查询各项数据
    const [
      totalUsersRes,
      todayActiveRes,
      todayReportsRes,
      todayConversationsRes,
      todayAdEventsRes,
      totalInvitesRes,
      freeUnlockStatsRes
    ] = await Promise.all([
      // 总用户数
      db.collection('users').count(),
      // 今日活跃（今日有更新的用户）
      db.collection('users').where({
        updatedAt: _.gte(today)
      }).count(),
      // 今日报告
      db.collection('reports').where({
        createdAt: _.gte(today)
      }).count(),
      // 今日对话
      db.collection('sessions').where({
        createdAt: _.gte(today)
      }).count(),
      // 今日广告事件
      db.collection('ad_events').where({
        createdAt: _.gte(today)
      }).get(),
      // 总邀请数
      db.collection('users').where({
        inviteCount: _.gt(0)
      }).get(),
      // 免广告券统计
      db.collection('users').where({
        freeUnlocks: _.gte(0)
      }).field({ freeUnlocks: true }).get()
    ])

    // 解析广告事件
    const adEvents = todayAdEventsRes.data || []
    const rewardVideoShows = adEvents.filter(e => e.type === 'reward_video' && e.action === 'show').length
    const rewardVideoCompletes = adEvents.filter(e => e.type === 'reward_video' && e.action === 'complete').length
    const bannerShows = adEvents.filter(e => e.type === 'banner' && e.action === 'show').length
    const interstitialShows = adEvents.filter(e => e.type === 'interstitial' && e.action === 'show').length

    // 邀请统计
    const totalInvites = (totalInvitesRes.data || []).reduce((sum, u) => sum + (u.inviteCount || 0), 0)
    const freeUnlockGranted = (freeUnlockStatsRes.data || []).reduce((sum, u) => sum + (u.freeUnlocks || 0), 0)

    // 预估收益（基于 eCPM ¥15）
    const ecpm = 15
    const totalAdImpressions = rewardVideoShows + bannerShows + interstitialShows
    const estimatedRevenue = ((totalAdImpressions / 1000) * ecpm).toFixed(2)

    return {
      code: 0,
      data: {
        totalUsers: totalUsersRes.total,
        todayActive: todayActiveRes.total,
        todayReports: todayReportsRes.total,
        todayConversations: todayConversationsRes.total,
        rewardVideoShows,
        rewardVideoCompletes,
        bannerShows,
        interstitialShows,
        totalInvites,
        freeUnlockGranted,
        freeUnlockUsed: 0, // 需要额外记录使用事件
        estimatedRevenue,
        ecpm: ecpm.toFixed(2)
      }
    }
  } catch (err) {
    console.error('统计失败:', err)
    return { code: -1, msg: '统计失败' }
  }
}
