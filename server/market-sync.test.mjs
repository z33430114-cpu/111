import test from "node:test";
import assert from "node:assert/strict";

import {
  buildMarketHashIndex,
  buildYoupinWearSearchJobs,
  applyPlatformRecordsToMarketSnapshot,
  findBestSellingWear,
  isFreshPlatformRecord,
  normalizeMarketHashName,
  pickPreferredPlatformRecord,
  shouldBlockPlatformRefresh,
  shouldRefreshPlatformRecord,
  summarizeItemAnalysis,
  summarizeOpeningAnalysis
} from "./market-sync.mjs";

test("normalizeMarketHashName strips malformed knife-glove prefixes and normalizes wear text", () => {
  assert.equal(
    normalizeMarketHashName("鈽?Hand Wraps | Spruce DDPAT (Field-Tested)"),
    "hand wraps | spruce ddpat (field-tested)"
  );
  assert.equal(
    normalizeMarketHashName("★ Karambit | Doppler ( Phase 2 )"),
    "karambit | doppler"
  );
});

test("buildMarketHashIndex keeps exact and normalized lookups", () => {
  const snapshot = {
    items: {
      "skin-a": {
        prices: {
          "field-tested": {
            marketHashName: "鈽?Hand Wraps | Spruce DDPAT (Field-Tested)",
            price: 4000
          }
        }
      }
    }
  };

  const index = buildMarketHashIndex(snapshot);
  assert.equal(index.exactIndex.get("鈽?Hand Wraps | Spruce DDPAT (Field-Tested)")?.itemId, "skin-a");
  assert.equal(index.normalizedIndex.get("hand wraps | spruce ddpat (field-tested)")?.length, 1);
  assert.equal(index.stats.exactEntries, 1);
});

test("buildMarketHashIndex includes supplemental opening entries that are missing from the snapshot", () => {
  const snapshot = { items: {} };
  const index = buildMarketHashIndex(snapshot, [
    {
      id: "crate-4001",
      marketHashName: "CS:GO Weapon Case"
    }
  ]);

  assert.equal(index.exactIndex.get("CS:GO Weapon Case")?.itemId, "crate-4001");
  assert.equal(index.normalizedIndex.get("cs:go weapon case")?.[0]?.itemId, "crate-4001");
  assert.equal(index.stats.exactEntries, 1);
});

test("findBestSellingWear prefers the lowest priced active wear when volume is missing", () => {
  const best = findBestSellingWear({
    prices: {
      "factory-new": { price: 900, sellNum: 2 },
      "minimal-wear": { price: 600, sellNum: 0 },
      "field-tested": { price: 450, sellNum: 0 }
    }
  });

  assert.equal(best.wearId, "factory-new");
  assert.equal(best.label, "Factory New");
});

test("buildYoupinWearSearchJobs expands an item into current-wear-first search jobs", () => {
  const jobs = buildYoupinWearSearchJobs({
    itemId: "skin-a",
    wearId: "field-tested",
    variantId: "standard",
    snapshotRecord: {
      prices: {
        "factory-new": { marketHashName: "AK-47 | Redline (Factory New)", price: 900 },
        "field-tested": { marketHashName: "AK-47 | Redline (Field-Tested)", price: 480 },
        "battle-scarred": { marketHashName: "AK-47 | Redline (Battle-Scarred)", price: 300 }
      }
    }
  });

  assert.deepEqual(jobs.map((job) => [job.itemId, job.wearId, job.marketHashName]), [
    ["skin-a", "field-tested", "AK-47 | Redline (Field-Tested)"],
    ["skin-a", "factory-new", "AK-47 | Redline (Factory New)"],
    ["skin-a", "battle-scarred", "AK-47 | Redline (Battle-Scarred)"]
  ]);
});

