# Related CS News Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hard-coded `related.html` curator notes with a mixed Counter-Strike news feed backed by generated local data.

**Architecture:** Add a deterministic `related-news-data.js` browser global and a Node sync script that can refresh it from conservative CS sources. Keep the static page reliable by rendering local cached data first and falling back to the existing curated notes if generated data is missing or invalid.

**Tech Stack:** Static HTML, vanilla browser JavaScript in `app.js`, Node ESM scripts, Node test runner, existing `styles.css`.

## Global Constraints

- Preserve the existing `related.html` route and shared navigation.
- Do not introduce a live client-side dependency on third-party news sites.
- Use categories `official`, `esports`, and `market`.
- External article links must use `target="_blank" rel="noopener noreferrer"`.
- If `window.RELATED_NEWS` is missing or invalid, render useful fallback content.
- Modify only related-news files and tests unless a verification issue proves another file is required.
- Use browser verification after implementation; use Sites only if the user asks to deploy.

---

## File Structure

- `related-news-data.js`: generated browser data file exposing `window.RELATED_NEWS`.
- `scripts/sync-related-news.mjs`: Node ESM sync script, normalization helpers, classification, dedupe, deterministic writer.
- `related.html`: page shell, loads `related-news-data.js` before `app.js`.
- `app.js`: related-news normalization, card markup, featured article, filters, fallback.
- `styles.css`: related-news-only layout and card styles.
- `scripts/related-news-page.test.mjs`: static wiring and behavior-regression assertions.
- `scripts/related-news-sync.test.mjs`: pure helper tests for sync normalization, classification, dedupe, and data-file serialization.

---

### Task 1: News Data And Sync Script

**Files:**
- Create: `C:\Users\35191\Documents\git1\related-news-data.js`
- Create: `C:\Users\35191\Documents\git1\scripts\sync-related-news.mjs`
- Create: `C:\Users\35191\Documents\git1\scripts\related-news-sync.test.mjs`

**Interfaces:**
- Produces browser global: `window.RELATED_NEWS: Array<RelatedNewsItem>`
- Produces exported helpers from `scripts/sync-related-news.mjs`:
  - `normalizeNewsItem(raw, sourceConfig): RelatedNewsItem | null`
  - `classifyNewsItem(item): "official" | "esports" | "market"`
  - `dedupeNewsItems(items): RelatedNewsItem[]`
  - `serializeNewsData(items): string`
- Consumes no app runtime code.

- [ ] **Step 1: Write failing sync helper tests**

Create `scripts/related-news-sync.test.mjs` with:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyNewsItem,
  dedupeNewsItems,
  normalizeNewsItem,
  serializeNewsData
} from "./sync-related-news.mjs";

test("normalizes valid raw news item into stable related news shape", () => {
  const item = normalizeNewsItem({
    title: "Counter-Strike 2 Update",
    url: "/news/updates",
    publishedAt: "2026-06-30",
    summary: "Added sticker price visibility and Storage Unit improvements."
  }, {
    source: "Counter-Strike",
    baseUrl: "https://www.counter-strike.net",
    category: "official"
  });

  assert.deepEqual(item, {
    id: "counter-strike-2026-06-30-counter-strike-2-update",
    category: "market",
    source: "Counter-Strike",
    title: "Counter-Strike 2 Update",
    summary: "Added sticker price visibility and Storage Unit improvements.",
    url: "https://www.counter-strike.net/news/updates",
    publishedAt: "2026-06-30",
    image: "",
    tags: ["Update", "Inventory", "Stickers"]
  });
});

test("classifies esports and market items by source category and keywords", () => {
  assert.equal(classifyNewsItem({
    category: "esports",
    title: "NAVI win grand final",
    summary: "A tournament result.",
    source: "HLTV"
  }), "esports");

  assert.equal(classifyNewsItem({
    category: "official",
    title: "Sticker capsule market update",
    summary: "New sticker capsule and price display changes.",
    source: "Counter-Strike"
  }), "market");
});

test("dedupes by canonical url before normalized title", () => {
  const items = [
    { id: "a", url: "https://example.com/a?utm_source=x", title: "Same Title", publishedAt: "2026-07-01" },
    { id: "b", url: "https://example.com/a", title: "Different Title", publishedAt: "2026-07-02" },
    { id: "c", url: "https://example.com/c", title: "Same Title", publishedAt: "2026-07-03" }
  ];

  assert.deepEqual(dedupeNewsItems(items).map((item) => item.id), ["a"]);
});

