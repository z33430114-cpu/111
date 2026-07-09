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

test("sticker picker return href preserves the active inspector state", () => {
  const context = { URLSearchParams };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "normalizedStickerSelectionIds")}
    ${extractFunctionSource(appSource, "mergedStickerSelectionIds")}
    ${extractFunctionSource(appSource, "itemStickerPickerReturnHref")}
    result = itemStickerPickerReturnHref(
      { id: "skin-a" },
      {
        wearId: "factory-new",
        variantId: "stattrak",
        templateId: "phase-2",
        stickerIds: ["sticker-1", "sticker-2"]
      }
    );
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result, "item.html?id=skin-a&wear=factory-new&variant=stattrak&template=phase-2&stickers=sticker-1%2Csticker-2");
});

test("sticker selection href sends the chosen sticker back into the inspector", () => {
  const context = { URL };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "stickerSelectionHref")}
    result = stickerSelectionHref(
      { id: "sticker-9" },
      "item.html?id=skin-a&wear=factory-new&stickers=sticker-1%2Csticker-2"
    );
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result, "item.html?id=skin-a&wear=factory-new&stickers=sticker-1%2Csticker-2&stickerPick=sticker-9");
});

test("sticker picker href targets the dedicated stickers page", () => {
  const context = { URLSearchParams };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "normalizedStickerSelectionIds")}
    ${extractFunctionSource(appSource, "itemStickerPickerReturnHref")}
    ${extractFunctionSource(appSource, "stickerCatalogHref")}
    result = stickerCatalogHref(
      { id: "skin-a" },
      { wearId: "factory-new", stickerIds: ["sticker-1"] }
    );
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result, "stickers.html?stickerReturn=item.html%3Fid%3Dskin-a%26wear%3Dfactory-new%26stickers%3Dsticker-1");
});

test("mergedStickerSelectionIds deduplicates picks and caps the visible plan at four stickers", () => {
  const context = {};
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "normalizedStickerSelectionIds")}
    ${extractFunctionSource(appSource, "mergedStickerSelectionIds")}
    result = {
      deduped: mergedStickerSelectionIds(["sticker-1", "sticker-2"], "sticker-2"),
      appended: mergedStickerSelectionIds(["sticker-1", "sticker-2"], "sticker-3"),
      capped: mergedStickerSelectionIds(["sticker-1", "sticker-2", "sticker-3", "sticker-4"], "sticker-5")
    };
  `;
  const result = vm.runInContext(source, context);
  assert.deepEqual(Array.from(result.deduped), ["sticker-1", "sticker-2"]);
  assert.deepEqual(Array.from(result.appended), ["sticker-1", "sticker-2", "sticker-3"]);
  assert.deepEqual(Array.from(result.capped), ["sticker-1", "sticker-2", "sticker-3", "sticker-4"]);
});

test("handleFavoriteAction also saves the active inspector sticker layout", async () => {
  const context = {
    document: {
      querySelectorAll(selector) {
        return selector === "#freeStickerOverlay [data-sticker-index]" ? [{}, {}] : [];
      }
    },
    pageName() {
      return "item.html";
    },
    location: { search: "?id=skin-a" },
    URLSearchParams,
    DEFAULT_DETAIL_ALIAS: "ak-inheritance",
    toggled: [],
    savedCount: 0
  };
  context.toggleFavorite = (id) => {
    context.toggled.push(id);
  };
  context.saveCurrentDiyDesign = () => {
    context.savedCount += 1;
    return Promise.resolve({ ok: true });
  };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "handleFavoriteAction")}
    result = (async () => handleFavoriteAction("skin-a"))();
  `;
  await vm.runInContext(source, context);
  assert.deepEqual(Array.from(context.toggled), ["skin-a"]);
  assert.equal(context.savedCount, 1);
});

test("diyDesignInspectHref links a saved sticker scheme back into the inspector", () => {
  const context = { URLSearchParams };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "diyDesignInspectHref")}
    result = diyDesignInspectHref({
      id: "skin-a-123",
      baseItemId: "skin-a"
    });
  `;
  const result = vm.runInContext(source, context);
  assert.equal(result, "item.html?id=skin-a&diyDesign=skin-a-123");
});

test("removeDiyDesign deletes only the selected saved sticker scheme", () => {
  const context = {
    savedDesigns: [
      { id: "design-a", baseItemId: "skin-a" },
      { id: "design-b", baseItemId: "skin-b" }
    ],
    renderCount: 0
  };
  context.getDiyDesigns = () => context.savedDesigns;
  context.setDiyDesigns = (next) => {
    context.savedDesigns = Array.from(next);
  };
  context.renderFavorites = () => {
    context.renderCount += 1;
  };
  vm.createContext(context);
  const source = `
    ${extractFunctionSource(appSource, "removeDiyDesign")}
    result = removeDiyDesign("design-a");
  `;
  vm.runInContext(source, context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.savedDesigns)), [
    { id: "design-b", baseItemId: "skin-b" }
  ]);
  assert.equal(context.renderCount, 1);
});
