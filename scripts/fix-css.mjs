import { readFileSync, writeFileSync } from 'node:fs';

const cssFile = 'C:/Users/35191/Documents/git1/styles.css';
let c = readFileSync(cssFile, 'utf-8');

// 在 .mini-stage .skin-image 后面添加音乐盒图片样式
const miniStageSkin = '.mini-stage .skin-image {\n  width: 88%;\n  height: 150px;\n}';
const musicBoxStyle = miniStageSkin + '\n\n/* Music box: square aspect ratio */\n.mini-stage .skin-image.music-box-image {\n  width: auto;\n  height: auto;\n  max-width: 180px;\n  max-height: 180px;\n  object-fit: contain;\n}';
c = c.replace(miniStageSkin, musicBoxStyle);

// 在 .viewer-stage::before 后面添加音乐盒检视器样式
const viewerBefore = '.viewer-stage::before {\n  content: "";';
const musicBoxViewer = viewerBefore; // same glow works for music boxes too

// 在 .skin-image 样式块后面添加音乐盒专用样式
const skinImageBlock = '.mini-stage .skin-image {\n  width: 88%;\n  height: 150px;\n}';
const afterSkinImage = '.mini-stage .skin-image {\n  width: 88%;\n  height: 150px;\n}\n\n/* Music box images: square format */\n.skin-image.music-box-image {\n  border-radius: 12px;\n  object-fit: contain;\n  background: radial-gradient(circle, rgba(210,173,98,0.08), transparent 70%);\n  padding: 8px;\n  border-radius: 12px;\n}\n\n/* Music box model (CSS fallback) */\n[data-model="music-box"] .body {\n  left: 140px;\n  top: 60px;\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  background: conic-gradient(from 0deg, #d2ad62, #1a1a2e, #d2ad62, #1a1a2e, #d2ad62);\n  box-shadow: inset 0 0 30px rgba(210,173,98,0.3), 0 0 20px rgba(210,173,98,0.15);\n}\n\n[data-model="music-box"] .barrel,\n[data-model="music-box"] .stock,\n[data-model="music-box"] .grip,\n[data-model="music-box"] .magazine,\n[data-model="music-box"] .accent {\n  display: none;\n}\n\n[data-model="music-box"] .disc {\n  position: absolute;\n  left: 170px;\n  top: 90px;\n  width: 140px;\n  height: 140px;\n  border-radius: 50%;\n  background: radial-gradient(circle at 50% 50%, #2a2a3e, #0e0e14);\n  border: 2px solid rgba(210,173,98,0.4);\n  box-shadow: inset 0 0 20px rgba(210,173,98,0.2);\n}\n\n[data-model="music-box"] .lid {\n  position: absolute;\n  left: 170px;\n  top: 50px;\n  width: 140px;\n  height: 60px;\n  border-radius: 50% 50% 0 0;\n  background: linear-gradient(180deg, rgba(210,173,98,0.3), rgba(210,173,98,0.1));\n  border: 2px solid rgba(210,173,98,0.4);\n  border-bottom: none;\n}\n\n[data-model="music-box"] .base {\n  position: absolute;\n  left: 150px;\n  top: 190px;\n  width: 180px;\n  height: 20px;\n  border-radius: 0 0 10px 10px;\n  background: linear-gradient(180deg, rgba(210,173,98,0.2), rgba(210,173,98,0.05));\n  border: 2px solid rgba(210,173,98,0.3);\n  border-top: none;\n}';
c = c.replace(skinImageBlock, afterSkinImage);

writeFileSync(cssFile, c, 'utf-8');
console.log('styles.css updated');
