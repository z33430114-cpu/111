import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const [appSource, stylesSource] = await Promise.all([
  readFile(join(process.cwd(), "app.js"), "utf8"),
  readFile(join(process.cwd(), "styles.css"), "utf8")
]);
const indexSource = await readFile(join(process.cwd(), "index.html"), "utf8");

test("home intro is connected, skippable, and only auto-plays once per session", () => {
  assert.match(appSource, /function mountHomeIntro\(\)/);
  assert.match(appSource, /intro-film\/index\.html/);
  assert.match(appSource, /sessionStorage\.getItem\("cs-exhibition:intro-seen"\)/);
  assert.match(appSource, /data-intro-dismiss/);
  assert.match(appSource, /data-intro-replay/);
  assert.match(stylesSource, /\.site-intro-controls/);
  assert.match(stylesSource, /\.site-intro-film\.is-dismissing/);
});

test("global command palette supports keyboard navigation and real destinations", () => {
  assert.match(appSource, /function mountCommandPalette\(\)/);
  assert.match(appSource, /data-command-palette/);
  assert.match(appSource, /event\.key\.toLowerCase\(\) === "k"/);
  assert.match(appSource, /catalog\.html/);
  assert.match(appSource, /loadout\.html/);
  assert.match(stylesSource, /\.command-palette/);
  assert.match(stylesSource, /\.command-trigger/);
});

test("home shortcut strip uses navigation actions instead of a fake subscription form", () => {
  assert.doesNotMatch(appSource, /curator@cs-exhibition\.local/);
  assert.match(appSource, /home-quick-actions/);
  assert.match(appSource, /data-intro-replay/);
});

test("home uses a compact catalog summary instead of the 31 MB full catalog", async () => {
  const homeDataFile = join(process.cwd(), "home-data.js");
  const homeDataStat = await stat(homeDataFile);
  assert.match(indexSource, /home-data\.js\?v=20260710home1/);
  assert.doesNotMatch(indexSource, /catalog-data\.js/);
  assert.ok(homeDataStat.size < 25_000, `home-data.js should stay compact, got ${homeDataStat.size} bytes`);
});
