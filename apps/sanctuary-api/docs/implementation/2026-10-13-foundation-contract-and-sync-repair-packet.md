---
title: "Foundation Repair Packet: Contract Conversion and Sync Transport"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [foundation, implementation-packet, contracts, sync, compatibility]
---

# Foundation Repair Packet: Contract Conversion and Sync Transport

## Authority and scope

This is a bounded implementation packet, not approval for a platform rewrite. Target the demonstrated F2 converter omission and F3 connector wire mismatch. Retain modular-monolith deployment and existing policy/data authority. No production provider, migration, route deletion or new dependency is required by the packet. Any existing behavior removal requires explicit deletion-veto approval.

The human approved this bounded implementation on 2026-10-13 ("approve to implement"). The approval authorizes the contract/sync repair described here, not production readiness, deployment, database changes or broader foundation replacement.

## Approved feature spec and implementation record

**Blast zone:** AMBER shared core; bounded API converter/handler seam.

**Target files:** `packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts`, `packages/core/src/api/contracts.ts`, `packages/core/src/api/sync.orpc.contract.ts`, `src/core/orpc.ts`, and the sync implementation initialization in `src/core/handlers/sync.ts`. Focused tests accompany these targets. Existing workspace-layout changes in the dirty worktree are not authored by this repair and remain intact.

**Reuses:** native oRPC link/protocol; shared sync schema; account-scope resolver; Supabase session provider; deterministic batch-key helper; Effect runner and strict retry schedule; existing sync event bus. No new framework, dependency, server endpoint, database or app-layer import.

**Does not:** clear, skip or quarantine queued writes automatically; change server authorization or ledger authority; deploy PowerSync; alter secrets; weaken schemas; migrate all namespaces at once. Complexity budget: each new function below 15 cognitive complexity, fewer than 120 added production lines across the converter and connector seams.

### Implemented stage

- The replica-bound connector uses native `sync.uploadBatch({ body })` RPC at the existing `/api` mount rather than the demonstrated non-working Hono URL/flat body. Its old unsafe transport assertion is replaced; no server route was removed.
- The connector checks active account and session subject, obtains credentials on each attempt, retains the original actor/batch key, and rechecks active account before queue completion. It does not use the globally authenticated client. An already-in-flight account-A request is not retokened to account B; account switching prevents local acknowledgement and subsequent retry.
- Successful wire decoding is insufficient: the shared acknowledgement schema must parse, `success` must be true, and processed count must equal the entire batch. Invalid or partial acknowledgements leave the batch queued. A local `complete()` failure also prevents a success event.
- Local retry uses the existing bounded schedule (three total attempts), only for transport failure, 408, 429 or 5xx. Account mismatch/change and missing session stop it. Permanent API errors are not locally retried. The PowerSync SDK may invoke the connector again later: this is not a permanent-error quarantine/recovery UX implementation.
- Each RPC attempt requests abort after 30 seconds and releases its timer/listener. This bounds cooperative transport work, not the whole sync/session lifecycle; real-device fetch cancellation and stalled credential-provider behavior still require evidence.
- Sovereign route types can now declare oRPC errors, and conversion carries them forward. Successful response schemas are processed before the input return. Only 2xx schemas participate; multiple declared successes form a union, while 204/nullable semantics follow their explicitly declared schemas rather than guessed `null` conversion.
- Output enforcement is staged through `validateResponses: true`, currently enabled for the sync namespace (upload, receipt and workspace-layout patch). Unreviewed namespaces retain current compatibility behavior. This is explicitly incomplete global output enforcement, not a foundation pass. Native contracts and missing-policy refusal remain unchanged.

### Verification and limits

