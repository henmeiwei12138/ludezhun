# 雪峰志愿填报小程序 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于雪峰 agent 的 AI 高考志愿顾问微信小程序，C端+B端双模式，Freemium 付费。

**Architecture:**
- 前端：Uniapp（Vue3）编写微信小程序，直接调用 LLM API（DeepSeek 等 OpenAI 兼容接口），Agent 槽位逻辑以 JS 实现
- 后端：微信云开发 CloudBase（云数据库 + 云存储 + 云函数），零运维
- AI：前端 JS 版 Agent，复刻 agent.py 的槽位管理 + 提示词逻辑，SSE 流式输出

**Tech Stack:**
- Uniapp (Vue3 + Vite) / 微信原生小程序 API
- 微信云开发 CloudBase（MongoDB-like 云数据库）
- LLM：DeepSeek API / 通义千问（OpenAI 兼容，前端 HTTPS 直调）
- 报告 PDF：前端 canvas 截图 or 调用云函数生成
- 支付：微信小程序内支付 API

---

## 项目结构

```
xuefeng-miniprogram/
├── src/
│   ├── pages/
│   │   ├── index/          # 首页 / Tab 导航
│   │   ├── chat/           # AI 对话主页
│   │   ├── report/         # 志愿报告
│   │   ├── school/         # 院校查询
│   │   ├── profile/        # 个人档案
│   │   └── advisor/        # 顾问工作台 (B端)
│   ├── components/
│   │   ├── ChatBubble/     # 对话气泡组件
│   │   ├── SlotProgress/   # 槽位进度条
│   │   ├── SchoolCard/     # 院校卡片
│   │   └── ReportCard/     # 报告卡片
│   ├── store/
│   │   ├── chat.js         # 对话状态 (Pinia)
│   │   ├── user.js         # 用户状态
│   │   └── slots.js        # 槽位状态
│   ├── agent/
│   │   ├── XuefengAgent.js # 核心 Agent（复刻 agent.py）
│   │   ├── SlotManager.js  # 7槽位管理
│   │   ├── knowledge.js    # 知识库检索
│   │   └── prompts.js      # system_prompt 移植
│   ├── api/
│   │   ├── llm.js          # LLM 流式调用封装
│   │   └── cloud.js        # CloudBase 数据操作
│   └── utils/
│       ├── auth.js         # 微信登录 + JWT/session
│       └── pay.js          # 微信支付
├── cloudfunctions/
│   ├── wx-login/           # 微信登录云函数（安全换取openid）
│   ├── report-generate/    # 报告生成云函数（Node.js）
│   └── pay-notify/         # 支付回调云函数
├── docs/
└── package.json
```

---

## 核心技术决策

### Agent JS 化方案

```
agent.py 改造规则：
Python print()      → await stream callback
Python input()      → 消息队列中取
slots dict          → Pinia store (slots.js)
知识库检索           → 本地 JSON 文件检索
百度搜索            → 云函数代理（避免前端暴露 key）
LLM 调用            → llm.js SSE 流式请求
```

### LLM 调用架构（关键）

```
小程序 → HTTPS → DeepSeek API（直连）
                         ↓
              SSE 流式 text/event-stream
                         ↓
              onChunkReceived → 气泡追加文字
```

**注意**：API Key 安全问题 → 通过云函数代理转发，或使用 CloudBase 调用（推荐后者，Key 不出现在前端代码）

### CloudBase 数据结构

```javascript
// users 集合
{ _id, openid, nickname, avatarUrl, credits: 3, plan: "free", createdAt }

// sessions 集合
{ _id, userId, status: "active|done", slots: {...}, messages: [...], createdAt }

// reports 集合
{ _id, sessionId, userId, content: {...}, isPaid: false, createdAt }

// orders 集合
{ _id, userId, amount, status, wxOrderId, productType, createdAt }

// schools 集合（从 knowledge_base.md 导入）
{ _id, name, province, type, rank985: bool, enrollment: [...] }
```

---

## 第一阶段 — 地基（约1周）

**目标**：项目跑通、微信登录成功、CloudBase 通、本地可以 chat 通

### Task 1-1: 项目初始化

**涉及文件**：
- 创建：`xuefeng-miniprogram/` 根目录
- 创建：`package.json`, `vite.config.js`, `manifest.json`

**步骤**：
1. 安装 HBuilderX 或 Vite Uniapp 脚手架
   ```bash
   npx degit dcloudio/uni-preset-vue#vite-ts xuefeng-miniprogram
   cd xuefeng-miniprogram && npm install
   ```
