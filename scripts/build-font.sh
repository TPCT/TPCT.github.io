#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$ROOT/public/assets/fonts"
cd "$TMP"
python3 -m venv "$TMP/venv"
"$TMP/venv/bin/pip" install fonttools brotli
curl -fL 'https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf' -o 'Archivo[wdth,wght].ttf'
"$TMP/venv/bin/fonttools" varLib.instancer 'Archivo[wdth,wght].ttf' wght=400:800 wdth=100:125 -o archivo-limited.ttf
"$TMP/venv/bin/pyftsubset" archivo-limited.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2197,U+2212" --layout-features="kern,liga,calt,tnum,lnum" --flavor=woff2 --output-file=archivo-var.woff2
curl -fL https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt -o OFL.txt
cp archivo-var.woff2 OFL.txt "$ROOT/public/assets/fonts/"
wc -c "$ROOT/public/assets/fonts/archivo-var.woff2"
