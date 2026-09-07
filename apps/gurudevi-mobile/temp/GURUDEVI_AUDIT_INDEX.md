# Gurudevi / EdLove Audit Package

Snapshot: 2026-09-07

## Start here

1. [Coverage matrix](GURUDEVI_AUDIT_COVERAGE_MATRIX.md) — every tracked item,
   source audit, confidence/status, and next action.
2. [Concrete remediation checklist](GURUDEVI_CONCRETE_REMEDIATION_CHECKLIST.md)
   — actionable file-level issues and treatments.
3. [Systemic patterns and prevention](GURUDEVI_SYSTEMIC_PATTERNS_AND_PREVENTION.md)
   — cross-cutting patterns, detectors, review rules, and prevention controls.
4. [Stack and documentation freshness](GURUDEVI_STACK_AND_DOC_FRESHNESS.md) —
   current stack truth and manifest/lockfile/runtime discrepancies.
5. [Worklog](GURUDEVI_AUDIT_WORKLOG.md) — evidence trail, corrections, commands,
   and remaining verification gaps.
6. [Execution roadmap](GURUDEVI_EXECUTION_ROADMAP.md) — recommended order,
   exit evidence, and parallel quality controls.
7. [Granular line-by-line cross-list](GURUDEVI_GRANULAR_LINE_BY_LINE_CROSSLIST.md)
   — source-linked issue ledger with 120 decomposed entries.
8. [First abstraction patterns](GURUDEVI_FIRST_ABSTRACTION_PATTERNS.md) —
   recurring issue families.
9. [Second abstraction controls](GURUDEVI_SECOND_ABSTRACTION_CONTROLS.md) —
   proactive detection, prevention, and operating controls.

## Permanent implementation documents

- [`2026-09-07-gurudevi-audit-recovery-plan.md`](../docs/current_progress/2026-09-07-gurudevi-audit-recovery-plan.md)
  — the phased implementation sequence.
- [`gurudevi-audit-remediation-sop.md`](../docs/runbooks/gurudevi-audit-remediation-sop.md)
  — the required operating procedure for every remediation slice.
- [`2026-09-07-native-color-runtime-diagnosis.md`](../docs/current_progress/2026-09-07-native-color-runtime-diagnosis.md)
  — Metro singleton-resolution diagnosis; pending signed-in device validation.

## Source material reviewed

- `EDLOVE_GURUDEVI_CONTEXT.md`
- `GURUDEVI_MOBILE_FINDINGS_AND_TREATMENTS.md`
- `GURUDEVI_TEMPORAL_FLOW_AUDIT.md`
- `GURUDEVI_TWO_LAYER_AUDIT.md`
- `GURUDEVI_USABILITY_DELIGHT_A11Y_AUDIT.md`
- `GURUDEVI_USEEFFECT_ANALYSIS.md`

The six files above remain the original evidence documents. The checklist,
cross-list, pattern analysis, controls, and roadmap are reorganizations and
planning artifacts; consult the originals for the actual audit narrative and
code-level evidence.

## Current scope status

- 36 tracked items, GD-001 through GD-036.
- Confirmed findings are separated from leads, architecture risks, stale claims,
  and runtime-dependent verification tasks.
- No application code or dependency versions were changed by this audit pass.
- A separate runtime fix has been applied to Metro singleton resolution for
  NativeWind / `react-native-css`; its signed-in device validation remains open
  and is tracked in the native color diagnosis log.
- Lifecycle/routing fragmentation is now a priority RED-zone recovery stream:
  sign-out/account switching, bootstrap route authority, duplicate lifecycle
  ownership, and the unmounted Sanctuary wiring must be addressed through a
  proposal-and-contract-tests-first slice.
- Runtime-only items remain open where static inspection cannot prove behavior:
  cold-start measurement, native magic-link completion, and selected caller/
  contract traces.

## Important corrections made during review

- Runtime is React Native `0.86.3`; the app manifest still declares `0.86.2`.
- Resolved/installed React is `19.2.3`; the root manifest declares `19.2.8`.
- PowerSync local-only tables are intentional; table-count mismatch alone is not
  a bug.
- `useWorkspaceLayoutSync` and `AppLifecycle` are used; the supplied “unused”
  claim is stale.
- Current logout sequencing does not prove the original remote-network failure
  scenario because it uses local Supabase sign-out.
