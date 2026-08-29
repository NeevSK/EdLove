---
title: "Production Hardening — Implementation Results (WS B)"
status: "active"
created: "2026-08-25"
updated: "2026-08-25"
author: "Naveen"
scribe: "opencode"
tags: [production, hardening, ota, fingerprint, preflight]
---

# Production Hardening — Implementation Results (WS B)

> **Point-in-time implementation log.** Runbook:
> [`production-hardening-runbook.md`](./production-hardening-runbook.md).
> Audit: [`2026-production-hardening-audit.md`](./2026-production-hardening-audit.md).

## Items Built

### 1. OTA Safety Check (`check:ota-safety`)

**File:** `scripts/ota-safety-check.mjs`

Compares current native fingerprint vs last-known-good production fingerprint.
Reads `reports/last-production-fingerprint.txt`, computes current via
`@expo/fingerprint`, emits `MATCH` (safe) or `DRIFT` (binary needed).

```bash
pnpm run check:ota-safety       # compare vs last-known-good
pnpm run ota-safety:init        # save current as baseline
```

### 2. Pre-build Preflight (`preflight:build`)

**File:** `scripts/preflight-build.mjs`

Runs `expo-ci-doctor check` + `fingerprint:generate` before any EAS build.
Non-blocking — findings are warnings, not hard gates.

```bash
pnpm run preflight:build
```

### 3. Package.json Scripts

Added to root `package.json`:

| Script | Purpose |
|--------|---------|
| `check:ota-safety` | Fingerprint vs last production |
| `ota-safety:init` | Save current as baseline |
| `preflight:build` | expo-ci-doctor + fingerprint |

## What's Already in the Runbook (no code changes needed)

| Item | Status | Source |
|------|--------|--------|
| Store submission gate | ✅ Documented | `production-hardening-runbook.md` §4 |
| Three-device gate | ✅ Documented | `production-hardening-runbook.md` §5 |
| Rollback policy | ✅ Documented | `production-hardening-runbook.md` §3 |
| Versioning strategy | ✅ Documented | `production-hardening-runbook.md` §6 |
| Monitoring after release | ✅ Documented | `production-hardening-runbook.md` §7 |

## Verification

- `node scripts/ota-safety-check.mjs` — prints fingerprint + verdict
- `node scripts/preflight-build.mjs` — runs expo-ci-doctor + fingerprint
- Both scripts handle missing tools gracefully (error message, not crash)
