---
title: "API middleware and oRPC v2 contracts"
status: active
created: 2026-10-29
updated: 2026-10-30
author: Codex
tags: [api, authorization, orpc, hono]
---

# API middleware and oRPC v2 contracts

The [canonical domain and channel model](./api-domain-and-channel-model.md)
governs the current hard cutover and horizontal-foundation phase. Legacy
declaration compilation and mixed transports described below are current debt
and historical evidence, not accepted architecture. The composition gate must
remain red until the native `/api/v1` target is actually implemented.

Sanctuary API and core target Hono 5.0.0-rc.1 and oRPC 2.0.0-beta.46.
Installed declarations and upstream migration guides govern version-sensitive APIs.

## Ownership and execution

CODEOWNERS assigns the API and core packages to `@NeevSK`.
Hono owns HTTP dispatch and identity bridging. oRPC owns procedure dispatch,
validation, serialization, and the middleware execution mechanism.

`apiErrorMiddleware` translates application and ORM policy exceptions into
`ORPCError`, preserves explicitly typed errors, sanitizes unexpected failures,
and records safe diagnostics. It grants no authority.

`cedarAuthorizationMiddleware` composes that error boundary around the existing
Cedar action/resource checks. Each protected procedure must evaluate its own
action and resource. Grading applies it at router level through
`authorizeRouterWithCedar`; other protected procedures attach it at the leaf.
Do not attach the same authorization gate at both levels.

Bootstrap handlers attach the error boundary and retain their explicit eligibility
checks. This migration does not establish that every bootstrap rule is represented
in Cedar, nor that entitlement and rollout flags are enforced by the Cedar middleware.

oRPC v2 executes every middleware registration. Request-local identity results may
be reused, but a general `authorized` flag must never skip a different operation's
authorization. Request deduplication and persistent command idempotency are separate.

## Transport and compatibility

