# UX respec: "Prism" visual + motion system for tpct.github.io

Owner: UI/UX Designer · Date: 2026-10-21 · Status: normative. It replaces the visual parts of `ux.md`.
Inputs: owner feedback ("doesn't look good at all, no animations, doesn't use the Prism principle"), the owner's Prism (D22) design language (private reference, not shipped and not quoted by brand), `ux.md`, and the current `src/` implementation.

---

## 0. Scope: what this document replaces and what it keeps

| `ux.md` section | Status |
|---|---|
| §0 Design direction | **Replaced** by §1 here |
| §1 User flows | **Kept**. Two flows are added in §2 here (theme switch reveal, motion pause) |
| §2 Design tokens (colour, type, spacing, motion) | **Replaced** by §3 here |
| §3 Shared components (visual spec) | **Replaced** by §4 here. Semantics, markup and ARIA in §3 are kept |
| §4 Screens: DOM order, heading tree, semantics, copy sources, filter/menu/copy/URL behaviour, no-JS rules | **Kept** verbatim |
| §4 Screens: wireframes, colours, sizes, borders, the "schematic" visuals | **Replaced** by §6 here |
| §5 States matrix | **Replaced** by §7 here. The behaviour columns of the old matrix still apply |
| §6 Theme mechanism | **Kept**. Only the theme-colour hex values and the switch animation change (§3.2, §5.9) |
| §7 Accessibility checklist | **Kept**. Additions are in §9 here |
| §8 OG image + icons | **Replaced** by §11 here |
| §9 Content keys | **Kept**. Additions are in §10.3 here |

Where this document conflicts with `ux.md`, this document wins. Anything not mentioned here stays as in `ux.md`.

---

## 1. Direction: "Prism", light through glass

The page is a calm violet-ink night (`#1A1726`) lit by a soft drifting **field** of plum and ink-blue light. Content sits on **frosted acrylic plates** with a white hairline rim and layered inset shadows, so each plate looks lit from above. One **berry/pink brand** carries action: primary buttons use a glossy gradient "skin" with dark text. A **cyan secondary** marks open source and secondary information. The signature element is a literal **prism**: a faceted glass triangle in the hero whose inner colour slowly turns, with a white beam entering and a pink-violet-cyan spectrum leaving. This is the "Prism principle" made visible: one input (the operation) refracted into many systems. The same triangle appears as the header glyph, the favicon, the OG card and the 404 art.

Type: **Outfit** (geometric, confident) for display and numbers, and **Plus Jakarta Sans** for text. Shapes are generous: 24px plates, 18px cards, 14px controls, pill buttons and chips.

Motion is a first-class part of the identity. It is orchestrated (hero load sequence, then reveals as you scroll), physical (rise, lift, spring, magnetic), and always optional: it never gates content and is fully disabled under `prefers-reduced-motion`.

Dark is the default theme. Light is the Prism light palette (lavender field, white plates, berry `#A8125A`). Both pass WCAG 2.1 AA (§3.4).

Things this design avoids on purpose: neon edge glows, glass blur on every card (performance), scroll-jacking, parallax on text, and infinite motion without a pause control.

---

## 2. Flows added to `ux.md` §1

| Flow | Steps |
|---|---|
| Theme switch (US-13, visual only) | Click the toggle → if motion is allowed and `document.startViewTransition` exists, the new theme is revealed as a circle growing from the toggle's centre (620ms). Otherwise it switches instantly. The sun/moon icon morphs (rotate + scale + crossfade, 520ms). Label, storage and meta theme-color behave as in `ux.md` §6. |
| Pause ambient motion (WCAG 2.2.2) | The hero visual has a 44px "Pause animation" icon button → click → every ambient loop (field drift, prism spin/float, beam, spectrum) pauses in place. The label becomes "Play animation" and the state is saved in `localStorage.motion = "paused"` → on reload it stays paused (applied before loops start). Entrance and scroll-reveal animations are one-shot and are not affected. The button is not rendered visible without JS or under reduced motion, because no loops run in those cases. |

---

## 3. Design tokens

### 3.1 Fonts (self-hosted, CSP `font-src 'self'`; replaces Archivo)

Google Fonts' CDN is **not** used (the CSP is self-only, and self-hosting avoids a third-party request). Both families are SIL OFL 1.1.

| Family | Source (dev-time download only) | Instance | Output | Target / cap |
|---|---|---|---|---|
| Outfit | `https://github.com/google/fonts/raw/main/ofl/outfit/Outfit%5Bwght%5D.ttf` | `wght=500:800` | `public/assets/fonts/outfit-var.woff2` | ≤ 40 KB / 80 KB |
| Plus Jakarta Sans | `https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf` | `wght=400:800` | `public/assets/fonts/jakarta-var.woff2` | ≤ 60 KB / 80 KB |

Licences: `public/assets/fonts/OFL-Outfit.txt` and `OFL-PlusJakartaSans.txt`, each from the same repo folder's `OFL.txt`. **Delete** `archivo-var.woff2` and `OFL.txt`. Rewrite `scripts/build-font.sh` with the same venv flow:

```
fonttools varLib.instancer 'Outfit[wght].ttf' wght=500:800 -o outfit-limited.ttf
pyftsubset outfit-limited.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+00B7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2197,U+2212" --layout-features="kern,liga,calt,tnum,lnum" --flavor=woff2 --output-file=outfit-var.woff2
# same two commands for PlusJakartaSans[wght].ttf with wght=400:800 -> jakarta-var.woff2
# print fallback metrics from the *-limited.ttf files:
python3 -I -c "import sys;from fontTools.ttLib import TTFont as T;f=T(sys.argv[1]);h=f['hhea'];u=f['head'].unitsPerEm;print(f'ascent-override:{h.ascent/u:.2%};descent-override:{-h.descent/u:.2%};line-gap-override:{h.lineGap/u:.2%}')" outfit-limited.ttf
```

`src/styles/00-fonts.css` (replace the whole file; fill in the printed metric values):

```css
@font-face { font-family: "Outfit"; src: url("/assets/fonts/outfit-var.woff2") format("woff2"); font-weight: 500 800; font-style: normal; font-display: swap; }
@font-face { font-family: "Plus Jakarta Sans"; src: url("/assets/fonts/jakarta-var.woff2") format("woff2"); font-weight: 400 800; font-style: normal; font-display: swap; }
/* Metric-matched fallbacks (CLS ≤ 0.1). ascent/descent/line-gap = values printed by build-font.sh.
   size-adjust starts at 100% and QA tunes it (±6%) until the hero h1 and the about paragraph wrap identically at 360px and 1280px with and without the webfont. */
@font-face { font-family: "Outfit Fallback"; src: local("Arial"), local("Helvetica Neue"), local("Liberation Sans"); size-adjust: 100%; ascent-override: /*printed*/; descent-override: /*printed*/; line-gap-override: 0%; }
@font-face { font-family: "Jakarta Fallback"; src: local("Arial"), local("Helvetica Neue"), local("Liberation Sans"); size-adjust: 100%; ascent-override: /*printed*/; descent-override: /*printed*/; line-gap-override: 0%; }
```

`head.mjs`: replace the Archivo preload with two preloads (both faces are above the fold):
`<link rel="preload" href="/assets/fonts/outfit-var.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin>`

There is **no monospace face** any more. Every label that used `--font-mono` now uses Jakarta 700/800 uppercase (see `.label` in §4).

### 3.2 Colour: `src/styles/01-tokens.css` (replace the whole file)

Dark is the default and is written on `:root`. Light overrides it on `[data-theme="light"]`, which is set on `<html>` by the inline script and `10-theme.js`. That mechanism is unchanged.

```css
:root,
[data-theme="dark"] {
  color-scheme: dark;
  /* Ground + field */
  --canvas: #1A1726;
  --field-a: #302038; --field-b: #202C43; --field-c: #1D192C; --field-d: #151321;
  --field: radial-gradient(ellipse at 18% 6%, var(--field-a) 0%, transparent 42%),
           radial-gradient(ellipse at 92% 40%, var(--field-b) 0%, transparent 48%),
           linear-gradient(135deg, var(--field-c), var(--field-d));
  --blob-a: #4A2346;            /* drifting plum light (body::before) */
  --blob-b: #1E3A52;            /* drifting ink-blue light (body::after) */
  /* Surfaces / plates */
  --surface: #2B2638; --surface-raised: #322C42; --surface-soft: #3A3349;
  --plate: linear-gradient(145deg, rgb(46 40 61 / .91), rgb(38 33 52 / .88));
  --plate-opaque: #2B2638;
  --plate-brand: linear-gradient(140deg, #3A2840, #2C2236);
  --plate-cyan: linear-gradient(140deg, #1E3340, #182A35);
  --shell: linear-gradient(135deg, rgb(42 35 57 / .88), rgb(32 27 45 / .84));  /* header pill, menu, domains plate */
  --glass-blur: blur(14px) saturate(140%);
  --rim: rgb(232 222 255 / .25);
  --shadow-card: inset 0 1px 1px rgb(232 222 255 / .16), inset 0 -1px 2px rgb(10 8 20 / .35), 0 3px 6px rgb(10 8 20 / .18), 0 16px 28px -17px rgb(10 8 20 / .5);
  --shadow-lift: inset 0 1px 1px rgb(232 222 255 / .20), inset 0 -1px 2px rgb(10 8 20 / .35), 0 30px 60px -28px rgb(0 0 0 / .75), 0 0 0 1px rgb(242 153 196 / .14);
  --shadow-pop:  inset 0 1px 1px rgb(232 222 255 / .16), 0 12px 32px rgb(0 0 0 / .5);
  /* Controls */
  --control: linear-gradient(160deg, #46394F, #362C42);
  --control-rim: rgb(232 222 255 / .18);
  --control-shadow: inset 0 1px 1px rgb(232 222 255 / .14), 0 3px 6px rgb(0 0 0 / .3);
  --well: inset 0 2px 4px rgb(0 0 0 / .35), 0 1px 0 rgb(232 222 255 / .08);
  /* Text + lines */
  --fg: #F1ECF8; --fg2: #CFC6DC; --muted: #B7ACC6;
  --border: #4A4159; --border-soft: #3D3550; --border-strong: #A398B2;
  /* Brand (berry/pink) */
  --brand: #F299C4; --brand-hover: #F7B3D3; --brand-pressed: #DC79AB;
  --brand-tint: #3A2840; --nav-sel: #4A2D47; --brand-line: #7A4568;
  --primary-skin: linear-gradient(165deg, #F5ACD0, #EC8DBB);
  --primary-skin-hover: linear-gradient(165deg, #F8BEDB, #F09DC6);
  --on-primary: #2A1020;
  --primary-shadow: inset 0 1px 1px rgb(255 255 255 / .35), 0 4px 10px -3px rgb(0 0 0 / .5);
  --primary-glow: 0 10px 28px -8px rgb(242 153 196 / .55);
  --btn-glow: rgb(255 255 255 / .45);       /* magnetic hotspot inside primary buttons */
  --count-on-primary: rgb(42 16 32 / .16);  /* count bubble inside a pressed chip */
  /* Secondary accents */
  --cyan: #7FD3E3; --cyan-text: #7FD3E3; --cyan-soft: #1F3640; --cyan-line: #2E5562;
  --crown: #C3AEF5;
  /* Prism art */
  --prism-1: #F299C4; --prism-2: #C3AEF5; --prism-3: #88C8FC; --prism-4: #7FD3E3;
  --glow-a: rgb(242 153 196 / .38); --glow-b: rgb(127 211 227 / .30);
  --beam: rgb(255 255 255 / .85);
  --prism-shadow: rgb(4 2 12 / .6);
  --sheen: rgb(255 255 255 / .10);
  /* Gradient text */
  --grad-name: linear-gradient(100deg, var(--brand) 0%, var(--crown) 55%, var(--cyan-text) 100%);
  --grad-accent: linear-gradient(100deg, var(--brand), var(--crown) 55%, var(--cyan-text));
  /* Focus + selection */
  --focus: #8CB5FF;
  --selection-bg: #F299C4; --selection-fg: #2A1020;
}

[data-theme="light"] {
  color-scheme: light;
  --canvas: #E7E6F3;
  --field-a: #FCE3EF; --field-b: #D3E5F3; --field-c: #EEECF8; --field-d: #E2E3F2;
  --blob-a: #F9D3E6; --blob-b: #CFE3F4;
  --surface: #FBFAFF; --surface-raised: #F5F2FA; --surface-soft: #EAE5F1;
  --plate: linear-gradient(145deg, rgb(255 255 255 / .86), rgb(253 251 255 / .72));
  --plate-opaque: #FBFAFF;
  --plate-brand: linear-gradient(140deg, #FFF1FB, #EBDEF2);
  --plate-cyan: linear-gradient(140deg, #F2FDFF, #DDEFF8);
  --shell: linear-gradient(135deg, rgb(255 255 255 / .88), rgb(245 241 255 / .84));
  --rim: rgb(255 255 255 / .88);
  --shadow-card: inset 0 1px 1px rgb(255 255 255 / .96), inset 0 -1px 2px rgb(157 139 183 / .22), 0 3px 6px rgb(77 56 112 / .05), 0 16px 28px -17px rgb(86 65 125 / .32);
  --shadow-lift: inset 0 1px 1px rgb(255 255 255 / .96), inset 0 -1px 2px rgb(157 139 183 / .22), 0 28px 48px -26px rgb(86 65 125 / .45), 0 0 0 1px rgb(168 18 90 / .08);
  --shadow-pop:  inset 0 1px 1px rgb(255 255 255 / .96), 0 12px 32px rgb(38 23 58 / .24);
  --control: linear-gradient(160deg, #FFFFFF, #F1EAF7);
  --control-rim: rgb(255 255 255 / .9);
  --control-shadow: inset 0 1px 1px #FFFFFF, 0 3px 6px rgb(79 54 104 / .10);
  --well: inset 0 2px 4px rgb(101 73 129 / .13), 0 1px 0 rgb(255 255 255 / .75);
  --fg: #2B253B; --fg2: #5D536D; --muted: #62586E;
  --border: #D9D2E8; --border-soft: #E4DDEF; --border-strong: #83758F;
  --brand: #A8125A; --brand-hover: #8F0F4D; --brand-pressed: #760C40;
  --brand-tint: #F8EFF9; --nav-sel: #F4E1EF; --brand-line: #E3B9D2;
  --primary-skin: linear-gradient(165deg, #B62372, #94154F);
  --primary-skin-hover: linear-gradient(165deg, #A81E69, #860F46);
  --on-primary: #FFFFFF;
  --primary-shadow: inset 0 1px 1px rgb(255 255 255 / .5), 0 4px 8px -3px rgb(138 53 96 / .35);
  --primary-glow: 0 10px 26px -8px rgb(168 18 90 / .45);
  --btn-glow: rgb(255 255 255 / .12);       /* capped: keeps white label ≥ 4.5:1 at the hotspot */
  --count-on-primary: rgb(0 0 0 / .18);
  --cyan: #157E95; --cyan-text: #146A86; --cyan-soft: #E4F3FA; --cyan-line: #9FD3E2;
  --crown: #6945BD;
  --prism-1: #E0569A; --prism-2: #8E6BE0; --prism-3: #3E9BE0; --prism-4: #2BB3C9;
  --glow-a: rgb(224 86 154 / .28); --glow-b: rgb(43 179 201 / .22);
  --beam: rgb(43 37 59 / .55);
  --prism-shadow: rgb(86 65 125 / .28);
  --sheen: rgb(255 255 255 / .55);
  --focus: #235FC2;
  --selection-bg: #A8125A; --selection-fg: #FFFFFF;
}

/* Opaque fallbacks: no backdrop-filter support, or the user asks for reduced transparency */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root:root { --plate: var(--plate-opaque); --shell: var(--plate-opaque); --glass-blur: none; }
}
@media (prefers-reduced-transparency: reduce) {
  :root:root { --plate: var(--plate-opaque); --shell: var(--plate-opaque); --glass-blur: none; }
}
```

