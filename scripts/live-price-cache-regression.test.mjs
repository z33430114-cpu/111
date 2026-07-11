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
      if (depth === 0) return sourceText.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

test("cacheLivePricePayload persists opening price payloads when any platform or reference quote is available", () => {
  const context = {
    appState: {
      livePrices: {}
    },
    livePriceKey: (id, wearId, variantId) => `${id}|${wearId}|${variantId}`,
    persistPriceCachesCalled: 0,
    persistPriceCaches: () => {
      context.persistPriceCachesCalled += 1;
    }
  };
  vm.createContext(context);
  vm.runInContext(`
${extractFunctionSource(appSource, "livePricePayloadHasPlatformQuote")}
${extractFunctionSource(appSource, "livePricePayloadHasReferenceQuote")}
${extractFunctionSource(appSource, "cacheLivePricePayload")}
`, context);

  context.cacheLivePricePayload({
    id: "case-1",
    wearId: "",
    variantId: "standard",
    referencePrice: 25,
    platforms: {
      buff: { status: "ok", price: 24 },
      youpin: { status: "unavailable", price: null }
    }
  });

  assert.equal(context.appState.livePrices["case-1||standard"]?.platforms?.buff?.price, 24);
  assert.equal(context.persistPriceCachesCalled, 1);
});

test("loadPlatformPrices does not reuse cached fallback payloads with only error statuses", async () => {
  const context = {
    appState: {
      livePrices: {
        "case-1||standard": {
          id: "case-1",
          referencePrice: 18,
          platforms: {
            buff: { status: "error", price: null },
            youpin: { status: "unavailable", price: null }
          }
        }
      },
      livePriceRequests: {}
    },
    livePriceKey: (id, wearId, variantId) => `${id}|${wearId}|${variantId}`,
    livePricePayloadNeedsRefresh: null,
    fetchJsonCalls: [],
    fetchJson: async (url) => {
      context.fetchJsonCalls.push(url);
      return {
        id: "case-1",
        wearId: "",
        variantId: "standard",
        referencePrice: 28,
        platforms: {
          buff: { status: "ok", price: 28 },
          youpin: { status: "unavailable", price: null }
        }
      };
    },
    cacheCatalogPriceOverride: () => {},
    loadMarketPricesSnapshot: async () => {},
    pageName: () => "openings.html",
    cacheLivePricePayload: (payload) => {
      context.cachedPayload = payload;
    },
    effectiveCatalogPriceRecord: () => ({ price: 18, source: "reference" }),
    syncedPriceSourceLabel: (value) => value,
    uiText: (en, zh) => zh || en,
    URLSearchParams,
    encodeURIComponent,
    Promise
  };
  vm.createContext(context);
  vm.runInContext(`
${extractFunctionSource(appSource, "livePricePayloadHasPlatformQuote")}
${extractFunctionSource(appSource, "livePricePayloadNeedsRefresh")}
${extractFunctionSource(appSource, "loadPlatformPrices")}
result = loadPlatformPrices;
`, context);

  await context.result({ id: "case-1" }, "", "standard");

  assert.equal(context.fetchJsonCalls.length, 1);
  assert.match(context.fetchJsonCalls[0], /\/api\/platform-prices\/case-1(?:\?variant=standard)?$/);
  assert.equal(context.cachedPayload?.referencePrice, 28);
});