- **G1 boundary / Vitest 5.0.3:** final core selection, five files, **26/26 assertions**. Includes 16 connector assertions using real oRPC client/handler encoding with mocked sessions, queue and idempotency calculation, plus ten existing account/runtime lifecycle assertions. Proves the named boundary contracts under those substitutions; does not prove SQLite persistence, real server transactions, JWT providers, devices or production.
- **G1 boundary / Vitest 5.0.3:** API converter/sync plus actual identity-scope, profile and workspace-layout selection, six files, **37/37 assertions**. A separate self/education/library/privacy/converter/sync compatibility selection yielded **69/69** across six files. These selections overlap; do not add their counts into a unique coverage total. DB/auth/provider substitutes remain in place.
- Converter execution assertions reject invalid handler output and strip undeclared fields for the tested Zod object. Nullable/204, success-only selection, explicit error metadata, native pass-through and missing-policy behavior are covered. This does not prove every error data payload, every DTO, or schemas that intentionally allow additional fields.
- **G0:** targeted Biome formatting/checks and whitespace diff inspection succeeded. ESLint's production core selection exited zero with the existing undeclared PowerSync environment warning; the test was initially ignored, then explicitly checked with `--no-ignore` (zero exit). Targeted jscpd analyzed three seam files and reported zero clones at eight-line/50-token thresholds.
- **G0 blocked:** `pnpm check-types` exited one at core. The installed `@powersync/common@2.3.1` manifest points to `lib/index.d.ts`, which is physically missing; GrowthBook/form-builder declarations and unrelated mesh/layout types also fail. No ambient `any` declarations or suppressions were added. The connector's DB argument now expresses only its real batch/complete requirements; SDK interface conformance remains unproven until installed declaration integrity is restored.
- Direct API TypeScript checking also exited one: Sentry option in `app.ts`, Hono context typing in `adRewards.ts`, and inherited `APIError.cause` declaration. The introduced path-typing diagnostic was corrected; the latest API output lists those three other diagnostics, not the converter.
- Repository test-evidence gate still fails on the unlevelled `apps/edlove-web` command. Version-drift cannot write its report (`UNKNOWN` filesystem error). Anti-slop remains a required repository gate; its result is recorded below after completion, not inferred from focused tests.

Final anti-slop rerun exited one in aislop: 95 errors and 1,097 warnings over 3,315 files in the current dirty workspace. The chained fallow/version-drift/skill-doctor stages did not execute after that failure. These are not 95 defects attributed to this patch, nor a successful repository gate. The narrower checks above do not override that result.

**Remaining gate:** review the AMBER diff before merge, resolve installed/toolchain/static-gate defects, then widen output enforcement namespace by namespace with truthful DTO fixtures and real DB/offline/operational evidence. The horizontal foundation and production gate remain open work, not achieved outcomes.

## Baseline evidence

- `src/core/orpc.ts` translates request/meta but not responses/error declarations for legacy-style contracts; native `~orpc` contracts pass through.
- `src/__tests__/contract-conversion.characterization.test.ts` records converted metadata omission, native contract preservation, and missing-policy refusal.
- `src/__tests__/sync.orpc.test.ts` records 404 for connector-shaped `/api/powersync/upload` with flat JSON; native `sync.uploadBatch({body: ...})` succeeds under the same auth/storage doubles.
- `packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts` owns account-specific session, stable batch key, bounded Effect retry and `batch.complete()` after HTTP success. It does not validate a successful response body.

## Packet A — converter fidelity

**Owner role:** API engineer. **Review roles:** contract/security reviewers. People are not yet assigned by this document.

**Impact candidates:** `src/core/orpc.ts`; focused converter tests; shared `packages/core/src/api/contracts.ts` only if error-declaration typing is needed. Recompute callers before editing: the shared converter underpins many handlers. Inspect representative self, identity, sync, classroom-note, library and privacy outputs. Do not mass-edit 40 handlers automatically.

**Invariants:**

1. Preserve route/method/input/meta and native-procedure pass-through.
2. Select successful output schemas deliberately; never union success with error payloads. Resolve multiple successful statuses and 204/null explicitly.
3. Declared errors retain safe machine data; internal causes never become public data.
4. Input/output validation must not weaken existing schemas. Characterize existing DTO shapes before enabling global validation.
5. Missing policies/members continue to fail closed.
6. Native oRPC responses keep their protocol; ordinary HTTP Problem Details is a separate projection.

**Mini-tasks:**

