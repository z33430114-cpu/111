import { readFileSync, writeFileSync } from 'node:fs';

const appFile = 'C:/Users/35191/Documents/git1/app.js';
let c = readFileSync(appFile, 'utf8');

// 1. 在 catalogSkinTypes 中添加 music-box
c = c.replace(
  'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove"]);',
  'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove", "music-box"]);'
);

// 2. 找到 modelMarkup 中的 switch 语句，添加 music-box case
// 先找到 sticker case 的位置
const stickerCaseMarker = '    case "sticker":';
if (c.includes(stickerCaseMarker)) {
  const musicBoxCase = [
    '    case "music-box":',
    '      return \',
    '        <div class="music-box-model tone-\" data-model="\">',
    '          <span class="part disc"></span>',
    '          <span class="part lid"></span>',
    '          <span class="part base"></span>',
    '        </div>\;',
    ''
  ].join('\n');
  c = c.replace(stickerCaseMarker, musicBoxCase + '\n' + stickerCaseMarker);
}

// 3. 在 modelMarkup 函数的 default 分支前添加 music-box 的图片渲染
// 找到 switch 的 default
const defaultCase = '    default:';
if (c.includes(defaultCase)) {
  const musicBoxImg = [
    '    case "music-box":',
    '      return item.image',
    '        ? \<img class="skin-image wear-\" src="\" alt="\" loading="lazy" />\\',
    '        : "";'
  ].join('\n');
  c = c.replace(defaultCase, musicBoxImg + '\n' + defaultCase);
}

writeFileSync(appFile, c, 'utf8');
console.log('app.js updated');
