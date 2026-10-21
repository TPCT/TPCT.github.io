# STATUS — tpct.github.io

| Ticket | Title | Size | Depends on | State |
|---|---|---|---|---|
| T-001 | Scaffold, build script, content source, tokens, header, hero, footer | M | none | done |
| T-002 | Content sections, project cards, filters, copy email, scroll-spy | M | T-001 | done |
| T-003 | SEO/OG/JSON-LD, favicons + OG image, font, 404, robots/sitemap/manifest, confidentiality check | M | T-001 | done |
| T-004 | GitHub Pages workflow + README | S | T-003 (after T-002) | done |
| T-005 | Prism foundation: fonts, tokens, header, hero | M | T-004 | done |
| T-006 | Prism sections, cards, filters, contact, footer, 404 CSS + data-reveal markup | M | T-005 | done |
| T-007 | Prism motion JS: 60-motion, 61-pointer, filter FLIP, theme reveal, motion toggle | M | T-005 | todo |
| T-008 | Prism OG image, favicons, render-images.mjs (no local paths) | S | T-005 | done (re-skin in T-008b) |
| T-009 | ShiftCodes brand colours + animated logo hero | M | T-006 | done |

Order: T-001 → (T-002 ∥ T-003, disjoint files; run sequentially if RAM is tight — ~4 GB free at planning time) → T-004.
Reskin order: T-005 → (T-006 ∥ T-007 ∥ T-008: disjoint files, each adds its own new test file; run one after another if RAM is tight).

### Lead tasks outside Codex (Codex may not edit `.company/` or touch the remote)
- After T-001 is approved: delete `.company/content.json` (moved to `src/content.json`).
- Before T-003 review: create `.company/private/denylist.txt` (gitignored) from the `vis: private` names in `.company/private/readmes.md`, minus generic words and names public in content.json (e.g. "AIC"); then run `npm run check:confidential` locally.
- Before T-004 merge: create public repo `TPCT/TPCT.github.io`, add `origin`, enable Pages with `build_type: workflow`, push `main`. **The repo currently has no remote and no commits.**
- Running T-003's `npm run images` needs `PLAYWRIGHT_CORE` / `CHROME_PATH` (values in the ticket).

