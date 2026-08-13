# Classroom / Academic Domain — Full Exploration

Audit of `packages/classroom` + the `core` attendance projection layer against `schema.zmodel` and migrations. Companion to `09-wellbeing-self-domain-audit.md` — several findings here are best understood as direct comparisons to that domain, since the two turn out to be at genuinely different maturity levels.

## Headline finding — a real, working example of Pattern 5 already exists, unprompted

`attendanceProjectionRepository.ts`'s `atRiskCount` calculation:
```ts
atRiskCount: [...todayAbsent].filter((id) => yesterdayAbsent.has(id)).length
```
**This is reinforcement-within-a-window (biomimicry Pattern 5), already correctly implemented** — a student is only flagged "at risk" if absent on *two consecutive days*, not from a single absence. This is exactly the gating principle `09-wellbeing-self-domain-audit.md` found completely absent from the mood/wellbeing domain. **The direct, concrete recommendation: port this exact pattern into wellbeing's mood-concern logic, rather than design something new** — the team already solved this correctly once, independently, in a different domain.

## A real architecture-maturity gap between domains — worth naming directly, not softening

`classroom`'s attendance logic uses genuine hexagonal architecture — `services.ts` (business logic) → `ports.ts` (interface) → `attendanceProjectionRepository.ts` (Supabase adapter) — with Zod schema validation at the boundary (`SchoolAttendancePulseSchema.parse(...)`) and consistent defensive error handling (every function wraps in try/catch, returns a safe typed empty default rather than throwing). **This is structurally more mature than anything found in `packages/self`**, which uses flat, ad-hoc Supabase calls directly in repository files, inconsistent error guarding (the Tier-3 bug from the wellbeing audit), and no schema validation at the read boundary. This isn't a style preference — ports/adapters here means the attendance logic is unit-testable in isolation from Supabase; the wellbeing equivalent isn't. **Concrete recommendation: this is the architecture pattern to standardize on going forward, and a real candidate for retrofitting into `self`**, not the other way around.

## An inefficiency worth flagging for the query-patterns doc

