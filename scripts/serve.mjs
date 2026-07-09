import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { generateLoadoutCandidates } from "../server/recommendation-engine.mjs";
import { rerankLoadoutsWithAI } from "../server/openai-recommender.mjs";
import { handleLoadoutChat } from "../server/loadout-chat.mjs";
import {
  applyPlatformRecordsToMarketSnapshot,
  buildMarketHashIndex,
  buildYoupinWearSearchJobs,
  normalizeMarketHashName,
  pickPreferredPlatformRecord,
  resolveMarketHashMatch,
  shouldBlockPlatformRefresh,
  shouldRefreshPlatformRecord,
  summarizeItemAnalysis,
  summarizeOpeningAnalysis,
  wearLabel
} from "../server/market-sync.mjs";
import { PRO_LOADOUT_TEAMS } from "./ai-data.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

async function loadDotEnv() {
  const envFile = join(root, ".env");
  const raw = await readFile(envFile, "utf8").catch(() => "");
  for (const line of raw.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/gu, "");
    process.env[key] = value;
  }
}

await loadDotEnv();
const dataDir = join(root, ".data");
const dbFile = join(dataDir, "cs2-relic-hall.db");
const marketPricesFile = join(dataDir, "market-prices.json");
const marketPricesScriptFile = join(dataDir, "market-prices.js");
const buffLinksFile = join(dataDir, "buff-links.json");
const youpinLinksFile = join(dataDir, "youpin-links.json");
const port = Number(process.env.PORT || 4173);
const sessionCookieName = "cs2_relic_hall_session_token";
const sessionTtlMs = 14 * 24 * 60 * 60 * 1000;
const syncIntervalMinutes = 60;
const edgeExecutableCandidates = [
  process.env.EDGE_PATH || "",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};
const platformLoginUrls = {
  buff: process.env.BUFF_LOGIN_URL || "https://buff.163.com/",
  youpin: process.env.YOUPIN_LOGIN_URL || "https://www.youpin898.com/"
};
const platformInspectHosts = {
  buff: ["buff.163.com"],
  youpin: ["youpin898.com", "www.youpin898.com"]
};
const platformBrowserRoots = {
  buff: join(dataDir, "buff-browser"),
  youpin: join(dataDir, "youpin-browser")
};
const youpinCommodityPageUrl = "https://api.youpin898.com/api/homepage/pc/commodity/page";
const youpinSaleTemplatePageUrl = "https://api.youpin898.com/api/homepage/pc/goods/market/querySaleTemplate";
const youpinCommodityPageSize = 200;
const youpinSaleTemplatePageSize = 20;
const youpinCacheFreshMs = 30 * 60 * 1000;
const youpinSinglePriceCacheFreshMs = Number(process.env.YOUPIN_SINGLE_PRICE_CACHE_MS || 30 * 60 * 1000);
const youpinRateLimitCooldownMs = Number(process.env.YOUPIN_RATE_LIMIT_COOLDOWN_MS || 3 * 60 * 1000);
const youpinDefaultHeaders = {
  "secret-v": process.env.YOUPIN_SECRET_VERSION || "h5_v1",
  appType: process.env.YOUPIN_APP_TYPE || "1",
  AppVersion: process.env.YOUPIN_APP_VERSION || "5.26.0",
  "App-Version": process.env.YOUPIN_APP_VERSION || "5.26.0",
  platform: process.env.YOUPIN_PLATFORM || "pc",
  origin: "https://www.youpin898.com",
  referer: "https://www.youpin898.com/"
};

