# Navigation Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a unified navigation, page-transition, and intro-entry motion system that feels smoother overall while giving key navigation interactions a sharper game-like response.

**Architecture:** Keep the implementation lightweight by extending the existing `styles.css` and `app.js` flow instead of adding a new animation framework. Use CSS for motion tokens and stateful transitions, then use small JS hooks to add and clear navigation and intro classes at the right times.

**Tech Stack:** Static HTML, plain CSS, vanilla JavaScript, Node.js built-in scripts, Git

---

## File Structure

### Existing files to modify

- `C:/Users/35191/Documents/git1/package.json`
  - Add a dedicated motion regression script entry so the work has a repeatable check.
- `C:/Users/35191/Documents/git1/styles.css:1-120, 4023-4035`
  - Add motion tokens, richer nav states, page-transition states, intro stagger states, and reduced-motion fallbacks.
- `C:/Users/35191/Documents/git1/app.js:3049-3065, 3291-3295, 3636-3672, 4078-4109, 6103-6132, 6720-6800`
  - Mark intro sections, add navigation press state handling, rework `navigateSmoothly()`, and trigger page-enter classes after render.

### New files to create

- `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`
  - A zero-dependency regression check that asserts the required motion hooks, CSS selectors, and reduced-motion handling exist.

---

### Task 1: Add a regression check for motion hooks

**Files:**
- Create: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`
- Modify: `C:/Users/35191/Documents/git1/package.json`

- [ ] **Step 1: Write the failing regression check**

```js
// C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const [stylesCss, appJs] = await Promise.all([
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../app.js", import.meta.url), "utf8")
]);

assert.match(stylesCss, /--motion-fast:\s*140ms/, "styles.css should define --motion-fast");
assert.match(stylesCss, /\.top-nav a::after/, "styles.css should define nav energy-line pseudo-element");
assert.match(stylesCss, /html\.is-navigating main/, "styles.css should keep page exit state");
assert.match(stylesCss, /\[data-motion-intro\]/, "styles.css should define intro motion selectors");
assert.match(stylesCss, /prefers-reduced-motion:\s*reduce/, "styles.css should include reduced-motion handling");

assert.match(appJs, /function navigateSmoothly\(href\)/, "app.js should still own navigation flow");
assert.match(appJs, /data-motion-intro/, "app.js should emit intro motion hooks");
assert.match(appJs, /is-page-entering/, "app.js should apply page-entry state classes");
assert.match(appJs, /is-pressing/, "app.js should manage nav press state");

