# T-023 — B-2 Motion foundation: self-hosted GSAP/ScrollTrigger/Lenis loading, pre-paint flags, `80-bold.js` core

Size: M   Depends on: vendor files committed by the lead (already in `public/assets/vendor/`)   Parallel: may run together with T-022 (disjoint files). T-024/T-025/T-026 depend on this ticket.   Stories: owner feedback "still no real wow"

## Goal
Load the committed, unmodified GSAP 3.15.0 + ScrollTrigger + Lenis 1.3.27 on the home page only, without slowing the existing scripts or touching CSP (`script-src 'self' <hash>; style-src 'self'` stays). Add the pre-paint flags (`motion-paused`, `kinetic`, `intro`), the home-only intro/tint placeholders (hidden until T-024/T-026), and the shared `window.TPCT_BOLD` core that the later bold modules register on. Nothing visible changes in this ticket except smooth wheel scrolling on desktop.

## Files (only these)
- `public/assets/vendor/*`: **read-only**. Never modify, rename, add or delete a file there.
- `src/render/head.mjs`, `src/render/layout.mjs`, `src/lib/logo.mjs`, `scripts/build.mjs` (pass `home: true` to the home `renderPage` call only).
- new `src/scripts/80-bold.js` (≤ 4,600 bytes), new `src/styles/45-bold.css`, new `src/styles/46-lenis.css`.
- `README.md`: the "Credits / licences" list only.
- new `test/vendor.test.mjs`, new `test/bold-core.test.mjs`.
- `test/scripts.test.mjs`: the `site.js` cap number on line 63 only. `test/projects.test.mjs`: the `site.js` check on line 59 only.

## Spec → `.company/ux-bold.md` §3 (normative), with these lead overrides
**Override A, vendor names (the files are already committed; ux-bold §3.1 names are NOT used):**
| File in `public/assets/vendor/` | Use |
|---|---|
| `gsap.min.js` (GSAP 3.15.0) | tag on home |
| `ScrollTrigger.min.js` (3.15.0) | tag on home |
| `lenis.min.js` (1.3.27) | injected by `80-bold.js` on fine pointers |
| `LICENSE-gsap.txt`, `LICENSE-lenis.txt` | licences |
| `SHA256SUMS` | `sha256sum` format (`<hex>  <name>`), integrity source of truth (there is no `VERSIONS.json`) |

`lenis.min.js` ends with `//# sourceMappingURL=lenis.min.js.map`. Leave it (files are never edited; the map is not shipped and only DevTools requests it).

**Override B, cache busting:** `head.mjs` exports `export const VENDOR = { gsap: '3.15.0', lenis: '1.3.27' };` and the URLs carry `?v=<version>`.

### 1. `head.mjs` (§3.2, §3.3)
- When `page === 'home'`, emit right after the existing `site.js` tag, in this order:
  `<script src="/assets/vendor/gsap.min.js?v=3.15.0" defer fetchpriority="low"></script><script src="/assets/vendor/ScrollTrigger.min.js?v=3.15.0" defer fetchpriority="low"></script>` (build the version from `VENDOR.gsap`). 404 and `/work/*` pages: no vendor tags.
- Append to `THEME_SCRIPT`, inside the IIFE after the theme logic, exactly the two statements from ux-bold §3.3 (`var p=0;try{…}…` and the `kinetic`/`intro` statement). The CSP hash is recomputed automatically by `cspHash(THEME_SCRIPT)`. Still exactly one inline script.

### 2. `layout.mjs` + `logo.mjs` + `build.mjs` (§3.4)
- `renderPage(c, { head, header, main, footer, spine = false, home = false })`. When `home`, insert directly after the skip link: `<div class="intro-screen" aria-hidden="true">${logoMark({ idPrefix: 'intro', className: 'intro__svg', draw: true })}</div><div class="tint" aria-hidden="true"><span></span><span></span><span></span></div>`.
- `logoMark({ …, draw = false })`. With `draw: true`: add `pathLength="1"` to each of the 5 `<path>`, add `width="120" height="130"` to the `<svg>`, omit the `-sheen` linearGradient, the `-clip` clipPath and the final `<g clip-path=…>` sheen group; keep the `-grad` gradient, the `sc-part` groups and the path ids. Output with `draw: false` (default) must stay byte-identical to today (hero, header, favicon tests rely on it).
- `build.mjs`: the home `renderPage(c, { … spine: true, home: true, … })`. Nothing else.

