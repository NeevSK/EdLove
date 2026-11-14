---
title: "Capability-Ready Gurudevi Delivery Goal"
status: "active"
created: 2026-10-14
updated: 2026-10-14
author: "Naveen"
scribe: "Codex"
tags: [goal, roadmap, api, web, mobile, channels, lms, workflows, security]
---

# Capability-Ready Gurudevi Delivery Goal

Execution now follows the [Integrated Foundation Programme](2026-10-15-integrated-foundation-programme.md).
This document retains the historical checkpoints; later entries qualify earlier claims.

## Objective

Bring Gurudevi from the audited horizontal foundation to a capability-ready product envelope without creating parallel domain systems:

- Sanctuary API is the authoritative, channel-neutral capability boundary.
- Web and mobile are the first real clients and consume the same contracts.
- Explore is a safe public catalogue and local-practice surface, never an anonymous Sanctuary API.
- Email, phone, and future WhatsApp/Telegram entry points converge on one canonical account/subject.
- AI, MCP, WebMCP and workflow runners propose or execute only through declared capabilities, authorization, consent, delegation and receipts.
- LMS workflows are introduced additively after real task transitions prove the reusable shape; no generic workflow engine is built prematurely.

## Non-goals and refusal boundaries

- No GraphQL, microservice split, parallel database, or second policy engine.
- No channel-specific domain rules or direct channel writes around the API.
- No generic workflow engine before at least one real LMS workflow has durable transition evidence and a second workflow confirms reuse.
- No AI or agent may commit a protected educational record without the declared human-confirmation/delegation boundary.
- No deletion or deprecation of working routes, handlers, fallbacks or legacy scaffolding without a separate approval record.

## Phased delivery

### Phase 0 — Baseline and ownership (current)

**Outcome:** one truthful map of active contracts, clients, adapters, identity boundaries and known failures.

**Work:** preserve the horizontal foundation audits; keep API/core, web/mobile, and workflow ownership separate; maintain the Explore/live security gate; record evidence limits and residual risks.

**Exit:** every subsequent change names an impact set, owner, rollback/compatibility story and evidence level.

### Phase 1 — Capability-ready API and client floor

**Outcome:** a named protected capability can be consumed safely by web and mobile through one contract.

**Work:** finish authn/authz and scope derivation for the selected capability; apply strict input/output/error contracts; complete cancellation, timeout, idempotency, operation receipt and audit semantics; verify the web/mobile client adapters do not duplicate domain logic; retain Explore local-only behavior.

**Exit gate:** G1/G2 evidence covers allow/deny, forged scope, duplicate/replay, changed-payload conflict, timeout/dependency failure, account switch, offline draft and recovery. Full repository typecheck may still have pre-existing failures, but the selected impact set must be clean or have explicitly documented unrelated blockers.

### Phase 2 — First LMS task workflow

**Outcome:** one real workflow is reliable end to end, beginning with assignment submission/review/grade or an equally bounded classroom operation.

**Work:** model domain task state separately from UI workbench tasks; define legal transitions, actor/resource authority, receipts, evidence, deadlines and human review; ensure domain commit and audit/outbox intent have clear transaction boundaries.

**Exit gate:** a duplicate request is safe, an ambiguous provider/network outcome is queryable, a stale scope is denied, offline drafts do not become commits accidentally, and a human can repair or reconcile a failed transition.

### Phase 3 — Second workflow and reusable seam

**Outcome:** a second real process (for example attendance correction, lesson publication, enrollment/invite or teacher-note promotion) demonstrates which workflow primitives are genuinely common.

**Work:** extract only proven shared concepts such as transition commands, task assignment, approval, receipt and event history. Keep domain-specific policy and records in their owning packages.

**Exit gate:** two workflows share infrastructure without sharing misleading domain semantics or creating a universal `any`-shaped command endpoint.

### Phase 4 — Channel adapters

**Outcome:** WhatsApp and Telegram can onboard, link and drive one low-risk capability through the same API.

**Work:** signed webhook ingress, replay protection, pending channel-proved subject, step-up identity proof, explicit consent/linking, bounded channel capabilities, generic anti-enumeration responses, provider receipts and repair.

**Exit gate:** provider retries, duplicate buttons/messages, revoked links, wrong account, expired invite, unknown delivery and operator recovery are all evidenced.

### Phase 5 — Agentic and workflow projections

**Outcome:** MCP/WebMCP, n8n/LangChain/Mastra-style runners and device assistants can discover capabilities and submit bounded proposals.

