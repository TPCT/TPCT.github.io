# T-019 — One static page per project at /work/<slug>/ (+ reviewer Lighthouse gate)

Size: M   Depends on: T-018 merged; T-010 merged (it raises the CSS cap)   Stories: SEO

## Goal
Today the home page is the only indexable URL, so the case studies and open-source projects can never rank on their own. This ticket gives every project (all case studies and all open-source projects) a static, crawlable page with:
- a unique title, description and canonical;
- OG tags;
- BreadcrumbList + CreativeWork / SoftwareSourceCode JSON-LD.

The cards on the home page link to these pages. Case-study cards still have no external or repo link. Their only link is the internal `/work/<slug>/`.

## Files (only these)
- new `src/render/project-page.mjs`
- new `src/styles/85-project.css` (≤ 3,072 bytes raw)
- `src/lib/html.mjs`: add `projectPath`
- `src/lib/schema.mjs` (from T-018): add `projectGraph`
- `src/render/sections.mjs`: **`renderCard` only**
- `src/content.json`: add the `projectPage` object only. Do not re-format the file.
- `src/lib/validate.mjs`: validate `projectPage`
- `scripts/build.mjs`: write the pages, pass `projectUrl` to `homeGraph`, add sitemap entries
- `test/projects.test.mjs`: update the card-link pins only (see Tests)
- new `test/project-pages.test.mjs`

**Parallelism.** Do NOT run in parallel with T-013, T-014, T-016, T-017 or T-018, because they share `sections.mjs`, `content.json`, `validate.mjs`, `build.mjs`, `projects.test.mjs` and `schema.mjs`. It MAY run in parallel with T-011 and T-012. Start it only after T-010 has merged: T-010 raises the CSS budget in `sections.test.mjs`, and before that there is about 2 KB of headroom left.

## Spec

### 1. Content (`src/content.json`, new top-level key)
```json
"projectPage": {
  "breadcrumbLabel": "Breadcrumb",
  "homeLabel": "Home",
  "workLabel": "Work",
  "highlightsTitle": "Highlights",
  "stackTitle": "Stack",
  "yearLabel": "Year",
  "typeLabel": "Type",
  "categoryLabel": "Category",
  "pagerLabel": "More projects",
  "prevLabel": "Previous project",
  "nextLabel": "Next project",
  "backLabel": "Back to all work",
  "caseStudyLink": "Read case study",
  "openSourceLink": "Project details"
}
```
`validate.mjs`: every key above is a required non-empty string (`strings(c.projectPage, '…', 'projectPage')`).

### 2. Helpers
- `src/lib/html.mjs`: `export const projectPath = p => \`/work/${p.id}/\`;`. Project ids are already validated as `^[a-z0-9-]+$`, so they are safe to use as path segments.
- `src/render/project-page.mjs` exports:
```js
export function projectTitle(c, p)       // t = `${p.name} — ${c.projectsIntro.kindLabels[p.kind]} | ${c.site.shortTitle}`; return t.length <= 65 ? t : `${p.name} | ${c.site.shortTitle}`
export function projectDescription(p)    // p.summary if ≤ 160 chars; else cut = p.summary.slice(0, 159), cut at its last space, strip trailing [\s,;:.–—-], append '…' (result ≤ 160)
export function renderProjectPage(c, p, { assets, prev = null, next = null })   // → full HTML string via renderPage
```
- `src/lib/schema.mjs`: add
```js
export function projectGraph(c, p, { url, title, description })
// → { '@context': 'https://schema.org', '@graph': [
//   { '@type': 'WebPage', '@id': url, url, name: title, description, inLanguage: c.site.lang, isPartOf: { '@id': ids.website }, about: { '@id': ids.project(p.id) }, breadcrumb: { '@id': url + '#breadcrumb' } },
//   { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: [
//       { '@type': 'ListItem', position: 1, name: c.projectPage.homeLabel, item: ids.base },
//       { '@type': 'ListItem', position: 2, name: p.name, item: url } ] },
//   projectNode(c, p, { url }),
//   { '@type': 'Person', '@id': ids.person, name: c.hero.name, url: ids.base },
//   { '@type': 'WebSite', '@id': ids.website, url: ids.base, name: c.site.shortTitle } ] }
```
The JSON-LD breadcrumb has 2 levels (Home → Project) on purpose: `/#work` is a fragment of the home URL, not a separate page. The visible breadcrumb still shows Home / Work / Project.

