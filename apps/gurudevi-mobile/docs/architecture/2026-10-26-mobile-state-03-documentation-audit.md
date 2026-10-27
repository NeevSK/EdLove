---
title: "Mobile state audit 3: existing documentation and conflicts"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, state, documentation, audit]
---

# Mobile state audit 3: existing documentation and conflicts

1. [Existing holders and consumers](2026-10-26-mobile-state-01-existing-inventory.md)
2. [Installed runtime capabilities](2026-10-26-mobile-state-02-runtime-capabilities.md)
3. [Existing documentation audit](2026-10-26-mobile-state-03-documentation-audit.md)
4. [Reconciliation and proposed direction](2026-10-26-mobile-state-04-reconciliation-and-direction.md)

## Review scope and authority

This review inspects 28 relevant existing records spanning state, providers, persistence, identity, bootstrap, offline work and performance evidence. It is a targeted architecture corpus, not a claim that every Markdown file in the monorepo was read. Discovery used rg across root and mobile docs, followed by frontmatter/headings/status extraction and focused source comparison. Source findings are retained in document 1; dependency/runtime truth is retained in document 2. Existing records have not been edited, deleted, moved or silently superseded.

An active frontmatter label is not technical proof. Distinguish a requirement, a proposal, an implementation record and an actual run. A later file does not automatically override a security invariant; a matching installed declaration does override a factual claim that an API does not exist. Policy bans and physical availability must be represented separately.

## Reviewed record ledger

