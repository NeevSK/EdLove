# Gurudevi Audit Execution Roadmap

This is the recommended order for acting on the 36-item audit. It is a plan,
not evidence that the fixes have been implemented.

## Phase 0 — establish reproducible truth

- GD-001/GD-002: reconcile React and React Native declarations across root app
  manifest, mobile manifest, lockfile, and installed runtime.
- GD-003: regenerate/review stack-map documentation after the dependency truth
  is settled.
- GD-035: capture the cold-start baseline before changing boot work.
- Retry Expo diagnostics with stable network access and the intended Doppler
  environment; record the complete result.

Exit evidence: one canonical dependency pair, fresh generated stack docs, and a
recorded baseline TTI measurement.

## Phase 1 — prevent false success and data/trust failures

Fix and test these before visual polish:

- GD-005 Gradebook save feedback.
- GD-006 Mood check-in failure handling.
- GD-007 Voice Journal persistence/completion ordering.
- GD-011 Settings navigation contract.
- GD-012 Account-switch failure feedback.
- GD-017 Native destructive-action confirmation.
- GD-018 Native clipboard write.
- GD-019 Soft-failure saving states.
- GD-031 AI assistant paywall route.

Exit evidence: rejected, offline, and soft-failure tests show no false success,
lost input, stuck spinner, or uncaught route failure.

## Phase 2 — shared contracts and systemic reliability

- GD-004: replace raw native `alert()` with the shared feedback contract.
- GD-008/GD-009/GD-020: unify load/error/empty/stale states.
- GD-013/GD-015: define one logout contract and audit-event semantics.
- GD-016: verify local-only queue admission while preserving batch atomicity.
- GD-022: test and resolve the auth listener registration gap.
- GD-014: confirm and wire the FAB renderer if the feature is still intended.
- GD-024: use the shared Heading primitive.

Exit evidence: shared error/loading/navigation/logout contracts are enforced by
tests or static checks, not only by convention.

## Phase 3 — accessibility and humane interaction

- GD-025/GD-026: Auth and delete-account semantics/live announcements.
- GD-027/GD-028: implement the specified Auth recovery and password guidance.
- GD-029/GD-030: label Self/workspace content controls and improve touch targets.

Exit evidence: component tests plus native screen-reader review for the highest-
traffic and highest-consequence flows.

## Phase 4 — architecture debt and performance decisions

- GD-032: document SQLite ownership and remove only proven redundant paths.
- GD-033: enforce the icon bridge after migrating direct consumers.
- GD-034: decide the styling-engine owner using audit output and compatibility
  evidence.
- GD-021: rebuild the current startup dependency graph, then optimize measured
  bottlenecks.
- GD-036: verify magic-link completion on native end to end.

Exit evidence: decisions are recorded with before/after measurements, and no
dependency is removed solely because it looks duplicated.

## Parallel quality controls

- Add static detectors for raw native `alert`, console-only async catches,
  success UI outside success branches, and missing accessibility semantics on
  high-traffic Pressables.
- Add a manifest/lockfile/runtime version consistency check.
- Add a sync local-only queue-admission test.
- Keep the coverage matrix and worklog updated in the same change as each fix.
