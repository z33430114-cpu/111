# Loadout Page Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mojibake on the loadout page, restore complete pro player/team visuals without the missing browser helper, and stop slow re-hydration when revisiting the page.

**Architecture:** Keep the existing single-page static app structure centered in `app.js`, but harden the loadout-specific translation fallbacks, add a local cached pro visual fallback dataset, and gate loadout hydration so cached data renders immediately and repeat page visits do not refetch unnecessarily.

**Tech Stack:** Vanilla JavaScript, static HTML, local JSON/JS data, Node-based verification scripts if available.

## Global Constraints

- Preserve the existing page structure and data model in `app.js`.
- Prefer minimal, local fixes over broad refactors.
- Do not depend on a browser plugin being installed.
- Keep loadout page first paint fast by reusing cache when possible.

---

### Task 1: Repair loadout-page mojibake fallbacks

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Modify: `C:\Users\35191\Documents\git1\app-overrides.js`

**Interfaces:**
- Consumes: `uiText(en, zh)`, `looksLikeMojibake(value)`
- Produces: Clean Chinese fallback strings for loadout rendering helpers

- [ ] **Step 1: Write the failing check**

```js
[
  ["Curator", "策展室"],
  ["Describe Your Ideal Setup", "描述你理想的搭配"],
  ["Loading pro references...", "正在加载职业参考..."]
]
```

- [ ] **Step 2: Verify current code contains mojibake**

Run: `rg -n "绛栧睍|鎼厤|鑱屼笟|姝ｅ湪鍔犺浇" "C:\Users\35191\Documents\git1\app.js" "C:\Users\35191\Documents\git1\app-overrides.js"`
Expected: matches in loadout-related strings

- [ ] **Step 3: Replace the broken fallback strings with clean Chinese**

```js
uiText("Curator", "策展室");
uiText("Describe Your Ideal Setup", "描述你理想的搭配");
uiText("Loading pro references...", "正在加载职业参考...");
```

- [ ] **Step 4: Re-run the grep check**

Run: `rg -n "绛栧睍|鎼厤|鑱屼笟|姝ｅ湪鍔犺浇" "C:\Users\35191\Documents\git1\app.js" "C:\Users\35191\Documents\git1\app-overrides.js"`
Expected: no loadout-page matches remain

### Task 2: Add local pro player/team visual fallback data

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Create: `C:\Users\35191\Documents\git1\related-data\pro-loadout-fallback.json`

**Interfaces:**
- Consumes: `/api/ai/pro-loadouts` payload shape `{ ok, teams }`
- Produces: `mergeAiProLoadoutsWithFallback(payload)` that fills missing `logo`, `avatar`, `team`, and `sourceUrl`

- [ ] **Step 1: Define fallback payload shape**

```json
{
  "teams": [
    {
      "team": "Team Spirit",
      "logo": "https://...",
      "sourceUrl": "https://...",
      "players": [
        { "name": "donk", "avatar": "https://..." }
      ]
    }
  ]
}
```

- [ ] **Step 2: Implement merge logic in `app.js`**

```js
function mergeAiProLoadoutsWithFallback(payload, fallback) {
  // fill missing team logos and player avatars by normalized team/player name
}
```

- [ ] **Step 3: Load fallback data before rendering pro loadouts**

```js
appState.aiProLoadouts = mergeAiProLoadoutsWithFallback(apiPayload, appState.aiProLoadoutFallback);
```

- [ ] **Step 4: Verify fallback file is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('C:/Users/35191/Documents/git1/related-data/pro-loadout-fallback.json','utf8')); console.log('ok')"`
Expected: `ok`

### Task 3: Prevent slow repeat hydration on page revisit

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`

**Interfaces:**
- Consumes: `restoreAiLoadoutState()`, `persistAiLoadoutState()`, `scheduleLoadoutHydration()`, `ensureAiProLoadouts(force)`
- Produces: Timestamped cached loadout hydration and guarded revisit behavior

- [ ] **Step 1: Add cache freshness metadata**

```js
appState.aiProLoadoutsFetchedAt = 0;
```

- [ ] **Step 2: Skip refetch when cached payload is fresh**

```js
if (!force && appState.aiProLoadouts?.teams?.length && Date.now() - appState.aiProLoadoutsFetchedAt < 1000 * 60 * 30) return;
```

- [ ] **Step 3: Avoid restarting loadout hydration during `pageshow` revisit when cached content already exists**

```js
if (appState.aiInventoryRecommendations && appState.aiProLoadouts) return;
```

- [ ] **Step 4: Verify revisit path no longer forces refetch**

Run: `rg -n "aiProLoadoutsFetchedAt|scheduleLoadoutHydration|ensureAiProLoadouts" "C:\Users\35191\Documents\git1\app.js"`
Expected: cache timestamp and hydration guards present
