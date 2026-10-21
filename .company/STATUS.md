# STATUS — tpct.github.io

| Ticket | Title | Size | Depends on | State |
|---|---|---|---|---|
| T-001 | Scaffold, build script, content source, tokens, header, hero, footer | M | none | done |
| T-002 | Content sections, project cards, filters, copy email, scroll-spy | M | T-001 | done |
| T-003 | SEO/OG/JSON-LD, favicons + OG image, font, 404, robots/sitemap/manifest, confidentiality check | M | T-001 | done |
| T-004 | GitHub Pages workflow + README | S | T-003 (after T-002) | done |
| T-005 | Prism foundation: fonts, tokens, header, hero | M | T-004 | done |
| T-006 | Prism sections, cards, filters, contact, footer, 404 CSS + data-reveal markup | M | T-005 | done |
| T-007 | Prism motion JS: 60-motion, 61-pointer, filter FLIP, theme reveal, motion toggle | M | T-005 | done |
| T-008 | Prism OG image, favicons, render-images.mjs (no local paths) | S | T-005 | done (re-skin in T-008b) |
| T-009 | ShiftCodes brand colours + animated logo hero | M | T-006 | done |
| T-015 | Vertical rhythm + section continuity (spine) | M | T-007 | done |
| T-016 | Real career history (LinkedIn): experience, hero/about/stats, new case study | M | T-015 | done |
| T-017 | About/section heads stacked (owner) | S | T-016 | done |
| T-010 | W-1 Signal field: hero particle constellation + raise JS/CSS caps | M | T-015 | done |
| T-011 | W-2 Compile type: glyph decode + name flow | S | T-010 | done |
| T-012 | W-3 Live cards: cursor spotlight + rim signal | S | T-010 | done |
| T-013 | W-4 Journey timeline section (content, validation, render, CSS, draw JS) | M | T-010 | done |
| T-014 | W-5 Shift and rhythm: S-mark shift, hero exit, stack marquee (CSS only) | S | T-013 | done |
| T-018 | SEO: title/description, JSON-LD @graph, LinkedIn + rel=me, robots meta, sitemap lastmod, a11y-name audit | M | T-016, T-017 | done |
| T-019 | Project pages /work/<slug>/ (+ card links, sitemap, breadcrumbs JSON-LD) + reviewer Lighthouse gate | M | T-018, T-010 | todo |

