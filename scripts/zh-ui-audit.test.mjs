import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

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

function loadOverrides() {
  const context = {};
  vm.createContext(context);
  const source = `${extractConstObjectSource(appSource, "ZH_CN_UI_OVERRIDES")}; result = ZH_CN_UI_OVERRIDES;`;
  return vm.runInContext(source, context);
}

function collectSuspiciousUiTextKeys() {
  const regex = /uiText\("((?:\\.|[^"\\])*)",\s*"((?:\\.|[^"\\])*)"\)/g;
  const keys = new Set();
  for (const match of appSource.matchAll(regex)) {
    const en = match[1];
    const zh = match[2];
    if (/[鍔鏌閸濮绗熸瘮瑙嗗櫒寮€绠辫瘑鎮犳偁鏈夊搧搴撳瓨璐﹀彿]/.test(zh) || zh.includes("?????")) {
      keys.add(en);
    }
  }
  return [...keys];
}

test("suspicious zh-CN uiText fallbacks are covered by explicit override copy", () => {
  const overrides = loadOverrides();
  const suspiciousKeys = collectSuspiciousUiTextKeys();
  const uncovered = suspiciousKeys.filter((key) => !(key in overrides));
  assert.deepEqual(uncovered, []);
});
