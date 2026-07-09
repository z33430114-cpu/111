import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const serveSource = await readFile(new URL("../scripts/serve.mjs", import.meta.url), "utf8");
const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractFunctionSource(sourceText, name) {
  const markers = [`async function ${name}`, `function ${name}`];
  const start = markers
    .map((marker) => sourceText.indexOf(marker))
    .find((index) => index !== -1);
  if (start == null || start === -1) throw new Error(`Unable to find ${name}`);
  const signatureEnd = sourceText.indexOf(")", start);
  const bodyStart = sourceText.indexOf("{", signatureEnd);
  let depth = 0;
  for (let index = bodyStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to find end of ${name}`);
}

test("buildPlatformPricePayload reports cached YouPin price during rate-limit cooldown", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(serveSource, "buildPlatformPricePayload")};`, context);

  const payload = context.buildPlatformPricePayload(
    "youpin",
    { status: "connected" },
    {
      price: 399,
      updatedAt: "2026-07-08T03:00:00.000Z",
      url: "https://example.com/item"
    },
    "2026-07-08T02:00:00.000Z",
    "YouPin request was rate limited. Please wait a moment and try again."
  );

  assert.equal(payload.status, "cached");
  assert.match(payload.message, /rate limited/i);
  assert.equal(payload.price, 399);
});

test("localizePlatformMessage translates the YouPin rate-limit cooldown hint", () => {
  const context = {
    uiText: (_en, zh) => zh
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(appSource, "localizePlatformMessage")};`, context);

  const message = context.localizePlatformMessage("YouPin request was rate limited. Please wait a moment and try again.");

  assert.match(message, /限流|稍后/);
});
