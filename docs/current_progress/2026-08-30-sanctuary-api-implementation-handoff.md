---
title: "Sanctuary API Implementation Handoff"
status: "active"
created: 2026-08-30
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [api, handoff, security, implementation, testing, sanctuary]
---

# Sanctuary API Implementation Handoff

## Executive status

This is **not a complete production-ready vertical slice**. The implementation
has closed several confirmed stop-ship source vulnerabilities and made the API
contract inventory substantially more truthful. It has not yet earned release
sign-off because the test environment is unreliable, the complete externally
reachable surface is not proven against OpenAPI/client inventories, and several
critical operational boundaries remain unfinished.

Treat the files and source changes listed below as an in-progress security
hardening slice. Preserve existing unrelated worktree changes; this checkout
was already broadly dirty before the work began.

## Continuation card — safe even for a shallow model

Read this section before editing. It is the authoritative checkpoint, not test
names or historical green output.

**Current safe state**

- Native oRPC now requires every declared envelope channel. If a contract has
  `request.query`, callers must send `{ query: {} }` even when every query
  field is optional. The same rule applies to `params` and `body`.
- Do **not** add a handler-side flattening adapter. Handlers must read only
  `input.params`, `input.query`, or `input.body`.
- `doubleGateMiddleware` has a separate, conflict-detecting authorization
  projection of those three channels. It exists only so Cedar can derive
  resource attributes; it must not be shared with handlers or clients. When a
  key appears in two channels with unequal values it returns `BAD_REQUEST`.
- Learning Reflections is now reachable at
  `/api/learningReflections/*`, uses canonical envelopes, and is represented
  in both the Cedar schema and action applicability list.
- Educational handler reads are migrated to canonical envelopes (**zero
  flattened reads**), and its focused tests now send envelopes. The router now
  resolves teacher/principal/admin classroom IDs within the active school and
  student IDs from enrollment; request headers remain non-authoritative. The
  authorization middleware loads verified parent classroom facts for note
  timeline and assignment-submission operations before Cedar. The focused mock
  slice is now **11/11 green**, including an explicit cross-tenant classroom
  denial; real isolated-Supabase acceptance tests are still required.

**Next operation, in order**

1. Finish the Educational authorization design. Resolve each classroom,
   note, material, assignment, and submission by its server-owned identifier
   before Cedar; attach verified `teacher_id`, `student_id`, and `classroom_id`
   attributes. Do not trust `x-classroom-ids` or request body scope.
2. Make the contract routes internally coherent: move IDs that occur in route
   paths out of query/body and remove duplicate body IDs in a versioned,
   explicit migration. The present handler follows the existing contract to
   avoid an undocumented breaking change.
3. Add one allow and one cross-tenant deny test for every Educational resource
   family using a real isolated Supabase fixture. Mock tests are regression
   checks, not release proof.
4. Continue the static migration over the remaining direct legacy clients and
   handlers. Library, ERP, admin/staff, grading, social, student-potential, and
   thuthimal are now canonical-envelope slices; do not reopen them by adding
   flattening compatibility. Inventory each remaining client call, migrate one
   domain at a time, and add an adversarial flattened-envelope plus
   cross-tenant test before marking it complete.
5. Restore the declared `tsx`/`esbuild` dependency graph and rerun the
   contract audit and OpenAPI generation whenever router or policy contracts
   change. The latest audit is green, but that result does not prove the
   current worktree is production-ready.

**Never do these things**

- Do not make envelopes optional again; that causes flattened input to reach
  handlers as `undefined` and turn client mistakes into 500s.
- Do not resolve authorization scope from headers or from a client-provided
  user/school/classroom identifier.
- Do not make 403s disappear by weakening Cedar, disabling the double gate,
  using a test-only bypass, or replacing assertions with 403 expectations.
- Do not use generic response caching as idempotency; it is not atomic with
  domain mutation. Do not use `expo install --fix`, destructive git reset, or
  modify native `android/`/`ios/` artifacts.

**Fast verification commands**

