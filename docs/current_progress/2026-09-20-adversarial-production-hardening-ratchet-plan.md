---
title: "Adversarial Production Hardening Ratchet Plan"
status: "active"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [production, hardening, security, reliability, testing, release, quality]
---

# Adversarial Production Hardening Ratchet Plan

## Decision

Gurudevi will harden production confidence by ratcheting requirements forward
from this plan's adoption date. Existing code is a measured baseline, not a
retroactive release blocker. New or changed critical work must earn stronger
evidence before it is promoted beyond development.

The goal is not a single declaration that the whole repository is production
ready. The goal is to make each important user journey and trust boundary
harder to break, observable when it fails, and recoverable when it does.

## Operating Principles

1. **Adversarial proof, not optimistic proof.** Documentation, static checks,
   and mock tests are claims. A slice is evaluated by attempting to violate its
   contracts, authority boundaries, recovery behavior, and release assumptions.
2. **No retroactive punishment.** Legacy scripts and code do not need to meet a
   new standard merely because an unrelated slice changed.
3. **No local velocity block.** Developers and agents may experiment, commit,
   and iterate without a full-repository gate. Evidence requirements control
   promotion and the production-hardened label; they do not prevent discovery.
4. **No silent exception.** A missing check, unavailable test environment, or
   time-boxed waiver is recorded with an owner, expiry date, impact, and the
   next verification step. It never becomes a green result.
5. **Fresh-context review.** The implementation agent cannot be the only
   reviewer for an AMBER or RED blast-zone change. A separate reviewer receives
   the feature spec, threat/failure matrix, diff, and evidence output.
6. **Evidence labels are literal.** G0-G5/R1 describe the runtime that was
   actually executed, not the intended confidence level.

## The Ratchet Model

### Baseline

The current repository is the baseline. Known inherited gaps are catalogued;
they are not automatically attributed to a new change. The initial baseline
includes unlevelled test scripts, advisory anti-slop workflow steps, and a
canary workflow containing operational placeholders.

### What Ratchets Forward

The following requirements apply only when their owned files, scripts, or
critical journey are added or modified after adoption:

| Surface | Requirement for changed work | Promotion barrier |
| --- | --- | --- |
| Test script | Declare a valid G0-G5/R1 evidence level and use the shared runner/reporting path | Cannot claim test evidence without it |
| Test file | State the contract, hostile cases, substitutions, and evidence limitations | Cannot be marked hardened |
| External input | Add malformed, oversized, replayed, encoded, and unauthorized negative cases appropriate to the boundary | Cannot enter a release candidate |
| Authorization or tenant scope | Add cross-tenant and privilege/revocation denial cases | Cannot enter a release candidate |
| Mutation or webhook | Define idempotency, duplicate-tap/replay, partial-failure, retry, and reconciliation behavior | Cannot enter a release candidate |
| Critical mobile journey | Add/update its state machine, failure/recovery matrix, and real-device evidence plan | Cannot be called release-ready |
| Deployment or rollout | Provide an executable rollback and measurable health criteria | Cannot be promoted to production |

### Three Speeds

| Speed | Purpose | Required behavior |
| --- | --- | --- |
| Explore | Rapid local discovery and prototypes | No full gate; label output experimental and do not make production claims |
| Integrate | Merge a bounded slice into development | Diff-scoped static checks, named evidence level, feature spec for AMBER/RED work, and independent review |
| Promote | Move a release candidate toward users | Critical-journey proof, operational checks, release criteria, and remaining waivers reviewed explicitly |

This means a gate may stop a promotion, but it must not turn every edit into a
whole-monorepo exercise or force legacy cleanup before useful work can proceed.

## Workstream A: Make Governance Executable

### A1. Establish the diff-scoped quality ratchet

Create a single CI entry point that identifies changed files and applies only
the relevant checks. It must distinguish inherited findings from findings
introduced or touched by the change.