**Theme-colour values change** (keep `ux.md` §6 otherwise):
- `content.json`: `site.themeColorDark: "#1A1726"`, `site.themeColorLight: "#E7E6F3"`. The manifest test already reads these values.
- `head.mjs` `THEME_SCRIPT`: replace `'#FAFAFC':'#0B0B12'` with `'#E7E6F3':'#1A1726'`. The CSP hash is recomputed from the constant automatically, and the existing test asserts byte equality.

### 3.3 Type, spacing, radius, layout, motion tokens (same file, after the colour blocks)

```css
:root {
  --font-display: "Outfit", "Outfit Fallback", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Plus Jakarta Sans", "Jakarta Fallback", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;

  --fs-display: clamp(3rem, 1.75rem + 5.4vw, 6rem);         /* 48 → 96  hero name */
  --fs-h2:      clamp(2rem, 1.55rem + 2vw, 3.25rem);         /* 32 → 52  section titles */
  --fs-contact: clamp(2.25rem, 1.5rem + 3.4vw, 4.25rem);     /* 36 → 68 */
  --fs-email:   clamp(1.375rem, 0.9rem + 2.4vw, 2.625rem);   /* 22 → 42 */
  --fs-stat:    clamp(2.5rem, 2rem + 2vw, 3.5rem);           /* 40 → 56 */
  --fs-lead:    clamp(1.1875rem, 1.05rem + .6vw, 1.5rem);    /* 19 → 24 */
  --fs-h3:      clamp(1.125rem, 1.07rem + .25vw, 1.3125rem); /* 18 → 21 */
  --fs-body:    clamp(1rem, .97rem + .15vw, 1.0625rem);      /* 16 → 17 */
  --fs-small:   .9375rem;  /* 15 */
  --fs-chip:    .875rem;   /* 14 */
  --fs-label:   .75rem;    /* 12, 800, uppercase, .08em */
  --lh-tight: .98; --lh-head: 1.08; --lh-body: 1.6; --lh-snug: 1.4;
  --tracking-display: -.035em; --tracking-h2: -.02em; --tracking-label: .08em;

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px;
  --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px; --space-10: 128px;
  --section-pad: clamp(72px, 4rem + 5vw, 136px);

  --r-ctl: 14px;    /* inputs, small tiles, menu links */
  --r-card: 18px;   /* skill/service inner tiles, empty state icon */
  --r-plate: 24px;  /* cards, plates, stats, filters */
  --r-lg: 32px;     /* contact panel */
  --r-pill: 999px;  /* buttons, chips, tags, header */

  --container: 1200px;
  --gutter: 20px;
  --header-h: 68px;            /* pill 52 + 2×8 padding */
  --tap: 44px;

  /* Motion */
  --ease-rise:   cubic-bezier(.16, 1, .3, 1);     /* entrances, reveals */
  --ease-out:    cubic-bezier(.2, .7, .2, 1);     /* hovers, settles */
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);    /* line draws, theme reveal, drifts */
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1); /* magnetic return, icon morph, node pop */
  --dur-1: 140ms;   /* colour / press */
  --dur-2: 240ms;   /* chips, menu, card shadow */
  --dur-3: 420ms;   /* FLIP, icon morph, underline */
  --dur-4: 900ms;   /* rise */
  --dur-5: 1400ms;  /* count-up, line draw */
  --stagger: 70ms;
}
@media (min-width: 768px)  { :root { --gutter: 32px; --header-h: 76px; } }  /* pill 56 + 2×10 */
@media (min-width: 1280px) { :root { --gutter: 40px; } }
```

**Migration map (old → new).** Every partial is rewritten per §4–§6. After the rewrite, `grep -E -- '--(bg|surface-2|line|line-strong|text|text-muted|text-subtle|accent|accent-hover|on-accent|accent-text|oss|radius-[123]|font-mono|shadow-card-hover)\b' src/styles` must return nothing. There are no alias tokens.

| old | new | old | new |
|---|---|---|---|
| `--bg` | `--canvas` (+ `--field`) | `--accent` (fill) | `--primary-skin` |
| `--surface` | `--surface` / `--plate` | `--accent-text` | `--brand` |
| `--surface-2` | `--surface-soft` | `--on-accent` | `--on-primary` |
| `--line` | `--border-soft` | `--oss` | `--cyan-text` |
| `--line-strong` | `--border-strong` | `--radius-1/2/3` | `--r-pill` / `--r-ctl` / `--r-plate` |
| `--text` / `--text-muted` / `--text-subtle` | `--fg` / `--fg2` / `--muted` | `--font-mono` | removed (`--font-sans` 700/800 uppercase) |

### 3.4 Contrast (WCAG 2.x relative luminance, computed by the designer; QA re-verifies with axe in both themes)

Dark: canvas `#1A1726` / surface `#2B2638` / raised `#322C42` (the worst plate). Light: canvas `#E7E6F3` / surface `#FBFAFF`.

| Pair | Dark (canvas / surface / raised) | Light (canvas / surface) | Need |
|---|---|---|---|
| `--fg` text | 15.2 / 12.6 / 11.5 | 11.9 / 14.1 | 4.5 |
| `--fg2` secondary text | 10.7 / 8.9 / 8.1 | 5.8 / 6.9 | 4.5 |
| `--muted` labels, meta | 8.2 / 6.8 / 6.2 | 5.4 / 6.4 | 4.5 |
| `--brand` text, links, eyebrow | 8.5 / 7.0 / 6.4 | 5.9 / 7.0 | 4.5 |
| `--brand` on `--nav-sel` (eyebrow, badge, active nav) | 5.8 | 5.8 | 4.5 |
| `--cyan-text` (OSS badge, repo link, stats end stop) | 10.3 / 8.6 / 7.8 | 4.95 / 5.9 | 4.5 |
| `--cyan-text` on `--cyan-soft` (OSS badge) | 7.4 | 5.4 | 4.5 |
| `--on-primary` on `--primary-skin` (lightest stop for dark, `#B62372` for light) | 7.6 | 6.1 | 4.5 |
| `--on-primary` at the magnetic hotspot (with `--btn-glow`) | ≥ 7.6 (lightens) | 5.0 | 4.5 |
| Pressed-chip count (`--count-on-primary` bubble) | 7.3 | 8.0 | 4.5 |
| `--fg2` on `--surface-soft` (tags, domain chips) | 7.3 | 5.8 | 4.5 |
| `--fg2` on `--control` (chips, secondary buttons) | 6.5 | 6.1 | 4.5 |
| `--cyan-text` on `--control` (repo link pill) | 6.3 | 5.2 | 4.5 |
| `--fg2` / `--muted` on `--plate-cyan` end stop (OSS card) | 8.0 / 6.1 | 6.1 / 5.7 | 4.5 |
| `--fg2` / `--brand` on `--plate-brand` end stop (contact panel) | 8.2 / 6.5 | 5.6 / 5.6 | 4.5 |
| `--muted` / `--fg2` on the field blobs (worst blob) | 5.5 / 7.2 | 4.9 / 5.3 | 4.5 |
| `--crown` (gradient middle stop) on canvas | 9+ | 5.3 | 3 (large) |
| `--border-strong` (dashed zero chip, component edge) vs surface | 5.35 | 4.1 (canvas 3.5) | 3 |
| `--focus` ring vs canvas / surface | 8.5 / 7.1 | 4.9 / 5.8 | 3 |
| Pressed chip (`--primary-skin`) vs unpressed chip surface | ≥ 6 | ≥ 6.6 | 3 (state) |

Rules:
1. Gradient text is allowed only with the `--grad-name` / `--grad-accent` stops listed above (every stop is ≥ 4.5:1 on canvas and plates).
2. Never put `--cyan` (light `#157E95`) on canvas as text. Use `--cyan-text`.
3. Never raise `--btn-glow` in light.
4. Status/kind chips are always opaque (solid tinted backgrounds), never translucent on glass.

---

## 4. Materials and shared components (`10-base.css`, `20-components.css`)

### 4.1 Base

```css
html { background: var(--canvas) var(--field) fixed; scroll-padding-top: calc(var(--header-h) + 16px); }
body { background: transparent; color: var(--fg); font: 400 var(--fs-body)/var(--lh-body) var(--font-sans);
       -webkit-font-smoothing: antialiased; overflow-wrap: break-word; }
h1, h2, h3 { font-family: var(--font-display); color: var(--fg); text-wrap: balance; }
h2 { font-size: var(--fs-h2); font-weight: 700; line-height: var(--lh-head); letter-spacing: var(--tracking-h2); }
h3 { font-size: var(--fs-h3); font-weight: 600; line-height: 1.25; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }   /* no border-radius change (the old rule changed the element's radius; remove it) */
::selection { background: var(--selection-bg); color: var(--selection-fg); }
```

**Ambient field** (CSS only, decorative, no markup): two fixed light blobs behind everything.

```css
body::before, body::after { content: ""; position: fixed; z-index: -1; pointer-events: none; border-radius: 50%; }
body::before { inset-block-start: -22vmax; inset-inline-start: -16vmax; width: 75vmax; height: 75vmax;
               background: radial-gradient(circle, var(--blob-a) 0%, transparent 62%); opacity: .9; }
body::after  { inset-block-end: -26vmax; inset-inline-end: -20vmax; width: 80vmax; height: 80vmax;
               background: radial-gradient(circle, var(--blob-b) 0%, transparent 62%); opacity: .85; }
```

