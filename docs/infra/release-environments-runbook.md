---
title: "Gurudevi Release Environments Runbook"
status: "active"
created: 2026-08-12
updated: 2026-08-12
tags: [release, environments, staging, preview, android, ios, web, doppler]
---

# Gurudevi Release Environments Runbook

## What preview and staging mean

For this repository, staging is the backend environment and preview is the
release surface exposed to testers. Both use Doppler config `stg`.

```text
local work       -> dev config -> development checks
release candidate -> stg config -> preview APK/web/API
real users        -> prd config -> production APK/web/API
```

Preview is not a second production database. It is a safe production-like
environment with separate users, data, credentials, sync instance, analytics,
payments, and notifications.

## Branch policy

Use the repository's promotion model:

```text
feature/codex-* -> main-dev -> main-QA -> main-preview -> main
```

The production branch must be protected. A release candidate is promoted to
`main-preview`, validated against `stg`, and only then promoted to `main` with
the `prd` configuration. If those branches do not exist in the remote, create
them deliberately as a separate repository-administration task; do not rename
or force-reset existing branches.

## Doppler setup

The account owner must create or verify these configs in project
`gurudevi-mobile`:

- `dev`: local development
- `stg`: preview/staging
- `prd`: production

Run safe checks without printing secret values:

```powershell
pnpm env:check
pnpm env:check:ci
pnpm check:platform-readiness -- --environment preview
```

CI should use one read-only service token per GitHub Environment. Production
tokens must be protected and never reused in preview.

## Android

- Development: `eas build --profile development --platform android`
- Preview: `eas build --profile preview --platform android`
- Production: `eas build --profile production --platform android`

Preview produces an installable APK for internal testing. Production produces
an AAB for Play Console internal/closed testing before public release.

## iOS posture

iOS is currently deprioritized. Do not create or rotate Apple credentials as
part of routine Android/web work. Keep the EAS profiles and documentation
intact, but treat iOS signing, TestFlight, device registration, and App Store
submission as a future release track with its own approval.

## Rollback

- Web: redeploy the last known-good artifact and invalidate the bad deployment.
- Android: halt staged rollout and submit/serve the previous known-good binary.
- API: redeploy the previous immutable artifact only when the database schema is backward-compatible.
- Database: use the documented migration rollback or restore procedure; never improvise a destructive production reset.
- Secrets: revoke the compromised token in Doppler/provider, replace it in the affected config, and rerun the contract checks.
