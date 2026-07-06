# Navigation Motion Design

## Goal

为当前站点建立一套统一的导航与切页动效语言，方向为“整体顺滑，关键交互更有力量感”。

本次设计只覆盖以下范围：

- 顶部导航的 `default / hover / active / press` 状态
- 通过导航触发的页面切换过渡
- 各页面首屏区域的分层入场
- 移动端导航的同语义弱化版本

本次不覆盖以下范围：

- 卡片悬停和点击反馈
- 筛选面板、弹窗、抽屉、开箱动画
- 3D 武器模型本身的动画逻辑

## Current Context

当前项目是一个多页面静态站点，主要样式集中在 [styles.css](/C:/Users/35191/Documents/git1/styles.css)，页面结构由各 HTML 文件和 [app.js](/C:/Users/35191/Documents/git1/app.js) 共同渲染。

现状特征：

- 视觉基调已经稳定：暗色背景、金色强调、偏游戏收藏站氛围
- 已存在少量过渡：`main` 有基础的淡出淡入，导航 hover 主要依赖背景色变化
- 动效语言还不统一：页面切换、导航反馈、首屏进入之间缺少同一节奏

## Visual Direction

目标不是把页面做成炫技演示，而是让它更像一个“有操作反馈的游戏系统界面”。

核心原则：

- 底盘顺滑：整体进入、切页、滚动出现要轻且连贯
- 触点锋利：hover、press、active 要明确，反馈短促
- 骨架稳定：`header` 保持稳定，内容区承担变化
- 长期可用：避免大范围扫光、过重发光、夸张位移

## Motion Tokens

建议建立统一的动效参数，供导航、切页、首屏区复用：

- `--motion-fast`: `140ms`
- `--motion-base`: `220ms`
- `--motion-slow`: `360ms`
- `--motion-distance-xs`: `4px`
- `--motion-distance-sm`: `8px`
- `--motion-distance-md`: `18px`
- `--motion-ease-ui`: `cubic-bezier(0.22, 1, 0.36, 1)`
- `--motion-ease-emphasis`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--motion-ease-exit`: `cubic-bezier(0.4, 0, 1, 1)`

这些 token 只服务于 `transform` 和 `opacity`，不用于布局属性动画。

## Navigation Behavior

### Default

- 导航文字维持当前低对比度状态
- 每个导航项预留底部能量线区域，但默认透明
- 不使用厚重底色块作为主状态

### Hover

导航 hover 使用三层反馈组合：

- 文字提亮
- 元素整体上浮 `1px`
- 底部出现金色短线，从 `scaleX(0.35)` 过渡到 `scaleX(1)`

hover 应当短促，建议时长使用 `--motion-fast` 或 `--motion-base`，避免拖泥带水。

### Active

当前页 active 保持稳定高亮，但克制处理：

- 保留底部金色能量线
- 轻微提升文字亮度
- 可选增加很轻的内发光或边缘辉光

active 的重点是“持续确认”，不能比 hover 更躁动。

### Press

点击瞬间加入非常短的按压反馈：

- `translateY(1px)` 或 `scale(0.985)`
- 之后立即进入切页状态

press 必须非常短，更多是触觉暗示，而不是明显视觉跳动。

### Mobile

移动端沿用同语义，但弱化幅度：

- hover 替换为 touch-friendly 的 active/press 反馈
- 位移更小
- 能量线更薄
- 不增加额外闪烁元素

## Page Transition Behavior

### Structural Rule

切页采用“壳体稳定、内容切换”的策略：

- `header` 尽量保持稳定
- `main` 负责整体入场和离场
- 页面首屏承担层次化进入

### Exit

用户点击导航后：

- 当前 `main` 先做轻微淡出
- 同时下移 `4px` 到 `8px`
- 不要对 `header` 做整体滑动或闪断

exit 必须短于 enter，避免等待感。

### Enter

新页面载入后：

- `main` 从低位移、低透明度进入
- 首屏区内部再做 2 到 3 拍 stagger

推荐分层顺序：

1. 小标签或 eyebrow
2. 标题
3. 描述文本
4. 操作区或次级信息

如果页面没有 hero，则由 `page-intro`、`catalog-toolbar` 或等价首屏区承担此职责。

## Intro Section Behavior

适用对象：

- 首页 `hero`
- 各页面 `page-intro`
- 列表页的 `catalog-toolbar`

规则：

- 标题先进入，位移更小但更稳
- 描述稍后进入，透明度变化为主
- CTA 或工具栏最后进入，形成确认感
- 时间差小，不做“表演型”分镜

建议总时长控制在 `300ms` 到 `550ms` 之间，按层分配，不要超过一秒。

## Interaction Model

实现建议遵循“CSS 为主，JS 为辅”：

- 基础状态切换使用 CSS transition
- 页面进入和导航点击时，用少量 JS class 控制全局状态
- 如果需要 stagger，则在 JS 中为首屏容器添加一次性 `is-entering` / `is-entered` 类，避免复杂运行时动画系统

不引入新的大型动画框架。

## State Model

建议新增或规范以下状态类：

- `html.is-navigating`
- `body` 或 `main` 上的页面进入类，例如 `is-page-entering`
- 首屏区容器类，例如 `data-motion-intro`
- 子元素节奏类，例如 `data-motion-part="eyebrow|title|copy|actions"`
- 导航项的 `is-active` 与 `is-pressing`

所有状态都应可重复进入，不依赖一次性内联样式。

## Performance Constraints

- 只动画 `opacity`、`transform`、必要时的阴影透明度
- 不动画 `width`、`height`、`top`、`left`
- 不增加持续运行的循环动画到主导航
- 移动端减少位移和时长
- 快速连续点击导航时，状态必须可中断并正确复位

## Accessibility

必须保留 `prefers-reduced-motion: reduce` 的完整降级：

- 导航只保留颜色变化
- 页面切换取消位移，仅保留极轻淡入或直接无动画
- 首屏 stagger 取消，内容同步出现

降级后不能出现元素长期透明、延迟挂起或不可点击状态。

## Verification Plan

实现后重点验证以下场景：

1. 桌面端导航 `hover / active / press` 是否节奏统一
2. `index.html`、`catalog.html`、`collections.html`、`item.html` 从导航切入时是否都使用同一套切页语言
3. 移动端横向导航是否仍然顺手，不出现误触或动画拥挤
4. 快速连续点击不同导航项时，是否出现闪烁、残留类名、active 状态错乱
5. `prefers-reduced-motion` 下是否可正常浏览

## Out of Scope Follow-up

如果本次导航与切页语言验证成功，下一轮可沿同一语言扩展到：

- 卡片 hover / click
- 筛选面板和弹窗开合
- 开箱页高反馈状态切换

扩展时应复用同一套 motion token，而不是另起一套动画节奏。
