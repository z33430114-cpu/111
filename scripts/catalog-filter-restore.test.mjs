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

test("getCatalogFilters falls back to URL params when freshly rendered controls are still empty", () => {
  class FakeInput {
    constructor(value = "") {
      this.value = value;
    }
  }
  class FakeSelect extends FakeInput {}

  const controls = new Map([
    ["searchInput", new FakeInput("")],
    ["typeFilter", new FakeInput("")],
    ["rarityFilter", new FakeInput("")],
    ["collectionFilter", new FakeInput("")],
    ["priceFilter", new FakeInput("5000")],
    ["sortFilter", new FakeSelect("featured")]
  ]);

  const context = {
    URLSearchParams,
    location: {
      search: "?q=fade&type=knife&rarity=Covert&collection=The%20Norse%20Collection"
    },
    document: {
      getElementById(id) {
        return controls.get(id) || null;
      }
    },
    HTMLInputElement: FakeInput,
    HTMLSelectElement: FakeSelect
  };

  vm.createContext(context);
  const source = `
${extractFunctionSource(appSource, "readCatalogControlValue")}
${extractFunctionSource(appSource, "getCatalogFilters")}
result = getCatalogFilters({ preferUrlParamsWhenEmpty: true });
`;
  const result = vm.runInContext(source, context);

  assert.equal(result.query, "fade");
  assert.equal(result.type, "knife");
  assert.equal(result.rarity, "Covert");
  assert.equal(result.collection, "The Norse Collection");
  assert.equal(result.sort, "featured");
});