await mkdir(dataDir, { recursive: true });
const db = new DatabaseSync(dbFile);
db.exec("PRAGMA foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    steam_id TEXT DEFAULT '',
    steam_bound_at TEXT,
    last_inventory_sync_at TEXT,
    last_inventory_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS steam_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    class_id TEXT,
    instance_id TEXT,
    market_hash_name TEXT,
    item_name TEXT NOT NULL,
    icon_url TEXT,
    tradable INTEGER NOT NULL DEFAULT 0,
    marketable INTEGER NOT NULL DEFAULT 0,
    rarity TEXT,
    item_type TEXT,
    exterior TEXT,
    collection_name TEXT,
    raw_json TEXT NOT NULL,
    synced_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS buff_sessions (
    user_id TEXT PRIMARY KEY,
    debug_port INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'disconnected',
    login_started_at TEXT,
    connected_at TEXT,
    last_validated_at TEXT,
    last_error TEXT,
    updated_at TEXT NOT NULL,
    auth_json TEXT,
    auth_updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS youpin_sessions (
    user_id TEXT PRIMARY KEY,
    debug_port INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'disconnected',
    login_started_at TEXT,
    connected_at TEXT,
    last_validated_at TEXT,
    last_error TEXT,
    updated_at TEXT NOT NULL,
    auth_json TEXT,
    auth_updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());

const selectUserByUsername = db.prepare(`
  SELECT id, username, password_hash, steam_id, steam_bound_at, last_inventory_sync_at, last_inventory_count, created_at, updated_at
  FROM users WHERE username = ?
`);
const selectUserById = db.prepare(`
  SELECT id, username, password_hash, steam_id, steam_bound_at, last_inventory_sync_at, last_inventory_count, created_at, updated_at
  FROM users WHERE id = ?
`);
const selectSessionByToken = db.prepare(`
  SELECT s.token, s.user_id, s.created_at, s.expires_at,
         u.id, u.username, u.password_hash, u.steam_id, u.steam_bound_at, u.last_inventory_sync_at, u.last_inventory_count, u.created_at AS user_created_at, u.updated_at AS user_updated_at
  FROM sessions s
  JOIN users u ON u.id = s.user_id
  WHERE s.token = ?
`);
const selectInventoryByUserId = db.prepare(`
  SELECT asset_id, class_id, instance_id, market_hash_name, item_name, icon_url, tradable, marketable, rarity, item_type, exterior, collection_name, raw_json, synced_at
  FROM steam_inventory
  WHERE user_id = ?
  ORDER BY id DESC
`);
const selectPlatformSession = {
  buff: db.prepare("SELECT * FROM buff_sessions WHERE user_id = ?"),
  youpin: db.prepare("SELECT * FROM youpin_sessions WHERE user_id = ?")
};
const upsertSession = db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)");
const deleteSession = db.prepare("DELETE FROM sessions WHERE token = ?");
const insertUser = db.prepare(`
  INSERT INTO users (id, username, password_hash, steam_id, steam_bound_at, last_inventory_sync_at, last_inventory_count, created_at, updated_at)
  VALUES (?, ?, ?, '', NULL, NULL, 0, ?, ?)
`);
const updateUserSteam = db.prepare(`
  UPDATE users
  SET steam_id = ?, steam_bound_at = ?, updated_at = ?
  WHERE id = ?
`);
const updateUserSyncMeta = db.prepare(`
  UPDATE users
  SET last_inventory_sync_at = ?, last_inventory_count = ?, updated_at = ?
  WHERE id = ?
`);
const upsertBuffSession = db.prepare(`
  INSERT INTO buff_sessions (user_id, debug_port, status, login_started_at, connected_at, last_validated_at, last_error, updated_at, auth_json, auth_updated_at)
  VALUES (?, 0, ?, ?, ?, ?, ?, ?, NULL, NULL)
  ON CONFLICT(user_id) DO UPDATE SET
    status = excluded.status,
    login_started_at = excluded.login_started_at,
    connected_at = excluded.connected_at,
    last_validated_at = excluded.last_validated_at,
    last_error = excluded.last_error,
    updated_at = excluded.updated_at
`);
const clearBuffSession = db.prepare("DELETE FROM buff_sessions WHERE user_id = ?");
const clearYoupinSession = db.prepare("DELETE FROM youpin_sessions WHERE user_id = ?");
const upsertYoupinSession = db.prepare(`
  INSERT INTO youpin_sessions (user_id, debug_port, status, login_started_at, connected_at, last_validated_at, last_error, updated_at, auth_json, auth_updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    debug_port = excluded.debug_port,
    status = excluded.status,
    login_started_at = excluded.login_started_at,
    connected_at = excluded.connected_at,
    last_validated_at = excluded.last_validated_at,
    last_error = excluded.last_error,
    updated_at = excluded.updated_at,
    auth_json = excluded.auth_json,
    auth_updated_at = excluded.auth_updated_at
`);
const youpinSyncState = {
  promise: null,
  startedAt: null,
  lastResult: null
};
const youpinSingleLookupState = {
  promises: new Map(),
  cooldownUntilMs: 0,
  lastRateLimitMessage: ""
};
const catalogRuntimeState = {
  promise: null,
  data: null
};

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildYoupinAuthFromSnapshot(snapshot) {
  const storage = snapshot?.localStorageValues && typeof snapshot.localStorageValues === "object" ? snapshot.localStorageValues : {};
  const uk = String(storage.WEB_UK || "").trim();
  const deviceUk = String(storage.WEB_DEVICE_UK || "").trim();
  const deviceId = String(storage.WEB_PC_UUID || "").trim();
  if (!uk || !deviceUk || !deviceId) return null;
  const cookies = Array.isArray(snapshot?.cookies) ? snapshot.cookies : [];
  const cookieHeader = cookies
    .filter((cookie) => cookie && cookie.name && cookie.value)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const authorization = String(cookies.find((cookie) => String(cookie?.name || "") === "uu_token")?.value || "").trim();
  return { uk, deviceUk, deviceId, cookieHeader, authorization };
}

async function openExternalBrowser(targetUrl) {
  const url = String(targetUrl || "").trim();
  if (!url) throw new Error("Missing browser URL.");
  const platform = process.platform;
  return new Promise((resolve, reject) => {
    let child;
    if (platform === "win32") {
      child = spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", windowsHide: true });
    } else if (platform === "darwin") {
      child = spawn("open", [url], { stdio: "ignore" });
    } else {
      child = spawn("xdg-open", [url], { stdio: "ignore" });
    }
    child.on("error", reject);
    child.on("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

function findEdgeExecutable() {
  return edgeExecutableCandidates.find((candidate) => !!candidate && existsSync(candidate)) || "";
}

function browserProfileDir(kind, userId) {
  const safeId = createHash("sha1").update(`${kind}:${userId}`).digest("hex").slice(0, 24);
  return join(platformBrowserRoots[kind], safeId);
}

async function fetchJsonMaybe(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Browser debug endpoint returned ${response.status}.`);
  }
  return response.json();
}

async function isDebugBrowserAlive(debugPort) {
  if (!Number.isInteger(debugPort) || debugPort <= 0) return false;
  try {
    await fetchJsonMaybe(`http://127.0.0.1:${debugPort}/json/version`);
    return true;
  } catch {
    return false;
  }
}

function pickDebugPort(kind, userId) {
  const digest = createHash("sha1").update(`${kind}:${userId}`).digest();
  const offset = digest.readUInt16BE(0) % 1000;
  return 9222 + offset;
}

async function openOrReuseDebugTarget(debugPort, targetUrl) {
  const versionInfo = await fetchJsonMaybe(`http://127.0.0.1:${debugPort}/json/version`);
  try {
    await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(targetUrl)}`, { method: "PUT" });
  } catch {
    // Some Edge builds reject /json/new; the existing browser window is still usable.
  }
  return versionInfo;
}

async function launchPlatformBrowser(kind, userId, targetUrl) {
  const edgeExecutable = findEdgeExecutable();
  if (!edgeExecutable) {
    throw new Error("Microsoft Edge is not installed, so the helper browser cannot be opened.");
  }
  const debugPort = pickDebugPort(kind, userId);
  const profileDir = browserProfileDir(kind, userId);
  await mkdir(profileDir, { recursive: true });
  const alreadyAlive = await isDebugBrowserAlive(debugPort);
  if (!alreadyAlive) {
    const args = [
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${debugPort}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--new-window",
      targetUrl
    ];
    const child = spawn(edgeExecutable, args, { stdio: "ignore", windowsHide: true });
    child.unref();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (!(await isDebugBrowserAlive(debugPort))) {
      throw new Error("The helper browser did not start correctly. Make sure Microsoft Edge can launch normally, then try again.");
    }
  } else {
    await openOrReuseDebugTarget(debugPort, targetUrl);
  }
  return { debugPort, profileDir };
}

function pickInspectableTarget(targets, kind) {
  const hosts = platformInspectHosts[kind] || [];
  const pages = Array.isArray(targets) ? targets.filter((target) => target?.type === "page" && target.webSocketDebuggerUrl) : [];
  return pages.find((target) => hosts.some((host) => String(target.url || "").includes(host))) || pages[0] || null;
}

async function cdpCommand(webSocketUrl, method, params = {}) {
  const ws = new WebSocket(webSocketUrl);
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9);
    const cleanup = () => {
      try {
        ws.close();
      } catch {}
    };
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ id, method, params }));
    });
    ws.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(String(event.data || "{}"));
        if (payload.id !== id) return;
        cleanup();
        if (payload.error) {
          reject(new Error(payload.error.message || `${method} failed.`));
          return;
        }
        resolve(payload.result || {});
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
    ws.addEventListener("error", (error) => {
      cleanup();
      reject(error);
    });
  });
}

async function inspectPlatformBrowser(kind, debugPort) {
  const targets = await fetchJsonMaybe(`http://127.0.0.1:${debugPort}/json/list`);
  const target = pickInspectableTarget(targets, kind);
  if (!target?.webSocketDebuggerUrl) {
    return {
      ok: false,
      reason: `${kind === "buff" ? "BUFF" : "YouPin"} helper browser is not open on a page yet.`
    };
  }
  const pageUrl = String(target.url || "");
  const cookiesResult = await cdpCommand(target.webSocketDebuggerUrl, "Network.getCookies", { urls: [pageUrl || platformLoginUrls[kind]] });
  const runtimeResult = await cdpCommand(
    target.webSocketDebuggerUrl,
    "Runtime.evaluate",
    {
      returnByValue: true,
      expression: `(() => ({
        href: location.href,
        title: document.title,
        localStorageKeys: Object.keys(localStorage),
        localStorageValues: Object.fromEntries(
          ["WEB_UK", "WEB_DEVICE_UK", "WEB_PC_UUID", "fp", "apmuuyp-web-pc"]
            .map((key) => [key, localStorage.getItem(key)])
            .filter((entry) => entry[1])
        ),
        sessionStorageKeys: Object.keys(sessionStorage),
        bodyText: (document.body?.innerText || "").slice(0, 500)
      }))()`
    }
  );
  const snapshot = runtimeResult?.result?.value || {};
  const cookies = Array.isArray(cookiesResult?.cookies) ? cookiesResult.cookies : [];
  const authCookies = cookies.filter((cookie) => /(token|session|auth|user|uid|login|jwt)/i.test(String(cookie?.name || "")));
  const storageKeys = [
    ...(Array.isArray(snapshot.localStorageKeys) ? snapshot.localStorageKeys : []),
    ...(Array.isArray(snapshot.sessionStorageKeys) ? snapshot.sessionStorageKeys : [])
  ].filter(Boolean);
  const bodyText = String(snapshot.bodyText || "");
  let looksLoggedIn = authCookies.length > 0
    || storageKeys.some((key) => /(token|session|auth|user|uid|login)/i.test(String(key)))
    || (cookies.length >= 2 && !/登录|注册|sign in|log in/i.test(bodyText));
  let reason = looksLoggedIn
    ? `${kind === "buff" ? "BUFF" : "YouPin"} login saved on the server.`
    : `${kind === "buff" ? "BUFF" : "YouPin"} login was not detected in the helper browser yet.`;
  if (kind === "youpin") {
    const auth = buildYoupinAuthFromSnapshot(snapshot);
    if (!auth) {
      looksLoggedIn = false;
      reason = "YouPin login is missing the required local auth values.";
    } else {
      looksLoggedIn = true;
      reason = "YouPin login saved on the server.";
    }
  }
  return {
    ok: looksLoggedIn,
    snapshot: {
      pageUrl: snapshot.href || pageUrl,
      title: snapshot.title || "",
      cookies: cookies.map((cookie) => ({
        name: String(cookie?.name || ""),
        value: String(cookie?.value || "")
      })).filter((cookie) => cookie.name && cookie.value),
      cookieNames: cookies.map((cookie) => String(cookie?.name || "")).filter(Boolean),
      localStorageKeys: Array.isArray(snapshot.localStorageKeys) ? snapshot.localStorageKeys : [],
      localStorageValues: snapshot.localStorageValues && typeof snapshot.localStorageValues === "object" ? snapshot.localStorageValues : {},
      sessionStorageKeys: Array.isArray(snapshot.sessionStorageKeys) ? snapshot.sessionStorageKeys : []
    },
    reason
  };
}

function json(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function staticCacheHeaders(filePath, requestUrl) {
  const extension = extname(filePath).toLowerCase();
  const pathname = decodeURIComponent(requestUrl.pathname || "");
  const hasVersion = requestUrl.searchParams.has("v");
  const cacheableAsset = hasVersion || pathname.startsWith("/assets/") || pathname.startsWith("/.data/") || [".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".woff", ".woff2"].includes(extension);
  if (!cacheableAsset || extension === ".html") {
    return {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    };
  }
  return {
    "Cache-Control": "public, max-age=31536000, immutable"
  };
}

function isPublicRecommendationRoute(pathname) {
  return pathname === "/api/recommendations/compose" || pathname === "/api/recommendations/chat" || pathname === "/api/ai/pro-loadouts";
}

function setSessionCookie(token) {
  return `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionTtlMs / 1000}`;
}

function clearSessionCookie() {
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function readCookies(request) {
  const header = request.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) return [part, ""];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400, code: "bad_json" }));
      }
    });
    request.on("error", reject);
  });
}

function normalizeUsername(value) {
  return String(value || "").trim();
}

function normalizeSteamId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const matched = raw.match(/7656119\d{10}/);
  return matched ? matched[0] : "";
}

function randomToken(length = 24) {
  return randomBytes(length).toString("hex");
}

function randomId() {
  return randomBytes(12).toString("hex");
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expectedHex] = String(stored || "").split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function buildSteamProfile(steamId) {
  const id = String(steamId || "").trim();
  if (!id) return null;
  return {
    steamId: id,
    personaName: "",
    profileUrl: `https://steamcommunity.com/profiles/${id}`,
    avatar: "",
    visibility: ""
  };
}

function mapUser(row) {
  if (!row) return null;
  const steamId = String(row.steam_id || "").trim();
  return {
    id: row.id,
    username: row.username,
    steamId,
    createdAt: row.created_at || row.user_created_at || null,
    updatedAt: row.updated_at || row.user_updated_at || null,
    steamBoundAt: row.steam_bound_at || null,
    lastInventorySyncAt: row.last_inventory_sync_at || null,
    lastInventoryCount: Number(row.last_inventory_count || 0),
    steamProfile: buildSteamProfile(steamId)
  };
}

function parseInventoryRow(row) {
  let raw = null;
  try {
    raw = row.raw_json ? JSON.parse(row.raw_json) : null;
  } catch {
    raw = null;
  }
  const descriptions = Array.isArray(raw?.description?.descriptions) ? raw.description.descriptions : [];
  const stickers = descriptions
    .flatMap((entry) => {
      const text = String(entry?.value || "");
      const matches = [...text.matchAll(/Sticker:\s*([^<\n]+)/gi)];
      return matches.map((match) => ({ name: String(match[1] || "").trim(), image: "" }));
    })
    .filter((entry) => entry.name)
    .slice(0, 5);
  return {
    asset_id: row.asset_id,
    class_id: row.class_id || "",
    instance_id: row.instance_id || "",
    market_hash_name: row.market_hash_name || "",
    item_name: row.item_name || row.market_hash_name || "",
    icon_url: row.icon_url || "",
    tradable: Number(row.tradable || 0),
    marketable: Number(row.marketable || 0),
    rarity: row.rarity || "",
    item_type: row.item_type || "",
    exterior: row.exterior || "",
    collection_name: row.collection_name || "",
    synced_at: row.synced_at || null,
    stickers
  };
}

