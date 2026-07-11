import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  try {
    return readFileSync(path.join(root, relativePath), "utf8");
  } catch (error) {
    failures.push(`${relativePath}: ${error.code === "ENOENT" ? "missing file" : error.message}`);
    return "";
  }
}

const toolsHtml = read("tools.html");
const appJs = read("app.js");
const stylesCss = read("styles.css");
const languageRuntime = read("language-runtime.js");

if (toolsHtml && !toolsHtml.includes('id="toolsRoot"')) {
  failures.push("tools.html: missing toolsRoot mount point");
}

if (toolsHtml && !toolsHtml.includes('data-nav-key="Tools"')) {
  failures.push("tools.html: missing active Tools navigation item");
}

for (const page of ["index.html", "catalog.html", "item.html", "favorites.html", "openings.html", "loadout.html"]) {
  const html = read(page);
  if (html && !html.includes('data-nav-key="Tools"')) {
    failures.push(`${page}: missing Tools navigation link`);
  }
}

for (const marker of [
  "function renderPracticalTools",
  "purchaseCostCalculatorMarkup",
  "wishlistBudgetMarkup",
  "tradeUpCalculatorMarkup",
  "calculatePurchaseCost",
  "calculateWishlistBudget",
  "calculateTradeBudget",
  "function purchaseDecision",
  "function wishlistDecision",
  "function tradeDecision",
  "toolsDecisionSummaryMarkup",
  "tool-decision",
  "data-tools-example",
  "toolsPurchaseExample",
  "toolsWishlistExample",
  "toolsTradeExample"
]) {
  if (!appJs.includes(marker)) failures.push(`app.js: missing ${marker}`);
}

for (const marker of [
  "tools.html",
  "renderPracticalTools()",
  "toolsPurchasePrice",
  "toolsWishlistText",
  "toolsTradeSaleText"
]) {
  if (!appJs.includes(marker)) failures.push(`app.js: missing ${marker}`);
}

for (const oldMarker of [
  "budgetToolSummaryMarkup",
  "openingValueCalculatorMarkup",
  "calculateBudgetLoadout",
  "calculateOpeningExpectedValue"
]) {
  if (appJs.includes(oldMarker)) failures.push(`app.js: old duplicate tool still present: ${oldMarker}`);
}

for (const marker of [
  ".tools-page",
  ".tools-hero",
  ".tool-panel",
  ".tool-breakdown-grid",
  ".wishlist-table",
  ".tools-decision-summary",
  ".tools-summary-grid",
  ".tool-decision",
  ".tool-decision--ready",
  ".tool-panel-actions"
]) {
  if (!stylesCss.includes(marker)) failures.push(`styles.css: missing ${marker}`);
}

if (!languageRuntime.includes('"tools.html": "Tools"')) {
  failures.push("language-runtime.js: missing Tools page title mapping");
}

if (!languageRuntime.includes("Tools:")) {
  failures.push("language-runtime.js: missing Tools nav translation");
}

if (failures.length) {
  console.error("Practical tools check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Practical tools check passed.");
