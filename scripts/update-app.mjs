import { readFileSync, writeFileSync } from 'node:fs';

const appFile = 'C:/Users/35191/Documents/git1/app.js';
let c = readFileSync(appFile, 'utf8');

// 1. 在 catalogSkinTypes 中添加 music-box
c = c.replace(
  'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove"]);',
  'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove", "music-box"]);'
);

// 2. 添加音乐盒的 CSS 模型标记（在 sticker 模型之后）
// 找到 modelMarkup 函数中的 sticker 处理部分
const stickerPart = 'model: "sticker"';
const stickerAfter = 'model: "sticker",\n      wears: item.wears';
// 在 itemCard 函数中找到 sticker 相关的渲染逻辑，添加 music-box 支持

// 3. 在 modelMarkup 函数中添加音乐盒的 CSS 模型
// 找到 [data-model="sticker"] 类似的逻辑，在 modelMarkup 中
const wearSwitch = 'switch (item.model) {';
const musicBoxCase =     case "music-box":
      return \
        <div class="weapon-model tone-\" data-model="\" data-tone="\">
          <span class="part disc"></span>
          <span class="part lid"></span>
          <span class="part base"></span>
        </div>\;;

// 在 switch 中添加 music-box case（在 sticker case 之前）
const stickerCase = '    case "sticker":';
if (c.includes(stickerCase)) {
  c = c.replace(stickerCase, musicBoxCase + '\n' + stickerCase);
}

// 4. 在 sticker 的 wears 处理后面添加 music-box 的 wears 为空的处理
// 实际上 music-box 不需要 wears，已经在 curatedItems 中设置了 wears: []

writeFileSync(appFile, c, 'utf8');
console.log('app.js updated');
