import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const BAD_TEXT = /\?{3,}|甯傚満|娴佸姩|鎼滅储|閹|濮|娑|鐎|绛|棰|闂|婵|灞犲か|鍥|鈧|锟|�/;

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

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
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

function evaluateChineseResult(body) {
  const context = {
    runtimeUiText: null,
    currentLanguage: () => "zh-CN"
  };
  vm.createContext(context);
  return vm.runInContext(`
    ${extractConstObjectSource(appSource, "ZH_CN_UI_OVERRIDES")}
    ${extractConstObjectSource(appSource, "ITEM_VARIANTS")}
    ${extractFunctionSource(appSource, "looksLikeMojibake")}
    ${extractFunctionSource(appSource, "uiText")}
    ${extractFunctionSource(appSource, "localizedTerm")}
    ${extractFunctionSource(appSource, "itemVariantLabel")}
    ${extractFunctionSource(appSource, "firstSaleLabel")}
    ${body}
  `, context);
}

function assertCleanValues(values) {
  Object.values(values).forEach((value) => {
    assert.doesNotMatch(String(value), BAD_TEXT);
  });
}

test("uiText returns clean zh-CN overrides for visible site copy", () => {
  const result = evaluateChineseResult(`
    result = {
      interactiveUnbox: uiText("Interactive Unbox", "broken"),
      openThisCase: uiText("Open This Case", "broken"),
      accountCenter: uiText("Account Center", "broken"),
      inventoryGallery: uiText("Inventory Gallery", "broken"),
      loadoutStudio: uiText("AI Loadout Studio", "broken")
    };
  `);

  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    interactiveUnbox: "互动开箱",
    openThisCase: "开启这个箱子",
    accountCenter: "账号中心",
    inventoryGallery: "库存展厅",
    loadoutStudio: "AI 饰品搭配工作室"
  });
  assertCleanValues(result);
});

test("inspector labels use clean zh-CN overrides for controls and price hints", () => {
  const result = evaluateChineseResult(`
    result = {
      version: uiText("Version", "broken"),
      specialTemplate: uiText("Special Template", "broken"),
      reference: uiText("Reference", "broken"),
      checkingWearPrice: uiText("Checking the selected wear tier price.", "broken")
    };
  `);

  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    version: "版本",
    specialTemplate: "特殊模板",
    reference: "参考价",
    checkingWearPrice: "正在检查所选磨损等级价格。"
  });
  assertCleanValues(result);
});

test("itemVariantLabel returns clean zh-CN labels for inspector version choices", () => {
  const result = evaluateChineseResult(`
    result = {
      standard: itemVariantLabel("standard"),
      stattrak: itemVariantLabel("stattrak"),
      souvenir: itemVariantLabel("souvenir")
    };
  `);

  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    standard: "标准",
    stattrak: "StatTrak",
    souvenir: "纪念品"
  });
  assertCleanValues(result);
});

test("firstSaleLabel formats the date instead of leaking a placeholder", () => {
  const result = evaluateChineseResult(`
    result = { firstSale: firstSaleLabel("2013-08-14") };
  `);

  assert.equal(result.firstSale, "首次发售：2013-08-14");
  assert.doesNotMatch(result.firstSale, /\{dateText\}/);
  assertCleanValues(result);
});
