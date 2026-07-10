import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.lastIndexOf(marker);
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
      if (depth === 0) return sourceText.slice(start, index + 1).trim();
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

test("favorites page renders the new exhibition shell while reusing saved-item and DIY content", () => {
  const root = { innerHTML: "" };
  const items = new Map([
    ["ak-inheritance", { id: "ak-inheritance", name: "AK-47 | Legacy" }],
    ["knife-fade", { id: "knife-fade", name: "Karambit | Fade" }]
  ]);
  const context = {
    document: {
      getElementById(id) {
        return id === "favoritesRoot" ? root : null;
      }
    },
    escapeHtml: (value) => String(value),
    uiText: (en, zh) => zh || en,
    uiTemplate: (template, values) => template.replace("{count}", String(values.count)),
    catalogDataAvailable: () => true,
    getUserState: () => ({
      favorites: ["ak-inheritance", "knife-fade"],
      compare: ["ak-inheritance"]
    }),
    resolveDisplayItemById: (id) => items.get(id) || null,
    DEFAULT_DETAIL_ALIAS: "ak-inheritance",
    URLSearchParams,
    effectiveCatalogPriceRecord: () => ({ price: 882 }),
    formatPrice: (value) => `$${value}`,
    collectionLabel: () => "Gallery Collection",
    itemTitle: (item) => item.name,
    favoriteCardMarkup: (item) => `<article class="favorite-card" data-item-id="${item.id}">${item.name}</article>`,
    getDiyDesigns: () => [
      { id: "design-1", baseName: "AK-47 | Legacy", createdAt: "2026-07-09T10:00:00.000Z", stickers: [{}, {}] }
    ]
  };

  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, "diyDesignInspectHref")}\n${extractFunctionSource(appSource, "renderFavorites")};\nrenderFavorites();`;
  vm.runInContext(source, context);

  assert.match(root.innerHTML, /class="favorites-shell"/);
  assert.match(root.innerHTML, /class="favorites-hero"/);
  assert.match(root.innerHTML, /class="favorites-stats-grid"/);
  assert.match(root.innerHTML, /class="favorites-toolbar"/);
  assert.match(root.innerHTML, /class="favorites-spotlight"/);
  assert.match(root.innerHTML, /class="favorites-section favorites-collection-section"/);
  assert.match(root.innerHTML, /class="favorites-grid favorites-main-grid"/);
  assert.match(root.innerHTML, /class="favorites-section favorites-diy-section"/);
  assert.match(root.innerHTML, /class="diy-favorite-canvas"/);
  assert.match(root.innerHTML, /Open Inspector|打开检视器/);
  assert.match(root.innerHTML, /data-diy-favorite-id="design-1"/);
  assert.match(root.innerHTML, /Remove Favorite|取消收藏/);
  assert.match(root.innerHTML, /data-item-id="ak-inheritance"/);
  assert.match(root.innerHTML, /data-item-id="knife-fade"/);
  assert.match(root.innerHTML, /Sticker Gallery|贴纸画廊/);
});

test("removeDiyDesign persists the filtered gallery and refreshes the favorites page", () => {
  const writes = [];
  let renderCount = 0;
  const context = {
    getDiyDesigns: () => [
      { id: "design-1", createdAt: "2026-07-09T10:00:00.000Z", stickers: [{}, {}] },
      { id: "design-2", createdAt: "2026-07-09T11:00:00.000Z", stickers: [{}, {}, {}] }
    ],
    setDiyDesigns: (designs) => {
      writes.push(designs);
    },
    renderFavorites: () => {
      renderCount += 1;
    }
  };

  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, "removeDiyDesign")};\nremoveDiyDesign("design-1");`;
  vm.runInContext(source, context);

  assert.deepEqual(writes.at(-1), [
    { id: "design-2", createdAt: "2026-07-09T11:00:00.000Z", stickers: [{}, {}, {}] }
  ]);
  assert.equal(renderCount, 1);
});

test("favorites loading shell keeps the final hero title instead of flashing a different label", () => {
  assert.match(appSource, /if \(!catalogDataAvailable\(\)\) \{[\s\S]*<h1 data-motion-part="title">\$\{escapeHtml\(uiText\("Favorites", "Favorites"\)\)\}<\/h1>/);
  assert.doesNotMatch(appSource, /if \(!catalogDataAvailable\(\)\) \{[\s\S]*<h1 data-motion-part="title">\$\{escapeHtml\(uiText\("Saved", "已收藏"\)\)\}<\/h1>/);
});
