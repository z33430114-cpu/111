const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const OLLAMA_BASE_URL = "http://127.0.0.1:11434";

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  if (typeof payload?.message?.content === "string") return payload.message.content.trim();
  if (typeof payload?.response === "string") return payload.response.trim();
  const textChoice = payload?.choices?.[0]?.text;
  if (typeof textChoice === "string") return textChoice.trim();
  const choice = payload?.choices?.[0]?.message?.content;
  if (typeof choice === "string") return choice.trim();
  const texts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") texts.push(content.text);
    }
  }
  return texts.join("\n").trim();
}

function stripJsonFence(raw = "") {
  return String(raw || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function safeParseJson(raw) {
  const text = stripJsonFence(raw);
  try {
    return JSON.parse(text);
  } catch {
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
}

function normalizePreferencePayload(value = {}) {
  const preferredItems = Array.isArray(value.preferredItems)
    ? value.preferredItems
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        slot: typeof item.slot === "string" ? item.slot : "",
        query: typeof item.query === "string" ? item.query : ""
      }))
      .filter((item) => item.slot && item.query)
    : [];
  return {
    budget: Number(value.budget || 0),
    color: typeof value.color === "string" ? value.color : "",
    style: typeof value.style === "string" ? value.style : "",
    styles: Array.isArray(value.styles) ? value.styles.filter((item) => typeof item === "string") : [],
    weaponPreferences: Array.isArray(value.weaponPreferences) ? value.weaponPreferences.filter((item) => typeof item === "string") : [],
    mustInclude: Array.isArray(value.mustInclude) ? value.mustInclude.filter((item) => typeof item === "string") : [],
    excludeSlots: Array.isArray(value.excludeSlots) ? value.excludeSlots.filter((item) => typeof item === "string") : [],
    preferredWears: Array.isArray(value.preferredWears) ? value.preferredWears.filter((item) => typeof item === "string") : [],
    budgetMode: typeof value.budgetMode === "string" ? value.budgetMode : "",
    preferredItems
  };
}

function normalizeShoppingPreferencePayload(value = {}) {
  const preferredItems = Array.isArray(value.preferredItems)
    ? value.preferredItems
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        slot: typeof item.slot === "string" ? item.slot : "",
        query: typeof item.query === "string" ? item.query : ""
      }))
      .filter((item) => item.slot && item.query)
    : [];
  const requestedItems = Array.isArray(value.requestedItems)
    ? value.requestedItems
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        weapon: typeof item.weapon === "string" ? item.weapon : "",
        weaponId: typeof item.weaponId === "string" ? item.weaponId : "",
        quantity: Math.max(1, Math.min(10, Number(item.quantity || 1) || 1)),
        constraints: item.constraints && typeof item.constraints === "object" ? item.constraints : {}
      }))
      .filter((item) => item.weapon || item.weaponId)
    : [];
  return {
    budget: Number(value.budget || 0),
    color: typeof value.color === "string" ? value.color : "",
    style: typeof value.style === "string" ? value.style : "",
    styles: Array.isArray(value.styles) ? value.styles.filter((item) => typeof item === "string") : [],
    requestedItems,
    preferredItems,
    allWeapons: Boolean(value.allWeapons),
    fullLoadout: Boolean(value.fullLoadout),
    weaponPreferences: Array.isArray(value.weaponPreferences) ? value.weaponPreferences.filter((item) => typeof item === "string") : [],
    mustInclude: Array.isArray(value.mustInclude) ? value.mustInclude.filter((item) => typeof item === "string") : [],
    excludeSlots: Array.isArray(value.excludeSlots) ? value.excludeSlots.filter((item) => typeof item === "string") : [],
    excludeWeapons: Array.isArray(value.excludeWeapons) ? value.excludeWeapons.filter((item) => typeof item === "string") : [],
    preferredWears: Array.isArray(value.preferredWears) ? value.preferredWears.filter((item) => typeof item === "string") : [],
    rarities: Array.isArray(value.rarities) ? value.rarities.filter((item) => typeof item === "string") : [],
    specificTerms: Array.isArray(value.specificTerms) ? value.specificTerms.filter((item) => typeof item === "string") : [],
    budgetMode: typeof value.budgetMode === "string" ? value.budgetMode : ""
  };
}

