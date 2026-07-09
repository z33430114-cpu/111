# CS Exhibition Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing CS skin frontend into the `CS EXHIBITION` digital exhibition experience while preserving all current routes, data flows, APIs, storage keys, sync flows, and user actions.

**Architecture:** Keep the current multi-page static frontend and `app.js` render-function architecture. Apply the redesign through `styles.css`, route shell navigation labels, `language-runtime.js` navigation/title text, and presentation-only markup inside existing render functions. Do not introduce a frontend framework or alter backend contracts.

**Tech Stack:** Plain HTML, CSS, vanilla JavaScript, existing `app.js`, existing `language-runtime.js`, existing Node scripts in `package.json`, in-app browser visual verification.

## Global Constraints

- The redesign changes visual language, page structure, interaction presentation, and content framing only.
- It must not remove, weaken, or replace the current backend, APIs, data sources, cache behavior, account flows, language runtime, pricing flows, inventory sync, AI recommendations, or unboxing simulation.
- The target experience is not a marketing landing page.
- Use a mostly black palette: `#020202`, `#050505`, `#080808`, `#0e0f11`, `#121316`, `#f5f5f2`, `#a3a3a0`, `#6e6e6b`, and sparse red `#d71920`.
- Remove the current gold/copper-dominant mood from primary navigation and hero surfaces. Gold may survive only where existing rarity or data semantics require it.
- Panel radius should stay between `4px` and `8px`.
- Do not scale font size with viewport width directly. Use `clamp()` with fixed rem/px bounds where needed.
- Do not change API paths, storage keys, catalog data schema, price source priority rules, account/session model, Steam inventory sync logic, BUFF/YouPin endpoints, AI recommendation inputs/outputs, or opening probability/ROI calculations.
- Language switching must remain globally reachable and must work for every language currently listed in `LANGUAGE_LABELS`.
- Mobile navigation must not cover or squeeze filter controls.
- `prefers-reduced-motion` must keep all content visible and usable.

---

## File Structure

- Modify `styles.css`: global tokens, black exhibition background, navigation, mobile menu overlay, page shells, cards, controls, pickers, platform price plates, account/inventory/loadout panels, responsive rules, reduced-motion rules.
- Modify route HTML shells: `index.html`, `catalog.html`, `collections.html`, `item.html`, `favorites.html`, `recent.html`, `openings.html`, `account.html`, `inventory.html`, `loadout.html`.
  - Responsibility: keep existing script loading and route roots, update the shared header markup with a mobile menu button and exhibition navigation labels.
- Modify `language-runtime.js`.
  - Responsibility: update brand, nav labels, page titles, and runtime mobile-menu label sync for all supported languages.
- Modify `app.js`.
  - Responsibility: presentation-only markup updates in existing render helpers and event binding for the mobile navigation button. Preserve all existing `id`, `data-*`, form, and button contracts used by current event handlers.
- Do not modify `server/`, `catalog-data.js`, `catalog-meta.js`, `data.js`, account persistence scripts, or recommendation engine files.

---

## Task 1: Exhibition Shell, Tokens, Navigation, And Language Runtime

**Files:**
- Modify: `styles.css`
- Modify: `index.html`
- Modify: `catalog.html`
- Modify: `collections.html`
- Modify: `item.html`
- Modify: `favorites.html`
- Modify: `recent.html`
- Modify: `openings.html`
- Modify: `account.html`
- Modify: `inventory.html`
- Modify: `loadout.html`
- Modify: `language-runtime.js`
- Modify: `app.js`

**Interfaces:**
- Consumes: existing `.site-header`, `.brand`, `.top-nav`, `.lang-switch`, `markActiveNavigation()`, `bindEvents()`, `applyNav()`, `PAGE_TITLE_KEYS`, `NAV_TRANSLATIONS`.
- Produces: `.menu-toggle`, `.nav-scrim`, `body.nav-open`, exhibition nav labels, responsive mobile overlay. Later tasks rely on the new tokens and header behavior.

- [ ] **Step 1: Add the mobile menu controls to every route shell**

In each HTML shell, keep the existing `<header class="site-header">`, existing links, existing route roots, and existing script tags. Insert the button after the language select and insert the scrim immediately after the header:

```html
    <select class="secondary-action lang-switch" aria-label="Language"></select>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primaryNav">MENU +</button>
  </header>
  <button class="nav-scrim" type="button" aria-label="Close menu" hidden></button>
```

Add `id="primaryNav"` to the existing nav in each shell:

```html
    <nav class="top-nav" id="primaryNav" aria-label="">
```

Do not rename link `data-nav-key` values. Keep `Unbox` as the key for `openings.html` so existing runtime mapping keeps working.