| Record | Role | Finding / disposition |
| --- | --- | --- |
| [docs/architecture/2026-10-23-client-state-architecture-decision.md](../../../../docs/architecture/2026-10-23-client-state-architecture-decision.md) | Ownership decision | Keep one authoritative owner and the opt-in protocol test. Revisit preference=Zustand default after checking simpler persisted values. |
| [docs/architecture/client-state-and-web-offline-capability-canon.md](../../../../docs/architecture/client-state-and-web-offline-capability-canon.md) | Cross-platform canon | Keep scope/authorization/outbox and web capability distinctions. A mobile database read must not automatically become a second Query owner. |
| [docs/architecture/2026-10-23-client-state-migration-plan.md](../../../../docs/architecture/2026-10-23-client-state-migration-plan.md) | Dated execution plan | Phase 2 is accepted; later records own Phase 3 detail. Facade retirement postponed to Phase 5 leaves broad subscriptions live. Add explicit retirement and complexity exit criteria. |
| [docs/architecture/2026-10-23-client-state-phase-0-baseline.md](../../../../docs/architecture/2026-10-23-client-state-phase-0-baseline.md) | Historical mechanical baseline | 18 stores and old context/subscription counts describe the old lexical scan; do not reuse them as current totals. |
| [docs/architecture/2026-10-23-client-state-phase-0-hostile-review.md](../../../../docs/architecture/2026-10-23-client-state-phase-0-hostile-review.md) | Historical review | Correctly distinguishes inventory from semantics and installed XState from live adoption. Its old counts are not current evidence. |
| [docs/architecture/2026-10-23-client-state-phase-1-foundation.md](../../../../docs/architecture/2026-10-23-client-state-phase-1-foundation.md) | Foundation implementation record | Pure persistence/scope helpers and policy checks exist. It explicitly does not prove broad migration or device behavior. |
| [docs/architecture/2026-10-23-client-state-phase-2-scope-session.md](../../../../docs/architecture/2026-10-23-client-state-phase-2-scope-session.md) | Accepted implementation record | Final verdict accepts Phase 2.1 under G1/G2 evidence; mirrors are deliberate residual debt. Earlier rejection text is historical context, not the final status. |
| [docs/architecture/2026-10-24-client-state-phase-3-query-migration-plan.md](../../../../docs/architecture/2026-10-24-client-state-phase-3-query-migration-plan.md) | Current remote-family plan/record | Notifications and device security have already retired their former stores. Preserve offline commands and per-family scope. |
| [docs/architecture/2026-10-25-client-state-phase-3-completion-roadmap.md](../../../../docs/architecture/2026-10-25-client-state-phase-3-completion-roadmap.md) | Current exit ledger | Records 3.0–3.3 completed at named evidence levels; authorization snapshots and feature flags remain. Do not call all Phase 3 complete. |
| [docs/architecture/2026-10-25-client-state-phase-3-device-security-query-admission.md](../../../../docs/architecture/2026-10-25-client-state-phase-3-device-security-query-admission.md) | Accepted family record | Query owns principal summary; commands remain manager/outbox. Physical and deployed journeys are not supplied by mocked contracts. |
| [docs/architecture/2026-10-25-client-state-phase-3-authorization-snapshot-admission.md](../../../../docs/architecture/2026-10-25-client-state-phase-3-authorization-snapshot-admission.md) | Draft admission plan | Entitlement and Cedar migration is proposed; signature/policy/expiry/scope validation must remain. Do not report Query ownership as shipped. |
| [docs/architecture/2026-10-23-client-state-and-web-offline-conflict-audit.md](../../../../docs/architecture/2026-10-23-client-state-and-web-offline-conflict-audit.md) | Prior documentation conflict review | Retain web/offline distinctions; it predates October 24 provider guidance and cannot reconcile those later claims. |
| [docs/architecture/2026-10-24-react-native-0.88-expo-58-state-and-provider-canon.md](../../../../docs/architecture/2026-10-24-react-native-0.88-expo-58-state-and-provider-canon.md) | Active educational canon with factual defects | Reject zero-latency/shared-heap and automatic worklet-callability claims. XState active-use claim is false in current TS/TSX. Provider grouping changes indentation, not subscription semantics. |
| [docs/architecture/2026-10-24-monorepo-state-architecture-and-decision-guide.md](../../../../docs/architecture/2026-10-24-monorepo-state-architecture-and-decision-guide.md) | Active decision guide with overreach | Reject context=expensive/store=zero-cost and all-reactive-state=Zustand framing. Its high-quality core verdict conflicts with actual facade implementation and current migration defects. |
| [docs/architecture/2026-10-24-sensory-state-provider-master-plan.md](../../../../docs/architecture/2026-10-24-sensory-state-provider-master-plan.md) | Strategy/proposal | Useful goal: imperative sensory calls with bounded player lifetime. Conversion of pseudo-providers to stores is not an evidence-backed default. Dormant useSensoryStore shows proposal is not complete convergence. |
| [docs/architecture/state-and-component-strategy.md](../../../../docs/architecture/state-and-component-strategy.md) | Mixed strategy/audit | Keep local-form ownership principle; verify declared versions and feature-specific library recommendations against current source before reuse. |
| [docs/Core/data-state-ownership-map.md](../../../../docs/Core/data-state-ownership-map.md) | Older ownership map | Helpful layer taxonomy, stale prod-native MMKV assumption and Auth/Tenant authority assignment after canonical scope work. |
| [docs/architecture/gurudevi-data-state-lifecycle.md](../../../../docs/architecture/gurudevi-data-state-lifecycle.md) | Older lifecycle map | Helpful mechanisms, not a frozen current runtime diagram; scope, identity, upload and provider paths changed after August. |
| [docs/architecture/offline-state-resilience-sop.md](../../../../docs/architecture/offline-state-resilience-sop.md) | Resilience requirements | Keep non-destructive auth expiry, command replay/rejection and owner separation. Validate each aspirational resilience mechanism against active code rather than inferring implementation. |
| [docs/current_progress/2026-10-25-canonical-uuidv8-account-cutover.md](../../../../docs/current_progress/2026-10-25-canonical-uuidv8-account-cutover.md) | Account identity decision/evidence | public.users.id is canonical immutable account identity; auth subject remains a credential binding. Old auth-subject equality shortcuts cannot re-enter scope/storage keys. |
| [apps/gurudevi-mobile/docs/architecture/modern-runtime-vision.md](modern-runtime-vision.md) | Older runtime vision | Import-safe/platform-boundary intent remains useful; explicit “Expo Router is not part” and React Navigation-only direction conflict with current bootstrap standard and source. |
| [apps/gurudevi-mobile/docs/architecture/bootstrap-and-entrypoint-standard.md](bootstrap-and-entrypoint-standard.md) | Entrypoint standard | Keeps app-owned Expo Router and one explicit bootstrap boundary; takes precedence over older no-Router vision for present routing. |
| [apps/gurudevi-mobile/docs/architecture/identity-app-device-lifecycle.md](identity-app-device-lifecycle.md) | Current lifecycle constraints | Preserve guest/account/session/onboarding distinctions and stored work; a simpler client state model must still represent different real-world facts. |
| [apps/gurudevi-mobile/docs/architecture/2026-10-17-physical-startup-performance-findings.md](2026-10-17-physical-startup-performance-findings.md) | Historical G5 observation | A52 debug-client memory/visible routing are observations of that artifact. They are not release-memory or low-end acceptance. |
| [apps/gurudevi-mobile/docs/current_progress/2026-10-19-performance-engineering-execution-plan.md](../current_progress/2026-10-19-performance-engineering-execution-plan.md) | Performance execution authority | Use its device/scenario matrix and repeated release-like evidence; candidate budgets are goals, not current guarantees. |
| [apps/gurudevi-mobile/docs/current_progress/2026-10-22-runtime-performance-reconciliation-and-plan.md](../current_progress/2026-10-22-runtime-performance-reconciliation-and-plan.md) | Evidence reconciliation | Optional startup/admission pilot, trace instrumentation and historical device observations are bounded. It explicitly distinguishes JS trace time from native CPU/TTID/TTFD and leaves low-end/release comparisons open. |
| [apps/gurudevi-mobile/docs/current_progress/2026-10-26-powersync-account-handoff.md](../current_progress/2026-10-26-powersync-account-handoff.md) | Current database lifecycle work | Account handoff/shared facade proof under substitutions does not prove SDK checksum/file semantics or physical replay. Do not discard it as generic store scaffolding. |
| [apps/gurudevi-mobile/docs/current_progress/2026-10-26-powersync-hosted-download-acceptance.md](../current_progress/2026-10-26-powersync-hosted-download-acceptance.md) | Current hosted evidence | Read as the dated provider/database/service result and revocation/reconnect follow-up. Hosted download is narrower than full physical-device sync acceptance. |

