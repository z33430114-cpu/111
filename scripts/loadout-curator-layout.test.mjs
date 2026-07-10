import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appJs = await readFile(join(process.cwd(), "app.js"), "utf8");
const stylesCss = await readFile(join(process.cwd(), "styles.css"), "utf8");

test("loadout page renders curator console wrappers and preserves interaction hooks", () => {
  assert.match(appJs, /curator-console-shell/, "loadout page should render a curator console shell");
  assert.match(appJs, /curator-workbench-stage/, "loadout page should render a workbench stage");
  assert.match(appJs, /curator-workbench-frame/, "loadout page should render the preview-like workbench frame");
  assert.match(appJs, /curator-inventory-browser/, "loadout page should render the central inventory browser");
  assert.match(appJs, /curator-loadout-stack/, "loadout page should render the right loadout stack");
  assert.match(appJs, /curator-fixed-savebar/, "loadout page should render the bottom save bar");
  assert.match(appJs, /curator-slot-rail/, "loadout page should render the loadout slot rail");
  assert.doesNotMatch(appJs.slice(appJs.indexOf("function renderLoadout"), appJs.indexOf("function renderCompareTray")), /curator-command-deck/, "AI advisor command deck should be removed");
  assert.match(appJs, /curator-runway/, "loadout page should render an inventory runway section");
  assert.match(appJs, /curator-route-summary-panel/, "loadout page should render a loadout summary panel");
  assert.match(appJs, /curator-pro-archive/, "loadout page should render a pro archive section");
  assert.match(appJs, /aiLoadoutFilterBarMarkup/, "loadout filter bar must remain");
  assert.match(appJs, /id="rotateAiInventoryUpgradeGroupButton"/, "inventory rotate button id must be preserved");
  assert.match(appJs, /data-curator-save-loadout/, "save loadout button hook should be present");
  assert.match(appJs, /data-curator-clear-loadout/, "clear loadout button hook should be present");
  assert.match(appJs, /data-curator-add-key/, "inventory cards should expose add-to-loadout hooks");
  assert.match(appJs, /aria-pressed=\"\$\{isSelected \? \"true\" : \"false\"\}\"/, "selected cards should be toggleable");
  assert.match(appJs, /data-curator-remove-key/, "stack cards should expose remove-from-loadout hooks");
  assert.match(appJs, /data-curator-group-toggle/, "inventory groups should expose collapse hooks");
  assert.match(appJs, /catalog\.html\?from=loadout/, "empty slots should link to the catalog picker");
  assert.match(appJs, /data-catalog-loadout-add/, "catalog cards should expose add-to-loadout hooks");
  assert.match(appJs, /data-item-add-loadout/, "item inspector should expose add-to-loadout hooks");
  assert.match(appJs, /function consumeCatalogLoadoutAddition/, "loadout should consume catalog selections");
  assert.match(appJs, /function curatorImageMarkup/, "loadout images should have a visible fallback");
  assert.match(appJs, /data-pro-team=/, "pro loadouts should expose team grouping hooks");
  assert.match(appJs, /proTeamLogoMarkup/, "pro team groups should render team logos");
  assert.match(appJs, /data-pro-player=/, "pro player toggle hook must be preserved");
});

test("loadout workbench has editable selection state handlers", () => {
  assert.match(appJs, /aiLoadoutSelectedKeys/, "loadout selections should persist in AI loadout state");
  assert.match(appJs, /aiLoadoutSelectionTouched/, "empty user selections should not fall back to defaults");
  assert.match(appJs, /function addCuratorLoadoutItem/, "loadout page should add items to the current stack");
  assert.match(appJs, /function removeCuratorLoadoutItem/, "loadout page should remove items from the current stack");
  assert.match(appJs, /function clearCuratorLoadoutSelection/, "loadout page should clear selected stack items");
  assert.match(appJs, /function toggleCuratorInventoryGroup/, "loadout page should collapse inventory groups");
  assert.match(appJs, /\.ai-suggestion-card-clickable\[data-href\]/, "new curator cards should keep detail navigation");
});

test("loadout page remembers state and coalesces repeated renders", () => {
  assert.match(appJs, /function restoreLoadoutPageMemory/, "loadout page should restore page memory after navigation");
  assert.match(appJs, /activeProTeamKey/, "loadout page should remember the active pro team");
  assert.match(appJs, /function requestLoadoutRender/, "loadout page should batch repeated render requests");
  assert.match(appJs, /loadoutRenderScheduled/, "loadout render batching should use a scheduled flag");
  assert.match(appJs, /loadoutWorkbenchCache/, "loadout page should cache expensive workbench candidates per render state");
});

test("curator console styles include desktop and responsive layout rules", () => {
  assert.match(stylesCss, /curator-console-shell/, "styles should define curator console shell");
  assert.match(stylesCss, /curator-workbench-stage/, "styles should define workbench stage");
  assert.match(stylesCss, /curator-workbench-frame/, "styles should define workbench frame");
  assert.match(stylesCss, /curator-inventory-browser/, "styles should define inventory browser");
  assert.match(stylesCss, /curator-loadout-stack/, "styles should define loadout stack");
  assert.match(stylesCss, /curator-fixed-savebar/, "styles should define fixed savebar");
  assert.match(stylesCss, /curator-slot-rail/, "styles should define slot rail");
  assert.match(stylesCss, /curator-image-fallback/, "styles should define image fallbacks");
  assert.match(stylesCss, /curator-route-summary-panel/, "styles should define summary panel");
  assert.match(stylesCss, /curator-card-action/, "styles should define add-to-loadout card action");
  assert.match(stylesCss, /curator-operating-grid/, "styles should define operating grid");
  assert.match(stylesCss, /curator-console-stage > \.curator-operating-grid/, "page-level loadout grid should be scoped to the console stage");
  assert.match(stylesCss, /curator-workbench-frame > \.curator-operating-grid/, "editable workbench grid should be scoped separately from the page grid");
  assert.match(stylesCss, /curator-runway-head/, "styles should define runway heading layout");
  assert.match(stylesCss, /curator-pro-head/, "styles should define pro archive heading layout");
  assert.match(stylesCss, /@media \(max-width: 1024px\)[\s\S]*curator-operating-grid/, "tablet rules should collapse the workbench grid");
  assert.match(stylesCss, /@media \(max-width: 760px\)[\s\S]*curator-console-shell/, "mobile rules should collapse the curator shell");
  assert.match(stylesCss, /@media \(max-width: 620px\)[\s\S]*curator-inventory-card-grid/, "small mobile rules should prevent workbench card overflow");
});
