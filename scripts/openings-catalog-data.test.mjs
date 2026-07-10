import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractFunctionSource(sourceText, name) {
  const markers = [`async function ${name}`, `function ${name}`];
  const marker = markers.find((entry) => sourceText.includes(entry));
  const start = marker ? sourceText.indexOf(marker) : -1;
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start + marker.length);
  if (paramsStart === -1) throw new Error(`Unable to find params for ${name}`);
  let parenDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "(") parenDepth += 1;
    if (char === ")") {
      parenDepth -= 1;
      if (parenDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  const bodyStart = paramsEnd === -1 ? -1 : sourceText.indexOf("{", paramsEnd);
  if (bodyStart === -1) throw new Error(`Unable to find body for ${name}`);
  let depth = 0;
  for (let index = bodyStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1).trim();
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

function buildAppFunction(name, overrides = {}) {
  const context = {
    DEFAULT_DETAIL_ALIAS: "ak-inheritance",
    appState: {},
    globalThis: {},
    location: { search: "" },
    URLSearchParams,
    getInspectorState: () => ({}),
    resolveDisplayItemById: () => null,
    openingDataAvailable: () => false,
    pageName: () => "openings.html",
    restoreCurrentPageMemory: () => {},
    restoreCurrentPageScroll: () => {},
    prepareDeferredImageState: () => {},
    renderPageContent: () => {},
    markActiveNavigation: () => {},
    applyPageMotionState: () => {},
    scheduleDeferredImageHydration: () => {},
    ensureCatalogAssetsLoaded: async () => {},
    ensureCatalogDataLoaded: async () => {},
    ensureOpeningDataLoaded: async () => {},
    ensureItemDetailDataLoaded: async () => {},
    ensureItemRelatedDataLoaded: async () => {},
    Promise,
    Array,
    ...overrides
  };
  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, name)};\nresult = ${name};`;
  return {
    fn: vm.runInContext(source, context),
    context
  };
}

test("renderCurrentPage waits for opening data on openings page", async () => {
  const calls = [];
  const { fn } = buildAppFunction("renderCurrentPage", {
    ensureCatalogDataLoaded: async () => { calls.push("catalog"); },
    ensureOpeningDataLoaded: async () => { calls.push("opening"); }
  });

  await fn();

  assert.deepEqual(calls, ["opening"]);
});

test("renderCurrentPage renders loadout page without waiting for catalog data", async () => {
  const calls = [];
  const { fn } = buildAppFunction("renderCurrentPage", {
    pageName: () => "loadout.html",
    ensureCatalogDataLoaded: async () => { calls.push("catalog"); },
    renderPageContent: () => { calls.push("render"); }
  });

  await fn();

  assert.deepEqual(calls, ["render"]);
});

test("opening loot cache is invalidated when catalog state is rebuilt", () => {
  assert.match(appSource, /function rebuildCatalogState[\s\S]*openingLootCache\.clear\(\);/);
  assert.match(appSource, /function mergeCatalogEntries[\s\S]*openingLootCache\.clear\(\);/);
});
