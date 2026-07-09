import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const itemHtml = readFileSync(new URL("../item.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

test("item inspector renders the latest Obsidian Ledger layout", () => {
  assert.match(itemHtml, /app\.js\?v=20260709stable2/);
  assert.match(itemHtml, /app-overrides\.js\?v=20260709stable2/);
  assert.doesNotMatch(itemHtml, /page-rescue\.js/);

  [
    "function renderItemDetail",
    "obsidian-inspector",
    "obsidian-stage-shell",
    "obsidian-control-deck",
    "obsidian-ledger-panel",
    "obsidian-price-ledger",
    "obsidian-related-rail"
  ].forEach((token) => {
    assert.match(appSource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  [
    'id="wearSelect"',
    'id="variantSelect"',
    'id="templateSelect"',
    'id="toggleDiyButton"',
    'id="detailPlatformPriceGrid"',
    'id="detailBuffPriceValue"',
    'id="detailYoupinPriceValue"',
    'id="detailReferencePriceValue"',
    'class="favorite-button"'
  ].forEach((hook) => {
    assert.match(appSource, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("Obsidian Ledger CSS defines stage, control, ledger, and mobile layout rules", () => {
  [
    "body.is-inspector-page .detail-layout.obsidian-inspector",
    ".obsidian-stage-shell",
    ".obsidian-control-deck",
    ".obsidian-ledger-panel",
    ".obsidian-price-ledger",
    ".obsidian-related-rail",
    ".compare-tray[hidden]",
    "body.is-inspector-page .menu-toggle",
    "@media (max-width: 900px)"
  ].forEach((selector) => {
    assert.match(styleSource, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});
