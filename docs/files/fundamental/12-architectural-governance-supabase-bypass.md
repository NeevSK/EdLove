# Architectural Governance — The Supabase Bypass Pattern

Surfaced while tracing the community domain's comment-fetching path (`11-community-domain-audit.md`), then confirmed repo-wide. This is the single most important finding across the whole code-grounding exploration — a real, evidenced, actionable risk, not a style preference.

## The stated rule, confirmed as the correct one

Every request-shaped operation (read or write) should go through the single central API — no exception. Two, and only two, legitimate exceptions: Supabase Realtime subscriptions and PowerSync's sync stream, because both are inherently persistent connections that can't take the shape of a request/response call. Both exceptions apply to reads/notifications only — writes in both cases already correctly route through the central API (`syncContract.uploadPowerSyncBatch` for PowerSync, confirmed in `11-community-domain-audit.md`).

## The scale, confirmed precisely

**61 files repo-wide import `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__`** — an export whose own name is a pre-existing, self-documented admission that this exact risk was already recognized once, and an attempt was made to prevent it through naming alone. It didn't hold.

**Rough triage by directory, in descending order of concern:**

- **`packages/core/src/hooks/` — 7 files. Highest concern.** Direct raw-Supabase access from client-side hooks — the UI layer talking straight to the database, bypassing the API, Cedar checks, and the POA audit wrapper entirely. `useManualSnapshot.ts`, `useAuthLifecycle.ts`, `useStudentGoals.ts`, `usePendingActions.ts`, `useJourneyHistory.ts`, `useDomainServices.ts`, `useTemporalHeatmap.ts`.
- **`packages/core/src/api/*.ts` (bare files, not `runtimes/` or `hooks/`) — 25 files. High concern, same shape as the confirmed community.ts problem.** These sit in the same directory as `community.ts` (confirmed Hono-RPC-routed) and `attendance.ts`-style files — the concerning pattern is that some files in this exact directory correctly use Hono RPC while others in the same directory bypass it, with no obvious naming signal distinguishing which is which. Includes `circles.ts`, `rewards.ts`, `messaging.ts`, `thuthimal.ts`, `echo.ts`, `studentPotential.ts`, `mapping.ts`, `tracking.ts`, `warmMirror.ts`, `classrooms.ts`, `principalNotes.ts`, `grading.ts`, `social.ts`, `classroom.ts`, `inventory.ts`, `longitudinal.ts`, `formTemplates.ts`, `deviceTrust.ts`, `presence.ts`, `privacy.ts`, `erp.ts`, `schoolForest.ts`, `supabase.ts`, `history.ts`, `mapping.ts`.
- **`packages/core/src/api/runtimes/` — 9 files. Needs direct checking, not assumed either way.** These may be legitimately wrapped by the POA audit runtime (`audit-poa-runtime.ts`, confirmed real infrastructure in the classroom audit) — if so, direct Supabase access *inside* the runtime layer, behind the audit wrapper, is a defensible architecture. Needs confirming rather than assuming, since it wasn't checked in this pass.
- **`packages/core/src/adapters/` — 12 files. Likely legitimate, lowest concern.** This is the confirmed-good ports/adapters pattern seen repeatedly in this audit (`attendanceProjectionRepository.ts`, `storage/supabase.adapter.ts`) — a single, intentional, swappable implementation behind a port interface is the *correct* place for direct Supabase access to live, provided nothing bypasses the port to call it directly. Includes the legitimate `adapters/powersync/SupabasePowerSyncConnector.ts` (the actual sync bridge — a correct, necessary use).
- **~8 remaining** across `native/`, `lib/`, `store/`, `accounts/` — not yet categorized.

## Why this matters, concretely — not just in principle

The community investigation demonstrated the real, live cost: `communityRepository.ts`'s raw-Supabase `getComments` (with its own ordering bug) sits alongside `community.ts`'s Hono-routed `getComments` (which has no backend route at all) — **two parallel, partially-working implementations of the same feature, and even careful direct tracing struggled to determine which one, if either, serves real traffic.** This is not a hypothetical risk from having 61 files touch this export — it is the demonstrated, concrete failure mode waiting inside an unknown number of the other 60.

## Recommendation — stop the bleeding first, then remediate

