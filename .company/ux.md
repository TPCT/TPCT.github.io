# UX spec — Islam Elsayed portfolio (https://tpct.github.io)

Owner: UI/UX Designer · Date: 2026-10-21 · Inputs: `brief.md`, `prd.md`, `content.json` (copy source of truth), impeccable skill (new-work + Experience/Persuade mode guidance).
Greenfield: no existing UI code or design system in the repo, so this document **is** the design system. Everything below is normative; "should" means required unless stated as optional.

---

## 0. Design direction

**"The system datasheet."** Islam sells systems that keep running when the operation can't stop. The page is designed like an engineering datasheet or architecture spec sheet, not a typical dev portfolio. It uses a near-black graphite ground (`#0B0B12`), warm off-white ink and one committed signal colour: **sodium amber** (`#F2A93B`), the colour of harbour and industrial night lighting (Alexandria's port, the Pharos lineage). A second, quieter **sea-glass** tone (`#7FD1B9`) marks only open-source items. Structure carries the look, with no glow: numbered sections (`01 / About`) on full-width hairline rules, spec-table rows for the stack, and a recurring **bus-and-node schematic** motif. That motif shows up as the hero's domain diagram, the process pipeline, the favicon and the OG card. One expressive face, **Archivo** (variable, using its width axis), is set expanded and heavy for display and at normal width for text. A system monospace handles labels, indices and tags. Radii are small (2–10px), dark-theme shadows are replaced by borders, and motion is limited to one orchestrated "draw the schematic" moment on load. We reject the defaults on purpose: no purple/blue gradients, no glassmorphism, no neon edge glow, no pill-cloud of skills, no cream-and-serif. The light theme is the same datasheet printed on cool drafting paper (`#FAFAFC`), with ink text, burnt amber and deep teal. Its structure is identical, so it doesn't read as an afterthought.

Mode: **Persuade/Experience** (portfolio; P1 must act → email). Ambition shows in structure, type and the schematic motif. Restraint shows everywhere else.

---

## 1. User flows (per story)

```mermaid
flowchart LR
  A[Land on /] --> B{Hero}
  B -->|"View selected work"| W[#work, focus on section]
  B -->|"Start a conversation"| M[mailto: eslamjackie@outlook.com]
  B -->|nav| S[About / Stack / Work / Services / Contact]
  W --> F[Filter: category x type] --> C[Read cards]
  C -->|open-source| G[GitHub repo, new tab]
  C -->|case study| K[No link; private note]
  C --> CT[#contact] --> M
  CT --> CP[Copy email -> "Email copied"]
```

| Story | Flow (steps) |
|---|---|
| US-01 Hero | Page paints → name (h1), roles, headline, CTAs visible → activate primary → smooth-scroll (unless reduced motion) to `#work`, focus moves to `<section id="work">` (tabindex -1) → or activate secondary → mail client opens. |
| US-02 Nav | Desktop/tablet: click a link → scroll to section and focus the section. Mobile: tap "Open menu" → panel opens, focus goes to the first link → tap a link → panel closes, scroll and focus go to the section. Or Esc → panel closes, focus returns to the menu button. Tab first → "Skip to content" → Enter → focus `<main>`. |
| US-03/04/05 | Linear reading. Stats are part of the hero section. No interaction. |
| US-06/07/09 | `#work` → read the lead → (JS) pick a category chip and/or type chip → the grid updates in place, count announced ("4 projects") → if the result is empty, the empty state shows with a "Show all projects" reset → reset → both filters go to All, focus moves to the category "All" chip. |
| US-08 | Pick a filter → URL becomes `/?category=enterprise-and-erp&kind=case-study#work` (replaceState, no reload). Open that URL → filters are pre-applied and the browser lands on `#work`. |
| US-10 | Read Experience (org link opens shiftcodes.net in a new tab), Services, Process. |
| US-11/12 | `#contact` → click the email (mailto) or "Copy email" → button label becomes "Email copied" for 2s and the live region announces it. |
| US-13 | Click the theme toggle → theme flips instantly, label updates, saved → reload → the same theme applies before paint. |
| US-19 | Broken URL → 404 page (same header with brand + theme toggle) → "Back to the homepage". |

---

## 2. Design tokens

### 2.1 Colour — CSS custom properties (both themes)

`<html lang="en" class="no-js" data-theme="dark">` is the default in the HTML source. Tokens are defined on `:root, [data-theme="dark"]` and overridden on `[data-theme="light"]`.

```css
:root,
[data-theme="dark"] {
  color-scheme: dark;
  --bg:            #0B0B12;  /* page ground = c.site.themeColorDark */
  --surface:       #13131C;  /* cards, header, panels */
  --surface-2:     #1B1B26;  /* hover fill, tags, code-ish rows */
  --line:          #24242F;  /* decorative hairlines only (no contrast requirement) */
  --line-strong:   #6A6A7A;  /* UI component boundaries: chips, outline buttons, toggle */
  --text:          #ECEAE3;  /* primary ink */
  --text-muted:    #A3A3B0;  /* body secondary, descriptions */
  --text-subtle:   #82828F;  /* mono labels, indices, meta. Use ONLY on --bg/--surface */
  --accent:        #F2A93B;  /* sodium amber: primary buttons, active chip, marks, focus */
  --accent-hover:  #FFBE5C;
  --on-accent:     #0B0B12;  /* text/icons on --accent */
  --accent-text:   #F2A93B;  /* accent used as text (links on hover, case-study badge) */
  --oss:           #7FD1B9;  /* sea-glass: open-source badge + GitHub link accent */
  --focus:         #F2A93B;
  --selection-bg:  #F2A93B;
  --selection-fg:  #0B0B12;
  --shadow-card:   none;
  --shadow-card-hover: none;
  --shadow-pop:    0 16px 40px -12px rgba(0,0,0,.6);
}

[data-theme="light"] {
  color-scheme: light;
  --bg:            #FAFAFC;  /* = c.site.themeColorLight */
  --surface:       #FFFFFF;
  --surface-2:     #EFEFF3;
  --line:          #E2E2E8;
  --line-strong:   #8A8A98;
  --text:          #14141C;
  --text-muted:    #4E4E5C;
  --text-subtle:   #6B6B78;
  --accent:        #9A5B00;  /* burnt amber, darkened so white text passes */
  --accent-hover:  #7E4A00;
  --on-accent:     #FFFFFF;
  --accent-text:   #9A5B00;
  --oss:           #0F6E5C;  /* deep teal */
  --focus:         #9A5B00;
  --selection-bg:  #9A5B00;
  --selection-fg:  #FFFFFF;
  --shadow-card:   0 1px 0 rgba(20,20,28,.04), 0 1px 2px rgba(20,20,28,.06);
  --shadow-card-hover: 0 10px 24px -12px rgba(20,20,28,.22);
  --shadow-pop:    0 16px 40px -16px rgba(20,20,28,.28);
}
```

**Contrast ratios** (WCAG 2.x relative luminance, computed; QA re-verifies with axe):

| Pair | Dark | Light | Requirement |
|---|---|---|---|
| `--text` on `--bg` | 16.3:1 | 17.6:1 | 4.5 |
| `--text` on `--surface` | 15.3:1 | 18.4:1 | 4.5 |
| `--text` on `--surface-2` | 14.2:1 | ~15.9:1 | 4.5 |
| `--text-muted` on `--bg` | 7.9:1 | 7.9:1 | 4.5 |
| `--text-muted` on `--surface` / `--surface-2` | 7.4 / 6.8:1 | 8.2 / 7.1:1 | 4.5 |
| `--text-subtle` on `--bg` | 5.2:1 | 5.0:1 | 4.5 |
| `--text-subtle` on `--surface` | 4.9:1 | 5.3:1 | 4.5 |
| `--text-subtle` on `--surface-2` | 4.5:1 (borderline, **do not use**) | 4.6:1 | n/a |
| `--accent-text` on `--bg` / `--surface` | 9.8 / 9.2:1 | 5.2 / 5.4:1 | 4.5 |
| `--on-accent` on `--accent` (buttons, active chip) | 9.8:1 | 5.4:1 | 4.5 |
| `--oss` on `--surface` | 10.3:1 | 6.2:1 | 4.5 |
| `--line-strong` vs `--bg` / `--surface` (component boundary) | 3.7 / 3.5:1 | 3.3 / 3.4:1 | 3.0 |
| `--focus` ring vs `--bg` | 9.8:1 | 5.2:1 | 3.0 |

