# Distribution, attention & funding avenues for EdLove / Gurudevi

*Prepared 2026-10-16 for Naveen. Situation: solo founder, $0 budget, MIT repo public at https://github.com/NeevSK/EdLove, Gurudevi (React Native/Expo, offline-first, teacher wellbeing, Sri Lanka) in development, no store release, no users.*
*Links were checked by HTTP GET today. "✓" means 200. "⚠" means the site blocked or timed out from my server (not proven dead), so open it in a browser. Deadlines say "check" where the official page didn't state one in a form I could confirm. Nothing here was submitted.*

---

## 1. Expo App Awards 2026: verdict

**Official page:** https://expo.dev/awards/2026 ✓

Exact lines from the page:
- "Open for submissions … **October 5-31st**" (2nd edition)
- Categories: **App of the year** ("A cross-platform app with a custom UI, seamless performance, and **real-world scale**"), **Most creative**, **Community's choice** ("voted on through an open poll on 𝕏"), **Largest scale**, **Most innovative** ("Given to **indie teams, startups, or anyone daring to try something new**").
- Prize (App of the year): "**$1000 of Expo credit**", "App award winner apparel". Winners also get "a handcrafted metal cube".
- "**Limit: one submission per person (one email per submission).**"
- "Each submission is reviewed manually, and we'll follow up if your app is nominated."
- "Expo's team will review each submission using a mix of objective criteria and subjective judgment… Decisions will be made internally, without outside reviewers or legal appeals."
- "Finalists will be announced … on **November 6th**, and winners will be revealed on **November 13th**."
- Expo's launch post on X (@expo, mirrored at https://nitter.cf/expo/status/2107105089957859761) says: "**Submission criteria is simple: if your app uses Expo you should submit it.**"

**What the page does not say:** it has no explicit requirement to be published on a store, to have real users, or to be open source. The submission form isn't in the page HTML, so I couldn't see its fields. Past finalists/apps on the page all carry App Store / Play `storeUrl` links, which suggests a store link is the normal expectation.

**Verdict:** **Yes, he can enter now.** Nothing in the official text forbids an in-development app, and the deadline is **31 Oct 2026, 15 days away**. Realistically, App of the year and Largest scale need real-world scale, so they're out. **Most innovative** (open to "anyone daring to try something new") is the right target. Community's choice needs an 𝕏 following. Odds are low, but it's free and the write-up gets reused for everything below.

**Minimum to make the entry credible (pick at least one link reviewers can open):**
1. **Android preview build** via EAS (`eas build -p android --profile preview` produces an installable APK link). Free tier, no Play account needed. Or a **Play internal/closed testing** link (needs the $25 one-time Play developer fee).
2. **Expo web build** of Gurudevi deployed to Vercel/Netlify/GitHub Pages (free) as a live demo.
3. A **60–90 s screen recording** showing offline-first behaviour (airplane mode → keeps working → syncs) plus the privacy ledger. That's the "technical nuance" the page asks for.
4. Write-up: offline-first PowerSync/SQLite, Sinhala/Tamil/English, teacher-wellbeing focus, privacy ledger, MIT open source.

TestFlight needs an Apple Developer account ($99/yr), so skip it. Android plus web is enough.

### Adjacent RN/Expo/dev competitions that accept in-development or OSS projects
| Avenue | What | Accepts pre-release / OSS? | Link |
|---|---|---|---|
| Devpost hackathons | Online hackathons; many are "social good"/AI/mobile with cash prizes | Yes. Built during the event, or existing projects if the rules allow | https://devpost.com/hackathons ✓ |
| MLH | Weekend hackathons (online) | Yes. New work only | https://mlh.io ✓ |
| HackerEarth | Hackathons, often India/South Asia sponsors | Yes | https://www.hackerearth.com ✓ |
| Hacktoberfest | October OSS contribution month. Tag your repo `hacktoberfest` to attract contributors | Yes, OSS | https://hacktoberfest.com ✓ |
| Expo Discord #showcase | Community showcase channel | Yes | https://chat.expo.dev ✓ |
| React Native showcase | Official list of RN apps | Expects shipped apps (later) | https://reactnative.dev/showcase ✓ |
| awesome-expo / awesome-react-native | Curated lists, accept PRs | OSS repos OK | https://github.com/expo/awesome-expo ✓ · https://github.com/jondot/awesome-react-native ✓ |

---

## 2. Avenues

Columns: **Users?** = needs real users/pilot. **Pub?** = needs published app. **Org?** = needs registered organisation. Effort is S/M/L. "Ready now" says yes, or what's needed first.

