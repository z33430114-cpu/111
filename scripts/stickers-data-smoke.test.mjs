import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

test("stickers-data.js exposes a lightweight sticker dataset", async () => {
  const source = await readFile(join(process.cwd(), "stickers-data.js"), "utf8");
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "stickers-data.js" });
  const stickers = context.globalThis.CS2_STICKERS;
  assert.ok(Array.isArray(stickers));
  assert.ok(stickers.length > 1000);
  assert.deepEqual(Object.keys(stickers[0]).sort(), ["collection", "collectionEn", "collectionZh", "id", "image", "name", "nameEn", "nameZh"]);
});