`body` must not get `position`, `z-index`, `transform`, `filter` or `isolation`. Any of those would create a stacking context and push the blobs above the html background incorrectly. The drift animation is in §5.3.

### 4.2 Plate (material, used by many components)

```css
.plate-base {   /* not a class in markup: apply these declarations to each listed selector */
  background: var(--plate); border: 1px solid var(--rim); border-radius: var(--r-plate); box-shadow: var(--shadow-card);
}
```

The plate declarations apply to: `.stats`, `.about__body`, `.experience > li`, `.skill-group`, `.filters`, `.card`, `.services > li`, `.projects-empty`, and `#contact > .container` (which uses `--plate-brand` and `--r-lg`).

**Backdrop-filter budget:** only 3 elements may use `backdrop-filter: var(--glass-blur)`. They are the header pill (`.header-inner::before`), the open mobile menu (`#primary-nav` below 768px), and the hero domains plate (`.schematic`). Cards and other plates **never** blur: dozens of blurred layers above an animated field re-rasterise every frame.

### 4.3 Components

| Component | Spec |
|---|---|
| **Eyebrow / section index** (`.eyebrow`, `.section-head__index`) | `display:inline-flex; align-items:center; gap:8px; align-self:flex-start; padding:6px 14px 6px 10px; border-radius:var(--r-pill); background:var(--nav-sel); color:var(--brand); font:800 var(--fs-label)/16px var(--font-sans); letter-spacing:var(--tracking-label); text-transform:uppercase`. `::before`: 8×8 circle, `background: linear-gradient(135deg, var(--brand), var(--cyan))`. Remove the old hairline `::after` rule. |
| **Label** (`.label`: filter labels, `#work-count`, `.card__role .label`, `#email-label`) | `font:800 var(--fs-label)/16px var(--font-sans); letter-spacing:.08em; text-transform:uppercase; color:var(--muted)`. |
| **Section head** (`.section-head`) | `display:flex; flex-direction:column; align-items:flex-start; gap:var(--space-4); margin-block-end:var(--space-7)`. The h2 has `margin:0; max-width:20ch`. |
| **Button base** (`.btn`) | `position:relative; isolation:isolate; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; gap:10px; min-height:48px; padding:12px 24px; border-radius:var(--r-pill); border:1px solid var(--control-rim); background:var(--control); box-shadow:var(--control-shadow); color:var(--fg); font:600 1rem/1.25 var(--font-sans); text-decoration:none; transition: translate var(--dur-3) var(--ease-spring), scale var(--dur-1) var(--ease-out), box-shadow var(--dur-2), color var(--dur-1)`. `:active { scale:.97 }` (replaces the old `transform: translateY(1px)`). |
| **Primary** (`.btn--primary`) | `background:var(--primary-skin); color:var(--on-primary); border-color:transparent; box-shadow:var(--primary-shadow); translate:var(--mx,0px) var(--my,0px)`. `::after` (hover skin): `content:""; position:absolute; inset:0; z-index:-1; background:var(--primary-skin-hover); opacity:0; transition:opacity var(--dur-2)`. `::before` (magnetic glow, §5.7): `content:""; position:absolute; z-index:-1; left:50%; top:50%; width:140px; height:140px; margin:-70px; border-radius:50%; background:radial-gradient(circle, var(--btn-glow), transparent 65%); translate:var(--gx,0px) var(--gy,0px); opacity:0; transition:opacity var(--dur-2)`. Hover: `::after` opacity 1, `::before` opacity 1, `box-shadow: var(--primary-shadow), var(--primary-glow)`. Icons inherit `currentColor`. |
| **Secondary** (`.btn--secondary`) | Base look. Hover: `color:var(--brand); translate:0 -1px; box-shadow: var(--control-shadow), 0 8px 18px -10px rgb(0 0 0 / .45)` (light: `rgb(86 65 125 / .35)`). |
| **Hero/contact CTA size** | `.hero__ctas .btn { min-height:52px; padding-inline:28px }`. |
| **Icon button** (`.icon-btn`) | 44×44, `border-radius:50%`, base `.btn` surface/rim/shadow, `color:var(--fg)`, `position:relative`. Hover: `color:var(--brand)`. Active: `scale:.94`. Its SVG children are stacked with `position:absolute; inset:0; margin:auto` (for the morphs in §5.9). |
| **Text link** (`.text-link`) | `position:relative; display:inline-flex; align-items:center; gap:6px; min-height:44px; color:var(--fg); font-weight:600; text-decoration:none`. Rest underline `::before`: `content:""; position:absolute; inset-inline:0; bottom:10px; height:1px; background:var(--border-strong)`. Animated underline `::after`: same box, `height:2px; background:linear-gradient(90deg, var(--brand), var(--cyan)); scale:0 1; transform-origin:left; transition:scale var(--dur-3) var(--ease-out)`. Hover/focus-visible: `color:var(--brand)`, `::after { scale:1 1 }`. The trailing arrow SVG has `transition: translate var(--dur-2) var(--ease-out)` and on hover `translate: 2px -2px`. |
| **Tag** (`.tag`, not interactive) | `padding:4px 11px; border-radius:var(--r-pill); background:var(--surface-soft); color:var(--fg2); font:600 .8125rem/1.4 var(--font-sans); white-space:nowrap; max-width:100%`. Under 360px: `white-space:normal` (unchanged rule). |
| **Badge** (`.badge`, card kind) | `display:inline-flex; align-items:center; gap:6px; padding:4px 10px 4px 8px; border-radius:var(--r-pill); font:800 .6875rem/16px var(--font-sans); letter-spacing:.06em; text-transform:uppercase; border:0`. Case study: `background:var(--nav-sel); color:var(--brand)`. Open source (`.card--open-source .badge`): `background:var(--cyan-soft); color:var(--cyan-text)`. |
| **Filter chip** (`.chip`) | `display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:8px 8px 8px 16px; border-radius:var(--r-pill); border:1px solid var(--control-rim); background:var(--control); box-shadow:var(--control-shadow); color:var(--fg2); font:600 var(--fs-chip)/1.25 var(--font-sans); white-space:normal; text-align:start; transition: color var(--dur-1), box-shadow var(--dur-2), translate var(--dur-2) var(--ease-out), scale var(--dur-1)`. `.chip__count`: `display:inline-grid; place-items:center; min-width:24px; height:24px; padding:0 7px; border-radius:var(--r-pill); background:var(--surface-soft); color:var(--fg2); font:700 .75rem/1 var(--font-sans); font-variant-numeric:tabular-nums` (remove the old margin and mono). Hover: `color:var(--fg); translate:0 -1px`. Active: `scale:.97`. **Pressed** `[aria-pressed="true"]`: `background:var(--primary-skin); color:var(--on-primary); border-color:transparent; box-shadow:var(--primary-shadow), var(--primary-glow)`, and its count `background:var(--count-on-primary); color:var(--on-primary)`. Pressed + hover: no translate. **Zero** `.chip--zero:not([aria-pressed="true"])`: `background:transparent; box-shadow:none; border:1px dashed var(--border-strong); color:var(--muted)`, with count `background:transparent; color:var(--muted)`. Still operable, never `disabled`. |
| **Prism glyph** (`.brand > span`, `.projects-empty::before`) | `width:20px; height:18px; clip-path:polygon(50% 0, 100% 100%, 0 100%); background:conic-gradient(from 210deg at 50% 66%, var(--prism-1), var(--prism-2), var(--prism-3), var(--prism-4), var(--prism-1)); transform-origin:50% 66.67%; transition: rotate 700ms var(--ease-spring)`. |
| **Visually hidden** (`.vh`) | Unchanged. |

**Forced colours** (`@media (forced-colors: active)`):
- Plates, chips, buttons and the header pill get `border: 1px solid CanvasText`.
- Gradient text gets `background: none; color: CanvasText; -webkit-text-fill-color: CanvasText`.
- The pressed chip gets `background: Highlight; color: HighlightText; forced-color-adjust: none`.
- `.text-link` uses `text-decoration: underline`, and its `::before`/`::after` are hidden.
- `.prism`, the body blobs and `.nf__schematic` are `display: none`.
- Focus uses `outline-color: Highlight`.

---

## 5. Motion system

### 5.1 Principles and gating (hard rules)

1. **Content is visible at rest.** Nothing is hidden waiting for JS. There are three gates:
   - `html.js`: set by the inline head script before first paint. It gates only the **hero entrance**, which is pure CSS with `animation-fill-mode: both` and is fully settled by 1.8s even if `site.js` never loads.
   - `html.motion`: added by `60-motion.js` when it runs, only if motion is allowed and `IntersectionObserver` exists. It gates **scroll reveals** and the **ambient loops**.
   - `html.motion-paused`: set by the motion toggle. It pauses the loops.
2. Scroll-reveal hides **only** elements that are entirely below the fold at init. Elements already on screen are never hidden, so nothing flashes. A watchdog reveals everything if the observer never reports (§5.4).
3. **Under `prefers-reduced-motion: reduce`, motion is off.** All keyframes and transforms are disabled:
   - Every keyframe/transition is wrapped in `@media (prefers-reduced-motion: no-preference)` or neutralised by the existing global reduce rule in `10-base.css` (keep that rule).
   - JS modules return early, so there is no `.motion` class, no tilt/magnet/parallax, no count-up, no FLIP, and no view transition.
   - Colour changes on hover remain, and are instant.
4. **Compositor-friendly.** Keyframed, scroll-triggered and pointer-driven animation uses only `transform` / `translate` / `rotate` / `scale` / `opacity`. Simple hover transitions may also change `color`, `box-shadow` or `border-color`. The only exception is the one-off theme reveal (`clip-path` on view-transition snapshots).
   - The individual transform properties are deliberately split so effects never fight:
     - `translate`: reveal, hover lift, magnet, parallax
     - `transform`: tilt, keyframe floats, FLIP
     - `scale`: press, chip pop
     - `rotate`: prism spin, glyph spin
5. **No inline `style` attributes in markup.** The CSP is `style-src 'self'`. Per-element values (`--rd`, `--rx`, `--px`…) are set from JS with `el.style.setProperty()`, which CSSOM allows. Never use `setAttribute('style', …)`. Static per-index values use `:nth-child` rules in CSS, as the hero already does.
6. **Performance.**
   - Pointer handlers are rAF-throttled, with one pending frame per module.
   - Rects are measured on `pointerenter` and on scroll, never per move.
   - The hero loops pause when the hero is offscreen. Browsers throttle background tabs.
   - `will-change` is never set globally.
7. **Budget.** The motion JS added by this spec totals **≤ 6 KB raw**. The build does not minify. Per module: `60-motion.js` ≤ 2.6 KB, `61-pointer.js` ≤ 1.6 KB, additions to `30-filter.js` ≤ 1.2 KB, additions to `10-theme.js` ≤ 0.6 KB. Test: `dist/assets/site.js` ≤ 14,000 bytes (it is about 7.6 KB today).

### 5.2 Hero load sequence (CSS, `40-hero.css`, inside `@media (prefers-reduced-motion: no-preference)`)

```css
@keyframes rise      { from { opacity: .001; transform: translateY(18px) scale(.985); } }
@keyframes word-up   { from { transform: translateY(105%); } }
@keyframes header-in { from { opacity: .001; transform: translateY(-10px); } }
@keyframes prism-in  { from { opacity: .001; transform: scale(.88) rotate(-6deg); } }
@keyframes chip-in   { from { opacity: .001; transform: scale(.8); } }
@keyframes fade-in   { from { opacity: .001; } }
```

