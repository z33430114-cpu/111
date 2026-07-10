import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PRO_LOADOUT_TEAMS } from "./ai-data.mjs";

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
const OFFICIAL_KEYWORDS = [
  "update",
  "patch",
  "patch notes",
  "gameplay",
  "season",
  "premier season",
  "release",
  "counter-strike 2 update",
  "cs2 update",
  "map pool",
  "bomb update"
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
  "esl",
  "challenger league",
  "qualifier"
];
const TAG_RULES = [
  { tag: "Update", patterns: ["update", "patch", "season", "release"] },
  { tag: "Inventory", patterns: ["inventory", "storage unit", "storage units", "loadout"] },
  { tag: "Stickers", patterns: ["sticker", "stickers", "capsule", "capsules"] },
  { tag: "Market", patterns: ["market", "price", "prices", "trade", "trading"] },
  { tag: "Esports", patterns: ["major", "tournament", "team", "player", "match", "ranking", "roster"] },
  { tag: "Cases", patterns: ["weapon case", "collection", "collections", "armory", "souvenir"] },
  { tag: "Guide", patterns: ["guide", "best", "loadout", "craft", "crafts"] }
];
const SOURCE_ZH = {
  "Steam News": "Steam 新闻",
  "Counter-Strike": "Counter-Strike 官方",
  "HLTV": "HLTV",
  "Dust2.us": "Dust2.us",
  "ESL Pro Tour": "ESL Pro Tour",
  "Skinport Blog": "Skinport 博客",
  "EsportFire": "EsportFire",
  "CSGOSKINS.GG": "CSGOSKINS.GG",
  "SteamDB": "SteamDB"
};
const TAG_ZH = {
  Update: "版本更新",
  Inventory: "库存",
  Stickers: "贴纸",
  Market: "饰品市场",
  Esports: "赛事",
  Cases: "收藏池",
  Guide: "指南"
};
const TITLE_ZH = {
  "ESL amend ESL Challenger League rulebook to allow mid-Cup roster changes": "ESL 修改挑战者联赛规则，允许杯赛中途调整阵容",
  "Here are all the details you need to know about the CS2 bomb update": "CS2 炸弹更新的关键细节汇总",
  "Fnatic bet on the future with 17-year-old Spirit Academy prospect mazay": "Fnatic 押注未来，引入 17 岁 Spirit Academy 新星 mazay",
  "karrigan receives in-game IEM Cologne Major trophy as Valve reverses previous policy": "Valve 调整政策，karrigan 获得游戏内 IEM 科隆 Major 奖杯",
  "donk is the most-visited player page on HLTV so far this year": "donk 成为今年迄今 HLTV 访问量最高的选手页面",
  "Official: BC.Game snag mzinho from The MongolZ": "官方：BC.Game 从 The MongolZ 签下 mzinho",
  "Official: Liquid unveil 17-year-old Jorko as ultimate replacement": "官方：Liquid 公布 17 岁 Jorko 接替 ultimate",
  "Official: n1ssim rejoins Legacy after under a month on the bench": "官方：n1ssim 替补不足一个月后回归 Legacy",
  "BREAKING: NRG sign Hallzerk and Jeorge": "突发：NRG 签下 hallzerk 和 Jeorge",
  "Arabesque, Tech, Fruits & Racing": "Arabesque、Tech、Fruits & Racing 系列更新",
  "Jackass Stickers": "《蠢蛋搞怪秀》贴纸",
  "Cologne 2026 Stickers": "科隆 2026 贴纸",
  "NIGHTMODE 2 Music Kits": "NIGHTMODE 2 音乐盒",
  "Dead Hand Skins": "Dead Hand 皮肤",
  "Fourth Season Skins": "第四赛季皮肤",
  "Budapest 2025 Champion Stickers": "布达佩斯 2025 冠军贴纸",
  "Counter-Strike 2 Update": "《反恐精英 2》更新日志",
  "Wildcard set to embark on month-long trip to Europe": "Wildcard 即将开启为期一个月的欧洲之行",
  "CS2 July 8th update brings bomb explosion re-design, new Armory items": "CS2 7 月 8 日更新带来炸弹爆炸重做和新军械库物品",
  "Official: Aurora complete kyxsan signing": "官方：Aurora 完成 kyxsan 签约",
  "NuTorious set to field Danish import Maze at FRAG St. Clair": "NuTorious 将在 FRAG St. Clair 启用丹麦外援 Maze",
  "Breaking: Marsborne sign nicx": "突发：Marsborne 签下 nicx",
  "Media: BC.Game target mzinho for reunion with Senzu": "媒体：BC.Game 有意让 mzinho 与 Senzu 重聚",
  "M80, Voca claim invites to BLAST Open Porto NA Closed Qualifier": "M80 与 Voca 获得 BLAST Open Porto 北美封闭预选邀请",
  "Media: NRG targeting Hallzerk and Jeorge": "媒体：NRG 正在追逐 hallzerk 和 Jeorge",
  "New CS2 Update is out!": "CS2 新更新已上线",
  "New Armory Collections and Premier Season 5 Update": "新军械库收藏与 Premier 第五赛季更新",
  "Season 5, Armory, and More": "第五赛季、军械库与更多内容",
  "DETONATE sign arush and OrangeZ": "DETONATE 签下 arush 和 OrangeZ",
  "Johnny Speeds announce benching of friberg, nawwk, Lekr0 in major roster shakeup": "Johnny Speeds 大幅调整阵容，friberg、nawwk、Lekr0 被下放替补",
  "Blue Counter-Strike 2 Loadout": "蓝色 CS2 饰品搭配",
  "Best Ak-47 Crafts in CS2": "CS2 最佳 AK-47 贴纸工艺",
  "Cache is back in CS2!": "Cache 回归 CS2",
  "Best Budget CS2 Knives 2026": "2026 年高性价比 CS2 刀具推荐"
};

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
    source: "Dust2.us",
    category: "esports",
    baseUrl: "https://www.dust2.us",
    url: "https://www.dust2.us/",
    parser: "dust2"
  },
  {
    source: "ESL Pro Tour",
    category: "esports",
    baseUrl: "https://pro.eslgaming.com",
    url: "https://pro.eslgaming.com/tour/cs/news/",
    parser: "eslNews"
  },
  {
    source: "Skinport Blog",
    category: "market",
    baseUrl: "https://skinport.com",
    url: "https://skinport.com/blog",
    parser: "skinport"
  },
  {
    source: "EsportFire",
    category: "market",
    baseUrl: "https://esportfire.com",
    url: "https://esportfire.com/articles",
    parser: "esportfire"
  },
  {
    source: "CSGOSKINS.GG",
    category: "market",
    baseUrl: "https://csgoskins.gg",
    url: "https://csgoskins.gg/updates",
    parser: "csgoskinsUpdates"
  },
  {
    source: "SteamDB",
    category: "market",
    baseUrl: "https://steamdb.info",
    url: "https://steamdb.info/app/730/patchnotes/",
    parser: "steamdb"
  }
];

