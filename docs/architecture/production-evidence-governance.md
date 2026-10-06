---
title: "Production Evidence Governance"
status: "active"
created: 2026-09-28
author: "Naveen"
scribe: "Codex"
tags: [production, testing, evidence, governance, reliability]
---

# Production Evidence Governance

## Purpose

This policy turns the production-hardening intent into an operating contract.
It is subordinate to the repository guardrails in [`AGENTS.md`](../../AGENTS.md)
and the evidence taxonomy in
[`ui-runtime-testing-standard.md`](./ui-runtime-testing-standard.md). It does
not replace existing architecture, test suites, or quality rules.

The goal is truthful, proportionate evidence: fast feedback for ordinary
changes and stronger proof for changes that can harm user identity, data,
privacy, availability, or trust.

## Task modes

Use one primary mode in an agent task. Modes describe the work; they do not
authorize unrelated replacement or refactoring.

| Mode | Required outcome |
| --- | --- |
| `[AUDIT-TESTS]` | Map evidence and gaps only; no product-code changes. |
| `[CHAR]` | Lock present behavior before a structural change. |
| `[REG]` | Reproduce a reported defect before making the smallest fix. |
| `[IMPL]` | Implement a bounded feature with the required evidence. |
| `[AUTHZ]` | Prove allow, deny, stale-scope, and tenant/account-isolation behavior. |
| `[INT]` | Exercise an owned real seam such as the local/test API, database, or storage implementation. |
| `[FAIL]` | Prove timeout, failure, retry, cancellation, partial-write, or recovery behavior. |
| `[DATA]` | Prove migration, existing-data, idempotency, or reconciliation behavior. |
| `[RACE]` | Prove concurrent actor, duplicate request, lease, or retry behavior. |
| `[E2E]` | Prove one thin, high-value user journey at browser, Metro, or device level. |

Useful flags are `+MIN-DIFF`, `+DO-NOT-REFACTOR`, `+CATCH-EARLY`, and
`+NO-PROD-CODE`. `+NO-MOCK-SEAM` means an owned seam must receive a real-seam
proof in this task; it does not invalidate lower-level mocks that remain
truthfully classified as G1.

## Catch-early contract

Before changing a critical seam, the implementation reply must state:

1. The affected invariant or user journey.
2. The required evidence level and task modes.
3. The real seam and every substitution/mock.
4. The existing test to extend, or why a new focused test is necessary.
5. The smallest failing, characterization, or regression proof to add first.

Critical seams are: identity/session lifecycle, authorization or tenant scope,
durable writes and migrations, synchronization and offline data, payments and
webhooks, privacy/secrets, and destructive account/data operations.

If the contract is ambiguous, stop before product behavior changes and record
the decision needed. Do not invent a compatibility policy.

## Evidence and mock policy

The repository uses G0-G5 and R1 exactly as defined by the UI runtime testing
standard and `AGENTS.md`.

- G0 proves pure contracts, state transitions, schemas, and static checks.
- G1 may use deterministic host or service substitutions; every meaningful
  substitution must be named in the result.
- G2 defines observable success, failure, retry, cancellation, and recovery
  scenarios. It is a design contract, not runtime proof by itself.
- G3, G4, and G5 require the actual named component, platform, or device
  runtime. A mock of an owned seam cannot supply these claims.
- R1 is operational release assurance: configuration, telemetry, rollback,
  controlled rollout, and soak evidence. It is not a synonym for a green test.

### No skipped promotions

Evidence levels are a dependency chain, not a menu. A higher execution result
is retained as useful evidence, but it cannot promote a scenario's assurance
status while an applicable lower level is missing.

- G4 does not substitute for G2 scenario definition or G3 component-real
  proof. A browser/Metro journey may be recorded as **G4 execution observed**,
  but it is not **G4 graduated** until G0, G1, G2, and G3 are present where
  applicable.
- G5 does not substitute for G4 platform proof. A device smoke is not a
  complete device assurance claim without the preceding contract and platform
  evidence.
- R1 does not substitute for any G-level proof. A release cannot be declared
  production-assured because a deployment, canary, or monitoring dashboard
  exists.
- A level may be marked **not applicable** only when the owner records why the
  runtime does not exist for that surface, which alternate evidence covers the
  risk, and who accepted that boundary. `Not applicable` is never shorthand
  for unavailable, expensive, or not yet implemented.

Every promotion record therefore lists each level as `passed`, `not started`,
`blocked`, or `not applicable with rationale`. The highest promoted level is
the highest contiguous applicable level; it is never the highest isolated
command that happened to run.

Mocks remain legitimate for external paid providers and lower-level boundary
feedback. They must never be used to claim a real API, database, auth,
browser, Metro, native-device, or production result. An owned seam needed for
a critical claim receives a selected real-seam test; it does not require all
historic tests to be rewritten.

## Required behavior by change risk

| Change class | Minimum delivery evidence |
| --- | --- |
| Docs, copy, isolated styling | Relevant static/type/lint checks. |
| Pure logic or schema | G0 contract and failure-boundary tests where applicable. |
| Component or adapter | G1 boundary evidence; G2 scenarios when user state changes. |
| Critical seam | G0/G1 plus an explicit G2 scenario contract and selected real-seam/runtime evidence appropriate to the risk. |
| Release candidate | Chosen G4/G5 journeys and an R1 operational record. |

Every real defect gets a `[REG]` proof. Every structural change to an existing
flow gets `[CHAR]` proof unless its prior behavior is already explicitly
covered by the relevant contract.

## Enforcement

### Repository enforcement

`pnpm run check:test-evidence` is the evidence-command audit.

- Full mode reports every unclassified package test command, missing explicit
  test-file target, and higher-level command that points to a source test with
  `vi.mock` or `jest.mock`.
- Changed mode is used in pull-request CI. It fails only for new or altered
  test commands, so legacy debt remains visible without blocking unrelated
  work.
- A changed test command must declare its evidence level. A changed G2-G5/R1
  command may not point to a mocked source test.

This is intentionally strict about *new claims* and progressive about historic
debt. Existing unclassified commands must be migrated deliberately, with an
honest level rather than a blanket G1 label.

### Pull-request and release enforcement

The pull-request workflow runs the changed-command evidence audit. Repository
administrators must configure this CI job as a required branch-protection
check before it becomes merge enforcement.

Release readiness is a separate gate. It requires the appropriate G4/G5
evidence and an R1 release record; it must not be bypassed by a mock or unit
result.

## Completion report

Every hardening task concludes with:

```text
DONE
- modes and evidence: ...
- real seams: ...
- substitutions/mocks: ...
- command: ...
- proves: ...
- does not prove: ...
- residual risk: ...
```

This supplements the mandatory test-claim protocol in `AGENTS.md`; it does
not permit an unqualified claim that a suite passed.

## Migration order

1. Evidence-runner reliability and command classification.
2. Identity/bootstrap/account-custody journeys.
3. Durable mutation, idempotency, receipt, and synchronization foundation.
4. Authorization/tenant contracts for primary writes and reads.
5. Failure/recovery UX on the selected critical user journeys.
6. Browser/device/release evidence for those journeys.

Adjacent gaps become owned follow-ups. They do not expand a bounded slice into
a rewrite.