| # | Element (selector, all prefixed `.js`) | Keyframes | Duration | Easing | Delay |
|---|---|---|---|---|---|
| 1 | `.site-header` | header-in | 600ms | `--ease-out` | 0 |
| 2 | `.hero .eyebrow` | rise | 900ms | `--ease-rise` | 60ms |
| 3 | `.hero h1 .w:nth-of-type(1) > span` | word-up | 1000ms | `--ease-rise` | 120ms |
| 4 | `.hero h1 .w:nth-of-type(2) > span` (and any later word: +100ms each) | word-up | 1000ms | `--ease-rise` | 220ms |
| 5 | `.roles li:nth-child(n)` | rise | 800ms | `--ease-rise` | 380ms + 60ms·(n−1) |
| 6 | `.hero__headline` | rise | 900ms | `--ease-rise` | 520ms |
| 7 | `.hero__sub` | rise | 900ms | `--ease-rise` | 600ms |
| 8 | `.hero__ctas > :nth-child(n)` | rise | 800ms | `--ease-rise` | 700ms + 70ms·(n−1) |
| 9 | `.prism` | prism-in | 1200ms | `--ease-rise` | 200ms |
| 10 | `.schematic` | rise | 900ms | `--ease-rise` | 650ms |
| 11 | `.schematic__domains li` (`--i` via the existing nth-child rules) | chip-in | 500ms | `--ease-spring` | `calc(800ms + var(--i) * 40ms)` |
| 12 | `.motion-toggle` | fade-in | 400ms | linear | 1200ms |
| 13 | `.stats` | rise | 900ms | `--ease-rise` | 820ms (count-up §5.5 starts at 900ms) |

All use `animation-fill-mode: both`. Delete the old schematic `bus-in` / `domain-in` / `origin-in` keyframes and `.schematic::before` bus lines.

The h1 word mask: `.hero h1 .w { display:inline-block; overflow:hidden; overflow:clip; padding-block-end:.12em; margin-block-end:-.12em; vertical-align:top; } .hero h1 .w > span { display:inline-block; }`. Descenders are protected by the padding.

### 5.3 Ambient loops (CSS; gated `.motion`, paused by `.motion-paused`)

```css
@media (prefers-reduced-motion: no-preference) {
  @keyframes drift-a { 50% { transform: translate(10vw, 12vh) scale(1.1); } 100% { transform: translate(-4vw, 22vh) scale(.95); } }
  @keyframes drift-b { 50% { transform: translate(-12vw, -8vh) scale(1.12); } 100% { transform: translate(-4vw, -20vh) scale(.96); } }
  @keyframes prism-spin   { to { rotate: 360deg; } }
  @keyframes prism-float  { from { transform: translateY(-6px); } to { transform: translateY(6px); } }
  @keyframes shadow-float { from { transform: scale(.9); opacity: .7; } to { transform: scale(1.05); opacity: 1; } }
  @keyframes glow-breathe { from { transform: scale(.94); opacity: .7; } to { transform: scale(1.06); opacity: 1; } }
  @keyframes shard-float  { from { transform: translateY(-8px) rotate(var(--r)); } to { transform: translateY(8px) rotate(calc(var(--r) + 5deg)); } }
  @keyframes beam-pulse   { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
  @keyframes spectrum-breathe { from { transform: scaleX(.9); opacity: .45; } to { transform: scaleX(1); opacity: .75; } }

  .motion body::before { animation: drift-a 46s var(--ease-in-out) infinite alternate; }
  .motion body::after  { animation: drift-b 58s var(--ease-in-out) infinite alternate; }
  .motion .prism__body::before { animation: prism-spin 24s linear infinite; }
  .motion .prism__body   { animation: prism-float 9s var(--ease-in-out) infinite alternate; }
  .motion .prism__shadow { animation: shadow-float 9s var(--ease-in-out) infinite alternate-reverse; }
  .motion .prism__glow   { animation: glow-breathe 8s var(--ease-in-out) infinite alternate; }
  .motion .prism__beam   { animation: beam-pulse 4s var(--ease-in-out) infinite; }
  .motion .prism__spectrum { animation: spectrum-breathe 6s var(--ease-in-out) infinite alternate; }
  .motion .prism__shard--1 { animation: shard-float 7s var(--ease-in-out) infinite alternate; }
  .motion .prism__shard--2 { animation: shard-float 9s var(--ease-in-out) -2s infinite alternate; }
  .motion .prism__shard--3 { animation: shard-float 11s var(--ease-in-out) -5s infinite alternate; }

  .motion-paused body::before, .motion-paused body::after,
  .motion-paused .prism *, .motion-paused .prism *::before,
  .prism.is-idle *, .prism.is-idle *::before { animation-play-state: paused !important; }
}
```

No-JS and reduced-motion users get a static field and a static prism (the conic gradient at 0deg). That is a complete design, not a broken one.

### 5.4 Scroll reveal (`60-motion.js` + `15-motion.css`)

Markup hook: a `data-reveal` attribute (no value) on each element listed in §10.1.

```css
@media (prefers-reduced-motion: no-preference) {
  .motion [data-reveal].is-pending { opacity: 0; translate: 0 28px; scale: .985; }
  .motion [data-reveal].is-revealing {
    transition: opacity 700ms var(--ease-rise), translate var(--dur-4) var(--ease-rise), scale var(--dur-4) var(--ease-rise);
    transition-delay: var(--rd, 0ms);
  }
}
@media print { [data-reveal].is-pending { opacity: 1 !important; translate: none !important; scale: none !important; } }
```

JS behaviour (exact):
1. Collect `[data-reveal]`. For each element whose `getBoundingClientRect().top > innerHeight * 0.92`, add `.is-pending`. All other elements are untouched.
2. Create one `IntersectionObserver` with `{ rootMargin: "0px 0px -8% 0px", threshold: 0.12 }` and observe the pending elements.
3. In each callback batch, take the intersecting entries in order (IO delivers them in observation order, which is DOM order) and reveal entry *k* with delay `min(k, 6) × 70ms`. To reveal:
   - set `--rd`
   - add `.is-revealing`, remove `.is-pending`
   - `unobserve`
   - after `1400ms + delay`, remove `.is-revealing` and `--rd`, so hover transitions of cards are not slowed by the reveal transition.
4. **Watchdog:** if the observer has not called back within 1500ms of init, reveal everything.
5. `focusin` on the document: if `e.target.closest('.is-pending')` matches, reveal that element immediately. This covers keyboard and find-in-page focus.
6. `beforeprint`: reveal everything.
7. Hidden elements (filtered cards with `hidden`) stay pending harmlessly. `30-filter.js` removes `.is-pending` from every card on the first filter interaction (§5.6).

### 5.5 Stats count-up (`60-motion.js`)

- Target: `.stats .stat__value`. Parse `textContent.trim()` with `/^(\D*)(\d+)(.*)$/` into prefix, number and suffix. If it doesn't match, skip that value.
- Start value: `0`, or `end − 10` when `end ≥ 1000` (years: "2016" ticks 2006 → 2016 instead of 0 → 2016). End value is the parsed number.
- Duration 1400ms, easing easeOutExpo `t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)`, rounded to an integer. Stagger 120ms per stat. Starts when `.stats` is ≥ 50% visible (its own IO, unobserved after the first run). If it is visible at init, the start is delayed to 900ms after navigation start so it lines up with the hero sequence.
- If init happens later than 900ms (`performance.now() > 900`) **and** the stats are already visible, skip the count-up and leave the final values. This prevents a "final value → 0 → count" flash on slow loads.
- Accessibility and layout:
  - Before animating, measure `offsetWidth` and set `style.minWidth` to it (in px).
  - Replace the content with `<span aria-hidden="true">{animated}</span><span class="vh">{original text}</span>`, built with DOM APIs, not innerHTML.
  - Screen readers always read the true value.
  - `.stat__value` is `display:inline-block`, and `.stat__label` stays `display:block`.

### 5.6 Filter transitions (`30-filter.js` additions)

Behaviour (`ux.md` §4.7) is unchanged: state, `aria-pressed`, counts, the live region, the URL and the empty state are all updated **synchronously** on click, as now. Only the card DOM swap is animated, and only when `html.motion` is present and the initial load render has already happened.

1. **Leave (160ms):** cards that will be hidden run `el.animate([{opacity:1, scale:1},{opacity:0, scale:.94}], {duration:160, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards'})`.
2. **Swap (after 160ms, or immediately if no card leaves):**
   - Record `getBoundingClientRect()` of the currently visible cards (First).
   - Cancel the leave animations, apply `hidden`, and toggle `grid`/`empty` exactly as today.
   - Remove `.is-pending` from all cards.
3. **FLIP:** for each card visible both before and after, compute the delta from First to its new rect. If it is non-zero, run `el.animate([{transform:`translate(${dx}px, ${dy}px)`},{transform:'none'}], {duration:420, easing:'cubic-bezier(.2,.8,.2,1)'})`.
4. **Enter:** newly shown cards get `.is-entering` with `--rd = min(k, 8) × 35ms`. The class is removed on `animationend`, as today.
   ```css
   @keyframes card-in { from { opacity: 0; scale: .94; translate: 0 12px; } }
   .card.is-entering { animation: card-in 360ms var(--ease-rise) var(--rd, 0ms) both; }
   ```
   (Keep the CSS inside the no-preference media query, and delete the old 4px version.)
5. **Interrupts:** a click during a pending leave clears the timeout, finishes the swap immediately for the previous target, then runs the new transition.
6. Extend the existing grid `min-height` hold release from 200ms to 600ms when animating.
7. Focus stays on the chip, and the reset button still focuses the category "All" chip.

### 5.7 Card hover: lift, sheen, tilt (`60-work.css` + `61-pointer.js`)

CSS (works without JS; the tilt needs JS):

```css
.card { position: relative; overflow: hidden; isolation: isolate;
        transition: translate var(--dur-3) var(--ease-spring), box-shadow var(--dur-2) var(--ease-out), transform 600ms var(--ease-out); }
.card.is-tilt { transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
.card.is-tilt.is-tracking { transition-duration: var(--dur-3), var(--dur-2), 120ms; }
.card::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; pointer-events: none;
               background: linear-gradient(115deg, transparent 35%, var(--sheen) 50%, transparent 65%); transform: translateX(-110%); }
@keyframes card-sheen { from { transform: translateX(-110%); } to { transform: translateX(110%); } }
@media (prefers-reduced-motion: no-preference) {
  @media (hover: hover) and (pointer: fine) {
    .card:hover { translate: 0 -6px; box-shadow: var(--shadow-lift); }
    .card:hover::after { animation: card-sheen 1000ms var(--ease-out) 1; }
  }
  .card:focus-within { translate: 0 -6px; box-shadow: var(--shadow-lift); }
}
@media (prefers-reduced-motion: reduce) { .card:hover, .card:focus-within { box-shadow: var(--shadow-lift); } }
```

JS tilt (`61-pointer.js`; runs only if `(hover: hover) and (pointer: fine)` matches, reduced motion does not, and `(min-width: 1024px)` matches at event time):
- Delegate `pointermove` on `#project-list`. When the card under the pointer changes:
  - reset the previous card
  - add `.is-tilt.is-tracking` to the new one
  - cache its rect (re-measure on `scroll`, passive).
- Per rAF: `x = (clientX − left)/width − .5`, `y = (clientY − top)/height − .5`. Set `--ry = (x × 8).toFixed(2) + "deg"` and `--rx = (−y × 6).toFixed(2) + "deg"`, for a maximum of ±4°/±3°.
- On `pointerleave` of the grid or the card:
  - remove `.is-tracking` and the two properties, so it eases back over 600ms
  - remove `.is-tilt` after 600ms, unless re-entered.
- Applies to both kinds of card. Case-study cards still contain no link, and the cursor stays default.

### 5.8 Process timeline drawing (`50-sections.css`; triggered by `.process[data-reveal]`)

The line is fully drawn at rest. With `.motion`, when `.process` is pending the line is collapsed, and it draws when the element reveals:

```css
.process::after { transition: scale var(--dur-5) var(--ease-in-out) 150ms; }
.process > li::before { transition: scale 520ms var(--ease-spring), opacity 300ms var(--ease-out); transition-delay: calc(250ms + var(--n) * 280ms); }
.process > li:nth-child(1) { --n: 0; } /* … through :nth-child(8) { --n: 7; } */
@media (prefers-reduced-motion: no-preference) {
  .motion .process.is-pending::after { scale: 0 1; }        /* lg horizontal; base/md vertical uses scale: 1 0 */
  .motion .process.is-pending > li::before { scale: .4; opacity: 0; }
}
```

Geometry is in §6.9. Under reduced motion or no-JS there is no pending state, so the line is drawn and the nodes are shown.

### 5.9 Buttons, links, toggles

- **Magnetic primary buttons** (`61-pointer.js`, fine pointer only): applies to every `.btn--primary` that is not the skip link.
  - On `pointerenter` add `.is-magnet` (sets `transition-duration: 160ms` on translate).
  - On `pointermove` (rAF): `dx = clientX − centreX`, `dy = clientY − centreY`. Set `--mx = clamp(dx × .22, −6, 6)px`, `--my = clamp(dy × .35, −4, 4)px`, `--gx = dx px`, `--gy = dy px`.
  - On `pointerleave`: remove the class and the four properties. It springs back with `--dur-3 --ease-spring`.
