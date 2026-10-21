Result: FAIL

QA for release 2 (bold round 3): T-025 story (+ fix-r1) and T-027 kinetic guard, plus the ux-bold §10 gate. Date: 2026-10-21.

**Environment:**
- local `dist/` served with `PORT=4325 node scripts/serve.mjs` (no gzip), stopped afterwards;
- Chromium 1248 headless through playwright-core (CHROME_PATH as in T-003);
- Lighthouse 12.8.2;
- the machine was busy: load average about 20 on 16 cores, which matters for the timing-sensitive results.

Code-review verdicts are in `.company/reviews/T-025-T-027-r1.md`. T-025 needs changes; T-027 is approved.

## Gate commands
| Command | Result |
|---|---|
| `npm run build` | exit 0 |
| `node --test` | 190 tests: 189 pass, 0 fail, 1 skip (pre-existing) |
| `npm run check:confidential` | exit 0 |

## Criteria checked
| Criterion | How verified | Result + evidence |
|---|---|---|
| Process pins, steps advance, outline counter | 1440×900, 1280×800, 1920×1080, dark and light. I scrolled the pin at 0/10/30/50/70/90/100%. | **PASS.** The section top stayed constant (318/269/408px). `is-on` went 1→2→3→4→5 and `is-current` 0→4. The ticker moved -1 line per step (0, -150 … -602px at 1440). `--pp` reached 1 at 80% and then held. Current pill: scale 1.14 with the primary-skin gradient. Inactive h3 colour = `--muted` (#ABA1CC dark, #5A5275 light), opacity 1. Shots: `shots/T-025-process-{10,50,100}-*.png`. |
| Work becomes a pinned horizontal rail with a progress bar | Same matrix, rail at 0/50/100%. | **FAIL (BUG-1, BUG-3).** When the rail engaged, it pinned at a fixed top, `x` went 0 → -3,948 → -7,896 and `--rp` went 0 → .5 → 1, with no vertical clipping. But the pinned rail is clipped at x = 1200 and the right 240px stays empty (BUG-1). The rail also randomly falls back to the grid (BUG-3): in the matrix it engaged in only 3 of 6 combos (1280 dark and light, 1920 light). |
| Cards keep the glass look | Computed styles, rail vs grid. | **PASS.** Same gradient plate, 24px radius and rim shadow in both themes. Compact content only (3-line summary, 2 highlights, one chip row). |
| Filters in rail mode | Clicked Analytics & AI, then an empty combination (Enterprise + Open source), then reset. | **PASS.** Count "20 projects" → "3 projects" → "0 projects" → "20 projects". Pin length 7,656 → 108 (re-measured after about 650ms) → 1 with the empty state shown → 7,656 after reset. Shots: `T-025-filter-*.png`. |
| Keyboard Tab through cards scrolls each into view | Tab from the last chip through all 28 card links, waiting 900ms per stop. | **FAIL (BUG-2, plus BUG-1).** 26 of 28 stops were fully visible. Two were not: the first card landed at left -80, and the third card's right edge was at 1228, past the 1200 clip. |
| Nothing clipped or unreachable | Card rects at 100%. | **FAIL (BUG-1).** The last card is reachable (right edge 1080). But cards are cut by the 1200px clip mid-scroll. |
| About pillars fan | Pillar transforms with `.pillars` top at 88%, 70% and 45% of the viewport. | **PASS.** At 88%: y 81/118/154/190px, rotation -5.4…+5.4°. At 45%: 0/0, opacity 1 throughout. |
| 375 touch: no pins, normal grid, native scroll | 375×812 with `hasTouch` and `isMobile`, wheel-scrolled 30k px. | **PASS.** 0 pin-spacers, no `story`, rail or ticker, 1-column grid, Lenis off. Also checked 360, 390 and 768 (2 columns). |
| Reduced motion | `reducedMotion: reduce` at 1440. | **PASS.** No bold, story or pins; static grid. |
| Pause | `motion=paused` at 1440. | **PASS.** Pins stay scroll-linked: Process at 50% gives 3 steps on, and the rail at 50% gives x ≈ -3,850, rp ≈ .50. Lenis off. |
| No-JS | `javaScriptEnabled: false`. | **PASS.** Static grid with 20 cards, no rail or ticker, name visible, no overflow. |
| Resize 1440→900→1440, and 1440×700 | `setViewportSize`. | **PASS.** At 900: no rail, ticker, `rail-on` or `process--story`, transform cleared. Back at 1440: rebuilt with 2 spacers. At 1440×700 (live resize and fresh load): no rail, Process still pins. |
| `#contact`/`#process` don't jump; gaps equal `--section-gap` | Offsets recorded at `load`, at `html.bold` and after the flush. Gaps measured. | **PASS.** Gap above and below the Process spacer equals `--section-gap` exactly (75/70/88px at 1440/1280/1920). At 1440, `#contact` goes 15,362 → 15,370 → 19,598. The added +4,228 = pin spacing 8,736 minus the grid→rail height change of `#work`. |
| No overflow from 360 to 1920 | Swept the whole page every 500px and recorded the maximum `scrollWidth`. | **FAIL (BUG-1).** 360, 375, 390, 768, 1280, 1440 and 1920 are OK. **1024×900: 1320 > 1024. 1100×800: 1282 > 1100.** The page is laid out 1200px wide and clipped. Shot: `T-025-BUG-1024-hero.png`. |
| T-027: cancelled curtain, name visible within 3s | Init-script simulations at 1440 with the intro on. | **PASS.** Name fully visible at: normal 2,108ms; real `cancel()` of the pending `intro-out` 1,736ms; rejected `ready` 319ms; `ready` never settles 3,028ms; timeline never plays 3,019ms. The last two are the 3,000ms watchdog plus my 25ms polling. Shots: `T-027-*-3200ms.png`. |
| 0 CSP violations or console errors | A `securitypolicyviolation` listener plus console/pageerror/requestfailed hooks on every page load in every run (desktop matrix, interactions, resize, mobile, paused, reduced, project pages, video). | **PASS.** 0 and 0 everywhere. |
| No regressions | Home at 1440 dark with the intro on, after 3.5s and after scrolling. | **PASS.** The intro screen is hidden (visibility hidden, no pointer events). Hero name restored ("Islam Elsayed", 0 `.ch`, opacity 1). Marquee: 2 rows running. About strip: `clients-drift` ×2 running. Spine progress 0 → 0.35. Timeline: 15/15 lit, `--tl-p` = 1. Project pages (national-waste-analytics, jendock, simple-compiler) at 1440 and 375: h1 present, no overflow, 0 errors or CSP violations. |

## §10 performance gate
| Check | Result |
|---|---|
| Lighthouse mobile, home, fresh profile (5 runs) | Perf **85 / 94 / 91 / 77 / 89, median 89**. A11y 100, BP 100, SEO 100 in every run. **CLS 0.0000** in every run. LCP 2.6–3.4s, TBT 70–362ms. **Not met (median 89 < 90)**, but the result is confounded. |
| Lighthouse desktop, home | Perf **99**, A11y 100, BP 100, SEO 100, CLS 0, LCP 0.78s. |
| Video | `.company/qa/shots/T-025-story.webm`: 25.0s, 1440×900, VP9. |

Why the mobile result is confounded:
- The local server sends no gzip. Lighthouse estimates about 256 KiB of text-compression savings.
- The machine was under heavy load.
- The live site with gzip scored 96 earlier today (`lighthouse-live-T023.json`).
- T-025 adds no work on mobile apart from parsing about 3.8KB, because pins only run at `Q.desk`/`Q.rail`.
- Action: re-run on the deployed site after the fixes.

About the video:
- It is a full-page wheel scroll with Lenis on. It shows the pillar fan, the rail pin with the progress bar, and the Process pin with the ticker.
- It is time-compressed 2.13×: 53s of real scrolling on the loaded machine, captured with a CDP screencast and encoded with Playwright's ffmpeg, because playwright-core's own `recordVideo` needs ffmpeg-1011, which is not installed.
- BUG-1's hard clip at x = 1200 is visible in it.
- It took 3 page loads to get one where the rail engaged (BUG-3).

Not done for the §10 gate: the 60fps at 4× CPU throttle check and a long-task trace. See "Not verifiable" below.

## Bugs
**BUG-1: the rail breaks page width and full-bleed (blocker)**
- Steps:
  1. Open `/` at 1024×900 or 1100×800 with a fine pointer and motion allowed.
  2. Wait for the ready flush.
- Expected: `scrollWidth == innerWidth`, and the pinned rail spans the full viewport.
- Actual:
  - `main` grid track = 1200px, `scrollWidth` 1320 (at 1024) or 1282 (at 1100). The hero, stats and every section are clipped on the right.
  - At 1440 and 1920, the pinned rail gets inline `width: 1200px` and is hard-clipped at x = 1200 with 240px of empty space to the right.
  - The bar runs 120–1080.
  - The travel (`x` -7,896) does not equal the pin length (7,656).
- Severity: blocker.

**BUG-2: the first focused card is off-screen (major, WCAG 2.4.7)**
- Steps:
  1. 1440×900 with the rail engaged.
  2. Scroll just above Work.
  3. Focus the "Open source" chip and press Tab.
- Expected: the focused card is fully inside the viewport.
- Actual: the card sits at left -80, so its link is partly hidden. `focusin` decides "already visible" before the native focus scroll and the 0.6s scrub move the list.
- Severity: major.

**BUG-3: the rail randomly never engages (blocker)**
- Steps: reload `/` at 1440×900 or 1920×1080 several times (more often on a busy CPU).
- Expected: the rail always engages, since the compact list is 607px against a 728px limit.
- Actual: in 30–100% of loads `#work` stays a grid for the whole visit.
- Cause: 30-filter's initial inline `min-height` (705–758px, cleared after 200ms) is still on `#project-list` when the fit check reads `offsetHeight`. Proven by instrumenting the check: every failing load shows `style="min-height: 731.719px;"`.
- Severity: blocker, because the headline feature is missing for many visitors.

**BUG-4 (low, pre-existing, not T-025):** "Project details" and the "View on GitHub" pill touch, with 0px gap, when they share a row. Seen in the 1440 rail, the 1440 grid and the 1000 grid.

## Not verifiable
- **60fps at 4× CPU throttle and no long task over 50ms in the ready queue:** not measured. The host was at load average about 20, so frame-rate or trace numbers would not mean anything. Re-run on an idle machine after the fixes.
- **Lighthouse on gzip-served or live pages:** not possible before deploy. The local mobile median of 89 is inconclusive.
- **Real touch devices and Safari/Firefox:** only Chromium emulation was run (`hasTouch`/`isMobile`).
- **axe in both themes with Contact in view (§9):** not run in this pass. Lighthouse a11y = 100 in mobile and desktop, which covers contrast on the default theme only.

## Artifacts
- Screenshots (`.company/qa/shots/`):
  - `T-025-process-*`, `T-025-rail-*`, `T-025-pillars-1440x900-dark.png`
  - `T-025-filter-analytics-1440.png`, `T-025-filter-empty-1440.png`
  - `T-025-mobile-375-work.png`, `T-025-BUG-1024-hero.png`, `T-025-rail-hover-opensource-1440.png`
  - `T-027-*-3200ms.png`
- Video: `.company/qa/shots/T-025-story.webm`
- Lighthouse: `.company/qa/lighthouse-T-025-home-mobile-{1..5}.json`, `.company/qa/lighthouse-T-025-home-desktop.json`
