---
title: "Profile Domain â€” Exploration & Design Refinement"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Profile Domain — Exploration & Design Refinement

Covers `packages/profile` — structure, the mobile-vs-web divergence, a stated convergence principle, and concrete refinement suggestions grounded in this exploration's own established patterns (biomimicry principles, cognitive-load research, dignity-over-surveillance).

## Structure found

Real, substantial package: profile-completion scoring (`profileSections.ts`, weighted, role-adaptive via `Capacity`), six separate history hooks, Thuthimal/growth gamification surfaces (`ThuthimalBadge`, `GiveThuthimalModal`, `AchievementGallery`, `UserStatsCard`, `LivingJourneyPanel`), a Linktree-style social aggregator (`ContactLinktree`, `SocialSanctuary`), a mute-management screen, and explicit `.web.tsx` platform variants for the main screens plus a web-only `PublicProfileScreen.web.tsx` with no mobile equivalent.

**`profileSections.ts` is a real, well-designed system** — weighted field-completion percentage, adaptive by role (`Capacity`: student gets `index_number`, staff get `nic_number` and a professional-branding section). Worth a direct note: `nic_number` (Sri Lanka's National Identity Card) is genuinely sensitive PII being collected here — worth confirming it's never rendered on a *visible* profile surface, even though collecting it for verification is reasonable. Also worth cross-referencing: `grade_head`/`section_head` appear here as valid capacities, relevant to the "ghost roles" issue already flagged in memory (registered in CASL, reportedly absent from `composer.ts`) — this file assumes they're real and functioning.

## Mobile vs. web — real divergence, not superficial

`ProfileScreen.web.tsx` (986 lines) is 66% larger than `ProfileScreen.tsx` (593 lines) — not a thin responsive wrapper. The divergence splits into two genuinely different categories:

**Physically forced — correctly stays divergent:** haptics (no such thing on a web page), device-native security surfacing. Real platform constraints, not gaps.

**Incomplete build-out, not a real constraint — this is what should converge:** `ContactLinktree`, `QRCodeGenerator`, `StaffPresencePulse`, `CitizenGate` are web-only with no platform reason — the underlying hooks (`useProfile`, `useProfileCompletion`, `useSocialLinks`) are already shared between both platforms, so this isn't a backend-reconciliation problem the way Community's dual-path issue was — it's simply components that were never wired into the mobile screen.

## Stated design decision: converge the feature set, keep interaction platform-appropriate

Every capability should exist on both platforms; *how* it's interacted with can reasonably differ.

- **`ContactLinktree`** — bring to mobile as-is.
- **`QRCodeGenerator`** — bring *bidirectionally*, not as a one-way web-generates/mobile-scans flow. On mobile: show your own code to be scanned, and open a scanner to read someone else's — two teachers meeting in person scanning each other's codes is a more natural use case than the current framing.
- **`CitizenGate`/`StaffPresencePulse`** — bring to mobile as-is; no platform reason for the current omission.

## Refinements — additions grounded in this exploration's own established patterns

**Reinforcement-within-window applied to recognition, not just gifting (Pattern 5).** A single Thuthimal gift currently appears to earn a badge outright. The attendance domain already proved this exact pattern works well in this codebase — a student is only flagged "at risk" after two consecutive absent days, not one (`10-classroom-academic-domain-audit.md`). Applied here: a recognition badge that only solidifies after being echoed by multiple people over time is more genuine, harder to game, and directly transplantable from code that already exists.

**Relative-to-self framing, not relative-to-others (Pattern 2, and matching the "dignity over surveillance" commitment already in `/areas/gurudevi.md`).** Not "more complete than 73% of teachers" — comparison-to-others is exactly the surveillance-flavored framing that principle warns against. Instead: "your profile has grown since you joined" — a personal trajectory. Fits the citizenship model naturally too — a quiet, human framing of someone's own journey through Wanderer → Second-class → First-class rather than a raw badge count.

**Decay on completion confidence, currently absent (Pattern 3).** Completion appears to be pure accumulation — a filled field stays "complete" forever. A gentle, decaying confidence on fields likely to go stale (`experience_years`, `subjects_taught`) — a soft "still accurate?" nudge after a long gap, not a demand.

## Refinements — reductions, the more important half

**Correction, verified against real code in `20-self-tab-ui-operationalization.md`:** the growth-metaphor-stacking claim below was inferred from `self`'s package file listing, not a composed screen — checking the actual `TeacherSelfView.tsx` found the metaphor components don't stack together at all, and the real 9-component composition is already organized through sections/progressive-disclosure, not a flat stack. Read the claim below as the original (incorrect) reasoning, kept for the record — `20` has the corrected finding.

**Too many parallel growth-metaphor systems stacked on one screen.** Bhumi stage, Banyan stage, River stage, Crystal tier, plus `AchievementGallery`, `ThuthimalBadge`, `UserStatsCard` — four-or-more competing metaphor systems on one profile. `03-ux-interaction-design.md` already established, with real converging evidence (Cowan's estimate and the subitizing limit independently landing on the same number), that working memory holds roughly 4 genuinely-cohesive chunks. This isn't an abstract concern anymore — it's a concrete instance of exactly what that doc warned about. **Recommendation: pick one primary growth metaphor to lead the profile visually; let the others live one level deeper (a detail screen), not stacked on the main view.**

**Six separate history hooks is very likely over-fragmented as a user-facing structure, even if the backend separation is correct.** `useInstitutionalHistory`, `useCommunityProfileHistory`, `usePrincipalGovernanceHistory`, `useProfileHistory`, `useStudentAcademicHistory`, `useTeacherProfessionalHistory`. Backend separation by domain is fine (matches Pattern 6 — sparse, distributed, no single canonical record) — but presenting six standalone UI sections is a different problem than the data layer being distributed. **Recommendation: one unified "your journey" timeline, internally differentiated by type (a filter or subtle marker), not six separate sections a person has to navigate between.**

## Open Questions / Not Yet Resolved

- Whether `nic_number` is ever rendered on a visible profile surface (vs. collected-but-hidden) — not directly verified
- The "ghost roles" cross-reference (`grade_head`/`section_head`) — this file assumes they work; needs reconciling against the actual known issue in memory
- `MuteHubScreen.tsx`, `SupportSection.tsx`, `NotificationSettingsPanel.tsx` — not yet read
- Whether the six history hooks share a common underlying data shape that would make unifying them into one timeline technically straightforward, or whether their formats genuinely differ enough to make this harder than it sounds
- `PublicProfileScreen.web.tsx` specifically — not yet read in detail; worth checking what it shows to a logged-out/external viewer versus the authenticated `ProfileScreen.web.tsx`
