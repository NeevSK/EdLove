---
title: "PowerSync Chronology Map"
status: "active"
created: 2026-06-14
updated: 2026-06-14
author: "Naween"
scribe: "Antigravity"
tags: [architecture, powersync, identity, bootstrap, web, chronology]
---

# PowerSync Chronology Map

This document is a working chronology for the PowerSync, identity, bootstrap, and web-boundary docs that matter most to Gurudevi Mobile.

The goal is simple:

- separate older ideas from current guidance
- keep draft/proposal documents visible without treating them as SSOT
- make it obvious which documents govern mobile, web, or both

## Reading Rule

Use this order when documents disagree:

1. current code
2. latest active SSOT / architecture docs
3. active but narrower supporting docs
4. drafts, plans, and critiques
5. old notes and archives

## Highest-Signal Documents

| Date | Status | File | Why it matters |
|---|---|---|---|
| 2026-05-05 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-05-gurudevi-mobile-rebac-identity-audit.md` | Captures the mixed-model identity problem and the ReBAC direction early in the migration. |
| 2026-05-05 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-05-gurudevi-mobile-rebac-identity-plan.md` | Shows the intended identity remediation path and principal binding goals. |
| 2026-05-06 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-identity-fabric.md` | Strong identity SSOT with internal identity, bonds, and sovereignty framing. |
| 2026-05-06 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-identity-operationalization.md` | Operational steps for the identity migration and runtime behavior. |
| 2026-05-18 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-18-gurudevi-offline-authorization-architecture.md` | Key offline auth boundary: permission snapshots, device trust, and mobile offline behavior. |
| 2026-05-20 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-20-gurudevi-offline-iam-write-safety-audit.md` | Confirms the double-gate write safety posture and mobile trust model. |
| 2026-05-22 | active | `apps/gurudevi-mobile/docs/architecture/bootstrap-and-entrypoint-standard.md` | Defines startup ordering, bootstrap ownership, and the entrypoint contract. |
| 2026-05-22 | active | `apps/gurudevi-mobile/docs/architecture/DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md` | The clearest lane map: direct API vs PowerSync vs local-first queue. |
| 2026-05-22 | active | `apps/gurudevi-mobile/docs/architecture/DATA_HIGHWAYS_MIGRATION_CHECKLIST.md` | Practical checklist for assigning the correct data highway. |
| 2026-06-09 | active | `apps/gurudevi-mobile/docs/Core/web-native-compatibility-guide.md` | Platform file strategy and browser/native compatibility guidance. |
| 2026-06-09 | active | `apps/gurudevi-mobile/docs/Core/offline-online-sync-spec.md` | Formal sync lifecycle, queueing, and local-first mutation spec. |
| 2026-06-09 | active | `apps/gurudevi-mobile/docs/Core/identity-and-access-management.md` | IAM baseline and runtime implementation rules. |
| 2026-06-13 | active | `apps/gurudevi-mobile/docs/architecture/2026-06-13-data-sync-alignment-audit.md` | The recent audit tying together PowerSync, React Query, Pacer, and Drizzle. |
| 2026-06-14 | active | `docs/gurudevi-powersync-web-plan.md` | Most explicit PowerSync web integration proposal: native `op-sqlite`, web `@powersync/web` + OPFS. |
| 2026-06-14 | active | `docs/gurudevi-data-state-lifecycle.md` | Most explicit current state/lifecycle map for sync, identity, and state ownership. |
| 2026-06-14 | active | `apps/gurudevi-mobile/docs/architecture/2026-06-14-powersync-web-native-boot-boundary.md` | The newest local note documenting the web/native PowerSync boot split. |

## Supporting Web Docs

| Date | Status | File | Notes |
|---|---|---|---|
| 2026-03-01 | active | `apps/gurudevi-mobile/docs/web/WEB_PLATFORM.md` | Older web SSOT; still useful for route and web setup context. |
| 2026-03-01 | active | `apps/gurudevi-mobile/docs/web/WEB_COMPAT_STRATEGY.md` | Strong on web-vs-native split, but older than the June PowerSync plan. |
| 2026-03-01 | active | `apps/gurudevi-mobile/docs/web/web_native_critique.md` | Useful critique of where web still feels mobile-centric. |

## Identity / Trust Docs That Interact With PowerSync

| Date | Status | File | Why it matters |
|---|---|---|---|
| 2026-05-05 | active | `apps/gurudevi-mobile/docs/current_progress/IDENTITY_ARCHITECTURE_REPORT.md` | Explains the internal identity breakthrough in current-progress language. |
| 2026-05-06 | active | `apps/gurudevi-mobile/docs/Core/platform_identity_auth_architecture.md` | High-level platform identity/auth framing, even though it is less explicit about sync. |
| 2026-05-18 | active | `apps/gurudevi-mobile/docs/architecture/2026-05-18-gurudevi-offline-authorization-architecture.md` | Device trust and offline authorization interact directly with local sync. |

## What Looks Like Draft vs What Looks Like SSOT

### Strong current guidance

- `docs/gurudevi-powersync-web-plan.md`
- `docs/gurudevi-data-state-lifecycle.md`
- `apps/gurudevi-mobile/docs/architecture/DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md`
- `apps/gurudevi-mobile/docs/architecture/bootstrap-and-entrypoint-standard.md`
- `apps/gurudevi-mobile/docs/architecture/2026-06-13-data-sync-alignment-audit.md`
- `apps/gurudevi-mobile/docs/architecture/2026-06-14-powersync-web-native-boot-boundary.md`

### Supporting but not final

- `apps/gurudevi-mobile/docs/web/WEB_COMPAT_STRATEGY.md`
- `apps/gurudevi-mobile/docs/web/WEB_PLATFORM.md`
- `apps/gurudevi-mobile/docs/Core/web-native-compatibility-guide.md`
- `apps/gurudevi-mobile/docs/web/web_native_critique.md`

### Historical context

- `apps/gurudevi-mobile/docs/current_progress/IDENTITY_ARCHITECTURE_REPORT.md`
- `apps/gurudevi-mobile/docs/architecture/2026-05-05-gurudevi-mobile-rebac-identity-audit.md`
- `apps/gurudevi-mobile/docs/architecture/2026-05-05-gurudevi-mobile-rebac-identity-plan.md`

## Working Conclusion

The chronology says the project moved from:

- identity and trust remediation
- to offline authorization and write safety
- to data-highway separation
- to explicit bootstrap/entrypoint rules
- to a specific PowerSync web/native split

That means the newest PowerSync docs should be read as an additive refinement, not as a replacement for mobile offline identity/security architecture.

The next useful step is to reconcile these docs into one short decision memo:

- what is fixed for mobile
- what is flexible for web
- what should stay draft until verified in code
