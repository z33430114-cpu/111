# Curator Console Loadout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `loadout.html` into the Curator Console experience while preserving the current AI chat, inventory upgrade, and pro reference behavior.

**Architecture:** Keep the current single-page vanilla app structure intact and evolve only the loadout presentation layer. Update `app.js` render markup to introduce a new page skeleton and section wrappers, add loadout-specific styling in `styles.css`, and touch `loadout.html` only if a shell-level hook is required.

**Tech Stack:** Static HTML, vanilla JavaScript in `app.js`, shared CSS in `styles.css`, Node-based verification scripts, PowerShell command execution.

## Global Constraints

- Preserve every existing loadout capability and data flow.
- Keep existing IDs, button IDs, and data attributes exactly where current handlers expect them.
- Do not rewrite loadout state logic.
- Do not change backend APIs, AI request shape, inventory recommendation logic, or pro loadout data shape.
- Keep first usable paint fast and reuse the current motion system.
- Keep the generic `.ai-panel` styling safe for other routes and layer loadout-specific selectors on top.
- Keep Chinese and English both readable without overflow.

---

### Task 1: Add regression checks for the Curator Console skeleton

**Files:**
- Modify: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`

**Interfaces:**
- Consumes: `app.js` loadout markup output
- Produces: Regression assertions for new loadout wrappers and preserved interactive hooks

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const appJs = fs.readFileSync("C:/Users/35191/Documents/git1/app.js", "utf8");

assert.match(appJs, /curator-console-shell/, "loadout page should render a curator console shell");
assert.match(appJs, /curator-console-masthead/, "loadout page should render a curator masthead");
assert.match(appJs, /curator-command-deck/, "loadout page should render a command deck");
assert.match(appJs, /curator-runway/, "loadout page should render the inventory runway section");
assert.match(appJs, /curator-pro-archive/, "loadout page should render the pro archive section");
assert.match(appJs, /id="aiLoadoutChatForm"/, "AI loadout form id must be preserved");
assert.match(appJs, /id="aiLoadoutBudgetInput"/, "budget input id must be preserved");
assert.match(appJs, /id="aiLoadoutPromptInput"/, "prompt input id must be preserved");
assert.match(appJs, /id="rotateAiInventoryUpgradeGroupButton"/, "inventory rotate button id must be preserved");
assert.match(appJs, /data-pro-player=/, "pro player data hook must be preserved");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
Expected: FAIL with a message showing the new Curator Console wrapper classes do not exist yet.

- [ ] **Step 3: Keep the failure output for the implementation cycle**

```txt
AssertionError [ERR_ASSERTION]: loadout page should render a curator console shell
```

- [ ] **Step 4: Commit the test-first checkpoint**

```bash
git add C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs
git commit -m "test: add curator console loadout markup regression checks"
```

### Task 2: Rebuild the loadout page skeleton in `renderLoadout()`

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Test: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`

**Interfaces:**
- Consumes: `renderLoadout()`, `aiChatMarkup()`, `aiInventoryRecommendationsMarkup()`, `aiProLoadoutsMarkup()`
- Produces: `renderLoadout()` output with `curator-console-shell`, `curator-console-masthead`, `curator-command-deck`, `curator-runway`, and `curator-pro-archive` wrappers

- [ ] **Step 1: Implement the new `renderLoadout()` shell markup**

