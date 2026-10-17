---
title: "Account Foundation End-to-End Execution Roadmap"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Gurudevi product architecture"
tags: [roadmap, account-lifecycle, capabilities, hardening, milestones]
---

# Account foundation execution roadmap

This roadmap converts the provisional product policy into independently
verifiable implementation milestones. Product policy may change; each
milestone still ships a small current contract with tests, migration notes, and
rollback/recovery behavior.

The related Workspace appearance/layout/wallpaper stream is coordinated through
[Gurudevi Workstream Coordination](2026-10-10-gurudevi-workstream-coordination.md).
It owns visual composition and asset delivery, while this roadmap owns account,
authorization, session, and cross-platform offline mutation foundations.

## Milestone 0 — Contract and evidence baseline

**Goal:** establish the shared vocabulary and prevent new domain-specific
interpretations.

Subtasks:

- maintain the provisional-policy/current-contract guide;
- define capability access classes and lifecycle states;
- inventory duplicate identity, onboarding, and scope readers;
- record exact baseline failures and dirty-worktree limits;
- add contract tests for malformed and stale bootstrap payloads.

Exit evidence: G0/G1 contract tests, documented consumers, and a reproducible
baseline report.

## Milestone 1 — Canonical identity and session lifecycle

**Goal:** one account/scope read model across web and API entry points.

Subtasks:

- finish the shared `scopeBootstrap` reader migration;
- characterize initial load, refresh, expiry, sign-out, and cross-tab changes;
- distinguish signed-out, onboarding, unavailable, forbidden, and stale states;
- make onboarding completion and retries idempotent;
- preserve mobile guest and web Explore as separate adapters.

Exit evidence: G1/G2 lifecycle scenarios and a browser runtime check.

## Milestone 2 — Capability policy enforcement

**Goal:** every capability declares and receives one access class.

Subtasks:

- add access class to capability declarations and bootstrap responses;
- enforce public/account-required/open/scoped/private rules in API handlers;
- make UI gates consume capability bootstrap rather than local guesses;
- add public-link, account-required, and scoped-link tests;
- document copyright/safety publication rules for public resources.

Exit evidence: API contract tests plus G2 link-opening and denial scenarios.

## Milestone 3 — Durable mutation hardening

**Goal:** safe retries and truthful recovery for writes.

Subtasks:

- define operation ID, contract version, input hash, and receipt envelope;
- apply it to onboarding, school/class creation, invitations, and attendance;
- implement timeout-after-commit reconciliation;
- record audit-safe telemetry without sensitive content;
- verify no retry duplicates a durable side effect.

Exit evidence: G1/G2 idempotency tests and failure-injection scenarios.

## Milestone 4 — Workspace relationship creation

**Goal:** reuse historical school/class capabilities behind current authority.

Subtasks:

- extract server-owned principal school creation;
- support personal standalone teacher classes;
- support later school attachment as an explicit relationship transition;
- support teacher invite/join with pending/accepted/denied states;
- retain historical mobile/admin paths until replacement evidence exists.

Exit evidence: API and browser flows with server-derived ownership and recovery.

## Milestone 5 — First domain value

**Goal:** deliver one durable personal action and one truthful Workspace action.

Subtasks:

- finish Self personal reflection/wellbeing persistence;
- deliver Workspace setup without institution-gating Sanctuary;
- keep attendance behind accepted classroom relationship;
- add account separation and local/Explore conversion tests.

Exit evidence: G3/G4 web evidence plus applicable mobile evidence.

## Milestone 6 — Public Library and Community boundaries

**Goal:** expose safe public/open surfaces without weakening scoped privacy.

Subtasks:

- public resource discovery and validated-link opening;
- account-required saves/bookmarks;
- open Community discovery with explicit contribution rules;
- private/scoped membership, moderation, and safety contracts;
- copyright, publication, redaction, and retention checks.

Exit evidence: public anonymous, authenticated-open, and scoped-denial journeys.

## Milestone 7 — Release hardening and migration

**Goal:** make the system maintainable under change.

Subtasks:

- remove duplicate readers only after reference and runtime evidence;
- replace remaining broad transport `any` boundaries;
- run anti-slop, boundary, dependency, security, and migration checks;
- publish rollback, support, telemetry, and residual-risk notes;
- promote only capabilities meeting the strict completion bar.

Exit evidence: G4/R1 release evidence or an explicit documented limitation.

## Execution rule

Work proceeds milestone-by-milestone, but policy decisions can be revised at any
point. A revision updates the affected contract and migration note; it does not
invalidate unrelated completed evidence. No milestone may claim “fully live”
from route existence, registry metadata, or typecheck alone.
