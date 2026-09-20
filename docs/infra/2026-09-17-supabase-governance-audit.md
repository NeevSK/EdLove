# Supabase governance audit — production-equivalent shared target

**Scope:** read-only source and migration-history review of `apps/gurudevi-mobile/supabase` on 2026-09-17. No remote commands, migrations, secrets, functions, or application features were changed.

**Assessment:** do not treat the currently linked shared database as a safe target for more cross-domain rollout until the evidence gates below are met. The main problem is not a confirmed single policy defect; it is that the effective remote schema, policy, function-owner, grants, and Edge Function deployment settings cannot be derived reliably from this checkout.

## Boundary and confidence

- The requested decision document, `docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md`, is absent from this checkout and from reachable Git history. Its intended acceptance criteria therefore cannot be verified here.
- `supabase/SSOT_SYNC_PLAN.md` claims the linked remote was repaired and a linked dry-run was up to date, but records neither the project reference nor a timestamped remote schema/RLS/grant/function snapshot. It is an assertion, not reproducible evidence.
- `supabase/migration_status.md` was last updated 2026-02-11 and still tracks earlier, manually applied files, whereas the active migration directory has 118 versioned migrations extending to 2026-05-23. It must not be used to establish actual remote state.
- Local-source findings below are evidence of intended or historically executed DDL. They are **not proof** that the same objects are live on the shared target; remote catalog evidence is required before remediation.

## Findings and risk classification

| Risk | Finding | Exact source evidence | Why it matters / required proof |
|---|---|---|---|
| P0 — release blocker | Remote authority state is unproven. | `supabase/SSOT_SYNC_PLAN.md`; `supabase/migration_status.md` | Obtain a read-only catalog export of migration history, schema, RLS, grants, routines, triggers, views, storage policies, Auth configuration, and Edge Function deployment settings. Compare it to a clean local replay and preserve the artifacts. |
| P0 if invocation is public; P1 otherwise | Three privileged Edge handlers have no handler-level caller authentication or authorization: `enrich-staging`, `publish-resource`, and `library-etl`. They instantiate a service-role client; `publish-resource` can publish and delete by caller-supplied `staging_id`, while `library-etl` mutates a caller-selected node. | `functions/enrich-staging/index.ts:4-11`; `functions/publish-resource/index.ts:4-11, 14-42`; `functions/library-etl/index.ts:3-26, 31-145` | Verify hosted `verify_jwt` settings and all gateway/webhook invokers. Then prove a student, a teacher from another school, and an unauthenticated request cannot perform each mutation. A valid JWT alone is insufficient for these admin actions. |
| P1 | Tenant-insensitive pulse-log collection and broad internal reads. Any anon or authenticated caller may submit a pulse log with arbitrary `edu_school_id`, `author_profile_id`, and narrative; any authenticated caller may read all logs and climate records. | `migrations/20260416160000_school_climate_sensing_layer_v2.sql:57-65` | Decide whether these records are public feedback, internal institutional data, or sensitive wellbeing data. Prove submitter attribution/anti-abuse and school-scoped read access appropriate to that classification. |
| P1 | Privileged function surface is large and incomplete hardening is evident. Active migrations contain 122 `SECURITY DEFINER` occurrences; many declarations omit an explicit `search_path` in their creation statements. A later hardening migration changes only a named subset. | `migrations/20260416170000_architectural_hardening_and_zero_trust_enforcement.sql:12-49`; e.g. `20260318000002_community_full_stack.sql:91-120`, `20260503235959_create_bonds_table.sql:27-51` | Inventory every live routine owner, `proconfig`, EXECUTE grantee, argument signature, and call path. For every definer function, set a safe search path, revoke default `PUBLIC` execution, grant narrowly, and test authorization and tenant boundaries. |
| P1 | Identity grants and mutable identity bridge require live verification. Historical migrations grant `ALL` on `auth_identities` to `anon` and `authenticated`, while identity mapping and authorization helpers rely on it. | `migrations/20260309000002_fix_auth_fk_and_trigger.sql:103-142`; `migrations/20260311000000_fix_identity_rls_deadlock.sql:35-36` | Test a fresh anonymous user, registered user, and attacker account: no one may create/alter another user’s mapping, forge a provider link, or gain authority through identity bootstrap. Verify the final live policies rather than only these historical grants. |
| P1 | Public exposure must be explicitly classified. Examples include anonymous public-site stats, public school registry and geo data; two community counters are readable without an explicit role; library tables have authenticated-wide reads. Some are plausibly intentional, but ownership and fields are not documented as an API contract. | `migrations/20260320140000_public_site_stats.sql:34-45`; `20260323000000_school_registry.sql:36-40`; `20260325041500_decoupled_geo_replacement.sql:150-156`; `20260318000002_community_full_stack.sql:67-73, 153-158`; `20260313000000_library_knowledge_universe.sql:490-570` | Maintain an allowlist per exposed relation/view/RPC, data class, intended audience, fields, rate limits, and owner. Validate that no field later added to those objects silently becomes public. |
| P1 | Destructive/irreversible migrations exist in the active lineage, including `DROP TABLE ... CASCADE`, seed deletion, and a broad `DROP COLUMN ... CASCADE` ReBAC purge. A repaired migration ledger does not establish data compatibility. | `migrations/20260416160000_school_climate_sensing_layer_v2.sql:7-8`; `20260313000003_library_holistic_seed.sql:11-15`; `20260504000000_rebac_purge_legacy.sql:125-138` | Before any replay or rollout, classify each operation, capture row-count and dependency impact, create restore rehearsals, and require an approved compatibility/backfill plan. Never use the shared target for first execution. |
| P2 | The source inventory cannot demonstrate comprehensive RLS. A static comparison finds 108 created tables but only 94 tables with an `ENABLE ROW LEVEL SECURITY` declaration somewhere in active history; baseline comments also say its policy implementation is truncated. This is a triage signal, not confirmation of unprotected live tables. | `migrations/20260211170000_master_baseline.sql:395-448` | Produce live `pg_class.relrowsecurity`, `pg_class.relforcerowsecurity`, `pg_policies`, and table-grant reports. Every API-exposed, non-public table needs an explicit classification and a negative-access test. |
| P2 | No committed automated database policy/privilege test suite or CI gate was located. | Repo search found documentation and manual dry-run instructions, but no executable role/tenant test suite under the Supabase directory. | Add ephemeral-database tests for every role, tenant boundary, RPC, view, trigger, and Edge Function authorization path; gate promotion on them. |

