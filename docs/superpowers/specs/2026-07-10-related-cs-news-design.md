# Related CS News Design

## Goal

Turn `related.html` from three hard-coded curator notes into a mixed Counter-Strike news surface that can show current articles from official updates, esports coverage, and skin-market relevant news.

The page should feel like a CS Exhibition intelligence desk, not a generic news portal. It should help visitors quickly scan what changed in CS2, what matters in competitive Counter-Strike, and what could affect skins, stickers, cases, inventory behavior, or loadout decisions.

## Chosen Direction

Use a **mixed news feed with local cached data**.

The feed includes three categories:

- `official`: Valve, Steam, and Counter-Strike official updates.
- `esports`: events, teams, players, transfers, rankings, and match ecosystem news.
- `market`: skin, sticker, case, inventory, patch-note, and collection-impact news.

This is preferred over a manually maintained list because the user wants latest CS news articles, and preferred over live client-side fetching because the current site is mostly static and should not depend on third-party pages responding during visitor page load.

## Current Context

`related.html` already exists and is wired into the shared navigation.

The page is rendered by `renderRelatedNews()` in `C:\Users\35191\Documents\git1\app.js`.

Current implementation details:

- `relatedNewsItems()` returns three hard-coded entries.
- Each card links to a referenced catalog item instead of an external article.
- CSS for the page already exists under `.related-news-page`, `.related-news-card`, and related selectors in `C:\Users\35191\Documents\git1\styles.css`.
- `scripts/related-news-page.test.mjs` verifies the route, navigation, renderer, and page styles are wired.

The redesign should reuse this route and page shell instead of creating a separate news application.

## Recommended Architecture

Add one generated local data file:

- `C:\Users\35191\Documents\git1\related-news-data.js`

This file exposes a browser global:

```js
window.RELATED_NEWS = [];
```

Add one sync script:

- `C:\Users\35191\Documents\git1\scripts\sync-related-news.mjs`

The sync script collects article metadata, normalizes it, sorts it, and writes `related-news-data.js`.

The frontend reads `window.RELATED_NEWS` when present and falls back to the current hard-coded curator notes when no usable news is available.

## Data Shape

Each news item should use a small, stable schema:

```js
{
  id: "counter-strike-2026-06-30-update",
  category: "official",
  source: "Counter-Strike",
  title: "Counter-Strike 2 Update",
  summary: "Added sticker price visibility and multi-select support for Storage Units.",
  url: "https://www.counter-strike.net/news/updates",
  publishedAt: "2026-06-30",
  image: "",
  tags: ["Update", "Inventory", "Stickers"]
}
```

Required fields:

- `id`
- `category`
- `source`
- `title`
- `summary`
- `url`
- `publishedAt`

Optional fields:

- `image`
- `tags`

If an image is unavailable, the card uses a text-first layout with source and category marks rather than a broken or generic placeholder.

## Source Strategy

Start with conservative, high-signal sources:

- Official Counter-Strike news and updates.
- Steam News Hub for app `730`.
- HLTV news or pages that expose stable article metadata.
- SteamDB patch notes for patch context.

The first implementation should not scrape every possible CS site. It should collect a small feed that is reliable, deduplicated, and clearly sourced.

Market category classification can come from keywords in titles and summaries, such as:

- skin
- sticker
- case
- capsule
- collection
- inventory
- storage unit
- market
- trade
- patch note
- price

Official patch notes that affect skins, inventory, stickers, or storage can appear in both the official section and receive market tags, but they should remain one article in the combined feed.

## Sync Script Behavior

`scripts/sync-related-news.mjs` should:

1. Fetch configured sources.
2. Extract article title, URL, source, publication date, and summary where available.
3. Normalize relative URLs to absolute URLs.
4. Generate stable IDs from source, date, and title.
5. Deduplicate by canonical URL first, then by normalized title.
6. Classify category as `official`, `esports`, or `market`.
7. Keep the latest relevant items, initially 18 to 30 articles.
8. Write a deterministic `related-news-data.js` file.

The script should fail soft:

