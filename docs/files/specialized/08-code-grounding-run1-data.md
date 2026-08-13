# Code Grounding — Run 1 (Doc Fidelity): Data Architecture

Compares `01-data-architecture.md` against the actual EdLove/Gurudevi codebase (`expo-57-gluestack-v5-rngh-v3` branch). **Doc-fidelity lens only** — does the code match what the docs intended, and where does it deviate (well or badly). Code-quality/anti-pattern audit (Run 2) is separate and not attempted here, though some quality signal surfaced incidentally and is flagged as belonging to that run.

## Scope of this pass

**Reviewed:** `packages/schema/schema.zmodel` (lines 1–560 of 1128 — Users, Bond, Classroom domain, Community domain, start of Self domain), `apps/gurudevi-mobile/supabase/migrations/` (all 120 filenames, several read in full), `packages/self/src/` file structure (components + API layer), `packages/database`, `packages/policies` (file listing only, not read in depth).

**Not yet reviewed:** schema.zmodel lines 560–1128 in full, the policies engine internals (`packages/policies/src/engine/evaluator.ts`), Sanctuary architecture docs (`docs/2026-06-19-sanctuary-authorization-final-architecture.md`), the "classroom"/academic package equivalent to `self`, individual migration SQL bodies beyond filenames. This doc will need a second pass once those are read — treat findings below as real but partial.

## Confirmed alignments — the docs got these right

- **Three-tier citizenship model exists and matches our derivation.** `User.citizenship: WANDERER | SECOND_CLASS | FIRST_CLASS` in `schema.zmodel`. **Naming parity, confirmed by Neev:** Wanderer = Guest = Third-class — same concept, different label used at different points; not a real discrepancy, just terminology to reconcile across docs.
- **ReBAC is real, working, and closely matches the intended shape** — implemented as `Bond(user_id, entity_id, entity_type, capacity)`, with `entity_type: PLATFORM | SCHOOL | CLASSROOM | COMMUNITY`.

## Correction owed to `01-data-architecture.md` — not a code problem, a doc problem

**Our `owner_type`/`owner_id` model conflated two things the actual code correctly keeps separate: ownership and access.** The real architecture: **ownership** lives as a direct FK on each table (`MoodLog.user_id`, `Classroom.school_id`, `Post.author_id`) — simple, unambiguous, per-domain. **Access** is answered separately by `Bond` — a genuine relationship/capacity table, queried via `auth().bonds?[...]` inside `@@allow` policy expressions. Our doc's polymorphic `owner_type`/`owner_id` field tried to do both jobs with one column. **This needs a real correction, not a footnote** — the two-separate-concerns version is more correct than what we designed, and the correction should flow back into `01-data-architecture.md` directly.

## Major structural deviation — likely correct, needs explicit sign-off

**No unified `events` table exists anywhere in the schema.** Instead, one normalized table per domain — `MoodLog`, `FireJournalEntry`, `AttendanceRecord`, `Grade`, `Post`, `GroupMessage`, `StudentLongitudinalEvent`, `SentinelAuditLog` — each with its own `@@allow` policy attached directly via ZenStack's per-model declarative syntax.

**Working assessment: this is very likely the correct deviation, not legacy drift.** `01-data-architecture.md`'s "one substrate, many channels" principle (biomimicry Pattern 9) assumed an ORM reality where a single polymorphic table with a `type` discriminator was viable. ZenStack's actual value proposition is the opposite — clean, declarative, *per-model* access policy. Cramming everything into one `events` table would have fought the ORM, not worked with it. **This should be written up as a stated correction to the biomimicry-to-SQL translation in `01-data-architecture.md`, not flagged as something to fix in code.**

## Genuinely novel patterns — not covered by any of our docs, worth incorporating

