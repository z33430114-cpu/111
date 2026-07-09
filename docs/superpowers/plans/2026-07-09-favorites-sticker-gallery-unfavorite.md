# Favorites Sticker Gallery Unfavorite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline unfavorite action for saved sticker gallery cards on the favorites page and keep the page counts in sync after removal.

**Architecture:** Extend the existing favorites-page renderer in `app.js` instead of introducing a separate sticker-gallery controller. Persist DIY gallery removals through the current local-storage helpers, then reuse the page refresh path so the hero stats and gallery grid update together.

**Tech Stack:** Vanilla JavaScript, localStorage-backed page state, Node `node:test` regression tests

## Global Constraints

- Keep the change scoped to the favorites sticker gallery on `favorites.html`.
- Reuse existing favorites page button styles and render flow.
- Remove saved DIY designs immediately with no undo flow and no extra exit animation.

---

### Task 1: Cover sticker gallery unfavorite markup and removal behavior

**Files:**
- Modify: `C:\Users\35191\Documents\git1\scripts\favorites-shell-redesign.test.mjs`
- Modify: `C:\Users\35191\Documents\git1\app.js`

**Interfaces:**
- Consumes: `getDiyDesigns(): Array<object>`, `setDiyDesigns(designs: Array<object>): void`, `renderFavorites(): void`
- Produces: `removeDiyDesign(designId: string): void`, sticker gallery markup with `data-diy-favorite-id`

- [ ] **Step 1: Write the failing test**

```js
test("favorites sticker gallery cards expose a direct unfavorite action", () => {
  assert.match(root.innerHTML, /data-diy-favorite-id="design-1"/);
  assert.match(root.innerHTML, /Remove Favorite|取消收藏/);
});

test("removeDiyDesign persists the filtered gallery and refreshes favorites surfaces", () => {
  assert.deepEqual(writes.at(-1), [
    { id: "design-2", createdAt: "2026-07-09T11:00:00.000Z", stickers: [{}, {}, {}] }
  ]);
  assert.equal(renderCount, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/favorites-shell-redesign.test.mjs`
Expected: FAIL because sticker gallery cards do not yet include `data-diy-favorite-id`, and `removeDiyDesign` is not defined.

- [ ] **Step 3: Write minimal implementation**

```js
function removeDiyDesign(designId) {
  const nextId = String(designId || "").trim();
  if (!nextId) return;
  const designs = getDiyDesigns();
  setDiyDesigns(designs.filter((design) => String(design?.id || "") !== nextId));
  renderFavorites();
}
```

```js
<button class="secondary-action compact-action" type="button" data-diy-favorite-id="${escapeHtml(String(design.id || ""))}">
  ${escapeHtml(uiText("Remove Favorite", "取消收藏"))}
</button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/favorites-shell-redesign.test.mjs`
Expected: PASS with both favorites-shell tests green.

- [ ] **Step 5: Commit**

```bash
git add C:\Users\35191\Documents\git1\app.js C:\Users\35191\Documents\git1\scripts\favorites-shell-redesign.test.mjs
git commit -m "feat: add sticker gallery unfavorite action"
```
