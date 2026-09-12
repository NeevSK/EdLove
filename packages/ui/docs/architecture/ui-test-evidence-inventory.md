---
title: "@repo/ui Test Evidence Inventory"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [ui, testing, vitest, evidence, governance]
---

# `@repo/ui` Test Evidence Inventory

This inventory is subordinate to the root [UI Runtime Testing Standard](../../../docs/architecture/ui-runtime-testing-standard.md).
It records the current G1/G2 uplift boundary and prevents the mock lane from
being mistaken for runtime proof.

## Current baseline

Audit date: 2026-09-07.

| Evidence | Current state | Meaning |
| --- | --- | --- |
| G1 boundary | 52 test files / 214 tests pass through the explicit Vitest 5 boundary command | Harness execution is available; it is not a device or CSS claim; known act/device-provider warnings remain |
| G2 scenario | Button, Input, FormField, and Switch have explicit observable state/interaction contracts | These are eligible for later runtime promotion |
| G3 component-real | Button, Input, FormField, and Dialog/Modal | Real React Native 0.86.3 execution passes for named scenarios; not a hardening sign-off |
| G4 platform-real | Button, Input, FormField, and Dialog/Modal | Browser/Metro fixture verifies named behavior, NativeWind/react-native-css output, Escape dismissal, and focus restoration; not a hardening sign-off |
| G5 device-confirmed | Not started | Requires a real debug build and supported device/emulator smoke |
| R1 production-assured | Not started | Post-G5 release, rollout, telemetry, rollback, and soak gate |

## G2 promotion matrix

The following Tier-1 rows are the next scenario work. Existing tests may
already cover part of a row; the row is not G2 until the complete applicable
contract is explicit and observable.

| Primitive | Required G2 scenarios | Current evidence | Next action |
| --- | --- | --- | --- |
| Button | ready, press, disabled, loading duplicate-block, loading recovery, accessible name | G2 | Maintain and promote remaining variants |
| Input/TextInput | label, helper/error description, invalid, disabled, edit/recovery | G2 | Add controlled/uncontrolled and platform keyboard cases |
| FormField | helper → error → recovery, required, invalid, described-by | G2 | Add required and submit/failure contract |
| Dialog/Modal | closed/open, name, backdrop policy, close, Escape/web, focus entry/restoration | G3 + G4 browser execution evidence | Implement and verify a real focus trap, portal cleanup, rapid-dismissal, and native back/cancellation behavior before calling the primitive production-hardened |
| Sheet/Actionsheet | closed/open, item selection closes, disabled item guard, backdrop dismissal policy, controlled removal | G2 boundary scenarios | Add long-content, gesture-cancellation, portal-cleanup, and native/runtime evidence |
| Select/Combobox | closed/open, selected value, disabled, empty/no match, keyboard selection, cancellation | Partial G2 | Add keyboard selection and cancellation scenarios |
| Tabs | initial selection, switch, selected state, disabled trigger, keyboard traversal | Partial G2 | Add disabled and keyboard contract |
| Toast | show, accessible alert/status, minimum duration, manual dismiss, timer cleanup | Partial G1 | Add queue replacement and cleanup evidence |
| Checkbox | checked/unchecked, group update, disabled, label/state | Partial G1 | Add controlled reset and accessibility state assertions |
| Radio | selected/unselected, group update, disabled, label/state | Partial G1 | Add controlled reset and roving/keyboard contract where supported |
| Switch | on/off, disabled, label/state, controlled update | G2 boundary | Promote to native runtime after the boundary contract is stable |
| Progress | determinate/indeterminate, value bounds, accessible value, loading completion | Partial G1 | Add indeterminate and boundary-value contract |
| Popover | closed/open, trigger, close, outside dismissal, controlled state | Partial G1 | Add dismissal policy and repeated interaction |

## Classification rules

- A passing `test:boundary` run supplies G1 only for the behavior that the
  test actually observes.
- Every UI test script must emit an explicit evidence level through
  `scripts/run-and-report.mjs`; an unqualified `tests passed` statement is a
  governance failure.
- G2 requires a named journey and acceptance criteria; a render assertion or
  mock call count alone is insufficient.
- Pure utilities and state machines remain G0 contract/unit evidence unless
  they are exercised through a component scenario.
- `vi.mock`, NativeWind aliases, portal substitutions, and host-module seams
  are allowed as G1 harness infrastructure. They do not promote G2, G3, or
  G4 by themselves.
- A scenario may be promoted to G3/G4 only after its G2 row is complete.

## Commands

```text
pnpm --filter @repo/ui test:governance
pnpm --filter @repo/ui test:boundary
pnpm --filter @repo/ui test:runtime
```

The first command audits the evidence configuration; the second is the G1
baseline; the third is the explicit G3 native lane for promoted scenarios.