Initial checks:

- test-evidence declaration audit limited to changed package/app test scripts;
- `check:anti-slop` limited to the diff or changed ownership surface where the
  tool supports it;
- changed-file lint, type checking, and package boundary checks;
- a machine-readable waiver file with owner, expiry, reason, risk, and removal
  condition.

The first release is report-only in development. It becomes promotion-blocking
for the pilot slice once its output is stable and fast. It must not silently
return success when a relevant check was skipped.

### A2. Repair policy drift before relying on policies

Define one source of truth for branch flow, sacred dependency versions, CI
toolchain versions, and release commands. Update derived documents or mark them
historical. Add a small consistency check for the values that can cause a build
or release error.

### A3. Turn claims into explicit release states

Use only these terms in plans, PRs, and release notes:

- **implemented**: source exists and a stated check has run;
- **verified at Gx**: the named evidence level and limitations are recorded;
- **promotion-ready**: all required slice gates passed or have explicit active
  waivers;
- **production-observed**: monitored in the target environment;
- **production-hardened**: critical journey, threat model, operational
  recovery, and real-runtime evidence are complete for the stated scope.

## Workstream B: Adversarial Boundary Campaign

### B1. Maintain a boundary inventory

Inventory every externally controlled entry point and every authority-changing
operation. At minimum include deep links and QR payloads, OAuth callbacks,
HTTP/oRPC/OpenAPI routes, webhooks, file uploads, AI tools, feature flags,
offline queues, background jobs, and payment actions.

For each boundary record:

- protected assets and user harm if it fails;
- attacker or failure capability;
- accepted input contract and size limits;
- authority source and fail-closed behavior;
- idempotency/replay behavior;
- telemetry redaction requirements;
- negative test cases and the highest evidence level currently achieved;
- owner and next hardening action.

### B2. Required attack patterns

Each applicable slice tests hostile behavior, not merely valid input:

- cross-school, cross-user, role-escalation, revoked-role, and stale-session
  access attempts;
- forged, replayed, duplicated, reordered, oversized, malformed, encoded, and
  unexpected-content-type inputs;
- race conditions: duplicate taps, concurrent writes, offline replay, retries,
  callback-before-bootstrap, and revoke-between-enqueue-and-execution;
- failure of dependencies: network loss, slow response, partial response,
  timeout, storage failure, process restart, and telemetry outage;
- privacy probes: tokens, identifiers, user content, and diagnostic data must
  not escape into logs, analytics, errors, URLs, or client-visible responses.

### B3. Priority adversarial targets

1. Authentication, OAuth callbacks, deep links, and QR entry points.
2. Tenant scope, relationship authorization, and sensitive result reads.
3. Offline mutation queue, idempotency, account switching, and sync recovery.
4. Webhooks, payments, entitlement changes, and audit/reconciliation paths.
5. AI routes and tools: prompt injection, data exfiltration, SSRF, excessive
   cost, unsafe agency, and cross-tenant retrieval.

## Workstream C: Critical Journey Proof

The release proof starts with three mobile journeys already identified by the
release journey hardening guide.

| Journey | Required hostile scenarios | Minimum promotion evidence |
| --- | --- | --- |
| J1 Onboarding and authentication | forged/expired callback, denied permission, slow/offline claim, cold start, background/resume, session expiry | G0-G3 now; G5 on iPhone, low-end Android, and web before hardened claim |
| J2 Primary create or edit | duplicate tap, retry, interrupted mutation, draft recovery, validation failure, optimistic rollback | G0-G3 now; G5 across fast/slow/offline networks before hardened claim |
| J3 Return and synchronization | queue replay, account switch, conflict, stale data, app restart, partial sync failure | G0-G3 now; G5 across fast/slow/offline networks before hardened claim |

Each journey gets a concise state machine and a recovery matrix. Failure must
produce a visible, safe state: retained draft/intent where appropriate, a clear
retry or recovery action, and no unauthorized or duplicated side effect.