- [ ] **Step 2: Replace the top-level CSS tokens and body/header baseline**

In `styles.css`, replace the current `:root`, `body`, `.site-header`, `.brand`, `.top-nav`, `.lang-switch`, `.top-nav a`, and related nav pseudo-state blocks near the top of the file with:

```css
:root {
  --bg: #020202;
  --bg-2: #050505;
  --panel: #0e0f11;
  --panel-2: #121316;
  --panel-glass: rgba(12, 13, 15, 0.82);
  --panel-glass-strong: rgba(5, 5, 5, 0.94);
  --line: rgba(255, 255, 255, 0.1);
  --line-strong: rgba(255, 255, 255, 0.18);
  --text: #f5f5f2;
  --muted: #a3a3a0;
  --muted-2: #6e6e6b;
  --red: #d71920;
  --red-soft: rgba(215, 25, 32, 0.42);
  --green: #6ba47c;
  --blue: #7b8fa8;
  --gold: #c8a95d;
  --copper: #8f6f55;
  --shadow: 0 24px 80px rgba(0, 0, 0, 0.62);
  --motion-fast: 100ms;
  --motion-base: 170ms;
  --motion-slow: 360ms;
  --motion-distance-xs: 4px;
  --motion-distance-sm: 8px;
  --motion-distance-md: 18px;
  --motion-ease-ui: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-ease-exit: cubic-bezier(0.4, 0, 1, 1);
  font-family: Bahnschrift, "Segoe UI Variable Text", "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
}

body {
  margin: 0;
  color: var(--text);
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.018), transparent 220px),
    radial-gradient(circle at 78% 18%, rgba(215, 25, 32, 0.1), transparent 24%),
    linear-gradient(135deg, #020202 0%, #050505 52%, #090909 100%);
  background-attachment: scroll;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 18px;
  min-height: 72px;
  padding: 0 42px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(2, 2, 2, 0.88);
  backdrop-filter: blur(22px);
  box-shadow: 0 14px 46px rgba(0, 0, 0, 0.42);
}

.brand {
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.top-nav {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.top-nav a {
  position: relative;
  color: var(--muted);
  padding: 10px 11px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  transform: translateY(0);
  transition:
    color var(--motion-base) var(--motion-ease-ui),
    background-color var(--motion-base) var(--motion-ease-ui),
    transform var(--motion-fast) var(--motion-ease-ui),
    border-color var(--motion-base) var(--motion-ease-ui);
}

.top-nav a::after {
  content: "";
  position: absolute;
  left: 11px;
  right: 11px;
  bottom: 5px;
  height: 1px;
  background: var(--red);
  opacity: 0;
  transform: scaleX(0.24);
  transform-origin: center;
  transition:
    opacity var(--motion-fast) var(--motion-ease-ui),
    transform var(--motion-base) var(--motion-ease-emphasis);
}

.top-nav a:hover,
.top-nav a.is-active,
.top-nav .active {
  color: var(--text);
  background: rgba(255, 255, 255, 0.045);
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

.lang-switch {
  min-width: 118px;
  height: 38px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.035);
  color: #f7f7f4;
  color-scheme: dark;
  appearance: none;
  cursor: pointer;
}

.lang-switch option {
  color: #f7f7f4;
  background: #0b0b0b;
}

.menu-toggle,
.nav-scrim {
  display: none;
}
```

- [ ] **Step 3: Add mobile navigation CSS**

Append this responsive block after the existing mobile header styles or near the header rules:

```css
@media (max-width: 920px) {
  .site-header {
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 10px;
    min-height: 64px;
    padding: 0 18px;
  }

  .top-nav {
    position: fixed;
    inset: 64px 0 auto 0;
    z-index: 45;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    padding: 18px;
    border-bottom: 1px solid var(--line);
    background: rgba(2, 2, 2, 0.98);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-8px);
    transition:
      opacity var(--motion-base) var(--motion-ease-ui),
      transform var(--motion-base) var(--motion-ease-ui);
  }

  body.nav-open .top-nav {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .top-nav a {
    min-height: 44px;
    padding: 13px 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 0;
  }

  .lang-switch {
    min-width: 96px;
    max-width: 34vw;
  }

  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.035);
    color: var(--text);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0;
    cursor: pointer;
  }

  .nav-scrim {
    position: fixed;
    inset: 64px 0 0;
    z-index: 35;
    display: block;
    border: 0;
    background: rgba(0, 0, 0, 0.72);
  }

  .nav-scrim[hidden] {
    display: none;
  }
}
```

- [ ] **Step 4: Update `language-runtime.js` nav labels and page titles**

Change `PAGE_TITLE_KEYS` values to:

