---
title: "Route Intent Policy"
status: "active"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [architecture, routing, deep-links, qr, auth, expo, nextjs, security]
---

# Route Intent Policy

## Authority and Purpose

This is the living source of truth for public links, QR links, auth callbacks,
return destinations, and app-opening behavior across Gurudevi Mobile (Expo 57)
and Gurudevi Web (Next.js 16). It replaces older prescriptive deep-link
decisions and implementation plans listed in the References section. Their
audits remain historical evidence.

The product rule is:

> Web and mobile are both first-class homes. Continue in the environment where
> the person has an authenticated, supported relationship with Gurudevi; when
> that is not possible, offer a clear and respectful route to the best available
> experience.

No link is trusted merely because it contains the Gurudevi name. Every link is
untrusted input until it has been validated, classified, and executed by the
appropriate platform adapter.

## Decisions

### Canonical public address

Public, shareable Gurudevi links use HTTPS on the canonical domain:

```text
https://gurudevi.app/<intent>
```

HTTPS is the public format because it works in browsers, can fall back to a web
experience when the app is unavailable, and can be verified by Android App
Links and Apple Universal Links. The `.app` top-level domain requires HTTPS in
web browsers through HSTS preloading.

`gurudevi://...` is a native custom-scheme transport and compatibility
fallback. It is not the canonical public/share URL and must not be the only way
to reach a user-facing action. A custom scheme has no browser fallback and is
not proof that the receiving application owns a web domain.

Development may use declared localhost HTTP URLs only in explicitly scoped
development configuration. Production public links never use HTTP.

### Environment selection

The system must not use hidden browser-history heuristics or unreliable app
installation detection to force an environment. It uses this order:

1. A verified HTTPS link opens the installed native app when the operating
   system has verified the matching domain/path association.
2. Otherwise, the HTTPS link opens a web landing or web flow.
3. A signed-in web user continues on web only when the classified action is
   explicitly supported there.
4. For a mobile-only action, web explains why and offers an explicit **Open
   Gurudevi** or **Get the app** action.
5. A user may make and retain an explicit environment preference where useful;
   absence of a preference is not permission to infer private history.

The website must remain useful when the native app is absent or domain
association verification is unavailable. It is the graceful fallback, not an
error page.

### No automatic business action from a link

Opening, scanning, or receiving a link may validate and preserve an intent. It
must not by itself join a classroom, change membership, complete a payment, or
expose protected data. An auth callback may establish a session only through
its explicit verified code/session exchange; all other protected actions require
the normal authenticated server-side authorization and business validation path.

### Shared functional core and platform adapters

The platform shares a pure route-intent policy. It validates, normalizes, and
classifies a URL without navigation, storage, network, telemetry, or session
side effects. Expo and Next.js adapters execute the resulting typed intent in
their own runtime.

```text
External HTTPS URL, native URI, QR value, or return path
                         |
                         v
Shared policy: validate -> normalize -> classify -> typed intent or rejection
                         |
             +-----------+-----------+
             |                       |
             v                       v
Expo adapter                     Next.js adapter
native lifecycle,                browser landing/flow,
router, storage                  browser session, navigation
```

This is a functional-core, imperative-shell boundary. It prevents the same
security decision from being reimplemented differently in mobile and web while
keeping platform behavior explicit.

## Route Intent Contract

### Input classes

| Input | Examples | Policy treatment |
| --- | --- | --- |
| Public HTTPS URL | `https://gurudevi.app/qr?...` | Validate scheme, host, path, length, encoding, and intent-specific parameters |
| Native URI | `gurudevi://auth/callback?...` | Compatibility/native handoff only; validate approved host and path |
| Internal return path | `/self`, `/workspace?date=...` | Validate against the route manifest before it may be used after authentication |
| QR payload | Canonical URL or supported legacy QR form | Parse through the typed QR resolver; never hand-parse in a screen |
| Notification target | Internal route or supported link | Pass through the same policy; never push an arbitrary string directly to a router |
| Local file/content URI | `file://`, `content://` | Not a route intent; handled by the relevant native capability boundary |

