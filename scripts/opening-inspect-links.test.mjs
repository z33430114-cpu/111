import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const appSource = await readFile(join(process.cwd(), "app.js"), "utf8");

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.indexOf(marker);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start + marker.length);
  if (paramsStart === -1) throw new Error(`Unable to find params for ${name}`);
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
  const bodyStart = paramsEnd === -1 ? -1 : sourceText.indexOf("{", paramsEnd);
  if (bodyStart === -1) throw new Error(`Unable to find body for ${name}`);
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

function buildAppFunction(name, overrides = {}) {
  const context = {
    UI_META_SEPARATOR: " · ",
    localizeOpeningEntry: (entry) => entry,
    openingQualityMarkup: () => "",
    wearLabel: (value) => value,
    uiText: (en) => en,
    formatFloatValue: (value) => String(value),
    formatPrice: (value) => String(value),
    escapeHtml: (value) => String(value),
    openingInspectLinkMarkup: (entry) => `<a data-opening-inspect-link href="${entry?.href || ''}">Inspect Item</a>`,
    openingLootEntries: () => [],
    ...overrides
  };
  vm.createContext(context);
  const source = `${extractFunctionSource(appSource, name)};\nresult = ${name};`;
  return vm.runInContext(source, context);
}

test("openingLootCardMarkup can render an inspect link for opening drops", () => {
  const openingLootCardMarkup = buildAppFunction("openingLootCardMarkup");
  const markup = openingLootCardMarkup(
    {
      displayName: "AK-47 | Case Hardened",
      displayRarity: "Classified",
      displayPrice: 1234,
      href: "item.html?id=skin-1"
    },
    { inspectable: true }
  );

  assert.match(markup, /data-opening-inspect-link/);
  assert.match(markup, /href="item\.html\?id=skin-1"/);
});

test("openingInspectLinkMarkup can render a fallback button when only name data is available", () => {
  const openingInspectLinkMarkup = buildAppFunction("openingInspectLinkMarkup");
  const markup = openingInspectLinkMarkup({ id: "legacy-id", displayName: "MP7 | 死亡骷髅" }, true);

  assert.match(markup, /data-opening-inspect-link="true"/);
  assert.match(markup, /data-opening-inspect-id="legacy-id"/);
  assert.match(markup, /data-opening-inspect-name="MP7 \| 死亡骷髅"/);
  assert.doesNotMatch(markup, /href=/);
  assert.match(markup, /<button /);
});

test("openingLootPoolMarkup passes inspectable cards through the pool renderer", () => {
  const calls = [];
  const openingLootPoolMarkup = buildAppFunction("openingLootPoolMarkup", {
    openingLootEntries: () => [{ id: "drop-1" }, { id: "drop-2" }],
    openingLootCardMarkup: (entry, options = {}) => {
      calls.push({ entry, options });
      return `<article>${entry.id}</article>`;
    },
    uiTemplate: (_template, values) => `${values.count} items`
  });

  openingLootPoolMarkup({ id: "case-1" });

  assert.equal(calls.length, 2);
  assert.ok(calls.every((call) => call.options.inspectable === true));
});

test("opening inspect links are exempt from result-selection click interception", () => {
  assert.match(appSource, /target\.closest\("\[data-opening-inspect-link\]"\)/);
  assert.match(appSource, /resolveDisplayItemByName\(openingInspectTrigger\.dataset\.openingInspectName \|\| ""\)/);
});

test("localizeOpeningEntry falls back to catalog name matching when opening ids drift", () => {
  const matchedItem = { id: "skin-matched", image: "img.png" };
  const localizeOpeningEntry = buildAppFunction("localizeOpeningEntry", {
    itemMap: new Map(),
    resolveDisplayItemByName: (name) => name === "MP7 | Skulls" ? matchedItem : null,
    resolveWearIdByFloat: () => "",
    openingResultQualityLabel: () => "Standard",
    effectiveCatalogPriceRecordForSelection: () => ({ price: 42 }),
    itemTitle: () => "MP7 | 死亡骷髅",
    rarityLabel: () => "军规级",
    itemHref: () => "item.html?id=skin-matched",
    itemWeapon: () => "MP7",
    collectionLabel: () => "武器箱",
    itemDescription: () => "desc",
    currentLanguage: () => "zh-CN",
    firstNonEmpty: (...values) => values.find(Boolean) || "",
    formatFloatValue: () => "",
    wearLabel: () => "",
    uiText: (en) => en
  });

  const localized = localizeOpeningEntry({ id: "legacy-opening-id", nameEn: "MP7 | Skulls" });

  assert.equal(localized?.href, "item.html?id=skin-matched");
  assert.equal(localized?.image, "img.png");
});
