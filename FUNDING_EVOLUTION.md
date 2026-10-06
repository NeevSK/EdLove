# Funding/Nursery Evolution Log

> **Status:** Living document — captures the evolution of our thinking. Not finished. Will evolve.

---

## The Evolution

### Attempt 1: Silicon Valley Template (Rejected)
- **Tiers:** Supporter / Builder / Partner / Corporate
- **Language:** "Donate," "Support," "Sponsor"
- **Platforms:** Patreon, OpenCollective, GitHub Sponsors
- **Why rejected:** Zero cultural awareness. Treated you like any US open source project. Ignored Thuthimal, Sri Lanka context, Guru Bhakti, offline-first.

### Attempt 2: Thuthimal Extension (Rejected)
- **Idea:** Extend Thuthimal protocol for platform funding (`recipientTier: 'sanctuary'`)
- **Why rejected:** You caught it — **Thuthimal = student→teacher gratitude (cultural, sacred).** Conflating Layer 1 (cultural protocol) with Layer 3 (infrastructure) pollutes the gift economy. Thuthimal = flowers of gratitude, not "fund the dev."

### Attempt 3: Three-Layer Separation (Closer)
- **Layers:** Thuthimal (cultural) | Pro (features) | Platform Fund (infrastructure)
- **Connection:** Thuthimal as payment rail for Pro gifting
- **Platform Fund:** Still called "Platform Fund" — soulless spreadsheet
- **Why evolved:** You pointed out "Platform Fund is soulless" and "the whole garden needs soil, water, air, light"

### Attempt 4: The Nursery / Garden (Current)
- **Metaphor:** Nursery (පුරුල් සාලාව) — soil, water, light, air, roots, seasons
- **Roles:** Gardeners (ගොවි), Tank Keepers (වැව පාලක)
- **Tiers:** කුඩා ගොවි → ගොවි → මහ ගොවි → වැව පාලක → මහා වැව පාලක
- **API:** `nursery.contract.ts` (not `platformFund`)
- **Ask:** "Help tend the nursery" not "donate to platform fund"

---

## What's Still Unresolved / In Progress

### Naming & Language
- [ ] Finalize Sinhala tier names with you — current: කුඩා ගොවි / ගොවි / මහ ගොවි / වැව පාලක / මහා වැව පාලක
- [ ] Finalize English equivalents that don't feel colonial
- [ ] Decide: "Nursery" vs "Purula Sala" (පුරුල් සාලාව) vs "Mandira" (මන්දිර) vs something else
- [ ] Seasonal calendar: Vesak / Poson / Esala mapping to nursery cycles

### API & Implementation
- [ ] `nursery.contract.ts` — finalize contract shape
- [ ] Nursery stats endpoint shape (soil moisture, water level, light level)
- [ ] GitHub Sponsors tier renaming to match garden roles
- [ ] Ko-fi tier alignment
- [ ] Corporate invoice template in garden language

### UI / UX
- [ ] Nursery page design (web) — not a dashboard, a living page
- [ ] Mobile integration — where does "Tend the Nursery" live? Footer? Settings? Separate tab?
- [ ] Garden health visualization — not a progress bar, something alive
- [ ] Seasonal bloom visualization (Vesak/Poson/Esala)

### Corporate Outreach
- [ ] Target list finalization (Provincial Depts, NGOs, School chains, EdTech cos, AI cos)
- [ ] Email templates in garden language
- [ ] Invoice template in garden language
- [ ] Wise/Payoneer setup for corporate payments

### Governance & Legal
- [ ] Do we need a legal entity for corporate invoices? (Sri Lanka Private Ltd vs US LLC vs none)
- [ ] Tax implications for individual receiving sponsorships in Sri Lanka
- [ ] Contributor license agreement (CLA) for nursery contributors
- [ ] Governance model for nursery funds (how decisions made, transparency)

---

## What Else There Is To Do (Beyond Nursery/Funding)

### Core Product (The Actual App)

| Area | What Needs Doing |
|------|------------------|
| **Self Tab** | Fire journal, mood lotus, voice journal, sleep tracker, gratitude, goals, reframe, tomorrow_prep — finish migration to Next.js, finish Explore mode |
| **Workspace Tab** | Classroom management, attendance, assignments, grades, student tracking, guardian view — finish migration, offline sync |
| **Library Tab** | PDF/ebook/video reader, collections, offline desk, OCR, document tools, curator studio — finish browser migration, offline desk |
| **Community Tab** | Chat, groups, direct messages — realtime, offline queue, push notifications |
| **Profile Tab** | Journey timeline, professional history, governance — finish migration |

### Technical Infrastructure

| Area | What Needs Doing |
|------|------------------|
| **Offline-First Sync** | PowerSync conflict resolution, retry logic, quota management, encryption |
| **AI Pipeline** | Voice journal transcription (Whisper), guided reflection (GPT-4o/Claude), OCR, OpenRouter fallback — cost optimization, caching, fallback chains |
| **Pro Entitlement** | Pro gifting via Thuthimal, entitlement sync, feature flags, feature rollout |
| **Push Notifications** | Expo push, FCM/APNs, offline queue, background sync |
| **EAS Build Pipeline** | iOS/Android production builds, OTA updates, versioning |

### Developer Experience

| Area | What Needs Doing |
|------|------------------|
| **CI/CD** | GitHub Actions matrix (ubuntu/macos/windows), anti-slop gate, test evidence audit, SBOM/provenance |
| **Documentation** | API docs, architecture decisions, onboarding guides, migration guides |
| **Testing** | Unit, integration, e2e (Playwright/Maestro), accessibility, visual regression |
| **Monitoring** | Sentry, PostHog, custom metrics, alerting |

### Community & Governance

| Area | What Needs Doing |
|------|------------------|
| **Contributor Onboarding** | Devcontainer, quickstart, good first issues, mentorship |
| **Governance** | Decision making, RFC process, maintainer team, succession |
| **Security** | Threat model, dependency scanning, secret scanning, audit |
| **Legal** | License compliance, CLA, privacy policy, terms of service |

---

## The Real Question

> **What's the next right thing to build?**

Not "what else to do" — that list is infinite.

**What's the one thing that, if done this week, makes everything else easier?**

Options:
1. **Finish Thuthimal → Pro gifting flow** (unlocks Pro revenue path)
2. **Enable GitHub Sponsors + corporate outreach** (unlocks infrastructure funding)
3. **Finish Self tab migration** (unlocks core user value)
4. **Finish offline sync hardening** (unlocks reliability)
5. **Ship Nursery page** (unlocks sustainable funding narrative)

**What's the *one* thing that, if done this week, changes the game?**

---

## Notes / Scratchpad

- [ ] Thuthimal Claim Screen → Pro grant wiring
- [ ] Pro UI card: "Upgrade" | "Gift Pro via Thuthimal"
- [ ] Nursery contract vs Thuthimal contract — keep strictly separate
- [ ] Corporate invoice template in garden language
- [ ] Seasonal calendar: Vesak (May) → Poson (June) → Esala (July/Aug)
- [ ] Corporate targets: Western Province Education Dept, UNICEF SL, Gateway Schools, OpenRouter
- [ ] Wise account for corporate payments
- [ ] Legal entity decision: SL Private Ltd vs US LLC vs none
- [ ] Contributor onboarding: devcontainer, good first issues, mentorship

---

*This document is a living mirror of our thinking. It will change. That's the point.*