- **Animated underline:** `.text-link::after` scales 0 → 1 from the left over 420ms (§4.3), and the arrow nudges 2px up and to the right.
- **Theme toggle morph:** `.theme-toggle svg { transition: opacity var(--dur-2) var(--ease-out), rotate 520ms var(--ease-spring), scale 520ms var(--ease-spring); }`. `[data-theme="dark"] .theme-toggle .icon-moon, [data-theme="light"] .theme-toggle .icon-sun { opacity:0; rotate:-120deg; scale:.4; }`. Replace the old `display:none` rule in `20-components.css`. The icon still shows the target theme (sun in dark).
- **Menu button morph:** the same stacked crossfade between `.icon-menu` and `.icon-x`, keyed on `[aria-expanded]`, with `rotate: 90deg; scale: .4` for the hidden icon. Replace the `display` rules.
- **Copy button success:** `.copy-btn.is-copied { color: var(--cyan-text); }`. `.copy-btn .icon-check` uses the same stacked-crossfade pattern, and when copied it plays `@keyframes pop { 0% { scale:.5 } 60% { scale:1.15 } 100% { scale:1 } }` over 360ms `--ease-spring`.
- **Theme reveal** (`10-theme.js`): on click, if `document.startViewTransition` exists and reduced motion does not match:
  ```js
  const r = button.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  root.style.setProperty('--vt-x', x + 'px'); root.style.setProperty('--vt-y', y + 'px');
  root.style.setProperty('--vt-r', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
  document.startViewTransition(() => update(next));
  ```
  Otherwise call `update(next)` directly. The storage write stays after either path.
  ```css
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
  @media (prefers-reduced-motion: no-preference) {
    ::view-transition-new(root) { animation: theme-reveal 620ms var(--ease-in-out); }
    @keyframes theme-reveal { from { clip-path: circle(0 at var(--vt-x, 100%) var(--vt-y, 0)); }
                              to   { clip-path: circle(var(--vt-r, 150vmax) at var(--vt-x, 100%) var(--vt-y, 0)); } }
  }
  ```

### 5.10 Header becomes a frosted plate on scroll (`60-motion.js`, runs even under reduced motion)

- Passive `scroll` listener, rAF-throttled: `header.classList.toggle('is-scrolled', scrollY > 12)`. Also run it once on init (for reloads mid-page).
- Visuals are in §6.1. The plate fades and settles: opacity 0 → 1 and `scale .985 → 1` over 320ms `--ease-out`. Under reduced motion it changes instantly.

### 5.11 Hero parallax and offscreen pause (`61-pointer.js`, `60-motion.js`)

- **Parallax** (fine pointer, ≥ 1024px, no reduced motion):
  - `pointermove` on `.hero`, rAF: `px = clamp((clientX − prismCentreX) / (hero.width / 2), −1, 1)`, and likewise `py` with height. Set `--px` and `--py` on `.prism`.
  - On `pointerleave`, set both to `0`.
  - CSS: `.prism > * { translate: calc(var(--px, 0) * var(--z, .25) * 18px) calc(var(--py, 0) * var(--z, .25) * 18px); transition: translate 700ms var(--ease-out); }`, with `--z` per layer: glow `-.5`, beam and spectrum `.3`, body `.25`, shard-1 `.6`, shard-2 `1`, shard-3 `.4`.
- **Offscreen pause:** an IO on `.hero` (threshold 0) toggles `.prism.is-idle` when the hero is not intersecting.

### 5.12 JS module boundaries (each file is an IIFE that no-ops if its hooks are absent, so the same bundle runs on `/` and `/404.html`)

| File | Responsibility | Hooks | Early exit |
|---|---|---|---|
| `10-theme.js` (edit) | Existing toggle + view-transition reveal (§5.9) | `.theme-toggle` | none (reveal skipped under reduced motion) |
| `20-nav.js` | Unchanged | — | — |
| `30-filter.js` (edit) | Existing filter + leave/FLIP/enter (§5.6). Reads `document.documentElement.classList.contains('motion')` at click time | `#work` | Animation parts skipped if there is no `.motion` |
| `40-copy.js` | Unchanged (CSS handles the pop) | — | — |
| `50-scrollspy.js` | Unchanged | — | — |
| `60-motion.js` (new) | (a) header `is-scrolled` (always). Then return if reduced motion or no IO. (b) motion toggle: read storage, set `motion-paused`, un-hide the button, label swap on click, `try{localStorage.setItem('motion', …)}catch{}`. (c) add `html.motion`. (d) scroll reveal (§5.4). (e) count-up (§5.5). (f) hero offscreen pause (§5.11) | `.site-header`, `.motion-toggle`, `[data-reveal]`, `.stats`, `.hero .prism` | per feature |
| `61-pointer.js` (new) | Tilt (§5.7), magnet (§5.9), parallax (§5.11) | `#project-list`, `.btn--primary`, `.hero .prism` | reduced motion, or not `(hover:hover) and (pointer:fine)` |

Order matters: (b) must run before (c), so a paused user never sees the loops start.

---

## 6. Screen and section specs (visual). DOM order, copy and behaviour follow `ux.md` §4

### 6.1 Header (`30-header.css`)

```
top of page (transparent)                          scrolled (.is-scrolled: frosted pill)
  ▲ Islam Elsayed   About Stack Work Services Contact (☼)     ╭───────────────────────────────────────────────────────╮
                                                              │ ▲ Islam Elsayed  (About) Stack Work Services Contact (☼)│
                                                              ╰───────────────────────────────────────────────────────╯
base <768:  ╭ ▲ Islam Elsayed            (☼) (≡) ╮      open menu: plate panel 8px below the pill
```

- `.site-header`: `position:sticky; top:0; z-index:50; padding-block:8px` (md `10px`). Transparent background, no border. Delete the old `height`/`border` rules.
- `.header-inner`:
  - `position:relative; isolation:isolate; min-height:52px` (md `56px`); `padding-inline:16px 6px` (md `20px 8px`); `border-radius:var(--r-pill)`
  - grid on base: `1fr 44px 44px`, gap 8px; `:not(:has(.menu-btn))` (404 page) uses `1fr 44px`
  - md+: flex, as now.
- `.header-inner::before` (the plate):
  - `content:""; position:absolute; inset:0; z-index:-1; border-radius:inherit`
  - `background:var(--shell); -webkit-backdrop-filter:var(--glass-blur); backdrop-filter:var(--glass-blur); border:1px solid var(--rim); box-shadow:var(--shadow-card)`
  - rest state: `opacity:0; scale:.985; transition: opacity 320ms var(--ease-out), scale 320ms var(--ease-out)`
  - visible state (`opacity:1; scale:1`) when any of these match: `.site-header.is-scrolled`, `.site-header:has(.menu-btn[aria-expanded="true"])`, `.no-js .site-header`
  - no-JS: radius `var(--r-plate)`, because the nav may wrap to two rows.
- **Brand** `.brand`: `gap:10px; min-height:44px; font:700 1.125rem/1 var(--font-display); color:var(--fg); letter-spacing:-.01em`. The `span` is the prism glyph (§4.3). Hover: `.brand:hover span { rotate:120deg }`.
- **Nav md+**:
  - `#primary-nav a`: `min-height:44px; padding-inline:14px; border-radius:var(--r-pill); color:var(--fg2); font:600 .9375rem/1 var(--font-sans); transition: color var(--dur-1), background-color var(--dur-2)`
  - Hover: `color:var(--fg); background-color: rgb(255 255 255 / .06)` (light `rgb(43 37 59 / .05)`)
  - **Current** `[aria-current="true"]`: `background:var(--nav-sel); color:var(--brand)`. Delete the amber `::after` bar.
- **Mobile menu panel** (<768, `#primary-nav` when not hidden):
  - `position:absolute; top:calc(100% + 8px); inset-inline:0` (relative to `.header-inner`)
  - `padding:8px; border-radius:var(--r-plate); background:var(--shell); backdrop-filter:var(--glass-blur); border:1px solid var(--rim); box-shadow:var(--shadow-pop)`
  - Links: `min-height:52px; padding-inline:16px; border-radius:var(--r-ctl); font:600 1.0625rem var(--font-sans); color:var(--fg); border:0`. Hover/focus: `background:var(--surface-soft)`. Current: nav-sel + brand.
  - Entrance: `@keyframes menu-in { from { opacity:0; transform: translateY(-8px) scale(.98); } }`, 240ms `--ease-out`, `transform-origin: top right`.
- Theme toggle and menu button use `.icon-btn` (§4.3) with the morphs from §5.9.
- **Skip link** `.skip`: primary-skin pill, `padding:12px 22px`, `color:var(--on-primary)`, `box-shadow:var(--shadow-pop)`. Position behaviour is unchanged.
- No-JS behaviour is unchanged from `ux.md` §4.2 (static header, wrapped nav, buttons hidden).

### 6.2 Hero (`40-hero.css`)

```
lg ≥1024 (12 cols; text 1–7, visual 8–12)
┌────────────────────────────────────────────────────┬──────────────────────────────────────┐
│ (● SHIFTCODES / ENGINEERING)                        │ (⏸)                    ◇ shard        │
│ Islam                       Outfit 800, --fg         │        glow  ╱▲╲                      │
│ Elsayed                     gradient --grad-name     │  beam ────▶ ╱▲▲▲╲ ═══ spectrum ═══    │
│ Founder @ ShiftCodes · Systems Architect · Senior … │   ◇        ╱▲▲▲▲▲╲                     │
│ Building production software for complex operations.│         ‿‿‿ shadow ‿‿‿                │
│ I design and ship the systems businesses run on …   │  ╭ domains plate (glass, overlaps) ─╮ │
│ [ View selected work ↓ ]  ( ✉ Start a conversation ) │  │ (●ERP)(●Analytics)(●Banking)…     │ │
│ GitHub ↗                                            │  │ ▲ Alexandria, Egypt · Egypt → ME  │ │
│                                                     │  ╰──────────────────────────────────╯ │
├────────────────────────────────────────────────────┴──────────────────────────────────────┤
│ ╭ stats plate ───────────────────────────────────────────────────────────────────────────╮ │
│ │ 40%+                     │ 7                          │ 2016                          │ │
│ │ faster loads delivered … │ domains shipped: ERP, …    │ writing and publishing code … │ │
│ ╰────────────────────────────────────────────────────────────────────────────────────────╯ │
base 360: text stack → CTAs full width → prism (240px) → domains plate (overlaps −40px) → stats plate
```

**Markup changes in `hero.mjs`** (keep everything else, and keep exactly 3 `<a ` in the hero):

```html
<h1 id="hero-name"><span class="w"><span>Islam</span></span> <span class="w w--accent"><span>Elsayed</span></span></h1>
<!-- words = name.split(/\s+/); the last word gets w--accent; words are joined by a single space text node -->
…
<div class="hero__visual">
  <div class="prism" aria-hidden="true">
    <span class="prism__glow"></span><span class="prism__shadow"></span>
    <span class="prism__beam"></span><span class="prism__spectrum"></span>
    <span class="prism__body"></span>
    <span class="prism__shard prism__shard--1"></span><span class="prism__shard prism__shard--2"></span><span class="prism__shard prism__shard--3"></span>
  </div>
  <button type="button" class="icon-btn motion-toggle" hidden aria-label="{hero.motionToggle.pause}" title="{same}"
          data-label-pause="{hero.motionToggle.pause}" data-label-play="{hero.motionToggle.play}">{icon pause}{icon play}</button>
  <div class="schematic">…existing ul.schematic__domains + p.schematic__origin, unchanged…</div>
</div>
```

The `.schematic` element moves inside `.hero__visual`, and `.hero__visual` takes `.schematic`'s place in `.hero__grid`. The motion toggle shows the pause icon when playing and the play icon when paused (`.motion-paused .motion-toggle .icon-pause` hidden via the stacked-crossfade pattern). Add Lucide `pause` and `play` to `icons.mjs` (ISC, copy the current Lucide paths).

**Layout:**
- `.hero`: `padding-block: 32px 64px` (md `56px 80px`, lg `72px 96px`).
- `.hero__grid`: one column with gap `40px`. At lg it becomes 12 columns, gap 24 (xl 32): `.hero__text` takes `1 / 8` and `.hero__visual` takes `8 / 13; align-self:center`.
- `.hero__visual`: `position:relative`.
- `.motion-toggle`: `position:absolute; top:0; inset-inline-end:0; z-index:2`.

