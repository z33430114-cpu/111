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
    ["ak-inheritance", { id: "ak-inheritance", name: "AK-47 | 传承" }],
    ["knife-fade", { id: "knife-fade", name: "爪子刀 | 渐变大理石" }]
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
    favoriteCardMarkup: (item) => `<article class="favorite-card" data-item-id="${item.id}">${item.name}</article>`,
    getDiyDesigns: () => [
      { id: "design-1", baseName: "AK-47 | 传承", createdAt: "2026-07-09T10:00:00.000Z", stickers: [{}, {}] }
    ]
  };

  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, "renderFavorites")};\nrenderFavorites();`;
  vm.runInContext(source, context);

  assert.match(root.innerHTML, /class="favorites-shell"/);
  assert.match(root.innerHTML, /class="favorites-hero"/);
  assert.match(root.innerHTML, /class="favorites-stats-grid"/);
  assert.match(root.innerHTML, /class="favorites-scope-rail"/);
  assert.match(root.innerHTML, /class="favorites-section favorites-collection-section"/);
  assert.match(root.innerHTML, /class="favorites-grid favorites-main-grid"/);
  assert.match(root.innerHTML, /class="favorites-section favorites-diy-section"/);
  assert.match(root.innerHTML, /data-item-id="ak-inheritance"/);
  assert.match(root.innerHTML, /data-item-id="knife-fade"/);
  assert.match(root.innerHTML, /Sticker Gallery|贴纸画廊/);
});
