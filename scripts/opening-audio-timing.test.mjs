import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractConstExpression(sourceText, name) {
  const marker = `const ${name} = `;
  const start = sourceText.indexOf(marker);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const expressionStart = start + marker.length;
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;
  for (let index = expressionStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") depth += 1;
    if (char === "}" || char === "]" || char === ")") depth -= 1;
    if (char === ";" && depth === 0) {
      return sourceText.slice(expressionStart, index).trim();
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.indexOf(marker);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start + marker.length);
  let parenDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "(") parenDepth += 1;
    if (char === ")") {
      parenDepth -= 1;
      if (parenDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  const bodyStart = sourceText.indexOf("{", paramsEnd);
  let depth = 0;
  for (let index = bodyStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1).trim();
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

const context = {
  Math,
  Number,
  Object,
  localPageUrl: (value = "") => `local:${String(value || "").replace(/^\/+/, "")}`
};
vm.createContext(context);
vm.runInContext(`
  const OPENING_SFX = ${extractConstExpression(appSource, "OPENING_SFX")};
  ${extractFunctionSource(appSource, "openingAwardSampleForEntry")}
  result = { OPENING_SFX, openingAwardSampleForEntry };
`, context);

const { OPENING_SFX, openingAwardSampleForEntry } = context.result;

test("opening animation still uses the shared audio timeline", () => {
  assert.match(appSource, /playOpeningSample\(OPENING_SFX\.unlock, 0, 0\.62\);/, "unlock cue should start the real cs opening sequence");
  assert.match(
    appSource,
    /playOpeningLoopedSample\(OPENING_SFX\.scroll, \{ startDelayMs: 120, durationMs: 5400, intervalMs: 520, volume: 0\.48 \}\);/,
    "scroll cue should loop across the full reel animation"
  );
  assert.doesNotMatch(appSource, /playOpeningSample\(OPENING_SFX\.land,/, "legacy landing cue should be removed from the reward hit");
  assert.match(
    appSource,
    /track\.style\.transition = "transform 5\.4s cubic-bezier\(0\.08, 0\.75, 0\.08, 1\)";/,
    "opening transition should keep the tuned visual timing"
  );
});

test("opening sfx still points at the real cs opening assets", () => {
  assert.equal(OPENING_SFX.unlock, "local:assets/cs2-case-unlock.wav");
  assert.equal(OPENING_SFX.scroll, "local:assets/cs2-case-scroll.wav");
});

test("opening award sfx maps each item grade to the real cs reward audio", () => {
  assert.equal(OPENING_SFX.awardCommon, "local:assets/cs2-case-award-common.wav");
  assert.equal(OPENING_SFX.awardUncommon, "local:assets/cs2-case-award-uncommon.wav");
  assert.equal(OPENING_SFX.awardRare, "local:assets/cs2-case-award-rare.wav");
  assert.equal(OPENING_SFX.awardMythical, "local:assets/cs2-case-award-mythical.wav");
  assert.equal(OPENING_SFX.awardLegendary, "local:assets/cs2-case-award-legendary.wav");
  assert.equal(OPENING_SFX.awardAncient, "local:assets/cs2-case-award-ancient.wav");
  assert.equal(OPENING_SFX.awardShowcaseKnife, "local:assets/cs2-case-showcase-knife.wav");

  assert.equal(openingAwardSampleForEntry({ rarityEn: "Consumer Grade" }), OPENING_SFX.awardCommon);
  assert.equal(openingAwardSampleForEntry({ rarityEn: "Industrial Grade" }), OPENING_SFX.awardUncommon);
  assert.equal(openingAwardSampleForEntry({ rarityEn: "Mil-Spec Grade" }), OPENING_SFX.awardRare);
  assert.equal(openingAwardSampleForEntry({ rarityEn: "Restricted" }), OPENING_SFX.awardMythical);
  assert.equal(openingAwardSampleForEntry({ rarityEn: "Classified" }), OPENING_SFX.awardLegendary);
  assert.equal(openingAwardSampleForEntry({ rarityEn: "Covert" }), OPENING_SFX.awardAncient);
  assert.equal(openingAwardSampleForEntry({ rarityEn: "Extraordinary" }), OPENING_SFX.awardAncient);
  assert.equal(openingAwardSampleForEntry({ isRareSpecial: true, rarityEn: "Covert" }), OPENING_SFX.awardShowcaseKnife);
});
