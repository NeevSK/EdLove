---
title: "GuruDevi URL and URI Boundary Audit"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, audit, url, uri, deep-links, security]
---

# GuruDevi URL and URI Boundary Audit

## Scope and outcome

This audit reviews how GuruDevi uses URLs and URIs across native authentication, Expo Router navigation, web deep links, QR payloads, notifications, external links, and share links.

The audit covers the current working tree as inspected on 2026-09-07. It is a point-in-time record; implementation work belongs in [the companion implementation plan](../current_progress/2026-09-07-url-uri-deep-link-implementation-plan.md).

The central conclusion is that GuruDevi has several good local URL helpers, but no single end-to-end contract for distinguishing:

- external web URLs (`https://...`);
- app deep-link URIs (`gurudevi://...`);
- local file/content URIs (`file://...`, `content://...`);
- internal Expo Router paths (`/library/resource/...`);
- authentication callback URLs containing credentials or one-time codes.

The most urgent issue is credential leakage: native deep-link analytics currently records raw callback URLs and parsed parameters, which can include OAuth access and refresh tokens.

## Severity summary

| Priority | Finding | Impact | Primary locations |
| --- | --- | --- | --- |
| P0 | Auth callback URL and parameters are tracked without redaction | OAuth bearer-token exposure through analytics | `DeepLinkProvider.tsx`, `DeepLinkManager.ts` |
| P1 | Native OAuth redirect path differs from the declared callback path | Google, passkey, or magic-link callbacks can fail to return to the app | `AuthScreen.tsx`, `app.json`, `auth.adapter.ts` |
| P1 | HTTPS deep-link policy accepts any host | Untrusted URLs enter the deep-link pipeline and telemetry | `urlPolicy.ts` |
| P1 | Library and profile share URLs do not match current Expo Router routes | Shared links can land on a non-existent route | `resourceLinks.ts`, `ProfileScreen.web.tsx` |
| P1 | Post share URL has no matching deep-link consumer | Shared posts do not reliably open the intended post | `PostCard.tsx`, `DeepLinkManager.ts` |
| P1 | Hash OAuth parsing corrupts URLs that already contain query parameters | Valid callback responses can be interpreted as missing tokens | `DeepLinkManager.ts` |
| P1 | Notification links bypass centralized validation | Notification payloads can navigate outside the approved route contract | `PushNotificationProvider.tsx` |
| P1 | Native deep-link failures are not consistently recovered | Malformed or failed callbacks can produce unhandled rejections | `DeepLinkProvider.tsx` |
| P1 | iOS and Android verified-link evidence is incomplete | HTTPS links may open in the browser instead of the app | `app.json`, deployment configuration |
| P2 | External-link helper passes arbitrary non-HTTP schemes to the OS | Unsupported or unsafe URI schemes can be opened | `packages/ui/src/utils/linking.ts` |
| P2 | Tests do not cover the critical URL boundary cases | Regressions can pass the current suite | deep-link and auth tests |

## URL and URI vocabulary for this codebase

| Concept | GuruDevi example | Correct use |
| --- | --- | --- |
| External URL | `https://platform.gurudevi.edlove.org/p/...` | Browser, share, web authentication, public resources |
| App URI | `gurudevi://auth/callback` | Native app handoff and native auth callback |
| Internal route path | `/library/resource/[resourceId]` | Expo Router navigation inside the app |
| Local file URI | `file:///...` or `content://...` | Camera, OCR, downloads, previews |
| Auth callback URL | `https://.../auth/callback?code=...` or a fragment containing tokens | One-time processing only; must not be logged raw |
| Data URL / arbitrary URI | `data:...`, `javascript:...`, unknown custom schemes | Reject unless a narrowly scoped feature explicitly needs it |

The important boundary is semantic, not the variable name. A field named `url` may hold an external source URL, while an image picker `uri` is usually a local file/content URI. Authentication `redirectTo` may be either a URL or an app URI depending on platform.

## Findings

### P0 - Authentication credentials are exposed to analytics

`DeepLinkManager.handleURL()` parses all query parameters into a record. `DeepLinkProvider.trackDeepLink()` then sends both the original URL and the parsed parameters to PostHog.

Relevant code:

- [DeepLinkProvider.tsx](../../src/providers/DeepLinkProvider.tsx:13)
- [DeepLinkProvider.tsx](../../src/providers/DeepLinkProvider.tsx:16)
- [DeepLinkManager.ts](../../../../packages/core/src/logic/managers/DeepLinkManager.ts:43)
- [DeepLinkManager.ts](../../../../packages/core/src/logic/managers/DeepLinkManager.ts:77)