```js
  const PAGE_TITLE_KEYS = {
    "index.html": "CS Exhibition",
    "catalog.html": "Archive",
    "collections.html": "Halls",
    "item.html": "Inspect",
    "favorites.html": "Saved",
    "recent.html": "Trail",
    "account.html": "Pass",
    "inventory.html": "Vault",
    "loadout.html": "Curator",
    "openings.html": "Drop Theatre"
  };
```

Update every language object in `NAV_TRANSLATIONS` so it contains every key used by the HTML nav:

```js
      brand: "CS EXHIBITION",
      Catalog: "Archive",
      Collections: "Halls",
      Inspector: "Inspect",
      Favorites: "Saved",
      Recent: "Trail",
      Account: "Pass",
      Unbox: "Drop Theatre",
      Inventory: "Vault",
      Loadout: "Curator"
```

For non-English packs, keep `brand: "CS EXHIBITION"` and use localized values when already known. If a pack currently lacks `Unbox` or `Loadout`, add both keys. This keeps all route links populated.

- [ ] **Step 5: Add mobile menu event handling without disturbing existing click routing**

In `app.js`, inside `bindEvents()` before the generic plain-link navigation block, add:

```js
      const menuToggle = target.closest(".menu-toggle");
      if (menuToggle instanceof HTMLButtonElement) {
        const isOpen = document.body.classList.toggle("nav-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        const scrim = document.querySelector(".nav-scrim");
        if (scrim instanceof HTMLElement) scrim.hidden = !isOpen;
        return;
      }

      if (target.closest(".nav-scrim")) {
        document.body.classList.remove("nav-open");
        const menuButton = document.querySelector(".menu-toggle");
        if (menuButton instanceof HTMLButtonElement) menuButton.setAttribute("aria-expanded", "false");
        const scrim = document.querySelector(".nav-scrim");
        if (scrim instanceof HTMLElement) scrim.hidden = true;
        return;
      }
```

In `navigateSmoothly(href, trigger)`, before `document.documentElement.classList.add("is-navigating");`, add:

```js
    document.body.classList.remove("nav-open");
    const menuButton = document.querySelector(".menu-toggle");
    if (menuButton instanceof HTMLButtonElement) menuButton.setAttribute("aria-expanded", "false");
    const scrim = document.querySelector(".nav-scrim");
    if (scrim instanceof HTMLElement) scrim.hidden = true;
```

- [ ] **Step 6: Run checks**

Run:

```powershell
npm run test:navigation-motion
```

Expected: command exits `0`. If it fails because selectors changed, inspect the failure and adjust only selectors or class expectations. Do not remove the test.

Run:

```powershell
rg -n "data-nav-key=\"(Catalog|Collections|Inspector|Favorites|Recent|Unbox|Account|Inventory|Loadout)\"" *.html
```

Expected: every route shell still exposes the expected nav keys.

- [ ] **Step 7: Commit**

```powershell
git add styles.css index.html catalog.html collections.html item.html favorites.html recent.html openings.html account.html inventory.html loadout.html language-runtime.js app.js
git commit -m "feat: add CS Exhibition shell"
```

---

## Task 2: Home Page Exhibition Entry

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `renderHome()`, `buildHomeMarkup()`, `items`, `cardMarkup()`, existing route URLs.
- Produces: `.hero.exhibition-hero`, `.exhibition-hero-media`, `.exhibition-entry-grid`, `.exhibition-status-strip`. Later tasks reuse page-intro and card styling.

- [ ] **Step 1: Locate the existing home markup helper**

Run:

```powershell
rg -n "function buildHomeMarkup|function renderHome|class=\"hero" app.js
```

Expected: output includes `function renderHome()` and the helper that returns the current home markup.

- [ ] **Step 2: Replace only the returned home markup**

In the existing home helper, keep its function name and callers unchanged. Replace the returned template with this structure, adapting only existing local item variables if the helper already defines featured items:

```js
    const heroItem = items.find((entry) => entry.image) || items[0] || null;
    const heroImage = heroItem?.image || "";
    const featured = items.filter((entry) => entry.image).slice(0, 4);
    return `
      <section class="hero exhibition-hero" data-motion-intro>
        <div class="hero-copy">
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Counter-Strike Digital Exhibition", "Counter-Strike 数字展馆"))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("CS Exhibition", "CS Exhibition"))}</h1>
          <p data-motion-part="copy">${escapeHtml(uiText("Enter a black-box archive for CS skins, live market prices, Steam inventory, drop simulation, and AI-curated loadouts.", "进入一座黑色数字展馆，检索 CS 饰品、查看实时价格、同步 Steam 库存、模拟开箱，并让 AI 策展搭配方案。"))}</p>
          <div class="hero-actions" data-motion-part="actions">
            <a class="primary-link" href="catalog.html">${escapeHtml(uiText("Enter Archive", "进入馆藏"))}</a>
            <a class="secondary-link" href="openings.html">${escapeHtml(uiText("Open Drop Theatre", "打开掉落剧场"))}</a>
            <a class="secondary-link" href="loadout.html">${escapeHtml(uiText("Ask Curator", "询问策展室"))}</a>
          </div>
          <div class="exhibition-status-strip" aria-label="${escapeHtml(uiText("Exhibition status", "展馆状态"))}">
            <span>${escapeHtml(uiText("Archive online", "馆藏在线"))}</span>
            <span>${escapeHtml(uiText("Market plates ready", "价格铭牌就绪"))}</span>
            <span>${escapeHtml(uiText("Vault sync available", "藏库可同步"))}</span>
          </div>
        </div>
        <div class="exhibition-hero-media" aria-label="${escapeHtml(heroItem ? itemTitle(heroItem) : uiText("Featured exhibit", "重点展品"))}">
          ${heroImage ? `<img src="${escapeHtml(heroImage)}" alt="${escapeHtml(heroItem ? itemTitle(heroItem) : uiText("Featured exhibit", "重点展品"))}" loading="eager" decoding="async" />` : `<div class="empty-state">${escapeHtml(uiText("Preparing archive image", "正在准备馆藏影像"))}</div>`}
        </div>
      </section>
      <section class="exhibition-entry-grid" aria-label="${escapeHtml(uiText("Exhibition entrances", "展馆入口"))}">
        ${[
          ["Archive", "Search every exhibit", "catalog.html"],
          ["Halls", "Browse collection wings", "collections.html"],
          ["Inspect", "Examine one object", "item.html?id=ak-inheritance"],
          ["Saved", "Open your private case", "favorites.html"],
          ["Trail", "Return to recent exhibits", "recent.html"],
          ["Drop Theatre", "Simulate openings", "openings.html"],
          ["Pass", "Manage access and sync", "account.html"],
          ["Vault", "Review Steam inventory", "inventory.html"],
          ["Curator", "Generate AI loadouts", "loadout.html"]
        ].map(([title, copy, href]) => `
          <a class="entry-panel" href="${href}">
            <span>${escapeHtml(title)}</span>
            <strong>${escapeHtml(copy)}</strong>
          </a>
        `).join("")}
      </section>
      ${featured.length ? `<section class="featured-section">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("Objects in view", "当前展品"))}</p>
          <h2>${escapeHtml(uiText("Selected Exhibits", "精选展品"))}</h2>
        </div>
        <div class="item-grid">${featured.map(cardMarkup).join("")}</div>
      </section>` : ""}
    `;
```

Keep `renderHome()` unchanged except for class names if needed.

- [ ] **Step 3: Add home-specific CSS**

Append:

```css
.exhibition-hero {
  min-height: calc(100vh - 72px);
  grid-template-columns: minmax(280px, 0.72fr) minmax(320px, 1fr);
  align-items: center;
  gap: 5vw;
  padding: 70px 7vw 42px;
}

.exhibition-hero .hero-copy {
  position: relative;
  z-index: 2;
}

.exhibition-hero h1 {
  max-width: 9ch;
  color: #fff;
  text-transform: uppercase;
}

.exhibition-hero-media {
  position: relative;
  min-height: 520px;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.exhibition-hero-media::before {
  content: "";
  position: absolute;
  inset: 8% 2% 12% 14%;
  border-left: 1px solid var(--red-soft);
  background:
    linear-gradient(90deg, rgba(215, 25, 32, 0.18), transparent 18%),
    radial-gradient(circle at 50% 52%, rgba(255, 255, 255, 0.08), transparent 54%);
  opacity: 0.8;
}

.exhibition-hero-media img {
  position: relative;
  width: min(720px, 78vw);
  max-height: 70vh;
  object-fit: contain;
  filter: drop-shadow(0 42px 70px rgba(0, 0, 0, 0.82));
}

.exhibition-status-strip {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
  color: var(--muted-2);
  font-size: 12px;
  text-transform: uppercase;
}

.exhibition-status-strip span {
  padding-left: 14px;
  border-left: 1px solid var(--red-soft);
}

.exhibition-entry-grid {
  display: grid;
  grid-template-columns: repeat(9, minmax(120px, 1fr));
  gap: 1px;
  padding: 0 7vw 58px;
}

.entry-panel {
  min-height: 116px;
  padding: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.025);
  transition:
    border-color var(--motion-base) var(--motion-ease-ui),
    background-color var(--motion-base) var(--motion-ease-ui),
    transform var(--motion-fast) var(--motion-ease-ui);
}

.entry-panel span {
  display: block;
  color: var(--text);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.entry-panel strong {
  display: block;
  margin-top: 18px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
}

.entry-panel:hover {
  border-color: var(--red-soft);
  background: rgba(215, 25, 32, 0.055);
  transform: translateY(-2px);
}

@media (max-width: 1100px) {
  .exhibition-entry-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .exhibition-hero {
    min-height: auto;
    grid-template-columns: 1fr;
    padding: 46px 18px 28px;
  }

  .exhibition-hero-media {
    min-height: 300px;
    order: -1;
  }

  .exhibition-entry-grid {
    grid-template-columns: 1fr;
    padding: 0 18px 36px;
  }
}
```