```js
function renderLoadout() {
  const root = document.getElementById("loadoutRoot");
  if (!root) return;
  const hasCatalog = Array.isArray(globalThis.CS2_CATALOG) && globalThis.CS2_CATALOG.length;
  const hasInventoryPayload = Boolean(appState.aiInventoryRecommendations);
  const hasProPayload = Boolean(appState.aiProLoadouts);
  const frameState = appState.loadoutFrameReady ? "ready" : (appState.loadoutHydrationStarted ? "hydrating" : "frame");
  const introCopy = (hasCatalog || hasInventoryPayload || hasProPayload)
    ? uiText("Direct AI pairings, inventory-led upgrades, and pro reference routes in one curator console.", "AI 搭配、库存升级和职业参考整合在同一策展控制台中。")
    : uiText("The curator frame appears first, then recommendations and pro references stream in as data becomes ready.", "策展控制台会先出现，推荐与职业参考会在数据就绪后继续载入。");
  root.innerHTML = `
    <div class="curator-console-shell" data-loadout-stage="${escapeHtml(frameState)}">
      <section class="page-intro curator-console-masthead" data-motion-intro>
        <div class="curator-console-copy">
          <p class="eyebrow" data-motion-part="eyebrow">${escapeHtml(uiText("Curator", LOADOUT_ZH.curator))}</p>
          <h1 data-motion-part="title">${escapeHtml(uiText("Curator Console", "策展控制台"))}</h1>
          <p data-motion-part="copy">${escapeHtml(introCopy)}</p>
        </div>
        <div class="curator-console-status" data-motion-part="actions">
          <span>${escapeHtml(uiText("Loadout Frame", "搭配框架"))}</span>
          <strong>${escapeHtml(frameState === "ready" ? uiText("Ready", "已就绪") : frameState === "hydrating" ? uiText("Hydrating", "加载中") : uiText("Preparing", "准备中"))}</strong>
        </div>
      </section>
      <section class="curator-command-deck">
        ${aiChatMarkup()}
      </section>
      <section class="curator-runway">
        ${(hasCatalog || hasInventoryPayload || appState.aiInventoryLoading)
          ? aiInventoryRecommendationsMarkup()
          : `<section class="ai-panel ai-inline-panel" data-loadout-stage="frame"><p class="ai-copy">${escapeHtml(uiText("Preparing recommendations...", LOADOUT_ZH.preparing))}</p></section>`}
      </section>
      <section class="curator-pro-archive">
        ${(hasProPayload || appState.aiProLoadoutsLoading)
          ? aiProLoadoutsMarkup()
          : `<section class="ai-panel ai-inline-panel" data-loadout-stage="hydrating"><p class="ai-copy">${escapeHtml(uiText("Loading pro references...", LOADOUT_ZH.proLoading))}</p></section>`}
      </section>
    </div>
  `;
  if (!appState.aiInventoryRecommendations || !appState.aiProLoadouts) {
    scheduleLoadoutHydration();
  }
}
```

- [ ] **Step 2: Run test to verify the new shell passes**

Run: `node C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
Expected: PASS

- [ ] **Step 3: Check the render hook names stayed intact**

Run: `rg -n "function renderLoadout|id=\"aiLoadoutChatForm\"|id=\"aiLoadoutBudgetInput\"|id=\"aiLoadoutPromptInput\"|rotateAiInventoryUpgradeGroupButton|data-pro-player=" "C:\Users\35191\Documents\git1\app.js"`
Expected: one `renderLoadout()` definition and all existing hooks still present.

- [ ] **Step 4: Commit the shell restructuring**

```bash
git add C:\Users\35191\Documents\git1\app.js
git commit -m "feat: add curator console loadout page shell"
```

### Task 3: Upgrade the AI chat and inventory sections to Curator Console markup

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Test: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`

**Interfaces:**
- Consumes: `aiChatMarkup()`, `aiLoadoutFilterBarMarkup()`, `aiInventoryRecommendationsMarkup()`
- Produces: Curator-specific wrappers such as `curator-deck-grid`, `curator-intent-panel`, `curator-output-panel`, and `curator-runway-head`

- [ ] **Step 1: Refactor `aiChatMarkup()` into a two-part command deck**

