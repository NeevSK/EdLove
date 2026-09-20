---
title: "Shared Route Intent Atlas Inventory"
status: "active"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [atlas, routing, deep-links, auth, expo, nextjs, shared-plumbing]
---

# Shared Route Intent Atlas Inventory

## Purpose and Scope

This is the first Project Atlas exercise. It traces the current shared
deep-link, QR, callback, and return-route plumbing across Expo 57 mobile and
Next.js 16 web. It is an inventory of the local working tree, not a refactor,
release sign-off, or production penetration test.

The human outcome is simple: a person who follows a legitimate Gurudevi link,
confirmation email, invite, or QR code should reach the intended safe place;
an attacker or malformed link should not create a session, disclose data, or
silently send the person somewhere unsafe.

## Atlas Location

| Atlas term | Current owner or surface |
| --- | --- |
| Foundation | `packages/core/src/routing/routeManifest.ts`; authorization/session bootstrap and Supabase callback exchange |
| Shared plumbing | `packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts`, `DeepLinkManager.ts`, public URL configuration, QR resolver |
| Mobile adapter | `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`, mobile dispatch/tracking helpers, Expo Router, native association configuration |
| Web adapter | `apps/gurudevi-web/app/(sanctuary)/auth/*`, Next.js callback page, browser Supabase runtime |
| Doors | native custom scheme, HTTPS Universal/App Links, web callback URL, `returnTo`/`next` query parameters, QR payloads, push-notification targets |
| Fire exits | callback error UI, safe return-path fallback, deferred QR storage, retryable code exchange, route gate redirect |

## Current Entry Point Inventory

| Entry | Mobile behavior | Web behavior | Shared owner |
| --- | --- | --- | --- |
| Auth callback | `gurudevi://auth/callback` is declared in `app.json`; the provider routes accepted external URLs to `DeepLinkManager`; the Expo web callback route calls the manager directly | `/auth/callback` reads `code`, exchanges it through browser Supabase, then safely returns to `next` | Route manifest names `/auth/callback`; core manager interprets callback intent |
| Passwordless/OAuth initiation | Supabase adapter defaults to custom-scheme callback outside a browser | Next.js forms construct an HTTPS callback with `next` and `returnTo` | Core auth port/adapter exists, but web initiation currently uses its browser runtime directly |
| QR link | Provider recognizes custom-scheme and allowed HTTPS QR links, then delegates to scanner-kit | No QR route implementation was found under `apps/gurudevi-web` | Core policy recognizes allowed QR URLs; core QR resolver parses canonical QR payloads |
| Classroom invite | Core manager returns an unhandled invite intent; mobile dispatch navigates to community with `inviteCode` | No matching dedicated web invite route was found in this trace | Core manager recognizes the invite shape |
| Return route after auth | Mobile route gate decides post-auth destination | `safeReturnPath` validates an internal path and preserves its query/hash | Core route manifest and `normalizeAcceptedInternalRoute` |
| Push target | Push provider reuses internal-route and QR policy helpers | Outside this inventory | Shared policy helpers are reused, but dispatch is mobile-specific |

## Known Shared Contracts

### Route authority

`routeManifest.ts` is the canonical list of recognized public and authenticated
route families. `normalizeAcceptedInternalRoute` rejects external/ambiguous,
forbidden-character, traversal, and unknown paths before accepting a known
route family. The Next.js `safeReturnPath` adapter reuses that policy for the
pathname before preserving a local query/hash.

### External-link policy

`deepLinkPolicyPipeline.ts` bounds URL size, rejects dangerous characters and
traversal, and permits only the `gurudevi:` scheme with selected hosts or HTTPS
on selected Gurudevi hosts and selected path prefixes. This is the strongest
existing candidate for platform-neutral shared plumbing.

### Semantic intent

`DeepLinkManager` turns an accepted URL into one of: auth callback, classroom
invite, shared content, or unknown. The mobile adapter owns framework navigation
and telemetry after that interpretation. The Next.js callback currently owns
its own code-exchange and browser navigation behavior.

### QR payload

`QRResolver` is the shared, typed payload parser. It supports canonical QR URLs
and legacy payload forms and returns a non-throwing result. Scanner-kit owns
delivery/persistence of a QR payload in the mobile runtime.

## Verified Divergence and Risks

These are source-observed findings. They do not imply exploitation in a
deployed environment; each requires a focused contract test or target-runtime
verification before a release decision.