- [ ] **Step 4: Run home smoke checks**

Run:

```powershell
npm start
```

Expected: server prints a local URL and keeps running.

Open `index.html` in the browser through the local server. Verify:

- `CS Exhibition` appears above the fold.
- `Enter Archive`, `Open Drop Theatre`, and `Ask Curator` navigate.
- The feature grid exposes all nine modules.
- The hero uses a real catalog image when catalog data is available.

- [ ] **Step 5: Commit**

```powershell
git add app.js styles.css
git commit -m "feat: redesign exhibition home"
```

---

## Task 3: Archive, Halls, Inspect, Saved, And Trail Presentation

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `buildCatalogShell()`, `renderCollections()`, `renderItemDetail()`, `renderFavorites()`, `renderRecent()`, `cardMarkup()`, `favoriteCardMarkup()`, existing picker IDs.
- Produces: exhibition copy and layout classes while preserving IDs `searchInput`, `typeFilter`, `rarityFilter`, `collectionFilter`, `priceFilter`, `sortFilter`, `shareCatalogLink`, `itemGrid`, `loadMore`, `compareTray`, `wearSelect`, `variantSelect`, `templateSelect`, `detailBuffPriceValue`, `detailYoupinPriceValue`, `detailReferencePriceValue`, `clearRecentViews`.

- [ ] **Step 1: Update Archive intro and controls copy**

In `buildCatalogShell()`, change only text labels and wrapper class names. Keep every control ID. Use:

```js
      <section class="page-intro archive-intro" data-motion-intro data-motion-title-fast>
        <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Archive", "馆藏"))}</p>
        <h1 data-motion-part="title">${escapeHtml(uiText("Archive", "Archive"))}</h1>
        <p data-motion-part="copy">${escapeHtml(uiText("Search the complete CS exhibit archive by weapon type, collection, rarity, and market range.", "按武器类型、收藏系列、稀有度和市场区间检索完整 CS 展品馆藏。"))}</p>
      </section>
```

Change the main shell class from `catalog-shell` to `catalog-shell exhibition-console`, leaving child classes intact:

```html
      <section class="catalog-shell exhibition-console">
```

Change visible labels:

```js
uiText("Keyword", "关键词")
uiText("Search exhibits or weapons", "搜索展品或武器")
uiText("Weapon Type", "武器类型")
uiText("Rarity", "稀有度")
uiText("Hall / Collection", "展区 / 系列")
uiText("Max Reference Price", "最高参考价")
uiText("Reset Filters", "重置筛选")
uiText("Sort", "排序")
uiText("Copy Link", "复制链接")
```

- [ ] **Step 2: Update Collections to Halls**

In `renderCollections()` and `collectionCardWithPreviewMarkup()`, change the page intro to:

```js
<p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Halls", "展区"))}</p>
<h1 data-motion-part="title">${escapeHtml(uiText("Halls", "Halls"))}</h1>
<p data-motion-part="copy">${escapeHtml(uiText("Browse the exhibition by series, map collections, cases, capsules, and souvenir wings.", "按系列、地图收藏、武器箱、胶囊和纪念品包浏览展区。"))}</p>
```

Change collection card action text from `Open Collection` to:

```js
uiText("View Hall", "查看展区")
```

Keep `href="catalog.html?collection=..."` unchanged.

- [ ] **Step 3: Update Inspect labels without changing price IDs**

In `renderItemDetail()`, change the detail info panel class:

```html
<section class="collection-card detail-info inspect-plate">
```

Insert this heading immediately before the existing `.platform-price-grid`:

```js
          <div class="market-plates-heading">
            <p class="eyebrow">${escapeHtml(uiText("Market Plates", "市场铭牌"))}</p>
            <span>${escapeHtml(uiText("Reference, BUFF, and YouPin prices remain synced through the existing price system.", "参考价、BUFF 与悠悠有品价格继续通过现有价格系统同步。"))}</span>
          </div>
```

Do not rename any of these IDs:

