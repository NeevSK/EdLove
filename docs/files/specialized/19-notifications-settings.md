---
title: "Notifications & Settings â€” Implementation Guidance"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Notifications & Settings — Implementation Guidance

Covers `packages/core`'s notification infrastructure (`SOVEREIGN_PUSH_NOTIFICATIONS.md`, already excellent) and `packages/ui`'s settings screens. Unlike most domains audited so far, the architecture here is already mature — this doc's job is adding the *behavioral policy* layer (when should something actually interrupt someone) and correcting one false alarm.

## Correction: the "duplicate" NotificationSettingsPanel is not drift

Initial concern: identically-named components in `packages/profile` and `packages/ui`. **Verified, not a problem** — `packages/profile`'s file is a clean one-line re-export (`export { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel'`). Single source of truth, convenient import path. No action needed.

## A real, working exemplar for Profile's unresolved convergence problem

**`AppSettingsScreen.shared.tsx` (1182 lines) + `AppSettingsScreen.tsx` (1 line) + `AppSettingsScreen.web.tsx` (1 line) is exactly the mobile/web convergence pattern `14-profile-domain-exploration.md` recommended, already built, just not yet applied to Profile's own screens.** Both platform files are pure re-exports of one shared implementation. This closes an open question from `14` directly: **the concrete "how" for converging Profile's `ProfileScreen.tsx`/`ProfileScreen.web.tsx` (593 vs. 986 lines, genuinely divergent) is to refactor them into this exact shape** — one shared implementation, two one-line platform re-exports, with only true platform-forced differences (haptics, device security) branching inside the shared file via `Platform.OS` checks rather than living in separate files. Settings already proves this works in this codebase; Profile should copy it directly rather than invent a new pattern.

## The architecture is already excellent — ports/adapters, quiet hours, category gating, a global kill-switch, sovereign deep-linking (`gurudevi://` scheme). What's missing is behavioral policy, not mechanism.

The existing doc specifies *how* a notification gets delivered and *whether* a user has opted out. It doesn't yet specify *when something should become a notification at all* — that's a policy question, and it's exactly where this exploration's biomimicry patterns apply directly, not decoratively.

**Reinforcement-within-window for escalation (Pattern 5) — the single highest-value addition.** Right now, presumably, any qualifying event can trigger a push. The attendance domain already proved this pattern works well in this exact codebase (a student is only flagged "at risk" after two consecutive absences, not one — `10-classroom-academic-domain-audit.md`). Applied to notification policy: a single low-signal event (one new comment, one minor update) shouldn't interrupt; only genuinely repeated or escalating patterns should cross the threshold into an actual push. This is a real, concrete anti-fatigue mechanism, not just a nice idea — notification fatigue is a well-documented, real UX failure mode, and per-category opt-out (already built) only partially solves it. Reinforcement-gating solves the part opt-out can't: deciding *within* an enabled category whether this specific instance is worth interrupting for.

**Decay on badge/urgency (Pattern 3).** An unread badge showing "47" from three weeks of accumulated low-priority notifications reads as noise, not signal — and paradoxically trains people to ignore the badge entirely, which defeats notifications generally. A badge count (or in-app indicator) that gently de-emphasizes with age — visually softening, not just numerically accumulating — keeps it meaningful. This is a UI-layer application of the same decay principle already specified for data at the `01-data-architecture.md` level; worth applying consistently rather than only at the database layer.

**Collective, batched delivery (Pattern 8) — matches quorum sensing's "ignition is simultaneous and whole," already established in `00-biomimicry-principles.md`.** For non-time-critical categories, batch into a single coherent digest at a sensible moment rather than trickling in one push per event. This directly reduces the frequency of interruption without requiring the user to configure anything — it's a delivery-timing policy, sitting entirely inside the already-built `quiet_hours`/category infrastructure, not a new feature.

**Local containment (Pattern 7) is already partially implemented, worth confirming it's complete.** Category-level gating already means a community-post notification and an urgent-school-announcement notification are treated separately — this is the right shape. Worth verifying the *urgency/interruption level* (sound, badge, quiet-hours-bypass) is actually configured per-category and not uniformly applied, since the doc's `isNotCritical()` check implies this distinction exists but wasn't verified in code during this pass.

## Schema note — corrected

**Earlier claim in this doc needs a direct correction, not a footnote.** `user_push_tokens` was previously described here as "real, deliberate, actively-used infrastructure," inferred from `SOVEREIGN_PUSH_NOTIFICATIONS.md`'s detailed column-by-column schema description. **A full migration-history check (`10-classroom-academic-domain-audit.md`'s completed 47-table triage) found zero matches for `user_push_tokens` anywhere in migration history, including the baseline.** This means one of two things, and it needs a direct answer rather than an assumption: either the table was created outside the standard migrations folder (a real, separate concern worth checking directly against Supabase), or the internal doc describes an intended design that was never actually deployed — making the entire push-notification *token registration* step currently non-functional, regardless of how well-designed the delivery logic around it is. **This is a more serious, more concrete finding than the original version of this doc suggested — worth checking before treating any of the notification-policy recommendations below as sitting on solid ground.**

## Open Questions / Not Yet Resolved

- Whether reinforcement-within-window, decay, and batching are actually implemented anywhere in the current dispatch logic, or only architecturally possible — `SOVEREIGN_PUSH_NOTIFICATIONS.md` documents the *mechanism* (quiet hours, category gating) but this pass didn't verify whether policy-level gating (as opposed to user-controlled opt-out) exists in the actual dispatcher code
- Whether `isNotCritical()` (referenced in the doc's pseudocode) is a real, implemented function or aspirational — not traced to source in this pass
- The actual settings screen's information architecture (what's grouped where, using `16`'s density-tier framework) — not yet audited against the agent-ready spec
- Whether Profile's screens have actually been refactored to match the `AppSettingsScreen.shared.tsx` pattern yet, or whether this remains a recommendation