Order: T-001 → (T-002 ∥ T-003, disjoint files; run sequentially if RAM is tight — ~4 GB free at planning time) → T-004.
Reskin order: T-005 → (T-006 ∥ T-007 ∥ T-008: disjoint files, each adds its own new test file; run one after another if RAM is tight).
Wow order (max 2 Codex runs at once): T-015 → T-010 (alone; raises caps) → (T-011 ∥ T-013) → (T-012 ∥ T-014; T-014 only after T-013). T-012 is disjoint from all others and can fill any free slot after T-010.
SEO order: T-016 → T-017 → T-018 (may run ∥ T-010/T-011/T-012; never ∥ T-013/T-014/T-019) → T-019 (after T-018 and T-010; may run ∥ T-011/T-012; never ∥ T-013/T-014). Simplest: put T-018 → T-019 before T-013, or after T-014.

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
- 2026-10-21 PM: Owner asks for more eye-catching animation ("wow" round → .company/ux-wow.md, built on top of T-007) and an animated career/projects timeline section. Timeline content = real milestones only, from repo creation dates + existing case studies (PO → .company/timeline.json, sources in .company/timeline-sources.md; private names never published).
- 2026-10-21 PM: Dates from the owner (user, 2026-10-21): KSA analytics platform = 2025 (added to timeline; case study gets year 2025), AIC project = 2026 (timeline entry confirmed; case study year 2026). Food ERP: no date → not in timeline.
- 2026-10-21 PM: T-007 non-blocking carried to wow round: tap-to-replay on touch (move replay handler to 60-motion.js); 30-filter.js near its 5,000-byte cap.
- 2026-10-21 PM: Owner: section gaps too big + sections feel disconnected → T-015 (top priority, before wow round): one-pad rhythm (section-pad clamp(48px,2rem+3vw,88px), no double padding), continuous canvas, desktop violet scroll 'spine' with chapter nodes lighting up, overlapping reveals. Mobile: no spine, tighter rhythm.
- 2026-10-21 UX (ux-wow.md Assumptions, logged by TL):
  1. Five chunks: W-1 field, W-2 type, W-3 cards, W-4 Journey timeline (the owner's request, first-class), W-5 rhythm. Film grain, section dividers, letter shimmer, heading parallax and a separate experience-line draw were dropped (ux-wow §0).
  2. Journey goes after Experience and before Stack. Indices renumber to 01–08. Nav "Journey" goes after "About". At 768–1023px the nav links get compact padding so 6 links fit.
  3. Default timeline intro copy is "The journey so far" plus a factual lead. The PO's file has no intro keys, so the default stands.
  4. Timeline `link` accepts a URL string or `{href, label}`. `year` accepts an integer or a range string.
  5. The line draw is monotonic and JS-driven in all browsers (not CSS scroll-timelines), so node lighting stays in sync and Firefox gets it.
  6. The constellation stays confined to the hero, starts 700ms after `load`, and degrades or disables itself on slow devices.
  7. The cursor spotlight respects the motion toggle (consistent with T-007's cursor glow).
  8. The marquee is gated on `.js` (set before paint) rather than `.motion`, to avoid CLS.
  9. The `site.js` cap rises by 8,192 over the cap in force (rebase rule B + 8,192).
  10. New CSS lives in per-chunk partials (41-, 42-, 43-, 55-, 56-, 61-), so chunks never edit the same stylesheet.
- 2026-10-21 TL: Wow tickets T-010..T-014 written; all assume T-015 has landed.
  - Caps: T-010 raises the site.js cap from B to B + 8,192. B is 17,500, or 18,200 if T-015 adds `62-spine.js`, so the new cap is 25,692 or 26,392. T-010 also raises the CSS caps in `sections.test.mjs` by +16,384 raw / +4,096 gzip (65,536/14,336 → 81,920/18,432), because about 15 KB of new CSS doesn't fit the old budget.
  - The card spotlight state class is `is-spot`, not ux-wow's `is-lit`, to avoid clashing with T-015's chapter-node `.is-lit` and the timeline's `.tl__item.is-lit`.
  - The Journey line uses the spine's exact track/fill gradients (`--brand-line` track; `--logo-a` → `--cyan` fill), not ux-wow §6.5's 4-stop gradient, so the timeline reads as a branch of the spine.
  - `.tl__lead` and `.marquee` bottom margins use `--space-6`, to match T-015's section-head gap.
  - The timeline content is copied verbatim from `.company/timeline.json`.
  - Owner-supplied years (user, 2026-10-21) are applied in T-013: `national-waste-analytics` gets year 2025, and `aic-operations-suite` keeps 2026.
  - T-013 adds a test that runs `checkConfidential` (hostname rule + private denylist when present) on the rendered Journey section, and asserts that its only hrefs are `github.com/TPCT`. Pre-check: `timeline.json` has 0 denylist hits.
  - The T-007 carry-over (tap-to-replay on touch via `60-motion.js`) is not in the wow tickets, because the wow round never edits `60-motion.js`. It stays open as a separate follow-up.
- 2026-10-21 PM: Owner supplied full LinkedIn experience (.company/private/experience.md, gitignored) → source of truth. PO writes .company/content-career.json (experience as real career history grouped by company, stats/hero/about with owner's public LinkedIn numbers) and re-bases .company/timeline.json on dated roles. Implemented as T-016 (content + Experience renderer) after T-015, before T-013 (timeline render). Company names allowed (public on LinkedIn); still no internal URLs/private repo names; royal-family mention generalised.
- 2026-10-21 TL: SEO round (owner: "site isn't SEO-friendly") → T-018 (metadata + JSON-LD) and T-019 (per-project pages). architecture.md §15.
  - Title is "Islam Elsayed — Senior Full-Stack Engineer | Laravel, Python" (60 chars). The requested 88-char version would be truncated by Google, so "systems architect" and "FastAPI" moved into the 154-char description. Validation errors on a title over 65 or a description over 160.
  - JSON-LD becomes one @graph: WebSite, ProfilePage, Person, Organization, ItemList. Nodes link by `#id`, and project nodes use `#project-<id>`, the same id on the home and project pages.
    - Organization logo = /icon-512.png (the committed S mark).
    - No alumniOf (no source) and no hasOccupation (redundant with jobTitle/knowsAbout).
    - New `site.jobTitle` "Senior Full-Stack Engineer & Systems Architect" and `site.alternateName` "TPCT".
  - theme-color stays a single meta that follows the active theme (via JS), not a media-scoped dark/light pair: the site is dark by default whatever the OS preference, so a light meta under prefers-color-scheme: light would mismatch the page.
  - LinkedIn is https://www.linkedin.com/in/tpct/. It goes in the contact links, the footer and Person.sameAs. `rel="me"` is on the GitHub and LinkedIn links (anchors and head links); ShiftCodes is the company, so no `me`.
  - `build({ now })` gives a deterministic build date for sitemap lastmod and ProfilePage dateModified.
  - Project pages live at /work/<id>/ (the existing validated ids are used as slugs).
    - Title is "<name> — <kind> | Islam Elsayed", falling back to "<name> | Islam Elsayed" when over 65 chars. The description is the summary, cut at a word boundary to 160 chars.
    - og:type is article, with the shared OG image.
    - Prev/next follow the home order, without wrap-around.
    - The JSON-LD breadcrumb has 2 levels (Home → Project), because /#work is a fragment of the home page and not its own page. The visible breadcrumb shows Home / Work / Project.
  - Confidentiality rule refined: case-study cards and pages may link only internally (/work/<id>/). There is still no external or repo link for private work.
  - T-019 waits for T-010's CSS cap raise: about 2.9 KB of raw headroom is left now, and 85-project.css is capped at 3 KB.
  - Lighthouse mobile (SEO 100, Perf ≥ 90, A11y ≥ 95) is a reviewer gate run with the local Playwright Chromium via `npx -y lighthouse@12` (never a repo dependency). The cross-origin canonical flag on localhost is accepted; SEO 100 is confirmed on the live URLs after deploy.
- 2026-10-21 PM: T-020 (urgent, owner via coordinator): Google Search Console verification meta added in a clean worktree from origin/main and pushed alone (71dfe24); live verified. Local main must pull/rebase before the next push.
- 2026-10-21 PM: T-010/T-011/T-012/T-017/T-018 shipped in ONE commit (files interleaved: content.json/validate.mjs shared by T-017+T-018; shipping speed prioritised per coordinator). Lighthouse mobile local: Perf 97, A11y 100, BP 100, SEO 92 (robots-txt audit blocked by CSP connect-src 'none' → follow-up: connect-src 'self' in T-019).
