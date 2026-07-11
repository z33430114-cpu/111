import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");
const itemHtmlSource = await readFile(join(process.cwd(), "item.html"), "utf8");
const styleSource = await readFile(join(process.cwd(), "styles.css"), "utf8");

function cssRuleBody(sourceText, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sourceText.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  return match ? match[1] : "";
}

test("item inspector keeps the title block in its own layout row above the stage", () => {
  const inspectorMarkupStart = appSource.indexOf('<section class="viewer-panel obsidian-stage-shell">');
  const titleBlockStart = appSource.indexOf('<div class="obsidian-title-block">', inspectorMarkupStart);
  const stageStart = appSource.indexOf('<div class="viewer-stage inspect-scene obsidian-stage', inspectorMarkupStart);

  assert.notEqual(inspectorMarkupStart, -1, "expected inspector stage shell markup");
  assert.notEqual(titleBlockStart, -1, "expected title block markup");
  assert.notEqual(stageStart, -1, "expected stage markup");
  assert.ok(titleBlockStart < stageStart, "title block should render before the inspect stage");

  assert.match(
    styleSource,
    /body\.is-inspector-page \.obsidian-stage-shell,\s*[\s\S]*?grid-template-rows:\s*auto auto minmax\(360px,\s*405px\) auto;/,
    "expected the stage shell grid to reserve a dedicated title row"
  );
  const titleBlockRule = cssRuleBody(styleSource, "body.is-inspector-page .obsidian-title-block");
  assert.ok(titleBlockRule, "expected inspector title block rule");
  assert.doesNotMatch(titleBlockRule, /position:\s*absolute;/, "title block should no longer overlay the stage image");
});

test("item inspector lowers the weapon render inside the stage viewport", () => {
  const depthCardRule = cssRuleBody(styleSource, "body.is-inspector-page .obsidian-stage .inspect-depth-card");
  const imageRule = cssRuleBody(styleSource, "body.is-inspector-page .obsidian-stage:not(.sticker-flat-view) .inspect-image");

  assert.ok(depthCardRule, "expected an inspector-only depth card sizing rule");
  assert.match(depthCardRule, /height:\s*330px;/, "inspector depth card should not stretch taller than the stage viewport");
  assert.ok(imageRule, "expected an inspector-only weapon image positioning rule");
  assert.match(imageRule, /transform:\s*translateY\(/, "inspector weapon image should sit lower than the top of the Steam render canvas");
});

test("item inspector uses a fresh stylesheet after stage image framing changes", () => {
  assert.match(itemHtmlSource, /styles\.css\?v=20260711inspectimage2/);
});