```text
detailPlatformPriceGrid
detailBuffPriceValue
detailBuffPriceHint
detailYoupinPriceValue
detailYoupinPriceHint
detailReferencePriceValue
detailReferencePriceHint
```

- [ ] **Step 4: Update Saved and Trail copy**

In `renderFavorites()`, use:

```js
uiText("Saved", "私人展柜")
uiText("Saved", "Saved")
uiText("Keep saved exhibits, comparison candidates, and DIY sticker schemes in a private display case.", "把收藏展品、对比候选和 DIY 贴纸方案保存在私人展柜。")
```

In `renderRecent()`, use:

```js
uiText("Trail", "观展轨迹")
uiText("Trail", "Trail")
uiText("Your latest inspected exhibits stay here in time order so you can return quickly.", "最近检视过的展品会按时间保留在这里，方便快速返回。")
uiText("Clear Trail", "清空轨迹")
```

Keep `clearRecentViews` unchanged.

- [ ] **Step 5: Add shared console/card CSS**

Append:

```css
.page-intro {
  padding: 76px 7vw 28px;
}

.page-intro h1,
.catalog-toolbar h1 {
  color: #fff;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--red);
  text-transform: uppercase;
}

.exhibition-console,
.catalog-shell {
  border-top: 1px solid var(--line);
}

.filter-panel,
.collection-card,
.account-panel,
.ai-panel,
.platform-price-card,
.compare-tray,
.picker-dialog {
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.032);
  box-shadow: none;
}

.item-card,
.favorite-card,
.collection-card,
.inventory-item,
.unbox-loot-card,
.ai-suggestion-card {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.028);
}

.item-card:hover,
.favorite-card:hover,
.collection-card:hover,
.inventory-item-clickable:hover,
.unbox-loot-card:hover,
.ai-suggestion-card:hover {
  border-color: var(--red-soft);
  background: rgba(215, 25, 32, 0.045);
}

.primary-action,
.primary-link {
  border: 1px solid var(--red);
  background: #140304;
  color: #fff;
  text-transform: uppercase;
}

.secondary-action,
.secondary-link,
.picker-trigger,
.load-more-button {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  text-transform: uppercase;
}

.market-plates-heading {
  display: grid;
  gap: 6px;
  margin: 22px 0 12px;
}

.market-plates-heading span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.platform-price-card[data-platform="buff"],
.platform-price-card[data-platform="youpin"],
.platform-price-card.is-reference {
  border-color: var(--line);
}

.platform-price-card[data-platform="buff"] .platform-price-value,
.platform-price-card[data-platform="youpin"] .platform-price-value {
  color: var(--text);
}

@media (max-width: 760px) {
  .page-intro {
    padding: 44px 18px 22px;
  }

  .catalog-shell {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }
}
```

- [ ] **Step 6: Run functional smoke checks**

Run:

```powershell
node scripts/check-navigation-motion.mjs
```

Expected: exits `0`.

In browser, verify:

- `catalog.html`: search input filters results; type/rarity/collection pickers open; sort select changes order; copy link still works.
- `collections.html`: a hall card still routes to `catalog.html?collection=...`.
- `item.html?id=ak-inheritance`: wear/version/template controls still update price hints and do not lose price plate IDs.
- `favorites.html`: saved items and DIY sticker sections render.
- `recent.html`: `Clear Trail` still clears recent history through the existing button ID.

- [ ] **Step 7: Commit**

```powershell
git add app.js styles.css
git commit -m "feat: redesign archive inspection pages"
```

---

## Task 4: Drop Theatre, Pass, Vault, And Curator Presentation

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `renderOpenings()`, `renderOpeningDetail()`, `renderAccount()`, `renderInventory()`, `renderLoadout()`, existing account and opening event IDs.
- Produces: exhibition copy and panel grouping while preserving IDs and `data-*` used by opening, sync, account, inventory, and AI flows.

- [ ] **Step 1: Update Drop Theatre copy and finance framing**

In `renderOpenings()`, change the page intro labels to:

```js
uiText("Drop Theatre", "掉落剧场")
uiText("Drop Theatre", "Drop Theatre")
uiText("Select a case or capsule, open single or batch drops, inspect the pool, and track ROI from the existing simulator.", "选择箱子或胶囊，进行单开或连开，检视掉落池，并用现有模拟器追踪投入产出。")
```

In `renderOpeningDetail()`, keep all `data-opening-*` attributes unchanged. Change visible section labels:

```js
uiText("Stage", "舞台")
uiText("Drop Pool", "掉落池")
uiText("Opening History", "开箱历史")
uiText("ROI", "投入产出")
uiText("AI Drop Judgment", "AI 箱子判断")
```