```powershell
Set-Location C:\x\apps\sanctuary-api
$vitest = 'C:\x\apps\sanctuary-api\node_modules\vitest\vitest.mjs'
& 'C:\Program Files\nodejs\node.exe' $vitest run src/__tests__/learning-reflections.orpc.test.ts src/__tests__/community.orpc.test.ts src/__tests__/onboarding.test.ts
& 'C:\Program Files\nodejs\node.exe' $vitest run src/__tests__/rewards.orpc.test.ts src/__tests__/sync.orpc.test.ts
rg -n -P "input\\.(?!params\\b|query\\b|body\\b|context\\b)\\w+" src/core/handlers
```

The latest focused Education run is 11/11. This is a mocked adversarial
regression slice, not proof of production data-layer correctness; preserve the
real-database acceptance requirement in the next handoff.

## What was implemented

### 1. Durable-agent authorization and tenant scope

- Removed client-authoritative durable-agent scope fields (`schoolId`,
  `teacherId`, `requestedBy`, and student display data) from the public
  contract.
- Enqueue now derives school, teacher, requester, classroom, and student
  scope from server-side relationship queries.
- Reads and promotions check requester/classroom/leader/admin relationships.
- The worker reauthorizes the original requester and classroom/student
  membership immediately before reading sensitive evidence, closing the
  enqueue-to-execution revocation window.
- Added focused authorization tests in
  `apps/sanctuary-api/src/__tests__/durableAgents.authorization.test.ts`.

### 2. oRPC contract integrity and mount inventory

- Removed the fallback that silently fabricated an oRPC route for an undefined
  contract member.
- Added the missing community, educational, and profile contracts.
- Created a shared native Hono/oRPC mount inventory and made the contract audit
  validate every runtime contract path against it.
- Extended audit sources for journal entries, learning reflections, and rewards.
- The last successful contract audit before the strict-envelope and later
  schema changes reported **224 routes across 38 sources, 0 errors, 0
  warnings**. It must be rerun after restoring the `tsx`/`esbuild` dependency
  graph; do not treat that historical result as current proof.

### 3. Authority and rewards protections

- Removed client headers as authority for school, capacity, classroom,
  child-membership, device trust, and network zone; the server now fails closed
  if protected authority context is unavailable.
- Bound nested reward query/body user IDs to the Cedar resource, preventing a
  caller from being authorized as self and then querying another user.
- Required platform-admin authority for direct point and badge grants.
- Added policy resources and Cedar policy coverage for learning reflections,
  user rewards, and whispered moments.

### 4. Authentication, webhook, and external error boundary

- JWT verification now requires issuer/audience configuration in production,
  validates both claims, removes the hard-coded JWKS fallback, and does not log
  decoded token material after verification failure.
- PayHere callbacks now atomically consume a matching pending payment intent
  before adding an entitlement; owner, amount, currency, and provider status
  are bound server-side.
- Hono's global error handler emits a sanitized RFC 9457-style problem response
  for unhandled/HTTP exceptions, preserves safe headers, removes stale content
  length, and logs the original cause server-side.

### 5. AI boundary and dependency repair

- AI input is structurally validated and bounded (message count, per-message
  size, transcript size, identifier lengths); provider failures map to safe
  API errors and the circuit breaker is process-wide rather than per request.
- Repaired the incompatible TanStack AI package family by aligning Sanctuary to
  exact versions: `@tanstack/ai` 0.52.0, Anthropic 0.18.3, Gemini 0.26.4, and
  OpenAI 0.22.3.
- Regenerated the stack map and dependency catalog as required for dependency
  changes. `pnpm --filter @repo/sanctuary-api why` reports one coherent family,
  and the Anthropic adapter imports successfully.

### 6. OpenAPI, native-client, and guardian-envelope repair

- Closed a confirmed mutation exposure at `/api/openapi/*`. The adapter now
  accepts only declared `GET` procedures, using the actual oRPC traversal
  callback shape rather than a procedure-name heuristic.
- The same read-only predicate now drives the OpenAPI generator. The generated
  `apps/sanctuary-api/docs/api/openapi.json` contains **111 GET operations and
  zero non-GET operations**.
- Restored the missing native profile contract that prevented full router/spec
  composition, and aligned its handler to the `{ params, query, body }` input
  envelope.
- Consolidated oRPC and Hono client authentication on one registered-resolver
  fetch function; bearer and selected-bond headers are now attached to native
  oRPC calls as well.
