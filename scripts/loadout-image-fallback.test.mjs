import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const serveSource = await readFile(join(process.cwd(), "scripts/serve.mjs"), "utf8");

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.indexOf(marker);
  if (start === -1) {
    throw new Error(`Unable to find ${name}`);
  }
  const paramsStart = sourceText.indexOf("(", start + marker.length);
  if (paramsStart === -1) {
    throw new Error(`Unable to find params for ${name}`);
  }
  let parenDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "(") parenDepth += 1;
    if (char === ")") {
      parenDepth -= 1;
      if (parenDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  const bodyStart = paramsEnd === -1 ? -1 : sourceText.indexOf("{", paramsEnd);
  if (bodyStart === -1) {
    throw new Error(`Unable to find body for ${name}`);
  }
  let depth = 0;
  for (let index = bodyStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1).trim();
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

function buildAppFunction(name, overrides = {}, dependencies = []) {
  const context = {
    escapeHtml: (value) => String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;"),
    uiText: (en, zh) => zh || en,
    uiTemplate: (template, values = {}) => String(template || "").replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? "")),
    formatPrice: (value) => `CNY ${Number(value || 0).toFixed(2)}`,
    itemTitle: (item) => item?.title || item?.name || "",
    itemWeapon: (item) => item?.weapon || "",
    localizedCatalogDisplayName: (name) => String(name || ""),
    localizedWeaponName: (name) => String(name || ""),
    categoryLabel: (value) => String(value || ""),
    wearLabel: (value) => String(value || ""),
    lazyImageMarkup: ({ src = "", alt = "" } = {}) => `<img src="${src}" alt="${alt}" />`,
    resolveDisplayItemById: () => null,
    resolveDisplayItemByName: () => null,
    LOADOUT_ZH: {
      proLoading: "正在加载职业搭配...",
      proTitle: "职业选手搭配",
      proUnavailable: "职业选手搭配暂时不可用。",
      loadMoreTeams: "加载更多战队"
    },
    LOADOUT_CACHE_MAX_TEAMS: 18,
    PRO_LOADOUT_TEAM_PAGE_SIZE: 6,
    appState: {},
    ...overrides
  };
  vm.createContext(context);
  const dependencySource = dependencies.map((dependency) => extractFunctionSource(appSource, dependency)).join("\n");
  const source = `${dependencySource}\n${extractFunctionSource(appSource, name)};\nresult = ${name};`;
  return vm.runInContext(source, context);
}

function buildServeFunction(name, overrides = {}) {
  const context = {
    ...overrides
  };
  vm.createContext(context);
  const source = `${extractFunctionSource(serveSource, "normalizeEnglishName")};\n${extractFunctionSource(serveSource, "slugify")};\n${extractFunctionSource(serveSource, "resolveCatalogItemByName")};\n${extractFunctionSource(serveSource, name)};\nresult = ${name};`;
  return vm.runInContext(source, context);
}

test("aiSuggestionCardMarkup falls back to API image when catalog item is unresolved", () => {
  const aiSuggestionCardMarkup = buildAppFunction("aiSuggestionCardMarkup");
  const markup = aiSuggestionCardMarkup({
    id: "missing-item",
    name: "Butterfly Knife | Doppler",
    weapon: "Knife",
    image: "https://example.com/fallback.png",
    price: 1234,
    family: "blue",
    wearId: "factory-new"
  });

  assert.match(markup, /fallback\.png/);
  assert.match(markup, /<img /);
});

test("proLoadoutItemMarkup falls back to entry image when catalog item is unresolved", () => {
  const imageCalls = [];
  const proLoadoutItemMarkup = buildAppFunction("proLoadoutItemMarkup");
  const markup = proLoadoutItemMarkup({
    itemId: "missing-item",
    name: "Butterfly Knife | Doppler",
    image: "https://example.com/pro-fallback.png"
  }, "Knife");

  assert.match(markup, /pro-fallback\.png/);
  assert.match(markup, /<img /);
});

