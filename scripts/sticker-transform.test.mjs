import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

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

function buildContext() {
  const context = {};
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "clampNumber")}
    ${extractFunctionSource(appSource, "defaultStickerTransforms")}
    ${extractFunctionSource(appSource, "normalizeStickerTransforms")}
    ${extractFunctionSource(appSource, "updateStickerTransformEntry")}
    ${extractFunctionSource(appSource, "serializeStickerNodes")}
  `;
  vm.runInContext(source, context);
  return context;
}

test("defaultStickerTransforms returns the current four-slot baseline", () => {
  const context = buildContext();
  const result = context.defaultStickerTransforms(4);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { x: 18, y: 30, scale: 1, rotate: -10 },
    { x: 52, y: 22, scale: 1, rotate: 8 },
    { x: 64, y: 52, scale: 1, rotate: -6 },
    { x: 28, y: 58, scale: 1, rotate: 12 }
  ]);
});

test("normalizeStickerTransforms fills missing entries from defaults", () => {
  const context = buildContext();
  const result = context.normalizeStickerTransforms([{ x: 40, y: 24, scale: 1.2, rotate: 14 }], 3);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { x: 40, y: 24, scale: 1.2, rotate: 14 },
    { x: 52, y: 22, scale: 1, rotate: 8 },
    { x: 64, y: 52, scale: 1, rotate: -6 }
  ]);
});

test("updateStickerTransformEntry preserves untouched fields and clamps scale", () => {
  const context = buildContext();
  const result = context.updateStickerTransformEntry(
    [
      { x: 18, y: 30, scale: 1, rotate: -10 },
      { x: 52, y: 22, scale: 1, rotate: 8 }
    ],
    1,
    { y: 44, scale: 99 }
  );
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { x: 18, y: 30, scale: 1, rotate: -10 },
    { x: 52, y: 44, scale: 2.5, rotate: 8 }
  ]);
});

test("serializeStickerNodes emits favorite-ready sticker payloads", () => {
  const context = buildContext();
  const result = context.serializeStickerNodes([
    {
      getAttribute(name) {
        return ({
          src: "https://example.com/sticker-a.png",
          alt: "Sticker A"
        })[name] || "";
      },
      dataset: {
        stickerId: "sticker-77",
        stickerX: "41.5",
        stickerY: "26",
        stickerScale: "1.35",
        stickerRotate: "-18"
      }
    }
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { id: "sticker-77", image: "https://example.com/sticker-a.png", name: "Sticker A", x: 41.5, y: 26, scale: 1.35, rotate: -18 }
  ]);
});