function normalizeProvider(options = {}) {
  const explicit = String(options.provider || process.env.AI_PROVIDER || "").trim().toLowerCase();
  if (explicit) return explicit;
  if (options.baseUrl || process.env.AI_BASE_URL) return "custom";
  if (options.apiKey || process.env.OPENAI_API_KEY) return "openai";
  return "rules";
}

function trimSlash(value = "") {
  return String(value || "").replace(/\/+$/u, "");
}

async function postJson(url, body, headers = {}) {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 5000);
  const signal = AbortSignal.timeout(Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 5000);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body),
    signal
  });
  if (!response.ok) {
    const message = await response.text();
    throw Object.assign(new Error(`LLM request failed: ${response.status} ${message}`), {
      code: "llm_request_failed",
      status: 502
    });
  }
  return response.json();
}

function buildCustomEndpointCandidates(rawBaseUrl = "") {
  if (!rawBaseUrl) return [];
  if (/openrouter\.ai\/api\/v1\/?$/iu.test(rawBaseUrl)) return [`${rawBaseUrl}/chat/completions`];
  if (/\/(chat\/completions|completions|openai)$/u.test(rawBaseUrl)) {
    return [rawBaseUrl];
  }
  return [`${rawBaseUrl}/chat/completions`, `${rawBaseUrl}/completions`];
}

function customResponseFormatMode() {
  return String(process.env.AI_CUSTOM_RESPONSE_FORMAT || "auto").trim().toLowerCase();
}

function buildCustomChatBody({ model, system, user, preferJson }) {
  const responseFormatMode = customResponseFormatMode();
  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  };
  if (preferJson && responseFormatMode !== "off" && responseFormatMode !== "none" && responseFormatMode !== "text") {
    body.response_format = { type: "json_object" };
  }
  return body;
}

function buildCustomPrompt(system, user, preferJson) {
  if (!preferJson) return `${system}\n\nUser:\n${user}`;
  return [
    system,
    "",
    "Return valid JSON only. Do not include markdown fences or extra explanation.",
    "",
    "User:",
    user
  ].join("\n");
}

async function postLLM({ provider, apiKey, model, baseUrl, system, user, preferJson = true }) {
  const resolvedProvider = normalizeProvider({ provider, apiKey, baseUrl });
  if (resolvedProvider === "rules" || resolvedProvider === "none") {
    return { usedAI: false, reason: "rules_provider" };
  }
  if (resolvedProvider === "ollama") {
    const url = `${trimSlash(baseUrl || process.env.AI_BASE_URL || OLLAMA_BASE_URL)}/api/chat`;
    const payload = await postJson(url, {
      model: model || process.env.OLLAMA_MODEL || process.env.AI_MODEL || "qwen2.5:7b",
      stream: false,
      format: preferJson ? "json" : undefined,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });
    return { usedAI: true, provider: "ollama", payload };
  }
  if (resolvedProvider === "custom") {
    const rawBaseUrl = trimSlash(baseUrl || process.env.AI_BASE_URL);
    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    const resolvedModel = model || process.env.AI_MODEL || "qwen2.5:7b";
    let lastError = null;
    for (const url of buildCustomEndpointCandidates(rawBaseUrl)) {
      try {
        const isCompletions = /\/completions$/u.test(url) && !/\/chat\/completions$/u.test(url);
        const payload = await postJson(
          url,
          isCompletions
            ? {
                model: resolvedModel,
                temperature: 0.2,
                prompt: buildCustomPrompt(system, user, preferJson)
              }
            : buildCustomChatBody({ model: resolvedModel, system, user, preferJson }),
          headers
        );
        return { usedAI: true, provider: "custom", payload };
      } catch (error) {
        if (error?.name === "AbortError" || error?.name === "TimeoutError" || error?.code === 20) throw error;
        lastError = error;
      }
    }
    throw lastError || Object.assign(new Error("Custom LLM request failed."), {
      code: "llm_request_failed",
      status: 502
    });
  }
  const key = apiKey || process.env.OPENAI_API_KEY || "";
  if (!key) return { usedAI: false, reason: "missing_api_key" };
  const responsesBody = {
    model: model || process.env.OPENAI_RECOMMENDER_MODEL || process.env.AI_MODEL || "gpt-5.5",
    reasoning: { effort: "low" },
    input: [
      { role: "system", content: [{ type: "input_text", text: system }] },
      { role: "user", content: [{ type: "input_text", text: user }] }
    ]
  };
  const payload = await postJson(OPENAI_RESPONSES_URL, responsesBody, { Authorization: `Bearer ${key}` });
  return { usedAI: true, provider: "openai", payload };
}

