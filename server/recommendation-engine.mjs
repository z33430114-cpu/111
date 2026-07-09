import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const DATA_CACHE = {
  loaded: false,
  rootDir: "",
  catalog: [],
  prices: null,
  colorIndex: { items: {} },
  candidates: [],
  weapons: [],
  aliasIndex: []
};

const RECOMMENDABLE_TYPES = new Set(["rifle", "pistol", "smg", "shotgun", "machinegun", "knife", "glove"]);
const GUN_TYPES = new Set(["rifle", "pistol", "smg", "shotgun", "machinegun"]);
const DEFAULT_WEAPON_ORDER = [
  "AK-47", "M4A1-S", "M4A4", "AWP", "AUG", "SG 553", "FAMAS", "Galil AR", "SSG 08", "Desert Eagle", "USP-S", "Glock-18"
];

const WEAR_LABELS = {
  "factory-new": "Factory New",
  "minimal-wear": "Minimal Wear",
  "field-tested": "Field-Tested",
  "well-worn": "Well-Worn",
  "battle-scarred": "Battle-Scarred",
  default: "Default"
};

const GROUP_LABELS = {
  rifle: "\u6b65\u67aa",
  pistol: "\u624b\u67aa",
  smg: "\u51b2\u950b\u67aa",
  shotgun: "\u9730\u5f39\u67aa",
  machinegun: "\u673a\u67aa",
  knife: "\u5200",
  glove: "\u624b\u5957"
};

const THEME_KEYWORDS = {
  white: /printstream|snow leopard|king snake|whiteout|damascus|stainless|clear polymer|silver|snow|ice|white|pearl|ivory|\u5370\u82b1\u96c6|\u96ea\u8c79|\u738b\u86c7|\u767d|\u94f6|\u51b0|\u96ea|\u4e0d\u9508\u94a2/u,
  red: /bloodsport|redline|crimson|slaughter|kill confirmed|hot rod|cyrex|code red|ruby|fire|blood|red|\u8840|\u7ea2|\u706b|\u5c60\u592b|\u6740\u610f|\u70bd\u70ed/u,
  blue: /vulcan|blue phosphor|superconductor|amphibious|guardian|blueprint|bright water|frontside|cobalt|blue|teal|aqua|\u706b\u795e|\u84dd|\u9752|\u94b4|\u8d85\u5bfc|\u4e24\u6816|\u53cc\u6816/u,
  green: /wild lotus|hydroponic|emerald|gamma doppler|hedge maze|spearmint|jade|green|forest|bamboo|lotus|\u7eff|\u7fe1\u7fe0|\u4f3d\u9a6c|\u6811\u7bf1|\u8584\u8377|\u68ee\u6797|\u7af9|\u83b2/u,
  purple: /neo-noir|nightwish|vice|pandora|imperial plaid|ultraviolet|black pearl|purple|pink|violet|magenta|\u7d2b|\u7c89|\u8fc8\u963f\u5bc6|\u6f58\u591a\u62c9|\u9713\u8679|\u68a6\u9b47/u,
  gold: /gold|tiger tooth|fuel injector|lore|arid|brass|dragon lore|desert hydra|yellow|luxury|\u91d1|\u9ec4|\u864e\u7259|\u4f20\u8bf4|\u9f99\u72d9|\u5962\u534e|\u9ad8\u7ea7/u,
  black: /nocts|black tie|black laminate|night|night stripe|slate|elite build|smoke out|dark|tactical|black|\u9ed1|\u6697|\u591c|\u6218\u672f|\u77f3\u677f|\u7cbe\u82f1/u
};

const TONE_SCORES = {
  white: { ivory: 2.2, pearl: 2.0, neutral: 1.4, gold: 0.8, teal: 0.5, violet: 0.4 },
  red: { crimson: 2.3, ruby: 2.2, gold: 0.7, pearl: 0.5, violet: 0.5 },
  blue: { teal: 2.1, pearl: 1.8, ivory: 1.2, violet: 0.6 },
  green: { emerald: 2.3, teal: 1.8, ivory: 0.8, pearl: 0.5 },
  purple: { violet: 2.3, pearl: 1.1, crimson: 0.8, ruby: 0.6 },
  gold: { gold: 2.4, ivory: 1.2, pearl: 0.7 },
  black: { neutral: 2.2, pearl: 1.2, ivory: 0.8, crimson: 0.7 }
};

const RARITY_ALIASES = [
  ["consumer", /consumer|consumer grade|\u6d88\u8d39\u7ea7|\u666e\u901a\u7ea7/iu],
  ["industrial", /industrial|\u5de5\u4e1a\u7ea7/iu],
  ["mil-spec", /mil[\s-]?spec|\u519b\u89c4\u7ea7/iu],
  ["restricted", /restricted|\u53d7\u9650\u7ea7/iu],
  ["classified", /classified|\u4fdd\u5bc6\u7ea7/iu],
  ["covert", /covert|\u9690\u79d8\u7ea7/iu],
  ["contraband", /contraband|\u8fdd\u7981/iu],
  ["extraordinary", /extraordinary|\u975e\u51e1/iu]
];