**Text:**
- `.eyebrow`: §4.3.
- `h1`:
  - `margin-block-start:20px; max-width:10ch; font:800 var(--fs-display)/var(--lh-tight) var(--font-display); letter-spacing:var(--tracking-display); color:var(--fg); overflow-wrap:anywhere`
  - `.w--accent > span`: `background:var(--grad-name); -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent`
- `.roles`:
  - `margin-block-start:20px; font:600 1.0625rem/1.5 var(--font-sans); color:var(--fg2)` (lg `1.1875rem`)
  - first `li`: `color:var(--fg)`
  - separator `li + li::before { content:"·" / ""; margin-inline:.55em; color:var(--muted) }`
- `.hero__headline`: `margin-block-start:28px; max-width:26ch; font:600 var(--fs-lead)/var(--lh-snug) var(--font-display); color:var(--fg)`.
- `.hero__sub`: `margin-block-start:14px; max-width:56ch; color:var(--fg2)`.
- `.hero__ctas`: `margin-block-start:32px; gap:12px 14px`.
  - base: `.btn` at `width:100%`, GitHub `.text-link` on its own line
  - md+: auto widths, everything on one row.

**Prism** (all children `position:absolute; pointer-events:none`):

```css
.prism { --s: 240px; position: relative; width: min(100%, var(--s)); aspect-ratio: 1; margin-inline: auto; }
@media (min-width: 768px)  { .prism { --s: 320px; } }
@media (min-width: 1024px) { .prism { --s: 420px; } }
.prism__glow   { inset: 8%; border-radius: 50%; --z: -.5;
                 background: radial-gradient(circle at 38% 40%, var(--glow-a), transparent 62%), radial-gradient(circle at 66% 66%, var(--glow-b), transparent 60%); }
.prism__shadow { inset-inline: 24%; bottom: 12%; height: 7%; border-radius: 50%; background: radial-gradient(closest-side, var(--prism-shadow), transparent); }
.prism__beam   { inset-inline-start: 0; top: 57%; width: 38%; height: 2px; border-radius: 2px; rotate: -9deg; transform-origin: right center; --z: .3;
                 background: linear-gradient(90deg, transparent, var(--beam)); }
.prism__spectrum { inset-inline-start: 60%; top: 38%; width: 42%; height: 36%; transform-origin: left center; opacity: .6; --z: .3;
                   clip-path: polygon(0 46%, 100% 0, 100% 100%, 0 56%);
                   background: linear-gradient(180deg, var(--prism-1), var(--prism-2) 34%, var(--prism-3) 67%, var(--prism-4)); }
.prism__body   { inset: 16% 19% 22%; clip-path: polygon(50% 0, 100% 100%, 0 100%); overflow: hidden; --z: .25; }
.prism__body::before { content: ""; position: absolute; inset: -50%;
                 background: conic-gradient(from 0deg, var(--prism-1), var(--prism-2), var(--prism-3), var(--prism-4), var(--prism-2), var(--prism-1)); }
.prism__body::after  { content: ""; position: absolute; inset: 0;
                 background: linear-gradient(104deg, rgb(255 255 255 / .42) 0 34%, rgb(255 255 255 / .08) 34% 62%, rgb(14 8 30 / .28) 62% 100%),
                             linear-gradient(180deg, rgb(255 255 255 / .2), transparent 40%); }
.prism__shard  { width: var(--w); height: var(--h); border-radius: 12px; background: var(--plate); border: 1px solid var(--rim);
                 box-shadow: var(--shadow-card); transform: rotate(var(--r)); }
.prism__shard--1 { --w: 15%; --h: 19%; --r: -14deg; --z: .6; top: 6%;  inset-inline-start: 4%; }
.prism__shard--2 { --w: 10%; --h: 10%; --r: 18deg;  --z: 1;  top: 12%; inset-inline-end: 6%; background: var(--plate-brand); }
.prism__shard--3 { --w: 8%;  --h: 12%; --r: 8deg;   --z: .4; bottom: 18%; inset-inline-start: 10%; background: var(--plate-cyan); }
```

Parallax `translate` is in §5.11. Note that the `.prism > *` translate rule must not be overridden by the `rotate` of the beam: they are separate properties, so this is safe. After building, check by eye that the three facets read as glass. Adjusting the 34%/62% stops ±6% is allowed.

**Domains plate** (`.schematic`):
- `position:relative; z-index:1; max-width:440px; margin:-40px auto 0` (lg `-64px auto 0`)
- `padding:18px 20px; border-radius:var(--r-plate); background:var(--shell); backdrop-filter:var(--glass-blur); border:1px solid var(--rim); box-shadow:var(--shadow-pop)`.
- `.schematic__domains`: `display:flex; flex-wrap:wrap; gap:8px`. The lg column layout is removed.
  - Each `li` is a tag (§4.3), plus `::before` 7px dot (`margin-inline-end:6px`): `:nth-child(3n+1)` brand, `3n+2` cyan, `3n` crown. Delete the connector `::before` lines.
- `.schematic__origin`:
  - `margin-block-start:14px; padding-block-start:14px; padding-inline-start:28px; border-block-start:1px solid var(--border-soft); font:500 var(--fs-small)/1.4 var(--font-sans); color:var(--fg2)`
  - The first span is `color:var(--fg); font-weight:600`.
  - `::before` is a 16×14 prism glyph at `inset-inline-start:0; top:calc(14px + .2em)`, replacing the rotated square.

**Stats plate** (`.stats`):
- `margin-block-start:56px` (md 72, lg 96); plate (§4.2); `padding:4px 24px`.
- Items are stacked with `border-block-start:1px solid var(--border-soft)` between them. At md+ use `grid-template-columns:repeat(3, minmax(0, 1fr))` with `border-inline-start` dividers.
- `li`: `padding-block:24px` (md `28px`). md+: `padding-inline:24px`, with the first item at `0` start.
- `.stat__value`:
  - `display:inline-block; font:700 var(--fs-stat)/1 var(--font-display); letter-spacing:-.02em; font-variant-numeric:tabular-nums lining-nums`
  - gradient text with `--grad-accent`.
- `.stat__label`: `display:block; margin-block-start:10px; max-width:32ch; color:var(--fg2); font-size:var(--fs-small)`.
- Empty `c.stats` → not rendered (unchanged).

### 6.3 About (`50-sections.css`)

- The lg grid is kept (the h2 is sticky in `1 / 5`; the body is in `5 / -1`). The section-head index pill spans the full row.
- `.about__body`: plate, `padding:28px` (md `36px`, lg `40px`), `max-width:none`, inner text `max-width:66ch`.
  - `p.lead` (p1): `font:600 var(--fs-lead)/var(--lh-snug) var(--font-display); color:var(--fg)`.
  - `p + p`: `margin-block-start:20px; color:var(--fg2)`.
- `data-reveal` on `.section-head` and `.about__body`.

### 6.4 Experience (timeline)

- `.experience`:
  - `position:relative; padding-inline-start:36px; border:0`
  - `::before` (rail): `content:""; position:absolute; inset-inline-start:11px; inset-block:28px 28px; width:2px; border-radius:2px; background:linear-gradient(180deg, var(--brand-line), var(--brand), var(--cyan))`.
- `.experience > li`:
  - plate, `position:relative; padding:24px` (md `32px`); `display:grid; gap:12px` (the lg 1fr/2fr grid placement is kept)
  - `+ li { margin-block-start:20px }`
  - `::before` (node): `content:""; position:absolute; inset-inline-start:-31px; top:32px; width:16px; height:16px; border-radius:50%; background:var(--primary-skin); box-shadow:0 0 0 5px var(--nav-sel)`.
- `.exp__org a`: `.text-link` with `font:700 1.5rem/1.2 var(--font-display)`.
- `.exp__loc`: chip look, `justify-self:start; padding:4px 12px; border-radius:var(--r-pill); background:var(--surface-soft); color:var(--fg2); font:700 .75rem/16px var(--font-sans); letter-spacing:.06em; text-transform:uppercase`.
- `h3`: Outfit 600 `--fs-h3`. `.exp__summary`: `--fg2`, max 68ch. No dates (unchanged).
- `data-reveal` on each `li`.

### 6.5 Stack / skills

- `.skills`: `display:grid; gap:16px; grid-template-columns:1fr`. md: 2 columns, gap 20. lg: 3 columns. Delete the lg spec-table rules (`.skill-group { display:grid; 1fr 2fr }`).
- `.skill-group`:
  - plate, `padding:22px; border-radius:var(--r-plate); border-block-end` removed
  - `display:flex; flex-direction:column; gap:16px`.
- `.skill-group__head`:
  - `display:flex; align-items:center; gap:12px; margin:0`
  - `> span` (S1…S6): `display:grid; place-items:center; width:40px; height:40px; border-radius:var(--r-ctl); background:var(--nav-sel); color:var(--brand); font:700 .875rem var(--font-display)`
  - `h3`: Outfit 600.
- Tags: §4.3, gap 8px.
- `data-reveal` on each `.skill-group`, so the IO batch stagger cascades the grid.

### 6.6 Work: filters and cards (`60-work.css`)

- `#work .lead`: `color:var(--fg2)`, Jakarta 500 `--fs-lead`.
- `.filters` (still `hidden` without JS):
  - plate, `margin-block:32px 28px; padding:20px` (md `24px`); `display:grid; gap:20px`
  - `[role="group"]`: `display:flex; flex-wrap:wrap; gap:8px`; its `> .label`: `flex-basis:100%; margin-block-end:2px`
  - `#work-count`: `display:inline-flex; align-items:center; gap:8px; justify-self:start`, plus a `::before` 8px circle in `var(--cyan)`
  - `data-reveal` on `.filters`.
- `.projects`: grid 1 / 2 (md) / 3 (xl), gap 20 (xl 28), `margin-block-start:0`.
- **Card** `.card`:
  - plate (`--plate`), `padding:22px` (md `26px`), `border-radius:var(--r-plate)`, plus §5.7
  - `.card--open-source { background: var(--plate-cyan); }`
  - Inner `article`: flex column, `height:100%`, `position:relative; z-index:2` (above the sheen).
- `.card__meta`:
  - `display:flex; flex-wrap:wrap; align-items:center; gap:8px 10px; font:700 .75rem/16px var(--font-sans); letter-spacing:.06em; text-transform:uppercase; color:var(--muted)`
  - badge per §4.3; `.card__year`: `margin-inline-start:auto; font:600 .875rem var(--font-display); letter-spacing:0; font-variant-numeric:tabular-nums`.
- `h3`: `margin-block-start:16px`, Outfit 600 `--fs-h3`. `.card__summary`: `margin-block-start:8px; color:var(--fg2); line-height:1.55`.
- `.card__highlights`:
  - `margin-block-start:16px; display:grid; gap:8px; font-size:var(--fs-small); color:var(--fg)`
  - `li`: `padding-inline-start:18px`; `li::before`: 6×6 circle at `top:.6em`, `background:var(--brand)` (OSS: `var(--cyan)`). This replaces the dash.
- `.card .tags`: `margin-block:20px 24px`. Tags inside OSS cards use the same `--surface-soft`.
- `.card__foot`:
  - `margin-block-start:auto; padding-block-start:16px; border-block-start:1px solid var(--border-soft)`
  - `.card__role`: `font-size:.875rem; color:var(--fg)`; `.label` `margin-inline-end:8px`.
- **Case study** `.card__private`:
  - `display:inline-flex; align-items:center; gap:8px; margin-block-start:12px; padding:8px 12px`
  - `border:1px dashed var(--brand-line); border-radius:var(--r-ctl); color:var(--brand); font:600 .8125rem/1.4 var(--font-sans); background:transparent`
  - No link. This remains a hard rule from `ux.md`.
- **Open source** `.card__repo`:
  - control pill: `display:inline-flex; align-items:center; gap:8px; min-height:44px; margin-block-start:12px; padding:10px 16px; border-radius:var(--r-pill); background:var(--control); border:1px solid var(--control-rim); box-shadow:var(--control-shadow); color:var(--cyan-text); font:600 .9375rem/1 var(--font-sans); text-decoration:none`
  - Hover: `translate:0 -1px; border-color:var(--cyan-line)`, and the trailing arrow translates `2px -2px`.
  - Focus: the global ring.
- **Empty state** `.projects-empty`:
  - `plate` with `--plate-brand`, `padding:48px 24px; text-align:center; border-radius:var(--r-plate)`
  - `::before`: a 40×36 prism glyph, `display:block; margin:0 auto 16px`
  - `p`: `color:var(--fg2); font-size:1.0625rem`; button `.btn--secondary`, `margin-block-start:20px`.
- `data-reveal` on each `li.card`.

### 6.7 Services

