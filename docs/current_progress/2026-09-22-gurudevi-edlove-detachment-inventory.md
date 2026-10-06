---
title: "Gurudevi–Edlove Detachment Inventory"
status: "active — implementation input"
created: 2026-09-22
author: "Naveen"
scribe: "Codex"
tags: [inventory, migration, gurudevi, edlove, sanctuary]
---

# Gurudevi–Edlove Detachment Inventory

## Scope

This is an inventory of **active Gurudevi runtime, build, and deployment
references** only. It does not authorize edits to the separate Edlove product,
its domains, content, DNS, accounts, or historical records.

## Change now: deterministic Gurudevi configuration

| Path | Current reference | Target |
| --- | --- | --- |
| `apps/gurudevi-mobile/app.json` | `org.edlove.gurudevi` iOS/Android identity | `app.gurudevi.sanctuary` new app identity. |
| `apps/gurudevi-mobile/app.json` | `platform.gurudevi.edlove.org` associated-domain/app-link host | Remove; Sanctuary is the only app-link host. |
| `scripts/build-android.mjs` | old release/debug package and activity name | New Sanctuary release/debug package/activity naming after Expo config regeneration. |
| `apps/sanctuary-api/src/core/app.ts` | old platform origin in Gurudevi API CORS | Replace with Sanctuary only after deployed Sanctuary browser app smoke. |
| `.github/workflows/sentry-sourcemap-upload.yml` | old mobile release name | New Sanctuary mobile release name. |
| `.github/workflows/cloudflare-gurudevi-platform.yml` | old Gurudevi marketing/app URLs | Gurudevi marketing + Sanctuary app URLs, or retire this workflow if it targets an obsolete Gurudevi deployment. |
| `.github/workflows/deploy-canary.yml` | old Gurudevi staging/environment API hosts | Replace only after the canonical Sanctuary API hostname and deployment owner are confirmed. |
| `scripts/generate-openapi-spec.ts` | `api.sanctuary.gurudevi.edlove.org` | Replace only after canonical API hostname is confirmed. |

## Requires provider/owner decision before change

| Path/system | Current reference | Required decision |
| --- | --- | --- |
| `apps/gurudevi-mobile/app.json` Stripe config | `merchant.org.edlove.gurudevi` | **Deferred from the first web/Android release.** Do not offer native payment checkout; retain the package/domain code until a separately reviewed payment decision, rather than deleting it blindly. |
| Google OAuth | Existing native client configuration is a placeholder, while provider-console identity is external. | **Included in the first release.** Create a new Android OAuth client after the release signing SHA-256 is known; configure its real values through the approved secret/config path. |
| DNS/deployment | Old host ownership is external. | Confirm which deployment owns `sanctuary.gurudevi.app`, and the canonical API host. |
| Supabase and OAuth provider | Redirect/origin settings are external. | Apply only the exact Sanctuary values after host/TLS verification. |

## EAS repair completed

`apps/gurudevi-mobile/eas.json` contained unsupported `uploadSourceMaps` fields
in development, preview, and production profiles. Those three invalid fields
were removed. This is a build-profile schema repair; Sentry source-map behavior
continues to be controlled by its existing Expo configuration/workflow.

## Exclusions

- `apps/edlove-web` and all Edlove product infrastructure.
- Historical documentation unless it actively configures Gurudevi runtime.
- Generated `apps/gurudevi-mobile/android/` and `ios/` directories.
- Apple native distribution until a paid Apple Developer path exists.