function readInventoryPreview(userId) {
  const rows = selectInventoryByUserId.all(userId);
  const items = rows.map(parseInventoryRow);
  return {
    ok: true,
    count: items.length,
    syncedAt: items[0]?.synced_at || null,
    items
  };
}

function buildSyncStatus() {
  const now = Date.now();
  return {
    intervalMinutes: syncIntervalMinutes,
    running: false,
    lastRunAt: null,
    nextRunAt: new Date(now + syncIntervalMinutes * 60 * 1000).toISOString()
  };
}

function buildPlatformStatus(kind, userId) {
  const row = selectPlatformSession[kind].get(userId);
  if (!row) {
    return {
      status: "not_started",
      connected: false,
      lastValidatedAt: null,
      message: kind === "buff"
        ? "Connect BUFF to unlock live BUFF prices."
        : "Connect YouPin to unlock live YouPin prices."
    };
  }
  return {
    status: row.status || "not_started",
    connected: row.status === "connected",
    lastValidatedAt: row.last_validated_at || null,
    message: row.last_error || (row.status === "connected"
      ? `${kind === "buff" ? "BUFF" : "YouPin"} session is available.`
      : `${kind === "buff" ? "BUFF" : "YouPin"} login is not ready yet.`)
  };
}

function buildOverview(user) {
  if (!user) {
    return {
      authenticated: false,
      user: null,
      inventory: { ok: true, count: 0, syncedAt: null, items: [] },
      steamProfile: null,
      steamKeyStatus: { configured: false },
      syncStatus: buildSyncStatus(),
      buffStatus: null,
      youpinStatus: null
    };
  }
  return {
    authenticated: true,
    user,
    inventory: readInventoryPreview(user.id),
    steamProfile: { ok: true, profile: buildSteamProfile(user.steamId) },
    steamKeyStatus: { configured: false },
    syncStatus: buildSyncStatus(),
    buffStatus: buildPlatformStatus("buff", user.id),
    youpinStatus: buildPlatformStatus("youpin", user.id)
  };
}

function authTokenFromRequest(request) {
  const auth = String(request.headers.authorization || "").trim();
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return readCookies(request)[sessionCookieName] || "";
}

function readAuthenticatedUser(request) {
  const token = authTokenFromRequest(request);
  if (!token) return { token: "", user: null };
  const session = selectSessionByToken.get(token);
  if (!session) return { token, user: null };
  if (Date.parse(session.expires_at) <= Date.now()) {
    deleteSession.run(token);
    return { token, user: null };
  }
  return { token, user: mapUser(session) };
}

async function handleRegister(request, response) {
  const body = await readBody(request);
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  if (username.length < 3 || username.length > 24 || password.length < 6) {
    json(response, 400, { code: "invalid_credentials", error: "Invalid username or password." });
    return;
  }
  if (selectUserByUsername.get(username)) {
    json(response, 409, { code: "account_exists", error: "Account already exists." });
    return;
  }
  const createdAt = nowIso();
  const userId = randomId();
  insertUser.run(userId, username, hashPassword(password), createdAt, createdAt);
  const token = randomToken();
  upsertSession.run(token, userId, createdAt, new Date(Date.now() + sessionTtlMs).toISOString());
  const user = mapUser(selectUserById.get(userId));
  json(response, 200, { sessionToken: token, user }, { "Set-Cookie": setSessionCookie(token) });
}

async function handleLogin(request, response) {
  const body = await readBody(request);
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const row = selectUserByUsername.get(username);
  if (!row) {
    json(response, 404, { code: "account_not_found", error: "Account not found." });
    return;
  }
  if (!verifyPassword(password, row.password_hash)) {
    json(response, 401, { code: "bad_password", error: "Password is incorrect." });
    return;
  }
  const createdAt = nowIso();
  const token = randomToken();
  upsertSession.run(token, row.id, createdAt, new Date(Date.now() + sessionTtlMs).toISOString());
  json(response, 200, { sessionToken: token, user: mapUser(row) }, { "Set-Cookie": setSessionCookie(token) });
}