Rules: never put `--text-subtle` on `--surface-2`. Never set `--line` as the only boundary of an interactive control. Never use `--accent` (light) as a large background behind body text.

### 2.2 Typography

- **Display/text family:** **Archivo** (Google Fonts, SIL OFL 1.1), variable axes `wght` and `wdth`. **Self-hosted, one file**: `/assets/fonts/archivo-var.woff2`, plus `/assets/fonts/OFL.txt`.
  - Source: `https://github.com/google/fonts/raw/main/ofl/archivo/Archivo[wdth,wght].ttf` (download once at dev time and commit the woff2; no runtime request).
  - Build the file with fonttools: `fonttools varLib.instancer Archivo[wdth,wght].ttf wght=400:800 wdth=100:125 -o archivo-limited.ttf`, then `pyftsubset archivo-limited.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2197,U+2212" --layout-features="kern,liga,calt,tnum,lnum" --flavor=woff2 --output-file=archivo-var.woff2`. Target ≤ 80 KB.
  - Preload: `<link rel="preload" href="/assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>`.
- **Mono:** system stack only (0 bytes): `ui-monospace, "SFMono-Regular", "SF Mono", "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Consolas, "Liberation Mono", monospace`.

```css
@font-face {
  font-family: "Archivo";
  src: url("/assets/fonts/archivo-var.woff2") format("woff2-variations"),
       url("/assets/fonts/archivo-var.woff2") format("woff2");
  font-weight: 400 800;
  font-stretch: 100% 125%;
  font-style: normal;
  font-display: swap;
}
/* Metric-matched fallback to keep CLS ≤ 0.1 (Archivo hhea: upm 1000, asc 878, desc 210). QA may tune size-adjust ±3%. */
@font-face {
  font-family: "Archivo Fallback";
  src: local("Arial"), local("Helvetica Neue"), local("Liberation Sans");
  size-adjust: 102%;
  ascent-override: 86%;
  descent-override: 20.6%;
  line-gap-override: 0%;
}
:root {
  --font-sans: "Archivo", "Archivo Fallback", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", "SF Mono", "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Consolas, "Liberation Mono", monospace;

  /* Fluid type scale (min at 360px, max at 1280px) */
  --fs-display: clamp(2.75rem, 1.6rem + 5.6vw, 6rem);      /* 44 -> 96  h1 hero name */
  --fs-h2:      clamp(2rem, 1.45rem + 2.4vw, 3.25rem);      /* 32 -> 52  section titles */
  --fs-contact: clamp(2.25rem, 1.4rem + 3.8vw, 4.5rem);     /* 36 -> 72  contact h2 */
  --fs-email:   clamp(1.375rem, 0.85rem + 2.6vw, 2.75rem);  /* 22 -> 44  big email link */
  --fs-stat:    clamp(2.5rem, 2rem + 2.2vw, 3.75rem);       /* 40 -> 60  stat values */
  --fs-lead:    clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);   /* 20 -> 26  hero headline, about p1 */
  --fs-h3:      clamp(1.1875rem, 1.1rem + 0.35vw, 1.375rem);/* 19 -> 22  card/service/group titles */
  --fs-body:    clamp(1rem, 0.96rem + 0.18vw, 1.0625rem);   /* 16 -> 17 */
  --fs-small:   0.9375rem;  /* 15 */
  --fs-label:   0.8125rem;  /* 13, mono, uppercase, tracking .08em */
  --fs-tag:     0.8125rem;  /* 13, mono, normal case */

  --lh-tight: 0.95;  /* display */
  --lh-head:  1.12;  /* h2/h3 */
  --lh-body:  1.6;
  --lh-snug:  1.4;   /* lead, card summary */

  --tracking-display: -0.025em;
  --tracking-h2:      -0.015em;
  --tracking-label:   0.08em;
}
```

| Role | Family | wght | wdth (`font-stretch`) | Size | Other |
|---|---|---|---|---|---|
| H1 hero name | sans | 800 | 118% | `--fs-display` | lh .95, tracking -0.025em |
| H2 section | sans | 750 | 112% | `--fs-h2` | lh 1.12 |
| Contact H2 | sans | 800 | 118% | `--fs-contact` | max 16ch |
| H3 | sans | 650 | 100% | `--fs-h3` | lh 1.25 |
| Lead | sans | 500 | 100% | `--fs-lead` | lh 1.4 |
| Body | sans | 400 | 100% | `--fs-body` | lh 1.6, max 68ch |
| Stat value | sans | 750 | 125% | `--fs-stat` | `font-variant-numeric: tabular-nums lining-nums` |
| Label / index / eyebrow | mono | 500 | n/a | `--fs-label` | uppercase, tracking .08em, `--text-subtle` |
| Tag (stack items) | mono | 400 | n/a | `--fs-tag` | `--text-muted` on `--surface-2` |
| Button / chip / nav | sans | 600 (nav 500) | 100% | 1rem (nav .9375rem) | n/a |

Global: `body { font: 400 var(--fs-body)/var(--lh-body) var(--font-sans); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; overflow-wrap: break-word; }`. `h1,h2,h3 { text-wrap: balance; }`, `p { text-wrap: pretty; }`.

### 2.3 Spacing, radii, layout, motion

```css
:root {
  /* 4px base */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 128px;
  --section-pad: clamp(64px, 4rem + 5vw, 128px);   /* block padding of each section */

  --radius-1: 2px;   /* tags, badges, schematic boxes */
  --radius-2: 6px;   /* buttons, chips, toggle, menu panel */
  --radius-3: 10px;  /* cards, empty state */

  --container: 1200px;           /* content max width */
  --gutter: 20px;                /* inline page padding; 32px ≥768, 40px ≥1280 */
  --header-h: 56px;              /* 64px ≥768 */

  --dur-1: 120ms;  /* colour/border hover */
  --dur-2: 200ms;  /* chips, menu open/close, card hover, card filter fade */
  --dur-3: 480ms;  /* hero schematic draw */
  --stagger: 45ms;
  --ease-out: cubic-bezier(.2,.7,.2,1);
  --ease-in-out: cubic-bezier(.65,0,.35,1);

  --tap: 44px;     /* minimum touch target */
}
@media (min-width: 768px)  { :root { --gutter: 32px; --header-h: 64px; } }
@media (min-width: 1280px) { :root { --gutter: 40px; } }

html { scroll-padding-top: calc(var(--header-h) + 16px); }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
::selection { background: var(--selection-bg); color: var(--selection-fg); }
```

Focus (global, both themes):
```css
:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: var(--radius-2); }
:focus:not(:focus-visible) { outline: none; }
[tabindex="-1"]:focus { outline: none; }   /* programmatic focus targets: sections, main */
```

Forced colours: `@media (forced-colors: active)`: chips and buttons get `border: 1px solid ButtonText`. The active chip gets `background: Highlight; color: HighlightText; forced-color-adjust: none`. Focus uses `outline-color: Highlight`. Schematic lines use `CanvasText`.

### 2.4 Grid and breakpoints

Mobile-first, `min-width` queries only.

