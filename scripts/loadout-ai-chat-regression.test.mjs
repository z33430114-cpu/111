import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

test("requestAiLoadoutChat builds a user message and stores a normalized payload", () => {
  const start = appSource.indexOf("async function requestAiLoadoutChat()");
  assert.notEqual(start, -1, "requestAiLoadoutChat should exist");
  const end = appSource.indexOf("function clearAiLoadoutChat()", start);
  assert.notEqual(end, -1, "clearAiLoadoutChat should follow requestAiLoadoutChat");
  const source = appSource.slice(start, end);

  assert.match(source, /const userContent\s*=/);
  assert.match(source, /sanitizeAiLoadoutChatPayload\(payload\)/);
  assert.ok(
    source.indexOf("const normalizedPayload") < source.indexOf("payload: normalizedPayload"),
    "normalizedPayload should be declared before it is stored"
  );
});
