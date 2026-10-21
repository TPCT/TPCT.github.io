# T-018 — SEO metadata, JSON-LD @graph, LinkedIn + rel=me, sitemap lastmod

Size: M   Depends on: T-016 and T-017 merged   Stories: SEO (owner: "the site isn't SEO-friendly")

## Goal
The basics are already there: SSR HTML, meta description, canonical, OG/Twitter, a single Person JSON-LD, robots.txt, sitemap and one h1. This ticket makes them strong:
- a keyword-rich title and description;
- a linked JSON-LD `@graph` (WebSite, ProfilePage, Person, Organization, ItemList of projects);
- a robots meta;
- LinkedIn in the content, plus `rel="me"` identity links;
- sitemap `lastmod`;
- an accessible-name / alt audit test.

`renderHead` is also refactored so that T-019 (project pages) can reuse it unchanged.

## Files (only these)
- `src/content.json`: the keys listed in Spec 1 only. Do not re-format the file.
- `src/lib/validate.mjs`: the new keys and the length limits.
- `src/lib/html.mjs`: an optional `me` flag on `externalAttrs`.
- new `src/lib/schema.mjs`: the JSON-LD builders.
- `src/render/head.mjs`: the refactor (Spec 3). Remove `personJsonLd`.
- `src/render/footer.mjs`: the LinkedIn link, and rel=me on GitHub + LinkedIn.
- `src/render/sections.mjs`: **`renderContact` and the local `external()` helper only**.
- `src/styles/70-contact.css`: the grid for 4 contact items.
- `scripts/build.mjs`: the `now` option, home `jsonLd`, sitemap `lastmod`.
- `test/seo.test.mjs`: update the pins that this change intentionally breaks (the Person-only JSON-LD, the sitemap string, the `renderHead` escape test, and the URL-protocol list).
- new `test/seo-meta.test.mjs`.

**Parallelism.** Do NOT run in parallel with T-013, T-014, T-016, T-017 or T-019, because they share `sections.mjs`, `content.json`, `validate.mjs` and `build.mjs`. It MAY run in parallel with T-010, T-011 and T-012, which share no files with it.

## Spec

### 1. Content (`src/content.json`)
- `site.title` = `"Islam Elsayed — Senior Full-Stack Engineer | Laravel, Python"` (60 chars).
  - The coordinator's longer version, "… & Systems Architect | Laravel, Python, FastAPI", is 88 chars, and Google truncates at about 60.
  - "Systems architect" and "FastAPI" go into the description instead.
- `site.description` = `"Senior full-stack engineer and systems architect in Alexandria, Egypt. CEO of ShiftCodes. 9+ years building Laravel, Python, FastAPI and Django platforms."` (154 chars).
- New `site.jobTitle` = `"Senior Full-Stack Engineer & Systems Architect"`.
- New `site.alternateName` = `"TPCT"`.
- New `contact.linkedin` = `"https://www.linkedin.com/in/tpct/"`.
- New `contact.linkedinLabel` = `"LinkedIn · tpct"`.
- Leave `site.ogImageAlt` as it is. It describes the text that is actually on the OG card, so it is a correct alt.

### 2. Validation (`src/lib/validate.mjs`)
- Add `jobTitle alternateName` to the required `site` strings.
- Add `linkedin linkedinLabel` to the required `contact` strings.
- `contact.linkedin`: run it through the existing `protocol()` check with `/^https:\/\//`, so that it is part of the protocol test. It must also match `^https:\/\/www\.linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$`; otherwise push the error `contact.linkedin: expected https://www.linkedin.com/in/<handle>/`.
- `site.title.length > 65` → error `site.title: must be ≤ 65 characters`.
- `site.description.length > 160` → error `site.description: must be ≤ 160 characters`.

### 3. `renderHead` refactor (`src/render/head.mjs`)
New signature:
```js
export function renderHead(c, { page = 'home', title, description, path = '/', ogType = 'website', jsonLd = null, assets })
```
- `THEME_SCRIPT`, `cspHash`, the CSP policy string, the font preloads, the icons, the manifest link and the asset links all stay byte-identical. The CSP hash must keep matching the one inline script.
- `pageUrl = new URL(path, c.site.url).href`. `homeUrl = new URL('/', c.site.url).href`.
- **`page === '404'`:**
  - keep `<meta name="robots" content="noindex">`;
  - no canonical, no JSON-LD, no `rel="me"`;
  - `og:url` = `homeUrl` (as today).
- **Every other page:**
  - `<link rel="canonical" href="{pageUrl}">`;
  - `<meta name="robots" content="index,follow,max-image-preview:large">`;
  - `og:url` = `pageUrl`.
