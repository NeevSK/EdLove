---
title: "Account Foundation Audit Workbook"
status: "active"
created: 2026-10-08
owners: [product, identity, mobile, web, api, quality]
tags: [audit, account-lifecycle, identity, onboarding, evidence, governance]
---

# Account Foundation Audit Workbook

## Purpose

This workbook establishes the order for making the account foundation
understandable before changing implementation. It separates product decisions,
documented intent, actual code, evidence, and external practice. It is an audit
and reasoning plan, not permission to expand product scope.

## Working rules

- Product decisions are resolved before implementation decisions.
- The newest document is not automatically authoritative.
- Code is treated as behavior, not as proof of intended behavior.
- A test is recorded with its evidence level and limitations.
- Contradictions become explicit decisions; they are not silently reconciled.
- External web research is used only when a claim depends on current standards,
  platform behavior, security guidance, or fast-moving dependencies.
- No refactor begins until the affected user journey and invariant are named.

## Layered checklist

### L0 — Product constitution

- [ ] Primary product promise is stated in one paragraph.
- [ ] Primary audience and first-release audience are named.
- [ ] Personal sanctuary versus institutional platform priority is decided.
- [ ] Non-negotiable trust promises are listed.
- [ ] Explicit non-goals and deferred ideas are listed.

### L1 — Actors and identity

- [ ] Visitor, guest, verified account, onboarded account, school member, and
  deleted account have distinct definitions.
- [ ] Auth provider subject and internal account identity have one documented
  mapping rule.
- [ ] Account ownership, profile ownership, school ownership, and platform
  ownership are separated.
- [ ] Anonymous identity and durable account conversion rules are decided.
- [ ] Multi-device and multi-account policy is decided.

### L2 — Account lifecycle state machine

- [ ] Every state has entry conditions and exit conditions.
- [ ] Session validity is separate from verification, onboarding, citizenship,
  authorization, and entitlement.
- [ ] Sign-in, sign-out, refresh, expiry, recovery, deactivation, deletion, and
  reactivation semantics are defined.
- [ ] Every state has user-visible failure and recovery behavior.
- [ ] Concurrent-device and duplicate-request behavior is defined.

### L3 — Canonical journeys

- [ ] First visit.
- [ ] Continue as guest.
- [ ] Sign up.
- [ ] Confirm email/provider callback.
- [ ] Complete onboarding.
- [ ] Close and reopen.
- [ ] Sign out and sign back in.
- [ ] Switch account.
- [ ] Offline return and session expiry.
- [ ] Request, cancel, and complete deletion.
- [ ] Leave or lose institutional membership.

### L4 — Data custody and durability

- [ ] Each important datum has one source of truth.
- [ ] Local, cached, synchronized, server-authoritative, and derived data are
  distinguished.
- [ ] Guest data conversion and conflict rules are explicit.
- [ ] Retention, export, deletion, backup, and institutional custody rules are
  explicit.
- [ ] Durable writes have idempotency, retry, reconciliation, and audit rules.

### L5 — Authorization and scope

- [ ] Authorization subject is derived server-side.
- [ ] Tenant, school, classroom, bond, and active perspective scope are defined.
- [ ] Client-selected roles or IDs never grant authority.
- [ ] Allow, deny, stale-scope, expired-session, and cross-account cases exist.
- [ ] Entitlement and feature rollout are kept separate from authorization.

### L6 — Shared feature plumbing

- [ ] Typed API contract and validation.
- [ ] Authentication/session adapter.
- [ ] Authorization and scope adapter.
- [ ] Durable storage and migration path.
- [ ] Local cache/sync/mutation boundary.
- [ ] Error taxonomy and recovery UX.
- [ ] Idempotency and concurrency control.
- [ ] Observability, audit events, and correlation IDs.
- [ ] Feature flags and entitlement checks.
- [ ] Accessibility, localization, and responsive behavior.

### L7 — Platform realization

- [ ] Mobile implementation follows the canonical contract.
- [ ] Web implementation follows the same product semantics.
- [ ] Browser-only and native-only capabilities are explicit.
- [ ] No legacy platform silently acts as the current authority.
- [ ] Deep links, callbacks, storage, refresh, and background/resume behavior
  are verified on each supported platform.

### L8 — Quality and evidence

- [ ] G0 contracts and state transitions.
- [ ] G1 boundary tests with substitutions named.
- [ ] G2 success/failure/retry/recovery scenarios.
- [ ] G3 real component/runtime evidence where applicable.
- [ ] G4 browser/Metro journey evidence.
- [ ] G5 device evidence.
- [ ] R1 release, telemetry, rollback, and rollout evidence.
- [ ] Every claim states what it proves and does not prove.

### L9 — Documentation governance

- [ ] Canonical documents are named.
- [ ] Historical and superseded documents are marked.
- [ ] Contradictions have decision records.
- [ ] Every active plan has owner, status, evidence, and next action.
- [ ] Percentages are tied to explicit denominators.
- [ ] Code references and evidence links are recorded for every claim.

### L10 — Release and operating readiness

- [ ] Supported platforms and versions are declared.
- [ ] Environment and secret requirements are documented.
- [ ] Migration and rollback procedures exist.
- [ ] Monitoring and incident response exist.
- [ ] Account recovery and support procedures exist.
- [ ] Release approval names residual risks and accepted limitations.

## Phased sequence

### Phase 0 — Freeze and baseline