## Workstream D: Operational and Release Truth

### D1. Replace operational theatre

Before a workflow is presented as a canary or rollback system, it must perform
the named action. A production workflow cannot consist of comments, sleeps, or
echoed deployment statements.

The actual release path must define:

- target environment and immutable build/version identifier;
- pre-deploy checks and required critical journeys;
- staged traffic or internal-track rollout;
- measurable SLO thresholds for error rate, latency, crash-free sessions, and
  journey success;
- automatic or operator-executable rollback that is tested in staging;
- release marker, correlation capability, alert owner, and incident runbook.

### D2. Observability requirements

For every critical path, preserve a privacy-safe correlation identifier through
client, API, worker, audit record, and error reporting where technically
appropriate. Instrument the four operational signals: traffic, errors, latency,
and saturation. Alerting must distinguish product failure from telemetry
exporter failure.

### D3. Release evidence packet

A promotion candidate contains one compact packet:

- changed slices and blast zones;
- evidence commands, runtime versions, G-levels, counts, and limitations;
- critical journey matrix and device/network results;
- open waivers and expiry dates;
- dashboard/alert links or unavailable-observability disclosure;
- deployment and rollback verification;
- fresh-context adversarial review outcome.

## Workstream E: Agent Containment and Review

### E1. Feature contract before implementation

AMBER and RED changes begin with:

```markdown
# FEATURE SPEC: [Name]
## Blast Zone: RED | AMBER | GREEN
## Target Files: [exact paths]
## Outcome: [plain-language user result]
## Reuses: [existing utilities, types, contracts]
## Does Not: [explicit boundaries]
## Assumptions: [each assumption and how it will be checked]
## Threats and Failure Modes: [hostile and operational cases]
## Evidence Plan: [G0-G5 targets and limits]
## Rollback: [how the change can be disabled or reversed]
```

### E2. Required agent truth labels

Agents must label substantive conclusions as **known**, **inferred**, or
**unproven**. They must identify an explicit verification method for every
unproven safety or production claim.

### E3. Independent critic lane

For AMBER/RED work, a reviewer that did not generate the change evaluates the
diff against the feature contract. The review asks:

- What authority, state, validation, or recovery guard was removed or bypassed?
- What existing utility or public API should have been reused?
- What happens on retries, concurrent actions, offline operation, and restart?
- Can a malicious or unauthorized caller obtain data or trigger a side effect?
- Does the evidence test the real contract, or only a mock/substitution?
- Does the release claim exceed the achieved evidence level?

The critic returns pass, fail, or waiver-required with file/line evidence. A
failure is fixed or explicitly waived; it is not translated into a vague
"looks good".

## First Pilot: Deep Link Security and Resilience

Use the current deep-link work as the first fully ratcheted vertical slice.
The plan and implementation must align with
`docs/architecture/2026-09-20-deep-link-security-and-resilience.md`.

### Pilot scope

- URL parsing and normalization;
- allowed origins/routes and traversal rejection;
- OAuth state, nonce, PKCE, expiry, and callback replay handling;
- credential and PII redaction before telemetry;
- cold-start, duplicate, offline, retry, and route-dispatch recovery;
- QR payload validation/versioning where it reaches the same path.

### Pilot exit criteria

1. A malicious-input corpus is checked at G0/G1.
2. G2 scenario tests prove valid and invalid callback lifecycle behavior.
3. G3 provider/runtime tests prove the actual component-tree integration.
4. A real-device G5 plan is executable and its results are recorded before a
   production-hardened claim.
5. The diff-scoped ratchet reports evidence, adverse findings, and waivers for
   this slice without inspecting unrelated legacy code.
6. An independent reviewer signs off on the threat matrix and evidence limits.

## Delivery Sequence

### Phase 0: Freeze the rules, not the product

- Publish this plan and nominate a single canonical location for live release
  policy.
