import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const serverSource = await readFile(join(process.cwd(), "scripts/serve.mjs"), "utf8");

test("account service exposes username update storage and route", () => {
  assert.match(serverSource, /const updateUserUsername\s*=\s*db\.prepare/);
  assert.match(serverSource, /async function handleUsernameUpdate/);
  assert.match(serverSource, /pathname === "\/api\/auth\/username"/);
  assert.match(serverSource, /selectUserByUsername\.get\(username\)/);
});
