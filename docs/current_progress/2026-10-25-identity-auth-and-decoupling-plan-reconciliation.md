---
title: "Identity, Auth and Database Decoupling: Plan Reconciliation"
status: "active"
created: 2026-10-25
updated: 2026-10-26
author: "Naveen"
scribe: "Codex"
tags: [identity, auth, uuidv8, decoupling, plans, verification]
---

# Identity, Auth and Database Decoupling: Plan Reconciliation

## Active implementation goal

The user authorized full end-to-end implementation on 2026-10-25. The goal
is active; this programme is not complete. The source findings below describe
the audit baseline. Completed implementation checkpoints supersede the named
baseline findings without closing unrelated gates.

Vitest counts in this ledger are test cases, including historical rows labelled
“assertions”; individual `expect()` calls were not counted. pgTAP counts are SQL
assertions. Evidence scope/substitutions remain as stated for each run.

The user selected the linked hosted development acceptance targets:
Supabase project `qzoawolfkuwiuyaoiybz` and PowerSync Development instance
`69f985158d064eb85ee933e0`. Inspect their actual configuration/migration state
before mutation; keep changes scoped to these named targets and obtain no
credentials through committed configuration.

The initial hosted read-only preflight reported 197 matching migrations, eight
local-only migrations (`20261024010000`, `20261024183000`, `20261024200000`,
`20261024201000`, `20261024202000`, `20261024203000`, `20261025010000`,
`20261025011000`), and zero remote-only entries. The full metadata ledger is
`reports/auth-owned-hosted-migration-ledger.json`. PowerSync Cloud inventory
confirms Development has configuration but is unprovisioned. Production is a
separate instance and is outside the selected acceptance scope. No hosted
mutation occurred in that initial checkpoint. Checkpoint 7 below supersedes
this preflight with the applied development cutover and real provider ceremony.

Fresh hosted count-only queries report 281 accounts, 324 credential bindings,
zero orphan bindings, zero assigned side-IDs and zero deleted accounts. The
`powersync` publication exists and is not `FOR ALL TABLES`. These are current
preflight observations; capture publication membership and target schema
requirements before provisioning. The CLI returns only the last result for
a multi-statement query, so count and publication observations were fetched
separately. Use installed `supabase db query --linked` for bounded SQL; it
uses the existing authenticated CLI path without exposing a database password.

### Checkpoint 1 — repository composition and verification-key caching

- `createDomainServices` now requires a typed `DomainRepositories` map and
  imports no vendor repository factories. `clientDomainServices.ts` constructs
  the existing nine Supabase repositories in the adapter, preserving its
  existing educational side effects. The removed `IDataQueryClient`/`any`
  facade has no remaining source consumers. Domain writes still need their
  separate server-authority migration.
- Sanctuary JWKS caches are scoped to the configured key endpoint; verified
  tokens are scoped to issuer, audience, key source/static key and runtime
  configuration. JWKS TTL is ten minutes, matching installed auth-js 2.117.2's
  `JWKS_TTL`. Unknown keys can trigger discovery after a thirty-second cooldown;
  parallel fetches coalesce. Refreshed key sets replace removed keys; verified
  entries expire no later than their key set and cannot be repopulated by an
  older in-flight verification after refresh. Expired keys deny during outage.
  A malformed explicit static key fails rather than falling back to another
  key source. Test-key injection is restricted to the test runtime.
