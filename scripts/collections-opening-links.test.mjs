import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const collectionsHtml = await readFile(join(process.cwd(), "collections.html"), "utf8");
const openingsHtml = await readFile(join(process.cwd(), "openings.html"), "utf8");

test("collections and openings boot from the latest app runtime", () => {
  for (const html of [collectionsHtml, openingsHtml]) {
    assert.match(html, /app\.js\?v=20260709smooth4/);
    assert.match(html, /app-overrides\.js\?v=20260709smooth4/);
    assert.doesNotMatch(html, /page-rescue\.js/);
  }
});

test("latest runtime keeps collection halls and opening routes available", () => {
  [
    "function buildCollectionSummaries",
    "function collectionCardWithPreviewMarkup",
    "catalog.html?collection=",
    "Open Inspector",
    "View Hall"
  ].forEach((token) => {
    assert.match(appSource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("openings page keeps the related-news navigation entry", () => {
  assert.match(openingsHtml, /data-nav-key="Related"/);
  assert.match(openingsHtml, /href="related\.html"/);
});