- If one source fails, keep articles from the other sources.
- If all sources fail, leave the previous data file untouched when it exists.
- If there is no previous file, write an empty `window.RELATED_NEWS = [];` file so the page fallback works.

## Frontend Behavior

`relatedNewsItems()` should become a normalizer around `window.RELATED_NEWS`.

It should:

- Accept only valid news objects.
- Sort by `publishedAt` descending.
- Limit the rendered set to a manageable count.
- Localize category labels through existing UI helpers.
- Fall back to existing curated notes if the data array is empty or invalid.

`renderRelatedNews()` should update the page structure to include:

- Hero section: page title and concise description.
- Featured article: the most recent official or market-relevant article, falling back to newest overall.
- Category filter rail: all, official, esports, market.
- News grid: article cards.
- Existing AI Loadout callout: keep the route to `loadout.html`, but frame it as turning news context into loadout ideas.

Filtering can be implemented with normal client-side buttons and data attributes. No backend is needed.

## Card Design

Each article card should show:

- Category label.
- Source.
- Publication date.
- Title.
- Two-line or three-line summary.
- Tags, when available.
- External article link.

External links should use:

```html
target="_blank" rel="noopener noreferrer"
```

Cards should remain readable without images. The visual system should use editorial typography, source marks, subtle dividers, and the current red-black exhibition palette.

## Visual Direction

The page should shift from item-promo cards to an information-dense news desk.

Recommended layout:

- A compact dark masthead.
- One wide featured article panel.
- A tight filter bar.
- A responsive article grid.
- A bottom callout for AI loadout exploration.

Avoid:

- Marketing-style hero copy.
- Huge decorative cards.
- Stock-like imagery.
- A layout that hides article details behind oversized visuals.

## Browser Verification

Use the in-app browser after implementation to check:

- Desktop layout.
- Mobile layout.
- Category filter behavior.
- External links are visible and clearly identified.
- Empty data fallback still renders a useful page.

The browser plugin is for verification, not for the design document itself.

## Sites Usage

Use Sites only when the feature is implemented and ready to publish.

If the user wants the updated site deployed:

1. Build and validate the site.
2. Save and deploy through Sites.
3. Open the deployed URL in the in-app browser.

This project currently does not need Sites during the design-only stage.

## Error Handling

Frontend fallback rules:

- If `window.RELATED_NEWS` is missing, use curated fallback notes.
- If all items are invalid, use curated fallback notes.
- If one article is missing optional image or tags, render the card without those elements.
- If `publishedAt` is invalid, place it after dated articles and display source/category instead of a misleading date.

Sync script fallback rules:

- Source failures should be reported in script output.
- Existing generated data should not be destroyed by a transient fetch failure.
- Generated output should remain deterministic so diffs are reviewable.

## Testing Plan

Extend `scripts/related-news-page.test.mjs` or add focused tests to verify:

1. `related.html` loads `related-news-data.js`.
2. `app.js` reads `window.RELATED_NEWS`.
3. Category labels for official, esports, and market exist.
4. External article links include `noopener noreferrer`.
5. The fallback curator notes remain available.
6. The sync script writes `window.RELATED_NEWS`.

If the sync script includes parsing helpers, keep them pure enough to test without making live network requests.

## Implementation Scope

Expected files:

- `C:\Users\35191\Documents\git1\related-news-data.js`
- `C:\Users\35191\Documents\git1\scripts\sync-related-news.mjs`
- `C:\Users\35191\Documents\git1\related.html`
- `C:\Users\35191\Documents\git1\app.js`
- `C:\Users\35191\Documents\git1\styles.css`
- `C:\Users\35191\Documents\git1\scripts\related-news-page.test.mjs`

Do not change unrelated item catalog, loadout, inventory, account, or opening logic.

## Implementation Recommendation

Build this in one focused feature pass:

1. Add the generated news data file with a small initial seed.
2. Add the sync script and normalization helpers.
3. Wire `related.html` to load the generated data before `app.js`.
4. Update `relatedNewsItems()` and `renderRelatedNews()`.
5. Update related-news CSS only.
6. Add tests for the data file and fallback behavior.
7. Run tests and browser verification.
8. Deploy through Sites only if requested.
