import { readFileSync, writeFileSync } from 'node:fs';

const appFile = 'C:/Users/35191/Documents/git1/app.js';
let c = readFileSync(appFile, 'utf-8');

// 1. 在 itemDisplayState 中添加 music-box 的显示
const oldDisplayState = '  if (item.type === "agent") return ${item.quality || "未知"} 阵营;\n  return "特殊物品";';
const newDisplayState = '  if (item.type === "agent") return ${item.quality || "未知"} 阵营;\n  if (item.type === "music-box") return "音乐盒";\n  return "特殊物品";';
c = c.replace(oldDisplayState, newDisplayState);

// 2. 在 modelMarkup 中为 music-box 添加特殊 CSS 类（有图片的情况下）
const oldModelImg = '  if (item.image) {\n    return <img class="skin-image wear-" src="" alt="" loading="lazy" />;\n  }';
const newModelImg = '  if (item.image) {\n    return <img class="skin-image " src="" alt="" loading="lazy" />;\n  }';
c = c.replace(oldModelImg, newModelImg);

writeFileSync(appFile, c, 'utf8');
console.log('app.js updated');
