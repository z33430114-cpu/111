# Motion Speed And Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make navigation and page switching feel immediate, ensure heavy pages like `loadout.html` show a usable frame quickly, and then extend the motion language to cards, panels, and homepage sections without slowing the site down.

**Architecture:** Reuse the current vanilla `app.js` plus `styles.css` setup and treat speed as a first-class requirement. Separate page-level responsiveness from decorative motion, add lightweight regression checks for timing-sensitive behavior, and make heavy-page content render progressively instead of waiting on the full catalog pipeline.

**Tech Stack:** Static HTML, plain CSS, vanilla JavaScript, Node.js scripts, Git

---

## File Structure

### Existing files to modify

- `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`
  - Extend regression coverage so it verifies the new fast-path loadout hooks and added motion selectors.
- `C:/Users/35191/Documents/git1/app.js:1870-1890, 4512-4585, 5734-5770, 6132-6150, 6760-6790`
  - Remove excess navigation wait, add heavy-page motion tiering, split `loadout` into frame-first rendering, and trigger asynchronous recommendation hydration without blocking the first usable paint.
- `C:/Users/35191/Documents/git1/styles.css:107-165, 479-560, 799-980, 4090-4145, 4201-4206`
  - Shorten page motion timing, weaken heavy-page intro motion, add faster card/panel interactions, and add homepage/list-section motion hooks.

### Existing files to inspect during implementation

- `C:/Users/35191/Documents/git1/loadout.html`
  - Confirm the page shell still loads the same `app.js` and `styles.css` resources while we optimize runtime behavior.
- `C:/Users/35191/Documents/git1/index.html`
  - Verify homepage sections are suitable for lightweight section-entry classes after motion expansion.

---

### Task 1: Tighten navigation speed and protect heavy pages from slow entry motion

**Files:**
- Modify: `C:/Users/35191/Documents/git1/app.js:6132-6150, 6760-6790`
- Modify: `C:/Users/35191/Documents/git1/styles.css:4090-4145`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Add failing regression assertions for heavy-page fast-path hooks**

```js
assert.match(appJs, /function isHeavyMotionPage\(\)/, "app.js should define isHeavyMotionPage()");
assert.match(appJs, /document\.body\.classList\.toggle\("is-heavy-motion-page"/, "app.js should toggle the heavy-page motion class");
assert.match(stylesCss, /body\.is-heavy-motion-page \[data-motion-intro\]/, "styles.css should define reduced intro motion for heavy pages");
```

- [ ] **Step 2: Run the regression check and confirm it fails before implementation**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: FAIL with a missing `isHeavyMotionPage()` or `is-heavy-motion-page` assertion.

- [ ] **Step 3: Add heavy-page detection and shorten navigation delay in `app.js`**

```js
function isHeavyMotionPage() {
  return ["loadout.html", "inventory.html", "account.html"].includes(pageName());
}

function applyPageMotionState() {
  document.body.classList.toggle("is-heavy-motion-page", isHeavyMotionPage());
  document.body.classList.remove("is-page-entered");
  document.body.classList.add("is-page-entering");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.add("is-page-entered");
      document.body.classList.remove("is-page-entering");
    });
  });
}

function navigateSmoothly(href, trigger) {
  const target = String(href || "").trim();
  if (!target) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    location.assign(target);
    return;
  }
  if (trigger instanceof HTMLElement) {
    trigger.classList.add("is-pressing");
  }
  document.documentElement.classList.add("is-navigating");
  if (appState.navigationTimer) {
    window.clearTimeout(appState.navigationTimer);
    appState.navigationTimer = 0;
  }
  appState.navigationTimer = window.setTimeout(() => {
    appState.navigationTimer = 0;
    location.assign(target);
  }, 45);
}
```

- [ ] **Step 4: Reduce `main` and intro motion timing, especially for heavy pages**

```css
main {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 120ms var(--motion-ease-ui),
    transform 150ms var(--motion-ease-emphasis);
}

html.is-navigating main {
  opacity: 0;
  transform: translateY(6px);
}

[data-motion-intro] [data-motion-part] {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 180ms var(--motion-ease-ui),
    transform 220ms var(--motion-ease-emphasis);
}

body.is-heavy-motion-page [data-motion-intro] [data-motion-part] {
  transition-duration: 120ms, 160ms;
}

body.is-heavy-motion-page.is-page-entering [data-motion-intro] [data-motion-part="eyebrow"],
body.is-heavy-motion-page.is-page-entering [data-motion-intro] [data-motion-part="title"],
body.is-heavy-motion-page.is-page-entering [data-motion-intro] [data-motion-part="copy"],
body.is-heavy-motion-page.is-page-entering [data-motion-intro] [data-motion-part="actions"] {
  transform: translateY(6px);
}

body.is-heavy-motion-page.is-page-entered [data-motion-intro] [data-motion-part="eyebrow"] { transition-delay: 0ms; }
body.is-heavy-motion-page.is-page-entered [data-motion-intro] [data-motion-part="title"] { transition-delay: 20ms; }
body.is-heavy-motion-page.is-page-entered [data-motion-intro] [data-motion-part="copy"] { transition-delay: 40ms; }
body.is-heavy-motion-page.is-page-entered [data-motion-intro] [data-motion-part="actions"] { transition-delay: 60ms; }
```

