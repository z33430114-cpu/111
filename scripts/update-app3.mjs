import { readFileSync, writeFileSync } from 'node:fs';

const appFile = 'C:/Users/35191/Documents/git1/app.js';
let c = readFileSync(appFile, 'utf8');

// 1. 在 catalogSkinTypes 中添加 music-box
c = c.replace(
  'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove"]);',
  'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove", "music-box"]);'
);

// 2. 找到 sticker case 的位置，在它前面插入 music-box case
const stickerCaseMarker = '    case "sticker":';
const musicBoxCase = [
  '    case "music-box":',
  '      return item.image',
  '        ? \<img class="skin-image wear-\" src="\" alt="\" loading="lazy" />\',
  '        : "";',
  '',
  stickerCaseMarker,
].join('\n');

c = c.replace(stickerCaseMarker, musicBoxCase);

writeFileSync(appFile, c, 'utf8');
console.log('app.js updated');
