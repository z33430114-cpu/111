import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(path.join(process.cwd(), "language-runtime.js"), "utf8");

const forbiddenSnippets = [
  'pack.Catalog = "Archive";',
  'pack.Collections = "Halls";',
  'pack.Inspector = "Inspect";',
  'pack.Favorites = "Saved";',
  'pack.Recent = "Trail";',
  'pack.Unbox = "Drop Theatre";',
  'pack.Account = "Pass";',
  'pack.Inventory = "Vault";',
  'pack.Loadout = "Curator";'
];

const found = forbiddenSnippets.filter((snippet) => source.includes(snippet));

if (found.length) {
  console.error("Navigation runtime localization regression detected:");
  for (const snippet of found) {
    console.error(`- Found forbidden override: ${snippet}`);
  }
  process.exit(1);
}

console.log("Navigation runtime localization check passed.");