export async function summarizeLoadoutPreferencesWithAI({
  apiKey,
  provider,
  baseUrl,
  model = "gpt-5.5",
  messages,
  request = {}
}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { usedAI: false, reason: "missing_messages" };
  }
  const system = [
    "You extract CS2 loadout preferences from chat history.",
    "Return only JSON with: budget, color, style, styles, weaponPreferences, mustInclude, excludeSlots, preferredWears, budgetMode, preferredItems.",
    "Use slot ids knife/glove for mustInclude or excludeSlots. Use weapon names AK-47, M4A1-S, M4A4, USP-S, Glock-18.",
    "preferredItems must be an array of objects like {\"slot\":\"glove\",\"query\":\"Vice\"} or {\"slot\":\"ak\",\"query\":\"Vulcan\"} when the user names a specific skin, glove, or knife finish.",
    "When the user names a specific item nickname or Chinese alias, convert it to a useful market-style query. Examples: 迈阿密手套 -> {\"slot\":\"glove\",\"query\":\"Vice\"}, 多普勒蝴蝶刀 -> {\"slot\":\"knife\",\"query\":\"Butterfly Knife | Doppler\"}, 火神AK -> {\"slot\":\"ak\",\"query\":\"Vulcan\"}, 印花集M4A1-S -> {\"slot\":\"m4a1\",\"query\":\"Printstream\"}, 不锈钢USP -> {\"slot\":\"usp\",\"query\":\"Stainless\"}.",
    "Use wear ids factory-new, minimal-wear, field-tested, well-worn, battle-scarred. budgetMode is conservative when the user says not to spend all budget, maximize when they want to max out.",
    "If the user updates or reverses a prior requirement, reflect the latest user message. If the user says guns only, exclude knife and glove. Do not invent a budget. Return JSON only."
  ].join("\n");
  const llm = await postLLM({
    provider,
    apiKey,
    model,
    baseUrl,
    system,
    user: JSON.stringify({ request, messages }),
    preferJson: true
  });
  if (!llm.usedAI) return llm;
  const parsed = safeParseJson(extractOutputText(llm.payload));
  if (!parsed || typeof parsed !== "object") {
    throw Object.assign(new Error("LLM preference summary returned invalid JSON."), {
      code: "llm_bad_response",
      status: 502
    });
  }
  return {
    usedAI: true,
    provider: llm.provider,
    preferences: normalizePreferencePayload(parsed)
  };
}

