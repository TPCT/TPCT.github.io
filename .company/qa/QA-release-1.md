Result: PASS

Release 1 QA, T-019 (project pages) plus a whole-site regression. Date 2026-10-21. Local build served by `scripts/serve.mjs` on http://127.0.0.1:4321. Browser: headless Chromium 1248 (`/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`) via playwright-core. The QA scripts live in the session scratchpad and were not added to the repo.

## Commands (real output)
```
$ npm run build              -> ok
$ node --test                -> # tests 72  # pass 71  # fail 0  # skipped 1 (pre-existing skip: "Lead removed original content source")
$ npm run check:confidential -> exit 0
$ ls dist/work | wc -l       -> 20
$ grep -o '<url>' dist/sitemap.xml | wc -l -> 21
```

## Criteria checked
| Criterion | How verified | Result |
|---|---|---|
| All 20 `/work/<id>/` pages render | Playwright loaded every page at 1440 and 375, in dark and light (80 loads) | PASS: all 200, project CSS applied (`.project__facts` display=grid) |
| Unique title/description/canonical | Collected across 20 pages and compared with home | PASS: 20/20/20 unique, none equal to home |
| Canonical = `https://tpct.github.io/work/<id>/` | DOM `link[rel=canonical]` | PASS: 20/20 |
| h1 = project name, exactly one | DOM | PASS: 20/20 |
| Breadcrumbs Home / Work / name, `aria-current` | DOM | PASS: 20/20 |
| Prev/next follow `sortProjects`, no wrap | Compared hrefs to sorted neighbours | PASS: first page has no prev, last page has no next |
| Back link to `/#work` | DOM, and a real click from the project page goes to `http://127.0.0.1:4321/#work` | PASS |
| Open-source pages link to GitHub | `main a[href^=http]` = exactly `[repoUrl]` (github.com) | PASS |
| Case-study pages have NO external or repo links | `main a[href^=http]` is empty | PASS: all case studies |
| Home cards link to their page | 20 `.card__more` links, href = `/work/<id>/`; case-study cards have 1 `<a>`, open-source cards have 2; clicking the first card opens `/work/national-waste-analytics/` | PASS |
| Styles match the site, dark + light, 1440 + 375 | Screenshots `shots/T-019-{case-study,open-source}-{1440,375}-{dark,light}.png`; light set via localStorage, plus a real toggle click on a project page (dark → light) | PASS (2 low cosmetic nits, see Bugs) |
| No horizontal overflow | `scrollWidth - clientWidth` on every load | PASS: 0 everywhere |
| No console/CSP errors | Console error/warning plus pageerror listeners on all 80 project loads, home and the menu | PASS: 0. The only error was the intended 404 resource when loading `/does-not-exist` |
| 404 still fine | `/does-not-exist` returns 404 with h1 "Page not found" and 0 overflow; `shots/T-019-404-1440-dark.png` | PASS |
| Sitemap 21 URLs, no 404 | Fetched `/sitemap.xml` | PASS: 21, no 404 |
| JSON-LD valid on 3 pages | `JSON.parse` on national-waste-analytics (case study), b2b-crm (case study) and simple-compiler (open source) | PASS: graph = WebPage, BreadcrumbList, CreativeWork/SoftwareSourceCode, Person, WebSite. Breadcrumb `1:https://tpct.github.io/ 2:<canonical>`. Case studies have no codeRepository; simple-compiler has `codeRepository https://github.com/TPCT/simple_compiler` |
| Lighthouse mobile ≥ targets | See below | PASS |

### Lighthouse mobile (lighthouse@12, `--form-factor=mobile`, CHROME_PATH as above)
| Page | Perf | A11y | Best-practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` run 1 (saved JSON) | 84 | 100 | 100 | 100 | 2.4 s | 0 | 380 ms |
| `/` run 2 | 93 | – | – | – | 2.4 s | – | 190 ms |
| `/` run 3 | 93 | – | – | – | 2.3 s | – | 260 ms |
| `/work/national-waste-analytics/` | 99 | 100 | 100 | 100 | 2.0 s | 0 | 0 ms |
| `/work/jendock/` | 99 | 100 | 100 | 100 | 2.0 s | 0 | 10 ms |

- Home run 1 (84) was taken with the machine at load average 26.8 (`uptime`). Two reruns gave 93 and 93. T-019 did not change any home JS, and the T-018 baseline was 97. I am treating run 1 as noise; target Perf ≥ 90 is met.
- SEO is 100 locally. The `canonical` audit scored 1 here, so no local canonical deviation needed noting. The `robots-txt` audit = 1, thanks to the CSP `connect-src 'self'` addendum (it was SEO 92 in T-018).
- JSON files: `.company/qa/lighthouse-T-019-home.json`, `lighthouse-T-019-case-study.json`, `lighthouse-T-019-open-source.json`.

### Home regression (1 shot each)
| Item | Evidence | Result |
|---|---|---|
| Hero wow | `shots/T-019-home-hero-1440-dark.png` | PASS: renders, signal field and mark present |
| Timeline | `shots/T-019-home-timeline-1440-dark.png` | PASS: cards revealed, alternating, nodes lit |
| Marquee | `shots/T-019-home-marquee-1440-dark.png`; computed `animation-name: marquee` on both rows | PASS |
| Filter | Clicked "Enterprise & ERP 4": 20 → 4 visible cards, `aria-pressed=true`; `shots/T-019-home-filter-1440-dark.png` | PASS |
| Theme toggle | Click dark → light (`data-theme=light`); `shots/T-019-home-theme-toggle-1440-light.png` | PASS |
| Mobile menu (375) | Opened with `aria-expanded=true`, Escape gives `false`, 0 overflow; `shots/T-019-home-mobile-menu-375-dark.png` | PASS |

## Bugs
- **BUG-1 (low, cosmetic).**
  - Steps: open `/work/<any>/` at 1440 and look at the left edge of the facts plate.
  - Expected: no divider before the first cell.
  - Actual: `border-inline-start` on the first cell draws a vertical line just inside the plate's rounded left edge. In the 375 two-column grid, the 3rd cell also has a stray left border and there is no row divider.
  - Evidence: `shots/T-019-facts-no-year-1440-dark.png`.
- **BUG-2 (low, layout).**
  - Steps: open `/work/food-manufacturing-erp/` or `/work/ocr-omr/` at ≥768px.
  - Expected: the facts fill the plate.
  - Actual: 3 facts in a 4-column grid leave an empty fourth cell.
  - Evidence: the same shot.

## Not verifiable
- The live-site checks (spec gate items 5 and 6) need a deploy first: re-run SEO on `https://tpct.github.io/` and one live project page, and run validator.schema.org / Rich Results Test on the live URLs (manual paste). I only parsed the JSON-LD locally and checked its structure.
- AA contrast was spot-checked through Lighthouse accessibility = 100 on both page types, which includes color-contrast. I did not do a manual token-by-token audit.