### 3. Page markup (`renderProjectPage`)
- `renderPage(c, { head, header: renderHeader(c, { home: false }), main, footer: renderFooter(c) })`, with no spine.
- `head`:
  - `renderHead(c, { page: 'project', title: projectTitle(c, p), description: projectDescription(p), path: projectPath(p), ogType: 'article', jsonLd: projectGraph(c, p, { url, title, description }), assets })`;
  - `url = new URL(projectPath(p), c.site.url).href`;
  - the OG image is the shared `site.ogImage`, via `renderHead`.
- `main`. All text is escaped. `pp = c.projectPage`; `s = c.projectsIntro`:
```html
<article class="project" aria-labelledby="project-title"><div class="container project__wrap">
  <nav class="crumbs" aria-label="{pp.breadcrumbLabel}"><ol><li><a href="/">{pp.homeLabel}</a></li><li><a href="/#work">{pp.workLabel}</a></li><li aria-current="page">{p.name}</li></ol></nav>
  <header class="project__head">
    <p class="card__meta"><span class="badge">{icon lock|git-branch, 12}{s.kindLabels[p.kind]}</span><span>{p.category}</span>[<span class="card__year">{p.year}</span>]</p>
    <h1 id="project-title">{p.name}</h1>
    <p class="lead project__summary">{p.summary}</p>
  </header>
  <dl class="project__facts">
    <div><dt>{s.roleLabel}</dt><dd>{p.role}</dd></div>
    [<div><dt>{pp.yearLabel}</dt><dd>{p.year}</dd></div>]   <!-- only if year defined -->
    <div><dt>{pp.typeLabel}</dt><dd>{s.kindLabels[p.kind]}</dd></div>
    <div><dt>{pp.categoryLabel}</dt><dd>{p.category}</dd></div>
  </dl>
  <section class="project__block" aria-labelledby="project-hl"><h2 id="project-hl">{pp.highlightsTitle}</h2><ul class="project__highlights">{<li>h</li>…}</ul></section>
  <section class="project__block" aria-labelledby="project-stack"><h2 id="project-stack">{pp.stackTitle}</h2><ul class="tags" aria-label="{s.stackLabel}">{<li class="tag">x</li>…}</ul></section>
  OPEN-SOURCE: <p class="project__cta"><a class="btn btn--primary" href="{p.repoUrl}" target="_blank" rel="noopener noreferrer">{icon git-branch,18}{s.repoLinkLabel}<span class="vh"> : {p.name} {c.a11y.newTab}</span>{icon arrow-up-right,16}</a></p>
  CASE STUDY:  <p class="card__private">{icon lock,16}{s.privateNote}</p>
  <nav class="project__pager" aria-label="{pp.pagerLabel}">
    [<a class="project__prev" rel="prev" href="{projectPath(prev)}"><span class="label">{pp.prevLabel}</span> {prev.name}</a>]
    [<a class="project__next" rel="next" href="{projectPath(next)}"><span class="label">{pp.nextLabel}</span> {next.name}</a>]
  </nav>
  <a class="text-link project__back" href="/#work">{pp.backLabel}</a>   <!-- text only, no icon -->
</div></article>
```
- **Icons.** Use only names that already exist in `src/lib/icons.mjs` (`lock`, `git-branch`, `arrow-up-right`). Do not add icons.
- **Case-study pages.** The `<main>` contains no `http(s)` href at all, and no `repoUrl`, even if one is present in the content (that is a warning case).
- **Exactly one `<h1>` per page.**
- **No `data-reveal`** on project pages. Content is static and visible immediately, which keeps LCP and CLS clean.
- **Prev/next** follow the `sortProjects(c.projects)` order, with no wrap-around: the first page has no prev link and the last page has no next link.

