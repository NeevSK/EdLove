---
title: "Auth Gate and Deep Link Audit"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "opencode"
tags: [auth, deep-linking, expo-router, device-control, audit, automation]
---

# Auth Gate and Deep Link Audit

Readiness audit for the Phase 2 device-control agent: can a headless agent log
in and drive flows deterministically? Scope: auth gates (route-level) and deep
links. Research-only; no code changed.

## Executive verdict

| Area | Verdict | Detail |
|---|---|---|
| Auth gates | ✅ Deterministic | Pure decision functions, enforced in root layout |
| Deterministic login | ✅ Available | Dev fast-track console + sandbox identity |
| Deep links (config) | ✅ Declared | `gurudevi` scheme, Android intent filters in `app.json` |
| Deep links (wiring) | ✅ **Fixed 2026-08-13** | `DeepLinkProvider` mounted in root `_layout.tsx` → magic-link callback + invites live on native |
| iOS universal links | ❌ Missing | No `ios.associatedDomains` (scheme-only on iOS) |
| Web deep links | ✅ Works | Expo Router URL navigation + Playwright coverage |

The device-control agent can log in deterministically today (dev fast-track)
and native deep links now work (magic-link completion + classroom invites,
routed through the newly mounted `DeepLinkProvider`).

## 1. Auth state and login flow

- **Session state**: `useAuthLifecycle` (`packages/core/src/native/useAuthLifecycle.ts`),
  exposed via `useAuth` (`packages/core/src/providers/AuthProvider.tsx`).
  Restore via `authAPI.getAuthSession()` (:105); realtime `users`-table sync
  refreshes JWT on capacity change (:211-217).
- **All sign-in paths** live in `AuthManager` (`packages/core/src/logic/managers/AuthManager.ts`):
  password `signIn` :47-59; OAuth start :61-75; native Google ID token :93-105;
  magic link :121-133; `exchangeCodeForSession` :135-147; passkeys :149-171;
  TOTP MFA :173-228; signUp :230-245; anonymous :252-266; anonymous→email
  conversion :268-322.
- **Magic link redirect**: `auth.adapter.ts` sends `emailRedirectTo =
  'gurudevi://auth/callback'` on native (:88-103). **Nothing consumes this
  callback on native** (see §3) — magic-link sign-in is broken.
- **Identity modes**: `identityState.ts:15-27` — `unauthenticated | anonymous |
  authenticated | sandbox | demo` derived from `user_metadata.experience_mode`
  / `app_metadata.experience_mode` / `is_anonymous`.
- **Post-login routing**: `app/auth.tsx:19-31` — `identifyActiveCitizen()` →
  `/self` if `onboarding_completed` else `/onboarding`.

## 2. Route guards

- **Pure decision functions** (deterministic, testable):
  - `getBootstrapSessionState` (`packages/core/src/logic/auth/bootstrapContract.ts:27-46`):
    `!bootstrapReady → 'booting'`; unauthenticated → `'public'`; incomplete
    onboarding/capacity → `'onboarding-needed'`; else `'ready'`.
  - `getAuthRouteTarget` (`packages/core/src/logic/auth/bootstrapRoutes.ts:27-99`):
    public paths `/welcome`, `/auth`, `/public-form*`; redirect matrix →
    `/welcome`, `/onboarding`, or `/self`.
- **Enforcement** in root `app/_layout.tsx`:
  - `bootstrapReady = !loading && !isProfileLoading && fontsReady` (:228).
  - TOBAC guard (:354-371): expired `session.expires_at` → `/welcome`; then
    `router.replace(routeTarget.redirectTo)`.
  - `!bootstrapReady` → BrandPulse fallback (:423-431).
  - App Lock gate (biometrics/PIN) when `require_biometrics` set (:433-489).
  - Cedar/entitlement loads (:384-417).
- **Tabs** (`app/(tabs)/_layout.tsx`): consumes `usePermissions()` but has **no
  redirect guard of its own** — gate is enforced upstream in root layout.
- **Permissions**: `usePermissions` → `useCedarDecisionStore` (`packages/core/src/store/useCedarDecisionStore.ts`),
  signed snapshots from PowerSync, cleared on logout.

## 3. Deep links

### Configuration (declared)
- Scheme `gurudevi` (`app.json:9`).
- Android intent filters (`app.json:24-65`): `gurudevi://auth/callback`
  (host `auth`, prefix `/callback`), `gurudevi://qr`, and https App Links
  `platform.gurudevi.edlove.org/qr` + `/p`.
- **No iOS `associatedDomains`** — no universal links on iOS; scheme-only.

### Wiring (fixed 2026-08-13)
- The **only** live listener is `DeepLinkProvider`
  (`apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`), which calls
  `deepLink.handleURL` on foreground/cold-start URL events (:108-151) and
  routes classroom invites (:99-101).
