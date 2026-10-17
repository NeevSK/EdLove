---
title: "Onboarding Admission Idempotency RFC"
status: "active"
created: 2026-10-17
updated: 2026-10-17
author: "Naveen"
scribe: "Codex"
tags: [onboarding, admission, idempotency, auth, recovery]
---

# Onboarding Admission Idempotency RFC

## Decision requested

Approved: a subject-bound idempotency contract for the authenticated
`completeOnboarding` command.

## Observed seam

The mobile journey prevents concurrent presses with `isProcessing`, and the
current completion handler writes an idempotent final profile state. Neither
property proves recovery when the server commits but the client loses the
response. The contract does not accept an operation key or return a durable
completion receipt, so a retry cannot distinguish a first execution from a
replay.

## Proposed bounded contract

1. Client creates one UUID operation key only when final completion begins and
   retains it until a confirmed response or an account change. Earlier steps
   create no completion key, so an abandoned/incomplete journey has no durable
   completion operation to recover.
2. `POST /identity/complete-onboarding` accepts that key in a named idempotency
   header or typed request body; the server scopes it to the authenticated
   subject, never a caller-supplied user ID.
3. The server stores the completion result atomically with the profile update.
   Same subject + same key returns the original success receipt; same subject
   + different payload is rejected. A different subject cannot observe or
   replay the first subject's receipt.
4. Existing completion calls without a key retain their present behavior during
   a compatibility window. No route, identity, or bond is removed.

## Required G2 scenarios

| Scenario | Setup | Required assertion |
| --- | --- | --- |
| Timeout after commit | Server commits, response is lost | Retry with same key returns success without duplicate bond/side effect |
| Duplicate press | Two client calls share one key | Exactly one durable completion; both callers receive equivalent receipt |
| Account switch | Account A starts, then B signs in | A's key/draft cannot complete or reconcile B |
| Guest upgrade | Anonymous local completion upgrades to authenticated | Guest local state is not treated as authenticated completion; new subject uses its own command/key |
| Rejected retry | Key reused with divergent input | Server rejects conflict and preserves original completion |

## Non-goals

- No general-purpose retry framework or new global auth listener.
- No client-supplied subject identifier.
- No migration from the existing single `SessionRouteGate` navigation owner.
- No deletion of local guest onboarding behavior.

## Verification plan

- G1: contract schema and handler validation for missing, malformed, replayed,
  and cross-subject keys.
- G2: stateful handler/client scenarios above with substituted transport and
  storage.
- G3: mount `OnboardingScreen` / `OnboardingWrapper` and prove the recovery
  overlay and admission gate respond to the receipt outcome.
- G5: execute timeout/airplane-mode retry and account-switch checks on the
  supported Android device after a development build is installed.

## Blast radius

- `packages/core/src/api/onboarding.contract.ts`
- `packages/core/src/api/onboardingClient.ts`
- `packages/core/src/api/handlers/onboarding.ts`
- `packages/ui/src/screens/OnboardingScreen.tsx`
- focused core, UI, and mobile-entry tests

The approved implementation reuses `operation_receipts` with the account,
capability, and key uniqueness constraint. No new global retry system or
onboarding progress persistence was introduced.