- **All pages:** add `<meta name="author" content="{c.site.author}">`.
- `og:type` = `ogType`.
- `og:title` / `twitter:title` = `title`.
- `og:description` / `twitter:description` = `description`. For the home page these equal `site.title` / `site.description`, as today.
- **`page === 'home'` only:** `<link rel="me" href="{c.contact.github}"><link rel="me" href="{c.contact.linkedin}">`.
- If `jsonLd` is set and the page is not `'404'`: emit `jsonLdScript(jsonLd)` (from schema.mjs) at the position where the Person script is today.
- **theme-color: unchanged.** Keep the single `<meta name="theme-color">`. `THEME_SCRIPT` and `10-theme.js` already switch it between `themeColorDark` and `themeColorLight` to follow the active theme. A media-scoped dark/light pair is rejected: the site is dark by default whatever the OS preference is, so a light meta under `prefers-color-scheme: light` would mismatch the dark page. This is a lead decision; do not add the pair.

### 4. JSON-LD builders (new `src/lib/schema.mjs`)
Exact exports and shapes:
```js
import { sortProjects } from './html.mjs';
export function schemaIds(c) // → { base, website: base+'#website', person: base+'#person', org: base+'#org', profile: base+'#profilepage', projects: base+'#projects', project: id => base+'#project-'+id }  (base = new URL('/', c.site.url).href)
export function projectNode(c, p, { url } = {})
export function homeGraph(c, { dateModified, projectUrl = null })   // dateModified 'YYYY-MM-DD'; projectUrl: (p) => absolute URL | null (T-019 passes it)
export function jsonLdScript(data) // → `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
```
`projectNode(c, p, { url })`:
```js
{ '@type': p.kind === 'open-source' ? 'SoftwareSourceCode' : 'CreativeWork', '@id': ids.project(p.id), name: p.name, description: p.summary,
  genre: p.category, keywords: p.stack.join(', '), creator: { '@id': ids.person },
  ...(p.year !== undefined && { dateCreated: String(p.year) }),
  ...(p.kind === 'open-source' && { codeRepository: p.repoUrl }),   // never for case studies, even if repoUrl is present
  ...(url && { url }) }
