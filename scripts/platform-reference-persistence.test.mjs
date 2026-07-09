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

test("buildPersistentReferenceRecord returns the last successful platform price for persistence", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "buildPersistentReferenceRecord")};`, context);

  const result = context.buildPersistentReferenceRecord({
    syncedOverride: {
      itemId: "skin-a",
      wearId: "field-tested",
      variantId: "standard",
      effectivePrice: 405,
      effectiveSource: "youpin"
    },
    buffRecord: {
      price: 410,
      updatedAt: "2026-07-08T01:00:00.000Z",
      marketHashName: "AK-47 | Redline (Field-Tested)",
      sellNum: 11
    },
    youpinRecord: {
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Field-Tested)",
      sellNum: 12
    },
    snapshotEntry: {
      price: 480,
      record: {
        source: "Local snapshot",
        updatedAt: "2026-07-07T00:00:00.000Z"
      }
    }
  });

  assert.equal(result.source, "YouPin");
  assert.equal(result.record.itemId, "skin-a");
  assert.equal(result.record.price, 405);
  assert.equal(result.record.sellNum, 12);
});

test("buildPersistentReferenceRecord skips writes when the persisted reference is already current", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "buildPersistentReferenceRecord")};`, context);

  const result = context.buildPersistentReferenceRecord({
    syncedOverride: {
      itemId: "skin-a",
      wearId: "field-tested",
      variantId: "standard",
      effectivePrice: 405,
      effectiveSource: "youpin"
    },
    youpinRecord: {
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Field-Tested)",
      sellNum: 12
    },
    snapshotEntry: {
      price: 405,
      record: {
        source: "YouPin",
        updatedAt: "2026-07-08T02:00:00.000Z"
      }
    }
  });

  assert.equal(result, null);
});

test("fallback wear matches still produce a persistent YouPin reference write", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "buildPersistentReferenceRecord")};`, context);

  const result = context.buildPersistentReferenceRecord({
    syncedOverride: {
      itemId: "skin-a",
      wearId: "minimal-wear",
      variantId: "standard",
      effectivePrice: 405,
      effectiveSource: "youpin"
    },
    youpinRecord: {
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Minimal Wear)",
      sellNum: 12
    },
    snapshotEntry: null
  });

  assert.equal(result.source, "YouPin");
  assert.equal(result.record.wearId, "minimal-wear");
});

test("preferredReferencePayload uses the matched platform wear for fallback YouPin hits", () => {
  const context = {
    pickPreferredPlatformRecord: ({ buffRecord, youpinRecord }) => (
      youpinRecord
        ? { sourceKey: "youpin", record: youpinRecord }
        : buffRecord
          ? { sourceKey: "buff", record: buffRecord }
          : null
    )
  };
  vm.createContext(context);
  vm.runInContext([
    extractFunctionSource(serveSource, "priceOverridePayload"),
    extractFunctionSource(serveSource, "preferredReferencePayload")
  ].join("\n"), context);

  const result = context.preferredReferencePayload({
    itemId: "skin-a",
    wearId: "field-tested",
    variantId: "standard",
    youpinRecord: {
      wearId: "minimal-wear",
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Minimal Wear)"
    },
    snapshotEntry: {
      wearId: "field-tested",
      price: 480,
      record: {
        marketHashName: "AK-47 | Redline (Field-Tested)"
      }
    }
  });

  assert.equal(result.effectiveSource, "youpin");
  assert.equal(result.wearId, "minimal-wear");
});

test("buildPersistentReferenceRecord persists the matched platform wear instead of the requested wear", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "buildPersistentReferenceRecord")};`, context);

  const result = context.buildPersistentReferenceRecord({
    syncedOverride: {
      itemId: "skin-a",
      wearId: "field-tested",
      variantId: "standard",
      effectivePrice: 405,
      effectiveSource: "youpin"
    },
    youpinRecord: {
      wearId: "minimal-wear",
      price: 405,
      updatedAt: "2026-07-08T02:00:00.000Z",
      marketHashName: "AK-47 | Redline (Minimal Wear)",
      sellNum: 12
    },
    snapshotEntry: null
  });

  assert.equal(result.source, "YouPin");
  assert.equal(result.record.wearId, "minimal-wear");
});
