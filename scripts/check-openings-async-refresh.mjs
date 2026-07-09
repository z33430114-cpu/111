import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

const requiredSnippets = [
  'function refreshOpeningAsyncPanels(opening)',
  'id="openingMetaTags"',
  'id="openingAiPanel"',
  'if (!refreshOpeningAsyncPanels(activeOpening)) renderOpenings();'
];

const missing = requiredSnippets.filter((snippet) => !source.includes(snippet));

if (missing.length) {
  console.error("Openings async refresh regression detected.");
  missing.forEach((snippet) => console.error(`Missing snippet: ${snippet}`));
  process.exit(1);
}

console.log("Openings async refresh guard passed.");