| Name | Range | Columns / gap | Container | Header |
|---|---|---|---|---|
| base | 320–767 (designed at 360) | 4 col, 16px gap | 100% − 2×20px | 56px, menu button |
| md | ≥ 768 | 8 col, 24px gap | 100% − 2×32px | 64px, inline nav |
| lg | ≥ 1024 | 12 col, 24px gap | 100% − 2×32px | inline nav |
| xl | ≥ 1280 | 12 col, 32px gap | max 1200px centred, 40px gutters | inline nav |

`.container { width: min(100% - 2*var(--gutter), var(--container)); margin-inline: auto; }`. Use logical properties throughout (`margin-inline`, `padding-block`), even though the site is LTR only.

Projects grid columns: 1 (base), 2 (md, lg), 3 (xl). Services grid: 1 / 2 / 3 (lg). Skills: stacked / 2-col rows (md) / spec table (lg). There is no horizontal page scroll at any width ≥ 320px.

---

## 3. Shared components

| Component | Spec |
|---|---|
| **Section header** | `<header class="section-head">`: row 1 is the mono index `01` + ` / ` + the section's short name, in `--text-subtle` (`aria-hidden="true"`, decorative), followed by a 1px `--line` rule filling the rest of the row (flex). Row 2 is the `<h2>`, `margin-top: var(--space-5)`. Margin below the head is `--space-7`. Index map: 01 About, 02 Experience, 03 Stack, 04 Work, 05 Services, 06 Process, 07 Contact. |
| **Button, primary** | `<a class="btn btn--primary">`. Min-height 48px, padding-inline 20px, radius `--radius-2`, bg `--accent`, colour `--on-accent`, 600 1rem. Optional 18px icon with 8px gap. Hover: bg `--accent-hover`. Active: `transform: translateY(1px)`. Focus: global ring. Transition bg `--dur-1`. |
| **Button, secondary** | Same box. bg transparent, 1px border `--line-strong`, colour `--text`. Hover: bg `--surface-2`, border `--text-muted`. |
| **Icon button** (theme, menu) | 44×44, radius `--radius-2`, 1px border `--line-strong`, 20px icon, colour `--text`. Hover: bg `--surface-2`. |
| **Text link** | colour `--text`, `text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: .22em; text-decoration-thickness: 1px`. Hover: decoration colour `--accent-text`, thickness 2px. External links append the 14px `arrow-up-right` icon (aria-hidden) and a visually-hidden " (opens in new tab)". All external: `target="_blank" rel="noopener noreferrer"`. |
| **Tag** | mono `--fs-tag`, padding 3px 8px, radius `--radius-1`, bg `--surface-2`, colour `--text-muted`, 1px border transparent. Not interactive. |
| **Badge (kind)** | mono `--fs-label` uppercase tracking .08em, padding 3px 8px, radius `--radius-1`, 1px border currentColor, 12px icon, gap 6px. Case study: colour `--accent-text`, icon `lock`. Open source: colour `--oss`, icon `git-branch`. |
| **Chip (filter)** | `<button type="button" aria-pressed>`. Min-height 44px, padding-inline 14px, radius `--radius-2`, 1px border `--line-strong`, bg transparent, colour `--text`, 600 .9375rem. Count in mono `--fs-tag` with 8px left margin, same colour as the label (never reduced opacity). Hover: bg `--surface-2`. **Pressed:** bg `--accent`, border `--accent`, colour `--on-accent` (count too). Pressed + hover: bg `--accent-hover`. Count 0 (not pressed): label and count in `--text-subtle`, border dashed `--line-strong`. Still operable, **never `disabled`**. Transition bg/border/colour `--dur-2`. |
| **Visually hidden** | `.vh { position:absolute!important; width:1px; height:1px; margin:-1px; padding:0; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }` |
| **Icons** | Inline SVG copied from Lucide (ISC licence; credit line in the README): `sun, moon, menu, x, arrow-up-right, arrow-down, mail, lock, git-branch, copy, check`. `width/height` attributes set, `stroke="currentColor" stroke-width="1.75" fill="none"`, `aria-hidden="true" focusable="false"`. No icon font, no sprite request. |

---

## 4. Screens and sections (page order)

