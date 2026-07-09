# Curator Console Loadout Redesign Design

## Goal

Redesign `loadout.html` into a premium red-black exhibition console while preserving every existing loadout capability and data flow.

This is a presentation redesign, not a product logic rewrite. The page must continue to support:

- AI loadout chat and recommendation generation.
- Budget-aware slot logic.
- Color and style filters.
- Inventory-driven upgrade recommendations.
- Refresh and rotate recommendation controls.
- Pro team and pro player loadout references.
- Existing localization behavior.
- Existing hydration, persistence, and event wiring.

The target is a page that feels like a curator control room inside the broader CS Exhibition system: sharp, architectural, information-dense, and credible as a real working tool.

## Design Read

This is a redesign of an existing functional product page for CS skin collectors and loadout hunters, with a luxury exhibition-console language, leaning toward a black architectural control surface rather than a marketing hero or a generic dashboard.

## Recommended Approach

Use a **single-page vertical Curator Console** layout.

This is preferred over two alternatives:

- **Full split-screen control wall**: visually striking, but too fragile for the current markup, async content growth, and mobile collapse.
- **Independent stacked card sections**: easy to implement, but too close to an ordinary SaaS page and not strong enough for the exhibition brief.

The recommended layout keeps the existing top-to-bottom flow in `renderLoadout()` and upgrades the page by changing hierarchy, framing, and surface treatment instead of changing product behavior.

## Current Functional Inventory

The current page already contains three core modules that must remain intact:

1. **AI loadout chat**
   - Budget input.
   - Prompt textarea.
   - Submit and clear actions.
   - Recommendation output with summarized request context.
   - Suggested item cards grouped by category tabs.

2. **Inventory upgrade recommendations**
   - Inventory-aware suggested upgrades.
   - Category tabs.
   - Combo summary strip.
   - Rotate set and refresh data actions.

3. **Pro loadout references**
   - Team grouping.
   - Expandable player sections.
   - Team and player visuals where available.
   - Source link.

The redesign must make these three areas feel like one curated system instead of three adjacent generic panels.

## Page Architecture

The redesigned page uses four stacked zones.

### 1. Curator Masthead

Purpose:

Establish the page as a command surface, not just a form and result list.

Content:

- Eyebrow: `CURATOR` or localized equivalent.
- Large page title.
- One concise line explaining that this console combines AI direction, inventory upgrades, and pro references.
- A slim operational metadata rail for state such as ready, preparing, refreshing, or loading references.

Visual treatment:

- Wide, low hero band rather than a tall landing-page hero.
- Matte black background with subtle red guide lines and soft architectural lighting.
- Optional stage image or abstract exhibit backdrop, but the text and controls remain primary.

### 2. Recommendation Command Deck

Purpose:

Make the AI loadout tool the dominant functional area.

Structure:

- Two-column layout on desktop.
- Left side: intent capture.
- Right side: recommendation output.

Left side contents:

- Budget input.
- Prompt textarea.
- Budget logic, color, and style filters.
- Primary action.
- Secondary clear action.
- Short helper copy.

Right side contents:

- Current AI recommendation.
- Request summary line.
- Total suggested cost summary when present.
- Category tabs.
- Suggested item grid.

Behavior:

- Existing IDs and event hooks remain unchanged.
- The form still submits through the same handlers.
- Empty, pending, and failure states remain visible in the recommendation pane.

Visual treatment:

- Feels like a built-in control module, not a plain card.
- Left form area uses harder edges, thin borders, and labeled fields.
- Right result area uses a more elevated exhibition tray feel.

### 3. Inventory Upgrade Runway

Purpose:

Present inventory-aware upgrades as a secondary but still premium rail.

Structure:

- Section heading and one-line explanation.
- Action cluster with `Another set` and `Refresh data`.
- Optional combo strip pinned near the section heading.
- Category tabs.
- Upgrade suggestion grid.

Behavior:

- Keep all current action buttons and tabs.
- Do not remove the loading or empty-state logic.

Visual treatment:

- Reads like curated trays laid out on a black table.
- Cards should look more like exhibit plates than generic ecommerce boxes.
- Price blocks become more disciplined and legible.

### 4. Pro Reference Archive

Purpose:

Treat pro player loadouts as a research archive instead of a leftover support block.

Structure:

- Section heading and context copy.
- Team grid.
- Team card with logo, source, and player list.
- Player trigger expands the player loadout detail inline.

Behavior:

- Existing expand/collapse behavior and `data-pro-player` hooks remain unchanged.
- `Load more teams` stays available where currently needed.

Visual treatment:

- Feels like a dossier wall or scouting archive.
- Team cards should be flatter and more editorial.
- Player rows should have clearer active-state emphasis.

## Visual System

### Color

Stay inside the existing exhibition palette and tighten it:

- Background base: near-black values such as `#030303`, `#070809`, `#0c0d10`.
- Surface fills: low-alpha white overlays and deep charcoal fills.
- Accent: one consistent red close to the existing exhibition red.
- Text:
  - Primary: warm white.
  - Secondary: muted cool gray.
  - Tertiary: subdued operational gray.

Rules:

- Red appears as guide lines, active tabs, focus outlines, and selective emphasis.
- Avoid large red fills across the full page.
- Avoid introducing blue, purple, or gold accents into this page unless they are item-image content.