2. 微信开发者工具绑定 AppID，开启云开发
3. 配置 `manifest.json`：小程序 AppID，云环境 ID
4. 验收：HBuilderX 可真机预览首页

### Task 1-2: CloudBase 环境配置

**涉及文件**：
- 创建：`cloudfunctions/wx-login/index.js`
- 创建：`src/api/cloud.js`

**步骤**：
1. 进入微信云开发控制台，创建集合：`users`, `sessions`, `reports`, `orders`, `schools`
2. 设置集合权限：`users` 仅创建者读写，其余服务端读写
3. 编写 `wx-login` 云函数：
   ```javascript
   // cloudfunctions/wx-login/index.js
   exports.main = async (event) => {
     const { OPENID } = cloud.getWXContext()
     // 查找或创建用户
     const db = cloud.database()
     let user = await db.collection('users').where({ openid: OPENID }).get()
     if (user.data.length === 0) {
       await db.collection('users').add({ openid: OPENID, credits: 3, plan: 'free', createdAt: new Date() })
     }
     return { openid: OPENID }
   }
   ```
4. 部署云函数
5. 验收：调用云函数成功返回 openid

### Task 1-3: 微信登录与用户状态

**涉及文件**：
- 创建：`src/utils/auth.js`
- 创建：`src/store/user.js`
- 修改：`src/pages/index/index.vue`

**步骤**：
1. `auth.js` 封装登录流程：`wx.login` → 调用 `wx-login` 云函数 → 存储 openid 到 storage
2. `user.js` Pinia store：`{ openid, nickname, credits, plan, isLoggedIn }`
3. 首页自动触发登录，获取用户信息（`wx.getUserProfile`）
4. 验收：首页显示用户头像 + "剩余次数：3"

### Task 1-4: LLM 调用封装（云函数代理）

**涉及文件**：
- 创建：`cloudfunctions/llm-proxy/index.js`
- 创建：`src/api/llm.js`

**背景**：前端不暴露 LLM API Key，通过云函数安全代理

**步骤**：
1. 编写 `llm-proxy` 云函数，转发请求到 DeepSeek：
   ```javascript
   // cloudfunctions/llm-proxy/index.js
   const https = require('https')
   exports.main = async (event) => {
     const { messages, stream = false } = event
     // 使用 CloudBase 环境变量存储 API_KEY
     const apiKey = process.env.DEEPSEEK_API_KEY
     // 调用 DeepSeek /chat/completions
     // 注意：CloudBase 云函数不支持真正的 SSE，用非流式 or 分批返回
     const response = await fetch('https://api.deepseek.com/chat/completions', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({ model: 'deepseek-chat', messages, stream: false })
     })
     return await response.json()
   }
   ```
2. 在云开发控制台配置环境变量 `DEEPSEEK_API_KEY`
3. `src/api/llm.js` 封装调用方法：`callLLM(messages) → Promise<string>`
4. 验收：在测试页面发送一条消息，成功收到 LLM 回复

> **流式说明**：CloudBase 云函数不支持 SSE 流式返回。解决方案：
> - 方案A（简单）：非流式，等待完整响应后一次性展示
> - 方案B（更好体验）：将完整响应切割，前端用 `setInterval` 逐字渲染（伪流式）
> - 方案C（进阶）：使用 HTTPS 直连 + 小程序 request `enableChunked` 实验性 API

### Task 1-5: Agent 核心 JS 移植

**涉及文件**：
- 创建：`src/agent/prompts.js`（system_prompt.md 的 JS 版）
- 创建：`src/agent/SlotManager.js`
- 创建：`src/agent/XuefengAgent.js`
- 创建：`src/store/slots.js`

**步骤**：
1. `prompts.js`：将 `system_prompt.md` 转为 JS 字符串模板，支持槽位动态插入
2. `SlotManager.js`：
   ```javascript
   // 7个槽位
   const SLOTS = {
     province: null,    // 省份
     score: null,       // 分数/位次
     subject: null,     // 选科
     interest: null,    // 兴趣/厌恶
     location: null,    // 地域偏好
     family: null,      // 家庭资源
     goal: null         // 核心诉求
   }
   // 从消息文本提取槽位的正则/关键词逻辑
   export function extractSlots(text, currentSlots) { ... }
   export function getSlotsCompletion(slots) { ... }  // 返回 0-7
   ```