const TRAIT_RULES = [
  ["camo", /camo|ddpat|forest|urban|jungle|\u8ff7\u5f69|\u4f2a\u88c5|\u68ee\u6797|\u90fd\u5e02/iu],
  ["digital", /digital|pixel|\u6570\u5b57|\u50cf\u7d20/iu],
  ["skull", /skull|\u9ab7\u9ac5|\u5934\u9aa8/iu],
  ["dragon", /dragon|howl|\u9f99|\u5486\u54ee/iu],
  ["snake", /snake|serpent|constrictor|\u86c7|\u87d2/iu],
  ["web", /spider|web|\u8718\u86db|\u86db\u7f51/iu],
  ["flame", /flame|fire|lava|blaze|hot rod|\u706b|\u706b\u7130|\u7194\u5ca9|\u70c8\u7130/iu],
  ["ice", /ice|snow|frost|arctic|\u51b0|\u96ea|\u5bd2\u971c/iu],
  ["space", /space|star|satellite|sputnik|\u592a\u7a7a|\u661f|\u536b\u661f|\u5b87\u5b99/iu],
  ["metal", /metal|chrome|anodized|steel|stainless|\u91d1\u5c5e|\u94ec|\u7535\u9540|\u94a2|\u4e0d\u9508/iu],
  ["abstract", /abstract|geometric|graffiti|comic|graphic|\u62bd\u8c61|\u51e0\u4f55|\u6d82\u9e26|\u6f2b\u753b/iu],
  ["neon", /neon|cyber|glow|pulse|\u9713\u8679|\u8d5b\u535a|\u53d1\u5149|\u7535\u5b50|\u8109\u51b2/iu],
  ["clean", /clean|minimal|simple|whiteout|printstream|\u5e72\u51c0|\u7b80\u6d01|\u6781\u7b80|\u7d20/iu],
  ["luxury", /luxury|premium|gold|lore|tiger tooth|\u5962\u534e|\u9ad8\u7ea7|\u8d28\u611f|\u9ec4\u91d1|\u864e\u7259|\u4f20\u8bf4/iu],
  ["aggressive", /aggressive|blood|slaughter|kill confirmed|redline|\u5f20\u626c|\u4fb5\u7565|\u8840|\u51f6/iu],
  ["dark", /dark|black|night|nocts|slate|\u6697\u9ed1|\u9ed1|\u6218\u672f|\u6f5c\u884c|\u591c/iu],
  ["cartoon", /anime|cartoon|temukau|bullet queen|\u5361\u901a|\u52a8\u6f2b|\u4e8c\u6b21\u5143|\u6f2b\u753b/iu]
];

const WEAPON_ALIASES = {
  "AK-47": ["ak", "ak47", "\u963f\u5361"],
  AUG: ["aug"],
  AWP: ["awp", "\u5927\u72d9", "\u72d9"],
  "Desert Eagle": ["deagle", "desert eagle", "\u6c99\u9e70", "\u6c99\u6f20\u4e4b\u9e70"],
  "Dual Berettas": ["dualies", "dual berettas", "\u53cc\u67aa", "\u53cc\u6301\u8d1d\u745e\u5854"],
  "Five-SeveN": ["five seven", "fiveseven", "57", "\u4e94\u4e03"],
  "Glock-18": ["glock", "\u683c\u6d1b\u514b"],
  "M4A1-S": ["m4a1", "m4a1s", "m4a1-s", "\u6d88\u97f3m4"],
  M4A4: ["m4a4"],
  "SG 553": ["sg553", "sg 553"],
  "SSG 08": ["ssg08", "ssg 08", "\u9e1f\u72d9"],
  "R8 Revolver": ["r8", "revolver", "\u5de6\u8f6e"],
  "CZ75-Auto": ["cz75", "cz"],
  "Tec-9": ["tec9", "tec 9"],
  "MAC-10": ["mac10", "mac 10"],
  "MP5-SD": ["mp5", "mp5sd"],
  "MP7": ["mp7"],
  "MP9": ["mp9"],
  "PP-Bizon": ["bizon", "pp bizon", "\u91ce\u725b"],
  "UMP-45": ["ump", "ump45"],
  P90: ["p90"],
  P2000: ["p2000"],
  P250: ["p250"],
  FAMAS: ["famas"],
  "Galil AR": ["galil", "\u52a0\u5229\u5c14"],
  G3SG1: ["g3sg1"],
  "SCAR-20": ["scar20", "scar 20"],
  M249: ["m249"],
  Negev: ["negev"],
  "MAG-7": ["mag7", "mag 7"],
  Nova: ["nova"],
  "Sawed-Off": ["sawed off", "sawed-off"],
  XM1014: ["xm1014"],
  "Zeus x27": ["zeus", "\u7535\u51fb\u67aa"]
};

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeText(value = "") {
  return String(value || "").normalize("NFKC").trim().toLowerCase();
}