**Work:** capability discovery, proposal/draft mode, human confirmation, explicit delegation, agent identity, resource/time limits, audit and revocation. Keep provider/framework choice behind adapters.

**Exit gate:** prompt text, tool metadata or channel identity cannot elevate authority; every external effect is attributable, replay-safe and reversible or explicitly irreversible.

## Priority order

1. API hardening for web/mobile.
2. Shared web/mobile capability consumption and phone/email entry.
3. One durable LMS task workflow.
4. WhatsApp/Telegram adapters.
5. MCP/agent/workflow projections.

This order keeps future doors open without allowing future channels or workflow machinery to conceal unfinished authority, error, data-integrity or recovery foundations.

## Completion definition

The renewed API-first goal is complete only when the named foundation envelope has accepted identity/authority, contract, data-integrity, resilience/privacy and recovery evidence. Phase 2 workflow implementation and later channel/agent delivery are subsequent goals, not prerequisites that expand this foundation effort. “The API is ready for anything” is not an acceptable evidence claim; readiness is capability-scoped and channel-scoped.

## API-first implementation checkpoint — 2026-10-14

The human explicitly reprioritized full horizontal API hardening before workflow implementation. Phases 2–5 remain downstream; the assignment submission is a representative mutation probe, not approval to expand a generic workflow engine. The goal service still reports the historical goal as paused and refuses a duplicate goal; repository work continues under the human's explicit proceed instruction, without claiming the service status was changed.

### Implemented and verified in this checkpoint

- Shared oRPC error projection turns unknown exceptions into a generic internal error with request correlation. Bootstrap unexpected-error logging excludes raw messages. Declared oRPC error code/message/data remain intact; their safe-data validation still requires per-contract review rather than a blanket incompatible rewrite.
- Assignment replay/conflict behavior is exercised through mounted native RPC with an opt-in stateful database fixture: identical intent replays the same record, changed content conflicts, and teacher history retains one record. Fixed the Array.map callback-index leak into the submission outcome field.
- Static API blockers repaired: typed AdRewards user context, declaration-only inherited APIError cause field, and installed Sentry 11.6.0 session-sampling option. No profiler integration, provider deployment or sampling-delivery proof was added. These changes preserve the existing auth/routes; unrelated dirty-worktree changes were not reset.

**G0 / TypeScript:** final `pnpm exec tsc --noEmit --pretty false` in sanctuary-api exits zero. This is API-package compilation, not a monorepo pass or runtime proof. Targeted Biome checks on the educational/error handlers and tests exit zero. Raw diffs were reviewed, including compatibility-sensitive removals; no routes or working fallbacks were removed by this checkpoint.

**G1 / Vitest 5.0.3:** education, bootstrap, sync, JWT and diagnostics selection produced 48/48 across five files before final error integration. The six-file integration run produced 46 passing tests plus a diagnostics setup-hook timeout (five tests did not execute); no hook budget was increased. An unchanged focused rerun of diagnostics and final error projection produced 8/8 across two files. Selections overlap and are not a unique aggregate coverage count. Authentication/database/provider dependencies are substituted. This proves named boundary contracts, not real database constraints, concurrent commits, deployment isolation, real revocation or production telemetry.

**Repository checks:** monorepo `pnpm check-types` exits one at core with 41 reported type errors, including installed declaration and existing domain/layout failures; standalone version-drift exits zero; test-evidence exits one on the existing unlevelled edlove-web runner; anti-slop exits one at aislop with 44 errors and 724 warnings across 3,332 files. Later chained stages did not run. Security dependency findings require reachability and exact-version remediation review, not attribution wholesale to this patch. No strictness suppressions, gate bypasses or unconstrained upgrades were added.

### Immediate remaining foundation queue

1. Restore exact-lockfile dependency declarations and core compilation; do not mask missing artifacts with ambient any.
2. Complete authority/context parity and tenant/resource-negative coverage across registered entrypoint families.
3. Roll out output and declared-error validation namespace by namespace with truthful DTO fixtures; native error contracts must remain compatible.
4. Add schema-backed payload-bound operation receipts and atomic record/event/outbox settlement for the chosen educational mutation; current uniqueness plus replay outcome is not a durable receipt ledger. Require real DB concurrency/restart evidence.
5. Close early correlation, verified proxy/fairness, whole-operation time budgets, logging/telemetry redaction and process drain/restore evidence.

The horizontal foundation and release gates remain open. No workflow or channel expansion substitutes for these requirements.

## Renewed active goal and Self contract checkpoint — 2026-10-14

