---
title: "GuruDevi URL and URI Boundary Implementation Plan"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, implementation-plan, url, uri, deep-links, auth, security]
---

# GuruDevi URL and URI Boundary Implementation Plan

## Purpose

This plan turns the findings in [the URL and URI boundary audit](../architecture/2026-09-07-url-uri-deep-link-audit.md) into a staged implementation sequence.

The plan is intentionally narrow. It repairs URL and URI contracts without redesigning the broader navigation tree or changing the public product domain without an explicit decision.

## Constraints and decisions to preserve

- Do not edit generated `android/` or `ios/` files directly.
- Keep native configuration in `app.json` or config plugins.
- Keep auth credentials out of analytics and logs.
- Keep domain parsing and link policy in shared, testable modules.
- Do not introduce a second deep-link dispatcher.
- Preserve existing `gurudevi://qr` QR compatibility while tightening validation.
- Confirm the canonical public host before changing generated share URLs.

## Target contract

| Link class | Canonical form | Owner | Allowed behavior |
| --- | --- | --- | --- |
| Native auth callback | `gurudevi://auth/callback` | Core auth + mobile shell | Parse and consume once; never log secrets |
| Native QR link | `gurudevi://qr?...` | Scanner/core QR resolver | Validate version/action and dispatch pending action |
| Public QR URL | `https://platform.gurudevi.edlove.org/qr?...` | Web route/rewrite + QR resolver | Open web fallback and hand off to app when installed |
| Public resource link | Decision required: `/p/library/resource/:id` or `/library/resource/:id` | Library + web route | Resolve on web and map to native resource route |
| Public profile link | Decision required: `/p/:id` or a route-tree path | Profile + web route | Resolve only public profiles |
| Public post link | Decision required: `/p/post/:id` or equivalent | Community + web route | Enforce public/private visibility rules |
| Local file URI | `file://...` or `content://...` | Scanner/media | Never treat as a web URL |
| External web URL | `https://...` | Shared linking utility | Validate scheme before opening |

## Implementation phases

### Phase 0 - Confirm public URL decisions

Before code changes, confirm with product/architecture owners:

- canonical public app host;
- whether `/p/...` is an intentional public-link namespace;
- public post URL shape;
- public profile URL shape;
- whether `edlove:` is still supported;
- whether HTTP is allowed outside local development.

Exit evidence:

- one short decision record or an approved update to this plan;
- canonical URL examples for resource, profile, post, QR, and auth flows.

### Phase 1 - Close the credential and parser risks

Files likely involved:

- `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`
- `apps/gurudevi-mobile/src/lib/deepLinks/dispatchDeepLink.ts`
- `apps/gurudevi-mobile/src/lib/deepLinks/urlPolicy.ts`
- `packages/core/src/logic/managers/DeepLinkManager.ts`

Work:

1. Replace raw deep-link telemetry with a redacted event schema.
2. Parse query and fragment parameters independently.
3. Define a typed sanitized result that separates auth metadata from navigational params.
4. Reject unknown schemes and untrusted HTTPS hosts.
5. Add maximum URL length and parameter-size limits to reduce abuse risk.
6. Ensure malformed links return a typed failure instead of throwing into the event loop.

Exit criteria:

- no access token, refresh token, auth code, or error description appears in PostHog payloads;
- a callback containing both query and fragment parameters is parsed correctly;
- arbitrary HTTPS hosts are rejected;
- existing QR and classroom-invite happy paths remain green.

### Phase 2 - Unify all entry points on one dispatcher

Files likely involved:

- `apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx`
- `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`
- `packages/core/src/logic/managers/DeepLinkManager.ts`
- `packages/core/src/logic/managers/PushNotificationManager.ts`

Work:

1. Route notification `deepLink` values through the central dispatcher.
2. Represent internal notification destinations as typed route intents.
3. Add explicit result states: `handled`, `pending-auth`, `rejected`, and `failed`.
4. Add retry or retention behavior for deferred links.
5. Add a user-visible recovery state for invalid or expired links.

Exit criteria:

- OS deep links, cold-start links, deferred links, QR links, and notification links share the same validation boundary;
- no notification payload is passed directly to `router.push()` without validation;
- deferred links are removed only after success or an explicit terminal rejection.

### Phase 3 - Repair the auth callback contract

Files likely involved:

- `packages/ui/src/screens/AuthScreen.tsx`
- `packages/core/src/adapters/supabase/auth.adapter.ts`
- `apps/gurudevi-mobile/app.json`
- `apps/gurudevi-mobile/app/auth/callback.web.tsx`

Work:

1. Change the native auth redirect path to the canonical `auth/callback` contract.
2. Centralize redirect URI construction so auth screens do not hand-build variants.
3. Keep web callbacks origin-based and native callbacks scheme-based.
4. Verify Supabase allowlist values for development, staging, and production.
5. Add tests for Google OAuth, magic links, passkeys, and account-linking callbacks.

Exit criteria:

- generated native redirect URI matches the Android intent filter and core parser;
- web callback remains `https://<current-origin>/auth/callback`;
- all callback flows have success, error, cancellation, and retry behavior.