### Output classes

The shared policy must return one of these results:

| Result | Meaning | Side-effect rule |
| --- | --- | --- |
| `authCallback` | A valid, recognized authentication callback shape | Adapter may begin the authorized code/session exchange flow |
| `qr` | A valid typed QR payload or safe QR landing intent | Adapter may preserve/navigate; business action still requires authorization |
| `classroomInvite` | A valid invite-shaped route intent | Adapter may show the invite flow; server decides whether it is redeemable |
| `internalRoute` | A validated local destination | Adapter may navigate only through its route API |
| `unsupported` | Well-formed but intentionally unsupported input | No business/navigation side effect; show recovery if user-visible |
| `rejected` | Invalid, untrusted, malformed, excessive, or unsafe input | No side effect; telemetry records only safe rejection metadata |

The final TypeScript union and parameter schemas are implementation work. This
document defines the semantic contract, not an excuse to introduce a new
abstraction before the contract is needed.

## Canonical Intent Families

| Family | Canonical public URL | Native fallback | Web experience | Current state |
| --- | --- | --- | --- | --- |
| Auth callback | `https://gurudevi.app/auth/callback?code=...` | `gurudevi://auth/callback?...` where a native provider requires it | Complete code exchange and safely return | Implemented differently in mobile and web; association and state/PKCE evidence remain incomplete |
| QR | `https://gurudevi.app/qr?...` | `gurudevi://qr?...` | Validate intent; continue on web only for explicitly supported action, otherwise offer app handoff | Shared recognition exists; HTTPS QR delivery and web QR behavior need convergence |
| Classroom invite | `https://gurudevi.app/invite/classroom/<code>` once publicly enabled | `gurudevi://invite/classroom/<code>` only if native compatibility is needed | Present safe invitation flow; redeem only after sign-in and server authorization | Mobile semantic handling exists; canonical public/web contract needs confirmation |
| Internal return | Not shared externally by default | Not applicable | Validated local route only | Route manifest and web safe-return helper exist |

Additional public content routes are added only when they have a real web route,
intent parser, authorization policy, platform adapters, and hostile-input tests.

## Web and Mobile Experience Rules

### Web is a supported home

Web is not merely an app-install advertisement. A signed-in browser user may
continue an intent on web when the action is intentionally implemented and safe
there. The capability decision is explicit per intent; it is not guessed from
the existence of a URL.

For actions that require mobile capabilities or have not been implemented on
web, the landing gives a plain explanation and a visible **Open Gurudevi** or
**Get the app** path. It never pretends completion occurred.

### App opening

The preferred app-opening mechanism is the operating system's verified handling
of the same HTTPS URL. Android App Links use a hosted Digital Asset Links file;
Apple Universal Links use an associated-domain relationship and hosted
association file. Custom-scheme opening is an explicit fallback, not a
guarantee that an app is installed.

The user may remain in a browser when their operating system/browser expresses
that preference. The product should respect it and provide a useful web
experience rather than looping through forced redirects.

### Deferred continuation

The system may preserve a minimal, validated, non-sensitive intent across sign
in or temporary offline interruption. It must not preserve credentials, raw
callback URLs, unbounded payloads, or authorization conclusions. A browser to
app-store install does not automatically retain the original destination; any
post-install continuation needs a separately designed, privacy-safe mechanism
and must be treated as unimplemented until verified.

## Failure, Retry, and Recovery Contract