const DEFAULT_RANKING_SNAPSHOT = {
  date: "2026-07-06",
  label: "HLTV World Ranking",
  labelZh: "HLTV 世界排名",
  source: "HLTV",
  url: "https://www.hltv.org/ranking/teams/2026/july/6",
  teams: [
    { rank: 1, name: "Falcons", points: 893 },
    { rank: 2, name: "Vitality", points: 828 },
    { rank: 3, name: "Spirit", points: 700 },
    { rank: 4, name: "FURIA", points: 651 },
    { rank: 5, name: "Natus Vincere", points: 548 },
    { rank: 6, name: "Aurora", points: 322 },
    { rank: 7, name: "BetBoom", points: 318 },
    { rank: 8, name: "G2", points: 308 },
    { rank: 9, name: "Legacy", points: 290 },
    { rank: 10, name: "MOUZ", points: 289 }
  ]
};

const TEAM_LOGO_OVERRIDES = {
  aurora: {
    logo: "https://img-cdn.hltv.org/teamlogo/yJzPNOeXlyiniNxanYJCrv.png?ixlib=java-2.1.0&s=f23524510b9d49ea59166e6e2efee1ac&w=100",
    teamUrl: "https://www.hltv.org/team/11861/aurora"
  },
  betboom: {
    logo: "https://img-cdn.hltv.org/teamlogo/G4ZrdB0-q41USPd_z27IQA.png?ixlib=java-2.1.0&s=cb2c8c3b65e034368ff60f1c6a8d04ef&w=100",
    teamUrl: "https://www.hltv.org/team/12394/betboom"
  },
  falcons: {
    logo: "https://img-cdn.hltv.org/teamlogo/4eJSkDQINNM6Tbs4WvLzkN.png?ixlib=java-2.1.0&s=d8c857ea47046f61eca695beab0d12ef&w=50",
    teamUrl: "https://www.hltv.org/team/11283/falcons"
  },
  furia: {
    logo: "https://img-cdn.hltv.org/teamlogo/mvNQc4csFGtxXk5guAh8m1.svg?ixlib=java-2.1.0&s=11e5056829ad5d6c06c5961bbe76d20c",
    teamUrl: "https://www.hltv.org/team/8297/furia"
  },
  g2: {
    logo: "https://img-cdn.hltv.org/teamlogo/zFLwAELOD15BjJSDMMNBWQ.png?ixlib=java-2.1.0&s=457c1663356d6dd20e39a1188b267802&w=200",
    teamUrl: "https://www.hltv.org/team/5995/g2"
  },
  legacy: {
    logo: "https://img-cdn.hltv.org/teamlogo/RWbHH6RA8uGwJurGeLFvSr.png?ixlib=java-2.1.0&s=10ff29ff632e0bd82922f4fcd83f930f&w=100",
    teamUrl: "https://www.hltv.org/team/12468/legacy"
  },
  mouz: {
    logo: "https://img-cdn.hltv.org/teamlogo/IejtXpquZnE8KqYPB1LNKw.svg?ixlib=java-2.1.0&s=7fd33b8def053fbfd8fdbb58e3bdcd3c",
    teamUrl: "https://www.hltv.org/team/4494/mouz"
  },
  "natus vincere": {
    logo: "https://img-cdn.hltv.org/teamlogo/9iMirAi7ArBLNU8p3kqUTZ.svg?ixlib=java-2.1.0&s=4dd8635be16122656093ae9884675d0c",
    teamUrl: "https://www.hltv.org/team/4608/natus-vincere"
  },
  spirit: {
    logo: "https://img-cdn.hltv.org/teamlogo/syrtYYKR7sBRw3ZHy1YFX7.png?ixlib=java-2.1.0&s=155e7cf96a2271f213fd06d9c3dd163b&w=200",
    teamUrl: "https://www.hltv.org/team/7020/spirit"
  },
  vitality: {
    logo: "https://img-cdn.hltv.org/teamlogo/ogcHrcCdzRvxbYvAz04KAN.png?ixlib=java-2.1.0&s=c7577435f1641f0802c586934e6a4b6a&w=100",
    teamUrl: "https://www.hltv.org/team/9565/vitality"
  }
};

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