console.log("navigation motion checks passed");
```

- [ ] **Step 2: Run the script to verify it fails before implementation**

Run:

```powershell
node scripts/check-navigation-motion.mjs
```

Expected: FAIL with missing `--motion-fast`, `.top-nav a::after`, `data-motion-intro`, or similar assertions.

- [ ] **Step 3: Register the check in package scripts**

```json
{
  "scripts": {
    "start": "node scripts/serve.mjs",
    "reset:accounts": "node scripts/reset-account-data.mjs",
    "recommend:test": "node --input-type=module -e \"import('./server/recommendation-engine.mjs').then(async (m) => { const result = await m.generateLoadoutCandidates(process.cwd(), { budget: 20000, color: 'white', style: 'white clean' }); console.log(JSON.stringify(result.loadouts[0], null, 2)); })\"",
    "colors:classify": "py scripts/classify-skin-colors.py",
    "test:navigation-motion": "node scripts/check-navigation-motion.mjs"
  }
}
```

- [ ] **Step 4: Run the package script and confirm it still fails for the right reason**

Run:

```powershell
npm run test:navigation-motion
```

Expected: FAIL and print the first missing motion hook assertion.

- [ ] **Step 5: Commit the test scaffolding**

```powershell
git add package.json scripts/check-navigation-motion.mjs
git commit -m "test: add navigation motion regression check"
```

### Task 2: Implement the navigation motion foundation in CSS

**Files:**
- Modify: `C:/Users/35191/Documents/git1/styles.css:1-120`
- Test: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Expand the failing check with exact selectors needed for nav motion**

```js
assert.match(stylesCss, /\.top-nav a::after\s*\{/, "styles.css should define a nav underline pseudo-element");
assert.match(stylesCss, /\.top-nav a:hover::after/, "styles.css should animate the nav underline on hover");
assert.match(stylesCss, /\.top-nav a\.is-active::after|\.top-nav \.active::after/, "styles.css should keep the underline visible for the active nav item");
assert.match(stylesCss, /\.top-nav a\.is-pressing|\.top-nav a:active/, "styles.css should define a pressed nav state");
```

- [ ] **Step 2: Run the check to confirm these new expectations fail before editing CSS**

Run:

```powershell
npm run test:navigation-motion
```

Expected: FAIL because the nav underline and press selectors do not exist yet.

- [ ] **Step 3: Add motion tokens and nav state styles in `styles.css`**

```css
:root {
  --motion-fast: 140ms;
  --motion-base: 220ms;
  --motion-slow: 360ms;
  --motion-distance-xs: 4px;
  --motion-distance-sm: 8px;
  --motion-distance-md: 18px;
  --motion-ease-ui: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-ease-exit: cubic-bezier(0.4, 0, 1, 1);
}

.top-nav a {
  position: relative;
  color: var(--muted);
  padding: 10px 14px;
  border-radius: 6px;
  transform: translateY(0);
  transition:
    color var(--motion-base) var(--motion-ease-ui),
    background-color var(--motion-base) var(--motion-ease-ui),
    transform var(--motion-fast) var(--motion-ease-ui),
    box-shadow var(--motion-base) var(--motion-ease-ui);
}

.top-nav a::after {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 6px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(210, 173, 98, 0.3), rgba(210, 173, 98, 0.95), rgba(210, 173, 98, 0.3));
  opacity: 0;
  transform: scaleX(0.35);
  transform-origin: center;
  transition:
    opacity var(--motion-fast) var(--motion-ease-ui),
    transform var(--motion-base) var(--motion-ease-emphasis);
}

.top-nav a:hover,
.top-nav a.is-active,
.top-nav .active {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.top-nav a:hover::after,
.top-nav a.is-active::after,
.top-nav .active::after {
  opacity: 1;
  transform: scaleX(1);
}

.top-nav a.is-pressing {
  transform: translateY(1px) scale(0.985);
}
```

- [ ] **Step 4: Add reduced-motion-safe nav fallback**

```css
@media (prefers-reduced-motion: reduce) {
  .top-nav a,
  .top-nav a::after {
    transition: none;
  }

  .top-nav a,
  .top-nav a:hover,
  .top-nav a.is-active,
  .top-nav a.is-pressing,
  .top-nav .active {
    transform: none;
  }
}
```

- [ ] **Step 5: Run the regression check to confirm CSS motion hooks now pass**

Run:

```powershell
npm run test:navigation-motion
```

Expected: still FAIL, but only on the app-side assertions such as `data-motion-intro`, `is-page-entering`, or `is-pressing` management.

- [ ] **Step 6: Commit the CSS foundation**

```powershell
git add styles.css scripts/check-navigation-motion.mjs
git commit -m "feat: add navigation motion foundation"
```

### Task 3: Rework navigation state handling and page transitions in `app.js`

**Files:**
- Modify: `C:/Users/35191/Documents/git1/app.js:6103-6132, 6132-6205, 6720-6800`
- Test: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Extend the check so it requires app-side helpers for press and page-entry state**

```js
assert.match(appJs, /function applyPageMotionState\(\)/, "app.js should define applyPageMotionState()");
assert.match(appJs, /function markActiveNavigation\(\)/, "app.js should define markActiveNavigation()");
assert.match(appJs, /classList\.add\("is-page-entering"\)/, "app.js should add is-page-entering during render");
assert.match(appJs, /classList\.add\("is-pressing"\)/, "app.js should mark the clicked nav item as pressing");
```

- [ ] **Step 2: Run the check and verify these app hooks are still missing**

Run:

```powershell
npm run test:navigation-motion
```

Expected: FAIL because none of the new helpers or page-entry classes exist yet.

- [ ] **Step 3: Add page-motion helpers and improve `navigateSmoothly()`**

```js
function markActiveNavigation() {
  const current = pageName();
  document.querySelectorAll(".top-nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("?")[0];
    const isActive =
      (current === "index.html" && href === "index.html") ||
      (current !== "index.html" && href === current);
    link.classList.toggle("is-active", isActive);
  });
}

