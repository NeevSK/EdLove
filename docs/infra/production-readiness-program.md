---
title: "Gurudevi Production Readiness Program"
status: "active"
created: 2026-08-12
updated: 2026-08-12
tags: [production, infrastructure, mobile, web, api, doppler, release]
---

# Gurudevi Production Readiness Program

This is the single checklist for making the Gurudevi platform safe to release.
It covers the mobile app, Sanctuary API, Gurudevi marketing web, shared packages,
Supabase, PowerSync, CI/CD, Doppler, observability, and operational recovery.

This document distinguishes repository work from external account work. A box
must not be marked complete merely because code exists; it requires evidence.

## Environment model

| Environment | Doppler config | Purpose | Data | Release rule |
|---|---|---|---|---|
| Development | `dev` | Local development and CI development checks | Development Supabase/PowerSync | Safe for frequent changes |
| Preview/Staging | `stg` | Release-candidate QA and internal testers | Separate staging data/services | Deploy from approved release candidate |
| Production | `prd` | Real users | Production data/services | Protected, approved deployment only |

Preview and staging mean the same platform boundary here: `stg` is the
configuration, while Preview is the user-facing release environment. They must
not share Supabase, PowerSync, payment, push, or analytics credentials with
`dev` or `prd`.

The current mobile release posture intentionally supports Android first. iOS is
deprioritized, but its configuration must remain non-destructive and documented;
an iOS build is not a release gate until the product decision changes.

## Readiness gates

### A. Repository and toolchain

- [x] pnpm and Node versions are pinned and checked.
- [x] Expo sacred versions and exclusions are documented.
- [x] Lockfile is committed and CI uses frozen installs.
- [x] Workspace package boundaries, cycles, deep imports, and unused code have checks.
- [ ] All production apps have build, lint, typecheck, and test jobs in the release gate.
- [ ] Production readiness check runs in CI and records an artifact/evidence summary.
- [ ] Dependency updates have a review policy and are not bulk-applied to Expo-native packages.

### B. Environments and secrets

- [x] Doppler is the source of runtime secrets.
- [x] `dev`, `stg`, and `prd` are mapped in `config/doppler-secrets.json`.
- [x] CI loads secrets through the reusable Doppler action.
- [ ] `stg` has independent Supabase, PowerSync, EAS, Sentry, Cloudflare, payment, and analytics values.
- [ ] `prd` has independent production values and protected access.
- [ ] GitHub Environments `development`, `preview`, and `production` have matching `DOPPLER_TOKEN` values.
- [ ] Production GitHub Environment requires approval and restricts deployment branches.
- [ ] Service tokens are scoped per environment and are not personal tokens.
- [ ] Rotation and emergency revocation have been rehearsed.

### C. Mobile release infrastructure

- [x] EAS development, preview, and production profiles exist.
- [x] Android preview APK and production AAB profiles exist.
- [x] Android CI build workflow uses Doppler and frozen installs.
- [x] Sentry artifact upload is wired into Android release automation.
- [ ] Preview APK has been installed on a low-end physical Android device.
- [ ] Production AAB has passed an internal-track upload and install test.
- [ ] Build metadata displays app version, environment, commit, and release identifier.
- [ ] OTA update policy is documented and compatible with native dependency changes.
- [ ] Rollback means either disabling rollout, submitting the previous binary, or reverting the web release; the exact procedure is documented.
- [ ] iOS signing, TestFlight, and App Store credentials remain isolated and are not required for Android release.

### D. Web release infrastructure

- [x] Gurudevi marketing web has a production build configuration.
- [x] Gurudevi mobile has a web export and browser E2E configuration.
- [x] Preview and production deployment workflow inputs exist.
- [x] Marketing web includes a service-worker entrypoint.
- [ ] Web deployment target is selected as the single canonical production target.
- [ ] SPA/deep-link refresh behavior is verified on the selected host.
- [ ] Cache invalidation and rollback behavior are verified.
- [ ] PWA manifest, icons, scope, and service-worker scope are verified.
- [ ] Offline support is explicitly documented per browser; unsupported cases show a recoverable state.
- [ ] Security headers, CSP, canonical URLs, robots, sitemap, and preview `noindex` are verified after deployment.

### E. Sanctuary API