### A. Open-source / DPG ecosystems
| Avenue | What & why EdLove fits | Requirements | Effort / cost | Cadence | Ready now? | Link |
|---|---|---|---|---|---|---|
| **Digital Public Goods Alliance registry** | UN-endorsed registry. Governments, UNICEF and GPE procure from it. Lists edu DPGs like Kolibri and Sunbird. Huge legitimacy for a Sri Lankan public-sector pitch | 9 indicators, all must pass. **No user count required.** The FAQ says DPG status is valid one year. "The DPG Standard exclusively focuses on the design of the core solution… does not evaluate local implementations" | M / free | Rolling | **Needs: SDG statement, ownership statement, privacy/do-no-harm write-ups** (checklist below) | https://www.digitalpublicgoods.net/standard ✓ · apply: https://app.digitalpublicgoods.net ✓ · questions: https://github.com/DPGAlliance/dpg-standard/blob/main/standard-questions.md ✓ |
| Learning Equality community (Kolibri) | Forum for offline-ed builders. Share the offline sync design, possibly Kolibri content interop | None | S / free | Ongoing | Yes | https://community.learningequality.org ✓ |
| Sunbird (DIKSHA building blocks) | DPG community. Sunbird building blocks could serve content/assessment | None to participate | S / free | Ongoing | Yes | https://sunbird.org ✓ |
| awesome-opensource-school | Curated OSS-for-schools list (133★) | PR, OSS | S / free | Any | Yes | https://github.com/zefanja/awesome-opensource-school ✓ |
| awesome-edtech-tools | Curated edtech list (216★) | PR | S / free | Any | Yes | https://github.com/hkalant/awesome-edtech-tools ✓ |
| GitHub Sponsors / Open Collective | Let people fund you. Open Collective can act as a fiscal host, so no own org needed | GitHub Sponsors needs a supported payout country/Stripe. Check Sri Lanka support | S / free | Ongoing | Yes (Open Collective). Check Sponsors eligibility | https://github.com/sponsors ✓ · https://opencollective.com ✓ |

#### DPG checklist status for EdLove (from a repo scan today, not a full review)
| # | Indicator | Status | Gap |
|---|---|---|---|
| 1 | SDG relevance | Likely pass (SDG 4 Quality Education, SDG 3 wellbeing, SDG 8 decent work for teachers) | Write a short SDG statement with evidence links |
| 2 | Open licence | **Pass**: `LICENSE` (MIT) at root | Any docs/content need CC-BY/CC0 if submitted as content |
| 3 | Clear ownership | Partial: repo under NeevSK, `DCO.md` present | Add an ownership/copyright statement (who owns EdLove: you personally?) |
| 4 | Platform independence | Likely pass if the proprietary deps (Supabase, PowerSync, Doppler, Vercel) have open alternatives. Supabase and PowerSync have self-host options | Document the open-source alternatives for each closed dependency |
| 5 | Documentation | **Pass-ish**: README, CONTRIBUTING, docs/ | Add a clear install/run guide a technical outsider can follow |
| 6 | Non-PII data extraction | Unknown | Show non-PII data can be exported in an open format (CSV/JSON) |
| 7 | Privacy & applicable laws | Partial: privacy/terms pages exist (`apps/gurudevi-web/.../privacy`, `gurudevi-marketingWeb/.../privacy.astro`) and a privacy ledger feature exists | Name the laws: Sri Lanka **Personal Data Protection Act No. 9 of 2022**, plus GDPR if relevant |
| 8 | Open standards & best practices | Partial: CODE_OF_CONDUCT, SECURITY.md, CI | List the standards used (OAuth/OIDC, SQLite, JSON, WCAG, etc.) |
| 9a | Data privacy & security | Partial: privacy code exists | Write how teacher reflections (PII/sensitive) are protected (encryption, RLS, Law of Different Views) |
| 9b | Inappropriate content | Gap | Needs a content policy plus a report/remove process if users can post content |
| 9c | Harassment / underage users | Gap | If there is chat or interaction, add block/report and a policy for minors (guardian/child routes exist) |

**Bottom line:** a DPG application is feasible **with zero users**. It's about 2–4 days of policy writing, and it's the single highest-leverage free step.