## Conflicts that should stop architectural copy-paste

### C1 — “XState is actively used” versus no production adoption

The October 24 state/provider canon calls Zustand and XState actively used. The audit finds no XState import in the scanned production TS/TSX. The Phase 0 hostile review and later Phase 3 plans explicitly state no adoption. Treat XState as an available candidate, not a shipped protocol or a compulsory migration destination. Current general upstream docs also expose v6 alpha while this installation is v5.33.3.

### C2 — “JSI makes native calls zero latency”

The provider canon claims zero-microsecond calls and a same-heap story. Real native calls, device feedback, allocation and serialization take time; synchronous calls can block. It is especially unsafe to use this claim to overturn the explicit main-bootstrap MMKV opt-in or assume audio/haptic timing. Architectural wording must name the thread/runtime and measured path rather than using a performance slogan.

### C3 — “Any singleton can be called from a worklet”

The decision guide and sensory plan imply universal reachability. Current SensoryFeedbackService.ts repeats that claim in its header while holding ordinary mutable fields and calling JS helpers. Removing React Context does not serialize an arbitrary service into the UI runtime. Worklets 0.13 provides an explicit scheduleOnRN boundary for RN-owned functions. A feature must prove its execution path and native API support before bypassing it. See document 2 for installed declarations and the primary scheduling reference.

### C4 — “Contexts are high-cost; stores have zero mount cost”

A changed context value updates subscribed consumers; a store also has allocation, subscriptions and update work. memo is not a universal escape from context changes. Many primitive contexts implement deliberate subtree contracts. Grouping 14 providers into three composed wrappers can improve readability while leaving exactly the same mounted providers and subscriptions. An abstraction rewrite must reduce actual work or clarify lifetime, not hide the same tree.

### C5 — “All cross-screen preferences belong in Zustand”

The general decision guide's first choice for reactive state is Zustand. This omits render derivation, route ownership, already-reactive database/cache owners, and MMKV's keyed hooks. It can produce twelve small stores that perpetuate one old design. The minimum required capability must precede selection of a state container. Not every persisted value needs an in-memory mirror.

