# STATUS — tpct.github.io

| Ticket | Title | Size | Depends on | State |
|---|---|---|---|---|
| T-001 | Scaffold, build script, content source, tokens, header, hero, footer | M | none | done |
| T-002 | Content sections, project cards, filters, copy email, scroll-spy | M | T-001 | todo |
| T-003 | SEO/OG/JSON-LD, favicons + OG image, font, 404, robots/sitemap/manifest, confidentiality check | M | T-001 | todo |
| T-004 | GitHub Pages workflow + README | S | T-003 (after T-002) | todo |

Order: T-001 → (T-002 ∥ T-003, disjoint files; run sequentially if RAM is tight — ~4 GB free at planning time) → T-004.

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