function normalizeSearchText(value = "") {
  return normalizeText(value)
    .replace(/[★™|/,+*()[\]{}'"`._-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function slugify(value = "") {
  return normalizeSearchText(value).replace(/\s+/gu, "-");
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function groupForType(type = "") {
  return GUN_TYPES.has(type) ? type : type === "knife" || type === "glove" ? type : "other";
}

function detectTheme(input = {}) {
  const text = [input.color, input.style, ...(Array.isArray(input.styles) ? input.styles : [])].filter(Boolean).join(" ");
  for (const [theme, pattern] of Object.entries(THEME_KEYWORDS)) {
    if (pattern.test(text)) return theme;
  }
  return "mixed";
}

function rarityIdForText(text = "") {
  return RARITY_ALIASES.find(([, pattern]) => pattern.test(text))?.[0] || "";
}

function rarityIdsForInput(input = {}) {
  const raw = [
    input.color,
    input.style,
    ...(Array.isArray(input.styles) ? input.styles : []),
    ...(Array.isArray(input.rarities) ? input.rarities : [])
  ].filter(Boolean).join(" ");
  return unique(RARITY_ALIASES.filter(([, pattern]) => pattern.test(raw)).map(([id]) => id));
}

function traitIdsForText(text = "") {
  return TRAIT_RULES.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
}

function traitIdsForInput(input = {}) {
  const raw = [
    input.color,
    input.style,
    ...(Array.isArray(input.styles) ? input.styles : [])
  ].filter(Boolean).join(" ");
  return unique(TRAIT_RULES.filter(([, pattern]) => pattern.test(raw)).map(([id]) => id));
}

function requestTerms(input = {}) {
  const raw = [
    input.color,
    input.style,
    ...(Array.isArray(input.styles) ? input.styles : []),
    ...(Array.isArray(input.weaponPreferences) ? input.weaponPreferences : []),
    ...(Array.isArray(input.preferredWears) ? input.preferredWears : []),
    ...(Array.isArray(input.rarities) ? input.rarities : []),
    ...(Array.isArray(input.specificTerms) ? input.specificTerms : [])
  ].filter(Boolean).join(" ");
  const normalized = normalizeSearchText(raw).replace(/\d+(?:\.\d+)?\s*(?:w|k|万|千|元|cny|rmb)?/giu, " ");
  return unique([
    ...normalized.split(/\s+/u).filter((term) => term.length >= 2),
    ...[...normalized.matchAll(/[\p{Script=Han}]{2,}/gu)].map((match) => match[0])
  ]).filter((term) => !/^(预算|推荐|搭配|皮肤|饰品|想要|需要|左右|以内|以下|以上|budget|recommend|skin|skins|weapon|weapons|color|style)$/iu.test(term)).slice(0, 32);
}

function marketPriceForWear(priceEntry, wearId) {
  const wearEntry = priceEntry?.prices?.[wearId];
  if (!wearEntry) return null;
  const price = Number(wearEntry.price || wearEntry.quickSell || 0);
  if (!Number.isFinite(price) || price <= 0) return null;
  return {
    price,
    quickSell: Number(wearEntry.quickSell || price),
    marketHashName: wearEntry.marketHashName || "",
    source: wearEntry.source || "",
    currencyCode: wearEntry.currencyCode || "CNY"
  };
}

function canonicalWeaponForItem(item = {}) {
  if (item.type === "knife") return item.weaponEn || item.weapon || item.weaponZh || "Knife";
  if (item.type === "glove") return item.weaponEn || item.weapon || item.weaponZh || "Gloves";
  return item.weaponEn || item.weapon || item.weaponZh || item.nameEn?.split("|")[0]?.trim() || "";
}

function buildWeaponIndex(catalog = []) {
  const map = new Map();
  for (const item of catalog) {
    if (!RECOMMENDABLE_TYPES.has(item.type)) continue;
    const weapon = canonicalWeaponForItem(item);
    if (!weapon) continue;
    const id = slugify(weapon);
    const current = map.get(id) || {
      id,
      weapon,
      label: item.weaponZh || item.weapon || weapon,
      type: item.type,
      group: groupForType(item.type),
      aliases: new Set()
    };
    current.aliases.add(weapon);
    current.aliases.add(item.weaponZh || "");
    current.aliases.add(item.weapon || "");
    current.aliases.add(item.weaponEn || "");
    for (const alias of WEAPON_ALIASES[weapon] || []) current.aliases.add(alias);
    map.set(id, current);
  }
  const weapons = [...map.values()].map((entry) => ({
    ...entry,
    aliases: unique([...entry.aliases].map((alias) => String(alias || "").trim())).sort((a, b) => b.length - a.length)
  }));
  const aliasIndex = weapons
    .flatMap((weapon) => weapon.aliases.map((alias) => ({
      alias,
      normalized: normalizeSearchText(alias),
      weaponId: weapon.id
    })))
    .filter((entry) => entry.normalized)
    .sort((a, b) => b.normalized.length - a.normalized.length);
  return { weapons, aliasIndex };
}

async function loadCatalogData(rootDir) {
  const raw = await readFile(join(rootDir, "catalog-data.js"), "utf8");
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(raw, context);
  return Array.isArray(context.globalThis.CS2_CATALOG) ? context.globalThis.CS2_CATALOG : [];
}

async function loadMarketPrices(rootDir) {
  return safeJsonParse(await readFile(join(rootDir, ".data", "market-prices.json"), "utf8"), { items: {} });
}

async function loadSkinColorIndex(rootDir) {
  try {
    const raw = await readFile(join(rootDir, ".data", "skin-color-index.json"), "utf8");
    const parsed = safeJsonParse(raw, { items: {} });
    return parsed && typeof parsed === "object" && parsed.items && typeof parsed.items === "object" ? parsed : { items: {} };
  } catch {
    return { items: {} };
  }
}

function colorIndexEntryFor(item = {}, colorIndex = { items: {} }) {
  const entry = colorIndex?.items?.[item.id];
  return entry && typeof entry === "object" ? entry : {};
}

async function buildCatalogIndex(rootDir) {
  if (DATA_CACHE.loaded && DATA_CACHE.rootDir === rootDir) return DATA_CACHE;
  const [catalog, prices, colorIndex] = await Promise.all([loadCatalogData(rootDir), loadMarketPrices(rootDir), loadSkinColorIndex(rootDir)]);
  const { weapons, aliasIndex } = buildWeaponIndex(catalog);
  const weaponByName = new Map(weapons.map((weapon) => [weapon.weapon, weapon]));
  const candidates = [];
  for (const item of catalog) {
    if (!RECOMMENDABLE_TYPES.has(item.type)) continue;
    const weaponName = canonicalWeaponForItem(item);
    const weaponMeta = weaponByName.get(weaponName);
    if (!weaponMeta) continue;
    const priceEntry = prices?.items?.[item.id];
    if (!priceEntry?.prices) continue;
    const colorEntry = colorIndexEntryFor(item, colorIndex);
    const colorTags = Array.isArray(colorEntry.colors) ? colorEntry.colors.map((color) => normalizeText(color)).filter(Boolean) : [];
    const visualTone = normalizeText(colorEntry.primaryTone || item.tone);
    const baseSearchText = normalizeSearchText([
      item.name,
      item.nameEn,
      item.nameZh,
      item.weapon,
      item.weaponEn,
      item.weaponZh,
      item.type,
      item.model,
      visualTone,
      ...colorTags,
      item.rarity,
      item.rarityEn,
      item.rarityZh,
      item.quality,
      item.qualityEn,
      item.qualityZh,
      item.collection,
      item.collectionEn,
      item.collectionZh,
      item.description,
      item.descriptionEn,
      item.descriptionZh,
      item.patternId,
      item.paintIndex
    ].filter(Boolean).join(" "));
    const rarityId = rarityIdForText(baseSearchText);
    const traitIds = traitIdsForText(baseSearchText);
    const wearIds = Array.isArray(item.wears) && item.wears.length ? item.wears : ["default"];
    for (const wearId of wearIds) {
      const priceInfo = marketPriceForWear(priceEntry, wearId);
      if (!priceInfo) continue;
      const searchText = normalizeSearchText(`${baseSearchText} ${priceInfo.marketHashName || ""} ${WEAR_LABELS[wearId] || wearId}`);
      candidates.push({
        id: item.id,
        wearId,
        weaponId: weaponMeta.id,
        weapon: weaponName,
        weaponLabel: item.weaponZh || item.weapon || weaponName,
        type: item.type,
        group: weaponMeta.group,
        nameEn: item.nameEn || "",
        nameZh: item.nameZh || item.name || "",
        price: priceInfo.price,
        marketHashName: priceInfo.marketHashName,
        image: item.image || "",
        tone: visualTone,
        colorTags,
        colorConfidence: Number(colorEntry.confidence || 0),
        dominantColors: Array.isArray(colorEntry.dominantColors) ? colorEntry.dominantColors : [],
        rarity: item.rarityZh || item.rarityEn || item.rarity || "",
        rarityId,
        quality: item.qualityZh || item.qualityEn || item.quality || "",
        collection: item.collectionZh || item.collectionEn || item.collection || "",
        description: item.descriptionZh || item.descriptionEn || item.description || "",
        patternId: item.patternId || "",
        paintIndex: item.paintIndex || "",
        traitIds,
        searchText,
        wearLabel: WEAR_LABELS[wearId] || wearId,
        source: priceInfo.source
      });
    }
  }
  Object.assign(DATA_CACHE, {
    loaded: true,
    rootDir,
    catalog,
    prices,
    colorIndex,
    candidates,
    weapons,
    aliasIndex
  });
  return DATA_CACHE;
}

function resolveWeaponIds(values = [], index) {
  const result = [];
  const aliasIndex = index.aliasIndex || [];
  for (const value of Array.isArray(values) ? values : []) {
    const raw = normalizeSearchText(value?.weaponId || value?.weapon || value);
    if (!raw) continue;
    const direct = index.weapons.find((weapon) => weapon.id === raw || normalizeSearchText(weapon.weapon) === raw);
    if (direct) {
      result.push(direct.id);
      continue;
    }
    const matched = aliasIndex.find((entry) => raw === entry.normalized || raw.includes(entry.normalized) || entry.normalized.includes(raw));
    if (matched) result.push(matched.weaponId);
  }
  return unique(result);
}

function firstWeaponIdForGroup(index, group) {
  return index.weapons.find((entry) => entry.group === group)?.id || "";
}

function hasPreferredItemForGroup(input = {}, group = "") {
  const normalizedGroup = normalizeSearchText(group);
  return (Array.isArray(input.preferredItems) ? input.preferredItems : [])
    .some((item) => normalizeSearchText(item?.slot || item?.weapon || item?.weaponId) === normalizedGroup && normalizeSearchText(item?.query || ""));
}

function isGenericGloveRequest(input = {}, request = {}) {
  return (request.group === "glove" || request.weaponId === "__group:glove" || request.constraints?.group === "glove") && !hasPreferredItemForGroup(input, "glove");
}

function defaultLoadoutWeaponsForBudget(budget = 0) {
  const value = Number(budget || 0);
  const coreGuns = ["AK-47", "AWP", "M4A4", "M4A1-S", "USP-S", "Glock-18"];
  if (Number.isFinite(value) && value > 3000) return ["glove", "knife", ...coreGuns];
  if (Number.isFinite(value) && value >= 800) return ["knife", ...coreGuns];
  return coreGuns;
}

function expandRequestedItems(input = {}, index) {
  const excluded = new Set(resolveWeaponIds(input.excludeSlots || input.excludeWeapons || [], index));
  if ((input.excludeSlots || []).some((slot) => normalizeSearchText(slot) === "knife")) {
    for (const weapon of index.weapons.filter((entry) => entry.group === "knife")) excluded.add(weapon.id);
  }
  if ((input.excludeSlots || []).some((slot) => normalizeSearchText(slot) === "glove")) {
    for (const weapon of index.weapons.filter((entry) => entry.group === "glove")) excluded.add(weapon.id);
  }

  let requestSequence = 0;
  const makeRequest = (weaponId, quantity = 1, constraints = {}, priority = 10, group = "") => ({
    weaponId,
    group,
    quantity: Math.max(1, Math.min(10, Number(quantity || 1) || 1)),
    constraints: constraints && typeof constraints === "object" ? constraints : {},
    priority,
    sequence: requestSequence++
  });
  const makeGroupRequest = (group, quantity = 1, constraints = {}, priority = 10) => makeRequest(`__group:${group}`, quantity, { ...(constraints || {}), group }, priority, group);
  const explicit = [];
  for (const entry of Array.isArray(input.requestedItems) ? input.requestedItems : []) {
    const ids = resolveWeaponIds([entry.weaponId || entry.weapon || entry.slot], index);
    for (const weaponId of ids) {
      explicit.push(makeRequest(weaponId, entry.quantity, entry.constraints, 0));
    }
  }
  for (const weaponId of resolveWeaponIds([...(input.weaponPreferences || []), ...(input.extraWeapons || [])], index)) {
    explicit.push(makeRequest(weaponId, 1, {}, 2));
  }
  for (const slot of input.mustInclude || []) {
    const normalized = normalizeSearchText(slot);
    if (normalized === "knife") {
      explicit.push(makeGroupRequest("knife", 1, {}, 1));
    } else if (normalized === "glove") {
      explicit.push(makeGroupRequest("glove", 1, {}, 1));
    }
  }

  let requests = [];
  if (input.allWeapons) {
    requests = index.weapons
      .filter((weapon) => GUN_TYPES.has(weapon.group))
      .map((weapon) => makeRequest(weapon.id, 1, {}, 3));
  } else if (explicit.length) {
    requests = explicit;
  } else if (input.fullLoadout) {
    requests = ["AK-47", "M4A1-S", "M4A4", "AWP", "USP-S", "Glock-18"]
      .map((weapon) => resolveWeaponIds([weapon], index)[0])
      .filter(Boolean)
      .map((weaponId) => makeRequest(weaponId, 1, {}, 3));
    for (const group of ["knife", "glove"]) {
      requests.push(makeGroupRequest(group, 1, {}, 3));
    }
  } else {
    requests = defaultLoadoutWeaponsForBudget(input.budget)
      .map((weapon) => weapon === "knife" || weapon === "glove" ? makeGroupRequest(weapon, 1, {}, 3) : makeRequest(resolveWeaponIds([weapon], index)[0], 1, {}, 3))
      .filter((request) => request.weaponId);
  }

  const mergedRequests = [];
  const requestByWeaponId = new Map();
  for (const request of requests) {
    if (!request.weaponId) continue;
    const requestKey = request.group ? `group:${request.group}` : request.weaponId;
    const existing = requestByWeaponId.get(requestKey);
    if (!existing) {
      requestByWeaponId.set(requestKey, { ...request });
      continue;
    }
    existing.quantity = Math.max(existing.quantity, request.quantity);
    existing.constraints = { ...(existing.constraints || {}), ...(request.constraints || {}) };
    if (request.priority < existing.priority || (request.priority === existing.priority && request.sequence < existing.sequence)) {
      existing.priority = request.priority;
      existing.sequence = request.sequence;
    }
  }
  mergedRequests.push(...[...requestByWeaponId.values()].sort((left, right) => left.priority - right.priority || left.sequence - right.sequence));

  const expanded = [];
  for (const request of mergedRequests) {
    if (!request.weaponId || excluded.has(request.weaponId)) continue;
    if (request.group && index.weapons.filter((entry) => entry.group === request.group).every((entry) => excluded.has(entry.id))) continue;
    const quantity = Math.max(1, Math.min(10, Number(request.quantity || 1) || 1));
    for (let copy = 0; copy < quantity; copy += 1) {
      expanded.push({ ...request, requestIndex: expanded.length, quantity: 1 });
    }
  }
  return expanded;
}

function visualColorShare(candidate = {}, theme = "") {
  const buckets = Array.isArray(candidate.dominantColors) ? candidate.dominantColors : [];
  const namesByTheme = {
    black: ["black", "gray"],
    white: ["white", "gray"],
    red: ["red", "orange"],
    blue: ["blue", "teal"],
    green: ["green"],
    purple: ["purple", "pink"],
    gold: ["gold", "orange"]
  }[theme] || [theme];
  return buckets
    .filter((entry) => namesByTheme.includes(normalizeText(entry.name)))
    .reduce((sum, entry) => sum + Number(entry.share || 0), 0);
}

function scoreCandidate(candidate, input = {}, request = {}, ordinal = 0) {
  let score = 0;
  const theme = detectTheme(input);
  if (theme !== "mixed") {
    score += TONE_SCORES[theme]?.[candidate.tone] || 0;
    const visualShare = visualColorShare(candidate, theme);
    if (visualShare >= 0.18) score += 3 + Math.min(3, visualShare * 4);
    if (THEME_KEYWORDS[theme]?.test(candidate.searchText)) score += 3;
  }
  const rarityIds = unique([...rarityIdsForInput(input), ...rarityIdsForInput(request.constraints || {})]);
  if (rarityIds.includes(candidate.rarityId)) score += 6;
  const traitIds = unique([...traitIdsForInput(input), ...traitIdsForInput(request.constraints || {})]);
  for (const trait of traitIds) {
    if (candidate.traitIds.includes(trait)) score += 4;
  }
  const wears = unique([...(input.preferredWears || []), ...((request.constraints || {}).preferredWears || [])]);
  if (wears.includes(candidate.wearId)) score += 3.5;
  if (isGenericGloveRequest(input, request)) {
    if (candidate.wearId === "field-tested") score += 7;
    if (/hand wraps|裹手/i.test(candidate.searchText)) score -= 2.2;
    if (candidate.wearId === "factory-new" && candidate.price < 8000) score -= 5;
    if (candidate.price > 8000) score += Math.log10(candidate.price) * 0.7;
  }
  const terms = unique([...requestTerms(input), ...requestTerms(request.constraints || {})]);
  for (const term of terms) {
    if (candidate.searchText.includes(normalizeSearchText(term))) score += term.length >= 4 ? 2.4 : 1.3;
  }
  for (const item of input.preferredItems || []) {
    const query = normalizeSearchText(item.query || "");
    const preferredSlot = normalizeSearchText(item.slot || item.weapon || item.weaponId || "");
    const matchesGroup = preferredSlot === "glove" || preferredSlot === "knife" ? candidate.group === preferredSlot : false;
    const itemWeaponIds = resolveWeaponIds([item.slot || item.weapon || item.weaponId], DATA_CACHE);
    if (query && (matchesGroup || !itemWeaponIds.length || itemWeaponIds.includes(candidate.weaponId)) && candidate.searchText.includes(query)) {
      score += 24;
    }
  }
  if ((input.styles || []).includes("understated") && /fade|neon|asiimov|temukau|bullet queen|nightwish|bloodsport|fuel injector|vulcan/i.test(candidate.searchText)) score -= 1.3;
  if (input.budgetMode === "maximize") score += Math.log10(Math.max(1, candidate.price)) * 1.1;
  if (input.budgetMode === "conservative") score -= Math.log10(Math.max(1, candidate.price)) * 0.6;
  return score - (ordinal * 0.03);
}

function pickCandidateForRequest({ candidates, input, request, perItemBudget, usedKeys, allowOverBudget = false }) {
  const pool = candidates
    .filter((candidate) => request.group ? candidate.group === request.group : candidate.weaponId === request.weaponId)
    .filter((candidate) => candidate.price <= perItemBudget || perItemBudget <= 0);
  const source = pool.length
    ? pool
    : (allowOverBudget ? candidates.filter((candidate) => request.group ? candidate.group === request.group : candidate.weaponId === request.weaponId) : []);
  if (!source.length) return null;
  const uniqueSource = source.filter((candidate) => !usedKeys.has(candidate.id));
  const scoredSource = (uniqueSource.length ? uniqueSource : source)
    .map((candidate, ordinal) => ({ candidate, score: scoreCandidate(candidate, input, request, ordinal) }))
    .sort((a, b) => (b.score - a.score) || (input.budgetMode === "conservative" ? a.candidate.price - b.candidate.price : b.candidate.price - a.candidate.price));
  return scoredSource[0]?.candidate || null;
}

function itemReason(item, input = {}) {
  const bits = [];
  if (item.rarity) bits.push(item.rarity);
  if (item.wearLabel) bits.push(item.wearLabel);
  if (item.collection) bits.push(item.collection);
  if (detectTheme(input) !== "mixed") bits.push(`${detectTheme(input)} theme`);
  return bits.join(" · ");
}

function buildSummary({ picks, budget, theme, requests, warnings }) {
  const totalPrice = Number(picks.reduce((sum, item) => sum + item.price, 0).toFixed(2));
  return {
    title: `AI shopping list · ${picks.length} items`,
    totalPrice,
    budget,
    budgetUsage: budget > 0 ? Number((totalPrice / budget).toFixed(4)) : 0,
    theme,
    itemCount: picks.length,
    requestedCount: requests.length,
    warnings,
    items: picks.map((item, index) => ({
      slot: item.weaponId,
      slotLabel: item.weaponLabel || item.weapon,
      weaponId: item.weaponId,
      weapon: item.weaponLabel || item.weapon,
      group: item.group,
      groupLabel: GROUP_LABELS[item.group] || item.group,
      requestIndex: index,
      id: item.id,
      name: item.nameZh,
      nameEn: item.nameEn,
      wear: item.wearId,
      wearLabel: item.wearLabel,
      price: Number(item.price.toFixed(2)),
      marketHashName: item.marketHashName,
      image: item.image,
      rarity: item.rarity,
      quality: item.quality,
      collection: item.collection,
      description: item.description,
      patternId: item.patternId,
      paintIndex: item.paintIndex,
      reason: itemReason(item, { theme })
    }))
  };
}

function upgradePicksToBudget({ candidates, input, requests, picks, budget }) {
  if (!Array.isArray(picks) || picks.length < 1 || !Number.isFinite(budget) || budget <= 0) return picks;
  let upgraded = [...picks];
  let changed = true;

  while (changed) {
    changed = false;
    const currentTotal = upgraded.reduce((sum, item) => sum + item.price, 0);
    const remainingBudget = budget - currentTotal;
    if (remainingBudget <= 0) break;

    const usedIds = new Set(upgraded.map((item) => item.id));
    let bestUpgrade = null;

    for (let index = 0; index < upgraded.length; index += 1) {
      const current = upgraded[index];
      const request = requests.find((entry) => entry.requestIndex === current.requestIndex) || { weaponId: current.weaponId, constraints: {} };
      const currentScore = scoreCandidate(current, input, request, 0);
      usedIds.delete(current.id);
      const alternatives = candidates
        .filter((candidate) => request.group ? candidate.group === request.group : candidate.weaponId === current.weaponId)
        .filter((candidate) => candidate.id !== current.id)
        .filter((candidate) => !usedIds.has(candidate.id))
        .map((candidate, ordinal) => ({
          candidate,
          score: scoreCandidate(candidate, input, request, ordinal),
          delta: Number((candidate.price - current.price).toFixed(2))
        }))
        .filter((entry) => entry.delta > 0 && entry.delta <= remainingBudget)
        .filter((entry) => !isGenericGloveRequest(input, request) || entry.candidate.wearId === "field-tested" || entry.candidate.price >= 8000)
        .filter((entry) => entry.score >= currentScore - 4)
        .sort((left, right) => right.delta - left.delta || right.score - left.score);
      usedIds.add(current.id);
      if (!alternatives.length) continue;
      const [candidateUpgrade] = alternatives;
      if (!bestUpgrade || candidateUpgrade.delta > bestUpgrade.delta || (candidateUpgrade.delta === bestUpgrade.delta && candidateUpgrade.score > bestUpgrade.score)) {
        bestUpgrade = { index, current, ...candidateUpgrade };
      }
    }

    if (!bestUpgrade) break;
    upgraded[bestUpgrade.index] = {
      ...bestUpgrade.candidate,
      requestIndex: bestUpgrade.current.requestIndex
    };
    changed = true;
  }
  return upgraded;
}

export function generateLoadoutCandidatesFromIndex(index, input = {}) {
  const budget = Number(input.budget || 0);
  if (!Number.isFinite(budget) || budget <= 0) {
    throw Object.assign(new Error("Budget must be a positive number."), { status: 400, code: "bad_budget" });
  }
  const requests = expandRequestedItems(input, index);
  const theme = detectTheme(input);
  if (!requests.length) {
    return {
      tier: budget < 500 ? "low" : budget < 2000 ? "mid" : "high",
      theme,
      requiredSlots: [],
      requestedItems: [],
      weaponIndex: index.weapons,
      loadouts: [buildSummary({ picks: [], budget, theme, requests: [], warnings: ["No matching weapon requests were available."] })]
    };
  }

  const warnings = [];
  const usedKeys = new Set();
  const picks = [];
  const allowBudgetOverflow = Boolean(input.enforceAllRequests);
  const perItemBudget = input.allWeapons
    ? Math.max(1, budget / Math.max(1, requests.length))
    : Math.max(1, budget);
  for (const request of requests) {
    const remainingBudget = budget - picks.reduce((sum, item) => sum + item.price, 0);
    if (remainingBudget <= 0) break;
    const remainingRequests = Math.max(1, requests.length - picks.length);
    const itemBudget = input.allWeapons
      ? Math.max(perItemBudget * 1.8, remainingBudget / remainingRequests)
      : remainingBudget;
    const picked = pickCandidateForRequest({
      candidates: index.candidates,
      input,
      request,
      perItemBudget: itemBudget,
      usedKeys,
      allowOverBudget: allowBudgetOverflow
    });
    if (!picked) {
      warnings.push(`No priced candidate found for ${request.weaponId} within budget.`);
      continue;
    }
    usedKeys.add(picked.id);
    picks.push({ ...picked, requestIndex: request.requestIndex });
  }

  const upgradedPicks = upgradePicksToBudget({
    candidates: index.candidates,
    input,
    requests,
    picks,
    budget
  });

  const total = upgradedPicks.reduce((sum, item) => sum + item.price, 0);
  if (total > budget) warnings.push("\u603b\u4ef7\u8d85\u51fa\u9884\u7b97\uff0c\u5df2\u4f18\u5148\u4fdd\u8bc1\u6bcf\u4e2a\u8981\u6c42\u90fd\u6709\u5019\u9009\u3002");
  if (input.allWeapons && upgradedPicks.length < requests.length) warnings.push("\u9884\u7b97\u6216\u4ef7\u683c\u5e93\u4e0d\u8db3\uff0c\u90e8\u5206\u6b66\u5668\u6ca1\u6709\u53ef\u7528\u5019\u9009\u3002");

  return {
    tier: budget < 500 ? "low" : budget < 2000 ? "mid" : "high",
    theme,
    requiredSlots: requests.map((entry) => entry.group || entry.weaponId),
    requestedItems: requests,
    weaponIndex: index.weapons,
    loadouts: [buildSummary({ picks: upgradedPicks, budget, theme, requests, warnings })]
  };
}

export async function generateLoadoutCandidates(rootDir, input = {}) {
  const index = await buildCatalogIndex(rootDir);
  return generateLoadoutCandidatesFromIndex(index, input);
}

export async function getCatalogRecommendationIndex(rootDir) {
  const index = await buildCatalogIndex(rootDir);
  return {
    weapons: index.weapons,
    aliasIndex: index.aliasIndex
  };
}
