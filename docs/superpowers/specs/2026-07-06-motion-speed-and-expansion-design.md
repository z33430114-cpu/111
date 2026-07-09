# Motion Speed And Expansion Design

## Goal

在保留当前站点动效语言的前提下，优先解决页面切换与重页面首屏响应偏慢的问题，尤其是 `loadout.html` 的切页体感与内容首屏可用速度；随后将统一的动效语言扩展到卡片、面板/弹窗、首页与分区滚动进入。

本次设计分两段推进：

- 第一段：速度优先，修复“切页慢”“饰品搭配慢”
- 第二段：在不拖慢页面的前提下，把其他交互动效一起补齐

## Current Context

当前项目是一个静态多页面前端，主要逻辑集中在 [app.js](/C:/Users/35191/Documents/git1/app.js)，样式集中在 [styles.css](/C:/Users/35191/Documents/git1/styles.css)。

已经存在的动效基础：

- 顶部导航具备 hover / active / pressing 状态
- `main` 具备切页退出态
- 主要首屏区已挂上 `data-motion-intro` / `data-motion-part`
- 各页面资源版本号已经统一，避免旧缓存干扰

当前主要问题：

- 导航切页仍存在可感知等待
- `loadout.html` 首屏虽然先渲染框架，但推荐与职业搭配依赖大 catalog 资源，内容补入偏慢
- 其他区域尚未统一到同一套“快反馈、轻装饰”的动效节奏

## Root Cause Summary

### Page Transition

切页体感慢的核心原因不是浏览器卡顿，而是人为延迟与较长的进入时长叠加：

- `navigateSmoothly()` 中存在显式等待
- `main` 与首屏分层进入时长此前偏长
- 对用户来说，“点了没有马上走”会比动画是否高级更敏感

### Loadout Page

`loadout.html` 的体感最慢，主要因为：

- 推荐与职业搭配需要 `ensureCatalogAssetsLoaded()`
- `catalog-data.js` 体量大
- 推荐、职业搭配、价格快照都属于次级信息，却会影响页面完整感知

因此这里不能继续追求“整页统一入场”，而应转为“框架先到、内容分批补齐”。

## Visual Direction

这一轮的动效方向改为：

- 快速响应优先
- 反馈明确但不拖尾
- 重页面少做长距离入场
- 装饰性动效让位于首屏可用性

统一原则：

- 交互反馈要快
- 装饰性动效要轻
- 内容先可用，再补层次

## Speed-First Strategy

### Navigation And Page Switch

导航切页的目标是“点了就走”，不是“点了先演一下”。

设计要求：

- 页面切换只保留非常短的退出提示
- 普通页面切换应尽量接近即时响应
- `header` 继续稳定
- `main` 只承担轻量退出和轻量进入

进入与退出关系：

- 退出要短于进入
- 普通页面的总切页体感必须优先于动画完整性
- 若两者冲突，优先降低动画时长

### Heavy Page Rule

以下页面视为重页面：

- `loadout.html`
- `inventory.html`
- `account.html`

这些页面的规则：

- 首屏主框架优先立即渲染
- 大幅位移和长 stagger 禁用或弱化
- 次级模块异步补入

## Loadout Experience Design

### First Paint

进入 `loadout.html` 后，用户必须先看到：

- 页面标题与说明
- 聊天输入区或主要入口
- 主要操作按钮
- 清晰的“正在准备推荐内容”骨架或占位

不能让用户感到“整页还没准备好”。

### Progressive Reveal

`loadout.html` 的内容拆成三个优先级：

1. **立即可见**
   - 首屏标题
   - 输入区
   - 主操作按钮

2. **快速补入**
   - AI 推荐区骨架
   - 数据提示

3. **后台补入**
   - 推荐卡片
   - 职业搭配参考
   - 价格快照刷新结果

次级内容补入时允许有轻微淡入，但不得阻塞主框架可用。

## Motion Expansion Scope

在速度问题修复后，本轮继续扩展以下动效：

### Card Motion

适用对象：

- 目录卡片
- 收藏页卡片
- 最近浏览卡片
- AI 推荐卡片

规则：

- hover 快速反馈
- click 更短更明确
- 不用长时间浮动
- 不引入持续循环效果

视觉语言：

- 轻抬升
- 边框提亮
- 阴影微增强
- 按下时短促压回

### Panel / Dialog Motion

适用对象：

- 筛选面板
- 选择器弹层
- 抽屉
- 弹窗

规则：

- 打开快
- 关闭更快
- 短距离位移 + 淡入淡出
- 不使用厚重模糊拖尾

### Home And Section Motion

适用对象：

- 首页 hero
- 分区标题
- 重点内容列表

规则：

- 只做轻量层次
- 不把每个分区都做成“片头”
- 保留阅读节奏优先

## Page Tiering

为了兼顾统一性与速度，本次按页面分层：

### Tier 1: Fast Content Pages

- `index.html`
- `catalog.html`
- `collections.html`
- `favorites.html`
- `recent.html`

策略：

- 保留轻切页
- 保留首屏层次
- 卡片反馈更明显

### Tier 2: Heavy Utility Pages

- `loadout.html`
- `inventory.html`
- `account.html`

策略：

- 切页更短
- 首屏位移更小
- 内容分批补入
- 动效存在感让位于可操作速度

## Technical Approach

本次继续使用轻量实现：

- CSS transition 负责大部分反馈
- JS 负责状态切换与分批渲染时机
- 不引入重型动画框架

重点技术方向：

- 继续使用版本号资源引用避免缓存错觉
- 将重页面的异步内容显式区分为“框架”和“补充内容”
- 必要时为重页面引入更轻的页面级 motion class，而不是强行复用普通页面的全部进入节奏

## Performance Guardrails

- 切页延迟必须继续压缩
- `loadout.html` 不得让推荐数据阻塞首屏可操作区
- 只动 `opacity`、`transform`、必要时阴影透明度
- 动效不得增加新的大脚本依赖
- 异步补入内容不得触发明显布局闪跳

## Accessibility

必须继续保留 `prefers-reduced-motion: reduce`：

- 页面切换不做明显位移
- 卡片与面板过渡进一步简化
- 重页面骨架与异步补入仍然保留功能，但取消装饰性层次

## Verification Plan

本轮验收优先级如下：

1. 从首页、目录、收藏、最近浏览之间切换时，体感是否明显快于当前版本
2. 进入 `loadout.html` 时，是否先看到可操作框架，再看到推荐内容补入
3. `inventory.html` 与 `account.html` 是否避免了“为了动效而等待”
4. 卡片 hover / click 是否更明确但不拖慢点击
5. 面板 / 弹窗开合是否利落，关闭是否快于打开
6. 首页与分区进入是否保留层次但不拖阅读

## Out Of Scope

本轮不做以下工作：

- 重写数据模型
- 拆分 `catalog-data.js` 数据源结构
- 引入新的前端框架
- 重新设计 3D 武器模型动画

如果后续仍觉得 `loadout.html` 慢，下一阶段再单独评估数据切片、延迟脚本加载或更深层的页面架构调整。