function normalizeRelatedImageUrl(value, width = 640) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.hostname === "img-cdn.hltv.org") {
      if (url.searchParams.has("s")) {
        return url.toString();
      }
      if (url.pathname.includes("/teamlogo/")) {
        url.searchParams.set("w", "100");
      } else if (url.pathname.includes("/gallerypicture/")) {
        url.searchParams.set("w", String(width));
      }
    }
    return url.toString();
  } catch {
    return raw;
  }
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

function extractAttribute(block, name) {
  const pattern = new RegExp(`${name}=["']([^"']+)["']`, "i");
  return decodeEntities(block.match(pattern)?.[1] || "");
}

function extractFirstImageFromHtml(value, baseUrl = "") {
  const decoded = decodeEntities(value || "");
  const metaImage = decoded.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || decoded.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i)?.[1];
  const image = metaImage
    || decoded.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
    || decoded.match(/<(?:media:content|enclosure)[^>]+(?:url|href)=["']([^"']+)["']/i)?.[1];
  return image ? absoluteUrl(image, baseUrl) : "";
}

function extractLargestSrcsetImage(value, baseUrl = "") {
  const srcset = decodeEntities(value || "");
  const candidates = srcset.split(",")
    .map((entry) => {
      const [url, width] = entry.trim().split(/\s+/);
      return { url, width: Number(String(width || "").replace(/\D/g, "")) || 0 };
    })
    .filter((entry) => entry.url);
  const best = candidates.sort((a, b) => b.width - a.width)[0];
  return best ? absoluteUrl(best.url, baseUrl) : "";
}

