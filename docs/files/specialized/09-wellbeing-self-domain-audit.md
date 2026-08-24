---
title: "Wellbeing / Self Domain â€” Full Exploration"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Wellbeing / Self Domain — Full Exploration

Complete audit of `packages/self` against `packages/schema/schema.zmodel` and the Supabase migration history. Covers implementation status, real bugs found, the temporal-architecture gap, and concrete feature suggestions grounded in what already exists.

## Three tiers of implementation status — a real, load-bearing distinction

Every feature in `packages/self` falls into exactly one of three states. This matters because "the code exists" does not mean "the feature works" — the gap between the two is precisely where the SSOT-drift risk flagged earlier in this exploration actually shows up.

### Tier 1 — Fully real: schema-backed, policy-governed, working

`MoodLog`, `FireJournalEntry`, `GrowthEvent` + `UserGrowthState`, `ImpactRipple`, `ThuthimalGift`, `WhisperedMoment`, `SanctuaryManifesto` + `ManifestoEndorsement`, `UserPreferences`. All present in `schema.zmodel` with real `@@allow` policies, all queried through working repository functions.

### Tier 2 — Schema drift: real tables, deployed, missing from ZenStack SSOT

`joy_moments`, `gratitude_entries`, `daily_prep_items`, `timetable`, `wisdom_notes` — confirmed present somewhere in migration history (created via raw SQL, not via ZenStack), but **absent from `schema.zmodel` entirely**. These tables exist in the live database and the repository code successfully queries them — but they carry **no ZenStack-declared `@@allow` policy**, meaning whatever access control exists for them was written as raw Postgres RLS in a migration file directly, disconnected from the declared single source of truth. This is precisely the drift risk flagged early in this whole exploration — confirmed real, not hypothetical, and Postgres RLS policies written this route are invisible to anyone reading `schema.zmodel` to understand the system's authorization model.

### Tier 3 — Pure scaffolding: code exists, table does not

`sleep_logs`, `student_goals`, `wind_down_rituals`, `voice_journals`, `decision_journals`, `reminders` — **confirmed absent from every migration, including the master baseline.** Full repository functions exist for all six (`fetchSleepLogs`/`createSleepLog`, `fetchStudentGoalsForView`/`createStudentGoal`/`updateStudentGoal`, `saveWindDownRitual`, `saveVoiceJournalRecord`, `fetchDecisionLogs`/`createDecisionLog`, `fetchReminders`/`createReminder`/`updateReminder`/`deleteReminder`), and corresponding UI components exist (`RemindersManager.tsx`, `DecisionJournalSection.tsx` at minimum). **These are real, designed, coded features waiting on a schema migration, not abandoned or speculative work.** One already defends against this directly — `fetchDecisionLogs`/`createDecisionLog` catch Postgres error code `42P01` (table does not exist) and return `null`/`[]` gracefully. **The other five do not have this guard** — if actually invoked in production right now, `sleep_logs`, `student_goals`, `wind_down_rituals`, `voice_journals`, and `reminders` calls would throw hard, unhandled errors.

## Bugs found

1. **Stale field reference, likely broken:** `fetchPresenceFallbackCount` in `selfInsightsRepository.ts` queries `.in('role', options.targetRoles)` — but migration `20260522150000_migrate_role_to_capacity.sql` deliberately consolidated `role` into `Bond.capacity`. Needs direct verification: does `users.role` still exist post-migration? If not, non-cumulative presence filtering is silently broken.
2. **Non-bijective mood/score mapping:** `MOOD_SEQUENCE` has 6 entries (`joyful, calm, curious, anxious, frustrated, sad`), but `normalizeMoodScore` clamps to 1–5. `scoreToMood` can never return `'sad'` (unreachable index 5). `moodToScore('sad')` returns `6`, outside the declared valid range — round-tripping `'sad'` through score conversion silently corrupts it to `'frustrated'`.
3. **Five Tier-3 repository functions lack the `42P01` guard** that `decision_journals` already has — real risk of unhandled crashes if any of those five UI components are reachable in the current build.

## The temporal-architecture gap — confirmed, precisely

Across every Tier 1 and Tier 2 repository function read: zero decay weighting, zero relative-baseline window functions, zero reinforcement-within-window gating, zero periodic rollups. Every read is either a flat `LIMIT N` recency fetch or a raw `COUNT(*)`. `UserGrowthState`'s eleven counter fields are live-incremented (not periodically recomputed), meaning there's no way to recompute them from the raw `GrowthEvent` log if they ever drift — worth checking whether `fix_increment_growth_rpc.sql` was a symptom of exactly that kind of drift.

**One clean, confirming exception worth naming as a *correct* existing pattern:** `GrowthEvent` (`user_id, dimension, event_type, event_metadata: Json, created_at`) already uses the flexible jsonb-payload shape our `01-data-architecture.md` recommended for genuinely variable event types — while `MoodLog` correctly stays fixed-column, since its shape never varies. This is the enum-vs-jsonb material-layer principle showing up correctly, unprompted, in real code — worth citing as a good example when explaining that principle to anyone else working on this codebase.

