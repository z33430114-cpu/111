# Favorites Sticker Gallery Unfavorite Design

## Goal

Add a direct unfavorite action to the sticker gallery on the favorites page so saved DIY sticker layouts can be removed in place.

## Current Context

The favorites page is rendered by `renderFavorites()` in `C:\Users\35191\Documents\git1\app.js`.
Regular saved catalog items already expose a remove-favorite button via `data-favorite-id`, but DIY sticker gallery cards only link back to the inspector.
DIY sticker layouts are persisted locally through `getDiyDesigns()` and `setDiyDesigns()`.

## Chosen Approach

Use the existing favorites-page render flow and add a second action on each DIY sticker gallery card labeled `取消收藏` / `Remove Favorite`.
When the button is pressed, remove the corresponding design from the local DIY designs array, persist the updated array, and re-render the favorites surfaces so the gallery count, stats, and grid all update together.

## Interaction Details

- The action appears only on sticker gallery cards in the `DIY Designs` section.
- Removal is immediate with no undo state.
- The gallery uses the existing grid layout, so remaining cards naturally close the gap after re-render.
- The existing `Open Inspector` action remains unchanged.

## Data Flow

1. The click handler detects a `data-diy-favorite-id` trigger.
2. A new helper removes the matching design from `getDiyDesigns()`.
3. The helper calls `setDiyDesigns()` with the filtered array.
4. The favorites page re-renders so the sticker gallery and derived counts stay in sync.

## Files In Scope

- `C:\Users\35191\Documents\git1\app.js`
- `C:\Users\35191\Documents\git1\scripts\favorites-shell-redesign.test.mjs`

## Out Of Scope

- Undo toasts or restore flows
- Extra exit animations for removed sticker cards
- Changes to regular catalog favorites
