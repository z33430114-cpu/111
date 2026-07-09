import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

function blockBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    console.error(`Unable to locate block between: ${startMarker} -> ${endMarker}`);
    process.exit(1);
  }
  return source.slice(start, end);
}

const openingUiBlock = blockBetween("function openingInspectLinkMarkup(entryOrHref, compact = false)", "function openingPickerGroups()");
const financeBlock = blockBetween("function openingFinanceAnalyticsMarkup(item)", "function setActiveOpening(id)");
const simulatorBlock = blockBetween("function openingSimulatorMarkup(item)", "function setActiveOpening(id)");

const requiredOpeningCopy = [
  "检视物品",
  "暂无掉落数据。",
  "常规掉落",
  "稀有特殊物品",
  "查看详情"
];

const requiredFinanceCopy = [
  "收支分析",
  "开箱花费与回报",
  "基于当前开箱成本和历史掉落价格估算。",
  "开箱历史"
];

const requiredSimulatorCopy = [
  "互动开箱",
  "武器箱稀有度概率遵循 Valve 公布的模型，磨损度会在每个皮肤真实的浮点范围内生成具体数值。",
  "开启这个箱子",
  "执行连开",
  "箱内掉落",
  "完整掉落池"
];

for (const snippet of requiredOpeningCopy) {
  if (!openingUiBlock.includes(snippet)) {
    console.error(`Opening UI copy is missing: ${snippet}`);
    process.exit(1);
  }
}

for (const snippet of requiredFinanceCopy) {
  if (!financeBlock.includes(snippet)) {
    console.error(`Opening finance copy is missing: ${snippet}`);
    process.exit(1);
  }
}

for (const snippet of requiredSimulatorCopy) {
  if (!simulatorBlock.includes(snippet)) {
    console.error(`Opening simulator copy is missing: ${snippet}`);
    process.exit(1);
  }
}

const forbiddenMojibakeMarkers = [
  "鏆傛棤",
  "妫€瑙",
  "绋€鏈",
  "鍥炴姤",
  "鎺夎惤",
  "纾ㄦ崯",
  "鐎圭懓",
  "濮濓箑",
  "\uFFFD"
];

const inspectedBlocks = [
  ["opening-ui", openingUiBlock],
  ["finance", financeBlock],
  ["simulator", simulatorBlock]
];

for (const [label, block] of inspectedBlocks) {
  const found = forbiddenMojibakeMarkers.filter((marker) => block.includes(marker));
  if (found.length) {
    console.error(`Opening ${label} copy still contains mojibake markers:`);
    found.forEach((marker) => console.error(`- ${marker}`));
    process.exit(1);
  }
}

const requiredAudioSnippets = [
  'localPageUrl("assets/cs2-case-unlock.wav")',
  'localPageUrl("assets/cs2-case-scroll.wav")',
  'const OPENING_REEL_DURATION_MS = 6800;',
  'playOpeningSample(OPENING_SFX.unlock, 0, 0.62);',
  'const scrollCueTimings = openingScrollCueTimings({',
  'targetDistancePx: target,',
  'stepDistancePx: cardWidth + gap,',
  'function openingScrollCueTimings(config = OPENING_REEL_DURATION_MS)',
  'playOpeningSfx(winner, { simplified: simplifiedAudio, scrollCueTimings });',
  'track.style.transition = `transform ${OPENING_REEL_DURATION_MS / 1000}s cubic-bezier(0.08, 0.75, 0.08, 1)`;'
];

for (const snippet of requiredAudioSnippets) {
  if (!source.includes(snippet)) {
    console.error(`Opening audio snippet is missing: ${snippet}`);
    process.exit(1);
  }
}

const forbiddenAudioSnippets = [
  'localPageUrl("assets/opening-spin.wav")',
  'localPageUrl("assets/opening-land.wav")',
  'playOpeningSample(OPENING_SFX.spin,',
  'playOpeningSample(OPENING_SFX.land,'
];

for (const snippet of forbiddenAudioSnippets) {
  if (source.includes(snippet)) {
    console.error(`Legacy opening audio snippet is still present: ${snippet}`);
    process.exit(1);
  }
}

console.log("Openings copy and audio guard passed.");