async function handleLogout(request, response) {
  const token = authTokenFromRequest(request);
  if (token) deleteSession.run(token);
  json(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
}

async function handleSteamBind(request, response, user) {
  const body = await readBody(request);
  const steamId = normalizeSteamId(body.steamId);
  if (!steamId) {
    json(response, 400, { code: "invalid_steam_id", error: "Please enter a valid SteamID64." });
    return;
  }
  const updatedAt = nowIso();
  updateUserSteam.run(steamId, updatedAt, updatedAt, user.id);
  const nextUser = mapUser(selectUserById.get(user.id));
  json(response, 200, { user: nextUser, profile: buildSteamProfile(steamId) });
}

async function handleSteamSync(_request, response, user) {
  const preview = readInventoryPreview(user.id);
  const syncedAt = nowIso();
  updateUserSyncMeta.run(syncedAt, preview.count, syncedAt, user.id);
  json(response, 200, {
    ok: true,
    count: preview.count,
    syncedAt,
    items: preview.items,
    profile: buildSteamProfile(user.steamId)
  });
}

async function handleBuffConnectStart(_request, response, user) {
  const timestamp = nowIso();
  try {
    const { debugPort } = await launchPlatformBrowser("buff", user.id, platformLoginUrls.buff);
    upsertBuffSession.run(user.id, "pending", timestamp, null, null, "Open BUFF login", timestamp);
    db.prepare("UPDATE buff_sessions SET debug_port = ? WHERE user_id = ?").run(debugPort, user.id);
    json(response, 200, { ok: true, status: buildPlatformStatus("buff", user.id) });
  } catch (error) {
    json(response, 500, { code: "helper_browser_start_failed", error: error.message || "BUFF helper browser failed to start." });
  }
}

async function handleBuffConnectStatus(_request, response, user) {
  const row = selectPlatformSession.buff.get(user.id);
  if (row?.debug_port) {
    try {
      const inspection = await inspectPlatformBrowser("buff", Number(row.debug_port));
      const timestamp = nowIso();
      if (inspection.ok) {
        upsertBuffSession.run(user.id, "connected", row.login_started_at || timestamp, timestamp, timestamp, inspection.reason, timestamp);
        db.prepare("UPDATE buff_sessions SET debug_port = ?, auth_json = ?, auth_updated_at = ? WHERE user_id = ?")
          .run(Number(row.debug_port), JSON.stringify(inspection.snapshot || {}), timestamp, user.id);
      } else {
        upsertBuffSession.run(user.id, "pending", row.login_started_at || timestamp, null, timestamp, inspection.reason, timestamp);
        db.prepare("UPDATE buff_sessions SET debug_port = ? WHERE user_id = ?").run(Number(row.debug_port), user.id);
      }
    } catch (error) {
      const timestamp = nowIso();
      upsertBuffSession.run(user.id, "pending", row.login_started_at || timestamp, null, timestamp, error.message || "BUFF login validation failed.", timestamp);
      db.prepare("UPDATE buff_sessions SET debug_port = ? WHERE user_id = ?").run(Number(row.debug_port || 0), user.id);
    }
  }
  json(response, 200, { ok: true, status: buildPlatformStatus("buff", user.id) });
}

async function handleBuffDisconnect(_request, response, user) {
  clearBuffSession.run(user.id);
  json(response, 200, { ok: true });
}

async function handleYoupinConnectStart(_request, response, user) {
  const timestamp = nowIso();
  try {
    const { debugPort } = await launchPlatformBrowser("youpin", user.id, platformLoginUrls.youpin);
    upsertYoupinSession.run(user.id, debugPort, "pending", timestamp, null, null, "Open YouPin login", timestamp, null, null);
    json(response, 200, { ok: true, status: buildPlatformStatus("youpin", user.id) });
  } catch (error) {
    json(response, 500, { code: "helper_browser_start_failed", error: error.message || "YouPin helper browser failed to start." });
  }
}

async function handleYoupinConnectStatus(_request, response, user) {
  const row = selectPlatformSession.youpin.get(user.id);
  if (row?.debug_port) {
    try {
      const inspection = await inspectPlatformBrowser("youpin", Number(row.debug_port));
      const timestamp = nowIso();
      if (inspection.ok) {
        upsertYoupinSession.run(
          user.id,
          Number(row.debug_port),
          "connected",
          row.login_started_at || timestamp,
          timestamp,
          timestamp,
          inspection.reason,
          timestamp,
          JSON.stringify(inspection.snapshot || {}),
          timestamp
        );
      } else {
        upsertYoupinSession.run(
          user.id,
          Number(row.debug_port),
          "pending",
          row.login_started_at || timestamp,
          null,
          timestamp,
          inspection.reason,
          timestamp,
          row.auth_json || null,
          row.auth_updated_at || null
        );
      }
    } catch (error) {
      const timestamp = nowIso();
      upsertYoupinSession.run(
        user.id,
        Number(row.debug_port || 0),
        "pending",
        row.login_started_at || timestamp,
        null,
        timestamp,
        error.message || "YouPin login validation failed.",
        timestamp,
        row.auth_json || null,
        row.auth_updated_at || null
      );
    }
  }
  json(response, 200, { ok: true, status: buildPlatformStatus("youpin", user.id) });
}

async function handleYoupinDisconnect(_request, response, user) {
  clearYoupinSession.run(user.id);
  json(response, 200, { ok: true });
}

function buildYoupinAuth(sessionRow) {
  const auth = safeJsonParse(sessionRow?.auth_json, {}) || {};
  return buildYoupinAuthFromSnapshot(auth);
}

async function fetchYoupinCommodityPage(auth, pageNum = 1, pageSize = youpinCommodityPageSize, keywordValue = "") {
  const keyword = String(keywordValue || "").trim();
  const pageIndex = Math.max(1, Number(pageNum) || 1);
  const size = Math.max(1, Number(pageSize) || youpinCommodityPageSize);
  const body = {
    gameId: 730,
    businessType: 10,
    pageNum: pageIndex,
    pageIndex,
    current: pageIndex,
    page: pageIndex,
    pageSize: size,
    size
  };
  if (keyword) {
    Object.assign(body, {
      keyword,
      keyWord: keyword,
      keyWords: keyword,
      commodityName: keyword
    });
  };
  const response = await fetch(youpinCommodityPageUrl, {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "content-type": "application/json;charset=UTF-8",
      ...youpinDefaultHeaders,
      deviceId: auth.deviceId,
      deviceUk: auth.deviceUk,
      uk: auth.uk,
      ...(auth.authorization ? { authorization: auth.authorization } : {}),
      ...(auth.cookieHeader ? { cookie: auth.cookieHeader } : {})
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 429 || Number(payload?.Code ?? payload?.code) === 85100) {
      throw youpinRateLimitError();
    }
    throw new Error(String(payload?.Msg || payload?.msg || `YouPin commodity sync failed with status ${response.status}.`));
  }
  const code = Number(payload?.Code ?? payload?.code);
  const data = payload?.Data ?? payload?.data;
  if (code !== 0 || !data) {
    if (response.status === 429 || code === 85100) {
      throw youpinRateLimitError();
    }
    throw new Error(String(payload?.Msg || payload?.msg || "YouPin commodity sync returned an invalid payload."));
  }
  return data;
}

async function fetchYoupinSaleTemplatePage(auth, pageIndex = 1, pageSize = youpinSaleTemplatePageSize, keywordValue = "") {
  const keyword = String(keywordValue || "").trim();
  const currentPage = Math.max(1, Number(pageIndex) || 1);
  const size = Math.max(1, Number(pageSize) || youpinSaleTemplatePageSize);
  const body = {
    gameId: 730,
    listType: "10",
    pageIndex: currentPage,
    pageSize: size,
    listSortType: 0,
    sortType: 0
  };
  if (keyword) body.keyWords = keyword;
  const response = await fetch(youpinSaleTemplatePageUrl, {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "content-type": "application/json;charset=UTF-8",
      ...youpinDefaultHeaders,
      deviceId: auth.deviceId,
      deviceUk: auth.deviceUk,
      uk: auth.uk,
      ...(auth.authorization ? { authorization: auth.authorization } : {}),
      ...(auth.cookieHeader ? { cookie: auth.cookieHeader } : {})
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 429 || Number(payload?.Code ?? payload?.code) === 85100) {
      throw youpinRateLimitError();
    }
    throw new Error(String(payload?.Msg || payload?.msg || `YouPin sale template sync failed with status ${response.status}.`));
  }
  const code = Number(payload?.Code ?? payload?.code);
  if (code !== 0) {
    if (response.status === 429 || code === 85100) {
      throw youpinRateLimitError();
    }
    throw new Error(String(payload?.Msg || payload?.msg || "YouPin sale template sync returned an invalid payload."));
  }
  const contents = Array.isArray(payload?.Data)
    ? payload.Data
    : (Array.isArray(payload?.data) ? payload.data : []);
  const totalCount = Number(payload?.TotalCount ?? payload?.totalCount ?? contents.length) || 0;
  return {
    contents,
    totalCount,
    totalPages: totalCount > 0 ? Math.max(1, Math.ceil(totalCount / size)) : 1
  };
}

async function fetchYoupinUserInfo(auth) {
  const response = await fetch("https://api.youpin898.com/api/user/Account/GetUserInfo", {
    headers: {
      accept: "application/json, text/plain, */*",
      ...youpinDefaultHeaders,
      deviceId: auth.deviceId,
      deviceUk: auth.deviceUk,
      uk: auth.uk,
      ...(auth.authorization ? { authorization: auth.authorization } : {}),
      ...(auth.cookieHeader ? { cookie: auth.cookieHeader } : {})
    }
  });
  if (!response.ok) throw new Error(`YouPin user info check failed with status ${response.status}.`);
  return response.json();
}

function mergeYoupinCommodity(items, match, content, updatedAt) {
  const wearKey = match.wearId || "default";
  const storageKey = `${match.itemId}:${match.variantId}:${wearKey}`;
  items[storageKey] = {
    itemId: match.itemId,
    variantId: match.variantId,
    wearId: match.wearId,
    commodityId: String(content?.id || ""),
    url: content?.id ? `https://www.youpin898.com/goods/${content.id}` : "",
    marketHashName: String(content?.commodityHashName || ""),
    price: Number(content?.price) || 0,
    referencePrice: Number(content?.steamPrice) || 0,
    sellNum: Number(content?.onSaleCount) || 0,
    updatedAt
  };
  return storageKey;
}

function catalogYoupinMarketHashName(catalogItem, wearId = "") {
  const baseName = String(catalogItem?.nameEn || catalogItem?.marketHashName || catalogItem?.name || "").trim();
  if (!baseName) return "";
  const label = wearLabel(wearId);
  if (!label || /\(\s*(Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\s*\)\s*$/iu.test(baseName)) {
    return baseName;
  }
  return `${baseName} (${label})`;
}

function youpinRateLimitError(message = "YouPin request was rate limited. Please wait a moment and try again.") {
  const error = new Error(message);
  error.code = "youpin_rate_limited";
  return error;
}

function markYoupinRateLimit(message = "") {
  youpinSingleLookupState.cooldownUntilMs = Date.now() + youpinRateLimitCooldownMs;
  youpinSingleLookupState.lastRateLimitMessage = message || "YouPin request was rate limited. Please wait a moment and try again.";
}

async function fetchYoupinSingleRecordForUser(userId, { itemId = "", variantId = "standard", wearId = "", marketHashName = "" } = {}) {
  if (!userId || !itemId) return null;
  const sessionRow = selectPlatformSession.youpin.get(userId);
  if (sessionRow?.status !== "connected") return null;
  const auth = buildYoupinAuth(sessionRow);
  if (!auth) return null;
  const marketSnapshot = await loadMarketPricesSnapshot();
  const { catalog = [], openings = [] } = await loadCatalogRuntimeData();
  const marketIndex = buildMarketHashIndex(marketSnapshot, [...catalog, ...openings]);
  const normalizedVariantId = String(variantId || "standard").trim() || "standard";
  const normalizedWearId = String(wearId || "").trim();
  const existingSnapshot = await loadPlatformLinksSnapshot("youpin");
  const updatedAt = nowIso();
  const mergedItems = { ...(existingSnapshot.items || {}) };
  const snapshotRecord = marketSnapshot.items?.[itemId] || null;
  let fallbackMarketHashName = String(marketHashName || "").trim();
  if (!fallbackMarketHashName && !snapshotRecord) {
    const catalogItem = [...catalog, ...openings].find((item) => String(item?.id || "") === itemId);
    fallbackMarketHashName = catalogYoupinMarketHashName(catalogItem, normalizedWearId);
  }
  const jobs = buildYoupinWearSearchJobs({
    itemId,
    wearId: normalizedWearId,
    variantId: normalizedVariantId,
    snapshotRecord,
    marketHashName: fallbackMarketHashName
  });
  if (!jobs.length) return null;
  for (const job of jobs) {
    const page = await fetchYoupinSaleTemplatePage(auth, 1, youpinSaleTemplatePageSize, job.marketHashName);
    const contents = page.contents;
    const matchedContent = contents.find((content) => {
      const resolution = resolveMarketHashMatch(marketIndex, String(content?.commodityHashName || ""));
      const match = resolution.match;
      if (match) {
        if (match.itemId !== itemId) return false;
        if (String(match.variantId || "standard") !== normalizedVariantId) return false;
        return String(match.wearId || "") === String(job.wearId || "");
      }
      return normalizeMarketHashName(content?.commodityHashName || "") === normalizeMarketHashName(job.marketHashName);
    });
    if (!matchedContent) continue;
    const resolution = resolveMarketHashMatch(marketIndex, String(matchedContent?.commodityHashName || ""));
    const resolvedMatch = resolution.match || {
      itemId,
      variantId: normalizedVariantId,
      wearId: job.wearId || normalizedWearId
    };
    const storageKey = mergeYoupinCommodity(mergedItems, resolvedMatch, matchedContent, updatedAt);
    const matchedRecord = mergedItems[storageKey] || null;
    const output = {
      ...existingSnapshot,
      updatedAt,
      source: "YouPin item wear search",
      itemCount: Object.keys(mergedItems).length,
      items: mergedItems
    };
    if (matchedRecord) {
      await persistPlatformRecordsToMarketPrices([matchedRecord], { source: "YouPin", updatedAt });
      await writeFile(youpinLinksFile, JSON.stringify(output, null, 2), "utf8");
      return matchedRecord;
    }
  }
  return null;
}

async function fetchYoupinSingleRecordForUserOnce(userId, { itemId = "", variantId = "standard", wearId = "", marketHashName = "" } = {}) {
  const key = [
    String(userId || ""),
    String(itemId || ""),
    String(variantId || "standard"),
    String(wearId || ""),
    String(marketHashName || "")
  ].join("::");
  if (youpinSingleLookupState.promises.has(key)) return youpinSingleLookupState.promises.get(key);
  const promise = fetchYoupinSingleRecordForUser(userId, { itemId, variantId, wearId, marketHashName })
    .finally(() => {
      youpinSingleLookupState.promises.delete(key);
    });
  youpinSingleLookupState.promises.set(key, promise);
  return promise;
}

async function syncYoupinLinksForUser(userId, { force = false } = {}) {
  if (youpinSyncState.promise) return youpinSyncState.promise;
  const run = (async () => {
    const existingSnapshot = await loadPlatformLinksSnapshot("youpin");
    const existingCount = Object.keys(existingSnapshot.items || {}).length;
    if (!force && existingCount > 500 && existingSnapshot.updatedAt && Date.now() - Date.parse(existingSnapshot.updatedAt) < youpinCacheFreshMs) {
      return {
        ok: true,
        skipped: true,
        updatedAt: existingSnapshot.updatedAt,
        itemCount: existingCount,
        matchedCount: existingCount,
        exactMatchedCount: 0,
        normalizedMatchedCount: 0,
        ambiguousCount: 0,
        unmatchedCount: 0
      };
    }
    let sessionRow = selectPlatformSession.youpin.get(userId);
    if (!sessionRow) throw new Error("YouPin login required.");
    if (!buildYoupinAuth(sessionRow) && Number(sessionRow.debug_port) > 0) {
      const inspection = await inspectPlatformBrowser("youpin", Number(sessionRow.debug_port));
      if (inspection.ok) {
        const timestamp = nowIso();
        upsertYoupinSession.run(
          userId,
          Number(sessionRow.debug_port),
          "connected",
          sessionRow.login_started_at || timestamp,
          sessionRow.connected_at || timestamp,
          timestamp,
          inspection.reason,
          timestamp,
          JSON.stringify(inspection.snapshot || {}),
          timestamp
        );
        sessionRow = selectPlatformSession.youpin.get(userId);
      }
    }
    const auth = buildYoupinAuth(sessionRow);
    if (!auth) throw new Error("YouPin live price auth is missing. Please validate the YouPin login again.");
    const marketSnapshot = await loadMarketPricesSnapshot();
    const { catalog = [], openings = [] } = await loadCatalogRuntimeData();
    const marketIndex = buildMarketHashIndex(marketSnapshot, [...catalog, ...openings]);
    const mergedItems = { ...(existingSnapshot.items || {}) };
    let pageNum = 1;
    let totalPages = 1;
    let scannedCount = 0;
    let matchedCount = 0;
    let exactMatchedCount = 0;
    let normalizedMatchedCount = 0;
    let ambiguousCount = 0;
    let unmatchedCount = 0;
    const seenPageSignatures = new Set();
    const updatedAt = nowIso();
    while (pageNum <= totalPages) {
      const page = await fetchYoupinSaleTemplatePage(auth, pageNum, youpinSaleTemplatePageSize);
      const totalCount = page.totalCount;
      totalPages = page.totalPages;
      const contents = page.contents;
      const pageSignature = contents.map((content) => String(content?.id || content?.commodityId || content?.commodityHashName || "")).join("|");
      if (pageNum > 1 && pageSignature && seenPageSignatures.has(pageSignature)) break;
      if (pageSignature) seenPageSignatures.add(pageSignature);
      scannedCount += contents.length;
      for (const content of contents) {
        const marketHashName = String(content?.commodityHashName || "").trim();
        if (!marketHashName) continue;
        const resolution = resolveMarketHashMatch(marketIndex, marketHashName);
        const match = resolution.match;
        if (!match) {
          if (resolution.mode === "ambiguous") ambiguousCount += 1;
          else unmatchedCount += 1;
          continue;
        }
        mergeYoupinCommodity(mergedItems, match, content, updatedAt);
        matchedCount += 1;
        if (resolution.mode === "exact") exactMatchedCount += 1;
        else normalizedMatchedCount += 1;
      }
      pageNum += 1;
    }
    const output = {
      updatedAt,
      source: "YouPin commodity page",
      scannedCount,
      matchedCount,
      exactMatchedCount,
      normalizedMatchedCount,
      ambiguousCount,
      unmatchedCount,
      itemCount: Object.keys(mergedItems).length,
      items: mergedItems
    };
    await writeFile(youpinLinksFile, JSON.stringify(output, null, 2), "utf8");
    return {
      ok: true,
      skipped: false,
      updatedAt,
      scannedCount,
      matchedCount,
      exactMatchedCount,
      normalizedMatchedCount,
      ambiguousCount,
      unmatchedCount,
      itemCount: output.itemCount
    };
  })();
  youpinSyncState.promise = run;
  youpinSyncState.startedAt = nowIso();
  try {
    const result = await run;
    youpinSyncState.lastResult = result;
    return result;
  } finally {
    youpinSyncState.promise = null;
  }
}

async function handlePriceSyncRun(request, response, user) {
  const body = await readBody(request);
  const itemId = String(body?.itemId || "").trim();
  if (!itemId) {
    json(response, 200, {
      ok: false,
      code: "single_item_required",
      message: "Full YouPin price sync is disabled. Pass itemId, wearId, and variantId to sync one item.",
      youpin: {
        ok: false,
        skipped: true,
        itemCount: 0,
        matchedCount: 0
      }
    });
    return;
  }
  const wearId = String(body?.wearId || body?.wear || "").trim();
  const variantId = String(body?.variantId || body?.variant || "standard").trim() || "standard";
  if (shouldBlockPlatformRefresh({ cooldownUntilMs: youpinSingleLookupState.cooldownUntilMs })) {
    json(response, 429, {
      ok: false,
      code: "youpin_rate_limited",
      message: youpinSingleLookupState.lastRateLimitMessage || "YouPin request was rate limited. Please wait a moment and try again.",
      retryAt: new Date(youpinSingleLookupState.cooldownUntilMs).toISOString()
    });
    return;
  }
  let record = null;
  try {
    record = await fetchYoupinSingleRecordForUserOnce(user.id, { itemId, wearId, variantId });
  } catch (error) {
    if (error?.code === "youpin_rate_limited") markYoupinRateLimit(error.message);
    throw error;
  }
  json(response, 200, {
    ok: !!record,
    startedAt: nowIso(),
    youpin: {
      ok: !!record,
      skipped: false,
      itemCount: record ? 1 : 0,
      matchedCount: record ? 1 : 0,
      record
    }
  });
}

async function loadMarketPricesSnapshot() {
  try {
    return JSON.parse(await readFile(marketPricesFile, "utf8"));
  } catch {
    return { updatedAt: null, items: {} };
  }
}

async function writeMarketPricesSnapshot(snapshot) {
  const jsonText = JSON.stringify(snapshot, null, 2);
  await Promise.all([
    writeFile(marketPricesFile, jsonText, "utf8"),
    writeFile(marketPricesScriptFile, `globalThis.CS2_MARKET_PRICES = ${jsonText};\n`, "utf8")
  ]);
}

async function persistPlatformRecordsToMarketPrices(records, { source = "platform", updatedAt = nowIso() } = {}) {
  const validRecords = (Array.isArray(records) ? records : []).filter((record) => Number(record?.price) > 0);
  if (!validRecords.length) return { changedCount: 0 };
  const snapshot = await loadMarketPricesSnapshot();
  const result = applyPlatformRecordsToMarketSnapshot(snapshot, validRecords, { source, updatedAt });
  if (result.changedCount > 0) await writeMarketPricesSnapshot(result.snapshot);
  return result;
}

async function loadPlatformLinksSnapshot(kind) {
  const filePath = kind === "buff" ? buffLinksFile : youpinLinksFile;
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return { updatedAt: null, items: {} };
  }
}

async function loadCatalogRuntimeData() {
  if (catalogRuntimeState.data) return catalogRuntimeState.data;
  if (!catalogRuntimeState.promise) {
    catalogRuntimeState.promise = (async () => {
      const raw = await readFile(join(root, "catalog-data.js"), "utf8");
      const sandbox = { globalThis: {} };
      runInNewContext(raw, sandbox, { timeout: 1000 });
      const data = {
        catalog: Array.isArray(sandbox.globalThis.CS2_CATALOG) ? sandbox.globalThis.CS2_CATALOG : [],
        openings: Array.isArray(sandbox.globalThis.CS2_UNBOXING) ? sandbox.globalThis.CS2_UNBOXING : []
      };
      catalogRuntimeState.data = data;
      return data;
    })().finally(() => {
      catalogRuntimeState.promise = null;
    });
  }
  return catalogRuntimeState.promise;
}

function lookupPlatformLinkRecord(snapshot, itemId, variantId = "standard", wearId = "") {
  const items = snapshot?.items && typeof snapshot.items === "object" ? snapshot.items : {};
  const normalizedVariantId = String(variantId || "standard").trim() || "standard";
  const normalizedWearId = String(wearId || "").trim();
  const keys = normalizedVariantId === "standard"
    ? [
      `${itemId}:standard:${normalizedWearId || "default"}`,
      `${itemId}:standard:default`
    ]
    : [
      `${itemId}:${normalizedVariantId}:${normalizedWearId || "default"}`,
      `${itemId}:${normalizedVariantId}:default`
    ];
  for (const key of keys) {
    if (items[key]) return items[key];
  }
  return null;
}

function buildPlatformPricePayload(kind, sessionRow, record, snapshotUpdatedAt, lookupError = "") {
  const label = kind === "buff" ? "BUFF" : "YouPin";
  const price = Number(record?.price);
  if (Number.isFinite(price) && price > 0) {
    const usingCachedPrice = Boolean(lookupError);
    return {
      label,
      price,
      status: sessionRow?.status === "connected" && !usingCachedPrice ? "ok" : "cached",
      url: record?.url || "",
      updatedAt: record?.updatedAt || snapshotUpdatedAt || null,
      message: usingCachedPrice
        ? `${label} request was rate limited, showing the last cached price.`
        : (sessionRow?.status === "connected" ? `${label} live price loaded.` : `${label} synced price loaded from cache.`)
    };
  }
  if (!sessionRow || sessionRow.status !== "connected") {
    return {
      label,
      price: null,
      status: "login_required",
      message: `${label} login required.`
    };
  }
  if (lookupError) {
    return {
      label,
      price: null,
      status: "error",
      updatedAt: snapshotUpdatedAt || null,
      message: lookupError
    };
  }
  return {
    label,
    price: null,
    status: "unavailable",
    updatedAt: snapshotUpdatedAt || null,
    message: snapshotUpdatedAt ? `${label} synced cache has no matching price for this item.` : `${label} price unavailable.`
  };
}

function snapshotPriceFromRecord(record, wearId = "") {
  const prices = record?.prices && typeof record.prices === "object" ? record.prices : {};
  const exactKey = String(wearId || "").trim() || "default";
  const exact = Number(prices[exactKey]?.price);
  if (Number.isFinite(exact) && exact > 0) return { wearId: exactKey === "default" ? "" : exactKey, price: exact, record: prices[exactKey] };
  const first = Object.entries(prices)
    .map(([key, value]) => ({ wearId: key === "default" ? "" : key, price: Number(value?.price), record: value }))
    .filter((entry) => Number.isFinite(entry.price) && entry.price > 0)
    .sort((left, right) => left.price - right.price)[0];
  return first || null;
}

function priceOverridePayload(itemId, wearId, variantId, priceEntry, updatedAt) {
  const normalizedWear = String(wearId || priceEntry?.wearId || "").trim();
  const normalizedVariant = String(variantId || "standard").trim() || "standard";
  const price = Number(priceEntry?.price);
  if (!itemId || !Number.isFinite(price) || price <= 0) return null;
  return {
    itemId,
    wearId: normalizedWear,
    variantId: normalizedVariant,
    effectivePrice: price,
    effectiveSource: "snapshot",
    updatedAt: updatedAt || null,
    marketHashName: String(priceEntry?.record?.marketHashName || "")
  };
}

function minimalBatchPriceRecord(itemId, override) {
  const price = Number(override?.effectivePrice);
  if (!itemId || !Number.isFinite(price) || price <= 0) return null;
  return {
    id: itemId,
    prices: {
      default: {
        price,
        marketHashName: String(override?.marketHashName || ""),
        source: String(override?.effectiveSource || "snapshot"),
        updatedAt: override?.updatedAt || null
      }
    }
  };
}

function preferredReferencePayload({ itemId, wearId = "", variantId = "standard", buffRecord = null, youpinRecord = null, snapshotEntry = null, snapshotUpdatedAt = null }) {
  const requestedWearId = String(wearId || snapshotEntry?.wearId || "").trim();
  const normalizedVariantId = String(variantId || "standard").trim() || "standard";
  const preferredPlatform = pickPreferredPlatformRecord({ buffRecord, youpinRecord });
  if (preferredPlatform?.sourceKey === "buff") {
    const matchedWearId = String(preferredPlatform.record?.wearId || requestedWearId).trim();
    return {
      itemId,
      wearId: matchedWearId,
      variantId: normalizedVariantId,
      effectivePrice: Number(preferredPlatform.record.price),
      effectiveSource: "buff",
      updatedAt: preferredPlatform.record?.updatedAt || snapshotUpdatedAt || null,
      marketHashName: String(preferredPlatform.record?.marketHashName || snapshotEntry?.record?.marketHashName || "")
    };
  }
  if (preferredPlatform?.sourceKey === "youpin") {
    const matchedWearId = String(preferredPlatform.record?.wearId || requestedWearId).trim();
    return {
      itemId,
      wearId: matchedWearId,
      variantId: normalizedVariantId,
      effectivePrice: Number(preferredPlatform.record.price),
      effectiveSource: "youpin",
      updatedAt: preferredPlatform.record?.updatedAt || snapshotUpdatedAt || null,
      marketHashName: String(preferredPlatform.record?.marketHashName || snapshotEntry?.record?.marketHashName || "")
    };
  }
  return priceOverridePayload(itemId, requestedWearId, normalizedVariantId, snapshotEntry, snapshotUpdatedAt);
}

function buildPersistentReferenceRecord({ syncedOverride = null, buffRecord = null, youpinRecord = null, snapshotEntry = null } = {}) {
  const sourceKey = String(syncedOverride?.effectiveSource || "").trim();
  if (sourceKey !== "buff" && sourceKey !== "youpin") return null;
  const source = sourceKey === "buff" ? "BUFF" : "YouPin";
  const platformRecord = sourceKey === "buff" ? buffRecord : youpinRecord;
  const price = Number(platformRecord?.price);
  if (!Number.isFinite(price) || price <= 0 || !syncedOverride?.itemId) return null;
  const updatedAt = String(platformRecord?.updatedAt || syncedOverride?.updatedAt || "").trim();
  const snapshotPrice = Number(snapshotEntry?.record?.price ?? snapshotEntry?.price);
  const snapshotSource = String(snapshotEntry?.record?.source || "").trim();
  const snapshotUpdatedAt = String(snapshotEntry?.record?.updatedAt || "").trim();
  const snapshotUpdatedAtMs = Date.parse(snapshotUpdatedAt);
  const nextUpdatedAtMs = Date.parse(updatedAt);
  const snapshotAlreadyCurrent = Number.isFinite(snapshotPrice)
    && snapshotPrice === price
    && snapshotSource.toLowerCase() === source.toLowerCase()
    && (
      (!updatedAt && !snapshotUpdatedAt)
      || (updatedAt && snapshotUpdatedAt && (
        updatedAt === snapshotUpdatedAt
        || (Number.isFinite(snapshotUpdatedAtMs) && Number.isFinite(nextUpdatedAtMs) && snapshotUpdatedAtMs >= nextUpdatedAtMs)
      ))
    );
  if (snapshotAlreadyCurrent) return null;
  return {
    source,
    record: {
      itemId: String(syncedOverride.itemId || "").trim(),
      wearId: String(platformRecord?.wearId || syncedOverride.wearId || "").trim(),
      price,
      marketHashName: String(platformRecord?.marketHashName || syncedOverride?.marketHashName || snapshotEntry?.record?.marketHashName || ""),
      sellNum: Number(platformRecord?.sellNum) || 0,
      updatedAt: updatedAt || null
    }
  };
}

async function handleCatalogPriceOverrides(_request, response) {
  const [snapshot, buffSnapshot, youpinSnapshot] = await Promise.all([
    loadMarketPricesSnapshot(),
    loadPlatformLinksSnapshot("buff"),
    loadPlatformLinksSnapshot("youpin")
  ]);
  const items = {};
  for (const [itemId, record] of Object.entries(snapshot.items || {})) {
    for (const [rawWearId, priceRecord] of Object.entries(record?.prices || {})) {
      const wearId = rawWearId === "default" ? "" : rawWearId;
      const snapshotEntry = { wearId, price: Number(priceRecord?.price), record: priceRecord };
      const buffRecord = lookupPlatformLinkRecord(buffSnapshot, itemId, "standard", wearId);
      const youpinRecord = lookupPlatformLinkRecord(youpinSnapshot, itemId, "standard", wearId);
      const override = preferredReferencePayload({
        itemId,
        wearId,
        variantId: "standard",
        buffRecord,
        youpinRecord,
        snapshotEntry,
        snapshotUpdatedAt: record?.lastUpdated || snapshot.updatedAt
      });
      if (override) items[`${itemId}::standard::${wearId}`] = override;
    }
  }
  json(response, 200, { ok: true, updatedAt: snapshot.updatedAt || null, items });
}

async function handlePlatformPrices(request, response, pathname) {
  const match = pathname.match(/^\/api\/platform-prices\/([^/]+)$/u);
  const itemId = match ? decodeURIComponent(match[1]) : "";
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const wearId = String(requestUrl.searchParams.get("wear") || "").trim();
  const variantId = String(requestUrl.searchParams.get("variant") || "standard").trim() || "standard";
  const forceYoupinRefresh = /^(1|true|yes)$/iu.test(String(requestUrl.searchParams.get("refresh") || ""));
  const { user } = readAuthenticatedUser(request);
  const snapshot = await loadMarketPricesSnapshot();
  const [buffSnapshot, initialYoupinSnapshot] = await Promise.all([
    loadPlatformLinksSnapshot("buff"),
    loadPlatformLinksSnapshot("youpin")
  ]);
  const priceEntry = snapshotPriceFromRecord(snapshot.items?.[itemId], wearId);
  const requestedWearId = wearId || priceEntry?.wearId || "";
  const buffSessionRow = user ? selectPlatformSession.buff.get(user.id) : null;
  const youpinSessionRow = user ? selectPlatformSession.youpin.get(user.id) : null;
  let youpinSnapshot = initialYoupinSnapshot;
  let youpinLookupError = "";
  const buffRecord = lookupPlatformLinkRecord(buffSnapshot, itemId, variantId, requestedWearId);
  let youpinRecord = lookupPlatformLinkRecord(youpinSnapshot, itemId, variantId, requestedWearId);
  const shouldRefreshYoupin = shouldRefreshPlatformRecord({
    record: youpinRecord,
    connected: !!(user && youpinSessionRow?.status === "connected"),
    forceRefresh: forceYoupinRefresh,
    maxAgeMs: youpinSinglePriceCacheFreshMs
  });
  const youpinCooldownActive = shouldBlockPlatformRefresh({ cooldownUntilMs: youpinSingleLookupState.cooldownUntilMs });
  if (shouldRefreshYoupin && youpinCooldownActive) {
    youpinLookupError = youpinSingleLookupState.lastRateLimitMessage || "YouPin request was rate limited. Please wait a moment and try again.";
  }
  if (shouldRefreshYoupin && !youpinCooldownActive) {
    try {
      const liveRecord = await fetchYoupinSingleRecordForUserOnce(user.id, {
        itemId,
        variantId,
        wearId: requestedWearId,
        marketHashName: priceEntry?.record?.marketHashName || ""
      });
      if (liveRecord) {
        youpinSnapshot = await loadPlatformLinksSnapshot("youpin");
        if (String(liveRecord?.wearId || "").trim() === String(requestedWearId || "").trim()) {
          youpinRecord = liveRecord;
        } else {
          youpinRecord = lookupPlatformLinkRecord(youpinSnapshot, itemId, variantId, requestedWearId);
        }
      }
    } catch (error) {
      if (error?.code === "youpin_rate_limited") markYoupinRateLimit(error.message);
      youpinLookupError = error?.message || "YouPin live price lookup failed.";
    }
  }
  const syncedOverride = preferredReferencePayload({
    itemId,
    wearId: requestedWearId,
    variantId,
    buffRecord,
    youpinRecord,
    snapshotEntry: priceEntry,
    snapshotUpdatedAt: snapshot.items?.[itemId]?.lastUpdated || snapshot.updatedAt
  });
  const persistentReference = buildPersistentReferenceRecord({
    syncedOverride,
    buffRecord,
    youpinRecord,
    snapshotEntry: priceEntry
  });
  if (persistentReference?.record) {
    await persistPlatformRecordsToMarketPrices([persistentReference.record], {
      source: persistentReference.source,
      updatedAt: persistentReference.record.updatedAt || nowIso()
    });
  }
  json(response, 200, {
    ok: true,
    id: itemId,
    wearId,
    variantId,
    referencePrice: syncedOverride?.effectivePrice || null,
    referenceSource: syncedOverride?.effectiveSource === "buff"
      ? "Synced BUFF reference"
      : syncedOverride?.effectiveSource === "youpin"
        ? "Synced YouPin reference"
        : syncedOverride?.effectiveSource === "snapshot"
          ? "Local market snapshot"
          : "PublicMarket",
    referenceSourceKey: syncedOverride?.effectiveSource || "reference",
    syncedOverride,
    platforms: {
      buff: buildPlatformPricePayload("buff", buffSessionRow, buffRecord, buffSnapshot.updatedAt),
      youpin: buildPlatformPricePayload("youpin", youpinSessionRow, youpinRecord, youpinSnapshot.updatedAt, youpinLookupError)
    }
  });
}

async function handleBatchPrices(request, response) {
  const body = await readBody(request);
  const ids = [...new Set((Array.isArray(body?.ids) ? body.ids : [])
    .map((entry) => String(entry || "").trim())
    .filter(Boolean))]
    .slice(0, 96);
  if (!ids.length) {
    json(response, 200, { ok: true, updatedAt: null, items: {} }, corsHeaders());
    return;
  }
  const snapshot = await loadMarketPricesSnapshot();
  const [buffSnapshot, youpinSnapshot] = await Promise.all([
    loadPlatformLinksSnapshot("buff"),
    loadPlatformLinksSnapshot("youpin")
  ]);
  const items = {};
  for (const itemId of ids) {
    const priceEntry = snapshotPriceFromRecord(snapshot.items?.[itemId], "");
    const buffRecord = lookupPlatformLinkRecord(buffSnapshot, itemId, "standard", priceEntry?.wearId || "");
    const youpinRecord = lookupPlatformLinkRecord(youpinSnapshot, itemId, "standard", priceEntry?.wearId || "");
    const override = preferredReferencePayload({
      itemId,
      wearId: priceEntry?.wearId || "",
      variantId: "standard",
      buffRecord,
      youpinRecord,
      snapshotEntry: priceEntry,
      snapshotUpdatedAt: snapshot.items?.[itemId]?.lastUpdated || snapshot.updatedAt
    });
    const record = minimalBatchPriceRecord(itemId, override);
    if (record) items[itemId] = record;
  }
  json(response, 200, { ok: true, updatedAt: snapshot.updatedAt || null, items }, corsHeaders());
}

async function handleAiItemAnalysis(request, response, pathname) {
  const match = pathname.match(/^\/api\/ai\/item-analysis\/([^/]+)$/u);
  const itemId = match ? decodeURIComponent(match[1]) : "";
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const wearId = String(requestUrl.searchParams.get("wear") || "").trim();
  const variantId = String(requestUrl.searchParams.get("variant") || "standard").trim() || "standard";
  const [{ catalog }, snapshot, buffSnapshot, youpinSnapshot] = await Promise.all([
    loadCatalogRuntimeData(),
    loadMarketPricesSnapshot(),
    loadPlatformLinksSnapshot("buff"),
    loadPlatformLinksSnapshot("youpin")
  ]);
  const catalogItem = catalog.find((entry) => entry?.id === itemId) || null;
  const priceEntry = snapshotPriceFromRecord(snapshot.items?.[itemId], wearId);
  if (!catalogItem && !priceEntry) {
    json(response, 200, {
      ok: true,
      itemId,
      wearId,
      variantId,
      insights: [],
      fallbackReason: "item_not_found"
    }, corsHeaders());
    return;
  }
  const buffRecord = lookupPlatformLinkRecord(buffSnapshot, itemId, variantId, wearId || priceEntry?.wearId || "");
  const youpinRecord = lookupPlatformLinkRecord(youpinSnapshot, itemId, variantId, wearId || priceEntry?.wearId || "");
  json(response, 200, summarizeItemAnalysis({
    itemId,
    wearId,
    variantId,
    itemName: catalogItem?.nameEn || catalogItem?.nameZh || catalogItem?.name || "",
    snapshotRecord: snapshot.items?.[itemId] || null,
    priceEntry,
    buffRecord,
    youpinRecord
  }), corsHeaders());
}

function openingDropEntries(opening, snapshot) {
  const rawEntries = [
    ...(Array.isArray(opening?.contains) ? opening.contains : []),
    ...(Array.isArray(opening?.containsRare) ? opening.containsRare : [])
  ];
  if (!rawEntries.length) return [];
  const probability = Number((1 / rawEntries.length).toFixed(6));
  return rawEntries.map((entry) => {
    const snapshotEntry = snapshotPriceFromRecord(snapshot.items?.[entry?.id], "");
    return {
      id: entry?.id || "",
      name: entry?.name || entry?.nameEn || entry?.nameZh || "",
      nameEn: entry?.nameEn || "",
      nameZh: entry?.nameZh || "",
      rarity: entry?.rarity || entry?.rarityEn || entry?.rarityZh || "",
      price: Number(snapshotEntry?.price) || 0,
      probability
    };
  }).filter((entry) => entry.id && entry.price > 0);
}

async function handleAiOpeningAnalysis(request, response, pathname) {
  const match = pathname.match(/^\/api\/ai\/opening-analysis\/([^/]+)$/u);
  const openingId = match ? decodeURIComponent(match[1]) : "";
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const locale = String(requestUrl.searchParams.get("locale") || "en").trim() || "en";
  const [{ openings }, snapshot] = await Promise.all([
    loadCatalogRuntimeData(),
    loadMarketPricesSnapshot()
  ]);
  const opening = openings.find((entry) => entry?.id === openingId) || null;
  if (!opening) {
    json(response, 200, {
      ok: true,
      openingId,
      locale,
      insights: [],
      topDrops: [],
      fallbackReason: "opening_not_found"
    }, corsHeaders());
    return;
  }
  const openingRecord = snapshot.items?.[openingId] || null;
  const openingPrice = Number(snapshotPriceFromRecord(openingRecord, "")?.price) || 0;
  const entries = openingDropEntries(opening, snapshot);
  if (!entries.length) {
    json(response, 200, {
      ok: true,
      openingId,
      locale,
      entryCost: openingPrice,
      expectedValue: 0,
      roi: openingPrice > 0 ? -100 : 0,
      commentary: locale.startsWith("zh") ? "当前缺少足够的掉落价格样本，暂时只能展示基础信息。" : "There is not enough priced drop data yet, so only the basic opening info is available.",
      insights: [],
      topDrops: [],
      fallbackReason: "drops_unpriced"
    }, corsHeaders());
    return;
  }
  json(response, 200, summarizeOpeningAnalysis({
    openingId,
    openingName: opening?.nameEn || opening?.nameZh || opening?.name || "",
    locale,
    openingPrice,
    keyPrice: /weapon-case|container|souvenir-package/u.test(String(opening?.kind || "")) ? 18 : 0,
    entries
  }), corsHeaders());
}

async function handleRecommendationCompose(request, response) {
  const body = await readBody(request);
  const result = await generateLoadoutCandidates(root, body);
  const aiResult = await rerankLoadoutsWithAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    provider: process.env.AI_PROVIDER || "",
    baseUrl: process.env.AI_BASE_URL || "",
    model: process.env.AI_MODEL || process.env.OPENAI_RECOMMENDER_MODEL || process.env.OLLAMA_MODEL || "gpt-5.5",
    request: body,
    loadouts: result.loadouts
  }).catch((error) => ({
    usedAI: false,
    reason: error?.message || "rerank_failed"
  }));
  const selectedIndex = Number.isInteger(aiResult.chosenIndex) && aiResult.chosenIndex >= 0 && aiResult.chosenIndex < result.loadouts.length
    ? aiResult.chosenIndex
    : 0;
  const selected = result.loadouts[selectedIndex] || result.loadouts[0];
  json(response, 200, {
    ok: true,
    tier: result.tier,
    theme: result.theme,
    requiredSlots: result.requiredSlots,
    engine: {
      usedAI: aiResult.usedAI,
      provider: aiResult.usedAI ? (aiResult.provider || process.env.AI_PROVIDER || "openai") : null,
      model: aiResult.usedAI ? (process.env.AI_MODEL || process.env.OPENAI_RECOMMENDER_MODEL || process.env.OLLAMA_MODEL || "gpt-5.5") : null,
      note: aiResult.summary || "",
      warnings: Array.isArray(aiResult.notes) ? aiResult.notes : [],
      fallbackReason: aiResult.usedAI ? null : (aiResult.reason || null)
    },
    selected,
    alternatives: result.loadouts.filter((_, index) => index !== selectedIndex).slice(0, 2)
  }, corsHeaders());
}

