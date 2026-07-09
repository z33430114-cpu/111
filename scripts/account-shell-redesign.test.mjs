import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractFunctionSource(sourceText, name) {
  const markers = [`async function ${name}`, `function ${name}`];
  const start = markers
    .map((marker) => sourceText.lastIndexOf(marker))
    .find((index) => index !== -1);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start);
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

test("resolveAccountAvatarUrl prefers uploaded avatar, then Steam avatar, then default preview avatar", () => {
  const context = {
    DEFAULT_ACCOUNT_AVATAR_URL: "assets/default-account-avatar.png"
  };
  vm.createContext(context);
  vm.runInContext(`${extractFunctionSource(appSource, "steamAvatarUrl")};\n${extractFunctionSource(appSource, "resolveAccountAvatarUrl")};`, context);

  assert.equal(
    context.resolveAccountAvatarUrl(
      { avatarUrl: "data:image/png;base64,uploaded" },
      { avatar: "https://steamcdn.example/avatar.jpg" },
      "76561198000000000"
    ),
    "data:image/png;base64,uploaded"
  );
  assert.equal(
    context.resolveAccountAvatarUrl(
      { avatarUrl: "" },
      { avatar: "https://steamcdn.example/avatar.jpg" },
      "76561198000000000"
    ),
    "https://steamcdn.example/avatar.jpg?steam=76561198000000000"
  );
  assert.equal(
    context.resolveAccountAvatarUrl(
      { avatarUrl: "" },
      { avatar: "" },
      ""
    ),
    "assets/default-account-avatar.png"
  );
});

test("renderAccount outputs the curator atrium shell and avatar upload controls for signed-in users", () => {
  const root = { innerHTML: "" };
  const context = {
    document: {
      getElementById(id) {
        return id === "accountRoot" ? root : null;
      },
      querySelectorAll() {
        return [];
      }
    },
    appState: {
      session: {
        id: "user-1",
        username: "VaultMaster",
        avatarUrl: "",
        createdAt: "2026-07-09T10:00:00.000Z",
        steamId: "76561198000000000",
        lastInventorySyncAt: "2026-07-09T12:00:00.000Z",
        lastInventoryCount: 8
      },
      steamProfile: {
        steamId: "76561198000000000",
        personaName: "VaultMaster",
        avatar: "",
        profileUrl: "https://steamcommunity.com/profiles/76561198000000000",
        visibility: "Public"
      },
      authStatus: "authenticated",
      authLoaded: true,
      authLoading: false,
      accountBusyAction: "",
      inventorySyncRunning: false,
      inventoryPreview: { items: [] },
      syncStatus: { intervalMinutes: 30, running: false, lastRunAt: null, nextRunAt: null },
      buffStatus: { connected: true, lastValidatedAt: "2026-07-09T12:30:00.000Z", message: "BUFF session is available." },
      youpinStatus: { connected: true, lastValidatedAt: "2026-07-09T12:30:00.000Z", message: "YouPin session is available." },
      accountError: "",
      accountMessage: ""
    },
    pickSteamProfileForUser: (_user, profile) => profile || null,
    escapeHtml: (value) => String(value),
    uiText: (en, zh) => zh || en,
    uiTemplate: (template, values) => template.replace("{count}", String(values.count)),
    formatDateTime: (value) => value || "Never",
    localizePlatformMessage: (value) => value,
    accountFeedbackMarkup: () => "",
    lazyImageMarkup: ({ className, src, alt }) => `<img class="${className}" src="${src}" alt="${alt}" />`,
    safeInventoryCardMarkup: (item) => `<article class="inventory-item">${item.item_name || ""}</article>`,
    scheduleAuthFormAutofillClear: () => {},
    resolveAccountAvatarUrl: (...args) => context._resolveAccountAvatarUrl(...args),
    _resolveAccountAvatarUrl: () => "assets/default-account-avatar.png"
  };
  vm.createContext(context);
  const source = [
    extractFunctionSource(appSource, "steamAvatarUrl"),
    extractFunctionSource(appSource, "renderAccount"),
    "renderAccount();"
  ].join("\n");
  vm.runInContext(source, context);

  assert.match(root.innerHTML, /account-shell/);
  assert.match(root.innerHTML, /account-command-deck/);
  assert.match(root.innerHTML, /account-profile-stage/);
  assert.match(root.innerHTML, /account-avatar-upload/);
  assert.match(root.innerHTML, /id="accountAvatarInput"/);
  assert.match(root.innerHTML, /id="accountAvatarUploadButton"/);
  assert.match(root.innerHTML, /id="accountAvatarResetButton"/);
  assert.match(root.innerHTML, /id="accountSteamBindForm"/);
  assert.match(root.innerHTML, /id="syncSteamButton"/);
  assert.match(root.innerHTML, /id="startBuffLoginButton"/);
  assert.match(root.innerHTML, /id="startYoupinLoginButton"/);
  assert.match(root.innerHTML, /account-vault-strip/);
});
