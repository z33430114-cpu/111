import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const root = join(import.meta.dirname, "..");

async function loadInventorySortGroup() {
  const appSource = await readFile(join(root, "app.js"), "utf8");
  const functionStart = appSource.indexOf("function inventorySortGroup(entry)");
  assert.notEqual(functionStart, -1, "inventorySortGroup must exist");

  const bodyStart = appSource.indexOf("{", functionStart);
  assert.notEqual(bodyStart, -1, "inventorySortGroup should have a function body");

  let depth = 0;
  let functionEnd = -1;
  for (let index = bodyStart; index < appSource.length; index += 1) {
    if (appSource[index] === "{") depth += 1;
    if (appSource[index] === "}") depth -= 1;
    if (depth === 0) {
      functionEnd = index + 1;
      break;
    }
  }
  assert.notEqual(functionEnd, -1, "inventorySortGroup should have a closing brace");

  const source = `
    function inventoryInspectorTarget(entry) {
      return entry?.resolved || null;
    }
    function inventoryEntryText(entry) {
      return String(entry?.market_hash_name || entry?.item_name || entry?.label || "");
    }
    ${appSource.slice(functionStart, functionEnd)}
    globalThis.inventorySortGroup = inventorySortGroup;
  `;
  const sandbox = { globalThis: {} };
  vm.runInNewContext(source, sandbox, { filename: "app.js:inventorySortGroup" });
  return sandbox.globalThis.inventorySortGroup;
}

test("inventorySortGroup keeps ordinary weapon entries renderable", async () => {
  const inventorySortGroup = await loadInventorySortGroup();

  assert.equal(
    inventorySortGroup({
      market_hash_name: "AK-47 | Inheritance (Field-Tested)",
      resolved: { type: "rifle" }
    }),
    8
  );
});

test("inventorySortGroup classifies cases from entry text", async () => {
  const inventorySortGroup = await loadInventorySortGroup();

  assert.equal(
    inventorySortGroup({
      market_hash_name: "Revolution Case",
      resolved: null
    }),
    7
  );
});
