# T-003: SEO/OG/JSON-LD, favicons + OG image, self-hosted font, 404, robots/sitemap/manifest, confidentiality check
Size: M   Depends on: T-001   Stories: US-13 (404 theme), US-14, US-15, US-17 (font), US-19
Parallel: may run in parallel with T-002 (disjoint files) — but run sequentially if machine RAM is tight.

## Context
Build, head, header/footer exist from T-001 (`scripts/build.mjs`, `src/render/head.mjs`, `src/render/layout.mjs`). Specs: `.company/prd.md` US-14, US-15, US-19; `.company/ux.md` §2.2 (font), §4.12 (404), §8 (OG + icons); `.company/architecture.md` §3, §6 (JSON-LD), §7 (confidentiality), §8 (images/font). Do not open `.company/private/` (it is confidential; the check reads a file there at runtime only). Do not edit `.company/`.

## Goal
Search/link-preview metadata complete; all icon/OG/font binaries committed under `public/`; `dist/404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest` generated; `npm run check:confidential` guards dist + committed files.

## Task
1. **`src/render/head.mjs`** — extend `renderHead(c, { page })` (`page` = `"home"|"404"`), inserting after `<meta name="description">`:
   - home: `<link rel="canonical" href="https://tpct.github.io/">`; 404: `<meta name="robots" content="noindex">` and no canonical.
   - `<link rel="preload" href="/assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>`
   - `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<link rel="manifest" href="/site.webmanifest">`
   - OG (home and 404): `og:type=website`, `og:site_name`=shortTitle, `og:title`=site.title, `og:description`=site.description, `og:url`=`https://tpct.github.io/`, `og:image`=`https://tpct.github.io/assets/og-image.png`, `og:image:type=image/png`, `og:image:width=1200`, `og:image:height=630`, `og:image:alt`=ogImageAlt, `og:locale`=site.locale. Twitter: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`.
   - home only: `<script type="application/ld+json">` Person per architecture.md §6 (serialize with `JSON.stringify` and escape `<` as `<`).
   - All URLs derived from `site.url` (no trailing-slash duplication).
2. **`src/render/page-404.mjs`** — `render404(c)` per ux §4.12 (header via `renderHeader(c,{home:false})`, `<main>` with `p.nf__code`, `h1` title, message, primary button to `/`, decorative CSS-only schematic `aria-hidden`, footer). `<title>` = `{code} — {title} · {shortTitle}`. Plus `src/styles/80-404.css`.
3. **`scripts/build.mjs`** — also write `404.html`, `robots.txt` (`User-agent: *\nAllow: /\nSitemap: https://tpct.github.io/sitemap.xml\n`), `sitemap.xml` (one `<url><loc>https://tpct.github.io/</loc></url>`, no 404), `site.webmanifest` (ux §8: name, short_name, background_color, theme_color, `display:"browser"`, `start_url:"/"`, icons 192 + 512 PNG). Pass `page` to `renderHead`. Do not change section rendering.
4. **`public/favicon.svg`** — hand-written exactly per ux §8 "Favicon".
5. **`scripts/render-images.mjs`** (DEV ONLY; `npm run images`) — builds `src/images/og-image.svg` from `src/content.json` per ux §8 layout (embed `@font-face` pointing at `public/assets/fonts/archivo-var.woff2` via `file://`; mono = `"DejaVu Sans Mono","Liberation Mono",monospace`), writes the SVG, renders it in Chromium at 1200×630 dpr 1 → `public/assets/og-image.png`. Renders `public/favicon.svg` → `favicon-16` (temp), `public/favicon-32.png`, `icon-192.png`, `icon-512.png`; renders the apple variant (square, no rounded corners, bg `#0B0B12`, artwork in 80% safe area) → `public/apple-touch-icon.png` 180×180. Writes `public/favicon.ico` (PNG-in-ICO, 16 + 32) in pure Node. Playwright resolution: `createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE || "playwright-core")`; launch `chromium.launch({ executablePath: process.env.CHROME_PATH || undefined })`. Before writing the OG PNG, measure the name text width in the page and step font-size down 4px until ≤ 1040px (ux §8). Never import this script from build or tests.
   On this machine use:
   `PLAYWRIGHT_CORE=/home/tpct/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome npm run images`
   (do NOT add playwright to package.json).