- [x] Liveness endpoint returns success without requiring the database.
- [x] Readiness endpoint checks required configuration and database reachability.
- [ ] API build, lint, tests, and startup smoke test run in CI.
- [ ] API deployment has health checks, graceful shutdown, timeout, and restart behavior.
- [ ] Rate limiting is backed by a shared/edge-safe mechanism for multi-instance deployment.
- [ ] Request IDs and trace IDs are present in logs and error responses.
- [ ] OpenAPI output is generated and checked for protected/public route drift.
- [ ] Idempotency is enforced for payments, sync uploads, and retryable commands.
- [ ] Background jobs have retries, failure visibility, and a dead-letter/recovery path.

### F. Supabase and data

- [ ] Staging and production Supabase projects are separate.
- [ ] Backups and point-in-time recovery are enabled and a restore has been tested.
- [ ] Migration drift checks pass against staging.
- [ ] Destructive migrations have a backup and rollback plan.
- [ ] RLS policies have positive and negative tests.
- [ ] Storage buckets have policy, size, content-type, and lifecycle tests.
- [ ] Database slow-query and error monitoring is enabled.
- [ ] Account deletion and data-retention procedures are executable.

### G. PowerSync and local-first runtime

- [x] Account-scoped local runtime architecture is documented.
- [x] Development PowerSync instance and streams have been deployed.
- [ ] Staging and production instances are configured independently.
- [ ] Real JWT credential exchange is proven.
- [ ] Row isolation is proven with two test accounts.
- [ ] Account switching closes the old runtime before opening the new one.
- [ ] Logout, sign-out-all, and account removal have distinct tested behavior.
- [ ] Offline reads, writes, restart recovery, reconnect, rejection, retry, and duplicate upload are tested.
- [ ] Durable server-side idempotency ledger is deployed before enabling production sync.
- [ ] Queue depth, rejected operations, sync lag, and upload/download failures are observable.
- [ ] Web storage quota, private browsing, browser compatibility, and multi-tab behavior are tested.

### H. Observability and operations

- [x] Sentry and PostHog integrations exist.
- [x] API OpenTelemetry foundation exists.
- [ ] Mobile, web, and API releases carry environment and release identifiers.
- [ ] Sentry source maps are required for production releases, not merely best-effort.
- [ ] Alerts exist for startup failures, API 5xx rate, sync failure, queue growth, job failure, and database failure.
- [ ] Deployment markers are emitted.
- [ ] Incident runbook includes rollback, secret revocation, database restore, and user communication.
- [ ] Support can identify a user-safe request/trace ID without exposing payloads.

### I. Security, privacy, and performance

- [x] Secret scanning and dependency/security checks exist.
- [x] API security headers, body limits, CORS, timeouts, and authorization middleware exist.
- [ ] API rate limits are distributed and abuse-tested.
- [ ] Authentication, session revocation, account deletion, and device/session management are tested.
- [ ] Privacy policy, terms, consent, retention, and student/child safeguards are reviewed.
- [ ] Low-end Android launch, memory, scrolling, image, and offline budgets are measured.
- [ ] Browser performance budgets are measured at mobile widths and slow network conditions.
- [ ] Accessibility, contrast, font scaling, reduced motion, keyboard navigation, and touch targets pass.

## Release gates

### Development gate

```powershell
pnpm toolchain:check
pnpm env:check
pnpm check:platform-readiness
pnpm check-types
pnpm lint
```

### Preview/staging gate

```powershell
pnpm env:check:ci
pnpm check:platform-readiness -- --environment preview
pnpm check-all
pnpm --filter @repo/sanctuary-api build
pnpm --filter apps-gurudevi-marketing-web build
pnpm --filter gurudevi-mobile build:web
pnpm --filter gurudevi-mobile test:e2e
```

The exact package selector for marketing web should be confirmed with
`pnpm --filter` if the package name changes; the canonical package name is in
its `package.json`.

### Production gate

- Every preview gate is green.
- Staging database, sync, storage, payments, and notification smoke tests pass.
- Production Doppler contract passes without copying staging values.
- Production deployment is approved through the protected GitHub Environment.
- Release artifact, migration plan, rollback plan, and monitoring owner are recorded.
- Post-deployment health checks pass before the release is announced.

## External work that cannot be completed by repository code

The repository cannot safely invent or rotate these values:

- Supabase staging/production projects and database URLs
- PowerSync staging/production instances
- Doppler `stg`/`prd` secret values and service tokens
- Cloudflare account/project identifiers and API tokens
- EAS project ownership, Android signing, and iOS credentials
- Sentry organization/project/auth token
- Payment provider production credentials
- Push notification credentials
- Backup/restore settings in hosted services
- DNS, domain, App Store, and Play Console ownership

These remain explicit account-owner tasks in the environment bootstrap runbook.
