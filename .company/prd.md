# PRD — Islam Elsayed portfolio (https://tpct.github.io)

Owner: Product Owner · Date: 2026-10-21 · Size: M · Source brief: `.company/brief.md`
Copy and data: **`.company/content.json` is the single source of truth.** All visible text is rendered from it word for word, with no edits or additions.

## 1. Problem, goal, success metrics

**Problem.** Islam Elsayed (GitHub `TPCT`) founded ShiftCodes and works as a systems architect and senior full-stack engineer. Most of his important work is private client software: ERP, government analytics, LMS and SaaS. As a result, his public GitHub footprint undersells him. Prospective clients and collaborators in Egypt and the Middle East have no single, credible place to see what he builds, how he works, and how to reach him.

**Goal.** Ship a fast, accessible, premium static portfolio at https://tpct.github.io. It must present Islam's positioning, his stack, selected private case studies (with no confidential detail), curated open-source repositories, his services and process, and a clear path to contact.

**Success metrics (verifiable at delivery):**
- M1: Site is live at https://tpct.github.io over HTTPS, deployed by GitHub Actions from `main`.
- M2: Lighthouse (mobile, home page) scores: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- M3: axe-core reports 0 serious or critical violations on `/` and `/404.html`, in both themes.
- M4: 100% of `projects` in content.json are rendered. The category filter returns the correct subset for every category.
- M5: The confidentiality check (US-15) passes with zero matches.
- M6: A visitor can reach the email link in ≤ 2 interactions from first paint (hero CTA).

## 2. Personas

- **P1 — Prospective client (decision maker).** An operations, IT or business owner in Egypt or the GCC who is evaluating a partner for an ERP, analytics or SaaS build. Skims on mobile. Wants proof of similar work and a way to get in touch.
- **P2 — Technical evaluator.** A CTO, tech lead or recruiter who checks stack depth, architecture thinking and real code. Uses desktop, opens GitHub links and filters by category.
- **P3 — Peer / open-source visitor.** Arrives from a GitHub repo or the profile README. Wants the repo list and who is behind it.
- **P4 — Assistive-technology user.** Navigates by keyboard or screen reader. May prefer reduced motion or a light theme.

## 3. User stories

Priorities use MoSCoW. "Page" means the home page `/` unless stated otherwise. All copy comes from `content.json`, abbreviated below as `c.`.

### US-01 Hero — Must
As P1, I want to understand who Islam is and what he builds within seconds, so that I decide to keep reading.
- AC1: Given the page loads at 360px and at 1440px width, when the first viewport renders, then `c.hero.name` is the only `<h1>` on the page, and `c.hero.roles`, `c.hero.headline` and the primary and secondary CTAs are visible without scrolling.
- AC2: Given the hero, when the user activates `c.hero.ctaPrimary`, then the page scrolls to the element with `id="work"` and focus lands on or within that section.
- AC3: Given the hero, when the user activates `c.hero.ctaSecondary`, then a `mailto:eslamjackie@outlook.com` link is invoked.
- AC4: The hero shows `c.hero.location` and every item in `c.hero.domains`.
- Edge: Given JavaScript is disabled, when the page loads, then all hero text and both CTAs are present and work as plain links.
- Edge: Given a 320px-wide viewport, then no hero text overflows horizontally (`document.documentElement.scrollWidth <= innerWidth`).

### US-02 Primary navigation — Must
As any visitor, I want a persistent nav, so that I can jump to any section.
- AC1: Given desktop width (≥ 1024px), then the header shows every `c.site.nav` item and the theme toggle. Each link targets an existing section id.
- AC2: Given mobile width (< 768px), when the user activates the menu button, then the nav opens, the button's `aria-expanded` becomes `true`, and Esc or selecting a link closes it and sets `aria-expanded="false"`.
- AC3: A "Skip to content" link (`c.site.skipLink`) is the first focusable element and moves focus to `<main>`.
- Edge: Given JavaScript is disabled on mobile, then the nav links are still reachable. They may be shown inline or in a no-JS fallback, but must not sit in a menu that can never open.