The goal service successfully created the refined foundation objective with status `active` after the human requested registration again. This supersedes the earlier paused-service observation above. The refined objective is API foundation first, retaining decoupled web/mobile, Explore-local/Sanctuary-live, phone/channel identity, LMS workflow and delegated-agent seams without speculative orchestration.

### Feature spec: Self output enforcement

- **Blast zone:** AMBER API handler boundary.
- **Targets:** `src/core/handlers/self.ts`, `src/__tests__/self.orpc.test.ts`.
- **Reuses:** shared Self schemas, existing converter `validateResponses`, authorization middleware, test fixture setters and native RPC harness.
- **Does not:** loosen schemas, modify authorization, add routes, change database schema, add provider calls or implement workflows.
- **Budget:** fewer than 50 added production lines; one small journal projection used twice.

Self now opts into declared response validation. Journal create/history return an explicit declared projection rather than spreading the entire database row. Existing content-preview and burned-state behavior is retained; declared `burned_at` is projected as a nullable ISO value. Undeclared internal database fields no longer enter the response. This is not secure erasure or privacy compliance certification.

**G1 / Vitest 5.0.3:** Self, error-projection and capability-bootstrap suites yield 34/34 across three files with authentication/database dependencies substituted. New assertions reject malformed mood output and ensure synthetic internal-secret/raw-content fields do not appear in journal history. The first privacy test failed with output validation because the journal handler spread the extra fields; the handler projection was repaired without loosening schemas or changing the assertion. Does not prove all Self operations, actual database isolation, production logs, browser/device behavior, or real provider configuration.

**G0 / TypeScript:** direct API `tsc --noEmit` exits zero after this change. The broader repository blockers recorded above remain; no monorepo-green claim is made. Raw unified diff review confirms the bounded projection and validation changes; no routes, authorization guards or recovery paths were removed.

## Verification integrity and early-ingress checkpoint — 2026-10-14

The previous goal turn made verified progress. This continuation restored missing installed dependency artifacts and advanced correlation/privacy enforcement, without changing package versions or redefining the goal.

### Frozen installation repair

The missing `@powersync/common@2.3.1/lib/index.d.ts` and `@growthbook/growthbook@1.8.0/dist/index.d.ts` were rechecked and confirmed absent. A normal filtered frozen install reused existing artifacts and did not repair them. The subsequent `pnpm --filter @repo/core... install --force --frozen-lockfile --ignore-scripts` completed successfully: 7 of 31 workspace projects selected, 2,741 installed packages relinked, no lifecycle scripts run. Both declarations are now present. The pnpm lockfile SHA-256 before/after is `B8290783EFDF44F2120595069AE68B1320F55BA77B37881B4984346E9E375CF9`; no version or lockfile update occurred.

With declarations restored, eight real core errors remained. Six test fixtures now use the actual mutation enum; crypto inputs are copied into concrete owned ArrayBuffers without unsafe casts; and native layout intent hydration translates a nullable patch wallpaper to the optional native representation without losing preset/motion. These fixes do not certify mesh security or physical-device networking.

### Feature specs and ownership

- **API ingress / AMBER:** `src/core/app.ts`, `src/core/routes/orpc.ts`, plus two new tests. Reuses Hono requestId and existing native route dispatch; retains all routes and valid incoming request-ID behavior. The sole requestId registration is relocated before security/body/time/rate controls. Native diagnostics retain method/path/match/status but exclude query values. No second generator or auth path is added.
- **Core verification / RED source, AMBER fixtures:** the existing mesh engine/envelope tests and encryption envelope source; explicit proceed authorization applies to the bounded foundation repair. Reuses actual MutationType and existing crypto calls; no assertion weakening, algorithm change or dependency upgrade.
- **Client hydration / AMBER:** `packages/core/src/native/useWorkspaceLayoutSync.ts`, one appearance projection. Reuses parsed WorkspaceLayoutIntent and native optional-wallpaper model; no contract/storage-format change or native bridge edits.

### Evidence and remaining gates

**G0:** API and core direct TypeScript checks now exit zero. Targeted Biome checks are clean. The monorepo `pnpm check-types` advances past core but exits one at accounting with four journal/type errors; downstream packages not completed by Turbo are not claimed green. This supersedes the historical 41-core-error status, not the entire repository gate.

**G1 / Vitest 5.0.3:** four API files yield 35/35 (early request correlation, query-value diagnostic privacy, Self, bootstrap). Six core files yield 40/40 (connector, mesh/crypto, layout intent/patch and sync logic). The API tests prove oversized 413 requests receive generated/validated/preserved request IDs and native route logs omit synthetic query secrets. Core tests use configured crypto/storage/transport substitutions; no real database, reverse proxy, physical device, live revocation or production telemetry claim is made.

