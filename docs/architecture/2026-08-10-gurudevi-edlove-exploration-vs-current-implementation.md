---
title: "Gurudevi / Edlove Exploration vs Current Implementation"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, edlove, comparison, audit, parity, architecture, ui]
---

# Gurudevi / Edlove Exploration vs Current Implementation

## Purpose and evidence boundary

This document compares the imported exploration corpus in `docs/files new` with
the current repository implementation. Imported documents are historical evidence
and design input; they are not automatically current requirements.

The comparison uses source code, package manifests, `schema.zmodel`, tracked
migrations, existing database-review batches, and current tests. A migration file
being present locally does not mean it has been deployed. The migration tracker
must be reconciled with linked Supabase before a database claim is marked deployed.

The imported audit claims below are historical. Fresh scans are labelled with
their command or repository evidence and are not silently substituted for the
original audit numbers.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| Implemented | Current code or database evidence supports the claim. |
| Partially implemented | A real foundation exists, but the behavior is incomplete or not end-to-end. |
| Conflicting | Current code, schema, or migration behavior contradicts the imported claim. |
| Stale/superseded | Later repository work changes the original finding. |
| Deferred by design | The claim is intentionally not being built yet. |
| Unverified | Evidence is insufficient or depends on linked-database/runtime checks. |

## Executive comparison

| Imported area | Current implementation evidence | Status | Remaining action |
| --- | --- | --- | --- |
| Temporal architecture and derived history | `useTemporalStore`, temporal utilities, navigators, and many temporal-aware hooks exist. A shared `DerivedHistoryView` now provides a data-agnostic Now/History read-model contract and is wired into Self mood history. | Partially implemented | Add shared derived rollups, baseline/decay semantics, and reuse the component in Profile, Classroom, and governance history. |
| PowerSync/local-first data flow | Native OP-SQLite and web WASQLite adapters, Drizzle wrapping, encrypted account-scoped filenames, and PowerSync connectors exist. The main singleton still contains shims/injection paths and domain adoption is incomplete. | Partially implemented | Establish the native Classroom attendance slice, then expand Zone A and outbox behavior deliberately. |
| Data/schema parity | Database-review batches 01–06 already model active candidates, fix local grade routing, prepare nullability/index/RLS migrations, and record a parity score of 86/100. | Partially implemented | Apply and verify bounded migrations, rerun parity, and classify the remaining findings. |
| Central API governance | Hono contracts, POA/audit infrastructure, and adapters exist. The canonical Supabase client now lives behind `@repo/core/adapters/supabaseClient`; 89 import sites were migrated and the raw API barrel alias was removed. | Partially implemented | Continue moving highest-risk request paths to Hono contracts or explicit ports; retain Supabase only inside approved adapters, Realtime subscriptions, and the PowerSync bridge. |
| Query discipline | Indexes and query helpers exist, but flat limits and offset-style pagination remain in active or adjacent paths. | Partially implemented | Adopt cursor contracts where list growth matters and validate plans against real queries. |
| UI design doctrine | Shared UI package, theme utilities, TemporalNavigator, and responsive variants exist. Raw values and platform-specific styling remain in central components. | Partially implemented | Promote accepted tokens and density rules into enforceable shared primitives. |
| GlobalHeader | The component is shared across the app and owns search/notifications; notifications remain behind the More control, mobile uses raw warm-cream values, and web uses a separate dark-glass register with an `as any` style cast. | Conflicting | Make notification access explicit, clarify menu semantics, and resolve mobile/web theming intentionally. |
| Self/wellbeing | Many features and hooks exist, including mood, journal, goals, energy, and history paths. The imported audit identified real schema tiers and missing-table risk. | Partially implemented | Complete Tier 1/2/3 decisions, guard absent tables, and pilot derived mood history. |
| Classroom/academic | Attendance has a mature ports/adapters projection pattern and existing temporal/dashboard infrastructure. Schema and access-contract work is still being reconciled. | Partially implemented | Finish guardian/cross-tenant policy checks, grade publication verification, OCR idempotency, and server-side report aggregation. |
| Community | Feed, groups, chat, messaging, realtime, optimistic UI, and a recent chat-foundation plan exist. The imported audit still identifies duplicate access paths and pagination/governance risk. | Partially implemented | Trace live routes, remove duplicate request paths, replace offset pagination, and formalize outboxes. |
| Library/media | Library is a real feature with document/video/map screens, resource APIs, collections, and media metadata. `LibraryScreen.tsx` remains a 1,383-line combined surface. | Partially implemented | Split browse/contribute/curator responsibilities and define rights, caching, and media-byte delivery boundaries. |
| Profile | Mobile/web profile screens, history hooks, notification settings, and journey components exist. | Partially implemented | Add progressive disclosure and unify separate history sources behind one journey model. |
| Workspace | Workspace layouts, surface registries, drag/reorder infrastructure, and role-specific canvases exist. | Partially implemented | Formalize fixed/user-arranged/smart zones and avoid persisting computed smart ordering. |
| AI inference | Sanctuary API contains a real multi-provider cloud orchestration/billing layer and the mobile AI assistant persists AI messages. | Implemented / deferred | Refactor provider configuration to keep local inference type-compatible; do not build a local runtime yet. |
| Edlove-family reuse | Shared packages already exist for core, UI, self, classroom, community, library, profile, and admin. | Partially implemented | Promote only proven Gurudevi contracts to family-level APIs, then validate one sibling app. |

