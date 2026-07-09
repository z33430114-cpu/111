# Sticker Free Transform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add draggable, scalable, and rotatable sticker placement on the inspector page while keeping edits ephemeral unless the user saves the current layout to favorites.

**Architecture:** Keep sticker transform state in inspector memory and derive the rendered overlay from that state on every render. Extract the math and serialization into small pure helpers that can be tested without the DOM, then wire pointer and wheel events on the existing sticker overlay to update those helpers' state shape.

**Tech Stack:** Vanilla JavaScript in `app.js`, existing Node `node:test` script tests, existing CSS in `styles.css`

## Global Constraints

- Inspector sticker edits must stay temporary during normal browsing and must not be written into URL params or persistent app state.
- The current sticker selection flow through `stickers.html` and `item.html` must continue to work with the lightweight `stickers-data.js` path.
- Saving a DIY favorite must persist each selected sticker's `x`, `y`, `scale`, and `rotate` values along with sticker identity and image.
- Follow TDD: pure helper tests fail first, then minimal implementation, then DOM wiring, then verification.

---

### Task 1: Define sticker transform helper contract

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Test: `C:\Users\35191\Documents\git1\scripts\sticker-transform.test.mjs`

**Interfaces:**
- Consumes: existing sticker ids and the current 4-slot default layout in `item.html` rendering
- Produces: `defaultStickerTransforms(stickerCount)`, `normalizeStickerTransforms(input, stickerCount)`, `updateStickerTransformEntry(entries, index, patch)`, `serializeStickerNodes(nodes)`

- [ ] Write failing helper tests for default positions, normalization, patch updates, and DOM serialization
- [ ] Run `node scripts/sticker-transform.test.mjs` and verify the new assertions fail for missing helpers
- [ ] Implement the minimal helper functions in `app.js`
- [ ] Re-run `node scripts/sticker-transform.test.mjs` until it passes

### Task 2: Render interactive sticker overlay from transform state

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Modify: `C:\Users\35191\Documents\git1\styles.css`
- Test: `C:\Users\35191\Documents\git1\scripts\sticker-transform.test.mjs`

**Interfaces:**
- Consumes: `activeStickerItems`, helper outputs from Task 1, existing inspector render path
- Produces: overlay nodes with `data-sticker-index`, inline transform style, selected-state class hooks, and an in-memory inspector sticker transform state bucket

- [ ] Add one failing test covering normalization fallback when fewer than four stickers are active
- [ ] Run `node scripts/sticker-transform.test.mjs` and verify the new case fails
- [ ] Update inspector rendering so each selected sticker uses transform state instead of fixed slot classes, and add CSS for selected/interactive sticker affordances
- [ ] Re-run `node scripts/sticker-transform.test.mjs` and verify all helper tests pass

### Task 3: Wire drag, wheel scale, and Alt-drag rotate interactions

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Modify: `C:\Users\35191\Documents\git1\styles.css`

**Interfaces:**
- Consumes: overlay nodes rendered in Task 2, transform helpers from Task 1
- Produces: pointer handlers that update in-memory transform state, selected sticker tracking, and inspector rerender sync after wear or variant changes

- [ ] Add a failing test for `updateStickerTransformEntry` clamping scale and preserving untouched fields
- [ ] Run `node scripts/sticker-transform.test.mjs` and verify it fails
- [ ] Implement minimal event handling for move, scale, and rotate; re-render or restyle the active sticker on interaction; preserve current transforms across `renderItemDetail()` calls in the same page session
- [ ] Re-run `node scripts/sticker-transform.test.mjs` and verify it passes

### Task 4: Persist transforms when saving DIY favorites

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Test: `C:\Users\35191\Documents\git1\scripts\sticker-transform.test.mjs`

**Interfaces:**
- Consumes: interactive sticker overlay DOM and current favorite save flow in `saveCurrentDiyDesign()`
- Produces: saved favorite sticker payloads with `image`, `name`, `x`, `y`, `scale`, and `rotate`

- [ ] Add a failing serialization test that expects favorite-ready sticker payloads from overlay nodes
- [ ] Run `node scripts/sticker-transform.test.mjs` and verify it fails for missing `scale` or incorrect parsing
- [ ] Update `saveCurrentDiyDesign()` to serialize the current interactive sticker overlay and store transform values in favorites
- [ ] Re-run `node scripts/sticker-transform.test.mjs` and verify it passes

### Task 5: Full verification

**Files:**
- Modify: `C:\Users\35191\Documents\git1\app.js`
- Modify: `C:\Users\35191\Documents\git1\styles.css`
- Test: `C:\Users\35191\Documents\git1\scripts\sticker-transform.test.mjs`
- Test: `C:\Users\35191\Documents\git1\scripts\item-sticker-flow.test.mjs`

**Interfaces:**
- Consumes: completed helper and DOM changes from Tasks 1-4
- Produces: verified inspector sticker transform behavior without regressions in sticker return flow

- [ ] Run `node scripts/sticker-transform.test.mjs`
- [ ] Run `node scripts/item-sticker-flow.test.mjs`
- [ ] Run `node --check C:\Users\35191\Documents\git1\app.js`
- [ ] Review the inspector manually for drag/scale/rotate responsiveness and favorites save behavior if a local server is already running
