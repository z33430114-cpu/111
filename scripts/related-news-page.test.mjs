import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("related news page is wired into navigation and renderer", async () => {
  const [runtime, app, relatedHtml, relatedDetailHtml, styles, relatedStyles, newsData, detailData] = await Promise.all([
    readFile(join(process.cwd(), "language-runtime.js"), "utf8"),
    readFile(join(process.cwd(), "app.js"), "utf8"),
    readFile(join(process.cwd(), "related.html"), "utf8"),
    readFile(join(process.cwd(), "related-detail.html"), "utf8"),
    readFile(join(process.cwd(), "styles.css"), "utf8"),
    readFile(join(process.cwd(), "related-news.css"), "utf8"),
    readFile(join(process.cwd(), "related-news-data.js"), "utf8"),
    readFile(join(process.cwd(), "related-news-detail-data.js"), "utf8")
  ]);
  const combinedStyles = `${styles}\n${relatedStyles}`;

  assert.match(runtime, /"related\.html": "Related"/);
  assert.match(runtime, /Related: "Related"/);
  assert.match(runtime, /Related: "\\u76f8\\u5173\\u8d44\\u8baf"/);
  assert.match(app, /function renderRelatedNews/);
  assert.match(app, /window\.RELATED_NEWS/);
  assert.match(app, /window\.HLTV_TEAM_RANKING_SNAPSHOT/);
  assert.match(app, /function relatedNewsRankingMarkup/);
  assert.match(app, /function relatedNewsRankingTeamLogoMarkup/);
  assert.doesNotMatch(app, /formatReadableDate/);
  assert.match(app, /relatedNewsCategoryLabel/);
  assert.match(app, /titleZh/);
  assert.match(app, /summaryZh/);
  assert.match(app, /sourceZh/);
  assert.match(app, /bodyZh/);
  assert.match(app, /bulletsZh/);
  assert.match(app, /relatedNewsVisualMarkup/);
  assert.match(app, /function activeRelatedNewsFilter/);
  assert.match(app, /function preferredRelatedNewsFeatured/);
  assert.match(app, /function relatedNewsDetailRecord/);
  assert.match(app, /function relatedNewsEntryWithDetail/);
  assert.match(app, /function renderRelatedNewsDetail/);
  assert.match(app, /related-detail\.html\?id=/);
  assert.match(app, /filterCounts\[filter\] \|\| 0/);
  assert.match(app, /entry\.category === "official" \|\| entry\.category === "market"\) && entry\.image/);
  assert.match(app, /data-related-news-filter/);
  assert.match(app, /target="_blank" rel="noopener noreferrer"/);
  assert.match(app, /Source article/);
  assert.match(app, /Read local brief/);
  assert.match(app, /No stories in this category yet/);
  assert.match(app, /targetPage === "related\.html"/);
  assert.match(app, /targetPage === "related-detail\.html"/);
  assert.match(relatedHtml, /related-news-data\.js/);
  assert.match(relatedHtml, /related-news\.css/);
  assert.match(relatedHtml, /data-nav-key="Related"/);
  assert.match(relatedDetailHtml, /related-news-data\.js/);
  assert.match(relatedDetailHtml, /related-news-detail-data\.js/);
  assert.match(relatedDetailHtml, /related-news\.css/);
  assert.match(relatedDetailHtml, /data-nav-key="Related" class="active"/);
  assert.match(relatedHtml, /styles\.css/);
  assert.match(relatedStyles, /\.related-news-visual/);
  assert.match(relatedStyles, /\.related-news-featured-visual/);
  assert.match(relatedStyles, /\.related-news-article/);
  assert.match(relatedStyles, /\.related-news-article-visual/);
  assert.match(relatedStyles, /\.related-news-empty-state/);
  assert.match(relatedStyles, /\.related-news-ranking/);
  assert.match(relatedStyles, /\.related-news-ranking-list/);
  assert.match(relatedStyles, /\.related-news-ranking-logo/);
  assert.match(relatedStyles, /\.related-news-ranking-team/);
  assert.match(relatedStyles, /\.related-news-actions/);
  assert.match(relatedStyles, /\.related-news-card\.is-text-only/);
  assert.match(combinedStyles, /\.related-news-page/);
  assert.match(combinedStyles, /\.related-news-featured/);
  assert.match(combinedStyles, /\.related-news-filter-bar/);
  assert.match(combinedStyles, /\.related-news-meta/);
  assert.match(combinedStyles, /\.related-news-tags/);
  assert.doesNotMatch(newsData, /"image": "assets\//);
  assert.match(newsData, /img-cdn\.hltv\.org|cdn\.skinport\.com|cdn\.csgoskins\.gg|cdn\.esportfire-services\.com|queniuqe\.com|steamstatic\.com/);
  assert.match(newsData, /window\.HLTV_TEAM_RANKING_SNAPSHOT/);
  assert.match(newsData, /Falcons/);
  assert.match(newsData, /893/);
  assert.match(newsData, /teamlogo/);
  assert.match(newsData, /teamUrl/);
  assert.doesNotMatch(newsData, /"bodyZh"/);
  assert.match(newsData, /"bulletsZh"/);
  assert.match(detailData, /window\.RELATED_NEWS_DETAIL/);
  assert.match(detailData, /"bodyZh"/);
});