### US-03 About — Must
As P1/P2, I want a short narrative about Islam, so that I understand his focus and how he works.
- AC1: Given the `#about` section, then it renders all of `c.about.paragraphs`, in order, as separate paragraphs.
- AC2: The section has a heading (`<h2>`) and is reachable from nav "About".
- Edge: Text remains readable (line length ≤ ~80ch) on wide screens.

### US-04 Stats strip — Should
As P1, I want a few headline facts, so that I quickly see credibility.
- AC1: Given `c.stats` is non-empty, then each stat shows its `value` and `label`. The order follows content.json.
- AC2: No stat appears on the site other than those in `c.stats`.
- Edge: Given `c.stats` is empty or absent, then the strip is not rendered and leaves no empty gap.

### US-05 Skills / stack — Must
As P2, I want the stack grouped by area, so that I can assess fit quickly.
- AC1: Given the `#skills` section, then each `c.skills[].group` is rendered as a group heading with all of its `items`, in order.
- AC2: Items are text, not images only. If icons are used, they are decorative (`aria-hidden="true"`) and the name is still present as text.
- Edge: At 360px, groups stack vertically without horizontal scroll.

### US-06 Projects grid — Must
As P1/P2, I want to see selected case studies and open-source projects, so that I can judge real work.
- AC1: Given the `#work` section, then exactly one card renders per item in `c.projects` (count equals `c.projects.length`).
- AC2: Each card shows `name`, a kind badge from `c.projectsIntro.kindLabels[kind]`, `category`, `summary`, all `highlights` as a list, all `stack` items, `role`, and `year` when present.
- AC3: Default order is: `featured: true` items first, then the rest. Within each group, the order follows content.json.
- AC4: Given `kind = "open-source"`, then the card has a link labelled `c.projectsIntro.repoLinkLabel` pointing exactly at `repoUrl`, opened with `rel="noopener"`. The link's accessible name includes the project name.
- AC5: Given `kind = "case-study"`, then the card has no outbound link at all and shows `c.projectsIntro.privateNote`.
- AC6: `c.projectsIntro.lead` is shown above the grid.
- Edge: Given a project without `year`, then no empty year placeholder or "undefined" is shown.
- Edge: Given a project with 4 highlights or 7 stack items, then the card layout does not overflow at 360px.

### US-07 Filter projects by category — Must
As P2, I want to filter projects by category, so that I can focus on work relevant to me.
- AC1: Given the `#work` section with JS enabled, then filter controls show `c.projectsIntro.allLabel` followed by each entry of `c.categories` that has at least one project, in `c.categories` order.
- AC2: Given the user selects category X, then only cards whose `category === X` are visible, the selected control has `aria-pressed="true"` (all others `false`), and a polite live region announces the visible count (e.g. "3 projects").
- AC3: Given the user selects "All", then all cards are visible again.
- AC4: Filter controls are native buttons, reachable by Tab and operable with Enter and Space. The control group is labelled `c.projectsIntro.filterLabel`.
- Edge: Given JavaScript is disabled, then all cards are visible and the filter controls are hidden or inert. No content is hidden.
- Edge: Given a category with zero matching projects (only possible if content changes), then `c.projectsIntro.emptyState` is shown instead of a blank area.
- Edge: Filtering must not reload the page or shift scroll position by more than the height change of the grid.

### US-08 Filter state in URL — Should
As P2, I want to share a filtered view, so that a colleague sees the same projects.
- AC1: Given the user selects category X, then the URL updates (e.g. `?category=<slug>` or `#work/<slug>`) without a reload.
- AC2: Given the page is opened with that URL, then category X is pre-selected and filtered on load.
- Edge: Given an unknown slug in the URL, then "All" is selected and no error is thrown in the console.

### US-09 Filter by kind — Could
As P3, I want to show only open-source or only case studies.
- AC1: Given a kind toggle (All / Case study / Open source), when one is selected, then it combines with the category filter (logical AND).

### US-10 Services, process and experience — Must
As P1, I want to see what Islam offers and how he works, so that I know whether to engage.
- AC1: Given the `#services` section, then every `c.services[]` item renders with its `title` (as a heading) and `desc`.
- AC2: Then `c.process[]` renders as an ordered sequence (`<ol>`) of `step` and `desc`, in order (Discover → Model → Architect → Ship → Evolve).
- AC3: Then `c.experience[]` renders `role`, `org` (linked to `orgUrl`), `location` and `summary`. No dates are shown, because content.json provides none.
- Edge: At 360px, process steps stack vertically and keep their order.