Inventory the repository, plans, active branches, generated artifacts, tests,
and current release claims. Freeze new identity/account features while the
baseline is being established.

### Phase 1 — Reasoning and grilling

Ask and resolve product questions before technical questions. Produce the
product constitution, lifecycle vocabulary, priority order, and explicit
non-goals.

### Phase 2 — Intent versus implementation

Read canonical and historical documents, trace the relevant code paths, and
record where intent, implementation, and evidence disagree. Do not fix code in
this phase.

### Phase 3 — Canonical contracts

Decide the single authority for identity, onboarding, session lifecycle,
account custody, authorization, and deletion policy. Record compatibility and
migration decisions before removing any path.

### Phase 4 — Gap and dependency map

Turn the decisions into a ranked gap list. Separate blockers, prerequisites,
bounded fixes, deferred policy decisions, and optional improvements.

### Phase 5 — Foundation implementation

Implement the smallest coherent foundation in dependency order: identity and
session custody, onboarding, local account lifecycle, authorization scope,
durable mutation/recovery, and deletion request boundaries.

### Phase 6 — Evidence promotion

Run the journey matrix from contract evidence through browser and device
evidence. Promote claims only through contiguous applicable evidence levels.

### Phase 7 — Controlled release

Create the release record, document residual risk, verify rollback/support
readiness, and restrict new features to the shared foundation contracts.

### Phase 8 — Continuous governance

Maintain the decision log, contradiction register, evidence ledger, and plan
status. New work must identify which layer and lifecycle invariant it touches.

## Recording format

Every audited item is recorded with:

| Field | Required content |
|---|---|
| Item ID | Stable identifier such as `L2-J07` |
| Question/invariant | What must be true? |
| Documented intent | Exact document and section |
| Observed implementation | File, symbol, and behavior |
| Evidence | Command, level, result, runtime, limitations |
| External practice | Source and date, only when researched |
| Verdict | aligned / partial / contradictory / absent / blocked |
| Risk | P0–P3 with user impact |
| Decision needed | Explicit product or architecture choice |
| Owner and next action | One accountable follow-up |

## Audit records to maintain

1. `account-foundation-audit-workbook.md` — this operating checklist.
2. `account-foundation-decision-log.md` — accepted product and architecture
   decisions; append-only after acceptance.
3. `account-foundation-contradiction-register.md` — docs-versus-code and
   document-versus-document conflicts.
4. `account-foundation-evidence-ledger.md` — commands, runtime, level, scope,
   and limitations.
5. `account-foundation-journey-matrix.md` — canonical lifecycle journeys and
   expected outcomes.
6. `account-foundation-gap-backlog.md` — ranked implementation work after the
   reasoning phases are complete.

## Research method

For each material claim:

1. Locate the current canonical repository document.
2. Locate all relevant callers, adapters, migrations, routes, and tests.
3. Compare stated intent with observed behavior.
4. Check whether the evidence is contract, mocked boundary, real runtime,
   browser, device, or production evidence.
5. Research external standards only where the claim is time-sensitive or
   security/platform-specific.
6. Explain the reasoning, alternatives, trade-offs, and unresolved uncertainty.
7. Record a decision or leave the item explicitly blocked.

## Repository-grounded domain pass (2026-10-08)

This is the first pass against the four product domains named in the decision
log. It is intentionally a shape-of-work assessment, not a completion claim.

| Domain | Documented promise | Strongest observed implementation | First-release reading | Current verdict |
|---|---|---|---|---|
| Self | 21 canonical features; only `fire_journal` and `mood_lotus` are documented as browser-partial. | Next web `SelfFloor` has a real Fire Journal flow, Mood Lotus modal, Safe Try/local handling, and typed self procedure calls; most catalog items remain explicit unavailable states. | Make one reflection/wellbeing practice genuinely reliable on both platforms; do not count the catalog as delivered coverage. | Partial, with the best current candidate for the first personal value loop. |
| Workspace | Classroom domain is relationship- and scope-based; documented strict-live count is zero, with many wired/partial capabilities. | Next web attendance can read scoped classrooms and save attendance, plus a clearly labelled local Safe Try; the route requires a school/classroom scope and does not provide school creation or invitation/join onboarding. | Principal school creation and teacher create/join-class must be a separate relationship/onboarding slice before classroom work can be called usable for a new account. | Partial and blocked on account-to-entity relationship plumbing. |
| Library | Canonical inventory is broad; no Explore capability is production-live. | Authenticated Next web catalog searches server resources, validates payloads/URLs, and separates denied/error/empty states. Explore remains local/placeholder; durable collections are not demonstrated by this floor. | Choose one useful read/browse action first; postpone broad curator/collection promises until durable ownership and access are proven. | Partial; authenticated read path is the narrowest candidate. |
| Community | Community authority says no capability is Live; membership, privacy, safety, and moderation remain material. | Authenticated Next web loads scope-filtered circles, searches, paginates, and distinguishes denial/unavailable; focused circle content is explicitly a feed mock. Explore is local-only. | A directory/entry action may be first value, but posting, membership mutation, and safety must not be implied until their server contracts and evidence exist. | Partial for discovery; not yet a real participation loop. |

The domain pass changes the sequence: identity/onboarding and relationship
creation come before claiming Workspace or Community participation, while Self
and a narrow Library read action can supply immediate personal value after
onboarding. Existing `.web.tsx` package screens are treated as implementation
evidence only; they are not automatically the Next.js web authority.
