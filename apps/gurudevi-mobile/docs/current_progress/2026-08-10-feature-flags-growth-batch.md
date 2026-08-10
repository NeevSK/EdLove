---
title: "Feature Flags and Growth Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, feature-flags, growth, schema-parity]
---

# Feature Flags and Growth Batch

## Evidence and authority

- `feature_flags` contains 3 rows. Its rule arrays and timestamps have zero
  nulls, despite nullable PostgreSQL declarations.
- `growth_events` is an active append-only event table. It currently contains
  0 rows, but the repository writes to it, so `created_at` is hardened based on
  the active write contract rather than current volume.
- `user_growth_state` is active and already has its required counters and
  timestamps hardened by the preceding growth-state migration.
- The mobile rollout runtime currently evaluates GrowthBook and treats its
  cached snapshot as the offline fallback. `feature_flags` is therefore not
  added to PowerSync and is not treated as a second offline authority.
- Runtime growth uses the Bhumi vocabulary beginning with `bijam`; the ZModel
  default was corrected from the stale `seed` value.

## Contract decision

- Keep feature-flag rows modeled in ZenStack for administrative/control-plane
  access, while GrowthBook remains the client rollout authority.
- Keep growth events server-written and append-only; offline clients may show
  cached growth state but must not invent authoritative events.
- Apply the prepared migration, regenerate ZenStack artifacts, and rerun live
  parity as one batch.

No feature-flag or growth data is deleted or classified as legacy.
