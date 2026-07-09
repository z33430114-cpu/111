import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const styleSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

test("inspector page reuses the shared header and navigation sizing", () => {
  [
    /body\.is-inspector-page \.site-header\s*\{\s*position:\s*relative;\s*top:\s*auto;\s*box-shadow:\s*none;\s*\}/,
    /body\.is-inspector-page \.site-header\s*\{\s*grid-template-columns:\s*auto minmax\(0, 1fr\) auto auto;\s*min-height:\s*76px;\s*padding:\s*0 28px;\s*\}/,
    /body\.is-inspector-page \.site-header \.top-nav\s*\{\s*justify-content:\s*center;\s*gap:\s*4px;\s*\}/,
    /body\.is-inspector-page \.site-header \.top-nav a\s*\{\s*padding:\s*11px 12px 13px;\s*font-size:\s*13px;\s*line-height:\s*1\.1;\s*letter-spacing:\s*0\.08em;\s*\}/,
    /body\.is-inspector-page \.site-header \.lang-switch\s*\{\s*min-width:\s*118px;\s*height:\s*40px;\s*font-size:\s*14px;\s*letter-spacing:\s*0\.02em;\s*\}/,
    /@media \(max-width: 900px\)\s*\{\s*body\.is-inspector-page \.site-header\s*\{\s*position:\s*sticky;\s*grid-template-columns:\s*minmax\(0, 1fr\);\s*gap:\s*8px;\s*min-height:\s*64px;\s*padding:\s*0 188px 0 12px;\s*\}/,
    /body\.is-inspector-page \.menu-toggle\s*\{\s*position:\s*absolute;\s*top:\s*14px;\s*right:\s*12px;\s*display:\s*inline-flex;\s*min-width:\s*52px;\s*min-height:\s*36px;\s*padding:\s*0 10px;\s*font-size:\s*22px;\s*\}/
  ].forEach((pattern) => {
    assert.doesNotMatch(styleSource, pattern);
  });
});
