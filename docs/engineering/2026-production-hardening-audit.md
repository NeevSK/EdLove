---
title: "Production Hardening — Gap Audit vs. MVP"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [production, readiness, expo, release, audit]
---

# Production Hardening — MVP-to-Production Gap Audit

> **Point-in-time audit** (2026-08-24). Companion runbook:
> [`production-hardening-runbook.md`](./production-hardening-runbook.md).

## 1. Purpose

Map the classic "works on my phone → survives real users" lessons against what
Polymath already has in `docs/infra/production-readiness-program.md` and report
**done vs open**, then close the open engineering gaps with tooling that fits
the existing stack.

## 2. The eleven hard lessons → status

| # | Web/Expo lesson | Repo status | Evidence |
| --- | --- | --- | --- |
| 1 | Dev mode lies; test `--no-dev --minify` + release | ✅ Partially | `testing-and-performance-toolchain.md` mandates release-like profiling on mid-tier device; EAS production profile `NODE_ENV=production`. | 
| 2 | Store review is its own product | ❌ **Open** | No structured submission gate/bevy in repo | 
| 3 | EAS Update / runtimeVersion/fingerprint | ⚠️ **Open** | `production-readiness-program.md` box 68–70 unchecked; `@expo/fingerprint` in use but no "is this OTA safe" pre-flight | This pass adds fingerprint gate |
| 4 | Env vars ve EAS secrets | ✅ Done | Doppler-toolchain + `EXPO_PUBLIC_*` contract; `check:platform-readiness` blocked on Doppler | |
| 5 | Performance & battery | ✅ Partial | perf toolchain, `rn-perf-surface-map`, dev-journey docs | |
| 6 | Native edge cases / device matrix | ⚠️ Partial | Android-only posture documented; `.targetSdk`/64-bit unchecked | Release runbook covers as gate |
| 7 | Crash reporting & observability | ✅ | Sentry + source maps wired into release automation; PostHog; OpenTelemetry foundation | |
| 8 | App size & conversion | ✅ | `audit:bundle` / `audit:size` + Expo Atlas | |
| 9 | AI tax (dup, dead code) | ⚠️ Now closed | WS A (aislok/fallow/AGENTS) | |
| 10 | Release-process maturity | ⚠️ **Open gaps** | `release-environments-runbook.md` exists; staged-rollout/rollback/ANR-monitor unchecked | Closing: OTA gate, store gate, rollback verification |
| 11 | Real-device + 3-network | ⚠️ **Open** | `three-device, three-network` gate not encoded | Added to runbook release step |

## 3. Genuinely-open engineering gaps closed by this pass

| Gap | Change | File |
| --- | --- | --- |
| OTA safety gate | Fingerprint-print + compare vs last prod build before `eas update` | `scripts/ota-safety-check.mjs` + `pnpm run check:ota-safety` |
| Pre-build failure preflight | `expo-ci-doctor` check in pre-push / CI | `expo-ci-doctor` devDep + workflow step |
| Store review gate | Structured category-accurate checklist (permission timing, account deletion, privacy strings, targetSdk/64-bit, completeness) | `production-hardening-runbook.md` §store gate |
| Release maturity | staging channel → production; documented rollback; versioning strategy | runbook §rollback + version policy |
| 3-device/3-network | Encoded as release step in runbook | runbook |

## 4. Documented — already integrated, do not re-install

| Tool | Status in repo | Source |
| --- | --- | --- |
| Rozenite (devtools panels) | Integrated (`devtools.js`) | `reports/callstack_audit.md` |
| bundle-visualizer / Atlas | `audit:bundle` | `reports/callstack_audit.md` |
| Reassure (perf) | devDep + `AppPerformance.test.tsx` | same |
| Voltra (iOS) | `voltra.config.js` | same |
| Sentry + source maps | release automation | `production-readiness-program.md` §C |

Deferred (account/product decisions, not engineering scope): Cresc / Xprem /
Otago delta-OTA self-host; `expo-cached-image`; iOS release track (documented
deprioritized to Android-first).

## 5. Acceptance

- `pnpm run check:ota-safety` prints fingerprint + last-known-good + verdict.
- `expo-ci-doctor check` wired as a pre-push and CI step (non-blocking warning
  so it never silently gates a release).
- Store-submission gate + rollback/version policy are in the runbook.