- [ ] **Step 5: Run the regression check to verify the fast-path hooks pass**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: PASS if later tasks’ selectors already exist, or fail only on new loadout-specific assertions not yet implemented.

- [ ] **Step 6: Commit the navigation speed changes**

```powershell
git add app.js styles.css scripts/check-navigation-motion.mjs
git commit -m "feat: speed up navigation and heavy page motion"
```

### Task 2: Make `loadout.html` render a usable frame before heavy recommendation content

**Files:**
- Modify: `C:/Users/35191/Documents/git1/app.js:1875-1890, 4512-4585, 5734-5770`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Add failing assertions for loadout frame-first rendering**

```js
assert.match(appJs, /function scheduleLoadoutHydration\(\)/, "app.js should define scheduleLoadoutHydration()");
assert.match(appJs, /appState\.loadoutHydrationStarted/, "app.js should track loadout hydration state");
assert.match(appJs, /data-loadout-stage=\"frame\"/, "app.js should render a loadout frame stage marker");
assert.match(appJs, /data-loadout-stage=\"hydrating\"/, "app.js should render a loadout hydration stage marker");
```

- [ ] **Step 2: Run the regression check and verify it fails**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: FAIL because `scheduleLoadoutHydration()` and loadout stage markers do not exist yet.

- [ ] **Step 3: Add loadout hydration state and a dedicated hydration scheduler**

```js
const appState = {
  // existing fields...
  loadoutHydrationStarted: false,
  loadoutFrameReady: false
};

function scheduleLoadoutHydration() {
  if (appState.loadoutHydrationStarted) return;
  appState.loadoutHydrationStarted = true;
  window.setTimeout(async () => {
    try {
      await ensureCatalogAssetsLoaded();
      await Promise.allSettled([
        ensureAiInventoryRecommendations(),
        ensureAiProLoadouts()
      ]);
    } finally {
      appState.loadoutFrameReady = true;
      appState.loadoutHydrationStarted = false;
      if (pageName() === "loadout.html") renderLoadout();
    }
  }, 0);
}
```

- [ ] **Step 4: Rewrite the loadout render path so the frame appears first**

```js
function renderLoadout() {
  const root = document.getElementById("loadoutRoot");
  if (!root) return;
  const hasCatalog = Array.isArray(globalThis.CS2_CATALOG) && globalThis.CS2_CATALOG.length;
  const frameState = appState.loadoutFrameReady ? "ready" : (appState.loadoutHydrationStarted ? "hydrating" : "frame");

  root.innerHTML = `
    <section class="page-intro account-page" data-motion-intro data-loadout-stage="${escapeHtml(frameState)}">
      <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Loadout", "饰品搭配"))}</p>
      <h1 data-motion-part="title">${escapeHtml(uiText("AI Loadout Studio", "智能饰品搭配室"))}</h1>
      <p data-motion-part="copy">${escapeHtml(uiText("Style reads, smart chat, and pro loadout references are grouped here so inventory stays clean.", "风格识别、智能搭配对话和职业选手参考都集中在这里，库存页保持清爽。"))}</p>
    </section>
    ${aiChatMarkup()}
    ${hasCatalog ? aiInventoryRecommendationsMarkup() : `<section class="ai-panel" data-loadout-stage="hydrating"><p class="ai-copy">${escapeHtml(uiText("Preparing recommendations...", "正在准备推荐内容..."))}</p></section>`}
    ${hasCatalog ? aiProLoadoutsMarkup() : `<section class="ai-panel" data-loadout-stage="hydrating"><p class="ai-copy">${escapeHtml(uiText("Loading pro references...", "正在加载职业参考..."))}</p></section>`}
  `;

  if (!hasCatalog || !appState.aiInventoryRecommendations || !appState.aiProLoadouts) {
    scheduleLoadoutHydration();
  }
}
```

- [ ] **Step 5: Keep heavy data refreshes from blocking the first interactive frame**

