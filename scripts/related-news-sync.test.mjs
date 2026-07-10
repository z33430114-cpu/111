import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyNewsItem,
  dedupeNewsItems,
  normalizeNewsItem,
  normalizeRankingSnapshot,
  serializeNewsData
} from "./sync-related-news.mjs";

test("normalizes valid raw news item into stable related news shape", () => {
  const item = normalizeNewsItem({
    title: "Counter-Strike 2 Update",
    url: "/news/updates",
    publishedAt: "2026-06-30",
    summary: "Added sticker price visibility and Storage Unit improvements.",
    image: "/images/update.png"
  }, {
    source: "Counter-Strike",
    baseUrl: "https://www.counter-strike.net",
    category: "official"
  });

  assert.deepEqual(item, {
    id: "counter-strike-2026-06-30-counter-strike-2-update",
    category: "official",
    source: "Counter-Strike",
    title: "Counter-Strike 2 Update",
    summary: "Added sticker price visibility and Storage Unit improvements.",
    body: "",
    url: "https://www.counter-strike.net/news/updates",
    publishedAt: "2026-06-30",
    image: "https://www.counter-strike.net/images/update.png",
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
    title: "Best budget knives for CS2",
    summary: "Knife prices and skin market trends.",
    source: "Skinport Blog"
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
  const rankingSnapshot = normalizeRankingSnapshot({
    date: "2026-07-06",
    label: "HLTV World Ranking",
    source: "HLTV",
    url: "https://www.hltv.org/ranking/teams/2026/july/6",
    teams: [
      { rank: 1, name: "Vitality", points: 999 }
    ]
  });
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
  }], rankingSnapshot);

  assert.match(serialized, /^window\.HLTV_TEAM_RANKING_SNAPSHOT = /);
  assert.match(serialized, /"logo": "https:\/\/img-cdn\.hltv\.org\/teamlogo\//);
  assert.match(serialized, /window\.RELATED_NEWS = /);
  assert.match(serialized, /"id": "sample"/);
  assert.match(serialized, /;\n$/);
});