- [ ] **Step 2: Update Pass account page copy while preserving forms**

In `renderAccount()`, change page intro:

```js
<p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Pass", "通行证"))}</p>
<h1 data-motion-part="title">${escapeHtml(uiText("Pass", "Pass"))}</h1>
<p data-motion-part="copy">${escapeHtml(uiText("Manage account access, Steam binding, platform credentials, inventory sync, and market price sync.", "管理账号通行、Steam 绑定、平台凭证、库存同步和市场价格同步。"))}</p>
```

Change panel headings:

```js
uiText("Platform Access", "平台访问")
uiText("Market Sync", "市场同步")
uiText("Vault Preview", "藏库预览")
```

Do not rename:

```text
accountLoginForm
accountRegisterForm
accountSteamBindForm
syncSteamButton
accountLogoutButton
startBuffLoginButton
validateBuffLoginButton
disconnectBuffLoginButton
startYoupinLoginButton
validateYoupinLoginButton
disconnectYoupinLoginButton
runSyncButton
```

- [ ] **Step 3: Update Vault inventory page copy**

In `renderInventory()`, change:

```js
<p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Vault", "个人藏库"))}</p>
<h1 data-motion-part="title">${escapeHtml(uiText("Vault", "Vault"))}</h1>
<p data-motion-part="copy">${escapeHtml(uiText("Review synced Steam inventory, total value, item prices, and jump directly into inspection.", "查看已同步的 Steam 库存、总价值、单品价格，并直接跳转检视。"))}</p>
```

Keep `inventoryGalleryRoot`, `loadMoreInventory`, inventory card `data-href`, and `data-inventory-inspect` contracts unchanged.

- [ ] **Step 4: Update Curator loadout page copy**

In `renderLoadout()`, change:

```js
<p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Curator", "AI 策展室"))}</p>
<h1 data-motion-part="title">${escapeHtml(uiText("Curator", "Curator"))}</h1>
<p data-motion-part="copy">${escapeHtml((hasCatalog || hasInventoryPayload || hasProPayload)
  ? uiText("Ask for budget-aware skin pairings, same-color inventory upgrades, and pro-inspired references.", "获取预算内饰品搭配、同色系库存升级和职业选手参考方案。")
  : uiText("The curator console appears first; recommendations and references stream in after catalog data is ready.", "策展控制台会先出现，推荐和参考会在馆藏数据就绪后补入。"))}</p>
```

Keep `aiChatMarkup()`, `aiInventoryRecommendationsMarkup()`, `aiProLoadoutsMarkup()`, and `scheduleLoadoutHydration()` calls unchanged.

- [ ] **Step 5: Add page-specific CSS**

Append:

```css
.opening-finance-panel,
.account-sync-panel,
.account-profile-panel,
.account-access-panel,
.account-inventory-panel,
.inventory-summary,
.ai-inline-panel {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.032);
}

.opening-card.is-active,
.opening-kind-chip.is-active,
.ai-category-switch.is-active,
.pro-player-switch.is-active {
  border-color: var(--red-soft);
  background: rgba(215, 25, 32, 0.06);
  color: var(--text);
}

.opening-quality.is-gold {
  color: var(--gold);
}

.opening-finance-profit.is-positive {
  color: var(--green);
}

.opening-finance-profit.is-negative,
.auth-feedback.is-error {
  color: #ef777c;
}

.account-meta div,
.opening-finance-grid div,
.inventory-tags span,
.inventory-stickers span,
.inventory-actions a {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.028);
}

#loadoutRoot .page-intro::before {
  background: linear-gradient(90deg, var(--red-soft), transparent);
}

@media (max-width: 760px) {
  .account-layout,
  .opening-finance-columns,
  .opening-detail-grid {
    grid-template-columns: 1fr;
  }

  .account-actions,
  .opening-detail-actions {
    align-items: stretch;
  }

  .account-actions > *,
  .opening-detail-actions > * {
    width: 100%;
    justify-content: center;
  }
}
```

- [ ] **Step 6: Run functional smoke checks**

In browser, verify:

- `openings.html`: case picker opens; single open works; batch count input works; ROI/history updates.
- `account.html`: login/register forms still submit to the same handlers; Steam binding form still submits; BUFF/YouPin buttons are enabled only under the same conditions as before.
- `inventory.html`: synced inventory cards still navigate to item detail.
- `loadout.html`: budget/style chat controls still render; category/pro switches still refresh panels; hydration still fills recommendations.

Run:

```powershell
rg -n "id=\"(syncSteamButton|runSyncButton|openingBatchCount|loadMoreInventory)|data-opening-open|data-opening-select|data-ai-category|data-pro-player" app.js
```

