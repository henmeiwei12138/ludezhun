const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 院校基础数据（从 knowledge_base.md 提取的结构化数据）
// 实际使用时，可从 knowledge_base.md 解析或手动维护
const SCHOOLS_DATA = [
  // 985 院校
  { name: '北京大学', province: '北京', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '清华大学', province: '北京', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '复旦大学', province: '上海', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '上海交通大学', province: '上海', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '浙江大学', province: '浙江', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中国科学技术大学', province: '安徽', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '南京大学', province: '江苏', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '武汉大学', province: '湖北', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '华中科技大学', province: '湖北', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中山大学', province: '广东', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '哈尔滨工业大学', province: '黑龙江', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '西安交通大学', province: '陕西', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '北京航空航天大学', province: '北京', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '北京理工大学', province: '北京', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '南开大学', province: '天津', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '天津大学', province: '天津', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '大连理工大学', province: '辽宁', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '吉林大学', province: '吉林', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '东南大学', province: '江苏', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '厦门大学', province: '福建', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '山东大学', province: '山东', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中南大学', province: '湖南', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '湖南大学', province: '湖南', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '四川大学', province: '四川', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '电子科技大学', province: '四川', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '重庆大学', province: '重庆', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '同济大学', province: '上海', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '华东师范大学', province: '上海', type: '师范', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '北京师范大学', province: '北京', type: '师范', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中国人民大学', province: '北京', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中国农业大学', province: '北京', type: '农林', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '西北工业大学', province: '陕西', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '兰州大学', province: '甘肃', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '华南理工大学', province: '广东', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '东北大学', province: '辽宁', type: '理工', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中国海洋大学', province: '山东', type: '综合', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '国防科技大学', province: '湖南', type: '军事', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中央民族大学', province: '北京', type: '民族', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  { name: '西北农林科技大学', province: '陕西', type: '农林', rank985: true, rank211: true, doubleFirst: true, level: '本科' },
  // 211 院校（部分）
  { name: '北京邮电大学', province: '北京', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '北京交通大学', province: '北京', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '北京科技大学', province: '北京', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '对外经济贸易大学', province: '北京', type: '财经', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '中央财经大学', province: '北京', type: '财经', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '上海财经大学', province: '上海', type: '财经', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '西南财经大学', province: '四川', type: '财经', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '中南财经政法大学', province: '湖北', type: '财经', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '南京航空航天大学', province: '江苏', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '南京理工大学', province: '江苏', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '苏州大学', province: '江苏', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '华东理工大学', province: '上海', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '上海大学', province: '上海', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '暨南大学', province: '广东', type: '综合', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '华南师范大学', province: '广东', type: '师范', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '武汉理工大学', province: '湖北', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '华中师范大学', province: '湖北', type: '师范', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '华中农业大学', province: '湖北', type: '农林', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '郑州大学', province: '河南', type: '综合', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '南昌大学', province: '江西', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '福州大学', province: '福建', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '安徽大学', province: '安徽', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '合肥工业大学', province: '安徽', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '云南大学', province: '云南', type: '综合', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '贵州大学', province: '贵州', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '广西大学', province: '广西', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '海南大学', province: '海南', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '太原理工大学', province: '山西', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '内蒙古大学', province: '内蒙古', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '新疆大学', province: '新疆', type: '综合', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '石河子大学', province: '新疆', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '宁夏大学', province: '宁夏', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '青海大学', province: '青海', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '西藏大学', province: '西藏', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '东北林业大学', province: '黑龙江', type: '农林', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '东北农业大学', province: '黑龙江', type: '农林', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '延边大学', province: '吉林', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '辽宁大学', province: '辽宁', type: '综合', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '大连海事大学', province: '辽宁', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '河北工业大学', province: '河北', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '长安大学', province: '陕西', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '西安电子科技大学', province: '陕西', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '陕西师范大学', province: '陕西', type: '师范', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '第四军医大学', province: '陕西', type: '军事', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '湖南师范大学', province: '湖南', type: '师范', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '四川农业大学', province: '四川', type: '农林', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '西南交通大学', province: '四川', type: '理工', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '西南大学', province: '重庆', type: '综合', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '江南大学', province: '江苏', type: '综合', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '河海大学', province: '江苏', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中国矿业大学', province: '江苏', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '南京农业大学', province: '江苏', type: '农林', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '南京师范大学', province: '江苏', type: '师范', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '中国药科大学', province: '江苏', type: '医药', rank985: false, rank211: true, doubleFirst: false, level: '本科' },
  { name: '中国地质大学', province: '湖北', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
  { name: '中国石油大学', province: '山东', type: '理工', rank985: false, rank211: true, doubleFirst: true, level: '本科' },
]

exports.main = async (event, context) => {
  const db = cloud.database()

  try {
    // 清空现有数据（可选）
    // 注意：云函数数据库操作有 20 条/次限制，需要分批
    const batchSize = 20
    let imported = 0

    for (let i = 0; i < SCHOOLS_DATA.length; i += batchSize) {
      const batch = SCHOOLS_DATA.slice(i, i + batchSize)
      const promises = batch.map(school =>
        db.collection('schools').add({
          data: {
            ...school,
            createdAt: db.serverDate()
          }
        })
      )
      await Promise.all(promises)
      imported += batch.length
    }

    return {
      code: 0,
      data: {
        total: SCHOOLS_DATA.length,
        imported
      }
    }
  } catch (err) {
    console.error('导入失败:', err)
    return { code: -1, msg: err.message }
  }
}
