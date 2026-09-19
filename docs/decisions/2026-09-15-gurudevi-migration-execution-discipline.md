---
title: "ADR: Gurudevi Migration Execution Discipline and Change Control"
status: accepted
date: 2026-09-15
owners: [Naveen, Gurudevi platform]
tags: [migration, execution, governance, evidence, documentation]
---

# ADR: Gurudevi Migration Execution Discipline and Change Control

## Problem this corrects

The migration accumulated authority-looking documents while implementation
continued to change direction from incomplete discovery. This produced three
failures:

1. a local discovery was treated as permission to change the product sequence;
2. a document labeled canonical was not enforced as a gate on subsequent work;
3. agents repeated source exploration or created parallel summaries instead of
   extending the researcher who already held the evidence.

User correction in this situation is not “nagging.” It is a signal that the
engineering control loop is missing. The system must make evidence, scope,
authority, and deviations inspectable without relying on repeated reminders.

## Decision

Migration work uses one active delivery plan, one platform-readiness authority,
and one exhaustive feature ledger per domain. A new document cannot call itself
canonical, accepted, authority, or superseding unless it is linked from the
documentation index and explicitly states the documents it replaces or leaves
as evidence.

No implementation may redirect the active plan because of a newly discovered
file, platform constraint, or attractive abstraction. The finding is recorded,
its impact is assessed against the active plan, and a material deviation is
proposed before execution.

## Required control loop

```text
requested outcome
  → source inventory and coverage report
  → active-plan check
  → implementation proposal
  → explicit deviation record when needed
  → bounded implementation
  → evidence and ledger update
```

### Before implementation

The owner must identify:

- the active plan and the exact phase/feature row being worked on;
- the canonical domain ledger and platform-readiness requirements;
- relevant files discovered and files actually read/understood;
- legacy compatibility callers and data/API boundaries;
- whether the requested result needs a plan change.

### During implementation

- Keep changes inside the named phase and feature rows.
- A platform incompatibility creates an adapter task; it never silently drops
  or narrows the capability.
- Do not use a local discovery to introduce a second registry, renderer,
  persistence system, catalog, or “temporary” product path.
- Reuse the original researcher/owner for follow-up synthesis. A new agent is
  allowed only for genuinely independent bounded work that cannot be completed
  by the current owner without delaying useful parallel work.

### Material deviation record

A deviation is material when it changes product scope, feature order, data
ownership, user-visible behavior, authority location, or adds a new shared
abstraction. Record this in the active plan before proceeding:

| Field | Required content |
| --- | --- |
| Requested plan | Existing phase, feature row, and expected outcome |
| New evidence | Exact files/docs/contracts/tests read |
| Proposed change | What changes and what does not |
| Impact | User behavior, migration order, compatibility, data/privacy risk |
| Alternatives rejected | Why they fail the active constraints |
| Approval | User decision, or explicit note that no material deviation exists |

Small code fixes do not need a deviation record. They must still update the
feature ledger when they change delivery evidence or compatibility.

## Documentation enforcement

Each domain ledger must contain an exhaustive feature row for every canonical
feature or explicitly named non-catalog capability. Every row includes identity
and aliases, user job, scope, lifecycle/time, access/flags, privacy,
persistence/offline, account/native/browser/Explore delivery, source evidence,
acceptance requirements, status, and next action.

Each ledger starts with a Coverage Report that declares two distinct axes:

1. **File coverage:** relevant files discovered versus files actually read and
   understood, with exact paths and unexplored gaps.
2. **Evidence integration coverage:** docs/contracts/tests/history sources
   discovered versus sources materially incorporated into the ledger, with exact
   paths and unexplored gaps.

A file count is not evidence of understanding. A low or incomplete coverage
report is valid; it blocks claims of exhaustive migration readiness.

The report also declares its calculation rules and two non-overlapping status
views: **capability delivery** (`live`, `partial`, `planned`, `blocked`, or
`not_migrating`) and **evidence depth** (`discovered`, `read_understood`, or
`materially_integrated`). It reports both the raw denominators and a functional
grouping (for example, screens, APIs, hooks, adapters, tests, historical
decisions). Aliases, duplicate platform variants, and documentation references
are never silently counted as distinct capabilities.

Before archiving or deleting old documents, run a repository reference audit,
preserve unique decisions, update inbound links, and record the replacement.
Similarity of filenames is never deletion evidence.

## Enforcement consequences

- A feature cannot be called migrated merely because a catalog card, route,
  lazy import, or placeholder exists.
- A feature cannot be called delivered on a platform without its adapter,
  authoritative data boundary, and declared evidence.
- A new authority document without an index entry and supersession boundary is
  a draft, not authority.
- A plan change without a deviation record is not executed.
- Delegation that duplicates completed research is a process failure and must
  be stopped rather than justified after the fact.

## Current application

The active migration remains: shared platform spine → exhaustive domain ledgers
→ truthful Overview floors → representative vertical feature cohorts → feature
adapters → Explore/account completion → hardening. The present work is in the
ledger and shared-spine correction stage. It is not permission to claim Self or
any other domain complete.

### Execution lock — next implementation gate

The next code-changing work is the ordered shared-plumbing gate in
`2026-09-15-gurudevi-cross-domain-platform-readiness.md`, Work Packages 1–3:

1. `@repo/core` owns a pure, tested capability-decision contract; it composes
   access, flags, lifecycle, platform, mode, delivery, and privacy rather than
   letting each domain registry decide separately.
2. The same owner defines the identity/tenant/domain/feature/resource storage
   namespace and enforces Explore/sandbox local-only writes.
3. `@repo/ui` and adapters consume the shared feature-state/error/recovery
   contract. A reference feature proves every relevant state; it cannot make a
   private substitute.

Domain work may update its ledger and source inventory in parallel, but no new
domain-specific feature UI or second registry is started until these packages
have acceptance evidence. Any exception is a material deviation and needs the
record above before code is written.
