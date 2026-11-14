---
title: "Horizontal Foundation Gate and Coherent Target Boundaries"
status: "draft"
created: 2026-10-13
updated: 2026-10-14
author: "Naveen"
scribe: "Codex"
tags: [foundation, gate, modular-monolith, architecture, remediation]
---

# Horizontal Foundation Gate and Coherent Target Boundaries

## Decision: reshape, then prove

Proceed with bounded foundation characterization and remediation design. Do not expand protected vertical capabilities or external AI/channel writes. This is a draft author-reasoned gate, not independent security sign-off or human release approval. No existing route is removed by this decision.

**2026-10-14 priority clarification:** the human prioritizes API hardening for web/mobile first, WhatsApp/Telegram second, and WebMCP/MCP/agent workflows third. The [foundation plan](../architecture/2026-10-13-horizontal-foundation-coherence-plan.md#human-prioritized-delivery-order--2026-10-14) distinguishes foundations to implement now from future doors to preserve. Deferred features do not exempt currently registered ingress from security review. This order does not expand implementation authority to migrations, deployments, route removals or new frameworks, and does not grant release approval.

## Coherent architecture responsibilities

| Layer | Owns | Must not own |
| --- | --- | --- |
| Ingress/runtime | Trusted proxy policy, early correlation, body/concurrency/time budgets, runtime drain | Educational authority inferred from incoming headers |
| Identity | Verified subject, token/session/key policy | School permissions inferred solely from JWT/client role |
| Scope/policy | Server-derived relationship facts, active bond, resource authorization, entitlement as distinct decision | Duplicate inconsistent facts for each transport |
| Contract | Strict input, explicit DTO/error schema, version compatibility | Database model serialization by accident |
| Application/domain | Valid action, exact proposal/confirmation, domain failure, transaction intent | HTTP responses, model truth or unrestricted table access |
| Persistence | Domain-specific ports, atomic records/ledger/audit, constraints, scoped projections | Independent authority based on physical storage placement |
| Operation/effect | Replay key/payload binding, receipt, dispatch, reconciliation and repair | Exactly-once provider claims without provider support |
| Transport projection | Native oRPC encoding, HTTP Problem Details, stream events, provider handshakes | One incompatible universal wire envelope |
| Client/offline | Account-owned draft/queue, truthful states, bounded safe retry/cancellation | Settling protected authority from stale cached permissions |
| Operations/privacy | Allow-listed diagnostics, correlation, capability degradation, funded recovery and exit | Full prompts/learner content as routine telemetry |

Keep these inside a modular monolith unless measured placement/custody needs justify cells or workers. Logical decoupling does not require separate databases. Preserve PostgreSQL-specific transactional requirements honestly; do not abstract away invariants just to simulate portability.

## Evidence-to-action gate — first-pass baseline

| Gate | Current evidence | Decision and first action |
| --- | --- | --- |
| F0 | First inventory and corrected claims | Partial, not exhaustive procedure coverage; maintain source/evidence provenance |
| F1 | [Entrypoints](../current_progress/2026-10-13-f1-authn-authz-entrypoint-inventory.md) and selected JWT/auth tests | Not passed: resolve dev diagnostics exposure; scope-context parity and proxy trust characterization |
| F2 | [Converter/client probes](../current_progress/2026-10-13-f2-error-contract-audit.md) | Not passed: attach output/error contracts through a compatibility-reviewed packet; stable semantics across separate encodings |
| F3 | [Wire test and integrity audit](../current_progress/2026-10-13-f3-operation-and-sync-seam-audit.md) | Not passed: connector-shaped request gets 404; repair actual client/handler protocol and validate full acknowledgement before local completion |
| F4 | [Operations audit](../current_progress/2026-10-13-f4-operations-boundary-audit.md) | Not passed: early IDs, proxy fairness, sensitive telemetry, bounded providers and actual drain proof |
| F5 | [Offline/recovery evidence](../current_progress/2026-10-13-f5-offline-and-recovery-audit.md) | Not passed: caller policy, in-flight ownership, real restore and named operating people |
| F6 | This synthesis | No protected release approval; architecture target is explicit, implementation assurance remains open |

## Dependency-ordered remediation

1. **Contain ingress risks:** characterize production exclusion/authentication for diagnostics, proxy overwrite and early failures. Any behavior restriction requires explicit compatibility/deletion-veto review; do not silently remove the route.
2. **Repair contract and transport seam:** characterize converter output/errors and connector→API upload. Resolve existing Hono and RPC callers deliberately; do not leave a shadow write API with weaker policy.
3. **Make operations durable:** payload-bound keys, validated acknowledgement and receipts; transactional event/record settlement; repair accepted-but-undispatched jobs.
4. **Align authority and retries:** one fact model with protocol adapters; current scope at settlement; distinguish auth expiry, conflict, outage, cancellation and unknown commit; budget retries once.
5. **Prove account/operational recovery:** failed clear/close, callbacks, offline revocation, redacted telemetry, shutdown and isolated restore.
6. **Return to vertical slice:** only after affected gates are accepted with named evidence and owner. Teacher/principal authoring and AI proposal-only constraints remain unchanged.

Each task gets a bounded impact set, characterization first, additive migration/rollback, designated reviewer role, and actual evidence result. Do not treat these tasks as authorization for wholesale refactoring, schema replacement or production infrastructure changes.

## Stop conditions

Stop promotion if output contracts are absent, unsafe retries can duplicate effects, accepted work has no receipt/repair, current scope cannot be verified, synthetic success replaces a real outcome, protected data enters unapproved telemetry, or recovery has no accountable operator. A successful mock test does not override any stop condition.

## Verification and remaining requirements

First-pass audits, local converter/classifier probes, selected API G1 suites and four offline G1 suites establish specific current strengths/gaps. They do not establish all-route isolation or production readiness. Complete procedure coverage, remediation, owned DB/SDK evidence, operator assignments and independent security review remain required.

Repository-wide commands completed non-green on 2026-10-13: `check:anti-slop` stopped at aislop with 95 errors and 1086 warnings across 3312 files; later chained stages were not reached. `check:version-drift` failed writing `reports/version-drift-report.md` with an UNKNOWN filesystem error. `check:test-evidence` reported an unlevelled `apps/edlove-web/package.json` test command. These results do not classify all findings as caused by this task. No unrelated fixes, suppressions or gate bypasses were applied. Command launch performed workspace dependency bootstrap/postinstall before checks; no dependency version change was requested.

The [first repair packet](../implementation/2026-10-13-foundation-contract-and-sync-repair-packet.md) records the tested baseline and the human-approved, implemented first contract/sync stage. The historical table above is not the current repair status; the reconciliation below supersedes those specific open-defect descriptions without certifying their whole gates.

## Current reconciliation after approved repairs

| Requirement | Authoritative evidence now | Still required before accepting the gate |
| --- | --- | --- |
| Phased plan and stop conditions | F0–F6 plan, first-pass inventories and this gate exist | Complete procedure inventory, named accountable reviewers and risk acceptance |
| F1 diagnostics containment | Human explicitly approved development-only registration; `src/core/app.ts` registers only when resolved `NODE_ENV` is `development` | Deploy-time environment/routing proof, scope-context parity, actor/resource/tenant negative matrix |
| F2 contract fidelity | Converter maps declared errors and has explicit output-validation staging; sync opts in; execution tests reject invalid output and strip tested undeclared fields | Review/enforce every relevant namespace DTO, canonical failure categories/actions and streaming projections |
| F3 actual sync transport | Replica-bound connector now calls native RPC, validates full acknowledgement, refreshes account-bound credentials per retry and preserves queue on failure | Real DB ledger/replay/changed-payload evidence; transactional domain-event settlement and accepted-but-undispatched repair |
| F4 resilience/observability | Connector has cooperative per-attempt timeout and bounded transient-only local retry | Whole-operation/session budgets, early correlation, verified proxy policy, telemetry allow-lists, drain and fairness proof |
| F5 offline/recovery | Existing account lifecycle tests plus connector account-switch/failure scenarios | Real SDK persistence, revocation/offline replay, failed shutdown/restore drills and accountable operators |
| F6 release decision | Architecture responsibilities remain modular-monolith and channel-neutral | F1–F5 evidence and independent review remain insufficient; no protected release promotion |

### Diagnostics implementation evidence and compatibility

The human's 2026-10-13 approval ("Yes—development-only route") intentionally restricts existing behavior. `/dev/diagnostics` is absent in production, test and unset environments; the original development handler and mobile caller remain. Existing malformed-body acknowledgement and scratch output are preserved in development. This is registration-time policy: changing an environment value does not reconfigure an already-running app; restart/redeploy is necessary.

**G1 boundary / Vitest 5.0.3:** `dev-diagnostics.test.ts` has five assertions/scenarios, together with sync and the two identity-scope suites **25/25 tests across four files**. The real app registration is exercised with mocked database/auth dependencies and filesystem output. Proves environment-specific route availability and preserved development behavior under those substitutions. Does not prove deployed environment selection, production network isolation, real filesystem access or independent penetration testing. An initial cold-import timeout was resolved by compiling the shared fixture in setup; no test time budget or assertion was weakened.

**G0:** targeted test Biome and two-file jscpd checks succeeded (zero clones at eight-line/50-token thresholds). The app's pre-existing CORS formatting was retained rather than formatting unrelated lines. Direct API TypeScript checking still reports the same Sentry option, adRewards context and inherited `APIError.cause` issues, so no clean compilation claim is made.

### Dependency-integrity diagnosis and bounded remediation task

The exact-version registry check `npm pack --dry-run @powersync/common@2.3.1 --json` lists `lib/index.d.ts` (2,422 bytes), `lib/index.js` and `src/index.ts`. The installed manifest points to that declaration, but `Test-Path packages/core/node_modules/@powersync/common/lib/index.d.ts` is false. This establishes a local installed-artifact mismatch; it does not establish who/what removed the file or that every dependency is corrupt.

**Task T0 — restore verification substrate, not change architecture.** Owner role: workspace/toolchain maintainer. Reconcile installed artifact inventory with the exact lockfile version/integrity, restore through the existing package-manager workflow with no version/pin/manifest changes, then rerun core SDK conformance and API types. Do not add ambient `any` declarations, import private SDK source paths, upgrade PowerSync, delete the installation broadly or loosen strictness to conceal the problem. A broad force-reinstall needs a separately reviewed target/scope; it has not been run here.

**Next dependency order:** T0 static substrate; F1 authority/proxy parity and tenant-negative coverage; F2 namespace DTO rollout; F3 durable settlement/repair; F4 redaction/fairness/drain; F5 real offline/restore/operator evidence. Existing first-stage tests are useful evidence, not substitutes for these requirements. The overall goal remains active and the protected promotion gate remains closed.

The post-containment standalone `check:version-drift` rerun exited zero and wrote its report successfully: it lists the existing `inline-style-prefixer` waiver and no detected deprecated dialects. The earlier UNKNOWN report-write failure did not recur; no filesystem repair or dependency upgrade was performed to obtain this result. This narrowly clears that command, not dependency artifact integrity or the whole foundation. `check:test-evidence` still exits one on the unlevelled edlove-web test command.

The post-containment anti-slop rerun exited one at aislop: 95 errors and 1,098 warnings across 3,320 files. Subsequent chained stages were not reached. These counts describe the current dirty workspace, not defects attributed wholesale to diagnostics containment. No gate suppression or unrelated cleanup was applied.

## Explore/live enforcement checkpoint — 2026-10-14

The human authorized security enforcement across the coordinated API/UI boundary. The [joint security gate](../security/2026-10-14-explore-live-boundary-security-gate.md) records API ownership and the Explore chat's separate web ownership. API bootstrap now checks advertised operations separately, preserves authenticated no-scope discovery through actual RPC/OpenAPI paths, and uses existing error mapping without opening protected Self anonymously. Final mounted G1 boundary coverage yielded 48/48 tests across five files with auth/DB/policy substitutions. The web owner reports its first shared-floor component boundary proof; mode/account transition and broader network-isolation requirements remain open. Public/local UI isolation and production security proof are not established by the API results. Current typecheck failures and pending joint evidence still prevent accepting the foundation or public promotion gate.