- Record the inherited baseline findings and distinguish them from new work.
- Agree that local development is always available; promotion is what earns
  constraints.

### Phase 1: Build the ratchet around the pilot

- Add diff-scoped evidence and quality reporting for changed deep-link files.
- Add waiver recording and fail-open only for documented, expiring waivers.
- Make the pilot's critical checks promotion-blocking after one stable
  report-only iteration.

### Phase 2: Attack and prove J1

- Complete the deep-link threat corpus and J1 recovery matrix.
- Run G0-G3 evidence and arrange G5 device/network coverage.
- Run an independent critic review and close or waive findings explicitly.

### Phase 3: Expand by ownership, not by grand rewrite

- Apply the ratchet to the next changed authority or mutation surface.
- Add J2, then J3, using the same packet and critic lane.
- Convert shared checks to promotion gates only after they are fast, stable, and
  scoped to changed work.

### Phase 4: Make operations real

- Implement and test actual staging rollout, monitoring, alerting, and rollback.
- Promote only with a completed release evidence packet.
- Update the plan after incidents and discovered attack paths.

## Metrics

Track progress as evidence coverage rather than lines changed:

- critical journeys with a current state/failure/recovery matrix;
- critical boundaries with cross-tenant and replay denial coverage;
- changed test scripts with declared evidence levels;
- changed slices independently reviewed;
- active waivers, expiry compliance, and recurrence;
- critical journey success rate, severe error rate, crash-free sessions, sync
  failure rate, and recovery completion rate;
- mean time to detect and roll back a failed promotion.

## Feasibility Assessment and Scope Limits

This plan is an operating model, not one implementation project. Its work must
be adopted in small, measurable slices. The following assessment is deliberate:
it prevents a broad hardening programme from becoming paperwork that agents or
developers bypass.

| Item | Feasibility | Practical interpretation |
| --- | --- | --- |
| Diff-scoped ratchet for changed files | Practical and contained | Add a changed-files mode to the evidence and quality checks; begin report-only and avoid scanning unrelated legacy work |
| Evidence labels for new or edited tests | Practical | Require the label and limitation statement only for tests/scripts that are newly touched |
| Anti-slop as a changed-code gate | Practical | Existing tools provide much of the base; scope the result to the diff and promote it only after stable feedback |
| Deep-link pilot with hostile tests | Hard but high-value | A bounded first adversarial slice that exercises external input, auth, privacy, lifecycle, and recovery together |
| Independent adversarial review | Practical when limited | Required for AMBER/RED work; avoid imposing it on every trivial edit |
| J1, J2, and J3 journey matrices | Practical but substantial | Treat each critical journey as its own hardening project, not a documentation task |
| Cross-tenant, replay, race, and failure tests across all boundaries | Necessary and long-running | Add them one boundary at a time as ownership surfaces are changed |
| G5 real-device and three-network proof | Hard and operational | Requires physical devices, accounts, controlled network conditions, and recorded results; no local mock can substitute |
| Real canary rollout and metrics-based rollback | Unavailable until operations exist | Requires an actual deployment path, telemetry, feature flags, credentials, and permission to operate them |
| SLOs, alerts, and production-observed claims | Unavailable before target-environment data exists | Define the measurements now, but do not claim proof until staging or production emits real signals |
| Whole-repository production-hardened status | Not a useful near-term target | Only a stated journey or boundary can earn a hardened claim through evidence |

### Minimum Viable Adoption

The next implementation scope is intentionally only:

1. A report-only, diff-scoped ratchet for newly touched files.
2. The deep-link/auth boundary as the first hostile-test pilot.
3. A state/failure/recovery matrix, evidence labels, and independent review for
   that pilot.
4. A decision after the pilot on whether the gates find meaningful defects
   without harming development flow.

Do not build a whole-repository inventory, canary system, global SLO programme,
or universal device laboratory before the pilot produces useful signal. Keep
only controls that expose real defects or reduce a demonstrated release risk.

