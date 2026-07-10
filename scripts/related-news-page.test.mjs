import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("related news page is wired into navigation and renderer", async () => {
  const [runtime, app, relatedHtml, styles, relatedStyles] = await Promise.all([
    readFile(join(process.cwd(), "language-runtime.js"), "utf8"),
    readFile(join(process.cwd(), "app.js"), "utf8"),
    readFile(join(process.cwd(), "related.html"), "utf8"),
    readFile(join(process.cwd(), "styles.css"), "utf8"),
    readFile(join(process.cwd(), "related-news.css"), "utf8")
  ]);
  const combinedStyles = `${styles}\n${relatedStyles}`;

  assert.match(runtime, /"related\.html": "Related"/);
  assert.match(runtime, /Related: "Related"/);
  assert.match(runtime, /Related: "\\u76f8\\u5173\\u8d44\\u8baf"/);
  assert.match(app, /function renderRelatedNews/);
  assert.match(app, /window\.RELATED_NEWS/);
  assert.match(app, /relatedNewsCategoryLabel/);
  assert.match(app, /data-related-news-filter/);
  assert.match(app, /target="_blank" rel="noopener noreferrer"/);
  assert.match(app, /Open original article/);
  assert.match(app, /查看原文/);
  assert.match(app, /targetPage === "related\.html"/);
  assert.match(relatedHtml, /related-news-data\.js/);
  assert.match(relatedHtml, /related-news\.css/);
  assert.match(relatedHtml, /data-nav-key="Related"/);
  assert.match(combinedStyles, /\.related-news-page/);
  assert.match(combinedStyles, /\.related-news-featured/);
  assert.match(combinedStyles, /\.related-news-filter-bar/);
  assert.match(combinedStyles, /\.related-news-meta/);
  assert.match(combinedStyles, /\.related-news-tags/);
});
