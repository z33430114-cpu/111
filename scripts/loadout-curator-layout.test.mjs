import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appJs = await readFile(join(process.cwd(), "app.js"), "utf8");
const stylesCss = await readFile(join(process.cwd(), "styles.css"), "utf8");

test("loadout page renders curator console wrappers and preserves interaction hooks", () => {
  assert.match(appJs, /curator-console-shell/, "loadout page should render a curator console shell");
  assert.match(appJs, /curator-console-masthead/, "loadout page should render a curator masthead");
  assert.match(appJs, /curator-command-deck/, "loadout page should render a command deck");
  assert.match(appJs, /curator-runway/, "loadout page should render an inventory runway section");
  assert.match(appJs, /curator-pro-archive/, "loadout page should render a pro archive section");
  assert.match(appJs, /id="aiLoadoutChatForm"/, "AI loadout form id must be preserved");
  assert.match(appJs, /id="aiLoadoutBudgetInput"/, "budget input id must be preserved");
  assert.match(appJs, /id="aiLoadoutPromptInput"/, "prompt input id must be preserved");
  assert.match(appJs, /id="rotateAiInventoryUpgradeGroupButton"/, "inventory rotate button id must be preserved");
  assert.match(appJs, /data-pro-player=/, "pro player toggle hook must be preserved");
});

test("curator console styles include desktop and responsive layout rules", () => {
  assert.match(stylesCss, /curator-console-shell/, "styles should define curator console shell");
  assert.match(stylesCss, /curator-console-masthead/, "styles should define curator masthead");
  assert.match(stylesCss, /curator-deck-grid/, "styles should define command deck grid");
  assert.match(stylesCss, /curator-runway-head/, "styles should define runway heading layout");
  assert.match(stylesCss, /curator-pro-head/, "styles should define pro archive heading layout");
  assert.match(stylesCss, /@media \(max-width: 1024px\)[\s\S]*curator-deck-grid/, "tablet rules should collapse the command deck");
  assert.match(stylesCss, /@media \(max-width: 760px\)[\s\S]*curator-console-shell/, "mobile rules should collapse the curator shell");
});
