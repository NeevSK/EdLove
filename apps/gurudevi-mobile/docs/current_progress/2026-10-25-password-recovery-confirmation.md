---
title: "Native password recovery confirmation"
status: active
created: 2026-10-25
updated: 2026-10-25
author: Codex
tags: [auth, recovery, verification]
---

# Feature spec: native password recovery confirmation

## Blast Zone: AMBER

## Target File

`src/entry/PasswordRecoveryBoundary.tsx`, its existing component test, and
`src/entry/usePasswordRecovery.ts` for the existing boundary's operation state.

## Reuses

`authAPI` recovery events, live session lookup, verified factor inventory,
TOTP challenge/verification, explicit password reauthentication and the
Sanctuary-backed password command. Retain the existing SanctuaryModal and
brand form primitives rather than replacing the established screen shell.

## Does NOT

No root-layout change, automatic code delivery, implicit factor enrollment,
lost-factor bypass, direct provider password update, offline secret storage,
or success inferred from email/code request. The existing recovery event is
the entry prerequisite. The server retains recent-TOTP mutation authority.

## Complexity Budget

Controller below 220 lines and view below 200 lines; individual handlers below
cognitive complexity 15. A shared operation boundary governs concurrent clicks,
account changes, dismissal and unmount for all three explicit user actions.

## Invariants and acceptance

- Recovery opens only for an identified non-anonymous credential subject.
- Factor loading is explicit. A person can choose among verified TOTP factors.
  Empty/failed inventory never becomes permission to bypass MFA.
- Save verifies TOTP before dispatching the password command, forwarding only
  optional current-password and provider nonce values actually entered.
- Every asynchronous stage checks the same recovery attempt and current
  credential subject. Account change, sign-out, dismissal or unmount invalidates
  pending completion and clears secret drafts. A late result cannot close or
  write into a newer recovery attempt.
- Repeated submission is blocked synchronously while an operation is pending.
  Failed saves retain the draft and show an inline error; only a confirmed
  password mutation dismisses the form.
- Code requests are explicit and reported as requested, not delivered/verified.

Required evidence: component-tree scenarios with substituted auth/native
boundaries, scoped static checks, and separately real provider/native evidence.
Lost/non-enrolled factor recovery remains a product-policy admission; this UI
must state its limitation rather than silently relax the server gate.

## Implementation and evidence

The existing modal delegates operation state to `usePasswordRecovery`. All
factor reads, TOTP verification, code requests and password saves are explicit
actions. An attempt-owned operation guard prevents repeated clicks, rejects
changed live sessions and discards late results after dismissal/unmount or a
new recovery event. Selected factors must be verified TOTP factors; a missing
factor never enables a password mutation. Password drafts survive a failed
save and clear on confirmed completion, dismissal or account transition.

The password command also carries a client-only expected credential subject.
The shared adapter compares that subject with its SDK session before dispatch
and never forwards it as a provider mutation attribute or server account
selector. This closes a gap between the UI's session check and the adapter's
own asynchronous session lookup. The server continues deriving its actor from
verified credentials and canonical account binding.

- G3 / React test renderer under Vitest: 15 component scenarios succeeded with
  auth and native form/modal primitives substituted. Includes verified-factor
  selection, TOTP-before-password ordering, optional confirmation forwarding,
  code-request distinction, failures and retry, empty inventory, sign-out,
  session change without callback, stale completion, dismissal, unmount and
  synchronous repeated-click prevention. Does not establish real native UI,
  real provider delivery or physical-device behavior.
- G1 / Core Vitest: 56 adapter/manager cases succeeded, including expected
  subject denial before transport and exclusion of the assertion from the
  outgoing password command. Provider/transport boundaries are substituted.
- G0 / Core declaration build succeeded. Rebuilding its stale declarations
  cleared missing-method/export errors in workspace consumers. The subsequent
  workspace type check still fails with seven community errors; direct mobile
  typing reports 21 errors elsewhere, with no diagnostic in these recovery
  files. Neither broad type check is accepted as successful.
- Scoped Biome formatting/import checks, explicit enabled cognitive-complexity
  checking, Oxlint and jscpd succeeded; jscpd found zero clones across the view
  and controller. ESLint was attempted but crashes while loading SonarJS 4.2.2
  (`TypeError` reading `Void`) before file analysis. Alternative checks do not
  count as successful execution of that required ESLint gate.
- Broad `check:anti-slop` still exits 1 with 48 native findings in the shared
  change set. No finding names these recovery files. Raw unified diff and
  whitespace review retained password validation, error feedback, failure
  draft retention and the existing modal/route composition.

No hosted setting or dependency changed. Real email/recovery-link expiry and
replay, confirmation delivery, native keyboard/scroll/accessibility behavior,
and physical-device acceptance remain required. Lost/non-enrolled factor
recovery is explicitly unresolved, and the screen reports that limitation.
