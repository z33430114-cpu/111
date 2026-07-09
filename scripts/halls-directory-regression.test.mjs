import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { join } from "node:path";

const source = await readFile(join(process.cwd(), "app-overrides.js"), "utf8");

function extractFunctionSource(sourceText, name) {
  const marker = `function ${name}`;
  const start = sourceText.lastIndexOf(marker);
  if (start === -1) throw new Error(`Unable to find ${name}`);
  const paramsStart = sourceText.indexOf("(", start + marker.length);
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

function buildFunction(name, overrides = {}) {
  const context = {
    hallState: { bucket: "collection", query: "", sort: "az", type: "all", page: 1, selectedName: "" },
    HALL_BUCKETS: [],
    PREVIEW_HALL_ROWS: [],
    buildHallSummaries: () => [],
    hallEntriesForBucket: () => [],
    filteredHallEntries: () => [],
    hallTypeOptions: () => "",
    hallBucketLabel: (bucketId) => bucketId,
    hallDisplayName: (entry) => entry?.name || "",
    hallCoverMarkup: () => "<div></div>",
    hallHref: (entry) => `catalog.html?collection=${encodeURIComponent(entry?.name || "")}`,
    hallRowSublabel: () => "sublabel",
    hallRowMeta: () => "meta",
    hallPaginationSummary: (start, end, total) => `Showing ${start}-${end} of ${total}`,
    escapeHtml: (value) => String(value ?? ""),
    text: (en, zh) => zh || en,
    ...overrides
  };
  vm.createContext(context);
  const compiled = `${extractFunctionSource(source, name)};\nresult = ${name};`;
  return vm.runInContext(compiled, context);
}

test("buildHallsDirectoryMarkup localizes visible copy instead of hard-coded English", () => {
  const buildHallsDirectoryMarkup = buildFunction("buildHallsDirectoryMarkup", {
    HALL_BUCKETS: [
      { id: "collection", label: "Map Collections" },
      { id: "weapon-case", label: "Cases" }
    ],
    buildHallSummaries: () => Array.from({ length: 12 }, (_, index) => ({ name: `Hall ${index + 1}` })),
    text: (en, zh) => {
      const zhMap = new Map([
        ["Halls", "展区"],
        ["Browse exhibition halls by group. Jump into collections, cases, capsules, and souvenir wings.", "按分组浏览展区，可进入收藏品、武器箱、胶囊和纪念包。"],
        ["Hall categories", "展区分类"],
        ["Search halls", "搜索展区"],
        ["Sort halls", "展区排序"],
        ["Sort A-Z", "名称 A-Z"],
        ["Sort Z-A", "名称 Z-A"],
        ["Most Items", "物品最多"],
        ["Filter type", "筛选类型"],
        ["Hall", "展区"],
        ["Category", "类别"],
        ["Items", "物品数"],
        ["Last Viewed", "最近查看"],
        ["Price Coverage", "价格覆盖"],
        ["Showing {start}-{end} of {total}", "显示第 {start}-{end} 项，共 {total} 项"],
        ["Previous", "上一页"],
        ["Next", "下一页"]
      ]);
      return zhMap.get(en) || zh || en;
    }
  });

  const markup = buildHallsDirectoryMarkup();
  assert.match(markup, /展区/);
  assert.match(markup, /搜索展区/);
  assert.match(markup, /上一页/);
  assert.doesNotMatch(markup, />Search halls</);
});

test("renderHallRows paginates rows and exposes explicit page controls", () => {
  const entries = Array.from({ length: 10 }, (_, index) => ({
    name: `Hall ${index + 1}`,
    count: index + 1,
    bucket: "weapon-case",
    category: "Cases",
    types: ["rifle"]
  }));
  const rowsNode = { innerHTML: "" };
  const countNode = { textContent: "" };
  const typeNode = { innerHTML: "" };
  const footerNode = { innerHTML: "" };
  const root = {
    querySelector(selector) {
      if (selector === "[data-halls-rows]") return rowsNode;
      if (selector === "[data-halls-count]") return countNode;
      if (selector === "[data-halls-type]") return typeNode;
      if (selector === "[data-halls-pagination]") return footerNode;
      return null;
    }
  };

  const renderHallRows = buildFunction("renderHallRows", {
    hallState: { bucket: "weapon-case", query: "", sort: "az", type: "all", page: 2, selectedName: "Hall 9" },
    PREVIEW_HALL_ROWS: entries,
    buildHallSummaries: () => entries,
    hallEntriesForBucket: () => entries,
    filteredHallEntries: () => entries,
    hallTypeOptions: () => '<option value="all">all</option>',
    hallCoverMarkup: () => "<div class=\"cover\"></div>",
    hallHref: (entry) => `catalog.html?collection=${encodeURIComponent(entry.name)}`,
    hallPaginationSummary: (start, end, total) => `显示第 ${start}-${end} 项，共 ${total} 项`,
    text: (en, zh) => {
      if (en === "View Hall") return "查看展区";
      if (en === "Container detail") return "容器详情";
      if (en === "Map cover render") return "地图封面";
      if (en === "No halls match this filter.") return "没有匹配的展区";
      if (en === "Showing {start}-{end} of {total}") return "显示第 {start}-{end} 项，共 {total} 项";
      if (en === "Previous") return "上一页";
      if (en === "Next") return "下一页";
      return zh || en;
    }
  });

  renderHallRows(root);

  assert.match(rowsNode.innerHTML, /Hall 9/);
  assert.match(rowsNode.innerHTML, /Hall 10/);
  assert.doesNotMatch(rowsNode.innerHTML, /<h3>Hall 2<\/h3>/);
  assert.doesNotMatch(rowsNode.innerHTML, /<a class="halls-directory-row"/);
  assert.match(rowsNode.innerHTML, /data-halls-select="Hall 9"/);
  assert.match(rowsNode.innerHTML, /class="halls-row-cta"/);
  assert.match(footerNode.innerHTML, /data-halls-page="1"/);
  assert.match(footerNode.innerHTML, /data-halls-page="2"/);
  assert.match(footerNode.innerHTML, /is-active[^"]*".*2/);
  assert.match(footerNode.innerHTML, /显示第 9-10 项，共 10 项/);
  assert.equal(countNode.textContent, "10 Halls");
});