3. `XuefengAgent.js`：
   ```javascript
   export class XuefengAgent {
     constructor(sessionId) {
       this.sessionId = sessionId
       this.slots = { ...SLOTS }
       this.history = []
     }
     async chat(userMessage) {
       this.slots = extractSlots(userMessage, this.slots)
       const prompt = buildPrompt(this.slots, this.history)
       const reply = await callLLM([...this.history, { role: 'user', content: userMessage }])
       this.history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: reply })
       return { reply, slots: this.slots, slotCount: getSlotsCompletion(this.slots) }
     }
   }
   ```
4. 验收：在测试页面和 Agent 对话，槽位进度正确递增

### Task 1-6: Tab 导航和页面骨架

**涉及文件**：
- 修改：`src/pages.json`
- 创建：各页面 index.vue 骨架

**步骤**：
1. 配置底部 TabBar：对话 / 院校 / 报告 / 我的
2. 创建 4 个页面的空骨架（仅 title + 占位文字）
3. 验收：小程序可以在 4 个 Tab 间切换

---

## 第二阶段 — MVP（约2周）

**目标**：对话界面完整可用，生成基础报告，历史记录可查，可真实用户内测

### Task 2-1: 对话页面 UI

**涉及文件**：
- 修改：`src/pages/chat/index.vue`
- 创建：`src/components/ChatBubble/index.vue`
- 创建：`src/components/SlotProgress/index.vue`

**设计要点**：
```
┌─────────────────────────────┐
│  槽位进度 [●●●○○○○] 3/7 已填 │  ← SlotProgress 组件
├─────────────────────────────┤
│                             │
│  [AI] 您好！我是雪峰顾问...  │  ← ChatBubble (ai)
│  [用户] 我是河北的，650分   │  ← ChatBubble (user)
│  [AI] 好的，您的分数很不错  │
│  [AI 正在思考...] ●●●       │  ← 加载动画
│                             │
├─────────────────────────────┤
│ [冲一冲] [稳妥] [就业优先]  │  ← 快捷标签
│ ┌─────────────────┐[发送]  │  ← 输入框
│ │                 │       │
│ └─────────────────┘       │
└─────────────────────────────┘
```

**步骤**：
1. `ChatBubble` 组件：props `type`(ai/user), `content`, `loading`
2. `SlotProgress` 组件：props `slots` 对象，计算完成数，7格进度条
3. 对话页面：滚动视图 + 消息列表渲染
4. 发送逻辑：调用 `XuefengAgent.chat()` → 收到响应 → 追加气泡 → 更新进度条
5. 7槽位满时：底部弹出「✨ 资料收集完整，立即生成报告」按钮
6. 验收：完整走通一次对话，进度条变化正确

### Task 2-2: 会话云端持久化

**涉及文件**：
- 修改：`src/store/chat.js`
- 修改：`src/api/cloud.js`

**步骤**：
1. 每次对话开始，在 `sessions` 集合创建记录
2. 每次发送/收到消息后，更新 `sessions.messages` 和 `sessions.slots`
3. 使用防抖（500ms）批量更新，避免频繁写库
4. 验收：关闭小程序重新打开，历史对话可恢复

### Task 2-3: 报告生成

**涉及文件**：
- 创建：`cloudfunctions/report-generate/index.js`
- 创建：`src/pages/report/index.vue`
- 创建：`src/components/ReportCard/index.vue`

**报告生成逻辑**：
```javascript
// cloudfunctions/report-generate/index.js
// 1. 接收 slots 数据
// 2. 构建报告专用 prompt（从 system_prompt.md 冲稳保部分）
// 3. 调用 LLM 生成结构化 JSON 报告
// 4. 解析并存储到 reports 集合
// 返回结构:
{
  profile: "学生画像摘要",
  chong: [{ school, major, reason, risk }],      // 冲：5所
  wen: [{ school, major, reason }],               // 稳：5所
  bao: [{ school, major, reason }],               // 保：3所
  analysis: "专业就业分析",
  warning: "风险提示"
}
```

**付费墙规则**（在前端实现）：
- 免费可见：profile + chong前2所
- 付费可见：完整报告

**步骤**：
1. 「生成报告」按钮触发 → 调用 `report-generate` 云函数
2. 等待时显示生成动画（进度条 + tips）
3. 报告页面渲染：卡片式展示，付费区域虚化 + 解锁按钮
4. 验收：完整对话后生成报告，付费墙前内容正常展示

### Task 2-4: 院校查询页面