function applyPageMotionState() {
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
  location.assign(target);
}
```

- [ ] **Step 4: Pass the clicked nav element into `navigateSmoothly()` and clear transient state on boot**

```js
if (plainLink && plainLink.origin === location.origin && !plainLink.hasAttribute("download")) {
  event.preventDefault();
  navigateSmoothly(plainLink.getAttribute("href") || plainLink.href, plainLink);
  return;
}
```

```js
function resetTransientUiState() {
  appState.openingPickerOpen = false;
  document.documentElement.classList.remove("is-navigating");
  document.body.classList.remove("is-page-entering");
  document.body.classList.remove("is-page-entered");
  document.querySelectorAll(".top-nav a.is-pressing").forEach((link) => link.classList.remove("is-pressing"));
  // existing picker cleanup remains here
}
```

- [ ] **Step 5: Call nav + page-motion helpers after each render entry point**

```js
function renderCurrentPage() {
  updateInspectorNavLink();
  markActiveNavigation();
  // existing page switch logic
  applyPageMotionState();
}
```

- [ ] **Step 6: Run the regression check to confirm app-side navigation hooks pass**

Run:

```powershell
npm run test:navigation-motion
```

Expected: still FAIL only on intro-motion hook assertions, or PASS if those hooks already exist.

- [ ] **Step 7: Commit the navigation runtime changes**

```powershell
git add app.js scripts/check-navigation-motion.mjs
git commit -m "feat: add page transition motion states"
```

### Task 4: Add intro motion hooks, styles, and end-to-end verification

**Files:**
- Modify: `C:/Users/35191/Documents/git1/app.js:3049-3065, 3291-3295, 3636-3672, 4078-4109, 5611-5752`
- Modify: `C:/Users/35191/Documents/git1/styles.css:114-180, 390-420, 660-690, 4023-4035`
- Test: `C:/Users/35191/Documents/git1/scripts/check-navigation-motion.mjs`

- [ ] **Step 1: Tighten the regression check to require intro-part attributes**

```js
assert.match(appJs, /data-motion-intro/, "app.js should mark intro containers");
assert.match(appJs, /data-motion-part="eyebrow"/, "app.js should label eyebrow motion parts");
assert.match(appJs, /data-motion-part="title"/, "app.js should label title motion parts");
assert.match(appJs, /data-motion-part="copy"/, "app.js should label copy motion parts");
assert.match(appJs, /data-motion-part="actions"/, "app.js should label actions motion parts");
```

- [ ] **Step 2: Run the check and confirm the intro hooks are not present yet**

Run:

```powershell
npm run test:navigation-motion
```

Expected: FAIL on missing `data-motion-part` attributes.

- [ ] **Step 3: Add intro motion attributes to the hero and page-intro markup**

```js
return `
  <section class="hero" data-motion-intro>
    <div class="hero-copy">
      <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Curated Counter-Strike 2 Showcase", "精选 Counter-Strike 2 展示"))}</p>
      <h1 data-motion-part="title">${escapeHtml(uiText("CS2 Skin Atlas", "CS2 饰品图鉴"))}</h1>
      <p data-motion-part="copy">${escapeHtml(uiText("Explore skins, knives, gloves, and stickers by category, collection, rarity, and wear tier, then inspect each item in detail with key traits, collection info, and reference pricing.", "按分类、收藏品、稀有度与磨损档位浏览皮肤、刀具、手套和贴纸，再进入详情查看关键属性、收藏信息与参考价格。"))}</p>
      <div class="hero-actions" data-motion-part="actions">
        ...
      </div>
    </div>
  </section>
`;
```

```js
return `
  <section class="page-intro" data-motion-intro>
    <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Catalog", "目录"))}</p>
    <h1 data-motion-part="title">${escapeHtml(uiText("CS2 Catalog", "CS2 目录"))}</h1>
    <p data-motion-part="copy">${escapeHtml(uiText("Browse the current collection with filters for weapon type, collection, rarity, and price range.", "使用武器类型、收藏品、稀有度和价格范围筛选当前饰品集合。"))}</p>
  </section>
`;
```

- [ ] **Step 4: Add intro stagger styles and page-enter transitions**

```css
main {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--motion-base) var(--motion-ease-ui),
    transform var(--motion-base) var(--motion-ease-ui);
}