## Database and schema-parity ledger

The existing database-review batches are prior work and remain the baseline:

| Batch | Current recorded state | Interpretation |
| --- | --- | --- |
| 01 — active domain candidates | Model-complete, database-incomplete; submissions/notifications modeled; inventory RLS migration prepared; students intentionally unresolved. | Keep as active parity work; do not repeat the inventory. |
| 02 — classroom membership history | Local ZModel and repository corrections complete; join requests and classroom legacy records modeled. | Verify deployment and reconcile deferred `classroom_note_events`/identity boundaries. |
| 03 — core nullability | Local ZenStack/type checks passed; nullability migration ready for application; local parity snapshot recorded at 86/100. | Apply only after linked data recheck and staging verification. |
| 04 — student grades contract | Local code now targets `student_grades`; generated artifacts and grading tests passed. | Imported grade-table mismatch is locally superseded; deployment and remote parity remain to verify. |
| 05 — user preferences | Active fields retained; legacy columns prepared for loud removal; 287 parity findings recorded. | Verify no hidden consumers, apply migration, then rerun parity. |
| 06 — growth state nullability | Local migration prepared after zero-null evidence. | Apply as a bounded batch and rerun parity. |

Important unresolved parity boundaries are not equivalent to “missing features”:

- `students` may be a legacy/parallel roster and must not be modeled twice without
  a deliberate ownership decision.
- Extra tables and views need classification; automatic deletion is prohibited.
- Security/bootstrap tables such as `auth_identities` and device tables require
  trigger, function, and RLS review before modeling or removal.
- Locally prepared migrations are not deployment proof. The current migration
  tracker must be updated from linked Supabase evidence.

## Claim-by-claim evidence ledger