## Shared Mobile and Web Plumbing Direction

The next architectural focus is common plumbing for Expo 57 mobile and Next.js
16 web. The purpose is not to force identical UI or erase platform behavior.
It is to make shared domain rules, contracts, security boundaries, and recovery
behavior reusable so the two applications cannot quietly drift apart.

### What Should Be Shared

- domain types, Zod schemas, public API contracts, and error contracts;
- authorization and tenant-scope resolution rules, expressed through core
  ports/adapters rather than app imports;
- URL/deep-link parsing, validation, redaction, QR payload contracts, and safe
  route intent resolution;
- mutation/idempotency contracts, offline intent records, and reconciliation
  semantics where the platform permits them;
- feature lifecycle/flag contracts, telemetry event definitions, privacy-safe
  correlation metadata, and audit event schemas;
- reusable state-machine definitions for critical journeys and their
  failure/recovery rules.

### What Must Remain Platform-Specific

- Expo Router versus Next.js routing and rendering lifecycle;
- native permissions, push notifications, secure storage, device integrity,
  background execution, and PowerSync native runtime;
- browser cookies, server components/actions, SSR/edge behavior, and web focus
  semantics;
- visual composition where the interaction model materially differs.

### Architecture Rule

`packages/core` owns platform-neutral contracts and domain behavior. Each app
owns adapters that translate those contracts into Expo/React Native or
Next.js/browser capabilities. Shared packages must never reach up into either
app. This preserves the existing monorepo layering rule and prevents a shared
module from becoming a hidden mobile or web wrapper.

### Refactoring Sequence

1. **Inventory before extraction.** Select one shared journey, trace its mobile
   and web implementations, and identify actual duplicate or divergent
   contracts. Do not create an abstraction because two files merely look alike.
2. **Freeze the contract.** Define input, output, error, authorization,
   idempotency, telemetry, and recovery behavior in a platform-neutral core
   contract.
3. **Extract pure logic only.** Move deterministic parsing, state transitions,
   schemas, and policy decisions into the shared owner. Keep rendering, I/O,
   and framework lifecycle code in the applications.
4. **Build thin adapters.** Give Expo 57 and Next.js 16 explicit adapters and
   test each adapter against the same shared contract.
5. **Migrate one consumer at a time.** Run compatibility tests, preserve a
   rollback path, then remove the old duplicate only after both applications
   use the shared contract.
6. **Ratchet the boundary.** Add an import/deep-import rule and contract test
   that prevents the old duplication or app leakage from returning.

### First Candidates

Prioritize a candidate only when both applications need the same user/domain
meaning and currently risk drift. The first audit should evaluate:

1. URL, deep-link, and QR route-intent policy.
2. Authentication/session state and safe redirect intent.
3. Public URL construction, telemetry redaction, and correlation metadata.
4. Feature-flag lifecycle and shared capability decisions.
5. API error normalization and retry/idempotency policy.

UI components, navigation shells, native persistence, and server rendering are
not first candidates. Extracting them prematurely would create leaky,
least-common-denominator abstractions and reduce rather than improve elegance.

## Non Goals

- No full repository rewrite.
- No blanket requirement to repair every old test before feature work continues.
- No treating G0/G1 mock evidence as device or production proof.
- No bypassing a failed promotion gate by relabelling it informational.
- No adding a tool merely to create another dashboard or script; each new gate
  must answer a specific release-risk question and be fast enough to use.

## Review Cadence

- **Per changed slice:** feature contract, attack matrix, evidence result, and
  independent review.
- **Per release candidate:** release evidence packet and waiver review.
- **Monthly:** baseline trend, unresolved waivers, incidents, false-positive
  rate, and whether gates are still fast enough for development.
- **After any incident:** update the relevant threat matrix, journey recovery
  contract, and executable check before declaring the remediation complete.
