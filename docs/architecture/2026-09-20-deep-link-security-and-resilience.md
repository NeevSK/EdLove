---
title: "Cross-Platform Deep Link, Route Boundary & Threat Mitigation Architecture"
status: "superseded"
superseded_by: "route-intent-policy.md"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [architecture, security, deeplinks, routes, cross-platform, effect-ts, owasp, testing]
---

# Cross-Platform Deep Link, Route Boundary & Threat Mitigation Architecture

> Superseded by [Route Intent Policy](./route-intent-policy.md). This dated
> architecture remains historical evidence; use the living policy for future
> design and implementation.

> **Source of Truth Reference for Mobile (Expo Router 57) & Web (Next.js 16 App Router)**
> Enforces OWASP 2026 Mobile/Web security defenses, Effect-TS v4-ready validation pipelines, identity mode transitions, and multi-tier (G0–G3) test evidence standards.

---

## 1. Threat Modeling & Defense Matrix (OWASP 2026 Standards)

Deep-linking and Universal Linking represent untrusted external input channels (operating system intents, custom schemes, universal URLs, QR codes).

| Threat ID | Threat Category | Attack Vector & Mechanism | Severity | Defense Architecture & Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **THREAT-01** | **Custom Scheme Hijacking** | Malicious app registers `gurudevi://` to intercept OAuth tokens or invite payloads. | **Critical** | Mandate HTTPS Universal Links (`https://gurudevi.app`) for sensitive flows; require PKCE for all authorization code exchanges so intercepted codes cannot be redeemed without the client-generated secret verifier. |
| **THREAT-02** | **OAuth CSRF & State Injection** | Attacker crafts `gurudevi://auth/callback?code=attacker_code` to force victim into attacker account. | **High** | Cryptographic 32-character hex state tokens (`DeepLinkStateGuard`) generated client-side with 15-minute TTL; single-use consumption invalidates tokens upon verification to prevent replay attacks. |
| **THREAT-03** | **PII & Credential Log Leaks** | Tokens, OTP codes, or emails leaking into logs or analytics telemetry. | **High** | Dedicated telemetry scrubber (`trackDeepLink`) redacts `access_token`, `refresh_token`, `code`, `token`, and user identifiers prior to emitting PostHog/Sentry events. |
| **THREAT-04** | **Path Traversal & Open Redirects** | Link contains `/../`, `%2e%2e`, `%2f%2f`, or `javascript:` to escape boundary checks. | **Medium** | Path normalization via `deepLinkPolicyPipeline`, length limit (`MAX_DEEP_LINK_LENGTH = 8192`), strict origin whitelisting (`ALLOWED_WEB_HOSTS`), and canonical routing manifest validation (`isValidAppRoutePath`). |
| **THREAT-05** | **QR Code Tampering & Drift** | Malicious QR codes or legacy payload schemas causing app crashes or privilege escalation. | **Medium** | Schema validation with version gating (`QRResolver`, `QR_VERSION = 1`), returning safe non-throwing error objects (`{ ok: false, error: ... }`). |
| **THREAT-06** | **Network Latency & Auth Race Conditions** | User clicks magic link offline or during cold start, causing failed token exchange and stranded state. | **Medium** | Effect-TS `Schedule.exponential(Duration.millis(50))` + `Effect.retry` for resilient code exchange with non-blocking user prompts. |

---

## 2. Shared Canonical Route Topology & Manifest