function relativeDateToIso(value, now = new Date()) {
  const text = String(value || "").toLowerCase().trim();
  const amount = Number(text.match(/\d+/)?.[0] || 0);
  const date = new Date(now);
  if (text.includes("hour") || text.includes("minute") || text.includes("just now")) {
    return date.toISOString().slice(0, 10);
  }
  if (text.includes("day")) date.setDate(date.getDate() - Math.max(1, amount || 1));
  if (text.includes("week")) date.setDate(date.getDate() - Math.max(1, amount || 1) * 7);
  if (text.includes("month")) date.setMonth(date.getMonth() - Math.max(1, amount || 1));
  return date.toISOString().slice(0, 10);
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
  const officialSignal = includesAny(haystack, OFFICIAL_KEYWORDS);
  const marketSignal = includesAny(haystack, MARKET_KEYWORDS);
  const source = String(item?.source || "");
  const marketBiasedSource = ["CSGOSKINS.GG", "EsportFire"].includes(source);
  if (officialSignal && !marketSignal) return "official";
  if (officialSignal && !marketBiasedSource && source !== "Dust2.us") return "official";
  if (marketSignal) return "market";
  if (category === "esports" || includesAny(haystack, ESPORTS_KEYWORDS)) return "esports";
  return category;
}

export function normalizeNewsItem(raw, sourceConfig = {}) {
  const title = stripTags(raw?.title || "");
  const url = absoluteUrl(raw?.url || raw?.link || "", sourceConfig.baseUrl || "");
  const publishedAt = normalizeDate(raw?.publishedAt || raw?.date || raw?.pubDate || "");
  const summary = clipSummary(raw?.summary || raw?.description || title);
  const body = String(raw?.body || "").trim();
  const source = stripTags(raw?.source || sourceConfig.source || "");
  if (!title || !url || !publishedAt || !summary || !source) return null;

  const baseItem = {
    id: "",
    category: sourceConfig.category || raw?.category || "official",
    source,
    title,
    summary,
    body,
    url,
    publishedAt,
    image: raw?.image ? normalizeRelatedImageUrl(absoluteUrl(raw.image, sourceConfig.baseUrl || "")) : "",
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

function buildTeamLogoLookup() {
  return new Map(PRO_LOADOUT_TEAMS
    .filter((team) => team?.team)
    .map((team) => [String(team.team).toLowerCase(), {
      logo: String(team.logo || "").trim(),
      teamUrl: String(team.sourceUrl || "").trim()
    }]));
}

function normalizeRankingTeam(team, teamLookup = new Map()) {
  if (!team || typeof team !== "object") return null;
  const name = String(team.name || "").trim();
  const rank = Number(team.rank);
  const points = Number(team.points);
  if (!name || !Number.isFinite(rank) || !Number.isFinite(points)) return null;
  const override = TEAM_LOGO_OVERRIDES[name.toLowerCase()] || {};
  const known = teamLookup.get(name.toLowerCase()) || {};
  return {
    rank,
    name,
    points,
    logo: normalizeRelatedImageUrl(override.logo || team.logo || known.logo || ""),
    teamUrl: String(override.teamUrl || team.teamUrl || known.teamUrl || "").trim()
  };
}

export function normalizeRankingSnapshot(raw, teamLookup = buildTeamLogoLookup()) {
  if (!raw || typeof raw !== "object") return null;
  const teams = Array.isArray(raw.teams) ? raw.teams.map((team) => normalizeRankingTeam(team, teamLookup)).filter(Boolean) : [];
  if (!teams.length) return null;
  return {
    date: String(raw.date || "").trim(),
    label: String(raw.label || "HLTV World Ranking").trim(),
    labelZh: String(raw.labelZh || "HLTV 世界排名").trim(),
    source: String(raw.source || "HLTV").trim(),
    url: String(raw.url || "").trim(),
    teams
  };
}

export function serializeNewsData(items, rankingSnapshot = null) {
  const safeItems = [...items].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  const safeSnapshot = normalizeRankingSnapshot(rankingSnapshot);
  const snapshotBlock = safeSnapshot ? `window.HLTV_TEAM_RANKING_SNAPSHOT = ${JSON.stringify(safeSnapshot, null, 2)};\n\n` : "";
  return `${snapshotBlock}window.RELATED_NEWS = ${JSON.stringify(safeItems, null, 2)};\n`;
}

export function serializeNewsSummaryData(items, rankingSnapshot = null) {
  const summaryItems = [...items]
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .map(({ body, bodyZh, ...item }) => item);
  const safeSnapshot = normalizeRankingSnapshot(rankingSnapshot);
  const snapshotBlock = safeSnapshot ? `window.HLTV_TEAM_RANKING_SNAPSHOT = ${JSON.stringify(safeSnapshot, null, 2)};\n\n` : "";
  return `${snapshotBlock}window.RELATED_NEWS = ${JSON.stringify(summaryItems, null, 2)};\n`;
}

export function serializeNewsDetailData(items) {
  const detailMap = Object.fromEntries(items.map((item) => [
    item.id,
    {
      body: String(item.body || "").trim(),
      bodyZh: String(item.bodyZh || item.body || "").trim()
    }
  ]));
  return `window.RELATED_NEWS_DETAIL = ${JSON.stringify(detailMap, null, 2)};\n`;
}

function zhSummaryForItem(item, titleZh) {
  if (item.category === "market") {
    return `这条资讯来自${SOURCE_ZH[item.source] || item.source}，聚焦“${titleZh}”。它适合放进饰品市场、收藏池和搭配灵感线索里，帮助用户快速判断是否值得继续查看来源。`;
  }
  if (item.category === "esports") {
    return `这条资讯来自${SOURCE_ZH[item.source] || item.source}，聚焦“${titleZh}”。它补充了赛事、队伍阵容或赛程规则相关动态，适合用于追踪当前 CS2 竞技生态。`;
  }
  return `这条官方资讯聚焦“${titleZh}”。它适合用于快速了解当前版本变化、玩法调整和后续饰品或比赛环境可能受到的影响。`;
}

function zhBulletsForItem(item, titleZh) {
  if (item.category === "market") {
    return [
      `关注点：${titleZh}`,
      "适合从收藏池、贴纸、皮肤搭配或价格情绪角度继续观察。",
      "来源配图和原文链接已保留，详情页可直接跳转核对。"
    ];
  }
  if (item.category === "esports") {
    return [
      `关注点：${titleZh}`,
      "适合补充战队动态、赛事规则、选手流动或赛程热点。",
      "来源配图和原文链接已保留，详情页可直接跳转核对。"
    ];
  }
  return [
    `关注点：${titleZh}`,
    "优先关注玩法、地图池、军械库和版本节奏变化。",
    "来源配图和原文链接已保留，详情页可直接跳转核对。"
  ];
}

function applyLocalizedNewsFields(item, existingItem) {
  const titleZh = existingItem?.titleZh || item.titleZh || TITLE_ZH[item.title] || item.title;
  return {
    ...item,
    sourceZh: existingItem?.sourceZh || SOURCE_ZH[item.source] || item.source,
    titleZh,
    summaryZh: item.summaryZh || existingItem?.summaryZh || titleZh,
    bodyZh: item.bodyZh || existingItem?.bodyZh || item.body || item.summary || titleZh,
    tagsZh: existingItem?.tagsZh || item.tags.map((tag) => TAG_ZH[tag] || tag),
    bulletsZh: existingItem?.bulletsZh || zhBulletsForItem(item, titleZh)
  };
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
    summary: extractTag(block, "description"),
    image: extractFirstImageFromHtml(block)
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
  const newsPattern = /<a[^>]+href="(\/news\/\d+\/[^"]+)"[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  for (const match of text.matchAll(newsPattern)) {
    const block = match[2];
    const title = stripTags(block);
    if (title && title.length > 8) {
      items.push({
        title,
        url: match[1],
        publishedAt: new Date().toISOString(),
        summary: title,
        image: extractFirstImageFromHtml(block, "https://www.hltv.org")
      });
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

function parseDust2(html) {
  const text = String(html);
  const items = [];
  const newsPattern = /<a[^>]+href="(\/news\/\d+\/[^"#]+)[^"]*"[^>]+class="[^"]*news-item[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of text.matchAll(newsPattern)) {
    const block = match[2];
    const title = stripTags(block.match(/class="news-item-header"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || "");
    const timeText = stripTags(block.match(/class="news-item-time"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || "");
    const image = extractFirstImageFromHtml(block, "https://www.dust2.us");
    if (title) {
      items.push({
        title,
        url: match[1],
        publishedAt: relativeDateToIso(timeText),
        summary: title,
        image
      });
    }
  }
  return items;
}

function parseEslNews(html) {
  const text = String(html);
  const items = [];
  const postPattern = /<div[^>]+data-elementor-type="loop-item"[\s\S]*?<\/time>[\s\S]*?<p class="elementor-heading-title[^>]*>([\s\S]*?)<\/p>/gi;
  for (const match of text.matchAll(postPattern)) {
    const block = match[0];
    const link = block.match(/<a[^>]+href="([^"]+)"/i)?.[1] || "";
    const title = stripTags(match[1]);
    const date = stripTags(block.match(/<time[^>]*>([\s\S]*?)<\/time>/i)?.[1] || "");
    const image = extractFirstImageFromHtml(block, "https://pro.eslgaming.com");
    if (title && link && date) {
      items.push({
        title,
        url: link,
        publishedAt: date,
        summary: title,
        image
      });
    }
  }
  return items;
}

function parseSkinport(html) {
  const text = String(html);
  const items = [];
  const articlePattern = /<article\b[\s\S]*?<\/article>/gi;
  for (const [block] of text.matchAll(articlePattern)) {
    const link = block.match(/<a[^>]+href="(\/blog\/[^"]+)"/i)?.[1] || "";
    const title = stripTags(block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || "");
    const summary = stripTags(block.match(/<section[^>]*>([\s\S]*?)<\/section>/i)?.[1] || title);
    const date = block.match(/<time[^>]+dateTime="([^"]+)"/i)?.[1] || stripTags(block.match(/<time[^>]*>([\s\S]*?)<\/time>/i)?.[1] || "");
    const image = extractLargestSrcsetImage(block.match(/srcSet="([^"]+)"/i)?.[1] || "", "https://skinport.com")
      || extractFirstImageFromHtml(block, "https://skinport.com");
    if (title && link && date) {
      items.push({ title, url: link, publishedAt: date, summary, image });
    }
  }
  return items;
}

