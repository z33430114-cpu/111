import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const loadoutHtml = await readFile(join(process.cwd(), "loadout.html"), "utf8");
const appJs = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractFunctionSource(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `${name} should exist`);
  const bodyStart = source.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${name} should have a body`);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to extract ${name}`);
}

test("loadout page defers catalog data instead of booting the heavy inline catalog bundle", () => {
  assert.doesNotMatch(loadoutHtml, /catalog-data\.js/);
  assert.match(loadoutHtml, /<script defer src="catalog-meta\.js/);
  assert.match(loadoutHtml, /<script defer src="data\.js\?v=20260707b/);
  assert.match(loadoutHtml, /<script defer src="loadout-data\.js\?v=20260710loadout1/);
  assert.match(loadoutHtml, /<script defer src="app\.js\?v=/);
});

test("loadout page does not replace the original app shell with recovery UI", () => {
  assert.match(loadoutHtml, /<main class="account-page" id="loadoutRoot"><\/main>/);
  assert.doesNotMatch(loadoutHtml, /data-loadout-boot-watchdog|loadout-boot-fallback|renderInlineLoadoutFallback/);
  assert.doesNotMatch(loadoutHtml, /Curator Recovery|离线恢复模式/);
});

test("app boot renders page content before optional locale hydration", () => {
  const bootStart = appJs.indexOf("async function boot()");
  assert.notEqual(bootStart, -1, "boot() should exist");
  const bootSource = appJs.slice(bootStart, appJs.indexOf("boot().catch", bootStart));
  const renderIndex = bootSource.indexOf("await renderCurrentPage()");
  const localeIndex = bootSource.indexOf("ensureCatalogLocaleLoaded");
  assert.notEqual(renderIndex, -1, "boot should render the current page");
  assert.notEqual(localeIndex, -1, "boot should still hydrate catalog locale data");
  assert.ok(renderIndex < localeIndex, "loadout must render before optional locale hydration can stall");
});

test("loadout runtime batches rerenders and restores page memory", () => {
  assert.match(appJs, /function requestLoadoutRender/, "loadout runtime should coalesce repeated renders");
  assert.match(appJs, /restoreLoadoutPageMemory/, "loadout runtime should restore page memory after full-page navigation");
  assert.match(appJs, /requestLoadoutRender\(\);/, "loadout state changes should request a scheduled render");
});

test("loadout first paint avoids heavyweight catalog and inventory sync work", () => {
  const pageNeedsCatalogSource = extractFunctionSource(appJs, "pageNeedsCatalogData");
  assert.match(pageNeedsCatalogSource, /"openings\.html"/, "opening pages still need catalog data");
  assert.doesNotMatch(pageNeedsCatalogSource, /"loadout\.html"/, "pageNeedsCatalogData should not require full catalog for loadout");
  assert.doesNotMatch(appJs, /currentPageNeedsCatalogData = \[[^\]]*"loadout\.html"[^\]]*\]/, "renderCurrentPage should not dynamically load catalog-data for loadout first paint");
  assert.match(appJs, /pageName\(\) === "inventory\.html" && appState\.session\?\.steamId/, "Steam auto sync should stay on inventory page only");
  assert.doesNotMatch(appJs, /pageName\(\) === "inventory\.html" \|\| pageName\(\) === "loadout\.html"[\s\S]*runSteamSync/, "loadout should not auto-run Steam sync on boot");
});