A broad API Vitest run completed with exit one: 61 files, 56 passing and 5 failing; 331 tests, 298 passing, 21 failing and 12 not executed by existing gates/setup failure. Observed failures include a legacy history helper using CommonJS require for the ESM app, malformed downstream RPC fixture shapes that fail input validation before reaching the asserted auth gate, an AI-stream probe and a diagnostics setup-hook timeout. These failures require characterization; no tests were deleted/skipped or timeouts raised by this checkpoint. Session `47018` is terminal and must not be polled or restarted as if still live.

Next priorities remain authority/context parity and trustworthy full-suite fixtures, declared contract/error coverage, atomic durable operation settlement/receipts, telemetry redaction, trusted-proxy fairness and real recovery evidence. The goal remains active and unachieved.

## Refined-goal implementation sequence and verification checkpoint

The human renewed the same API-first direction. The goal service already reports the refined objective as active; no duplicate or speculative channel goal was created. The implementation milestones are:

1. **Verification integrity:** restore truthful package compilation and boundary fixtures. API/core compilation is clean; broader repository gates remain open.
2. **Authority coherence:** server-derived identity, active capacity, tenant/resource scope and assurance must agree across native RPC, OpenAPI and other registered routes. Client headers never elevate these values.
3. **Contract coherence:** strict input, explicit output projection and compatible declared errors; client adapters consume contracts rather than duplicate domain policy.
4. **Mutation settlement:** payload-bound idempotency, atomic domain/receipt/event settlement and queryable recovery. Current assignment replay behavior is not a durable receipt ledger.
5. **Operational recovery and acceptance:** bounded time budgets, privacy-safe telemetry, trusted-proxy fairness, shutdown/restart and real database concurrency evidence. Web/mobile acceptance precedes later channel delivery.

### Implemented in this continuation

- History tests now reuse the existing ESM-compatible fixture and native RPC client, provide declared request envelopes and persisted principal scope, and assert nonempty history/audit projections rather than claiming history coverage from empty results. All twelve scenarios remain.
- The AI wire probe asserts installed TanStack AI 0.64.1 encoding: finish reason under `metadata.tanstack`, usage as a list with exact input/output/total counts. No production stream transformation or token-count relaxation was introduced.
- Development diagnostics compile the shared fixture during module loading rather than inside a timed setup hook. All environment and scratch-file assertions remain; no timeout budget was raised.
- Downstream fixtures use declared request envelopes and persisted relationships. Missing authorization storage asserts exact 503 fail-closed; personalized library caching asserts `private, no-store`; native POST transport does not claim conditional GET 304 semantics.

### Evidence and unresolved findings

**G0 / TypeScript:** API direct `tsc -p apps/sanctuary-api/tsconfig.json --noEmit --pretty false` exits zero. Targeted Biome checks on history, diagnostics and AI probe exit zero. Raw unified diffs were inspected for assertion weakening and removed guards; no production route or policy was removed in this continuation.

**G1 / Vitest 5.0.3:** focused history/diagnostics/AI selection yields 18/18. Broad API run yields 61 files: 59 passing, two failing; 331 tests: 323 passing, one failing, seven not executed. Authentication, database and provider dependencies are substituted in boundary suites. The real integration suite fails its environment gate because `TEST_DATABASE_URL`, `TEST_API_URL` and `TEST_AUTH_TOKEN` are absent; these seven tests provide no runtime evidence. No tests were skipped by this patch and no integration gate was bypassed.

The remaining downstream positive teacher-grade test receives 403. Teacher Cedar policy requires `device_trust == high` for grade creation, while current server contexts intentionally derive standard trust and ignore forged high-trust headers. This is an unfinished server-assurance/availability seam. Do not make the suite green by accepting headers, weakening policy or introducing a test-only production trust escape hatch. A user-labelled trusted device is not automatically cryptographically attested assurance.

Global `app.onError` still passes raw exceptions to Pino and Sentry despite sanitized public problem responses. Their privacy exposure needs a bounded redaction design and regression evidence; neither query-log repair nor client error sanitization proves whole-telemetry safety. Durable settlement, full authority parity, real recovery evidence and repository-wide gates remain unfinished. The active goal is not complete.

## Telemetry and classroom-history settlement checkpoint

The approved telemetry repair now sends Pino and Sentry a bounded summary (`category`, normalized code, status and a generic message) instead of the raw exception object. Request and trace correlation are retained. The public problem response remains unchanged. G1 error-sanitization plus history-integrity coverage is 5/5, and API G0 TypeScript remains clean. This proves the summary boundary, not provider-side retention or complete log-redaction certification.

