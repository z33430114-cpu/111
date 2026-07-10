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
  const bodyStart = sourceText.indexOf("{", paramsEnd);
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
  const root = { innerHTML: "" };
  const context = {
    appState: {
      openingRenderToken: 0,
      activeOpeningId: "case-1",
      livePrices: {
        "case-1||standard": {
          id: "case-1",
          referencePrice: 55
        }
      },
      livePriceRequests: {},
      aiOpeningAnalyses: {},
      aiOpeningAnalysisRequests: {},
      openingSpinning: false,
      openingDeferredRender: false,
      openingRefreshOnReturn: true
    },
    document: {
      getElementById(id) {
        return id === "openingsRoot" ? root : null;
      }
    },
    ensureActiveOpening: () => ({ id: "case-1", kind: "container" }),
    openingRunwayHeroMarkup: () => "<section>hero</section>",
    openingRunwayRailMarkup: () => "<section>rail</section>",
    openingSimulatorMarkup: () => "<section>sim</section>",
    escapeHtml: (value) => String(value),
    uiText: (en, zh) => zh || en,
    openingItems: [{ id: "case-1", kind: "container" }],
    ensureOpeningDataLoaded: async () => {},
    renderOpeningPickerPortal: () => {},
    scheduleUiTask: (callback) => callback(),
    renderOpeningIndex: () => {},
    livePriceKey: (id, wearId, variantId) => `${id}|${wearId}|${variantId}`,
    refreshOpeningAsyncPanels: () => true,
    refreshVisibleOpeningPrices: () => {},
    ensureAiOpeningAnalysis: async () => {},
    loadPlatformPricesCalls: [],
    loadPlatformPrices: (...args) => {
      context.loadPlatformPricesCalls.push(args);
      return Promise.resolve({});
    },
    pageName: () => "openings.html",
    requestAnimationFrame: (callback) => callback(),
    ...overrides
  };
  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, name)};\nresult = ${name};`;
  return {
    fn: vm.runInContext(source, context),
    context
  };
}

test("renderOpenings refreshes the active opening price after returning to the page even when cached data exists", async () => {
  const { fn, context } = buildAppFunction("renderOpenings");

  fn();
  await Promise.resolve();

  assert.equal(context.loadPlatformPricesCalls.length, 1);
  assert.equal(context.loadPlatformPricesCalls[0][0]?.id, "case-1");
  assert.equal(context.loadPlatformPricesCalls[0][0]?.kind, "container");
  assert.equal(context.loadPlatformPricesCalls[0][1], "");
  assert.equal(context.loadPlatformPricesCalls[0][2], "standard");
  assert.equal(context.loadPlatformPricesCalls[0][3]?.force, true);
  assert.equal(context.appState.openingRefreshOnReturn, false);
});

test("ensureActiveOpening keeps the restored opening id while opening data is still loading", () => {
  const context = {
    appState: {
      activeOpeningId: "saved-case"
    },
    openingItems: [],
    Number
  };
  vm.createContext(context);
  vm.runInContext(`
${extractFunctionSource(appSource, "openingById")}
${extractFunctionSource(appSource, "openingHasLoot")}
${extractFunctionSource(appSource, "ensureActiveOpening")}
result = ensureActiveOpening();
`, context);

  assert.equal(context.result, null);
  assert.equal(context.appState.activeOpeningId, "saved-case");
});

test("restoreOpeningState marks openings page boot for a fresh active price sync", () => {
  const context = {
    OPENING_STATE_KEY: "cs2-relic-hall:openings",
    appState: {
      activeOpeningId: "",
      openingBatchCount: 10,
      openingRefreshOnReturn: false
    },
    readLocalJson: () => ({
      activeOpeningId: "saved-case",
      openingBatchCount: 7,
      openingResultOpeningId: "",
      openingResult: null,
      openingBatchResults: [],
      openingHistory: [],
      openingPickerKind: "",
      openingHistoryPage: 0
    }),
    sanitizeOpeningResult: () => null,
    sanitizeOpeningHistoryEntry: () => null,
    pageName: () => "openings.html",
    Math,
    Number,
    String,
    Array
  };
  vm.createContext(context);
  vm.runInContext(`
${extractFunctionSource(appSource, "restoreOpeningState")}
restoreOpeningState();
`, context);

  assert.equal(context.appState.activeOpeningId, "saved-case");
  assert.equal(context.appState.openingRefreshOnReturn, true);
});

test("opening list and runway cards render from live price data instead of static snapshot only", () => {
  assert.match(appSource, /function openingDisplayContainerPrice[\s\S]*appState\.livePrices\[livePriceKey\(item\.id, "", "standard"\)\]/);
  assert.match(appSource, /function openingCardMarkup[\s\S]*openingDisplayContainerPrice\(item\)/);
  assert.match(appSource, /function openingRunwayRailMarkup[\s\S]*openingDisplayContainerPrice\(item\)/);
});

test("renderOpenings schedules visible opening price refreshes for list cards", () => {
  assert.match(appSource, /function refreshVisibleOpeningPrices/);
  assert.match(appSource, /function renderOpenings[\s\S]*refreshVisibleOpeningPrices\(activeOpening\)/);
});

test("refreshVisibleOpeningPrices still refreshes visible openings when cached values are only fallback errors", async () => {
  const context = {
    appState: {
      openingRenderToken: 9,
      openingSpinning: false,
      livePrices: {
        "case-1||standard": {
          id: "case-1",
          referencePrice: 18,
          platforms: {
            buff: { status: "error", price: null },
            youpin: { status: "error", price: null }
          }
        }
      },
      livePriceRequests: {}
    },
    openingItems: [{ id: "case-1" }, { id: "case-2" }],
    pageName: () => "openings.html",
    openingVisiblePriceItems: () => [{ id: "case-1" }, { id: "case-2" }],
    livePriceKey: (id, wearId, variantId) => `${id}|${wearId}|${variantId}`,
    livePricePayloadNeedsRefresh: (payload) => !payload || payload?.platforms?.buff?.status === "error",
    loadPlatformPricesCalls: [],
    loadPlatformPrices: (...args) => {
      context.loadPlatformPricesCalls.push(args);
      return Promise.resolve({ ok: true });
    },
    renderOpenings: () => {},
    Promise
  };
  vm.createContext(context);
  vm.runInContext(`
${extractFunctionSource(appSource, "refreshVisibleOpeningPrices")}
result = refreshVisibleOpeningPrices;
`, context);

  context.result({ id: "case-1" });
  await Promise.resolve();
  await Promise.resolve();

  assert.deepEqual(context.loadPlatformPricesCalls.map((args) => args[0]?.id), ["case-1", "case-2"]);
});