## Safe target-isolation proposal

Use four independently credentialed Supabase projects: **local ephemeral**, **CI preview**, **staging**, and **production**. The present shared target is production-equivalent until this separation is complete.

1. Never run `migration repair`, `db push`, SQL-editor DDL, seed scripts, or function deploys against the shared target from a developer workstation.
2. Store each project reference and its purpose outside committed source; inject short-lived deployment credentials only in the approved CI environment. Do not reuse service-role keys, database passwords, Auth signing keys, storage buckets, or AI-provider keys across environments.
3. Require an explicit target assertion in CI (expected project reference + environment name) before any mutation. Production requires protected approval, a reviewed migration manifest, backups/PITR confirmation, and an exercised restore run.
4. Make a clean local/preview replay the first execution site. Promote the exact immutable migration/function artifact from preview to staging, then production—do not copy SQL manually through the dashboard.
5. Keep production data out of lower targets; use synthetic data or a minimized, formally approved and scrubbed snapshot. Treat student, identity, wellbeing, and school records as restricted.

## Staged remediation plan

### Stage 0 — freeze and establish facts (no feature work)

- Freeze production-equivalent schema, policies, functions, triggers, Edge Function deployments, secrets, and Auth setting changes except incident response.
- Have a target owner run approved **read-only** catalog collection against the shared target. Capture: project ref/environment, migration ledger, `pg_dump --schema-only` or equivalent, tables/views, RLS and force-RLS flags, `pg_policies`, table/default privileges, routines + owners + `proconfig` + EXECUTE grants, triggers, extensions, realtime publications, storage buckets/policies, Auth redirect/signup/MFA settings, and Edge Function names + JWT verification config.
- Run `supabase migration list --linked` and `supabase db push --linked --dry-run` only after a target-identity confirmation; retain raw output and timestamp. A clean dry-run does not replace ACL validation.
- Replay the active migration set into a disposable local database. Record failures, ordering dependencies, destructive effects, and the generated catalog snapshot. Do not repair history on the shared target as part of discovery.

