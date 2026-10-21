# T-008: Prism OG image, favicons and render-images.mjs (no local paths in committed files)
Size: S   Depends on: T-005 (needs `public/assets/fonts/outfit-var.woff2` + `jakarta-var.woff2`)   Stories: US-15 (sharing/SEO assets), visual reskin
Parallel: yes with T-006 and T-007 after T-005 lands (disjoint files).

## Context
Goal: restyle the OG card and all icons to the Prism identity (`.company/ux-prism.md` §11) and fix a review finding: the committed `src/images/og-image.svg` currently embeds an absolute local `file://` URL to the old font (machine path + username). The regenerated SVG must contain **no absolute local path** of any kind.

What exists today:
- `scripts/render-images.mjs` (dev only, `npm run images`, never run by build/CI/tests): reads `src/content.json`, writes `src/images/og-image.svg` with an `@font-face` pointing at `public/assets/fonts/archivo-var.woff2` through an absolute `pathToFileURL(...)` URL (the leak), screenshots it with Playwright Chromium to `public/assets/og-image.png`, then renders `public/favicon.svg` (hand-written, old amber art) into `public/favicon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (via fragile string replacements) and packs a 16+32 PNG-in-ICO `public/favicon.ico` in pure Node. Keep the ICO writer logic and the Playwright resolution (`createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE || 'playwright-core')`, `chromium.launch({ executablePath: process.env.CHROME_PATH || undefined })`).
- After T-005 the Archivo font is deleted, so the current script no longer works.
- `test/seo.test.mjs` already checks PNG dimensions (OG 1200×630 ≤ 300 KB, apple 180, favicon-32, icon-192/512), `favicon.ico` existence and the manifest colours (`site.themeColorDark` = `#1A1726` after T-005). Do not edit that file.

Spec (normative): `ux-prism.md` §11 (OG layout coordinates, favicon art, apple icon, manifest), §3.2 colours, §3.1 font files. Architecture: `.company/architecture.md` §8 and §13.

## Task
1. **Rewrite `scripts/render-images.mjs`**:
   - Font URLs in the generated SVG are **relative to the SVG file**: `url('../../public/assets/fonts/outfit-var.woff2')` and `url('../../public/assets/fonts/jakarta-var.woff2')` (families `"Outfit"` 500 800 and `"Plus Jakarta Sans"` 400 800). Do not use `pathToFileURL`, `import.meta.url`-derived paths, `os.homedir()`, `process.cwd()` or any absolute path inside generated file contents. Render by `page.goto(pathToFileURL(svgPath).href)` of the committed file so Chromium resolves the relative URLs (absolute URLs are fine in the `goto` call, never in written files).
   - After `await page.evaluate(() => document.fonts.ready)`, verify `document.fonts.check('800 104px "Outfit"') && document.fonts.check('600 28px "Plus Jakarta Sans"')`; if false, throw `Error('OG fonts did not load')` (no silent fallback-font render).
   - OG layout exactly per §11 (1200×630 viewBox, `#1A1726` background, two blob circles with radial gradients, outer rim, eyebrow pill with gradient dot, two name lines with the horizontal name gradient on line 2, roles lines, domain chips row, footer location · reach and host, right-hand prism: glow, beam, spectrum with 4 hard vertical bands at .6 opacity, 3 facets + white .25 highlight over the left facet, rim, 2 shards, shadow ellipse). Gradients/filters in one `<defs>`; text styling via one `<style>` block with classes (no `@import`, no external URLs except the two relative font URLs). All strings from `content.json` through `esc()`: eyebrow = `c.hero.eyebrow.toUpperCase()`, name words = `c.hero.name.split(/\s+/)` (line 1 = all but last joined by a space, line 2 = last word; a single-word name renders only line 2), `c.hero.roles[0]`, `c.hero.roles.slice(1).join(' · ')`, `c.hero.domains`, `` `${c.hero.location} · ${c.hero.reach}` ``, `new URL(c.site.url).host`.
   - Measured layout (two-pass: write SVG, `goto`, measure with `getBBox().width` on elements with ids, recompute, rewrite; loop until stable):
     - eyebrow pill width = measured eyebrow text width + 40;
     - name: if either line > 620px wide, step both lines' size down 4px from 104 (min 56, else throw);
     - roles: if a roles line is > 620px, step that line down 2px (min 18, else throw);
     - chips: each rect width = text width + 28, gap 10, start x80; if the row's right edge > 1120 at 16px, re-measure at 14px; if it still exceeds 1120, throw `Error('OG domain chips do not fit')` (no wrapping);
     - footer: throw if the location text's right edge is within 24px of the host text's left edge.
   - Write the final `src/images/og-image.svg`, then `page.screenshot({ path: 'public/assets/og-image.png' })` at viewport 1200×630, `deviceScaleFactor: 1`. Must stay ≤ 300 KB.
   - Icons: generate the art from one function instead of string replacements: `iconSvg({ bleed })` returns the §11 favicon (viewBox `0 0 64 64`): `rect` 64×64 `rx="16"` (`rx="0"` when `bleed`) fill `#1A1726`; `linearGradient` id `g` `x1="0" y1="0" x2="1" y2="1"` stops `#F299C4` 0, `#C3AEF5` .5, `#7FD3E3` 1; `polygon points="32,12 54,50 10,50" fill="url(#g)"`; `polygon points="32,12 32,50 10,50" fill="#FFFFFF" opacity=".22"`; `polygon points="32,12 54,50 43,50" fill="#0E081E" opacity=".18"`. When `bleed`, wrap the three polygons in `<g transform="translate(6.4 6.4) scale(.8)">` (80% safe area).
   - Write `public/favicon.svg` = `iconSvg({ bleed: false })` (single line, ends with `\n`). Render 16 (temp only), 32 → `public/favicon-32.png`, 192 → `icon-192.png`, 512 → `icon-512.png` from it; render `iconSvg({ bleed: true })` at 180 → `public/apple-touch-icon.png`. Temp SVGs/PNGs go in `fs.mkdtemp(path.join(os.tmpdir(), 'tpct-images-'))` and are removed in `finally` (as today). Keep the ICO writer (16 + 32).
   - Remove the old monospace font constant and all Archivo references.
