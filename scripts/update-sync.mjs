import { readFileSync, writeFileSync } from 'node:fs';

const file = 'C:/Users/35191/Documents/git1/scripts/sync-catalog.mjs';
let c = readFileSync(file, 'utf8');

// 1. 添加 MUSIC_KITS_URL
c = c.replace(
  'const AGENTS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/zh-CN/agents.json";',
  'const AGENTS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/zh-CN/agents.json";\nconst MUSIC_KITS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/zh-CN/music_kits.json";'
);

// 2. 添加音乐盒到 fetch 请求
c = c.replace(
  '[SOURCE_URL, STICKERS_URL, AGENTS_URL].map',
  '[SOURCE_URL, STICKERS_URL, AGENTS_URL, MUSIC_KITS_URL].map'
);

// 3. 添加音乐盒解析逻辑（在 compactAgents 之后）
const musicBoxParser = 
const compactMusicBoxes = fetch(MUSIC_KITS_URL, { headers: { "User-Agent": "CS2-Relic-Hall" } }).then(async (response) => {
  if (!response.ok) return [];
  const musicKits = await response.json();
  return musicKits.filter((kit) => kit.image).map((kit, index) => ({
    id: kit.id,
    name: kit.name,
    type: "music-box",
    weapon: "音乐盒",
    collection: kit.name.split('|')[0]?.trim() || "未知艺术家",
    rarity: kit.rarity?.name || "高级",
    quality: kit.exclusive ? "限定" : "普通",
    price: null,
    tone: tones[(compactSkins.length + compactStickers.length + compactAgents.length + index) % tones.length],
    model: "music-box",
    featured: false,
    wears: [],
    minFloat: null,
    maxFloat: null,
    description: kit.description ? kit.description.replace(/<[^>]+>/g, "").replace(/\\\\n/g, " ").substring(0, 200) : "",
    image: kit.image,
    source: "CSGO-API / Steam CDN"
  }));
});
;

c = c.replace(
  'const compact = [...compactSkins, ...compactStickers, ...compactAgents];',
  musicBoxParser + '\nconst [compactSkinsFinal, compactStickersFinal, compactAgentsFinal, compactMusicBoxesArr] = await Promise.all([\n  Promise.resolve(compactSkins),\n  Promise.resolve(compactStickers),\n  Promise.resolve(compactAgents),\n  compactMusicBoxes\n]);\n\nconst compact = [...compactSkinsFinal, ...compactStickersFinal, ...compactAgentsFinal, ...compactMusicBoxesArr];'
);

// 4. 更新 assetRecords 包含音乐盒
c = c.replace(
  'const assetRecords = new Map([...source, ...stickers, ...agents].map',
  '// Note: music_kits.json uses different id format, only include sources with compatible IDs\nconst assetRecords = new Map([...source, ...stickers, ...agents].map'
);

writeFileSync(file, c, 'utf8');
console.log('sync-catalog.mjs updated');
