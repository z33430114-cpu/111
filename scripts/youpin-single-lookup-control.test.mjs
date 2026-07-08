import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const serveSource = await readFile(new URL("../scripts/serve.mjs", import.meta.url), "utf8");

function extractFunctionSource(sourceText, name) {
  const markers = [`async function ${name}`, `function ${name}`];
  const start = markers
    .map((marker) => sourceText.indexOf(marker))
    .find((index) => index !== -1);
  if (start == null || start === -1) throw new Error(`Unable to find ${name}`);
  const signatureEnd = sourceText.indexOf(")", start);
  const bodyStart = sourceText.indexOf("{", signatureEnd);
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

test("fetchYoupinSingleRecordForUser stops after the first matched wear", async () => {
  const calls = [];
  const writes = [];
  const persisted = [];
  const context = {
    selectPlatformSession: {
      youpin: {
        get: () => ({ status: "connected" })
      }
    },
    buildYoupinAuth: () => ({ ok: true }),
    loadMarketPricesSnapshot: async () => ({
      items: {
        "skin-a": {
          prices: {
            "field-tested": { marketHashName: "ft" },
            "minimal-wear": { marketHashName: "mw" },
            "well-worn": { marketHashName: "ww" }
          }
        }
      }
    }),
    buildMarketHashIndex: () => ({ ok: true }),
    loadPlatformLinksSnapshot: async () => ({ items: {}, updatedAt: "2026-07-08T00:00:00.000Z" }),
    nowIso: () => "2026-07-08T03:00:00.000Z",
    loadCatalogRuntimeData: async () => ({ catalog: [] }),
    buildYoupinWearSearchJobs: () => ([
      { itemId: "skin-a", variantId: "standard", wearId: "field-tested", marketHashName: "ft" },
      { itemId: "skin-a", variantId: "standard", wearId: "minimal-wear", marketHashName: "mw" },
      { itemId: "skin-a", variantId: "standard", wearId: "well-worn", marketHashName: "ww" }
    ]),
    fetchYoupinSaleTemplatePage: async (_auth, _pageNum, _pageSize, marketHashName) => {
      calls.push(marketHashName);
      if (marketHashName === "mw") {
        return {
          contents: [{ commodityHashName: "mw", price: 405, marketHashName: "mw" }]
        };
      }
      return { contents: [] };
    },
    resolveMarketHashMatch: (_index, commodityHashName) => ({
      match: commodityHashName === "mw"
        ? { itemId: "skin-a", variantId: "standard", wearId: "minimal-wear" }
        : null
    }),
    normalizeMarketHashName: (value) => String(value || "").trim(),
    mergeYoupinCommodity: (mergedItems, resolvedMatch, matchedContent, updatedAt) => {
      const storageKey = `${resolvedMatch.itemId}:${resolvedMatch.variantId}:${resolvedMatch.wearId || "default"}`;
      mergedItems[storageKey] = {
        itemId: resolvedMatch.itemId,
        variantId: resolvedMatch.variantId,
        wearId: resolvedMatch.wearId,
        price: matchedContent.price,
        marketHashName: matchedContent.marketHashName,
        updatedAt
      };
      return storageKey;
    },
    persistPlatformRecordsToMarketPrices: async (records) => {
      persisted.push(records);
    },
    writeFile: async (_filePath, content) => {
      writes.push(content);
    },
    youpinSaleTemplatePageSize: 20,
    youpinLinksFile: "youpin-links.json",
    JSON
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "fetchYoupinSingleRecordForUser")};`, context);

  const result = await context.fetchYoupinSingleRecordForUser("user-1", {
    itemId: "skin-a",
    variantId: "standard",
    wearId: "field-tested",
    marketHashName: "ft"
  });

  assert.deepEqual(calls, ["ft", "mw"]);
  assert.equal(result?.wearId, "minimal-wear");
  assert.equal(persisted.length, 1);
  assert.equal(writes.length, 1);
});

test("fetchYoupinSingleRecordForUser returns null after at most three candidates", async () => {
  const calls = [];
  const context = {
    selectPlatformSession: {
      youpin: {
        get: () => ({ status: "connected" })
      }
    },
    buildYoupinAuth: () => ({ ok: true }),
    loadMarketPricesSnapshot: async () => ({
      items: {
        "skin-a": {
          prices: {
            "field-tested": { marketHashName: "ft" },
            "minimal-wear": { marketHashName: "mw" },
            "well-worn": { marketHashName: "ww" }
          }
        }
      }
    }),
    buildMarketHashIndex: () => ({ ok: true }),
    loadPlatformLinksSnapshot: async () => ({ items: {}, updatedAt: "2026-07-08T00:00:00.000Z" }),
    nowIso: () => "2026-07-08T03:00:00.000Z",
    loadCatalogRuntimeData: async () => ({ catalog: [] }),
    buildYoupinWearSearchJobs: () => ([
      { itemId: "skin-a", variantId: "standard", wearId: "field-tested", marketHashName: "ft" },
      { itemId: "skin-a", variantId: "standard", wearId: "minimal-wear", marketHashName: "mw" },
      { itemId: "skin-a", variantId: "standard", wearId: "well-worn", marketHashName: "ww" }
    ]),
    fetchYoupinSaleTemplatePage: async (_auth, _pageNum, _pageSize, marketHashName) => {
      calls.push(marketHashName);
      return { contents: [] };
    },
    resolveMarketHashMatch: () => ({ match: null }),
    normalizeMarketHashName: (value) => String(value || "").trim(),
    mergeYoupinCommodity: () => "",
    persistPlatformRecordsToMarketPrices: async () => {},
    writeFile: async () => {},
    youpinSaleTemplatePageSize: 20,
    youpinLinksFile: "youpin-links.json",
    JSON
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "fetchYoupinSingleRecordForUser")};`, context);

  const result = await context.fetchYoupinSingleRecordForUser("user-1", {
    itemId: "skin-a",
    variantId: "standard",
    wearId: "field-tested",
    marketHashName: "ft"
  });

  assert.equal(result, null);
  assert.deepEqual(calls, ["ft", "mw", "ww"]);
});