The route topology is maintained in [`@repo/core/routing/routeManifest.ts`](file:///c:/x/packages/core/src/routing/routeManifest.ts) as the single source of truth across mobile and web. **There is no `/app/` URL prefix.**

```typescript
export const APP_ROUTES = {
  // Public Marketing & Info
  WELCOME: { path: '/welcome', label: 'Welcome', access: 'public' },
  AUTH: { path: '/auth', label: 'Authentication', access: 'public' },
  AUTH_CALLBACK: { path: '/auth/callback', label: 'Auth Callback', access: 'public' },
  SIGN_IN: { path: '/sign-in', label: 'Sign In', access: 'public' },
  SIGN_UP: { path: '/sign-up', label: 'Sign Up', access: 'public' },
  RECOVERY: { path: '/recovery', label: 'Account Recovery', access: 'public' },
  RESET_PASSWORD: { path: '/reset-password', label: 'Reset Password', access: 'public' },
  ONBOARDING: { path: '/onboarding', label: 'Onboarding', access: 'public' },
  QR: { path: '/qr', label: 'QR Scanner', access: 'public' },
  ACCOUNT_RECOVERY: { path: '/account-recovery', label: 'Account Recovery', access: 'public' },

  // Protected Sanctuary Destinations
  SELF: { path: '/self', label: 'Self Sanctuary', access: 'authenticated' },
  WORKSPACE: { path: '/workspace', label: 'Classroom Workspace', access: 'authenticated' },
  COMMUNITY: { path: '/community', label: 'Community Resonance', access: 'authenticated' },
  LIBRARY: { path: '/library', label: 'Knowledge Sanctuary', access: 'authenticated' },
  PROFILE: { path: '/profile', label: 'Citizen Profile', access: 'authenticated' },
  NOTIFICATIONS: { path: '/notifications', label: 'Notifications', access: 'authenticated' },
  SETTINGS: { path: '/settings', label: 'Settings', access: 'authenticated' },
  THUTHIMAL_CLAIM: { path: '/thuthimal-claim', label: 'Thuthimal Claim', access: 'authenticated' },
  AI_ASSISTANT: { path: '/a-i-assistant', label: 'AI Assistant', access: 'authenticated' },
} as const satisfies Record<string, RouteDefinition>;
```

---

## 3. Defense-in-Depth Pipeline Architecture

```
[External URL / Universal Link / QR Code]
                  │
                  ▼
   ┌───────────────────────────────┐
   │ 1. Policy & Sanitization Guard│ ──► Rejects traversal (.. / %2e%2e), overlong (>8192),
   │    (`validateDeepLinkEffect`) │     forbidden chars (<script>, SQL '--', %00, CRLF),
   └──────────────┬────────────────┘     untrusted origins.
                  │
                  ▼
   ┌───────────────────────────────┐
   │ 2. Cryptographic State Guard  │ ──► Generates 32-char hex tokens with 15-min TTL.
   │    (`DeepLinkStateGuard`)     │     Single-use verification prevents replay attacks.
   └──────────────┬────────────────┘
                  │
                  ▼
   ┌───────────────────────────────┐
   │ 3. Resilient Dispatch Manager │ ──► Effect-TS exponential backoff retry on transient
   │    (`DeepLinkManager`)        │     network errors during code exchange.
   └──────────────┬────────────────┘
                  │
                  ▼
   ┌───────────────────────────────┐
   │ 4. Telemetry Redaction Gate   │ ──► Strips tokens, hashes, and PII before logging
   │    (`trackDeepLink`)          │     to analytics.
   └──────────────┬────────────────┘
                  │
                  ▼
   ┌───────────────────────────────┐
   │ 5. Route Resolution           │ ──► Navigates strictly to valid internal paths
   │    (`routeManifest`)          │     (/self, /workspace, /community, /library, etc.)
   └───────────────────────────────┘
```

---

## 4. Identity Modes & Route Boundaries

The platform enforces four explicit identity states (`IdentityMode` in `@repo/core/logic/auth/identityState.ts`):

1. **`unauthenticated`**:
   - No active JWT session.
   - Allowed: Public marketing (`/`, `/about`, `/faq`, `/journal/*`), `/welcome`, `/auth`, `/sign-in`, `/sign-up`, `/recovery`.
   - Blocked: All protected sanctuary surfaces (`/self`, `/workspace`, `/community`, etc.).
   - Deep Links: Invites/QR codes are deferred in `coreRuntime.storage` until authentication completes.
2. **`anonymous` (Explorer / Guest)**:
   - Valid Supabase anonymous JWT (`is_anonymous: true`); local-only storage (MMKV / SQLite).
   - Allowed: Public surfaces, `/onboarding`, sandbox exploration of `/self` & `/library`.
   - Blocked: Durable institutional bonds, claiming cross-device classrooms, or publishing community posts.
   - Deep Links: Prompts guest account conversion while preserving local data artifacts.
3. **`authenticated` (Active Citizen)**:
   - Verified JWT with active profile.
   - Allowed: Full sanctuary access (`/self`, `/workspace`, `/community`, `/library`, `/profile`, `/a-i-assistant`, `/thuthimal-claim`).
   - Deep Links: Dispatches immediately to target routes.
4. **`inactive-account` (Deactivated)**:
   - Valid JWT with lifecycle status `inactive`.
   - Gated strictly to `/account-recovery`. All feature access locked until account reactivation.

---

## 5. Effect-TS v4 Compatibility Guidelines

To ensure smooth migration to Effect v4 while maintaining 100% stability on Effect v3.22.2:

1. **Parameterless Generators**:
   - Always use `Effect.gen(function* () { const res = yield* effect; })`.
   - Never use deprecated `Effect.gen($, function* () { ... })` or `Effect.gen(function* (_) { ... })`.
2. **Data.TaggedError**:
   - Model all domain errors with `Data.TaggedError('ErrorTag')<{ readonly prop: Type }>()`.
3. **Composable Retries & Pipelines**:
   - Use `Schedule.exponential(Duration.millis(50))` + `Effect.retry`.
   - Use `Effect.andThen` and `Effect.tap` for sequential effect composition.

---

## 6. Multi-Tier Test Evidence Verification (G0 to G3)

All test suites follow the strict test-claim protocol with verified evidence levels:

- **G0 Contract / Pure Unit Logic** (Vitest 5.0):
  - `packages/core/src/logic/deeplink/__tests__/deepLinkPolicyPipeline.test.ts` (11/11 passed)
  - `packages/core/src/logic/utils/__tests__/QRResolver.test.ts` (12/12 passed)
  - `packages/core/src/logic/managers/__tests__/DeepLinkManager.test.ts` (9/9 passed)
  - Full `@repo/core` logic suite (197/197 passed)
- **G1 Boundary / Mock Engine** (Vitest 5.0):
  - `apps/gurudevi-web` full suite (39/39 passed across 9 test files)
  - `apps/gurudevi-mobile/src/__tests__/architecture/adversarial-auth-linking.test.ts` (7/7 passed)
  - `apps/gurudevi-mobile/src/__tests__/entry/deepLinkPolicy.test.ts` (14/14 passed)
  - `apps/gurudevi-mobile/src/__tests__/entry/deepLinkTelemetry.test.ts` (1/1 passed)
- **G3 Component & Provider Runtime** (Vitest + RNTL):
  - `apps/gurudevi-mobile/src/__tests__/providers/DeepLinkProvider.test.tsx` (5/5 passed)
  - `apps/gurudevi-mobile` full test suite (263/263 passed across 61 test files)