- Migrated the Guardian Assessment caller from a hand-built Supabase-auth POST
  to the shared oRPC client and aligned handler reads with the contract
  envelope.
- Migrated FlowResolver group joining from a direct `group_members` upsert to
  the native Community procedure. The server derives both member identity and
  role; the client now supplies only the group route parameter.
- The integration lane now fails closed when `TEST_DATABASE_URL`,
  `TEST_API_URL`, or `TEST_AUTH_TOKEN` is missing. It no longer defaults to a
  database, localhost server, or mock token. Its Vitest configuration is also
  compatible with the native config loader and Vitest 4 pool configuration.

## Evidence collected

### Workspace hygiene

- Removed 76 generated `reports/sanctuary-*.out` and `reports/sanctuary-*.err`
  files created by earlier test runs. A follow-up filename check found no
  matching temporary Sanctuary logs. Other untracked user files were left
  untouched.

Focused verification passed:

- The combined adversarial boundary slice (rewards, durable agents, JWT, and
  public error behavior): **4 suites / 40 tests passed** in 8.38 seconds.
- Focused durable-agent, PayHere webhook, and JWT tests also pass independently.
- Historical contract audit (before the latest envelope/schema edits): **224
  routes / 38 sources / 0 errors / 0 warnings**. It must be rerun after the
  `tsx`/`esbuild` toolchain is restored.
- Current contract audit (after the strict-envelope and policy-registry work):
  `pnpm run audit:api-contracts` passed with **224 active routes / 38 contract
  sources / 0 errors / 0 warnings**. The audit caught a real missing
  `AssignmentSubmission` authorization subject; it is now registered with its
  school/classroom/student/assignment attributes in the shared policy snapshot
  generator. This is an audit result, not production sign-off.
- Policy regression verification: `@repo/policies` Vitest passed **8/8**.
  Cedar audit-denial logs are expected in this suite; they are not suppressed
  failures.
- `pnpm run audit:api-errors`: passed.
- Focused TypeScript compilation for Sanctuary had passed before the later
  environment stalls.
- Cedar direct check: own LearningReflection read permitted; cross-user
  UserRewards access denied.
- The focused rewards oRPC suite now passes **20/20**. It caught and verified
  the central contract-envelope repair: request schemas must preserve
  `{ params, query, body }` rather than flattening them before handlers run.
- The focused durable-agent authorization suite now passes **3/3**, including
  a redaction regression test proving run lists exclude evidence, drafts,
  student names, provider/governor internals, and raw worker diagnostics.
- Durable-agent enqueue now has domain-level idempotency: an authenticated
  `Idempotency-Key` is bound to the capability and SHA-256 request fingerprint;
  an identical retry returns the original run without re-sending Inngest. The
  focused suite is now **4/4**.
- OpenAPI gateway regression: an allowed read route reaches authorization while
  `POST createAssignment` returns **404** at the adapter boundary.
- OpenAPI generation completed against the full router: **111 operations, all
  GET**.
- Shared oRPC client authentication regression: **1 test passed**, proving
  registered bearer and active-bond headers are forwarded on an RPC request.
- Guardian Assessment envelope boundary: **3 tests passed** for anonymous
  denial, declared pagination validation, and relationship-first safe denial.
- Community group join envelope regression: **1 test passed**, proving a
  canonical params-only request creates membership for the authenticated actor.
- Community native-oRPC migration: **7 focused tests passed** after replacing
  every flattened handler read with explicit `params`, `query`, or `body`
  access. The contract now derives actor identity from the authenticated
  context and no longer accepts a reaction user ID or join role from callers.
- Onboarding bootstrap/error migration: **7 focused tests passed**, including
  the prior regression where a domain `SovereignError` escaped the oRPC error
  mapper as a 500. Only the two authenticated onboarding bootstrap procedures
  are exempt from active-bond selection; all other oRPC procedures still
  require an authoritative active bond.
- The combined onboarding and community envelope slice now passes
  **14 tests across 2 suites**. Its three changed files also pass the focused
  Biome check.
