# BaseSelf Feature Recovery

This note captures the richer `Self` feature inventory that existed before the March 2026 slimming and temporal-shell drift.

## What changed

- Around early March, `Self` still carried a richer sanctuary-style feature set per role.
- By commit `6b801260` on March 8, 2026, there was an intentional migration of institutional features out of `Self`.
- After that, the temporal work arrived, but part of the older richness had already been stripped away.

## Recovered role inventories

### Student

Recovered from early March snapshots of `StudentSelfView.tsx`.

- Core
- `pulse`
- `mood`
- `goals`
- `study`
- More tools
- `reflection`
- `progress`
- Additional ambient layers already present in the screen
- daily content cards
- wind-down ritual import
- wisdom seeds import
- grades embedded inside progress

### Teacher

Recovered from `6b801260:packages/self/src/screens/self/TeacherSelfView.tsx`.

- Core
- `pulse`
- `mood`
- `fire`
- `rhythm`
- More tools
- `joyJar`
- `gratitude`
- `wisdom`
- `tomorrowPrep`
- `energyForecast`
- `windDown`
- `venting`
- `sleep`
- `reminders`
- `voiceJournal`
- `decisions`

This was the richest pre-drift sanctuary inventory and is likely the best source when rebuilding teacher Self depth.

### Principal

Recovered from `6b801260:packages/self/src/screens/self/PrincipalSelfView.tsx`.

- Core
- `pulse`
- `energy`
- `decisions`
- More tools
- `wisdom`
- `monthly`
- Additional ambient layer
- `ResonancePatternCard`

Important doctrine already present there:
- principal `Self` was deliberately scoped to personal wellbeing
- institutional and aggregate school features were meant to live outside `Self`

### Founder

Recovered from `6b801260:packages/self/src/screens/self/FounderSelfView.tsx`.

- Core
- `vision`
- `mood`
- `energy`
- More tools
- `philosophy`

Doctrine already present there:
- founder `Self` was framed as personal sanctuary, not ecosystem control center

## Recovery guidance

- Treat the older teacher inventory as the richest sanctuary source.
- Preserve the principal/founder doctrine of keeping institutional dashboards out of `Self`.
- Reintroduce lost richness through the current `BaseSelf` shell, not by returning to per-screen ad hoc layouts.
- Map old features into:
- present content
- optional `historyContent`
- optional future temporal depth

## Guardian opportunity

The codebase already recognizes `parent` and `guardian` roles in permissions, but `Self` had no dedicated guardian sanctuary.

That means guardian `Self` is not restoration work only. It is also a clean chance to:

- reuse the recovered sanctuary doctrine
- keep family support features personal and reflective
- avoid mixing guardian `Self` with classroom administration