- A1: retain baseline characterization; add intended output-validation tests, nullable/204, multi-success ambiguity and safe metadata tests.
- A2: map response/error metadata without early input return dropping output processing.
- A3: test invalid output rejection and unexpected sensitive-field behavior at actual procedure execution, not metadata only.
- A4: execute representative route suites; separately report historical DTO mismatches rather than loosen schemas.
- A5: record exact compatibility choices, static/type/runtime limits and raw delta. Replace baseline omission assertion with desired validation assertion when the repair lands; do not retain a defect as target behavior.

**Rollback:** restore only the scoped authored patch through a reviewed additive fallback if necessary; never reset the worktree. Unrelated user changes remain untouched. Do not introduce an unvalidated production branch as a silent rollback.

## Packet B — actual connector-to-API protocol

**Owner role:** core sync engineer. **Review roles:** API, account-security and client runtime reviewers.

**Impact candidates:** existing PowerSync connector; a platform-neutral sync client adapter using the existing shared native procedure; sync contract/schema; connector-boundary tests; API sync tests. Do not import the API runtime or RN modules into browser-neutral contract code. Do not make a new server write endpoint merely to avoid fixing the client.

**Invariants:**

1. Use existing native `sync.uploadBatch` procedure with canonical body envelope and RPC encoding.
2. Credential resolution stays bound to the queued account. Global current-session client must not silently substitute a different principal.
3. Stable actor/payload retry key survives retry; server policy and ledger remain authoritative.
4. Validate success, processed count/full-batch acknowledgement and replay semantics before `batch.complete()`.
5. Malformed, false-success, partial, non-2xx or ambiguous response preserves queue; record failure/unknown safely.
6. Retry only allowed transient failures within one total budget. Do not layer RPC retry atop Effect retry unaccountably.
7. Revalidate account identity before retry and acknowledgement. Switching accounts preserves/quarantines old-account work according to existing policy; no automatic destructive discard.

**Mini-tasks:**

- B1: exercise actual connector and actual in-memory app with declared auth/DB/SDK substitutes; current URL/body test alone is not this proof.
- B2: replace the connector's transport cast with a typed account-bound native adapter; keep existing callers until compatibility is proven.
- B3: table-test empty/malformed/partial/false acknowledgement, 401/403/409, throttling, unavailable, cancellation and dropped response.
- B4: switch account during retry and after server acceptance; verify no wrong-principal request or wrong-queue completion.
- B5: run existing sync/server/account suites, then owned disposable DB replay/concurrency proof. Never substitute a mock for the production-durability claim.

**Rollback/compatibility:** old installed clients may still issue the Hono request shape. Record actual deployed-client inventory before choosing whether a tightly scoped compatibility bridge is needed. Such a bridge must enter the same application/policy/ledger boundary and have an explicit lifecycle; its existence is not assumed or authorized here. Preserve existing native RPC clients.

## Acceptance and stop conditions

| Stage | Required result |
| --- | --- |
| G0 | Typed contract/adapter and bounded impact set; strict input/output/error representation |
| G1 | Converter/procedure and connector/app boundary assertions with named substitutions |
| G2 | Defined replay, dropped-response, auth expiry, conflict, switch-account and retry scenarios |
| Owned INT/DATA/RACE | Disposable DB proves ledger/transaction outcomes and restart replay |
| Later G4/G5 | Browser/native device connection and local queue lifecycle |

Stop if the repair requires weakening authorization, accepting malformed output, changing unrelated routes, deleting fallbacks, hiding a failed check, or dropping unsynced data. A green mock suite establishes neither database durability nor production rollout readiness.

## Next decisions still required

Output mapping for multi-status routes; safe error schema ownership; deployed legacy sync client inventory; disposable database availability; named reviewers/operator; rollout/rollback window. Resolve these against actual substrate rather than inventing compatibility promises.

## Verification boundary

Baseline executed on 2026-10-13 with installed Vitest 5.0.3 in the API package: converter characterization plus sync suite, 2 files, 11/11 assertions. The first run had one test-fixture schema failure because an absent `outputSchema` property was modeled as required; the fixture was corrected to optional undefined and rerun. No runtime converter change was made. G1 boundary evidence, shared identity/storage/native dependency substitutes; not real database, mounted connector, device or production proof.

This packet specifies implementation and evidence; it does not claim the repairs exist. Its baseline tests capture current defects. Foundation release remains gated by F1–F5, not merely completion of A/B.