```
`homeGraph` returns `{ '@context': 'https://schema.org', '@graph': [website, profile, person, org, itemList] }`. The nodes:
- **WebSite:** `{ '@type': 'WebSite', '@id': ids.website, url: base, name: c.site.shortTitle, description: c.site.description, inLanguage: c.site.lang, publisher: { '@id': ids.person } }`
- **ProfilePage:** `{ '@type': 'ProfilePage', '@id': ids.profile, url: base, name: c.site.title, description: c.site.description, inLanguage: c.site.lang, isPartOf: { '@id': ids.website }, mainEntity: { '@id': ids.person }, dateModified }`
- **Person:**
  ```js
  { '@type': 'Person', '@id': ids.person, name: c.hero.name, alternateName: c.site.alternateName, url: base,
    image: new URL(c.site.ogImage, base).href, jobTitle: c.site.jobTitle, description: c.site.description,
    email: 'mailto:' + c.contact.email, sameAs: [c.contact.github, c.contact.linkedin, c.contact.website],
    worksFor: { '@id': ids.org },
    knowsAbout: [...new Set(c.skills.flatMap(s => s.items))],
    address: { '@type': 'PostalAddress', addressLocality: c.contact.location.split(',')[0].trim(), addressCountry: 'EG' },
    mainEntityOfPage: { '@id': ids.profile } }
  ```
  No `alumniOf` (we have no source for it). No `hasOccupation` (it adds nothing that `jobTitle` + `knowsAbout` don't already give).
- **Organization:** `{ '@type': 'Organization', '@id': ids.org, name: c.contact.websiteLabel, url: c.contact.website, logo: { '@type': 'ImageObject', url: base + 'icon-512.png', width: 512, height: 512 }, founder: { '@id': ids.person } }`. `icon-512.png` is the committed ShiftCodes S-mark PNG.
- **ItemList:** `{ '@type': 'ItemList', '@id': ids.projects, name: c.projectsIntro.title, numberOfItems: n, itemListElement: sortProjects(c.projects).map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: projectNode(c, p, { url: projectUrl ? projectUrl(p) : undefined }) })) }`

### 5. LinkedIn + rel=me
- `src/lib/html.mjs`: `export function externalAttrs({ me = false } = {}) { return \`target="_blank" rel="${me ? 'me ' : ''}noopener noreferrer"\`; }`. Existing calls without arguments must produce byte-identical output.
- `sections.mjs`:
  - give `external(url, label, className = '', newTab = '', me = false)` a `me` parameter and pass it to `externalAttrs({ me })`;
  - in `renderContact`, the list becomes: website (no me) · GitHub (`me`) · LinkedIn (`external(s.linkedin, s.linkedinLabel, '', c.a11y.newTab, true)`) · location (still the last `<li>`, which keeps its dashed style).
  - Touch nothing else in sections.mjs.
- `footer.mjs`: after the GitHub link, add the LinkedIn link, built the same way (`text-link`, arrow icon, vh new-tab text). Both GitHub and LinkedIn use `externalAttrs({ me: true })`.
- `70-contact.css`:
  - change the `@media (min-width: 768px)` grid from `repeat(3, …)` to `repeat(2, minmax(0, 1fr))`;
  - add `@media (min-width: 1024px) { .contact__links { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`;
  - no other changes. There must be no horizontal overflow from 360 to 1440px.

### 6. Build (`scripts/build.mjs`)
- New option: `build({ outDir = 'dist', root = REPO_ROOT, now = new Date() } = {})`. Set `const lastmod = now.toISOString().slice(0, 10);`.
- Home head: `renderHead(c, { page: 'home', title: c.site.title, description: c.site.description, path: '/', jsonLd: homeGraph(c, { dateModified: lastmod }), assets })`.
- Sitemap, exact output: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{homeUrl}</loc><lastmod>{lastmod}</lastmod></url></urlset>\n`. Build it from an array of `{ loc, lastmod }` through a small local function `sitemapXml(entries)`, so that T-019 only has to push entries.
- Leave robots.txt, the manifest and the 404 call exactly as they are. `render404` keeps working because its `renderHead` call needs no new arguments.

## Tests
**`test/seo.test.mjs`.** Edit only what this change intentionally breaks:
- The JSON-LD assertions now read `@graph`: find the node with `@type === 'Person'` and assert `name`, `url`, `email`, `sameAs === [github, linkedin, website]`, `worksFor['@id']` and `address`. Drop the `jobTitle` deep-equal against `hero.roles`; assert `jobTitle === c.site.jobTitle` instead.
- The sitemap: still exactly 1 `<url>`, and it now contains `<lastmod>`.
- The escape test: pass `jsonLd: homeGraph(copy, { dateModified: '2026-01-01' })`.
- Add `'contact.linkedin'` to the protocol-field list.

**New `test/seo-meta.test.mjs`:** build to a tmp dir with `now: new Date('2026-10-21T12:00:00Z')`, then:
- **Title and description:** `<title>` = `site.title` and is ≤ 65 chars; the description is ≤ 160 chars and contains "Laravel", "Python" and "FastAPI".
- **robots meta:** home has `<meta name="robots" content="index,follow,max-image-preview:large">`; 404 still has `noindex` and no `index,follow`.
- **Identity links:** home head has both `rel="me"` links; the footer and `#contact` each contain `href="https://www.linkedin.com/in/tpct/" target="_blank" rel="me noopener noreferrer"`; the GitHub links in the footer and contact use `rel="me noopener noreferrer"`; project repo links still use exactly `rel="noopener noreferrer"`.
- **`@graph` on home:**
  - it has exactly the types `WebSite`, `ProfilePage`, `Person`, `Organization`, `ItemList`;
  - every object whose only key is `@id` points to an `@id` that exists as a node in the graph (walk the JSON recursively);
  - ProfilePage `mainEntity['@id']` = Person `@id`;
  - `dateModified === '2026-10-21'`;
  - Organization `logo.url` ends with `/icon-512.png`, and that file exists in the build output;
  - `founder['@id']` = person;
  - Person `knowsAbout` includes `Laravel` and `FastAPI` and has no duplicates;
  - ItemList `numberOfItems === c.projects.length`, positions run 1..n in `sortProjects` order;
  - every open-source item is `SoftwareSourceCode` whose `codeRepository` = `repoUrl`;
  - every case-study item is `CreativeWork` with no `codeRepository` and no `url` key.
- **Sitemap:** `<lastmod>2026-10-21</lastmod>`.
- **Accessible-name audit,** run on `index.html` and `404.html`:
  - every `<img` has a non-empty `alt`;
  - every `<svg` either has `aria-hidden="true"` or has `role="img"` with a `<title>`;
  - every `<button` has an `aria-label` or non-empty text;
  - every `<a` has non-empty text after stripping tags, or an `aria-label`;
  - `og:image:alt` is ≥ 20 chars.
- **Validation:** a title of 66 chars, a description of 161 chars, `contact.linkedin = 'https://example.com/x'` and a missing `site.jobTitle` each produce an error that names the field.
- **CSP:** the CSP meta still contains `cspHash(THEME_SCRIPT)`, and that script is still the only inline `<script>` without a type.

## Commands (run only these)
```
npm run build
node --test test/seo.test.mjs test/seo-meta.test.mjs test/content.test.mjs test/build.test.mjs test/projects.test.mjs
npm run check:confidential
```

## Constraints
- Do not commit or push. Do not edit anything under `.company/`.
- No third-party libraries or npm dependencies.
- CSP stays self-only: no inline styles and no inline handlers. JSON-LD is data, not script; keep it escaped with `\u003c`.
- Every content string goes through `esc()` / `attr()`.
- Do not touch `src/render/hero.mjs`, `src/scripts/*`, `test/scripts.test.mjs`, `test/sections.test.mjs` or any wow-round file.
- The site stays fully readable without JS.
- If an existing pin outside the files listed above fails, stop and report it; do not edit that test.

## Out of scope
Project pages (T-019), changes to the OG image, `hreflang` (single language), a search action, and analytics.