| Condition | Required behavior |
| --- | --- |
| Offline on receipt | Validate local shape only, retain a minimal safe intent where appropriate, explain that connection is required before continuing; never perform a join/auth mutation offline |
| Temporary network failure | Preserve user intent, show retry, and retry only operations with safe/idempotent semantics; never duplicate an invitation redemption or mutation |
| Interrupted auth callback | Show a clear sign-in failure state and offer retry/request-new-link; never assume a session was established |
| Expired, used, or revoked link | Show a non-blaming explanation and a safe next action, such as requesting a new invitation or returning to sign-in |
| Broken, malformed, untrusted, or unsupported link | Reject before routing/business side effects; show a plain recovery screen where the user can see it; emit redacted rejection telemetry only |
| Verified app link unavailable | Let the HTTPS URL work in web; provide an explicit app-opening option without stranding the person |
| Unsupported web action | Explain the limitation, preserve only a safe continuation if defined, and offer the appropriate app path |
| Duplicate/replayed callback or QR | Treat it as a normal recoverable state; server-side idempotency and authorization remain the final authority |

## Security and Privacy Invariants

- Production public links use HTTPS. Accepted hosts and paths are allowlisted.
- Paths and parameters are bounded, parsed structurally, and reject traversal,
  forbidden characters, ambiguous origins, and unsupported schemes.
- Access tokens, refresh tokens, authorization codes, email addresses, and
  sensitive payload fields never enter telemetry, logs, crash reports, share
  URLs, or pending-intent storage.
- Links classify intent; server-side authorization decides protected access and
  state changes.
- Auth callback replay/state/PKCE behavior is treated as unproven until its
  outbound generation, Supabase configuration, and target-runtime handling are
  traced and tested together.
- Invalid inputs fail closed; user-facing failure is clear but does not reveal
  sensitive implementation detail.

## Current Implementation Map

| Responsibility | Current code owner | Convergence direction |
| --- | --- | --- |
| Public URL configuration | `packages/core/src/config/publicUrls.ts` | Keep one environment-aware canonical host definition; do not duplicate hosts in adapters |
| Route authority | `packages/core/src/routing/routeManifest.ts` | Keep as source of valid internal route families |
| External URL policy | `packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts` | Evolve into the pure route-intent classifier, retaining existing bounds and allowlists |
| Semantic URL interpretation | `packages/core/src/logic/managers/DeepLinkManager.ts` | Separate classification from auth/session side effects only after the new contract is specified and tested |
| Typed QR parsing | `packages/core/src/logic/utils/QRResolver.ts` | Keep as canonical QR parser; align HTTPS host acceptance with route policy |
| Expo lifecycle/dispatch | `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`, `src/lib/deepLinks/*`, scanner-kit | Use typed intents; preserve native lifecycle, storage, and Expo Router ownership |
| Next.js browser flow | `apps/gurudevi-web/app/(sanctuary)/auth/*` | Use typed intents/safe return contract; preserve browser session and Next.js ownership |
| Native association configuration | `apps/gurudevi-mobile/app.json` plus hosted association files | Verify actual Android and iOS deployment artifacts before relying on automatic app opening |

## Confirmed Refactor Targets

1. **HTTPS QR delivery mismatch.** The shared policy recognizes allowed HTTPS
   QR URLs, while the mobile scanner-kit dispatcher currently accepts only
   `gurudevi://qr`. The Expo provider reports QR handling without using the
   dispatch result. Align acceptance and delivery under one typed QR intent.
2. **Web QR capability.** No dedicated Next.js QR route was located in the
   current inventory. Add one only after its supported-action matrix and safe
   landing behavior are specified.
3. **Callback convergence.** Expo delegates to the core manager while Next.js
   directly exchanges a code through its browser client. Share classification
   and error semantics; do not force identical runtime mechanics.
4. **Callback state/PKCE proof.** `DeepLinkStateGuard` generation was found in
   tests but not in an outbound flow. Trace actual Supabase PKCE/state behavior
   and either wire the guard correctly or remove the unsupported claim.
5. **Association evidence.** Android/iOS domain association files and installed
   device behavior are deployment evidence, not a unit-test result.

## Implementation Sequence