Native OAuth callbacks may contain `access_token` and `refresh_token`. Those values must never be sent to analytics, logs, crash reports, notification payloads, or share links.

Required control:

- Track only the scheme, trusted host, path, link type, platform, and boolean presence flags.
- Strip credentials before any logging or telemetry.
- Add a regression test asserting that `access_token`, `refresh_token`, `code`, and `error_description` are absent from the telemetry payload.

### P1 - Native OAuth callback URI is inconsistent

The native auth screen creates a redirect with `path: 'auth-callback'`, while the app configuration and Supabase adapter use `gurudevi://auth/callback`.

Relevant code:

- [AuthScreen.tsx](../../../../packages/ui/src/screens/AuthScreen.tsx:195)
- [app.json](../../app.json:24)
- [auth.adapter.ts](../../../../packages/core/src/adapters/supabase/auth.adapter.ts:97)

The callback contract must have one canonical value. The current evidence indicates the intended value is `gurudevi://auth/callback`.

### P1 - Deep-link host policy is too broad

`normalizeAcceptedDeepLink()` accepts every `https:` URL and also accepts `edlove:`. This is broader than the app's declared public host and declared native scheme.

Relevant code:

- [urlPolicy.ts](../../src/lib/deepLinks/urlPolicy.ts:1)
- [deepLinkPolicy.test.ts](../../src/__tests__/entry/deepLinkPolicy.test.ts:8)

The policy should validate scheme, host, and path by link type. At minimum:

- `gurudevi:` only for approved app hosts/paths;
- `https:` only for the canonical GuruDevi platform host and approved paths;
- `edlove:` only if a real, declared compatibility flow still exists;
- all other schemes rejected.

### P1 - Share URL contracts do not match routes

The library share builder emits `/p/library/resource/:id`, while the actual route is `/library/resource/[resourceId]`. Profile sharing also emits `/p/:id`, while the current route tree exposes profile routes below `/profile/public/:id` and `/profile/full/:id`.

Relevant code:

- [resourceLinks.ts](../../../../packages/library/src/utils/resourceLinks.ts:5)
- [ProfileScreen.web.tsx](../../../../packages/profile/src/screens/ProfileScreen.web.tsx:166)
- [resource/[resourceId].tsx](../../app/(tabs)/library/resource/[resourceId].tsx:1)

Either `/p/...` must become a deliberate public-link rewrite layer, or share builders must emit routes that the deployed web app and native app both understand. The current state is ambiguous and therefore unsafe for product sharing.

### P1 - Post share is not implemented end to end

`PostCard` shares `/app?post={post.id}`. There is no corresponding post parameter consumer in the deep-link manager, and `SHARED_CONTENT` is currently only an enum value. The Android HTTPS intent filter also does not include `/app`.

Relevant code:

- [PostCard.tsx](../../../../packages/community/src/components/PostCard.tsx:69)
- [DeepLinkManager.ts](../../../../packages/core/src/logic/managers/DeepLinkManager.ts:8)
- [app.json](../../app.json:49)

The implementation needs a defined public post URL, a web route or rewrite, a native route mapping, and authorization behavior for private posts.

### P1 - OAuth fragment normalization is incorrect

The parser uses `url.replace('#', '?')`. This fails when the URL already contains a query string because it creates a second `?` instead of merging query and fragment parameters.

Relevant code:

- [DeepLinkManager.ts](../../../../packages/core/src/logic/managers/DeepLinkManager.ts:43)

Use the standard URL object and parse `searchParams` and the fragment independently. Do not mutate the serialized URL with string replacement.

### P1 - Notification routing bypasses the deep-link boundary

Notification payloads are passed directly to `router.push()` from either `data.deepLink` or `data.path`.

Relevant code:

- [PushNotificationProvider.tsx](../../src/providers/PushNotificationProvider.tsx:40)

All notification destinations should pass through the same allowlisted dispatcher used by OS deep-link events. Internal route paths should be represented as typed route intents rather than arbitrary strings.

### P1 - Deep-link failures lack a recovery contract

Foreground events, initial URLs, and deferred URLs invoke asynchronous handlers without a shared error boundary. A failed session exchange or malformed payload can become an unhandled rejection. Deferred-link removal also needs explicit success semantics.

Relevant code:

- [DeepLinkProvider.tsx](../../src/providers/DeepLinkProvider.tsx:52)

The provider should distinguish accepted, handled, rejected, and failed results. Deferred links should be removed only after successful processing or after a deliberate retry policy.

### P1 - Verified HTTPS app links are not fully evidenced

Android declares HTTPS intent filters, but custom `gurudevi:` filters also use `autoVerify`, which does not verify custom schemes. No iOS `associatedDomains` entry is present in the checked-in app configuration. Deployment-side `assetlinks.json` and `apple-app-site-association` files were not found in the repository.

Relevant code:

- [app.json](../../app.json:24)

The deployment contract must be documented and verified separately from the JavaScript route contract.

### P2 - External URI opening is not scheme allowlisted

The shared external-link helper recognizes only HTTP(S) as web URLs and sends every other value directly to the platform linker.

Relevant code:

- [linking.ts](../../../../packages/ui/src/utils/linking.ts:44)
- [linking.ts](../../../../packages/ui/src/utils/linking.ts:167)

This is acceptable only for trusted, typed URI sources. Database and user-provided values need scheme validation before opening.

### P2 - Test coverage is incomplete

The focused deep-link tests pass, but the current suite does not cover:

- telemetry redaction;
- query plus fragment callbacks;
- canonical host rejection;
- unsupported scheme rejection;
- notification routing through the central dispatcher;
- `/p` share-route resolution;
- iOS and Android verified-link configuration.

The existing test accepting `https://app.gurudevi.lk/...` also fails to enforce the current canonical `platform.gurudevi.edlove.org` host.

## Existing strengths

- `react-native-url-polyfill/auto` is loaded at the Expo Router root.
- QR payload construction and parsing are centralized.
- Resource IDs are encoded before being placed in share URLs.
- Web magic links use the browser's current origin.
- Web auth callback handling uses Supabase code exchange.
- External web links mostly use a shared opening/prompt abstraction.

## Audit verification

The focused test run completed with:

```text
2 test files passed
6 tests passed
```

This result validates existing happy paths only. It does not close the findings in this document.

## Remediation update - 2026-09-09

The following findings have been implemented in the current working tree: P0 telemetry redaction, P1 query-plus-fragment parsing, P1 canonical native auth callback alignment, P1 strict HTTPS host/path policy, P1 validated notification routing, P1 deferred-link retention on failure, P2 explicit external URI scheme allowlisting, and route-safe library/profile share builder updates.

The following remain open: end-to-end post sharing, deployment-host association files, and physical Android/iOS verified-link testing. Legacy public `/p/...` links are intentionally dissolved: no active app-link filter or native acceptance rule remains, and old links fail closed. These cannot be truthfully closed by repository tests alone: post sharing needs a product/API route contract, association files are deployment-owned, and verified-link behavior requires installed binaries on real OSes. The implementation therefore rejects unsafe inputs and documents these as release gates rather than presenting simulated coverage as proof.

## Adversarial verification update - 2026-09-09

The regression suite now exercises the boundary as a hostile input surface, not just happy paths:

- Core parser: query-plus-fragment auth, code exchange, error callbacks, QR token non-confusion, encoded invite IDs, invalid percent encoding, and malformed URLs (7/7).
- Mobile policy/dispatcher: trusted scheme and host allowlists, unsupported schemes, canonical path families, path traversal, CRLF injection, oversized URLs/routes, QR recognition, and invite dispatch (9/9 in the policy file; 13/13 across the focused mobile set).
- Telemetry: redacted auth material remains covered by the existing focused suite.
- UI URI boundary: HTTPS, localhost development HTTP, app/mail/phone/WhatsApp schemes, and rejection of HTTP internet URLs, `javascript:`, `data:`, `file:`, unknown schemes, and malformed values (13/13).

TypeScript build checks pass for mobile, core, and UI. Native OS-level verification is still intentionally unclaimed because no Android/iOS device-control surface is available in this workspace.

## Recommended definition of done

The URL/URI boundary is considered repaired when:

1. no auth credential or one-time auth code can enter telemetry;
2. every accepted deep link has an explicit scheme, host, and path contract;
3. native, web, notification, and deferred links use the same dispatcher;
4. every generated share URL resolves to a real web route and an intentional native route;
5. Android and iOS verified-link deployment files are present and tested;
6. malformed, unsupported, expired, and unauthorized links produce user-visible recovery states;
7. regression tests cover both successful and adversarial URL/URI cases.
