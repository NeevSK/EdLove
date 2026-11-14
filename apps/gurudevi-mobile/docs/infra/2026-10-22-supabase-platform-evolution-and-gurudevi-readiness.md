---
title: "Supabase 2026 Platform Evolution and Gurudevi Readiness"
status: "current-audit"
created: "2026-10-22"
updated: "2026-10-22"
author: "Codex"
tags: [supabase, platform-changes, database-security, data-api, migrations, audit]
---

# Supabase 2026 Platform Evolution and Gurudevi Readiness

**Research cutoff:** 2026-10-22 (Asia/Colombo).  
**Workspace:** `apps/gurudevi-mobile/supabase` and the linked hosted project `qzoawolfkuwiuyaoiybz`.  
**Method:** official Supabase changelog, docs, and blog only for upstream claims; repository migration/config inspection; read-only Supabase CLI queries for hosted state.  
**Scope:** dated 2026 changes through the cutoff that affect application compatibility, database/API security, schema operations, client runtimes, or project operations, plus the major monthly product/company announcements that explain the platform's direction. Event promotions, community showcases, and every third-party integration announcement are not individually cataloged.

## Executive summary

Supabase's 2026 direction has accumulated in layers: first reduce passive API/schema discovery, then make features such as GraphQL opt-in, then require explicit table grants as the default for new objects, and progressively lock down managed schemas and administrative access. The practical rule is now to treat **RLS policies, PostgreSQL grants, API exposure, and default privileges as separate controls**, and to encode each intended object/role contract in migrations.