### Phase 1: Contract and capability matrix

- Define the typed route-intent union and per-intent parameter schemas.
- Decide which QR/invite actions are web-capable, mobile-only, or unavailable.
- Define safe pending-intent fields, expiry, storage owner, and deletion rule.
- Confirm canonical hosts/paths and Supabase redirect allow-list per environment.

### Phase 2: Pure policy convergence

- Add classification tests before moving adapters.
- Make HTTPS and custom-scheme QR URLs classify to the same typed QR intent
  where they are both allowed.
- Make auth callback, invite, internal-route, rejection, and unsupported
  results explicit.
- Keep existing security bounds and telemetry redaction guarantees.

### Phase 3: Adapter convergence

- Update Expo dispatch so policy-approved HTTPS QR links either reach the
  intended QR flow or return a visible recoverable failure; do not mark a
  dropped payload handled.
- Add the Next.js QR landing only for approved web capabilities; otherwise
  render the respectful handoff/recovery experience.
- Align callback error/retry/recovery semantics while preserving platform
  session APIs.

### Phase 4: Deployment and device proof

- Publish and verify Android `assetlinks.json` and Apple
  `apple-app-site-association` for every canonical host.
- Test installed-app, no-app, browser-preference, cold-start, foreground-resume,
  slow-network, offline, expired-link, and duplicate-link cases.
- Verify the Supabase redirect allow-list and callback behavior in the target
  environment.

### Phase 5: Ratchet and release evidence

- Apply the diff-scoped test-evidence and adversarial-review ratchet to this
  slice.
- Record G0-G5 evidence, substitutions, limitations, open waivers, and device
  results in its release packet.
- Block only promotion of this route-intent slice when required evidence is
  absent; do not retroactively block unrelated legacy work.

## Definition of Done by Claim

| Claim | Required evidence |
| --- | --- |
| Shared policy implemented | G0 typed contract and hostile input tests plus changed-package type/lint checks |
| Expo and web adapter alignment | G1/G2 tests for equivalent classified intent, safe side effects, and recovery behavior |
| User-visible callback/QR lifecycle | G3 component/runtime evidence with stated substitutions and limitations |
| Verified native app opening | G5 installed-device tests for Android and iOS plus deployed association-file verification |
| Production-hardened route intent | All above, real target-environment callback/association evidence, independent adversarial review, rollback/recovery path, and no unexpired critical waiver |

## References and Superseded Guidance

### Platform references

- [Android App Links overview](https://developer.android.com/training/app-links/about)
  and [verification guidance](https://developer.android.com/training/app-links/verify-applinks).
- [Apple Universal Links guidance](https://developer.apple.com/documentation/Xcode/allowing-apps-and-websites-to-link-to-your-content).
- [Google Registry `.app` HTTPS policy](https://www.registry.google/domains/app/).

- Historical mobile audit: `apps/gurudevi-mobile/docs/architecture/2026-09-07-url-uri-deep-link-audit.md`.
- Historical mobile implementation plan: `apps/gurudevi-mobile/docs/current_progress/2026-09-07-url-uri-deep-link-implementation-plan.md`.
- Historical Expo Router decision: `apps/gurudevi-mobile/docs/architecture/2026-06-10-expo-router-deeplink-decision.md`.
- Historical auth/deep-link automation audit: `apps/gurudevi-mobile/docs/architecture/2026-08-13-auth-gate-deeplink-audit.md`.
- Historical deep-link lifecycle feature specification:
  `apps/gurudevi-mobile/docs/current_progress/2026-09-07-deep-link-lifecycle-feature-spec.md`.
- Superseded cross-platform threat architecture:
  `docs/architecture/2026-09-20-deep-link-security-and-resilience.md`.
- Current evidence inventory:
  `docs/current_progress/2026-09-20-shared-route-intent-atlas-inventory.md`.

The dated records explain how the system reached its present state. This document
governs future route-intent design and implementation.