| Imported claim | Source file | Current code/schema/migration evidence | Status | Risk | Remaining action | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| Domain tables should remain canonical while temporal views are derived | `docs/files new/01-data-architecture.md`, `26-temporal-architecture-ui-seam.md`, `28-derived-history-view-implementation.md` | `packages/core/src/types/Temporal.ts`, `packages/core/src/store/useTemporalStore.ts`, and `packages/ui/src/components/DerivedHistoryView.tsx`; Self teacher mood data is wired to the read-model contract. | Partially implemented | Domain-specific timelines may diverge in meaning or privacy boundaries. | Add rollup/baseline/decay adapters and adopt the component in Profile, Classroom, and governance. | 3–5 |
| Direct Supabase access must stop at approved boundaries | `docs/files new/12-architectural-governance-supabase-bypass.md` | `packages/core/src/adapters/supabaseClient.ts` owns the client; 89 current consumers were migrated; `pnpm run check:supabase-boundaries` passes in strict mode with zero findings. | Partially implemented | Raw table operations still exist inside the approved adapter boundary and must be reduced behind Hono contracts or explicit ports where transport ownership requires it. | Continue the transport migration and keep strict CI enforcement blocking. | 2 |
| Gurudevi native PowerSync is the first offline target | `docs/files new/04-network-transport.md`, `05-storage-indexing.md` | Native and web PowerSync adapters, account-scoped encryption, and connectors exist under `packages/core/src/adapters/powersync`; Classroom attendance has a ports/adapters projection. | Partially implemented | Reconnect/account-switch bugs can leak data or strand outboxes. | Test native attendance offline/reconnect/account switch before broader Zone A adoption. | 3 |
| Database parity must proceed in bounded batches | `docs/files new/01-data-architecture.md`, `08-code-grounding-run1-data.md` | App batches 01–06 are present under `apps/gurudevi-mobile/docs/current_progress`; local and linked migration histories report 151 aligned records. | Partially implemented | Local migration files can be mistaken for verified deployment or ownership decisions. | Run domain checks and update each migration status only from linked evidence. | 1 |
| Historical local parity snapshot was 86/100 with 287 findings | database-review batch 03 and batch 05 | Fresh `pnpm run audit:database-parity` reached a current command score of 95/100, while the stored no-write scorecard remains historical. | Stale/superseded | Mixing snapshots hides whether work reduced or merely reclassified drift. | Preserve 86/100 as historical baseline; publish fresh snapshots with timestamp and methodology. | 0–1 |
| `students` requires an explicit legacy/parallel roster decision | database-review batch 01 and batch 02 | Fresh drift still reports remote `students` as extra; no ownership decision was introduced by this program. | Unverified | Modeling or deleting it prematurely can break roster and authorization paths. | Document ownership, SQL consumers, RLS, and migration/retention decision before action. | 1 |
| GlobalHeader should provide direct notification access | `docs/files new/19-notifications-settings.md`, `30-global-header-audit.md` | `packages/ui/src/components/GlobalHeader.tsx` and `.web.tsx` still place notifications behind the secondary More path. | Conflicting | Important safety and social signals are less discoverable, especially on mobile. | Promote notification access, preserve search/menu semantics, and validate mobile/web theming. | 4 |
| Library should separate browse, contribute, and curator responsibilities | `docs/files new/07-library-media.md`, `25-library-tab-full-arc.md` | `packages/library/src/screens/LibraryScreen.tsx` remains a 1,383-line combined surface with resource/collection flows. | Partially implemented | Rights, media-byte delivery, and contributor permissions can become entangled. | Split responsibilities behind shared resource-card and cursor contracts. | 4–5 |
| AI local inference should remain deferred until measured need | `docs/files new/13-ai-inference-architecture.md` | Cloud provider adapters/orchestration/billing and mobile persistence are real; no local runtime was added. | Deferred by design | Premature local runtime work would add native and model lifecycle risk. | Refactor provider configuration for type compatibility only; collect workload evidence. | 6 |
| Shared primitives should be proven in Gurudevi before family extraction | `docs/files new/18-leverage-applied-to-ui.md`, `24-profile-tab-full-arc.md` | `@repo/ui` now owns `DerivedHistoryView`; no sibling Edlove consumer has been verified yet. | Partially implemented | Family APIs can freeze a Gurudevi-specific assumption too early. | Validate one sibling app consumer before broader extraction. | 6 |

## Code-grounded implementation findings

### Already real

- PowerSync adapters exist for native and web, with Drizzle integration and a
  Supabase connector.
- Account-scoped native encryption-key storage exists through SecureStore.
- Temporal state is shared through `useTemporalStore`; date navigation and scale
  selection are real infrastructure rather than merely documented ideas.
- Classroom attendance projection uses a ports/adapters boundary and defensive
  validation.
- AI has real provider adapters, orchestration, billing modes, and persistence.
- Profile, Library, Community, Self, Classroom, and Workspace are already separated
  into reusable packages suitable for later Edlove-family extraction.

### Real but incomplete

- The PowerSync database layer still supports mock/shim and runtime injection paths;
  domain adoption is not yet the imported Zone A/B/C lifecycle end state.
