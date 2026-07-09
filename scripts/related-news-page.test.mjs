import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("related news page is wired into navigation and renderer", async () => {
  const [runtime, app, relatedHtml, styles] = await Promise.all([
    readFile(join(process.cwd(), "language-runtime.js"), "utf8"),
    readFile(join(process.cwd(), "app.js"), "utf8"),
    readFile(join(process.cwd(), "related.html"), "utf8"),
    readFile(join(process.cwd(), "styles.css"), "utf8")
  ]);

  assert.match(runtime, /"related\.html": "Related"/);
  assert.match(runtime, /Related: "Related"/);
  assert.match(runtime, /Related: "\\u76f8\\u5173\\u8d44\\u8baf"/);
  assert.match(app, /function renderRelatedNews/);
  assert.match(app, /targetPage === "related\.html"/);
  assert.match(relatedHtml, /data-nav-key="Related"/);
  assert.match(styles, /\.related-news-page/);
});
