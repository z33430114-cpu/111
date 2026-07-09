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
  const bodyStart = sourceText.indexOf("{", start);
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
  localPageUrl: (value = "") => `local:${String(value || "").replace(/^\/+/, "")}`
};
vm.createContext(context);
vm.runInContext(`
  const OPENING_SFX = ${extractConstExpression(appSource, "OPENING_SFX")};
  const OPENING_REEL_DURATION_MS = ${extractConstExpression(appSource, "OPENING_REEL_DURATION_MS")};
  ${extractFunctionSource(appSource, "openingScrollCueTimings")}
  result = { OPENING_SFX, OPENING_REEL_DURATION_MS, openingScrollCueTimings };
`, context);

const { OPENING_SFX, OPENING_REEL_DURATION_MS, openingScrollCueTimings } = context.result;

test("opening animation uses only the real cs2 reel cues", () => {
  assert.equal(OPENING_REEL_DURATION_MS, 6800);
  assert.match(appSource, /playOpeningSample\(OPENING_SFX\.unlock, 0, 0\.62\);/);
  assert.match(
    appSource,
    /const scrollCueTimings = openingScrollCueTimings\(\{[\s\S]*targetDistancePx: target,[\s\S]*stepDistancePx: cardWidth \+ gap[\s\S]*\}\);/
  );
  assert.match(
    appSource,
    /playOpeningSfx\(winner, \{ simplified: simplifiedAudio, scrollCueTimings \}\);/
  );
  assert.match(
    appSource,
    /playOpeningSample\(openingAwardSampleForEntry\(winner\), OPENING_REEL_DURATION_MS, winner\?\.isRareSpecial \? 0\.9 : 0\.76\);/
  );
  assert.doesNotMatch(appSource, /playOpeningSample\(OPENING_SFX\.spin,/);
  assert.doesNotMatch(appSource, /playOpeningSample\(OPENING_SFX\.land,/);
  assert.match(
    appSource,
    /track\.style\.transition = `transform \$\{OPENING_REEL_DURATION_MS \/ 1000\}s cubic-bezier\(0\.08, 0\.75, 0\.08, 1\)`;/
  );
});

test("opening sfx registry only exposes the real cs2 pack", () => {
  assert.deepEqual(
    Object.keys(OPENING_SFX).sort(),
    ["awardAncient", "awardCommon", "awardLegendary", "awardMythical", "awardRare", "awardShowcaseKnife", "awardUncommon", "scroll", "unlock"].sort()
  );
  assert.equal(OPENING_SFX.unlock, "local:assets/cs2-case-unlock.wav");
  assert.equal(OPENING_SFX.scroll, "local:assets/cs2-case-scroll.wav");
  assert.equal(OPENING_SFX.awardCommon, "local:assets/cs2-case-award-common.wav");
  assert.equal(OPENING_SFX.awardUncommon, "local:assets/cs2-case-award-uncommon.wav");
  assert.equal(OPENING_SFX.awardRare, "local:assets/cs2-case-award-rare.wav");
  assert.equal(OPENING_SFX.awardMythical, "local:assets/cs2-case-award-mythical.wav");
  assert.equal(OPENING_SFX.awardLegendary, "local:assets/cs2-case-award-legendary.wav");
  assert.equal(OPENING_SFX.awardAncient, "local:assets/cs2-case-award-ancient.wav");
  assert.equal(OPENING_SFX.awardShowcaseKnife, "local:assets/cs2-case-showcase-knife.wav");
});

test("opening scroll cues decelerate with the reel instead of firing at a fixed interval", () => {
  const timings = Array.from(openingScrollCueTimings({
    durationMs: OPENING_REEL_DURATION_MS,
    targetDistancePx: 2464,
    stepDistancePx: 176,
    startDelayMs: 120
  }));

  assert.ok(timings.length >= 5);
  assert.ok(timings[0] > 120);
  assert.ok(timings.at(-1) < OPENING_REEL_DURATION_MS);
  assert.ok(timings.at(-1) > OPENING_REEL_DURATION_MS * 0.4);
  const gaps = timings.slice(1).map((time, index) => time - timings[index]);
  assert.ok(gaps[0] < gaps.at(-1));
  assert.ok(gaps.some((gap, index) => index > 0 && gap > gaps[index - 1]));
});

test("opening scroll cues fire once per card step that crosses the marker", () => {
  const targetDistancePx = 2464;
  const stepDistancePx = 176;
  const timings = Array.from(openingScrollCueTimings({
    durationMs: OPENING_REEL_DURATION_MS,
    targetDistancePx,
    stepDistancePx,
    startDelayMs: 120
  }));

  assert.equal(timings.length, Math.max(0, Math.floor(Math.floor(targetDistancePx / stepDistancePx) / 2) - 2));
});
