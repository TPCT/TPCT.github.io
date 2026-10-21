# T-001: Scaffold, build script, content source, tokens, header, hero, footer
Size: M   Depends on: none   Stories: US-01, US-02, US-04, US-13, US-16 (partial), US-17 (partial)

## Context
Greenfield repo (only `.company/` and `.gitignore` exist). Stack decision: zero-dependency static build — see `.company/architecture.md` §1–§5. Design system is `.company/ux.md` (normative: tokens §2, components §3, header §4.1–4.2, hero §4.3, footer §4.11, theme §6). Copy comes only from content.json (PRD §4 "Content integrity"). You may READ anything in `.company/` except `.company/private/` (do not open it). You must not edit files under `.company/`.

## Goal
`npm run build` produces `dist/index.html` + `dist/assets/site.css` + `dist/assets/site.js` with: skip link, sticky header (brand, nav, theme toggle, mobile menu), hero with stats strip, empty `<main>` placeholders for the other sections, footer. Dark default, light toggle, works with no JS.

## Task
1. **`package.json`** (repo root):
   ```json
   { "name": "tpct.github.io", "private": true, "type": "module",
     "engines": { "node": ">=20" },
     "scripts": {
       "build": "node scripts/build.mjs",
       "serve": "node scripts/serve.mjs",
       "test": "node --test test/*.test.mjs"
     } }
   ```
   No `dependencies` / `devDependencies`. Do not create a lockfile.
2. **`src/content.json`**: copy `.company/content.json` byte-for-byte, then merge in the ux.md §9 keys EXACTLY (merge into existing objects, add new top-level `sections` and `a11y`):
   - `site.menuOpen` = "Open menu", `site.menuClose` = "Close menu"
   - `sections` = `{ "skills": "Stack", "experience": "Experience", "services": "Services", "process": "Process" }`
   - `hero.domainsLabel` = "Domains"
   - `projectsIntro.kindFilterLabel` = "Filter projects by type", `countSingular` = "project", `countPlural` = "projects", `resetLabel` = "Show all projects", `roleLabel` = "Role", `stackLabel` = "Stack"
   - `a11y` = `{ "newTab": "(opens in new tab)" }`
   Do not change any other string. Keep 2-space JSON formatting. Leave `.company/content.json` in place (the lead deletes it).
