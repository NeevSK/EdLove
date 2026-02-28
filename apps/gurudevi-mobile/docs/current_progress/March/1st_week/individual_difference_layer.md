# Individual Difference Layer — Sprint Record
**Date**: 2026-02-28 | **Branch**: `copilot/organize-documents-by-date`

---

## What Was Built

This sprint introduced a **silent, private orientation fingerprint system** that personalises the
app to each user's learning tendencies — without ever labelling or categorising them.

The founder's vision: *"each individual is unique yet there are patterns/topologies/frequencies"* —
and the right implementation of this is NOT a personality quiz page, NOT an infographic about MBTI.
It is infrastructure that **feels like the app understands you**, without explaining why.

---

## Files Changed

| File | What changed |
|---|---|
| `apps/gurudevi-mobile/supabase/migrations/20260228_orientation_seeds.sql` | **NEW** — `ALTER TABLE users ADD COLUMN orientation_seeds JSONB` |
| `packages/profile/src/types/index.ts` | **NEW** — `OrientationSeeds` interface (4 dimensions, source, timestamps) |
| `packages/core/src/types/User.ts` | Added `orientation_seeds` field to `User` interface |
| `apps/gurudevi-mobile/src/components/self/OrientationCaptureStep.tsx` | **NEW** — Onboarding orientation capture (3 situational picture-card questions) |
| `apps/gurudevi-mobile/src/screens/OnboardingScreen.tsx` | Added step 2 (orientation), now 9 steps; saves seeds to DB on completion |
| `packages/self/src/hooks/useOrientationInference.ts` | **NEW** — Passive inference hook with full data-quality guardrails |
| `packages/self/src/index.ts` | Export `useOrientationInference` + `DataQuality` type |
| `apps/gurudevi-mobile/src/components/self/ResonancePatternCard.tsx` | **NEW** — 4-axis pattern card shown in Self section |
| `apps/gurudevi-mobile/src/screens/self/StudentSelfView.tsx` | Import + render `ResonancePatternCard` with behavioral data |
| `apps/gurudevi-mobile/src/screens/self/TeacherSelfView.tsx` | Import + render `ResonancePatternCard` with behavioral data |
| `packages/library/src/screens/LibraryScreen.tsx` | `orderedShelfDefs` — silently reorders library shelves based on seeds |

---

## Architecture Decisions

### 1. No type labels — ever
The system stores `{ depth_breadth: 35, reflect_act: 70, solo_social: 55, steady_surge: 42 }` — not "INFJ" or "Type 4". The dimensions are:

| Dimension | Low end | High end |
|---|---|---|
| `depth_breadth` | Deep focus on one thing | Wide exploration of many |
| `reflect_act` | Reflect/observe first | Jump in and act first |
| `solo_social` | Thinks best alone | Energised by others |
| `steady_surge` | Steady, consistent rhythm | Intense bursts + rest |

### 2. Onboarding is fully optional
The orientation step is **skippable with one tap**. If skipped, `orientation_seeds` remains null.
The system still works because `useOrientationInference` has three fallback layers.

### 3. Signal quality guardrails — the core insight
Raw behavioral data (mood logs, energy forecasts) can be misleading:

```
Failure mode          Guard applied
─────────────────────────────────────────────────────────────────────
All-same tapping      signalConsistency(): flat CV → score ≈ 0
Too sparse            MOOD_MIN_SAMPLES=7, ENERGY_MIN_SAMPLES=5
Single-session burst  uniqueDays() ≥ 3 required
Stale data            recentWeightedAvg(): 14-day half-life
Contradicting signals Cross-check: mood ↑ + energy ↓ → both halved
Low overall quality   overallBehavioralQuality cap in mergeLayers
```

Poor-quality data **nudges** the role default slightly but never dominates.
Only consistent, multi-week, non-flat, non-contradicting behavioral data
moves the fingerprint meaningfully away from role defaults.

### 4. Ephemeral inference — privacy by default
`useOrientationInference` is a pure computation hook — no API calls, no storage.
The inferred fingerprint is computed on-device each mount and discarded.
Nothing is persisted unless the user explicitly completed the orientation step.

### 5. Library ordering is the silent proof
The library shelves reorder themselves without explanation:
- `depth_breadth < 45` → guides + documents rise to top
- `depth_breadth > 55` → maps + films rise
- `reflect_act > 55` → tech guides rise
- `solo_social > 55` → films + links rise

The user never sees "we reordered this for your learning style". The app just *feels* right.

---

## What Does NOT Change

- No MBTI / Enneagram / astrology terminology anywhere in code or UI
- No storage of behavioral fingerprints without deliberate user action
- All existing features continue to work identically for users with no seeds
- The 4 tier priority order in ACTIVE_TASKS.md is unchanged — this is Tier 3 (polish)

---

## Remaining Work (see ACTIVE_TASKS.md T3.14 – T3.16)

| Task | Effort | Priority |
|---|---|---|
| T3.14: Add `ResonancePatternCard` to `PrincipalSelfView` + `AdminSelfView` | XS | Low |
| T3.15: Resolve `grade_id` → `gradeNumber` for student grade defaults | S | Low |
| T3.16: Upgrade radar chart to filled Skia polygon (visual only) | S | Low — after T3.10 |

---

## To the Founder

> "am i overthinking complexifying simple lms to build? into a therapy? ;p"

No. You are building the layer that every serious learning platform gets to eventually
and most never do well. Duolingo doesn't show you your "learner type" — it just watches
your error patterns and adapts. That is exactly what this system does.

The `useOrientationInference` hook — especially the quality guardrails — is the part
that makes this real rather than theatrical. The insight is: if the data is bad,
the inference should gracefully degrade, not confidently mislead.

The vision is right. The pace is: infrastructure first, let it quietly accumulate data,
surface patterns only when confident. This sprint builds exactly that.