```js
async function ensureAiInventoryRecommendations(force = false) {
  if (appState.aiInventoryLoading || (appState.aiInventoryRecommendations && !force)) return;
  appState.aiInventoryLoading = true;
  try {
    await ensureCatalogAssetsLoaded();
    const suggestions = buildInventoryUpgradeRecommendations();
    appState.aiInventoryRecommendations = {
      ok: true,
      dominantFamily: suggestions[0]?.family || "",
      suggestions,
      summary: {
        totalSuggestedCost: suggestions.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      }
    };
  } catch {
    appState.aiInventoryRecommendations = { ok: false, suggestions: [] };
  } finally {
    appState.aiInventoryLoading = false;
  }
}

async function ensureAiProLoadouts(force = false) {
  if (appState.aiProLoadoutsLoading || (appState.aiProLoadouts && !force)) return;
  appState.aiProLoadoutsLoading = true;
  try {
    await ensureCatalogAssetsLoaded();
    appState.aiProLoadouts = await fetchJson("/api/ai/pro-loadouts");
    resetProLoadoutTeamRenderCount();
  } catch {
    appState.aiProLoadouts = { ok: false, teams: [] };
  } finally {
    appState.aiProLoadoutsLoading = false;
  }
}
```

- [ ] **Step 6: Run the regression check and a focused loadout smoke test**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: PASS for the added loadout stage assertions.

Run:

```powershell
node -e "const fs=require('fs'); const src=fs.readFileSync('app.js','utf8'); console.log(/scheduleLoadoutHydration\\(\\)/.test(src) && /data-loadout-stage=\\\"frame\\\"/.test(src) ? 'loadout fast path wired' : 'loadout fast path missing');"
```

Expected: `loadout fast path wired`

- [ ] **Step 7: Commit the loadout frame-first behavior**

```powershell
git add app.js scripts/check-navigation-motion.mjs
git commit -m "feat: render loadout frame before heavy data"
```

### Task 3: Extend motion to cards without slowing click-through

**Files:**
- Modify: `C:/Users/35191/Documents/git1/styles.css:479-560, 4201-4206, 1613-1635`
- Modify: `C:/Users/35191/Documents/git1/app.js:6218-6236, 6573-6578`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Add failing assertions for card hover and press states**

```js
assert.match(stylesCss, /\.item-card:where\(:hover, \.is-pressed\)/, "styles.css should define a fast hover/press state for item cards");
assert.match(stylesCss, /\.collection-card:where\(:hover, \.is-pressed\)/, "styles.css should define a fast hover/press state for collection cards");
assert.match(appJs, /function pulsePressState\(element\)/, "app.js should define pulsePressState()");
```

- [ ] **Step 2: Run the regression check and confirm it fails before implementation**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: FAIL because card press helpers do not exist yet.

- [ ] **Step 3: Add a reusable pressed-state helper in `app.js`**

```js
function pulsePressState(element) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.add("is-pressed");
  window.setTimeout(() => {
    element.classList.remove("is-pressed");
  }, 120);
}
```

- [ ] **Step 4: Trigger pressed-state feedback on interactive cards before navigation**

```js
if (inventoryCard instanceof HTMLElement && !target.closest("a, button, input, select, textarea")) {
  event.preventDefault();
  pulsePressState(inventoryCard);
  navigateSmoothly(inventoryCard.dataset.href || "");
  return;
}

if (favoriteCard instanceof HTMLElement && !target.closest("a, button, input, select, textarea")) {
  event.preventDefault();
  pulsePressState(favoriteCard);
  navigateSmoothly(favoriteCard.dataset.href || "");
  return;
}
```

- [ ] **Step 5: Add fast hover / press styles for item, collection, and AI suggestion cards**

```css
.item-card,
.collection-card,
.ai-suggestion-card-clickable {
  transition:
    transform 140ms var(--motion-ease-ui),
    border-color 140ms var(--motion-ease-ui),
    box-shadow 180ms var(--motion-ease-ui),
    background-color 180ms var(--motion-ease-ui);
}

.item-card:where(:hover, .is-pressed),
.collection-card:where(:hover, .is-pressed),
.ai-suggestion-card-clickable:where(:hover, .is-pressed) {
  transform: translateY(-3px);
  border-color: rgba(210, 173, 98, 0.54);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.item-card.is-pressed,
.collection-card.is-pressed,
.ai-suggestion-card-clickable.is-pressed {
  transform: translateY(0) scale(0.985);
}
```

- [ ] **Step 6: Run the regression check**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: PASS.

- [ ] **Step 7: Commit the card interaction pass**

