# CS Exhibition Redesign Design

## Goal

Redesign the existing CS skin project frontend into a high-end Counter-Strike digital exhibition while preserving every current product capability.

The redesign changes visual language, page structure, interaction presentation, and content framing only. It must not remove, weaken, or replace the current backend, APIs, data sources, cache behavior, account flows, language runtime, pricing flows, inventory sync, AI recommendations, or unboxing simulation.

The target experience is not a marketing landing page. It is a functional exhibition interface: immersive on entry, dense and precise when users work with catalog, prices, inventory, unboxing, account, and AI loadout tools.

## Reference Direction

The visual source is `https://ylem.watch/`.

Relevant traits to inherit:

- Full black, cinematic first impression.
- Sparse top navigation with uppercase labels.
- White headline typography with restrained supporting copy.
- Red used as a thin accent, not a dominant palette.
- Large product imagery or scene imagery with deep shadow.
- Wide negative space and deliberate pacing.
- Minimal borders, quiet panels, low-saturation surfaces.
- Exhibition-style CTA language such as `ENTER`, `EXPLORE`, `VIEW`, `INSPECT`, and `OPEN`.

Traits to avoid:

- Pure narrative long-form product storytelling that hides tools.
- Decorative gradients, blobs, glowing orbs, or busy effects.
- A static luxury landing page that cannot reconnect to existing functions.
- Overly thick cards, cheerful ecommerce styling, or database-table heaviness.

## Recommended Approach

Use an **Exhibition Console** model.

The home page provides the immersive entry moment. Functional pages use a controlled, high-density console layout that still feels like a premium gallery system.

This is preferred over two alternatives:

- **Gallery Narrative**: stronger art direction but too slow and spacious for catalog, price, inventory, and AI workflows.
- **Dark Database Pro**: efficient but too close to a normal tool site and too far from the ylem-style exhibition mood.

## Product Framing

The product becomes **CS Exhibition**, a Counter-Strike digital museum for skins, prices, inventories, simulated drops, and curated loadouts.

Current page mapping:

| Current Page | Exhibition Name | Purpose |
| --- | --- | --- |
| Home | CS Exhibition | Immersive entry and real feature gateways |
| Catalog | Archive | Search and browse the full item archive |
| Collections | Halls | Browse by collection, map set, case, capsule, souvenir package, weapon group |
| Item | Inspect | Examine a single exhibit with prices and actions |
| Favorites | Saved | Private display case for saved items and DIY sticker schemes |
| Recent | Trail | Recently viewed exhibits |
| Openings | Drop Theatre | Case/capsule simulation, drop pool, history, ROI, AI case judgment |
| Account | Pass | Account, local session, Steam binding, BUFF/YouPin access |
| Inventory | Vault | Steam inventory, inventory value, item inspection jumps |
| Loadout | Curator | AI loadout recommendations, budget, style, upgrades, pro references |

Navigation labels may use the English exhibition names as the primary short labels, with localized labels supplied through the existing language system.

## Information Architecture

### Global Navigation

Desktop header:

- Left: `CS EXHIBITION` brand mark.
- Center or right: `ARCHIVE`, `HALLS`, `INSPECT`, `SAVED`, `TRAIL`, `DROP THEATRE`, `PASS`, `VAULT`, `CURATOR`.
- Far right: minimal language selector and account/session status.

Mobile header:

- Left: `CS EXHIBITION`.
- Right: language selector and `MENU +`.
- Menu opens a full-height black navigation overlay with the same routes and account/sync status.

Do not hide the language selector inside account settings only. It remains globally available.

### Page System

Every functional page uses the same three-layer structure:

1. **Exhibition Header**
   - Eyebrow label.
   - Large uppercase page title.
   - One clear sentence explaining what the page does.
   - Status line for loading, empty, failed, synced, stale, or refreshable data.

2. **Control Rail**
   - Search, filters, sort, price range, platform selectors, refresh controls, or form inputs.
   - Desktop: inline or left/top rail depending on page density.
   - Mobile: compact controls plus an `OPEN FILTERS` or `REFINE` drawer.

3. **Object Surface**
   - Cards, item grids, result lists, price panels, inventory cards, unboxing results, chat recommendations, or history records.
   - All existing actions remain present.

## Visual System

### Color

Use a mostly black palette:

- Background: `#020202`, `#050505`, `#080808`.
- Panels: `#0e0f11`, `#121316`, `rgba(255,255,255,0.035)`.
- Borders: `rgba(255,255,255,0.10)` and rare `rgba(210,25,34,0.45)`.
- Text: `#f5f5f2` primary, `#a3a3a0` secondary, `#6e6e6b` tertiary.
- Red accent: `#d71920` or similar, used sparingly.
- Positive/negative states retain readable status colors but should be muted and controlled.

Remove the current gold/copper-dominant mood from primary navigation and hero surfaces. Gold may survive only where existing rarity or data semantics require it.

### Typography

- Headings: uppercase, tight but readable, letter spacing `0`.
- Body copy: clear, compact, not poetic at the expense of comprehension.
- Functional labels: short, technical, and localized.
- CTA language: `ENTER`, `VIEW`, `INSPECT`, `OPEN`, `SYNC`, `REFRESH`, `SAVE`.

Do not scale font size with viewport width directly. Use `clamp()` with fixed rem/px bounds where needed.

### Layout

- Full-bleed black sections.
- No decorative nested cards.
- Cards only for repeated items, modals, and framed tools.
- Page sections should be unframed layouts or full-width bands.
- Panel radius should stay between `4px` and `8px`.
- Use thin borders and low-alpha fills instead of heavy glassmorphism.

### Imagery

The redesign should use real CS item imagery already available from the catalog where possible.

Home hero:

- Right or center-right: a large weapon/knife/glove/item composition in a dark exhibit setting.
- Left: minimal text and immediate entry actions.
- A red line, scan mark, or thin accent may guide attention, but must not become a decorative gradient.

Functional pages:

- Item images become exhibit objects.
- Inventory and catalog cards should use dark plinth-like image zones.
- Avoid fake placeholder art when real item images exist.

### Motion

Motion should feel controlled and premium:

- Entry fade and short vertical movement.
- Thin red or white line reveals on hover.
- Panels open quickly and close faster.
- No long waits before tools are usable.
- Respect `prefers-reduced-motion`.

Existing motion tokens can be adapted, but heavy pages must favor first usable paint over staged animation.

## Page Designs

### Home: CS Exhibition

Purpose:

Introduce the exhibition and route users into real tools immediately.

Structure:

- Full viewport black hero with large item imagery.
- Primary title: `CS EXHIBITION`.
- Supporting copy: a concise line explaining archive, prices, inventory, drops, and AI curation.
- Primary CTA: `ENTER ARCHIVE`.
- Secondary CTAs: `OPEN DROP THEATRE`, `INSPECT VAULT`, `ASK CURATOR`.
- Lower edge of viewport reveals the next section so the page does not feel like a closed splash screen.
- A compact feature gateway band follows the hero with all main modules.

States:

- If catalog data is loading, show an unobtrusive `Preparing archive` status.
- If the user is logged in, show Vault value/sync status preview.
- If not logged in, show `PASS REQUIRED FOR SYNC` as a link to account, not a blocking modal.

### Archive: Catalog

Preserved functions:

- Weapon type filtering.
- Collection/series filtering.
- Rarity filtering.
- Price range filtering.
- Search.
- Sort.
- Load more.
- Copy link.
- Item card navigation.
- Price display and cache status.

Design:

- Page title: `ARCHIVE`.
- Intro copy: "Search the complete CS exhibit archive by type, series, rarity, and market range."
- Control rail contains search, type, rarity, collection, price, and sort.
- Cards use dark exhibit plinths: image, item name, weapon type, rarity stripe, reference price, platform price hints.
- Loading more should feel like extending a gallery wall, but the button remains explicit.

States:

- Loading: skeleton cards with thin borders.
- Empty: state explains which filters produced no match and offers `CLEAR FILTERS`.
- Failed: state includes retry and data-source hint.
- Price stale/syncing: visible small status near price controls.

### Halls: Collections

Preserved functions:

- Collection browsing.
- Series/map/case/capsule/souvenir grouping.
- Jumping into filtered catalog views.

Design:

- Page title: `HALLS`.
- Group collections into exhibition halls.
- Each hall row/card shows collection name, category, item count, and a `VIEW HALL` action.
- The interaction should route back to existing catalog filters rather than create a separate data model.

States:

- Empty hall groups should not disappear silently; show count zero when relevant.
- Loading and failure states mirror Archive.

### Inspect: Item Detail

Preserved functions:

- Item image.
- Name.
- Weapon type.
- Rarity.
- Collection/series.
- Wear and float controls.
- Reference price.
- BUFF price.
- YouPin price.
- Platform price status.
- Favorite.
- Compare.
- Related items and navigation.

Design:

- Large item image treated as the main exhibit.
- Detail metadata appears as museum labels and technical plates.
- Price system appears as a `Market Plates` panel with reference, BUFF, YouPin, and sync/cache hints.
- Wear, version, and special template controls remain clear form controls.
- Save and compare actions remain near the title and repeated near the price section on mobile.

States:

- Platform price loading: each platform plate has its own loading hint.
- Platform unavailable: keep the plate visible and explain missing login/cache/data.
- Item not found: show an exhibit missing state with return to Archive.

### Saved: Favorites

Preserved functions:

- Save item.
- Remove favorite.
- Save DIY sticker schemes.
- Jump back to item detail.

Design:

- Page title: `SAVED`.
- Treat saved items as a private display case.
- Tabs or segmented controls separate `Items` and `Sticker Schemes` if data supports it.
- Cards keep removal and inspect actions visible.

States:

- Empty: prompt to save exhibits from Archive or Inspect.
- Failure to save/remove: inline toast or panel message, not silent failure.

### Trail: Recent Views

Preserved functions:

- Browsing history.
- Clear history.
- Quick return to item detail.

Design:

- Page title: `TRAIL`.
- Recent items appear as a chronological exhibition path.
- Provide `CLEAR TRAIL` as a restrained destructive action.

States:

- Empty: "No exhibits visited yet" plus `ENTER ARCHIVE`.
- Clear confirmation should remain simple and reversible only if existing logic supports it.

### Drop Theatre: Openings

Preserved functions:

- Case/capsule selection.
- Drop pool.
- Single open.
- Batch open.
- Rare special items.
- Wear generation.
- Opening history.
- Spend/return analysis.
- ROI.
- AI case judgment.

Design:

- Page title: `DROP THEATRE`.
- The active case/capsule is the stage object.
- Primary controls: case picker, single open, batch count, batch open.
- Drop animation area is the theatre stage, but results must be readable immediately.
- Drop pool and history sit in side panels on desktop and stacked sections on mobile.
- ROI and spend/return analysis appear as a finance panel, not hidden below the fold.
- AI case judgment is framed as `CURATOR'S ODDS NOTE` or `AI DROP JUDGMENT`.

States:

- Opening in progress.
- No case selected.
- Drop pool unavailable.
- History empty.
- ROI positive/negative with muted but readable status colors.

### Pass: Account

Preserved functions:

- Login.
- Register.
- Logout.
- Steam ID binding.
- Local session.
- BUFF login, verify, unlink.
- YouPin login, verify, unlink.
- Price sync.
- Sync status.

Design:

- Page title: `PASS`.
- Account identity appears as an exhibition pass.
- Steam, BUFF, and YouPin are separate credential panels with explicit status.
- Sync controls are grouped under `Platform Access` and `Market Sync`.
- Forms remain ordinary, clear, and usable.

States:

- Logged out.
- Logged in.
- Binding saved.
- Verification pending.
- Verification failed.
- Connected.
- Disconnected.
- Sync running.
- Sync complete.
- Sync failed.

### Vault: Inventory

Preserved functions:

- Steam inventory display.
- Inventory price.
- Total inventory value.
- Sync time.
- Inventory card jump to item detail.

Design:

- Page title: `VAULT`.
- Top summary: total value, item count, last Steam sync, price source status.
- Inventory cards show image, name, wear/float when available, platform/reference value, and `INSPECT`.
- Cards are dense enough for real inventory scanning.

States:

- Not logged in or no Steam binding.
- Sync available.
- Sync running.
- Empty inventory.
- Inventory fetch failed.
- Price partially available.

### Curator: AI Loadout

Preserved functions:

- Budget input.
- Style input.
- Chat-like recommendation.
- Same-color inventory upgrade.
- Pro player loadout reference.
- Filters.
- Refresh.

Design:

- Page title: `CURATOR`.
- Primary panel is a chat/input console.
- Budget and style are visible controls, not hidden prompt details.
- AI output cards are curated proposals: item image, slot, price, rationale, inventory upgrade tag.
- Pro player references appear as selectable reference routes.
- Inventory-aware upgrades should clearly distinguish owned, upgrade, and buy targets.

States:

- AI preparing.
- No budget/style entered.
- Recommendation failed.
- Inventory unavailable.
- Refreshing recommendations.
- No matching candidates.

## Component Guidelines

### Buttons

- Primary: black or deep red fill with thin red border, uppercase label.
- Secondary: transparent black with white/gray border.
- Destructive: red text or red border, not large filled danger blocks unless confirming.
- Use labels such as `ENTER`, `VIEW`, `INSPECT`, `OPEN`, `SYNC`, `REFRESH`, `SAVE`, `REMOVE`.

### Cards

- Use for repeated objects only.
- Image zone should be visually stable with fixed aspect ratio.
- Rarity is a thin strip, label, or edge accent.
- Prices should not shift card height unpredictably.

### Forms

- Inputs remain clearly visible.
- Use thin borders, dark fill, white text.
- Error text appears directly near the field or panel.
- Native select elements may be styled minimally but must remain accessible.

### Drawers And Pickers

- Existing collection/type/rarity pickers become black exhibition drawers.
- Desktop picker: centered or side-panel modal.
- Mobile picker: bottom sheet or full-height drawer.
- Keep clear, confirm, close actions.

### Status Language

Every data-sensitive area must expose state:

- Loading.
- Empty.
- Failed.
- Synced.
- Stale.
- Refreshable.
- Connected.
- Disconnected.
- Verification pending.

Do not rely only on color for status.

## Implementation Boundaries

Keep existing architecture:

- `app.js` remains the main render and state layer.
- `language-runtime.js` remains the language switcher and nav/title translation runtime.
- Current HTML page files remain route shells.
- Existing backend endpoints and data files remain unchanged.
- Existing price, cache, sync, inventory, account, AI, and opening logic remains intact.

Likely implementation areas:

- `styles.css`: primary visual system, layout, responsive behavior, cards, panels, buttons, motion.
- HTML shells: navigation labels, structural hooks, version query updates.
- `language-runtime.js`: updated navigation/page labels for exhibition naming across all supported languages.
- `app.js`: only presentation markup and text changes inside render functions, preserving event data attributes and state logic.

Do not change:

- API paths.
- Storage keys unless backward-compatible migration is provided.
- Catalog data schema.
- Price source priority rules.
- Account/session model.
- Steam inventory sync logic.
- BUFF/YouPin login or verification endpoints.
- AI recommendation engine inputs/outputs.
- Opening probability or ROI calculations.

## Accessibility And Responsive Requirements

- All controls must remain keyboard reachable.
- Visible focus states must work on black surfaces.
- Text contrast must remain high.
- Language switcher must stay globally reachable.
- Mobile navigation must not cover or squeeze filter controls.
- Filter drawers must close reliably and keep selected values clear.
- `prefers-reduced-motion` must remove decorative motion without hiding content.
- Long item names and localized labels must wrap or truncate gracefully without overlapping controls.

## Verification Plan

After implementation, verify:

1. All routes still render: home, archive, halls, inspect, saved, trail, drop theatre, pass, vault, curator.
2. Language switching still works for every supported language.
3. Catalog search, filters, sort, load more, and copy link still work.
4. Item detail still loads prices, platform plates, wear/version/template controls, favorite, and compare.
5. Favorites and recent history still save, remove, clear, and navigate correctly.
6. Opening simulation still supports selection, single open, batch open, history, pool, ROI, and AI judgment.
7. Account login/register/logout, Steam binding, BUFF/YouPin validation/unlink, and price sync still work.
8. Inventory sync, total value, item cards, and inspect navigation still work.
9. AI loadout budget/style/chat, filters, refresh, inventory upgrade, and pro references still work.
10. Loading, empty, failure, synced, stale, connected, and disconnected states are visible.
11. Desktop and mobile layouts have no overlapping text, controls, or hidden navigation.
12. Reduced motion mode keeps all pages usable.

## Open Decisions For Implementation

- Whether the hero uses an existing catalog item composition or a generated dark exhibition image.
- Whether the mobile menu should replace the current wrapping nav immediately or be phased in after the desktop redesign.
- Whether exhibition names are primary in every language or English labels remain as stylistic section names with localized descriptions.

Recommended defaults:

- Use existing item images first, generate only if the hero lacks a strong visual.
- Implement mobile menu as part of the redesign because current navigation has too many destinations for small screens.
- Keep short English exhibition names as primary labels where they are part of the brand, with localized helper text and page descriptions.