### US-11 Contact — Must
As P1, I want an obvious way to reach Islam, so that I can start a conversation.
- AC1: Given the `#contact` section, then it shows `c.contact.title`, `c.contact.lead`, a `mailto:eslamjackie@outlook.com` link with visible text of the email address, a link to `https://shiftcodes.net`, a link to `https://github.com/TPCT`, and `c.contact.location`.
- AC2: External links open in a new tab with `rel="noopener noreferrer"`.
- AC3: The footer shows `c.site.footer` and repeats the email and GitHub links.
- Edge: Given JavaScript is disabled, then all contact links work.
- Edge: The email address appears in plain HTML (no JS obfuscation), so it works without JS.

### US-12 Copy email — Could
- AC1: Given JS and Clipboard API are available, when the user activates `c.contact.copyLabel`, then the email is copied and `c.contact.copiedLabel` is announced in a live region for ~2s.
- Edge: Given the Clipboard API is unavailable or rejected, then the button is hidden or falls back to selecting the email text. No uncaught error occurs.

### US-13 Theme toggle (dark default, light option) — Must
As P4/any visitor, I want to switch between dark and light themes, so that I can read comfortably.
- AC1: Given a first visit with no stored preference, then the page renders in the dark theme, whatever the OS setting.
- AC2: Given the user activates the toggle, then the theme switches immediately, the toggle's accessible name updates to `c.site.themeToggle.toDark`/`toLight`, and the choice is saved in `localStorage`.
- AC3: Given a stored preference, when any page (including 404) loads, then that theme is applied before first paint, with no flash of the other theme (verified by the `data-theme` attribute already set in initial HTML parsing via an inline head script).
- AC4: Both themes meet WCAG AA contrast (text ≥ 4.5:1, large text and UI components ≥ 3:1).
- AC5: `<meta name="theme-color">` matches the active theme (`c.site.themeColorDark` / `themeColorLight`).
- Edge: Given `localStorage` throws (private mode or blocked), then the toggle still switches the theme for the session without a console error.
- Edge: Given JavaScript is disabled, then the dark theme renders fully and the toggle is hidden.

### US-14 SEO, Open Graph, favicon — Must
As Islam, I want the site to look correct in search results and link previews.
- AC1: `/` has `<title>` = `c.site.title`, `<meta name="description">` = `c.site.description`, `<html lang="en">`, and `<link rel="canonical" href="https://tpct.github.io/">`.
- AC2: Open Graph tags are present: `og:title`, `og:description`, `og:url`, `og:type=website`, `og:image` (absolute URL, 1200×630 PNG ≤ 300 KB), `og:image:alt`. Twitter tags are present: `twitter:card=summary_large_image`, title, description and image.
- AC3: Given the OG image URL, when fetched, then it returns HTTP 200 with `image/png`.
- AC4: A favicon (SVG plus a 32px PNG/ICO fallback), an `apple-touch-icon` (180×180) and a web manifest are present and return 200.
- AC5: JSON-LD `Person` structured data includes name, jobTitle, url, `sameAs` [GitHub, ShiftCodes], address locality Alexandria, country EG. It validates with no errors in a schema validator.
- AC6: `robots.txt` allows all and references `sitemap.xml`. `sitemap.xml` lists `https://tpct.github.io/`.
- Edge: `/404.html` has `<meta name="robots" content="noindex">` and is not in the sitemap.

### US-15 Confidentiality guard — Must
As Islam, I want no private client details leaked, because the repo and site are public.
- AC1: Given the built site and every committed file outside `.company/private/`, when searched case-insensitively for the regex `[a-z0-9-]+\.(shiftcodes\.net|xcutor\.net)` and for the private repository names listed in `.company/private/readmes.md` under `vis: private` (excluding generic dictionary words such as "licence"; the check list is kept out of the public repo), then there are 0 matches. (The bare domain `shiftcodes.net` is allowed.)
- AC2: No `case-study` item renders any `<a>` element. No repo URL other than those in `c.projects[].repoUrl` appears.
- AC3: `.company/private/` is gitignored and absent from the deployed artifact.
- Edge: Given content.json is edited later and a case study gains a `repoUrl`, then the renderer ignores it for `kind = "case-study"`.

