# 饰品搭配页功能修订 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不影响其他页面的前提下，完善饰品搭配页的 12 槽工作台、中文显示、推荐来源隔离和 AI/筛选一致性。

**Architecture:** 保留 `app.js` 当前 loadout 状态与交互 ID，在 `loadout.html`、`app.js`、`styles.css` 和 loadout 专属测试内完成增量修订。推荐候选继续由目录、AI 和库存组成，但在进入步枪推荐展示前按来源隔离；AI 对话和筛选控件统一经过同一份规范化查询状态。

**Tech Stack:** 原生 HTML、CSS、JavaScript、Node.js `node:test`、本地 `scripts/serve.mjs`。

## Global Constraints

- 只修改饰品搭配页相关的 `loadout.html`、`app.js`、`styles.css` 和 loadout 专属测试。
- 不删除或改写其他页面的市场、库存、导航和推荐逻辑。
- 保留现有 loadout 交互 ID：`aiLoadoutChatForm`、`aiLoadoutBudgetInput`、`aiLoadoutPromptInput`、`saveCuratorLoadoutButton`、`clearCuratorLoadoutButton`。
- 推荐步枪来自目录/推荐候选，库存只提供已拥有状态和升级提示。

---

### Task 1: Add loadout regression coverage

**Files:**
- Create: `scripts/loadout-accessory-matching.test.mjs`
- Read: `app.js`, `styles.css`, `loadout.html`

**Interfaces:**
- Tests inspect loadout-specific source contracts and do not import or mutate other page code.
- Later tasks must satisfy the named helper and markup contracts in these tests.

- [ ] **Step 1: Write the failing tests**

Add assertions for: a 12-entry slot definition, horizontal slot overflow behavior scoped under `#loadoutRoot`, absence of a loadout market-trend label/node, recommendation/inventory source separation for rifle candidates, and one shared filter-state path used by chat and filters.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test scripts/loadout-accessory-matching.test.mjs`

Expected: FAIL because the current slot rail has six entries and the current candidate path mixes inventory entries into rifle recommendations.

- [ ] **Step 3: Commit the red test**

Run: `git add scripts/loadout-accessory-matching.test.mjs && git commit -m "test: cover loadout accessory matching behavior"`

### Task 2: Implement the loadout behavior fixes

**Files:**
- Modify: `app.js:7582-8068` (loadout candidate, slot, filter and markup helpers)
- Modify: `loadout.html:1-51` (loadout-only cache/version hooks if required)

**Interfaces:**
- `curatorSlotRailMarkup(candidates)` renders 12 stable slot cards.
- `loadoutWorkbenchCandidates()` returns candidates with a preserved `source` field and does not substitute inventory entries for rifle recommendations.
- `syncAiLoadoutQueryState()` is the single normalization path for chat and filter changes.

- [ ] **Step 1: Add the minimum source-isolation and filter-state code**

Preserve candidate source metadata (`ai`, `upgrade`, `inventory`), use catalog/AI candidates for rifle recommendation groups, and let inventory only decorate matching candidates with an `owned` flag or remain in its dedicated inventory group. Route both filter controls and `requestAiLoadoutChat()` through the same normalized budget, color, style, category and prompt state.

- [ ] **Step 2: Expand the slot rail to 12 entries**

Replace the six-item slot array with a stable 12-slot definition, keep the existing selected-key persistence and add/remove hooks, and render empty slots without changing the selected candidate order.

- [ ] **Step 3: Remove only the loadout market-trend surface**

Remove the loadout-only market strip/trend option and its event/render path while leaving shared market data and non-loadout pages untouched.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `node --test scripts/loadout-accessory-matching.test.mjs scripts/loadout-curator-layout.test.mjs scripts/loadout-ai-chat-regression.test.mjs scripts/loadout-performance-regression.test.mjs`

Expected: PASS with no loadout regression failures.

### Task 3: Repair Chinese copy and scoped layout behavior

**Files:**
- Modify: `app.js:13-47,306-700` (loadout copy and runtime localization only)
- Modify: `styles.css:8364-10310` (rules scoped under `#loadoutRoot`)
- Modify: `scripts/loadout-accessory-matching.test.mjs`

**Interfaces:**
- Visible loadout Chinese copy must be valid UTF-8 text and must not contain replacement characters or mojibake markers.
- Slot rail remains horizontally scrollable on desktop and touch-friendly on small screens.

- [ ] **Step 1: Add the failing copy/layout assertions**

Assert that loadout-specific visible strings use the expected Chinese labels, no `�` or common mojibake sequences appear in the loadout source, and the scoped CSS includes stable slot dimensions, horizontal overflow and responsive touch behavior.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/loadout-accessory-matching.test.mjs`

Expected: FAIL on the current malformed or untranslated loadout strings and missing 12-slot overflow contract.

- [ ] **Step 3: Fix only loadout-visible copy and CSS**

Use the existing `uiText`/`uiTemplate` conventions, remove malformed literals from loadout markup, add `overflow-x: auto`, stable slot widths and responsive scrolling under `#loadoutRoot`, and keep global selectors unchanged.

- [ ] **Step 4: Run all focused tests**

Run: `node --test scripts/loadout-accessory-matching.test.mjs scripts/loadout-curator-layout.test.mjs scripts/loadout-ai-chat-regression.test.mjs scripts/loadout-performance-regression.test.mjs scripts/ui-chinese-regression.test.mjs`

Expected: PASS.

### Task 4: Browser verification and scope audit

**Files:**
- Read: `loadout.html`, `app.js`, `styles.css`, the focused tests
- Modify: none unless a verification failure reproduces a loadout-scoped bug

**Interfaces:**
- Local page must render through `http://127.0.0.1:4173/loadout.html`.

- [ ] **Step 1: Start the local service**

Run: `npm start`

Expected: service listens on port `4173`.

- [ ] **Step 2: Verify desktop behavior in the in-app browser**

Open the loadout page, inspect visible Chinese copy, confirm the market-trend option is absent, confirm 12 slot cards exist and scroll horizontally with the wheel, and confirm rifle recommendation cards are not replaced by inventory cards.

- [ ] **Step 3: Verify mobile behavior**

Use a narrow viewport and confirm the slot rail remains usable by touch/drag, text fits, and AI/filter controls remain visible without overlap.

- [ ] **Step 4: Audit scope and final tests**

Run: `git diff --check` and the focused test command from Task 3; inspect `git diff --name-only` to ensure source changes are limited to loadout files and the new loadout test.

- [ ] **Step 5: Commit implementation**

Run: `git add loadout.html app.js styles.css scripts/loadout-accessory-matching.test.mjs && git commit -m "fix: refine loadout accessory matching page"`

