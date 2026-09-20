---
title: "Feature Spec — Route Intent Policy Hardening"
status: "proposed"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [feature-spec, route-intent, deep-links, qr, effect, zod, security]
---

# Feature Spec: Route Intent Policy Hardening

## Blast Zone

RED — shared security and routing authority in `packages/core/src/logic/`,
with AMBER adapters in mobile and scanner-kit. This specification is required
before code generation by the Gurudevi quality gate.

## Target Files

- `packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts`
- `packages/core/src/logic/deeplink/__tests__/deepLinkPolicyPipeline.test.ts`
- `packages/core/src/logic/utils/QRResolver.ts`
- `packages/core/src/logic/utils/__tests__/QRResolver.test.ts`
- `packages/scanner-kit/src/hooks/useQRDeepLink.ts`
- `packages/scanner-kit/src/hooks/useQRDeepLink.test.ts`
- `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`
- `apps/gurudevi-mobile/src/__tests__/providers/DeepLinkProvider.test.tsx`
- `apps/gurudevi-web/app/(sanctuary)/qr/page.tsx`

`PushNotificationProvider.tsx` is deliberately out of this patch unless
the shared dispatcher introduced by this slice makes its conversion both small
and independently testable.

## Reuses

- `validateDeepLinkEffect`, `normalizeAcceptedDeepLink`, and
  `normalizeAcceptedInternalRoute` for existing URL bounds and allowlists.
- `resolveQR` as the sole QR payload interpreter.
- `GURUDEVI_PLATFORM_URL` and `GURUDEVI_QR_URL` as canonical configuration.
- Existing Expo Router navigation and existing pending-QR storage behavior.
- Effect v3 (`Data.TaggedError`, `Effect`, `Schedule`, `Duration`) already
  present in core. No Effect v4 dependency is introduced.
- Existing Vitest runners and the repository evidence-report wrapper.

## Does

1. Introduce a small, exported typed result for route classification, including
   a QR case carrying an already validated `QRPayload`, plus explicit
   unsupported/rejected outcomes.
2. Make canonical HTTPS QR and accepted `gurudevi://qr` forms classify to the
   same QR result, or reject consistently before adapter code runs.
3. Remove scanner-kit’s raw `startsWith('gurudevi://qr')` authority check;
   it accepts only a policy-approved, resolver-valid QR intent.
4. Make `DeepLinkProvider` return the actual QR dispatch result, so an invalid
   or undeliverable QR link is not reported as handled.
5. Add hostile-input and equivalence contract tests for both transports and
   adapter recovery behavior.
6. Add a public web QR landing which validates the incoming intent but does not
   perform its business action; it offers an explicit app handoff instead.

## Does Not

- Does not establish a session, change Supabase redirect configuration, or
  change PKCE/state behavior.
- Does not redeem a QR/invitation, alter authorization, or make offline
  mutations possible.
- Does not add an AI agent, a dependency, a background worker, analytics
  fields, or logging of raw URLs.
- Does not modify `app/_layout.tsx`, native Android/iOS artifacts, or native
  configuration.
- Does not refactor unrelated deep-link, notification, auth, or QR code.

## Invariants

- Classification is pure: no navigation, storage, network, telemetry, or
  session side effect.
- Raw links and sensitive query data stay out of error values used by adapter
  reporting paths.
- Both URL transports must yield the same QR payload for equivalent inputs.
- An accepted QR link is marked handled only after it has been delivered to
  the authenticated handler or safely persisted as a pending action.
- Existing legacy QR forms retain their current scanner behavior unless a
  separate compatibility decision changes it.

## Complexity Budget

- No function over cognitive complexity 15.
- The shared classifier is one focused module; do not add factories, generic
  policy engines, or adapter frameworks.
- Maximum one new shared public type surface, limited to the route-intent
  union and its safe constructors.

## Evidence Plan

| Claim | Required evidence |
| --- | --- |
| HTTPS and scheme QR classify equivalently | G0 Vitest pure contract cases |
| Invalid/hostile inputs cannot reach QR dispatch | G0 pure policy plus G1 scanner boundary cases |
| Provider does not claim a dropped QR was handled | G3 provider test under mocked Expo/native/storage runtime |
| Native verified app opening | Not claimed by this patch; requires later G5 device evidence |

## Acceptance Examples

| Input | Expected outcome |
| --- | --- |
| `gurudevi://qr?v=1&action=join_class&classroom_id=a` | Typed QR intent or explicit invalid payload rejection |
| `https://gurudevi.app/qr?v=1&action=join_class&classroom_id=a` | Same typed QR intent as the custom scheme |
| `https://evil.example/qr?...` | Rejected; no dispatch/navigation/storage |
| malformed canonical QR | Rejected/unsupported; provider returns `false` |
| valid signed-out QR | Pending action is safely persisted and provider returns `true` |
| valid public HTTPS QR on web | Explain that it is ready and offer explicit app handoff; do not redeem it |

## Review Questions Before Implementation

1. The current QR payload itself contains action identifiers and user-related
   fields. Confirm that retaining a valid pending payload in local storage is
   the intended product behavior and define its expiry in a follow-up slice.
2. Confirm whether legacy bare UUID / `join-class:` scanner values are allowed
   only from the scanner, not external app links. This patch preserves their
   current resolver support but does not make them public route intents.