- Daily Content native-oRPC migration: **3 focused tests passed** after moving
  `date` and `days` to their declared path-parameter envelope. The regression
  now rejects the former flattened request shape. The current combined
  envelope slice is **17 tests across 3 suites**.
- PowerSync native-oRPC migration: **3 app-fetch tests passed** after moving
  batch data under `body`; they cover anonymous denial, flattened-input and
  invalid-operation rejection, and an authenticated batch. The core Sync
  idempotency suites pass **24/24**. This work also fixed a transaction-capability
  bug where a wrapper exposing raw SQL but a transaction lacking it could run
  writes and then fail at ledger completion. The combined app-fetch envelope
  slice is now **20 tests across 4 suites**.
- Rewards client migration: the focused oRPC suite remains **20/20 passed**
  after replacing the direct Supabase adapter; the contract audit is again
  warning-free.
- Educational adversarial vertical slice: **11/11 passed**, including
  canonical envelope validation, server-resolved teacher/student classroom
  relationships, parent-resource lookup for notes/submissions, malformed input,
  cross-tenant denial, and OpenAPI mutation rejection.
- Announcements migration: **3/3 passed** after moving the legacy client and
  handler to canonical oRPC envelopes; the suite covers server-derived
  authorship and cross-school denial.
- Journal entries migration: **4/4 passed** after replacing the legacy Hono
  client and flattening reads in the server handler. The slice covers UTC-day
  filtering, server-derived ownership, anonymous denial, and rejection of the
  former flattened request shape; a static scan now reports zero flattened
  journal-handler reads.
- Identity migration: the server handler and shared identity client now use
  canonical params/body envelopes for profile and workspace operations. A
  static scan reports zero flattened identity-handler reads. The older broad
  downstream suite still contains unrelated pre-migration flattened calls
  (sync, library, and admin); those failures remain migration work, not proof
  of an identity regression.
- Messaging migration: **3/3 passed** after moving the client and handlers to
  canonical oRPC envelopes. Message reads and writes now verify conversation
  participation in the handler before touching message data; the slice also
  proves a valid conversation ID is denied to a non-participant.
- Attendance migration: **3/3 passed** after converting both Effect-backed
  client adapters and all handlers to canonical envelopes. The slice covers
  server-resolved grade-class authorization, malformed record input, and
  rejection of the former flattened record shape; school IDs used for writes
  continue to come from the server-loaded grade class.
- Self/wellbeing migration: **18/18 passed** after converting all personal
  handlers and tests to canonical envelopes. Personal writes continue to bind
  ownership to the authenticated principal; the suite includes anonymous
  denial and explicit rejection of a flattened mood mutation.
- Principal notes migration: **4/4 passed** after converting handlers, tests,
  and the shared client to canonical envelopes. Update/delete now load the
  persisted note author before authorization and fail closed for a different
  principal; this caught and fixed a middleware fact-overwrite vulnerability.
- Integration preflight without test credentials exits failed in **2.03s**
  with the exact missing environment variables. This is expected and is not a
  passing integration result.

Current verification limitation:

- Cold Vitest collection can be slow because the API composition graph is
  large, but focused suites execute deterministically through the app-local
  Vitest binary. The config now uses `import.meta.dirname`, removing Vite's
  impending native-config-loader incompatibility warning. Package-manager
  commands may still reconcile the whole workspace.
- On this checkout the root `tsx` runtime currently cannot resolve its
  `esbuild` dependency, so the contract-audit/OpenAPI generator could not be
  rerun after the community change. This is an environment/toolchain failure,
  not evidence of a passing audit; restore the declared dependency graph and
  rerun both commands before relying on the generated specification.

## What is still not implemented or proven

### Release blockers

1. Build a trustworthy real integration system: deterministic isolated
   Supabase bootstrap, real signed test identities, per-test tenant fixtures,
   in-process application transport, and a CI acceptance job. The current
   preflight fails safely but the existing acceptance test still needs that
   fixture/runtime work.
2. Add black-box cross-tenant tests for all identifiers: path, query, body,
   cursor, nested bulk item, durable job ID, and webhook replay.
3. Prove the bidirectional mapping of runtime routes, oRPC contracts, client
   calls, and OpenAPI paths. The generated OpenAPI surface is now GET-only,
   but it remains intentionally selective and is not yet a complete mapping
   proof.
