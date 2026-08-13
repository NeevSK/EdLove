# Derived History View — Complete UI + Data Implementation

The capstone of this whole exploration. `01-data-architecture.md` specified the rolling baseline, decay, and reinforcement patterns at the very start; this doc is the first time they connect to an actual, buildable UI screen. Entry point is already solved (the global "Now"/"History" toggle in `BaseSelfView.tsx`, confirmed real and correct in `26`) — this doc covers the content behind that toggle: one shared, four-layer component, parameterized per feature, replacing the flat list found in `TeachingHistoryTimeline.tsx` and its likely siblings.

## Component shape

```
<DerivedHistoryView
  featureId="mood"
  entityTable="mood_logs"
  valueColumn="mood_score"
  baselineWindowDays={28}
  decayLambda={0.15}          // per-feature, tuned independently — see 01's open question on this
  reinforcementThreshold={3}   // occurrences within reinforcementWindowDays
  reinforcementWindowDays={7}
  narrativeMap={MOOD_NARRATIVE_MAP}  // maps deviation-from-baseline ranges to sentence language
/>
```

One component, reused by every feature's `historyContent` slot — `featureId`/`entityTable`/`valueColumn` vary per feature; the four-layer structure and every computation beneath it stay identical.

---

## Layer 1 — Rollup sentence (Pattern 2 + Pattern 8)

**UI:** one short line, always the first thing shown when history mode opens. "This week has felt calmer than your usual." No chart, no number — language.

**Data:** directly implements `01-data-architecture.md`'s relative-baseline window function, computed at read time:
```sql
SELECT
  AVG(value) FILTER (WHERE occurred_at > now() - interval '7 days') AS recent_avg,
  AVG(value) FILTER (WHERE occurred_at > now() - (baseline_window_days || ' days')::interval) AS baseline_avg
FROM {entityTable}
WHERE owner_id = :userId AND type = :featureId;
```
`recent_avg` compared against `baseline_avg` produces a deviation score; `narrativeMap` translates the deviation range into the actual sentence — a per-feature-supplied lookup (e.g., mood: "calmer than usual" / "fairly typical" / "a bit heavier than usual"), not a generic number-to-word formula, since the right language differs meaningfully by feature.

## Layer 2 — Decay-visible trend (Pattern 3)

**UI:** a row of weighted marks, one per period (week, most likely), rendered with opacity/size scaled to recency — vivid and full-sized for recent periods, visibly fading for older ones. The fade *is* the decay weight, made visible rather than computed invisibly.

**Data:** directly implements `01`'s decay formula, applied per period rather than per row:
```sql
SELECT
  date_trunc('week', occurred_at) AS period,
  AVG(value) AS period_avg,
  exp(-:decayLambda * extract(epoch from (now() - date_trunc('week', occurred_at))) / 604800) AS weight
FROM {entityTable}
WHERE owner_id = :userId AND type = :featureId
GROUP BY period
ORDER BY period DESC
LIMIT 12;
```
`weight` (0 to 1) maps directly to opacity in the UI layer — no separate design-side "how faded should this be" decision needed; the same number driving the math drives the visual.

## Layer 3 — Reinforcement-gated callout (Pattern 5)

**UI:** a single, short callout line — "You've noted feeling low a few times this week." **Renders nothing at all if the threshold isn't met** — absence is the default, correct state, not an empty placeholder.

**Data:** directly implements `01`'s `pending_signals` reinforcement-within-window pattern:
```sql
SELECT count(*) AS occurrences
FROM {entityTable}
WHERE owner_id = :userId
  AND type = :featureId
  AND occurred_at > now() - (:reinforcementWindowDays || ' days')::interval
  AND value_qualifies_as_concern(value); -- per-feature predicate, not generic
```
Only render Layer 3 if `occurrences >= reinforcementThreshold`. `value_qualifies_as_concern` is intentionally feature-specific (what counts as "low" for mood differs from what counts as "concerning" for a decision journal) — not a shared numeric threshold across features.

## Layer 4 — Raw entries, on demand (unchanged data, changed position)

**UI:** the existing flat list — exactly what `TeachingHistoryTimeline.tsx` already renders — but collapsed by default beneath the three layers above, expanded only if the person taps to see it. No data change needed here; only its position in the visual hierarchy changes, from *the whole screen* to *an opt-in detail layer*.

**Data:** the existing, already-working query (`LIMIT N`, `ORDER BY occurred_at DESC`) — genuinely no change needed. This is the one layer that was already correctly built; it just needed to stop being the *only* layer.

---

## Technical integration notes

**Fits the existing stack directly — no new infrastructure needed.** All four queries are ordinary Postgres, reachable through the same Hono API pattern already established as correct throughout this exploration (`12`). React Query caches each layer independently, since they have different natural staleness — Layer 1/2/3 (aggregates) can cache longer than Layer 4 (raw entries someone might just have added).

**`viewScale` (day/week/month/year, from the already-existing `useTemporalStore`) should control the rollup window sizes across all three computed layers** — Layer 1's `baselineWindowDays`, Layer 2's period grouping, and Layer 3's `reinforcementWindowDays` all scale together when someone changes the scale selector already present in `TemporalShellControls`. This connects a control that already exists in the UI to computations that, until this doc, had nothing to drive.

**`decayLambda` and `reinforcementThreshold` are real, per-feature tuning constants, not universal ones** — `01-data-architecture.md` already flagged exact decay values as an open question needing real usage data; this doc doesn't resolve that, it specifies *where* the constant plugs in once it's known.

## Open Questions / Not Yet Resolved

- Real `decayLambda` and `reinforcementThreshold` values per feature — needs actual usage data, not guessed constants, same caveat `01` already carried
- `narrativeMap` and `value_qualifies_as_concern` need real, considered language/logic per feature — mood's version will look nothing like a decision journal's, and neither is designed yet, only the slot for them
- Whether this exact four-layer shape fits every feature equally well, or whether some (e.g., a binary-state feature like Fire Journal's burn mechanic) need a variant — not yet checked against every feature individually
- `AcademicHistoryTimeline.tsx`/`GovernanceHistoryTimeline.tsx` (flagged in `26` as likely-identical flat lists) are strong candidates to receive this same component once built, rather than a separate design effort