test("serializes deterministic browser data file", () => {
  const serialized = serializeNewsData([{
    id: "sample",
    category: "official",
    source: "Counter-Strike",
    title: "Sample",
    summary: "Summary",
    url: "https://example.com/sample",
    publishedAt: "2026-07-01",
    image: "",
    tags: ["Update"]
  }]);

  assert.match(serialized, /^window\.RELATED_NEWS = /);
  assert.match(serialized, /"id": "sample"/);
  assert.match(serialized, /;\n$/);
});
```

- [ ] **Step 2: Run sync tests and verify they fail**

Run:

```powershell
node scripts/related-news-sync.test.mjs
```

Expected: FAIL because `scripts/sync-related-news.mjs` does not exist.

- [ ] **Step 3: Implement sync script helpers and writer**

Create `scripts/sync-related-news.mjs` with pure helper exports, conservative source configuration, soft-fail source fetching, deterministic sorting, and a CLI entrypoint that writes `related-news-data.js`.

Key implementation requirements:

```js
export function normalizeNewsItem(raw, sourceConfig) { /* validate, absolute URL, classify, id, tags */ }
export function classifyNewsItem(item) { /* keyword and source category rules */ }
export function dedupeNewsItems(items) { /* URL then normalized title */ }
export function serializeNewsData(items) { /* window.RELATED_NEWS = JSON */ }
```

The CLI should call `syncRelatedNews({ cwd: process.cwd() })` only when:

```js
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await syncRelatedNews({ cwd: process.cwd() });
}
```

- [ ] **Step 4: Add initial generated data**

Create `related-news-data.js` with a small seed of valid items using known stable official/community source URLs. Include at least one item in each category so the page and filters are useful before the first sync run.

The file must begin with:

```js
window.RELATED_NEWS = [
```

- [ ] **Step 5: Run sync helper tests**

Run:

```powershell
node scripts/related-news-sync.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run sync script once**

Run:

```powershell
node scripts/sync-related-news.mjs
```

Expected: command exits 0 and leaves `related-news-data.js` as valid JavaScript exposing `window.RELATED_NEWS`.

---

### Task 2: Related Page Data Wiring And Markup

**Files:**
- Modify: `C:\Users\35191\Documents\git1\related.html`
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Modify: `C:\Users\35191\Documents\git1\scripts\related-news-page.test.mjs`

**Interfaces:**
- Consumes: `window.RELATED_NEWS`
- Produces:
  - `relatedNewsItems(): Array<RelatedNewsViewItem>`
  - `relatedNewsCategoryLabel(category): string`
  - `relatedNewsCardMarkup(entry, index): string`
  - `renderRelatedNews(): void`

- [ ] **Step 1: Write failing page wiring tests**

Update `scripts/related-news-page.test.mjs` to assert:

```js
assert.match(relatedHtml, /related-news-data\.js/);
assert.match(app, /window\.RELATED_NEWS/);
assert.match(app, /relatedNewsCategoryLabel/);
assert.match(app, /data-related-news-filter/);
assert.match(app, /target="_blank" rel="noopener noreferrer"/);
assert.match(app, /Open original article/);
assert.match(app, /查看原文/);
```

- [ ] **Step 2: Run page test and verify it fails**

Run:

```powershell
node scripts/related-news-page.test.mjs
```

Expected: FAIL because the data file is not loaded and the renderer still uses item-linked cards.

- [ ] **Step 3: Load generated data before app runtime**

In `related.html`, add this script before `language-runtime.js` and `app.js`:

```html
  <script src="related-news-data.js?v=20260710news"></script>
```

- [ ] **Step 4: Replace related news rendering functions**

In `app.js`, replace the current `relatedNewsItems()`, `relatedNewsCardMarkup()`, and `renderRelatedNews()` block with news-aware functions that:

- Read `window.RELATED_NEWS`.
- Validate required fields.
- Sort valid items by date descending.
- Select featured item from `official` or `market`, falling back to newest item.
- Render filter buttons with `data-related-news-filter`.
- Render external article links with `target="_blank" rel="noopener noreferrer"`.
- Preserve the existing fallback notes when generated data is missing.

- [ ] **Step 5: Add filter event delegation**

In the existing app event setup area, add a click handler for `[data-related-news-filter]` buttons that:

```js
const filter = button.dataset.relatedNewsFilter || "all";
document.querySelectorAll("[data-related-news-filter]").forEach((entry) => {
  entry.classList.toggle("is-active", entry === button);
  entry.setAttribute("aria-pressed", entry === button ? "true" : "false");
});
document.querySelectorAll("[data-related-news-card]").forEach((card) => {
  const visible = filter === "all" || card.dataset.relatedNewsCard === filter;
  card.hidden = !visible;
});
```

- [ ] **Step 6: Run page test**

Run:

```powershell
node scripts/related-news-page.test.mjs
```

Expected: PASS.

---

### Task 3: Related News Styling

**Files:**
- Modify: `C:\Users\35191\Documents\git1\styles.css`
- Test: `C:\Users\35191\Documents\git1\scripts\related-news-page.test.mjs`

**Interfaces:**
- Consumes markup classes from Task 2:
  - `.related-news-featured`
  - `.related-news-filter-bar`
  - `.related-news-meta`
  - `.related-news-tags`
  - `[data-related-news-card]`

- [ ] **Step 1: Write failing style assertions**

Update `scripts/related-news-page.test.mjs` to assert:

```js
assert.match(styles, /\.related-news-featured/);
assert.match(styles, /\.related-news-filter-bar/);
assert.match(styles, /\.related-news-meta/);
assert.match(styles, /\.related-news-tags/);
```

- [ ] **Step 2: Run page test and verify style assertions fail**

Run:

```powershell
node scripts/related-news-page.test.mjs
```

Expected: FAIL until the new selectors exist.

- [ ] **Step 3: Add related-news-only CSS**

Update the existing related news CSS block in `styles.css` to support:

- Compact masthead.
- Wide featured article panel.
- Responsive filter rail.
- Text-first article cards.
- Tags and source/date metadata.
- Mobile single-column layout.

Do not change unrelated global card, item, loadout, opening, account, or inventory selectors.

- [ ] **Step 4: Run page test**

Run:

```powershell
node scripts/related-news-page.test.mjs
```

Expected: PASS.

---

### Task 4: Verification, Browser QA, And Commit

**Files:**
- Verify: `C:\Users\35191\Documents\git1\related.html`
- Verify: `C:\Users\35191\Documents\git1\related-news-data.js`
- Verify: `C:\Users\35191\Documents\git1\app.js`
- Verify: `C:\Users\35191\Documents\git1\styles.css`
- Verify: `C:\Users\35191\Documents\git1\scripts\related-news-page.test.mjs`
- Verify: `C:\Users\35191\Documents\git1\scripts\related-news-sync.test.mjs`

**Interfaces:**
- Consumes all deliverables from Tasks 1-3.
- Produces a verified local implementation ready for optional Sites deployment.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
node scripts/related-news-sync.test.mjs
node scripts/related-news-page.test.mjs
```

Expected: both PASS.

- [ ] **Step 2: Start local server**

Run:

```powershell
npm run start
```

Expected: local server starts and prints a URL, usually `http://127.0.0.1:5173/` or similar.

- [ ] **Step 3: Browser verify desktop**

Open `related.html` in the in-app browser and verify:

- The page title is visible.
- Featured article is visible.
- Official, esports, and market filter buttons are visible.
- Cards show source, date, title, summary, and external article link.

- [ ] **Step 4: Browser verify filtering**

Click each filter:

- `All`
- `Official`
- `Esports`
- `Market`

Expected: cards hide/show without navigation and active button state changes.

- [ ] **Step 5: Browser verify mobile**

Resize or emulate a narrow viewport and verify:

- No horizontal overflow.
- Filter buttons wrap cleanly.
- Article titles and links remain readable.

- [ ] **Step 6: Inspect git diff**

Run:

```powershell
git diff -- related-news-data.js related.html app.js styles.css scripts/related-news-page.test.mjs scripts/related-news-sync.test.mjs scripts/sync-related-news.mjs
```

Expected: diff contains only related-news implementation.

- [ ] **Step 7: Commit implementation**

Run:

```powershell
git add related-news-data.js related.html app.js styles.css scripts/related-news-page.test.mjs scripts/related-news-sync.test.mjs scripts/sync-related-news.mjs
git commit -m "feat: add related cs news feed"
```

Expected: commit succeeds.

---

## Self-Review Notes

- Spec coverage: data file, sync script, frontend fallback, categories, external links, visual direction, tests, browser verification, and optional Sites handoff are all mapped to tasks.
- Scope control: tasks only touch related-news page files, generated news data, sync script, and focused tests.
- Type consistency: `window.RELATED_NEWS`, `RelatedNewsItem`, `category`, `publishedAt`, and helper names are consistent across tasks.
