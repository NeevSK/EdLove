---
title: "Account Foundation Chat Seam Reflection"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Codex"
tags: [reflection, account-foundation, onboarding, lifecycle, decisions, audit]
---

# Why this document exists

This records the direction of the work in this chat, where the implementation actually reached, and where earlier assumptions or agent actions were corrected. It is intentionally candid: a plan is not evidence of implementation.

# Starting point

The original concern was that Gurudevi had become a fragmented codebase: old and new implementations coexisted, agents added code without preserving intent, and identity/onboarding behavior was not trustworthy enough to support future tabs and domains.

The intended product facts established in the conversation were:

- Gurudevi is user-centered, not an institutional ERP.
- A user exists before a school or classroom exists.
- A user can use personal Self capabilities without joining an institution.
- After onboarding, the user enters Sanctuary, the whole authenticated app;
  Self is the primary home tab inside it.
- Open Community and public Library value must be available to an eligible user
  without school or class membership.
- A principal may create a school; a teacher may join or clear a class; invitations and relationships matter later.
- Web exploration can remain temporary/guest-scoped.
- Authenticated data may be personal or relationship-owned and must have explicit custody rules.
- Account deletion is a request/feedback process, not an instant destructive action.
- Product domains are organized around Self, Workspace, Library, and Community.

# Direction agreed in the chat

The work was intentionally reframed from “build a shiny onboarding screen” to:

1. inventory the existing docs and implementations;
2. compare stated intent with actual behavior;
3. establish account, session, onboarding, and relationship invariants;
4. characterize existing paths before changing them;
5. integrate through existing infrastructure rather than deleting old paths;
6. prioritize durable identity and data custody before broad feature work;
7. use evidence levels rather than claiming that mocked tests prove production behavior.

# What was actually done

## Documentation and reasoning

The following artifacts were created in `docs/current_progress/`:

- account foundation audit workbook
- contradiction register
- decision log
- evidence ledger
- gap backlog
- implementation plan
- journey matrix
- account lifecycle contract
- auth seam characterization
- onboarding compatibility client feature specification
- this tab/domain boundary audit
- this seam reflection

These documents are planning and audit evidence. They do not by themselves prove runtime behavior.

## Canonical onboarding seam

The canonical onboarding contract and server handlers already existed. The implementation work added:

- a shared onboarding command module;
- input and response validation;
- actor-derived completion without accepting a caller-selected user ID;
- web integration;
- authenticated mobile integration;
- preservation of anonymous/guest mobile behavior.

The current implementation is in:

- [`onboardingClient.ts`](C:/x/packages/core/src/api/onboardingClient.ts)
- [`OnboardingForm.tsx`](C:/x/apps/gurudevi-web/app/(sanctuary)/onboarding/OnboardingForm.tsx)
- [`OnboardingScreen.tsx`](C:/x/packages/ui/src/screens/OnboardingScreen.tsx)

## Verification completed

The evidence ledger records:

- onboarding client boundary tests: G1, 4 tests;
- core and web type checks from the earlier supported dependency state;
- web auth callback tests: G1, 8 tests;
- mobile onboarding journey/dev-flow tests: G1, 6 tests;
- duplication and anti-slop checks, with inherited repository findings documented.

These prove narrow contracts under mocks. They do not prove real browser, mobile, API, database, or production behavior.

# Corrections made during the work

## Redundant helper removed

An `onboardingCommands` helper was initially introduced for one screen. It added no meaningful ownership and was removed after review. The compatibility branching remains local to the mobile screen, while the shared canonical command remains in core because web and mobile use it.

## Effect v4 claim corrected

Effect v4 was upgraded and used in the onboarding client. The remaining core code still contains v3 APIs. Therefore the repository-wide Effect v4 migration is not complete. The correct statement is “v4 is active at the new onboarding seam; bounded migration remains.”

## Client terminology clarified

`onboardingClient` is a feature command boundary over the pre-existing `orpcClient`; it is not a new HTTP stack. The audit now treats a feature client as optional. What is mandatory is one obvious owner for server interaction and domain policy.

# Where the work is now

## Stronger than before

- onboarding completion no longer relies on a caller-provided user ID in the canonical path;
- the web form no longer constructs its own onboarding fetch requests;
- authenticated mobile and web can share the canonical command boundary;
- guest behavior was preserved rather than silently forced through the authenticated API;
- the work now has explicit lifecycle, evidence, and contradiction documents;
- the broader tab/domain audit identifies the real inconsistencies instead of treating onboarding as the only seam.

## Still incomplete

- account/scope bootstrap is duplicated across browser domain entry paths;
- the central oRPC client remains typed as `any`;
- Self still has a bespoke raw-fetch account adapter;
- Workspace mixes raw-fetch reads, oRPC writes, and local practice storage;
- Community has two related group-loading paths;
- Library calls oRPC directly from its floor rather than through a stable feature owner;
- mutation idempotency and timeout-after-commit reconciliation are not established;
- onboarding resume state is not a complete lifecycle machine;
- account deletion/custody is documented but not implemented end to end;
- real browser/device/API/database evidence is still missing for the new onboarding path;
- Effect v4 migration is not repository-complete.

The current git checkpoint is mixed with unrelated harness, deep-link, and infrastructure changes. It must not be read as a clean account-foundation commit or as proof that every nearby change came from this work.

# Phase position

| Workstream | Position | Meaning |
|---|---|---|
| Documentation and intent clarification | Substantially complete | The product assumptions and contradictions are recorded, but decisions still need to become acceptance tests. |
| Existing-path characterization | Broad but incomplete | The major onboarding and tab seams are known; not every feature or runtime has been exercised. |
| Canonical onboarding integration | First slice complete | Web and authenticated mobile use the new seam; guest compatibility remains intentionally legacy. |
| Account lifecycle foundation | Not complete | Read model, resume state, relationship lifecycle, custody, deletion, and mutation receipts remain. |
| Cross-domain plumbing | Not complete | Self, Workspace, Library, and Community still use inconsistent transport and feature ownership. |
| Production evidence | Not complete | Current evidence is primarily G1 mocks and static/type checks; G4/G5/R1 evidence is absent for this slice. |

This is why the work should be considered a foundation audit plus one integrated onboarding slice, not a finished account system.

# Current destination

The work should now proceed in this order:

1. Protect identity and active-scope invariants across every tab.
2. Define durable mutation identity and reconciliation.
3. Consolidate transport/auth boundaries domain by domain.
4. Preserve and explicitly classify guest/local behavior.
5. Only then expand Self, Workspace, Library, and Community capabilities.

The next implementation unit should be a cross-domain account/scope read model and characterization matrix, not another screen or another generic client wrapper.

# Final self-assessment

The work has moved from scattered implementation to an evidence-backed direction, but it has not reached a trustworthy account foundation yet. The most important remaining risk is not missing UI. It is disagreement between domains about who the current user is, what scope they are in, whether a write succeeded, and which data is durable or local.
