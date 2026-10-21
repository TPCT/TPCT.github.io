#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$ROOT/public/assets/fonts"
cd "$TMP"
python3 -m venv "$TMP/venv"
"$TMP/venv/bin/pip" install fonttools brotli
curl -fL 'https://github.com/google/fonts/raw/main/ofl/outfit/Outfit%5Bwght%5D.ttf' -o 'Outfit[wght].ttf'
curl -fL 'https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf' -o 'PlusJakartaSans[wght].ttf'
"$TMP/venv/bin/fonttools" varLib.instancer 'Outfit[wght].ttf' wght=500:800 -o outfit-limited.ttf
"$TMP/venv/bin/fonttools" varLib.instancer 'PlusJakartaSans[wght].ttf' wght=400:800 -o jakarta-limited.ttf
for family in outfit jakarta; do
  "$TMP/venv/bin/pyftsubset" "$family-limited.ttf" --unicodes="U+0020-007E,U+00A0-00FF,U+00B7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2197,U+2212" --layout-features="kern,liga,calt,tnum,lnum" --flavor=woff2 --output-file="$family-var.woff2"
  "$TMP/venv/bin/python3" -I -c "import sys;from fontTools.ttLib import TTFont as T;f=T(sys.argv[1]);h=f['hhea'];u=f['head'].unitsPerEm;print(f'ascent-override:{h.ascent/u:.2%};descent-override:{-h.descent/u:.2%};line-gap-override:{h.lineGap/u:.2%}')" "$family-limited.ttf"
done
curl -fL https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/OFL.txt -o OFL-Outfit.txt
curl -fL https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/OFL.txt -o OFL-PlusJakartaSans.txt
cp outfit-var.woff2 jakarta-var.woff2 OFL-Outfit.txt OFL-PlusJakartaSans.txt "$ROOT/public/assets/fonts/"
wc -c "$ROOT/public/assets/fonts/"*-var.woff2