function parseEsportfire(html) {
  const text = String(html);
  const items = [];
  const articlePattern = /<div class="col-xl-4 col-lg-6 mb-5">([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>\s*<\/div>/gi;
  for (const match of text.matchAll(articlePattern)) {
    const block = match[1];
    const link = block.match(/<a[^>]+href="([^"]*\/article\/[^"]+)"/i)?.[1] || "";
    const title = stripTags(block.match(/class="latest-article-title"[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || "");
    const summary = stripTags(block.match(/class="article-pragrap"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || title);
    const image = extractFirstImageFromHtml(block, "https://esportfire.com");
    const dateFromImage = image.match(/(?:T_|_)(\d{2})(\d{2})(\d{4})_/) || image.match(/(\d{2})(\d{2})(\d{4})/);
    const publishedAt = dateFromImage ? `${dateFromImage[3]}-${dateFromImage[2]}-${dateFromImage[1]}` : new Date().toISOString();
    if (title && link) items.push({ title, url: link, publishedAt, summary, image });
  }
  return items;
}

function parseCsgoSkinsUpdates(html) {
  const text = String(html);
  const items = [];
  const updatePattern = /<a[^>]+href="(https:\/\/csgoskins\.gg\/updates\/[^"]+)"[^>]*>([\s\S]{0,700}?)<\/a>/gi;
  for (const match of text.matchAll(updatePattern)) {
    const title = stripTags(match[2]);
    if (!title || title.length < 4) continue;
    const after = text.slice(match.index, match.index + 1400);
    const released = stripTags(after.match(/Released\s+([^<.]+(?:\d{4})?)/i)?.[0] || "");
    const publishedAt = normalizeDate(released) || relativeDateToIso(released);
    items.push({
      title,
      url: match[1],
      publishedAt,
      summary: `CS2 item update: ${title}.`,
      image: extractFirstImageFromHtml(after, "https://csgoskins.gg")
    });
  }
  return dedupeNewsItems(items.map((item) => normalizeNewsItem(item, {
    source: "CSGOSKINS.GG",
    category: "market",
    baseUrl: "https://csgoskins.gg"
  })).filter(Boolean));
}

function parseSource(html, sourceConfig) {
  if (sourceConfig.parser === "rss") return parseRss(html);
  if (sourceConfig.parser === "counterStrike") return parseCounterStrike(html);
  if (sourceConfig.parser === "hltv") return parseHltv(html);
  if (sourceConfig.parser === "dust2") return parseDust2(html);
  if (sourceConfig.parser === "eslNews") return parseEslNews(html);
  if (sourceConfig.parser === "skinport") return parseSkinport(html);
  if (sourceConfig.parser === "esportfire") return parseEsportfire(html);
  if (sourceConfig.parser === "csgoskinsUpdates") return parseCsgoSkinsUpdates(html);
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

async function fetchArticleImage(url) {
  if (!/^https?:\/\//i.test(url)) return "";
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "accept": "text/html,*/*;q=0.8"
      }
    });
    if (!response.ok) return "";
    return extractFirstImageFromHtml(await response.text(), url);
  } catch {
    return "";
  }
}

function extractMetaContent(html, names) {
  const values = Array.isArray(names) ? names : [names];
  for (const name of values) {
    const byProperty = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1];
    const byContent = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`, "i"))?.[1];
    const value = stripTags(byProperty || byContent || "");
    if (value) return value;
  }
  return "";
}

function cleanArticleParagraph(text) {
  return stripTags(text)
    .replace(/\s+/g, " ")
    .replace(/[|•·]{2,}/g, " ")
    .trim();
}

function clipBody(value, max = 1400) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function looksMostlyAscii(value = "") {
  const text = String(value || "").trim();
  if (!text) return false;
  const asciiChars = Array.from(text).filter((char) => char.charCodeAt(0) <= 127).length;
  return asciiChars / Math.max(1, text.length) > 0.7;
}

function extractArticleBodyFromHtml(html, fallbackSummary = "") {
  const text = String(html || "");
  const articleScoped = text.match(/itemprop=["']articleBody["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/i)?.[1]
    || text.match(/<article\b[\s\S]*?>([\s\S]*?)<\/article>/i)?.[1]
    || text;
  const paragraphs = [];
  const prioritizedMatches = [
    ...articleScoped.matchAll(/<p[^>]*class=["'][^"']*paragraph[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi),
    ...articleScoped.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi),
    ...articleScoped.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
  ];
  for (const match of prioritizedMatches) {
    const cleaned = cleanArticleParagraph(match[1]);
    if (!cleaned || cleaned.length < 40) continue;
    if (/^(share|read more|source|subscribe|newsletter|advertisement)$/i.test(cleaned)) continue;
    if (paragraphs.includes(cleaned)) continue;
    paragraphs.push(cleaned);
    if (paragraphs.length >= 5) break;
  }
  if (paragraphs.length) return clipBody(paragraphs.join("\n\n"));
  return clipBody(cleanArticleParagraph(fallbackSummary));
}

async function fetchArticleDetails(item) {
  if (!/^https?:\/\//i.test(item?.url || "")) {
    return { image: item?.image || "", summary: item?.summary || "", body: item?.body || "" };
  }
  try {
    const response = await fetch(item.url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "accept": "text/html,*/*;q=0.8"
      }
    });
    if (!response.ok) {
      return { image: item?.image || "", summary: item?.summary || "", body: item?.body || "" };
    }
    const html = await response.text();
    const summary = clipSummary(
      extractMetaContent(html, ["description", "og:description", "twitter:description"])
      || item.summary
    );
    const body = extractArticleBodyFromHtml(html, summary || item.summary || item.title);
    return {
      image: item?.image || extractFirstImageFromHtml(html, item.url),
      summary,
      body
    };
  } catch {
    return { image: item?.image || "", summary: item?.summary || "", body: item?.body || "" };
  }
}

async function translateTextToZh(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(value)}`;
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "accept": "application/json,text/plain,*/*"
      }
    });
    if (!response.ok) return "";
    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
      ? payload[0].map((entry) => String(entry?.[0] || "")).join("").trim()
      : "";
    return translated.replace(/\s*\n\s*/g, "\n\n").trim();
  } catch {
    return "";
  }
}