The screenshot is accurate. On 2026-10-30, existing hosted projects are scheduled to stop automatically granting Data API table privileges to new `public` tables. Existing table grants remain. The rollout does not itself decide the right access policy for each Gurudevi table; the application must explicitly grant only the table operations and roles its code needs. [Supabase change notice](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

The live project was reachable using the installed CLI and read-only operations. At the time of this audit:

- CLI: `supabase` **2.121.0**; npm's `latest` stable tag is also **2.121.0**. No CLI upgrade is available or needed. `2.122.0-beta.12` is beta, and `3.0.0-next.22` is a prerelease; neither is an appropriate production-toolchain update by default.
- Runtime: repo `.nvmrc` is **24.21.0** and root `engines.node` is `>=24.0.0 <25`, already above the Supabase JS family's Node 22 minimum. Some workflows pin Node 22, which also meets that minimum.
- PostgreSQL: hosted server reports **17.6**. Installed extensions include `pgcrypto 1.3`; `ltree` and `btree_gist` were not present in `pg_extension` output. The Sep 25 note concerns 15.19/17.11 and may require pgcrypto re-encryption for affected legacy ciphers; the version and extension inventory alone do not prove the stored data needs action.
- Migration ledger: **176 matching local/remote versions**, **14 local-only versions**, **2 remote-only versions**. This is migration drift, not a grant audit result. Do not push or repair the ledger until each ID and the remote schema are reconciled.
- `public` default ACL for objects created by `postgres` currently grants `authenticated` all table privileges, `EXECUTE` on functions, and `USAGE/SELECT/UPDATE` on sequences. The catalog output did not show `anon` or `service_role` in those `public` default ACL entries. This is a snapshot before the announced October 30 rollout and differs from the target least-privilege posture: a new table may still be reachable by every authenticated client unless the default is changed or explicit table ACLs override it.
- Current public catalog audit: 443 ordinary/partition tables, 6 partitioned parents, and 11 views. `authenticated` has `SELECT` on all 443 ordinary/partition tables and all 6 parents. `anon` and `service_role` each have `SELECT` on 76 of 443 ordinary/partition tables. These counts include partitions and do not say whether RLS or application authorization makes access appropriate. They do show that grants are not uniform and must be checked against intended access before any bulk change.
- No remote SQL, migration push, grants, revokes, or project setting changes were performed.

## Temporal evolution: January 1–October 22, 2026

| Date | Upstream change | What changed over time | Gurudevi relevance / action |
| --- | --- | --- | --- |
| Jan 8 | PostgREST v14 rollout; Index Advisor and database observability guidance highlighted. | Data API internals advanced without an announced breaking API contract. | No migration required. Keep PostgREST client assumptions standards-based; use the Index Advisor as diagnostic input, not as an automatic schema authority. [January update](https://supabase.com/changelog/41796-developer-update-january-2026) |
| Jan 26 (announced) | `pg_graphql` becomes opt-in on new projects and is disabled on existing projects with no GraphQL traffic. | GraphQL ceased being a safe implicit project capability. | Confirm whether app/client code or generated tooling calls `/graphql/v1`; if so, verify extension presence and traffic, and provision it deliberately. [Official breaking-change index](https://supabase.com/changelog?types=breaking-change) |
| Feb 17 / Mar 11 / Apr 8 | Anon-key requests can no longer retrieve the Data API OpenAPI schema (new projects first, then all projects). | Normal table API calls remain; anonymous schema enumeration is removed. | Search clients/CI for root `/rest/v1/` calls used for discovery. Use authenticated/secret-key tooling for schema discovery; never move a service key into a client. [Breaking change](https://supabase.com/changelog/42949-breaking-change-removing-access-to-openapi-spec-via-the-anon-key) |
| Mar 5 | Storage performance/security overhaul announced; Log Drains on Pro; CLI/Studio support for Edge Function visibility. | Platform observability and managed Storage implementation changed; storage internal schema is managed. | Do not write custom DDL into `storage`; use Storage APIs/policies. Assess log export separately if operational needs justify it. [March update](https://supabase.com/changelog/43465-developer-update-march-2026) |
| Mar 11 | Rate limits added for recursive/nested Edge Function calls. | Function-to-function invocation is a bounded platform resource; recursive call patterns need explicit control. | Check Edge Function call graphs for recursion or retry fan-out before relying on nested invocations. [Official Edge Functions changelog](https://supabase.com/changelog?tags=edge-functions) |
| Apr 16 | CLI declarative schema management (`pg-delta`) entered public alpha. | A second schema workflow appeared alongside migration files. | Do not introduce a competing schema source of truth during current migration drift. Existing project uses timestamped migrations; keep that authoritative unless a reviewed migration changes the operating model. [CLI announcement](https://supabase.com/changelog/44938-public-alpha-declarative-schema-management-with-pg-delta) |
| Apr 20 | Supabase client libraries added automatic PostgREST GET/HEAD retries for transient 520, 503, and network errors. | Some transient read failures may now be retried by the client. | Account for retries in idempotence/rate and telemetry assumptions; do not assume writes are automatically retried by this change. [Retry announcement](https://supabase.com/changelog/45071-automatic-postgrest-retries-for-transient-errors) |
| Apr 24 | Dashboard RLS Tester entered feature preview. | Policy debugging gained a role-aware dashboard tool. | Helpful for manual diagnosis; it does not replace migration-backed policy/grant checks. [RLS Tester](https://supabase.com/changelog/45233-feature-preview-rls-tester) |
| Apr 28 → May 30 → Oct 30 | Public tables stop being automatically exposed: opt-out available Apr 28, new-project default May 30, enforcement for all existing projects Oct 30. | Broad implicit Data API grants are being replaced by explicit per-object grants. RLS behavior is unchanged and remains a separate layer. | Highest-priority codebase action. Every `public` object created in a migration must explicitly grant only needed role/verbs; keep sensitive objects unreachable, including from `authenticated`, unless an access path is intentionally supported. [Detailed rollout and remediation](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) |
| May 1 → Jun 1 | Supabase OAuth token endpoint changes successful response from HTTP 201 to HTTP 200. | A status-code assumption changed while success remains 2xx. | Search OAuth integrations for hardcoded 201; use 2xx/`response.ok`. [OAuth change](https://supabase.com/changelog/45468-breaking-change-oauth-token-endpoint-will-return-http-200-instead-of-201) |
| May 12 → Jul 1 | Hosted Postgres 14 support ends; projects still on it are scheduled for upgrade, and extensions removed from Postgres 17 require migration first. | Engine lifecycle now has a forced support boundary and extension-compatibility gate. | Hosted project is already on Postgres 17.6, so this cutoff is passed; extension inventory was still checked against the later 17.11 notice. [Postgres 14 notice](https://supabase.com/changelog/45827-deprecation-notice-support-for-postgres-14-ending-on-1st-july-2026) |
| May 8 → Jun 30 | Supabase JS family drops Node.js 20 support. | Client runtime support follows Node 22+ after Node 20 EOL. | Check Node versions in CI, API runtime, Edge/build tooling and lockfile consumers. Repository SSoT and installed SDK versions should be validated; do not upgrade unrelated framework packages as a side effect. [Runtime notice](https://supabase.com/changelog/45715-deprecation-notice-dropping-support-for-node-js-20) |
| Jun 3 | New free projects using default SMTP cannot customize Auth email templates. | Auth email customization depends on a configured custom SMTP provider for affected new free projects. | Relevant only if project creation/reprovisioning relies on customized templates under default SMTP. [Official breaking-change index](https://supabase.com/changelog?types=breaking-change) |
| May 25 / Jun 29 | `pg_graphql` 1.6 disables introspection by default for new projects and for projects that upgrade to that extension version. | GraphQL data operations continue, but schema discovery/codegen does not unless explicitly enabled per schema. | Determine whether the project uses GraphQL introspection or codegen; if yes, make opt-in explicit and preserve existing schema comments when editing. [Breaking change](https://supabase.com/changelog/46320-breaking-change-in-pg-graphql-1-6-0-graphql-introspection-disabled-by-default) |
| May 25 | Temporary, scoped database access tokens entered feature preview. | Safer temporary admin access became available without sharing a database password. | Prefer short-lived, role-scoped credentials for human troubleshooting when available; this is operational practice, not app runtime auth. [Official feature index](https://supabase.com/changelog?types=new-feature) |
| May 28 | Auth passkeys entered beta. | Passwordless WebAuthn became an optional Auth capability. | No action unless product explicitly adopts passkeys; do not infer adoption from the platform announcement. [Official feature index](https://supabase.com/changelog?types=new-feature) |
| Jun 11 | Realtime Broadcast added binary payload support. | Broadcast can transport binary data; older client libraries may drop it. | Not currently implied by the inspected Gurudevi migrations. Avoid relying on binary payloads until the exact client implementation supports them. [July update](https://supabase.com/changelog/47796-developer-update-july-2026) |
| Jun 18 / Jul 6 | Self-hosted Auth external URL gains `/auth/v1`; SAML endpoints change. | Self-hosted URL assembly changed. Hosted projects are not the primary target. | Local config points at the hosted platform; apply only if Gurudevi operates a self-hosted stack or SAML endpoint. [Self-hosted change](https://supabase.com/changelog/47093-self-hosted-supabase-api-external-url-to-include-auth-v1) |
| Jun 22 → Jul 9 | `log_connections` defaults off on new projects and is migrated for existing Free/Pro projects. | A diagnostic signal became opt-in rather than implicit. | If operational runbooks depend on connection logs, explicitly enable/configure logging and use supported log drains; do not assume default visibility. [Change notice](https://supabase.com/changelog/47197-log-connections-is-to-be-turned-off-by-default-for-new-projects-and-existing-free-pro-projects) |
| Jul 14 | Realtime schema becomes fully locked against object modifications. | Managed `realtime` objects cannot be created/altered/dropped; supported policies on `realtime.messages` remain. | Keep custom objects outside managed schemas. The repo's subscription/publication migrations should be checked for supported operations rather than direct schema DDL. [Breaking change](https://supabase.com/changelog/realtime-schema-locked-down-against-modification) |
| Jul 14 | Realtime Broadcast authorization and Presence authorization remain policy-driven through `realtime.messages`. | Realtime authorization is another policy boundary, separate from table Data API grants. | Review channel auth independently if using Broadcast/Presence. [Authorization docs](https://supabase.com/docs/guides/realtime/authorization) |
| Jul 21 | Supabase Pipelines entered public alpha; July also added multi-column Postgres Changes filters and binary support. | New CDC and richer Realtime capabilities appeared; alpha status matters. | No migration unless the app adopts them. Prefer stable current repository patterns for production flows. [July update](https://supabase.com/changelog/47796-developer-update-july-2026) |
| Aug 5 | Postgres Changes added AND-composed filters, operators, and column selection. | Realtime subscription filtering became more expressive. | Optional optimization only. Verify installed SDK/API signatures before use. [Feature article](https://supabase.com/blog/postgres-changes-filters-and-column-selection) |
| Aug 12 | Daily backup scheduling retry fix announced. | A platform reliability bug was fixed. | No app change; continue to verify backup/restore guarantees operationally. [Official database changelog](https://supabase.com/changelog?tags=database) |
| Sep 18 | Service health checks added to Advisors. | Advisor coverage expanded from schema/security checks toward Auth, Storage, Edge Functions and Data API health. | Use as an operator signal in the dashboard; record findings and verify through logs/metrics before changing code. [Official changelog](https://supabase.com/changelog?tags=data+apis) |
| Sep 21 | Dashboard navigation renamed Database Replication to Pipelines; read replicas moved to Infrastructure. | Studio navigation changed; API behavior did not. | Documentation-only impact. [Official improvement index](https://supabase.com/changelog?types=improvement) |
| Sep 23 | Management API `logs.all` endpoint removed; replacement `logs` endpoint expects ClickHouse SQL. | Observability automation API contract changed. | Search repo/operations for `/analytics/endpoints/logs.all`; migrate scripts if found. [Official breaking-change index](https://supabase.com/changelog?types=breaking-change) |
| Sep 25 | Postgres 15.19 / 17.11 minor release addresses CVEs, with possible `ltree`/`btree_gist` index and legacy `pgcrypto` action. | Managed Postgres maintenance may require extension/data-specific review. | Hosted is PostgreSQL 17.6 with `pgcrypto 1.3`; `ltree` and `btree_gist` are absent. Review the extension-specific guidance before any upgrade; do not run reindex or re-encryption blindly. [Official database changelog](https://supabase.com/changelog?tags=database) |
| Sep 25 onward | Logs pricing announced as usage-based with grace period into early 2027. | Log cost becomes a capacity/retention concern. | Review project log volume and retention/export cost before increasing verbosity. [Announcement](https://supabase.com/changelog/logs-usage-based-pricing) |
| Oct 6 | Scoped Personal Access Tokens became generally available. | Management API/CLI access can be narrower by project and permission. | Replace broad human automation tokens when feasible; use minimum scope and avoid storing plaintext secrets. [Official CLI changelog](https://supabase.com/changelog?tags=cli) |
| Oct 12 → Nov 10 earliest | Four CBC-mode TLS 1.2 suites scheduled for removal from project HTTP APIs. | Old client TLS stacks may lose access to Auth, Data API, Storage, Realtime and Edge Functions. Direct Postgres/pooler/Management API are unaffected. | Validate supported Android/iOS/OS TLS stacks and any embedded clients; upgrade old runtimes. Deadline is after this audit cutoff. [Notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated) |
| Oct 13 | Declarative Schemas 2.0 replaces `migra` with `pg-delta` for the new workflow; it can diff RLS, grants, view properties, partitions and other catalog objects, but remains alpha. | Schema tooling is accumulating broader privilege/policy coverage, but is still an alternate workflow requiring explicit opt-in for existing projects. | This repo's CLI 2.121.0 meets its minimum version. Do not enable it during current ledger drift; evaluate only after a canonical baseline exists, then review generated grants and destructive diffs line by line. [Official guide](https://supabase.com/blog/declarative-schemas-2-0-pg-delta) |
| Oct 14 | CLI experimental mode can run multiple isolated local Supabase projects/worktrees and a native local runtime; requires CLI 2.119+. | Local testing can isolate agents/worktrees without Docker, but the mode and flags remain experimental. | Installed CLI is new enough, but do not switch local stack configuration automatically; first compare with the repo's documented Podman/Postgres harness. [Official guide](https://supabase.com/blog/local-supabase-project-per-agent-with-or-without-docker) |
| Oct 15 | Branch workflows detail config, migrations and Edge Function propagation; GitHub-connected branches source files from the repo, while Gitless branches inherit from the main project's stored history. | A preview branch's migration and function state depends on how it is connected, and migration errors stop later seed/deploy steps. | When validating preview branches, record branch type and verify their history matches the checked-in migration set. Current hosted ledger drift makes this especially important. [Official branch workflow](https://supabase.com/blog/how-a-new-branch-gets-its-config-migrations-and-functions) |
| Oct 30 (upcoming at audit) | Existing-project default Data API table grants change. | Future `public` tables stop inheriting broad client grants; existing table ACLs remain. | Complete grant/default-ACL and migration drift reconciliation before deploying pending migrations. [Rollout](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) |

### The cumulative direction

The changes are not one switch. They accumulate as:

1. **Less automatic discovery:** anon-key OpenAPI access and GraphQL introspection become restricted/opt-in.
2. **Less automatic capability:** GraphQL itself and new table access are no longer safe assumptions on fresh projects.
3. **Explicit authorization layers:** PostgreSQL grants decide whether an API role may reach an object; RLS decides which rows are visible; function execution and Realtime channel policies are separate contracts.
4. **Managed boundary hardening:** platform-owned schemas (`auth`, `storage`, `realtime`) are not extension surfaces for application-owned DDL.
5. **Operational access and evidence become narrower:** scoped tokens, role-based temporary database access, health checks, log drains, and changed logging defaults require operators to choose visibility/access intentionally.
6. **Compatibility follows supported runtimes:** Node.js 20 support ended for the Supabase JS family; pg_graphql introspection and HTTP TLS defaults also tightened.

This is a progressive removal of permissive defaults with more explicit operator intent. The correct response is a per-object access inventory and migration contract, not a global grant that recreates the old broad exposure.

### Broader announcements that explain the platform direction

This companion pass captures notable releases and company/platform announcements that are not individually breaking changes. They should not be treated as adoption requirements.

| Period | Major announcement themes | Practical interpretation |
| --- | --- | --- |
| January | Security roadmap, PostgREST v14, Index Advisor, metrics guidance, Python type generation, and documentation/quickstarts. [January update](https://supabase.com/changelog/41796-developer-update-january-2026) | Better diagnostics and typed tooling; no project migration implied. |
| February | PrivateLink GA, Postgres best-practice guidance for agents, official Claude connector, and early notice of GraphQL becoming opt-in. [February update](https://supabase.com/changelog/42531-developer-update-february-2026) | Broader managed connectivity and agent tooling, alongside reduced default API surface. |
| March | Pro Log Drains, Storage performance/security work, and Edge Functions visibility in local/self-hosted Studio. [March update](https://supabase.com/changelog/43465-developer-update-march-2026) | Operability expanded; managed storage boundaries hardened. |
| April | GitHub integration on all plans, Multigres Operator open source, Stripe Projects preview, docs over SSH, pg-delta alpha and the RLS Tester. [April update](https://supabase.com/changelog/44713-developer-update-april-2026) | More schema-as-code/agent workflows emerged; alpha tools should not replace the stable migration chain without a deliberate migration. |
| May | Custom OAuth/OIDC providers, `@supabase/server`, Gitless branching becoming default, Data API default-grant change announced, and security/ISO announcements. [May update](https://supabase.com/changelog/45702-developer-update-may-2026) | More integration options, with branch provisioning and schema grants becoming more explicit. |
| June | Passkeys beta, official ChatGPT app and coding-agent plugin, temporary scoped database access preview, Multigres 0.1 alpha, client tracing, and Supabase Series F. [June update](https://supabase.com/changelog/46689-developer-update-june-2026) | Human and agent operations expanded; use least-privilege credentials and treat alpha infrastructure as experimental. |
| July–August | OpenCode integration, TanStack DB sync alpha, MongoDB FDW, Pipelines alpha, binary Realtime, Postgres Changes filtering/column selection, Supabase Evals, ChatGPT sign-in beta, and Grafana Cloud/log-trace integrations. [July update](https://supabase.com/changelog/47796-developer-update-july-2026) · [Product announcements](https://supabase.com/blog) | More data movement and agent/observability options; none are required for Gurudevi without an explicit product decision. |
| September | Supabase connector for Gemini Enterprise, health-check Advisors, log usage metering/pricing notice, and management API `logs.all` retirement. [Official changelog](https://supabase.com/changelog?types=improvement) | Operational visibility increased while telemetry cost and management API compatibility need attention. |
| October (to cutoff) | Turso acquisition announcement, OrioleDB public beta, scoped PAT GA, Select 2026/Declarative Schemas 2.0, per-worktree local Supabase projects, branch workflow detail, Supabase Middleware 1.0, official .NET SDK, and upcoming TLS cipher removal. [October company announcement](https://supabase.com/blog/supabase-is-acquiring-turso) · [Declarative Schemas 2.0](https://supabase.com/blog/declarative-schemas-2-0-pg-delta) · [Local projects per agent](https://supabase.com/blog/local-supabase-project-per-agent-with-or-without-docker) | More code-first/agent-centered workflows are arriving, but repo migration drift should be cleared before adopting alternate schema workflows. |

The acquisition announcement explicitly says existing Supabase users see no immediate change: Supabase continues to build around Postgres while Turso continues SQLite. The announcement is strategic context, not a database migration directive. [Supabase/Turso announcement](https://supabase.com/blog/supabase-is-acquiring-turso)

## Gurudevi repository and hosted database evidence

### Local configuration and migration design

- Supabase workspace is `apps/gurudevi-mobile/supabase`; `config.toml` exposes `public` and `graphql_public` to the local API and sets Postgres major version 17.
- Supabase JS dependencies are `@supabase/supabase-js` and `@supabase/postgrest-js` **2.117.2**. Repo runtime baseline is Node 24.21.0; the Supabase JS Node 20 support change does not require a runtime upgrade here.
- The repository has a timestamped migration chain, SQL migration tests, archived historical migrations, and Edge Functions. There is no `seed.sql` at the configured path, so local seed configuration should be reconciled separately.
- Many migrations contain explicit grants. Some later table-creation migrations do not contain an obvious per-table grant in the same file. A lexical scan is not enough to classify them: a shared grant, a later reconciliation migration, or an intentionally private table can change the conclusion.
- Among the 2026-10 local-only migrations, `20261010180000_institutional_erp_and_educational_economics.sql` creates nine RLS-enabled tables and `20261010193000_user_wallpaper_assets.sql` creates one RLS-enabled table. I updated these unapplied migrations: all ten first revoke default API-role privileges; the four institutional tables with authenticated policies receive only their corresponding SELECT or CRUD grants, and wallpaper assets receive SELECT/INSERT/DELETE for `authenticated`. The other five institutional tables have no authenticated policies and remain unavailable to `anon`, `authenticated`, and `service_role`. A direct hosted catalog lookup confirmed all ten tables are absent remotely, so this is a pre-deployment fix rather than a production permission change. A current source search found no mobile/core direct table calls for these names; `user_wallpaper_assets` is used by Sanctuary API code over server SQL, so its client Data API surface remains constrained to the written RLS contract.
- Other pending migrations make an explicit decision: `workspace_mutation_receipts` and `operation_receipts` revoke `anon`/`authenticated` (server-owned); the omnichannel and plan-bridge migrations contain grants. Keep these private/server-only decisions intact.
- `20260809140000_reconcile_schema_drift.sql` explicitly grants CRUD on a broad list of tables to both `authenticated` and `anon`. This is a high-priority least-privilege review, especially for financial and audit tables; do not repeat those broad grants for future tables without proving the clients and policies require them.
- The local migrations include 2026-10-10 through 2026-10-17 feature migrations, and these are currently absent from the hosted migration ledger.
- Lexical application/source scan found no app call to `/graphql/v1`, `graphql.resolve`, or `/v1/oauth/token`; the hosted extension inventory also did not include `pg_graphql`. `graphql_public` is present in local API config, but that alone does not prove the extension or GraphQL API is active remotely.
- The same scan found no repo reference to the removed Management API `logs.all` path. This is source-search evidence, not proof about dashboard configuration or external operator scripts.
- Repo migration search found trigger/function work on `auth.users`, but no direct DDL targeting objects in the managed `storage` or `realtime` schemas. These application-owned triggers should still be validated with the current hosted Supabase behavior.

### Hosted migration ledger (read-only, 2026-10-22)

`pnpm --filter gurudevi-mobile exec supabase migration list --linked --output-format json` returned:

- **176 versions present both locally and remotely**.
- **14 local-only IDs:** `20260302094049`, `20260503174100`, `20261010180000`, `20261010190000`, `20261010193000`, `20261011174500`, `20261011193000`, `20261014120000`, `20261015130000`, `20261015150000`, `20261015160000`, `20261017085000`, `20261017190000`, `20261017210000`.
- **2 remote-only IDs:** `20240319000000`, `20260302000000`.

Interpretation: the ledger is not a clean linear match. The old remote-only IDs and the local-only historical ID are consistent with prior migration rename/repair history, while the 12 October IDs are recent pending local work. Do not infer that those SQL changes are safe to push solely from the ledger output. Compare each pending migration's effects to the live schema and app usage; reconcile any renamed/applied migration through the documented migration repair process only after proving the remote schema state. Current relevant context: [migration order repair decision](../decisions/2026-10-15-relief-inventory-migration-order-repair.md) and [SSOT sync plan](../../supabase/SSOT_SYNC_PLAN.md).

### Hosted default privileges and existing grants

Read-only `supabase db query --linked` inspection of `pg_default_acl` showed, for role `postgres` in schema `public`:

| Object class | Current default ACL observed | Consequence if unchanged |
| --- | --- | --- |
| Tables (`r`) | `authenticated=arwdDxtm` | New tables created by `postgres` inherit all table privileges for authenticated users unless their grants are revoked. |
| Functions (`f`) | `authenticated=X` | New functions created by `postgres` inherit EXECUTE for authenticated users unless separately revoked. |
| Sequences (`S`) | `authenticated=rwU` | New sequences inherit read/write/usage for authenticated users. |

`anon` and `service_role` were absent from these three `public` ACL entries. The 2026-10-30 announcement explicitly describes revoking Data API-relevant defaults for `anon`, `authenticated`, and `service_role`; this live snapshot is still permissive for `authenticated`. It may reflect a project-level historical customization. Confirm after rollout whether Supabase has changed the ACLs, and make the intended defaults reproducible in reviewed migrations or provisioning configuration. Avoid applying the announcement's sample `ALTER DEFAULT PRIVILEGES` block blindly: default ACLs are scoped by object-creating role and schema, and existing objects are unaffected.

Existing object ACL summary (catalog capability check, not an RLS test):

| Object kind | Role | Objects with SELECT | Total objects inspected |
| --- | --- | ---: | ---: |
| Partitioned parent tables | `anon` | 0 | 6 |
| Partitioned parent tables | `authenticated` | 6 | 6 |
| Partitioned parent tables | `service_role` | 0 | 6 |
| Ordinary/partition tables | `anon` | 76 | 443 |
| Ordinary/partition tables | `authenticated` | 430 | 443 |
| Ordinary/partition tables | `service_role` | 76 | 443 |
| Views | `anon` | 6 | 11 |
| Views | `authenticated` | 11 | 11 |
| Views | `service_role` | 5 | 11 |

The count includes partition children as separate relations. It is not a count of distinct logical tables. A grant is not proof that rows are exposed: RLS, view security mode, function ownership, and client role/JWT still matter. Conversely, a missing table grant blocks API access before an RLS policy can allow a row. Follow up by producing a name-level inventory joined to RLS enablement, policies, table ACLs, RPC grants, and actual client/server call sites.

### CLI and remote inspection evidence

- Installed package CLI: `2.121.0` (`pnpm --filter gurudevi-mobile exec supabase --version`).
- Registry query on 2026-10-22: stable `latest=2.121.0`; beta `2.122.0-beta.12`; next `3.0.0-next.22`.
- Linked project reference comes from the existing local Supabase link file. No secret values were printed or copied into this document.
- Read-only commands succeeded for `migration list --linked` and `db query --linked`.
- Read-only server query returned PostgreSQL `17.6`; installed extension inventory returned `pgcrypto 1.3`, `postgis 3.3.7`, `vector 0.8.2`, and the other versions shown by the live `pg_extension` catalog. `ltree` and `btree_gist` were absent.
- A first combined SQL query asked for a relation alias outside its `FROM` clause and returned PostgreSQL error `42P01`; it did not mutate data. Separate single-statement catalog and version queries succeeded.
- CLI package is already at the stable registry latest. Do not switch this repo to a beta/next CLI merely to increase the version number.

## Implementation plan

### P0 — reconcile hosted migration drift before any push

1. Inspect the 14 local-only migrations and their DDL, policies, grants, functions, and app callers. Check whether each is already represented in hosted schema despite a missing ledger row.
2. Investigate the two remote-only IDs against Git history, `supabase/old/`, archived migrations, and documented migration repairs. Preserve migration contents and production data; do not delete or rename further migration files as a shortcut.
3. Query the hosted schema and `supabase_migrations.schema_migrations` by ID, then record a reviewed reconciliation table. Do not run `db push`, `migration repair`, `db reset`, or a bulk grant/revoke as part of this audit.

### P0 — establish explicit grant contracts for future objects

1. **Implemented locally:** reviewed remaining pending migration table DDL and app/server call paths. Added explicit grants to `relief_assignments` and `inventory_items` matching their authenticated principal policies; added explicit grants to `student_guardian_relationships`, `school_mode_policies`, and `calendar_events` matching their authenticated read/write policies. Server-only `school_mode_usage_daily` and `school_notice_events` now explicitly revoke API-role access. The nine institutional tables and wallpaper table already received precise grant/revoke decisions above. The private receipt and omnichannel tables already had explicit revokes.
2. **Implemented locally:** grants are adjacent to their migration policy definitions and revoke broad inherited authenticated access before restoring only the policy-backed verbs. `anon` receives no access on these tables. Server-only tables are not exposed to `service_role` through PostgREST; the Sanctuary API uses its configured database connection for these operations.
3. Decide whether the hosted project's authenticated default ACL should be revoked. If the target is “private until explicitly granted,” explicitly revoke all relevant default privileges for the actual object creator(s), then explicitly grant per object. Account for custom functions called by RLS policies before removing default function EXECUTE; do not revoke `PUBLIC` function execution globally without checking policy helper dependencies.
4. **Implemented locally:** `pnpm run check:supabase-migration-grants` checks migrations timestamped October 1, 2026 onward, including pending work likely to be applied after the October 30 cutoff; every public table created there must have a table-level `GRANT` or `REVOKE` decision. Private tables pass through an explicit revoke. This is a focused static gate for the announced change, not a substitute for reviewing policies and callers, and it does not retrofit older migration history.
5. Review `20260809140000_reconcile_schema_drift.sql` in the context of current production use; do not broaden its access further. Any reduction of existing access is a separate behavior/security change and requires compatibility review.

### P1 — verify feature/runtime assumptions against this workspace

- Source scan found no root `/rest/v1/` OpenAPI discovery calls or `/v1/oauth/token` usage; OAuth status-code migration is not indicated by the repo.
- Runtime check is favorable: repo SSoT uses Node 24 and the pinned Node 22 CI exceptions remain supported by the Supabase JS family. Keep future Supabase client-library use on Node 22 or later.
- Source scan found no GraphQL endpoint/RPC usage and remote `pg_graphql` was not installed; confirm dashboard/client telemetry before treating GraphQL as definitively unused.
- Repo search found app-owned trigger/function changes on `auth.users`, but no direct DDL creating or altering objects in `storage` or `realtime`; keep future product-owned schema in `public` or an explicitly exposed custom schema.
- Source scan found no `logs.all` Management API reference; check any operator scripts stored outside this repository.
- Hosted engine is PostgreSQL 17.6 with `pgcrypto 1.3`; `ltree` and `btree_gist` are not installed. Review the September upgrade note's pgcrypto cipher-specific guidance before any upgrade/maintenance; do not infer stored ciphertext needs re-encryption from extension presence alone.
- Check supported Android/iOS and server TLS stacks against TLS 1.2/1.3 support ahead of the announced November 10 earliest cipher removal.

### P2 — controlled verification and rollout

1. Run a fresh local migration bootstrap against the repository's supported PostgreSQL/Supabase CLI environment once migration drift is resolved; keep local reset isolated from hosted DB.
2. Exercise grant and RLS contracts as `anon`, `authenticated`, and server-side `service_role`, including intended denial cases. Do not substitute RLS success for grant correctness.
3. Compare schema, ACLs/default ACLs, policy behavior, and migration ledger in a preview branch/project before production rollout.
4. Review a raw diff and obtain production migration approval before applying any hosted schema change.

## Do not conflate these controls

| Control | Question it answers | Example |
| --- | --- | --- |
| API schema exposure | Is this schema served by PostgREST/GraphQL at all? | `api.schemas` / Dashboard Data API settings |
| PostgreSQL object grant | Can this database role reach this table/function/sequence? | `GRANT SELECT ON public.catalog TO anon` |
| RLS | Which rows can an allowed role read/change? | `CREATE POLICY ... USING (auth.uid() = owner_id)` |
| Function execute privilege | Can the role invoke an RPC? | `GRANT EXECUTE ON FUNCTION ... TO authenticated` |
| Realtime authorization | Can the user join/publish/receive on a channel? | RLS policy on supported `realtime.messages` interface |
| Secret key boundary | Does the caller bypass RLS? | Server-only service-role/secret credentials |

## Source index

Primary sources are linked inline above. The central current references are:

- [Data API security guide](https://supabase.com/docs/guides/api/securing-your-api)
- [2026 new-table grant change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Official breaking-change changelog](https://supabase.com/changelog?types=breaking-change)
- [Official database changelog](https://supabase.com/changelog?tags=database)
- [Official Data API changelog](https://supabase.com/changelog?tags=data+apis)
- [Official CLI changelog](https://supabase.com/changelog?tags=cli)
- [Official TLS requirements](https://supabase.com/docs/guides/security/tls)