### US-16 Accessibility — Must
As P4, I want to use the whole site with keyboard and screen reader.
- AC1: Landmarks: one `<header>`, `<nav>`, `<main>` and `<footer>`. Each section has an `<h2>`, and there are no skipped heading levels.
- AC2: Every interactive element is reachable by Tab in visual order and has a visible focus indicator with ≥ 3:1 contrast in both themes.
- AC3: Given `prefers-reduced-motion: reduce`, then non-essential animations and smooth scrolling are disabled.
- AC4: axe-core finds 0 serious or critical violations on `/` (all filter states tested: All plus one category) and on `/404.html`, in both themes.
- AC5: Decorative images and SVGs have `alt=""` or `aria-hidden="true"`. Meaningful images have descriptive alt text.
- AC6: Page is usable at 200% browser zoom and at a 320px viewport with no loss of content or horizontal scroll.

### US-17 Performance — Must
As P1 on mobile data, I want the site to load fast.
- AC1: Lighthouse mobile (simulated throttling) on `/`: Performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms.
- AC2: Total transfer for `/` on first load is ≤ 350 KB (gzip), excluding the OG image, which is not requested by the page.
- AC3: No runtime requests to third-party origins (no external fonts, analytics or CDNs). All assets are served from `tpct.github.io`.
- AC4: Page JavaScript is ≤ 30 KB gzip and is not render-blocking (except the tiny inline theme script from US-13 AC3).
- Edge: Web fonts, if any, are self-hosted, subset, `font-display: swap`, ≤ 2 files preloaded.

### US-18 Responsive layout — Must
- AC1: Given widths 360, 768, 1024 and 1440px, then no horizontal scrollbar appears, text is never clipped, and the projects grid shows 1, 2, 2–3 and 3 columns respectively (±1 allowed by design).
- AC2: Tap targets are ≥ 44×44 px on touch widths.

### US-19 404 page — Must
As a visitor following a broken link, I want a helpful page, so that I can get back to the site.
- AC1: Given a request to a non-existent path (e.g. `/does-not-exist`), then GitHub Pages serves `/404.html` with HTTP status 404.
- AC2: The page shows `c.notFound.code`, `c.notFound.title` (as `<h1>`), `c.notFound.message` and a link `c.notFound.cta` to `/`. It uses the site header or logo, applies the stored theme, and has a `<title>` containing "404".
- Edge: Given JavaScript is disabled, then the 404 page renders fully in the dark theme with a working link home.

### US-20 Deploy pipeline — Must
As Islam, I want every push to `main` to publish automatically.
- AC1: Given a push to `main`, then a GitHub Actions workflow builds (if needed) and deploys to Pages. The workflow run is green and the live site reflects the commit within the run.
- AC2: Given the build fails (e.g. invalid content.json), then the deploy job does not run and the live site stays on the previous version.

### Won't (this release)
- US-21 Blog or articles — Won't.
- US-22 Contact form with a backend or a third-party form service — Won't (mailto only).
- US-23 Arabic or RTL version — Won't (the user decided English only).
- US-24 Analytics or tracking — Won't.
- US-25 Per-project detail pages — Won't (cards carry the full case-study content).
- US-26 Downloadable CV — Won't (no CV content provided).
- US-27 Live GitHub API data (stars and so on) — Won't. Data is static from content.json.

## 4. Non-functional requirements