**涉及文件**：
- 修改：`src/pages/school/index.vue`
- 创建：`src/components/SchoolCard/index.vue`
- 创建：`cloudfunctions/import-schools/index.js`（数据导入工具，一次性使用）

**步骤**：
1. 将 `knowledge_base.md` 中的院校数据结构化，导入 CloudBase `schools` 集合
2. 搜索页：输入框 + 筛选标签（省份/985/211/专业类）
3. 调用 CloudBase 数据库模糊查询：`db.collection('schools').where({ name: /搜索词/ })`
4. 院校详情：基本信息 + 近3年录取分数线（折线图，使用 uCharts）
5. 验收：搜索"北大"出现结果，点击查看详情

### Task 2-5: 个人档案页面

**涉及文件**：
- 修改：`src/pages/profile/index.vue`

**步骤**：
1. 展示用户头像 + 昵称 + 剩余次数
2. 历史对话列表（从 `sessions` 查询本用户，按时间倒序）
3. 历史报告列表（从 `reports` 查询）
4. 预填档案表单（省份/分数/选科），填写后自动预置到下次对话槽位
5. 验收：历史对话可点击进入查看，档案信息可保存

### Task 2-6: 微信分享

**步骤**：
1. 配置 `onShareAppMessage`：分享标题 + 封面图
2. 报告页面：「分享给朋友」按钮，生成报告预览图（canvas 截图）
3. 验收：可分享小程序卡片，朋友点击进入正确落地页

---

## 第三阶段 — 付费闭环（约1.5周）

**目标**：Freemium 完整可用，用户可付费解锁报告，商业闭环跑通

### Task 3-1: Credits 计数系统

**涉及文件**：
- 修改：`src/utils/auth.js`
- 修改：`cloudfunctions/wx-login/index.js`

**规则**：
- 免费用户：`credits = 3`（每日重置）
- 每次完整对话消耗 1 credit
- credits = 0 时，发送消息弹出付费引导

**步骤**：
1. `users.credits` 字段，每日凌晨 CloudBase 定时触发器重置（免费用户置3）
2. 前端在发送消息前检查 credits，不足时拦截并弹窗
3. 对话完成时（生成报告节点）扣减 credits
4. 验收：测试 credits = 0 时弹出付费弹窗

### Task 3-2: 微信支付接入

**涉及文件**：
- 创建：`cloudfunctions/pay-create/index.js`（创建订单）
- 创建：`cloudfunctions/pay-notify/index.js`（支付回调）
- 创建：`src/utils/pay.js`

**流程**：
```
用户点击付费 → 调用 pay-create 云函数
             → 云函数调用微信统一下单 API → 返回 prepay_id
             → 前端 wx.requestPayment(prepay_id)
             → 用户完成支付
             → 微信回调 pay-notify 云函数
             → 更新 orders + reports.isPaid + users.plan
```

**套餐**：
- 单次报告解锁：¥19.9
- 月度会员（无限次）：¥49.9

**步骤**：
1. 申请微信商户号（mchid），配置支付密钥
2. 编写 `pay-create` 云函数（统一下单）
3. 编写 `pay-notify` 云函数（支付回调验签 + 业务逻辑）
4. 前端支付弹窗 UI + `wx.requestPayment` 调用
5. 验收：沙箱环境完整走通支付流程，报告成功解锁

### Task 3-3: 付费解锁 UI

**涉及文件**：
- 修改：`src/pages/report/index.vue`
- 创建：`src/components/PayModal/index.vue`

**步骤**：
1. 付费墙区域：模糊遮罩 + 「解锁完整报告 ¥19.9」按钮
2. `PayModal` 组件：展示套餐选择（单次/月度）+ 支付按钮
3. 支付成功后：动画解锁，展示完整报告
4. 月度会员标识：档案页显示「会员」标签
5. 验收：支付后报告全部展示，遮罩消失

### Task 3-4: PDF/分享图生成

**涉及文件**：
- 修改：`cloudfunctions/report-generate/index.js`
- 修改：`src/pages/report/index.vue`

**步骤**：
1. 云函数端：安装 `puppeteer-core` 或使用 CloudBase 截图能力，生成报告 PDF
2. PDF 上传到 CloudBase 云存储，返回临时 URL
3. 前端：「下载报告」按钮 → `wx.downloadFile` + `wx.openDocument`
4. 分享图：前端 canvas 绘制报告首页截图，「保存到相册」
5. 验收：可下载 PDF，可保存分享图

---

## 第四阶段 — B端顾问工作台（约2周）

**目标**：顾问登录、查看学生档案、可介入对话，To B 功能完整