DOM order of `/`: skip link → `<header>` → `<main id="main" tabindex="-1">` [hero (incl. stats) → #about → #experience → #skills → #work → #services → #process → #contact] → `<footer>`. Heading tree: h1 (name) → h2 per section → h3 inside. No other h1.

> Order note: the parent listed "projects" after "process". The page follows the **nav order in content.json** (About, Stack, Work, Services, Contact) so the scroll-spy and jumps move forward predictably. Experience and Process are not in the nav, so they sit beside their nearest nav section. See Assumptions A2.

### 4.1 Skip link
- `<a class="skip" href="#main">{c.site.skipLink}</a>`, the first element in `<body>`.
- Hidden off-screen (`translateY(-120%)`) until focused. When focused: fixed top-left 12px/12px, z-index 100, primary-button styling.
- On activation, focus `<main>` (native anchor behaviour + `tabindex="-1"`).

### 4.2 Sticky header + nav + theme toggle + mobile menu

```
base (<768)                                   md+ (>=768)
┌────────────────────────────────────┐       ┌──────────────────────────────────────────────────────┐
│ ■ Islam Elsayed        [☀] [≡]    │ 56    │ ■ Islam Elsayed     About Stack Work Services Contact [☀] │ 64
└────────────────────────────────────┘       └──────────────────────────────────────────────────────┘
open:                                                       (active link: text colour + 2px amber bar under)
┌────────────────────────────────────┐
│ ■ Islam Elsayed        [☀] [✕]    │
├────────────────────────────────────┤
│ About                               │ 56 each, 1px --line separators
│ Stack                               │
│ Work                                │
│ Services                            │
│ Contact                             │
└────────────────────────────────────┘ panel: --surface, --shadow-pop
```

- `<header class="site-header">`: `position: sticky; top: 0; z-index: 50; height: var(--header-h); background: var(--bg); border-bottom: 1px solid var(--line)`. Solid background, no blur and no transparency.
- **Brand:** `<a href="#top" class="brand">` (`href="/"` on 404). It shows a 10×10 `--accent` square (decorative span) with 10px gap, then `c.site.shortTitle` in sans 700, wdth 112%, 1.0625rem. Min-height 44px. `#top` is the `id` on the hero section.
- **Nav:** `<nav aria-label="Primary">` → `<ul>` of `c.site.nav` links. md+: inline, gap 4px, each link padding 0 12px, min-height 44px, colour `--text-muted`, 500 .9375rem. Hover: `--text`. **Current section** (scroll-spy): `aria-current="true"`, colour `--text`, plus a `::after` 2px × (100% − 24px) `--accent` bar at the bottom of the link.
- **Scroll-spy (JS):** an IntersectionObserver on sections with `rootMargin: "-40% 0px -55% 0px"`. Mapping: `#about`, `#experience` → About; `#skills` → Stack; `#work` → Work; `#services`, `#process` → Services; `#contact` → Contact. Inside the hero, no link is current.
- **Theme toggle:** `<button type="button" class="icon-btn theme-toggle" hidden>`. JS removes `hidden`. In the dark theme it shows the `sun` icon, `aria-label="{c.site.themeToggle.toLight}"`. In light it shows `moon`, `aria-label="{c.site.themeToggle.toDark}"`. Same label in `title`. No `aria-pressed`, because the name carries the state (PRD US-13 AC2). It sits right of the nav on md+, and left of the menu button on base.
- **Menu button (base only):** `<button type="button" class="icon-btn menu-btn" aria-expanded="false" aria-controls="primary-nav" aria-label="{c.site.menuOpen}" hidden>`. JS un-hides it below 768px. When open: `aria-expanded="true"`, the icon becomes `x`, and the label becomes `{c.site.menuClose}`.
- **Menu panel behaviour (base, JS):** the `<nav id="primary-nav">` list becomes an absolutely positioned panel under the header (full width, `--surface`, bottom border `--line`, `--shadow-pop`, links 56px tall, padding-inline `--gutter`, sans 600 1.125rem, `--text`). Closed state uses `hidden`, so it is not focusable.
  - Open: on activation, focus moves to the first link. Animation: opacity 0→1 + translateY(-8px→0), `--dur-2 --ease-out`.
  - Close triggers: Esc (focus returns to the menu button), activating any link (focus goes to the target section), clicking or tapping outside the panel and header, focus leaving the panel and button (focusout check), or the viewport crossing to ≥768px.
  - No focus trap and no body scroll lock. It is a disclosure, not a modal.
- **No-JS (base):** `.no-js` CSS sets the header to `position: static; height: auto`. The nav renders as a second row that wraps (`flex-wrap: wrap`, links min-height 44px), and the menu button and theme toggle stay `hidden`. All links are reachable.
- In-page link enhancement (JS, all widths): for any `a[href^="#"]` whose target exists, let the default scroll happen, then call `target.focus({preventScroll:true})`. Every section has `tabindex="-1"`. This satisfies US-01 AC2 and US-02.

### 4.3 Hero (`<section id="top" class="hero" aria-labelledby="hero-name">`)

```
lg+ (12 col)                                                       
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ SHIFTCODES / ENGINEERING                                │   ┃               │
│                                                           │   ┣━□ ERP         │
│ Islam                                                     │   ┣━□ ANALYTICS   │
│ Elsayed                       (h1, 96px expanded 800)     │   ┣━□ BANKING     │
│                                                           │   ┣━□ INSURANCE   │
│ Founder @ ShiftCodes · Systems Architect · Senior Full-…  │   ┣━□ LMS         │
│                                                           │   ┣━□ SAAS        │
│ Building production software for complex operations.     │   ┣━□ INFRASTR…   │
│ I design and ship the systems businesses run on: ERP, …   │   ┃               │
│                                                           │   ◆ Alexandria, Egypt
│ [View selected work ↓] [✉ Start a conversation]  GitHub ↗ │     Egypt → Middle East
├──────────────────────────────────────────────────────────────────────────────┤ --line
│ 40%+                    │ 7                         │ 2016                       │ stats strip
│ faster loads delivered… │ domains shipped: ERP, …   │ writing and publishing …   │
└──────────────────────────────────────────────────────────────────────────────┘
text column: cols 1–7 · schematic: cols 9–12 · padding-block: 96px top / 64px bottom

base (360)
┌──────────────────────────┐
│ ■ SHIFTCODES / ENGINEERING│
│ Islam                     │ 44–46px
│ Elsayed                   │
│ Founder @ ShiftCodes ·    │
│ Systems Architect · Senior│
│ Full-Stack Engineer       │
│ Building production       │ 20px lead
│ software for complex …    │
│ I design and ship …       │ subheadline, 16px muted
│ [ View selected work ↓ ]  │ full-width 48px
│ [ ✉ Start a conversation ]│ full-width 48px
│ GitHub ↗                  │
│ [ERP][ANALYTICS][BANKING] │ domain tags wrap
│ ◆ Alexandria, Egypt · Egypt → Middle East
└──────────────────────────┘
```

Content (all from `c.hero`):
1. **Eyebrow** `<p class="eyebrow">`: an 8×8 `--accent` square + `{eyebrow}`, mono label style.
2. **H1** `<h1 id="hero-name">{name}</h1>`. Display style, colour `--text`, `max-width: 10ch`, so it naturally breaks into "Islam / Elsayed" on every width.
3. **Roles** `<ul class="roles">`: inline list, each `<li>` separated by a decorative ` · ` (CSS `::before { content: "·" / ""; margin-inline: .5em; color: var(--text-subtle) }` on `li + li`). Sans 500, 1.0625rem (lg 1.25rem). The first role is in `--text`, the rest in `--text-muted`. Margin-top `--space-5`.
4. **Headline** `<p class="hero__headline">{headline}</p>`. Lead style, `--text`, max 24ch, margin-top `--space-6`.
5. **Subheadline** `<p class="hero__sub">{subheadline}</p>`. Body, `--text-muted`, max 56ch, margin-top `--space-4`.
6. **CTAs** `<div class="hero__ctas">`, margin-top `--space-6`, flex-wrap, gap 12px:
   - Primary `<a class="btn btn--primary" href="#work">{ctaPrimary.label}</a>` + `arrow-down` icon after the label.
   - Secondary `<a class="btn btn--secondary" href="mailto:eslamjackie@outlook.com">` + `mail` icon before `{ctaSecondary.label}`.
   - Tertiary text link `{ctaTertiary.label}` → `https://github.com/TPCT` (external pattern), aligned centre with the buttons, min-height 44px.
   - base: primary and secondary are `width: 100%`, and the tertiary sits on its own line.
7. **Domain schematic** `<div class="schematic">` holding `<ul class="schematic__domains" aria-label="{c.hero.domainsLabel}">` with one `<li>` per `{domains}`, then `<p class="schematic__origin">{location}<span aria-hidden="true"> · </span>{reach}</p>`.
   - lg+: the column has a 2px vertical **bus** line (`--line-strong`) at inline-start 6px, running from the top of the list to the origin node. Each `li` has a 16px horizontal 2px connector from the bus, then a box: mono label uppercase, tracking .08em, `--text`, padding 8px 12px, border 1px `--line-strong`, radius `--radius-1`, bg `--surface`, list gap 10px. The origin node is a 14×14 `--accent` square rotated 45° on the bus, with the origin text beside it (`--text-muted`, mono `--fs-label`, location in `--text`).
   - md: the schematic sits below the CTAs, full width. Its domain boxes render as a horizontal wrapping row with a horizontal bus line behind the first row (decorative), and the origin goes below.
   - base: the same as md but with no bus line, just wrapping boxes (gap 8px) and the origin line below.
   - **Signature motion (only under `prefers-reduced-motion: no-preference`, pure CSS, no JS dependency):** the bus line animates `transform: scaleY(0→1)` (origin top), `--dur-3 --ease-in-out`. Each box animates `opacity 0→1; translateX(-6px→0)` over `--dur-2 --ease-out`, with `animation-delay: calc(200ms + var(--i) * var(--stagger))`. The renderer writes `style="--i:N"` on each li. The origin node fades in last. Use `animation-fill-mode: both`. The end state is identical to the static state, so content is always present in the DOM and the accessibility tree.
8. **Stats strip** (US-04). This is the last child of the hero, `<ul class="stats">`, rendered only if `c.stats.length > 0`. Otherwise the element and its top rule are omitted entirely.
   - Margin-top `--space-9` (lg) / `--space-8` (base). Border-top 1px `--line`. Columns: 1 (base, items separated by 1px `--line` rules) / 3 (md+, separated by vertical 1px `--line`). Each item padding-block 24px, padding-inline 0 on base and 24px on md+ (the first item has 0 inline-start).
   - Item: `<li><span class="stat__value">{value}</span> <span class="stat__label">{label}</span></li>`. Both spans are `display:block`. The value uses the stat style in `--accent-text`. The label is `--text-muted`, `--fs-small`, max 30ch, margin-top 8px.
   - The value is first in the DOM, so a screen reader reads "40%+ faster loads delivered…". The source string is used verbatim.

Note on base ordering: keep **DOM order** as listed (eyebrow, h1, roles, headline, sub, CTAs, schematic) on all widths. Do **not** reorder with CSS (that breaks focus and visual-order parity). At 360×740 the CTAs still land above the fold. Expected stack height: header 56, padding 32, eyebrow 20, h1 92, roles 72, headline 84, sub 120, CTAs 156, giving about 632px.

States: no interactive states beyond buttons and links. Long content: h1 `overflow-wrap: anywhere` as a safety net. Roles wrap per `li`, with `white-space: nowrap` inside each role at ≥ 400px only.

### 4.4 About (`<section id="about" tabindex="-1" aria-labelledby="about-title">`)

```
lg+:  [01 / ABOUT ───────────────────────────────────────────────]
      ┌ cols 1–4 ───────────┐ ┌ cols 5–12 (max 68ch) ─────────────┐
      │ About (h2, sticky   │ │ P1 in lead size, --text            │
      │  top: header+32px)  │ │ P2 body, --text-muted              │
      └─────────────────────┘ │ P3 body, --text-muted              │
                              └────────────────────────────────────┘
base/md: head, then paragraphs stacked, max 68ch.
```
- `h2#about-title` = `c.about.title`. Paragraphs = `c.about.paragraphs` in order, each its own `<p>`. Paragraph 1 uses the lead style (`--fs-lead`, 500, `--text`, lh 1.4). Paragraphs 2+ use the body style in `--text-muted`. Gap between paragraphs is `--space-5`.
- The sticky h2 applies at lg+ only (`position: sticky; top: calc(var(--header-h) + 32px)`).

### 4.5 Experience (`<section id="experience" tabindex="-1" aria-labelledby="experience-title">`)

```
[02 / EXPERIENCE ──────────────────────────────────────────]
Experience (h2)
┌─────────────────────────────────────────────────────────────┐ border-top 1px --line, border-bottom 1px --line
│ ShiftCodes ↗            │ Founder, Systems Architect & Lead Engineer (h3) │
│ ALEXANDRIA, EGYPT       │ I founded ShiftCodes and lead it as …            │
└─────────────────────────────────────────────────────────────┘
lg+: cols 1–4 | cols 5–12. base/md: stacked, org row first.
```
- `<ol class="experience">` with one `<li>` per `c.experience[]`. Within each item: `<h3>{role}</h3>` (DOM first), `<p class="exp__org"><a href="{orgUrl}" external>{org}</a></p>`, `<p class="exp__loc">{location}</p>` (mono label style), and `<p>{summary}</p>` (`--text-muted`, max 68ch).
- Visual placement at lg+ uses a CSS grid. The org and location go in the left column (grid-row 1–2). The h3 and summary go in the right column. The org link uses sans 700, wdth 112%, 1.5rem, `--text`, with the underline pattern.
- **No dates** are shown, and there is no date placeholder.
- With multiple entries (future), each `li` is a row separated by `--line` and padded 24px.

### 4.6 Stack / skills (`<section id="skills" tabindex="-1" aria-labelledby="skills-title">`)

```
lg+ spec table:
[03 / STACK ────────────────────────────────────────────────]
Stack (h2)
┌───────────────────────┬────────────────────────────────────────────┐
│ A1  LANGUAGES (h3)    │ [PHP] [Python] [JavaScript] [TypeScript] … │  row: 20px padding-block,
├───────────────────────┼────────────────────────────────────────────┤  border-bottom 1px --line
│ A2  BACKEND & FRAMEW… │ [Laravel] [Filament] [Yii2] …              │
│ …                     │                                            │
└───────────────────────┴────────────────────────────────────────────┘
cols 1–4 | cols 5–12
md: 2-column grid of blocks (head above tags). base: 1 column.
```
- h2 = `c.sections.skills` ("Stack"). Body: `<div class="skills">`, with one `<section class="skill-group" aria-labelledby>` per `c.skills[]`. Use a `<div>` instead if nested sections complicate the outline; either is fine as long as the heading levels are h3.
- Group head: decorative mono index `S1…S6` (`aria-hidden`, `--text-subtle`), then `<h3>{group}</h3>` in sans 650 `--fs-h3`, `--text`.
- Items: `<ul class="tags">` → `<li class="tag">{item}</li>` in order. Text only, no logos. Flex-wrap, gap 8px.
- Long content: tags wrap. A long item such as "ETL & KPI pipelines" never breaks mid-word (`white-space: nowrap` per tag, with `max-width:100%` + `overflow-wrap:anywhere` fallback at <360px).

### 4.7 Work: projects with filters (`<section id="work" tabindex="-1" aria-labelledby="work-title">`)

```
[04 / WORK ─────────────────────────────────────────────────────────────]
Selected work (h2)
Case studies are private client systems, described without …   (lead, --text-muted, max 68ch)

FILTER PROJECTS BY CATEGORY                                (mono label, visible)
[All 19] [Enterprise & ERP 4] [Analytics & AI 3] [FinTech & Banking 2]
[Education 1] [SaaS & Platforms 3] [APIs & Backend 3] [Developer Tools 3]
FILTER PROJECTS BY TYPE
[All 19] [Case study 11] [Open source 8]
19 projects                                               (role=status, mono label)

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   xl: 3 col, md/lg: 2 col, base: 1 col
│ card             │ │ card             │ │ card             │   gap 24 (xl 32)
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Server-rendered markup (no-JS-complete):**
- h2 = `c.projectsIntro.title`. `<p class="lead">{lead}</p>`.
- `<div class="filters" hidden>`. JS removes `hidden`, and with no JS the whole filter UI stays hidden.
  - `<div role="group" aria-labelledby="f-cat-label">` with `<p id="f-cat-label" class="label">{filterLabel}</p>` and the chips. The first chip is `{allLabel}` with `data-category="all" aria-pressed="true"`. Then one chip per `c.categories` entry **that has ≥1 project** (in `c.categories` order), with `data-category="<slug>" aria-pressed="false"`.
  - `<div role="group" aria-labelledby="f-kind-label">` with `<p id="f-kind-label" class="label">{kindFilterLabel}</p>`. Chips: `{allLabel}` (`data-kind="all"`, pressed), `{kindLabels["case-study"]}` (`data-kind="case-study"`), and `{kindLabels["open-source"]}` (`data-kind="open-source"`). The type group is rendered only if both kinds exist.
  - Chip inner markup: `<span class="chip__label">Enterprise & ERP</span><span class="chip__count">4</span>`. Accessible name: "Enterprise & ERP 4". This is acceptable and gives the count to screen-reader users before pressing.
  - `<p id="work-count" class="label" role="status" aria-live="polite" aria-atomic="true">19 projects</p>`. It sits inside `.filters`, so it is hidden with no JS.
- Renderer must emit only the chips listed; with current content this is All + all 7 categories (counts: Enterprise & ERP 4, Analytics & AI 3, FinTech & Banking 2, Education 1, SaaS & Platforms 3, APIs & Backend 3, Developer Tools 3; Case study 11, Open source 8; total 19). Initial counts are server-rendered so they are correct before JS runs.
- `<ul class="projects" id="project-list">` → one `<li class="card" data-category="<slug>" data-kind="case-study|open-source" data-featured="true|false">` per project, in **featured-first** order and content.json order within each group.
- `<div class="projects-empty" hidden>`: `<p>{emptyState}</p>` + `<button type="button" class="btn btn--secondary">{resetLabel}</button>`.

**Slugs:** lowercase, `&` → `and`, any run of non-`[a-z0-9]` → `-`, trim `-`. That gives `enterprise-and-erp, analytics-and-ai, fintech-and-banking, education, saas-and-platforms, apis-and-backend, developer-tools`. Kind slugs are the raw values `case-study`, `open-source`.

**Filter behaviour (JS):**
- State: `{category: "all"|slug, kind: "all"|slug}`. A card is visible iff `(category==="all" || card.category===category) && (kind==="all" || card.kind===kind)`. Hidden cards get the `hidden` attribute, so they are removed from the a11y tree and tab order.
- Click on a chip in a group: set that group's state, set `aria-pressed="true"` on it and `"false"` on its siblings. Clicking the already-pressed chip is a no-op (it does not toggle back to All).
- Counts: each category chip's count = projects matching that category **AND the current kind**. Each kind chip's count = projects matching that kind **AND the current category**. Recomputed on every change. The "All" chips show the count for that group's dimension relaxed.
- Live region: set `#work-count` text to `"{n} project"` / `"{n} projects"` (from `countSingular` / `countPlural`). To force re-announcement when the text is unchanged, clear it, then set it in a `requestAnimationFrame`.
- Empty result (n = 0), e.g. Education + Open source: the grid `ul` gets `hidden`, `.projects-empty` loses `hidden`, and the live region says "0 projects". The reset button sets both groups to All, re-renders and moves focus to the category "All" chip.
- Focus stays on the activated chip, with no scroll jump. The grid keeps `min-height` equal to the height of one card row during the swap, to soften the change in height.
- Entering cards (newly un-hidden): `opacity 0→1, translateY(4px→0)`, `--dur-2 --ease-out`, no stagger. Cards being hidden disappear immediately. Under reduced motion there is no animation.
- **URL (US-08):** after each change, `history.replaceState(null, "", url)`. Here `url` = path + query (`category=<slug>` only if ≠ all, `kind=<slug>` only if ≠ all) + `#work`. When both are All, the query is removed and `#work` is kept.
  - On load: read `URLSearchParams`. Valid slugs are applied before the first filter render. Unknown or invalid values are ignored silently (they fall back to All, with no console output), and the URL is rewritten to the canonical form.
- Keyboard: chips are native buttons in Tab order (no roving tabindex), activated by Enter/Space. Tab order runs category chips → type chips → (count is not focusable) → first visible card's link, or the reset button.

**Card anatomy** (`<li class="card">` → `<article aria-labelledby="p-{id}">`):

```
┌───────────────────────────────────────────────┐ bg --surface, 1px --line, radius --radius-3,
│ [🔒 CASE STUDY]  ENTERPRISE & ERP        2026 │ padding 24 (base 20), --shadow-card
│                                               │ meta row: badge · category (mono label --text-subtle) · year right-aligned (mono, --text-subtle)
│ AIC Operations Suite                    (h3)  │
│ A digital ecosystem for AIC, a food-safety…   │ summary: --text-muted, lh 1.5
│                                               │
│ — Central admin system with granular roles…   │ highlights <ul>: --text, --fs-small, 8px gap,
│ — Cross-platform mobile apps for auditors…    │ marker: 12px × 1px --accent-text dash (::before), hanging indent 20px
│ — Portals and automation that replace…        │
│                                               │
│ [Laravel] [PHP] [Flutter] [Python] [TypeSc…]  │ stack: <ul class="tags" aria-label="{stackLabel}">
│ ─────────────────────────────────────────────│ 1px --line, margin-top auto (pins footer to bottom)
│ ROLE  Systems architect & lead engineer       │ <p class="card__role">: mono label {roleLabel} + role
│ 🔒 Private client work, so no public code     │ case-study footer (no link)
└───────────────────────────────────────────────┘

Open-source footer instead of private note:
│ ROLE  Author                                  │
│ [⑂ View on GitHub ↗]                          │ link, colour --oss, 600, min-height 44, inline-flex
```

- **Order inside `<article>`** (DOM = visual): meta row → `h3#p-{id}` {name} → `p` {summary} → `ul.card__highlights` (all highlights) → `ul.tags` (all stack items) → `footer.card__foot` (role + private note or repo link).
- **Meta row** `<p class="card__meta">`, flex-wrap, gap 8px 12px, align centre:
  - Kind badge (§3): text `{kindLabels[kind]}`.
  - Category: `<span>{category}</span>`, mono label style, `--text-subtle`.
  - Year: `<span class="card__year">{year}</span>` with `margin-inline-start:auto`, mono, tabular. **Omitted entirely** when `year` is absent (no empty span, no "undefined").
- **h3**: sans 650 `--fs-h3`, `--text`, margin-top 16px, `text-wrap: balance`.
- **Summary**: margin-top 8px, `--text-muted`, `--fs-body`, lh 1.5.
- **Highlights**: margin-top 16px, list-style none, each `li` padding-inline-start 20px, with a `::before` dash (12×1px, `--accent-text` for case study, `--oss` for open source) at 0.75em from the top.
- **Stack tags**: margin-top 20px, no visible label, and the `ul` carries `aria-label="{c.projectsIntro.stackLabel}"`.
- **Footer** (`margin-top: auto; padding-top: 16px; border-top: 1px solid var(--line)`; the article is `display:flex; flex-direction:column; height:100%`):
  - Role: `<p class="card__role"><span class="label">{c.projectsIntro.roleLabel}</span> {role}</p>`. The label is mono `--text-subtle`, and the role text is `--text`, `--fs-small`.
  - **Case study** (`kind === "case-study"`): `<p class="card__private">` with the `lock` icon + `{c.projectsIntro.privateNote}`, styled as a badge-like line: mono `--fs-tag`, `--accent-text`, 1px dashed `--line-strong` border, radius `--radius-1`, padding 6px 10px, `display:inline-flex`. **There is no `<a>` anywhere in a case-study card**, and any `repoUrl` on a case study is ignored by the renderer (US-15).
  - **Open source**: `<a class="card__repo" href="{repoUrl}" target="_blank" rel="noopener noreferrer">`, containing the `git-branch` icon + `{repoLinkLabel}` + `<span class="vh"> : {name} {c.a11y.newTab}</span>` + the `arrow-up-right` icon. Colour `--oss`, 600, min-height 44px. Hover: underline 2px offset .22em. Focus: global ring.
- **Card hover**: open-source cards only (they contain a link), border `--line-strong` and `--shadow-card-hover`, `--dur-2`. Case-study cards have no hover change (they are not interactive). No transform lift.
- **Long content:** 4 highlights or 7 stack tags wrap inside the card at 360px. Long tokens use `overflow-wrap:anywhere` on `.card`. Grid items stretch to row height (`align-items: stretch`), so footers align across a row.

### 4.8 Services (`<section id="services" tabindex="-1" aria-labelledby="services-title">`)

```
[05 / SERVICES ─────────────────────────────────────────────]
Services (h2)
┌────────────────────┬────────────────────┬────────────────────┐ lg+: 3 cols; md: 2; base: 1
│ 01                 │ 02                 │ 03                 │ cells share 1px --line borders
│ ERP & Operations   │ Analytics & Data   │ SaaS & Multi-      │ (grid with gap 1px on a --line bg,
│ Systems (h3)       │ Platforms          │ Tenant Platforms   │  cells bg --bg) → "spec grid" look
│ desc …             │ desc …             │ desc …             │ cell padding 28px 24px
├────────────────────┼────────────────────┼────────────────────┤
│ 04 …               │ 05 …               │ 06 …               │
└────────────────────┴────────────────────┴────────────────────┘
```
- `<ul class="services">` → `<li>`: decorative mono index `01…06` (`aria-hidden`, `--accent-text`), `<h3>{title}</h3>`, `<p>{desc}</p>` (`--text-muted`, max 40ch).
- The outer frame is a 1px `--line` border with radius `--radius-3` and overflow hidden. It is not interactive and has no hover.

### 4.9 Process (`<section id="process" tabindex="-1" aria-labelledby="process-title">`)

```
lg+ pipeline:
[06 / PROCESS ──────────────────────────────────────────────]
Process (h2)
 ◆━━━━━━━━━━━━◆━━━━━━━━━━━━◆━━━━━━━━━━━━◆━━━━━━━━━━━━◆     bus line 2px --line-strong, nodes 12px squares
 01 DISCOVER   02 MODEL     03 ARCHITECT  04 SHIP     05 EVOLVE    (rotated 45°, first 4 --surface w/ border,
 Map the real  Turn it into Choose bound- Deliver in  Measure,     last one filled --accent)
 operation…    a data …     aries …       small …     harden …
base/md: vertical — bus on the inline-start edge, nodes on it, text to the right; order preserved.
```
- `<ol class="process">` → `<li>`: `<h3>{step}</h3>` + `<p>{desc}</p>`. The step number is a CSS counter rendered decoratively in mono `--text-subtle` before the h3 (the `<ol>` semantics already convey order). The h3 is sans 700 wdth 112% `--fs-h3`.
- lg+: `display:grid; grid-template-columns: repeat(5, 1fr); gap: 24px`. The bus is an `::before` on the `ol` at top 6px spanning 0 → calc(100% − 20%/2). Nodes are an `::before` on each `li`.
- base/md: a vertical list with padding-inline-start 32px, the bus at inline-start 5px, the node at top .4em, and 32px gap between steps.
- Motion: none beyond static (the hero owns the one animated moment).

### 4.10 Contact (`<section id="contact" tabindex="-1" aria-labelledby="contact-title">`)

```
[07 / CONTACT ──────────────────────────────────────────────]
Let's build something that                (h2, --fs-contact, max 16ch)
runs the business
Have an operation that needs reliable software, or …   (lead, --text-muted, max 56ch)

EMAIL ME                                   (mono label = c.contact.emailLabel)
eslamjackie@outlook.com   [⧉ Copy email]   (email: sans 700 wdth 112 --fs-email, underline pattern;
                                             copy = secondary button, 44px, JS only)
┌───────────────────────┬───────────────────────┬───────────────────────┐ md+: 3 cols, base: stacked rows
│ ShiftCodes ↗          │ GitHub · TPCT ↗        │ Alexandria, Egypt     │ each 56px min-height, border-top --line
└───────────────────────┴───────────────────────┴───────────────────────┘
```
- h2 = `c.contact.title`, `<p class="lead">{lead}</p>`.
- `<p class="label" id="email-label">{emailLabel}</p>` and `<a class="contact__email" href="mailto:{email}" aria-describedby="email-label">{email}</a>`. The email is plain text in HTML, with `overflow-wrap:anywhere` as a safety net (it fits at 360px at 22px). Hover: underline thickness 2px, colour `--accent-text`.
- Copy button `<button type="button" class="btn btn--secondary copy-btn" hidden>` with the `copy` icon + `<span>{copyLabel}</span>`. JS un-hides it **only if** `navigator.clipboard?.writeText` exists and `window.isSecureContext`.
  - Success: icon → `check`, label → `{copiedLabel}`, live region `<span class="vh" role="status" aria-live="polite" id="copy-status">` gets `{copiedLabel}`. After 2000ms both revert, and the live region is cleared.
  - Rejection (permission denied or other error): catch the error, select the email link's text with `Range`/`Selection` so the user can press Ctrl/Cmd+C, keep the label unchanged, and write nothing to the console.
  - Repeated clicks during the 2s window restart the timer.
- Links row `<ul class="contact__links">`: `<a href="{website}">{websiteLabel}</a>` (external), `<a href="{github}">{githubLabel}</a>` (external), and `<li>{location}</li>` (plain text, `--text-muted`). Each item min-height 56px, sans 600 1.125rem, with the arrow icon pushed to inline-end.
- Section padding-block-end is `--space-10`. This is the page's anchor close.

### 4.11 Footer (`<footer class="site-footer">`)

```
──────────────────────────────────────────────────────────── 1px --line
■ © Islam Elsayed · ShiftCodes. Built as a static site …     eslamjackie@outlook.com   GitHub · TPCT ↗
base: stacked; footer text first, then links as 44px-tall rows.
```
- `<p>{c.site.footer}</p>` in `--text-subtle` `--fs-small`. Links: `mailto:{email}` (text = email) and `{github}` (text = githubLabel, external). Padding-block 32px. md+: flex space-between.

### 4.12 404 page (`/404.html`)

```
┌ header: brand (href="/") ……………………………… [☀] ┐  (no nav, no menu button)
│                                                │
│  404                                           │ c.notFound.code: <p aria-hidden="false">, sans 800 wdth 125,
│                                                │ clamp(6rem, 3rem + 18vw, 15rem), --accent-text, lh .9, tabular
│  Page not found              (h1)              │ --fs-h2 style
│  This page doesn't exist or has moved.         │ --text-muted
│  [Back to the homepage →]                      │ primary button, href="/"
│                                                │
└ footer (same as home) ─────────────────────────┘
```
- Same `<head>` theme script, tokens, font and favicon as the home page. `<title>404 — Page not found · Islam Elsayed</title>` (built from `code`, `title`, `shortTitle`). `<meta name="robots" content="noindex">`.
- Under `main`, a decorative schematic fragment: a horizontal bus with 3 nodes, where the last node is drawn as a dashed hollow square to signal a "broken link". It is CSS only, `aria-hidden`.
- Focus: on load nothing is auto-focused. Tab order is skip link → brand → theme toggle → CTA → footer links.
- No-JS: renders fully in dark, toggle hidden, link works.

---

## 5. States matrix

| Element | Hover | Focus-visible | Active / pressed | Disabled | Empty | Loading | Error | No-JS |
|---|---|---|---|---|---|---|---|---|
| Nav link | `--text` | ring | current: amber bar | n/a | n/a | n/a | n/a | visible links (base: wrapped row) |
| Theme toggle | `--surface-2` fill | ring | instant switch | n/a | n/a | n/a | storage throws → still switches for session | hidden |
| Menu button | `--surface-2` | ring | expanded: `x` icon, panel open | n/a | n/a | n/a | n/a | hidden; links inline |
| Primary button | `--accent-hover` | ring (3px offset) | translateY(1px) | n/a | n/a | n/a | n/a | works (plain link) |
| Secondary button | `--surface-2` + `--text-muted` border | ring | translateY(1px) | n/a | n/a | n/a | n/a | works |
| Filter chip | `--surface-2` | ring | pressed = amber fill | never disabled; 0-count = subtle + dashed | grid replaced by empty state + reset | n/a (sync) | invalid URL slug → All, silent | whole filter UI hidden, all 19 cards visible |
| Card (OSS) | border `--line-strong` + hover shadow | ring on link | n/a | n/a | n/a | n/a | n/a | link works |
| Card (case study) | none | n/a (no focusables) | n/a | n/a | n/a | n/a | n/a | identical |
| Copy email | `--surface-2` | ring | label → "Email copied" 2s | hidden if API missing | n/a | n/a | rejected → select text, no console error | hidden |
| Email / external links | 2px underline, accent | ring | n/a | n/a | n/a | n/a | n/a | work |
| Stats strip | n/a | n/a | n/a | n/a | `c.stats` empty → not rendered, no gap | n/a | n/a | identical |
| Fonts | n/a | n/a | n/a | n/a | n/a | swap from metric-matched fallback | file 404 → fallback stack, layout intact | identical |

Permission-denied: the only permissioned API is the Clipboard (handled above). There are no auth-gated screens. Long content is covered per section (hero h1, card highlights/stack, email, chip labels wrap inside the chip with `white-space: normal` if a label exceeds the container width).

---

## 6. Theme mechanism (US-13)

- `<head>` order: `<meta charset>`, viewport, `<meta name="theme-color" content="#0B0B12">`, then the **inline theme script** (CSP-hashed), then CSS.
  ```html
  <script>(function(d){d.className=d.className.replace(/\bno-js\b/,'js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='light'?'#FAFAFC':'#0B0B12'}})(document.documentElement);</script>
  ```
  Keep this byte-exact once hashed. Any edit requires re-hashing the CSP.
- Toggle (deferred JS): flip `data-theme`, update the meta theme-color, swap icon and `aria-label`/`title`, then `try { localStorage.setItem('theme', next) } catch {}`.
- Switch transition: `body` and `.site-header` transition `background-color, color` at `--dur-2`. Do **not** add a global `* { transition }`.
- The default with no stored value is dark, whatever `prefers-color-scheme` says (PRD A1).

---

## 7. Accessibility checklist (WCAG 2.1/2.2 AA)

- Landmarks: one `header`, `nav[aria-label="Primary"]`, `main#main`, `footer`. Sections are `section[aria-labelledby]`. The heading levels are h1 → h2 → h3 with no skips.
- Focus order = DOM order = visual order at every breakpoint (no CSS `order`, no `row-reverse`).
- The focus ring is 2px `--focus` at 3px offset, ≥ 3:1 against adjacent colours in both themes (see the table). It is never removed except on `tabindex="-1"` programmatic targets.
- Touch targets: every interactive element is ≥ 44×44 at all widths. Inline body links are exempt by WCAG, but the footer and contact links are given 44px rows anyway.
- Live regions: `#work-count` (filter count) and `#copy-status` (copy). Both are polite, and both exist in the DOM from initial HTML.
- Every decorative SVG, index, dash and separator is `aria-hidden` or uses CSS content with empty alt text (`content: "·" / ""`).
- Reduced motion: the schematic draw, card fade, menu slide and smooth scroll are all removed.
- At 200% zoom (1280 → 640 CSS px) the base/md layout applies with no loss. Text spacing overrides (WCAG 1.4.12) do not clip, because there are no fixed heights on text containers (only `min-height`).
- Language `lang="en"`. External links announce "(opens in new tab)".

---

## 8. Open Graph image (1200×630) and icons

**Source:** `/assets/og-image.svg` (committed, not linked from the page). **Output:** `/assets/og-image.png` (target ≤ 150 KB, hard cap 300 KB).
**Render:** load the SVG in headless Chromium (Playwright) with an `@font-face` pointing to the repo's `archivo-var.woff2`, at a 1200×630 viewport, `deviceScaleFactor: 1`, and screenshot to PNG. Then run `oxipng -o 4` if available. Do not use `rsvg-convert` (variable `font-stretch` support is unreliable). The mono in the OG image uses `"DejaVu Sans Mono", "Liberation Mono", monospace`, which is available on the Linux build machine.

Layout (absolute coordinates, text baseline `y`):
```
1200×630  bg #0B0B12
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌ frame: rect x40 y40 w1120 h550, stroke #24242F 1px, no fill               │
│  │ corner registration ticks: 16px L-shapes, stroke #F2A93B 2px, at the 4 frame corners
│  ■ SHIFTCODES / ENGINEERING        square 12×12 #F2A93B at (80,99); text x104 y111,
│                                    mono 20px, letter-spacing 3, #82828F, uppercase
│  Islam Elsayed                     x80 y250, Archivo 800, font-stretch 118%, 104px,
│                                    letter-spacing -2, #ECEAE3 (must fit ≤ 1040px wide;
│                                    if not, step down 4px until it fits)
│  Founder @ ShiftCodes              x80 y318, Archivo 600, 34px, #F2A93B
│  Systems Architect · Senior Full-Stack Engineer   x80 y364, Archivo 500, 34px, #A3A3B0
│
│  ━━[ERP]━[ANALYTICS]━[BANKING]━[INSURANCE]━[LMS]━[SAAS]━[INFRASTRUCTURE]━━━━━━━◆
│     bus: line x1=80 x2=1112 y=470, stroke #6A6A7A 2px; boxes h44 (y448–492), fill #13131C,
│     stroke #6A6A7A 1px, rx 4, padding-inline 16, gap 14, starting at x80; text mono 18px
│     uppercase letter-spacing 1.5, #ECEAE3, vertically centred (baseline y477);
│     end node: 12×12 square rotated 45° centred (1112,470), fill #F2A93B
│
│  Alexandria, Egypt · Egypt → Middle East             tpct.github.io
│     left: x80 y556 mono 20px #A3A3B0          right: x1120 y556 text-anchor end, mono 20px #F2A93B
└─────────────────────────────────────────────────────────────────────────────┘
```
- All strings come from `content.json` (`hero.eyebrow`, `hero.name`, `hero.roles`, `hero.domains`, `hero.location`, `hero.reach`). The URL `tpct.github.io` is from `site.url` with the scheme removed. Alt text = `c.site.ogImageAlt`. The OG card is dark-only (link previews have no theme).
- Safe zone: all content stays inside x80–1120 / y80–570 (some platforms crop to 1.91:1 or centre-square).

**Favicon / icons** (same motif):
- `/favicon.svg`: viewBox 0 0 64 64, `rect` 64×64 rx 14 fill `#0B0B12`. Bus: `rect x=18 y=12 w=6 h=40` fill `#F2A93B`. Nodes: three 10×10 squares at x=34, y=12 / 27 / 42, filled `#ECEAE3`, `#ECEAE3`, `#F2A93B`. Each has a 10×4 connector `rect` from the bus at its vertical centre, fill `#F2A93B`.
- `/favicon-32.png` (32×32) and `/favicon.ico` (16+32), rendered from the SVG.
- `/apple-touch-icon.png` 180×180: the same artwork with no rounded corners (iOS masks it), bg `#0B0B12`, artwork scaled to an 80% safe area.
- `/site.webmanifest`: `name` = `c.site.title`, `short_name` = `c.site.shortTitle`, `background_color` = `#0B0B12`, `theme_color` = `#0B0B12`, `display: "browser"`, icons 192 and 512 PNG (same artwork).

---

## 9. Content keys to add to `content.json` (needed so all copy stays data-driven)

The PRD requires verbatim copy from content.json. These UI strings are missing, and the Tech Lead's first ticket adds them exactly as below:

```json
"site":          { "menuOpen": "Open menu", "menuClose": "Close menu" },
"sections":      { "skills": "Stack", "experience": "Experience", "services": "Services", "process": "Process" },
"hero":          { "domainsLabel": "Domains" },
"projectsIntro": { "kindFilterLabel": "Filter projects by type", "countSingular": "project", "countPlural": "projects",
                   "resetLabel": "Show all projects", "roleLabel": "Role", "stackLabel": "Stack" },
"a11y":          { "newTab": "(opens in new tab)" }
```
(Merge these into the existing objects; don't replace them.)

---

## Assumptions (decided by UX; user unavailable)

1. **Direction** ("system datasheet", sodium amber + sea-glass, Archivo + system mono) was chosen by the designer. The impeccable `concept-seed` launcher was not run (no shell in this role), so the direction was derived manually under its rules (it avoids the four calibrated AI defaults and the banned font list).
2. **Section order** follows the content.json nav order: Hero(+stats) → About → Experience → Stack → Work → Services → Process → Contact. This differs from the order in the request, so that nav jumps and the scroll-spy always move forward. Experience maps to "About" and Process maps to "Services" in the scroll-spy.
3. **Stats strip** sits semantically inside the hero section (no extra h2 needed). It is visually a separate ruled strip.
4. **"Private · client work" badge**: the card renders the existing `c.projectsIntro.privateNote` ("Private client work, so no public code") as a badge-styled line with a lock icon, in the footer slot where open-source cards have their GitHub link. The kind badge reads "Case study". No new string is invented for this. If the exact "Private · client work" text is wanted, the PO adds it as `privateBadge` and it replaces the note text.
5. **Type filter (US-09, Could)** is in scope and combines with category (AND). Chips show live counts. Zero-count chips stay operable (not disabled), and the empty state offers a reset.
6. **URL state** uses query params + `#work` via `replaceState` (no history entries per click).
7. **Nav breakpoint**: inline nav from 768px (5 short labels fit). The menu button is used only below 768px.
8. **Projects grid**: 2 columns from 768–1279, 3 from 1280. This fits PRD "1, 2, 2–3, 3".
9. **Theme toggle** uses a changing `aria-label` (per PRD), not `aria-pressed`. The icon shows the target theme (sun in dark).
10. **Mono font** is the system stack (0 KB). Archivo is self-hosted as one variable woff2 limited to wght 400–800 and wdth 100–125. The OG image uses DejaVu/Liberation Mono at render time.
11. **No photo or avatar** anywhere (none was provided). The schematic motif is the visual signature.
12. **No dates in Experience**, and card years only where present, per the PRD.
13. **404** has the brand + theme toggle only (no section nav).
14. **Icons** are inline Lucide SVGs (ISC). The licence is credited in the README.