### B. Multilateral / sector bodies
| Avenue | Fit | Requirements | Effort / cost | Cadence | Ready? | Link |
|---|---|---|---|---|---|---|
| UNICEF Venture Fund | Equity-free funding ($50k–100k typical) for **open-source** frontier tech in programme countries. Sri Lanka is a UNICEF programme country | Registered company in an eligible country, open-source licence, **working prototype**, usually early traction | L / free | Thematic calls, check the page | Needs: registered entity + prototype demo | https://www.unicef.org/innovation/venturefund ✓ |
| Giga (UNICEF/ITU) | School-connectivity mapping. An offline-first story is relevant | Partnerships, usually with governments | M | Ongoing | Later (with MoE) | https://giga.global ✓ |
| EdTech Hub | Global evidence org. Helpdesk and sandboxes in LMICs, reads DPG/OSS work | Usually pilots/research partners | M | Calls vary | Needs pilot | https://edtechhub.org ✓ |
| Global Partnership for Education | Funds governments. EdLove would reach it via the MoE, not directly | Govt channel | L | — | Later | https://www.globalpartnership.org/ ✓ |
| UNESCO digital education | Policy, Global Education Coalition, ICT-in-education prize (King Hamad, annual) | Prize usually needs an implemented project | M | Annual | Needs pilot | https://www.unesco.org/en/digital-education ✓ |