- **`FireJournalEntry`** — `content_preview: String`, `is_burned: Boolean @default(true)`. Reads as a deliberate, ephemeral/self-destructing journal pattern. Our decay model (Pattern 3, continuous exponential weight) never anticipated a binary "burned" flag as an alternate decay mechanism — worth adding as a second, valid decay *shape* alongside the continuous-weight model, not a contradiction of it.
- **`AttendanceRecord.occurred_at DateTime? // Event time - foundation-v4`** — a comment marking incremental, in-progress retrofitting of event-time/recorded-time separation onto an already-normalized table. This is independent, live evidence the team is already moving toward bitemporal modeling — worth investigating "foundation-v4" specifically as a named internal initiative before writing anything that might duplicate or conflict with it.
- **`StudentLongitudinalEvent`** has full bitemporal fields (`occurred_at`, `recorded_at`, `effective_to`) already — more sophisticated than anything in `01-data-architecture.md`. Our doc should absorb this pattern, not the other way around.
- **`self` package feature richness far exceeds doc coverage.** Real, named, apparently-built components: `MoodLotus`, `JoyJar`, `GratitudeGlimmers`, `ImpactRipplesCard`, `EnergyForecast`, `EnergyBarChart`, `ResonancePatternCard`, `ResonanceTimeline`, `DecisionJournalSection`, `GenesisNode`, `ProgressTree`, `BreathGuide`, `PulseDashboard`. None of this specific product vocabulary exists anywhere in our docs — `01-data-architecture.md` was reasoning about generic "wellbeing events," while real, specific, apparently-shipped features already exist. **This is a signal our docs were operating one abstraction level too generic** — worth a targeted follow-up pass specifically reading `packages/self/src/api/wellbeingRepository.ts` and `selfInsightsRepository.ts` to ground the decay/rollup material in what's actually there.
- **`pricing_tier: FREE | PRO | INSTITUTIONAL`** — a real, orthogonal dimension to citizenship that no doc discussed at all. Worth a deliberate decision on whether/how this interacts with the owner-context model (does a `PRO` personal-tier user get different storage/sync treatment than `FREE`?) — currently unexamined.

## Quality/legacy signal surfaced incidentally — belongs to Run 2, flagged here for continuity

Not this run's lens, but worth recording rather than losing: **21 of 120 migrations are `fix_*`** — real, honest iteration signal. Several are genuinely serious, not cosmetic: `fix_rls_privilege_escalation`, `fix_rls_insert_vulnerabilities`, `fix_identity_rls_deadlock`, three separate RLS-recursion fix attempts (`fix_rls_recursion`, `fix_rls_recursion_v2`, `force_fix_users_rls`). A recursive RLS policy (a policy on table A referencing table B, whose own policy references back to A) is a known, specific Postgres footgun — worth Run 2 checking whether the *current* policies still carry any residual risk of this, not just whether the historical fixes resolved it.

Also worth Run 2's attention: a live, recent architectural migration is mid-flight — three sequential migrations (`readd_user_role` → `refine_user_role_defaults` → `migrate_role_to_capacity`) show a `role` concept being consolidated into `Bond.capacity`. Confirm this migration is actually complete and no code still reads a stale `User.role` field.

## Open Questions / Not Yet Resolved

- Full read of schema.zmodel lines 560–1128 — not done
- `packages/policies/src/engine/evaluator.ts` — the actual ReBAC evaluation logic, not yet read
- Sanctuary authorization architecture doc — exists internally, not yet reconciled against `01-data-architecture.md`
- "foundation-v4" as a named initiative — referenced in a code comment, not yet investigated as its own thing
- `packages/self/src/api/wellbeingRepository.ts` and `selfInsightsRepository.ts` — needed to properly ground decay/rollup claims against real code, not yet read
- Classroom/academic package equivalent to `self` — not yet surveyed at the same depth
- Live Supabase deployed-state vs. migration files vs. `schema.zmodel` — migration filenames reviewed, but actual current live database state still unverified (no direct Supabase access in this session)