- Temporal controls exist, but the deeper history experiences remain mostly raw
  lists or domain-specific timelines. `DerivedHistoryView` is now a shared
  presentation contract and is proven on the Gurudevi Self mood slice, but the
  remaining domains have not adopted it yet.
- UI design rules are documented but not consistently enforced; `GlobalHeader` is
  a concrete central example of mixed token and raw styling.
- Database parity has meaningful local progress, but migration readiness, remote
  application, and post-application parity are separate states.

### Fresh implementation slice — 2026-08-10

- Added `scripts/check-supabase-boundaries.mjs`, with a strict mode for CI. It
  reports import declarations only, so runtime calls are not misclassified.
  Migrated 89 current consumers to the canonical adapter and removed the raw
  Supabase export from `packages/core/src/api/index.ts`; the strict scan now
  reports zero non-allowlisted client imports.
- Added `@repo/ui`'s `DerivedHistoryView` with typed points, entries, Now/History
  tabs, empty states, reinforcement content, and accessibility state.
- Wired the component behind the existing Self Now/History controls and supplied
  real mood-history read-model data for the Gurudevi teacher Self surface.
- `@repo/ui` and `@repo/self` type checks pass after this slice.

### Contradictions and risks

- The central API rule is now enforced at the import boundary, but transport
  governance remains incomplete because approved adapters still contain raw
  Supabase table operations that should move to Hono contracts or explicit ports
  where appropriate.
- The imported GlobalHeader recommendation to promote notifications is still open:
  the current mobile implementation places search and notifications behind an
  animated More control.
- The imported Library audit described a monolith; current source remains 1,383
  lines, confirming decomposition is still relevant.
- The imported local-inference recommendation remains intentionally deferred; the
  current cloud inference architecture is real and should be preserved while its
  interface is made provider-configurable.

## Decision mapping

| Decision | Current action |
| --- | --- |
| Preserve domain tables as canonical | Do not introduce a generic events-table rewrite as a prerequisite. Add derived temporal read models around stable domain data. |
| Gurudevi first, Edlove later | Build and validate in Gurudevi/mobile and shared packages; validate one sibling primitive before family rollout. |
| Bounded parity batches | Continue database-review batches; never use a broad destructive cleanup to make parity numbers look better. |
| Native-first offline work | Prove Classroom attendance on native SQLite/PowerSync before expanding web parity. |
| Defer measured infrastructure | Do not add Redis, partitioning, HTTP QUERY, local models, or custom CDN without workload evidence. |

## Verification commands and evidence to refresh

Before changing status from unverified or ready to deployed:

```powershell
supabase migration list --linked
supabase db push --linked --dry-run
pnpm exec zen check
pnpm run check-types
pnpm run audit:database-parity
```

### Fresh verification recorded on 2026-08-10

- `pnpm exec zen check --schema packages/schema/schema.zmodel`: passed.
- `pnpm run audit:migration-state`: passed; 151 local and linked migration
  records aligned. This verifies migration history alignment, not that every
  prepared domain migration is semantically accepted.
- `pnpm run audit:query-plans`: passed all five probes. Membership and invite
  probes currently report sequential scans and remain optimization follow-ups;
  this is evidence, not permission to add indexes blindly.
- `pnpm run audit:database-parity`: fresh no-write command returned 95/100 and
  exited non-zero because drift remains. The imported/local historical baseline
  of 86/100 and 287 findings remains preserved in batches 03 and 05.
- `pnpm --filter @repo/ui run check-types` and
  `pnpm --filter @repo/self run check-types`: passed after the shared history
  slice.
- `pnpm run test:db-behavior-fixtures`: not run to completion because the
  required staging-only test credentials are not configured; the suite did not
  create users or write rows.
- `pnpm run check:supabase-boundaries`: passes in strict mode with zero
  non-allowlisted client imports after the adapter migration.
- Live linked Supabase structure, RLS, grants, indexes, and advisor findings
  are recorded separately in
  `docs/current_progress/2026-08-10-live-supabase-inspection.md`. The linked
  schema dump was not produced because Supabase CLI dump requires Docker
  Desktop on this Windows environment; no remote mutation was performed.

The comparison document should be refreshed after each bounded parity batch and
after each shared primitive is adopted by a sibling Edlove app.
