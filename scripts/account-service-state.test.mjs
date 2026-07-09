import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");

function extractFunctionSource(sourceText, name) {
  const markers = [`async function ${name}`, `function ${name}`];
  const start = markers
    .map((marker) => sourceText.indexOf(marker))
    .find((index) => index !== -1);
  if (start === -1) throw new Error(`Unable to find ${name}`);
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

test("ensureAccountData marks auth as error when account overview is unavailable", async () => {
  const context = {
    Date,
    appState: {
      authLoading: false,
      authLoaded: false,
      authStatus: "anonymous",
      session: null,
      accountError: ""
    },
    accountOverviewUnavailableUntil: 0,
    fetchJson: async () => {
      throw new Error("network down");
    },
    applyAccountOverview: () => {
      throw new Error("applyAccountOverview should not be called on a failed overview request");
    },
    uiText: (en) => en
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(appSource, "ensureAccountData")};`, context);

  await context.ensureAccountData();

  assert.equal(context.appState.authStatus, "error");
  assert.match(context.appState.accountError, /Account service is unavailable/);
  assert.equal(context.appState.authLoaded, true);
  assert.equal(context.appState.authLoading, false);
  assert.ok(context.accountOverviewUnavailableUntil > Date.now());
});

test("detectLocalApiOrigins prefers the current localhost origin even without same-origin flags", () => {
  const context = {
    globalThis: {},
    localStorage: {
      getItem: () => ""
    },
    location: {
      protocol: "http:",
      hostname: "127.0.0.1",
      origin: "http://127.0.0.1:4173"
    }
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(appSource, "detectLocalApiOrigins")};`, context);

  const candidates = Array.from(context.detectLocalApiOrigins());

  assert.equal(candidates[0], "http://127.0.0.1:4173");
  assert.ok(candidates.includes("http://localhost:4173"));
});

test("detectLocalApiOrigins falls back to port 4173 before legacy ports", () => {
  const context = {
    globalThis: {},
    localStorage: {
      getItem: () => ""
    },
    location: {
      protocol: "file:",
      hostname: "",
      origin: "null"
    }
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(appSource, "detectLocalApiOrigins")};`, context);

  const candidates = Array.from(context.detectLocalApiOrigins());

  assert.deepEqual(candidates.slice(0, 4), [
    "http://127.0.0.1:4173",
    "http://localhost:4173",
    "http://127.0.0.1:4174",
    "http://localhost:4174"
  ]);
});