3. **`src/lib/html.mjs`**: `esc(s)`, `attr(s)` (escape `& < > " '`), `slugify(s)` (ux §4.7: lowercase, `&`→`and`, runs of non-`[a-z0-9]` → `-`, trim `-`), `sortProjects(projects)` (stable featured-first), `externalAttrs()` → `target="_blank" rel="noopener noreferrer"`.
4. **`src/lib/validate.mjs`**: `export function validateContent(c)` → `{ errors: string[], warnings: string[] }` implementing architecture.md §3 step 2 (required keys for every object used by ux.md including all §9 keys; categories unique; project ids unique `^[a-z0-9-]+$`; `kind` ∈ {case-study, open-source}; `category` ∈ categories; non-empty `highlights`/`stack`; `year` optional integer 1990–2100; `featured` boolean; open-source `repoUrl` matches `^https://github\.com/TPCT/[A-Za-z0-9._-]+$`; case-study `repoUrl` → warning only; nav hrefs start with `#`; `stats` optional array of `{value,label}`).
5. **`src/lib/icons.mjs`**: export inline Lucide SVG strings (ISC) for `sun, moon, menu, x, arrow-up-right, arrow-down, mail` as a function `icon(name, size)` producing `<svg width height viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">…</svg>` (ux §3 Icons). Use the official Lucide path data.
6. **`src/render/head.mjs`**: `export const THEME_SCRIPT` = the ux §6 inline script body, byte-exact (content between `<script>` and `</script>`). `renderHead(c, { title, description, assets })` emits, in this order: `<meta charset="utf-8">`, viewport `width=device-width, initial-scale=1`, CSP meta (architecture.md §4, hash = `'sha256-' + base64(sha256(THEME_SCRIPT))`), `<meta name="theme-color" content="{themeColorDark}">`, `<script>{THEME_SCRIPT}</script>`, `<title>`, `<meta name="description">`, `<link rel="stylesheet" href="/assets/site.css?v=…">`, `<script src="/assets/site.js?v=…" defer></script>`. (SEO/OG/favicon/preload are added in T-003 — leave a single `// T-003: seo tags` comment slot in the function.)
7. **`src/render/layout.mjs`**: `renderPage(c, { head, header, main, footer })` → `<!doctype html><html lang="en" class="no-js" data-theme="dark"><head>…</head><body><a class="skip" href="#main">{skipLink}</a>{header}<main id="main" tabindex="-1">{main}</main>{footer}</body></html>`.
8. **`src/render/header.mjs`**: `renderHeader(c, { home = true })` per ux §4.2: brand (`href="#top"`, or `/` when `home:false`), `<nav id="primary-nav" aria-label="Primary"><ul>` of `c.site.nav` (omitted when `home:false`), theme toggle `<button type="button" class="icon-btn theme-toggle" hidden aria-label="{toLight}" title="{toLight}">` containing both sun and moon icons (CSS shows the right one per `data-theme`), menu button per ux §4.2 (omitted when `home:false`). DOM order: brand, nav, toggle, menu button — but visual order on base must put toggle left of the menu button and nav as dropdown panel; achieve with layout, never CSS `order`.
9. **`src/render/hero.mjs`**: `renderHero(c)` per ux §4.3 items 1–8 exactly (section `id="top" class="hero" aria-labelledby="hero-name"`, eyebrow, h1, roles `<ul>`, headline, sub, CTAs with icons — tertiary GitHub is an external text link with arrow-up-right + `<span class="vh"> {a11y.newTab}</span>`, schematic `<ul class="schematic__domains" aria-label="{domainsLabel}">`, origin `<p>`, stats `<ul class="stats">` only when `c.stats?.length`). No `style=""` attributes.
10. **`src/render/footer.mjs`**: `renderFooter(c)` per ux §4.11 (`<footer class="site-footer">`, footer text, `mailto:` link with the email as text, GitHub external link with `githubLabel`).
11. **`src/render/sections.mjs`**: export `renderAbout, renderExperience, renderSkills, renderWork, renderServices, renderProcess, renderContact` — in this ticket each returns a minimal valid stub: `<section id="{id}" tabindex="-1" aria-labelledby="{id}-title"><div class="container"><h2 id="{id}-title">{h2 text from architecture.md §6 table}</h2></div></section>`. T-002 replaces the bodies.
12. **CSS** in `src/styles/` (concatenated by filename): `00-fonts.css` (both `@font-face` blocks from ux §2.2; the woff2 arrives in T-003 — a 404 is expected until then), `01-tokens.css` (ux §2.1 + §2.2 `:root` vars + §2.3 vars and breakpoint overrides — copy values exactly), `10-base.css` (reset, body/headings globals ux §2.2, `.container`, `.vh`, focus rules, reduced motion, `::selection`, forced-colors rules, `scroll-padding-top`), `20-components.css` (buttons, icon button, text link incl. external pattern, tag, section-head — ux §3), `30-header.css` (ux §4.1–4.2 incl. `.no-js` fallback and the open panel), `40-hero.css` (ux §4.3 incl. schematic layouts per breakpoint, signature motion under `prefers-reduced-motion: no-preference`, stagger via `.schematic__domains li:nth-child(N){--i:N-1}` for N=1..12, stats strip), `90-footer.css`. Theme icon visibility: `[data-theme="dark"] .icon-moon, [data-theme="light"] .icon-sun { display:none }`.
13. **Browser JS** in `src/scripts/`: `10-theme.js` (ux §4.2 toggle + §6: un-hide, flip `data-theme`, update meta theme-color using `themeColorDark/Light` passed via `data-theme-dark`/`data-theme-light` attributes on the toggle button, update `aria-label`/`title` using `data-label-dark`/`data-label-light` attributes rendered from content, localStorage in try/catch). `20-nav.js` (ux §4.2 menu behaviour + close triggers + in-page anchor focus enhancement). Each file one IIFE, `"use strict"`, no globals, no console output, returns early if hooks missing. Strings never hard-coded in JS — read from data attributes rendered from content.json.
14. **`scripts/build.mjs`**: architecture.md §3 (steps 1–4, render `index.html`; `public/` copy should not fail if `public/` is empty or missing — create `public/.gitkeep`). Export `build({ outDir, root })`; CLI exits 1 with each validation error on its own line; prints warnings to stderr.
15. **`scripts/serve.mjs`**: Node `http` static server for `dist/` on `PORT` (default 4321), correct MIME types (html, css, js, svg, png, ico, woff2, webmanifest, xml, txt), directory → `index.html`, missing file → `dist/404.html` with status 404 if present else plain 404. Path traversal guarded.
16. **Tests**: `test/content.test.mjs`, `test/build.test.mjs` (see Tests).