```js
function aiChatMarkup() {
  const messages = Array.isArray(appState.aiLoadoutChatMessages) ? appState.aiLoadoutChatMessages : [];
  const latestAssistantMessage = [...messages].reverse().find((entry) => entry?.role === "assistant");
  const payload = latestAssistantMessage?.payload || null;
  const activeCategory = appState.aiLoadoutCategory || "all";
  const requestSummary = summarizeAiLoadoutRequest(payload?.preferences, appState.aiLoadoutChatDraft || "");
  return `
    <div class="curator-deck-grid">
      <section class="ai-panel ai-chat-panel curator-intent-panel">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("AI Loadout Chat", LOADOUT_ZH.chatTitle))}</p>
          <h2>${escapeHtml(uiText("Describe Your Ideal Setup", LOADOUT_ZH.chatHeading))}</h2>
        </div>
        <p class="ai-copy">${escapeHtml(uiText("Set budget, color direction, and taste before the curator builds a route.", "先定义预算、颜色方向和风格，再让策展系统生成路线。"))}</p>
        ${aiLoadoutFilterBarMarkup()}
        <form class="ai-chat-form" id="aiLoadoutChatForm">
          <label>
            ${escapeHtml(uiText("Budget (CNY)", "预算（人民币）"))}
            <input id="aiLoadoutBudgetInput" type="number" min="0" step="50" value="${escapeHtml(String(appState.aiLoadoutBudgetDraft || ""))}" placeholder="1500" />
          </label>
          <label>
            ${escapeHtml(uiText("What do you want?", LOADOUT_ZH.askWhat))}
            <textarea id="aiLoadoutPromptInput" rows="4" placeholder="${escapeHtml(uiText("Example: red-black, restrained, knife + AK focus, no flashy gloves", "示例：红黑、克制、刀和 AK 为主、不想要太花的手套"))}">${escapeHtml(appState.aiLoadoutChatDraft || "")}</textarea>
          </label>
          <div class="ai-chat-actions">
            <button class="primary-action" type="submit"${appState.aiLoadoutChatPending ? " disabled" : ""}>${escapeHtml(appState.aiLoadoutChatPending ? uiText("Thinking...", LOADOUT_ZH.thinking) : uiText("Ask AI", LOADOUT_ZH.askAi))}</button>
            <button class="secondary-action" id="clearAiLoadoutChatButton" type="button"${messages.length || appState.aiLoadoutChatDraft || appState.aiLoadoutBudgetDraft ? "" : " disabled"}>${escapeHtml(uiText("Clear Chat", LOADOUT_ZH.clearChat))}</button>
          </div>
        </form>
      </section>
      <section class="ai-panel curator-output-panel">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(uiText("Recommendation Output", "推荐输出"))}</p>
          <h2>${escapeHtml(uiText("Curated Route", "策展路线"))}</h2>
        </div>
        <div class="ai-chat-log">
          ${latestAssistantMessage ? `
            <article class="ai-chat-bubble" data-role="assistant">
              <div class="ai-chat-bubble-head">
                <strong>${escapeHtml(uiText("AI Recommendation", LOADOUT_ZH.aiRecommendation))}</strong>
                ${requestSummary ? `<small>${escapeHtml(currentLanguage().startsWith("zh") ? `按当前要求更新：${requestSummary}` : `Updated for: ${requestSummary}`)}</small>` : ""}
              </div>
              <p>${escapeHtml(latestAssistantMessage.content || "")}</p>
              ${payload?.summary?.totalSuggestedCost ? `<small>${escapeHtml(currentLanguage().startsWith("zh") ? `本次推荐总价约 ${formatPrice(payload.summary.totalSuggestedCost)}` : `Suggested total is about ${formatPrice(payload.summary.totalSuggestedCost)}`)}</small>` : ""}
              ${payload?.suggestions?.length ? `${aiSuggestionTabsMarkup("loadout", activeCategory, payload.suggestions)}
              <div class="ai-suggestion-grid compact">
                ${aiSuggestionsForCategory(payload.suggestions, activeCategory).map(aiSuggestionCardMarkup).join("")}
              </div>` : ""}
            </article>
          ` : appState.aiLoadoutChatPending ? `<div class="empty-state">${escapeHtml(uiText("Updating the recommendation...", LOADOUT_ZH.updating))}</div>` : `<div class="empty-state">${escapeHtml(uiText("Start with a color, mood, weapon preference, or pro player name.", LOADOUT_ZH.chatEmpty))}</div>`}
        </div>
      </section>
    </div>
  `;
}
```

- [ ] **Step 2: Add a runway heading wrapper to `aiInventoryRecommendationsMarkup()`**

