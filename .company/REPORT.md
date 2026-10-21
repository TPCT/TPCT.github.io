# Delivery report — tpct.github.io (2026-10-21)

**Live:** https://tpct.github.io · repo `TPCT/TPCT.github.io` (public) · deployed by GitHub Actions on every push to `main`.

## What was built
- Zero-dependency static site (Node build → `dist/`), dark-first with light toggle, ShiftCodes violet brand (#6E2BFB) on frosted "Prism" plates, Outfit + Plus Jakarta Sans self-hosted.
- Hero: vector ShiftCodes S-mark that assembles, idles and reacts to the pointer; violet particle "signal field"; decode-type roles; cursor glow; magnetic buttons.
- Sections: About (stacked, key facts), Experience (13 companies from the owner's LinkedIn), Journey timeline (15 real milestones, draws on scroll), Stack (+ two-row marquee), Work (20 projects, filters, live cards), Services, Process, Contact (email, GitHub, LinkedIn, ShiftCodes).
- Scroll spine linking all sections; reveal/count-up/tilt motion; everything off under reduced motion, pause toggle, and on touch for cursor effects; content visible without JS.
- SEO: title/description, JSON-LD @graph (WebSite, ProfilePage, Person, Organization, ItemList), rel=me, robots, sitemap (21 URLs), one page per project at `/work/<id>/` with BreadcrumbList, Google Search Console verification meta.
- Confidentiality gate in CI (`npm run check:confidential`): no internal hostnames or private repo names can ship.

## Evidence
- `node --test`: 71 pass / 0 fail / 1 skip (pre-existing). Reviews for every ticket in `.company/reviews/`, release QA in `.company/qa/QA-release-1.md`.
- Lighthouse mobile on the LIVE home page: **Performance 96 · Accessibility 100 · Best Practices 100 · SEO 100** (`.company/qa/lighthouse-live-home.json`); project pages 99/100/100/100 locally.

## Decisions made on the owner's behalf (full log in STATUS.md)
- Private client work shown as anonymised case studies (no repo links/hostnames); company names only from the owner's public LinkedIn; "royal family" generalised.
- Food Manufacturing ERP stays undated (no supported year).
- Title shortened to 60 chars for Google.

## Known issues / follow-ups
- Cosmetic: first About fact cell draws an extra left rule; 2 undated project pages show an empty 4th fact cell.
- Git history keeps ~82 MB of review screenshots (committed once by mistake, untracked since) and an early STATUS line naming a private design canvas — removing them needs a history rewrite + force-push, which only the owner can approve.
- Google Search Console: verify + submit `https://tpct.github.io/sitemap.xml` (owner action).
