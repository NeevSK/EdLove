---
title: "Client State and Web Offline Documentation Conflict Audit"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, audit, documentation, offline-first, web, state-management]
---

# Client State and Web Offline Documentation Conflict Audit

## Method

This audit compared active platform state/offline documentation with the current web Query configuration, cache boundary, browser storage usage, offline tests, package manifest, and Next configuration. It records conflicts as either direct contradictions, unresolved implementation gaps, or scope clarifications. It does not delete or rewrite historical records.

## Findings

| Source | Relevant assertion | Audit result | Canonical resolution |
| --- | --- | --- | --- |
| `docs/architecture/offline-state-resilience-sop.md` | stale-while-revalidate, durable outbox, auth-paused replay, scoped storage | Aligned | Retained. The new canon narrows these requirements into a browser capability ladder. |
| `docs/current_progress/2026-10-10-auth-offline-hardening-review.md` | Query owns server cache; `offlineFirst` is not durable-write proof; web is only selectively offline-capable | Aligned | Retained verbatim in policy. This is the operative production caution. |
| `docs/current_progress/2026-10-09-phase-p0-account-scope-foundation-plan.md` | one account/scope model and account isolation | Aligned but overlapping | The client-state plan supplies the state-owner inventory; P0 remains the product/account transition plan. Neither supersedes the other. |
| `docs/decisions/2026-09-14-sanctuary-explore-access-and-persistence.md` | Explore is browser-local, identity-free, and must not create outbox/cloud records | Aligned | Web W0/W1 for Explore is local-adapter based. Account W4 outbox rules do not apply to public Explore. |
| `apps/gurudevi-mobile/docs/architecture/2026-08-10-powersync-phased-implementation-plan.md` | browser OPFS, account-scoped databases, and browser matrix are future/proof-gated work | Aligned | Presence of a browser OPFS adapter is an affordance, not proof that a web feature is offline-replicated. |
| `apps/gurudevi-web/README.md` | web is built with in-browser WASM SQLite/OPFS for outage continuity | Unverified product claim | Treat as aspirational until a wired vertical slice and browser evidence prove W3/W4. Do not advertise it as completed behavior. |
| `apps/gurudevi-web/lib/query/getQueryClient.ts` | `offlineFirst` Query defaults and fresh server QueryClient | Aligned, partial | Establishes W1 and SSR isolation. It does not establish persisted cache, app shell, or durable writes. |
| `apps/gurudevi-web/public/manifest.json` | install metadata exists | Partial | A manifest alone does not establish W2. No app-shell service-worker registration/precaching was found in the inspected web app configuration. |
| web localStorage call sites | many local preference and draft keys exist | Governance gap | Phase 0 must inventory/version/classify them. Global `localStorage.clear()` requires a separate destructive-scope review. |

## Direct conflict decision

No active source directly contradicts the new ownership model. The principal risk is **overclaiming**, not incompatible policy: existing documentation and code can demonstrate cached reads in an open browser session, but not yet a verified, service-worker-backed offline app shell or platform-wide durable browser writes.

`client-state-and-web-offline-capability-canon.md` is the canonical cross-platform reference for these boundaries. Existing documents remain authoritative within their stated domain:

- offline resilience SOP for transport/outbox failure invariants;
- accepted Explore persistence decision for unauthenticated browser behavior;
- mobile PowerSync plan for replication rollout;
- account-scope P0 plan for account/identity transition work.

## Required follow-up controls

1. Link future state/offline plans to the canon and declare their W-level per user journey.
2. Add a documentation check or release checklist field that forbids “offline-first” product claims without an identified W-level and evidence.
3. Complete Phase 0 before changing persistence keys or state owners.
4. Before W2 work, select and validate a service-worker strategy against Next 16.4.2 and the actual deployment model; do not add a stale PWA plugin from memory.
5. Before W4 work, prove browser account isolation, durable outbox replay, and conflict handling in one vertical slice.