async function handleRecommendationChat(request, response) {
  const body = await readBody(request);
  const result = await handleLoadoutChat(root, body, {
    apiKey: process.env.OPENAI_API_KEY || "",
    provider: process.env.AI_PROVIDER || "",
    baseUrl: process.env.AI_BASE_URL || "",
    model: process.env.AI_MODEL || process.env.OPENAI_RECOMMENDER_MODEL || process.env.OLLAMA_MODEL || "gpt-5.5"
  });
  await writeFile(join(dataDir, "last-ai-chat-request.json"), JSON.stringify({ body, result }, null, 2), "utf8").catch(() => {});
  json(response, 200, result, corsHeaders());
}

function normalizeEnglishName(value = "") {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\bStatTrak(?:™|\(TM\))?\s+/giu, "")
    .replace(/\bSouvenir\s+/giu, "")
    .replace(/\s*\(\s*(?:ruby|sapphire|emerald|black pearl|phase\s*[1-4])\s*\)\s*/giu, " ")
    .replace(/\s*\|\s*/gu, " | ")
    .replace(/\s+/gu, " ")
    .trim();
}

function slugify(value = "") {
  return normalizeEnglishName(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function resolveCatalogItemByName(catalog = [], rawName = "") {
  const name = String(rawName || "").trim();
  if (!name) return null;
  const normalized = slugify(name);
  const records = [];
  for (const item of Array.isArray(catalog) ? catalog : []) {
    const candidates = [item?.id, item?.nameEn, item?.nameZh, item?.name]
      .map((entry) => slugify(entry))
      .filter(Boolean);
    if (candidates.includes(normalized)) return item;
    records.push({ item, candidates });
  }
  const looseMatch = records
    .map((record) => ({
      item: record.item,
      score: Math.max(...record.candidates.map((candidate) => {
        if (!candidate) return 0;
        if (normalized.includes(candidate) || candidate.includes(normalized)) return candidate.length;
        return 0;
      }))
    }))
    .filter((record) => record.score > 0)
    .sort((left, right) => right.score - left.score)[0];
  if (looseMatch) return looseMatch.item;
  return null;
}

function normalizeProLoadoutEntries(entries = [], catalog = []) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .map((name) => {
      const matched = resolveCatalogItemByName(catalog, name);
      return {
        itemId: String(matched?.id || ""),
        name,
        image: String(matched?.image || "")
      };
    });
}

async function handleProLoadouts(_request, response) {
  const { catalog } = await loadCatalogRuntimeData();
  const teams = (Array.isArray(PRO_LOADOUT_TEAMS) ? PRO_LOADOUT_TEAMS : [])
    .map((team) => ({
      team: String(team?.team || "").trim(),
      logo: String(team?.logo || "").trim(),
      sourceTitle: String(team?.sourceTitle || "").trim(),
      sourceUrl: String(team?.sourceUrl || "").trim(),
      players: (Array.isArray(team?.players) ? team.players : []).map((player) => ({
        name: String(player?.name || "").trim(),
        avatar: String(player?.avatar || "").trim(),
        knife: normalizeProLoadoutEntries(player?.knife, catalog),
        gloves: normalizeProLoadoutEntries(player?.gloves, catalog),
        guns: normalizeProLoadoutEntries(player?.guns, catalog)
      }))
    }))
    .filter((team) => team.team && team.players.length);
  json(response, 200, { ok: true, teams }, corsHeaders());
}

async function handleAssetProxy(request, response) {
  const requestUrl = new URL(request.url || "/api/asset-proxy", "http://127.0.0.1");
  const targetUrl = String(requestUrl.searchParams.get("url") || "").trim();
  if (!targetUrl) {
    json(response, 400, { ok: false, error: "Missing url parameter." }, corsHeaders());
    return;
  }
  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch {
    json(response, 400, { ok: false, error: "Invalid target url." }, corsHeaders());
    return;
  }
  if (!/^https?:$/i.test(parsedTarget.protocol) || !/(\.|^)img-cdn\.hltv\.org$/i.test(parsedTarget.hostname)) {
    json(response, 403, { ok: false, error: "Unsupported asset host." }, corsHeaders());
    return;
  }
  try {
    const upstream = await fetch(parsedTarget, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        Referer: "https://www.hltv.org/",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });
    if (!upstream.ok) {
      json(response, upstream.status || 502, { ok: false, error: `Upstream returned ${upstream.status || 502}.` }, corsHeaders());
      return;
    }
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await upstream.arrayBuffer();
    response.writeHead(200, {
      ...corsHeaders(),
      "Cache-Control": "public, max-age=86400",
      "Content-Type": contentType
    });
    response.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Failed to proxy asset:", error);
    json(response, 502, { ok: false, error: "Failed to fetch remote asset." }, corsHeaders());
  }
}

