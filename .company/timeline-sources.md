# Timeline sources

Every entry in `timeline.json` and the fact it rests on. Revised 2026-10-21 by the Product Owner, with the owner's LinkedIn (`.company/private/experience.md`, abbreviated **EXP** with its row number) as the source of truth for roles, dates and numbers. Company names come from his public LinkedIn. Private client work is described only by sector.

All 15 entries use the existing kinds (`company`, `client`, `open-source`, `milestone`). Employers use `company`, so **no new `role` kind is needed**, and `validate.mjs`/`kindLabels` stay unchanged.

| # | Year | Entry | Evidence |
|---|------|-------|----------|
| 1 | 2016 | First code on GitHub | GitHub account TPCT created 2016-05-27. The earliest public repos are Python and PHP utilities from 2016-05 to 2016-07. Kept from the previous version. |
| 2 | 2017 | First role at Aqua Web, first freelance clients | EXP #13b: Web Developer at Aqua Web, Mar 2017, Alexandria. EXP #13: Full Stack Engineer, Sep 2018 – Sep 2019, 20+ modular MVC apps. EXP #4: freelance from Jan 2017, ~250 projects in Python and PHP. |
| 3 | 2019 | Full-stack engineer at WeDoAcc | EXP #11: Jan 2019 – Sep 2022, part-time. The accounting suite, CRM and "+30% feature delivery" come from its highlight. |
| 4 | 2019 | C, compilers and embedded systems | Public `simple_compiler` created 2019-07-24, plus `EEPROM-PROGRAMMER`, `C-LIBS` and `AVR` (2019). Kept from the previous version. |
| 5 | 2021 | Full-stack engineer at Stackdeans | EXP #12: Jan 2021 – Aug 2022. "10+ Laravel sites", "Stripe and AI features", "conversions +25%" and "Docker CI/CD" come from its highlight. |
| 6 | 2022 | CTO at Venu Dine | EXP #10c: Senior Back End Developer from Sep 2022. EXP #10: CTO Nov 2022 – Sep 2023. The FastAPI + Laravel + Flutter stack, "200k+ daily requests" and "100% uptime" come from its highlight. |
| 7 | 2023 | Team leader at dot.jo | EXP #9: May 2023 – Jun 2025. "25+ projects", "3 bank websites", the Filament headless CMS and "~1 month → 4 days" come from its highlight. The royal family is described as "high-profile Jordanian clients" (rule). |
| 8 | 2024 | Senior software engineer at Kearney | EXP #7: Senior Software Engineer, contract, from Jun 2024. The government refactor and hardening come from its highlight. The analytics work itself is dated 2025 (entry 11). |
| 9 | 2025 | CTO at IPXBit | EXP #8: Mar 2025 – Sep 2025. "Microservices → modular monolith, DB per module", "$15k → $2k" and the four teams come from its highlight. |
| 10 | 2025 | Bilingual Banking CMS open-sourced | Public repo `ashurbank.iq` created 2025-05-10. Kept from the previous version (content.json project year 2025). |
| 11 | 2025 | National Waste Analytics Platform | EXP #7 / #7b highlight: national waste analytics, Django/React, real-time maps, SSO, 100M+ rows, 3 s → 500 ms. The note in EXP says "KSA analytics platform, 2025", and the owner confirmed 2025 earlier. **This replaces the former "40%+ faster loads" claim** everywhere (timeline, case study, stats). |
| 12 | 2025 | Team lead at Raqmix, senior engineer at Everything To Gain | EXP #5 (Raqmix, Oct 2025 – Apr 2026, led Python teams) and EXP #6 (Everything To Gain, Texas US, Oct 2025 – Apr 2026). Laravel/FastAPI/.NET multi-tenant work and PayPal/MasterCard/HyperPay come from its highlight. |
| 13 | 2026 | CEO of ShiftCodes | EXP #3: Chief Executive Officer, Mar 2026 – Present. The named systems are content.json case studies with year 2026 (AIC Operations Suite, Multi-School Learning Platform, Multi-Tenant B2B CRM) plus the undated ERP. "Full-time" follows from freelance ending Jun 2026 (EXP #4). |
| 14 | 2026 | Technical lead for Monglish and Edulixa360 | EXP #1 and #2: Senior Technical Team Lead & Technical Consultant, Aug 2026 – Present, Alexandria (hybrid) and Saudi Arabia (remote). |
| 15 | 2026 | JenDock | Public repo `JenDock` created 2026-10-10. Kept from the previous version. |

Order inside a year follows start month: 2019 WeDoAcc (Jan) before the compiler (Jul); 2025 IPXBit (Mar), CMS (May), analytics (Kearney's 2025 role from Jun), Raqmix/ETG (Oct); 2026 ShiftCodes (Mar), Monglish/Edulixa360 (Aug), JenDock (Oct). Years never decrease.

## Removed or folded in (vs the previous version)
- **2021 PHP MVC framework**, **2025 Open-source APIs**, **2026 TPCT Mac**: dropped to keep the timeline at 15 and focused on the career. They are still in Selected work.
- **2023 Laravel product and client work** and **2024 Bank & Insurer Corporate Websites**: replaced by the dot.jo entry, which is the real employer for that Jordan banking and web work.
- **2025 ShiftCodes delivering client systems**: dropped. LinkedIn dates the CEO role to Mar 2026, so the 2026 entry carries ShiftCodes and the timeline makes no founding-date claim.
- **2025 Multi-Tenant POS**, **2026 Enterprise ERP & CRM**, **2026 AIC Operations Suite**, **2026 Multi-School Learning Platform**: folded into the 2026 ShiftCodes entry. They are still in Selected work.
- **Food Manufacturing ERP**: still undated. It is not the Venu Dine platform (see the content-career notes), so it gets no year.

## Still excluded
- Account generators, checkers, scrapers and bots: excluded by rule. Freelance scraping is mentioned only generically in Experience ("data-extraction and automation tooling"), never in the timeline.
- Internal ShiftCodes hostnames, private repo names and people's names: never used.

## Developer notes (T-013 pins to update)
- The entry count is **15**, the same as before. Same-year groups are now 2019×2, 2025×4 and 2026×3.
- There are now **3** timeline links (simple_compiler, ashurbank.iq, JenDock), down from 6. Update the "6 links" acceptance pin to 3. Every link is still `https://github.com/TPCT/…`.
- Company names (Aqua Web, WeDoAcc, Stackdeans, Venu Dine, dot.jo, Kearney, IPXBit, Raqmix, Everything To Gain, ShiftCodes, Monglish, Edulixa360) now appear in the timeline. None is on the private denylist, and all are public on the owner's LinkedIn.
