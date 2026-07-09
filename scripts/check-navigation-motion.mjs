import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [stylesCss, appJs] = await Promise.all([
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../app.js", import.meta.url), "utf8")
]);

const motionFastMatch = stylesCss.match(/--motion-fast:\s*(\d+)ms/);
assert.ok(motionFastMatch, "styles.css should define --motion-fast");
assert.ok(Number(motionFastMatch[1]) <= 140, "styles.css should keep --motion-fast at or below 140ms");

const introMotionMatch = stylesCss.match(/\[data-motion-intro\] \[data-motion-part\]\s*\{[\s\S]*?opacity\s+(\d+)ms[\s\S]*?transform\s+(\d+)ms/);
assert.ok(introMotionMatch, "styles.css should define timed intro motion transitions");
assert.ok(Number(introMotionMatch[1]) >= 180, "intro opacity transition should be long enough to feel smooth");
assert.ok(Number(introMotionMatch[2]) >= 220, "intro transform transition should be long enough to feel smooth");

const mainMotionMatch = stylesCss.match(/main\s*\{[\s\S]*?opacity\s+(\d+)ms[\s\S]*?transform\s+(\d+)ms/);
assert.ok(mainMotionMatch, "styles.css should define timed main page transitions");
assert.ok(Number(mainMotionMatch[1]) >= 130, "main opacity transition should avoid abrupt page exits");
assert.ok(Number(mainMotionMatch[2]) >= 170, "main transform transition should avoid abrupt page exits");

assert.match(stylesCss, /\.top-nav a::after/, "styles.css should define nav energy-line pseudo-element");
assert.match(stylesCss, /html\.is-navigating main/, "styles.css should keep page exit state");
assert.match(stylesCss, /\[data-motion-intro\]/, "styles.css should define intro motion selectors");
assert.match(stylesCss, /prefers-reduced-motion:\s*reduce/, "styles.css should include reduced-motion handling");

assert.match(stylesCss, /\.top-nav a::after\s*\{/, "styles.css should define a nav underline pseudo-element");
assert.match(stylesCss, /\.top-nav a:hover::after/, "styles.css should animate the nav underline on hover");
assert.match(stylesCss, /\.top-nav a\.is-active::after|\.top-nav \.active::after/, "styles.css should keep the underline visible for the active nav item");
assert.match(stylesCss, /\.top-nav a\.is-pressing|\.top-nav a:active/, "styles.css should define a pressed nav state");

assert.match(appJs, /function navigateSmoothly\(href(?:,\s*trigger)?\)/, "app.js should still own navigation flow");
assert.match(appJs, /data-motion-intro/, "app.js should emit intro motion hooks");
assert.match(appJs, /is-page-entering/, "app.js should apply page-entry state classes");
assert.match(appJs, /is-pressing/, "app.js should manage nav press state");
assert.match(appJs, /function applyPageMotionState\(\)/, "app.js should define applyPageMotionState()");
assert.match(appJs, /function markActiveNavigation\(\)/, "app.js should define markActiveNavigation()");
assert.match(appJs, /function isHeavyMotionPage\(\)/, "app.js should define isHeavyMotionPage()");
assert.match(appJs, /function scheduleLoadoutHydration\(\)/, "app.js should define scheduleLoadoutHydration()");
assert.match(appJs, /function pulsePressState\(element\)/, "app.js should define pulsePressState()");
assert.match(appJs, /function prepareDeferredImageState\(targetPage = pageName\(\)\)/, "app.js should prepare deferred image state per page");
assert.match(appJs, /function hydrateDeferredImagesForPage\(targetPage = pageName\(\)\)/, "app.js should hydrate deferred images without replaying page entry motion");
assert.match(appJs, /function scheduleDeferredImageHydration\(targetPage = pageName\(\)\)/, "app.js should schedule deferred image hydration");
assert.match(appJs, /function shouldRenderDeferredImages\(targetPage = pageName\(\)\)/, "app.js should decide when deferred images can render");
assert.match(appJs, /classList\.add\("is-page-entering"\)/, "app.js should add is-page-entering during render");
assert.match(appJs, /document\.body\.classList\.toggle\("is-heavy-motion-page"/, "app.js should toggle the heavy-page motion class");
assert.match(appJs, /classList\.add\("is-pressing"\)/, "app.js should mark the clicked nav item as pressing");

const navigationDelayMatch = appJs.match(/appState\.navigationTimer\s*=\s*window\.setTimeout\([\s\S]*?,\s*(\d+)\s*\);/);
assert.ok(navigationDelayMatch, "app.js should delay navigation long enough for the exit motion to register");
assert.ok(Number(navigationDelayMatch[1]) >= 90, "navigation exit delay should be at least 90ms for smoother page switching");

assert.match(appJs, /data-motion-part="eyebrow"/, "app.js should label eyebrow motion parts");
assert.match(appJs, /data-motion-part="title"/, "app.js should label title motion parts");
assert.match(appJs, /data-motion-part="copy"/, "app.js should label copy motion parts");
assert.match(appJs, /data-motion-part="actions"/, "app.js should label actions motion parts");
assert.match(appJs, /appState\.loadoutHydrationStarted/, "app.js should track loadout hydration state");
assert.match(appJs, /data-loadout-stage="frame"/, "app.js should render a loadout frame stage marker");
assert.match(appJs, /data-loadout-stage="hydrating"/, "app.js should render a loadout hydration stage marker");
assert.match(appJs, /deferred-media-placeholder/, "app.js should emit deferred media placeholders before images hydrate");
assert.match(stylesCss, /body\.is-heavy-motion-page \[data-motion-intro\]/, "styles.css should define reduced intro motion for heavy pages");
assert.match(stylesCss, /\.item-card:where\(:hover, \.is-pressed\)/, "styles.css should define a fast hover/press state for item cards");
assert.match(stylesCss, /\.collection-card:where\(:hover, \.is-pressed\)/, "styles.css should define a fast hover/press state for collection cards");
assert.match(stylesCss, /\.deferred-media-placeholder/, "styles.css should style deferred media placeholders");

console.log("navigation motion checks passed");