### 4. Home cards (`renderCard` only)
- Inside `.card__foot`, after the role line and before the private note / repo link, add:
  `<a class="card__more" href="{projectPath(p)}">{case-study ? pp.caseStudyLink : pp.openSourceLink}<span class="vh">: {p.name}</span></a>`
- This link has no `target` and no `rel`.
- Case-study cards therefore contain exactly one `<a`, and it is internal. Open-source cards contain two: the page link and the existing repo link, whose output stays unchanged.

### 5. Build (`scripts/build.mjs`)
- Compute `const ordered = sortProjects(c.projects)` once.
- For each project `p` at index `i`, write `dist/work/<id>/index.html` = `renderProjectPage(c, p, { assets, prev: ordered[i-1] ?? null, next: ordered[i+1] ?? null })`. Create the directories with `mkdir(..., { recursive: true })`.
- Home `homeGraph(c, { dateModified: lastmod, projectUrl: p => new URL(projectPath(p), c.site.url).href })`. Case-study ItemList items now get a `url` too, but it points to the internal page, never to an external one.
- Sitemap entries: home first, then every project page in `ordered` order, each with `lastmod`. 404 is never listed.
- `404.html`, `robots.txt` and the manifest stay unchanged.

### 6. CSS (`src/styles/85-project.css`, ≤ 3,072 bytes raw)
- **Reuse existing styles:** `.container`, `.lead`, `.label`, `.tags`/`.tag`, `.badge`, `.card__meta`, `.card__year`, `.card__private`, `.btn`, `.text-link`, and the plate tokens.
- **New rules only for:**
  - `.project__wrap`: max-width ~ 860px, centred, vertical padding `var(--section-pad)` (the T-015 rhythm token in `01-tokens.css`).
  - `.crumbs ol`: inline flex, wrap. Separators via `li + li::before { content: "/" }` in `--muted`. `aria-current` in `--fg`.
  - `.project__head h1`: use the existing h1 display font. Size it with `clamp()` so it is smaller than the hero h1.
  - `.project__facts`: a 2-column grid below 768px and 4 columns from 768px, as a frosted plate with thin dividers. `dt` uses the `.label` style; `dd` is `--fg`.
  - `.project__block` spacing.
  - `.project__highlights`: reuse the look of the card highlights list (copy the minimal rule; do not edit `60-work.css`).
  - `.project__pager`: a 2-column grid of plate links, min-height 56px, with the next link right-aligned. It stacks below 600px.
  - `.card__more`: an inline link styled like `.text-link`, `margin-block-start: 12px`, min target size 44px.
- **No `@keyframes`. Transitions only on `:hover` / `:focus-visible`.** Add a `forced-colors` border fallback for the plates, the same as in 60-work.css.
- No horizontal overflow from 360 to 1440px. Contrast must be AA in both themes; use only the existing colour tokens.

## Tests

### `test/projects.test.mjs` (intended pin changes only)
- **Case-study cards:** replace `assert.doesNotMatch(card, /<a\b/)` with:
  - exactly one `<a`;
  - its `href="/work/<id>/"`;
  - no `target=`;
  - no `href="http`.
- **Open-source cards:** exactly two `<a`: one `href="/work/<id>/"` and the unchanged repo link.
- **"case-study repoUrl is ignored":** the card may contain only `href="/work/<id>/"` (assert that no `href="http` and no `github.com` appear).
- **Keep the rest unchanged,** including the `site.js < 30000` check.

### New `test/project-pages.test.mjs`
Build to a tmp dir with `now: new Date('2026-10-21T12:00:00Z')`, then check:

**Every page**
- `dist/work/<id>/index.html` exists for every project in `c.projects`, and the count equals `c.projects.length`.
- Each page has exactly one `<h1>`, with text = `p.name`.
- `<title>` = `projectTitle(c, p)` and is ≤ 65 chars.
- The meta description = `projectDescription(p)` and is ≤ 160 chars.
- The canonical = `https://tpct.github.io/work/<id>/`; `og:url` equals the canonical; `og:type` = `article`.
- The robots meta is `index,follow,max-image-preview:large`.

