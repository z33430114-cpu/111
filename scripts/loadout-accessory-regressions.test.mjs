import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appJs = await readFile(join(process.cwd(), "app.js"), "utf8");
const stylesCss = await readFile(join(process.cwd(), "styles.css"), "utf8");
const loadoutHtml = await readFile(join(process.cwd(), "loadout.html"), "utf8");
const loadoutData = await readFile(join(process.cwd(), "loadout-data.js"), "utf8");
const serveMjs = await readFile(join(process.cwd(), "scripts", "serve.mjs"), "utf8");

test("current loadout uses explicit click pagination instead of a horizontal swipe rail", () => {
  const source = appJs.slice(appJs.indexOf("function curatorSlotRailMarkup"), appJs.indexOf("function curatorInventoryCardMarkup"));
  assert.match(source, /data-curator-slot-page/);
  assert.match(source, /aiLoadoutSlotPage/);
  assert.match(stylesCss, /#loadoutRoot \.curator-slot-list[\s\S]{0,220}grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(stylesCss, /#loadoutRoot \.curator-slot-list[\s\S]{0,500}overflow-x:\s*auto/);
});

test("owned badge requires the same resolved catalog item and normalized item name", () => {
  const source = appJs.slice(appJs.indexOf("function loadoutWorkbenchCandidates"), appJs.indexOf("function selectedCuratorLoadoutKeys"));
  assert.match(source, /inventoryOwnershipKeys/);
  assert.match(source, /inventoryCandidateOwnershipKey/);
});

test("inventory lane retains synced knives gloves and guns in separate groups", () => {
  const source = appJs.slice(appJs.indexOf("function loadoutInventoryItemAllowedForWorkbench"), appJs.indexOf("function curatedFallbackCatalogCandidates"));
  const browserSource = appJs.slice(appJs.indexOf("function curatorInventoryBrowserMarkup"), appJs.indexOf("function curatorLoadoutStackMarkup"));
  assert.match(source, /inventorySortGroup\(entry\)/);
  assert.match(browserSource, /candidate\.group/);
  assert.doesNotMatch(browserSource, /candidate\.source === "inventory"\s*\?\s*"inventory"/);
});

test("budget filter is a user-entered value and always requests maximize mode", () => {
  const filterSource = appJs.slice(appJs.indexOf("function aiLoadoutFilterBarMarkup"), appJs.indexOf("function latestLoadoutRecommendationState"));
  const chatSource = appJs.slice(appJs.indexOf("async function requestAiLoadoutChat"), appJs.indexOf("function clearAiLoadoutChat"));
  assert.match(filterSource, /id="aiLoadoutBudgetInput"/);
  assert.doesNotMatch(filterSource, /id="aiLoadoutPresetSelect"/);
  assert.match(chatSource, /budgetMode:\s*"maximize"/);
});

test("named loadout images use catalog and entry-image fallbacks", () => {
  const source = appJs.slice(appJs.indexOf("function resolveCatalogImageForSuggestion"), appJs.indexOf("function proLoadoutHref"));
  assert.match(source, /CS2_CATALOG/);
  assert.match(appJs, /item\?\.image \|\| entry\?\.image \|\| resolveCatalogImageForSuggestion/);
  assert.match(loadoutHtml, /loadout-data\.js/);
  assert.match(appJs, /function loadoutImageUrl/);
  assert.match(serveMjs, /steamstatic\\\.com/);
  for (const name of ["AK-47 | Fire Serpent", "AK-47 | Asiimov", "M4A1-S | Printstream", "AK-47 | Redline"]) {
    const entryStart = loadoutData.indexOf(`nameEn: "${name}"`);
    assert.ok(entryStart >= 0, `missing ${name} catalog entry`);
    assert.match(loadoutData.slice(entryStart, entryStart + 1200), /image: "https:\/\/cdn\.cs\.trade\/images\/cs2\/wiki\/[a-f0-9]+\.avif"/);
  }
  assert.match(loadoutHtml, /loadout-data\.js\?v=20260711loadoutfix2/);
});

test("upgrade runway provides visible progress and prevents concurrent rotations", () => {
  const source = appJs.slice(appJs.indexOf("async function rotateAiInventoryUpgradeGroup"), appJs.indexOf("async function ensureAiProLoadouts"));
  assert.match(source, /aiInventoryUpgradeRotating/);
  assert.match(source, /try \{/);
  assert.match(source, /finally \{/);
  assert.match(appJs, /rotateAiInventoryUpgradeGroupButton[\s\S]{0,450}aiInventoryUpgradeRotating/);
});

test("pro player expansion preserves the clicked player viewport position", () => {
  const clickSource = appJs.slice(appJs.indexOf("const proPlayerSwitch"), appJs.indexOf("const proTeamSwitch"));
  assert.match(clickSource, /preserveElementViewportDuringRender\(proPlayerSwitch/);
});