The classroom-note event table already exists in the mobile Supabase migration, but the generated ZenStack schema has no `ClassroomNoteEvent` delegate. A schema regeneration attempt was not accepted: the installed CLI/ORM 3.8.3 and policy plugin 3.9.7 are mismatched, and the pre-existing schema reports unresolved `school_id` policy references. No generated files were hand-edited. The API now uses parameterized `$queryRaw`/`$executeRaw` against the existing mapped table and wraps note create/update/delete plus event insertion in `$transaction`; Cedar middleware remains the authorization gate because raw SQL bypasses ORM policy plugins. Snapshot and classroom-note suites yield 14/14, including deletion non-resurrection and recreation ordering.

This is an additive compatibility bridge, not the final data-layer state. `zenstack check --schema schema.zmodel` currently exits 1 on eight unresolved `school_id` policy references (the attempted model generation therefore made no generated-file change). Before release, align ZenStack package versions, repair schema references, add the event model and policy-plugin runtime deliberately, then replace the raw bridge with generated delegates only after a real migration/concurrency run. The device-attestation audit likewise remains open: registry “trusted” is a mutable posture label, not cryptographic proof, so teacher GradeMark creation correctly remains unavailable under the current standard-assurance context.

## Assignment receipt checkpoint

The representative assignment mutation now binds an idempotency UUID to a canonical `assignmentId`/authenticated-student/content hash. When a key is first committed, the submission and a server-owned `operation_receipts` row are written in one transaction; a retry re-reads the receipt and submission, while a changed payload returns a deterministic conflict. The migration is additive and server-owned with RLS enabled and client table privileges revoked. G1 education coverage is 12/12, including a boundary assertion that the receipt insert is attempted. This is still substituted-database evidence: production migration application, concurrent uniqueness, restart recovery and a public receipt-query contract remain to be exercised.

The recovery contract is now explicit: `educational.getOperationReceipt` reads only the authenticated account's receipt, returns committed/pending/failed/conflict state and bounded result/error metadata, and is protected by the new Cedar `OperationReceipt` resource rule. Native procedure-input resource derivation was updated so policy evaluation cannot fall back to the active school for this operation-scoped read. The migration also maintains `updated_at` with a database trigger for reliable recovery ordering. G1 education coverage is now 15/15, including a failed-receipt fail-closed scenario and account-scoped query/not-found cases; policy evaluator coverage is 11/11. Real database RLS/service-role behavior and migration application remain unverified.

The assignment replay path now fails closed for an existing failed, conflict or incomplete receipt; it cannot silently create a second submission when the receipt says the original outcome is unresolved. The host has no Docker, Supabase CLI, `psql`, `TEST_DATABASE_URL`, `TEST_API_URL` or signed `TEST_AUTH_TOKEN`, so the real integration gate remains intentionally unexecuted rather than substituted with a mock claim.

Development diagnostics retain their explicit development-only scratch-file workflow, but structured logs now record only receipt and field-count metadata; the submitted crash payload is not copied into logs. G1 diagnostics coverage is 5/5 and API TypeScript remains clean.

The privacy sweep also removed raw exception serialization from Node server lifecycle errors and WhatsApp/PayHere webhook background/database failure logs. These paths now emit bounded error category/code/status summaries through the same telemetry helper. Webhook behavior and error-sanitization selections yield 16/16 focused G1 tests; targeted API TypeScript and Biome checks remain clean.

The same boundary now covers AI provider failures, AI message persistence/usage logging failures, and orchestrator fallback errors. AI wire/error selections yield 4/4 focused G1 tests; API TypeScript, formatting and diff checks pass. Provider prompts, database exception text and credentials are not included in these failure logs.

The follow-up sweep also sanitizes active-bond resolution, AdMob key/webhook/energy failures, and billing adapter key/tier/usage failures. Focused webhook/error coverage remains 16/16; API TypeScript, Biome and diff checks pass. Remaining raw exception sites are either test cleanup diagnostics or require separate route-specific review; privacy readiness is not claimed complete.

Retention cleanup failures and JWT test-key conversion failures now use the same bounded telemetry summary. JWT/error selections yield 15/15 focused G1 tests; API TypeScript and targeted Biome checks pass.

The production raw-exception log sweep is now clear for the searched patterns: only the already-sanitized server lifecycle summary remains; the other match is integration-test cleanup. Rewards abort/lock-steal logging now uses bounded telemetry as well. This is a lexical/log-boundary result, not proof of downstream log collector redaction.
