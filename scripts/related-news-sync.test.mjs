import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyNewsItem,
  dedupeNewsItems,
  normalizeNewsItem,
  serializeNewsData
} from "./sync-related-news.mjs";

test("normalizes valid raw news item into stable related news shape", () => {
  const item = normalizeNewsItem({
    title: "Counter-Strike 2 Update",
    url: "/news/updates",
    publishedAt: "2026-06-30",
    summary: "Added sticker price visibility and Storage Unit improvements."
  }, {
    source: "Counter-Strike",
    baseUrl: "https://www.counter-strike.net",
    category: "official"
  });

  assert.deepEqual(item, {
    id: "counter-strike-2026-06-30-counter-strike-2-update",
    category: "market",
    source: "Counter-Strike",
    title: "Counter-Strike 2 Update",
    summary: "Added sticker price visibility and Storage Unit improvements.",
    url: "https://www.counter-strike.net/news/updates",
    publishedAt: "2026-06-30",
    image: "",
    tags: ["Update", "Inventory", "Stickers"]
  });
});

test("classifies esports and market items by source category and keywords", () => {
  assert.equal(classifyNewsItem({
    category: "esports",
    title: "NAVI win grand final",
    summary: "A tournament result.",
    source: "HLTV"
  }), "esports");

  assert.equal(classifyNewsItem({
    category: "official",
    title: "Sticker capsule market update",
    summary: "New sticker capsule and price display changes.",
    source: "Counter-Strike"
  }), "market");
});

test("dedupes by canonical url before normalized title", () => {
  const items = [
    { id: "a", url: "https://example.com/a?utm_source=x", title: "Same Title", publishedAt: "2026-07-01" },
    { id: "b", url: "https://example.com/a", title: "Different Title", publishedAt: "2026-07-02" },
    { id: "c", url: "https://example.com/c", title: "Same Title", publishedAt: "2026-07-03" }
  ];

  assert.deepEqual(dedupeNewsItems(items).map((item) => item.id), ["a"]);
});

test("serializes deterministic browser data file", () => {
  const serialized = serializeNewsData([{
    id: "sample",
    category: "official",
    source: "Counter-Strike",
    title: "Sample",
    summary: "Summary",
    url: "https://example.com/sample",
    publishedAt: "2026-07-01",
    image: "",
    tags: ["Update"]
  }]);

  assert.match(serialized, /^window\.RELATED_NEWS = /);
  assert.match(serialized, /"id": "sample"/);
  assert.match(serialized, /;\n$/);
});
