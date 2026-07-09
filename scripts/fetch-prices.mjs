import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(__dirname, "..");
const DEFAULT_OUTPUT = join(DEFAULT_ROOT, ".data", "market-prices.json");

const EN_SOURCE_URLS = [
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json",
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json",
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/patches.json",
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/keychains.json",
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json"
];
const STEAM_PRICE_OVERVIEW_URL = "https://steamcommunity.com/market/priceoverview/";
const STEAM_SEARCH_URL = "https://steamcommunity.com/market/search/render/";
const TRADER_STEAM_URL = "https://prices.csgotrader.app/latest/steam.json";
const FX_URL = "https://api.frankfurter.app/latest?from=USD&to=CNY";
const STEAM_APP_ID = 730;
const STEAM_CURRENCY_CNY = 23;

const wearLabelsEN = {
  "factory-new": "Factory New",
  "minimal-wear": "Minimal Wear",
  "field-tested": "Field-Tested",
  "well-worn": "Well-Worn",
  "battle-scarred": "Battle-Scarred"
};

const overviewCache = new Map();
const searchCache = new Map();
const traderSteamCache = { data: null };

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureParentDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function writeSnapshotFiles(outputFile, payload) {
  await ensureParentDir(outputFile);
  const jsonBody = `${JSON.stringify(payload, null, 2)}\n`;
  const tempJsonFile = `${outputFile}.tmp`;
  await writeFile(tempJsonFile, jsonBody, "utf8");
  await rename(tempJsonFile, outputFile);
  const scriptFile = outputFile.replace(/\.json$/i, ".js");
  const scriptBody = `globalThis.CS2_MARKET_PRICES = ${JSON.stringify(payload, null, 2)};\n`;
  const tempScriptFile = `${scriptFile}.tmp`;
  await writeFile(tempScriptFile, scriptBody, "utf8");
  await rename(tempScriptFile, scriptFile);
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function loadRawCatalog(rootDir) {
  const catalogPath = join(rootDir, "catalog-data.js");
  const catalogContent = await readFile(catalogPath, "utf8");
  const marker = "globalThis.CS2_CATALOG = ";
  const start = catalogContent.indexOf(marker);
  if (start === -1) throw new Error("Unable to parse catalog-data.js");
  const afterMarker = catalogContent.slice(start + marker.length);
  const end = afterMarker.indexOf(";\n");
  return JSON.parse((end === -1 ? afterMarker : afterMarker.slice(0, end)).trim());
}

async function loadRawOpenings(rootDir) {
  const dataPath = join(rootDir, "catalog-data.js");
  const dataContent = await readFile(dataPath, "utf8");
  const marker = "globalThis.CS2_UNBOXING = ";
  const start = dataContent.indexOf(marker);
  if (start === -1) return [];
  const afterMarker = dataContent.slice(start + marker.length);
  const end = afterMarker.indexOf(";\n");
  return JSON.parse((end === -1 ? afterMarker : afterMarker.slice(0, end)).trim());
}

async function loadEnglishNameMap() {
  const payloads = await Promise.all(EN_SOURCE_URLS.map(async (url) => {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "CS2-Relic-Hall" },
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status} for ${url}`);
      return response.json();
    } catch {
      return [];
    }
  }));

  const nameMap = new Map();
  for (const payload of payloads) {
    for (const item of payload) {
      if (item?.id && item?.name && !nameMap.has(item.id)) nameMap.set(item.id, item.name);
    }
  }
  return nameMap;
}

async function loadMetaIndex(rootDir) {
  const metaPath = join(rootDir, "catalog-meta.js");
  const metaContent = await readFile(metaPath, "utf8");
  const marker = "globalThis.CS2_ITEM_META = ";
  const start = metaContent.indexOf(marker);
  if (start === -1) return {};
  const afterMarker = metaContent.slice(start + marker.length);
  const end = afterMarker.indexOf(";\n");
  return JSON.parse((end === -1 ? afterMarker : afterMarker.slice(0, end)).trim());
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const parsed = Number.parseFloat(value.replace(/[^\d.,-]/g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asCount(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanMarketName(value) {
  return String(value || "")
    .replace(/\u2122/g, "\u2122")
    .replace(/\u2605/g, "\u2605")
    .replace(/\s+/g, " ")
    .trim();
}

function marketHashName(baseName, wearId) {
  const wearName = wearLabelsEN[wearId];
  return wearName ? `${baseName} (${wearName})` : baseName;
}

function baseMarketNames(item, englishName) {
  const cleaned = cleanMarketName(englishName);
  const names = [cleaned];
  if (String(item.quality || "").includes("StatTrak")) names.push(cleanMarketName(`StatTrak\u2122 ${cleaned}`));
  if (String(item.quality || "").includes("Souvenir")) names.push(cleanMarketName(`Souvenir ${cleaned}`));
  return [...new Set(names)];
}

function candidateMarketNames(item, englishName, wearId) {
  return baseMarketNames(item, englishName).map((name) => marketHashName(name, wearId));
}

async function fetchUsdToCnyRate() {
  try {
    const response = await fetch(FX_URL, {
      headers: { "User-Agent": "CS2-Relic-Hall" },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return 7;
    const payload = await response.json();
    const rate = Number(payload?.rates?.CNY || 0);
    return Number.isFinite(rate) && rate > 0 ? rate : 7;
  } catch {
    return 7;
  }
}

async function fetchTraderDataset(url, cache) {
  if (cache.data) return cache.data;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Trader dataset request failed: ${response.status}`);
  cache.data = await response.json();
  return cache.data;
}

function firstFinite(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

function buildTraderSteamRecord(entry, usdToCnyRate, marketName) {
  const usdPrice = firstFinite(entry?.last_24h, entry?.last_7d, entry?.last_30d, entry?.last_90d);
  if (!usdPrice) return null;
  const price = Number((usdPrice * usdToCnyRate).toFixed(2));
  return {
    price,
    quickSell: price,
    buyMax: 0,
    sellNum: 0,
    buyNum: 0,
    marketHashName: marketName,
    source: "CSGO Trader Steam",
    currencyCode: "CNY"
  };
}

async function fetchTraderFallback(item, englishName, wearId, usdToCnyRate) {
  const exactCandidates = candidateMarketNames(item, englishName, wearId);
  const traderSteam = await fetchTraderDataset(TRADER_STEAM_URL, traderSteamCache).catch(() => ({}));

  for (const marketName of exactCandidates) {
    const steamRecord = buildTraderSteamRecord(traderSteam[marketName], usdToCnyRate, marketName);
    if (steamRecord) return steamRecord;
  }

  return null;
}

async function fetchSteamOverview(marketName) {
  if (overviewCache.has(marketName)) return overviewCache.get(marketName);
  const params = new URLSearchParams({
    appid: String(STEAM_APP_ID),
    currency: String(STEAM_CURRENCY_CNY),
    market_hash_name: marketName
  });
  let response;
  try {
    response = await fetch(`${STEAM_PRICE_OVERVIEW_URL}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `https://steamcommunity.com/market/listings/${STEAM_APP_ID}/${encodeURIComponent(marketName)}`
      },
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    overviewCache.set(marketName, null);
    return null;
  }
  if (!response.ok || response.status === 429) {
    overviewCache.set(marketName, null);
    return null;
  }
  const payload = await response.json();
  if (!payload?.success) return null;
  const price = asNumber(payload.lowest_price || payload.median_price || "");
  if (!price) return null;
  const result = {
    price,
    quickSell: asNumber(payload.median_price || payload.lowest_price || "") || price,
    buyMax: 0,
    sellNum: asCount(payload.volume || 0),
    buyNum: 0,
    marketHashName: marketName,
    source: "Steam Community",
    currencyCode: "CNY"
  };
  overviewCache.set(marketName, result);
  return result;
}

async function fetchSteamSearch(query) {
  if (searchCache.has(query)) return searchCache.get(query);
  const params = new URLSearchParams({ query, appid: String(STEAM_APP_ID), norender: "1", count: "20" });
  let response;
  try {
    response = await fetch(`${STEAM_SEARCH_URL}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://steamcommunity.com/market/search?appid=730"
      },
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    searchCache.set(query, []);
    return [];
  }
  if (!response.ok || response.status === 429) {
    searchCache.set(query, []);
    return [];
  }
  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];
  searchCache.set(query, results);
  return results;
}

function searchQueriesForItem(item, englishName, wearId) {
  const wearName = wearLabelsEN[wearId];
  const cleaned = cleanMarketName(englishName);
  const plainBase = cleaned.replace(/^StatTrak(?:鈩TM)?\s+/i, "").replace(/^Souvenir\s+/i, "").trim();
  const queries = [];
  if (wearName) queries.push(`${plainBase} ${wearName}`);
  queries.push(plainBase);
  for (const name of candidateMarketNames(item, englishName, wearId)) queries.push(name);
  if (item.weapon && !queries.includes(item.weapon)) queries.push(item.weapon);
  return [...new Set(queries)];
}

function buildSearchFallbackRecord(result, usdToCnyRate) {
  const sellPriceUsd = Number(result?.sell_price || 0) / 100;
  const salePriceUsd = asNumber(result?.sale_price_text || "") || sellPriceUsd;
  if (!sellPriceUsd) return null;
  return {
    price: Number((sellPriceUsd * usdToCnyRate).toFixed(2)),
    quickSell: Number((salePriceUsd * usdToCnyRate).toFixed(2)),
    buyMax: 0,
    sellNum: Number(result?.sell_listings || 0),
    buyNum: 0,
    marketHashName: result.hash_name || result.name || "",
    source: "Steam Community (search fallback)",
    currencyCode: "CNY"
  };
}

async function fetchPriceForItem(item, wearId, englishNameMap, metaIndex, usdToCnyRate, { skipSteamFallback = false } = {}) {
  const englishName = item.marketHashName || englishNameMap.get(item.id) || metaIndex[item.id]?.englishName || item.nameEn || "";
  if (!englishName) return null;
  const traderFallback = await fetchTraderFallback(item, englishName, wearId, usdToCnyRate);
  if (traderFallback) return traderFallback;
  if (skipSteamFallback) return null;
  const exactCandidates = candidateMarketNames(item, englishName, wearId);
  for (const marketName of exactCandidates) {
    const overview = await fetchSteamOverview(marketName);
    if (overview) return overview;
    await sleep(250);
  }
  const queries = searchQueriesForItem(item, englishName, wearId);
  for (const query of queries) {
    const results = await fetchSteamSearch(query);
    const exact = results.find((entry) => exactCandidates.includes(cleanMarketName(entry.hash_name)));
    if (exact) {
      const record = buildSearchFallbackRecord(exact, usdToCnyRate);
      if (record) return record;
    }
    const wearName = wearLabelsEN[wearId];
    const looser = results.find((entry) => {
      const hash = cleanMarketName(entry.hash_name);
      const weaponMatch = hash.includes(cleanMarketName(englishName).replace(/^StatTrak(?:\u2122|TM)?\s+/i, "").replace(/^Souvenir\s+/i, ""));
      const wearMatch = wearName ? hash.includes(`(${wearName})`) : true;
      return weaponMatch && wearMatch;
    });
    if (looser) {
      const record = buildSearchFallbackRecord(looser, usdToCnyRate);
      if (record) return record;
    }
    await sleep(250);
  }
  return null;
}

async function fetchPricesForAll(items, metaIndex, {
  targetIds = [],
  delayMs = 900,
  maxItems = Number.POSITIVE_INFINITY,
  logger = console,
  onCheckpoint = null,
  skipSteamFallback = false
} = {}) {
  const englishNameMap = await loadEnglishNameMap();
  const usdToCnyRate = await fetchUsdToCnyRate();
  const filteredAll = targetIds.length ? items.filter((item) => targetIds.includes(item.id)) : items;
  const filtered = targetIds.length ? filteredAll : filteredAll.slice(0, maxItems);
  logger.log(`Syncing ${filtered.length} items`);
  logger.log(`Steam fallback rate: 1 USD = ${usdToCnyRate} CNY`);
  const records = {};
  for (let index = 0; index < filtered.length; index += 1) {
    const item = filtered[index];
    const wearIds = Array.isArray(item.wears) && item.wears.length ? item.wears : ["default"];
    const prices = {};
    for (const wearId of wearIds) {
      const normalizedWear = wearId === "default" ? null : wearId;
      const record = await fetchPriceForItem(item, normalizedWear, englishNameMap, metaIndex, usdToCnyRate, { skipSteamFallback });
      if (record) prices[wearId] = record;
      if (!record || !String(record.source || "").startsWith("CSGO Trader")) {
        await sleep(delayMs);
      }
    }
    if (Object.keys(prices).length) {
      records[item.id] = {
        id: item.id,
        name: item.nameZh || item.name || item.nameEn || item.id,
        prices,
        lastUpdated: new Date().toISOString()
      };
    }
    if (typeof onCheckpoint === "function" && ((index + 1) % 20 === 0 || index === filtered.length - 1)) {
      await onCheckpoint(records, index + 1, filtered.length);
    }
    if ((index + 1) % 20 === 0 || index === filtered.length - 1) {
      logger.log(`Progress ${index + 1}/${filtered.length}`);
    }
  }
  return { records, itemCount: Object.keys(records).length };
}

export async function syncMarketPrices({
  rootDir = DEFAULT_ROOT,
  outputFile = DEFAULT_OUTPUT,
  targetIds = [],
  delayMs = 900,
  maxItems = Number.isFinite(Number(process.env.PRICE_SYNC_LIMIT))
    ? Number(process.env.PRICE_SYNC_LIMIT)
    : Number.POSITIVE_INFINITY,
  dryRun = false,
  skipSteamFallback = false,
  logger = console
} = {}) {
  const catalogItems = [
    ...(await loadRawCatalog(rootDir)),
    ...(await loadRawOpenings(rootDir))
  ];
  const metaIndex = await loadMetaIndex(rootDir);
  const existing = await readJson(outputFile, { source: "Steam Community", updatedAt: null, itemCount: 0, items: {} });
  const result = await fetchPricesForAll(catalogItems, metaIndex, {
    targetIds,
    delayMs,
    maxItems,
    logger,
    skipSteamFallback,
    onCheckpoint: dryRun ? null : async (records) => {
      const mergedItems = { ...(existing.items || {}), ...records };
      await writeSnapshotFiles(outputFile, {
        source: "Steam Community + CSGO Trader Steam",
        updatedAt: new Date().toISOString(),
        itemCount: Object.keys(mergedItems).length,
        items: mergedItems
      });
    }
  });
  const mergedItems = { ...(existing.items || {}), ...result.records };
  const payload = {
    source: "Steam Community + CSGO Trader Steam",
    updatedAt: new Date().toISOString(),
    itemCount: Object.keys(mergedItems).length,
    items: mergedItems
  };
  if (!dryRun) {
    await writeSnapshotFiles(outputFile, payload);
  }
  return payload;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const maxArg = args.find((arg) => arg.startsWith("--max="));
  const delayArg = args.find((arg) => arg.startsWith("--delay="));
  const delayMs = delayArg ? Number(delayArg.split("=")[1]) : 900;
  const maxItems = maxArg ? Number(maxArg.split("=")[1]) : Number.POSITIVE_INFINITY;
  const targetIds = args.filter((arg) => !arg.startsWith("--"));
  console.log("CS2 Skin Atlas - market price sync\n");
  console.log(`Mode: ${dryRun ? "preview" : "write"}`);
  console.log("Source: CSGO Trader Steam + Steam Community fallback");
  if (targetIds.length) console.log(`Targets: ${targetIds.join(", ")}`);
  const payload = await syncMarketPrices({ targetIds, delayMs, maxItems, dryRun });
  console.log(`\nSynced ${payload.itemCount} items`);
  console.log(`Updated at: ${payload.updatedAt}`);
  if (!dryRun) console.log(`Output: ${DEFAULT_OUTPUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
