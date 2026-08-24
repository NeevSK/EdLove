---
title: "Production Hardening — Release Runbook (OTA, Store, Rollback)"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [production, release, runbook, eas, store, ota]
---

# Production Hardening — Release Runbook

> Companion to [`2026-production-hardening-audit.md`](./2026-production-hardening-audit.md).
> This is the operational runbook for the mobile/web release gate, the OTA
> safety gate, the store-submission gate, and rollback. It supplements
> `docs/infra/release-environments-runbook.md` (environment wiring) and
> `docs/infra/production-readiness-program.md` (full checklist).

## 1. Pre-build preflight (cheap, before a 20-min cloud build)

Run locally before any EAS build, and in CI for PRs that touch native config:

```bash
pnpm run preflight:build        # runs expo-ci-doctor check + fingerprint print
```

`expo-ci-doctor` catches native-module version mismatches, incompatible SDK
packages, and malformed `eas.json` earlier than the build itself. A finding here
is a **warning + link**, not a hard gate, to avoid blocking routine work on
noise; the full release gate still requires `expo-doctor` clean.

## 2. OTA safety gate (before every `eas update`)

Rules that prevent "the update went out but users still crash":

1. **Fingerprint must match the last production build.** The client only
   applies an OTA when the JS bundle's native fingerprint matches its own
   runtime. If you changed a native dep, a config plugin, `app.json`, or any
   native code, an OTA **will not apply** to old binaries.
2. If the fingerprint drifted from the last known-good production build,
   you must ship a **binary release** first, then OTA on top of it.
3. Channels: `development` → `preview` → `production`. Never push straight to
   a channel used by real users without a staged rollout.

Enforced by:

```bash
pnpm run check:ota-safety        # prints current fingerprint vs last-known-good
```

The script reads the last released fingerprint
(`reports/last-production-fingerprint.txt`, written on each release/bump),
computes the current one with `@expo/fingerprint`, and emits:
- `MATCH` → OTA safe to publish to that channel
- `DRIFT` → stop; require a binary build

Store the "last production fingerprint" file **in-repo** (like other build
evidence) and update it on every binary release.

## 3. Rollback policy

| Failure | Action |
| --- | --- |
| Bad OTA (JS-only) | Revert the EAS Update to the previous bundle on staged rollout / same channel. |
| Binary regression | Stop staged rollout; serve the previous known-good AAB/APK. |
| Web release | Re-deploy last-known-good and invalidate the bad deployment. |
| Database-breaking change | Migration rollback / restore per `docs/infra/release-environments-runbook.md`; never improvise a reset. |
| Secrets compromise | Revoke token in Doppler/provider, replace in the affected config, rerun contract checks. |

Verification: every release candidate must pass the three operations above on
`preview` **before** promoting to `production`.

## 4. Store submission gate (first release + majors)

A structured, category-accurate checklist the release owner signs off on:

- [ ] **Permission timing** — push/notification and location permission asked
      at a natural moment, not at launch (Apple).
- [ ] **Account deletion** — if the app has accounts, a visible account-deletion
      path exists and works (Apple + Google).
- [ ] **Privacy strings** — all usage descriptions (`NSCameraUsageDescription`,
      etc.) present and accurate; Android targetSdk/API level at Google's current
      requirement; **64-bit** only.
- [ ] **Data retention/export** — SSR + retention documented; sensitive logs
      avoid raw form contents, tokens, passwords, health data.
- [ ] **Completeness** — no "looks unfinished" stubs: release notes, screenshots,
      description, contact information, iApp-review note.
- [ ] **Deep links + push** — verified from clean install on a real device.
- [ ] **`--no-dev --minify` smoke** — production-like bundle ran the critical
      journeys.
- [ ] **Versioning** — app `version`/`buildNumber` bumped with
      `appVersionSource: remote` + `autoIncrement`; runtimeVersion/fingerprint
      recorded.

Estimated budget: 1–3 weeks of review friction after "done" — plan it in.

## 5. Three-device, three-network release gate

Before a public release, a release owner (or the CI checklist) must pass the
critical journeys on:

| Device | Conditions |
| --- | --- |
| Current iPhone | fast · slow · offline |
| Lower-end Android (the target profile) | fast · slow · offline |
| Desktop browser (web build) | fast · slow · offline |

Repeat the journeys after: cold start, background/resume, permission denial,
expired session, interrupted mutation, app upgrade. See
[`release-journey-hardening.md`](./release-journey-hardening.md) for the three
critical journeys and their failure/recovery matrices.

## 6. Versioning strategy

- Native/binary version: `appVersionSource: "remote"` + `autoIncrement` in the
  `production` EAS profile.
- OTA channel: `runtimeVersion` set via fingerprint strategy in `app.json`;
  bump only when native fingerprint changes.
- Release evidence: store `reports/last-production-fingerprint.txt` and a
  release-drift log per release.

## 7. Monitoring after each release

- Crash-free sessions + ANR rate (Sentry/PostHog).
- `eas update` health: OTA download success, runtime-version mismatch ratio.
- Network failure rate + offline-queue failures per the data layer.
- Rollback out if any of these spikes beyond the runbook threshold.