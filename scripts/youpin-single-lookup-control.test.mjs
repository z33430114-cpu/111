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

test("handlePlatformPrices does not reuse a fallback wear hit as the current wear price", async () => {
  let responseBody = null;
  const context = {
    URL,
    Promise,
    readAuthenticatedUser: () => ({ user: { id: "user-1" } }),
    loadMarketPricesSnapshot: async () => ({
      updatedAt: "2026-07-08T03:00:00.000Z",
      items: {
        "skin-a": {
          lastUpdated: "2026-07-08T03:00:00.000Z",
          prices: {
            "field-tested": {
              price: 480,
              marketHashName: "AK-47 | Redline (Field-Tested)"
            }
          }
        }
      }
    }),
    loadPlatformLinksSnapshot: async () => ({ updatedAt: "2026-07-08T03:00:00.000Z", items: {} }),
    snapshotPriceFromRecord: (record, wearId) => ({
      wearId,
      price: Number(record?.prices?.[wearId]?.price) || 0,
      record: record?.prices?.[wearId] || null
    }),
    selectPlatformSession: {
      buff: { get: () => null },
      youpin: { get: () => ({ status: "connected" }) }
    },
    lookupPlatformLinkRecord: (_snapshot, _itemId, _variantId, wearId) => (
      wearId === "field-tested"
        ? null
        : {
          itemId: "skin-a",
          variantId: "standard",
          wearId: "minimal-wear",
          price: 405,
          marketHashName: "AK-47 | Redline (Minimal Wear)",
          updatedAt: "2026-07-08T03:00:00.000Z"
        }
    ),
    shouldRefreshPlatformRecord: () => true,
    shouldBlockPlatformRefresh: () => false,
    fetchYoupinSingleRecordForUserOnce: async () => ({
      itemId: "skin-a",
      variantId: "standard",
      wearId: "minimal-wear",
      price: 405,
      marketHashName: "AK-47 | Redline (Minimal Wear)",
      updatedAt: "2026-07-08T03:05:00.000Z"
    }),
    preferredReferencePayload: ({ itemId, wearId, snapshotEntry, youpinRecord }) => ({
      itemId,
      wearId: String(youpinRecord?.wearId || wearId || "").trim(),
      variantId: "standard",
      effectivePrice: Number(youpinRecord?.price || snapshotEntry?.price) || null,
      effectiveSource: youpinRecord ? "youpin" : "snapshot",
      updatedAt: youpinRecord?.updatedAt || "2026-07-08T03:00:00.000Z",
      marketHashName: String(youpinRecord?.marketHashName || snapshotEntry?.record?.marketHashName || "")
    }),
    buildPersistentReferenceRecord: () => null,
    persistPlatformRecordsToMarketPrices: async () => {},
    buildPlatformPricePayload: (_kind, _sessionRow, record) => ({
      price: Number(record?.price) || null,
      status: record ? "ok" : "unavailable"
    }),
    json: (_response, _status, payload) => {
      responseBody = payload;
    },
    markYoupinRateLimit: () => {},
    nowIso: () => "2026-07-08T03:05:00.000Z",
    youpinSingleLookupState: { cooldownUntilMs: 0, lastRateLimitMessage: "" },
    youpinSinglePriceCacheFreshMs: 300000
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "handlePlatformPrices")};`, context);

  await context.handlePlatformPrices(
    { url: "http://127.0.0.1/api/platform-prices/skin-a?wear=field-tested&variant=standard" },
    {},
    "/api/platform-prices/skin-a"
  );

  assert.equal(responseBody?.wearId, "field-tested");
  assert.equal(responseBody?.referenceSourceKey, "snapshot");
  assert.equal(responseBody?.referencePrice, 480);
  assert.equal(responseBody?.platforms?.youpin?.status, "unavailable");
});

test("lookupPlatformLinkRecord does not fall back to standard variant when a non-standard variant is requested", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "lookupPlatformLinkRecord")};`, context);

  const snapshot = {
    items: {
      "skin-a:standard:field-tested": {
        itemId: "skin-a",
        variantId: "standard",
        wearId: "field-tested",
        price: 405
      }
    }
  };

  const result = context.lookupPlatformLinkRecord(snapshot, "skin-a", "stattrak", "field-tested");

  assert.equal(result, null);
});
