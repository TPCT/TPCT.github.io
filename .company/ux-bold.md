# UX spec: "Bold" round (About rewrite + GSAP motion layer)

Owner: UI/UX Designer · Date: 2026-10-21 · Status: normative for tickets B-1 … B-5.
Inputs:
- Owner feedback relayed by the coordinator: "still no real wow" and "About is a wall of text". The owner loves the current visuals.
- `ux-prism.md` and `ux-wow.md`, `STATUS.md`, and the current `src/` code (renderers, all style and script partials, `content.json`, tests).
- The impeccable `animate` / `bolder` / `delight` references. The launcher could not run, so the project context was read directly.

Where this conflicts with `ux-prism.md` or `ux-wow.md`, this document wins. **Visual identity is frozen**: glass plates, chips, numbered eyebrows, the violet palette, Outfit and Plus Jakarta Sans, radii and shadows all stay exactly as they are. This round adds no new hue, font, radius or shadow token. The only new colour token is `--tint-c`, which is `--logo-c` (#5A1FE0) at an alpha. Everything below is layered on top of the existing system.

---

## 0. Thesis

Mode: **Experience** (a portfolio). Following `bolder`, the round amplifies what the system already owns (the S-mark, the violet signal, the glass plates, the outline type from the stack marquee) and adds no new motifs. Following `animate`, the round has one focal sequence plus scroll-authored chapters. It does not add more fade-ups.

| Role | What | Ticket |
|---|---|---|
| Focal moment | **Intro → kinetic name.** The S-mark draws itself, the curtain lifts, and "Islam Elsayed" rises letter by letter in 3D. The S-mark then stays alive in depth: its layers separate as you scroll and as you move the pointer. | B-3 |
| Chapter 1 | **About becomes a statement**: a 2-line display lead, 4 glass pillar cards that fan into place, and a slow wordmark rail of the companies worked with. | B-1 (+ fan in B-4) |
| Chapter 2 | **Work becomes a horizontal gallery** on desktop: the card rail pins and slides sideways under vertical scroll, with a progress bar. | B-4 |
| Chapter 3 | **Process becomes a pinned story** on desktop: the line fills, steps light up one by one, and a giant outline counter rolls 01→05. | B-4 |
| Atmosphere | **Section colour morphs**: the page light shifts per chapter. **Split-line heading reveals** site-wide. **Lenis** smooth wheel scroll on desktop. | B-5, B-2 |

Dropped, and logged in Assumptions:
- SplitText (budget; we split ourselves).
- Pinning About (three pinned chapters is fatigue; About gets a scrubbed fan instead).
- Animating the hero sub-paragraph with GSAP (it is the LCP candidate, so it stays on CSS with `opacity:.001`).
- A cursor-follower blob (`.cursor-glow` already exists).

---

## 1. User flows

| Flow | Steps |
|---|---|
| **F1 First visit, desktop mouse** | First paint shows the intro overlay. The S-mark strokes draw (0–600ms), the fill washes in (460–720ms), and the curtain wipes up while the mark lifts away (700–1000ms). From ~720ms the hero letters rise in 3D, one by one. At the same time the existing CSS entrance plays for the other hero items, offset by 700ms. The roles line shows "CEO @ ShiftCodes" and then starts flipping between roles at ~3.1s. Wheel scrolling is smooth (Lenis). As you scroll past the hero, the S-mark layers separate in depth and recede. About's lead lines rise and the 4 pillars fan up into a row. The wordmark rail drifts. Every chapter shifts the ambient light. In Work, the card rail pins and slides horizontally (progress bar under it), then releases. In Process, the section pins, the line fills, steps light up 01→05 and the outline counter rolls. Contact ends in the brightest light. |
| **F2 Same tab, reload or return** | No intro (`sessionStorage.intro` is set). The kinetic name starts ~100ms after DOMContentLoaded. Everything else is as in F1. |
| **F3 Deep link `/#work`** | No intro, because a hash is present. The page lands on Work. The kinetic name still plays (it is offscreen and harmless). |
| **F4 Mobile / touch** | Intro, kinetic name, roles rotator, S-mark scroll depth, colour morphs, heading reveals and the pillar container reveal all play. No Lenis, no pins, no horizontal rail: Work is the normal grid and Process uses the existing line-draw reveal. Native touch scrolling throughout. |
| **F5 Pause** | The hero "Pause animation" button: Lenis is destroyed (native scroll resumes at the same position), the roles rotator returns to the inline row, and the company rail and other CSS loops freeze. Pins, the rail and the colour morphs stay, because they are scroll-linked (the user drives them). Pressing Play recreates Lenis and the rotator. The state persists through `localStorage.motion` and is applied before paint (B-2). |
| **F6 Reduced motion** | No intro, no kinetic, no Lenis, no pins, no rail, no morphs, no rotator (roles are the inline row) and no marquee motion (wordmarks wrap as static chips). Every piece of content is static and fully visible. |
| **F7 No JS / crawler** | The HTML is unchanged in structure: no hidden content, no overlay (it only shows under `html.intro`, which only JS sets), and the h1 is plain text. |
| **F8 Keyboard** | The skip link sits above the intro overlay. Tab order equals DOM order. Tabbing into a card in the horizontal rail scrolls the page so that card is in view (§6.3). Anchor links smooth-scroll with Lenis and focus still lands on the section (20-nav unchanged). |

---

## 2. About rewrite (B-1)

### 2.1 What goes, what stays
- **Removed:** the 3 paragraphs and the key-facts aside (`.about__facts`). The aside duplicated the 4 hero stats and the role chips. Also removed: the `about.paragraphs` and `about.factsLabel` keys, and the `.about__*` rules in `50-sections.css` (lines 2–11, the `.about__body` padding rules at 768/1024, lines 68–72, and the `.about__body` / `.about__fact dd` forced-colors entries). `c.stats` stays: it is still used by the hero.
- **Kept:** the section shell `section('about', '01', …)`, the "01 / About" index pill and the h2 "About".
- **Facts that were only in the old paragraphs** (not hero, Stack, Experience or Journey) are kept in `intro`: the 5 countries and the CEO line. The removed stack sentence lives in Stack. The before/after numbers live in the hero stats and Experience. The confidentiality note moves into the "Trust" pillar.

### 2.2 New `content.json` → `about` (replace the whole object)
```json
"about": {
  "title": "About",
  "lead": [
    "I start with how the business really runs,",
    "then build the software it can rely on."
  ],
  "intro": "I'm Islam Elsayed, CEO of ShiftCodes. I've led and built production systems for companies in Egypt, Jordan, the UAE, Saudi Arabia and the US.",
  "pillarsLabel": "How I work",
  "pillars": [
    { "icon": "layers", "title": "Architecture", "text": "I model the operation first, then draw boundaries that let the system grow without a rewrite." },
    { "icon": "users", "title": "Leadership", "text": "As CTO and team lead I set the technical direction, review the code and stay hands-on." },
    { "icon": "gauge", "title": "Scale", "text": "National analytics, multi-tenant SaaS and high-traffic APIs that stay fast as the data grows." },
    { "icon": "shield-check", "title": "Trust", "text": "Banks, government programmes and private companies trust me with live systems, so most of this work stays private." }
  ],
  "companiesLabel": "Worked with",
  "companies": ["Kearney", "dot.jo", "IPXBit", "Venu Dine", "Everything To Gain", "Raqmix", "Monglish", "Edulixa360", "ShiftCodes", "Stackdeans", "WeDoAcc", "Aqua Web"]
}
```
Truth check:
- Every company is a substring of an `experience[].org`.
- Countries: Egypt (Monglish, Aqua Web), Jordan (dot.jo), UAE (Kearney, IPXBit), Saudi Arabia (Edulixa360, the analytics platform), US (Everything To Gain).
- CTO: IPXBit and Venu Dine. Team lead: dot.jo, Raqmix, Monglish.
- Scale: the national analytics platform, multi-tenant work at IPXBit/ETG, and 200k+ daily requests.
- Trust: bank websites, the Kearney government platform, and private case studies.

### 2.3 Validation (`validate.mjs`, replacing the old about rule)
| Key | Rule (error text `about.<key>: …`) |
|---|---|
| `title`, `intro`, `pillarsLabel`, `companiesLabel` | required non-empty string; `intro` ≤ 200 chars |
| `lead` | array of exactly 2 non-empty strings, each ≤ 60 chars |
| `pillars` | array of 3–4 items. Each item has `icon` (must be a key known to `icons.mjs`; export `hasIcon(name)`), `title` (≤ 24 chars) and `text` (≤ 120 chars). `text` must not contain any `stats[].value`. It must not contain any `skills[].items[]` entry as a whole phrase (case-insensitive, `\b…\b` with the item regex-escaped) |
| `companies` | 6–16 unique strings. Each must be a case-insensitive substring of some `experience[].org` |
| removed keys | `paragraphs` / `factsLabel` present → error `about.paragraphs: removed, use lead/intro/pillars` |

### 2.4 Icons (`src/lib/icons.mjs`, Lucide ISC, same 24×24 stroke format)
Add these, with path data exactly as below (Lucide):
- `layers`: `<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />`
- `users`: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />`
- `gauge`: `<path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />`
- `shield-check`: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />`

Also export `hasIcon = name => Object.hasOwn(paths, name)`.

### 2.5 Markup (`renderAbout(c)` in `sections.mjs`)
```html
<section id="about" …>  <!-- existing section() shell: index pill + h2 -->
  <div class="about">
    <p class="about__lead" data-reveal>
      <span class="about__line"><span>I start with how the business really runs,</span></span>
      <span class="about__line about__line--accent"><span>then build the software it can rely on.</span></span>
    </p>
    <p class="about__intro" data-reveal>I'm Islam Elsayed, CEO of ShiftCodes. …</p>
    <ul class="pillars" aria-label="How I work" data-reveal>
      <li class="pillar">
        <span class="pillar__icon">{icon(name, 24)}</span>
        <span class="pillar__index" aria-hidden="true">01</span>
        <h3>Architecture</h3>
        <p>I model the operation first, …</p>
      </li>
      … (×4, index padStart 2)
    </ul>
    <div class="clients" data-reveal>
      <p class="label" id="clients-label">Worked with</p>
      <div class="clients__rail">
        <ul class="clients__list" aria-labelledby="clients-label"><li>Kearney</li>…</ul>
        <ul class="clients__list clients__list--dup" aria-hidden="true"><li>Kearney</li>…</ul>
      </div>
    </div>
  </div>
```
The two `.about__line` spans are separated by a real space text node, so `textContent` reads as one sentence. All text goes through `esc()` and attributes through `attr()`.

### 2.6 Layout and wireframes
```
≥1024                                                        <768
01 / ABOUT                                                   01 / ABOUT
About                                                        About
I start with how the business really runs,   (display 52px)  I start with how the
then build the software it can rely on.      (gradient)      business really runs,
I'm Islam Elsayed, CEO of ShiftCodes. I've led … (fg2)       then build the software…
┌──────────┐┌──────────┐┌──────────┐┌──────────┐             I'm Islam Elsayed, …
│[▤]    01 ││[👥]   02 ││[◔]    03 ││[🛡]   04 │             ┌───────────────────┐
│Architect.││Leadership││Scale     ││Trust     │             │[▤]             01 │
│I model … ││As CTO …  ││National …││Banks, …  │             │Architecture       │
└──────────┘└──────────┘└──────────┘└──────────┘             │I model the …      │
WORKED WITH                                                  └───────────────────┘ ×4
 ‹ Kearney  dot.jo  IPXBit  Venu Dine  Everything To Gain … ›  WORKED WITH
                       (masked edges, drifting left)          ‹ Kearney  dot.jo  IPX… ›
```

### 2.7 CSS: new partial `src/styles/51-about.css` (complete spec)
```css
.about { display: grid; gap: var(--space-6); }
.about__lead { max-width: 24ch; font: 700 clamp(1.75rem, 1.1rem + 2.6vw, 3.25rem)/1.08 var(--font-display); letter-spacing: -.025em; color: var(--fg); text-wrap: balance; }
.about__line { display: block; overflow: hidden; overflow: clip; padding-block-end: .1em; margin-block-end: -.1em; }
.about__line > span { display: inline-block; }
.about__line--accent > span { background: var(--grad-accent); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
.about__intro { max-width: 60ch; margin-block-start: calc(-1 * var(--space-3)); color: var(--fg2); font: 500 1.125rem/var(--lh-body) var(--font-sans); }
.pillars { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.pillar { position: relative; display: flex; flex-direction: column; gap: 10px; min-width: 0; padding: 24px; background: var(--plate); border: 1px solid var(--rim); border-radius: var(--r-plate); box-shadow: var(--shadow-card); overflow-wrap: anywhere; transition: translate var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease-out); }
.pillar__icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 16px; background: var(--nav-sel); color: var(--brand); transition: background var(--dur-2), color var(--dur-2); }
.pillar__index { position: absolute; inset-block-start: 24px; inset-inline-end: 24px; font: 800 var(--fs-label)/16px var(--font-sans); letter-spacing: var(--tracking-label); color: var(--muted); }
.pillar h3 { margin-block-start: 8px; font: 600 var(--fs-h3)/1.25 var(--font-display); }
.pillar p { color: var(--fg2); font-size: var(--fs-small); }
@media (hover: hover) and (pointer: fine) {
  .pillar:hover { translate: 0 -4px; box-shadow: var(--shadow-lift); }
  .pillar:hover .pillar__icon { background: var(--primary-skin); color: var(--on-primary); }
}
.clients { display: grid; gap: 12px; }
.clients__rail { overflow: hidden; overflow: clip; }
.clients__list { display: flex; flex-wrap: wrap; gap: 10px; }
.clients__list li { padding: 8px 18px; border-radius: var(--r-pill); background: var(--surface-soft); border: 1px solid var(--rim); color: var(--fg2); font: 600 1.0625rem/1.4 var(--font-display); letter-spacing: -.005em; white-space: nowrap; }
.clients__list--dup { display: none; }
@media (min-width: 640px) { .pillars { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .about { gap: var(--space-7); } .pillars { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; } .pillar { min-height: 232px; } }
@media (prefers-reduced-motion: no-preference) {
  @keyframes clients-drift { to { translate: -100% 0; } }
  .js .clients__rail { display: flex; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
  .js .clients__list { flex-wrap: nowrap; flex-shrink: 0; padding-inline-end: 10px; animation: clients-drift 48s linear infinite; }
  .js .clients__list--dup { display: flex; }
  .clients__rail:hover .clients__list, .motion-paused .clients__list { animation-play-state: paused; }
}
@media (forced-colors: active) { .pillar, .pillar__icon, .clients__list li { border: 1px solid CanvasText; } .about__line--accent > span { background: none; color: CanvasText; -webkit-text-fill-color: CanvasText; } }
@media print { .clients__list--dup { display: none !important; } .clients__list { flex-wrap: wrap !important; animation: none !important; } }
```
- The rail is gated on `.js`, which is set before paint, so there is no CLS (same rule as the stack marquee).
- The drift is seamless because both lists translate −100% together, and each list carries its trailing gap as padding.

### 2.8 States (About)
| State | Behaviour |
|---|---|
| Default / success | As in the wireframe. |
| Empty | Validation prevents an empty About: `pillars` must have 3–4 items and `companies` 6–16. With 3 pillars, `auto-fit` gives 3 columns at ≥1024 and 2+1 at 640–1023. |
| Loading | Static HTML, so there is no loading state. Before reveal, the existing `data-reveal` pending fade applies (60-motion). |
| Error | Not applicable (no fetch). JS failure leaves everything visible. |
| Disabled | Not applicable (no controls). |
| Long content | Pillar text up to 120 chars wraps (`overflow-wrap:anywhere`). Titles up to 24 chars. Lead lines up to 60 chars wrap inside their mask (inline-block). A company name is one nowrap chip; the static (reduced-motion) mode wraps the chips. |
| Permission-denied | Not applicable (public static page). |
| Reduced motion / paused | The chips wrap statically (reduced motion) or freeze in place (paused). The pillars don't fan. |
| Light theme | Same tokens. The gradient line uses the light `--grad-accent`. |

### 2.9 Tests (B-1)
`test/about.test.mjs` is rewritten to cover:
- The built About has `.about__lead` with exactly 2 `.about__line`, the `.pillars` `ul` with `aria-label="How I work"` and 4 `li.pillar`, each with an `<svg class="icon-…">` and an `h3`.
- `.clients__list` with 12 `li`, and a second list with `aria-hidden="true"`.
- No `about__facts`, no `<dl`, and no hero stat value inside `#about`.
- Validation errors for each rule in §2.3.
- The CSS has `.clients__list--dup { display: none; }` outside the media query and `clients-drift` inside `no-preference`.

`test/content.test.mjs` assertions that reference `about.paragraphs` are updated, if any.

---

## 3. Motion foundation (B-2): vendor, loading, core module

### 3.1 Vendor files (the lead fetches them, because Codex has no network)
In the scratchpad, run `npm pack gsap@3.15.0 lenis@1.3.27`, extract, and copy:

| Source in tarball | Destination (committed) | Raw bytes |
|---|---|---|
| `package/dist/gsap.min.js` | `public/assets/vendor/gsap-3.15.0.min.js` | 72,927 |
| `package/dist/ScrollTrigger.min.js` | `public/assets/vendor/ScrollTrigger-3.15.0.min.js` | 44,575 |
| `package/dist/lenis.min.js` | `public/assets/vendor/lenis-1.3.27.min.js` | 18,815 (strip a trailing `//# sourceMappingURL=…` line if present) |
| `lenis/package/LICENSE` | `public/assets/vendor/lenis-LICENSE.txt` | MIT |
| text of https://gsap.com/standard-license (the npm package ships no LICENSE file; the min headers point to this URL) | `public/assets/vendor/gsap-LICENSE.txt` | GSAP Standard "no charge" License |

Also add `public/assets/vendor/VERSIONS.json` with `[{name, version, file, sha256}]` (sha256 of the committed file), and credits in the README ("GSAP 3.15.0, GreenSock Standard License; Lenis 1.3.27, MIT").

Budgets, enforced by `test/vendor.test.mjs`:
- Mobile/all path (gsap + ScrollTrigger): ≤ 120,000 raw and ≤ 49,152 gzip.
- Lenis: ≤ 20,000 raw and ≤ 7,168 gzip, loaded only on fine-pointer devices.

Expected totals: ~117.5 KB raw / ~47 KB gzip on mobile, and +~19 KB raw / ~6 KB gzip on desktop.

### 3.2 Loading (`head.mjs`, home page only)
After the existing `site.js` tag, emit:
```html
<script src="/assets/vendor/gsap-3.15.0.min.js" defer fetchpriority="low"></script><script src="/assets/vendor/ScrollTrigger-3.15.0.min.js" defer fetchpriority="low"></script>
```
- **The order is deliberate.** `site.js` runs first, so the existing modules (60-motion, 71-decode timing, etc.) are never delayed by vendor download. Vendor code executes before `DOMContentLoaded`.
- **The bold modules start on `DOMContentLoaded`**, or immediately if `document.readyState !== 'loading'` at that point.
- **Lenis is injected later.** At ready time, `80-bold.js` creates `<script src="/assets/vendor/lenis-1.3.27.min.js">` and appends it to `<head>`. CSP `script-src 'self'` allows it.
- **Other pages are unchanged.** 404 and `/work/*` pages get no vendor tags.

`renderHead(c, { page })`: emit the vendor tags only when `page === 'home'`. The vendor version strings are constants exported from `head.mjs` (`export const VENDOR = { gsap: '3.15.0', lenis: '1.3.27' }`). `80-bold.js` hard-codes `/assets/vendor/lenis-1.3.27.min.js`, and a test asserts that it matches `VENDOR.lenis`.

### 3.3 Pre-paint flags (`THEME_SCRIPT` in `head.mjs`; its CSP hash is recomputed at build automatically)
Append to the IIFE, after the theme logic and inside its own `try{}catch(e){}`:
```js
var p=0;try{p=localStorage.getItem('motion')==='paused'}catch(e){}if(p)d.classList.add('motion-paused');
try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&/^\/(index\.html)?$/.test(location.pathname)){d.classList.add('kinetic');if(!p&&!location.hash&&!sessionStorage.getItem('intro')){sessionStorage.setItem('intro','1');d.classList.add('intro')}}}catch(e){}
```
- `motion-paused` before paint prevents a rotator→inline-row layout shift for users who paused earlier. 60-motion adds it again idempotently.
- `kinetic` = the home page with motion allowed. CSS uses it to park the h1 words with a watchdog (§4.2).
- `intro` = the first view in this tab, with no hash and not paused. It shows the loader (§4.1). If storage throws, there is no intro.

### 3.4 Layout hooks (`layout.mjs`, `logo.mjs`, `build.mjs`)
- `renderPage(c, { …, home = false })`. `build.mjs` passes `home: true` for `index.html` only.
- When `home`, insert directly after the skip link:
```html
<div class="intro-screen" aria-hidden="true">{logoMark({ idPrefix: 'intro', className: 'intro__svg', draw: true })}</div>
<div class="tint" aria-hidden="true"><span></span><span></span><span></span></div>
```
- `logoMark({ draw: true })`:
  - adds `pathLength="1"` to each of the 5 `<path>` elements and `width="120" height="130"` on the `<svg>` (a safe size if CSS fails);
  - omits the sheen `<g clip-path>` group and its `clipPath`/`sheen` defs;
  - keeps the gradient def.
- Default CSS lives in `45-bold.css`, owned by B-2, so nothing shows before B-3/B-5 land:
```css
.intro-screen, .tint { display: none; }
```

### 3.5 `src/scripts/80-bold.js` (≤ 4,600 bytes): the core and its shared API
Behaviour, in order:
1. Wait for `DOMContentLoaded` (or run at once). Then `const g = window.gsap, ST = window.ScrollTrigger, e = document.documentElement;` and return if `!g || !ST || !e.classList.contains('motion')`. 60-motion has already decided reduced motion and IntersectionObserver support.
2. `g.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); g.defaults({ overwrite: 'auto' });`
3. Expose `window.TPCT_BOLD`:

| Member | Contract |
|---|---|
| `g`, `ST` | The gsap and ScrollTrigger globals. |
| `mm` | One shared `g.matchMedia()`. All bold contexts register on it, so OS reduced-motion changes and breakpoint changes revert them automatically. |
| `Q` | `{ motion: '(prefers-reduced-motion: no-preference)', desk: '(min-width: 1024px) and (min-height: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', rail: '(min-width: 1024px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)' }` |
| `now(fn)` | Calls `fn(B)` synchronously. Used by the kinetic entrance. |
| `ready(fn)` | Queues `fn(B)`. The queue flushes after `load` plus `requestIdleCallback(…, { timeout: 1200 })` (fallback `setTimeout(…, 300)`). Each `fn` runs in its own task (`setTimeout(next, 0)` between them) so that no single task exceeds 50ms. The first task adds `html.bold`. The final task calls `ST.sort(); ST.refresh();`. A `fn` registered after the flush runs on the next task. |
| `headerH()` | `document.querySelector('.site-header')?.offsetHeight ?? 76` |
| `refresh()` | Debounced (150ms) `ST.refresh()`. |
| `lenis()` | The current Lenis instance or `null`. |
| `paused()` | `e.classList.contains('motion-paused')` |

4. **Lenis** (inside `ready`, only when `matchMedia('(hover: hover) and (pointer: fine)').matches` and not paused): inject the script once. On load, `start()`:
```js
L = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, wheelMultiplier: 1, autoRaf: false, prevent: n => n.closest('[data-lenis-prevent]') });
L.on('scroll', ST.update); tick = t => L.raf(t * 1000); g.ticker.add(tick); g.ticker.lagSmoothing(0);
```
   `stop()` runs `g.ticker.remove(tick); L.destroy(); L = null;`. Native scrolling continues from the same position.
5. **Anchors** (only while Lenis is active). A delegated `document` click listener for `a[href^="#"]`. If the target exists:
   - call `preventDefault()`;
   - call `L.scrollTo(target, { offset: -(B.headerH() + 16), duration: 1.0, easing: t => 1 - Math.pow(1 - t, 4) })`;
   - call `history.pushState(null, '', '#' + id)`.

   20-nav's existing listener still focuses the target with `preventScroll`. The skip link `#main` follows the same path.
6. **Pause.** A `MutationObserver` on `<html>` watches `class`. On `motion-paused` it calls `stop()`. On its removal it calls `start()` again (fine pointer only). Scroll-linked triggers are not paused (see F5).
7. **Refresh hooks:** `document.fonts?.ready.then(B.refresh)`, and a `toggle` listener on `details.career__more` that calls `B.refresh`.
8. **Print:** on `beforeprint`, call `B.mm.revert()` and `stop()`. The page prints its static layout, and it stays static after printing (rare; acceptable).

`src/styles/46-lenis.css`:
- The Lenis 1.3.27 `dist/lenis.css` rules, verbatim, with an "MIT, darkroom.engineering" comment.
- Plus `html.lenis.lenis-smooth { scroll-behavior: auto !important; }`. The base sets `scroll-behavior: smooth`, which fights Lenis.

### 3.6 Coexistence: what GSAP replaces and what stays
| Existing behaviour | Fate |
|---|---|
| `60-motion` `[data-reveal]` reveal + watchdog, header `is-scrolled`, count-up, motion toggle, logo replay | **Stays.** Two exceptions under `html.bold`: `.section-head` and `.about__lead` reveals are neutralised (B-5 owns the line reveal), and on desktop `.pillars` (B-4 fan) and `.process` (B-4 pin) are neutralised. |
| `40-hero.css` h1 `word-up` | **Replaced** by the kinetic letters when GSAP is ready. Otherwise it is kept as a delayed CSS fallback (watchdog). |
| `40-hero.css` roles `rise` per `li` | **Replaced** by the CSS rotator (B-3). |
| `40-hero.css` other entrance items (eyebrow, headline, sub, CTAs, schematic, stats) | **Stay on CSS**, offset by `--intro-offset`. The sub stays CSS because it is the LCP candidate. |
| `43-hero-wow.css` `hero-exit` (scroll-driven) | **Replaced** under `.bold` by the GSAP `--sy` depth scrub. It is kept when GSAP is absent. |
| `43-hero-wow.css` `--shift` hover, `61-pointer` `--px/--py` | **Stay.** The new depth composes with them through separate `translate`/`scale` properties. |
| `70-field` constellation, `71-decode`, `72-spot`, `62-spine`, `73-timeline`, `50-scrollspy`, `20-nav`, `56-marquee` | **Stay unchanged.** They listen to native `scroll`, and Lenis scrolls the window natively, so they keep working. |
| `30-filter` | **Stays.** B-4 adds its own click listener to refresh the rail after a filter swap. |
| `50-sections.css` process line draw (`is-pending`) | **Stays on mobile.** Replaced by the pinned story at `Q.desk`. |

### 3.7 Tests (B-2)
- **`test/vendor.test.mjs`:**
  - files exist in `public/assets/vendor/`;
  - sha256 equals `VERSIONS.json`;
  - raw and gzip caps (§3.1);
  - no `sourceMappingURL`;
  - the licence files exist and are non-empty;
  - `lenis-1.3.27.min.js` contains `Lenis`.
- **`test/bold-core.test.mjs`:**
  - home `index.html` has `site.js` and then both vendor tags with `defer fetchpriority="low"`, in that order;
  - `404.html` and one `/work/*` page contain no `/assets/vendor/`;
  - `THEME_SCRIPT` includes `kinetic`, `intro`, `sessionStorage` and `motion-paused`, and there is still exactly one inline script;
  - home has `.intro-screen[aria-hidden="true"]` with 5 `pathLength="1"` and no `sc-sheen`, plus `.tint` with 3 spans;
  - other pages have neither;
  - `80-bold.js` ≤ 4,600 bytes and contains `/assets/vendor/lenis-${VENDOR.lenis}.min.js`;
  - CSS has `.intro-screen, .tint { display: none; }` and `lenis-smooth`;
  - vm smoke test: the stub without `gsap` doesn't throw and leaves `TPCT_BOLD` undefined.
- **Cap raises (B-2 owns them):**
  - `test/scripts.test.mjs` `site.js` cap 26,392 → **39,704**;
  - `test/projects.test.mjs` `< 30000` → `<= 39704`;
  - `test/sections.test.mjs` CSS caps 81,920/18,432 → **94,208/21,504**.

---

## 4. Hero: intro, kinetic name, rotator, depth (B-3)

### 4.1 Intro loader: CSS only, never blocks (`src/styles/44-intro.css`)
```css
:root { --intro-offset: 0ms; }
.intro { --intro-offset: 700ms; }
@media (prefers-reduced-motion: no-preference) {
  .intro .intro-screen { display: grid; place-items: center; position: fixed; inset: 0; z-index: 90; pointer-events: none;
    background-color: var(--canvas); background-image: var(--field);
    animation: intro-out 300ms var(--ease-in-out) 700ms both; }
  .intro .intro__svg { width: clamp(88px, 14vw, 132px); height: auto; overflow: visible; animation: intro-lift 300ms var(--ease-in-out) 700ms both; }
  .intro .intro__svg path { fill-opacity: 0; stroke: var(--brand); stroke-width: 5; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1;
    animation: intro-draw 520ms var(--ease-in-out) var(--d, 0ms) both, intro-fill 260ms var(--ease-out) 460ms both; }
  .intro .sc-part--hook-bottom path { --d: 80ms; }
  .intro .sc-part--lt path { --d: 200ms; }
  .intro .sc-part--slash path { --d: 260ms; }
  .intro .sc-part--gt path { --d: 320ms; }
  @keyframes intro-draw { to { stroke-dashoffset: 0; } }
  @keyframes intro-fill { to { fill-opacity: 1; stroke-opacity: 0; } }
  @keyframes intro-lift { to { transform: translateY(-28px) scale(.86); opacity: 0; } }
  @keyframes intro-out { to { clip-path: inset(0 0 100% 0); visibility: hidden; } }
}
@media print, (forced-colors: active) { .intro-screen { display: none !important; } }
```
- **Total 1,000ms. It never waits on the network**, because it is pure CSS on a fixed timeline.
- `pointer-events:none` means clicks pass through. `z-index: 90` sits under `.skip` (100), so the skip link is usable during the intro. It sits over the header (50).
- Hero content underneath is painted from first paint (LCP is unaffected). The sub keeps its `opacity:.001` start.
- **Crawlers and no-JS never see it**, because `.intro` is JS-set.
- **Repeat visits skip it** through `sessionStorage`. So do deep links, paused users and reduced motion.

### 4.2 Hero CSS offsets and the kinetic watchdog (`40-hero.css` edits)
- Every `animation` delay in the `.js` hero entrance block (lines 81–98) becomes `calc(<old>ms + var(--intro-offset))`. Example: `.js .hero .eyebrow { animation: rise 900ms var(--ease-rise) calc(60ms + var(--intro-offset)); … }`.
- The h1 word rules also add `+ var(--kinetic-wait)`. Define `:root { --kinetic-wait: 0ms; } .kinetic { --kinetic-wait: 1600ms; }`. This parks the words below their mask (the `word-up` from-keyframe through fill `both`) for 1.6s. **If GSAP never arrives, the old CSS word-up plays automatically** (the watchdog).
- Add `.hero h1.is-kinetic .w > span { animation: none; }`. GSAP takes control.
- The roles `li` `rise` rules (lines 89, 91, 93, 95) are removed and replaced by the rotator (§4.4) plus `.js .roles { animation: rise 800ms var(--ease-rise) calc(380ms + var(--intro-offset)) both; }`.

### 4.3 Kinetic name: `src/scripts/81-kinetic.js` (≤ 2,400 bytes)
Uses `TPCT_BOLD.now()` at DOMContentLoaded.
1. Return if there is no `B`, no `html.kinetic`, or no `.hero h1`. **Bail-out:** return if `performance.now() > 1400 + (html.intro ? 700 : 0)`, so the CSS watchdog stays in charge and nothing double-animates.
2. **Split, synchronously, in one task:**
   - set `h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim())`;
   - for each `.w > span`, store its text, then `replaceChildren()` with one `<span class="ch" aria-hidden="true">` per character, built with `createElement` and `textContent` only;
   - for the accent word, set `--ww` (word width, px number) on its `span` and `--cx` (`ch.offsetLeft`, px number) on each `.ch`, so the gradient stays continuous across letters (CSS below);
   - add `h1.classList.add('is-kinetic')`.
3. **Timeline:**
```js
const delay = Math.max(0, (e.classList.contains('intro') ? 0.72 : 0.10) - performance.now() / 1000);
g.timeline({ delay, onComplete: revert })
 .from(chars, { yPercent: 118, rotationX: -88, opacity: 0.001, transformOrigin: '50% 100% -12px',
               duration: 1.0, ease: 'expo.out', stagger: { each: 0.034 } });
```
4. **`revert()`:** restore each span's text (`span.textContent = stored`), remove `--ww`/`--cx`, and remove `aria-label`. **Keep `is-kinetic`**: removing it would restart the CSS `word-up`. After the revert, the existing name-flow gradient animation (42-type) works on the original span. Also call `revert` on `beforeprint` and when `motion-paused` is added mid-flight (`tl.progress(1)`).

CSS for the split (in `44-intro.css`):
```css
.hero h1.is-kinetic .w { perspective: 640px; }
.hero h1.is-kinetic .w > span { display: inline-block; }
.hero h1.is-kinetic .ch { display: inline-block; will-change: transform; }
.hero h1.is-kinetic .w--accent > span { background: none; }
.hero h1.is-kinetic .w--accent .ch { background-image: var(--grad-name); background-size: calc(var(--ww) * 1px) 100%; background-position: calc(var(--cx) * -1px) 0;
  -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
```
`will-change` exists only while the split exists, because the revert removes the `.ch` nodes.

**Depth scrub** (also in `81-kinetic.js`, registered with `B.ready`; all widths):
```js
g.to(scHero, { '--sy': 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
```

### 4.4 Roles rotator and S-mark depth (`44-intro.css` and `43-hero-wow.css` edits)
Rotator (CSS only, so it works without GSAP; pausable; no JS measuring):
```css
:root { --roles-start: calc(2.4s + var(--intro-offset)); }
@media (prefers-reduced-motion: no-preference) {
  @keyframes role-cycle {
    0%, 26%   { opacity: 1; transform: none; }
    30%, 96%  { opacity: 0; transform: translateY(-70%) rotateX(75deg); }
    96.01%    { opacity: 0; transform: translateY(70%) rotateX(-75deg); }
    100%      { opacity: 1; transform: none; }
  }
  .js .roles { display: grid; perspective: 600px; }
  .js .roles li { grid-area: 1 / 1; color: var(--fg); backface-visibility: hidden; transform-origin: 50% 50% -.4em;
    animation: role-cycle 9s var(--ease-in-out) infinite both; }
  .js .roles li:nth-child(1) { animation-delay: var(--roles-start); }
  .js .roles li:nth-child(2) { animation-delay: calc(var(--roles-start) - 6s); }
  .js .roles li:nth-child(3) { animation-delay: calc(var(--roles-start) - 3s); }
  .js .roles li + li::before { content: none; }
  .js .roles:hover li { animation-play-state: paused; }
  .motion-paused .roles { display: flex; }
  .motion-paused .roles li { grid-area: auto; animation: none; color: var(--fg2); }
  .motion-paused .roles li:first-child { color: var(--fg); }
  .motion-paused .roles li + li::before { content: "·" / ""; }
}
```
- The roles show the first one immediately, hold 2.34s each, and cross-flip.
- The grid cell sizes itself to the longest role, so there is no CLS.
- All 3 `li` stay in the accessibility tree (opacity only), so screen readers read all roles.
- The rotator assumes 3 roles. With 4+ roles, add `nth-child(4)` with a 12s cycle (documented only; the content has 3).

S-mark depth (`43-hero-wow.css`):
```css
.sc-hero { --sy: 0; }
.sc-hero__shard { translate: calc(var(--px) * var(--z) * 22px) calc(var(--py) * var(--z) * 22px - var(--sy) * var(--z) * 320px); }
.sc-hero__halo  { translate: calc(var(--px) * -6px) calc(var(--py) * -6px); }
.bold .sc-hero { animation: none; scale: calc(1 - var(--sy) * .18); opacity: calc(1 - var(--sy) * .75); }
.bold .sc-hero__mark { translate: 0 calc(var(--sy) * -90px); }
.bold .sc-hero__halo { scale: calc(1 + var(--sy) * .3); }
```
- The shards already have `--z` (.6 / 1 / .4), so the nearer shards move further with both pointer and scroll.
- `translate` and `scale` compose with the existing `transform` keyframes (`shard-float`, the mark's rotateX/Y).
- `--px`/`--py` are only non-zero on fine pointers (61-pointer). `--sy` is only animated under `.bold`.

### 4.5 States (hero)
| State | Behaviour |
|---|---|
| First visit, GSAP on time | Intro → letters rise at 0.72s → rotator from ~3.1s. |
| GSAP late (> 1.4s+offset) or failed | The CSS watchdog: words rise at 1.6s+offset+their old delay. No double animation. |
| Repeat / deep link | No intro. Letters at 0.10s. |
| Paused (pre-set) | No intro. Kinetic plays (one-shot, same as today). Roles are the inline row. Shards keep the scroll depth. |
| Reduced motion / no JS | Today's static hero. Inline roles. |
| Long content | The name wraps per word (existing `max-width:10ch`), and letters wrap with their word. Long roles: the grid cell grows; below 400px roles may wrap to 2 lines inside the cell. |
| Error / empty / disabled / permission-denied | Not applicable. |

### 4.6 Tests (B-3), `test/bold-hero.test.mjs`
- CSS includes `--intro-offset`, `--kinetic-wait: 1600ms`, `.is-kinetic .w > span { animation: none; }`, and `role-cycle`, `intro-draw` and `intro-out` inside `no-preference`.
- Every hero entrance delay in `40-hero.css` uses `var(--intro-offset)`.
- `81-kinetic.js` ≤ 2,400 bytes, passes the CSP regex, and contains `aria-label`, `is-kinetic` and `expo.out`.
- The built h1 is unchanged (plain words, no `.ch`), so no-JS output is the same.

---

## 5. Atmosphere: colour morphs and split-line headings (B-5)

### 5.1 Section colour morphs (`src/scripts/83-atmos.js` ≤ 2,400 bytes; `src/styles/48-atmos.css`)
CSS:
```css
:root, [data-theme="dark"] { --tint-c: rgb(90 31 224 / .32); }
[data-theme="light"] { --tint-c: rgb(90 31 224 / .14); }
@media (prefers-reduced-motion: no-preference) {
  .bold .tint { display: block; position: fixed; inset: 0; z-index: 0; pointer-events: none; }
  .bold .tint > span { position: absolute; inset: 0; }
  .bold .tint > span:nth-child(1) { opacity: var(--m1, 0); background: radial-gradient(ellipse 70% 55% at 85% 15%, var(--glow-b), transparent 70%); }
  .bold .tint > span:nth-child(2) { opacity: var(--m2, 0); background: radial-gradient(ellipse 65% 60% at 8% 65%, var(--glow-a), transparent 70%); }
  .bold .tint > span:nth-child(3) { opacity: var(--m3, 0); background: radial-gradient(ellipse 90% 50% at 50% 110%, var(--tint-c), transparent 70%); }
}
@media print, (forced-colors: active) { .tint { display: none !important; } }
```
The tint layer sits behind `main` (z 1) and in front of the `body::before/after` blobs (z −1). The vars are set on `.tint` only, so a change restyles 4 nodes, and opacity is compositor-friendly.

JS (`B.ready`, all widths): one ScrollTrigger per section.
```js
ST.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => s.isActive && mood(id) })
// mood → g.to(tint, { '--m1': a, '--m2': b, '--m3': c, duration: 0.9, ease: 'power2.inOut', overwrite: true })
```

| Sections | m1 (indigo, top-right) | m2 (violet, left) | m3 (deep violet, bottom) |
|---|---|---|---|
| `top`, `about` | 0 | 0 | 0 |
| `experience`, `timeline` | 1 | .25 | 0 |
| `skills`, `work` | .2 | 1 | 0 |
| `services`, `process` | .6 | .55 | .35 |
| `contact` | .45 | .8 | 1 |

### 5.2 Split-line heading reveals (also in `83-atmos.js`; all widths)
- **Targets:** every `.section-head h2`, plus `#about .about__line > span` (pre-split by markup). Split only those whose `getBoundingClientRect().top > innerHeight * 0.9` at ready time. Headings above the fold stay untouched.
- **h2 split:**
  1. Read the text (h2s are plain text).
  2. Wrap each word in a temporary span, with real space text nodes between them.
  3. Group the words by `offsetTop`.
  4. `replaceChildren()` with one `<span class="ln"><span class="ln__in">word word </span></span>` per line, keeping the trailing space inside the line so `textContent` is unchanged.
  5. `g.set(inners, { yPercent: 110 })`.
- **Reveal:** `ST.create({ trigger: h2, start: 'top 88%', once: true, onEnter: () => g.to(inners, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, onComplete: () => { h2.textContent = original; } }) })`.
- **About lines:** the same trigger on `.about__lead`, with `stagger: 0.1`. No split is needed (the markup already has masks).
- **Resize before reveal:** on a debounced (200ms) width change, unrevealed headings revert and re-split. On `beforeprint`, revert all.
- **CSS:**
```css
.ln { display: block; overflow: hidden; overflow: clip; padding-block-end: .1em; margin-block-end: -.1em; }
.ln__in { display: inline-block; }
.bold .section-head[data-reveal].is-pending, .bold .about__lead[data-reveal].is-pending { opacity: 1; translate: none; scale: none; }
```
  This avoids double motion: the index pill keeps its 71-decode, and the chapter node keeps `is-lit`.

### 5.3 Tests (B-5), `test/bold-atmos.test.mjs`
- CSS: `.bold .tint` inside `no-preference`; `--tint-c` defined in both themes; the `.ln` rules; the neutraliser selector.
- `83-atmos.js` ≤ 2,400 bytes, passes the CSP regex, and references all 9 section ids. The mood table equals §5.1.

---

## 6. Story: process pin, Work rail, pillar fan (B-4) (`src/scripts/82-story.js` ≤ 3,800 bytes; `src/styles/47-story.css`)
All three register in this order through `B.ready` and `B.mm.add(...)`, so ScrollTrigger creates triggers in DOM order: pillars, then rail, then process. Each `mm` callback returns a cleanup that removes every class and node it added.

### 6.1 Pillar fan (`Q.desk`)
```js
html.classList.add('story');
g.fromTo('.pillar', { y: i => 90 + i * 40, rotation: i => (i - 1.5) * 4, transformOrigin: '50% 100%' },
  { y: 0, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.pillars', start: 'top 92%', end: 'top 50%', scrub: 0.6 } });
```
The cards are always opaque (transform only, no opacity scrub), so text contrast never drops. CSS: `.story .pillars[data-reveal].is-pending { opacity: 1; translate: none; scale: none; }`.

### 6.2 Process pinned story (`Q.desk`)
- **Setup:**
  - `list.classList.remove('is-pending', 'is-revealing'); list.classList.add('process--story');`
  - append a ticker to `#process > .container`, built with `createElement`/`textContent`: `<div class="process__ticker" aria-hidden="true"><div class="process__ticker-in"><span>01</span>…<span>05</span></div></div>`.
- **Pin:** a proxy `{ p: 0 }` tween to `p: 1`, `ease: 'none'`, with `scrollTrigger: { trigger: '#process', pin: true, start: () => 'center ' + Math.round((innerHeight + B.headerH()) / 2), end: () => '+=' + Math.round(innerHeight * 1.2), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }`. `onUpdate` runs `apply(proxy.p)`.
- **`apply(p)`:**
  - `list.style.setProperty('--pp', Math.min(1, p / 0.8).toFixed(4))`;
  - `idx = Math.min(4, Math.floor(p / 0.2 + 1e-6))`;
  - when `idx` changes, toggle `is-on` (i ≤ idx) and `is-current` (i === idx) on the `li`s, and run `g.to(tickerIn, { yPercent: -20 * idx, duration: 0.6, ease: 'expo.out' })`.
  - The last 20% of the pin holds with everything lit (a reading pause).
- **Wireframe (pinned, desktop):**
```
07 / PROCESS                                          ╔═╗╔╗    (outline counter 01→05,
Process                                               ║ ║ ║     text-stroke, rolls up)
 (01)━━━━━━(02)━━━━━━(03)┄┄┄┄┄┄(04)┄┄┄┄┄┄(05)
Discover    Model    [Architect]  Ship     Evolve     ← current pill = primary skin + glow, scale 1.14
fg/fg2      fg/fg2    fg/fg2      muted    muted      ← not reached = --muted text
```
- **CSS** (inside `@media (min-width:1024px) and (prefers-reduced-motion: no-preference)`):
```css
html .process.process--story::after { scale: var(--pp, 0) 1; transition: none; }
.process--story > li { translate: 0 10px; transition: translate var(--dur-3) var(--ease-rise); }
.process--story > li.is-on { translate: none; }
html .process.process--story > li::before { scale: 1; opacity: 1; transition: scale var(--dur-3) var(--ease-spring), background var(--dur-2); transition-delay: 0s; }
.process--story > li:last-child::before { background: var(--surface); color: var(--brand); border-color: var(--rim); box-shadow: var(--shadow-card); }
.process--story > li.is-on::before { background: var(--nav-sel); }
html .process--story > li.is-current::before { background: var(--primary-skin); color: var(--on-primary); border-color: transparent; box-shadow: var(--primary-shadow), var(--primary-glow); scale: 1.14; }
.process--story h3, .process--story p { color: var(--muted); transition: color var(--dur-2) var(--ease-out); }
.process--story .is-on h3 { color: var(--fg); } .process--story .is-on p { color: var(--fg2); }
#process > .container { position: relative; }
.process__ticker { position: absolute; inset-block-start: 0; inset-inline-end: 0; height: 1em; overflow: hidden; overflow: clip; pointer-events: none;
  font: 800 clamp(6rem, 4rem + 6vw, 10rem)/1 var(--font-display); letter-spacing: -.04em; color: transparent; -webkit-text-stroke: 1px var(--border-strong); }
.process__ticker-in > span { display: block; height: 1em; }
```
  Outside that media query: `.process__ticker { display: none; }`.

### 6.3 Work horizontal rail (`Q.rail`)
- **Setup:**
  - create `div.work-rail`, insert it before `#project-list` and move the list into it;
  - append `<div class="work-rail__bar" aria-hidden="true"><span></span></div>`;
  - add `#work.classList.add('rail-on')`.
- **Fit check:** if `list.offsetHeight > innerHeight - B.headerH() - 96`, undo the setup and return (fall back to the grid).
- **Distance:** `dist = () => Math.max(0, list.offsetWidth - (rail.clientWidth - padStart - padEnd))`, where `padStart` and `padEnd` are the rail's computed inline paddings.
- **Tween:** `g.to(list, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: rail, pin: true, start: () => 'center ' + Math.round((innerHeight + B.headerH()) / 2), end: () => '+=' + Math.max(1, dist()), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: s => bar.style.setProperty('--rp', s.progress.toFixed(4)) } })`. Vertical scroll maps 1:1 to horizontal travel.
- **Filters still work:**
  - a click on `#work .filters .chip` or `.projects-empty button` calls `setTimeout(B.refresh, 650)` (after 30-filter's 160ms leave + 420ms FLIP);
  - the cards are the same nodes, `hidden` toggles them, and the FLIP runs on the cards (not the list), so it composes with the list's `x`;
  - an empty result leaves the list `hidden`, `dist()` = 0 and the pin ≈ 1px. The existing empty state (with its reset button) shows below.
- **Keyboard:** `list` `focusin` → `card = e.target.closest('.card')`.
  - If `card` is not fully inside `[padStart, innerWidth - padEnd]`, compute `y = st.start + Math.min(1, card.offsetLeft / dist()) * (st.end - st.start)`.
  - Scroll with `B.lenis() ? B.lenis().scrollTo(y, { immediate: true }) : scrollTo(0, y)`, then call `ST.update()`.
  - Focus never lands offscreen (WCAG 2.4.7).
- **Card reveal:** 60-motion's IntersectionObserver reveals cards as they slide in from the right (IO honours transforms). No GSAP is needed for this.
- **CSS** (inside `@media (min-width:1024px) and (prefers-reduced-motion: no-preference)`):
```css
.rail-on .work-rail { margin-inline: calc(50% - 50vw); padding-inline: max(var(--gutter), (100vw - var(--container)) / 2); padding-block: 24px 40px; overflow: hidden; overflow: clip; }
.rail-on .projects { display: flex; flex-wrap: nowrap; width: max-content; gap: 24px; align-items: stretch; position: relative; }
.rail-on .projects > .card { flex: 0 0 clamp(320px, 30vw, 400px); }
.rail-on .work-rail__bar { position: absolute; inset-inline: max(var(--gutter), (100vw - var(--container)) / 2); inset-block-end: 12px; height: 2px; background: var(--brand-line); border-radius: 2px; }
.rail-on .work-rail__bar > span { display: block; height: 100%; background: linear-gradient(90deg, var(--logo-a), var(--cyan)); transform-origin: left; scale: var(--rp, 0) 1; }
.work-rail { position: relative; }
.work-rail__bar { display: none; }
main > .pin-spacer { margin-block-start: var(--section-gap); }
main > .pin-spacer + section { margin-block-start: var(--section-gap); }
```
  The last two rules keep the section rhythm when ScrollTrigger wraps `#process` in a spacer, because the `section + section` adjacency breaks. QA checks that `#process` and `#contact` don't jump when the pin is created.
- **Wireframe (pinned, desktop):**
```
[header pill]
  ┌────────┐┌────────┐┌────────┐┌────────┐┌──     ← cards slide left as you scroll down
  │ card 1 ││ card 2 ││ card 3 ││ card 4 ││ c
  └────────┘└────────┘└────────┘└────────┘└──
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   progress bar (--rp)
```

### 6.4 States (story)
| State | Behaviour |
|---|---|
| Desktop default | As specified. |
| Window too short (< 640/720px) or a card too tall | No pin and no rail. Grid and normal reveals. |
| Resize across 1024 | `mm` reverts: classes, the wrapper, the ticker and inline transforms are removed and the grid returns. Back above 1024, it is rebuilt. |
| Filter → empty | The rail is ~0 length and the empty state with its reset button shows. Reset rebuilds the length after 650ms. |
| Earlier-roles `<details>` toggled, fonts load | `B.refresh` recomputes the pin positions. |
| Paused | Pins and the rail stay scroll-linked. Lenis is off. |
| Reduced motion / mobile / touch | The existing grid and the existing process line draw. |
| No JS | Static grid and process. The ticker and bar don't exist (they are JS-created). |
| Long content | Very tall cards trigger the fit check fallback. A long process `p` wraps within its column. |

### 6.5 Tests (B-4), `test/bold-story.test.mjs`
- `82-story.js` ≤ 3,800 bytes, passes the CSP regex, contains `pin: true`, `focusin`, `.chip` and `invalidateOnRefresh`, and uses no `innerHTML`.
- CSS: `.rail-on .projects` with `flex-wrap: nowrap` inside the 1024 + `no-preference` query; `.process__ticker { display: none; }` outside it; the `main > .pin-spacer` rules.
- The built `#work` HTML is unchanged (no `.work-rail` in static markup).

---

## 7. Design tokens used (no new hues, fonts or radii)
| Need | Token |
|---|---|
| Display type | `--font-display` (Outfit): about lead, pillar h3, company chips, process ticker |
| Body | `--font-sans`, `--fs-small`, `--fs-label`, `--tracking-label` |
| Plates | `--plate`, `--rim`, `--shadow-card`, `--shadow-lift`, `--r-plate`, `--r-pill` |
| Icon tile | `--nav-sel` + `--brand` (rest), `--primary-skin` + `--on-primary` (hover / current step) |
| Text | `--fg`, `--fg2`, `--muted` |
| Gradients | `--grad-accent` (lead line 2), `--grad-name` (kinetic letters), `--logo-a` → `--cyan` (rail bar, same as the spine) |
| Light | `--glow-a`, `--glow-b`, new `--tint-c` (= `--logo-c` with alpha) |
| Motion | `--ease-rise` ≈ GSAP `expo.out`, `--ease-in-out` ≈ `power2.inOut`, `--ease-spring`, `--dur-2/3` |
| Spacing | `--space-3..7`, `--section-gap`, `--gutter`, `--container` |

GSAP eases map to the existing curves: entrances use `expo.out`, morphs `power2.inOut`, scrubs `none`. No bounce or elastic.

## 8. Responsive and RTL
| Effect | < 768 | 768–1023 | ≥ 1024, fine pointer, h ≥ 640/720 |
|---|---|---|---|
| Intro, kinetic name, rotator | on | on | on |
| S-mark scroll depth | on | on | on (+ pointer depth) |
| Lenis | off (native) | fine pointer only | on |
| Colour morphs, heading reveals | on | on | on |
| Pillars | 1 col, container reveal | 2 cols, reveal | auto-fit 4 cols, scrubbed fan |
| Process | existing vertical line draw | existing | pinned story + ticker |
| Work | grid 1 col | grid 2 cols | horizontal pinned rail (grid fallback if it doesn't fit) |
| Company rail | drifting marquee | same | same |

RTL: the site is `lang="en"` only. New CSS uses logical properties. The rail's `x` direction, the bar's `transform-origin` and the marquee direction are physical by design. Under `[dir="rtl"]` the rail would need `x: +dist` and `transform-origin: right`. This is noted but out of scope.

## 9. Accessibility (WCAG 2.1 AA)
- **1.3.1 / 4.1.2**
  - Pillars are a `ul[aria-label]` of `li > h3 + p`, so h2 → h3 is kept.
  - The companies list is labelled by the visible "Worked with"; the duplicate is `aria-hidden`.
  - The h1 `aria-label` exists only while the letters are split, and the letters are `aria-hidden`.
  - The split h2 keeps its `textContent`.
  - The intro, tint, ticker and rail bar are `aria-hidden`.
- **1.4.3 contrast**
  - Inactive process text uses `--muted`: dark #ABA1CC on #110D1F ≈ 7.6:1; light #5A5275 on #EEEBFA ≈ 6.9:1. Opacity is never used to dim text.
  - Pillar text fg2 on plate and chips fg2 on surface-soft reuse approved pairs.
  - The lead's gradient line is large text (≥ 28px bold) and passes 3:1 at every stop in both themes.
  - The tint layers add at most a `--glow-a` 0.45 wash. QA re-runs axe in both themes with Contact (the brightest mood) in view.
- **2.2.2 Pause, Stop, Hide**
  - The rotator and the company rail run longer than 5s. Both stop with the hero pause toggle, and both pause on hover.
  - Lenis smoothing turns off with the toggle.
  - Pins and scrubs only move when the user scrolls.
- **2.3.3 / reduced motion:** everything in this round is off under `reduce`. `mm` reverts live if the OS setting changes.
- **2.4.3 / 2.4.7 focus**
  - DOM order is unchanged and nothing is focus-trapped.
  - Rail cards scroll into view on focus.
  - The skip link (z 100) sits above the intro (z 90).
  - Anchor navigation still focuses the section.
- **2.5.5-style targets:** no new interactive elements. The chips and pillars are static.
- **Forced colours / print:** the intro, tint and duplicate list are hidden; plates get CanvasText borders; print reverts all bold effects.

## 10. Performance gate (reviewer, at the merge of B-4/B-5)
- **Lighthouse mobile on `/`**, first visit with a fresh profile (so the intro is on): Perf ≥ 90, CLS ≤ 0.05, A11y ≥ 95. Also desktop Perf ≥ 90.
- **DevTools:**
  - no long task > 50ms from the `ready` queue;
  - 60fps through the rail and the process pin at 4× CPU throttle;
  - no `securitypolicyviolation` events in the console during pin create, revert and resize across 1024. This verifies that GSAP and ScrollTrigger only write styles through CSSOM. If any path calls `setAttribute('style')`, report it as a blocker.
- **If Perf < 90**, apply in this order:
  1. shorten the intro to 700ms (`intro-out` at 450ms, `--intro-offset: 450ms`);
  2. skip the intro below 768px;
  3. move the vendor tags from `defer` to injection after `load` (the kinetic name then usually falls back to the CSS watchdog on the first visit).

## 11. Tickets, file ownership and run order
| Ticket | Size | Owns (only these files) | Depends on |
|---|---|---|---|
| **B-1** About rewrite | S | `src/content.json` (`about` only), `src/lib/validate.mjs`, `src/render/sections.mjs` (`renderAbout` only), `src/lib/icons.mjs`, `src/styles/50-sections.css` (about rules removed), `src/styles/51-about.css` (new), `test/about.test.mjs`, `test/content.test.mjs` (only if it references removed keys) | none |
| **B-2** Motion foundation | M | `public/assets/vendor/*` (the lead drops the files in first), `README.md` (credits), `src/render/head.mjs`, `src/render/layout.mjs`, `src/lib/logo.mjs`, `scripts/build.mjs` (`home: true`), `src/scripts/80-bold.js`, `src/styles/45-bold.css`, `src/styles/46-lenis.css`, `test/vendor.test.mjs`, `test/bold-core.test.mjs`, the cap lines in `test/scripts.test.mjs`, `test/projects.test.mjs` and `test/sections.test.mjs` | Lead vendors the files (§3.1) |
| **B-3** Hero: intro, kinetic, rotator, depth | M | `src/styles/40-hero.css`, `src/styles/43-hero-wow.css`, `src/styles/44-intro.css` (new), `src/scripts/81-kinetic.js` (new), `test/bold-hero.test.mjs` | B-2 |
| **B-4** Story: pillars fan, process pin, Work rail | M | `src/scripts/82-story.js` (new), `src/styles/47-story.css` (new), `test/bold-story.test.mjs` | B-2, B-1 (`.pillars`) |
| **B-5** Atmosphere: colour morphs + split-line headings | S | `src/scripts/83-atmos.js` (new), `src/styles/48-atmos.css` (new), `test/bold-atmos.test.mjs` | B-2 (B-1 only for the `.about__line` targets; the selector no-ops without it) |

**Run order (max 2 at once):** Round 1: **B-2 ∥ B-1** (disjoint files; merge B-2 first because it raises the CSS cap B-1 may need). Round 2: **B-3 ∥ B-5**. Round 3: **B-4** alone, because it is pin-heavy and needs B-1. Then the §10 gate.

Each ticket runs only its own test file, plus `test/scripts.test.mjs`, `test/build.test.mjs`, `npm run build` and `npm run check:confidential`. The lead runs the full suite and the Lighthouse/eyes-on gate once at the end.

---

## Assumptions (decided by the designer; to be logged in STATUS.md by the lead)
1. **Versions.** GSAP is pinned to **3.15.0** (npm `latest` on 2026-10-21; Standard "no charge" licence, which allows a public portfolio) and Lenis to **1.3.27** (MIT). The coordinator's floor was 3.12.5 / Lenis 1.x.
2. **Budget.** The vendor budget slightly exceeds the "~120 KB / ~45 KB gzip" ask: ~117.5 KB raw / ~47 KB gzip on mobile, plus ~19 KB / ~6 KB Lenis on fine pointers only. The test caps are 120,000/49,152 and 20,000/7,168. Reduced-motion visitors still download gsap+ScrollTrigger (they are cached, and executed but not initialised). This keeps the simple `defer` loading the coordinator asked for.
3. **No SplitText.** We split ourselves: the h1 into letters (reverted after the entrance) and the h2s into lines (reverted after the reveal). Static HTML is unchanged for crawlers and no-JS users.
4. **The intro is CSS-only** (1.0s), so it can never block content or wait on the network. It is skipped on repeat views in the same tab, on deep links (hash), when paused and under reduced motion.
5. **The kinetic name has a CSS watchdog** (`--kinetic-wait: 1600ms`). If GSAP is late, the existing word-up plays and GSAP bails, so the name never animates twice.
6. **The roles rotator is CSS** (3 items, 9s cycle), not GSAP. It needs no JS measuring, so there is no CLS and it works if GSAP fails. When paused it reverts to the inline row.
7. **Only Process is pinned** as a story. About pillars get a scrubbed fan instead of a pin, to avoid three pinned chapters.
8. **Pins and the rail need a fine pointer and a tall enough window** (`min-height` 640/720 plus a fit check). Touch devices of any width get no pins.
9. **Pause semantics** follow `ux-wow` rule 2. Loops (rotator, rails) and Lenis stop. Scroll-linked effects (pins, rail, depth, morphs) stay, because they never move on their own. One-shot entrances finish.
10. **Pause before paint.** `motion-paused` is now applied before paint by `THEME_SCRIPT`, to prevent a layout shift from the rotator.
11. **About copy.** The 4 pillars are Architecture / Leadership / Scale / Trust. "Delivery" was replaced by "Trust" because delivery claims duplicate Services and Process, while "Trust" carries the confidentiality message from the old third paragraph. The countries and the CEO line move into a one-sentence `intro`.
12. **Companies.** The strip has 12 entries, with ShiftCodes included. "Freelance" is excluded. Validation forces each name to match an `experience[].org`, so the strip can't drift from the career data.
13. **The colour morphs** cross-fade 3 fixed light layers through CSS vars on one element, rather than re-tinting the root tokens, which would restyle the whole document every frame.
14. **RTL** is noted but not built (the site is English-only).
