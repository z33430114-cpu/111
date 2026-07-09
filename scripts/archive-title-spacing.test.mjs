import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const styles = await readFile(join(process.cwd(), "styles.css"), "utf8");

function extractBlocks(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, "g");
  let match;
  const blocks = [];
  while ((match = pattern.exec(styles))) {
    blocks.push(match[1]);
  }
  assert.ok(blocks.length, `Missing CSS block for ${selector}`);
  return blocks;
}

test("archive intro keeps horizontal gutter so the title does not sit against the edge", () => {
  const block = extractBlocks(".catalog-page .archive-intro").find((entry) => /padding:/i.test(entry));
  assert.ok(block, "Expected archive intro block with padding");
  const paddingMatch = block.match(/padding:\s*([^;]+);/);
  assert.ok(paddingMatch, "Expected archive intro padding declaration");

  const paddingValue = paddingMatch[1].trim();
  assert.notEqual(
    paddingValue,
    "34px 0 18px",
    "Archive intro should not clear horizontal padding"
  );
  assert.match(
    paddingValue,
    /(clamp|min|max|calc|[1-9]\d*(?:\.\d+)?(?:px|rem|vw))/,
    "Archive intro should define a real horizontal gutter"
  );
});