### Phase 4 - Decide and repair public share routes

Files likely involved:

- `packages/library/src/utils/resourceLinks.ts`
- `packages/profile/src/screens/ProfileScreen.web.tsx`
- `packages/community/src/components/PostCard.tsx`
- `apps/gurudevi-mobile/app` route files
- `apps/gurudevi-mobile/public/404.html`
- `apps/gurudevi-mobile/public/index.html`

Work:

1. Select the canonical public URL shape for resource, profile, and post links.
2. Add real Expo Router web routes or a deliberate rewrite layer.
3. Add native mappings from public URLs to internal route paths.
4. Implement post-link resolution and privacy checks.
5. Make link builders consume shared URL constants rather than hard-coded hosts.
6. Add browser direct-load tests for every public route.

Exit criteria:

- a copied link opens the correct public web surface in a fresh browser;
- the same link opens the correct native screen when the app is installed;
- private content does not become accessible through an identifier in a URL;
- old links are either supported by an explicit compatibility rewrite or documented as expired.

### Phase 5 - Complete verified app-link deployment

Files/configuration likely involved:

- `apps/gurudevi-mobile/app.json`
- `apps/gurudevi-mobile/plugins/` if a config plugin is required
- deployment host `.well-known/assetlinks.json`
- deployment host `.well-known/apple-app-site-association`

Work:

1. Add iOS `associatedDomains` for the canonical host.
2. Keep Android HTTPS filters limited to supported public paths.
3. Remove misleading `autoVerify` expectations from custom URI schemes.
4. Publish Android asset links containing the correct package and signing fingerprints.
5. Publish the iOS association file containing the correct team ID, bundle ID, and paths.
6. Verify installed-app behavior on a physical Android device and iOS device.

Exit criteria:

- Android verified links open the app for every supported path;
- iOS universal links open the app for every supported path;
- unsupported paths remain in the browser;
- development and production domains are not accidentally mixed.

### Phase 6 - Harden external URI opening

Files likely involved:

- `packages/ui/src/utils/linking.ts`
- `packages/ui/src/utils/linking.web.ts`
- URL-bearing resource/profile/community components
- URL validators and domain schemas

Work:

1. Add explicit scheme validation before opening any external value.
2. Permit only the schemes required by the feature (`https`, optional development `http`, `mailto`, `tel`, `whatsapp`, and approved app schemes).
3. Reject `javascript:`, `data:`, unknown custom schemes, and malformed values.
4. Preserve the existing trust prompt for external web domains.
5. Add tests for both web and native opening behavior.

Exit criteria:

- untrusted database values cannot trigger arbitrary unsupported schemes;
- valid WhatsApp, mail, phone, and HTTPS actions continue to work;
- the web and native helpers have matching security policy.

## Test plan

Add or extend tests in the owning packages. Required cases:

### Parsing and policy

- valid `gurudevi://auth/callback`;
- valid canonical HTTPS callback;
- rejected untrusted HTTPS host;
- rejected `javascript:`, `data:`, and unknown schemes;
- query plus fragment OAuth parameters;
- duplicate, malformed, oversized, and encoded parameters;
- QR links with valid and invalid versions/actions.

### Security and telemetry

- telemetry contains no credential values;
- raw callback URL is never recorded;
- notification payloads cannot inject arbitrary router paths;
- private resource/profile/post identifiers do not bypass authorization.

### Route resolution

- public resource URL opens the resource route;
- public profile URL opens the profile route;
- public post URL opens the post route;
- old compatibility URLs either resolve or produce an intentional migration page;
- cold-start and foreground behavior match.

### Platform verification

- Android custom-scheme callback;
- Android verified HTTPS link;
- iOS custom-scheme callback;
- iOS universal link;
- browser-only fallback when the native app is absent.

## Validation commands

Run the smallest relevant checks first:

```bash
pnpm --filter gurudevi-mobile test
pnpm --filter @repo/core test
pnpm --filter @repo/ui test
```

Then run touched-package checks:

```bash
pnpm --filter gurudevi-mobile check-types
pnpm --filter gurudevi-mobile lint
pnpm run check:anti-slop
```

For native configuration changes, regenerate safely with `npx expo prebuild --no-install` when needed. Do not use `expo prebuild --clean`, and do not edit generated `android/` or `ios/` files directly.

## Rollout sequence

1. Ship telemetry redaction and parser fixes first.
2. Ship the unified dispatcher and notification hardening.
3. Ship the canonical auth redirect correction.
4. Ship public-route repairs after the URL shape decision is approved.
5. Publish and verify Android/iOS association files.
6. Enable stricter external URI validation.
7. Monitor rejected-link events using redacted metadata only.

## Completion evidence

The implementation owner should attach:

- test results for parsing, telemetry, notifications, and route resolution;
- the final URL contract table;
- screenshots or device-control evidence for Android and iOS link opening;
- deployed association-file checks;
- a note confirming that no secrets appear in telemetry or logs;
- an update to the audit document describing resolved and deferred findings.