- **Was never mounted** (audit finding): root provider tree was
  `QueryClientProvider → GlobalProvider → EnvironmentProvider →
  PowerSyncProvider → AppContent`. Only importer was `SanctuaryProvider`
  (`src/providers/SanctuaryProvider.tsx:18,99`), itself imported nowhere.
- **Fixed**: `DeepLinkProvider` now wraps `AppContent` inside `PowerSyncProvider`
  in `app/_layout.tsx` (inside `GlobalProvider`, so its `useAuth` call is
  satisfied). `gurudevi://auth/callback` magic-link completion and
  classroom-invite deep links are now handled on native.
- **Still works**: OAuth/passkey because `WebBrowser.openAuthSessionAsync`
  returns the URL directly to JS; notification-tap handling via
  `PushNotificationManager` (`PushNotificationManager.ts:76`).
- **No `app/auth-callback` route file** exists — the callback is intercepted by
  `DeepLinkProvider`/`deepLink.handleURL` and does not need a route.

### Web
- Expo Router URL navigation works; web E2E via Playwright covers navigation.

## 4. Test / verification affordances

- **Maestro** (`apps/gurudevi-mobile/maestro/`): `config.yaml` (appId
  `org.edlove.gurudevi`); flows for auth, onboarding, profile, workspace
  navigation.
- **Playwright web** (`tests/e2e/web-shell.spec.ts`, `navigation.spec.ts`).
- **Dev fast-track** (`packages/ui/src/screens/devOnboardingFastTrack.ts`):
  `dev::menu`, `dev::sandbox`, or `dev::name:...,role:...,pricing:...` typed
  into the onboarding name field (when `__DEV__` or
  `EXPO_PUBLIC_ENABLE_DEV_SANDBOX==='true'`) fast-creates a real
  bond+profile+completion through the normal API path.
- **Demo/sandbox mode**: `isDemo()` (`packages/core/src/api/demo.ts`), modes
  `live|demo|sandbox` (`packages/core/src/logic/experience/mode.ts`).
- **Device accounts**: `packages/core/src/accounts/deviceAccounts.ts` —
  multi-account registry + `switchTo` replaying stored tokens.
- **Architecture tests** in Jest cover auth-anonymous-entry, route-flow-parity,
  route-flow-decision.

## 5. Determinism risks for automation

| Risk | Location | Impact |
|---|---|---|
| 3s Lottie fallback | `app/index.tsx:10-17` | Boot timing jitter |
| 8s font timeout | `_layout.tsx:329-334` | Boot timing jitter |
| Biometric prompt | `_layout.tsx:301-304` | Blocks physical devices when `require_biometrics` set |
| OS account pickers | native Google One-Tap / Credential Manager | Non-deterministic UI |
| PDPA consent modal | `_layout.tsx:515` (`isOpen={!hasDecidedConsent}`) | Blocks until consent decided |
| Bootstrap race | `bootstrapReady` + `snapshotLoaded` + `onboardingCompleted` | Redirect timing |
| Env dependence | `EXPO_PUBLIC_ENABLE_DEV_SANDBOX`, Supabase creds, `experience_mode` | Varies by env |

## 6. Recommendation for device-control agent

1. **Use the dev fast-track for login** (`dev::sandbox` or `dev::name:...`)
   — deterministic, bypasses OS pickers and MFA. Gate behind
   `EXPO_PUBLIC_ENABLE_DEV_SANDBOX==='true'` for non-`__DEV__` builds.
2. **Native deep links now work** — `DeepLinkProvider` is mounted in the root
   `_layout.tsx` provider tree (2026-08-13), so `gurudevi://auth/callback`
   magic-link completion and classroom invites route through
   `deepLink.handleURL`. The device-control agent can open `gurudevi://...`
   URLs on the dev client.
3. **Add iOS `associatedDomains`** only if universal links are required
   (Phase 2 device-control on simulator can rely on `gurudevi://` scheme).
4. **For web**, use Expo Router URLs + existing Playwright flows.

## Sources

- `apps/gurudevi-mobile/app/_layout.tsx` — root provider tree, TOBAC guard,
  app lock.
- `apps/gurudevi-mobile/app.json` — scheme + intent filters.
- `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx` and
  `SanctuaryProvider.tsx` — unmounted listeners.
- `packages/core/src/logic/auth/{bootstrapContract,bootstrapRoutes,identityState}.ts`.
- `packages/core/src/native/useAuthLifecycle.ts`,
  `packages/core/src/providers/AuthProvider.tsx`,
  `packages/core/src/logic/managers/AuthManager.ts`,
  `packages/core/src/adapters/supabase/auth.adapter.ts`.
- `packages/ui/src/screens/devOnboardingFastTrack.ts`.
- `apps/gurudevi-mobile/maestro/`, `apps/gurudevi-mobile/tests/e2e/`.
- `docs/architecture/2026-06-10-expo-router-deeplink-decision.md` (design intent).