test("buildYoupinWearSearchJobs keeps the selected wear first and caps candidates to three", () => {
  const jobs = buildYoupinWearSearchJobs({
    itemId: "skin-a",
    wearId: "field-tested",
    variantId: "standard",
    snapshotRecord: {
      prices: {
        "factory-new": { marketHashName: "AK-47 | Redline (Factory New)", price: 900 },
        "minimal-wear": { marketHashName: "AK-47 | Redline (Minimal Wear)", price: 700 },
        "field-tested": { marketHashName: "AK-47 | Redline (Field-Tested)", price: 480 },
        "well-worn": { marketHashName: "AK-47 | Redline (Well-Worn)", price: 430 },
        "battle-scarred": { marketHashName: "AK-47 | Redline (Battle-Scarred)", price: 300 }
      }
    }
  });

  assert.equal(jobs[0]?.wearId, "field-tested");
  assert.equal(jobs.length, 3);
  assert.deepEqual([...new Set(jobs.map((job) => job.wearId))], jobs.map((job) => job.wearId));
});

test("buildYoupinWearSearchJobs synthesizes the selected wear search name when the snapshot lacks that wear", () => {
  const jobs = buildYoupinWearSearchJobs({
    itemId: "skin-a",
    wearId: "field-tested",
    variantId: "standard",
    snapshotRecord: {
      prices: {
        "minimal-wear": { marketHashName: "AK-47 | Redline (Minimal Wear)", price: 700 }
      }
    },
    marketHashName: "AK-47 | Redline (Minimal Wear)"
  });

  assert.deepEqual(jobs.map((job) => [job.wearId, job.marketHashName]), [
    ["field-tested", "AK-47 | Redline (Field-Tested)"],
    ["minimal-wear", "AK-47 | Redline (Minimal Wear)"]
  ]);
});

test("buildYoupinWearSearchJobs only adds conservative neighbors for edge wears", () => {
  const jobs = buildYoupinWearSearchJobs({
    itemId: "skin-a",
    wearId: "factory-new",
    variantId: "standard",
    snapshotRecord: {
      prices: {
        "factory-new": { marketHashName: "AK-47 | Redline (Factory New)", price: 900 },
        "minimal-wear": { marketHashName: "AK-47 | Redline (Minimal Wear)", price: 700 },
        "field-tested": { marketHashName: "AK-47 | Redline (Field-Tested)", price: 480 }
      }
    }
  });

  assert.deepEqual(jobs.map((job) => job.wearId), ["factory-new", "minimal-wear", "field-tested"]);
});

test("applyPlatformRecordsToMarketSnapshot replaces existing reference prices", () => {
  const snapshot = {
    source: "Local snapshot",
    updatedAt: "2026-07-03T00:00:00.000Z",
    items: {
      "skin-a": {
        name: "AK-47 | Redline",
        prices: {
          "field-tested": {
            price: 480,
            marketHashName: "AK-47 | Redline (Field-Tested)",
            source: "Local snapshot"
          }
        }
      }
    }
  };

  const result = applyPlatformRecordsToMarketSnapshot(snapshot, [
    {
      itemId: "skin-a",
      wearId: "field-tested",
      price: 395,
      marketHashName: "AK-47 | Redline (Field-Tested)",
      sellNum: 12,
      updatedAt: "2026-07-06T00:00:00.000Z"
    }
  ], { source: "YouPin", updatedAt: "2026-07-06T00:00:00.000Z" });

  assert.equal(result.changedCount, 1);
  assert.equal(result.snapshot.items["skin-a"].prices["field-tested"].price, 395);
  assert.equal(result.snapshot.items["skin-a"].prices["field-tested"].source, "YouPin");
  assert.equal(result.snapshot.items["skin-a"].prices["field-tested"].sellNum, 12);
});

test("pickPreferredPlatformRecord prefers the most recently updated platform price", () => {
  const preferred = pickPreferredPlatformRecord({
    buffRecord: {
      price: 410,
      updatedAt: "2026-07-08T01:00:00.000Z",
      marketHashName: "AK-47 | Redline (Field-Tested)"
    },
    youpinRecord: {
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Field-Tested)"
    }
  });

  assert.equal(preferred.sourceKey, "youpin");
  assert.equal(preferred.record.price, 405);
});