```js
return `
  <section class="ai-panel curator-runway-panel">
    <div class="section-heading curator-runway-head">
      <div>
        <p class="eyebrow">${escapeHtml(uiText("Inventory Upgrade", LOADOUT_ZH.inventoryTitle))}</p>
        <h2>${escapeHtml(uiText("Upgrade Runway", "升级展轨"))}</h2>
      </div>
      <div class="curator-runway-actions">
        <button class="secondary-action compact-action" id="rotateAiInventoryUpgradeGroupButton" type="button">${escapeHtml(uiText("Another set", LOADOUT_ZH.anotherSet))}</button>
        <button class="secondary-action compact-action" id="refreshAiInventoryRecommendationsButton" type="button"${appState.aiInventoryPriceSnapshotRefreshing ? " disabled" : ""}>${escapeHtml(appState.aiInventoryPriceSnapshotRefreshing ? uiText("Refreshing...", LOADOUT_ZH.refreshing) : uiText("Refresh data", LOADOUT_ZH.refresh))}</button>
      </div>
    </div>
    ...
  </section>
`;
```

- [ ] **Step 3: Run the regression test again**

Run: `node C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
Expected: PASS

- [ ] **Step 4: Commit the command deck and runway markup**

```bash
git add C:\Users\35191\Documents\git1\app.js
git commit -m "feat: reshape loadout chat and inventory sections"
```

### Task 4: Upgrade the pro loadout section and active-state markup

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Test: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`

**Interfaces:**
- Consumes: `aiProLoadoutsMarkup()`, `proPlayerLoadoutMarkup(team, player)`
- Produces: `curator-pro-panel`, `curator-pro-head`, and preserved `data-pro-player` toggles

- [ ] **Step 1: Refactor `aiProLoadoutsMarkup()` to add archive framing**

```js
return `
  <section class="ai-panel curator-pro-panel">
    <div class="section-heading curator-pro-head">
      <div>
        <p class="eyebrow">${escapeHtml(uiText("Pro Loadouts", LOADOUT_ZH.proTitle))}</p>
        <h2>${escapeHtml(uiText("Reference Archive", "职业参考档案"))}</h2>
      </div>
      <p class="ai-copy">${escapeHtml(uiText("Browse team-by-team player references without leaving the curator flow.", "按战队浏览职业选手参考，不必离开当前策展流程。"))}</p>
    </div>
    <div class="pro-team-grid">
      ...
    </div>
    ${hasMoreTeams ? `<button class="load-more-button" id="loadMoreProTeams" type="button">${escapeHtml(uiText("Load More Teams", LOADOUT_ZH.loadMoreTeams))}</button>` : ""}
  </section>
`;
```

- [ ] **Step 2: Keep each player trigger and detail block intact**

```js
<button class="pro-player-head${isActive ? " is-active" : ""}" type="button" data-pro-player="${escapeHtml(key)}" aria-expanded="${isActive ? "true" : "false"}">
  ${proAvatarMarkup(player)}
  <strong>${escapeHtml(player.name)}</strong>
</button>
<div class="pro-player-loadout" data-pro-player-loadout="${escapeHtml(key)}"${isActive ? "" : " hidden"}>
  ${proPlayerLoadoutMarkup(team, player)}
</div>
```

- [ ] **Step 3: Run the regression test**

Run: `node C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
Expected: PASS

- [ ] **Step 4: Commit the pro archive markup**

```bash
git add C:\Users\35191\Documents\git1\app.js
git commit -m "feat: restyle pro loadouts as curator archive"
```

### Task 5: Add Curator Console page styles

**Files:**
- Modify: `C:\Users\35191\Documents\git1\styles.css`
- Test: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`

**Interfaces:**
- Consumes: `.curator-console-shell`, `.curator-console-masthead`, `.curator-deck-grid`, `.curator-runway`, `.curator-pro-archive`
- Produces: Loadout-specific desktop and mobile presentation without changing non-loadout pages

- [ ] **Step 1: Add the new loadout shell and masthead styles**

```css
#loadoutRoot.curator-ready,
#loadoutRoot .curator-console-shell {
  width: min(1480px, calc(100vw - 32px));
  margin: 0 auto 56px;
}

#loadoutRoot .curator-console-shell {
  display: grid;
  gap: 24px;
}

#loadoutRoot .curator-console-masthead {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: end;
  padding: 54px 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background:
    radial-gradient(circle at 78% 18%, rgba(215, 25, 32, 0.16), transparent 20%),
    linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)),
    linear-gradient(180deg, #0c0d10 0%, #060708 100%);
}

#loadoutRoot .curator-console-status {
  display: grid;
  gap: 4px;
  min-width: 180px;
  padding: 14px 16px;
  border-left: 1px solid rgba(215, 25, 32, 0.45);
  background: rgba(255, 255, 255, 0.03);
}
```