6. **Font** (run before step 5) — produce `public/assets/fonts/archivo-var.woff2` + `public/assets/fonts/OFL.txt` (Archivo OFL text from the google/fonts repo `ofl/archivo/OFL.txt`). Write `scripts/build-font.sh` that does, in a temp dir outside the repo: `python3 -m venv "$TMP/venv" && "$TMP/venv/bin/pip" install fonttools brotli`, downloads `https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf`, then runs the exact `fonttools varLib.instancer` + `pyftsubset` commands from ux §2.2, copies the result into `public/assets/fonts/`. Run it. **Fallback** if pip/network for that route fails: in a temp dir `npm pack @fontsource-variable/archivo`, extract, copy `package/files/archivo-latin-wdth-normal.woff2` → `archivo-var.woff2`, and report which route was used + file size. Target ≤ 80 KB, hard cap 120 KB.
7. **`scripts/check-confidential.mjs`** — architecture.md §7 exactly. CLI options: `--dist <dir>` (default `dist`), `--denylist <file>` (default `.company/private/denylist.txt`), `--root <dir>` (default repo root), `--no-git` (scan `--root` recursively instead of `git ls-files`, used by tests). Export `async function checkConfidential(opts) → { hits: {file,line,rule}[], denylistLoaded: boolean }`. Never print matched denylist terms (print `denylist#<index>`). Exclude `test/fixtures/**` from the git-file scan. Exit codes: 0 clean, 1 hits or missing dist.
8. **`package.json`** scripts — add `"check:confidential": "node scripts/check-confidential.mjs"`, `"check": "npm run build && npm test && npm run check:confidential"`, `"images": "node scripts/render-images.mjs"`. No dependencies.
9. **Tests** — `test/seo.test.mjs`, `test/confidential.test.mjs` (see Tests). Fixtures under `test/fixtures/confidential/` must not contain any real private name — use invented tokens like `demo-secret-repo`, and build the leaking hostname in the test by string concatenation (`"foo" + "." + "shiftcodes" + ".net"`), writing fixture files at test runtime into a tmp dir, so no committed file (including this ticket) contains a matching subdomain string.

## Interfaces
```js
// src/render/head.mjs
export function renderHead(c, { page, title, description, assets }): string   // page: "home" | "404"
export function personJsonLd(c): object
// src/render/page-404.mjs
export function render404(c, { assets }): string
// scripts/check-confidential.mjs
export async function checkConfidential({ dist, denylist, root, git = true }): Promise<{ hits: Array<{file:string,line:number,rule:string}>, denylistLoaded: boolean }>
```

## Constraints
- Do not edit `src/render/sections.mjs`, `src/styles/50-*`/`60-*`/`70-*`, `src/scripts/30-*`/`40-*`/`50-*` (T-002 owns them).
- Zero npm dependencies; Playwright/fonttools used only by dev scripts from outside the repo; nothing downloaded at build/test time.
- Committed binaries: OG PNG 1200×630 ≤ 300 KB (target ≤ 150 KB); apple-touch 180×180; icons 32/192/512; font ≤ 120 KB.
- No real private repo names, internal hostnames or client data in any file you write. Do not open `.company/private/`.
- 404 must work with no JS (dark theme, link home) and apply the stored theme via the same inline script.
- Do not edit `.company/`; do not commit or push.

## Acceptance criteria
- [ ] `dist/index.html` head has title, description, canonical, all OG + Twitter tags with absolute image URL, icons, manifest, font preload, JSON-LD Person (name, jobTitle, url, sameAs [GitHub, ShiftCodes], address Alexandria/EG) that parses as JSON.
- [ ] `dist/404.html`: `noindex`, `<title>` contains "404", h1 = notFound.title, link `href="/"` with cta label, no nav, toggle `hidden`, same inline theme script + CSP.
- [ ] `robots.txt`, `sitemap.xml` (only `/`), `site.webmanifest` (valid JSON, icons exist in dist) generated.
- [ ] `public/` contains favicon.svg, favicon-32.png, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, assets/og-image.png, assets/fonts/archivo-var.woff2, assets/fonts/OFL.txt; `src/images/og-image.svg` committed.
- [ ] `npm run check:confidential` exits 0 on the real repo + dist; prints `denylist: not found, skipped` when the denylist is absent (run it with `--denylist /nonexistent` to show this).
- [ ] Confidentiality test proves: hostname hit → exit/ hits > 0; denylist term hit → hit reported without the term in output; bare `shiftcodes.net` → clean.
- [ ] Report: font route used + size; OG PNG size.

## Tests
- `test/seo.test.mjs`: build to tmp; assert head tags (exact values from content.json), JSON-LD fields, 404 page requirements, robots/sitemap/manifest contents; read PNG IHDR of `public/assets/og-image.png` → 1200×630 and size ≤ 300 KB; apple-touch 180×180; font file starts with bytes `wOF2` and ≤ 120 KB.
- `test/confidential.test.mjs`: create tmp root + tmp dist with generated fixture files; call `checkConfidential({ git:false, ... })`; cases above; spawn the CLI once against a leaking tmp dist and assert exit code 1 and that stdout/stderr do not contain the denylist term.
- Commands to run (only these):
  ```
  bash scripts/build-font.sh            # or the fallback route
  PLAYWRIGHT_CORE=… CHROME_PATH=… npm run images
  npm run build
  node --test test/seo.test.mjs test/confidential.test.mjs
  npm run check:confidential
  node scripts/check-confidential.mjs --denylist /nonexistent
  ```

## Out of scope
Section content/filters (T-002); GitHub workflow, README, `.gitignore` (T-004); creating `.company/private/denylist.txt` (lead task); Lighthouse/axe (QA).

## Addendum (lead, after T-001 review)
- In `src/lib/validate.mjs`: validate `hero.ctaTertiary.href`, `contact.github`, `contact.website`, `experience[].orgUrl`, project `repoUrl` as `^https://`, and `hero.ctaSecondary.href` as `^mailto:`; add tests (review r1 note #5).
- Email is now `th3professionalcod3r@gmail.com` (use it in JSON-LD etc. via content.json, never hard-code).
- `.company/private/denylist.txt` now exists locally; run `npm run check:confidential` and report pass/fail (never print terms).
