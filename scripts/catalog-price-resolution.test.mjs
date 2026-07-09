import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const root = join(import.meta.dirname, "..");

async function loadCatalogData() {
  const sandbox = { globalThis: {} };
  const catalogSource = await readFile(join(root, "catalog-data.js"), "utf8");
  vm.runInNewContext(catalogSource, sandbox, { filename: "catalog-data.js" });
  return sandbox.globalThis.CS2_CATALOG || [];
}

async function loadMarketPrices() {
  const sandbox = { globalThis: {} };
  const priceSource = await readFile(join(root, ".data", "market-prices.js"), "utf8");
  vm.runInNewContext(priceSource, sandbox, { filename: "market-prices.js" });
  return sandbox.globalThis.CS2_MARKET_PRICES || { items: {} };
}

test("catalog data includes priced snapshot entries whose base item price is empty", async () => {
  const [catalog, marketPrices] = await Promise.all([loadCatalogData(), loadMarketPrices()]);
  const item = catalog.find((entry) => {
    const prices = Object.values(marketPrices.items?.[entry.id]?.prices || {});
    return entry.price == null && prices.some((priceRecord) => Number(priceRecord?.price) > 0);
  });

  assert.ok(item, "expected at least one catalog item to rely on market-prices.js for catalog pricing");
});

test("effectiveCatalogPriceRecord resolves market snapshot prices before base item fallback", async () => {
  const appSource = await readFile(join(root, "app.js"), "utf8");
  const functionStart = appSource.indexOf("function effectiveCatalogPriceRecord(item)");
  assert.notEqual(functionStart, -1, "effectiveCatalogPriceRecord must exist");

  const functionEnd = appSource.indexOf("function effectiveCatalogPrice(item)", functionStart);
  assert.notEqual(functionEnd, -1, "effectiveCatalogPriceRecord should end before effectiveCatalogPrice");

  const functionSource = appSource.slice(functionStart, functionEnd);
  const snapshotIndex = functionSource.indexOf("snapshotPriceForItemWear(priceItem");
  const fallbackIndex = functionSource.indexOf("const fallbackPrice = Number(priceItem?.price)");

  assert.ok(snapshotIndex !== -1, "catalog cards should use market-prices.js snapshots when item.price is empty");
  assert.ok(snapshotIndex < fallbackIndex, "snapshot prices should be preferred before falling back to item.price");
});

test("catalog page waits for market price snapshots before rendering priced cards", async () => {
  const appSource = await readFile(join(root, "app.js"), "utf8");
  const functionStart = appSource.indexOf("async function renderCurrentPage()");
  assert.notEqual(functionStart, -1, "renderCurrentPage must exist");

  const functionEnd = appSource.indexOf("globalThis.items = items", functionStart);
  assert.notEqual(functionEnd, -1, "renderCurrentPage should be defined before global exports");

  const functionSource = appSource.slice(functionStart, functionEnd);
  assert.match(functionSource, /currentPage === "catalog\.html"[\s\S]*ensureCatalogAssetsLoaded\(\)/, "catalog.html should load market-prices.js before its final render");
});

test("reset filters clears the catalog URL before re-reading filter values", async () => {
  const appSource = await readFile(join(root, "app.js"), "utf8");
  const handlerStart = appSource.indexOf('if (target.id === "resetFilters")');
  assert.notEqual(handlerStart, -1, "resetFilters handler must exist");

  const handlerEnd = appSource.indexOf('if (target.id === "loadMore")', handlerStart);
  assert.notEqual(handlerEnd, -1, "resetFilters handler should end before loadMore handler");

  const handlerSource = appSource.slice(handlerStart, handlerEnd);
  const clearUrlIndex = handlerSource.indexOf("history.replaceState");
  const updateIndex = handlerSource.indexOf("updateCatalogResults()");
  assert.ok(clearUrlIndex !== -1, "reset should clear stale catalog query params");
  assert.ok(clearUrlIndex < updateIndex, "catalog URL should be cleared before updateCatalogResults reads filters again");
});