- `.services`: `display:grid; gap:16px` (1 / 2 md / 3 lg, gap 20). Remove the shared-border spec-grid: no `background:var(--line)`, no gap-1px, no outer border.
- `.services > li`: plate, `padding:26px`. Not interactive, so no hover.
- `.services__index`: `display:grid; place-items:center; width:48px; height:48px; border-radius:16px; background:var(--nav-sel); color:var(--brand); font:700 1rem var(--font-display)`.
- `h3`: `margin-block:18px 8px`. `p`: `color:var(--fg2); max-width:42ch`.
- `data-reveal` on each `li`.

### 6.8 Contact (no markup change: `#contact > .container` becomes the panel)

```
╭ contact panel (plate-brand, r 32, inner glows) ────────────────────────────────────────╮
│ (● 07 / CONTACT)                                                                        │
│ Let's build something that runs the business        (Outfit 700, --fs-contact, 16ch)    │
│ Have an operation that needs reliable software …    (--fg2, 56ch)                       │
│ EMAIL ME                                                                                │
│ eslamjackie@outlook.com   ( ⧉ Copy email )          (Outfit 700 --fs-email, gradient)   │
│ ╭ ShiftCodes ↗ ╮ ╭ GitHub · TPCT ↗ ╮ ┆ Alexandria, Egypt ┆   (tiles; md+: 3 columns)     │
╰─────────────────────────────────────────────────────────────────────────────────────────╯
```

- `main > #contact { padding-block-end: var(--space-10); }` (kept).
- `#contact > .container`:
  - `position:relative; overflow:hidden; isolation:isolate`
  - `padding:32px 22px` (md `48px`, lg `56px 64px`); `border-radius:var(--r-lg); background:var(--plate-brand); border:1px solid var(--rim); box-shadow:var(--shadow-card)`.
  - Base width: `width:min(100% - 2*var(--gutter), var(--container))`, unchanged.
- `::before` / `::after` (static glows, not animated):
  - `content:""; position:absolute; z-index:-1; border-radius:50%; pointer-events:none`
  - `::before`: `width:420px; height:420px; inset-block-start:-180px; inset-inline-end:-120px; background:radial-gradient(circle, var(--glow-a), transparent 65%)`
  - `::after`: `width:360px; height:360px; inset-block-end:-200px; inset-inline-start:-100px; background:radial-gradient(circle, var(--glow-b), transparent 65%)`.
- `h2`: `font-size:var(--fs-contact); max-width:16ch`. `.lead`: `color:var(--fg2); max-width:56ch`. `#email-label`: `.label`, `margin-block:32px 10px`.
- `.contact__email`:
  - `position:relative; display:inline-block; font:700 var(--fs-email)/1.15 var(--font-display); letter-spacing:-.01em; text-decoration:none; overflow-wrap:anywhere`
  - gradient text with `background:linear-gradient(100deg, var(--fg) 0%, var(--fg) 45%, var(--brand) 100%)`
  - animated underline `::after` as in `.text-link` (positioned `bottom:-4px`), shown on hover/focus.
- `.copy-btn`: `.btn--secondary` plus the §5.9 pop.
- `.contact__links`:
  - `margin-block-start:40px; display:grid; gap:12px` (md 3 columns, gap 16)
  - `li`: `min-height:56px; border:0; display:flex`
  - links: `display:flex; align-items:center; gap:10px; width:100%; min-height:56px; padding-inline:18px; border-radius:var(--r-card); background:var(--control); border:1px solid var(--control-rim); box-shadow:var(--control-shadow); color:var(--fg); font:600 1.0625rem var(--font-sans); text-decoration:none; transition: translate var(--dur-2) var(--ease-out), color var(--dur-1)`
  - Link hover: `translate:0 -2px; color:var(--brand)`, and the arrow (pushed to inline-end) nudges `2px -2px`.
  - The location `li` (plain text): `align-items:center; padding-inline:18px; border:1px dashed var(--border); border-radius:var(--r-card); color:var(--fg2)`.
- `data-reveal` on `.section-head`, `.lead`, `.contact__email-row`, `.contact__links`.

### 6.9 Process (Prism timeline)

```
lg: ①━━━━━━━━━━②━━━━━━━━━━③━━━━━━━━━━④━━━━━━━━━━⑤     56px glass tiles; gradient line drawn on reveal
    Discover    Model       Architect   Ship        Evolve      (last tile = primary skin + glow)
base/md: vertical; 48px tiles on the inline-start edge, line between their centres, text to the right
```

- **lg** (`min-width:1024px`):
  - `.process`: `position:relative; display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); gap:24px; padding:0; counter-reset:step`
  - Track `::before` and drawn line `::after`: `content:""; position:absolute; top:27px; inset-inline:calc(10% - 10px); height:2px; border-radius:2px; width:auto`. The track is `var(--border-soft)`. The line is `linear-gradient(90deg, var(--brand-line), var(--brand) 50%, var(--cyan))` with `transform-origin:left center` (`[dir=rtl]`: right).
  - `.process > li`: `position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; padding:0 6px; counter-increment:step`.
- **base/md**:
  - `.process`: `display:grid; gap:28px; padding:0`
  - lines: `top:28px; bottom:28px; inset-inline-start:23px; width:2px; height:auto`; gradient at 180deg; `transform-origin:top center`; the pending state uses `scale: 1 0`
  - `li`: `display:grid; grid-template-columns:48px 1fr; column-gap:20px; text-align:start`; the tile sits in `grid-row:1 / span 2`, and the h3/p are in column 2.
- **Node tile** `li::before`:
  - `content: counter(step, decimal-leading-zero); content: counter(step, decimal-leading-zero) / "";` (the first declaration is the fallback)
  - `display:grid; place-items:center; width:56px; height:56px` (base/md `48px`, radius `16px`); `border-radius:18px; background:var(--surface); border:1px solid var(--rim); box-shadow:var(--shadow-card); color:var(--brand); font:700 1rem var(--font-display)`.
  - Last step: `background:var(--primary-skin); color:var(--on-primary); border-color:transparent; box-shadow:var(--primary-shadow), var(--primary-glow)`.
  - Delete the old rotated squares and the `h3::before` counter.
- `h3`: Outfit 600 `--fs-h3`. `p`: `margin-block-start:6px; color:var(--fg2); font-size:var(--fs-small)`.
- Motion: §5.8. `data-reveal` on the `ol.process` (one element, so the draw is one coherent moment).

### 6.10 Footer (`90-footer.css`)

- `.site-footer`: `margin-block-start:0; padding-block:32px 40px; border-block-start:1px solid var(--border-soft)`.
- `p`: `color:var(--muted); font-size:.875rem`. Its `::before` is the prism glyph (16×14), inline, `margin-inline-end:10px`, vertically centred.
- Links: `.text-link` (§4.3). md+: row with gap 24px. Layout is otherwise unchanged.

### 6.11 404 (`80-404.css`, no markup change)

```
            ◇      ◇
        404               (Outfit 800, clamp(7rem, 4rem + 16vw, 14rem), --grad-accent, lh .85, centred)
      Page not found      (h1, --fs-h2)
  This page doesn't exist or has moved.   (--fg2)
       [ Back to the homepage ]           (primary, magnetic)
        ▭   ◇   ┆◁┆   ← .nf__schematic: three glass shards; the last is a dashed "missing piece"
```

- `.nf`: `min-height:70vh; padding-block:var(--section-pad); display:flex; flex-direction:column; align-items:center; text-align:center`.
- `.nf__code`: `font:800 clamp(7rem, 4rem + 16vw, 14rem)/.85 var(--font-display); letter-spacing:-.04em`, gradient text with `--grad-accent`, `margin-block-end:24px`.
- `h1`: `font-size:var(--fs-h2)`. `.nf__message`: `color:var(--fg2); margin-block:16px 28px`.
- `.nf__schematic`:
  - `position:relative; width:220px; height:110px; margin-block-start:56px; border:0`
  - `i`: `position:absolute; border-radius:12px; background:var(--plate); border:1px solid var(--rim); box-shadow:var(--shadow-card)`
  - `i:nth-child(1)`: `46×58px; left:0; top:30px; transform:rotate(-12deg)`
  - `i:nth-child(2)`: `36×36px; left:88px; top:6px; transform:rotate(16deg); background:var(--plate-brand)`
  - `i:last-child`: `44×54px; right:0; top:34px; transform:rotate(24deg); background:transparent; border:2px dashed var(--brand-line); box-shadow:none`.
- Motion (one-shot, no loop, gated `.js` + no-preference):
  - `@keyframes shard-in { from { opacity:.001; translate: 0 40px; } }`, 900ms `--ease-rise`, delays 300 / 420 / 540ms
  - the last shard also gets `@keyframes wobble { 0%,100% { rotate:0deg } 30% { rotate:-10deg } 60% { rotate:5deg } }`, 1200ms `--ease-in-out`, delay 1100ms, played once
  - `.nf__code`, `h1`, message and CTA use `rise` with delays 0 / 120 / 200 / 280ms.

---

## 7. States matrix (visual; behaviour as in `ux.md` §5)

| Element | Rest | Hover (fine pointer) | Focus-visible | Active / pressed | Disabled / zero | Reduced motion | No-JS |
|---|---|---|---|---|---|---|---|
| Header | transparent at top; pill plate when scrolled | — | ring on children | menu open → plate forced on | — | plate appears instantly | static, plate always on, nav wraps |
| Nav link | `--fg2` | `--fg` + faint fill | ring | current: nav-sel + brand | — | same | links visible |
| Theme toggle | control circle, target icon | `--brand` | ring | icon morph + circle reveal | — | instant swap, no reveal | hidden |
| Motion toggle | control circle, pause icon | `--brand` | ring | play icon, loops paused, state saved | — | hidden (no loops) | hidden |
| Primary button | skin + inner shadow | hover skin, glow shadow, magnet + hotspot | ring (3px, 2px offset) | `scale .97` | — | hover skin only, no magnet | plain link |
| Secondary button | control | brand text, lift 1px | ring | `scale .97` | — | colour only | works |
| Text link | 1px rest line | gradient underline grows, arrow nudge | ring + underline shown | — | — | underline instant | underline visible |
| Filter chip | control pill | `--fg`, lift 1px | ring | pressed: skin + glow | zero: dashed, muted, operable | instant | whole UI hidden |
| Card | plate (OSS: cyan plate) | lift 6px, lift shadow, sheen, tilt ≥1024 | `:focus-within` lift (OSS link) | — | — | shadow only | identical minus motion |
| Repo link | control pill, cyan text | lift 1px, cyan rim, arrow nudge | ring | `scale .97` | — | colour only | works |
| Copy email | control | brand text | ring | "Email copied" + check pop | hidden when the API is missing | no pop | hidden |
| Stats | final values | — | — | — | not rendered when empty | final values, no count | final values |
| Reveal targets | visible | — | focus reveals instantly | — | — | always visible | always visible |
| Prism | static at 0deg | parallax (≥1024) | — | paused via toggle / offscreen | — | static | static |
| Empty filter result | brand plate + glyph + reset | — | reset ring | reset → All, focus All chip | — | same | n/a |

**Loading:** fonts swap from metric-matched fallbacks. There is no skeleton (static site).
**Error:** a missing font file → fallback stack. A missing `site.js` → everything is visible and static (hero entrance still plays, being pure CSS). An IO failure → the watchdog reveals everything.
**Long content:** h1 `overflow-wrap:anywhere`; chips wrap their label (`white-space:normal`); tags `nowrap` with a <360px fallback; the email `overflow-wrap:anywhere`; cards stretch to row height so footers align.
**Permission denied:** clipboard handling is unchanged from `ux.md` (select the text). If localStorage throws for the motion state, it still works for the session.

---

## 8. Responsive and RTL

Breakpoints are unchanged (`ux.md` §2.4): base 320–767 (designed at 360), md ≥ 768, lg ≥ 1024, xl ≥ 1280. Container is 1200px.

| Area | base | md | lg | xl |
|---|---|---|---|---|
| Header | pill 52px, menu button | pill 56px, inline nav | same | same |
| Hero | 1 column; prism 240px under CTAs | prism 320px | 7/5 split; prism 420px; parallax on | gaps 32 |
| Stats | stacked rows | 3 columns | same | same |
| Skills / Services | 1 column | 2 | 3 | 3 |
| Projects | 1 | 2 | 2 (tilt on) | 3 |
| Process | vertical | vertical | horizontal 5 columns | same |
| Contact links | stacked | 3 columns | same | same |

