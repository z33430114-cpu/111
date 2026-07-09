import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const indexHtml = await readFile(join(process.cwd(), "index.html"), "utf8");
const runtimeSource = await readFile(join(process.cwd(), "language-runtime.js"), "utf8");

test("home redesign boots from the latest app runtime", () => {
  assert.match(indexHtml, /app\.js\?v=20260709stable2/);
  assert.match(indexHtml, /app-overrides\.js\?v=20260709stable2/);
  assert.doesNotMatch(indexHtml, /page-rescue\.js/);
  assert.match(appSource, /function buildHomeMarkup/);

  [
    "home-hero",
    "home-live-rail",
    "home-command-grid",
    "home-rendered-exhibit",
    "assets/home-awp-exhibit-render.webp",
    "AWP | Asiimov",
    "Preserve. Inspect. Understand.",
    "home-operations-grid",
    "home-market-panel",
    "home-ai-panel",
    "home-subscribe-strip"
  ].forEach((token) => {
    assert.match(appSource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("language runtime uses CS Exhibition as the site brand", () => {
  assert.match(runtimeSource, /"index\.html": "CS Exhibition"/);
  assert.match(runtimeSource, /brand: "CS Exhibition"/);
  assert.doesNotMatch(runtimeSource, /"index\.html": "CS2 Skin Atlas"/);
});