```powershell
git add app.js styles.css scripts/check-navigation-motion.mjs
git commit -m "feat: add fast card interaction feedback"
```

### Task 4: Add panel, dialog, and homepage section motion without reintroducing lag

**Files:**
- Modify: `C:/Users/35191/Documents/git1/styles.css:799-980, 169-245, 445-465, 4062-4078`
- Modify: `C:/Users/35191/Documents/git1/app.js:3267-3300, 6088-6100`
- Modify: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Add failing assertions for panel and section motion selectors**

```js
assert.match(stylesCss, /\.picker-dialog/, "styles.css should still define picker dialog styles");
assert.match(stylesCss, /\.picker-dialog[^]*transition:/, "styles.css should give picker dialogs an explicit motion transition");
assert.match(stylesCss, /\.hero-section|\.section-band/, "styles.css should include homepage section motion selectors");
assert.match(appJs, /data-motion-section/, "app.js should mark homepage sections for lightweight section motion");
```

- [ ] **Step 2: Run the regression check and confirm it fails**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: FAIL on missing homepage section markers or panel transitions.

- [ ] **Step 3: Add lightweight homepage section markers in `buildHomeMarkup()`**

```js
return `
  <section class="hero" data-motion-intro data-motion-section>
    ...
  </section>
  <section class="section-band" data-motion-section>
    ...
  </section>
  <section class="showcase-strip" data-motion-section>
    ...
  </section>
`;
```

- [ ] **Step 4: Add faster open/close motion for pickers and dialogs**

```css
.collection-picker {
  opacity: 1;
  transition: opacity 120ms var(--motion-ease-ui);
}

.picker-backdrop {
  transition: opacity 120ms var(--motion-ease-ui), backdrop-filter 160ms var(--motion-ease-ui);
}

.picker-dialog {
  transform: translateY(0) scale(1);
  opacity: 1;
  transition:
    transform 160ms var(--motion-ease-emphasis),
    opacity 120ms var(--motion-ease-ui);
}

.collection-picker[hidden] {
  display: none;
}

body.picker-open .picker-dialog {
  transform: translateY(0) scale(1);
}
```

- [ ] **Step 5: Add homepage section motion that stays subtle**

```css
[data-motion-section] {
  transition:
    opacity 180ms var(--motion-ease-ui),
    transform 220ms var(--motion-ease-emphasis);
}

body.is-page-entering [data-motion-section] {
  opacity: 0;
  transform: translateY(10px);
}

body.is-heavy-motion-page [data-motion-section] {
  transition: none;
}
```

- [ ] **Step 6: Run verification commands and manually verify the flows**

Run:

```powershell
npm.cmd run test:navigation-motion
```

Expected: PASS with `navigation motion checks passed`.

Run:

```powershell
node -e "const fs=require('fs'); const css=fs.readFileSync('styles.css','utf8'); const js=fs.readFileSync('app.js','utf8'); console.log(/data-motion-section/.test(js) && /picker-dialog[^]*transition:/.test(css) ? 'motion expansion hooks wired' : 'motion expansion hooks missing');"
```

Expected: `motion expansion hooks wired`

Manual verification:

```powershell
npm start
```

Expected browser checks:
- `index.html`, `catalog.html`, `collections.html`, and `favorites.html` switch almost immediately after clicking nav
- `loadout.html` shows a usable frame before recommendation content fills in
- Cards react quickly on hover and press
- Picker dialogs open quickly and close faster than they open
- Homepage sections keep a light entrance without feeling like a blocking intro

- [ ] **Step 7: Commit the panel and homepage motion pass**

```powershell
git add app.js styles.css scripts/check-navigation-motion.mjs
git commit -m "feat: expand motion to panels and sections"
```

## Self-Review

### Spec coverage

- Navigation speed and heavy-page reduction are covered in Task 1.
- `loadout.html` frame-first rendering and progressive hydration are covered in Task 2.
- Card hover / click expansion is covered in Task 3.
- Panel/dialog and homepage/section expansion is covered in Task 4.
- Reduced-motion and performance guardrails are preserved by continuing to limit changes to lightweight CSS/JS motion hooks.

### Placeholder scan

- No placeholder steps remain.
- Every code step includes concrete snippets.
- Every verification step includes exact commands and expected output.

### Type consistency

- This plan consistently uses `isHeavyMotionPage()`, `is-heavy-motion-page`, `scheduleLoadoutHydration()`, `loadoutHydrationStarted`, `pulsePressState()`, and `data-motion-section`.
- It reuses the existing `data-motion-intro` / `data-motion-part` pattern instead of inventing a competing intro state model.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-06-motion-speed-and-expansion-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
