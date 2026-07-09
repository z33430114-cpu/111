import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.indexOf(marker);
  if (start === -1) {
    throw new Error(`Unable to find ${name}`);
  }
  const paramsStart = sourceText.indexOf("(", start + marker.length);
  if (paramsStart === -1) {
    throw new Error(`Unable to find params for ${name}`);
  }
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
  const bodyStart = paramsEnd === -1 ? -1 : sourceText.indexOf("{", paramsEnd);
  if (bodyStart === -1) {
    throw new Error(`Unable to find body for ${name}`);
  }
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
    appState: {
      openingRenderToken: 1
    },
    scheduleUiTask: (callback) => callback(),
    pageName: () => "openings.html",
    openingCardMarkup: (entry) => `<article>${entry.id}</article>`,
    Math,
    Number,
    ...overrides
  };
  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, name)};\nresult = ${name};`;
  return vm.runInContext(source, context);
}

test("appendOpeningSectionCards appends only the newly requested opening cards", () => {
  const appendOpeningSectionCards = buildAppFunction("appendOpeningSectionCards");
  const calls = [];
  const grid = {
    insertAdjacentHTML(position, html) {
      calls.push({ position, html });
    }
  };
  const section = {
    entries: Array.from({ length: 5 }, (_, index) => ({ id: `opening-${index + 1}` }))
  };

  appendOpeningSectionCards(section, grid, { startIndex: 2, endIndex: 5, chunkSize: 2, renderToken: 1 });

  assert.deepEqual(calls.map((entry) => entry.position), ["beforeend", "beforeend"]);
  assert.equal(calls[0].html, "<article>opening-3</article><article>opening-4</article>");
  assert.equal(calls[1].html, "<article>opening-5</article>");
});

test("opening load-more click no longer triggers a full index rerender", () => {
  assert.match(appSource, /appendOpeningSectionLoadMore\(kind\)/);
  assert.doesNotMatch(
    appSource,
    /const openingMore = target\.closest\("\[data-opening-more\]"\);[\s\S]*?renderOpeningIndex\(\);/
  );
});
