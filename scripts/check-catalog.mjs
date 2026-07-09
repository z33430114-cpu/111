import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const catalogPath = join(ROOT, "catalog-data.js");
const catalogContent = await readFile(catalogPath, "utf-8");

// 解析 catalog-data.js，正确提取 JSON 数组
const catalogIdx = catalogContent.indexOf("CS2_CATALOG");
const eqIdx = catalogContent.indexOf("=", catalogIdx);
const afterEq = catalogContent.substring(eqIdx + 1).trim();

// 去掉末尾的 "];\n" 和前面的 "["
const jsonStr = afterEq.substring(0, afterEq.length - 2).trim();
const catalogData = JSON.parse(jsonStr);

console.log("total items:", catalogData.length);

// 查找特定物品
const ak = catalogData.find((i) => i.name && i.name.includes("传承"));
console.log("AK 传承:", ak ? ak.name : "not found");
console.log("AK 传承 type:", ak?.type);
console.log("AK 传承 weapon:", ak?.weapon);
console.log("AK 传承 rarity:", ak?.rarity);
console.log("AK 传承 wears:", ak?.wears);

// 统计有图片的物品
const withImage = catalogData.filter((i) => i.image).length;
console.log("with image:", withImage);

// 统计每种类型
const typeCounts = {};
for (const item of catalogData) {
  typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
}
console.log("type distribution:", typeCounts);