**Uniqueness and sitemap**
- Titles, descriptions and canonicals are unique across all project pages and the home page.

**JSON-LD**
- It has `BreadcrumbList` with 2 items, the second item = the canonical.
- For open-source projects the node is `SoftwareSourceCode` with `codeRepository = repoUrl`. For case studies it is `CreativeWork` with no `codeRepository`.
- The project node `@id` equals the `@id` of the matching ItemList item on the home page.

**Links**
- Case-study pages: `<main>` has no `href="http`.
- Open-source pages: `<main>` has exactly one `href="http…"`, and it is `repoUrl`.
- Every page has `href="/#work"` and a breadcrumb with `aria-current="page"`.
- Prev/next match the `sortProjects` neighbours. The first page has no `rel="prev"` and the last page has no `rel="next"`.
- The home page has `href="/work/<id>/"` for every project.

**CSP and markup hygiene**
- The only untyped inline `<script>` is `THEME_SCRIPT`, and the CSP contains its hash.
- No `style="`, no inline `on*=`, and no `undefined` or `null` text.
- `85-project.css` is ≤ 3,072 bytes and contains no `@keyframes`.

**Sitemap**
- It has `1 + c.projects.length` `<url>` entries, each with `<lastmod>2026-10-21</lastmod>`, and it lists every project canonical and no 404.

**Confidentiality**
- `await checkConfidential({ dist: outDir })` (from `scripts/check-confidential.mjs`) returns `hits.length === 0`. This uses the private denylist when it is present.

**Escaping**
- `renderProjectPage` with `p.name = '<script>"&'` outputs it escaped everywhere, including the JSON-LD (`<`).

## Commands (run only these)
```
npm run build
node --test test/project-pages.test.mjs test/projects.test.mjs test/seo.test.mjs test/seo-meta.test.mjs test/sections.test.mjs
npm run check:confidential
```
`sections.test.mjs` is in this list only to confirm the global CSS budget. If that budget fails, stop and report the numbers. Do not raise the cap.

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- No third-party libraries or npm dependencies.
- CSP stays self-only: no inline styles and no handlers. Every string goes through `esc()` / `attr()`.
- Do not change `404.html` output, `robots.txt`, the manifest, `src/scripts/*`, `hero.mjs`, `60-work.css` or any wow-round file.
- In `sections.mjs`, edit `renderCard` only. Do not change `renderWork`, the filters or other sections.
- The existing JS must not throw on project pages; it already guards missing elements (see the 404 page). Verify this with `node --check` only. Do not edit the JS.

## Reviewer gate (not for Codex; the lead runs this after review, once, with the full suite)
1. Run `npm run check` (build + all tests + confidential).
2. Run `npm run serve` (http://127.0.0.1:4321).
3. Run Lighthouse in mobile mode on `/` and on two project pages: one case study and one open-source.
   - The Chromium is the T-003 one: `CHROME_PATH=/home/tpct/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome npx -y lighthouse@12 <url> --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=<scratchpad>/lh-<page>.json`.
   - npx downloads to the npm cache, outside the repo. Never add Lighthouse to package.json.
4. Required scores, mobile: **SEO = 100, Performance ≥ 90, Accessibility ≥ 95**. Record them in `.company/reviews/T-018-T-019-r1.md`.
5. Locally, the `canonical` audit may flag the cross-origin canonical (it points at tpct.github.io). That is the only accepted local SEO deviation. After the push and Pages deploy, re-run SEO on the live `https://tpct.github.io/` and one live project page; those runs must score 100.
6. Validate the JSON-LD of `/` and one project page with Google's Rich Results Test / validator.schema.org on the live URLs, by manual paste. Note the result in the review.

## Out of scope
- A `/work/` index page.
- Per-project OG images.
- Long-form case-study copy beyond the existing summary and highlights.
- Changes to the 404 page.
