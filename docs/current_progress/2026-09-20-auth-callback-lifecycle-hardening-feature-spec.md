---
title: "Feature Spec — Auth Callback Lifecycle Hardening"
status: "superseded"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [feature-spec, authentication, oauth, pkce, deep-links, security]
---

# Feature Spec: Auth Callback Lifecycle Hardening

> **Superseded on 2026-09-20.** The broader, already-active canonical contract
> is [Authentication and Session Lifecycle Hardening](2026-09-20-auth-session-lifecycle-hardening-feature-spec.md).
> The callback-specific findings below were reconciled into the implementation
> investigation and must not be treated as a second implementation authority.

## Blast Zone

RED — shared authentication and external-route authority in
`packages/core/src/logic/`; AMBER — mobile dispatch and the Next.js callback
component. This contract is required before implementation.

## Outcome

An auth callback is classified once, without side effects, before either app
exchanges a one-time Supabase PKCE code. The user gets a clear retry/recovery
state for malformed, expired, replayed, unsupported, or provider-error links.
No callback URL can establish a session by carrying bearer tokens in its
fragment or query string.

## Target Files

- `packages/core/src/logic/auth/authCallbackPolicy.ts` (new)
- `packages/core/src/logic/auth/__tests__/authCallbackPolicy.test.ts` (new)
- `packages/core/src/logic/managers/DeepLinkManager.ts`
- `packages/core/src/logic/managers/__tests__/DeepLinkManager.test.ts`
- `packages/core/src/logic/auth/deepLinkStateGuard.ts` and its isolated tests
  (remove only if the inventory confirms it has no production caller)
- `apps/gurudevi-mobile/src/lib/deepLinks/trackDeepLink.ts`
- `apps/gurudevi-mobile/src/__tests__/entry/deepLinkTelemetry.test.ts`
- `apps/gurudevi-web/app/(sanctuary)/auth/CallbackHandler.tsx`
- callback-policy/component tests discovered during implementation
- `scripts/check-auth-callback-slice.mjs` (new, after evidence tests exist)

## Reuses

- `normalizeAcceptedDeepLink` / deep-link policy allowlisting for transport and
  host validation.
- `AuthManager.exchangeCodeForSession`, whose Supabase adapter owns the actual
  PKCE verifier and session exchange.
- Existing web `browserAuthRuntime`, safe-return-path policy, mobile deep-link
  dispatcher, shared evidence runner, lint, and duplication check.

## Does

1. Add one typed pure classifier with only safe outcomes: `code`,
   `provider-error`, or `rejected`.
2. Accept a code only on the approved callback route and only when it is a
   non-empty single value; the caller exchanges it exactly once.
3. Parse documented provider errors from query or fragment but present a
   product-safe recovery message rather than raw provider text.
4. Reject access/refresh/id tokens in callback URLs, mixed token+code
   callbacks, duplicate code parameters, unsupported hosts/routes, and
   malformed URLs.
5. Make mobile manager and web callback use the same classifier before their
   platform-specific session exchange.
6. Redact `state`, provider error description, codes, and all token names from
   telemetry.
7. Remove the unused in-memory state guard if no outbound flow creates and
   persists matching state. The Supabase client remains the PKCE owner.

## Does Not

- Does not implement an OAuth server, create a custom PKCE verifier, or copy
  Supabase session storage.
- Does not change Supabase Dashboard redirect allow-lists, domain association
  files, Google provider configuration, passkey configuration, or native
  signing.
- Does not make HTTPS app links verified; that is a separate deployed-assets
  and G5-device slice.
- Does not change authentication UI beyond callback success/failure recovery.
- Does not retry a one-time code exchange, because Supabase documents a PKCE
  code as single-use and five-minute-lived.

## Known Facts and Assumptions

| Label | Fact |
| --- | --- |
| Known | Supabase documents a PKCE code as single-use and valid for five minutes; the originating client/device must retain its verifier. |
| Known | Current mobile shared manager conditionally consumes an in-memory state but no production caller generates it. |
| Known | Current manager accepts raw access/refresh tokens and retries code exchange; the web callback independently exchanges a query code. |
| Inferred | Supabase client creation is the authoritative owner of verifier/state handling for the current integration; duplicating it in a generic deep-link manager is unsafe drift. |
| Unproven | Current Supabase project redirect allow-list, provider settings, actual verifier persistence across mobile process death, and behavior of issued legacy token-fragment links. |

## Threats and Failure Modes

| Threat / failure | Required behavior |
| --- | --- |
| Forged host, path traversal, malformed URI | Reject before exchange; no navigation/session mutation. |
| Missing, duplicate, blank, or mixed callback credentials | Reject with recovery; no exchange. |
| Raw access/refresh/id token in URL | Reject; never call `setSession`; never log it. |
| Provider denial/error | No exchange; show safe recoverable error. |
| Replayed/expired code | One exchange attempt; show recovery after provider rejection; no automatic retry. |
| App/browser restart before callback | Do not claim recovery works until G4/G5 proves persisted verifier behavior. |
| Concurrent sign-in flows | Do not claim support until Supabase flow-ID mode is deliberately chosen and tested. |
| Telemetry inspection | Record only safe categorization, never code/state/tokens/raw provider description. |

## Evidence Plan

| Claim | Evidence required |
| --- | --- |
| Hostile callback classification and redaction | G0 Vitest pure contract corpus: valid code, provider error, mixed credentials, duplicate params, encoded/path traversal, malformed/foreign routes. |
| Mobile dispatch causes exactly one exchange and no token session set | G1 boundary tests using a substituted auth port; explicit substitution disclosure. |
| Web callback has visible success/error recovery and a single exchange attempt | G3 real React component runtime test with a substituted browser auth client. |
| Browser PKCE callback against a configured Supabase environment | G4 browser execution with a real test account/provider; no mocked auth client. |
| Native custom-scheme and verified HTTPS callback after cold start/resume | G5 installed Android and iOS tests against the target environment. |

## Rollback

This is a fail-closed security migration. If unexpected legacy callback traffic
appears, the recovery action is to request a fresh link through the current
PKCE flow; do not re-enable raw-token URL session injection. The classifier can
be widened only by a separate documented compatibility decision with real
traffic evidence.

## Modern Reference Basis

- Supabase: [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
  and [native mobile deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking?platform=swift).
- IETF: [RFC 8252 — OAuth 2.0 for Native Apps](https://www.rfc-editor.org/info/rfc8252/).

These sources support PKCE, external browser/in-app browser tabs, one-time
code exchange, and claimed HTTPS redirects where platform association is
available. They do not prove this project's dashboard, certificates, or device
behavior.