**1. Immediate, cheap, high-leverage: enforce with tooling, not convention.** An ESLint rule or CI grep-check that fails any new import of `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__` outside an explicit allow-list (the `adapters/` directory's confirmed-legitimate files, plus the PowerSync bridge, plus files that use it *only* for `.channel()`/`.on('postgres_changes')`). This stops the pattern from growing further — including, critically, from a future AI agent reintroducing it without knowing this history — before the existing 61 are even triaged.

**2. Do not attempt to manually audit all 61 files in one pass.** The scale is too large for reliable, careful, one-by-one review in a single session. This needs to become its own scoped, prioritized initiative — likely well suited to a dedicated Claude Code pass given the mechanical, repetitive nature of "check whether this file's Supabase usage is inside a legitimate adapter/port, or a live bypass of an intended API route."

**3. Prioritize the 7 `hooks/` files and 25 bare `api/*.ts` files first** — these are the highest-concern categories, and the `api/*.ts` group specifically because it's the exact shape of the confirmed community.ts problem: siblings in the same directory, inconsistently routed, no obvious naming signal.

**4. Write the rule down formally**, in `docs/architecture/architecture-guidelines.md` (confirmed to exist), not just in this audit doc — "no domain may call Supabase directly except via the canonical adapter layer, and only for Realtime subscriptions or the PowerSync bridge" — specifically so it survives being applied by anyone (human or AI agent) who wasn't part of this conversation.

## Major correction — the true scope is 117 files, not 61, via a second bypass mechanism

**A severe escalation, found while tracing `BaseChatScreen.tsx`'s message logic: `packages/core/src/api/index.ts` re-exports the dangerous client under an innocuous, friendly name.**
```ts
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';
// ...
export { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase, ... }
```
Anyone doing the natural, ergonomic thing — `import { supabase } from '@repo/core/api'` — receives the exact same raw, ungoverned Supabase client, with **zero warning signal anywhere in the importing file.** The entire naming-based defense this doc was built around is defeated at the source, one file upstream of every downstream import.

**This means the original 61-file count, and the entire earlier self/classroom/library "clean" finding, were both wrong — not because the investigation was careless, but because the grep could only ever find the literal dangerous string, and this alias never contains it.** Corrected count: **65 files use the dangerous name directly, 52 more use the friendly `supabase` alias, 117 unique files total.** Corrected self/classroom/library finding: **self has 3, classroom has 2, library has 5** — the "zero direct matches" result reported earlier in this doc was real but incomplete, not false, and should be read as "zero matches *for the literal dangerous name*," not "zero bypass usage."

**Revised recommendation, replacing the earlier one:** the lint/CI rule must ban both (a) any import of `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__` and (b) any import of `supabase` specifically sourced from `@repo/core/api`. **Better still: fix it at the source** — `packages/core/src/api/index.ts` should stop re-exporting the raw client under the friendly alias at all. That one-line removal closes the loophole for all 52 files at once, going forward, without needing to catch every downstream import individually — a direct, concrete illustration of `17`/`18`'s leverage theory: fixing the barrel export is a structure-level intervention; banning each downstream import one at a time would be 52 separate parameter-level patches.

## Follow-up check: self, classroom, library packages

**Good news, worth stating plainly: zero direct imports of `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__` in `packages/self`, `packages/classroom`, or `packages/library`'s own source.** The bypass risk isn't tripled across each domain's own code — it's concentrated entirely in the shared `packages/core/src/api/*.ts` layer already identified above, exactly the same shape as the confirmed community problem (`useCommunity.ts` importing from `packages/core/src/api/community.ts`, where the actual risk lived).

**A real complication found while trying to trace this further: every domain package imports through the barrel export `@repo/core/api`, not specific submodule paths** (`import { X } from '@repo/core/api'`, never `from '@repo/core/api/grading'`). This means confirming exactly which of the 25 flagged bare `api/*.ts` files backs any given hook requires checking the actual named exports used, not just import paths — a real, additional pass, not done in this session.

**Named priority list for that next pass, based on naming correspondence to each domain:**
- **Self/wellbeing-relevant:** `thuthimal.ts`, `warmMirror.ts`, `echo.ts`
- **Classroom-relevant:** `classrooms.ts`, `classroom.ts`, `principalNotes.ts`, `grading.ts` (already confirmed problematic via the `grades`/`student_grades` mismatch — worth checking whether it *also* has the community-style dual-path issue, not just the naming mismatch), `inventory.ts`, `longitudinal.ts`, `studentPotential.ts`, `deviceTrust.ts`
- **Library-relevant:** `mapping.ts` (given the confirmed spatial/knowledge-atlas model), `tracking.ts` (likely `ResourceEngagement`)

## Open Questions / Not Yet Resolved

- Full, individual triage of all 61 files — only categorized by directory-level pattern here, not confirmed file-by-file
- Whether `api/runtimes/`'s 9 files are legitimately POA-wrapped or another instance of the bypass
- The ~8 uncategorized files in `native/`, `lib/`, `store/`, `accounts/`
- Whether this same pattern, now confirmed repo-wide, changes the confidence of any specific finding in the self, classroom, or library audits that assumed a particular code path was "the real one" without tracing it as precisely as was done for community's comments
