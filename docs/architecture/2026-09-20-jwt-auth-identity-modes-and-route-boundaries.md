---
title: "JWT Authentication Lifecycle, Identity Modes & Route Boundaries"
status: "active"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [architecture, security, auth, jwt, identity-modes, route-boundaries]
---

# JWT Authentication Lifecycle, Identity Modes & Route Boundaries

> **Platform Reference Specification for Token Lifecycles, Identity Tiers, and Boundary Routing Invariants across Mobile and Web.**

---

## 1. Authentication & JWT State Lifecycle

Deep links and universal web callbacks interact with three distinct state layers:

1. **Transport Layer (URL Parameters & Fragment Hashes)**:
   - Receives PKCE authorization codes (`?code=...`) or OAuth token fragments (`#access_token=...&refresh_token=...`).
2. **Session Layer (Supabase / SecureStore / MMKV)**:
   - Validates tokens, executes single-use anti-replay cryptographic checks (`DeepLinkStateGuard`), and persists the active JWT and refresh token.
3. **Identity & Route Decision Layer (`bootstrapRoutes.ts` & `identityState.ts`)**:
   - Evaluates JWT claims, identity availability, onboarding completion, and user capacity to route cleanly into protected sanctuary surfaces or safe public fallbacks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DEEP LINK INCOMING                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │ Is URL Accepted & Non-Adversarial?│
                     │    (`validateDeepLinkEffect`)     │
                     └─────────────────┬─────────────────┘
                                       │
                                      YES
                                       ▼
                     ┌───────────────────────────────────┐
                     │   Does link carry Auth Tokens?    │
                     └───────┬───────────────────┬───────┘
                            YES                  NO
                             │                   │
                             ▼                   ▼
                ┌────────────────────────┐  ┌────────────────────────┐
                │ Extract Tokens / Code  │  │ Evaluate DeepLinkType  │
                │ & Set Session in Auth  │  │ (e.g. CLASSROOM_INVITE)│
                └────────────┬───────────┘  └────────────┬───────────┘
                             │                           │
                             ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 BOOTSTRAP ROUTE DECISION ENGINE (JWT EVALUATION)             │
│                       `getAuthRouteTarget(params)`                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Identity Modes & Surface Access Matrices

The platform implements four explicit identity states (`IdentityMode` in `@repo/core/logic/auth/identityState.ts`):

| Identity Mode | Token / JWT Characteristics | Accessible Surfaces | Restricted / Gated Surfaces |
| :--- | :--- | :--- | :--- |
| **`unauthenticated`** | No active JWT session or expired token with failed refresh. | Public marketing (`/`, `/about`, `/faq`, `/journal/*`), `/welcome`, `/auth`, `/sign-in`, `/sign-up`, `/recovery`. | All protected sanctuary screens (`/self`, `/workspace`, `/community`, `/library`, `/profile`, etc.). |
| **`anonymous` (Explorer / Guest)** | Valid anonymous Supabase JWT (`is_anonymous: true`); local-only storage. | Public marketing, `/onboarding`, sandbox exploration of `/self` & `/library`. | Durable institutional bonds, cross-device classrooms, or publishing community posts. |
| **`authenticated` (Active Citizen)** | Valid signed JWT with verified UID & email/phone; active citizenship profile. | Full Sanctuary access: `/self`, `/workspace`, `/community`, `/library`, `/profile`, `/a-i-assistant`, `/thuthimal-claim`. | Blocked only if `onboardingCompleted: false` (redirects to `/onboarding`). |
| **`inactive-account` (Deactivated)** | Valid JWT but server lifecycle returns `identityAvailability: 'inactive'`. | Gated strictly to `/account-recovery`. | Locked out of all app features and onboarding until account is reinstated. |

---

## 3. JWT Boundary Invariants & Deep Link Handling

### 3.1 Token State Invariants

- **Valid JWT**:
  - `authManager.setSession(accessToken, refreshToken)` succeeds and triggers `onAuthStateChange('SIGNED_IN')`.
  - The route engine resolves `decision: 'app'` (or `'onboarding'` if profile setup is pending).
  - Any deferred deep links stored in `coreRuntime.storage` (`deferred_deep_link`) are dequeued and dispatched.
- **Expired / Invalid JWT / Malformed Code**:
  - `authManager.exchangeCodeForSession(code)` rejects with an explicit error.
  - `DeepLinkManager` returns `{ isHandled: false, message: 'Failed to exchange magic-link code' }`.
  - Session remains `unauthenticated`, holding the user safely at `/auth` or `/sign-in` with an informative recovery prompt.

### 3.2 Deep Link Resolution Matrix

| Deep Link Type | Received in `unauthenticated` | Received in `anonymous` (Explorer) | Received in `authenticated` |
| :--- | :--- | :--- | :--- |
| **Auth Callback (`gurudevi://auth/callback?code=...`)** | Exchanges code -> Promotes session to `authenticated` -> Redirects to `/self` or `/onboarding`. | Upgrades anonymous session to full `authenticated` account while preserving local artifacts. | Validates state token -> Refreshes session credentials -> Continues current screen. |
| **Classroom Invite (`gurudevi://invite/classroom/:id`)** | Stored in `deferred_deep_link`; prompts login or onboarding first. | Stored in `deferred_deep_link` or prompts guest conversion before joining classroom. | Dispatches immediately; navigates directly to `/community?inviteCode=:id`. |
| **QR Scan Action (`gurudevi://qr?...`)** | Dispatches via `dispatchQRDeepLink` in signed-out pending mode; stores action until registration. | Dispatches in sandbox mode or prompts account connection. | Directly routes to `/qr` with parsed `QRPayload` for immediate execution. |