html.is-navigating main {
  opacity: 0;
  transform: translateY(var(--motion-distance-sm));
}

[data-motion-intro] [data-motion-part] {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--motion-slow) var(--motion-ease-ui),
    transform var(--motion-slow) var(--motion-ease-emphasis);
}

body.is-page-entering [data-motion-intro] [data-motion-part="eyebrow"] {
  opacity: 0;
  transform: translateY(var(--motion-distance-md));
}

body.is-page-entering [data-motion-intro] [data-motion-part="title"] {
  opacity: 0;
  transform: translateY(12px);
}

body.is-page-entering [data-motion-intro] [data-motion-part="copy"],
body.is-page-entering [data-motion-intro] [data-motion-part="actions"] {
  opacity: 0;
  transform: translateY(var(--motion-distance-sm));
}

body.is-page-entered [data-motion-intro] [data-motion-part="eyebrow"] { transition-delay: 40ms; }
body.is-page-entered [data-motion-intro] [data-motion-part="title"] { transition-delay: 90ms; }
body.is-page-entered [data-motion-intro] [data-motion-part="copy"] { transition-delay: 140ms; }
body.is-page-entered [data-motion-intro] [data-motion-part="actions"] { transition-delay: 180ms; }
```

- [ ] **Step 5: Update reduced-motion handling so intro parts appear immediately**

```css
@media (prefers-reduced-motion: reduce) {
  main,
  [data-motion-intro] [data-motion-part] {
    transition: none;
  }

  html.is-navigating main,
  body.is-page-entering [data-motion-intro] [data-motion-part] {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 6: Run the automated check and then verify the browser flows manually**

Run:

```powershell
npm run test:navigation-motion
```

Expected: PASS with `navigation motion checks passed`.

Manual verification:

```powershell
npm start
```

Expected browser checks:
- Hovering `.top-nav a` shows the gold underline and slight lift
- Clicking nav items briefly applies press feedback before navigation
- `index.html`, `catalog.html`, `collections.html`, and `item.html` all fade/shift `main` consistently
- Hero and `page-intro` content enters in eyebrow → title → copy → actions order
- With reduced motion enabled, content appears without shift-based animation

- [ ] **Step 7: Commit the intro-motion implementation**

```powershell
git add app.js styles.css scripts/check-navigation-motion.mjs package.json
git commit -m "feat: add intro motion choreography"
```

## Self-Review

### Spec coverage

- Navigation default / hover / active / press states are covered in Task 2 and Task 3.
- Page transitions and stable-header behavior are covered in Task 3 and Task 4.
- Intro section stagger and page-level entry hierarchy are covered in Task 4.
- Reduced-motion fallback and performance constraints are covered in Task 2 and Task 4.
- Regression checking and repeatable verification are covered in Task 1 and Task 4.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Each code-changing step includes concrete code blocks.
- Each verification step includes an exact command and expected outcome.

### Type consistency

- The plan consistently uses `markActiveNavigation()`, `applyPageMotionState()`, `is-page-entering`, `is-page-entered`, `is-active`, and `is-pressing`.
- Intro hooks consistently use `data-motion-intro` and `data-motion-part="eyebrow|title|copy|actions"`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-06-navigation-motion-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
