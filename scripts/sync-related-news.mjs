import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const MAX_ITEMS = 30;
const MARKET_KEYWORDS = [
  "skin",
  "skins",
  "sticker",
  "stickers",
  "capsule",
  "capsules",
  "collection",
  "collections",
  "inventory",
  "storage unit",
  "storage units",
  "market",
  "trade",
  "trading",
  "patch note",
  "patch notes",
  "price",
  "prices",
  "armory",
  "souvenir"
];
const ESPORTS_KEYWORDS = [
  "major",
  "tournament",
  "final",
  "semifinal",
  "team",
  "teams",
  "player",
  "players",
  "transfer",
  "transfers",
  "ranking",
  "rankings",
  "roster",
  "match",
  "matches",
  "hltv",
  "blast",
  "pgl",
  "iem",
  "esl"
];
const TAG_RULES = [
  { tag: "Update", patterns: ["update", "patch", "season", "release"] },
  { tag: "Inventory", patterns: ["inventory", "storage unit", "storage units", "loadout"] },
  { tag: "Stickers", patterns: ["sticker", "stickers", "capsule", "capsules"] },
  { tag: "Market", patterns: ["market", "price", "prices", "trade", "trading"] },
  { tag: "Esports", patterns: ["major", "tournament", "team", "player", "match", "ranking", "roster"] },
  { tag: "Cases", patterns: ["weapon case", "collection", "collections", "armory", "souvenir"] }
];

const SOURCES = [
  {
    source: "Steam News",
    category: "official",
    baseUrl: "https://store.steampowered.com",
    url: "https://store.steampowered.com/feeds/news/app/730",
    parser: "rss"
  },
  {
    source: "Counter-Strike",
    category: "official",
    baseUrl: "https://www.counter-strike.net",
    url: "https://www.counter-strike.net/news",
    parser: "counterStrike"
  },
  {
    source: "HLTV",
    category: "esports",
    baseUrl: "https://www.hltv.org",
    url: "https://www.hltv.org",
    parser: "hltv"
  },
  {
    source: "SteamDB",
    category: "market",
    baseUrl: "https://steamdb.info",
    url: "https://steamdb.info/app/730/patchnotes/",
    parser: "steamdb"
  }
];

function decodeEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/鈥檚/g, "'s")
    .replace(/鈥檙e/g, "'re")
    .replace(/鈥檓/g, "'m")
    .replace(/鈥檝e/g, "'ve")
    .replace(/鈥檒l/g, "'ll")
    .replace(/鈥檇/g, "'d")
    .replace(/鈥�/g, "'")
    .replace(/\\([\[\]])/g, "$1");
}

