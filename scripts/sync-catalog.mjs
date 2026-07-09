import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_FILE = new URL("../catalog-data.js", import.meta.url);
const MARKET_PRICES_FILE = new URL("../.data/market-prices.js", import.meta.url);
const LOCALE_OUTPUT_DIR = fileURLToPath(new URL("../.data/catalog-locales/", import.meta.url));
const WORKSPACE_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DATA_DIR = fileURLToPath(new URL("../.data/", import.meta.url));
const UPSTREAM_DIR = fileURLToPath(new URL("../.data/csgo-api-upstream/", import.meta.url));
const API_DIR = fileURLToPath(new URL("../.data/csgo-api-upstream/public/api/", import.meta.url));
const CATALOG_ENDPOINTS = ["skins", "stickers", "agents", "music_kits"];
const OPENING_ENDPOINTS = ["crates"];
const ENDPOINTS = [...CATALOG_ENDPOINTS, ...OPENING_ENDPOINTS];
const TONES = ["gold", "ivory", "pearl", "ruby", "violet", "crimson", "teal"];
const MACHINEGUN_IDS = new Set(["weapon_m249", "weapon_negev"]);
const FEATURED_ASSET_IDS = {
  "ak-inheritance": "skin-82dc98e09ba6",
  "awp-dragon-lore": "skin-4f8d99d09ded",
  "m4-printstream": "skin-8e45a15cf7f5",
  "butterfly-doppler": "skin-89f34e17d8b4",
  "sport-pandora": "skin-e506270deff6",
  "usp-kill-confirmed": "skin-cf4c11689014",
  "sticker-navi-holo": "sticker-70",
  "agent-sir-bloody": "agent-4726"
};
const LOCALES = [
  { code: "zh-CN", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "ru", label: "Русский" },
  { code: "es-ES", label: "Español" },
  { code: "bg", label: "Български" },
  { code: "cs", label: "Čeština" },
  { code: "da", label: "Dansk" },
  { code: "nl", label: "Nederlands" },
  { code: "fi", label: "Suomi" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "el", label: "Ελληνικά" },
  { code: "hu", label: "Magyar" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "es-MX", label: "Español (Latinoamérica)" },
  { code: "no", label: "Norsk" },
  { code: "pl", label: "Polski" },
  { code: "pt-PT", label: "Português" },
  { code: "ro", label: "Română" },
  { code: "sv", label: "Svenska" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "th", label: "ไทย" },
  { code: "tr", label: "Türkçe" },
  { code: "uk", label: "Українська" },
  { code: "vi", label: "Tiếng Việt" }
];

const typeByEnglishCategory = new Map([
  ["Gloves", "glove"],
  ["Knives", "knife"],
  ["Pistols", "pistol"],
  ["Rifles", "rifle"],
  ["SMGs", "smg"],
  ["Heavy", "shotgun"],
  ["Equipment", "equipment"]
]);

const wearIdByEnglish = new Map([
  ["Factory New", "factory-new"],
  ["Minimal Wear", "minimal-wear"],
  ["Field-Tested", "field-tested"],
  ["Well-Worn", "well-worn"],
  ["Battle-Scarred", "battle-scarred"]
]);

