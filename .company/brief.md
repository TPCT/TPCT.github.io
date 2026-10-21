# Brief — Islam Elsayed portfolio (tpct.github.io)

**Size:** M (one static site, one repo). **Owner:** Islam Elsayed (GitHub `TPCT`). **Discovery:** done 2026-10-21 in the parent chat.

## Goal
A premium personal portfolio site at **https://tpct.github.io** that presents Islam as **Founder @ ShiftCodes · Systems Architect · Senior Full-Stack Engineer**, based in Alexandria, Egypt, serving clients across Egypt and the Middle East. The sibling task redesigns the GitHub profile README and links here, so the URL is fixed.

## Decisions from the user
- Language: **English only**. Style: **dark, modern, premium** by default, with a **light-mode toggle**.
- Hosting: new **public** repo `TPCT/TPCT.github.io`, GitHub Pages (build_type `workflow`, deployed by GitHub Actions).
- Content: **public repos with GitHub links** + **major private projects as case studies** (name, short description, stack, role) with **no code link and no internal URLs, credentials, hostnames, DB names or client secrets**. Skip forks and throwaway or abusive-looking repos (account generators, checkers, "unlocked", scrapers of third-party services, spam bots).
- Sections: hero, about, skills/stack, featured projects + case studies **with filtering**, experience/services, contact.
- Contact: email `eslamjackie@outlook.com`, `https://shiftcodes.net`, `https://github.com/TPCT`.

## Source of truth for facts
`.company/private/` (gitignored, never publish raw): `facts.md` (gh user + repo list + old README), `readmes.md` (README excerpts of candidate repos), `svg-text.txt` (claims from the user's own profile SVGs, e.g. "National Waste Analytics Platform — Saudi Arabia — 40%+ faster loads", "AIC Operations Suite", "Food Manufacturing ERP", domains ERP · Analytics · Banking · Insurance · LMS · SaaS · Infrastructure, process Discover → Model → Architect → Ship → Evolve).
**Never invent metrics, clients, employers, dates or testimonials** that these sources don't support.

## Constraints
- Static, fast, accessible (WCAG AA), responsive (360px → desktop), good SEO + Open Graph + favicon, works without JS for content (JS only enhances filter/theme).
- The repo is PUBLIC: the `.company/` docs that get committed must not contain private-repo secrets or internal URLs.
- Push every approved change to `origin main`. Never force-push.

## Done
https://tpct.github.io is live, verified in a browser on desktop and mobile in both themes, with review + QA files backed by real output.
