import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const stylesSource = await readFile(join(process.cwd(), "styles.css"), "utf8");
const loadoutHtml = await readFile(join(process.cwd(), "loadout.html"), "utf8");
const favoritesHtml = await readFile(join(process.cwd(), "favorites.html"), "utf8");
const loadoutSource = appSource.slice(
  appSource.indexOf("function curatorSidebarMarkup"),
  appSource.indexOf("function renderCompareTray")
);

test("loadout renders a twelve-slot rail with click pagination", () => {
  const slotRailSource = appSource.slice(
    appSource.indexOf("function curatorSlotRailMarkup"),
    appSource.indexOf("function curatorInventoryCardMarkup")
  );

  assert.match(slotRailSource, /const slots = \[[\s\S]*?"agent"[\s\S]*?\];/);
  assert.doesNotMatch(slotRailSource, /const slots = \["knife", "glove", "rifle", "rifle", "pistol", "smg"\]/);
  assert.match(slotRailSource, /data-curator-slot-page/);
  assert.doesNotMatch(stylesSource, /#loadoutRoot \.curator-slot-list[\s\S]{0,500}overflow-x:\s*auto/);
});

test("loadout keeps the original app-rendered shell instead of recovery UI", () => {
  assert.match(loadoutHtml, /<main class="account-page" id="loadoutRoot"><\/main>/);
  assert.doesNotMatch(loadoutHtml, /Curator Recovery|离线恢复模式|renderInlineLoadoutFallback|loadout-recovery-card/);
  assert.doesNotMatch(stylesSource, /loadout-recovery-card|loadout-recovery-grid/);
});

test("loadout keeps rifle recommendations separate from inventory candidates", () => {
  const candidateSource = appSource.slice(
    appSource.indexOf("function loadoutWorkbenchCandidates"),
    appSource.indexOf("function selectedCuratorLoadoutKeys")
  );

  assert.match(candidateSource, /recommendationCandidates/);
  assert.match(candidateSource, /inventoryCandidates/);
  assert.match(candidateSource, /owned/);
  assert.ok(
    candidateSource.indexOf("recommendationCandidates") < candidateSource.indexOf("const candidates"),
    "recommendation candidates must be assembled before inventory candidates are appended"
  );
  assert.match(candidateSource, /const syncedInventoryCandidates = getSortedInventoryEntries\(\)/);
  assert.match(candidateSource, /const inventoryOwnershipKeys = new Set\(syncedInventoryCandidates\.map\(inventoryCandidateOwnershipKey\)/);
  assert.doesNotMatch(candidateSource, /const ownedIds = new Set\(inventoryCandidates\.map/);
});

test("loadout AI chat and filters share one normalized query state", () => {
  assert.match(appSource, /function syncAiLoadoutQueryState/);
  const chatSource = appSource.slice(
    appSource.indexOf("async function requestAiLoadoutChat"),
    appSource.indexOf("function clearAiLoadoutChat")
  );
  assert.match(chatSource, /syncAiLoadoutQueryState\(/);
  assert.match(appSource, /ai-loadout-filters[\s\S]*syncAiLoadoutQueryState\(/);
  const browserSource = appSource.slice(
    appSource.indexOf("function curatorInventoryBrowserMarkup"),
    appSource.indexOf("function curatorLoadoutStackMarkup")
  );
  const chatMarkupSource = appSource.slice(
    appSource.indexOf("function aiChatMarkup"),
    appSource.indexOf("function aiProLoadoutsMarkup")
  );
  assert.match(browserSource, /aiLoadoutFilterBarMarkup\(\)/);
  assert.doesNotMatch(chatMarkupSource, /aiLoadoutFilterBarMarkup\(\)/);
});

test("loadout filter changes invalidate candidates and are sent to the backend", () => {
  const querySource = appSource.slice(
    appSource.indexOf("function syncAiLoadoutQueryState"),
    appSource.indexOf("async function requestAiLoadoutChat")
  );
  const chatSource = appSource.slice(
    appSource.indexOf("async function requestAiLoadoutChat"),
    appSource.indexOf("function clearAiLoadoutChat")
  );
  const changeSource = appSource.slice(
    appSource.indexOf("if ([\"aiLoadoutPresetSelect\""),
    appSource.indexOf("if (target.id === \"sortFilter\")")
  );

  assert.match(querySource, /appState\.loadoutWorkbenchCache\s*=\s*\{\s*key:\s*""\s*,\s*value:\s*null\s*\}/);
  assert.match(chatSource, /filterOverrides/);
  assert.match(chatSource, /preset:\s*filterOverrides\.preset/);
  assert.match(chatSource, /color:\s*filterOverrides\.color/);
  assert.match(chatSource, /style:\s*filterOverrides\.style/);
  assert.doesNotMatch(changeSource, /requestAiLoadoutChat\(\)/);
  assert.match(appSource, /function loadoutCandidateMatchesFilters/);
  assert.match(appSource, /function loadoutEntryAllowedForWorkbench/);
  assert.match(appSource, /sticker\|graffiti\|case\|capsule\|container\|tool/);
  assert.match(appSource, /candidates\.filter\(loadoutEntryAllowedForWorkbench\)\.filter\(loadoutCandidateMatchesFilters\)/);
});

test("loadout advisor is removed while the filter bar remains", () => {
  const renderSource = appSource.slice(appSource.indexOf("function renderLoadout"), appSource.indexOf("function renderCompareTray"));
  assert.doesNotMatch(renderSource, /aiChatMarkup\(\)|curator-command-deck|curatorRecommendationRailMarkup\(\)/);
  assert.match(renderSource, /curatorWorkbenchMarkup\(\)/);
  assert.match(appSource, /取消选择/);
  assert.match(appSource, /current\.includes\(key\)/);
});

test("loadout inventory lane exposes synced knives gloves and guns", () => {
  const candidateSource = appSource.slice(
    appSource.indexOf("const LOADOUT_INVENTORY_ALLOWED_WEAPONS"),
    appSource.indexOf("function loadoutWorkbenchCandidates")
  );

  assert.match(candidateSource, /LOADOUT_INVENTORY_ALLOWED_WEAPONS/);
  assert.match(candidateSource, /AK-47/);
  assert.match(candidateSource, /M4A1-S/);
  assert.match(candidateSource, /M4A4/);
  assert.match(candidateSource, /USP-S/);
  assert.match(candidateSource, /Glock-18/);
  assert.match(candidateSource, /AWP/);
  assert.match(candidateSource, /LOADOUT_INVENTORY_BLOCKED_WEAPONS/);
  assert.match(candidateSource, /famas\|法玛斯/);
  assert.match(candidateSource, /inventorySortGroup\(entry\)/);
  assert.match(appSource, /const syncedInventoryCandidates = getSortedInventoryEntries\(\)\s*\.filter\(loadoutInventoryItemAllowedForWorkbench\)/);
});

test("saved loadout rendering tolerates unresolved inventory entries", () => {
  assert.match(appSource, /function localeText\(item, field\) \{\s*if \(!item \|\| typeof item !== "object"\) return "";/);
  assert.match(appSource, /function itemTitle\(item\) \{\s*if \(!item \|\| typeof item !== "object"\) return "";/);
  assert.match(appSource, /function itemWeapon\(item\) \{\s*if \(!item \|\| typeof item !== "object"\) return "";/);
  assert.match(loadoutHtml, /app\.js\?v=20260711loadoutfix2/);
});

test("saved curator loadouts are stored and rendered in favorites", () => {
  assert.match(appSource, /const LOADOUT_FAVORITES_KEY = "cs2-relic-hall:favorite-loadouts"/);
  assert.match(appSource, /function getFavoriteLoadouts/);
  assert.match(appSource, /function saveCurrentCuratorLoadout/);
  assert.match(appSource, /persistCuratorSelection\(selectedItems\.map\(\(entry\) => entry\.key\)\)/);
  assert.match(appSource, /document\.querySelectorAll\("\.curator-inventory-card"\)/);
  assert.match(appSource, /function favoriteLoadoutCardMarkup/);
  assert.match(appSource, /const loadoutFavorites = getFavoriteLoadouts\(\)/);
  assert.match(appSource, /favorites-loadout-section/);
  assert.match(appSource, /data-loadout-favorite-id/);
  assert.match(favoritesHtml, /app\.js\?v=/);
  const clickSource = appSource.slice(
    appSource.indexOf("if (target.closest(\"[data-curator-save-loadout]\")"),
    appSource.indexOf("const aiCategorySwitch")
  );
  assert.match(clickSource, /saveCurrentCuratorLoadout\(\)/);
  assert.doesNotMatch(clickSource, /Loadout stack saved on this device/);
});

test("loadout has no market trend strip and keeps visible copy readable", () => {
  assert.doesNotMatch(loadoutSource, /curatorMarketStripMarkup|curator-market-strip|Market Trends|市场趋势/);
  assert.doesNotMatch(loadoutHtml, /�|Ã|Â|锟斤拷/);
  assert.match(appSource, /replaceAll\("鍏ㄩ儴", "全部"\)/);
  assert.match(appSource, /replaceAll\("娣锋惌", "混搭"\)/);
  assert.match(appSource, /replaceAll\("娌欓拱", "沙漠之鹰"\)/);
});
