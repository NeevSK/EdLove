---
title: "Play Console Hygiene: M1–M6 Baseline Runbook (Read-Only Measurement)"
status: "active"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [play-console, hygiene, vitals, dex, oom, measurement, runbook]
parent_research: "docs/research/2026-09-04-adopt-hygiene.md"
enforcement_date: "2026-02-01"
---

# Play Console Hygiene: M1–M6 Baseline Runbook

**Scope:** Read-only measurement from Play Console. **No app-code change required.**
**Cadence:** Record on each production promote (see `eas.json` production profile).
**Artifact:** Paste readings into release notes table (see §Rollout Table).

---

## M1 — Dynamic Memory (Anon RSS + Swap)

| Dimension | Play Console Path |
|---|---|
| Metric | **Android vitals → Memory** |
| Drill-down | Percentile × RAM bucket × Process state (foreground / background / cached) |
| Track | Internal track first (canary/internal) |
| Bad-behavior cut | Per app/game × RAM-tier × process-state (vendor-defined) |

**Command / Action:**
1. Open Play Console → Gurudevi Mobile → **Quality → Android vitals → Memory**
2. Select **Internal track** (or production track for promote-time reading)
3. Set date range: **Last 28 days**
4. Expand **RAM bucket** dropdown → record p90 for each bucket × state
5. Compare against vendor bad-behavior cut for your app category + RAM tier

**Pass Bar:** Below cut on all RAM tiers × states for 28d window.

**Record:**
```
M1 (RSS+swap p90): 
  RAM-tier: <tier> | Foreground: <MB> | Background: <MB> | Cached: <MB> | Cut: <MB> | PASS/FAIL
  RAM-tier: <tier> | Foreground: <MB> | Background: <MB> | Cached: <MB> | Cut: <MB> | PASS/FAIL
```

---

## M2 — Bitmap Memory, User-Perceived (Foreground)

| Dimension | Value |
|---|---|
| Threshold (p90) | **200 MB** |
| Slice | Foreground / user-perceived |
| Source | Same Memory drill-down as M1 |

**Action:** From M1 drill-down, extract **foreground p90** for bitmap memory.

**Pass Bar:** p90 < 200 MB.

**Record:**
```
M2 (Bitmap foreground p90): <MB> | PASS/FAIL
```

---

## M3 — Bitmap Memory, Background

| Dimension | Value |
|---|---|
| Threshold (p90) | **200 MB** |
| Slice | Background |
| Source | Same Memory drill-down as M1 |

**Action:** From M1 drill-down, extract **background p90** for bitmap memory.

**Pass Bar:** p90 < 200 MB.

**Record:**
```
M3 (Bitmap background p90): <MB> | PASS/FAIL
```

---

## M4 — Bitmap Memory, Cached

| Dimension | Value |
|---|---|
| Threshold (p90) | **400 MB** |
| Slice | Cached |
| Source | Same Memory drill-down as M1 |

**Action:** From M1 drill-down, extract **cached p90** for bitmap memory.

**Pass Bar:** p90 < 400 MB.

**Record:**
```
M4 (Bitmap cached p90): <MB> | PASS/FAIL
```

---

## M5 — DEX Optimization Coverage

| Dimension | Value |
|---|---|
| Threshold | **≥ 25%** (opt/shrink/obfuscate, e.g. R8) |
| Applies to | Bundles > 10 MB DEX |
| Source | **Play Console → Release → App bundle explorer → [bundle] → DEX insights** |
| Build Artifact | `eas.json:53-56` production `app-bundle` |

**Action:**
1. Promote a production build via EAS (`eas build --profile production --platform android`)
2. Upload to Play Console internal/production track
3. Open **App bundle explorer** → select the uploaded bundle
4. Click **DEX insights** → read **Optimization coverage %**

**Pass Bar:** ≥ 25% on every production bundle.

**Record:**
```
M5 (DEX optimization): <XX>% | PASS/FAIL
Bundle versionCode: <versionCode>
```

**Note:** No `minifyEnabled` / `shrinkResources` / ProGuard config exists in versioned files (repo grep confirms). DEX optimization % can only be confirmed via Play Console per-bundle insights. If explicit shrink ownership is needed later, it must be a config plugin under `apps/gurudevi-mobile/plugins/` using `plugins/lib/buildGradleBlock.js` helper — never a hand-edit.

---

## M6 — OOM-Kill Crash Rate

| Dimension | Value |
|---|---|
| Threshold | Trend (no fixed cut published) |
| Source 1 | **Play Console → Quality → Crashes & ANRs → Filter: OOM-kill** |
| Source 2 | **Sentry** → `globalErrorHandlers.ts:29` `Sentry.captureException` volume |
| Build Artifact | Production `app-bundle` (`eas.json:53-56`) |

**Action:**
1. Play Console: Filter crashes by **OOM-kill** → record crash rate (crashes / 1000 sessions) for last 2 releases
2. Sentry: Query `Sentry.captureException` events with OOM-related tags for same period
3. Compare trend: flat-to-down across 2 releases

**Pass Bar:** Flat-to-down across 2 releases.

**Record:**
```
M6 (OOM-kill rate): 
  Release N-1: <rate> crashes/1k sessions
  Release N:   <rate> crashes/1k sessions
  Trend: FLAT / DOWN / UP | PASS/FAIL
```

---

## Anonymized OOM Telemetry (Future — Not Yet Built)

When implemented (separate ADR required):
- One Sentry breadcrumb on low-memory warning
- Coarse bucket only: RAM tier + process state
- **Never** heap dumps, **never** user content
- PDPA review before shipping any device-signal telemetry

---

## Rollout Table (Paste into Release Notes)

| Promote | Date | M1 (RSS+swap) | M2 (Bitmap FG) | M3 (Bitmap BG) | M4 (Bitmap Cached) | M5 (DEX %) | M6 (OOM Trend) | Action |
|---|---|---|---|---|---|---|---|---|
| v24 | 2026-09-XX | PASS/FAIL | PASS/FAIL | PASS/FAIL | PASS/FAIL | XX% | FLAT/DOWN/UP | [none / bitmap audit / investigate] |

---

## Bitmap-Lifecycle Audit Trigger

If **any** of M2/M3/M4 breaches threshold:
- [ ] Add `recyclingKey` to `CollectionCard` (`packages/ui/src/components/CollectionCard.tsx:18`) and `HeroBanner` (`packages/ui/src/components/HeroBanner.tsx:5`)
- [ ] Implement cached-image eviction on backgrounding (via `expo-image` API, no new dep)
- [ ] Re-measure on next promote

---

## References

- `docs/research/2026-09-04-adopt-hygiene.md` §2 (measurement plan)
- `docs/research/2026-09-04-expo-native-evolution.md` (Play bad-behavior thresholds)
- `apps/gurudevi-mobile/eas.json:44-58` (production profile)
- `packages/ui/src/components/CollectionCard.tsx:18`, `HeroBanner.tsx:5`, `UserAvatar.tsx:5` (expo-image usage)