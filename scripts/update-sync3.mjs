import { readFileSync, writeFileSync } from 'node:fs';

const syncFile = 'C:/Users/35191/Documents/git1/scripts/sync-catalog.mjs';
let c = readFileSync(syncFile, 'utf8');

// 1. 添加 MUSIC_KITS_URL
const agentsLine = 'const AGENTS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/zh-CN/agents.json";';
const withMusic = agentsLine + '\nconst MUSIC_KITS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/zh-CN/music_kits.json";';
c = c.replace(agentsLine, withMusic);

// 2. 添加到 fetch 请求
c = c.replace(
  '[SOURCE_URL, STICKERS_URL, AGENTS_URL].map',
  '[SOURCE_URL, STICKERS_URL, AGENTS_URL, MUSIC_KITS_URL].map'
);

// 3. 修改 Promise.all 解构
c = c.replace(
  'const [source, stickers, agents] = await Promise.all(responses.map((response) => response.json()));',
  'const [source, stickers, agents, musicKits] = await Promise.all(responses.map((response) => response.json()));'
);

// 4. 在 compactAgents 后面添加音乐盒解析
const compactAgentsEnd = c.indexOf('source: "CSGO-API / Steam CDN"\n}));');
if (compactAgentsEnd > 0) {
  const insertPos = compactAgentsEnd + 'source: "CSGO-API / Steam CDN"\n}));'.length;
  const musicBoxCode = '\n\nconst compactMusicBoxes = musicKits.filter((kit) => kit.image).map((kit, index) => ({\n    id: kit.id,\n    name: kit.name,\n    type: "music-box",\n    weapon: "音乐盒",\n    collection: kit.name.split("|")[0]?.trim() || "Unknown Artist",\n    rarity: kit.rarity?.name || "高级",\n    quality: kit.exclusive ? "限定" : "普通",\n    price: null,\n    tone: tones[(compactSkins.length + compactStickers.length + compactAgents.length + index) % tones.length],\n    model: "music-box",\n    featured: false,\n    wears: [],\n    minFloat: null,\n    maxFloat: null,\n    description: kit.description ? kit.description.replace(/<[^>]+>/g, "").replace(/\\\\n/g, " ").substring(0, 200) : "",\n    image: kit.image,\n    source: "CSGO-API / Steam CDN"\n  }));\n';
  c = c.substring(0, insertPos) + musicBoxCode + c.substring(insertPos);
}

// 5. 更新 compact 合并
c = c.replace(
  'const compact = [...compactSkins, ...compactStickers, ...compactAgents];',
  'const compact = [...compactSkins, ...compactStickers, ...compactAgents, ...compactMusicBoxes];'
);

writeFileSync(syncFile, c, 'utf8');
console.log('sync-catalog.mjs updated');