async function translateNewsItemsToChinese(items, existingById = new Map()) {
  const translated = [];
  for (const item of items) {
    const existing = existingById.get(item.id) || {};
    const titleZh = String(existing.titleZh || TITLE_ZH[item.title] || "").trim() || item.title;
    const existingBodyZh = String(existing.bodyZh || "").trim();
    const needsBodyTranslation = !existingBodyZh || existingBodyZh === item.body || looksMostlyAscii(existingBodyZh);
    const translatedBodyZh = needsBodyTranslation
      ? await translateTextToZh(item.body || item.summary || item.title)
      : existingBodyZh;
    translated.push({
      ...item,
      titleZh,
      summaryZh: String(existing.summaryZh || titleZh).trim(),
      bodyZh: translatedBodyZh || existingBodyZh || item.body || item.summary || titleZh
    });
  }
  return translated;
}

async function fetchHltvFallbackImages(limit = 12) {
  try {
    const response = await fetch("https://www.hltv.org", {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "accept": "text/html,*/*;q=0.8"
      }
    });
    if (!response.ok) return [];
    return parseHltv(await response.text())
      .map((entry) => entry.image)
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}

async function enrichNewsDetails(items) {
  const enriched = [];
  const hltvImages = await fetchHltvFallbackImages();
  let hltvIndex = 0;
  for (const item of items) {
    const details = await fetchArticleDetails(item);
    let image = details.image || item.image || await fetchArticleImage(item.url);
    if (!image && hltvImages.length) {
      image = hltvImages[hltvIndex % hltvImages.length];
      hltvIndex += 1;
    }
    enriched.push({
      ...item,
      image: normalizeRelatedImageUrl(image),
      summary: details.summary || item.summary,
      body: details.body || item.body || details.summary || item.summary
    });
  }
  return enriched;
}

