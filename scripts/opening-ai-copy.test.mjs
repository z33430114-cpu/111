import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

test("opening AI panel uses clean Chinese copy for top-drop probability notes", () => {
  assert.match(appSource, /chance bucket share/);
  assert.match(appSource, /预计落在该概率档位的占比约为/);
  assert.doesNotMatch(appSource, /璇ョ█鏈/);
});
