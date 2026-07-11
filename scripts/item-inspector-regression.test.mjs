import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const itemHtmlSource = await readFile(join(process.cwd(), "item.html"), "utf8");

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.indexOf(marker);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start + marker.length);
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
  const bodyStart = sourceText.indexOf("{", paramsEnd);
  let depth = 0;
  for (let index = bodyStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

function extractConstObjectSource(sourceText, name) {
  const marker = `const ${name} = {`;
  const start = sourceText.indexOf(marker);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const bodyStart = sourceText.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

test("aiItemAnalysisMarkup renders localized zh-CN market-read copy", () => {
  const context = {
    appState: {
      aiItemAnalyses: {
        "skin-a::standard::factory-new": {
          ok: true,
          liquidity: "high",
          bestSellingWear: { wearId: "factory-new", label: "Factory New" },
          history: { trend: "up" },
          insights: [
            "Factory New is currently the most active wear tier in the local snapshot.",
            "Current references are tightly clustered, so price discovery looks stable.",
            "Multiple listings are active, so this item should be easier to move without waiting too long."
          ]
        }
      }
    },
    currentLanguage: () => "zh-CN",
    livePriceKey: (itemId, wearId = "", variantId = "standard") => `${String(itemId || "").trim()}::${String(variantId || "standard").trim()}::${String(wearId || "").trim()}`,
    escapeHtml: (value) => String(value ?? ""),
    uiText: (en, zh) => zh || en,
    wearLabel: (wearId) => ({ "factory-new": "崭新出厂" }[wearId] || wearId)
  };
  vm.createContext(context);
  const markup = vm.runInContext(`
    ${extractConstObjectSource(appSource, "WEAR_TEXT")}
    ${extractFunctionSource(appSource, "looksLikeMojibake")}
    ${extractFunctionSource(appSource, "cleanVisibleText")}
    ${extractFunctionSource(appSource, "cleanVisibleList")}
    ${extractFunctionSource(appSource, "wearIdFromAiLabel")}
    ${extractFunctionSource(appSource, "localizeAiWearLabel")}
    ${extractFunctionSource(appSource, "localizeAiLiquidity")}
    ${extractFunctionSource(appSource, "localizeAiTrend")}
    ${extractFunctionSource(appSource, "localizeAiInsight")}
    ${extractFunctionSource(appSource, "localizeAiInsights")}
    ${extractFunctionSource(appSource, "aiItemAnalysisMarkup")}
    result = aiItemAnalysisMarkup({ id: "skin-a" }, "factory-new", "standard");
  `, context);

  assert.match(markup, /流动性/);
  assert.match(markup, /高/);
  assert.match(markup, /7 天趋势/);
  assert.match(markup, /上涨/);
  assert.match(markup, /崭新出厂当前是本地快照里最活跃的磨损档位。/);
  assert.match(markup, /当前多端参考价比较集中，价格发现相对稳定。/);
  assert.match(markup, /当前在售挂单较多，出手时通常不用等待太久。/);
  assert.doesNotMatch(markup, /Factory New is currently|Current references are tightly clustered|Multiple listings are active|high/);
});

test("renderItemDetail notifies the sticker DIY rebuild hook after inspector rerenders", () => {
  const renderItemDetailSource = extractFunctionSource(appSource, "renderItemDetail");
  assert.match(renderItemDetailSource, /__rebuildStickerViewer/);
});

test("syncInspectorSelectionParams keeps the URL wear in step with inspector selection", () => {
  const context = {
    location: {
      pathname: "/item.html",
      search: "?id=skin-a&wear=factory-new&variant=standard&template=phase-1"
    },
    history: {
      replacedUrl: "",
      replaceState: (_state, _title, url) => {
        context.history.replacedUrl = url;
      }
    },
    URLSearchParams
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(appSource, "syncInspectorSelectionParams")};`, context);

  context.syncInspectorSelectionParams({ wearId: "field-tested", variantId: "stattrak" });

  const updatedUrl = new URL(context.history.replacedUrl, "http://127.0.0.1");
  assert.equal(updatedUrl.pathname, "/item.html");
  assert.equal(updatedUrl.searchParams.get("id"), "skin-a");
  assert.equal(updatedUrl.searchParams.get("wear"), "field-tested");
  assert.equal(updatedUrl.searchParams.get("variant"), "stattrak");
  assert.equal(updatedUrl.searchParams.get("template"), "phase-1");
});

test("item inspector uses a fresh app bundle after image proxy changes", () => {
  assert.match(itemHtmlSource, /app\.js\?v=20260711inspectimage1/);
});