async function readExistingData(dataPath, detailDataPath = "") {
  const hasSummary = existsSync(dataPath);
  const hasDetail = detailDataPath && existsSync(detailDataPath);
  if (!hasSummary && !hasDetail) {
    return {
      items: [],
      rankingSnapshot: normalizeRankingSnapshot(DEFAULT_RANKING_SNAPSHOT)
    };
  }
  const content = hasSummary ? await readFile(dataPath, "utf8") : "";
  const snapshotJson = content.match(/window\.HLTV_TEAM_RANKING_SNAPSHOT\s*=\s*([\s\S]*?);\s*window\.RELATED_NEWS/s)?.[1] || "";
  const json = content.match(/window\.RELATED_NEWS\s*=\s*([\s\S]*?);\s*$/)?.[1];
  const detailContent = hasDetail ? await readFile(detailDataPath, "utf8") : "";
  const detailJson = detailContent.match(/window\.RELATED_NEWS_DETAIL\s*=\s*([\s\S]*?);\s*$/)?.[1];
  let rankingSnapshot = null;
  if (snapshotJson) {
    try {
      rankingSnapshot = normalizeRankingSnapshot(JSON.parse(snapshotJson));
    } catch {
      rankingSnapshot = null;
    }
  }
  rankingSnapshot = rankingSnapshot || normalizeRankingSnapshot(DEFAULT_RANKING_SNAPSHOT);
  if (!json) return { items: [], rankingSnapshot };
  try {
    const parsed = JSON.parse(json);
    let details = {};
    if (detailJson) {
      try {
        details = JSON.parse(detailJson) || {};
      } catch {
        details = {};
      }
    }
    return {
      items: Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            body: String(details?.[item.id]?.body || item.body || "").trim(),
            bodyZh: String(details?.[item.id]?.bodyZh || item.bodyZh || details?.[item.id]?.body || item.body || "").trim()
          }))
        : [],
      rankingSnapshot
    };
  } catch {
    return { items: [], rankingSnapshot };
  }
}

