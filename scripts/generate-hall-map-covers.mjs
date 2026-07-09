import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputDir = join(process.cwd(), "assets", "halls", "generated");

const maps = [
  ["anubis", "Anubis", ["#d7a14b", "#8c5b2f", "#2b6f74"]],
  ["assault", "Assault", ["#9da6a6", "#485257", "#c94d35"]],
  ["aztec", "Aztec", ["#78a15a", "#2d4b37", "#d1b16c"]],
  ["baggage", "Baggage", ["#d77b34", "#55453a", "#b8c1c8"]],
  ["bank", "Bank", ["#85a6c8", "#3d5368", "#d8b45f"]],
  ["cache", "Cache", ["#89b151", "#3f5f37", "#d5b443"]],
  ["canals", "Canals", ["#5ba3b0", "#2b4f5b", "#d7a15f"]],
  ["cobblestone", "Cobblestone", ["#7b8fa8", "#3e4d61", "#c7b27b"]],
  ["control", "Control", ["#4fa3aa", "#273f46", "#e45d45"]],
  ["dust", "Dust", ["#d1a463", "#7a5634", "#f0d89a"]],
  ["italy", "Italy", ["#d7ba73", "#6f7c4b", "#b7513e"]],
  ["lake", "Lake", ["#5299b5", "#254b62", "#8fbd72"]],
  ["militia", "Militia", ["#9ca36a", "#4f573f", "#c78f57"]],
  ["norse", "Norse", ["#7fa6b8", "#2e4e61", "#d3d9d4"]],
  ["safehouse", "Safehouse", ["#b58558", "#4e3d35", "#7ea06a"]],
  ["st-marc", "St. Marc", ["#4ea47d", "#214d43", "#e2b35f"]]
];

function hash(value) {
  let result = 2166136261;
  for (const char of value) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function polygon(points) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function coverSvg([slug, label, colors]) {
  const [accent, deep, warm] = colors;
  const rand = random(hash(slug));
  const rooms = Array.from({ length: 7 }, (_, index) => {
    const x = 38 + Math.floor(rand() * 460);
    const y = 22 + Math.floor(rand() * 104);
    const w = 48 + Math.floor(rand() * 90);
    const h = 18 + Math.floor(rand() * 42);
    const rotate = (rand() * 8 - 4).toFixed(2);
    const fill = index % 3 === 0 ? accent : index % 3 === 1 ? deep : warm;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})" fill="${fill}" opacity="${0.22 + rand() * 0.16}" stroke="${accent}" stroke-opacity=".24"/>`;
  }).join("");
  const corridors = Array.from({ length: 5 }, () => {
    const x1 = 45 + Math.floor(rand() * 500);
    const y1 = 30 + Math.floor(rand() * 100);
    const x2 = 70 + Math.floor(rand() * 500);
    const y2 = 30 + Math.floor(rand() * 100);
    return `<path d="M${x1} ${y1} C ${Math.floor((x1 + x2) / 2)} ${y1}, ${Math.floor((x1 + x2) / 2)} ${y2}, ${x2} ${y2}" fill="none" stroke="${accent}" stroke-width="${5 + Math.floor(rand() * 4)}" stroke-linecap="round" opacity=".38"/>`;
  }).join("");
  const zoneA = polygon([[62, 38], [136, 20], [195, 55], [168, 104], [83, 98]]);
  const zoneB = polygon([[398, 42], [520, 28], [572, 72], [510, 125], [406, 110]]);
  const dots = Array.from({ length: 18 }, () => {
    const x = 34 + Math.floor(rand() * 570);
    const y = 20 + Math.floor(rand() * 130);
    return `<circle cx="${x}" cy="${y}" r="${1 + Math.floor(rand() * 2)}" fill="#f4efe4" opacity="${0.16 + rand() * 0.24}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180" role="img" aria-label="${label} map collection cover">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#050606"/>
      <stop offset=".55" stop-color="#111315"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <radialGradient id="pulse" cx=".18" cy=".25" r=".85">
      <stop offset="0" stop-color="${accent}" stop-opacity=".42"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>
  <rect width="640" height="180" fill="url(#bg)"/>
  <rect width="640" height="180" fill="url(#pulse)"/>
  <path d="M-20 145 C 110 98, 166 170, 294 124 S 500 70, 668 106" fill="none" stroke="${accent}" stroke-width="38" stroke-opacity=".08" filter="url(#soft)"/>
  <g opacity=".95">
    <polygon points="${zoneA}" fill="${accent}" opacity=".20" stroke="${accent}" stroke-opacity=".46"/>
    <polygon points="${zoneB}" fill="${warm}" opacity=".18" stroke="${warm}" stroke-opacity=".42"/>
    ${corridors}
    ${rooms}
  </g>
  <g font-family="Rajdhani, Teko, Arial, sans-serif" text-anchor="start">
    <text x="35" y="151" fill="#f7efe4" font-size="44" font-weight="800" letter-spacing="4">${label.toUpperCase()}</text>
    <text x="38" y="166" fill="${accent}" font-size="13" font-weight="700" letter-spacing="3">TACTICAL MAP COLLECTION</text>
  </g>
  ${dots}
  <rect x="1" y="1" width="638" height="178" fill="none" stroke="${accent}" stroke-opacity=".25"/>
</svg>
`;
}

await mkdir(outputDir, { recursive: true });
await Promise.all(
  maps.map((map) => writeFile(join(outputDir, `map-${map[0]}.svg`), coverSvg(map), "utf8"))
);

console.log(`Generated ${maps.length} map covers in ${outputDir}`);
