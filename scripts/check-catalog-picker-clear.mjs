import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appJs = readFileSync(new URL("../app.js", import.meta.url), "latin1");
const catalogHtml = readFileSync(new URL("../catalog.html", import.meta.url), "utf8");
const languageRuntime = readFileSync(new URL("../language-runtime.js", import.meta.url), "utf8");

assert.match(
  appJs,
  /if\s*\(target\.id === "clearCollection"\)\s*\{[\s\S]*?updateCatalogResults\(\);[\s\S]*?return;/,
  "Expected clearCollection to refresh catalog results after clearing the filter."
);

assert.match(
  appJs,
  /function\s+readCatalogControlValue\s*\(/,
  "Expected catalog filters to read live control values without falling back to stale URL params."
);

assert.match(
  appJs,
  /const\s+type\s*=\s*readCatalogControlValue\("typeFilter",\s*"type"(?:,\s*params)?\)/,
  "Expected type filter to come from the live control value helper."
);

assert.match(
  appJs,
  /const\s+rarity\s*=\s*readCatalogControlValue\("rarityFilter",\s*"rarity"(?:,\s*params)?\)/,
  "Expected rarity filter to come from the live control value helper."
);

assert.match(
  appJs,
  /const\s+collection\s*=\s*readCatalogControlValue\("collectionFilter",\s*"collection"(?:,\s*params)?\)/,
  "Expected collection filter to come from the live control value helper."
);

assert.doesNotMatch(
  catalogHtml,
  /<h2>\s*Select Collection\s*<\/h2>/,
  "Expected collection picker title to avoid hard-coded English text."
);

assert.doesNotMatch(
  catalogHtml,
  /<h2>\s*Select Weapon Type\s*<\/h2>/,
  "Expected type picker title to avoid hard-coded English text."
);

assert.doesNotMatch(
  catalogHtml,
  /<h2>\s*Select Rarity\s*<\/h2>/,
  "Expected rarity picker title to avoid hard-coded English text."
);

assert.doesNotMatch(
  catalogHtml,
  /id="clearCollection"[^>]*>\s*Clear\s*</,
  "Expected collection picker clear button to avoid hard-coded English text."
);

assert.doesNotMatch(
  catalogHtml,
  /id="clearType"[^>]*>\s*Clear\s*</,
  "Expected type picker clear button to avoid hard-coded English text."
);

assert.doesNotMatch(
  catalogHtml,
  /id="clearRarity"[^>]*>\s*Clear\s*</,
  "Expected rarity picker clear button to avoid hard-coded English text."
);

for (const key of [
  "Select Collection",
  "Search collections",
  "Select Weapon Type",
  "Search weapon types",
  "Select Rarity",
  "Search rarities",
  "Clear",
  "Confirm",
  "Close",
  "Close picker"
]) {
  assert.match(
    languageRuntime,
    new RegExp(`"zh-CN":[\\s\\S]*"${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}"\\s*:`),
    `Expected zh-CN translations for "${key}".`
  );
  assert.match(
    languageRuntime,
    new RegExp(`"zh-TW":[\\s\\S]*"${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}"\\s*:`),
    `Expected zh-TW translations for "${key}".`
  );
}

console.log("Catalog picker clear behavior checks passed.");