**A lead worth closing out precisely, rather than left hopeful:** `useTemporalStore` (`packages/core/src/store/useTemporalStore.ts`) is used consistently across both `self` and `library`, and its `TemporalCapability` type (`snapshot | event_stream | business_fact | effective_dated | audit_history`) looks, at first glance, like it could be the shared temporal-architecture abstraction this whole exploration has been looking for. **It is not.** It's a well-built, genuinely useful, but purely UI-navigation-layer Zustand store — tracking which date/scale/past-present-future phase the user is currently *viewing*, with a view-transition animation value. Zero decay math, zero baseline computation, zero rollup or reinforcement logic anywhere in it. It answers "what time period is on screen," not "how should data be weighted or aggregated over time." Worth citing as a good example of cross-domain UI consistency, but it does not close the temporal-architecture gap identified above — that gap remains fully open.

## Doc corrections owed (flowing back into our docs, not the code)

- `01-data-architecture.md`'s ownership model should cite `GrowthEvent` as the real, working example of "genuinely variable → jsonb; fixed shape → real columns," since it's a cleaner illustration than anything invented for the doc.
- Our docs never anticipated the **Bhumi Stack** growth-metaphor system (`bhumi_stage`, `banyan_stage`, `river_stage`, `crystal_tier`) or the social/gifting mechanics (`ThuthimalGift`, `ImpactRipple`, `WhisperedMoment`) — real, specific, bilingual (English/Sinhala) product design that operated one abstraction level more concrete than anything our biomimicry exploration produced. Worth treating our docs as the general *pattern* layer and this as the *lived instance* layer, not asking one to replace the other.
- Localization (bilingual `_en`/`_si` field pairs on `ImpactRipple`, `WhisperedMoment`) is a real, existing pattern never discussed anywhere in our seven docs — worth a dedicated note if any future schema work touches user-facing text.

## Concrete next steps (code side)

1. **Verify the `role`/`capacity` bug directly** — check whether `users.role` still exists; fix or remove the stale query.
2. **Fix `MOOD_SEQUENCE`/score mapping** — either extend the valid score range to 1–6, or drop `'sad'` from the sequence, or decouple score-mapping from the full mood vocabulary entirely.
3. **Add the `42P01` guard** to the five unguarded Tier-3 functions, or gate their UI components behind a feature flag until the tables exist — prevents a hard crash if they're reachable.
4. **Decide Tier 2's fate deliberately:** either formally add `joy_moments`, `gratitude_entries`, `daily_prep_items`, `timetable`, `wisdom_notes` to `schema.zmodel` (restoring SSOT, and gaining real declared `@@allow` policies in place of whatever raw RLS currently governs them), or confirm they're intentionally excluded and document why.
5. **Decide Tier 3's fate deliberately:** these are real, designed features with working repository/UI code — either schedule the migrations that would complete them, or explicitly park them and note that in the codebase so future-you (or an agent) doesn't assume they're live.

## New feature suggestions — grounded in what already exists

- **Reinforcement-within-window gating before any "concerning pattern" is surfaced** (Pattern 5) — the single highest-value addition given this is a wellbeing app specifically; prevents one bad day from triggering a nudge.
- **`GrowthEvent`-driven relative baseline** — since `GrowthEvent` already has the right shape (flexible, timestamped, user-scoped), a rolling personal-baseline view over its `event_metadata` could give "growth pace relative to your own recent rhythm" without any schema change at all — pure query-layer addition.
- **Predicted-vs-actual reconciliation between `EnergyForecast` and `MoodLog`** — both already exist, already user-scoped, already daily-grained; a simple join surfaces a real, almost-free reflection feature.
- **A `wisdom_notes` + `decision_journals` connection, once Tier 3 lands** — a decision log entry that later gets referenced by a wisdom note ("here's what I learned from that decision") would be a genuinely distinctive reflection loop, not available in generic journaling apps, and both tables already share the same user-scoped, timestamped shape needed to link them.
- **Extend the Fire Journal's binary "burn" into a second, alternate decay shape** — currently burn is immediate/binary (`is_burned` defaults `true`); a deliberate "burns after N days" variant would give a second, valid instance of decay-as-a-tuned-knob (Pattern 3) sitting right next to the existing instant-burn pattern, without disturbing the existing one.

## Open Questions / Not Yet Resolved

- Whether `users.role` still exists post-migration (the presence bug depends on this)
- What `fix_increment_growth_rpc.sql` actually fixed — could reveal whether `UserGrowthState` drift is a known, recurring problem
- Whether any Tier-3 UI components (`RemindersManager.tsx`, `DecisionJournalSection.tsx`, others not yet located) are actually reachable in the current navigation, or dead code behind a flag
- The Hono API's handler for `burnJournal` — client code sends full content to the outbox queue; unclear whether the server actually discards it after generating a preview, which determines whether "burned" is a real privacy guarantee or cosmetic
- **Coverage gap, logged rather than closed:** ~50 `self` UI components never read (`MoodLotus`, `JoyJar`, `ImpactRipplesCard`, `ResonancePatternCard`, `GenesisNode`, `ProgressTree`, `PulseDashboard`, others); `dailyContent.ts` and core `self.ts` never read; Tier 2/3 drifted tables (`joy_moments`, `gratitude_entries`, `daily_prep_items`, `timetable`, `wisdom_notes`, `sleep_logs`, `student_goals`, `wind_down_rituals`, `voice_journals`, `decision_journals`, `reminders`) confirmed present/absent in migrations only — never traced through to real usage the way classroom's drifted tables were, so it's unconfirmed whether they're sound-but-undeclared or genuinely orphaned