| Finding | Evidence in current source | Why it matters | Status |
| --- | --- | --- |
| Allowed HTTPS QR links are not accepted by mobile QR delivery | Core policy and mobile tests recognize `https://gurudevi.app/qr` and sanctuary HTTPS QR links. `dispatchQRDeepLink` only accepts a string beginning `gurudevi://qr`; `DeepLinkProvider` returns `true` after awaiting it without using its Boolean result. | A policy-approved Universal/App Link can be treated as handled while its QR payload is not navigated or stored. This is a functional/recovery gap, not an authorization bypass by itself. | Known source divergence |
| QR capability is not visibly implemented in Next.js | No QR route implementation was found under `apps/gurudevi-web`, while core route authority lists `/qr` and the policy recognizes HTTPS QR. | A shared QR URL may have different or missing browser behavior. The intended web experience needs a product decision. | Known inventory gap |
| Callback handling has two different effect owners | Mobile delegates to `DeepLinkManager`; Next.js `CallbackHandler` directly calls browser Supabase `exchangeCodeForSession`. | Callback failure/retry, telemetry redaction, state/nonce treatment, and user recovery can drift even when both use the same route name. | Known architectural divergence |
| Local state guard is not wired to an outbound flow found in this trace | `DeepLinkStateGuard.generateState` was found only in tests; `DeepLinkManager` verifies state only when a callback contains one. | The intended strict CSRF/state protection cannot be claimed from this class alone. Supabase PKCE behavior may supply related protection, but that is unproven here. | Unproven security contract |
| Native HTTPS association scope differs from policy scope | iOS declares Gurudevi associated domains. Android `intentFilters` auto-verify HTTPS `/qr` only; native custom-scheme callback is declared. | HTTPS callback and invite handling may depend on browser fallback or unverified hosting association files. It must be checked on real devices and deployed domains. | Unproven runtime configuration |
| Web return-path adapter validates pathname before preserving query/hash | `safeReturnPath` validates `destination.pathname`, then returns pathname plus query/hash. | It appears to prevent open redirect through host/origin, but query/hash limits and destination semantics need explicit hostile tests. | Inferred safe for host redirect; unproven for full input contract |

## Platform Differences That Must Remain Explicit

| Concern | Expo 57 mobile | Next.js 16 web |
| --- | --- | --- |
| Incoming link lifecycle | Native cold start, foreground event subscription, deferred storage, Expo Router navigation | Browser request/page lifecycle, query parsing, `window.location`, browser session exchange |
| Credentials/session | Native custom scheme and platform storage/runtime | HTTPS callback and browser Supabase client/session |
| QR handling | Scanner-kit dispatch, native storage, QR screen navigation | Product behavior not yet located; may be a landing/continue-in-app/browser flow |
| Trust association | iOS associated domains and Android intent filters plus hosted verification files | HTTPS origin, Next.js routes, Supabase redirect allow-list |
| User recovery | Route gate, retryable code exchange, app navigation | Callback error screen, request-another-link route, browser navigation |

## Existing Evidence

| Evidence level | Existing coverage observed | What it does not prove |
| --- | --- | --- |
| G0 | Core route manifest, policy pipeline, QR resolver, and state-guard tests | Native/browser lifecycle, actual Supabase exchange, deployed association files |
| G1 | Mobile policy/telemetry/manager tests and web return-path tests use mocked or substituted boundaries | Actual mobile linking, web auth provider behavior, production telemetry redaction |
| G2 | Mobile dispatch tests cover accepted invite routing and rejected-link no-side-effect behavior | End-to-end callback, HTTPS QR delivery, retry/recovery against real dependencies |
| G3 | Mobile provider tests exercise component/provider composition under test substitutions | Real Expo runtime and real Next.js browser lifecycle |
| G5 | No target-device evidence inspected in this inventory | Universal Links/App Links, cold start, resume, offline/retry, and deployed redirect configuration |

## Smallest Shared Contract Worth Extracting

Do not extract a universal navigation component or a shared auth callback UI.
The smallest valuable shared contract is a pure **route intent policy**:

1. Validate and normalize external URLs and internal return paths.
2. Classify an accepted URL as `authCallback`, `qr`, `classroomInvite`, or
   `unsupported` without performing session, storage, telemetry, or navigation
   side effects.
3. Return a typed intent or typed rejection reason.
4. Let explicit Expo and Next.js adapters decide how to execute that intent in
   their runtime.

The existing policy pipeline and route manifest are the starting point. The
proposal is a convergence of their public contract, not a replacement of the
mobile or web adapters. QR payload parsing stays a subsequent concern: it must
first agree on supported HTTPS hosts and platform behavior.

## Proposed Next Slice

Before refactoring, add a narrowly scoped feature contract for route intent
policy convergence. It should answer:

1. Which HTTPS host/path combinations are canonical for QR, invite, and auth
   callback on both platforms?
2. Should a QR URL on the web redeem in browser, show a landing page, or open
   the mobile app? This is a product decision.
3. Which callback protections belong to Supabase PKCE and which must be
   enforced in platform-neutral application code?
4. What should happen after mobile receives an allowed HTTPS QR link that the
   installed app can open?
5. Which query/hash fields are allowed for each typed intent, and which must
   be redacted from telemetry?

Only after those decisions should implementation fix the confirmed HTTPS QR
delivery gap and make the two adapters conform to the shared intent contract.

## Required Next Evidence

- G0 contract cases for every accepted/rejected host, path, encoding, route,
  query, and typed intent.
- G1 adapter cases proving both Expo and Next.js either execute the same intent
  safely or reject it without side effects.
- G2 scenarios for callback replay, missing/invalid state policy, duplicate QR,
  allowed HTTPS QR delivery, expired code, and safe return destination.
- G5 device/browser checks against deployed Universal/App Links, Supabase
  redirect allow-list, cold start, foreground resume, slow network, and offline
  behavior.