test("shouldRefreshPlatformRecord only refreshes connected missing, stale, or forced records", () => {
  const nowMs = Date.parse("2026-07-07T01:30:00.000Z");
  const freshRecord = { price: 10, updatedAt: "2026-07-07T01:20:00.000Z" };
  const staleRecord = { price: 10, updatedAt: "2026-07-07T00:20:00.000Z" };
  const maxAgeMs = 30 * 60 * 1000;

  assert.equal(isFreshPlatformRecord(freshRecord, { nowMs, maxAgeMs }), true);
  assert.equal(isFreshPlatformRecord(staleRecord, { nowMs, maxAgeMs }), false);
  assert.equal(shouldRefreshPlatformRecord({ record: freshRecord, connected: true, nowMs, maxAgeMs }), false);
  assert.equal(shouldRefreshPlatformRecord({ record: staleRecord, connected: true, nowMs, maxAgeMs }), true);
  assert.equal(shouldRefreshPlatformRecord({ record: null, connected: true, nowMs, maxAgeMs }), true);
  assert.equal(shouldRefreshPlatformRecord({ record: freshRecord, connected: true, forceRefresh: true, nowMs, maxAgeMs }), true);
  assert.equal(shouldRefreshPlatformRecord({ record: staleRecord, connected: false, nowMs, maxAgeMs }), false);
});

test("shouldBlockPlatformRefresh blocks requests during rate-limit cooldown", () => {
  const nowMs = Date.parse("2026-07-07T01:30:00.000Z");

  assert.equal(shouldBlockPlatformRefresh({ cooldownUntilMs: nowMs + 60_000, nowMs }), true);
  assert.equal(shouldBlockPlatformRefresh({ cooldownUntilMs: nowMs - 1, nowMs }), false);
  assert.equal(shouldBlockPlatformRefresh({ cooldownUntilMs: 0, nowMs }), false);
});

test("summarizeItemAnalysis returns a stable fallback summary", () => {
  const payload = summarizeItemAnalysis({
    itemId: "skin-a",
    wearId: "field-tested",
    variantId: "standard",
    itemName: "AK-47 | Redline",
    priceEntry: {
      wearId: "field-tested",
      price: 480,
      record: {
        marketHashName: "AK-47 | Redline (Field-Tested)",
        sellNum: 22
      }
    },
    buffRecord: { price: 510, sellNum: 14, updatedAt: "2026-07-06T00:00:00.000Z" },
    youpinRecord: { price: 495, sellNum: 18, updatedAt: "2026-07-06T00:00:00.000Z" }
  });

  assert.equal(payload.ok, true);
  assert.equal(payload.liquidity, "high");
  assert.equal(payload.bestSellingWear?.wearId, "field-tested");
  assert.equal(payload.insights.length >= 2, true);
});

test("summarizeOpeningAnalysis calculates EV and ROI from drops", () => {
  const payload = summarizeOpeningAnalysis({
    openingId: "crate-1",
    openingName: "Gallery Case",
    locale: "zh-CN",
    openingPrice: 12,
    keyPrice: 18,
    entries: [
      { id: "skin-1", name: "Item 1", price: 100, probability: 0.1 },
      { id: "skin-2", name: "Item 2", price: 10, probability: 0.9 }
    ]
  });

  assert.equal(payload.ok, true);
  assert.equal(payload.entryCost, 30);
  assert.equal(payload.expectedValue, 19);
  assert.equal(payload.roi, -36.67);
  assert.equal(payload.topDrops.length, 2);
});

test("summarizeOpeningAnalysis emits clean zh-CN commentary and insights", () => {
  const payload = summarizeOpeningAnalysis({
    openingId: "crate-1",
    openingName: "Gallery Case",
    locale: "zh-CN",
    openingPrice: 12,
    keyPrice: 18,
    entries: [
      { id: "skin-1", name: "Item 1", price: 100, probability: 0.1 },
      { id: "skin-2", name: "Item 2", price: 10, probability: 0.9 },
      { id: "skin-3", name: "Item 3", price: 6, probability: 0.2 }
    ]
  });

  assert.match(payload.commentary, /理论回报|入场成本/);
  assert.ok(payload.insights.length >= 2);
  payload.insights.forEach((entry) => assert.doesNotMatch(entry, /\?{3,}|�|鎸夊綋|鐞嗚|楂樹环/));
  assert.doesNotMatch(payload.commentary, /\?{3,}|�|鎸夊綋|鐞嗚|楂樹环/);
});
