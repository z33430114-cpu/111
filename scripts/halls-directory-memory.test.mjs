import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const source = await readFile(join(process.cwd(), "app-overrides.js"), "utf8");

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

test("restoreHallDirectoryState rehydrates the halls directory filters and current page", () => {
  const context = {
    HALL_STATE_KEY: "cs2-relic-hall:halls-memory",
    hallState: {
      bucket: "collection",
      query: "",
      sort: "az",
      type: "all",
      page: 1,
      selectedName: "",
      touched: false
    },
    readStorageJson: () => ({
      bucket: "weapon-case",
      query: "gamma",
      sort: "count",
      type: "rifle",
      page: 3,
      selectedName: "Gamma Case",
      touched: true
    })
  };

  vm.createContext(context);
  const script = `
${extractFunctionSource(source, "restoreHallDirectoryState")}
restoreHallDirectoryState();
`;
  vm.runInContext(script, context);

  assert.equal(context.hallState.bucket, "weapon-case");
  assert.equal(context.hallState.query, "gamma");
  assert.equal(context.hallState.sort, "count");
  assert.equal(context.hallState.type, "rifle");
  assert.equal(context.hallState.page, 3);
  assert.equal(context.hallState.selectedName, "Gamma Case");
  assert.equal(context.hallState.touched, true);
});
