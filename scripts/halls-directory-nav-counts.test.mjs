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
    document: {
      body: { classList: { remove() {}, add() {} } },
      querySelector: () => null
    },
    ...overrides
  };
  vm.createContext(context);
  const compiled = `${extractFunctionSource(source, name)};\nresult = ${name};`;
  return vm.runInContext(compiled, context);
}

test("buildHallsDirectoryMarkup uses live bucket counts", () => {
  const buildHallsDirectoryMarkup = buildFunction("buildHallsDirectoryMarkup", {
    HALL_BUCKETS: [
      { id: "collection", label: "Map Collections" },
      { id: "weapon-case", label: "Cases" },
      { id: "capsule", label: "Capsules" },
      { id: "souvenir-package", label: "Souvenirs" },
      { id: "other", label: "Other" }
    ],
    buildHallSummaries: () => ([
      ...Array.from({ length: 24 }, (_, index) => ({ name: `Collection ${index + 1}`, bucket: "collection" })),
      ...Array.from({ length: 5 }, (_, index) => ({ name: `Case ${index + 1}`, bucket: "weapon-case" })),
      ...Array.from({ length: 3 }, (_, index) => ({ name: `Capsule ${index + 1}`, bucket: "capsule" })),
      ...Array.from({ length: 2 }, (_, index) => ({ name: `Souvenir ${index + 1}`, bucket: "souvenir-package" })),
      { name: "Music Kit Box", bucket: "other" }
    ])
  });

  const markup = buildHallsDirectoryMarkup();
  assert.match(markup, /data-halls-bucket="collection"[\s\S]*?<em>24<\/em>/);
  assert.match(markup, /data-halls-bucket="weapon-case"[\s\S]*?<em>5<\/em>/);
  assert.match(markup, /data-halls-bucket="capsule"[\s\S]*?<em>3<\/em>/);
  assert.match(markup, /data-halls-bucket="souvenir-package"[\s\S]*?<em>2<\/em>/);
  assert.match(markup, /data-halls-bucket="other"[\s\S]*?<em>1<\/em>/);
});

test("renderHallRows shows the full first collection page before paginating", () => {
  const entries = Array.from({ length: 24 }, (_, index) => ({
    name: `Collection ${String(index + 1).padStart(2, "0")}`,
    count: index + 1,
    bucket: "collection",
    category: "Map Collections",
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
    hallState: { bucket: "collection", query: "", sort: "az", type: "all", page: 1, selectedName: "" },
    PREVIEW_HALL_ROWS: entries,
    buildHallSummaries: () => entries,
    hallEntriesForBucket: () => entries,
    filteredHallEntries: () => entries,
    hallTypeOptions: () => '<option value="all">all</option>',
    hallCoverMarkup: () => "<div class=\"cover\"></div>",
    hallHref: (entry) => `catalog.html?collection=${encodeURIComponent(entry.name)}`
  });

  renderHallRows(root);

  assert.match(rowsNode.innerHTML, /Collection 01/);
  assert.match(rowsNode.innerHTML, /Collection 24/);
  assert.equal((rowsNode.innerHTML.match(/data-halls-select=/g) || []).length, 24);
  assert.match(footerNode.innerHTML, /data-halls-page="1"/);
  assert.doesNotMatch(footerNode.innerHTML, /data-halls-page="2"/);
});

test("renderHallsDirectory does not rewrite shared navigation labels", () => {
  let syncCalls = 0;
  const main = { innerHTML: "" };
  const renderHallsDirectory = buildFunction("renderHallsDirectory", {
    hallPageActive: () => true,
    document: {
      body: {
        classList: {
          remove() {},
          add() {}
        }
      },
      querySelector(selector) {
        if (selector === "main.collections-page") return main;
        return null;
      }
    },
    syncHallsChrome: () => {
      syncCalls += 1;
    },
    buildHallsDirectoryMarkup: () => "<section>ok</section>",
    renderHallRows: () => {}
  });

  renderHallsDirectory();

  assert.equal(main.innerHTML, "<section>ok</section>");
  assert.equal(syncCalls, 0);
});

test("classifyHallBucket keeps map collections separate from regular collections", () => {
  const classifyHallBucket = buildFunction("classifyHallBucket", {
    isMapCollectionEntry: (entry) => /ancient|mirage|inferno|nuke|overpass|vertigo|dust 2|train/i.test(
      [entry?.name, entry?.collectionEn, entry?.collectionZh].filter(Boolean).join(" ")
    )
  });

  assert.equal(
    classifyHallBucket({ name: "The Ancient Collection", collectionEn: "The Ancient Collection", types: ["rifle"] }),
    "collection"
  );
  assert.equal(
    classifyHallBucket({ name: "The Clutch Collection", collectionEn: "The Clutch Collection", types: ["rifle"] }),
    "other"
  );
});

test("hallCoverMarkup keeps map collections on map-style covers when no dedicated hall cover exists", () => {
  const hallCoverMarkup = buildFunction("hallCoverMarkup", {
    hallDisplayName: (entry) => entry?.name || "",
    hallShortLabel: () => "Hall",
    hallSlug: (value) => String(value || "").toLowerCase().replace(/\s+/g, "-"),
    escapeHtml: (value) => String(value ?? "")
  });

  const markup = hallCoverMarkup({
    name: "The Cache Collection",
    collectionEn: "The Cache Collection",
    bucket: "collection",
    previewImage: "https://example.com/cache-preview.png"
  });

  assert.match(markup, /class="halls-map-render/);
  assert.doesNotMatch(markup, /cache-preview\.png/);
});

test("hallCoverMarkup prefers container images over item previews", () => {
  const hallCoverMarkup = buildFunction("hallCoverMarkup", {
    hallDisplayName: (entry) => entry?.name || "",
    escapeHtml: (value) => String(value ?? "")
  });

  const markup = hallCoverMarkup({
    name: "Clutch Case",
    bucket: "weapon-case",
    containerImage: "https://example.com/clutch-case.png",
    previewImage: "https://example.com/inside-item.png"
  });

  assert.match(markup, /clutch-case\.png/);
  assert.doesNotMatch(markup, /inside-item\.png/);
});

test("hallCoverMarkup falls back to item previews when no container image exists", () => {
  const hallCoverMarkup = buildFunction("hallCoverMarkup", {
    hallDisplayName: (entry) => entry?.name || "",
    escapeHtml: (value) => String(value ?? "")
  });

  const markup = hallCoverMarkup({
    name: "Fallback Collection",
    bucket: "other",
    previewImage: "https://example.com/fallback-item.png"
  });

  assert.match(markup, /fallback-item\.png/);
});

test("hallOpeningCandidates maps collection names back to container aliases", () => {
  const hallOpeningCandidates = buildFunction("hallOpeningCandidates", {
    hallLookupKey: (value) => String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^the\s+/, "")
      .replace(/\s+/g, " ")
  });

  const aliases = hallOpeningCandidates({
    name: "The Fracture Collection",
    collectionEn: "The Fracture Collection"
  });

  assert.ok(aliases.includes("fracture"));
  assert.ok(aliases.includes("fracture case"));
});
