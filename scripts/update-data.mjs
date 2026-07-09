import { readFileSync, writeFileSync } from 'node:fs';

const file = 'C:/Users/35191/Documents/git1/data.js';
let c = readFileSync(file, 'utf8');

// 1. 添加 music-box 分类到 categories
const agentCategory = '{ id: "agent", label: "探员", note: "T 与 CT 阵营角色外观" }';
const musicBoxCategory = '{ id: "music-box", label: "音乐盒", note: "Daniel Sadowski, Feed Me, Noisia 等电子音乐盒" }';
c = c.replace(agentCategory, agentCategory + ',\n  ' + musicBoxCategory);

// 2. 添加精选音乐盒到 curatedItems
const musicBoxCurated = [
  '  {',
  '    id: "musicbox-daniel",',
  '    name: "Daniel Sadowski | 深红突击",',
  '    type: "music-box",',
  '    weapon: "音乐盒",',
  '    collection: "Daniel Sadowski",',
  '    rarity: "高级",',
  '    quality: "普通",',
  '    price: 45,',
  '    tone: "crimson",',
  '    model: "music-box",',
  '    featured: true,',
  '    wears: [],',
  '    description: "Daniel Sadowski 打造的暗黑电子风音乐盒，适合搭配暗红色调展示。"',
  '  },',
  '  {',
  '    id: "musicbox-feedme",',
  '    name: "Feed Me | 如日中天",',
  '    type: "music-box",',
  '    weapon: "音乐盒",',
  '    collection: "Feed Me",',
  '    rarity: "高级",',
  '    quality: "普通",',
  '    price: 35,',
  '    tone: "gold",',
  '    model: "music-box",',
  '    featured: true,',
  '    wears: [],',
  '    description: "Feed Me 的标志性电子乐音乐盒，金色主题适合突出展示。"',
  '  }',
].join('\n');

// 找到 agent-sir-bloody 条目末尾
const agentEntryStart = c.indexOf('agent-sir-bloody');
let braceCount = 0;
let entryEnd = -1;
for (let pos = agentEntryStart; pos < c.length; pos++) {
  if (c[pos] === '{') braceCount++;
  if (c[pos] === '}') {
    braceCount--;
    if (braceCount === 0) {
      entryEnd = pos + 1;
      break;
    }
  }
}
if (entryEnd > 0) {
  c = c.substring(0, entryEnd) + ',' + musicBoxCurated + '\n' + c.substring(entryEnd);
}

writeFileSync(file, c, 'utf8');
console.log('data.js updated successfully');
