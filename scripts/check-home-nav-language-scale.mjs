import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const stylesCss = await readFile(new URL("../styles.css", import.meta.url), "utf8");

const languageSwitchBlockMatch = stylesCss.match(/\.home-exhibition-page \.lang-switch\s*\{([\s\S]*?)\}/);
assert.ok(languageSwitchBlockMatch, "styles.css should define a home exhibition language switch block");

const block = languageSwitchBlockMatch[1];

assert.match(block, /min-width:\s*auto;/, "home exhibition language switch should not reserve an oversized minimum width");
assert.match(block, /background:\s*transparent;/, "home exhibition language switch should visually align with nav text");
assert.match(block, /border:\s*0;/, "home exhibition language switch should avoid a large boxed outline");
assert.match(block, /font-size:\s*20px;/, "home exhibition language switch should match the nav text size");

console.log("home nav language scale checks passed");