export async function summarizeShoppingPreferencesWithAI({
  apiKey,
  provider,
  baseUrl,
  model = "qwen2.5:7b",
  messages,
  request = {},
  weaponIndex = []
}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { usedAI: false, reason: "missing_messages" };
  }
  const system = [
    "You extract CS2 skin shopping-list recommendations from Chinese or English chat.",
    "Return valid JSON only with: budget, color, style, styles, requestedItems, preferredItems, allWeapons, fullLoadout, weaponPreferences, mustInclude, excludeSlots, excludeWeapons, preferredWears, rarities, specificTerms, budgetMode.",
    "requestedItems is an array like {\"weapon\":\"AUG\",\"quantity\":1,\"constraints\":{\"style\":\"blue clean\",\"rarities\":[\"Classified\"]}}. Allow repeated quantities, e.g. 两把AK => quantity 2.",
    "preferredItems is an array like {\"slot\":\"glove\",\"query\":\"Vice\"}. Map aliases: 迈阿密手套/Miami/Vice -> glove Vice; 潘多拉 -> glove Pandora; 超导 -> glove Superconductor; 多普勒 -> knife Doppler; 火神AK -> ak-47 Vulcan.",
    "allWeapons=true only when the user asks every weapon / all guns / 每个武器 / 全武器. fullLoadout=true for 一整套 / full loadout, but not all weapons.",
    "Use excludeSlots knife/glove for 不要刀 / 不要手套 / 只要枪皮. Use preferred wear ids factory-new, minimal-wear, field-tested, well-worn, battle-scarred.",
    "Use weapon names from the provided weaponIndex when possible. Do not invent budget. Return JSON only."
  ].join("\n");
  const llm = await postLLM({
    provider,
    apiKey,
    model,
    baseUrl,
    system,
    user: JSON.stringify({
      request,
      messages,
      weaponIndex: (Array.isArray(weaponIndex) ? weaponIndex : []).map((entry) => ({
        weapon: entry.weapon,
        label: entry.label,
        group: entry.group,
        aliases: (entry.aliases || []).slice(0, 8)
      }))
    }),
    preferJson: true
  });
  if (!llm.usedAI) return llm;
  const parsed = safeParseJson(extractOutputText(llm.payload));
  if (!parsed || typeof parsed !== "object") {
    throw Object.assign(new Error("LLM shopping preference summary returned invalid JSON."), {
      code: "llm_bad_response",
      status: 502
    });
  }
  return {
    usedAI: true,
    provider: llm.provider,
    preferences: normalizeShoppingPreferencePayload(parsed)
  };
}

export async function rerankLoadoutsWithAI({
  apiKey,
  provider,
  baseUrl,
  model = "gpt-5.5",
  request,
  loadouts
}) {
  if (!Array.isArray(loadouts) || loadouts.length === 0) {
    return { usedAI: false, reason: "missing_candidates" };
  }

  const system = [
    "You are a CS2 skin loadout advisor.",
    "Choose the candidate loadout that best matches the user request.",
    "Hard constraints: never exceed budget; respect excluded slots; respect requested knife/glove choices; respect conservative budget mode when present.",
    "Return only JSON: {\"chosenIndex\": number, \"summary\": string, \"notes\": [string, ...]}."
  ].join("\n");
  const user = JSON.stringify({
    userRequest: {
      budget: request.budget,
      style: request.style || "",
      color: request.color || "",
      styles: request.styles || [],
      preferredWears: request.preferredWears || [],
      budgetMode: request.budgetMode || "",
      weaponPreferences: request.weaponPreferences || [],
      extraWeapons: request.extraWeapons || [],
      mustInclude: request.mustInclude || [],
      excludeSlots: request.excludeSlots || [],
      preferredItems: request.preferredItems || []
    },
    candidates: loadouts.map((loadout, index) => ({
      index,
      title: loadout.title,
      totalPrice: loadout.totalPrice,
      budgetUsage: loadout.budgetUsage,
      itemCount: loadout.itemCount,
      items: loadout.items.map((item) => ({
        slot: item.slot,
        nameEn: item.nameEn,
        wearLabel: item.wearLabel,
        price: item.price
      }))
    }))
  });

  const llm = await postLLM({ provider, apiKey, model, baseUrl, system, user, preferJson: true });
  if (!llm.usedAI) return llm;
  const parsed = safeParseJson(extractOutputText(llm.payload));
  if (!parsed || typeof parsed.chosenIndex !== "number") {
    throw Object.assign(new Error("LLM rerank returned invalid JSON."), {
      code: "llm_bad_response",
      status: 502
    });
  }

  return {
    usedAI: true,
    provider: llm.provider,
    chosenIndex: parsed.chosenIndex,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    notes: Array.isArray(parsed.notes) ? parsed.notes.filter((item) => typeof item === "string") : []
  };
}
