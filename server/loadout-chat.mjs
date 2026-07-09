import { generateLoadoutCandidates, getCatalogRecommendationIndex } from "./recommendation-engine.mjs";
import { summarizeShoppingPreferencesWithAI } from "./openai-recommender.mjs";

const WEAR_IDS = ["factory-new", "minimal-wear", "field-tested", "well-worn", "battle-scarred"];
const CORE_LOADOUT_WEAPONS = ["AK-47", "AWP", "M4A4", "M4A1-S", "USP-S", "Glock-18"];
const LOADOUT_STYLE_IDS = new Set(["clean", "understated", "tactical", "luxury", "aggressive", "neon", "collector"]);

const SLOT_LABELS = {
  knife: "\u5200",
  glove: "\u624b\u5957"
};

function t(locale, zh, en) {
  return String(locale || "").toLowerCase().startsWith("zh") ? zh : en;
}

function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function normalizeText(text = "") {
  return String(text || "")
    .normalize("NFKC")
    .replace(/[★™|/,+*()[\]{}'"`._-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

function normalizeMessageHistory(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .map((entry) => ({
      role: entry?.role === "assistant" ? "assistant" : "user",
      content: String(entry?.content || "").trim()
    }))
    .filter((entry) => entry.content)
    .slice(-12);
}

function extractBudget(text = "") {
  const raw = String(text || "");
  const match = raw.match(/(?:\u9884\u7b97|budget|around|about)?\s*([0-9]+(?:\.[0-9]+)?)\s*(\u4e07|w|\u5343|k|cny|rmb|\u5143)?/iu);
  if (!match) return 0;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const unit = String(match[2] || "").toLowerCase();
  if (unit === "\u4e07" || unit === "w") return value * 10000;
  if (unit === "\u5343" || unit === "k") return value * 1000;
  return value;
}

function extractTheme(text = "") {
  const raw = String(text || "");
  if (/\u7ea2\u9ed1|\u9ed1\u7ea2|red\s*black|black\s*red/iu.test(raw)) return "red";
  if (/\u84dd\u767d|\u767d\u84dd|blue\s*white|white\s*blue/iu.test(raw)) return "blue";
  if (/\u7d2b|\u7c89|purple|pink|violet|magenta|\u6f58\u591a\u62c9|\u8fc8\u963f\u5bc6/iu.test(raw)) return "purple";
  if (/\u7eff|\u7fe1|\u7fe0|\u83b2|\u8584\u8377|\u68ee\u6797|\u7af9|green|emerald|jade|lotus|spearmint/iu.test(raw)) return "green";
  if (/\u91d1|\u9ec4|\u864e\u7259|\u4f20\u8bf4|\u5962\u534e|\u9ad8\u7ea7|gold|yellow|luxury|tiger\s*tooth|lore/iu.test(raw)) return "gold";
  if (/\u9ed1|\u6697|\u6218\u672f|\u591c|black|dark|tactical|stealth|night/iu.test(raw)) return "black";
  if (/\u767d|\u94f6|\u96ea|\u51b0|\u5e72\u51c0|\u7b80\u6d01|\u7d20|white|silver|snow|ice|clean|minimal/iu.test(raw)) return "white";
  return "";
}

function extractStyles(text = "") {
  const raw = String(text || "");
  return [
    ["clean", /\u5e72\u51c0|\u7b80\u6d01|\u6781\u7b80|\u7d20|clean|minimal|simple/iu],
    ["understated", /\u4f4e\u8c03|\u4e0d\u8981\u592a\u82b1|\u4e0d\u82b1|\u8010\u770b|understated|subtle|not\s*flashy/iu],
    ["tactical", /\u6218\u672f|\u6f5c\u884c|\u6697\u9ed1|tactical|stealth|dark/iu],
    ["luxury", /\u5962\u534e|\u9ad8\u7ea7|\u8d28\u611f|\u8d35|luxury|premium|expensive|high\s*value/iu],
    ["aggressive", /\u5f20\u626c|\u4fb5\u7565|\u8840|\u706b|aggressive|blood|fire/iu],
    ["neon", /\u9713\u8679|\u8d5b\u535a|\u53d1\u5149|neon|cyber|glow/iu],
    ["collector", /\u6536\u85cf|\u7a00\u6709|\u7ecf\u5178|collector|rare|classic/iu]
  ].filter(([, pattern]) => pattern.test(raw)).map(([id]) => id);
}

function extractRarities(text = "") {
  const raw = String(text || "");
  return [
    ["Consumer Grade", /消费级|consumer/iu],
    ["Industrial Grade", /工业级|industrial/iu],
    ["Mil-Spec Grade", /军规级|mil[\s-]?spec/iu],
    ["Restricted", /受限级|restricted/iu],
    ["Classified", /保密级|classified/iu],
    ["Covert", /隐秘级|covert/iu],
    ["Extraordinary", /非凡|extraordinary/iu]
  ].filter(([, pattern]) => pattern.test(raw)).map(([id]) => id);
}

function extractPreferredWears(text = "") {
  const raw = String(text || "");
  return [
    ["factory-new", /崭新|全新|factory\s*new|\bfn\b/iu],
    ["minimal-wear", /略磨|略有磨损|minimal\s*wear|\bmw\b/iu],
    ["field-tested", /久经|field-tested|\bft\b/iu],
    ["well-worn", /磨损严重|well-worn|\bww\b/iu],
    ["battle-scarred", /破损不堪|战痕|battle-scarred|\bbs\b/iu]
  ].filter(([, pattern]) => pattern.test(raw)).map(([id]) => id);
}

function extractBudgetMode(text = "") {
  const raw = String(text || "");
  if (/\u522b\u5403\u6ee1|\u4e0d\u8981\u5403\u6ee1|\u7559\u70b9\u9884\u7b97|\u522b\u7528\u5b8c|do\s*not\s*max|leave\s*(some\s*)?budget/iu.test(raw)) return "conservative";
  if (/\u5c3d\u91cf\u5403\u6ee1|\u9884\u7b97\u5403\u6ee1|\u62c9\u6ee1|\u9884\u7b97\u7528\u5b8c|max\s*(out)?|use\s*(the\s*)?budget/iu.test(raw)) return "maximize";
  return "";
}

function extractExcludes(text = "") {
  const raw = String(text || "");
  if (/\u53ea\u8981.*\u67aa|\u53ea\u505a.*\u67aa|\u67aa\u76ae\u5c31\u884c|guns\s*only|only\s*guns/iu.test(raw)) return ["knife", "glove"];
  return [
    ...(/\u4e0d\u8981.*\u5200|\u4e0d\u5e26.*\u5200|\u65e0\u5200|no\s*knife|without\s*knife/iu.test(raw) ? ["knife"] : []),
    ...(/\u4e0d\u8981.*\u624b\u5957|\u4e0d\u5e26.*\u624b\u5957|\u65e0\u624b\u5957|no\s*gloves?|without\s*gloves?/iu.test(raw) ? ["glove"] : [])
  ];
}

function extractMustInclude(text = "") {
  const raw = String(text || "");
  const excluded = new Set(extractExcludes(raw));
  return [
    ...(!excluded.has("knife") && /(?:\u8981|\u5e26|\u9700\u8981|\u52a0|include|add).{0,6}(\u5200|knife)/iu.test(raw) ? ["knife"] : []),
    ...(!excluded.has("glove") && /(?:\u8981|\u5e26|\u9700\u8981|\u52a0|include|add).{0,6}(\u624b\u5957|glove|gloves)/iu.test(raw) ? ["glove"] : [])
  ];
}

function chineseCountBefore(text = "", startIndex = 0) {
  const prefix = String(text || "").slice(Math.max(0, startIndex - 8), startIndex).trim();
  if (/\u4e24\s*\u628a?$|2\s*\u628a?$/iu.test(prefix)) return 2;
  const match = prefix.match(/([一二三四五六七八九十]|\d+)\s*把?$/u);
  if (!match) return 1;
  const map = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  return Math.max(1, Math.min(10, Number(match[1]) || map[match[1]] || 1));
}

function weaponMatchesFromText(text = "", weaponIndex = []) {
  const raw = String(text || "");
  const normalized = normalizeText(raw);
  const matches = [];
  for (const weapon of weaponIndex) {
    const aliases = [weapon.weapon, weapon.label, ...(weapon.aliases || [])]
      .map((alias) => normalizeText(alias))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    let best = null;
    for (const alias of aliases) {
      const index = normalized.indexOf(alias);
      if (index >= 0 && (!best || alias.length > best.alias.length)) {
        best = { alias, index };
      }
    }
    if (best) {
      matches.push({
        weapon: weapon.weapon,
        weaponId: weapon.id,
        quantity: chineseCountBefore(normalized, best.index),
        constraints: {}
      });
    }
  }
  return matches.sort((a, b) => a.weapon.localeCompare(b.weapon));
}

function extractSpecificTerms(text = "") {
  const raw = String(text || "");
  return [
    ["skull", /骷髅|头骨|skull/iu],
    ["dragon", /龙纹|龙|dragon/iu],
    ["metal", /金属|电镀|铬|metal|chrome|anodized|steel/iu],
    ["camo", /迷彩|camo/iu],
    ["neon", /\u9713\u8679|\u8d5b\u535a|\u53d1\u5149|neon|cyber|glow/iu],
    ["fire", /火焰|火|熔岩|fire|flame|lava/iu],
    ["snake", /蛇|蟒|snake|serpent/iu]
  ].filter(([, pattern]) => pattern.test(raw)).map(([id]) => id);
}

function extractPreferredItems(text = "") {
  const raw = String(text || "");
  const items = [];
  if (/\u8fc8\u963f\u5bc6|miami|vice/iu.test(raw)) items.push({ slot: "glove", query: "Vice" });
  if (/\u6f58\u591a\u62c9|pandora/iu.test(raw)) items.push({ slot: "glove", query: "Pandora" });
  if (/\u8d85\u5bfc|superconductor/iu.test(raw)) items.push({ slot: "glove", query: "Superconductor" });
  if (/\u53cc\u6816|\u4e24\u6816|amphibious/iu.test(raw)) items.push({ slot: "glove", query: "Amphibious" });
  if (/\u591a\u666e\u52d2|doppler/iu.test(raw)) items.push({ slot: "knife", query: "Doppler" });
  if (/\u706b\u795e|vulcan/iu.test(raw)) items.push({ slot: "ak-47", query: "Vulcan" });
  if (/\u5370\u82b1\u96c6|printstream/iu.test(raw)) items.push({ slot: "m4a1-s", query: "Printstream" });
  if (/\u4e0d\u9508\u94a2|stainless/iu.test(raw)) items.push({ slot: "usp-s", query: "Stainless" });
  return items;
}

function mergeArrays(base = [], next = []) {
  return unique([...(Array.isArray(base) ? base : []), ...(Array.isArray(next) ? next : [])]);
}

function mergeRequestedItems(base = [], next = []) {
  const keyed = new Map();
  for (const item of [...(Array.isArray(base) ? base : []), ...(Array.isArray(next) ? next : [])]) {
    const key = String(item.weaponId || item.weapon || "").toLowerCase();
    if (!key) continue;
    const current = keyed.get(key);
    keyed.set(key, {
      weapon: item.weapon || current?.weapon || "",
      weaponId: item.weaponId || current?.weaponId || "",
      quantity: Math.max(Number(current?.quantity || 0), Number(item.quantity || 1) || 1),
      constraints: { ...(current?.constraints || {}), ...(item.constraints || {}) }
    });
  }
  return [...keyed.values()];
}

function mergePreferredItems(base = [], next = []) {
  const keyed = new Map();
  for (const item of [...(Array.isArray(base) ? base : []), ...(Array.isArray(next) ? next : [])]) {
    const slot = String(item?.slot || item?.weapon || item?.weaponId || "").trim();
    const query = String(item?.query || "").trim();
    if (!slot || !query) continue;
    keyed.set(`${slot.toLowerCase()}::${query.toLowerCase()}`, { slot, query });
  }
  return [...keyed.values()];
}

function mergePreference(base = {}, next = {}) {
  return {
    budget: Number(next.budget || 0) > 0 ? Number(next.budget) : Number(base.budget || 0),
    color: next.color || base.color || "",
    style: next.style || base.style || "",
    styles: mergeArrays(base.styles, next.styles),
    requestedItems: mergeRequestedItems(base.requestedItems, next.requestedItems),
    preferredItems: mergePreferredItems(base.preferredItems, next.preferredItems),
    allWeapons: Boolean(next.allWeapons || base.allWeapons),
    fullLoadout: Boolean(next.fullLoadout || base.fullLoadout),
    weaponPreferences: mergeArrays(base.weaponPreferences, next.weaponPreferences),
    mustInclude: mergeArrays(base.mustInclude, next.mustInclude),
    excludeSlots: mergeArrays(base.excludeSlots, next.excludeSlots),
    excludeWeapons: mergeArrays(base.excludeWeapons, next.excludeWeapons),
    preferredWears: mergeArrays(base.preferredWears, next.preferredWears).filter((wear) => WEAR_IDS.includes(wear)),
    rarities: mergeArrays(base.rarities, next.rarities),
    specificTerms: mergeArrays(base.specificTerms, next.specificTerms),
    budgetMode: next.budgetMode || base.budgetMode || "maximize",
    aiUsed: Boolean(next.aiUsed || base.aiUsed),
    aiReason: next.aiReason || base.aiReason || ""
  };
}

function uniqueStyleIds(values = []) {
  return unique((Array.isArray(values) ? values : []).filter((style) => LOADOUT_STYLE_IDS.has(style)));
}

function presetPreferencePatch(preset = "") {
  const normalized = String(preset || "").trim().toLowerCase();
  if (normalized === "premium") {
    return {
      weaponPreferences: CORE_LOADOUT_WEAPONS,
      mustInclude: ["glove", "knife"],
      excludeSlots: []
    };
  }
  if (normalized === "mid") {
    return {
      weaponPreferences: CORE_LOADOUT_WEAPONS,
      mustInclude: ["knife"],
      excludeSlots: []
    };
  }
  if (normalized === "guns") {
    return {
      weaponPreferences: CORE_LOADOUT_WEAPONS,
      mustInclude: [],
      excludeSlots: ["knife", "glove"]
    };
  }
  return null;
}

export function applyFilterOverrides(preferences = {}, overrides = {}) {
  const next = mergePreference({}, preferences || {});
  const color = String(overrides.color || "").trim();
  const style = String(overrides.style || "").trim();
  const budgetMode = String(overrides.budgetMode || "").trim();
  const preset = String(overrides.preset || "").trim().toLowerCase();

  if (color) next.color = color;
  if (style) next.styles = [style];
  else next.styles = uniqueStyleIds(next.styles);
  if (budgetMode) next.budgetMode = budgetMode;

  const presetPatch = presetPreferencePatch(preset);
  if (presetPatch) {
    next.weaponPreferences = mergeArrays(next.weaponPreferences, presetPatch.weaponPreferences);
    next.mustInclude = mergeArrays(
      (next.mustInclude || []).filter((slot) => !presetPatch.excludeSlots.includes(slot)),
      presetPatch.mustInclude
    );
    next.excludeSlots = mergeArrays(
      (next.excludeSlots || []).filter((slot) => !presetPatch.mustInclude.includes(slot)),
      presetPatch.excludeSlots
    );
  }
  return next;
}

function buildRulePreferences(messages = [], body = {}, weaponIndex = []) {
  let preferences = {};
  const texts = [
    body.message,
    body.style,
    ...(Array.isArray(messages) ? messages.filter((entry) => entry.role === "user").map((entry) => entry.content) : [])
  ].filter(Boolean);
  for (const text of texts) {
    preferences = mergePreference(preferences, {
      budget: extractBudget(text),
      color: extractTheme(text),
      style: text,
      styles: extractStyles(text),
      requestedItems: weaponMatchesFromText(text, weaponIndex),
      preferredItems: extractPreferredItems(text),
      allWeapons: /每个武器|每把枪|全武器|所有武器|全部武器|all weapons|every weapon|all guns/iu.test(text),
      fullLoadout: /一整套|来一套|整套|full loadout/iu.test(text),
      mustInclude: extractMustInclude(text),
      excludeSlots: extractExcludes(text),
      preferredWears: extractPreferredWears(text),
      rarities: extractRarities(text),
      specificTerms: extractSpecificTerms(text),
      budgetMode: extractBudgetMode(text)
    });
  }
  preferences = mergePreference(preferences, {
    budget: Number(body.budget || 0),
    color: body.color || body.preferences?.color || "",
    style: body.style || body.preferences?.style || "",
    styles: body.preferences?.styles || [],
    requestedItems: body.requestedItems || body.preferences?.requestedItems || [],
    preferredItems: body.preferredItems || body.preferences?.preferredItems || [],
    weaponPreferences: body.weaponPreferences || body.preferences?.weaponPreferences || [],
    mustInclude: body.mustInclude || body.preferences?.mustInclude || [],
    excludeSlots: body.excludeSlots || body.preferences?.excludeSlots || [],
    preferredWears: body.preferredWears || body.preferences?.preferredWears || [],
    budgetMode: body.budgetMode || body.preferences?.budgetMode || ""
  });
  return preferences;
}

function normalizeAiPreferences(ai = {}) {
  return {
    budget: ai.budget,
    color: ai.color,
    style: ai.style,
    styles: ai.styles,
    requestedItems: ai.requestedItems,
    preferredItems: ai.preferredItems,
    allWeapons: ai.allWeapons,
    fullLoadout: ai.fullLoadout,
    weaponPreferences: ai.weaponPreferences,
    mustInclude: ai.mustInclude,
    excludeSlots: ai.excludeSlots,
    excludeWeapons: ai.excludeWeapons,
    preferredWears: ai.preferredWears,
    rarities: ai.rarities,
    specificTerms: ai.specificTerms,
    budgetMode: ai.budgetMode,
    aiUsed: true
  };
}

function questionForPreferences(preferences = {}, locale = "zh") {
  if (!Number.isFinite(Number(preferences.budget)) || Number(preferences.budget) <= 0) {
    return t(locale, "\u5148\u7ed9\u6211\u4e00\u4e2a\u9884\u7b97\u8303\u56f4\uff0c\u6bd4\u5982 300\u30011500 \u6216 20000 \u5143\u3002", "What budget should I stay within? For example 300, 1500, or 20000 CNY.");
  }
  return "";
}

function buildRuleMessage(preferences = {}, selected = null, locale = "zh") {
  const total = selected?.totalPrice ? Math.round(Number(selected.totalPrice)) : 0;
  const count = Number(selected?.itemCount || 0);
  const mode = preferences.allWeapons
    ? t(locale, "\u5168\u6b66\u5668\u8d2d\u7269\u6e05\u5355", "all-weapon shopping list")
    : t(locale, "\u8d2d\u7269\u6e05\u5355", "shopping list");
  const ai = preferences.aiUsed ? t(locale, "AI \u5df2\u89e3\u6790", "AI parsed") : t(locale, "\u89c4\u5219\u5f15\u64ce\u5df2\u89e3\u6790", "rule engine parsed");
  return t(
    locale,
    `${ai}\uff0c\u5df2\u751f\u6210 ${mode}\uff1a${count} \u4ef6\uff0c\u603b\u4ef7\u7ea6 ${total} \u5143\u3002`,
    `${ai}; generated a ${mode}: ${count} items, about ${total} CNY.`
  );
}

export async function handleLoadoutChat(rootDir, body = {}, options = {}) {
  const messages = normalizeMessageHistory(body.messages);
  const locale = body.locale || "zh";
  const catalogIndex = await getCatalogRecommendationIndex(rootDir);
  const rulePreferences = buildRulePreferences(messages, body, catalogIndex.weapons);
  const provider = String(options.provider || process.env.AI_PROVIDER || "ollama").trim().toLowerCase();
  const aiResult = provider && provider !== "rules" && provider !== "none"
    ? await summarizeShoppingPreferencesWithAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY || "",
      provider,
      baseUrl: options.baseUrl || process.env.AI_BASE_URL || "",
      model: options.model || process.env.AI_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:7b",
      messages,
      request: body,
      weaponIndex: catalogIndex.weapons
    }).catch((error) => ({ usedAI: false, reason: error?.message || "ai_failed" }))
    : { usedAI: false, reason: provider || "rules_provider" };

  const aiPreferences = aiResult.usedAI ? normalizeAiPreferences(aiResult.preferences || {}) : {};
  const preferences = applyFilterOverrides(
    mergePreference(rulePreferences, aiPreferences),
    body.filterOverrides || body.preferences?.filterOverrides || {}
  );
  preferences.aiUsed = Boolean(aiResult.usedAI);
  preferences.aiReason = aiResult.usedAI ? "" : (aiResult.reason || "ai_unavailable");

  const question = questionForPreferences(preferences, locale);
  if (question) {
    return {
      ok: true,
      status: "question",
      message: question,
      preferences,
      selected: null,
      alternatives: [],
      engine: {
        usedAI: Boolean(aiResult.usedAI),
        provider: aiResult.provider || null,
        model: aiResult.usedAI ? (options.model || process.env.AI_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:7b") : null,
        note: "",
        warnings: [],
        fallbackReason: aiResult.usedAI ? null : preferences.aiReason
      }
    };
  }

  const request = {
    budget: preferences.budget,
    locale,
    color: preferences.color || "",
    style: [preferences.color, ...(preferences.styles || []), ...(preferences.specificTerms || []), ...(preferences.rarities || [])].filter(Boolean).join(" "),
    styles: preferences.styles || [],
    requestedItems: preferences.requestedItems || [],
    allWeapons: Boolean(preferences.allWeapons),
    fullLoadout: Boolean(preferences.fullLoadout),
    preferredWears: preferences.preferredWears || [],
    rarities: preferences.rarities || [],
    budgetMode: preferences.budgetMode || "maximize",
    weaponPreferences: preferences.weaponPreferences || [],
    mustInclude: preferences.mustInclude || [],
    excludeSlots: preferences.excludeSlots || [],
    excludeWeapons: preferences.excludeWeapons || [],
    specificTerms: preferences.specificTerms || [],
    preferredItems: preferences.preferredItems || []
  };

  const result = await generateLoadoutCandidates(rootDir, request);
  const selected = result.loadouts?.[0] || null;
  const message = buildRuleMessage(preferences, selected, locale);

  return {
    ok: true,
    status: "recommendation",
    message,
    preferences,
    tier: result.tier,
    theme: result.theme,
    requiredSlots: result.requiredSlots,
    requestedItems: result.requestedItems,
    selected,
    alternatives: (result.loadouts || []).slice(1, 3),
    engine: {
      usedAI: Boolean(aiResult.usedAI),
      provider: aiResult.provider || null,
      model: aiResult.usedAI ? (options.model || process.env.AI_MODEL || process.env.OLLAMA_MODEL || "qwen2.5:7b") : null,
      note: message,
      warnings: selected?.warnings || [],
      fallbackReason: aiResult.usedAI ? null : preferences.aiReason
    }
  };
}
