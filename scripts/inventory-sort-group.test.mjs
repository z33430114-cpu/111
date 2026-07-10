import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const root = join(import.meta.dirname, "..");

async function loadInventorySortGroup() {
  const appSource = await readFile(join(root, "app.js"), "utf8");
  const helperStart = appSource.indexOf("function inventoryLooksLikeWeapon(entry, resolved, text = inventoryEntryText(entry))");
  assert.notEqual(helperStart, -1, "inventoryLooksLikeWeapon must exist");

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
    ${appSource.slice(helperStart, functionEnd)}
    globalThis.inventorySortGroup = inventorySortGroup;
  `;
  const sandbox = { globalThis: {} };
  vm.runInNewContext(source, sandbox, { filename: "app.js:inventorySortGroup" });
  return sandbox.globalThis.inventorySortGroup;
}

test("inventorySortGroup keeps ordinary weapon entries in the gun skin group", async () => {
  const inventorySortGroup = await loadInventorySortGroup();

  assert.equal(
    inventorySortGroup({
      market_hash_name: "AK-47 | Inheritance (Field-Tested)",
      resolved: { type: "rifle" }
    }),
    2
  );
});

test("inventorySortGroup places gun skins after knives and gloves", async () => {
  const inventorySortGroup = await loadInventorySortGroup();

  for (const type of ["rifle", "pistol", "smg", "shotgun", "machinegun"]) {
    assert.equal(
      inventorySortGroup({
        market_hash_name: "Factory New gun skin",
        resolved: { type }
      }),
      2
    );
  }
});

test("inventorySortGroup recognizes gun skins from text when catalog resolution fails", async () => {
  const inventorySortGroup = await loadInventorySortGroup();

  assert.equal(
    inventorySortGroup({
      market_hash_name: "AWP | Asiimov (Field-Tested)",
      resolved: null
    }),
    2
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