### Typography

- Title area should feel editorial and architectural.
- Functional labels remain compact and readable.
- Body copy stays short and operational, not theatrical.
- Chinese and English both need to fit without crowding fields or tabs.

### Shape And Materiality

- Use one disciplined radius scale, mostly between `6px` and `10px`.
- Surfaces should feel like smoked glass, lacquered metal, and dark acrylic.
- Borders do more separation work than shadows.
- Shadows stay restrained and heavily diffused.

### Motion

- Reuse current motion system.
- Keep loadout first paint fast.
- Small hover lift and reveal treatments are enough.
- No animation should delay access to the form or result content.

## Layout Rules

### Desktop

- Main content width should align with the existing wider exhibition pages.
- Recommendation command deck is the most prominent region.
- Inventory runway and pro archive sit below in full-width sections.
- Section spacing should create progression without huge empty gaps.

### Tablet

- Recommendation deck can collapse into a stacked flow with the form first and output second.
- Filter controls should stay readable without forcing horizontal overflow.

### Mobile

- All modules stack vertically.
- Filters collapse into a one-column field group.
- Suggestion cards and pro sections remain readable at narrow widths.
- Buttons must stay on one line where possible, but may wrap if localization requires it.

## Functional Preservation Rules

The redesign must not silently remove or weaken:

- Any current button or form action.
- Any current loading state.
- Any empty-state explanation.
- Any category tab behavior.
- Any state persistence for drafts and cached data.
- Any IDs or data attributes used by current handlers.

If a control moves visually, its meaning and wiring must remain intact.

## Markup Strategy

Prefer **targeted markup evolution** inside `renderLoadout()` and related section render helpers.

Recommended changes:

- Add one new top-level loadout-specific wrapper class for the page.
- Add section-specific wrapper classes for the masthead, command deck, inventory runway, and pro archive.
- Keep existing form IDs, button IDs, and data attributes exactly where the handlers expect them.
- Introduce only as much extra structure as needed for the new layout.

Avoid:

- Rewriting loadout state logic.
- Splitting the page into unrelated render paths.
- Renaming long-standing hooks unless every consumer is updated intentionally.

## Styling Strategy

Primary work should happen in `styles.css` through loadout-specific selectors.

Recommended styling approach:

- Keep the generic `.ai-panel` system intact for other pages.
- Layer stronger `#loadoutRoot` and loadout-specific variants on top.
- Reuse nearby `archive`, `console`, and `obsidian` visual language where it already fits.
- Avoid changing global button or panel styles in ways that would regress other routes.

## Copy Direction

The page copy should sound like a premium tool, not a fantasy narrative.

Good direction:

- `Curator`
- `Describe your ideal setup`
- `Inventory upgrade`
- `Pro references`
- `Budget logic`
- `Refreshing market context`

Avoid:

- Overwritten luxury prose.
- Long poetic subtitles.
- Fake institutional jargon that hides real function.

## Loading, Empty, And Failure States

These states must remain explicit and visually integrated.

### AI chat states

- No input yet.
- Thinking.
- Recommendation available.
- Recommendation failed.

### Inventory recommendation states

- Preparing recommendations.
- Loading inventory style analysis.
- Empty/no matching items.
- Refreshing data.

### Pro reference states

- Loading pro references.
- Temporarily unavailable.
- Loaded with expandable players.

The redesign should make these states feel like part of the console, not temporary placeholders bolted on later.

## Accessibility Requirements

- Keyboard focus must remain visible on dark surfaces.
- Red accents alone cannot communicate active or error state.
- Form controls need sufficient contrast.
- Expandable pro player triggers must remain obvious buttons.
- Section headings need clear hierarchy for scanning and assistive reading.

## Implementation Boundaries

Modify only what serves the redesign.

Expected implementation files:

- `C:\Users\35191\Documents\git1\app.js`
- `C:\Users\35191\Documents\git1\styles.css`
- Potentially `C:\Users\35191\Documents\git1\loadout.html` only if a shell-level class or asset hook is necessary.

Do not change:

- Backend APIs.
- AI recommendation request shape.
- Inventory recommendation logic.
- Pro loadout data shape.
- Localization runtime behavior beyond text additions or wording refinements needed for this page.

## Verification Plan

After implementation, verify:

1. `loadout.html` still renders a usable frame immediately.
2. Budget input, prompt input, and all filters remain functional.
3. AI submit and clear still work.
4. AI recommendation output still renders tabs and cards correctly.
5. Inventory recommendation actions still refresh and rotate content.
6. Inventory and loadout category tabs still switch correctly.
7. Pro team cards still expand player sections correctly.
8. Existing Chinese and English text still fit in the redesigned layout.
9. Desktop and mobile layouts preserve readability and do not overflow.
10. Reduced-motion behavior remains safe and usable.

## Implementation Recommendation

Build this in one focused page pass:

1. Update the `renderLoadout()` page skeleton and section wrappers.
2. Upgrade section-specific markup in the loadout render helpers.
3. Add loadout-specific styles in `styles.css`.
4. Verify interactions and responsive behavior.

This preserves momentum and reduces the risk of halfway states where the page has mixed old and new visual systems.