### Task 4-1: 顾问账号体系

**涉及文件**：
- 修改：CloudBase `users` 集合，增加 `role` 字段（user/advisor/admin）
- 创建：`cloudfunctions/advisor-auth/index.js`
- 修改：`src/pages/profile/index.vue`

**步骤**：
1. `users.role = 'advisor'` 由管理员手动设置（初期）
2. `advisor-auth` 云函数：验证当前 openid 是否为顾问
3. 前端：登录后判断 role，是顾问则显示「进入工作台」入口
4. 顾问专属路由：`/pages/advisor/index`

### Task 4-2: 学生档案工作台

**涉及文件**：
- 创建：`src/pages/advisor/index.vue`（学生列表）
- 创建：`src/pages/advisor/student-detail.vue`（学生详情）

**步骤**：
1. 学生列表：查询 `sessions` 集合（顾问权限读所有），展示姓名/分数/省份/最后对话时间
2. 点击进入学生详情：
   - 基本信息（槽位数据）
   - 对话历史回放（只读查看）
   - 已生成的报告
3. 搜索和筛选：按省份/分数段筛选
4. 验收：顾问账号可看到所有学生列表

### Task 4-3: 对话旁听与接管

**涉及文件**：
- 修改：`src/pages/advisor/student-detail.vue`
- 修改：`cloudfunctions/report-generate/index.js`（增加人工批注字段）

**旁听逻辑**（基于 CloudBase 实时监听）：
```javascript
// CloudBase 支持实时数据库监听
const listener = db.collection('sessions')
  .doc(sessionId)
  .watch({
    onChange: (snapshot) => {
      // 收到学生最新对话，实时显示
    }
  })
```

**接管逻辑**：
1. 顾问点击「接管对话」→ 更新 `sessions.status = 'advisor_takeover'`
2. 学生端检测到 status 变化 → AI 暂停 → 显示「正在连接顾问...」
3. 顾问输入内容 → 存入 `sessions.messages`（标注 `role: 'advisor'`）→ 学生端收到实时推送
4. 结束接管：恢复 `status = 'active'`
5. 验收：模拟双端，顾问接管后学生端收到顾问消息

### Task 4-4: 顾问批注功能

**步骤**：
1. 在报告详情页，顾问可以给每个志愿添加文字批注
2. 批注存储在 `reports.advisorNotes` 数组
3. 学生端：如果有顾问批注，报告上显示「顾问建议」标签
4. 验收：顾问添加批注后，学生端可见

### Task 4-5: 数据运营后台

**方案**：使用 CloudBase 自带的「数据库可视化」即可满足初期需求，无需自建后台

**需要额外开发的**：
1. 知识库更新：将 `knowledge_base.md` 内容拆分存入 `knowledge` 集合，支持在线查看
2. 数据看板（简单版）：统计总用户数、付费用户数、今日对话数
3. 可在 `advisor` 页面增加一个管理员专属的统计卡片

---

## 技术风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| CloudBase 云函数冷启动慢（1-3s） | 高 | 设置「固定实例」，或改成 HTTP 触发器预热 |
| LLM 响应无流式体验 | 中 | 伪流式（逐字渲染）+ 云函数流式输出（CloudBase 支持 HTTP 触发器 SSE） |
| 知识库太大导致 JS bundle 过大 | 中 | 知识库改存 CloudBase，按需查询 |
| 微信支付审核周期长 | 中 | 先用「微信收款码」过渡，支付后人工解锁 |
| 小程序审核被拒（AI+教育+付费） | 低 | 提前准备资质文件（ICP + 教育类目） |

---

## 开发环境准备

```bash
# 必需工具
- HBuilderX (Uniapp 官方 IDE) 或 VSCode + uni-app 插件
- 微信开发者工具
- Node.js 18+

# 账号准备
- 微信小程序开发者账号（个人/企业）
- 微信云开发环境 ID
- DeepSeek API Key（或通义千问等）
- 微信商户号（第三阶段才需要）
```

---

## 里程碑验收标准

| 阶段 | 完成标志 |
|------|---------|
| 地基 | 微信登录成功，可和 Agent 对话，LLM 返回正常 |
| MVP | 真实用户内测可用，完整对话→报告流程跑通 |
| 付费闭环 | 支付成功解锁报告，credits 正常扣减，PDF 可下载 |
| B端完整 | 顾问可旁听/接管，批注可见，商业化就绪 |

---

*此计划由 writing-plans skill 生成，2026-06-10*