### C. Sri Lanka
| Avenue | Fit | Requirements | Effort / cost | Ready? | Link |
|---|---|---|---|---|---|
| Ministry of Education | Teacher-wellbeing pilot in a zone. DPG status helps | Formal letter / proposal, ideally through a zonal director or school principal | M / free | Needs: demo + 1-page brief + a friendly principal | https://www.moe.gov.lk ⚠ (timed out from my server) |
| National Institute of Education (NIE) | Teacher education and curriculum. Natural home for teacher PD/wellbeing | Proposal, research partnership | M | Needs brief + demo | https://nie.lk ✓ |
| ICTA Sri Lanka | Govt digital agency, GovTech/DPG-aligned | Proposal | M | Later | https://www.icta.lk ⚠ |
| University of Moratuwa (CSE dept / final-year projects) | Free contributor pipeline: students take EdLove modules as projects, Sinhala/Tamil NLP research | A clear "project ideas" list | S | **Yes: write a 1-page projects list** | https://uom.lk ✓ |
| UCSC (Univ. of Colombo School of Computing) | Same, plus their Language Technology Research Lab (Sinhala) | Same | S | Yes | https://www.ucsc.cmb.ac.lk ✓ |
| FOSS Sri Lanka community | Local OSS meetups/talks | None | S | Yes | https://foss.lk ✓ |
| SLASSCOM | Tech industry body: startup programmes, pitch events | Company usually needed | M | Later | https://www.slasscom.lk ✓ |
| Teach For Sri Lanka | Fellows are teachers in under-resourced schools, an ideal **first pilot cohort** for a wellbeing app | Relationship, demo | S / free | Needs demo build | https://www.teachforsrilanka.org ✓ |
| Teacher unions (e.g. Ceylon Teachers' Union) | Teacher wellbeing is a union concern, and unions can spread the word | Relationship. Be careful with politics | M | After a pilot | (no verified website found) |

### D. Grants & funds for OSS / edtech (Global South)
| Avenue | Fit | Requirements | Users? / Org? | Cost | Cadence | Ready? | Link |
|---|---|---|---|---|---|---|---|
| **NLnet / NGI Zero Commons Fund** | €5k–50k for open-source internet-commons work. Individuals worldwide can apply (EU/NGI-relevance required) | Short proposal (form), FOSS licence, concrete milestones | No / No | Free | Calls about every 2 months (check the page for the next deadline) | **Yes**: frame offline-first sync, privacy ledger or local-first ed infrastructure as a commons building block | https://nlnet.nl/propose/ ✓ · https://nlnet.nl/commonsfund/ ✓ |
| Sovereign Tech Fund | Funds critical OSS infrastructure (not apps) | Widely used infra | n/a | Free | Rolling | No (EdLove is an app). Maybe for a reusable sync library later | https://www.sovereign.tech/programs/fund ✓ |
| Mozilla Foundation (funding) | Trustworthy AI / openness grants, fellowships | Varies by call | Often org | Free | Calls vary | Check calls | https://foundation.mozilla.org/en/what-we-fund/ ✓ |
| GitHub Accelerator | Cash + mentorship for OSS maintainers | Active OSS project with community | No / No | Free | Cohorts (check) | Needs: community traction (stars/contributors) | https://accelerator.github.com ✓ |
| GitHub Secure Open Source Fund | Security-focused funding for OSS | Widely used OSS | n/a | Free | Cohorts | No (needs adoption) | https://github.com/open-source/github-secure-open-source-fund ✓ |
| Prototype Fund | German govt fund for OSS prototypes. **Germany-resident only** | Residency | — | — | — | Not eligible (model only) | https://prototypefund.de ⚠ |
| Fast Forward | Tech-nonprofit accelerator ($25k+) | **Registered nonprofit (US 501c3 or equivalent)** with a product | Org yes | Free | Annual | Needs nonprofit | https://www.ffwd.org ✓ |
| Google.org (Impact Challenges, Accelerator: Generative AI) | Big grants via calls | Usually registered nonprofit | Org yes | Free | Calls | Later | https://www.google.org ✓ |
| Hewlett Foundation: Open Education | OER field funding | Mostly invited, orgs | Org yes | — | Invite | No | https://hewlett.org/strategy/open-education/ ✓ |
| Jacobs Foundation | Learning/child development, evidence-focused | Org + research partner | Org yes | — | Calls | Later (with a university) | https://jacobsfoundation.org ✓ |
| Wellcome (mental health) | Mental-health research funding | Research institution as lead | Org yes | — | Schemes | Only via a university partner researching teacher mental health | https://wellcome.org/research-funding/schemes ✓ |
| Google Summer of Code / Outreachy | Paid contributors to your project (you mentor) | Usually joins under an established umbrella org | No / umbrella | Free | Annual (orgs apply ~Jan–Feb) | Possible later under an umbrella | https://summerofcode.withgoogle.com ✓ · https://www.outreachy.org ✓ |

### E. Innovation lists, prizes & challenges
| Avenue | Fit | Requirements | Users? | Cost | Cadence | Ready? | Link |
|---|---|---|---|---|---|---|---|
| HundrED innovations | Global list of K-12 innovations. Selections evaluate impact & scalability | Innovation profile. Selection favours **evidence of implementation** | Pilot preferred | Free | Annual collections | Profile: yes. Selection: needs pilot | https://hundred.org/en/innovations ✓ |
| MIT Solve | Global challenges (learning, health). Up to ~$10k+ plus network | **Prototype or later**, and team | Prototype stage OK | Free | Annual (opens ~Mar) | Needs: working prototype + demo | https://solve.mit.edu/challenges ✓ |
| Reimagine Education (QS/Wharton) | Edtech awards | Usually implemented solutions with evidence | Yes | Fee may apply | Annual | Needs pilot | https://www.reimagine-education.com ✓ |
| WISE (Qatar Foundation) | WISE Awards / Prize. Projects with proven impact | Proven impact | Yes | Free | Annual | No (needs impact). The old prize URL now returns 404 | https://www.wise-qatar.org ✓ |
| XPRIZE | Large prizes. Occasional learning prizes | Team, specific challenge | Varies | Free | Rare | Watch only | https://www.xprize.org ✓ |
| Yidan Prize | Education research / development (large) | Established track record | Yes | — | Annual | No | https://yidanprize.org ✓ |
| Global Teacher Prize | For teachers, not tools | Teacher nominee | — | — | Annual | Not a fit (but a Gurudevi pilot teacher could later be one) | https://www.globalteacherprize.org ✓ |
| Ashoka Fellowship | Social entrepreneur fellowship | Proven system-change idea | Yes | Free | Rolling | Later | https://ashoka.org ✓ |

### F. Developer attention (free, no users needed)
| Avenue | Angle for EdLove | Rules / requirements | Effort | Ready? | Link |
|---|---|---|---|---|---|
| **Show HN** | "Show HN: Offline-first, MIT teacher-wellbeing app for Sri Lankan schools (Expo + PowerSync)" | Must be something people can try. A repo plus web demo qualifies | S | Needs: web demo or APK | https://news.ycombinator.com/showhn.html ✓ |
| Product Hunt | Launch day | Better with a usable product | M | After web demo | https://www.producthunt.com ✓ |
| dev.to / Hashnode posts | Technical write-ups: "Law of Different Views", offline sync with PowerSync + Drizzle, Sinhala/Tamil i18n | None | S | **Yes** | https://dev.to ✓ |
| r/reactnative, r/expo | Architecture post plus feedback request | Sub rules (self-promo limits) | S | Yes | https://www.reddit.com/r/reactnative ✓ |
| Expo Discord showcase | Share build, ask for feedback | None | S | Yes | https://chat.expo.dev ✓ |
| Lobsters | Technical deep-dives | Invite-only account | S | If invited | https://lobste.rs ✓ |
| Indie Hackers | Founder journey | None | S | Yes | https://www.indiehackers.com ✓ |
| 𝕏 / Bluesky build-in-public | Needed for Expo Community's choice too | None | S ongoing | Yes | — |

### G. Conferences & CFPs (talks are free exposure; travel often isn't)
| Avenue | Fit | Requirements | Cost | Cadence | Ready? | Link |
|---|---|---|---|---|---|---|
| FOSSASIA Summit | Asia's big OSS conf. Edu & open-tech tracks. CFP on Eventyay | Talk proposal. No users needed | Travel (Bangkok/SG). Online/remote sometimes | Annual (~Mar–Apr). CFP ~Dec–Jan | **Yes**: propose "Offline-first edtech for Sri Lankan teachers" | https://fossasia.org ✓ · https://eventyay.com ✓ |
| React Native EU | RN conference (Poland) | CFP proposal | Travel | Annual (~Sep). CFP ~spring | Yes for next year's CFP | https://www.react-native.eu ✓ |
| App.js Conf | Expo-community conference (Kraków) | CFP | Travel | Annual (~May/June) | Yes for CFP | https://appjs.co ✓ |
| PyCon Sri Lanka / local meetups | Local visibility | Talk proposal | Local | Annual | Yes | https://www.pycon.lk ⚠ (timed out) |
| FOSS SL meetups | Local OSS | Talk | Free | Ad hoc | Yes | https://foss.lk ✓ |

### Which avenues need real users/pilots
Real users or a pilot are needed for: UNICEF Venture Fund (traction preferred), HundrED selection, Reimagine Education, WISE, Yidan, Ashoka, EdTech Hub sandboxes, GitHub Accelerator/Secure OSS Fund (community/adoption), Product Hunt (to land well), MoE/NIE adoption, and the Expo App of the year / Largest scale categories.

**Not needed:** DPG registry, NLnet, Expo Most innovative entry, awesome-lists, dev posts, Show HN (needs a demo, not users), FOSSASIA/RN CFPs, university project partnerships, Teach For Sri Lanka outreach.

---

## 3. Do now with zero users (shortlist)
1. **Enter Expo App Awards, Most innovative, by 31 Oct.** Needs an EAS Android preview APK, a web demo, and a 90 s offline-first video.
2. **Apply to the DPG registry.** Write the SDG, ownership, privacy (Sri Lanka PDPA 2022), content-moderation and harassment/minors statements. Use the eligibility tool, then submit at app.digitalpublicgoods.net.
3. **NLnet NGI Zero Commons proposal** for one reusable commons piece: the offline-first sync + privacy ledger / "Law of Different Views" access layer.
4. **One deep technical post** on dev.to, cross-posted to r/reactnative and Expo Discord, then **Show HN** once the web demo is live.
5. **Teach For Sri Lanka + one friendly principal:** a 10-teacher closed beta via the APK. This turns "no users" into a pilot, which unlocks most of section E.
6. **University of Moratuwa / UCSC project list:** 5–8 scoped student projects (Sinhala/Tamil i18n, accessibility, analytics) for free contributors.
7. **PRs to awesome-opensource-school and awesome-edtech-tools**, plus the GitHub topics `edtech`, `offline-first`, `teacher-wellbeing`, `expo`, `hacktoberfest`.

## 30-day sequence (16 Oct → 15 Nov 2026)
| Days | Do |
|---|---|
| 1–3 (16–18 Oct) | EAS Android preview build. Expo web build to Vercel/GitHub Pages. Record a 90 s demo (offline → sync, privacy ledger, Sinhala UI). Clean the README with a demo link and screenshots. |
| 4–6 (19–21 Oct) | **Submit Expo Awards (Most innovative).** Add GitHub topics. Open the 2 awesome-list PRs. Post in Expo Discord #showcase. |
| 7–12 (22–27 Oct) | Write DPG docs: `docs/dpg/SDG.md`, OWNERSHIP, PRIVACY (PDPA 2022), DATA_EXPORT, CONTENT_POLICY, SAFEGUARDING (minors). Run the DPG eligibility check. |
| 13–15 (28–30 Oct) | Publish the dev.to deep-dive (offline-first + Law of Different Views). Cross-post to r/reactnative. **Expo deadline 31 Oct: confirm the submission went through.** |
| 16–20 (31 Oct–4 Nov) | Submit the DPG application. Draft the NLnet proposal and check the next call deadline on nlnet.nl/propose. |
| 21–25 (5–9 Nov) | Contact Teach For Sri Lanka and 1–2 principals. Email the UoM/UCSC project list. Expo finalists announced 6 Nov. |
| 26–30 (10–15 Nov) | Submit NLnet. Show HN with the live demo. Start a 10-teacher closed beta. Expo winners 13 Nov. Note the FOSSASIA CFP (watch Eventyay, ~Dec–Jan). |

*Messages and submissions above are drafts for Naveen to send. I sent or submitted nothing.*