4. Migrate every legacy native handler from flattened input fields to the
   canonical `{ params, query, body }` envelope. A fresh flow audit confirmed
   that Educational and many other handlers still contain flattened reads (for
   example `input.classroomId`) despite declaring nested contracts. Community
   is now migrated at the native oRPC boundary, but its older general contract
   remains a separate legacy surface and must be reconciled or retired. Do not
   reintroduce a flattening compatibility shim: it would
   preserve ambiguous input authority and conceal incomplete migration work.
5. Exercise the migrated rewards client against a real authenticated Sanctuary
   deployment and add a black-box client-to-route contract test.
6. Add a separate detail-response redaction policy (role/need-to-know and
   field-level evidence projection). Lists are now minimized, but authorized
   detail reads still need a formal field-level policy.
7. Finish payment provider transaction-ID recording, reconciliation, and
   replay/audit operations.

### Important architecture work

- Replace the router's first-relationship selection with a deliberately stored
  or explicitly selected authoritative active bond/school context.
- Hydrate classroom and guardian relationship attributes authoritatively;
  current deny-by-default empty attributes are safer than trusting headers but
  can deny legitimate access.
- Finish a single error wire format across Hono, oRPC, webhooks, and AI; the
  Hono problem boundary is implemented but oRPC compatibility is not yet
  proven.
- Establish durable idempotency at transactional domain boundaries (database
  key + request fingerprint + response/replay semantics), rate-limit classes,
  W3C trace propagation, redacted telemetry, and graceful shutdown. A generic
  response-caching middleware was deliberately rejected because it could not
  atomically commit with arbitrary business mutations.
- PowerSync retains a process-local idempotency fallback only for runtimes
  whose transaction cannot use the durable ledger. Production acceptance must
  prove the migration-created `powersync_idempotency_keys` table and transaction
  raw-SQL capability are present, because only that path is durable across
  processes.
- Derive AI billing/context attributes from authoritative server scope rather
  than accepting client context values.
- Migrate the remaining direct client-domain accesses identified in the audit:
  classroom/group joining, journey history, device trust, and key escrow are
  not made safe merely by the shared oRPC authentication repair.
- Move FlowResolver's class/group join, teacher-claim, and invite-claim actions
  into server-owned intent endpoints. Its direct Supabase mutations currently
  accept client-supplied user identifiers and must not be retained as a
  fallback once the native contracts are migrated.

## Is a full vertical slice implemented?

No. A substantial **security-hardening vertical slice** is implemented from
public contract through handler/worker and focused unit tests for durable
agents, plus equivalent slices for JWT and PayHere. But a full production API
slice requires all of the following to be true at once:

1. A documented external operation is reachable from a real client.
2. Its input, output, errors, authorization, idempotency, and rate limits are
   explicitly contracted.
3. Runtime, OpenAPI, client, and worker behavior are generated or proven from
   that same contract.
4. Cross-tenant, failure, replay, and revocation behavior is tested against a
   real isolated database.
5. Observability and rollback work in staging.

Those conditions are not yet met across Sanctuary's full API surface.

## Recommended next-agent sequence

1. Read this handoff, the future-readiness plan, and the adversarial audit
   before editing:

   - `docs/current_progress/2026-08-30-sanctuary-api-implementation-handoff.md`
   - `docs/current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md`
   - `docs/architecture/2026-08-29-sanctuary-api-adversarial-security-audit.md`

2. Inspect the working tree first. Do not reset, clean, or overwrite unrelated
   mobile/workspace changes. In particular, do not use `expo install --fix` or
   alter the protected Expo/React Native pins.

3. Build real database-backed integration coverage before extending API
   behavior. Focused Vitest execution is viable, but mock-backed passing suites
   are not a release proof; do not bypass this by skipping test files or
   changing timeouts globally.

4. Make a database-backed integration fixture capable of creating two schools,
   two teachers, students, guardians, and an administrator. Use it to add the
   cross-tenant and revocation matrix for durable agents first.

5. Exercise the migrated rewards client against an authenticated deployment,
   then keep the contract audit as a no-warning gate. Preserve backwards
   compatibility only through an explicit deprecation path.