export async function syncRelatedNews({ cwd = process.cwd(), sources = SOURCES } = {}) {
  const dataPath = join(cwd, "related-news-data.js");
  const detailDataPath = join(cwd, "related-news-detail-data.js");
  const collected = [];
  const failures = [];

  for (const sourceConfig of sources) {
    try {
      collected.push(...await fetchSource(sourceConfig));
    } catch (error) {
      failures.push(`${sourceConfig.source}: ${error.message}`);
    }
  }

  const existing = await readExistingData(dataPath, detailDataPath);
  const baseItems = collected.length ? collected : existing.items;
  const existingById = new Map(existing.items.map((item) => [item.id, item]));
  const enrichedItems = await enrichNewsDetails(dedupeNewsItems(baseItems)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, MAX_ITEMS));
  const localizedItems = await translateNewsItemsToChinese(enrichedItems, existingById);
  const items = localizedItems
    .map((item) => applyLocalizedNewsFields(item, existingById.get(item.id)));

  if (collected.length || !existsSync(dataPath) || !existsSync(detailDataPath)) {
    const rankingSnapshot = existing.rankingSnapshot || normalizeRankingSnapshot(DEFAULT_RANKING_SNAPSHOT);
    await writeFile(dataPath, serializeNewsSummaryData(items, rankingSnapshot), "utf8");
    await writeFile(detailDataPath, serializeNewsDetailData(items), "utf8");
  }

  if (failures.length) {
    console.warn(`Related news sync warnings:\n- ${failures.join("\n- ")}`);
  }
  console.log(`Related news sync wrote ${items.length} item(s).`);
  return { items, rankingSnapshot: existing.rankingSnapshot, failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await syncRelatedNews({ cwd: process.cwd() });
}