### 3. `src/scripts/80-bold.js` (§3.5) — file must start with `(function () {\n  "use strict";` like every partial
Behaviour, in this order:
1. **CSP guard for ScrollTrigger (lead decision, must be top-level and synchronous).** `ScrollTrigger.min.js` auto-registers when it executes and, in `enable()`, calls `body.setAttribute('style','')` if `<body>` has no `style` attribute; under `style-src 'self'` that is one CSP violation per load. `site.js` executes before the vendor scripts (same `defer` queue, earlier in the document), so at the top of the IIFE:
   ```js
   const d=document,b=d.body,guard=!!(b&&!b.hasAttribute('style')&&d.querySelector('script[src^="/assets/vendor/ScrollTrigger"]'));
   if(guard)b.style.setProperty('--st-guard','0');   // CSSOM write: CSP-exempt, creates the attribute so ScrollTrigger skips its setAttribute branch
   ```
   In the start function (step 2), before anything else and even when bailing out: `if(guard){b.style.removeProperty('--st-guard');if(!b.getAttribute('style'))b.removeAttribute('style')}`.
2. **Start:** `const go=()=>{…}; d.readyState==='complete'?go():d.addEventListener('DOMContentLoaded',go,{once:true});`. (Not "if not loading": deferred scripts run while `readyState` is `interactive`, before the vendor code.) In `go`: cleanup guard; `const g=window.gsap,ST=window.ScrollTrigger,e=d.documentElement; if(!g||!ST||!e.classList.contains('motion'))return;`.
3. `g.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); g.defaults({ overwrite: 'auto' });`
4. `window.TPCT_BOLD = B` with exactly the members of ux-bold §3.5 table: `g`, `ST`, `mm` (one `g.matchMedia()`), `Q` (the 3 query strings verbatim), `now(fn)`, `ready(fn)`, `headerH()`, `refresh()` (150ms debounce of `ST.refresh()`), `lenis()`, `paused()`. `ready` queue: flush starts after `load` (or immediately if `readyState==='complete'`) + `requestIdleCallback(cb,{timeout:1200})` (fallback `setTimeout(cb,300)`); one `fn` per task via `setTimeout(next,0)`; the first task adds `html.bold`; the last task runs `ST.sort();ST.refresh()`. After the flush, `ready(fn)` runs `fn` on the next task and then calls `B.refresh()`. Wrap each `fn(B)` in `try{}catch{}` so one module failing never blocks the others.
5. **Lenis** (queued as the first `ready` fn, only if `matchMedia('(hover: hover) and (pointer: fine)').matches`): inject once `const s=d.createElement('script');s.src='/assets/vendor/lenis.min.js?v=1.3.27';s.onload=()=>{if(!B.paused())start()};d.head.append(s);`. `start()` / `stop()` exactly as ux-bold §3.5 step 4 (options `lerp: 0.11, smoothWheel: true, syncTouch: false, wheelMultiplier: 1, autoRaf: false, prevent: n => n.closest('[data-lenis-prevent]')`, `L.on('scroll', ST.update)`, `g.ticker.add(tick)`, `g.ticker.lagSmoothing(0)`; stop removes the ticker callback, `L.destroy()`, `L=null`). `start()` is a no-op if `L` exists or `window.Lenis` is missing.
6. **Anchors** (§3.5 step 5): one delegated `document` `click` listener; act only when `L` is active, the click is a plain primary click (`!e.defaultPrevented && e.button===0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey`), the link is `a[href^="#"]` and `getElementById(decodeURIComponent(id))` exists (wrap decode in try). Then `preventDefault()`, `L.scrollTo(target,{offset:-(B.headerH()+16),duration:1.0,easing:t=>1-Math.pow(1-t,4)})`, `history.pushState(null,'','#'+id)`. Do not stop propagation: `20-nav.js` still focuses the target with `preventScroll`.
7. **Pause** (§3.5 step 6): a `MutationObserver` on `<html>` `attributes`/`attributeFilter:['class']`; compare with the previous paused state; on → `stop()`, off → `start()` (fine pointer only, script loaded).
8. **Refresh hooks:** `d.fonts?.ready.then(B.refresh)`; `d.addEventListener('toggle',ev=>{if(ev.target.matches?.('details.career__more'))B.refresh()},true)` (capture: `toggle` does not bubble).
9. **Print:** `addEventListener('beforeprint',()=>{B.mm.revert();stop()})`.
- Allowed style writes: CSSOM only (`el.style.setProperty/removeProperty`). Forbidden (test regex): `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `cssText`, `setAttribute('style'`, `eval(`, `new Function`.

### 4. CSS
- `45-bold.css`: `.intro-screen, .tint { display: none; }` (T-024/T-026 override it later).
- `46-lenis.css`: the Lenis 1.3.27 `dist/lenis.css`, verbatim (copied by the lead from the npm tarball), preceded by `/* Lenis 1.3.27 dist/lenis.css, MIT, darkroom.engineering */`:
  ```css
  html.lenis,
  html.lenis body {
    height: auto;
  }

  .lenis:not(.lenis-autoToggle).lenis-stopped {
    overflow: clip;
  }

  .lenis [data-lenis-prevent],
  .lenis [data-lenis-prevent-wheel],
  .lenis [data-lenis-prevent-touch],
  .lenis [data-lenis-prevent-vertical],
  .lenis [data-lenis-prevent-horizontal] {
    overscroll-behavior: contain;
  }

  .lenis.lenis-smooth iframe {
    pointer-events: none;
  }

  .lenis.lenis-autoToggle {
    transition-property: overflow;
    transition-duration: 1ms;
    transition-behavior: allow-discrete;
  }
  ```
  then `html.lenis.lenis-smooth { scroll-behavior: auto !important; }`.

### 5. README
Add to "Credits / licences": `- GSAP 3.15.0 (gsap.min.js, ScrollTrigger.min.js): GreenSock Standard "No Charge" License, public/assets/vendor/LICENSE-gsap.txt.` and `- Lenis 1.3.27: MIT, public/assets/vendor/LICENSE-lenis.txt. Vendor files are unmodified; checksums in public/assets/vendor/SHA256SUMS.`

## Acceptance
- [ ] `sha256sum -c SHA256SUMS` (run in `public/assets/vendor/`) still reports OK for all 3 files; `git status public/assets/vendor` shows no change.
- [ ] Home `index.html`: `site.js` tag, then the gsap tag, then the ScrollTrigger tag, both `defer fetchpriority="low"`. `404.html` and every `/work/*/index.html` contain no `/assets/vendor/`.
- [ ] Exactly one inline script; CSP meta unchanged except the recomputed hash; `style-src 'self'` unchanged.
- [ ] Home has `.intro-screen[aria-hidden="true"]` (5 `pathLength="1"`, no `sc-sheen`, no `clip-path`) and `.tint` with 3 spans, directly after the skip link; other pages have neither. Hero/header logo output unchanged.
- [ ] Browser check (below): 0 `securitypolicyviolation` events and 0 console errors on home (desktop, mobile, reduced motion), 404 and one project page; `html.bold` appears on desktop and mobile; `html.lenis` only on the desktop context; anchor click lands on `#contact` with focus on the section; pause removes `html.lenis`, play restores it; `document.body.hasAttribute('style') === false` after `html.bold`.
- [ ] Reduced motion: no `bold`, `kinetic` or `intro` class, Lenis never injected. No JS: page identical to today apart from the hidden placeholders.
- [ ] `80-bold.js` ≤ 4,600 bytes; built `site.js` ≤ 39,704 bytes.

## Tests
- `test/vendor.test.mjs`: parse `SHA256SUMS`; every listed file exists and its sha256 matches; the set of `.js` files in the folder equals the listed set; gsap+ScrollTrigger raw ≤ 120,000 and `zlib.gzipSync(buf,{level:9})` total ≤ 49,152; Lenis raw ≤ 20,000 and gzip ≤ 7,168; `gsap.min.js` and `ScrollTrigger.min.js` contain no `sourceMappingURL`; `gsap.min.js` starts with a header containing `GSAP ${VENDOR.gsap}` and `ScrollTrigger.min.js` with `ScrollTrigger ${VENDOR.gsap}`; `lenis.min.js` contains `` `${VENDOR.lenis}` `` and `Lenis`; both licence files non-empty, `LICENSE-gsap.txt` contains `standard-license`, `LICENSE-lenis.txt` contains `MIT`; after `build({ outDir })` the 6 vendor files exist byte-identical in `<outDir>/assets/vendor/`.
- `test/bold-core.test.mjs`: everything in ux-bold §3.7 "bold-core" with the overridden file names: tag order on home; no vendor on 404 and one `/work/*` page; `THEME_SCRIPT` includes `kinetic`, `intro`, `sessionStorage`, `motion-paused`; one inline script; placeholders on home only; `80-bold.js` ≤ 4,600 bytes and contains `` `/assets/vendor/lenis.min.js?v=${VENDOR.lenis}` ``; built CSS has `.intro-screen, .tint { display: none; }` and `lenis-smooth`; vm smoke tests on the built `site.js` (reuse the stub shape of `scripts.test.mjs` `context()`): (a) `readyState: 'complete'`, no `gsap` → no throw, `TPCT_BOLD` undefined; (b) `readyState: 'complete'`, `motion` allowed, minimal `gsap`/`ScrollTrigger` stubs (`registerPlugin`, `defaults`, `matchMedia()→{add(){},revert(){}}`, `ticker{add,remove,lagSmoothing}`, `config`, `sort`, `refresh`, `update`) plus `MutationObserver`/`requestIdleCallback` stubs → `TPCT_BOLD` has all 10 members and `Q` equals the 3 strings of ux-bold §3.5.
- `test/scripts.test.mjs` line 63: `26392` → `39704`. `test/projects.test.mjs` line 59: `< 30000` → `<= 39704`.

## Browser check (dev only, outside the repo; required)
Write a throwaway script in `/tmp/tpct-t023/check.mjs` (never inside the repo). `npm run build`, start `PORT=4323 node scripts/serve.mjs` in the background, run the script with `PLAYWRIGHT_CORE=/home/tpct/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node /tmp/tpct-t023/check.mjs`, then kill the server. Load Playwright with `createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE)` and `chromium.launch({ executablePath: process.env.CHROME_PATH })`.
- `context.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI + ' ' + e.sourceFile + ':' + e.lineNumber), true); })`; also collect `page.on('console')` of type `error` and `page.on('pageerror')`.
- **Detector sanity:** on one page run `document.body.setAttribute('style','')` via `page.evaluate` and assert `__csp.length === 1`, then use a fresh page for the real runs.
- Contexts: desktop 1440×900; mobile 390×844 `isMobile: true, hasTouch: true`; `reducedMotion: 'reduce'` 1440×900. Pages: `/`, `/404.html`, the first `/work/<id>/`.
- On desktop `/`: wait for `html.bold` (≤ 6s), wheel-scroll down 3×1200px, resize to 900×800 and back to 1440×900, click the header link to `#contact`, wait 1.5s, check hash + `document.activeElement.id === 'contact'`, click `.motion-toggle` (check `html.lenis` gone), click again (back).
- Print every collected violation/console error. **If a CSP violation from ScrollTrigger still appears:** stop, report the exact text and line, do not edit vendor files, do not loosen the CSP; the lead decides.

## Commands (run only these)
```
npm run build
node --test test/vendor.test.mjs test/bold-core.test.mjs test/scripts.test.mjs test/build.test.mjs test/projects.test.mjs test/brand.test.mjs
npm run check:confidential
```
(`brand.test.mjs` confirms the default `logoMark` output is unchanged.) If `test/sections.test.mjs` would fail on the CSS cap in your tree, do not edit it (T-022 owns that cap); report the numbers.

## Constraints
- Do not commit or push. Do not edit anything under `.company/`. Never modify `public/assets/vendor/*`.
- CSP self-only: no CDN, no inline `style=`, no handlers, no second inline script, no `'unsafe-inline'`.
- No npm dependencies; vendor code is used only through the `window.gsap`, `window.ScrollTrigger`, `window.Lenis` globals.
- Keep the current visual style exactly; this ticket adds no visible styling beyond the hidden placeholders.
- Reduced motion: nothing initialises (60-motion's `motion` class gate). Pause: Lenis off, scroll-linked effects stay. No JS: content identical.
- Mobile/touch: no Lenis (native scrolling), never pin anything here.
- Existing scripts (`10`–`73`) and their timing must not change; do not edit them.

## Out of scope
Intro/kinetic/rotator CSS and JS (T-024), story pins (T-025), colour morphs and heading splits (T-026), Lighthouse gate (lead).