Use canonical v2 plugin names. The shared `getAPIErrorStatus` reads the SDK's
`ResponseError` (including an oRPC error's response cause), then protocol codes
and `COMMON_ERROR_STATUS_MAP`, and retains support for existing non-oRPC HTTP errors.
Do not patch SDK prototypes, response decoders, or internal contract properties.
Contract characterization inspects the installed v2 schema arrays.

The shared client retains explicit cached GET requests. `isAllowedRPCMethod`
allows GET only for procedures whose OpenAPI metadata declares GET; the handler
also applies `GetMethodCsrfProtectionHandlerPlugin`. Ordinary calls use POST.
OpenAPI exposure remains restricted to declared read operations.
Zod contracts parse JSON at Hono boundaries where used by shared handlers.

## Behavior preservation audit

| Required behavior | Supported mechanism | Regression evidence |
| --- | --- | --- |
| Gateway 429 and 5xx retry | SDK `ResponseError` and `isRetryableError`, bounded by the existing retry count | `orpcClient.errors.test.ts` exercises the real decoder and retry plugin |
| Offline and cancellation handling | Local offline marker and abort classification suppress transport retry | `errorPolicy.test.ts`, offline response test |
| HTTP classification in existing API adapters and sync | `getAPIErrorStatus` reads SDK response information without patching prototypes | custom-code HTTP conflict and retry policy tests |
| Cached reads without GET mutations | Per-procedure `allowMethods` and SDK CSRF plugin | `rpc-method-policy.test.ts`, same-origin and cross-site client tests |
| Stable command identity across retries | Client interceptor captures an operation key outside link retries; SDK headers attach it to subrequests | retry-key and write batching tests |
| Distinct commands and cached-read deduplication | Separate operation keys, SDK batching/dedupe groups preserve cache context | concurrent read/write transport tests |
| Account isolation | Account revision partitions batch/dedupe; owning account is checked before dispatch and after response | `accountBoundTransport.test.ts` |
| Cedar and error mapping | Existing per-resource checks composed with `apiErrorMiddleware` | Cedar allow/deny and domain-error wire tests |

The previous refactor's retry predicate rejected SDK response errors, and its
global GET allowance did not restrict mutations to their declared methods. These
were corrected using the installed SDK's supported extension points. The previous
fixed cache groups also dropped some caller cache settings when requests merged;
groups now preserve the first compatible caller context.

A stable client key alone does not establish server idempotency: each mutation
still needs an implementation that honors its receipt/key contract. This audit
does not supply real-database proof for every mutation. Account revision is not
a replacement for server authorization or per-workspace scope validation.
Bootstrap Cedar coverage, completeness of entitlement declarations, and flag
enforcement remain separate open audits; middleware renaming supplies none of them.

## Production API foundation

The PJC journey `journey:api.execute` tracks infrastructure independently of
teacher/principal application parity. Its test bindings are implemented, not
production-verified evidence.

HTTP admission permits the oRPC batch header and MCP protocol headers through
Hono CORS. RPC and both OpenAPI handlers use `createAPIHandlerPlugins`: a 5 MiB
body limit, signal synchronization, a 10-second cooperative handler deadline
(45 seconds for bulk sync), and a 120-second streaming budget. Hono uses the same
request timeout selection. SDK deadlines abort signals; they do not roll back
already committed transactions or forcibly interrupt drivers that ignore signals.

The shared client has the SDK timeout plugin, so supplying a caller cancellation
signal no longer suppresses its deadline. A timeout leaves an uncertain mutation
outcome that must be reconciled through its command receipt.

MCP's `/tools` and `/call` compatibility endpoints now dispatch through the real
SDK transport. Each request receives a fresh MCP server registered with its own
server-resolved oRPC context. `/` serves MCP through the SDK handler. This door
is stateless and consumes each exchange before closing it; it does not promise
resumable MCP sessions or unbounded interactive streaming. Unknown tool calls
retain the existing 404 response. Tool annotations are descriptions, not authority.

oRPC now consumes declared entitlement metadata after Cedar approval using the
same server entitlement resolver as Hono. Grant modules are combined with plan
modules rather than replaced by them. A resolver/storage failure must never grant
access. Contracts still need to declare their actual required entitlement; this
does not infer a paid boundary for every procedure.

AI institutional key selection requires an active, time-valid school bond.
Cancellation of the chat output reaches the provider signal, as does request
disconnect; cancelled requests cannot initiate provider failover. Provider usage,
school grant validity, retention, and financial reconciliation need real-system
verification beyond mock tests.

Production rate limits select the existing shared Postgres store automatically.
Deployments must provision `api_rate_limit_buckets`; the in-memory store remains
for development and tests. Middleware callers that omit a store use the same
configuration resolver. Unknown selectors and a production `memory` selector
throw rather than falling back. These checks do not prove deployed proxy trust.

Both server entrypoints call `assertAPIReadiness` before starting retention
maintenance or listening. `/health/ready` calls the same checker. It verifies
columns used by canonical identity, bonds, operation receipts, entitlements and
pricing, plus rate-limit storage whenever the resolved configuration uses
Postgres. Checks use the supplied database connection. Missing configuration,
unreachable storage, missing shared schema and missing rate-limit schema are
distinct failures; HTTP feedback and logs exclude driver exception messages.
This does not validate every domain schema, write permission or external provider.

Guardian, classroom and grade-class relationship failures now reject context
construction with `SERVICE_UNAVAILABLE`. A successful empty query still means
no matching relationships. Keeping only part of a principal after a failed lookup
is no longer supported. Boundary tests cover this intentional breaking change.

The Hono error normalizer also recognizes oRPC v2 codes for failures raised before
procedure dispatch; it no longer needs the removed oRPC error instance `status`
property. A context outage retains HTTP 503. Driver exception messages and cause
chains do not appear in public problem documents or fatal startup output.

Durable-agent administrator access also requires an active bond within its
validity interval. Existing requester and assigned-teacher access remain separate
relationships; these predicates do not establish worker delegation authority.

The real-database harness is `test:g2:api-database`, using
`vitest.api-database.config.ts` without global database mocks. It requires
`API_DATABASE_PROOF=acknowledged` and an injected `DATABASE_URL`. Receipt fixtures
run inside a rolled-back transaction against a pre-existing account. The bucket
fixture uses a unique key with exact-key cleanup and disables unrelated pruning
through its injected clock. It performs no schema reset or migration.

On 2026-10-29 the expanded harness completed 3/3 scenarios on PostgreSQL 17.6 through
Doppler `gurudevi-mobile:dev`. At the user's request, `prd` was assigned the same
database URL and equality was checked without printing credentials. These
environments currently share data. G2 proves receipt replay, payload conflict,
principal rejection, shared bucket increments and read-only resolution of the
required shared schema under this harness. The run is recorded in
`reports/run-apps_sanctuary-api-api_database_readiness_pg-report.txt`. It does
not prove cross-process contention, Cedar/RLS coverage, HTTP deployment,
provider billing, or R1 production assurance.

Release evidence remains outstanding for real-Postgres policy/receipt scenarios,
per-procedure flag coverage, resumable agent sessions, worker identity/delegation,
browser cross-origin execution, deployment limits, and a production canary.
An isolated policy-test database remains unavailable. The existing `test:policy-pg`
suite resets `public` and must not be run against this shared database. The narrow
receipt/bucket harness does not replace that policy suite.

## Verification

The configured API typecheck currently disables `strict`, `noImplicitAny` and
`strictNullChecks`. A full override audit on 2026-10-29 reported 637 diagnostics
across API tests, production code and imported packages, recorded in
`reports/api-strict-baseline-20261029.txt`. A clean configured typecheck therefore
does not establish strict type safety. Restoring the repository strictness floor
requires resolving those diagnostics rather than suppressing them.

The repository-wide anti-slop command currently fails in `aislop ci --changes`
with 49 errors across the dirty workspace. Remaining chained checks therefore
cannot be claimed complete. The core typecheck also currently reports 12 enum
mismatches in the independently changed AI assistant FlowDAG. The configured API
typecheck and API bundle succeed; the bundler still warns about `ES2026`.

The rn-terrain CLI gate was invoked against Hono and actual readiness source,
but its Hermes parser rejected server TypeScript syntax. Its zero exit status
does not establish successful AST verification for this server change.

The full G1 API run before the rewards correction completed 1,060 assertions
with six existing skips. Earlier MCP deadline failures did not recur in that
run. The full run after the correction recorded 1,075 passing assertions,
six existing skips and the same two MCP catalog deadline failures under parallel
load. After the MCP schema-conversion correction, the 2026-10-30 full G1 run
completed 1,081 assertions with six existing skips and no failures. No timeout
or assertion was relaxed. Sustained production load remains unverified.
The core API/error G1 suite
completed 299/299 assertions with external systems substituted.

The installed oRPC beta.46 registrar caches router discovery, but converts
output schemas again when registering each request's MCP server. This caused
repeated schema work even for unknown-tool lookup. The door now supplies a
converter through the SDK's public extension: it delegates to the installed
`StandardJsonSchemaConverter` and caches the result by schema identity and
input/output direction for that router's lifetime. It never caches caller
context, authorization decisions or tool results. New request servers still
receive their own context and close on registration, connection or exchange
failure. Schema contracts must remain immutable for the door's lifetime.

The regression test failed before the correction because two subsequent calls
repeated output conversions; it now verifies reuse, separate input/output
default semantics, caller isolation and cleanup failures. G1 uses real SDK
dispatch with substituted domain procedures and identity. The full API host
run includes the existing real-router catalog and unknown-tool deadlines.
See `reports/run-apps_sanctuary-api-mcp_final_20261030.log` and the
[oRPC MCP converter and context guidance](https://orpc.dev/docs/integrations/mcp).
The fresh strict compiler audit still reports 637 diagnostics; the configured
typecheck does not establish strict safety.

The optional WebSocket door now uses the Hono runtime adapter and oRPC SDK
handler. Disabled requests return 501; enabled ordinary HTTP requests return
426. Upgrades require authenticated identity and an allowed supplied Origin.
Each operation reloads authority and applies the shared rate limit before
procedure execution. Frames are bounded to 5 MiB and connections expire after
15 minutes. Node shutdown drains upgraded sockets. G2 Node socket scenarios
exercise real transport with identity, Cedar decisions and database substituted;
they do not prove deployed authorization. Bun compiled-entry liveness is proven,
but actual Bun socket behavior remains unverified. Browser WebSocket login or
ticket negotiation is not implemented; bearer tokens must not be put in URLs.

Compiled Node and Bun entrypoint liveness completed 2/2 G2 assertions without a
database or identity issuer. The Node build bundles workspace TypeScript and
provides the Node `createRequire` bridge for bundled CommonJS dependencies.
Cedar assets resolve from the owning policy package; initialization failure
rejects startup rather than silently leaving a deny-all evaluator.

Retention failures propagate, mark readiness unavailable, and retry after one
minute; recovery clears the failure state. Retention proof uses substituted
database and clock, and has not executed destructive cleanup against the shared
database. Databricks SQL execution remains unsupported and returns explicit 503
instead of a successful empty result.

AdMob callbacks verify the original signed bytes, reject duplicate or unsigned
reward parameters, and require a positive integer reward. Verification-key
fetches have a five-second deadline, validated responses and a 24-hour cache;
expired keys are not reused after refresh failure. A verified callback runs the
account lock, replay/quota checks, receipt creation and balance increment in one
ORM transaction. Storage failure returns 503 so it is not acknowledged as a
persisted grant. Balance reads use the existing policy client and rolling receipt
count; an outage is not a zero balance. G1 rewards/readiness/retention assertions
completed 43/43 with database and policy behavior substituted and real ECDSA.

Real database discovery found both reward tables absent. Migration
`20261029220000_verified_ad_reward_storage.sql` in the existing mobile Supabase
migration directory creates them with explicit grants and owner-read RLS,
and denies authenticated/anonymous direct writes. The additive migration was
dry-run inside a rolled-back transaction, then applied to the user-authorized
shared dev/production database with its migration-history entry. Readiness now
requires its columns. Owner create/update policies were removed from the ORM
reward models and the generated schema was rebuilt.

G2 PostgreSQL scenarios completed 5/5: three existing admission/receipt/bucket
scenarios, a real ORM policy denial of owner self-minting, and a signed callback
that observes receipt and balance changes together before forcing rollback and
verifying neither change remained committed. The callback proof substitutes the
provider key and intercepts transaction completion to force rollback; it does not
prove successful provider delivery, committed replay, contention, or complete
RLS isolation. Evidence is in `reports/run-apps_sanctuary-api-reward_policy_pg_final.log`.
Configured API typecheck and compiled Node/Bun liveness (2/2 G2) also succeeded
after regeneration. Repository `check:anti-slop` still fails with 46 errors in
the dirty workspace; it is not waived by these scoped checks. Existing
partial receipts created before this correction require separate reconciliation.
See [Google's SSV protocol](https://developers.google.com/admob/android/ssv).

## Native protocol verification and remaining contract debt

The test client now uses the installed SDK without mutating `ORPCError` or
`MalformedResponseError` prototypes. The earlier helper added the retired
`status` field to SDK instances and serialized errors, then rewrote malformed
response errors to resemble expected application errors. Historical runs made
under that helper do not establish native v2 wire compatibility. The replacement
full G1 run recorded 1,105 passing assertions and six existing skips in
`reports/run-apps_sanctuary-api-native_v2_stable_20261030.log`, with identity,
database and other external services substituted.

Native procedure assertions use error codes. Actual HTTP responses and local
adapter errors retain their own status assertions. The native client attaches
transport `ResponseError` metadata under `cause`; checking that metadata is
different from exposing a server exception. Sync rejection checks retain the
private payload/key non-disclosure assertions and reject a nested server cause,
while allowing the SDK's transport cause.

Hono admission failures targeting declared RPC procedures are serialized through
the installed `RPCSerializer` and existing safe error mapper. This includes the
default batch URL's `__batch__` suffix. Ordinary HTTP and unknown paths retain
their existing problem JSON responses. The batch regression uses the real SDK
batch plugin and two operations in one HTTP request, with identity lookup
failure substituted. Custom batch URLs and lazy-router admission are unverified.

Ordinary rewards handlers propagate storage failures instead of interpreting
`AbortError` or `Lock broken` text as successful null/empty results. Stored
historical snapshots are parsed through their declared schema. Legitimately
absent rows retain their existing empty outcomes. These checks do not establish
atomicity or idempotency for ordinary points, badge or achievement mutations;
their concurrent-write behavior remains open work.

After the malformed-contract checks were added, the full G1 suite recorded
1,119 passing assertions and six existing skips in
`reports/run-apps_sanctuary-api-contract_composition_20261030.log`. This includes
31 converter assertions. The subsequent compiled entrypoint check exposed a
new worktree todos handler using nonexistent `o.procedure.input`; replacing the
four calls with the installed builder's `o.input` chain restored Node and Bun
liveness (G2, 2/2) in
`reports/run-apps_sanctuary-api-contract_entrypoints_fixed_20261030.log`.
The preceding failing report is retained. This liveness proof does not establish
todos CRUD, Cedar coverage or database correctness. The newly added handler's
authority and persistence seams still require their own review.

The contract converter rejects primitive, null, function and array members during
composition instead of guessing an empty procedure. Shared root contracts retain
their inferred keys rather than a broad `Record<string, any>` annotation, and
client request channels use Zod input types so schema defaults remain server
responsibility. The server converter and implement wrapper still erase types,
and client index-signature fallbacks remain. Replacing those requires migrating
the actual domain contracts and consumers, not hiding errors with casts.

The configured API compiler still disables strict checking. The latest strict
audit records 624 diagnostics in
`reports/api-strict-native-onboarding-20261030.txt`; configured compilation success does
not resolve them. These are prerelease Hono and oRPC versions, and no deployed
canary or comprehensive real-database authority proof is claimed.

## Native privacy contract migration

Privacy now uses `oc` contracts in core, native SDK `implement` on the server,
and `RouterContractClient` for its client types. The existing framework-neutral
privacy route file supplies all input and output schemas; its schema/type exports
remain available from both previous module paths. Shared policy and entitlement
metadata plugins live in `@repo/core/api/orpcMetadata`; the server keeps its
existing re-exports. Other domains still use the untyped converter. Core declares
`@orpc/openapi` at the existing 2.0.0-beta.46 cohort version for native route metadata.

The new success-path assertions exposed a real prior defect: Cedar declared the
privacy entity but omitted it from the action's `appliesTo` list, while the API
projected an invalid `school_id` attribute. The corrected projection derives
privacy ownership exclusively from the authenticated account, and the policy
permits only owner reads and appends. An explicit forbid prevents generic admin
permission from granting cross-owner access or update/delete operations. Policy
tests exercise the installed WASM with synthetic member, teacher, principal and
admin attributes; they do not establish live identity or database isolation.

The storage-authority audit previously mapped privacy to `UserPreferences`, which
does not back this handler. It now checks the explicit privacy SQL migration and
its table/RLS declarations. This replaces a misleading model-presence assertion
with source checks against the real storage authority; it is not a live RLS test.

The handler parses unknown database rows instead of coercing values through
`any`. Nullable metadata retains the existing empty-object result; other malformed
rows reject safely. Timestamp normalization, trimmed inputs, owner parameters,
legitimate empty ledgers and failed insert acknowledgement have boundary checks.
The native contract explicitly declares creation status 201 when served through
an OpenAPI handler; the old converter silently used the SDK default 200. The
existing compatibility mount remains read-only, and RPC success encoding is
unchanged. The native contract/client checks cover schema identity and compiler
input/output inference, not every application domain.

Privacy verification uses the real installed SDK and Cedar WASM, with identity
and database substituted. The full API run recorded 1,125 passing assertions and
six existing skips (`reports/run-apps_sanctuary-api-native_privacy_20261030.log`).
The final focused API run recorded 42 assertions, including the compatibility
read route; core contract/client checks recorded 21 and policy checks recorded
24. Built Node/Bun liveness remained 2/2 G2. These results do not prove deployed
authorization, live privacy-table RLS, committed writes or contention.
The latest repository anti-slop run remains red with 47 errors across the shared
dirty worktree (`reports/api-native-privacy-antislop-20261030.log`). Scoped checks
do not waive that gate or the remaining strict/compiler and domain migration work.

## Daily-content migration and tagged SQL findings

Daily content now uses native `oc`, SDK `implement` and `RouterContractClient`
in both existing client namespaces (`dailyContent` and `library.dailyContent`).
The framework-neutral contract remains the canonical schema source and retains
its export. Parameter envelopes, Cedar middleware and both route namespaces are
preserved. Date inputs and DTO dates use ISO calendar validation, timestamps use
ISO datetime validation, and recent lookbacks accept integer values from 1 to
366. The lookback cap is an operational request budget, not an educational or
domain rule; older individual-date queries remain available. Result pagination
and a comprehensive query-cost budget remain open work.

Unknown database results are parsed instead of being replaced with an empty
array. Unknown content types, null content, invalid dates/timestamps and string
booleans no longer become fabricated valid content. A genuine empty array keeps
the existing absent-content outcome. PostgreSQL driver `Date` values normalize
to ISO strings, and nullable authors remain absent. Storage failures propagate
through the existing safe native error boundary.

The seven SQL-construction findings reviewed in daily content, media and
onboarding target tagged `$queryRaw` calls, not concatenated SQL strings. The
installed ZenStack 3.9.8 implementation passes template segments and separate
values to Kysely's SQL tag. The daily-content boundary check also inspects those
separate arguments. This is source/boundary evidence for the named calls, not
a live database injection assessment. Media and onboarding transaction and
locking paths remain intact; no scanner rule, suppression or quality gate was
weakened. The scanner still needs to distinguish parameterized tags from actual
SQL-string interpolation before its findings can be treated as verified defects.

The full daily-content migration regression recorded 1,147 passing G1 API
assertions and six existing skips in
`reports/run-apps_sanctuary-api-native_daily_content_20261030.log`; identity and
database are substituted. Core native-contract/client checks recorded 20 G1
assertions. Compiled Node/Bun liveness remained 2/2 G2. These results do not
establish real database parameter handling, RLS, all-role authorization,
deployment behavior or query-cost limits.
The final repository gate remains red with 47 errors in
`reports/api-native-daily-content-antislop-20261030.log`; the reviewed tagged SQL
findings remain reported, and unrelated findings are not waived.

## Eager contract composition

The remaining legacy route declarations are compiled into native SDK contract
objects before implementation. The application's converter no longer uses a
proxy, special-cases SDK control-property probes, rebuilds a procedure on every
property read, or casts route/schema/builder values through `any`. Its input is
`unknown`, its output is the SDK's `RouterContract` tree, and implementer config
uses the installed `ProcedureConfig` type. One legacy handler-facing `any`
remains in the implement wrapper; this runtime compiler does not restore exact
domain handler inference. Native domain migrations remain necessary.

Composition validates method/path, policy metadata, request-channel schemas,
response schemas/status keys and v2 error definitions before returning a router.
A missing response schema now fails even on an unused route. Unsupported request
channels and obsolete error-definition fields reject instead of being ignored.
The shared schema vocabulary still declares `add_on` entitlement scope, but the
procedure metadata/enforcement path does not implement it; this compiler rejects
that declaration explicitly. No active route uses it. Native SDK contracts retain
their existing direct path, with authority still enforced by their middleware.

Schemas retain their original object identity and validation behavior. Compiled
procedures have stable identity, and replacing a source route after composition
does not rewrite an already composed procedure. Recomposition validates the new
source again. Schema objects are not deep-frozen. Router construction uses own
data properties, including a `__proto__` key, without changing its prototype.

OpenAPI metadata now preserves summary, success description and the first
declared numeric 2xx status instead of always falling back to 200. Real SDK
handler checks exercise 201, 202 and bodyless 204. Multiple-success declarations
retain a union of their schemas and use the first numeric success status;
dynamic status selection per output variant is not implemented. RPC transport
encoding remains SDK-owned.

The source-mutation regression was changed to assert stable compiled procedures
and rejection on recomposition. Its former late-property-read expectation tested
the removed application proxy. Existing input/output, private-error, refinement,
nullable/multiple-success and SDK transport assertions remain, with public SDK
lookup plus runtime Zod narrowing replacing unchecked metadata access.

The full eager-composition regression recorded 1,162 passing G1 API assertions
and six existing skips in
`reports/run-apps_sanctuary-api-eager_contracts_20261030.log`. It includes 46
converter assertions; application identity/database boundaries remain substituted.
Compiled Node/Bun liveness remained 2/2 G2. The repository anti-slop run remains
red with 46 errors across the shared worktree in
`reports/api-eager-contracts-antislop-20261030.log`. No deployment, real-database
authorization or complete handler-typing claim follows from these checks.
PJC records this setup boundary separately as `journey:api.compose`, sharing the
existing compiler requirement and implementation bindings.

## Native onboarding contracts and recovery classification

Onboarding now uses native SDK contracts, `implement` and `RouterContractClient`.
The framework-neutral onboarding module owns the shared schemas and includes the
already active `completeProfile` route. Its former initial-bond response only
described `success`; it now matches the authoritative scope-bootstrap response
already required by the running API. The consent field remains server-defaulted
to false, and client input types do not require callers to supply that default.
Contract-shape tests now inspect the canonical schemas and native metadata rather
than reading `.request` on SDK procedure objects.

Explicit ORM selects retain the fields consumed by eligibility checks and bond
persistence. This resolves result-type errors exposed by native handler inference
without weakening those checks or adding casts. Existing authenticated-account
derivation, profile completion, selected-scope checks, privileged-role rejection,
initial provisioning lock, transaction boundaries and completion receipts remain.
Bootstrap continues to use explicit eligibility checks and shared error handling;
this migration does not claim universal Cedar coverage or resolve founder/revoke
concurrency concerns. Several existing transaction callbacks still use `any`.

The Effect command client previously inspected only `error.status`. Four new
regressions reproduced missing recovery classification for native v2 errors.
It now uses the existing `getAPIErrorStatus` helper, preserving SDK code mappings
and actual HTTP status from `ResponseError` causes. The application's typed
`OnboardingCommandError.status` remains available to existing recovery copy;
SDK prototypes and wire errors remain untouched. Both commands use canonical
input/output schemas. Invalid completion keys and caller-selected identities
reject before dispatch, while captured-session context and retry suppression
remain preserved.

Configured API/core compilation succeeds. The fresh strict audit still reports
624 diagnostics in `reports/api-strict-native-onboarding-20261030.txt`; strict
configuration has not been restored. Core boundary checks recorded 22 assertions
with transport substituted, including the recovery regression and shared-contract
type checks. Compiled Node/Bun liveness remains 2/2 G2. Neither proves real
database rollback, committed idempotency, contention or browser recovery rendering.
The full API G1 run recorded 1,167 successful assertions and six existing skips
in `reports/run-apps_sanctuary-api-native_onboarding_20261030.log`, using substituted
identity/database services. The new bootstrap rejection cases cover anonymous
requests, caller-selected admin/developer/founder capacity and safe storage failure.
The repository anti-slop command remains red with 46 errors across the shared
dirty worktree in `reports/api-native-onboarding-antislop-20261030.log`.

## Contract inventory and agent supervision

The existing `audit:api-contracts` command now recognizes native SDK contracts as
well as legacy route declarations. Its version 2 JSON reports 277 declared
procedures across 44 manually registered sources in the current worktree, with
17 warnings. This count is not the number of proven runtime endpoints. The
registry now includes events, editorial, channel, media, planBridge and workspace
provisioning, and uses native contracts for privacy, daily content and onboarding.
The stale social notification-hook reference now points to `useScopedNotifications`.

Native metadata inspection stops at SDK procedure leaves, preserves stacked
schemas, retains distinct shared-router paths and rejects cyclic routers.
Default HTTP paths follow the installed SDK's per-segment encoding and OpenAPI
prefix behavior. Procedure labels are dotted strings, so unusual keys containing
dots can make those labels ambiguous; the inspected HTTP path retains its encoded
segments. Native schema counts measure SDK stack entries; legacy counts measure
request channels and successful-response entries. Do not compare those as equal
coverage denominators.

The old audit checked OpenAPI paths against native RPC wildcard namespaces and
reported missing runtime mounts. It now checks a separately named candidate RPC
path derived from the registered namespace. Missing explicit wildcards produce
`EXPLICIT_RPC_MOUNT_UNLISTED` warnings because the existing `/api/*` fallback may
dispatch those paths. The warning retains the discrepancy without asserting a
runtime failure. Router membership, middleware execution, ownership, persistence,
client typing and scenario evidence remain unverified in this report. Lexical
client observations are domain-wide, not proof that each procedure has a caller.
Todos, canonical v1 and canonical-domain aliases are explicit coverage gaps.

Use read-only JSON when inspecting a dirty workspace:

```powershell
pnpm audit:api-contracts --stdout
pnpm audit:api-contracts --output reports/api-contract-review.json
node node_modules/typescript/bin/tsc -p scripts/tsconfig.api-audit.json
node --test scripts/tests/audit-api-contracts.test.mjs
```

`--stdout` emits only JSON to stdout and diagnostics to stderr. `--output` selects
a report path; the original default remains available. A differing modified,
untracked, ignored or symbolic-link report is not overwritten; an identical report
can be read repeatedly without rewriting. Differing clean tracked reports may be
regenerated. New explicit output paths may be outside the repository; no path
confinement guarantee is claimed. Unknown options, conflicting output modes and
empty output paths fail. Existing default inventory content was left untouched.

G1 inspection fixtures recorded 5 assertions; the combined contract fixture run
recorded 14. G1 Node CLI scenarios recorded 3 assertions against the actual local
registry, including deterministic JSON and modified/ignored-report preservation.
Strict audit-tool compilation and configured core compilation succeed. These
checks do not execute application procedures or establish production coverage.
Evidence is in `reports/run-packages_core-contract_inventory_20261030.log` and
`reports/run-api_contract_inventory_cli_20261030.log`.

For this bounded work Terra owned the shared inspector and its tests; Luna
reviewed source coverage and audit claims without editing. Both agents were
reused for follow-ups. The parent integrated the CLI, reviewed their source and
raw diffs, corrected report protections and ran final checks. Delegation and
catalog records support review; neither guarantees agent compliance or runtime
correctness.
The repository anti-slop run remains red with 46 errors across the shared dirty
worktree (`reports/api-contract-inventory-antislop-20261030.log`); this tooling
change does not waive application migration or release gates.

Run API boundary tests, core client/error and retry tests, and package typechecks.
Inspect the raw diff and run the repository quality gates. Boundary tests substitute
storage and authentication dependencies; they do not establish real database,
browser, device, or production behavior. Existing skips never count as evidence.

Sources: [oRPC migration](https://orpc.dev/docs/migrations/from-v1),
[middleware deduplication](https://orpc.dev/docs/recipes/dedupe-middleware),
[Hono migration](https://hono.dev/docs/guides/migrating-to-v5).