function stripTags(value = "") {
  return decodeEntities(String(value).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function clipSummary(value, max = 180) {
  const clean = stripTags(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}...`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizedTitle(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    [...url.searchParams.keys()].forEach((key) => {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    });
    return url.toString().replace(/\/$/, "");
  } catch {
    return String(value || "").trim();
  }
}

function absoluteUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function normalizeDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const isoLike = String(value).match(/\d{4}-\d{2}-\d{2}/);
    return isoLike ? isoLike[0] : "";
  }
  return parsed.toISOString().slice(0, 10);
}

function textHaystack(item) {
  return `${item?.title || ""} ${item?.summary || ""}`.toLowerCase();
}

function includesAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(keyword));
}

function tagsForItem(item) {
  const haystack = textHaystack(item);
  const tags = TAG_RULES
    .filter((rule) => rule.patterns.some((pattern) => haystack.includes(pattern)))
    .map((rule) => rule.tag);
  return [...new Set(tags)].slice(0, 3);
}

export function classifyNewsItem(item) {
  const category = ["official", "esports", "market"].includes(item?.category) ? item.category : "official";
  const haystack = textHaystack(item);
  if (includesAny(haystack, MARKET_KEYWORDS)) return "market";
  if (category === "esports" || includesAny(haystack, ESPORTS_KEYWORDS)) return "esports";
  return category;
}

export function normalizeNewsItem(raw, sourceConfig = {}) {
  const title = stripTags(raw?.title || "");
  const url = absoluteUrl(raw?.url || raw?.link || "", sourceConfig.baseUrl || "");
  const publishedAt = normalizeDate(raw?.publishedAt || raw?.date || raw?.pubDate || "");
  const summary = clipSummary(raw?.summary || raw?.description || title);
  const source = stripTags(raw?.source || sourceConfig.source || "");
  if (!title || !url || !publishedAt || !summary || !source) return null;

  const baseItem = {
    id: "",
    category: sourceConfig.category || raw?.category || "official",
    source,
    title,
    summary,
    url,
    publishedAt,
    image: raw?.image ? absoluteUrl(raw.image, sourceConfig.baseUrl || "") : "",
    tags: []
  };
  baseItem.category = classifyNewsItem(baseItem);
  baseItem.tags = tagsForItem(baseItem);
  baseItem.id = `${slugify(source)}-${publishedAt}-${slugify(title)}`;
  return baseItem;
}

export function dedupeNewsItems(items) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const output = [];
  for (const item of items) {
    const urlKey = canonicalUrl(item?.url);
    const titleKey = normalizedTitle(item?.title);
    if (!urlKey || !titleKey || seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    output.push(item);
  }
  return output;
}

export function serializeNewsData(items) {
  const safeItems = [...items].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  return `window.RELATED_NEWS = ${JSON.stringify(safeItems, null, 2)};\n`;
}

function extractTag(block, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return decodeEntities(block.match(pattern)?.[1] || "");
}

function parseRss(html) {
  return [...String(html).matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(([block]) => ({
    title: extractTag(block, "title"),
    url: extractTag(block, "link"),
    publishedAt: extractTag(block, "pubDate"),
    summary: extractTag(block, "description")
  }));
}

function parseCounterStrike(html) {
  const text = String(html);
  const items = [];
  const cardPattern = /<a[^>]+href="([^"]*newsentry\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of text.matchAll(cardPattern)) {
    const block = match[2];
    const title = stripTags(block.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i)?.[1] || block);
    const date = stripTags(block.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1] || "");
    if (title && date) {
      items.push({ title, url: match[1], publishedAt: date, summary: title });
    }
  }
  return items;
}

function parseHltv(html) {
  const text = String(html);
  const items = [];
  const newsPattern = /href="(\/news\/\d+\/[^"]+)"[^>]*>([\s\S]{0,600}?)<\/a>/gi;
  for (const match of text.matchAll(newsPattern)) {
    const title = stripTags(match[2]);
    if (title && title.length > 8) {
      items.push({ title, url: match[1], publishedAt: new Date().toISOString(), summary: title });
    }
  }
  return items;
}

function parseSteamDb(html) {
  const text = String(html);
  const items = [];
  const datePattern = /<h2[^>]*id="([^"]*\d{4}[^"]*)"[^>]*>([\s\S]*?)<\/h2>/gi;
  for (const match of text.matchAll(datePattern)) {
    const title = stripTags(match[2]) || "Counter-Strike 2 Patch Notes";
    const date = normalizeDate(match[1].replace(/[^\d-]/g, "-"));
    if (date) {
      items.push({
        title: `Counter-Strike 2 Patch Notes - ${title}`,
        url: "https://steamdb.info/app/730/patchnotes/",
        publishedAt: date,
        summary: "Curated patch note entry for Counter-Strike 2 on SteamDB."
      });
    }
  }
  return items;
}

function parseSource(html, sourceConfig) {
  if (sourceConfig.parser === "rss") return parseRss(html);
  if (sourceConfig.parser === "counterStrike") return parseCounterStrike(html);
  if (sourceConfig.parser === "hltv") return parseHltv(html);
  if (sourceConfig.parser === "steamdb") return parseSteamDb(html);
  return [];
}

async function fetchSource(sourceConfig) {
  const response = await fetch(sourceConfig.url, {
    headers: {
      "user-agent": "CS Exhibition related news sync/1.0",
      "accept": "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  if (!response.ok) throw new Error(`${sourceConfig.source} returned HTTP ${response.status}`);
  const html = await response.text();
  return parseSource(html, sourceConfig)
    .map((raw) => normalizeNewsItem(raw, sourceConfig))
    .filter(Boolean);
}

async function readExistingData(dataPath) {
  if (!existsSync(dataPath)) return [];
  const content = await readFile(dataPath, "utf8");
  const json = content.match(/window\.RELATED_NEWS\s*=\s*([\s\S]*?);\s*$/)?.[1];
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function syncRelatedNews({ cwd = process.cwd(), sources = SOURCES } = {}) {
  const dataPath = join(cwd, "related-news-data.js");
  const collected = [];
  const failures = [];

  for (const sourceConfig of sources) {
    try {
      collected.push(...await fetchSource(sourceConfig));
    } catch (error) {
      failures.push(`${sourceConfig.source}: ${error.message}`);
    }
  }

  const existing = await readExistingData(dataPath);
  const baseItems = collected.length ? collected : existing;
  const items = dedupeNewsItems(baseItems)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, MAX_ITEMS);

  if (collected.length || !existsSync(dataPath)) {
    await writeFile(dataPath, serializeNewsData(items), "utf8");
  }

  if (failures.length) {
    console.warn(`Related news sync warnings:\n- ${failures.join("\n- ")}`);
  }
  console.log(`Related news sync wrote ${items.length} item(s).`);
  return { items, failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await syncRelatedNews({ cwd: process.cwd() });
}
