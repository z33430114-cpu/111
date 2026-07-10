import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const pages = [
  "index.html",
  "catalog.html",
  "collections.html",
  "favorites.html",
  "item.html",
  "recent.html",
  "openings.html",
  "account.html",
  "inventory.html",
  "loadout.html",
  "tools.html"
];

const legacyMarkers = [
  "const baseLabels = {",
  "const localizedLabels = {",
  "document.documentElement.dataset.navReady = \"true\";"
];

const failures = [];

for (const page of pages) {
  const html = readFileSync(path.join(root, page), "utf8");

  if (!html.includes('class="secondary-action lang-switch"')) {
    failures.push(`${page}: missing shared language switch control`);
  }

  if (!/<script\b[^>]*\bsrc="language-runtime\.js[^"]*"/u.test(html)) {
    failures.push(`${page}: missing shared language runtime include`);
  }

  if (legacyMarkers.every((marker) => html.includes(marker))) {
    failures.push(`${page}: still contains legacy inline navigation localization script`);
  }
}

if (failures.length) {
  console.error("Shared navigation language check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Shared navigation language check passed for ${pages.length} pages.`);