Expected: all listed IDs and `data-*` contracts still exist.

- [ ] **Step 7: Commit**

```powershell
git add app.js styles.css
git commit -m "feat: redesign utility exhibition pages"
```

---

## Task 5: Visual QA, Responsive QA, And Regression Verification

**Files:**
- Modify: `styles.css`
- Modify: `app.js` only if QA finds broken markup or missing state text.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified desktop/mobile exhibition UI with existing functions intact.

- [ ] **Step 1: Run automated checks**

Run:

```powershell
npm run test:navigation-motion
```

Expected: exits `0`.

Run a text scan for unfinished implementation markers, static-only wording, and old visible brand strings:

```powershell
rg -n "FIXME|REPLACE_ME|static landing|cs2 skin atlas|CS2 Skin Atlas" app.js language-runtime.js styles.css *.html
```

Expected: no unfinished implementation markers, no `static landing`, and no visible old `CS2 Skin Atlas` brand/title strings except where preserved as legacy data or comments. If the command returns only legacy data comments, no change is needed.

Run:

```powershell
rg -n "/api/(auth|steam|buff|youpin|price-sync)|localStorage|sessionStorage|CS2_CATALOG|CS2_MARKET_PRICES" app.js server scripts
```

Expected: existing API/storage/data references are still present. Do not change the output in this task unless a previous task accidentally removed one.

- [ ] **Step 2: Start local server**

Run:

```powershell
npm start
```

Expected: local server starts and prints the URL. Keep it running for browser checks.

- [ ] **Step 3: Desktop browser pass**

At a desktop viewport, visit:

```text
index.html
catalog.html
collections.html
item.html?id=ak-inheritance
favorites.html
recent.html
openings.html
account.html
inventory.html
loadout.html
```

Expected on every page:

- Header shows `CS EXHIBITION`.
- Language switcher is visible.
- Current nav item is active.
- Page title uses the exhibition name.
- No text overlaps controls.
- All interactive controls are visibly enabled/disabled according to existing state.
- Black/red/white exhibition palette dominates; gold/copper is not a navigation or hero theme.

- [ ] **Step 4: Mobile browser pass**

Set viewport to approximately `390x844`. Visit the same pages.

Expected:

- Header does not wrap into multiple rows.
- `MENU +` opens the nav overlay.
- Scrim closes the nav overlay.
- Language switcher remains reachable.
- Catalog filters are not squeezed off screen.
- Cards and price panels do not overflow horizontally.
- Buttons with long localized text wrap or fit without overlap.

- [ ] **Step 5: Reduced-motion pass**

Enable reduced motion in browser emulation or OS settings. Reload `index.html`, `catalog.html`, `openings.html`, and `loadout.html`.

Expected:

- Content appears without waiting for decorative motion.
- Menu and pickers remain usable.
- No element remains permanently transparent or translated out of view.

- [ ] **Step 6: Data-state pass**

Manually verify visible states:

- Catalog loading or skeleton state appears before data fills when cache is cold.
- Catalog empty state appears after entering a search string that has no match.
- Item price plates show independent hints for reference, BUFF, and YouPin.
- Account logged-out state shows pass/access forms.
- Inventory no-sync state explains Steam binding/sync route.
- Loadout hydration state shows the console before recommendations load.
- Opening history empty state appears before the first opening.

- [ ] **Step 7: Fix QA findings with minimal scoped edits**

For CSS overflow issues, prefer:

```css
min-width: 0;
overflow-wrap: anywhere;
```

For button layout issues, prefer:

```css
display: inline-flex;
align-items: center;
justify-content: center;
white-space: normal;
text-align: center;
```

For mobile grid overflow, prefer:

```css
grid-template-columns: minmax(0, 1fr);
```

Do not change event IDs, `data-*` attributes, API calls, storage keys, or data calculations while fixing presentation bugs.

- [ ] **Step 8: Final commit**

```powershell
git add styles.css app.js language-runtime.js index.html catalog.html collections.html item.html favorites.html recent.html openings.html account.html inventory.html loadout.html
git commit -m "chore: verify CS Exhibition redesign"
```

---

## Self-Review Notes

- Spec coverage: Tasks cover global shell, all listed routes, all functional areas, language switching, mobile navigation, status visibility, and visual QA.
- Data/API preservation: Global constraints and every task explicitly preserve existing IDs, `data-*` attributes, APIs, storage keys, and render function names.
- Test coverage: Plan uses existing navigation test, targeted `rg` contract checks, desktop/mobile browser passes, reduced-motion checks, and manual smoke tests for catalog, inspect, opening, account, inventory, and AI loadout flows.
- Scope control: No new framework, no backend changes, no data schema changes, no unrelated refactor.