- **Static and no-JS-first:** all content is present in the server-delivered HTML. JS only enhances the filter, theme, mobile menu and copy-email features.
- **Performance:** see US-17. No layout shift from fonts or images (explicit dimensions).
- **Accessibility:** WCAG 2.2 AA (see US-16). Respect `prefers-reduced-motion`.
- **Security:** no secrets, internal hostnames or private repo names anywhere (US-15). External links use `rel="noopener noreferrer"`. No inline event handlers. A Content-Security-Policy `<meta>` allows `'self'` plus only the inline theme script (hash). No third-party scripts.
- **Privacy:** no cookies, no tracking, no analytics. `localStorage` holds only the theme key.
- **Browser support:** the latest two versions of Chrome, Edge, Firefox and Safari (desktop and iOS), plus Chrome Android.
- **Responsive:** 320px → 1920px (US-18).
- **i18n:** English only, `lang="en"`, LTR. Correct rendering of characters such as "→", "·", "–" and "©" (UTF-8).
- **Content integrity:** copy from content.json is rendered verbatim. The build fails if content.json is invalid JSON or a project's `category` is not in `c.categories`.
- **Maintainability:** adding a project means editing content.json only, with no template changes.

## 5. Non-goals

- No CMS, backend, database, authentication or server-side code.
- No Arabic/RTL locale.
- No fetching live data from GitHub or any API at runtime.
- No screenshots of private client systems (confidentiality, and none were provided).
- No testimonials, client logos or metrics beyond those in content.json.
- No custom domain. The URL stays https://tpct.github.io.

## 6. Assumptions (decided by the PO; the user is unavailable)

1. **Default theme is dark for everyone** (brand decision from the brief), not OS-driven. Light mode is opt-in and persisted.
2. **Single-page site** plus `404.html`. Case studies are cards with full content rather than separate pages, which keeps the MVP small.
3. **Categories:** seven categories are used: Enterprise & ERP, Analytics & AI, FinTech & Banking, Education, SaaS & Platforms, APIs & Backend, Developer Tools. "Web" and "Automation & Tools" from the suggested list were replaced by "Developer Tools" and "APIs & Backend", which fit the curated items better. AI and analytics are merged.
4. **Curation (open source, 8 repos):** JenDock, tpct-mac-theme, palm-resources-01, palm-resources-02, order-payment-api, social-media-scheduler, Egyptian-National-ID, simple_compiler. `advansys` and `EasyPeasy` are **excluded** because their READMEs are stock Laravel boilerplate, so their purpose can't be described without inventing it. Static client-site repos, forks, scrapers, generators, checkers, bots, "unlocked" repos and coursework (C exercise solutions, AVR drills) are excluded under the brief's rules.
5. **Curation (case studies, 11):** national waste analytics (KSA), AIC operations suite, factory operations & inspections, food-manufacturing ERP, multi-school LMS, gaming-community catalog & gifting platform, multi-tenant B2B CRM, multi-tenant POS, video ad-break recommender, OCR/OMR document processing, bank & insurer websites. Private items with no describable content (e.g. a WhatsApp tool, an eSIM project, an HRM with a boilerplate README) are left out rather than invented. Items with a questionable purpose (a captcha-inference service, a cookie-extraction extension, bot monitoring) are excluded.
6. **Client naming:** "AIC" and "National Waste Analytics Platform — Saudi Arabia" are named because they appear in Islam's own public profile graphics. All other clients are described by sector only. Third-party game and platform brands are not named.
7. **Role labels:** private case studies use "Systems architect & lead engineer", reflecting Islam's founder/architect position at ShiftCodes. Smaller builds use "Lead engineer" or "Full-stack engineer". Open-source items use "Author".
8. **Years:** shown only where a repository's creation year supports them. They are omitted for the analytics platform, the food ERP and OCR/OMR, where the mapping to a dated repo is uncertain.
9. **Food ERP stack** (Laravel, PHP, Vue.js) is inferred from the ERP repository's language mix. This is a best-effort, low-risk assumption.
10. **Stats:** only three supportable stats: "40%+ faster loads" (Islam's own claim), the 7 domains listed in his own profile graphics, and GitHub activity since 2016 (account creation date). No client counts, years-of-experience figures or project counts.
11. **Experience** shows only the ShiftCodes founder role, with no dates. Earlier employers aren't documented, so none are listed.
12. **OG image** is a generated 1200×630 brand card (name, roles, domains). No photo of Islam is used, because none was provided.
13. **Email is shown in plain text.** Islam already publishes it on his GitHub profile, so obfuscation adds friction with no benefit.
