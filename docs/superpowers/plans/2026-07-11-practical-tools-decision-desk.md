# 实用工具决策台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将实用工具页改造成能给出买入、攒钱与换购下一步建议的本地决策台。

**Architecture:** 现有 `app.js` 草稿状态和计算函数保持为唯一数据源。新增三组纯派生函数，渲染层用它们生成总览、判断和优先项；样式只扩展 tools 命名空间。

**Tech Stack:** 静态 HTML、原生 JavaScript、CSS、Node 静态回归检查。

## Global Constraints

- 仅使用本地输入数据；不得声称或模拟实时价格、持仓、投资收益。
- 保持 `toolsPurchaseForm`、`toolsWishlistForm`、`toolsTradeForm` 和已有输入 ID 可用。
- 不修改目录、搭配、库存和开箱页面；不覆盖工作区无关变更。
- 使用 `uiText()` 双语文案，并为结果区提供 `aria-live="polite"`。

---

### Task 1: 建立决策派生数据

**Files:**
- Modify: `C:/Users/35191/Documents/git1/app.js:9556-9587`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-practical-tools.mjs`

**Interfaces:**
- Consumes: `calculatePurchaseCost()`, `calculateWishlistBudget()`, `calculateTradeBudget()`。
- Produces: `purchaseDecision(result)`, `wishlistDecision(result)`, `tradeDecision(result)`，均返回 `{ tone, title, detail }`；愿望函数另含 `nextItem`。

- [ ] **Step 1: 写入失败测试**

在静态检查标识数组加入 `function purchaseDecision`、`function wishlistDecision`、`function tradeDecision` 和三个调用表达式。

- [ ] **Step 2: 验证失败**

Run: `npm run test:practical-tools`

Expected: FAIL，提示缺少 `function purchaseDecision`。

- [ ] **Step 3: 最小实现**

在 `calculateTradeBudget` 后加入三个函数：购买函数依据 `result.delta >= 0` 返回“预算内，可以考虑下单”或“超出预算，建议等待或议价”；愿望函数以价格升序选择 `nextItem`，返回下一件的缺口；换购函数依据 `result.gap <= 0` 返回“资金已覆盖目标”或“还差 ¥X”。三者的 `detail` 均通过 `uiText()` 与 `uiTemplate()` 生成。

- [ ] **Step 4: 验证通过**

Run: `npm run test:practical-tools`

Expected: PASS，输出 `Practical tools check passed.`。

- [ ] **Step 5: 提交**

Run: `git add app.js scripts/check-practical-tools.mjs; git commit -m "feat: derive practical tool decisions"`

### Task 2: 渲染决策台与示例数据

**Files:**
- Modify: `C:/Users/35191/Documents/git1/app.js:9589-9652,10287-10306`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-practical-tools.mjs`

**Interfaces:**
- Consumes: Task 1 的决策函数和现有草稿字段。
- Produces: `toolsDecisionSummaryMarkup`、`tool-decision` 结果区和三个 `data-tools-example` 按钮。

- [ ] **Step 1: 写入失败测试**

扩展静态标识检查：`toolsDecisionSummaryMarkup`、`tool-decision`、`data-tools-example`、`toolsPurchaseExample`、`toolsWishlistExample`、`toolsTradeExample`。

- [ ] **Step 2: 验证失败**

Run: `npm run test:practical-tools`

Expected: FAIL，提示缺少 `toolsDecisionSummaryMarkup`。

- [ ] **Step 3: 最小实现**

让 `renderPracticalTools()` 计算三个决策对象。将 hero 右侧替换为 `toolsDecisionSummaryMarkup`，显示已有储蓄、愿望缺口、换购资金及愿望建议。每个表单后加入 `<div class="tool-decision tool-decision--${tone}" aria-live="polite">`，使用相应决策的 `title` 与 `detail`。

每个表单加入一个 `type="button"` 示例按钮，ID 分别为 `toolsPurchaseExample`、`toolsWishlistExample`、`toolsTradeExample`，并带有 `data-tools-example="purchase|wishlist|trade"`。在 document click handler 中读取该属性后写入以下草稿，并调用 `renderPracticalTools()`：购买 `980/2.5/30/1000`；愿望 `AK-47 | Redline 320`、`M4A1-S | Printstream 980`、`USP-S | Ticket 120`、储蓄 `450`、月存 `500`；换购 `AWP | Asiimov 760`、`USP-S | Ticket 120`、费率 `2.5`、补款 `200`、目标 `1200`。

- [ ] **Step 4: 验证通过**

Run: `npm run test:practical-tools`

Expected: PASS，输出 `Practical tools check passed.`。

- [ ] **Step 5: 提交**

Run: `git add app.js scripts/check-practical-tools.mjs; git commit -m "feat: rebuild practical tools decision desk"`

### Task 3: 添加响应式视觉层级与页面验证

**Files:**
- Modify: `C:/Users/35191/Documents/git1/styles.css:8216-8515`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-practical-tools.mjs`

**Interfaces:**
- Consumes: `.tools-decision-summary`、`.tools-summary-grid`、`.tool-decision`、`.tool-panel-actions`。
- Produces: 桌面右侧购买面板；860px 以下单列工作区；560px 以下摘要、指标和操作按钮单列。

- [ ] **Step 1: 写入失败测试**

在 CSS 标识检查数组加入 `.tools-decision-summary`、`.tools-summary-grid`、`.tool-decision`、`.tool-decision--ready` 和 `.tool-panel-actions`。

- [ ] **Step 2: 验证失败**

Run: `npm run test:practical-tools`

Expected: FAIL，提示缺少 `.tools-decision-summary`。

- [ ] **Step 3: 最小实现**

添加暗红渐变的 `.tools-decision-summary`，用 `.tools-summary-grid` 列出三项金额。添加带左侧状态色的 `.tool-decision`，`ready` 用绿色、`wait` 用橙色、`plan` 用红色；`.tool-panel-actions` 用可换行的 flex。860px 处将摘要设为三列，560px 处恢复一列且操作按钮宽度为 100%。保留现有工具卡片和输入控件样式。

- [ ] **Step 4: 验证通过**

Run: `npm run test:practical-tools`

Expected: PASS，输出 `Practical tools check passed.`。

Run: `npm start`

Expected: 本地服务启动。用浏览器打开 `http://127.0.0.1:4173/tools.html`，验证空状态、三个示例按钮、三种结论及手机单列布局。

- [ ] **Step 5: 提交**

Run: `git add styles.css scripts/check-practical-tools.mjs; git commit -m "style: refine practical tools decision desk"`
