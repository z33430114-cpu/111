import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";

const root = join(import.meta.dirname, "..");

async function loadInventoryMarketNameKey() {
  const appSource = await readFile(join(root, "app.js"), "utf8");
  const functionStart = appSource.indexOf("function inventoryMarketNameKey(value)");
  assert.notEqual(functionStart, -1, "inventoryMarketNameKey must exist");

  const bodyStart = appSource.indexOf("{", functionStart);
  assert.notEqual(bodyStart, -1, "inventoryMarketNameKey should have a function body");
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
  assert.notEqual(functionEnd, -1, "inventoryMarketNameKey should have a closing brace");

  const source = `${appSource.slice(functionStart, functionEnd)}
    globalThis.inventoryMarketNameKey = inventoryMarketNameKey;
  `;
  const sandbox = { globalThis: {} };
  vm.runInNewContext(source, sandbox, { filename: "app.js:inventoryMarketNameKey" });
  return sandbox.globalThis.inventoryMarketNameKey;
}

test("inventory inspector normalizes Steam market names to catalog item names", async () => {
  const inventoryMarketNameKey = await loadInventoryMarketNameKey();

  assert.equal(
    inventoryMarketNameKey("StatTrak\u2122 AK-47 | Redline (Field-Tested)"),
    inventoryMarketNameKey("AK-47 | Redline")
  );
  assert.equal(
    inventoryMarketNameKey("Souvenir AWP | Dragon Lore (Factory New)"),
    inventoryMarketNameKey("AWP | Dragon Lore")
  );
});
