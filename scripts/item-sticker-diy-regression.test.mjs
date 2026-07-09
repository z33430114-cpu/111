import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const overridesSource = await readFile(join(process.cwd(), "app-overrides.js"), "utf8");

function extractConstNumberSource(sourceText, name) {
  const match = sourceText.match(new RegExp(`const ${name} = (\\d+);`));
  if (!match) throw new Error(`Unable to find ${name}`);
  return `const ${name} = ${match[1]};`;
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

test("stickerPool falls back to CS2_STICKERS when the main catalog has no sticker entries", () => {
  const context = {
    state: { stickers: [], activeStickerId: "" },
    globalThis: {
      items: [],
      CS2_STICKERS: [
        {
          id: "sticker-1",
          name: "印花 | 测试",
          nameZh: "印花 | 测试",
          nameEn: "Sticker | Test",
          collectionZh: "测试系列",
          collectionEn: "Test Collection",
          image: "https://example.com/sticker.png"
        }
      ],
      getCurrentLanguage: () => "zh-CN"
    },
    text: (en, zh) => zh || en,
    $: () => null
  };
  vm.createContext(context);
  const result = vm.runInContext(`
    ${extractConstNumberSource(overridesSource, "STICKER_LIMIT")}
    ${extractFunctionSource(overridesSource, "stickerLabel")}
    ${extractFunctionSource(overridesSource, "stickerDataset")}
    ${extractFunctionSource(overridesSource, "stickerPool")}
    result = stickerPool();
  `, context);

  assert.equal(Array.isArray(result), true);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "sticker-1");
  assert.equal(context.state.activeStickerId, "sticker-1");
});
