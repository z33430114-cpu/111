import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const styleSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("openings page adds a Codex-width layout guard before the narrow mobile breakpoint", () => {
  [
    "@media (max-width: 1280px)",
    ".opening-runway-hero",
    "#openingsRoot .unbox-simulator-copy",
    "#openingsRoot .unbox-result-body"
  ].forEach((token) => {
    assert.match(styleSource, new RegExp(escapeRegExp(token)));
  });
});