- [ ] **Step 2: Add command deck, runway, and pro archive styles**

```css
#loadoutRoot .curator-deck-grid {
  display: grid;
  grid-template-columns: minmax(340px, 0.86fr) minmax(0, 1.14fr);
  gap: 20px;
}

#loadoutRoot .curator-intent-panel,
#loadoutRoot .curator-output-panel,
#loadoutRoot .curator-runway-panel,
#loadoutRoot .curator-pro-panel {
  margin-top: 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(18, 20, 24, 0.96), rgba(8, 10, 14, 0.98));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
}

#loadoutRoot .curator-runway-head,
#loadoutRoot .curator-pro-head {
  display: flex;
  gap: 16px;
  align-items: end;
  justify-content: space-between;
}

#loadoutRoot .curator-runway-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}
```

- [ ] **Step 3: Add responsive collapse rules**

```css
@media (max-width: 1024px) {
  #loadoutRoot .curator-deck-grid,
  #loadoutRoot .curator-console-masthead {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  #loadoutRoot .curator-console-shell {
    width: min(100vw - 20px, 100%);
    gap: 18px;
  }

  #loadoutRoot .curator-console-masthead,
  #loadoutRoot .curator-intent-panel,
  #loadoutRoot .curator-output-panel,
  #loadoutRoot .curator-runway-panel,
  #loadoutRoot .curator-pro-panel {
    padding-left: 16px;
    padding-right: 16px;
  }

  #loadoutRoot .curator-runway-head,
  #loadoutRoot .curator-pro-head {
    flex-direction: column;
    align-items: stretch;
  }
}
```

- [ ] **Step 4: Run the regression test and a selector sanity check**

Run: `node C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
Expected: PASS

Run: `rg -n "curator-console-shell|curator-console-masthead|curator-deck-grid|curator-runway-head|curator-pro-head" "C:\Users\35191\Documents\git1\styles.css"`
Expected: all five selectors present.

- [ ] **Step 5: Commit the loadout-specific styling**

```bash
git add C:\Users\35191\Documents\git1\styles.css
git commit -m "feat: add curator console loadout styling"
```

### Task 6: Verify the full page behavior and responsive safety

**Files:**
- Modify: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
- Modify: `C:\Users\35191\Documents\git1\scripts\check-navigation-motion.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\check-navigation-motion.mjs`

**Interfaces:**
- Consumes: final `app.js` and `styles.css`
- Produces: verification coverage that the redesigned page still preserves hooks and motion-safe selectors

- [ ] **Step 1: Extend the regression test to assert responsive-safe loadout filters**

```js
const stylesCss = fs.readFileSync("C:/Users/35191/Documents/git1/styles.css", "utf8");

assert.match(stylesCss, /@media \(max-width: 760px\)[\s\S]*curator-console-shell/, "mobile loadout layout should collapse safely");
assert.match(stylesCss, /@media \(max-width: 1024px\)[\s\S]*curator-deck-grid/, "tablet loadout layout should collapse safely");
```

- [ ] **Step 2: Run the UI regression test**

Run: `node C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs`
Expected: PASS

- [ ] **Step 3: Run the motion regression check**

Run: `node C:\Users\35191\Documents\git1\scripts\check-navigation-motion.mjs`
Expected: PASS or a loadout-unrelated failure only if the script already has existing unrelated expectations.

- [ ] **Step 4: Record the actual verification status before completion**

```txt
ui-chinese-regression: PASS
check-navigation-motion: PASS
```

- [ ] **Step 5: Commit the final verification updates**

```bash
git add C:\Users\35191\Documents\git1\scripts\ui-chinese-regression.test.mjs C:\Users\35191\Documents\git1\scripts\check-navigation-motion.mjs
git commit -m "test: verify curator console loadout behavior"
```
