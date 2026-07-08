const WEAR_LABELS = {
  "factory-new": "Factory New",
  "minimal-wear": "Minimal Wear",
  "field-tested": "Field-Tested",
  "well-worn": "Well-Worn",
  "battle-scarred": "Battle-Scarred"
};
const WEAR_PROGRESSIVE_ORDER = [
  "factory-new",
  "minimal-wear",
  "field-tested",
  "well-worn",
  "battle-scarred"
];

function normalizeWearId(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (/factory\s*new|崭新/u.test(raw)) return "factory-new";
  if (/minimal\s*wear|略有磨损/u.test(raw)) return "minimal-wear";
  if (/field\s*tested|久经沙场/u.test(raw)) return "field-tested";
  if (/well\s*worn|破损不堪/u.test(raw)) return "well-worn";
  if (/battle\s*scarred|战痕累累/u.test(raw)) return "battle-scarred";
  return raw.replace(/\s+/gu, "-");
}

export function wearLabel(value = "") {
  const normalized = normalizeWearId(value);
  return WEAR_LABELS[normalized] || normalized || "";
}

export function normalizeMarketHashName(value = "") {
  return String(value || "")
    .normalize("NFKC")
    .replace(/^鈽\?\s*/u, "")
    .replace(/^[^A-Za-z0-9\u4e00-\u9fff]+/gu, "")
    .replace(/^\(\s*★\s*\)\s*/iu, "")
    .replace(/^（\s*★\s*）\s*/u, "")
    .replace(/^★\s*/u, "")
    .replace(/\bStatTrak(?:™)?\s+/giu, "")
    .replace(/\bSouvenir\s+/giu, "")
    .replace(/\(\s*phase\s*[1-4]\s*\)/giu, "")
    .replace(/\(\s*ruby\s*\)|\(\s*sapphire\s*\)|\(\s*emerald\s*\)|\(\s*black pearl\s*\)/giu, "")
    .replace(/[（）]/gu, (match) => (match === "（" ? "(" : ")"))
    .replace(/\s*\|\s*/gu, " | ")
    .replace(/\(\s*factory\s*new\s*\)/giu, "(Factory New)")
    .replace(/\(\s*minimal\s*wear\s*\)/giu, "(Minimal Wear)")
    .replace(/\(\s*field\s*tested\s*\)/giu, "(Field-Tested)")
    .replace(/\(\s*well\s*worn\s*\)/giu, "(Well-Worn)")
    .replace(/\(\s*battle\s*scarred\s*\)/giu, "(Battle-Scarred)")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

function buildIndexMatch(itemId, rawWearId) {
  return {
    itemId,
    variantId: "standard",
    wearId: rawWearId === "default" ? "" : rawWearId
  };
}

function nearestWearCandidates(selectedWearId = "", availableWearIds = []) {
  const normalizedAvailable = [...new Set((Array.isArray(availableWearIds) ? availableWearIds : []).filter(Boolean))];
  const selectedIndex = WEAR_PROGRESSIVE_ORDER.indexOf(selectedWearId);
  if (selectedIndex === -1) return normalizedAvailable.slice(0, 2);
  const neighbors = [];
  for (let distance = 1; distance < WEAR_PROGRESSIVE_ORDER.length; distance += 1) {
    const left = WEAR_PROGRESSIVE_ORDER[selectedIndex - distance];
    const right = WEAR_PROGRESSIVE_ORDER[selectedIndex + distance];
    if (left && normalizedAvailable.includes(left)) neighbors.push(left);
    if (right && normalizedAvailable.includes(right)) neighbors.push(right);
    if (neighbors.length >= 2) break;
  }
  return [...new Set(neighbors)].slice(0, 2);
}

export function buildYoupinWearSearchJobs({
  itemId = "",
  wearId = "",
  variantId = "standard",
  snapshotRecord = null,
  marketHashName = ""
} = {}) {
  const normalizedItemId = String(itemId || "").trim();
  const normalizedVariantId = String(variantId || "standard").trim() || "standard";
  const selectedWearId = String(wearId || "").trim();
  const entries = Object.entries(snapshotRecord?.prices || {})
    .map(([rawWearId, priceRecord]) => ({
      itemId: normalizedItemId,
      variantId: normalizedVariantId,
      wearId: rawWearId === "default" ? "" : rawWearId,
      marketHashName: String(priceRecord?.marketHashName || "").trim()
    }))
    .filter((entry) => entry.itemId && entry.marketHashName);
  if (!entries.length && normalizedItemId && marketHashName) {
    entries.push({
      itemId: normalizedItemId,
      variantId: normalizedVariantId,
      wearId: selectedWearId,
      marketHashName: String(marketHashName || "").trim()
    });
  }
  const availableWearIds = entries.map((entry) => entry.wearId).filter(Boolean);
  const orderedWearIds = [
    selectedWearId,
    ...nearestWearCandidates(selectedWearId, availableWearIds)
  ].filter(Boolean);
  const entryByWearId = new Map(entries.map((entry) => [entry.wearId, entry]));
  const seen = new Set();
  const prioritizedEntries = orderedWearIds.length
    ? orderedWearIds.map((wear) => entryByWearId.get(wear)).filter(Boolean)
    : entries.slice(0, 3);
  return prioritizedEntries
    .filter((entry) => {
      const key = `${entry.variantId}:${entry.wearId}:${entry.marketHashName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

export function applyPlatformRecordsToMarketSnapshot(snapshot, records = [], { source = "platform", updatedAt = "" } = {}) {
  const nextSnapshot = {
    ...(snapshot || {}),
    source: snapshot?.source || source,
    updatedAt: updatedAt || snapshot?.updatedAt || null,
    items: { ...(snapshot?.items || {}) }
  };
  let changedCount = 0;
  for (const record of Array.isArray(records) ? records : []) {
    const itemId = String(record?.itemId || "").trim();
    const wearKey = String(record?.wearId || "").trim() || "default";
    const price = Number(record?.price);
    if (!itemId || !Number.isFinite(price) || price <= 0) continue;
    const itemRecord = nextSnapshot.items[itemId] && typeof nextSnapshot.items[itemId] === "object"
      ? { ...nextSnapshot.items[itemId] }
      : { prices: {} };
    const prices = { ...(itemRecord.prices || {}) };
    const previous = prices[wearKey] && typeof prices[wearKey] === "object" ? prices[wearKey] : {};
    prices[wearKey] = {
      ...previous,
      price,
      quickSell: price,
      marketHashName: String(record?.marketHashName || previous.marketHashName || ""),
      source,
      currencyCode: previous.currencyCode || "CNY",
      sellNum: Number(record?.sellNum) || 0,
      updatedAt: record?.updatedAt || updatedAt || previous.updatedAt || null
    };
    nextSnapshot.items[itemId] = {
      ...itemRecord,
      lastUpdated: record?.updatedAt || updatedAt || itemRecord.lastUpdated || null,
      prices
    };
    changedCount += 1;
  }
  nextSnapshot.itemCount = Object.keys(nextSnapshot.items).length;
  return { snapshot: nextSnapshot, changedCount };
}

export function pickPreferredPlatformRecord({ buffRecord = null, youpinRecord = null } = {}) {
  const candidates = [
    { sourceKey: "buff", source: "BUFF", record: buffRecord },
    { sourceKey: "youpin", source: "YouPin", record: youpinRecord }
  ].filter((entry) => {
    const price = Number(entry.record?.price);
    return Number.isFinite(price) && price > 0;
  });
  if (!candidates.length) return null;
  candidates.sort((left, right) => {
    const leftUpdatedAt = Date.parse(String(left.record?.updatedAt || ""));
    const rightUpdatedAt = Date.parse(String(right.record?.updatedAt || ""));
    const leftHasTime = Number.isFinite(leftUpdatedAt);
    const rightHasTime = Number.isFinite(rightUpdatedAt);
    if (leftHasTime && rightHasTime && leftUpdatedAt !== rightUpdatedAt) return rightUpdatedAt - leftUpdatedAt;
    if (leftHasTime !== rightHasTime) return rightHasTime ? 1 : -1;
    return left.sourceKey.localeCompare(right.sourceKey);
  });
  return candidates[0];
}

export function isFreshPlatformRecord(record, { nowMs = Date.now(), maxAgeMs = 30 * 60 * 1000 } = {}) {
  const price = Number(record?.price);
  const updatedAtMs = Date.parse(String(record?.updatedAt || ""));
  if (!Number.isFinite(price) || price <= 0) return false;
  if (!Number.isFinite(updatedAtMs)) return false;
  return nowMs - updatedAtMs >= 0 && nowMs - updatedAtMs <= maxAgeMs;
}

export function shouldRefreshPlatformRecord({
  record = null,
  connected = false,
  forceRefresh = false,
  nowMs = Date.now(),
  maxAgeMs = 30 * 60 * 1000
} = {}) {
  if (!connected) return false;
  if (forceRefresh) return true;
  return !isFreshPlatformRecord(record, { nowMs, maxAgeMs });
}

export function shouldBlockPlatformRefresh({ cooldownUntilMs = 0, nowMs = Date.now() } = {}) {
  return Number.isFinite(Number(cooldownUntilMs)) && Number(cooldownUntilMs) > nowMs;
}

export function buildMarketHashIndex(snapshot) {
  const exactIndex = new Map();
  const normalizedIndex = new Map();
  let exactEntries = 0;
  for (const [itemId, record] of Object.entries(snapshot?.items || {})) {
    for (const [rawWearId, priceRecord] of Object.entries(record?.prices || {})) {
      const marketHashName = String(priceRecord?.marketHashName || "").trim();
      if (!marketHashName) continue;
      const match = buildIndexMatch(itemId, rawWearId);
      exactIndex.set(marketHashName, match);
      exactEntries += 1;
      const normalized = normalizeMarketHashName(marketHashName);
      if (!normalized) continue;
      const current = normalizedIndex.get(normalized) || [];
      current.push(match);
      normalizedIndex.set(normalized, current);
    }
  }
  return {
    exactIndex,
    normalizedIndex,
    stats: { exactEntries, normalizedEntries: normalizedIndex.size }
  };
}

export function resolveMarketHashMatch(index, commodityHashName = "") {
  const marketHashName = String(commodityHashName || "").trim();
  if (!marketHashName) return { match: null, mode: "missing" };
  const exact = index?.exactIndex?.get(marketHashName) || null;
  if (exact) return { match: exact, mode: "exact" };
  const normalized = normalizeMarketHashName(marketHashName);
  const candidates = normalized ? (index?.normalizedIndex?.get(normalized) || []) : [];
  if (candidates.length === 1) return { match: candidates[0], mode: "normalized" };
  if (candidates.length > 1) {
    const wearFromName = normalizeWearId(marketHashName);
    const wearCandidates = wearFromName
      ? candidates.filter((entry) => normalizeWearId(entry.wearId) === wearFromName)
      : [];
    if (wearCandidates.length === 1) return { match: wearCandidates[0], mode: "normalized-wear" };
    return { match: null, mode: "ambiguous", candidates };
  }
  return { match: null, mode: "missing" };
}

export function findBestSellingWear(record = {}) {
  const entries = Object.entries(record?.prices || {})
    .map(([wearId, priceRecord]) => ({
      wearId: wearId === "default" ? "" : wearId,
      label: wearLabel(wearId === "default" ? "" : wearId),
      price: Number(priceRecord?.price) || 0,
      sellNum: Number(priceRecord?.sellNum) || 0
    }))
    .filter((entry) => entry.price > 0);
  if (!entries.length) return null;
  return entries.sort((left, right) => {
    if (right.sellNum !== left.sellNum) return right.sellNum - left.sellNum;
    return left.price - right.price;
  })[0];
}

function historyTrend(values = []) {
  if (values.length < 2) return "stable";
  const first = Number(values[0]) || 0;
  const last = Number(values[values.length - 1]) || 0;
  if (!first || !last) return "stable";
  const delta = (last - first) / first;
  if (delta >= 0.05) return "up";
  if (delta <= -0.05) return "down";
  return "stable";
}

function liquidityFromSignals(...records) {
  const sellCount = records.reduce((max, record) => Math.max(max, Number(record?.sellNum) || 0), 0);
  if (sellCount >= 15) return "high";
  if (sellCount >= 5) return "medium";
  return "low";
}

export function summarizeItemAnalysis({
  itemId = "",
  wearId = "",
  variantId = "standard",
  itemName = "",
  snapshotRecord = null,
  priceEntry = null,
  buffRecord = null,
  youpinRecord = null
} = {}) {
  const bestWear = snapshotRecord ? findBestSellingWear(snapshotRecord) : (priceEntry?.wearId ? {
    wearId: priceEntry.wearId,
    label: wearLabel(priceEntry.wearId),
    price: Number(priceEntry.price) || 0,
    sellNum: Number(priceEntry?.record?.sellNum) || 0
  } : null);
  const prices = [Number(buffRecord?.price), Number(youpinRecord?.price), Number(priceEntry?.price)]
    .filter((value) => Number.isFinite(value) && value > 0);
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : 0;
  const spread = low > 0 && high > low ? (((high - low) / low) * 100).toFixed(1) : "";
  const liquidity = liquidityFromSignals(buffRecord, youpinRecord, priceEntry?.record);
  const insights = [];
  if (bestWear?.wearId) {
    insights.push(`${wearLabel(bestWear.wearId)} is currently the most active wear tier in the local snapshot.`);
  }
  if (spread) {
    insights.push(`Cross-market reference spread is about ${spread}% between the lowest and highest quoted sources.`);
  } else {
    insights.push("Current references are tightly clustered, so price discovery looks stable.");
  }
  insights.push(
    liquidity === "high"
      ? "Multiple listings are active, so this item should be easier to move without waiting too long."
      : liquidity === "medium"
        ? "Listing depth is usable, but pricing can move quickly between refreshes."
        : "Listing depth is thin, so the shown reference should be treated as directional rather than guaranteed."
  );
  return {
    ok: true,
    itemId,
    wearId,
    variantId,
    itemName,
    liquidity,
    bestSellingWear: bestWear,
    history: prices.length >= 2 ? { trend: historyTrend([low, high]) } : null,
    insights
  };
}

export function summarizeOpeningAnalysis({
  openingId = "",
  openingName = "",
  locale = "en",
  openingPrice = 0,
  keyPrice = 0,
  entries = []
} = {}) {
  const normalizedEntries = (Array.isArray(entries) ? entries : [])
    .map((entry) => ({
      ...entry,
      probability: Number(entry?.probability) || 0,
      price: Number(entry?.price) || 0
    }))
    .filter((entry) => entry.probability > 0 && entry.price > 0);
  const entryCost = Number((Number(openingPrice) || 0) + (Number(keyPrice) || 0));
  const expectedValue = Number(normalizedEntries.reduce((sum, entry) => sum + (entry.price * entry.probability), 0).toFixed(2));
  const roi = entryCost > 0 ? Number((((expectedValue - entryCost) / entryCost) * 100).toFixed(2)) : 0;
  const commentary = locale.startsWith("zh")
    ? (roi >= 0
      ? "按当前掉落结构估算，这个箱子的理论回报已经接近或高于入场成本。"
      : "按当前掉落结构估算，这个箱子的理论回报仍低于入场成本，更适合娱乐或收藏视角。")
    : (roi >= 0
      ? "At current drop values, the case is roughly break-even or better on paper."
      : "At current drop values, the case still runs below break-even and is better treated as entertainment.");
  const insights = [
    roi >= 0
      ? (locale.startsWith("zh") ? "理论期望为正，但仍要注意波动和实际成交价。" : "Theoretical EV is positive, but volatility and real fill prices still matter.")
      : (locale.startsWith("zh") ? "理论期望为负，主要依赖少数高价值掉落拉高结果。" : "Theoretical EV is negative, with returns relying on a small number of high-end drops."),
    normalizedEntries.length >= 3
      ? (locale.startsWith("zh") ? "高价值掉落数量有限，绝大多数开箱结果仍会集中在低价区间。" : "High-end outcomes are limited, so most openings still cluster in the lower-value band.")
      : (locale.startsWith("zh") ? "当前样本较少，这里只提供保守估算。" : "The current sample is small, so this remains a conservative estimate.")
  ];
  return {
    ok: true,
    openingId,
    openingName,
    locale,
    entryCost,
    expectedValue,
    roi,
    commentary,
    insights,
    topDrops: normalizedEntries
      .sort((left, right) => right.price - left.price)
      .slice(0, 3)
  };
}