### C6 — “The core is already high quality; all debt is UI contexts”

The October 24 guide makes this judgment without reconciling useStore's four broad subscriptions, collision-prone spread order, mixed AuthSlice responsibilities, missing migrations and scope mirrors. UI contexts can have genuine defects, but changing their representation alone cannot solve the proven core issues. The raw unified diff and actual runtime owners are stronger evidence than an architectural label.

### C7 — Historical ownership maps versus current scope and storage

The August map calls Auth/Tenant canonical and MMKV the production-native backend. Current code has a canonical scope-session snapshot plus compatibility mirrors, and main bootstrap defaults to AsyncStorage unless explicitly enabled. MMKV's installation therefore cannot prove which disk engine serves this APK. Keep older maps as historical descriptions until a dedicated approved update reconciles current runtime paths.

### C8 — Older no-Router vision versus the app-owned Router runtime

modern-runtime-vision.md explicitly excludes Expo Router, whereas bootstrap-and-entrypoint-standard.md and current routes use it. Preserve the older import-safe boundary insight; reject its routing direction for this app. Do not accidentally build a second navigation system while simplifying state.

### C9 — “Migration incomplete everywhere” versus actual completed families

The Phase 3 roadmap records notifications, attendance reads and device-security summary migrations. Current source corroborates Query-backed notification and device-security hooks and absence of their old store declarations. Entitlement/Cedar and feature flags remain different work. The initial conversational assessment was too broad: these completed changes should be retained and examined as useful precedents, not restarted from Phase 0.

### C10 — “Accepted” versus physical acceptance

Phase 2 is finally accepted under G1/G2 evidence; earlier rejection paragraphs explain its history. Query family records similarly name their mocked/static/build limits. Physical A52 traces and route observations exist elsewhere, but they do not transfer automatically to every state change, device or release artifact. A hosted PowerSync download is not equivalent to Android process-death recovery, cross-account file isolation or a low-memory journey.

### C11 — Capability tooling and skills can also drift

The local MMKV skill says recrypt is absent and reports signatures inconsistent with the installed package. Terrain's root scans miss React/Zustand/XState re-exports and list interfaces as components in other packages. The compass's generic LEGACY_INTEROP label is not a diagnosis of React. Keep the tool, inspect its physical paths, follow re-exports, and record uncertainty. Blindly trusting a modern-named tool reproduces the same historical-memory problem in another place.

## Reconciled precedence for this audit

1. User-authorized scope and repository guardrails determine what may be changed.
2. Real user journeys, account identity, durable commands and authorization remain required behavior.
3. Installed files and exact release/channel/platform references determine available APIs.
4. Current implementation and executed evidence determine what is shipped or proved.
5. Current ownership canon remains useful where it agrees with those facts; older strategy cannot erase newer verified contracts.
6. New recommendations in document 4 remain proposals until their bounded changes and evidence are reviewed. This report does not retroactively declare every older document superseded.

## Documentation repairs to perform with implementation

| Repair | Needed result | Why deferred here |
| --- | --- | --- |
| Correct provider canon and decision guide | Remove unsupported latency/worklet/context absolutes; add local/derived/reactive-storage choices and real source references | This four-document audit preserves the historical record and makes the disagreements explicit. |
| Update ownership map | Match canonical account/scope and actual enabled backend; link completed Query families | Must accompany the accepted ownership decision, not invent future implementation as current. |
| Repair MMKV skill/tool affordance limitations | Version-grounded signatures, re-export-aware evidence and explicit policy-versus-availability distinction | Changes to shared tooling/skills are outside this mobile documentation patch. |
| Add retirement receipts to migration plan | Every compatibility layer names consumers, owner, exit gate and eventual removal decision | Avoid another open-ended parallel architecture. |
| Reconcile runtime vision | Mark conflicting navigation guidance historical through a separately reviewed lifecycle edit | Do not delete history or break existing document links. |

Document 1 supplies exact source and call evidence; document 2 supplies capability boundaries. This review is G0 documentation/source analysis. It does not rerun the older tests, validate their evidence files, certify hosted state, or add G5 proof.
