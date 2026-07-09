import argparse
import colorsys
import json
import math
import os
import re
import sys
import time
import urllib.request
from collections import Counter
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required. Install it with: py -m pip install pillow", file=sys.stderr)
    sys.exit(2)

COLOR_BUCKETS = [
    ("black", (0, 0, 0)),
    ("white", (245, 245, 245)),
    ("gray", (125, 125, 125)),
    ("red", (210, 45, 45)),
    ("orange", (230, 115, 40)),
    ("gold", (220, 175, 45)),
    ("green", (45, 160, 80)),
    ("blue", (45, 110, 215)),
    ("teal", (40, 170, 170)),
    ("purple", (145, 80, 205)),
    ("pink", (220, 90, 175)),
]

TONE_BY_COLOR = {
    "black": "neutral",
    "gray": "neutral",
    "white": "ivory",
    "red": "crimson",
    "orange": "ruby",
    "gold": "gold",
    "green": "emerald",
    "blue": "teal",
    "teal": "teal",
    "purple": "violet",
    "pink": "violet",
}

RECOMMENDER_COLORS = {
    "black": "black",
    "gray": "black",
    "white": "white",
    "red": "red",
    "orange": "red",
    "gold": "gold",
    "green": "green",
    "blue": "blue",
    "teal": "blue",
    "purple": "purple",
    "pink": "purple",
}


def load_catalog(path):
    raw = Path(path).read_text(encoding="utf-8")
    marker = "globalThis.CS2_CATALOG ="
    start = raw.find(marker)
    if start < 0:
        raise RuntimeError(f"Could not find CS2_CATALOG in {path}")
    start = raw.find("[", start)
    if start < 0:
        raise RuntimeError(f"Could not find CS2_CATALOG array in {path}")
    decoder = json.JSONDecoder()
    catalog, _end = decoder.raw_decode(raw[start:])
    return catalog


def fetch_image(url, timeout=20):
    request = urllib.request.Request(url, headers={"User-Agent": "CS2-Relic-Hall-ColorIndexer/1.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def color_distance(a, b):
    return math.sqrt(sum((a[i] - b[i]) ** 2 for i in range(3)))


def bucket_for_rgb(rgb):
    r, g, b = rgb
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if v < 0.18:
        return "black"
    if s < 0.14 and v > 0.78:
        return "white"
    if s < 0.18:
        return "gray"
    return min(COLOR_BUCKETS[3:], key=lambda item: color_distance(rgb, item[1]))[0]


def analyze_image(data):
    image = Image.open(BytesIO(data)).convert("RGBA")
    image.thumbnail((128, 128))
    pixels = []
    for r, g, b, a in image.getdata():
        if a < 32:
            continue
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if v > 0.96 and s < 0.05:
            continue
        if v < 0.05:
            continue
        pixels.append((r, g, b))
    if not pixels:
        return None
    buckets = Counter(bucket_for_rgb(pixel) for pixel in pixels)
    total = sum(buckets.values())
    ranked = buckets.most_common(5)
    recommender_colors = []
    for name, count in ranked:
        color = RECOMMENDER_COLORS.get(name)
        if color and color not in recommender_colors and count / total >= 0.08:
            recommender_colors.append(color)
    primary_bucket, primary_count = ranked[0]
    confidence = round(primary_count / total, 4)
    avg_rgb = tuple(round(sum(pixel[i] for pixel in pixels) / len(pixels)) for i in range(3))
    return {
        "primaryBucket": primary_bucket,
        "primaryTone": TONE_BY_COLOR.get(primary_bucket, "neutral"),
        "colors": recommender_colors[:3] or [RECOMMENDER_COLORS.get(primary_bucket, "black")],
        "confidence": confidence,
        "averageRgb": avg_rgb,
        "dominantColors": [{"name": name, "share": round(count / total, 4)} for name, count in ranked],
    }


def main():
    parser = argparse.ArgumentParser(description="Build image-based color labels for CS2 catalog skins.")
    parser.add_argument("--catalog", default="catalog-data.js")
    parser.add_argument("--out", default=".data/skin-color-index.json")
    parser.add_argument("--cache-dir", default=".data/color-image-cache")
    parser.add_argument("--limit", type=int, default=0, help="Only process N uncached items, for quick local runs.")
    parser.add_argument("--delay", type=float, default=0.05, help="Delay between image downloads.")
    args = parser.parse_args()

    catalog = load_catalog(args.catalog)
    out_path = Path(args.out)
    cache_dir = Path(args.cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    existing = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {"items": {}}
    items = existing.get("items", {})
    processed = 0
    failed = []

    def write_output():
        payload = {
            "version": 1,
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "method": "pillow-dominant-color-v1",
            "items": items,
            "failed": failed[-500:],
        }
        out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    for item in catalog:
        item_id = item.get("id")
        image_url = item.get("image")
        if not item_id or not image_url or item_id in items:
            continue
        if args.limit and processed >= args.limit:
            break
        cache_path = cache_dir / f"{item_id}.img"
        try:
            if cache_path.exists():
                data = cache_path.read_bytes()
            else:
                data = fetch_image(image_url)
                cache_path.write_bytes(data)
                if args.delay > 0:
                    time.sleep(args.delay)
            result = analyze_image(data)
            if not result:
                failed.append({"id": item_id, "reason": "no_pixels"})
                continue
            items[item_id] = {
                "nameEn": item.get("nameEn") or item.get("name") or "",
                "nameZh": item.get("nameZh") or item.get("name") or "",
                **result,
            }
            processed += 1
            if processed % 100 == 0:
                write_output()
                print(f"processed {processed} new items; indexed {len(items)} total")
        except Exception as error:
            failed.append({"id": item_id, "reason": str(error)[:160]})

    write_output()
    print(f"wrote {out_path} with {len(items)} classified items ({processed} new, {len(failed)} failed this run)")


if __name__ == "__main__":
    main()