2. **Run it** (needs a local Playwright + Chromium): `PLAYWRIGHT_CORE=<value> CHROME_PATH=<value> npm run images`, with the two values taken from `.company/tickets/T-003-seo-assets-404-confidential.md` Task step 5. Type them only on the command line; never write them into any repo file. Do not add Playwright to `package.json`.
3. Commit-ready outputs (regenerated, binary or text): `src/images/og-image.svg`, `public/assets/og-image.png`, `public/favicon.svg`, `public/favicon-32.png`, `public/favicon.ico`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`.
4. **New `test/images.test.mjs`** (see Tests).

## Interfaces
- `npm run images` (unchanged script name) → writes exactly the 8 files in Task 3.
- Generated SVG font URLs (exact): `url('../../public/assets/fonts/outfit-var.woff2')`, `url('../../public/assets/fonts/jakarta-var.woff2')`.
- Favicon art: exactly the §11 shapes listed in Task 1 (`#1A1726` background).
- Manifest: no code change; `build.mjs` already writes `background_color`/`theme_color` from `site.themeColorDark`.

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- Files you may change: `scripts/render-images.mjs`, the 8 generated files in Task 3, new `test/images.test.mjs`. Do not touch `src/render/*`, `src/styles/*`, `src/scripts/*`, `src/content.json`, `scripts/build.mjs`, `public/assets/fonts/*`, or existing tests.
- **No absolute local paths in any committed file**: no `file://`, `/home/`, `/Users/`, `/tmp/`, Windows drive paths, usernames, or env-var values in `src/`, `public/`, `scripts/` or `test/`.
- No npm dependencies, no lockfile. `render-images.mjs` is never imported by `build.mjs` or tests (tests read its outputs only).
- CSP of the site is unaffected (the PNGs/SVG favicon are static files; `favicon.svg` has no `<style>`, no script, no external refs).
- No animation in the OG or icons (static images; motion rules do not apply).
- Never put private brand names from `.company/private/` in any file; all OG text comes from `content.json`.

## Acceptance criteria
- [ ] `src/images/og-image.svg` contains both relative font URLs, `#1A1726`, every name word, `c.hero.roles[0]` (escaped), every domain, the site host; and contains none of `file:`, `/home/`, `/Users/`, `/tmp/`, `archivo`, `DejaVu`.
- [ ] `public/assets/og-image.png` is 1200×630, ≤ 300 KB, regenerated (its SHA-256 differs from the pre-ticket file); eyes-on: read the PNG and confirm the dark Prism card (name gradient on the last word, prism on the right, chips row, nothing clipped outside x80–1120 / y64–590).
- [ ] `public/favicon.svg` contains `#1A1726`, `points="32,12 54,50 10,50"` and no `#F2A93B`/`#0B0B12`; the apple icon is 180×180 with square corners; favicon-32/icon-192/icon-512 dimensions correct; `favicon.ico` has 2 entries (16, 32).
- [ ] No file under `src/`, `public/`, `scripts/` (text files only) matches `/file:\/\/|\/home\/|\/Users\/|[A-Za-z]:\\\\/`.
- [ ] `npm run build`, `node --test test/images.test.mjs test/seo.test.mjs` and `npm run check:confidential` pass.

## Tests
Add `test/images.test.mjs` (node:test; reads files only, never launches a browser, never imports `render-images.mjs`):
- OG SVG: assertions from the first acceptance item (use `esc` from `src/lib/html.mjs` for expected strings).
- Favicon SVG assertions above; `favicon.ico`: `readUInt16LE(4) === 2`, entry widths (byte 6 and 22) are 16 and 32.
- Apple icon: PNG IHDR width/height 180 (`readUInt32BE(16)` / `(20)`). No pixel decoding (square corners and safe area are checked eyes-on).
- Local-path scan: walk `src/`, `public/`, `scripts/` (skip files whose first 8 KB contain a NUL byte); build the regex from string pieces so the test file itself does not contain the literal patterns (e.g. `new RegExp(['file:' + '//', '/ho' + 'me/', '/Us' + 'ers/', '[A-Za-z]:' + '\\\\\\\\'].join('|'))`); assert no match, and report the offending relative file path only.

Commands (only these):
```
PLAYWRIGHT_CORE=<value> CHROME_PATH=<value> npm run images
npm run build
node --test test/images.test.mjs test/seo.test.mjs
npm run check:confidential
```

## Out of scope
- Rewriting git history to remove the old SVG from earlier commits (not allowed: no force-push; the lead accepts the historical leak as low risk and logs it).
- Any site CSS/JS/markup (T-005..T-007).
- Fonts (T-005) and manifest code.
- Light-theme OG variant (dark only per §11).