async function routeApi(request, response, pathname) {
  const { user } = readAuthenticatedUser(request);
  if (pathname === "/api/recommendations/compose" && request.method === "POST") {
    await handleRecommendationCompose(request, response);
    return true;
  }
  if (pathname === "/api/recommendations/chat" && request.method === "POST") {
    await handleRecommendationChat(request, response);
    return true;
  }
  if (pathname === "/api/ai/pro-loadouts" && request.method === "GET") {
    await handleProLoadouts(request, response);
    return true;
  }
  if (pathname === "/api/asset-proxy" && request.method === "GET") {
    await handleAssetProxy(request, response);
    return true;
  }
  if (pathname === "/api/prices/batch" && request.method === "POST") {
    await handleBatchPrices(request, response);
    return true;
  }
  if (pathname.startsWith("/api/ai/item-analysis/") && request.method === "GET") {
    await handleAiItemAnalysis(request, response, pathname);
    return true;
  }
  if (pathname.startsWith("/api/ai/opening-analysis/") && request.method === "GET") {
    await handleAiOpeningAnalysis(request, response, pathname);
    return true;
  }
  if (pathname === "/api/account/overview" && request.method === "GET") {
    json(response, 200, buildOverview(user));
    return true;
  }
  if (pathname === "/api/catalog-price-overrides" && request.method === "GET") {
    await handleCatalogPriceOverrides(request, response);
    return true;
  }
  if (pathname.startsWith("/api/platform-prices/") && request.method === "GET") {
    await handlePlatformPrices(request, response, pathname);
    return true;
  }
  if (pathname === "/api/auth/register" && request.method === "POST") {
    await handleRegister(request, response);
    return true;
  }
  if (pathname === "/api/auth/login" && request.method === "POST") {
    await handleLogin(request, response);
    return true;
  }
  if (pathname === "/api/auth/logout" && request.method === "POST") {
    await handleLogout(request, response);
    return true;
  }

  if (!user) {
    if (pathname.startsWith("/api/")) {
      json(response, 401, { code: "unauthorized", error: "Please sign in first." }, { "Set-Cookie": clearSessionCookie() });
      return true;
    }
    return false;
  }

  if (pathname === "/api/auth/steam/bind" && request.method === "POST") {
    await handleSteamBind(request, response, user);
    return true;
  }
  if (pathname === "/api/steam/sync" && request.method === "POST") {
    await handleSteamSync(request, response, user);
    return true;
  }
  if (pathname === "/api/steam/inventory" && request.method === "GET") {
    json(response, 200, readInventoryPreview(user.id));
    return true;
  }
  if (pathname === "/api/price-sync/run" && request.method === "POST") {
    await handlePriceSyncRun(request, response, user);
    return true;
  }
  if (pathname === "/api/buff/connect/start" && request.method === "POST") {
    await handleBuffConnectStart(request, response, user);
    return true;
  }
  if (pathname === "/api/buff/connect/status" && request.method === "GET") {
    await handleBuffConnectStatus(request, response, user);
    return true;
  }
  if (pathname === "/api/buff/connect" && request.method === "DELETE") {
    await handleBuffDisconnect(request, response, user);
    return true;
  }
  if (pathname === "/api/youpin/connect/start" && request.method === "POST") {
    await handleYoupinConnectStart(request, response, user);
    return true;
  }
  if (pathname === "/api/youpin/connect/status" && request.method === "GET") {
    await handleYoupinConnectStatus(request, response, user);
    return true;
  }
  if (pathname === "/api/youpin/connect" && request.method === "DELETE") {
    await handleYoupinDisconnect(request, response, user);
    return true;
  }

  return false;
}

