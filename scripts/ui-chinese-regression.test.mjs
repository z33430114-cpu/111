import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

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

test("uiText uses clean zh-CN overrides for visible site copy", () => {
  const context = {
    runtimeUiText: null,
    currentLanguage: () => "zh-CN"
  };
  vm.createContext(context);
  const source = `
    ${extractConstObjectSource(appSource, "ZH_CN_UI_OVERRIDES")}
    ${extractFunctionSource(appSource, "looksLikeMojibake")}
    ${extractFunctionSource(appSource, "uiText")}
    result = {
      interactiveUnbox: uiText("Interactive Unbox", "broken"),
      openThisCase: uiText("Open This Case", "broken"),
      accountCenter: uiText("Account Center", "broken"),
      inventoryGallery: uiText("Inventory Gallery", "broken"),
      loadoutStudio: uiText("AI Loadout Studio", "broken")
    };
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result.interactiveUnbox, "互动开箱");
  assert.equal(result.openThisCase, "开启这个箱子");
  assert.equal(result.accountCenter, "账号中心");
  assert.equal(result.inventoryGallery, "库存展厅");
  assert.equal(result.loadoutStudio, "AI 饰品搭配工作室");
});

test("inspector labels use clean zh-CN overrides for controls and price hints", () => {
  const context = {
    runtimeUiText: null,
    currentLanguage: () => "zh-CN"
  };
  vm.createContext(context);
  const source = `
    ${extractConstObjectSource(appSource, "ZH_CN_UI_OVERRIDES")}
    ${extractFunctionSource(appSource, "looksLikeMojibake")}
    ${extractFunctionSource(appSource, "uiText")}
    result = {
      version: uiText("Version", "broken"),
      specialTemplate: uiText("Special Template", "broken"),
      reference: uiText("Reference", "broken"),
      checkingWearPrice: uiText("Checking the selected wear tier price.", "broken")
    };
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result.version, "版本");
  assert.equal(result.specialTemplate, "特殊模板");
  assert.equal(result.reference, "参考价");
  assert.equal(result.checkingWearPrice, "正在检查所选磨损等级价格。");
});

test("itemVariantLabel returns clean zh-CN labels for inspector version choices", () => {
  const context = {
    currentLanguage: () => "zh-CN"
  };
  vm.createContext(context);
  const source = `
    ${extractConstObjectSource(appSource, "ITEM_VARIANTS")}
    ${extractFunctionSource(appSource, "localizedTerm")}
    ${extractFunctionSource(appSource, "itemVariantLabel")}
    result = {
      standard: itemVariantLabel("standard"),
      stattrak: itemVariantLabel("stattrak"),
      souvenir: itemVariantLabel("souvenir")
    };
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result.standard, "标准");
  assert.equal(result.stattrak, "StatTrak");
  assert.equal(result.souvenir, "纪念品");
});

test("firstSaleLabel formats the date instead of leaking a placeholder", () => {
  const context = {
    currentLanguage: () => "zh-CN"
  };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "firstSaleLabel")}
    result = firstSaleLabel("2013-08-14");
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result, "首次发售：2013-08-14");
  assert.doesNotMatch(result, /\{dateText\}/);
});