- This is signing-key validation, not live session revocation or sensitive
  action step-up. Supabase's edge may additionally cache JWKS; no instant
  universal revocation claim is made. Sources checked: [signing keys](https://supabase.com/docs/guides/auth/signing-keys),
  [JWT cache guidance](https://supabase.com/docs/guides/auth/jwts), and installed
  `@supabase/auth-js@2.117.2/src/lib/constants.ts` / `GoTrueClient.ts`.
- Initial G1 / Vitest: five existing domain-service suites completed 23
  assertions; three focused API JWT/account suites completed 35 assertions,
  including seven new authority-cache scenarios. Synthetic RSA keys and mocked
  HTTP/JWKS boundaries do not prove a real provider, session or deployment.
  The subsequent full G1 API Vitest run completed 114 files / 772 assertions,
  with one file / six assertions retaining their existing skips. G0 Core,
  Sanctuary and web TypeScript checks succeeded. CNG succeeded; device-evidence
  attestation checks only the existing fixture and is not new device proof.
  Anti-slop/native-slop remain red on 48 existing native findings;
  version-drift reports existing deprecated symbols and test-evidence reports
  the two unlevelled verger scripts. No gate was weakened. Scoped raw diffs
  and whitespace were reviewed. Runtime logs are `reports/auth-owned-*.log`.

### Checkpoint 2 — server-owned profile and onboarding commands

- Both profile update contracts now use one strict editable-field schema.
  Account identity, credential email, lifecycle, membership, pricing, arbitrary
  metadata and recovery fields are rejected rather than stripped. Both server
  handlers explicitly enforce the authenticated account. Profile update output
  selects public/profile fields instead of returning recovery-key columns.
- `SupabaseIdentityAdapter` now sends profile, initial-bond, profile-completion
  and onboarding-completion mutations through Sanctuary with account-bound
  request context and no automatic retry. The Supabase and ZenStack profile
  repositories also route profile mutations through that API. No server
  database client was added to browser/native composition. Remaining direct
  reads and unrelated preference/social operations were not silently removed.
- Profile completion is an actor-derived native RPC bootstrap command,
  `onboarding.completeProfile`. It marks profile details complete without
  granting onboarding/lifecycle completion. OpenAPI compatibility remains
  read-only. The original identity port's camel-case profile-details input is
  now typed and validated before transport.
- Password-based anonymous conversion verifies subject continuity, checks the
  existing binding, and uses the initial-bond/onboarding commands to preserve
  the selected capacity. It no longer writes lifecycle flags or citizenship
  from the client. Provider responses that remain anonymous report
  `AUTH_CONFIRMATION_REQUIRED` before domain completion; provider metadata
  contains only the display name, not claimed account authority.
- Migration `20261025012000_profile_and_onboarding_contract_convergence.sql`
  adds the missing `users.capacity_label` and
  `user_preferences.notification_settings` columns. It removes the obsolete
  `fn_sync_user_role_from_facets` function and its teacher/student/principal
  triggers, which still wrote the removed `users.role` column. Facet creation
  remains; bonds are the authority. This retirement uses the user's approved
  pre-production break/fix policy and was described before execution.
- The real flow exposed ORM-generated `valid_from` values later than the
  transaction timestamp used by the active-bond preference guard. New initial
  bonds now receive the command's captured timestamp; the guard is preserved.
  The new migration was applied only to isolated `edlove_uuid8_editorial_test`.
  No hosted mutation occurred. There are now nine pending local migrations
  relative to the recorded hosted preflight, including this new convergence.

Evidence for checkpoint 2:

| Tier / engine | Result | Limits |
| --- | --- | --- |
| G1 / API Vitest | Full suite: 115 files / 802 assertions succeeded; one file / six assertions retain existing skips. Final focused onboarding/profile rerun: four files / 48 assertions succeeded after the real-seam fixes, including unauthenticated completion denial. | Database and provider boundaries substituted in the ordinary API suite. Full suite capture predates the final timestamp/output-selection adjustment and the extra unauthenticated assertion; focused checks and G2 cover the final changes. |
| G1 / Core Vitest | Six auth/identity/onboarding/guest suites: 52 assertions succeeded; dual profile-repository transport suite: eight assertions succeeded. | Network, auth, storage and database boundaries substituted. Negative tests cover unauthorized fields, subject/account changes, pending verification, wrong-account acknowledgment and 503 without direct-write fallback. |
| G2 / real PostgreSQL + production-mode Hono/RPC | Seven scenarios succeeded, including profile completion and initial scope → profile → onboarding → profile mutation. | Real isolated DB and actual router; synthetic RSA issuer and in-process HTTP. Does not prove hosted Auth sessions, actual browser/device transport or live sync. Fixtures restore affected profile/scope state. |
| G0 / TypeScript and static checks | Core, Sanctuary and browser checks succeeded; migration grant and native seam checks succeeded. Scoped raw diffs, removed direct-write/fallback paths, the explicit trigger retirement and whitespace checks were reviewed. | Existing broader native quality/evidence-policy failures remain recorded in checkpoint 1. |
| G4 / Next.js 16.4.2 | Production build succeeded, including TypeScript and 88 generated pages. | No real authenticated browser/provider journey is implied. |

### Checkpoint 3 — account write grants and concurrent onboarding

- Initial onboarding locks the authenticated account row before looking up a
  personal workspace. Current bond validity is evaluated after waiting for the
  lock; new bond timestamps remain at or before transaction start for the
  existing preference guard. Deleted accounts are rejected after locking.
  Eight concurrent first-time commands now settle into one personal workspace,
  one personal bond, and its selected preference. Before the change, the real
  scenario produced failures/duplicate provisioning under concurrent requests.
- Migration `20261025013000_account_lifecycle_write_authority.sql` revokes
  table and column INSERT/UPDATE grants, plus table DELETE, from PUBLIC, anon
  and authenticated on `users`. It preserves server privileges and separately
  authorized SQL domain commands. A real transaction running as authenticated
  is denied with PostgreSQL `42501`; anon/authenticated privilege queries find
  no remaining table or column account-write access.
- The same migration restores `user_preferences.deleted_at`, already required
  by the account soft-delete trigger. The model/generated schema match it.
  A real rollback scenario verifies a present teacher facet and preference
  receive soft deletion atomically. The fresh concurrency fixture also verifies
  an existing signed credential binding cannot resolve its deleted account.
  Physical account deletion still conflicts with profile-history capture;
  no physical deletion/erasure acceptance is claimed. Fixtures use soft
  deletion and remove their synthetic binding, preserving local audit history.
- Retired both unconsumed `AppCryptoEngine` prototypes in native/security.
  Their mock KDF/plaintext-shaped wrapping and publicly derived escrow key
  are not encryption. Source search found no callers. Shared secure-storage
  and CryptoManager adapters remain. This removal uses the user's explicit
  pre-production break/fix authorization; it does not deliver recovery or a
  cloud key-vault feature. The database escrow column is not certified for use.
- School creation no longer writes an account's school projection or swallows
  that failure in a warning. Creating a school and establishing its authorized
  founder bond remain separate existing commands. Two boundary scenarios verify
  school insertion neither grants scope nor attempts a fallback account write.
- All changes/migration execution remain local. Ten migrations are now pending
  relative to the recorded hosted preflight. Existing authenticated SQL school
  commands retain their function grants: table revocation alone is not an
  assertion that every domain mutation has moved through Sanctuary. The SQL
  function inventory also found obsolete `assign_user_role`; audit/retire or
  replace it under the existing bond authority before hosted admission.

Evidence for checkpoint 3:

| Tier / engine | Result | Limits |
| --- | --- | --- |
| G2 / real PostgreSQL + actual Hono/RPC | Ten scenarios succeeded, including eight simultaneous first-time onboarding requests, deleted-account denial, database role/grant denial, and atomic soft deletion. | Local isolated database; synthetic signed issuer; in-process HTTP. No hosted Auth, browser, native device or live PowerSync proof. |
| G1 / API Vitest | Full suite: 115 files / 803 assertions succeeded; one file / six assertions retain existing skips. | Provider/database boundaries substituted. |
| G1 / Core Vitest | School authority and dual profile transport: two files / ten assertions succeeded. | HTTP/database boundaries substituted; school tests execute the installed Supabase SDK with synthetic HTTP responses. |
| G0 / TypeScript and migration checks | Core and Sanctuary TypeScript succeeded; focused Biome, migration-grant and whitespace checks succeeded. Raw deletions and scoped unified diff reviewed. | Broader anti-slop remains red on 48 native findings; version-drift on five existing `ZodTypeAny` usages; test-evidence on two unlevelled verger scripts. CNG succeeded; device attestation still checks only its existing fixture. |

### Checkpoint 4 — bounded UUID issuance and provenance

- Migration `20261025014000_account_issuer_operating_contract.sql` adds private,
  owner-controlled central provenance, defaulting to registered non-production
  origin `1`. The undeployed canonical cutover migration uses this same origin
  when rekeying development accounts. Existing assigned IDs remain immutable.
  Production admission explicitly requires origin `0`; no caller-supplied
  environment field or user-metadata override is accepted.
- The issuer samples wall time after its singleton lock, avoiding false drift
  warnings caused by contention. It retains the existing 30-second rollback
  threshold, bounds lock acquisition at five seconds, and emits stable drift
  and collision codes. It checks persisted collisions with five fresh entropy
  attempts; exhaustion raises `54000`. The actual Auth provisioning INSERT
  retries only a diagnosed `public.users.users_pkey` conflict, at most five
  times. Email uniqueness failures remain their original immediate failure.
- G2 / PostgreSQL 17.6 + pgTAP: 18 fault-injection assertions succeeded. They
  cover exact byte preservation, restricted provenance/clock writes, retry
  success, five-attempt exhaustion, no incorrect binding, unchanged colliding
  account, large rollback, production origin configuration, and no retry on
  email conflicts. Entropy and then the provisioning issuer are substituted
  only within the test transaction. Rollback restored the real function;
  a subsequent query confirmed no `pg_temp` hook and development origin `1`.
- G2 / real PostgreSQL + actual Hono/RPC: all 11 scenarios succeeded. The
  issuance sample now starts 100 concurrent requests through the installed
  database pool and checks canonical non-production IDs. Focused measured run:
  100 requests completed in 157ms; held-clock failure completed in 5030ms with
  `55P03`. These are local pooled observations, not hosted capacity or a claim
  of 100 simultaneous database connections. The focused run selected two
  scenarios; nine others were excluded by its name filter, not source skips.
- G1 / API Vitest: the existing TypeScript issuer suite completed six
  assertions under injected clocks/entropy; G0 Sanctuary TypeScript succeeded.
- Migration grant checks and focused Biome/whitespace checks succeeded. SQL
  and test diffs were inspected. No production TypeScript implementation or
  native dependency changed in this checkpoint. The preceding broad quality
  failures remain open. No hosted mutation occurred; eleven migrations are
  pending relative to the recorded hosted preflight.

The retry implementation follows PostgreSQL 17's explicit warning to identify
the actual constraint rather than retry every `unique_violation`:
[control structures](https://www.postgresql.org/docs/17/plpgsql-control-structures.html).
The source of entropy remains `pg_catalog.gen_random_uuid()` with its lower
56 random bits retained. Operational alert delivery, hosted clock/load
acceptance, fresh migration rehearsal and real Auth/sync sessions remain open;
the code's log messages do not establish those outcomes.

### Checkpoint 5 — live provider session enforcement in Sanctuary

- Supabase credential verification now follows the cached cryptographic check
  with an uncached provider `/auth/v1/user` check. Non-nil session UUID and
  UUID credential subject are mandatory. The provider response must match the
  signed subject. Auth rejection denies access; timeout, network, malformed
  response, rate limiting or upstream failures surface a 503. Requests use
  the existing secure transport helper, no-store, redirect rejection and a
  five-second abort signal. There is no signature-only outage fallback.
- Both the Hono adapter path and direct oRPC context builder share this
  provider check. Presented invalid credentials no longer become visitors in
  the latter. Existing explicitly admitted bare test identities retain their
  test-runtime-only fixture path. Production startup requires provider URL
  and a publishable/anon key, including when a static verification key exists.
- The provider boundary remains in the existing credential adapter; canonical
  account mapping remains in the domain store. A future Neon domain database
  need not replicate or directly query Supabase's `auth.sessions` table.
- G1 / Vitest: the new real-RSA/mocked-HTTP suite completed 17 scenarios,
  covering revocation after signature caching, absent/nil/invalid session IDs,
  invalid signature, subject mismatch, 400/401/403 rejection, 429/500/503,
  malformed data, network failure, timeout and missing configuration. The
  focused canonical-account/diagnostics/live-session run completed 31
  assertions. Existing phone-only and production-startup fixtures were
  updated to provide real required session/configuration facts; their
  original account mapping and diagnostics assertions remain intact.
- G2 / real PostgreSQL + production-mode router: 12 scenarios succeeded,
  including revocation denial through Hono and direct context construction.
  The synthetic signed issuer now also substitutes its user-endpoint HTTP
  boundary. This proves local composition with that substitution, not the
  linked hosted provider's actual revocation/ban behavior. G0 API TypeScript
  succeeded. The broad G1 API regression rerun completed 116 files / 820
  assertions, with one file / six assertions retaining their existing skips,
  after the two fixture requirements were corrected. Subsequent provider-body
  cancellation was covered by the focused live-session rerun; the full run
  predates that final transport resource adjustment. Scoped raw diffs,
  Biome and whitespace checks succeeded. No broad quality gate was weakened;
  the previously recorded native/version/test-evidence findings remain open.
- Inspection also found synthetic success branches in the auth gateway's
  unconfigured development sign-in/OTP/refresh paths, and best-effort sign-out
  that reports success without checking remote revocation. These remain an
  explicit next implementation seam. Their presence prevents claiming the
  full credential lifecycle is production-ready.

Grounding: current official [session guidance](https://supabase.com/docs/guides/auth/sessions),
[server-side guidance](https://supabase.com/docs/guides/auth/server-side/advanced-guide),
and upstream `internal/api/auth.go` (`requireAuthentication` /
`maybeLoadUserOrSession`). Deployed-version behavior still needs observation.
No hosted mutation occurred. Recent-auth/MFA policy, credential stewardship,
and revocation latency of direct SDK/PostgREST/PowerSync access remain open.

### Checkpoint 6 — truthful gateway and browser sign-out

- Removed fabricated development/test sign-in, OTP and refresh success from
  the real gateway. Missing configuration now fails in every environment.
  This supersedes the gateway finding in checkpoint 5 and uses the user's
  explicit pre-production break/fix authorization. Supported routes remain.
- Gateway requests use publishable/anon keys rather than a service-role key,
  secure no-store transport, redirect rejection and a five-second abort signal.
  429 and upstream availability failures are distinct from invalid credentials.
  Token success payloads are validated. OTP redirects follow the provider's
  query contract. Removed misleading console “audit” claims/partial contact
  logging; immutable security audit receipts remain an implementation gate.
- Sign-out acknowledges only an actual global provider logout success; missing
  authority, misconfiguration, rejection and transport failure are visible.
  Browser cleanup continues on remote failure, verifies SDK session removal,
  and returns an explicit structured failure for incomplete cleanup or
  unconfirmed required revocation. Already signed-out devices need no invented
  revocation request. Provider state retains the warning and clears session
  references; the button and inactivity route surface the incomplete result.
- SSR logout preserves cookie-clearing headers even when a remote failure
  response is returned. Missing configuration no longer claims cookie cleanup.
  Browser password entry cannot silently bypass a configured gateway failure,
  malformed response or failed SDK session establishment. Magic-link entry
  uses the installed provider SDK, which owns browser PKCE state; the generic
  server OTP proxy does not invent that browser verifier state.
- Grounding: installed auth-js 2.117.2 `signInWithOtp` and `_signOut`, installed
  Next.js 16.4.2 response/cookie docs, and official
  [sign-out documentation](https://supabase.com/docs/reference/javascript/auth-signout).
  No dependencies or native implementation changed.

Evidence for checkpoint 6:

| Tier / engine | Result | Limits |
| --- | --- | --- |
| G1 / API Vitest | Gateway: 16 scenarios succeeded. Full API regression: 116 files / 831 cases succeeded, one file / six cases retain existing skips. | Provider, transport and database boundaries substituted in the ordinary API suite. Counts reflect the current shared worktree, not an inferred delta from earlier checkpoints. |
| G1 / web Vitest + jsdom | Nine focused auth/callback/logout suites completed 46 cases, including outage cleanup, cookie deletion headers, explicit failure state and no credential-path fallback. | SDK, network, navigation and storage boundaries substituted; not a real provider ceremony or a physical browser sign-out. |
| G0 / TypeScript and static review | API/web TypeScript, focused Biome and scoped whitespace checks succeeded; raw changed paths and deletions reviewed. | No broader quality waiver. CNG succeeded; anti-slop still stops at 48 native findings; version-drift reports five existing Zod deprecations; test-evidence reports two unclassified verger scripts. Device attestation checks only its existing fixture. |
| G4 / Next.js and Edge | Production build succeeded with 88 generated pages. Installed Playwright 1.64.1 with Edge loaded the built sign-in route at 390×844; the incomplete-sign-out warning was visually verified. | Rendering only: no authenticated provider, remote logout, cookie/session ceremony or live sync. The first capture's consent overlay obscured the warning; the verified capture uses a local synthetic declined-consent fixture. |

Browser artifact: `reports/auth-owned-signout-warning.png`; its local consent
fixture contains no session or credential. App browser control failed to
initialize and the preferred CLI wrapper was absent; the installed Playwright
screenshot command with Edge provided the rendering evidence. Temporary
development/production web servers were stopped after inspection. No hosted
mutation occurred.

Next owned seams remain UUID issuer hosted operating controls, sensitive-action
step-up and credential stewardship, hosted migration/hook/PowerSync
readiness, and real platform journeys. Existing developer onboarding templates
that submit pricing, citizenship or school fields now fail loudly and require
a server-authorized sandbox-provisioning path, not an exception to this schema.

### Checkpoint 7 — restore rehearsal and hosted development cutover

- Replayed all 208 source migrations on a fresh Supabase Postgres 17.6
  container. The canonical cutover fixture completed 28 pgTAP assertions;
  issuer fault scenarios completed 18 assertions, with transaction-local
  substitutions rolled back. The composed Hono/Postgres suite completed 12
  G2 cases on this fresh history; RSA issuance and provider HTTP remained
  synthetic. This is not an Auth-service or PowerSync rehearsal.
- Captured an owner/ACL-preserving custom-format hosted backup using
  `pg_dump` with `sslmode=verify-full` and the official Supabase production
  root certificate. The 5,750-entry archive is encrypted with Windows
  CurrentUser DPAPI at
  `C:/Users/Naween/.codex/backups/gurudevi-auth-20261025/pre-cutover.dump.dpapi`
  (5,357,206 bytes). Decryption/hash round-trip and full isolated restore
  succeeded. This requires the same Windows profile; cross-machine disaster
  recovery remains unproved. No backup contents or credentials belong in Git.
- Restored the actual 197-migration hosted snapshot into an unpublished
  container with cron execution disabled. Matched the source extension set
  (removed the image's extra `pg_graphql`) and created the two missing owner
  roles with source-compatible attributes before restoring the unmodified
  archive. All eleven pending migrations then completed on the restored data:
  281/281 canonical accounts, 324 bindings, zero orphan bindings, development
  mint origin 1, and denied authenticated account INSERT/UPDATE privileges.
- Applied those same eleven migrations to the authorized development project
  `qzoawolfkuwiuyaoiybz` using installed CLI 2.121.0
  `db push --linked --skip-vault --yes`. Immediate count-only hosted checks
  matched the rehearsal: 208 migrations, 281 canonical accounts, 324 bindings,
  zero orphans, origin 1 and denied direct account writes. No production
  PowerSync instance or application deployment was changed.
- Enabled only `auth.hook.custom_access_token.enabled` and its canonical SQL
  hook URI through a scoped CLI configuration. Fourteen undeclared settings
  were preserved; the subsequent comparison reports zero declared changes.
  The scoped config/diff artifacts are under `reports/auth-owned-hook-*`.
- A real hosted anonymous fixture completed signup, signature/live-session
  verification, refresh, global logout and verification of the revoked token.
  Supabase issued ES256; its credential subject differed from the UUIDv8
  `canonical_account_id`; refresh preserved the binding; Sanctuary accepted
  the live token and rejected it after global logout. Provider HTTP and issuer
  were real, with no mock verifier. No password, access token or refresh token
  was printed. This adds one identifiable Auth metadata fixture
  (`auth_acceptance_fixture=20261025-owned-auth`), whose account cleanup remains
  pending through the supported lifecycle command. Its session was revoked.
- Added support for the actually configured
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` alias in API startup, session
  verification and the gateway. Two focused API Vitest suites completed
  34 G1 cases with provider HTTP substituted. They do not replace the real
  ceremony above or prove browser/native integration.
- Replaced five installed-Zod deprecated `ZodTypeAny` aliases with `ZodType`.
  Classified the two Verger test commands through the existing evidence
  reporter: 41 core and nine Android G1 cases completed; no native/device
  execution is claimed. Version-drift and test-evidence gates now exit 0.
  Broader native anti-slop/device acceptance obligations remain open.
- Latest API TypeScript exits 1 with eleven errors in durable-agent/diagnostic
  test response types, AI route unknown values, app middleware context and the
  router decorator's `augmentRouter` import. Earlier green typecheck evidence
  is historical and does not waive this current gate. A `pnpm exec` invocation
  unexpectedly began workspace dependency resolution and was interrupted;
  focused verification then used installed executables directly.

Operational incident: CLI `db dump --linked --dry-run` unexpectedly printed a
temporary database login password. The temporary login was disabled, then its
password cleared through the authenticated postgres connection and login
restored; a fresh normal CLI query succeeded. The exposed password was thereby
invalidated. Do not use dump dry-run for future inspection or repeat its value.
This remediation changed the temporary hosted login role, separately from the
application migrations described above.

The goal remains active. Next acceptance work includes API-backed authenticated
journeys, credential stewardship/recovery/step-up, actual PowerSync development
provisioning and isolation, native lifecycle evidence and remaining quality
gates. This checkpoint establishes a development cutover and one actual provider
session scenario; it does not establish production readiness.

PowerSync follow-through: CLI 0.10.0 fresh inventory still identifies the linked
Development instance as unprovisioned. Full validation completed configuration
and database connection checks but cannot validate sync queries until provisioned.
All four source tables referenced by the streams (`bonds`, `school_memberships`,
`classroom_students`, `classrooms`) are present in the hosted `powersync`
publication with `REPLICA IDENTITY FULL`. The first scoped service deployment
stopped before deployment because the Cloud connection-test endpoint returned
502 HTML (`UNPARSABLE_SERVICE_RESPONSE`); no validation was bypassed. An absolute
CLI directory initially failed due to the installed version's known path bug;
the relative `--directory powersync` works. Official
[CLI release notes](https://releases.powersync.com/announcements/powersync-cli)
document that fix in 0.10.1. No CLI upgrade or production deployment was attempted.

The one deployment retry cleared configuration and connection validation and
scheduled a Development service deployment. CLI polling timed out after 60
seconds; a fresh Cloud inventory reports `deployable: true` for Development,
while diagnostics return HTTP 500 with `getaddrinfo ENOTFOUND` for
`69f985158d064eb85ee933e0.powersync.journeyapps.com`. Provisioning completion is
therefore unconfirmed, not rolled back or operational. Do not repeatedly submit
deployments while this operation may still be settling. Recheck diagnostics and
DNS before stream validation/deployment. Production remains unchanged. The
plaintext dump files were removed from the two rehearsal containers; only the
encrypted Windows backup is retained as a backup artifact (restored database
contents remain isolated in the unpublished rehearsal container).

### Checkpoint 8 — actual API identity, PowerSync deployment and form ownership

- PowerSync's scheduled Development provisioning eventually completed without
  another service-deploy submission. CLI diagnostics now report a connected
  source, completed initial replication and no table errors. Full local config,
  connection and sync-query validation succeeded. Targeted `deploy sync-config`
  to Development `69f985158d064eb85ee933e0` completed; active stream version is
  `7`, service `1.27.2`. Production was not changed. One observation after stream
  deployment showed 16,775,528 bytes of lag; catch-up and client readiness must
  be verified separately, not inferred from deployment success.
  A later snapshot reports 64 bytes, connected=true, initial replication
  complete and zero query errors; metadata is saved at
  `reports/auth-owned-powersync-development-status.json`. This is a point-in-time
  service observation, not client isolation or durable health evidence.
- Actual hosted Auth signup -> Hono `GET /api/openapi/identity/resolveIdentity`
  -> hosted PostgreSQL -> canonical identity response succeeded with HTTP 200.
  Response `id` and `scopeBootstrap.userId` matched the signed canonical claim
  and differed from the credential subject. Database transport used
  `sslmode=verify-full` with the official root certificate supplied through
  `NODE_EXTRA_CA_CERTS`; no certificate verification was disabled. This was
  an in-process Hono request in a test-runtime process, not a deployed API or
  browser/native ceremony. Provider and database were real. The additional
  `auth_acceptance_fixture=20261025-owned-api` account remains identifiable for
  lifecycle cleanup; its real provider session was revoked in `finally`.
- API TypeScript subsequently exits 0 against the current shared worktree.
  This supersedes the eleven-error snapshot, not the remaining broad native
  quality gates. No claim of ownership is made over concurrent API migrations.
- Repaired `check-identity-alignment.mjs`: dangling links produce explicit
  unscanned-path diagnostics instead of terminating traversal, valid linked
  source remains in scope, and realpath visitation prevents cycles. Other I/O
  errors still fail. Pattern priorities and exit thresholds remain intact.
  Three Node filesystem scenarios completed with no substitutes: dangling/
  cyclic links, valid external linked source and bounded minified snippets.
  Real temporary filesystem behavior was exercised; no application runtime
  authorization is proved by these tooling tests.
- The full audit now completes (233.71 seconds, 337 potential findings) and
  exits 1 rather than crashing. Generated bundles account for many findings;
  this is not 337 verified runtime defects. Snippets are capped at 240
  characters after that run to prevent minified files flooding the report;
  all pattern matches still count. A subsequent focused source scan across
  Core, Sanctuary, mobile `src`, and browser `app`/`lib` reports 17 patterns:
  16 session-read advisories and the deletion route's credential `getUser()`.
  The latter verifies provider authentication before a lifecycle RPC and does
  not derive a domain account from the credential ID; it remains a heuristic
  finding, not an authorized blanket exemption. The full audit is not green.
- The audit exposed an actual forms-adapter fallback from missing `tenantId`
  to provider subject and then the zero UUID. Forms now resolve `get_my_id()`
  with the same authenticated database client, validate the canonical account,
  and deny conflicting supplied owners/responders before writing. Response
  attribution derives from that binding; anonymous responses retain null
  attribution. This preserves the existing form-storage boundary; it is not
  an assertion that every domain write has moved behind Sanctuary.
- Hosted policy inspection found the direct INSERT path could still attribute
  a published-form response to another account. Migration
  `20261025015000_forms_responder_account_authority.sql` tightens the existing
  policy to null or the caller's canonical account, retaining the published
  template condition. Six pgTAP assertions completed on the isolated actual
  PostgreSQL substrate under `authenticated`/`anon` roles, including spoof
  denial and retained anonymous submission; JWT claims were supplied as SQL
  session settings, not through a real issuer. Fixtures rolled back. The
  migration grant checker succeeded, a hosted dry-run named only this policy
  migration, and the authorized development push completed.
  A fresh hosted policy query confirms the responder predicate; migration
  inventory now has 209 matching entries and no local-only/remote-only entries.
- G1 / Vitest: nine forms-adapter cases completed using the real Supabase SDK
  with HTTP substituted. Core TypeScript, focused Biome and scoped raw-diff/
  whitespace review succeeded. This does not prove real form submission from
  a browser/device or PowerSync account isolation.

Credential stewardship remains open. Source inspection found existing recovery
and TOTP primitives to reuse, but `AuthManager` still labels any password update
as recovery completion, emits sign-out success before provider acknowledgment,
and routes best-effort client telemetry through device audit infrastructure.
Those events are not immutable server-owned security receipts. Step-up,
last-factor protection, takeover/collision cases and real recovery ceremonies
remain required; do not certify them from the hosted session scenario above.

### Checkpoint 9 — canonical auth telemetry and truthful shared sign-out

- `AuthManager` no longer forwards credential subject IDs to account-owned
  device telemetry. Its internal recorder resolves the current identity through
  the existing identity port and validates the canonical UUIDv8 schema before
  calling the device audit API. An unresolved/malformed account emits a safe
  warning and creates no misattributed event. Telemetry failure remains
  best-effort and cannot undo a provider operation that already succeeded;
  raw provider exceptions are no longer printed by this recorder.
- A confirmed password update records `AUTH_PASSWORD_UPDATED`, not
  `AUTH_PASSWORD_RECOVERY_COMPLETED`. The shared method has no recovery-proof
  input and therefore cannot establish completion of a recovery ceremony.
  The former test expectation was replaced because it asserted that false
  classification; the new assertion requires the confirmed password event
  and canonical account attribution.
- Shared sign-out records `AUTH_SIGN_OUT_STARTED` with an initiated outcome
  and requested scope before cleanup. It no longer writes a success event
  before provider acknowledgement. Platform teardown, storage cleanup and
  provider sign-out are all attempted; incomplete boundaries produce a
  sanitized `AggregateError` rather than resolving as complete. The initiation
  telemetry is not a durable server revocation receipt.
- `scope: others` calls the provider without clearing this device's session,
  platform state or account storage. The memory adapter now preserves the
  same contract. The installed Auth JS 2.117.2 `_signOut` implementation
  explicitly retains the current session for this scope; it was inspected
  alongside official [session](https://supabase.com/docs/guides/auth/sessions),
  [JWT claims](https://supabase.com/docs/guides/auth/jwt-fields), and
  [Auth changelog](https://github.com/supabase/auth/blob/master/CHANGELOG.md)
  guidance. No dependency version changed.
- G1 / Vitest: four focused manager/Supabase/phone/memory suites completed
  40 cases, including provider subject/account separation, unresolved account
  telemetry, combined cleanup failures, successful provider revocation with
  failed local cleanup, and other-session revocation. HTTP, identity, storage
  and provider boundaries were substituted or in memory; no real revocation,
  recovery ceremony, device cleanup or durable audit write is established by
  these cases. Corrected the memory suite's old G0 runtime label to G1.
- G0 / Core TypeScript, focused Biome and scoped raw-diff/whitespace review
  succeeded. `check:anti-slop` exits 1 at its native AST sentinel: 48 findings
  across the active native change set; CNG succeeds. Test-evidence and
  version-drift commands exit 0, with dependency/cohort advisories retained.
  Device-evidence attestation succeeds only against its existing certified
  baseline fixture; it does not attest this auth change on a device.

The full goal remains active. This checkpoint fixes shared ownership and
truthful outcomes; it does not deliver server-owned immutable auth receipts,
recent-auth/MFA enforcement, final-factor protection, credential linking/unlinking
management or a verified recovery workflow. Those remain explicit next work,
alongside real client sync isolation and native lifecycle acceptance.

### Checkpoint 10 — server-owned credential inventory

- Added read-only `GET /api/auth/credentials` through the existing Sanctuary
  auth mount, with a shared strict `CredentialInventorySchema`. The route
  accepts no account selector. It verifies the bearer signature and live
  provider session, resolves the authoritative database account binding, and
  returns only canonical account ID, issuer, anonymous status and credential
  identity IDs/provider names. Missing/deleted bindings deny; incomplete
  inventory is unavailable rather than represented as an empty list.
- The existing session verifier now exposes a details variant while preserving
  the claims-only API used by current callers. Provider user projection strips
  contacts, raw identity data, metadata and provider tokens. An identity whose
  `user_id` differs from the verified subject fails with an explicit ownership
  invariant error. Signature checks, no live-session cache, provider timeout,
  redirect refusal and outage behavior remain in force. The existing admitted
  bare test identities contain no credential inventory and cannot claim one.
- The inventory route is uncacheable and appends Authorization to `Vary`,
  preserving earlier transport headers. Runtime bindings supply both issuer
  configuration and database URL; process configuration remains the existing
  fallback. Mounted application middleware retains its identity and rate-limit
  boundaries; no service-role API key is introduced.
- Grounded the projection in installed Auth JS 2.117.2 `UserIdentity`/`User`
  declarations and official [identity](https://supabase.com/docs/guides/auth/identities),
  [user](https://supabase.com/docs/guides/auth/users), and
  [release](https://github.com/supabase/supabase-js/blob/master/CHANGELOG.md)
  sources. No dependency, database migration or external provider setting
  changed in this checkpoint.
- G1 / Vitest: the latest targeted inventory/session/gateway/MCP run completed
  52 cases. Inventory cases substitute the verifier/account resolver; session
  cases use real RSA verification with provider HTTP substituted, including
  cross-subject identity rejection and private-data stripping. Runtime binding
  and no-binding paths are covered. API and Core TypeScript, focused Biome and
  raw source/diff review succeeded. These are not client UI acceptance proofs.
- Real hosted Auth -> mounted in-process Hono inventory -> hosted Postgres
  returned HTTP 200 with the correct signed canonical account, distinct from
  the provider subject, and an empty anonymous credential list. Postgres used
  `verify-full` TLS with the official CA. The first attempt returned 503 because
  a no-binding Hono invocation was not handled; this was fixed and the repeated
  ceremony succeeded. Both fixtures' sessions were globally revoked in cleanup.
  Metadata markers `20261025-credential-inventory` and
  `20261025-credential-inventory-retry` identify those two accounts for supported
  lifecycle cleanup, which remains pending. No tokens or contact data printed.
  This proves only an anonymous inventory; real Google/email inventory,
  credential management UI and other-session isolation remain unverified.
- The first full API regression loaded the pre-fix route and ended with four
  failures (three inventory scenarios and an MCP metadata timeout), 846 cases
  successful and six existing skips. A targeted final-source run then completed
  all 52 cases with unchanged assertions/timeouts. The final-source full rerun
  with four workers then completed 118 successful files / 850 successful G1
  cases; one file / six cases retain existing skips (119 files / 856 cases
  total). No assertions, timeouts or isolation settings were weakened. Provider
  and database substitutions of the ordinary suite still apply; this does not
  replace the separately scoped hosted ceremony or client platform evidence.

The inventory is the read boundary for credential stewardship, not a completed
credential workflow. Sensitive-action enforcement, recent-auth/MFA, linking and
unlinking, last-factor protection, immutable server receipts and actual recovery
remain open, together with their browser/native integration and live ceremonies.

### Checkpoint 11 — server-observed session revocation receipts

- Extended the existing partitioned `security_audit_logs`, rather than creating
  a second security ledger. Migration `20261025016000` restores the
  `idempotency_key` column omitted by the historical partition rebuild (the
  existing client writer still references it) and introduces protected
  `event_source` provenance. Historical/client rows remain `client_report`;
  server-observed rows are distinguishable and reject ordinary UPDATE/DELETE.
  This is application/database DML immutability, not independent WORM storage
  or protection against a database owner disabling triggers or dropping tables.
- The explicit server-only `append_auth_session_audit` function validates its
  account and outcome, serializes an account/operation key with a transaction
  advisory lock and reuses the existing event for the same phase. Its events
  contain canonical account, operation/request identifier, provider, credential
  class, surface, scope, result and a bounded failure reason. No token, password,
  contact or user-supplied provider payload enters the receipt. The device
  audit RPC and own-account direct client-report path remain operational;
  neither can claim server provenance. The auth-events read model adds actual
  source provenance after client metadata so forged metadata cannot override it.
- Gateway global sign-out now verifies the live session and account, persists
  initiation, invokes provider logout, then persists `confirmed` or
  `unconfirmed`. Missing initiation persistence prevents provider dispatch;
  failed final persistence returns 503 rather than success. Timeout or lost
  acknowledgment remains unconfirmed. This is deliberately not an atomic
  transaction with Supabase; a crash can leave only initiation and must not be
  interpreted as successful revocation. Automated stuck-operation reconciliation
  and an independently retained audit archive remain open operating work.
- Follow-up migration `20261025017000` closes direct audit-partition access:
  all 37 existing children were readable by `authenticated` on the rehearsal
  substrate, bypassing parent RLS. Direct child privileges are revoked for
  PUBLIC/anon/authenticated; parent account policies and bounded RPCs remain.
  The existing next-month partition function preserves all four original
  table/index creation paths and additionally revokes direct access on each
  new security-audit child. Ordinary manual partition creation must follow the
  same privilege rule; no universal DDL event trigger was introduced.
- PostgreSQL / pgTAP: 17 assertions completed on the isolated actual database,
  with SQL session claims supplied for authenticated role scenarios. Proof
  includes account isolation, denied direct-child reads, provenance spoof
  denial, server writer grants, immutable server events, repeated phase
  receipts, retained client-report RPC/direct insert and the read projection.
  Future maintenance was executed after temporarily detaching the four
  pre-created next-month fixtures into a separate namespace; the entire
  scenario rolled back, restoring them. No hosted partition was detached.
- G1 / Vitest: focused gateway/session suites completed 39 cases, including
  initiation persistence failure, post-provider receipt failure and unconfirmed
  transport outcomes, with provider/database boundaries substituted. Full API
  regression completed 118 files / 853 cases successfully; one file / six
  existing cases remain skipped. API TypeScript, focused Biome, migration-grant
  checking and raw SQL/source/diff review succeeded. Earlier broad native
  quality findings are not waived by these API results.
- Both migrations were dry-run scoped and applied only to authorized hosted
  development. After the provenance migration, a real hosted anonymous session completed in-process
  mounted Hono global logout with HTTP 200; the database held exactly two
  matching server-observed initiation/confirmation events, and subsequent live
  verification rejected the token. Token absence from the persisted receipt
  payloads was checked without printing tokens or account/contact values.
  PostgreSQL used `verify-full` TLS. The fixture marker is
  `20261025-server-signout-audit`; its account lifecycle cleanup remains pending,
  and its session is revoked. This is not browser/native cleanup evidence.
  After the partition follow-up, hosted metadata confirms 211 migrations,
  zero of 37 children directly readable by authenticated, and denied client
  execution of the server receipt writer.

This closes a bounded server-observed logout receipt path, not all security
audit requirements. Native/direct provider mutations, linking/unlinking,
password/recovery, sensitive-action assurance and their immutable receipts
still require migration and acceptance. Retention/archival and real client
account/sync isolation remain part of the active programme.

### Checkpoint 12 — password mutation authority and real TOTP acceptance

The normal shared Supabase password adapter now calls Sanctuary's
`POST /api/auth/credentials/password`. The existing anonymous email/password
conversion remains a separate provider flow with its subject-continuity
checks. A failed Sanctuary request never falls back to a direct password
mutation. Mixed profile/credential attributes are rejected; receipt ownership
and the active credential subject are checked after the asynchronous request.

The password route derives the canonical account from verified credentials,
requires a live non-anonymous user with a verified TOTP factor, and requires
signed `aal2` plus a TOTP AMR timestamp within 300 seconds. Future timestamps,
missing or malformed AMR, stale TOTP and a refreshed `iat` alone deny mutation.
The five-minute window is this implementation's explicit sensitive-action
policy. It is not inferred from provider access-token lifetime. Missing live
factor inventory fails unavailable rather than accepting stale assurance.

Migration `20261025018000_password_change_audit.sql` extends the existing
protected audit ledger with a server-only action whitelist. The former logout
writer retains its interface, validation and permissions while delegating to
the common writer. Password initiation is persisted before external dispatch;
confirmation requires a matching provider subject and a persisted final
receipt. Timeout, mismatched response and uncertain provider outcomes remain
unconfirmed; mutation is not automatically retried. Receipts contain fixed
operation metadata, never passwords, TOTP secrets or bearer tokens.

Evidence for this checkpoint:

- G0 / API and Core TypeScript checks succeeded. Focused formatting, migration
  grant checks, raw source/SQL review and unified diff review succeeded. No
  dependency changed. The broad anti-slop gate still stops at 48 native
  findings in the shared change set; this checkpoint does not waive them.
- G1 / Vitest boundary substitutions: the focused API inventory/session/
  gateway/password selection completed 67 cases, including 17 password cases;
  Core adapter/manager selection completed 40 cases. These establish the named
  route, transport and ownership contracts with provider/storage substituted.
- G2 / mounted Hono and isolated real PostgreSQL: 13 canonical-account scenario
  cases succeeded, including password receipt persistence and stale-TOTP
  denial before dispatch. Provider HTTP and the token issuer are synthetic.
  The new six pgTAP password-audit assertions and the existing 17 session-audit
  assertions also succeeded in the isolated rehearsal database.
- Authorized hosted development: migration 180 was dry-run scoped and applied.
  The refreshed migration ledger contains 212 matched versions, zero local-only
  and zero remote-only versions. No production target was changed.
- Real hosted Supabase ceremony through in-process mounted Hono and real
  PostgreSQL: an admin-provisioned, tagged acceptance fixture signed in with a
  password; AAL1 was denied; actual TOTP enrollment/challenge/verification
  yielded AAL2; Sanctuary returned HTTP 200 for password change; the new
  password authenticated with the same subject and canonical UUIDv8 account;
  the hosted ledger contained the matching server-observed initiation and
  confirmation pair. TLS used `verify-full`. This is not a deployed API,
  browser, native, SMTP or email-ownership ceremony.
- Fixture marker: `20261025-real-password-mfa`. Session revocation cleanup was
  attempted and the fixture was banned. Account lifecycle cleanup remains
  pending. An initial legacy service-role fixture request returned 401 before
  creating an account; the successful ceremony used an existing modern secret
  key obtained through the authenticated CLI, held only in process memory for
  admin fixture provisioning. No key was created, committed or printed.
- The full API run with four workers reported 869 successful cases, one MCP
  metadata timeout at its existing five-second limit, and six existing skips.
  The isolated unchanged MCP door file completed all five cases. The full
  serial rerun completed 119 files / 870 G1 cases successfully, with one file /
  six existing cases skipped, exit 0, in 300.67 seconds. Only worker scheduling
  changed; assertions, timeouts and per-file isolation were retained. This
  establishes the serial regression result, not a fix for the earlier timeout
  or a deployed MCP latency guarantee.

This closes the normal adapter/server password command, not all credential
stewardship. The server accepts optional current-password and provider nonce
fields, but the shared manager/UI does not yet collect or forward them.
Provider-native password/reauthentication policy and direct public Auth API
behavior still require review: a Sanctuary gate alone does not prove that
every direct provider mutation requires recent MFA. The current official
[password-security guide](https://supabase.com/docs/guides/auth/password-security)
describes provider secure-password-change reauthentication using a 24-hour
session-age threshold and separately supports current-password verification;
neither should be confused with this route's five-minute TOTP policy. No
provider password-policy setting was changed in this checkpoint. Recovery and lost-factor
UX, credential link/unlink and final-factor protection, other sensitive-action
gates, real browser/native ceremonies and actual PowerSync client isolation
remain open. The full goal remains active.

### Checkpoint 13 — password confirmation contract and corrective errors

Feature spec: provider password confirmation transport.

- Blast Zone: AMBER (shared authentication contracts and API adapter).
- Target files: `packages/core/src/logic/ports/auth.port.ts`,
  `logic/managers/AuthManager.ts`, `api/auth.ts`, `api/passwordChange.ts`,
  `adapters/supabase/auth.adapter.ts`, `adapters/memory/MemoryAuthAdapter.ts`,
  their existing boundary tests, and Sanctuary's existing credential route/tests.
- Reuses: the existing authenticated request transport, account-scope assertion,
  strict password request schema, protected audit writer and installed Auth JS
  `reauthenticate()` primitive.
- Does NOT: automatically send a code, retry a password mutation, expose raw
  provider errors, persist confirmation secrets, relax the recent-TOTP gate,
  or alter hosted password policy.
- Complexity budget: confirmation-code dispatch stays below 30 lines, with
  explicit unavailable, signed-out, provider-failure and account-switch outcomes.
  Existing password routes retain their audit-before-dispatch ordering.

The shared API accepts optional current-password and nonce confirmation fields.
Corrective errors are a closed public inventory; provider error text is never
returned. Confirmation-code delivery must be an explicit person-initiated
operation and may be reported only as requested, not as receipt or ownership
verification. Native/browser UI integration and real delivery acceptance remain
separate required work.

Implemented through `authAPI.updatePassword`, `AuthManager`, `IAuthPort` and the
Supabase adapter: current-password and nonce fields reach the existing strict
Sanctuary command. Guest conversion rejects these confirmation fields, and
confirmation without a new password is rejected before provider calls. Secrets
are not copied into auth telemetry or audit receipts. The adapter preserves
the existing one-argument password call for its callers.

`authAPI.requestPasswordReauthentication` now invokes the installed provider
primitive explicitly. It requires a non-anonymous session and checks the active
canonical account and credential subject after the provider response. Provider
delivery rejection returns a fixed unavailable error without raw provider
details. The memory adapter reports delivery unavailable instead of simulating
an email or SMS. This operation does not change a password or emit password
success telemetry.

Sanctuary translates only the installed provider's known reauthentication,
same-password and weak-password error codes into a closed corrective inventory.
Other provider codes/text remain private and return the existing generic
unconfirmed result. All provider rejection outcomes retain the unconfirmed
audit phase; none is retried. The shared client validates this failure contract
before exposing an actionable fixed message. Guidance was checked against
installed Auth JS 2.117.2 source/types, the
[September 25 release tag](https://github.com/supabase/supabase-js/releases/tag/v2.117.2),
and the official
[reauthenticate reference](https://supabase.com/docs/reference/javascript/auth-reauthenticate).

Evidence: G1 / Vitest Core adapter/manager selection completed 55 cases;
Sanctuary password/gateway selection completed 42 cases (23 password cases).
Provider, transport and persistence boundaries are substituted. These include
secret exclusion, safe error mapping, no automatic retry/fallback, explicit code
requests, delivery failure and a changed-subject completion. G0 / Core and API
TypeScript, scoped Biome checks and unified diff/whitespace review succeeded.
The broad anti-slop gate was rerun and still exits 1 at 48 native findings in
the shared change set. No dependency, hosted setting or migration changed in
this checkpoint, and no new real delivery, browser or native evidence is
claimed. Checkpoint 12's full serial regression is dated evidence preceding
these new branches, not a full-suite rerun of this checkpoint.

Next required integration is the actual recovery/credential UI: collect these
fields only when needed, request codes only on explicit action, perform the
existing TOTP challenge before password mutation, clear secrets on account
transition/dismissal, and retain drafts on a failed save. Non-enrolled/lost
factor recovery requires an explicit supported recovery policy rather than
bypassing the current sensitive-action gate. The full goal remains active.

### Checkpoint 14 — native recovery confirmation and attempt isolation

Implemented the existing native recovery modal's TOTP selection/verification,
optional current-password/nonce inputs and explicit confirmation-code request.
Its controller preserves failed drafts, blocks repeated clicks synchronously,
and clears/invalidate attempts on dismissal, sign-out, changed credential
subject and unmount. A late result cannot update or dismiss a newer recovery
attempt. Empty verified-factor inventory never bypasses the sensitive-action
gate. The existing root composition and provider recovery-event prerequisite
are retained. The native spec and detailed evidence are in
[native password recovery confirmation](../../apps/gurudevi-mobile/docs/current_progress/2026-10-25-password-recovery-confirmation.md).

Added a client-only expected credential subject to shared password confirmation
options. The manager forwards it and the adapter checks it before dispatch
against its own SDK session. It is excluded from the strict outbound password
payload and the direct provider attributes; it grants no caller-selected server
identity. This addresses the race between a recovery UI check and the adapter's
asynchronous session lookup while retaining server-derived canonical ownership.

Evidence: G3 / Vitest React test renderer completed 15 recovery scenarios with
auth/native primitives substituted; G1 / Core completed 56 adapter/manager
cases with provider/transport boundaries substituted. Core's declaration build
succeeded and refreshed stale declarations responsible for the earlier three
auth consumer errors. Workspace typing subsequently reports seven community
errors; direct mobile typing reports 21 errors elsewhere. These broad checks
remain failed. Scoped Biome/import checks, enabled cognitive-complexity check,
Oxlint and duplication checks succeeded. Required ESLint was attempted but
crashes loading SonarJS (`Void` access) before analysis. Broad anti-slop still
stops at 48 native findings; no waiver or gate suppression was added.

This is component-tree acceptance, not an actual native/provider recovery
ceremony. Hosted email ownership, recovery-link expiry/replay, code delivery,
device behavior and lost/non-enrolled-factor recovery remain unproven. The
last item needs an explicit supported policy; the UI reports the limitation
instead of silently reducing the MFA requirement. Browser credential UX,
link/unlink protections, actual PowerSync client isolation and the other
programme gates remain active work. No dependency or hosted setting changed.

### Checkpoint 15 — Google credential unlink authority

Feature spec: authenticated Google credential unlink, AMBER shared/server scope.
Targets are the existing credential router and verifier projection, sensitive
assurance and audit modules, a shared strict unlink contract and corresponding
boundary/SQL fixtures. Reuse the current live provider check, canonical binding,
recent-TOTP policy, secure transport and server-only audit ledger. A follow-up
additive migration extends the audit action inventory; no account binding or
domain record is deleted.

Invariants: caller may supply only the issuer identity UUID; selected Google
identity must belong to the live subject; a confirmed email identity must
remain; recent verified TOTP is mandatory. Initiation must persist before
provider dispatch. Confirmation needs a fresh provider inventory with the
same subject, absent target and retained confirmed email identity. Unknown
outcomes stay unconfirmed and are not retried. Other providers, removal of
email/password/MFA recovery methods and external OAuth provisioning remain
separate admission. Do not expose raw provider payloads or use an admin key.

Required evidence: final-factor/recovery, ownership, stale assurance, provider
outage, malformed response and audit persistence scenarios; isolated SQL grant
and receipt checks; current-source type/diff verification. Actual external
Google ceremonies remain a required acceptance gap until separately evidenced.

Implemented `POST /api/auth/credentials/identities/unlink`, strict shared
request/receipt contracts and `authAPI`/manager/port/Supabase-adapter composition.
The memory adapter reports unavailable instead of fabricating unlink success.
The client accepts an optional expected subject, checks the returned receipt
against subject/account/target, and never falls back to a direct SDK unlink.
Only the provider's credential UUID goes in the request; the caller cannot
choose the canonical account. No person-facing unlink UI is claimed yet.

The provider projection now retains only the email-confirmation timestamp
needed by recovery admission, not the email address or raw identity metadata.
Google unlink requires another live email identity and confirmation timestamp;
email/password/MFA removal is not admitted by this command. Provider native
unlink safeguards remain independent, as documented in the official
[identity-linking contract](https://supabase.com/docs/guides/auth/auth-identity-linking).
The installed Auth JS 2.117.2 implementation was inspected for the exact DELETE
endpoint. A retained confirmed email identity does not by itself prove actual
SMTP delivery or an operated lost-factor recovery service.

Password and unlink commands now share actor/assurance resolution, bounded
provider configuration and separate dispatch/result evaluation in
`authCredentialCommands.ts`. The extraction preserves the existing password
receipt and corrective-error contracts. Explicit enabled cognitive-complexity
checking initially reported 44/42 in the large HTTP handlers; after extraction
the route and command modules report no threshold findings. The gate and its
threshold were not modified.

Evidence:

- G1 / Vitest: password and unlink route selection completed 41 cases,
  including 18 unlink cases. Core adapter/manager selection completed 60 cases.
  Provider, issuer, transport and persistence boundaries are substituted.
- G2 / mounted Hono and actual isolated PostgreSQL: canonical-account suite
  completed 14 cases. The unlink scenario persisted both server-observed
  receipt phases and retained the same canonical account binding. Provider
  DELETE/user inventory and the signed token issuer are synthetic.
- Isolated real PostgreSQL / pgTAP: five unlink, six password and 17 existing
  session/provenance/partition assertions succeeded after applying migration
  190 to the rehearsal database. Fixtures were transactionally rolled back.
- Hosted authorized development: dry run named only migration
  `20261025019000_identity_unlink_audit.sql`; application succeeded. Refreshed
  ledger: 213 matched, zero local-only, zero remote-only migrations. This
  changes the server-only audit action whitelist, not provider configuration.
  Hosted metadata separately confirms the unlink action is installed,
  authenticated cannot execute the server receipt writer, and service_role
  retains that capability.
- G0 / API TypeScript and Core declaration build succeeded. Focused Biome,
  complexity, migration-grant and raw source/SQL/unified-diff checks succeeded.
  Broad anti-slop still fails on the same 48 native findings. Full serial
  API regression after extraction completed 121 files / 899 G1 cases
  successfully, with one file / six existing cases skipped, exit 0, in
  368.18 seconds. Per-file isolation, assertions and timeouts were retained.
  Counts describe the current shared worktree; no inferred per-change test
  delta is claimed. This does not prove real provider/device behavior.

Current client finding: `apps/gurudevi-web/app/(sanctuary)/profile/security/`
`SecurityFloor.tsx` displays hardcoded device sessions and a trust score, and
reports successful revocation/passkey setup using only local state changes.
These are not real security operations. Replacing these false claims with
actual credential/assurance results and explicit unavailable states is the
next client obligation. Real Google link/unlink, final-factor/lost-factor
policy and ceremonies, browser/native acceptance and actual PowerSync
isolation remain open. The full goal remains active.

### Checkpoint 16 — browser security controls and truthful capability states

Replaced the browser security page's hardcoded sessions, trust score and
local-only revocation/passkey success with real credential inventory,
authenticator assurance and TOTP verification. Google unlink now requires
explicit selection/confirmation, calls Sanctuary and accepts only a strict
matching subject/account/target receipt. Device inventory, individual-device
revocation and passkey enrollment are explicitly unavailable instead of
reporting simulated success. Their actual implementation remains open.

The page receives canonical account and separate credential subject from
authorized entry. Its private Query key uses the existing canonical scope
contract and includes the credential subject; HTTP inventory uses no-store
bounded transport. It removes private cache and clears input/results on
sign-out/subject change, discards late operations, and supports Strict Mode
effect replay. Server-derived account/subject keys remount the page on a new
owner. Failed mutations never remove a credential; confirmed unlink updates
the inventory and refreshes. The existing secure browser client/provider and
Query provider are reused, without native or server database imports.

Evidence: G1 / browser auth/HTTP boundary selection completed 15 transport cases;
G3 / mounted Testing Library/jsdom selection completed eight page cases with
auth/HTTP substituted. The broader security/authorized-entry/sign-out/callback/
deletion route selection completed six files / 44 cases with their configured
auth/HTTP substitutions. Browser G0 typing and Core declaration build succeeded;
G4 / Next.js 16.4.2 optimized Turbopack build completed with 88 generated static
pages. Scoped Biome/import/complexity and raw unified diff/whitespace checks
succeeded. These establish source, bundle and substituted contracts, not a
hosted authenticated browser or real Google unlink ceremony. Broad anti-slop
still fails on 48 native findings; no gate was weakened. Detailed implementation
and limits: [browser security controls](../../apps/gurudevi-web/docs/current_progress/2026-10-25-security-credential-controls.md).

No dependency, migration, hosted setting or deployment changed in this slice.
Real credential link/enrollment, password/recovery browser UX, lost-factor
recovery, actual session inventory/device revocation, hosted Google ceremonies,
native evidence and actual PowerSync isolation remain open. The full goal
remains active.

### Checkpoint 17 — browser recovery through password authority

Current source inspection found a remaining direct SDK `updateUser` password
mutation in the browser reset form. It now resolves a verified canonical owner,
loads the existing credential/factor snapshot, verifies TOTP and uses the
Sanctuary password command. Current-password and nonce inputs reach the strict
server request; only a matching subject/account receipt permits success. The
form retains failed drafts, permits retry and clears/unmounts secret fields on
confirmed completion or auth transition. A validated navigation link preserves
the return destination after completion. Lost/non-enrolled-factor recovery is
explicitly unavailable rather than using a direct-provider fallback.

The existing provider recovery-link request now handles rejected/thrown
failures with neutral fixed messages, blocks repeated pending dispatch and
keeps the email draft retryable. Success wording asserts only a request, not
delivery or ownership. The callback preserves the validated post-reset route;
external return destinations normalize to the existing safe default. Provider
PKCE initiation and callback cookie/code-exchange behavior remain in place.

G1 / browser-adapter selection: 26 cases succeeded with provider/HTTP boundaries
substituted. G3 / mounted reset form: eight scenarios succeeded; recovery-link
request: four; existing security controls: eight. Includes ordering before
password dispatch, optional confirmation inputs, failure/retry, explicit code
request distinction, invalid/mismatched owner and receipt, empty factors,
sign-out during verification, no secret form after completion and internal
return-route enforcement. Browser G0 types and enabled complexity/format/import
checks succeeded. The broader eight-file browser selection completed 68 cases
with the configured auth/HTTP substitutions. G4 / final Next.js 16.4.2 optimized
Turbopack build succeeded, including TypeScript and 88 static pages; this is
bundle evidence, not real authenticated browser acceptance. Broad anti-slop
still exits 1 on 48 native findings. No dependency, hosted setting, schema or
deployment changed.

This does not prove an email ownership ceremony, actual mail/code delivery,
link expiry/replay, real provider browser recovery or lost-factor support. The
server requires recent TOTP for recovery/password mutation, and provider-native
direct Auth API policy remains a separate open boundary. Detailed source and
limits are in the [browser security/recovery record](../../apps/gurudevi-web/docs/current_progress/2026-10-25-security-credential-controls.md).
The full identity/auth/sync goal remains active.

### Checkpoint 18 — real PowerSync download isolation and revocation finding

Revalidated authorized Cloud Development `69f985158d064eb85ee933e0`: current
diagnostics report connected source, stream version 7, completed initial
replication, zero lag and zero query/table errors. Used the deployed service's
version-matched official HTTP test-client/checkpoint protocol for an additional
bounded acceptance probe because installed CLI 0.10.0 exposes health/config
operations but no client-download command. Tokens and downloaded data remained
in memory; only boolean/status evidence was printed.

Actual hosted Supabase password sessions for two tagged synthetic permanent
accounts downloaded checkpoints from actual PowerSync backed by actual hosted
PostgreSQL. Canonical claims differed from credential subjects. Each received
its own synthetic bond and no foreign-owned bond/other fixture. Attempting to
select the other account through client parameters did not change that result.
Deleting one exact fixture row was reflected by its absence at a subsequent
complete checkpoint. This is bond-download protocol evidence, not SDK/cache,
roster/membership-revocation, upload/replay, device or production evidence.

The probe also established a material open boundary: after actual Supabase
global logout, the same JWT still received HTTP 200 and a complete PowerSync
checkpoint. Sanctuary's live-session verification therefore does not prove
immediate revocation at the remote sync service. Direct-service token expiry,
a documented maximum revocation delay or server-owned sync-grant design, and
live expiry/refresh tests remain required work. No hosted JWT lifetime or sync
configuration was changed to hide the observed result.

Strengthened the supported connector path: `fetchCredentials()` now requires
the existing live-session Sanctuary identity response and rechecks canonical
account ownership after the await. Revoked/unavailable server admission denies
new credentials, retaining offline local data. It has no direct-provider
fallback or extra retry loop. This improves normal client reconnect but does
not close copied-JWT access directly to PowerSync or prove running-stream
termination. Upload guards/acknowledgments and runtime ownership remain intact.

G1 / connector/connection/single-active-runtime Vitest: 24 cases succeeded with
provider/server/runtime boundaries substituted. G0 / Core forced declaration
build, scoped Biome/complexity and raw unified diff/whitespace checks succeeded.
Broad anti-slop still exits 1 at the same 48 native findings. No dependency,
migration, service/stream deployment or production target changed.

Fixture marker `20261026-powersync-isolation`: exact owner/UUID/marker cleanup
removed both synthetic bonds; global revocation cleanup ran and both accounts
were banned. A separate hosted count query confirmed zero tagged bonds and two
retained, banned accounts. Their lifecycle cleanup remains open. Admin fixture
provisioning used an existing CLI-connected modern secret key in process memory;
no key was created, printed or stored. Admin email confirmation is not an email
ownership ceremony. Detailed protocol, source and evidence limits:
[hosted PowerSync download acceptance](../../apps/gurudevi-mobile/docs/current_progress/2026-10-26-powersync-hosted-download-acceptance.md).
The full auth/identity/sync programme remains active.

### Checkpoint 19 — owned short-lived sync credential issuance

Added Sanctuary's live-session-gated `POST /api/auth/sync-credentials` and public
`GET /api/auth/sync-jwks`, with a strict shared Core response contract. ES256
grants use the canonical UUIDv8 for both subject and stream account parameter,
an endpoint-specific audience, and a lifetime bounded by 300 seconds and the
admitted provider JWT's remaining lifetime. Caller-supplied identity/expiry is
not used. Missing signing configuration, provider/database outage, anonymous
state and revoked session deny issuance; private signing material never leaves
the server. No provider-token fallback was added.

G1 / Vitest: 25 grant cases succeeded using real WebCrypto with provider and
database substitutions; combined existing auth boundary selections total 55
cases across three files. G0 / API TypeScript, forced Core declaration build,
Biome and explicit complexity checks succeeded. Broad anti-slop remains blocked
by the same 48 native findings. The hosted development scenario used a real
password session and canonical DB binding through the in-process Hono route:
signature/scope/TTL were valid, and actual global logout made renewal return 401.
Its single tagged fixture account was revoked and banned, with lifecycle cleanup
still owed; admin email confirmation does not prove ownership.

This implements grant issuance, not the remote trust cutover. The service still
accepts the provider JWT and the connector still returns it. Persisting a service
key in Doppler, configuring owned-key-only trust, client credential selection,
key rotation and actual expiry/running-stream/SDK acceptance remain open. Service
1.27.2 source uses 60 seconds of JWT admission tolerance; an issued grant is not
immediately revoked by logout. No service config, signing secret, provider TTL,
dependency or production target was mutated. Details and next acceptance gates:
[owned sync credential boundary](../../apps/sanctuary-api/docs/current_progress/2026-10-26-owned-sync-credential-boundary.md).
The full identity/auth/sync programme remains active.

### Checkpoint 20 — hosted owned-key PowerSync cutover and client integration

Persisted the active Dev ES256 signing key in Doppler through CLI stdin and
deployed owned-key-only client authentication to authorized PowerSync Development
`69f985158d064eb85ee933e0`. Supabase-token trust and temporary tokens are disabled.
Only public verification coordinates are stored in source. A CurrentUser DPAPI
backup protects the pre-cutover config; post-deploy comparison confirmed the
same replication configuration and stream SQL, including the existing managed
database-password reference. CLI schema/connection/stream validation succeeded.
Production and provider JWT lifetime were not changed.

Actual hosted two-account checkpoints now use Sanctuary-issued canonical UUIDv8
grants and the persisted Dev key. Each received only its own fixture bond;
spoofed parameters did not change ownership, and exact fixture deletion appeared
in the next accepted checkpoint. Direct provider JWTs, wrong audiences, modified
signatures and signed tokens expired beyond tolerance returned 401. A 15-second
grant's actual stream reached expiry and ended after 14,842 ms. Actual global
logout made renewal return 401; the unexpired grant remained valid as expected
within the bounded bearer window. The fixture cleanup count independently
confirmed zero tagged bonds and two retained, banned accounts.

The connector now requests the owned grant through the existing authenticated,
account-bound transport and validates its strict response after all awaits.
Server-selected endpoint, canonical owner, expiry and safe transport replace the
provider-JWT return; local claim checks and upload queue/retry/acknowledgment
behavior are preserved. The client allows 60 seconds of forward clock skew;
server signing TTL remains capped at 300 seconds. G1 / Vitest selections cover
42 cases across connector, offline-write, lifecycle and single-active-runtime
suites with provider/server/storage substitutes. G0 / Core forced declaration
build, scoped Biome/complexity and raw diff/whitespace review succeeded. Broad
anti-slop remains at 48 existing native findings.

This closes the observed direct-provider-token bypass on Dev, not the full sync
or auth programme. API issuance ran in process for hosted acceptance; a public
Sanctuary deployment, SDK checksum/local-cache account switching, offline queue
replay/reconnect, membership/roster revocation, key-rotation rehearsal and device
journeys remain required. Actual service diagnostics are connected without
table/query errors; reported lag snapshots ranged from 1,424 to 16,772,960 bytes.
A subsequent direct database slot query showed an active, reserved slot with
2,688 unconfirmed and 16,775,648 retained WAL bytes. These distinct measurements
do not establish a zero-lag SLA; sustained sync latency remains open acceptance.
See the [cutover record](../../apps/sanctuary-api/docs/current_progress/2026-10-26-owned-sync-credential-boundary.md)
and `reports/auth-owned-sync-cutover-acceptance.json` for exact evidence/limits.
The full goal remains active.

### Checkpoint 21 — Render ingress preparation and real HTTP auth admission

The user authorized creating a new Development Render service. No service or
API account credential was linked. Render plugin discovery found an available,
uninstalled integration and surfaced its connection option; no public service,
Git push or deployment was performed. The full programme continues while that
external connection is pending.

Fixed a concrete runtime mismatch: both entrypoints now support explicitly
configured Render TLS termination only with Render runtime markers. Direct
TLS/certificate validation remains the default. Application requests in Render
mode require an exact HTTPS forwarding value; only GET `/health/live` is exempt
for internal liveness. Readiness/auth/data routes retain the transport gate.
The Docker/Render health path now points to the implemented route. Blueprint
secret inputs include the owned signer and endpoint; its rate-limit header is
`CF-Connecting-IP`, following Render's current guidance against trusting the
caller-controlled leftmost forwarded-for value.

G1 / full serial API Vitest: 939 cases succeeded with external substitutions,
six existing skips, 122 successful files and one skipped file. G0 / API type,
Biome and complexity checks succeeded. Static API bundling initially failed
because esbuild 0.27.7 rejects `es2026`; a minimal tsup config now derives its
Node target from `.nvmrc`, and the two-entry ESM bundle succeeds. The inherited
ES2026 warning remains recorded. No compiler strictness, dependency or lockfile
was changed. Broad anti-slop still reports 48 existing native findings.

G2 / real loopback HTTP through the composed Hono app with actual hosted issuer,
canonical DB and Dev signer: valid login issued a signed canonical grant; actual
global logout made renewal return 401. Internal liveness admission and denial
of readiness/unforwarded/ambiguous requests were verified. Render markers and
non-secret production startup configuration were supplied by the probe; actual
Render ingress, public deployment and entrypoint boot are not proven. An initial
production-mode import failed on missing JWT issuer/audience settings, and the
Dev set also lacks the entrypoint-required BYOK encryption key. No fake key was
persisted to conceal those findings. The single fixture account was revoked and
banned; a separate hosted query confirmed the retained/banned count.

Remaining deployment gates include Render account connection, deterministic
Docker workspace installation, startup-secret/key stewardship, actual edge
header and public API/SDK journeys. Details and exact limitations:
[Render ingress admission](../../apps/sanctuary-api/docs/current_progress/2026-10-26-render-auth-ingress-admission.md).
The full identity/auth/sync goal remains active.

### Checkpoint 22 — authenticated Render discovery and frozen container work

Verified Render CLI 2.31.0 against its official SHA-256 manifest and completed
user-authorized browser login. Selected the existing `My Workspace` after the
service/workspace naming discussion; no organization creation was needed. The
requested service name is `sanctuary-api`. The workspace lists no services.
Authenticated Blueprint validation returns `valid: false / need_payment_info`
for both the existing paid config and a separate free Development Blueprint.
This does not prove Hobby is insufficient. The user directed local work rather
than paying if needed; Render provisioning is now deferred. No paid plan,
payment details, service creation, public deployment or Git push occurred.

Replaced the Dockerfile's Bun/non-frozen dependency fallback with Node/Corepack
and the canonical pnpm frozen install, retaining Bun 1.4.4 runtime and checking
the builder against `.nvmrc`. Added a build-context ignore file including the
repository pnpm hook/patches and excluding local secrets/artifacts. The first
actual Podman linux/amd64 build failed at lockfile consistency; its intermediate
lockfile hash differed from the current checkout, consistent with concurrent
dependency edits. Current override maps match; shared edits were preserved.
The second build passed consistency/supply-chain checks and downloaded packages.
Intermediate inspection found unintended unrelated app source inclusion; the
ignore rule was corrected and that exact tagged build was interrupted. The
corrected build context, completed image and runtime remain unverified.

No dependency or lockfile edits were made by this work. Raw diff/whitespace
review succeeded; broad anti-slop remains at 48 existing native findings.
Local API/auth/SDK acceptance can continue independently of Render and containers.
The full goal remains active. Details:
[deployment/container record](../../apps/sanctuary-api/docs/current_progress/2026-10-26-render-auth-ingress-admission.md).

### Checkpoint 23 — local sync key overlap and rotation rehearsal

Continued locally under the user's steering. Added optional bounded public
verification-key overlap to the existing signer: `POWERSYNC_VERIFYING_JWKS`
requires one to three unique public ES256/P-256 keys including the exact active
signer. Invalid/private/ambiguous material denies issuance and JWKS publication;
WebCrypto imports validate public points. Absent configuration preserves the
single-key path. The five-minute grant, canonical subject, live-session checks
and sanitized HTTP errors remain. No hosted key or configuration was changed.

G1 boundary plus G2 local virtual-clock rotation / Vitest: 60 cases across three
files succeeded, including publish-overlap, signer switch, retirement and
invalid-config HTTP denial. Provider/database boundaries are substituted in the
auth selections. A separate G2 loopback HTTP rehearsal fetched actual JWKS and
used independently installed JOSE 6.2.8 to verify both real signatures, observe
real-clock grant expiry, retire the old key and retain the new signer. That
local verifier uses zero tolerance and a synthetic account, not PowerSync's
60-second tolerance or a live issuer/database/SDK. No keys/tokens were persisted.

G0 / API typecheck, scoped Biome/complexity and two-entry ESM bundle succeeded;
the inherited ES2026 warning remains recorded. Broad anti-slop still reports
48 existing native findings. Raw diff and whitespace review preserved existing
guards/tests. Local overlap readiness does not prove hosted key propagation or
operational emergency rotation. Inline hosted JWKS still requires explicit
publish/retire deployments and remote verification, which were not performed.
See the [sync credential record](../../apps/sanctuary-api/docs/current_progress/2026-10-26-owned-sync-credential-boundary.md)
and `reports/auth-local-sync-key-rotation-acceptance.json`. The full goal remains
active, including client/cache/offline, recovery, operational and device gates.

### Checkpoint 24 — local PowerSync account handoff failure containment

The serialized runtime previously forgot its handle before cleanup completed;
failed cleanup could therefore admit another account's database. It now retains
ownership until successful release, retries a pending explicit clear, closes the
handle after clear, and rejects unsupported cleanup capabilities. The native
provider requires current account and exact active handle identity before
publishing context, including rapid A-to-B-to-A and stale initialization.
Offline connection failure still leaves the current account's local context
available. See the [mobile handoff spec and evidence](../../apps/gurudevi-mobile/docs/current_progress/2026-10-26-powersync-account-handoff.md).

G1 boundary / Vitest substitutions: 46/46 runtime/lifecycle/connector cases
succeeded. G3 component / React test renderer with native database/auth/network
substitutions: 8/8 new provider cases, 23/23 combined with recovery, succeeded.
These establish the specified isolation and failure contracts under substitutes;
they do not establish real SDK cache/replay, native SQLite or device acceptance.
Core declarations, scoped Biome/complexity and duplication checks succeeded.
Mobile typechecking retains 21 errors outside changed files; workspace types
retain seven community errors. ESLint fails during SonarJS 4.2.2 initialization.
The broad anti-slop gate retains 48 native findings; CNG succeeds.

Render provisioning remains deferred at the user's instruction to continue
locally. `need_payment_info` occurred for both free and paid blueprint validation;
it does not prove Hobby requires a paid service. No paid resource or billing
change was made. Shared database facade references, real SDK/offline acceptance
and the remaining programme gates stay open.

### Checkpoint 25 — shared database access and queued logout ownership

The mobile provider now supplies current store ownership to the existing shared
database injection seam. Both platform facades use one typed registry for injected
database/Drizzle state and release. Inactive/releasing owned handles are hidden or
rejected by accessors. Logout delegates to the same queue as switching and targets
the captured handle; delayed A cleanup cannot close or erase a replacement B.
Failed cleanup remains retryable. Two-argument injection, bootstrap, mock fallback
and secure-write interception retain regression coverage. Legacy missing-release
capability now fails loudly. See the [handoff implementation and evidence](../../apps/gurudevi-mobile/docs/current_progress/2026-10-26-powersync-account-handoff.md).

G1 boundary / Vitest: 49/49 cases in six selected files, including 12 new facade
cases, succeeded with SDK/bootstrap/network substitutions where configured. G3
component / substituted native/auth/network React tree: 9/9 provider cases,
24/24 with recovery, succeeded. These prove the named accessor/cleanup contracts
under substitutions, not actual SDK persistence, physical native runtime or a
complete authenticated journey. Core declarations and scoped Biome/complexity
succeed. Seven workspace and 21 mobile type errors remain outside changed files;
SonarJS initialization still prevents ESLint acceptance. Duplication detection
reports one thin-facade export clone. Broad anti-slop remains red with 48 native
findings. Version-drift and test-evidence command audits succeed. Device-evidence
audit used a baseline fixture and provides no new G5 evidence.

Already-retained query handles, late global auth cleanup callbacks, real SDK
cache/offline replay and physical-device acceptance remain open. This follow-up
made no external mutation; the full auth programme remains active.

### Checkpoint 26 — stale auth resolution and authorization scope ownership

The shared permission store invalidates pending query/policy/signature work on
reload and clear, withdraws old grants while loading, ignores stale failures,
and denies wrong-principal or invalid-expiry snapshots. Scope transitions now
version their ownership: old success/rejection cannot publish completion or
roll back a newer scope, including when a newer failure restores the former
snapshot object. Current-transition rollback remains covered.

The existing auth lifecycle checks ownership after scope commit, device capture
and offline account verification, invalidates pending work on subject/mode change
and cleanup, and guards late bootstrap errors and refresh lookups. This prevents
a superseded scope error from entering the old invocation's fallback and clearing
the newer identity. Same-subject token refresh and verified offline fallback
remain covered. See the [cross-platform spec and evidence](2026-10-26-auth-scope-async-ownership.md).

G1/G2 / Vitest with configured query/storage/signature/auth/React-hook substitutes:
56/56 cases in six files succeeded, including 22 new cases. Proves the named
async ownership and denial contracts under substitutions, not a mounted app,
real provider or device runtime. Core declarations, scoped Biome, explicit
complexity-15 checks and scoped duplication checks succeed. Workspace types retain
seven community errors; SonarJS initialization still blocks ESLint. Broad
anti-slop retains 48 native findings; CNG, test-evidence and version-drift audits succeed. The
device-evidence command used its baseline fixture and supplies no new G5 proof.

AuthManager cleanup targeting, capture's durable writes and snapshot lifetime
after loading remain open alongside SDK/offline, real client and operational
acceptance. No external state changed; the full programme remains active.

### Checkpoint 27 — serialized auth mutations and truthful logout persistence

AuthManager serializes session-changing operations, verified-user lookup and
full logout. Logout releases runtime, attempts provider revocation before local
state reset, and retains sanitized aggregate failures and scope-others behavior.
Its factory uses the existing derived-state reset instead of wiping device-wide
storage. Browser detection now uses DOM presence: installed React Native defines
window, so the previous condition skipped native runtime cleanup. Auth credential
storage now propagates sanitized read/write/removal failures instead of silently
claiming absence/success. The injected config is canonically `localState.clear`;
the old storage.clearAll contract was intentionally replaced under the authorized
preproduction cutover. See the [session-order spec and evidence](2026-10-26-auth-session-mutation-order.md).

G1 / Vitest substituted boundary engine: 76/76 cases across manager, credential
storage and lifecycle bootstrap. G2 / actual Supabase JS/auth-js 2.117.2 with the
production factory, adapter and auth-storage adapter, simulated HTTP/memory
persistence/identity/telemetry/native database handle: 3/3 logout scenarios
succeeded (HTTP 200, 503 and failed credential removal), alongside three existing
scope scenarios. The combined five-file selection completed 82/82 cases.
Proves the named serialized cleanup, credential availability, error, incoming
session and retained bookkeeping/outbox contracts under substitutions. Does not
prove real provider revocation, JWT verification, native storage or devices.

Core declarations, scoped Biome/complexity/duplication and test-evidence/version
audits succeed. Workspace types retain seven community errors; SonarJS still
fails initialization, and broad anti-slop retains 48 native findings. Device
audit uses a baseline fixture and provides no new G5 evidence. Direct identity-
adapter SDK user lookups, autonomous auth events, account capture/switch/removal,
PowerSync offline queue policy and real client/provider acceptance remain open.
No external state changed; the full programme remains active.

### Checkpoint 28 — session-bound canonical bootstrap

Identity resolution now captures the local session token and provider subject,
binds RPC dispatch to that token, and rejects a changed session before publishing
the canonical response. Sanctuary compares the subject assertion against its
verified credential before canonical lookup. Redundant SDK getUser calls in the
identity adapter are replaced by continuity reads, avoiding their session-removal
side effect. Bound calls bypass context-replacing RPC batching/deduplication;
owner-bound GET calls retain their existing account assertion as well. The
persisted scope hint is discarded across an account switch. See the
[implementation and evidence record](2026-10-26-identity-session-bound-bootstrap.md).

G1/G2 / Vitest: 101 core cases succeeded with the recorded SDK/network/storage
substitutions. The full serial API run completed 966 cases across 125 files,
with six existing skipped cases and one skipped file. New evidence includes
eight Hono assertion/CORS boundaries and three actual adapter-to-oRPC-handler
scenarios with substituted session/verifier/database. Core declarations and API
types succeed; scoped complexity/Biome succeeds. Workspace types retain seven
community errors, native anti-slop retains 48 findings, and SonarJS still fails
initialization. The rn-terrain policy index returns QUARANTINE_HOLD for the
installed oRPC beta; its CLI exit 0 is not acceptance. Device audit remains a
baseline fixture, with no new G5 claim. Full acceptance remains open.

Render's free Development validation returned need_payment_info; the user chose
local continuation without a paid plan or payment setup. Hosted Render remains
unprovisioned. This slice changes no external state. Device-account capture,
switch/removal, offline queue preservation and real client journeys remain open;
the full programme and goal remain active.

### Checkpoint 29 — preserve outgoing PowerSync work during switching

The switch caller previously requested preservation together with destructive
PowerSync clearing. It now closes the outgoing account-specific database without
clearing it. The transition rejects contradictory preserve-plus-clear requests;
explicit discard/removal retains destructive cleanup. Existing queue-owner and
legacy-unbound assertions remain intact. See the
[implementation and evidence record](2026-10-26-account-switch-offline-work-preservation.md).

G1/G2 / Vitest: 39 focused cases and an expanded 128-case regression selection
succeed. Two composed scenarios run the actual transition/registry/runtime with
substituted account files, alongside boundary coverage for close failure, retry,
policy denial and incoming-session rollback. This is not real SQLite durability
or upload acceptance. Core production declarations, scoped complexity/Biome,
duplication and whitespace checks succeed. Workspace types retain seven
community errors; native anti-slop retains 48 findings; SonarJS initialization
and rn-terrain's unrecognized-version policy hold remain unresolved. Device
audit remains a baseline fixture. No external state changed.

Remaining work includes real PowerSync CRUD reopen/replay and device evidence,
whole-transaction concurrency across account capture/switch/removal, cleanup of
closed inactive account files, authenticated client journeys and all other
outstanding programme requirements. The goal remains active.

### Checkpoint 30 — device-account local transaction ownership

Device initialization, reads, capture, switch and removal/sign-out now share a
process-local queue. Internal fallback operations retain their existing nested
calls without reacquiring the queue. Capture resolves Sanctuary canonical
identity even when a profile is supplied, rejects mismatch/stale sessions, and
checks continuity around storage before activation. Persistent active selection
precedes in-memory publication; switch rollback now covers rehydration failure.
See the [implementation and evidence record](2026-10-26-device-account-transaction-ownership.md).

G1/G2 / Vitest: 125 cases across 11 files complete, including a new actual
Supabase 2.117.2/callback-adapter scenario with simulated HTTP, canonical identity,
memory storage and native cleanup. The SDK installs the incoming session while
its callback queues capture; both remembered accounts survive and a later stale
capture cannot replace the incoming credential. Core production declarations,
scoped Biome/complexity, duplication and whitespace checks succeed. Workspace
types retain seven community errors, SonarJS initialization fails, and native
anti-slop retains 48 findings. rn-terrain recommends HUMAN_TRIAGE for this change;
no automatic acceptance or G5 claim is made.

Cross-process/tab and autonomous SDK coordination, crash recovery, remembered
refresh-token rotation, telemetry actor attribution, inactive database-file
cleanup and real native/client journeys remain required. No external state
changed. The full programme and goal remain active.

### Checkpoint 31 — retain rotated remembered-session credentials

The same-subject TOKEN_REFRESHED path now retains its current token pair through
the device transaction queue. Only the matching active remembered canonical
account/subject is eligible; the operation does not select accounts or rewrite
profile/scope. Missing binding falls back to canonical bootstrap. Retention
failure is visible through a sanitized, recoverable profile error, guarded
against newer auth events. See the
[implementation and evidence record](2026-10-26-remembered-session-token-rotation.md).

G1/G2 / Vitest: 45 focused boundaries/lifecycle cases and an expanded 151-case
selection succeed. The actual Supabase 2.117.2 SDK scenario rotates credentials,
switches A-to-B-to-A with expired access credentials, and restores a fresh SDK
client using the next remembered refresh token. HTTP issuer, canonical identity,
memory secure storage, scoped reset and native cleanup are substituted; the
issuer fixture rejects previously rotated tokens. This is not hosted policy,
mounted React/native or OS process-death proof. Core declarations, scoped
complexity/Biome, duplication and whitespace checks succeed. Existing workspace
type/native findings and SonarJS failure remain; rn-terrain recommends human
triage. Device audit is still a baseline fixture.

Hosted rotation, native durability/process recovery, mounted client journeys,
inactive account-file cleanup, telemetry actor attribution and the remaining
programme requirements are open. No external state changed; goal stays active.

Browser acceptance continuation after checkpoint 31: local API/Next development
servers are running and the real sign-in page rendered. Source inspection found
that the browser password form stores the provider subject as accountId in its
device registry, violating canonical identity. Existing E2E tests also expect an
older heading and signed-out fallback, so they do not establish authenticated
entry. No credentials were submitted or hosted account created. The next bounded
implementation and acceptance requirements are recorded in the
[web acceptance note](../../apps/gurudevi-web/docs/current_progress/2026-10-26-real-auth-browser-acceptance.md).

## Finding and review boundary

The canonical UUIDv8 account cutover is one completed local implementation
slice, not completion of the identity programme. Remaining work includes
server-owned profile/onboarding mutations, credential stewardship, session
revocation policy, authenticated client journeys, deployed sync and operations.
Database transport portability, account independence, credential-provider
portability and external OAuth are four different contracts.

This review searched current root/app architecture and progress documents for
UUID, identity, authentication, decoupling, session, callback and guest plans,
then traced the named active seams into source. It includes relevant older
release baselines below. Archived philosophical proposals and dated evidence
are context, not executable instructions. It is not a census of every domain
handler, remote configuration, or historical document in the repository.

Source inspection reflects a shared dirty working tree on 2026-10-25. No
runtime implementation, hosted schema, provider setting or deployment changed
in this review. Source presence is G0 evidence only; previously recorded test
results retain their original substitutions and limits.

## Governing records and disposition

| Records reviewed | Disposition and remaining obligation |
| --- | --- |
| [Authentication authority](../architecture/authentication-and-sovereign-identity.md), [identity convergence programme](../architecture/edlove-identity-convergence-program.md), [UUID specification](../architecture/edlove-sovereign-uuidv8-specification.md) | Active authorities. Corrected remaining contradictory additive-adoption instructions. Account UUIDv8 is canonical; credential subjects stay provider-owned. Stewardship and client/operational convergence remain open. |
| [October 22 omnichannel/UUID proposal](../architecture/2026-10-22-sovereign-identity-omnichannel-and-uuidv8-architecture.md) | Already superseded. Its blanket primary-key mandate, client generator samples and automatic channel actions must not become implementation instructions. |
| [UUID foundation](2026-10-23-edlove-uuidv8-foundation-implementation-plan.md), [nullable persistence](2026-10-23-edlove-account-id-persistence-phase-plan.md), [writer authority](2026-10-23-edlove-account-id-authority-completion.md), [Phase 2 assignment](2026-10-24-edlove-identity-foundation-phase-2-plan.md), [Phase 1B operations](2026-10-24-edlove-phase-1b-controlled-assignment-operations-plan.md) | Historical/superseded by the [canonical cutover](2026-10-25-canonical-uuidv8-account-cutover.md). Do not run the retired assignment queue against the new schema. Their old test counts and hosted inventories are dated evidence. |
| [Database gap analysis](../architecture/2026-10-23-database-decoupling-current-state-and-gap-analysis.md), [immediate remediation](../architecture/2026-10-23-immediate-database-decoupling-remediation-plan.md) | Superseded as current execution guidance by this source review. The factory still constructs Supabase repositories through an `any` interface; client identity writes remain PostgREST. Claims of 100% portability, zero-code provider switching and hour-based completion estimates are not accepted evidence. |
| [Auth production/OAuth proposal](../architecture/2026-10-25-auth-production-convergence-and-oauth-admission-plan.md) | Its additive-ID sequence is superseded. Its A2–A9/A11 session, binding, takeover, recovery, authorization, receipts and external-client obligations remain useful and open where no proof is recorded. |
| [September 20 session feature spec](2026-09-20-auth-session-lifecycle-hardening-feature-spec.md), [callback feature spec](2026-09-20-auth-callback-lifecycle-hardening-feature-spec.md), [cross-platform implementation plan](2026-09-20-cross-platform-auth-session-seam-implementation-plan.md) | Shared transition/callback contracts and native account-transition code exist. The callback spec is historical; broader lifecycle implementation and real web/native acceptance must be traced separately. Browser tiers and optional browser PowerSync are capability decisions, not account-cutover prerequisites. |
| [September 21 single-account release slice](2026-09-21-single-account-auth-session-release-slice.md), [October 8 characterization](2026-10-08-auth-seam-characterization.md), [October 10 offline hardening](2026-10-10-auth-offline-hardening-review.md) | Retain bounded prior evidence. They do not prove the current UUIDv8 release, hosted refresh/revocation, arbitrary multi-day offline work or success through the actual API. |
| [September 7 subject/account boundary](../../apps/gurudevi-mobile/docs/current_progress/2026-09-07-auth-subject-account-boundary-plan.md), [account lifecycle authority](../../apps/gurudevi-mobile/docs/current_progress/2026-09-07-account-lifecycle-authority.md), [mobile app/device lifecycle](../../apps/gurudevi-mobile/docs/architecture/identity-app-device-lifecycle.md) | Matching-subject and stale-result protections exist. Canonical account IDs must govern persisted account state while credential subjects remain separate. Real account switching, restore, wake, sign-out, deletion and stale-data evidence remains a release obligation. |
| [Guest conversion completion](2026-10-23-mobile-guest-conversion-completion-plan.md), [guest transfer policy](../architecture/2026-10-24-guest-data-transfer-policy.md), [cross-channel contract](../architecture/2026-10-23-cross-channel-identity-and-guest-conversion-contract.md) | Guest entry/conversion foundations exist; remote transfer is intentionally prohibited for every record kind. This review does not authorize enabling it. Channel ingress/link/consent server seams exist; person-facing connection/revocation/recovery and live provider evidence remain incomplete. |
| [Client-state Phase 2](../architecture/2026-10-23-client-state-phase-2-scope-session.md), [Phase 3 roadmap](../architecture/2026-10-25-client-state-phase-3-completion-roadmap.md), [authorization-snapshot admission](../architecture/2026-10-25-client-state-phase-3-authorization-snapshot-admission.md) | Phase 2 records G1/G2 acceptance, not deployed/device acceptance. Phase 3.4 entitlement/Cedar read-lifecycle migration and Phase 3.5 remain planned. Current safe-denial behavior must be preserved; a Query migration is not itself missing server authorization. |
| [API v0/v1 plan](../architecture/2026-10-23-api-v0-v1-canonicalization-plan.md), [D1A reconciliation](../architecture/2026-10-24-d1a-platform-domain-led-api-reconciliation-plan.md) | Separate active API programme. Account ownership/lifecycle rules must feed capability admission. The UUID cutover does not create v1 routes, finish the capability ledger or prove every domain write path. |
| [Sanctuary/mobile identity cutover](2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md), [identity migration spec](2026-09-22-sanctuary-identity-migration-feature-spec.md), [Google Play/OAuth runbook](../../apps/gurudevi-mobile/docs/runbooks/2026-09-22-google-play-google-oauth-release-runbook.md) | Deployment identity, redirect hosts, native package/signing association and provider configuration are a separate release seam. Earlier hosted settings are dated observations; no current external settings were verified by this review. |

## Concrete source findings

| Seam inspected | Current source | Completion consequence |
| --- | --- | --- |
| Account key | `schema.zmodel`, `authenticatedAccount.ts`, UUID migration and cutover tests | Canonical account foundation is implemented locally. Fresh full-history bootstrap, hosted ledger reconciliation, grants/RLS, issuer hook and operational acceptance remain separate gates. |
| UUID issuer engineering | `public.new_edlove_account_id()` and SQL/integration fixtures | Database uniqueness, clock rollback rejection and bounded concurrent issuance are tested. The current issuer has no explicit collision-retry loop, uses one transactional clock row, and stamps central-production origin. Forced-collision behavior, realistic lock/load limits, environment provenance and operational clock alerts remain acceptance work; sample uniqueness is not a proof of those contracts. |
| Domain construction | `packages/core/src/logic/domains/factory.ts`, `adapters/clientDomainServices.ts` | `IDataQueryClient` exposes `any`, an arbitrary index signature and PostgREST-shaped methods. The factory still imports/creates nine Supabase repositories. Removing the SDK type did not invert repository construction. |
| Identity data writes | `packages/core/src/adapters/supabaseIdentity.adapter.ts` | Account resolution uses Sanctuary, but `updateProfile`, `createInitialBond` and related provisioning still write `users`, `bonds`, `personal_classrooms` through PostgREST. Distinguish approved direct reads/projections from authoritative mutations. |
| Existing canonical onboarding | `packages/core/src/api/onboarding.ts`, `apps/sanctuary-api/src/core/handlers/onboarding.ts` | Existing oRPC commands already provide server-owned actor derivation. Reuse and characterize these paths before adding another profile/onboarding API. Full transaction/receipt behavior must be checked per operation. |
| Credential conversion | `AuthManager.ts`, `adapters/supabase/auth.adapter.ts`, `supabaseIdentity.adapter.ts` | Reset/update/link primitives exist. `linkIdentity` in the identity adapter validates an existing binding; it is not a complete credential-management service. Anonymous conversion still coordinates provider mutation and direct profile updates; one successful provider call does not settle lifecycle and recovery semantics. |
| Verifier | `apps/sanctuary-api/src/jwt.ts`, auth adapters | Composite fallback bypass was closed in the preceding slice. JWT verification retains a 24-hour JWKS refresh interval, kid-indexed key cache and five-minute verified-token cache. Live-session/recent-auth enforcement and issuer/environment key isolation require explicit review and tests; signature validity is not revocation proof. |
| Shared transition | `accounts/accountTransition.ts`, `accounts/deviceAccounts.ts`, callback-attempt contract | Principal-owned queue preservation/quarantine and native transition wiring exist. Do not rebuild these. Code presence does not prove browser storage, cross-tab synchronization, process death or real provider callbacks. |
| Browser test | `apps/gurudevi-web/tests/e2e/auth-flows.spec.ts` | The password test titled successful entry expects a signed-out private-space prompt without Sanctuary running. Preserve it as characterization; add a distinct API-backed authenticated journey. |
| Sync | `powersync/sync-config.yaml`, `SupabasePowerSyncConnector.ts` | Canonical signed-claim filtering is in source. The linked instance remains unprovisioned per the preceding CLI audit; replication authorization, role/publication setup and offline replay are not operationally verified. |

Do not implement the old remediation sample by importing `@repo/database`
and creating a PostgreSQL connection inside a shared mobile/browser identity
adapter. Domain writes go through the existing authenticated Sanctuary API;
the server alone uses ZenStack/SQL credentials. Inject typed repository ports
into domain services and keep vendor repository composition in an adapter.
A renamed `.from(): any` interface is not sufficient decoupling.

## Remaining execution sequence

| Priority | Bounded work | Required exit proof |
| --- | --- | --- |
| P0: account runtime acceptance | Resolve target migration ledger; full-history bootstrap/rehearsal; actual Supabase hook and grant/RLS matrix; actual issuer-to-account API response. | Credential subject differs from UUIDv8 account, account references survive rekey, caller cannot choose/rebind account, missing/deleted/conflicting bindings deny. Actual provider refresh returns the expected canonical claim. |
| P1: UUID issuer completion | Settle bounded collision handling, environment-origin policy, transactional-clock contention and alert ownership without changing the registered layout. | Injected collision cannot duplicate/rebind an account or retry forever; clock failure is observable; realistic concurrent account creation has measured lock/latency bounds. Other UUID families remain separate admissions. |
| P0: verifier/session policy | Define revocation latency and sensitive-action assurance, review JWKS/environment/cache behavior and live-session checks. | Invalid/expired/revoked/mismatched tokens, unknown-key rotation, same-kid different issuers, provider outage and recent-auth/MFA denial scenarios. No unrestricted external grant acceptance. |
| P1: identity writes and composition | Inventory all profile/bond/onboarding callers; route authoritative writes through existing server commands; replace the factory's `any` facade with typed repository injection. | Actor derives from verified context; clients cannot set lifecycle/scope; timeout-after-commit and retries reconcile; no server database client enters the native/web bundle. |
| P1: credential stewardship | Define and implement authenticated credential listing/link/unlink, last-factor protection, recent-auth/step-up, recovery and audit receipts. Keep supported provider primitives. | Link collision, takeover, recycled contact, final-factor removal, expired recovery, replay and interrupted-provider-update scenarios; real supported-method ceremonies. |
| P1: client and sync acceptance | Release-like web API-backed journey; native account restore/switch/wake; actual PowerSync publication/auth/streams; account-bound offline commands. | A→B stale-response isolation, private cache teardown, A-owned queue retained, interrupted callback, revoked membership, offline restart/retry, real logout/deletion and reconnect. |
| P1: enforcement and operations | Repair audit execution; close boundary/mobile quality failures; issuer/environment inventory; key/credential rotation and provider outage procedures; redacted alerts and audit retrieval. | Gates execute against the intended source set, failures remain visible, actionable auth/sync/outbox signals exist, restore/recovery rehearsal is recorded. |
| Separate feature admission | Guest record transfer, channel UI/delegated actions, passkeys/phone methods where disabled, external OAuth, Neon migration, additional UUID entity families and browser offline tiers. | Feature-specific policy and evidence. They are not implicitly required or authorized by account UUIDv8 readiness. Any enabled feature must meet its own release gate. |

Client-state Phase 3.4/3.5 proceeds through its own admission plan; account
identity and safe-denial contracts apply throughout. Do not hold a release
solely for a cache-library migration if the existing implementation meets its
evidenced contract. Conversely, passing a library migration cannot substitute
for server authorization or an authenticated end-to-end journey.

The immediate implementation boundary is profile/bond/onboarding authority
and its caller inventory, alongside account-environment and verifier/session
acceptance. It is not a second general auth framework, a blanket rewrite of
every UUID, or a speculative second provider implementation.

## Evidence from this review

- G0/source inspection only: the findings above are traced to named current
  files and plan contents. No new product-runtime acceptance is claimed.
- `pnpm run check:supabase-boundaries` exits 1 with three findings:
  `packages/core/src/api/phoneAuth.ts`, its test, and
  `packages/core/src/spatial/spatialService.ts`. One is test code; adjudicate
  each finding rather than describing all three as live vulnerabilities.
  The checker scans packages only and still exempts the domain factory;
  it does not establish an app-wide import firewall.
- `node scripts/check-identity-alignment.mjs` exits 1 before producing an
  alignment result: it calls `stat` on the missing vendor-skill symlink
  `.agents/skills/vendor/pnpm-@swmansion+argent-argent-android-emulator-setup`.
  This is an audit execution failure, not evidence of an identity mismatch.
- Previous cutover tests/builds and outstanding mobile/quality failures remain
  recorded in the [cutover ledger](2026-10-25-canonical-uuidv8-account-cutover.md).
  They were not rerun or promoted to stronger evidence by this document review.

Documentation corrections in this slice are limited to contradictory account
adoption/assignment statements and links to this review. Historical records
remain in place. No credential method, route, test or runtime fallback was
removed by this review.
