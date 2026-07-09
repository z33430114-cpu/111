import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const serverSource = await readFile(join(process.cwd(), "scripts/serve.mjs"), "utf8");

function extractFunctionSource(sourceText, name) {
  const markers = [`async function ${name}`, `function ${name}`];
  const start = markers
    .map((marker) => sourceText.indexOf(marker))
    .find((index) => index !== -1);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start);
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

test("mapUser includes avatarUrl from the stored user row", () => {
  const context = {
    buildSteamProfile: (steamId) => ({ steamId, avatar: "", personaName: "", profileUrl: "", visibility: "" })
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serverSource, "mapUser")};`, context);

  const result = context.mapUser({
    id: "user-1",
    username: "VaultMaster",
    avatar_url: "data:image/png;base64,uploaded",
    steam_id: "76561198000000000",
    created_at: "2026-07-09T10:00:00.000Z",
    updated_at: "2026-07-09T10:30:00.000Z",
    steam_bound_at: "2026-07-09T11:00:00.000Z",
    last_inventory_sync_at: "2026-07-09T12:00:00.000Z",
    last_inventory_count: 8
  });

  assert.equal(result.avatarUrl, "data:image/png;base64,uploaded");
  assert.equal(result.username, "VaultMaster");
  assert.equal(result.steamId, "76561198000000000");
});