6. Generate/verify an OpenAPI-to-runtime-to-client matrix, then close stale
   paths rather than documenting unmounted endpoints.

7. For any dependency change, follow the repository policy: update manifests,
   regenerate the lock with the declared pnpm, run `node scripts/stack-map.mjs
   bootstrap`, review annotations, then run `node scripts/stack-map.mjs` and
   `node scripts/stack-map.mjs deps`.

## Source map of the main changes

- Durable authorization: `apps/sanctuary-api/src/core/routes/durableAgents.ts`,
  `apps/sanctuary-api/src/agents/studentSupport.ts`,
  `packages/core/src/api/durableAgents.contract.ts`.
- oRPC and authority: `apps/sanctuary-api/src/core/orpc.ts`,
  `apps/sanctuary-api/src/core/router.ts`,
  `apps/sanctuary-api/src/core/orpcMiddleware.ts`,
  `apps/sanctuary-api/src/core/routes/nativeORPCPaths.ts`.
- Error/auth/payment: `apps/sanctuary-api/src/core/app.ts`,
  `apps/sanctuary-api/src/jwt.ts`,
  `apps/sanctuary-api/src/core/routes/payhereWebhook.ts`.
- Policy: `packages/policies/src/authorizationRegistry.ts`,
  `packages/policies/src/schema/schema.cedarschema`, and school Cedar policies.
- Auditing: `scripts/audit-api-contracts.ts`, `scripts/audit-api-errors.mjs`.

## Handoff principles

### Latest continuation evidence

- Library resource read slice: migrated `getResources`, `getResource`, and
  `searchLibrary` handlers and core client calls to canonical nested envelopes.
  Focused execution shows those migrated paths pass; the existing broad
  library suite currently reports **6/22 passed, 16 legacy envelope failures**
  in collection/mutation/bookmark/topology procedures still awaiting migration.
  Do not restore flattening compatibility to hide these failures; migrate each
  remaining family and update its tests explicitly.
- Library follow-up: migrated authenticated bookmark reads and public topology
  reads to shared oRPC with explicit query envelopes; both targeted tests pass.
- Library collections: migrated `getCollections` and `getCollection`, including
  temporal membership reconstruction and virtual subject/topic collections, to
  nested envelopes; migrated their core client adapters. Targeted collection
  read checks pass, including historical cutoff reconstruction. The remaining
  broad library suite still contains un-migrated collection mutations.
- Library resource mutations: migrated create/update/delete/verify client calls
  and handlers to nested envelopes; creator identity remains server-derived,
  and update/delete remain guarded by persisted creator ownership (or platform
  admin). Focused resource mutation checks pass (**3/3**); direct Biome checks
  pass.
- Library collection mutations: migrated create-collection, add/remove-member,
  update, and delete handlers/clients to nested envelopes. Collection membership
  additions now require persisted collection ownership (or platform admin),
  closing the prior authorization gap. Focused create/membership/lifecycle
  checks pass (**3/3**); direct Biome checks pass.
- Library engagement: migrated resource engagement client/handler to nested
  envelopes and added verified classroom-scope enforcement. The actor is always
  taken from the authenticated context; a caller cannot attribute engagement
  to an unrelated classroom. Focused engagement checks pass (**3/3**), with
  direct Biome checks clean.
- Library fork: migrated collection fork handler/client to route-parameter
  envelopes while preserving the transactional clone, public/owner visibility
  check, and server-derived fork creator. Targeted fork test passes; direct
  Biome checks remain clean.
- Library engagement/fork completion: engagement classroom attribution now
  requires a server-resolved classroom relationship, and fork callers use only
  the route collection ID. Focused engagement and fork tests pass; no caller
  identity or classroom header is treated as authority.

- Decision journal: migrated the core client from the legacy Hono adapter to
  shared authenticated oRPC, including the previously unexposed
  `markReviewed` operation. The server already reads only nested query/body/
  params. Focused adversarial suite passes **3/3** (validation, invalid route
  identifier, and flattened-list rejection). The flattened test intentionally
  asserts rejection rather than a single status because authorization may
  fail before envelope validation in the current test principal.