test("proLoadoutItemMarkup requests direct eager images for visible skin cards", () => {
  const imageCalls = [];
  const proLoadoutItemMarkup = buildAppFunction("proLoadoutItemMarkup", {
    lazyImageMarkup: (options = {}) => {
      imageCalls.push(options);
      return `<img src="${options.src}" loading="${options.loading}" />`;
    }
  });

  proLoadoutItemMarkup({
    itemId: "missing-item",
    name: "AK-47 | Redline",
    image: "https://example.com/redline.png"
  }, "Guns");

  assert.equal(imageCalls[0].loading, "eager");
  assert.equal(imageCalls[0].src, "https://example.com/redline.png");
});

test("aiProLoadoutsMarkup renders local-toggle bodies and readable Chinese labels", () => {
  const aiProLoadoutsMarkup = buildAppFunction("aiProLoadoutsMarkup", {
    appState: {
      aiProLoadoutsLoading: false,
      aiProTeamsRenderedCount: 6,
      activeProPlayerKey: "Team Alpha::One",
      aiProLoadouts: {
        ok: true,
        teams: [{
          team: "Team Alpha",
          logo: "",
          sourceUrl: "#",
          players: [
            {
              name: "One",
              avatar: "",
              knife: [{ itemId: "", name: "Knife | Fade", image: "https://example.com/knife.png" }],
              gloves: [{ itemId: "", name: "Gloves | Fade", image: "https://example.com/gloves.png" }],
              guns: [{ itemId: "", name: "AK-47 | Redline", image: "https://example.com/ak.png" }]
            },
            {
              name: "Two",
              avatar: "",
              knife: [],
              gloves: [],
              guns: [{ itemId: "", name: "M4A1-S | Cyrex", image: "https://example.com/m4.png" }]
            }
          ]
        }]
      }
    }
  }, ["normalizeProIdentity", "proTeamKey", "proVisualFallbackUrl", "proImageMarkup", "proAvatarMarkup", "proTeamLogoMarkup", "proLoadoutItemMarkup", "proLoadoutGroupMarkup", "proPlayerKey", "proPlayerLoadoutMarkup"]);

  const markup = aiProLoadoutsMarkup();
  assert.match(markup, /data-pro-team="teamalpha"/);
  assert.match(markup, /curator-pro-team-card/);
  assert.match(markup, /pro-team-logo/);

  assert.match(markup, /职业选手搭配/);
  assert.match(markup, /按战队/);
  assert.match(markup, /来源/);
  assert.match(markup, /刀/);
  assert.match(markup, /手套/);
  assert.match(markup, /枪/);
  assert.match(markup, /data-pro-player-loadout="Team Alpha::One"/);
  assert.match(markup, /data-pro-player-loadout="Team Alpha::Two" hidden/);
  assert.doesNotMatch(markup, /[閸閹濮鏉]/);
});

test("preserveWindowScrollDuringRender restores scroll after loadout rerender", () => {
  const scrollCalls = [];
  const preserveWindowScrollDuringRender = buildAppFunction("preserveWindowScrollDuringRender", {
    window: {
      scrollY: 840,
      pageYOffset: 840,
      scrollTo: (...args) => scrollCalls.push(args)
    }
  });

  let rendered = false;
  preserveWindowScrollDuringRender(() => {
    rendered = true;
  });

  assert.equal(rendered, true);
  assert.deepEqual(scrollCalls, [[0, 840]]);
});

test("preserveElementViewportDuringRender keeps clicked player button anchored", () => {
  const scrollCalls = [];
  let top = 320;
  const preserveElementViewportDuringRender = buildAppFunction("preserveElementViewportDuringRender", {
    window: {
      scrollX: 0,
      pageXOffset: 0,
      scrollY: 1200,
      pageYOffset: 1200,
      scrollTo: (...args) => scrollCalls.push(args)
    }
  });
  const element = {
    getBoundingClientRect: () => ({ top })
  };

  preserveElementViewportDuringRender(element, () => {
    top = 90;
  });

  assert.deepEqual(scrollCalls, [[0, 970]]);
});