`getAttendanceReport` fetches **every raw attendance row** in a date range and aggregates into daily buckets in a JS `Map`, rather than using SQL `GROUP BY`. Functionally correct, but exactly the pattern `06-query-patterns.md` would flag: this degrades linearly as attendance history grows, and does in application code what Postgres is much better positioned to do (`GROUP BY date` with `COUNT`/aggregate functions, or a proper rollup table per `01-data-architecture.md`'s pattern). Not urgent at current scale — worth a comment/ticket, not an immediate rewrite.

**Smaller, related note:** `calcRate` treats `'present'` and `'late'` as equivalent for rate purposes — a real business-rule choice, not a bug, but worth confirming it's deliberate rather than incidental.

## Schema drift — significantly worse here than in wellbeing

**47 of 73 tables the `classroom`/`core` code actually queries are absent from `schema.zmodel`** — roughly two-thirds, a much higher drift rate than wellbeing's. Full list of missing tables, for reference: `academic_cycles`, `announcements`, `audit_logs`, `auth_identities`, `classroom_groups`, `classroom_join_requests`, `classroom_legacy_records`, `classroom_note_events`, `communities`, `community_comment_upvotes`, `community_comments`, `community_poll_votes`, `community_posts_with_counts`, `community_profile_versions`, `contextual_challenges`, `crystal_discoveries`, `files`, `form_responses`, `form_templates`, `global_configs`, `grades`, `group_members`, `guardian_identities`, `guardian_notification_settings`, `guardian_notifications`, `invite_codes`, `notifications`, `personal_compasses`, `principal_governance_events`, `principal_governance_records`, `principal_observations`, `school_events`, `school_join_requests`, `school_legacy_records`, `student_academic_records`, `student_observations`, `student_potential_analysis`, `submissions`, `tasks`, `teacher_insight_events`, `teacher_notes`, `teacher_professional_records`, `user_blocks`, `user_growth_state_versions`, `user_profile_versions`, `user_push_tokens`, `user_rewards`, `user_rewards_versions`, `user_workspace_layouts`, `verification_documents`.

**This list is too large to triage table-by-table in this pass** — it needs the same three-tier sort applied to wellbeing (real-but-drifted / genuinely unbuilt / naming mismatch), which requires checking each against migration history individually. Flagging as a real, scoped follow-up task rather than guessing.

### The one item verified precisely, and it's a real, specific bug — not just drift

**`Grade` in `schema.zmodel` declares `@@map("student_grades")` — but `student_grades` appears zero times in any migration, including the baseline.** The actual, real, deployed, queried table is `grades` (5 occurrences in the baseline). **Confirmed a second time, more thoroughly:** `gradingRepository.ts` queries `.from('grades')` at all 8 of its call sites, and `gradingProjectionRepository.ts` does the same — never once `student_grades`. **This means the ZenStack-generated client for `Grade` points at a table that does not exist** — if anything ever tried to use the ZenStack ORM path for grades (rather than the raw Supabase calls the current code actually uses), it would fail outright. **This is the single highest-priority fix to come out of this domain's audit** — either `schema.zmodel`'s `@@map` needs correcting to `"grades"`, or there's a genuine, deliberate reason two separate tables were meant to exist and one was never finished. Needs a direct, deliberate decision, not an assumption.

## A genuinely excellent, already-existing pattern — worth protecting, not "fixing"

**`getSchoolPublishedGradingCompletion` doesn't trust a live `publication_state` column at all — it reconstructs "is this grade published" by replaying `audit_logs` through `selectLatestPublishedSnapshots(auditRows)`.** This is a real, sophisticated, independently-arrived-at instance of biomimicry Pattern 1 ("structure is memory... rollups are derived, never canonical") — the append-only `audit_logs` table is the actual source of truth for publication state, and "published" is a **projection computed from that log**, not a mutable flag trusted at face value. This is more rigorous than what `01-data-architecture.md` itself specified, and a genuinely strong example to cite when explaining event-sourcing-as-source-of-truth to anyone else on the codebase.

**This elevates `audit_logs`'s priority sharply within the 47-table triage list above** — it isn't passive logging, it's a load-bearing, actively-queried projection source for a real business workflow (grade publication). It should be one of the first tables reconciled into `schema.zmodel`, not treated as routine drift alongside the rest of the list.

**One real asymmetry worth naming, possibly deliberate:** `getSchoolGradingCompletion` (draft-completion check) trusts a simple `updated_at` filter directly on `grades`, while `getSchoolPublishedGradingCompletion` (published-completion check) goes through the full audit-log-replay approach. This is plausibly correct — publication is a higher-stakes, audit-worthy state transition; draft existence is not — but worth a direct confirmation that this is deliberate rather than incidental inconsistency.

**Separately, worth flagging as real, valuable infrastructure deserving its own dedicated exploration later:** `audit-poa-runtime.ts` wraps every domain API (grading, classroom students, lesson materials, community, and presumably more) with a uniform contract-validation + audit-logging layer, dispatched through a named operation registry. This is more general, cross-cutting infrastructure than anything in our seven original docs anticipated — worth a dedicated audit pass of its own once the immediate schema-drift triage is done.

## Principal observations/governance — another real, well-designed, drifted pair

`principal_observations` (the raw note a principal records) and `principal_governance_events` (a separate append-only trail for follow-up status — `noted → escalated → resolved`, with `occurredAt` on each entry) are genuinely two different tables serving two distinct, sensible purposes, not accidental duplication. Traced through three real layers (`usePrincipalObservations.ts` in `classroom` → `observationsAPI` in `admin` → `principalWorkspaceRepository.ts` in `core`) — worth noting the package boundaries here are correctly domain-separated (principal/admin concerns don't live in `classroom` at all), which is sound structure. Both tables are confirmed real and actively queried, and both are in the 47-table missing list.

**This starts to shift the overall verdict on the drift list, worth stating directly:** between the confirmed-legitimate `audit_logs` (event-sourced grade-publication projection) and this confirmed-legitimate `principal_observations`/`principal_governance_events` pair, the emerging pattern is that most of the 47 missing tables are likely **real, working, well-designed features that were simply never ported into ZenStack** — not abandoned scaffolding, and not the Tier-3 "code exists, table doesn't" pattern found in wellbeing. This is a materially different, more reassuring finding than the raw "64% drift" number suggested on its own — the *code* is sound; the *SSOT declaration* is what's behind.

### Names worth noting as probably-intentional pairs, not drift

Several "missing" names look like versioned/audit-log companions to tables that *do* exist in schema (`user_growth_state_versions` next to `UserGrowthState`, `user_profile_versions`, `user_rewards_versions`) — plausibly deliberate history/audit tables added directly via migration for a specific reason (e.g., version history the team chose not to model through ZenStack for performance or audit-immutability reasons). Worth confirming rather than assuming these are accidental drift like the bulk of the list — they may be a deliberate architectural choice.

## Confirmed: the "Parent Paradox" — a previously-known issue, now precisely located

`/areas/gurudevi.md` already flagged this narratively as a known broken permission; this pass locates it exactly. **`Grade`'s `@@allow('read', ...)` policy (schema.zmodel, the model covered earlier in this audit) checks `student_id`, `graded_by`, `classroom.teacher_id`, and platform-admin capacity — there is no guardian clause at all:**
```
@@allow('read', auth().id == student_id || auth().id == graded_by || classroom.teacher_id == auth().id || auth().bonds?[capacity == 'admin' && entity_type == 'PLATFORM'])
```
The relationship data needed to fix this already exists and is itself correctly readable — `StudentGuardianRelationship(student_id, guardian_id, relationship_type)`, with `User.student_guardian_links_as_guardian` as the reverse relation — **it's simply never referenced inside `Grade`'s own policy.** The bug isn't missing data or a broken relationship table; it's one missing clause in one policy.

**Concrete fix, following the exact pattern the rest of the schema already uses for relation-based checks:**
```
@@allow('read', ... || auth().student_guardian_links_as_guardian?[student_id == this.student_id])
```
This is a small, low-risk, precisely-scoped change — worth verifying whether `ClassroomStudent`, `AttendanceRecord`, and any other student-scoped model with the same "parent should be able to see this" expectation has the identical gap, since the same missing-clause pattern likely repeats wherever guardian access was intended but not wired in.

## The guardian-access gap is systemic, not a one-off — confirmed across four models

Direct check of every student-scoped model's read policy: **`ClassroomStudent`, `Grade`, and `AttendanceRecord` all share the identical gap** — none reference `StudentGuardianRelationship` anywhere in their `@@allow` clauses. This is one systemic, consistent oversight repeated across the whole student-data surface, not an isolated Grade-only bug. The fix pattern from the Grade section above (adding `auth().student_guardian_links_as_guardian?[student_id == this.student_id]`) needs applying consistently to all three, ideally as one coordinated change rather than three separate patches, to avoid the same gap recurring a fourth time somewhere not yet checked.

## A second, more serious issue found in the same sweep — likely the memory file's "cross-tenant student lesson access"

**`StudentLongitudinalEvent`'s read policy has no school/classroom scoping at all:**
```
@@allow('read', auth().id == student_id || auth().bonds?[capacity == 'teacher'])
```
Unlike every other student-scoped model, this doesn't check `entity_id`/`school_id` against the bond at all — `auth().bonds?[capacity == 'teacher']` matches *any* teacher-capacity bond, anywhere on the platform, regardless of which school or classroom it's scoped to. **Concretely: a teacher at School A can read a student's full longitudinal academic history at School B.** This is very likely the exact issue `/areas/gurudevi.md` already names as "cross-tenant student lesson access." **This is a harder fix than the guardian gap** — the model has no direct `school_id`/`classroom_id` field of its own (only a generic `entity_id` pointing at whatever record triggered the event), so scoping the policy correctly needs either a join through the referenced entity or a denormalized school/classroom reference added to the model itself. Needs real design thought, not a one-line patch.

## OCR student import — a real, well-built feature with one concrete bug

`OCRStudentImport.tsx` is a genuinely thoughtful flow: scan → confidence-flagged review (uncertain OCR items shown amber, teacher can deselect) → bulk create. **Confirms `pricing_tier` gates a real feature, not just a schema stub** — cloud OCR providers are explicitly Pro-gated, mlkit is the free default.

**Real bug in the bulk-create path:** `handleConfirm` fires `Promise.all(selected.map(s => studentsAPI.create(...)))` — if any single create fails, `Promise.all` rejects immediately, but earlier successful creates in the batch are **not rolled back and not reported**. The catch block shows a generic "Failed to import. Please try again," giving the teacher no way to know which students were actually created. Retrying the whole batch after a partial failure would very likely create duplicates for the students that already succeeded. **No idempotency guard exists on `studentsAPI.create` to protect against this.** Worth fixing with either `Promise.allSettled` (report exactly which succeeded/failed) or a genuinely idempotent create (dedupe on `roll_number`/`index_number` + classroom). Smaller, related code-quality note: `studentsAPI.create({...} as any)` bypasses type safety entirely — worth removing the cast once the underlying type mismatch (if any) is understood.

## The Parent Paradox — complete, three-layer root cause, now fully confirmed

Tracing this end to end reveals the mechanism precisely, and it's worth stating cleanly since it's a genuinely instructive example of how a permission bug can hide silently rather than crash loudly.

**Layer 1 — CASL (client-side ability), deliberately permissive by design:** `abilities/parent.ts` grants `can('read', 'Grade')` with **no conditions at all.** A developer's own comment on the same file states the intended architecture directly: *"child-linking logic should be handled by RLS, but CASL provides the boundary."* This confirms, in the original author's own words, that CASL was never meant to be the layer doing fine-grained guardian-to-student scoping — it was deliberately built coarse, trusting the database layer to narrow it down.

**Layer 2 — application-layer grade filtering, correctly built and ready:** `gradeVisibility.ts`'s `selectGuardianVisibleGrades` correctly filters already-fetched grade rows down to published-only (checking `published_at`, `is_published`, or a status field against `published/released/finalized/guardian_visible`) — real, sound logic for "guardians shouldn't see draft grades," just never receiving real input.

**Layer 3 — ZenStack/RLS, the layer that was supposed to do the actual scoping, never built:** confirmed earlier in this doc — `Grade`'s `@@allow('read', ...)` has no guardian-relationship clause whatsoever.

**The complete failure mode this produces: a parent's UI shows an empty gradebook, forever, for every child, with no error.** CASL says yes (unconditionally), the database says no (silently, via RLS simply returning zero rows), and the filter logic in between never gets real data to filter. This is exactly why the bug reads as a vague, hard-to-pin-down "parents can't see grades" report rather than a crash — nothing throws; the screen is just quietly, permanently empty. The fix already identified earlier in this doc (adding the guardian-relationship clause to `Grade`'s `@@allow`) is the complete fix — Layers 1 and 2 are already correctly built and require no changes at all.

## Report Card component — the mirror-image risk to the Parent Paradox

`ReportCard.tsx` computes `overallGPA` and `averageMarks` via a plain `.reduce()` over whatever `grades` array it receives as a prop — **the component itself applies no publication-status filtering at all.** This means the correctness of what a parent/student sees depends entirely on whether the *caller* remembers to apply `gradeVisibility.ts`'s `selectGuardianVisibleGrades` filter before passing grades in. If any call site forgets, the failure direction is the opposite of the Parent Paradox: not "sees nothing," but **"sees draft, unreleased grades and private teacher feedback before the teacher intends to release them."** Worth a direct audit of every place `<ReportCard>` is rendered, to confirm the filter is applied consistently rather than left to each call site's discretion — this is exactly the kind of thing a single shared data-fetching hook (rather than a prop-passed array) would make impossible to get wrong.

**Smaller, related observation:** no term/academic-cycle scoping is visible in the GPA calculation — it appears to average across every grade ever recorded for the student, not scoped to a term or `academic_cycle_id` (a field that exists on `AttendanceRecord` but wasn't seen on `Grade` itself). Worth confirming whether report cards are meant to be term-scoped — if so, this is a real gap; if GPA is deliberately cumulative, no issue.

## Full 47-table drift triage — completed

Bulk-checked every remaining table from the original list against migration history.

**Confirmed real (legitimate SSOT drift — same pattern as `audit_logs`, deployed and actively used, just undeclared in `schema.zmodel`), 26 total:** `announcements`, `audit_logs`, `auth_identities` (heavily used — 8 references), `classroom_note_events`, `communities`, `community_comment_upvotes`, `community_poll_votes`, `community_posts_with_counts`, `community_profile_versions`, `grades`, `invite_codes`, `notifications`, `principal_governance_events`, `principal_observations`, `student_academic_records`, `student_observations`, `student_potential_analysis`, `submissions` (heavily used — 10 references), `tasks`, `teacher_insight_events`, `user_blocks`, `user_growth_state_versions`, `user_profile_versions`, `user_rewards`, `user_rewards_versions`, `user_workspace_layouts`, `map_layers`.

**Confirmed genuinely absent (Tier-3-style — matches wellbeing audit's "code/docs exist, table doesn't" pattern), 21 total:** `academic_cycles`, `classroom_groups`, `classroom_join_requests`, `classroom_legacy_records`, `contextual_challenges`, `crystal_discoveries`, `files`, `form_responses`, `form_templates`, `global_configs`, `group_members`, `guardian_identities`, `guardian_notification_settings`, `guardian_notifications`, `personal_compasses`, `principal_governance_records`, `school_events`, `school_join_requests`, `school_legacy_records`, `teacher_notes`, `teacher_professional_records`, `verification_documents`, **and `user_push_tokens`** — see the correction this requires in `19-notifications-settings.md`, since that doc had assumed this table was real based on internal documentation describing it in detail.

**Revised overall verdict:** roughly 55% of the original 47-item list is legitimate-but-undeclared drift (consistent with the earlier "most of it is probably sound code, not orphaned" read), and roughly 45% is genuine Tier-3-style scaffolding — features with real code or real documentation, but no backing table. That's a higher scaffolding rate than the earlier optimistic read suggested, worth taking seriously as a real, sizable body of incomplete work, not a rounding error.

## Feature suggestions — grounded in what's already strong here

- **Extend the attendance "at-risk" reinforcement-within-window pattern with a relative baseline (Pattern 2)** — currently `todayRate` vs. `yesterdayRate` is a fixed two-day comparison; a rolling classroom-average baseline (`AVG(rate) OVER` the trailing 30 days) would let "at risk" reflect deviation from *that classroom's* normal pattern, not just yesterday's snapshot.
- **`getAttendanceReport` is a natural first candidate for a real rollup table** (per `01-data-architecture.md`) once the JS-aggregation inefficiency above is felt at scale — the daily trend points it computes live are exactly what a periodically-refreshed `attendance_rollups_daily` table would serve instantly instead.
- **Port the ports/adapters + Zod-validation structure from `attendanceProjectionRepository.ts` into `self`'s repository layer** — this closes the architecture-maturity gap and would have caught several of the wellbeing-domain issues (the `role`/`capacity` stale reference, the unguarded Tier-3 calls) automatically, since Zod validation at the boundary surfaces exactly this class of mismatch immediately rather than silently.

## Open Questions / Not Yet Resolved

- Full three-tier triage of all 47 missing tables (mirroring the wellbeing audit's method) — `audit_logs`, `principal_observations`, `principal_governance_events` now confirmed legitimate-but-drifted; most of the remainder likely follows the same pattern but individual confirmation still pending
- Whether `schema.zmodel`'s `Grade.@@map("student_grades")` is a typo/oversight or intentional-but-unfinished — needs a direct answer, not a guess
- Whether the `*_versions` tables are deliberate audit-history design or genuine drift
- `audit-poa-runtime.ts` — the cross-cutting audit/contract wrapper — deserves a dedicated exploration pass of its own
- **The guardian-access gap fix** — needs to be written once, applied consistently to `ClassroomStudent`, `Grade`, `AttendanceRecord` together (CASL and application-layer filtering are already correctly built for this — confirmed via `abilities/parent.ts` and `gradeVisibility.ts` — only the RLS/ZenStack layer needs the fix)
- **The `StudentLongitudinalEvent` cross-tenant scoping fix** — needs real design work (no direct school/classroom field exists on the model to scope against)
- **Every `<ReportCard>` call site** — needs auditing to confirm `selectGuardianVisibleGrades` is applied consistently before grades reach the component, given the component itself does no filtering
- Whether report card GPA is meant to be term-scoped (`academic_cycle_id`-style) or deliberately cumulative across all history
- Whether the OCR bulk-import bug has ever been hit in practice, and whether `studentsAPI.create` has any dedup logic elsewhere the code path doesn't visibly rely on
- Remaining classroom files (gradebook table/entry-form components, resource/inventory views, community domain) — not yet read at the same depth
- **Coverage gap, logged rather than closed:** `packages/admin` only touched once (`observations.ts`); it is a full separate package likely containing much more. Community domain (`Group`, `Post`, `GroupMessage`, `CommunityReaction`) seen in schema only, never traced through to real code the way attendance/grading were.
