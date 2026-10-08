---
title: "Account Foundation Gap Backlog"
status: "active"
created: 2026-10-08
owners: [product, identity, web, mobile, api, quality]
tags: [audit, backlog, account-lifecycle]
---

# Account Foundation Gap Backlog

This backlog is intentionally ordered by dependency, not by visual appeal.

| Rank | Gap | Why it comes first | Exit evidence |
|---|---|---|---|
| P0 | Canonical identity/onboarding/session authority | Every domain depends on knowing who the user is and whether they may continue. | One contract, characterized transitions, browser + mobile runtime proof. |
| P0 | Lifecycle semantics for `created`, `onboarding`, `active`, `deletion_requested`, `deactivated`, and terminal deletion | Prevents screens and persistence from disagreeing about account state. | State table, failure/recovery matrix, G0–G2 tests. |
| P0 | Domain-based data custody matrix | User, school, class, circle, and derived records need different retention outcomes. | Per-entity owner/retention/export/delete mapping. |
| P0 | Principal school creation and teacher class create/join relationship slice | Without a relationship, Workspace cannot deliver the user’s stated role-based value. | Server authorization, invitation/join recovery, web/mobile journey evidence. |
| P1 | Shared API/session/error plumbing for all new account-bound features | Prevents direct-fetch, token, retry, and error-taxonomy divergence. | Contract inventory and one adapter per boundary. |
| P1 | One Self practice as the first personal value loop | Gives a newly onboarded person immediate value independent of a school. | Real durable custody and platform evidence. |
| P1 | Narrow authenticated Library action | Gives a useful non-institutional action without pretending collections are complete. | Validated read path, access denial/retry, browser evidence. |
| P1 | Community discovery boundary | Makes the tab honest while participation, moderation, and membership mature. | Explicit discovery-only contract or complete participation slice. |
| P1 | Deletion request feedback and support workflow | User explicitly requires request + feedback; final deletion is not yet promised. | Truthful status/receipt/next-step/retry/cancel behavior. |
| P2 | Consolidate duplicate/legacy implementations after compatibility decisions | Refactoring before contracts would hide behavior changes. | Characterization coverage and migration record. |
| P2 | Release governance and production evidence promotion | Prevents “tests passed” from becoming an unsupported release claim. | Journey matrix through applicable G-levels and R1 record. |