test("sanitizeAiProLoadoutsCache preserves entry images for cached pro loadouts", () => {
  const sanitizeAiProLoadoutsCache = buildAppFunction("sanitizeAiProLoadoutsCache");
  const payload = sanitizeAiProLoadoutsCache({
    teams: [{
      team: "Team",
      logo: "",
      sourceUrl: "",
      players: [{
        name: "Player",
        avatar: "",
        knife: [{ itemId: "knife", name: "Knife", image: "https://example.com/knife.png" }],
        gloves: [{ itemId: "glove", name: "Glove", image: "https://example.com/glove.png" }],
        guns: [{ itemId: "gun", name: "Gun", image: "https://example.com/gun.png" }]
      }]
    }]
  });

  assert.equal(payload.teams[0].players[0].knife[0].image, "https://example.com/knife.png");
  assert.equal(payload.teams[0].players[0].gloves[0].image, "https://example.com/glove.png");
  assert.equal(payload.teams[0].players[0].guns[0].image, "https://example.com/gun.png");
});

test("sanitizeAiLoadoutChatPayload preserves images from legacy suggestion payloads", () => {
  const sanitizeAiLoadoutChatPayload = buildAppFunction("sanitizeAiLoadoutChatPayload");
  const payload = sanitizeAiLoadoutChatPayload({
    suggestions: [{
      id: "skin",
      name: "AK-47 | Redline",
      weapon: "AK-47",
      image: "https://example.com/redline.png"
    }]
  });

  assert.equal(payload.suggestions[0].image, "https://example.com/redline.png");
});

test("normalizeProLoadoutEntries resolves catalog image from named pro loadout items", () => {
  const normalizeProLoadoutEntries = buildServeFunction("normalizeProLoadoutEntries");
  const entries = normalizeProLoadoutEntries([
    "Karambit | Doppler (Ruby)",
    "M9 Bayonet | Doppler (Phase 2)"
  ], [
    { id: "karambit-doppler", nameEn: "Karambit | Doppler", nameZh: "爪子刀（★） | 多普勒", image: "https://example.com/karambit.png" },
    { id: "m9-doppler", nameEn: "M9 Bayonet | Doppler", nameZh: "M9 刺刀（★） | 多普勒", image: "https://example.com/m9.png" }
  ]);

  assert.equal(entries[0].itemId, "karambit-doppler");
  assert.equal(entries[0].image, "https://example.com/karambit.png");
  assert.equal(entries[1].itemId, "m9-doppler");
  assert.equal(entries[1].image, "https://example.com/m9.png");
});

test("normalizeProLoadoutEntries resolves pro loadout names with loose phase suffixes", () => {
  const normalizeProLoadoutEntries = buildServeFunction("normalizeProLoadoutEntries");
  const entries = normalizeProLoadoutEntries([
    "Butterfly Knife | Doppler Emerald"
  ], [
    { id: "butterfly-doppler", nameEn: "Butterfly Knife | Doppler", image: "https://example.com/butterfly.png" }
  ]);

  assert.equal(entries[0].itemId, "butterfly-doppler");
  assert.equal(entries[0].image, "https://example.com/butterfly.png");
});

test("normalizeProLoadoutEntries resolves names that omit catalog diacritics", () => {
  const normalizeProLoadoutEntries = buildServeFunction("normalizeProLoadoutEntries");
  const entries = normalizeProLoadoutEntries([
    "Desert Eagle | Emerald Jormungandr"
  ], [
    { id: "deagle-jormungandr", nameEn: "Desert Eagle | Emerald Jörmungandr", image: "https://example.com/deagle.png" }
  ]);

  assert.equal(entries[0].itemId, "deagle-jormungandr");
  assert.equal(entries[0].image, "https://example.com/deagle.png");
});
