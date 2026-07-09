import os

app_file = r'C:\Users\35191\Documents\git1\app.js'
with open(app_file, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. 添加 music-box 到 catalogSkinTypes
old = 'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove"]);'
new = 'const catalogSkinTypes = new Set(["pistol", "rifle", "smg", "shotgun", "machinegun", "knife", "glove", "music-box"]);'
c = c.replace(old, new)

# 2. 在 sticker case 前插入 music-box case
sticker_marker = '    case "sticker":'
music_box_case = '    case "music-box":\n      return item.image\n        ? \\x3cimg class="skin-image wear-" src="" alt="" loading="lazy" /\\x3e\n        : "";\n\n' + sticker_marker
c = c.replace(sticker_marker, music_box_case)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(c)

print('app.js updated')