## Decisions log
- 2026-10-21 PM: Raw facts from private repos kept in `.company/private/` (gitignored) because this repo is public.
- 2026-10-21 PM: `.company/runs/` gitignored per global rule.
- 2026-10-21 TL: Stack = zero-dependency Node build (template-literal renderers → `dist/`), not Astro: one page + 404 doesn't justify a framework; zero supply-chain surface (architecture.md §1).
- 2026-10-21 TL: Copy source moved to `src/content.json` with ux.md §9 keys merged; lead removes `.company/content.json` after T-001.
- 2026-10-21 TL: CSS/JS as ordered partials concatenated at build into one file each, with content-hash `?v=` cache busting.
- 2026-10-21 TL: CSP via `<meta>`, `style-src 'self'` (no inline style attributes); inline theme script hash computed at build. Hero stagger uses `:nth-child` instead of ux's `style="--i:N"`.
- 2026-10-21 TL: No lint dependencies (no html-validate); correctness via `node --test`; axe/Lighthouse in QA.
- 2026-10-21 TL: OG/favicons/font are committed binaries from dev-only scripts (Playwright from a local install, fonttools in a throwaway venv, fontsource fallback); CI never runs a browser or downloads assets.
- 2026-10-21 TL: Confidentiality denylist lives only in gitignored `.company/private/denylist.txt`, owned by the lead; CI skips it when absent; the check never prints matched terms.
- 2026-10-21 TL: Actions pinned to current majors verified via `gh api` on 2026-10-21: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5; Node 22; no `npm ci` (no deps).
- 2026-10-21 TL: No code licence file; content © Islam Elsayed; Archivo (OFL) and Lucide (ISC) credited in README.
- 2026-10-21 TL: JSON-LD `jobTitle` = hero.roles minus the founder role; address country `EG` is a build constant (not visible copy).
- 2026-10-21 PM: User update relayed from profile-readme session — contact email is now `th3professionalcod3r@gmail.com` (replaces eslamjackie@outlook.com everywhere); drop `palm-resources-01` from the portfolio; add public repo `ashurbank.iq` (Laravel 10 + Filament 3 bilingual CMS for a bank: RBAC via filament-shield/spatie-permission, audit log via laravel-auditing, Excel import/export via maatwebsite/excel — verified in its composer.json). Applied as ticket T-005 after T-001.
- 2026-10-21 PM: Owner feedback on first live version: "looks bad, no animations, doesn't use the Prism principle from the artifacts". Prism = owner's own design language (Prism D22, from one of the owner's private design canvases; refs copied to `.company/private/prism/`, gitignored). Decision: keep IA/behaviour, replace the visual layer with a Prism reskin (dark default) + an orchestrated motion system → `.company/ux-prism.md`, then reskin tickets T-005+. T-002/T-003 reviewed for function only.
- 2026-10-21 PM: Site went live early at owner's request: T-004 workflow pushed first (with `check:confidential --if-present` until T-003 lands); run success, https://tpct.github.io → 200.
- 2026-10-21 TL: Reskin split: T-006 = all remaining CSS + `data-reveal` markup, T-007 = JS only, T-008 = OG/icons. Each ticket adds a new test file (`sections`/`scripts`/`images.test.mjs`) so the three can run in parallel without touching shared files (architecture.md §13).
- 2026-10-21 TL: JS budget corrected: ux-prism §5.1.7 assumed a 7.6 KB base, real base is ~8.8 KB, so the `site.js` cap is 16,000 bytes (per file: 60-motion ≤ 3,000, 61-pointer ≤ 1,900, 10-theme ≤ 1,500, 30-filter ≤ 5,000).
- 2026-10-21 TL: All `@keyframes` live inside `prefers-reduced-motion: no-preference` (moves §5.7 `card-sheen` inside it); `.projects-empty::before` and the footer glyph carry full self-contained glyph declarations instead of relying on the components selector list.
- 2026-10-21 TL: OG SVG uses font URLs relative to the SVG (`../../public/assets/fonts/...`), rendered via `page.goto` of the committed file; render fails if the webfonts don't load. A test scans `src/ public/ scripts/` for absolute local paths. The old SVG with a local path stays in earlier commits (no history rewrite/force-push allowed); low risk (username + project path only).
- 2026-10-21 TL: `localStorage.motion` stores `'paused' | 'running'`; motion toggle uses label swap, no `aria-pressed` (ux-prism §9).
- 2026-10-21 PM: Owner change: palette must come from the ShiftCodes logo, and the hero "prism" becomes the ShiftCodes logo mark, animated and moving; owner also asked for mouse animation ("الماسو" read as "الماوس" = mouse → pointer-driven parallax/tilt + cursor glow in T-007). Logo source taken from the owner's company repo (`seeders/assets/shiftcodes-logo-source.jpg`), committed as `src/images/brand/shiftcodes-logo-source.jpg`; brand violet sampled #6E2BFB. Ticket T-009 (tokens + vector logo + animated hero mark + exp__loc fix); then T-007 (motion + pointer JS incl. logo parallax and cursor glow), then T-008b (favicon/OG with the S mark). T-005/T-006/T-008 work is approved but stays uncommitted until T-009 recolours it (the berry palette was rejected).
- 2026-10-21 PM: T-005 not pushed alone: its changes are interleaved with T-006/T-008/T-009 in shared files (content.json, tests, tokens, hero) and Codex is editing T-009 in the same tree now; the owner also rejected the berry palette T-005 ships. Push happens right after the T-009 review gate. History left as is (no force-push).