const modelMap = new Map([
  ["glove", "glove"],
  ["knife", "knife"],
  ["pistol", "pistol"],
  ["rifle", "rifle"],
  ["smg", "rifle"],
  ["shotgun", "rifle"],
  ["machinegun", "rifle"],
  ["equipment", "pistol"],
  ["sticker", "sticker"],
  ["agent", "agent"],
  ["music-box", "music-box"]
]);

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: process.platform === "win32", stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`)));
  });
}

function toolName(base) {
  if (process.platform === "win32") {
    if (base === "git") return "git.exe";
    if (base === "npm") return "npm.cmd";
  }
  return base;
}

async function ensureUpstreamApi() {
  await mkdir(DATA_DIR, { recursive: true });
  const upstreamPath = UPSTREAM_DIR;
  if (!existsSync(upstreamPath)) {
    await run(toolName("git"), ["clone", "--depth", "1", "https://github.com/ByMykel/CSGO-API.git", upstreamPath], WORKSPACE_ROOT);
  }
  if (!existsSync(join(upstreamPath, "node_modules"))) {
    await run(toolName("npm"), ["install"], upstreamPath);
  }
  await run("node", ["update.js", "--languages", "all", "--force"], upstreamPath);
  await run("node", ["group.js", "--languages", "all", "--force"], upstreamPath);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function cleanText(value = "") {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstText(...values) {
  return cleanText(values.find((value) => cleanText(value)) || "");
}

function byId(values) {
  return new Map(values.map((entry) => [entry.id, entry]));
}

function resolveType(enSkin) {
  if (enSkin.category?.name === "Heavy") {
    return MACHINEGUN_IDS.has(enSkin.weapon?.id) ? "machinegun" : "shotgun";
  }
  return typeByEnglishCategory.get(enSkin.category?.name) || "rifle";
}

function collectionName(entry, fallback) {
  return firstText(entry.collections?.[0]?.name, entry.crates?.[0]?.name, entry.tournament?.name, fallback);
}

function skinFields(entry, fallback, locale, enEntry) {
  return {
    name: firstText(entry.name, fallback.name, enEntry?.name, "Unknown Item"),
    weapon: firstText(entry.weapon?.name, entry.category?.name, fallback.weapon, enEntry?.weapon?.name, "Item"),
    collection: collectionName(entry, fallback.collection || "Unclassified"),
    rarity: firstText(entry.rarity?.name, fallback.rarity, "Standard"),
    quality: locale === "zh-CN"
      ? [entry.stattrak && "StatTrak", entry.souvenir && "纪念品"].filter(Boolean).join(" / ") || "普通"
      : fallback.quality || [enEntry?.stattrak && "StatTrak", enEntry?.souvenir && "Souvenir"].filter(Boolean).join(" / ") || "Standard",
    description: cleanText(entry.description || fallback.description)
  };
}

function stickerFields(entry, fallback) {
  return {
    name: firstText(entry.name, fallback.name, "Sticker"),
    weapon: firstText(entry.type, fallback.weapon, "Sticker"),
    collection: collectionName(entry, fallback.collection || "General Stickers"),
    rarity: firstText(entry.rarity?.name, fallback.rarity, "Standard"),
    quality: firstText(entry.effect, entry.type, fallback.quality, "Standard"),
    description: cleanText(entry.description || fallback.description)
  };
}

function agentFields(entry, fallback, locale, enEntry) {
  const teamName = firstText(entry.team?.name, fallback.weapon, enEntry?.team?.name, "Agent");
  return {
    name: firstText(entry.name, fallback.name, "Agent"),
    weapon: locale === "en" ? `${teamName} Agent` : firstText(teamName, fallback.weapon, "探员"),
    collection: collectionName(entry, fallback.collection || "Agents"),
    rarity: firstText(entry.rarity?.name, fallback.rarity, "Standard"),
    quality: teamName,
    description: cleanText(entry.description || fallback.description)
  };
}

function musicKitFields(entry, fallback, locale, enEntry) {
  const collection = firstText(entry.name?.split("|")[0], fallback.collection, "Music Kit");
  return {
    name: firstText(entry.name, fallback.name, "Music Kit"),
    weapon: locale === "zh-CN" ? "音乐盒" : "Music Kit",
    collection,
    rarity: firstText(entry.rarity?.name, fallback.rarity, "High Grade"),
    quality: locale === "zh-CN" ? (entry.exclusive ? "限定" : "普通") : (entry.exclusive || enEntry?.exclusive ? "Exclusive" : "Standard"),
    description: cleanText(entry.description || fallback.description).slice(0, 300)
  };
}

function openingKind(entry) {
  const name = firstText(entry.name, entry.market_hash_name);
  if (/souvenir package/i.test(name)) return "souvenir-package";
  if (/music kit box/i.test(name)) return "music-kit-box";
  if (/capsule/i.test(name)) return "capsule";
  if (/case/i.test(name) || String(entry.type || "").toLowerCase() === "case") return "weapon-case";
  if (/package/i.test(name)) return "package";
  return "container";
}

function openingFields(entry, fallback) {
  return {
    name: firstText(entry.name, fallback.name, "Container"),
    description: cleanText(entry.description || fallback.description),
    rarity: firstText(entry.rarity?.name, fallback.rarity, "Base Grade")
  };
}

function commonFields(enEntry, zhEntry, type, index) {
  const nameEn = firstText(enEntry.name, zhEntry.name, "Unknown Item");
  const nameZh = firstText(zhEntry.name, enEntry.name, "未知饰品");
  return {
    id: enEntry.id,
    name: nameZh,
    nameEn,
    nameZh,
    type,
    price: null,
    tone: TONES[index % TONES.length],
    model: modelMap.get(type) || "rifle",
    featured: false,
    image: enEntry.image || zhEntry.image || "",
    source: "CSGO-API / Steam CDN",
    translations: {}
  };
}

function normalizeSkin(enSkin, zhSkin, index) {
  const type = resolveType(enSkin);
  const translationEn = skinFields(enSkin, {}, "en", enSkin);
  const translationZh = skinFields(zhSkin, translationEn, "zh-CN", enSkin);
  return {
    ...commonFields(enSkin, zhSkin, type, index),
    weapon: translationZh.weapon,
    weaponEn: translationEn.weapon,
    weaponZh: translationZh.weapon,
    collection: translationZh.collection,
    collectionEn: translationEn.collection,
    collectionZh: translationZh.collection,
    rarity: translationZh.rarity,
    rarityEn: translationEn.rarity,
    rarityZh: translationZh.rarity,
    quality: translationZh.quality,
    qualityEn: translationEn.quality,
    qualityZh: translationZh.quality,
    wears: (enSkin.wears || []).map((wear) => wearIdByEnglish.get(wear.name)).filter(Boolean),
    minFloat: enSkin.min_float,
    maxFloat: enSkin.max_float,
    description: translationZh.description,
    descriptionEn: translationEn.description,
    descriptionZh: translationZh.description,
    phase: enSkin.phase || null,
    paintIndex: enSkin.paint_index || null,
    patternId: enSkin.pattern?.id || null,
    translations: { en: translationEn, "zh-CN": translationZh }
  };
}

function normalizeSticker(enSticker, zhSticker, index) {
  const translationEn = stickerFields(enSticker, {});
  const translationZh = stickerFields(zhSticker, translationEn);
  return {
    ...commonFields(enSticker, zhSticker, "sticker", index),
    weapon: translationZh.weapon,
    weaponEn: translationEn.weapon,
    weaponZh: translationZh.weapon,
    collection: translationZh.collection,
    collectionEn: translationEn.collection,
    collectionZh: translationZh.collection,
    rarity: translationZh.rarity,
    rarityEn: translationEn.rarity,
    rarityZh: translationZh.rarity,
    quality: translationZh.quality,
    qualityEn: translationEn.quality,
    qualityZh: translationZh.quality,
    wears: [],
    minFloat: null,
    maxFloat: null,
    description: translationZh.description,
    descriptionEn: translationEn.description,
    descriptionZh: translationZh.description,
    translations: { en: translationEn, "zh-CN": translationZh }
  };
}

function normalizeAgent(enAgent, zhAgent, index) {
  const translationEn = agentFields(enAgent, {}, "en", enAgent);
  const translationZh = agentFields(zhAgent, translationEn, "zh-CN", enAgent);
  return {
    ...commonFields(enAgent, zhAgent, "agent", index),
    weapon: translationZh.weapon,
    weaponEn: translationEn.weapon,
    weaponZh: translationZh.weapon,
    collection: translationZh.collection,
    collectionEn: translationEn.collection,
    collectionZh: translationZh.collection,
    rarity: translationZh.rarity,
    rarityEn: translationEn.rarity,
    rarityZh: translationZh.rarity,
    quality: translationZh.quality,
    qualityEn: translationEn.quality,
    qualityZh: translationZh.quality,
    wears: [],
    minFloat: null,
    maxFloat: null,
    description: translationZh.description,
    descriptionEn: translationEn.description,
    descriptionZh: translationZh.description,
    translations: { en: translationEn, "zh-CN": translationZh }
  };
}

function normalizeMusicKit(enKit, zhKit, index) {
  const translationEn = musicKitFields(enKit, {}, "en", enKit);
  const translationZh = musicKitFields(zhKit, translationEn, "zh-CN", enKit);
  return {
    ...commonFields(enKit, zhKit, "music-box", index),
    weapon: translationZh.weapon,
    weaponEn: translationEn.weapon,
    weaponZh: translationZh.weapon,
    collection: translationZh.collection,
    collectionEn: translationEn.collection,
    collectionZh: translationZh.collection,
    rarity: translationZh.rarity,
    rarityEn: translationEn.rarity,
    rarityZh: translationZh.rarity,
    quality: translationZh.quality,
    qualityEn: translationEn.quality,
    qualityZh: translationZh.quality,
    wears: [],
    minFloat: null,
    maxFloat: null,
    description: translationZh.description,
    descriptionEn: translationEn.description,
    descriptionZh: translationZh.description,
    translations: { en: translationEn, "zh-CN": translationZh }
  };
}

function normalizeOpening(enCrate, zhCrate, index) {
  const translationEn = openingFields(enCrate, {});
  const translationZh = openingFields(zhCrate, translationEn);
  const kind = openingKind(enCrate);
  const mapOpeningLootEntry = (enEntry, zhEntry) => ({
    id: enEntry?.id || zhEntry?.id || "",
    name: firstText(zhEntry?.name, enEntry?.name, "Unknown Drop"),
    nameEn: firstText(enEntry?.name, zhEntry?.name, "Unknown Drop"),
    nameZh: firstText(zhEntry?.name, enEntry?.name, "未知掉落"),
    image: enEntry?.image || zhEntry?.image || "",
    rarity: firstText(zhEntry?.rarity?.name, enEntry?.rarity?.name, "普通级"),
    rarityEn: firstText(enEntry?.rarity?.name, zhEntry?.rarity?.name, "Base Grade"),
    rarityZh: firstText(zhEntry?.rarity?.name, enEntry?.rarity?.name, "普通级"),
    rarityColor: enEntry?.rarity?.color || zhEntry?.rarity?.color || "#b0c3d9"
  });
  const contains = (enCrate.contains || []).map((entry) => {
    const localized = (zhCrate.contains || []).find((candidate) => candidate.id === entry.id) || entry;
    return mapOpeningLootEntry(entry, localized);
  });
  const containsRare = (enCrate.contains_rare || []).map((entry) => {
    const localized = (zhCrate.contains_rare || []).find((candidate) => candidate.id === entry.id) || entry;
    return mapOpeningLootEntry(entry, localized);
  });
  return {
    id: enCrate.id,
    name: translationZh.name,
    nameEn: translationEn.name,
    nameZh: translationZh.name,
    kind,
    image: enCrate.image || zhCrate.image || "",
    description: translationZh.description,
    descriptionEn: translationEn.description,
    descriptionZh: translationZh.description,
    rarity: translationZh.rarity,
    rarityEn: translationEn.rarity,
    rarityZh: translationZh.rarity,
    firstSaleDate: enCrate.first_sale_date || null,
    marketHashName: enCrate.market_hash_name || zhCrate.market_hash_name || null,
    containsCount: Array.isArray(enCrate.contains) ? enCrate.contains.length : 0,
    containsRareCount: Array.isArray(enCrate.contains_rare) ? enCrate.contains_rare.length : 0,
    contains,
    containsRare,
    tone: TONES[index % TONES.length],
    translations: { en: translationEn, "zh-CN": translationZh }
  };
}

function joinLocalized(enList, zhList, normalizer, startIndex) {
  const zhMap = byId(zhList);
  return enList
    .filter((entry) => entry.image || zhMap.get(entry.id)?.image)
    .map((entry, index) => normalizer(entry, zhMap.get(entry.id) || entry, startIndex + index));
}

function localeFieldsFor(endpoint, entry, fallback, locale, enEntry) {
  if (!entry) return fallback;
  if (endpoint === "skins") return skinFields(entry, fallback, locale, enEntry);
  if (endpoint === "stickers") return stickerFields(entry, fallback);
  if (endpoint === "agents") return agentFields(entry, fallback, locale, enEntry);
  if (endpoint === "crates") return openingFields(entry, fallback);
  return musicKitFields(entry, fallback, locale, enEntry);
}

async function loadBundle(locale) {
  const base = join(API_DIR, locale);
  if (!existsSync(base)) return null;
  const entries = await Promise.all(ENDPOINTS.map(async (endpoint) => {
    const filePath = join(base, `${endpoint}.json`);
    if (!existsSync(filePath)) return [endpoint, []];
    return [endpoint, await readJson(filePath)];
  }));
  return Object.fromEntries(entries);
}

await ensureUpstreamApi();

const localeBundles = new Map();
for (const locale of LOCALES) {
  const bundle = await loadBundle(locale.code);
  if (!bundle) continue;
  localeBundles.set(locale.code, bundle);
}

const enBundle = localeBundles.get("en");
const zhBundle = localeBundles.get("zh-CN");
if (!enBundle || !zhBundle) throw new Error("Required en/zh-CN bundles are missing.");

const compactSkins = joinLocalized(enBundle.skins, zhBundle.skins, normalizeSkin, 0);
const compactStickers = joinLocalized(enBundle.stickers, zhBundle.stickers, normalizeSticker, compactSkins.length);
const compactAgents = joinLocalized(enBundle.agents, zhBundle.agents, normalizeAgent, compactSkins.length + compactStickers.length);
const compactMusicKits = joinLocalized(enBundle.music_kits, zhBundle.music_kits, normalizeMusicKit, compactSkins.length + compactStickers.length + compactAgents.length);
const compactOpenings = joinLocalized(enBundle.crates, zhBundle.crates, normalizeOpening, 0);
const compact = [...compactSkins, ...compactStickers, ...compactAgents, ...compactMusicKits];

for (const [locale, bundle] of localeBundles.entries()) {
  if (locale === "en" || locale === "zh-CN") continue;
  for (const endpoint of CATALOG_ENDPOINTS) {
    const localeMap = byId(bundle[endpoint]);
    const enMap = byId(enBundle[endpoint]);
    compact.forEach((item) => {
      const prefix = endpoint === "music_kits" ? "music_kit" : endpoint.slice(0, -1);
      if (!item.id.startsWith(prefix)) return;
      const localeEntry = localeMap.get(item.id);
      if (!localeEntry) return;
      item.translations[locale] = localeFieldsFor(endpoint, localeEntry, item.translations.en, locale, enMap.get(item.id));
    });
  }
  const crateLocaleMap = byId(bundle.crates);
  compactOpenings.forEach((item) => {
    const localeEntry = crateLocaleMap.get(item.id);
    if (!localeEntry) return;
    item.translations[locale] = localeFieldsFor("crates", localeEntry, item.translations.en, locale, localeEntry);
  });
}

const assetRecords = new Map(compact.map((entry) => [entry.id, entry]));
const featuredAssets = Object.fromEntries(
  Object.entries(FEATURED_ASSET_IDS).map(([localId, sourceId]) => {
    const entry = assetRecords.get(sourceId);
    if (!entry?.image) throw new Error(`Featured asset missing: ${localId} -> ${sourceId}`);
    return [localId, { image: entry.image, sourceName: entry.nameZh || entry.nameEn }];
  })
);

const supportedLanguages = LOCALES.filter((locale) => localeBundles.has(locale.code));
await mkdir(LOCALE_OUTPUT_DIR, { recursive: true });

const localePayloads = {};
for (const locale of supportedLanguages.map((entry) => entry.code)) {
  localePayloads[locale] = Object.fromEntries(
    compact
      .filter((item) => item.translations?.[locale])
      .map((item) => [item.id, item.translations[locale]])
  );
  const localeOutput = `globalThis.CS2_CATALOG_LOCALES = globalThis.CS2_CATALOG_LOCALES || {};\n`
    + `globalThis.CS2_CATALOG_LOCALES[${JSON.stringify(locale)}] = ${JSON.stringify(localePayloads[locale])};\n`;
  await writeFile(join(LOCALE_OUTPUT_DIR, `${locale}.js`), localeOutput, "utf8");
}

const coreCatalog = compact.map(({ translations, description, ...item }) => item);
const openingCatalog = compactOpenings.map(({ translations, description, ...item }) => item);
const output = `// Generated by scripts/sync-catalog.mjs. Do not edit manually.\n`
  + `globalThis.CS2_SUPPORTED_LANGUAGES = ${JSON.stringify(supportedLanguages)};\n`
  + `globalThis.CS2_FEATURED_ASSETS = ${JSON.stringify(featuredAssets)};\n`
  + `globalThis.CS2_CATALOG = ${JSON.stringify(coreCatalog)};\n`
  + `globalThis.CS2_UNBOXING = ${JSON.stringify(openingCatalog)};\n`;

await writeFile(OUTPUT_FILE, output, "utf8");

try {
  await writeFile(MARKET_PRICES_FILE, "globalThis.CS2_MARKET_PRICES = globalThis.CS2_MARKET_PRICES || { items: {} };\n", { flag: "wx" });
} catch {}

console.log(`Synced ${compact.length} multilingual CS2 items to ${OUTPUT_FILE.pathname}`);
