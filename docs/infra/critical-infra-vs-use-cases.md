---
title: "Critical Infrastructure vs Later Use-Case Packages"
status: "active"
created: 2026-08-12
updated: 2026-08-12
tags: [architecture, infrastructure, product, packages, roadmap]
---

# Critical Infrastructure vs Later Use-Case Packages

Infrastructure is the capability that protects every feature. A use-case
package is a capability users can live without temporarily. The first category
must be stable before broad feature development; the second can be added one
domain at a time.

## Must exist before broad feature development

| Capability | Why it is foundational |
|---|---|
| Build/release pipeline | Without it, every feature can break production unpredictably. |
| Environment separation | Prevents development data, credentials, and experiments reaching users. |
| Secrets management | Prevents credentials being embedded in code, builds, or logs. |
| Authentication/session lifecycle | Every protected feature depends on correct identity and logout. |
| Server authorization/RLS | Client checks are not security boundaries. |
| Database migrations/backups/recovery | Features create irreversible data dependencies. |
| API health/readiness and structured errors | Operators need to know whether the platform is alive and why it failed. |
| Observability and release identifiers | Bugs without context cannot be safely repaired. |
| Rate limiting and abuse controls | Public endpoints become production liabilities immediately. |
| Offline/runtime ownership | Local-first behavior can leak accounts or lose writes if not centralized. |
| Sync conflict/idempotency contract | Multi-device data cannot be made safe later by adding UI. |
| Web hosting/cache/deep-link contract | A web app can appear healthy while refresh, auth, or rollback is broken. |
| Performance/accessibility budgets | These are platform quality constraints, not optional decoration. |
| Migration and rollback policy | Existing users make schema and release changes expensive. |

## Can usually be added later

These still need good contracts, but they do not need to be complete before the
platform foundation is ready:

- Rewards and points presentation
- Advanced LMS authoring
- Community reactions and rich moderation tools
- Collections, recommendations, and advanced library search
- AI assistants and retrieval enhancements
- QR/scanner enhancements
- Widgets and share extensions
- Rich media editing
- Advanced analytics dashboards
- A/B experiments
- Additional notification channels
- Optional attachments and large offline media

## Cannot be safely postponed once a feature uses them

Some capabilities look like use cases but contain infrastructure obligations:

- Payments require webhook verification, idempotency, reconciliation, and audit history.
- Chat requires abuse controls, delivery semantics, pagination, and retention rules.
- File uploads require storage policies, size limits, content validation, and deletion behavior.
- Student/child data requires privacy, authorization, retention, and support procedures.
- Offline writes require queue durability, conflict behavior, retry semantics, and account isolation.
- AI requires provider key isolation, spend limits, prompt/data privacy, and failure handling.
- Rewards require an authoritative ledger; points must not be calculated only on the client.
- Notifications require token lifecycle, permission state, retries, deduplication, and unsubscribe behavior.

The rule is simple: a feature may be added later, but its safety boundary may
not be deferred until after users depend on it.