- Pointer effects (tilt, magnet, parallax) require `(hover:hover) and (pointer:fine)`. Tilt and parallax also require ≥ 1024px.
- There is no horizontal scroll at ≥ 320px: the blobs are `position:fixed` and add nothing to scroll width, and `.prism` children are clipped inside a `width:min(100%, var(--s))` box. Add `overflow-x: clip` on `.hero` as a safety net.
- **RTL:** the site is English/LTR only (no Arabic content). All new CSS uses logical properties. If RTL is ever added:
  - `[dir="rtl"] .prism { scale: -1 1; }`, so the beam enters from the inline-start side
  - the process line `transform-origin` flips to right
  - the tilt sign does not change.

---

## 9. Accessibility additions (everything in `ux.md` §7 stays)

- **2.2.2 Pause, Stop, Hide:** the only infinite animations are the ambient loops. They run only with JS, and can be paused by the visible motion toggle, which is persisted. Everything else finishes in under 2s.
- **2.3.3 / vestibular:** under `prefers-reduced-motion: reduce` there is no parallax, tilt, magnet, count-up, FLIP, view transition, drift or reveal.
- **Focus:** a 3px `--focus` ring with 2px offset, at least 4.9:1 in both themes. Tilted and lifted cards never hide the ring (the article has z-index 2 over the sheen, and `overflow:hidden` is on the card while the ring is drawn on inner elements inside the padding).
- **Focus order:** unchanged. The motion toggle sits after the hero CTAs in DOM order.
- **Touch targets:** every control is ≥ 44×44 (chips 44, icon buttons 44, nav 44, menu links 52, contact tiles 56, repo pill 44).
- **Decorative elements** are `aria-hidden` (`.prism`) or CSS pseudo-elements. Counter content uses empty alt text (`/ ""`).
- Count-up keeps the true value in a `.vh` span. The animated digits are `aria-hidden`.
- Gradient text has a forced-colours fallback. `prefers-reduced-transparency` makes plates opaque.
- The motion toggle's label carries its state ("Pause animation" / "Play animation"), matching the theme toggle pattern (no `aria-pressed`).

---

## 10. Implementation checklist (markup hooks, files, content, tests)

### 10.1 Markup hooks to add

| File | Change |
|---|---|
| `src/render/head.mjs` | Two font preloads (§3.1). `THEME_SCRIPT` colours `'#E7E6F3':'#1A1726'` |
| `src/render/hero.mjs` | h1 word spans (`.w`, `.w--accent`); `.hero__visual` wrapper with the `.prism` decorative tree, `.motion-toggle` button and the existing `.schematic` (§6.2) |
| `src/render/sections.mjs` | `section()` adds `data-reveal` to `<header class="section-head">`. Also `data-reveal` on: `.about__body`, each `.experience > li`, each `.skill-group`, `.filters`, each `li.card` (in `renderCard`), each `.services > li`, `ol.process`, and contact `.lead`, `.contact__email-row`, `.contact__links`. Do **not** add it to `#work .lead` (keep the work intro immediate) or to anything in the hero |
| `src/lib/icons.mjs` | Add `pause` and `play` (Lucide, ISC) |
| `src/render/header.mjs`, `footer.mjs`, `layout.mjs`, `page-404.mjs` | No change |

### 10.2 CSS / JS files

- CSS:
  - Rewrite `00-fonts.css`, `01-tokens.css`, `10-base.css`, `20-components.css`, `30-header.css`, `40-hero.css`, `50-sections.css`, `60-work.css`, `70-contact.css`, `80-404.css`, `90-footer.css`.
  - Add `15-motion.css`: reveal rules, ambient loop keyframes (§5.3), view-transition rules, `pop` / `fade-in` / `rise` keyframes shared across partials, and the print rule.
  - CSS budget ≤ 45 KB raw.
- JS:
  - Edit `10-theme.js` and `30-filter.js`.
  - Add `60-motion.js` and `61-pointer.js`.
  - `20-nav.js`, `40-copy.js` and `50-scrollspy.js` are unchanged.
- Fonts and assets:
  - Rewrite `scripts/build-font.sh`.
  - Update `scripts/render-images.mjs` (§11).
  - Replace the font files.

### 10.3 Content keys to add (`content.json`, merged into existing objects)

```json
"site": { "themeColorDark": "#1A1726", "themeColorLight": "#E7E6F3" },
"hero": { "motionToggle": { "pause": "Pause animation", "play": "Play animation" } }
```

`validate.mjs` must require `hero.motionToggle.pause` and `hero.motionToggle.play` to be non-empty strings.

### 10.4 Test impact (Codex: affected tests only; leads run the full suite at the gate)

- `seo.test.mjs`: the font assertions move to `outfit-var.woff2` and `jakarta-var.woff2` (`wOF2` magic, each ≤ 80 KB, combined ≤ 120 KB), and both preload hrefs are present. `archivo-var.woff2` must be absent.
- `build.test.mjs`:
  - the hero still has 3 `<a `
  - h1 text with tags stripped equals `c.hero.name`
  - `THEME_SCRIPT` contains `#1A1726`.
- New assertions:
  - The HTML contains no ` style="` attribute (CSP).
  - The `data-reveal` count is ≥ 30 on `/`.
  - `.motion-toggle` exists with `hidden`.
  - `site.css` contains `prefers-reduced-motion: reduce` and `prefers-reduced-transparency`.
  - `site.js` ≤ 14,000 bytes.
  - A case-study card still contains 0 `<a`, and an OSS card exactly 1 (existing).
- QA (after merge): eyes-on in both themes at 360/768/1024/1440, with the following checks:
  - axe in both themes
  - reduced-motion pass (OS setting) and no-JS pass
  - Lighthouse mobile: CLS ≤ 0.1, no long tasks from motion
  - DevTools Performance during scroll and card hover: no layout/paint spikes per frame other than the count-up text.

---

## 11. OG image, favicon and manifest restyle (`scripts/render-images.mjs`, dev only)

**OG** (`src/images/og-image.svg` → `public/assets/og-image.png`, 1200×630, ≤ 300 KB, dark only). It is rendered in headless Chromium with `@font-face` pointing at the repo's `outfit-var.woff2` and `jakarta-var.woff2`. All strings come from `content.json`, as before.

```
bg rect #1A1726; blobs: circle (216,76) r520 radialGradient #4A2346 .9→transparent; circle (1104,346) r560 #1E3A52 →transparent
outer rim: rect x24 y24 w1152 h582 rx32, fill none, stroke rgb(232 222 255 / .18) 1px
LEFT (x80 … ≤700)
  eyebrow pill: rect x80 y64 h40 rx20 fill #4A2D47, width = measured text + 40; 8px dot (gradient #F299C4→#7FD3E3) at x100;
                text x116 baseline y90, Plus Jakarta Sans 800 17px, letter-spacing 2, uppercase, #F299C4
  name line 1 (all words but the last): x80 y232, Outfit 800 104px, letter-spacing -3, #F1ECF8
  name line 2 (last word):              x80 y334, same, fill linearGradient horizontal #F299C4 → #C3AEF5 55% → #7FD3E3
     (if a line exceeds 620px, step the size down 4px at a time for both lines)
  roles[0]: x80 y398, Jakarta 600 28px #F1ECF8;  roles[1..] joined " · ": x80 y438, Jakarta 500 24px #CFC6DC
  domain chips: y478 h36 rx18 fill #3A3349, text Jakarta 600 16px #CFC6DC centred (baseline y502), padding-inline 14, gap 10, from x80; wrap is not allowed
     (step the font down to 14px if the row passes x1120)
  footer: location · reach  x80 y574 Jakarta 500 20px #B7ACC6;  site.url without scheme  x1120 y574 text-anchor end, Jakarta 700 20px #7FD3E3
RIGHT prism (centre x930)
  glow: circle (930,290) r220 radialGradient rgb(242 153 196/.35) → transparent
  beam: line (640,330)→(850,300) stroke linearGradient transparent→#FFFFFF .85, width 3, round caps
  spectrum: polygon (1010,300) (1176,236) (1176,404) (1010,322), fill vertical bands #F299C4 / #C3AEF5 / #88C8FC / #7FD3E3, opacity .6
  facets: left (930,120)(870,420)(770,420) fill lg #F299C4→#C3AEF5 (top→bottom); centre (930,120)(1010,420)(870,420) fill lg #C3AEF5→#88C8FC;
          right (930,120)(1090,420)(1010,420) fill lg #88C8FC→#7FD3E3, opacity .9; highlight: left facet overlay white .25
  rim: polygon (930,120)(1090,420)(770,420) fill none stroke rgb(255 255 255/.35) 1.5
  shards: rect 60×76 rx12 at (760,150) rotate(-14) fill rgb(46 40 61/.9) stroke rgb(232 222 255/.25);  rect 44×44 rx10 at (1078,140) rotate(18) fill #3A2840 same stroke
  shadow: ellipse (930,440) rx130 ry14 radialGradient rgb(4 2 12/.6) → transparent
```

Safe zone: all content within x80–1120 / y64–590. Alt text = `c.site.ogImageAlt` (unchanged).

**Favicon** `/favicon.svg` (viewBox 0 0 64 64):
- `rect` 64×64 rx16 fill `#1A1726`
- `polygon` (32,12)(54,50)(10,50) fill linearGradient (x1 0 y1 0 → x2 1 y2 1) `#F299C4` → `#C3AEF5` 50% → `#7FD3E3`
- left facet highlight `polygon` (32,12)(32,50)(10,50) fill `#FFFFFF` opacity .22
- right facet shade `polygon` (32,12)(54,50)(43,50) fill `#0E081E` opacity .18.

`favicon-32.png`, `favicon.ico`, `icon-192/512.png` and `apple-touch-icon.png` (180, square, no rounded corners, art at an 80% safe area) are rendered from the same art on `#1A1726`. **Manifest:** `background_color` and `theme_color` = `site.themeColorDark` (`#1A1726`), so the existing test keeps passing.

---

## Assumptions (decided by UX; owner unavailable)

1. **Dark is the default** (`data-theme="dark"` in the source, unchanged mechanism), using the Prism dark column with canvas `#1A1726`. Light is the Prism light palette. Text tokens use the variant from the reference set that has a verified contrast table (`#F1ECF8` / `#CFC6DC` / `#B7ACC6`).
2. **Fonts are self-hosted** (Outfit 500–800 and Plus Jakarta Sans 400–800, OFL, woff2 subsets) and replace Archivo. The site's self-only CSP is kept, and no Google Fonts request is made. The system monospace is dropped: labels become Jakarta 800 uppercase, which matches the reference eyebrow style.
3. **Prism principle → literal prism art.** The faceted triangle (with a beam in and a spectrum out) is the identity mark. It is reused for the header glyph, favicon, OG card, empty state, footer and 404, replacing the bus-and-node schematic everywhere. The `.schematic*` class names are kept as hooks for the domains plate, to reduce churn.
4. **Backdrop blur is limited to 3 elements** (header pill, open mobile menu, hero domains plate). Cards and plates are near-opaque gradients without blur, for scroll and animation performance on mid-range phones.
5. **Motion toggle in the hero.** It was added to satisfy WCAG 2.2.2 for the infinite ambient loops. Its two strings are new content keys. Loops never run without JS, so no-JS users need no control.
6. **Hero entrance is pure CSS gated on `.js`.** It is set by the inline head script before paint, so it plays even if `site.js` fails, and it always ends in the visible state within 1.8s. Scroll reveals are JS-gated (`.motion`) and only hide below-the-fold elements.
7. **Card hover effects apply to case-study cards too** (lift, sheen, tilt). They are presented as showcase delight, not an affordance: the cursor stays default and there is still no link. Services/skills plates have no hover, being non-interactive and not showcase items.
8. **Filter leave phase (160ms)** delays only the visual card swap. ARIA state, counts, live region and URL still update synchronously. FLIP uses WAAPI, not the View Transitions API, because it gives finer control and avoids page-level snapshotting. The View Transitions API is used only for the theme switch reveal, with an instant fallback.
9. **Count-up for year-like values** (≥ 1000) runs from value − 10, so "2016" never counts from 0. Count-up is skipped on slow loads where the final value has already been seen.
10. **No new imagery or photos.** All visuals are CSS/SVG. Icons stay inline Lucide (ISC), with `pause` and `play` added.
11. **JS budget** is interpreted as ≤ 6 KB raw for the new motion code (the build doesn't minify), with a total `site.js` cap of 14,000 bytes enforced by a test.
12. Contrast values in §3.4 were computed by hand from the WCAG formula. QA must re-verify with axe in both themes, and in particular light `--cyan-text` (4.95:1 on canvas, the tightest pair) and the light primary hotspot (5.0:1).