async function serveStatic(pathname, response) {
  const requestUrl = new URL(pathname, "http://127.0.0.1");
  const relativePath = requestUrl.pathname === "/" ? "index.html" : requestUrl.pathname.replace(/^\/+/u, "");
  const filePath = normalize(join(root, relativePath));
  const isAllowedDataFile = relativePath === ".data/market-prices.js" || /^\.data\/catalog-locales\/[^/]+\.js$/u.test(relativePath);
  if (!filePath.startsWith(root) || relativePath.startsWith(".git") || (relativePath.startsWith(".data") && !isAllowedDataFile)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      ...staticCacheHeaders(filePath, requestUrl)
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    if (request.method === "OPTIONS" && isPublicRecommendationRoute(pathname)) {
      response.writeHead(204, corsHeaders());
      response.end();
      return;
    }
    if (pathname === "/__health") {
      response.writeHead(204, {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0"
      });
      response.end();
      return;
    }
    const handled = await routeApi(request, response, pathname);
    if (handled) return;
    await serveStatic(pathname, response);
  } catch (error) {
    const status = Number(error?.status) || 500;
    json(response, status, {
      code: error?.code || "server_error",
      error: error?.message || "Unexpected server error."
    });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`CS2 Relic Hall: http://127.0.0.1:${port}/`);
  console.log(`Database: SQLite (${dbFile})`);
  console.log("Auth routes: POST /api/auth/register, /api/auth/login, /api/auth/logout");
  console.log("Account routes: GET /api/account/overview, POST /api/auth/steam/bind, POST /api/steam/sync");
});