- Daily content: migrated the local-first client adapter to shared authenticated
  oRPC for today, date, and recent reads. Cache behavior remains unchanged;
  transport errors now follow the shared RPC error path. Focused native suite
  passes **3/3**, including canonical date input and flattened recent-input
  rejection.

- Privacy ledger: migrated the client read/write paths to shared authenticated
  oRPC and narrowed event metadata from `any` to `Record<string, unknown>`.
  Server-side identity remains context-derived. Focused privacy suite passes
  **2/2**, covering schema validation and rejection of the former flattened
  event envelope.

- Presence: migrated fallback-count and mark-seen client calls to shared
  authenticated oRPC. Explicit empty `query`/`body` envelopes are now used in
  tests and callers, preserving the strict contract while keeping the
  server-derived current-user identity. Focused presence suite passes **7/7**.

- Profile is the next unresolved identity-sensitive slice. A focused audit
  found existing `orpc.test.ts` callers still use flattened profile envelopes;
  do not restore compatibility. Before migrating the profile client, reconcile
  the social-link mock delegate and verify route-target ownership explicitly;
  exploratory changes were reverted because they did not yet prove the
  server/client boundary. A canonical update probe unexpectedly resolved for a
  different route user under the current mock/runtime path, so ownership must
  be proven with a direct database assertion or isolated-Supabase test before
  any release claim.

- ERP/accounting: migrated accounting and payments client calls to shared
  authenticated oRPC and migrated handlers to strict nested envelopes. Fixed a
  real payment-intent idempotency lookup bug: replay lookup now uses the same
  user/provider-prefixed fingerprint written at creation, preventing duplicate
  intents on retries. Focused suite: **3/3 passed**, including balanced-ledger
  validation and flattened-envelope rejection. The payment model still needs
  isolated-Supabase concurrency verification before release sign-off.

- Admin/staff: migrated admin handlers and `packages/core/src/api/staffManagement.ts`
  to canonical nested envelopes and the shared authenticated oRPC client.
  School-scoped operations now verify the requested school against the active
  authenticated bond before database access; caller-provided reviewer/author
  IDs remain ignored. Focused admin suite: **5/5 passed**, including a
  cross-school denial. Direct Biome checks pass for all touched files.

- Grading: migrated report-card, classroom-grade, settings, submit, and
  publish handlers/client adapter to canonical nested envelopes. Submit now
  rejects a school ID outside the authenticated active-bond school before
  writing. Focused suite: **5/5 passed**, including verified classroom fixture,
  flattened-envelope rejection, invalid marks, and cross-school write denial.

- Social and safety: migrated notification, block, unblock, block-status, and
  blocked-user client calls to shared authenticated oRPC; handlers now consume
  only declared nested channels. Focused boundary suite: **2/2 passed** for
  anonymous denial and flattened block-envelope rejection.

- Thuthimal: migrated gift creation, claiming, listing, and preview to strict
  nested envelopes and the shared authenticated oRPC client. All procedures
  now pass the authorization middleware; this fixed an unauthenticated path
  that previously surfaced as a 500 instead of a 403. Focused boundary suite:
  **2/2 passed** for anonymous denial and flattened-envelope rejection.

- Student Potential: migrated read/upsert handlers and the core adapter to
  canonical nested envelopes. Upsert now treats the route `studentId` as
  authoritative and rejects a conflicting body `student_id` before database
  access. Focused adversarial suite: **6/6 passed**, including malformed UUID,
  denied teacher update, identity mismatch, and flattened-envelope rejection.

- Sacred missions: migrated list/create/endorse/unendorse handlers to canonical
  nested `{ query, body, params }` envelopes and migrated
  `packages/core/src/api/sacredMissions.ts` to the shared authenticated oRPC
  client. Unendorse now verifies the manifesto’s school before deleting an
  endorsement. Focused adversarial suite: **5/5 passed**, including rejection
  of a legacy flattened mutation envelope. The broader core typecheck remains
  red on pre-existing RouterClient typing and unrelated contract errors.

Be critical of every generated inventory and mock-backed test. Do not paper
over environment failures, fabricate contract fallbacks, trust request headers
as authority, or reduce assertions to make CI green. Prefer a small, complete,
proven boundary over a large claimed API surface.