**Exit evidence:** signed target inventory, downloadable source/remote diff, clean replay report (or a reconciled exception list), backup/PITR proof, and named accountable owners.

### Stage 1 — close high-risk public and privileged paths

- Disable or restrict privileged Edge Function invocations until each has server-side JWT verification, capability/role and tenant authorization, request schema validation, replay protection for webhooks, rate limits, and audit events. Use a separate signed webhook secret for automation; do not accept arbitrary client requests on service-role handlers.
- Define pulse-log data handling, then bind writes to a verified school context or a purpose-built anonymous intake endpoint with validation, abuse controls, data minimization, and scoped aggregation-only reads. Remove broad raw-log access unless an approved role needs it.
- Revoke unnecessary `anon`, `PUBLIC`, and broad `authenticated` privileges from live tables/functions. Re-grant minimum required permissions only after RLS and tests are in place.
- For `auth_identities`, prove bootstrap behavior with negative tests before reducing grants/policies; use a narrowly scoped registration RPC/trigger rather than direct client DML if possible.

**Exit evidence:** unauthenticated and cross-school negative tests pass; service-role actions are auditable; threat-model sign-off from security and identity owners.

### Stage 2 — normalize database authorization

- Create an authoritative relation/API register: data owner, classification, tenant key, reader/writer roles, public contract, retention, and incident owner.
- Review every API-exposed table, view, RPC, trigger, and realtime publication. Enable and, where appropriate, force RLS; remove permissive legacy policies; encode school/relationship checks in both `USING` and `WITH CHECK`.
- Inventory all definer functions. Pin `search_path` to trusted schemas (normally `public, pg_temp`), fully qualify object names, revoke `PUBLIC` EXECUTE, grant by exact signature, and test both direct calls and policy-mediated calls. Do not assume a later global hardening migration covered all historic functions.
- Replace mutable legacy role checks with the selected authorization model only after the impact analysis and dual-read/dual-policy tests succeed. The ReBAC purge must be treated as a separately approved, reversible migration program.

**Exit evidence:** reviewed ACL matrix; catalog shows no unexplained exposed objects or public/default grants; role × tenant contract tests pass; schema diff is approved.

### Stage 3 — promotion controls and recovery

- Version a canonical schema/policy/grant snapshot and generate it in CI from a fresh ephemeral database. Fail CI on unmanaged drift, nonconforming migration filenames, duplicate versions, missing RLS classification, unapproved grants, definer functions without safe configuration, or untested destructive SQL.
- Require a migration impact statement: forward/rollback or compensating strategy, data backup scope, lock estimate, validation queries, owners, and go/no-go criteria. Test recovery from a representative staging backup.
- Add operational alerting for RLS/permission denials, Edge Function auth failures, service-role mutations, unexpected public access, migration failures, and anomalous anonymous traffic. Review the access register quarterly and after every cross-domain change.

**Exit evidence:** successful staging promotion and recovery rehearsal, CI artifacts attached to the change, production approval record, and post-deploy catalog comparison.

## Required decisions before any remediation is applied

1. Which named project reference is production, staging, preview, and the present shared target—and who is permitted to mutate each?
2. Is the shared target actually serving real student/school/identity data? If yes, what backup, PITR, retention, and incident-response commitments apply?
3. Are anonymous school pulse submissions an approved product requirement? If so, what abuse, consent, visibility, and retention model is accepted?
4. Which relations/views/RPCs are intentionally anonymous-public, authenticated-global, school-scoped, or cross-school—and who owns each contract?
5. What is the canonical authorization model during transition: legacy `role`, `capacity`, bonds/ReBAC, or another model? No broad cleanup or purge should proceed without this decision.
6. Which automated actors may invoke `enrich-staging`, `publish-resource`, and `library-etl`, and what signed identity/capability will they present?
7. Who approves the source-of-truth reconciliation when local migration history, the stale manual tracker, and the remote ledger differ?

## Non-actions performed

No `supabase link`, `migration repair`, `db push`, `db reset`, dashboard query, function deployment, remote configuration update, or application feature change was performed for this audit.