## Interfaces
```js
// src/lib/html.mjs
export function esc(s: string): string
export function attr(s: string): string
export function slugify(s: string): string
export function sortProjects(projects: Project[]): Project[]   // new array, stable
export function externalAttrs(): string
// src/lib/validate.mjs
export function validateContent(c: object): { errors: string[], warnings: string[] }
// src/render/head.mjs
export const THEME_SCRIPT: string
export function cspHash(script: string): string                 // "sha256-<base64>"
export function renderHead(c, { title, description, assets: { css: string, js: string } }): string
// scripts/build.mjs
export async function build({ outDir = "dist", root = REPO_ROOT } = {}): Promise<{ outDir: string, files: string[] }>
```
Data attributes contract (header theme toggle): `data-label-dark="{themeToggle.toDark}" data-label-light="{themeToggle.toLight}" data-color-dark="{themeColorDark}" data-color-light="{themeColorLight}"`. Menu button: `data-label-open="{menuOpen}" data-label-close="{menuClose}"`.

## Constraints
- Zero npm dependencies; Node ≥ 20 built-ins only (`node:fs/promises`, `node:path`, `node:crypto`, `node:url`, `node:http`, `node:test`, `node:assert/strict`).
- Follow ux.md tokens, sizes, colours and markup EXACTLY; do not invent colours, spacing or copy. Mobile-first `min-width` queries only; logical properties; no CSS `order`/`row-reverse`.
- No `style=""` attributes, no inline event handlers, no external origins (fonts, CDNs).
- Every content string escaped via `esc`/`attr`.
- Do not open `.company/private/`. Do not edit `.company/`. Do not commit or push.
- Do not touch `.gitignore`.

## Acceptance criteria
- [ ] `npm run build` exits 0 and writes `dist/index.html`, `dist/assets/site.css`, `dist/assets/site.js`.
- [ ] `src/content.json` = original + exactly the §9 keys (no other diffs; verify with a JSON deep-compare in the test).
- [ ] Build exits 1 with a clear message when a project category is not in `categories` (tested).
- [ ] Exactly one `<h1>` (hero name); `<html lang="en" class="no-js" data-theme="dark">`; skip link is the first element in `<body>`.
- [ ] Every `c.site.nav` href targets an element id present in `index.html`.
- [ ] CSP meta contains the sha256 of `THEME_SCRIPT` and the emitted inline script equals `THEME_SCRIPT`.
- [ ] No `style="` and no ` on[a-z]+=` attributes in `index.html`.
- [ ] Theme toggle and menu button rendered with `hidden`; `no-js` header shows all nav links (CSS).
- [ ] Hero shows roles, headline, sub, 3 CTAs, all 7 domains, location + reach; stats strip with 3 items; strip omitted when `stats` is empty (tested by rendering `renderHero` with `stats: []`).
- [ ] `npm run serve` serves the site; manual check at 360px and 1440px shows no horizontal scroll (report what you checked).
- [ ] `node --check` passes for every file in `src/scripts/`.

## Tests
- `test/content.test.mjs`: validateContent on `src/content.json` → 0 errors; §9 keys present with exact values; deep-equal of `src/content.json` minus §9 keys vs `.company/content.json` (skip this one assertion if `.company/content.json` no longer exists); bad category / duplicate id / OSS without repoUrl each produce an error.
- `test/build.test.mjs`: `build({ outDir: mkdtemp })` then assertions from the acceptance criteria above (h1 count, lang/class/data-theme, skip link first, nav targets, CSP hash, no inline style/handlers, hidden toggle/menu, hero strings present, stats omitted when empty).
- Commands to run (only these):
  ```
  npm run build
  node --test test/content.test.mjs test/build.test.mjs
  for f in src/scripts/*.js; do node --check "$f"; done
  ```

## Out of scope
About/experience/skills/work/services/process/contact real content and their CSS/JS (T-002); SEO/OG/JSON-LD/favicons/font file/404/robots/sitemap/manifest/confidentiality check (T-003); CI workflow and README (T-004).
