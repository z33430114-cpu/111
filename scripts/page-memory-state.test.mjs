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

test("restoreCatalogPageMemory rehydrates the last archive filters and pagination when reopening a clean catalog URL", () => {
  const replaceCalls = [];
  const context = {
    PAGE_MEMORY_KEY: "cs2-relic-hall:page-memory",
    PAGE_SIZE: 24,
    appState: {
      catalogRenderedCount: 24,
      collectionPickerSuper: "",
      collectionPickerQuery: "",
      collectionPickerVisibleLimit: 60,
      lastCatalogSort: "featured",
      lastCatalogMaxPrice: 5000
    },
    location: {
      pathname: "/catalog.html",
      search: ""
    },
    history: {
      replaceState: (...args) => replaceCalls.push(args)
    },
    pageName: () => "catalog.html",
    readLocalJson: () => ({
      "catalog.html": {
        href: "catalog.html?q=fade&type=knife&collection=The%20Norse%20Collection",
        catalogRenderedCount: 72,
        collectionPickerSuper: "maps",
        collectionPickerQuery: "norse",
        collectionPickerVisibleLimit: 180,
        sort: "price-desc",
        maxPrice: 1450
      }
    })
  };

  vm.createContext(context);
  const source = `
${extractFunctionSource(appSource, "getPageMemoryStore")}
${extractFunctionSource(appSource, "readPageMemory")}
${extractFunctionSource(appSource, "restoreCatalogPageMemory")}
result = restoreCatalogPageMemory();
`;
  const restored = vm.runInContext(source, context);

  assert.equal(restored, true);
  assert.equal(context.appState.catalogRenderedCount, 72);
  assert.equal(context.appState.collectionPickerSuper, "maps");
  assert.equal(context.appState.collectionPickerQuery, "norse");
  assert.equal(context.appState.collectionPickerVisibleLimit, 180);
  assert.equal(context.appState.lastCatalogSort, "price-desc");
  assert.equal(context.appState.lastCatalogMaxPrice, 1450);
  assert.equal(replaceCalls.at(-1)?.[1], "");
  assert.equal(replaceCalls.at(-1)?.[2], "catalog.html?q=fade&type=knife&collection=The%20Norse%20Collection");
});
