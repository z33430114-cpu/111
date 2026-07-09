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

function buildAppFunction(name, overrides = {}) {
  const context = {
    URLSearchParams,
    location: { search: "" },
    uiText: (en) => en,
    escapeHtml: (value) => String(value),
    ...overrides
  };
  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, name)};\nresult = ${name};`;
  return vm.runInContext(source, context);
}

test("archive shell keeps original functional controls inside the new exhibition console", () => {
  const buildCatalogShell = buildAppFunction("buildCatalogShell");
  const markup = buildCatalogShell();

  assert.match(markup, /class="catalog-shell exhibition-console archive-console-shell"/);
  assert.match(markup, /class="archive-intro-stage"/);
  assert.match(markup, /class="archive-intro-grid"/);
  assert.match(markup, /class="archive-status-chip"/);
  assert.match(markup, /class="archive-results-head"/);
  assert.match(markup, /id="catalogResultSummary"/);
  assert.match(markup, /id="catalogSelectionTitle"/);
  assert.match(markup, /id="catalogMarketStatus"/);

  assert.match(markup, /id="searchInput"/);
  assert.match(markup, /id="typeFilter"/);
  assert.match(markup, /id="rarityFilter"/);
  assert.match(markup, /id="collectionFilter"/);
  assert.match(markup, /id="priceFilter"/);
  assert.match(markup, /id="sortFilter"/);
  assert.match(markup, /id="shareCatalogLink"/);
  assert.match(markup, /id="itemGrid"/);
  assert.match(markup, /id="loadMore"/);
  assert.match(markup, /id="compareTray"/);
  assert.doesNotMatch(markup, /\?{3,}|甯傚満|娴佸姩|鎼滅储|�/);
});
