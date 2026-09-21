# Single-Account Authentication and Session Release Slice

**Status:** active — highest-priority vertical slice

## Outcome

Ship one complete, observable account journey on both platforms:

1. create an account or sign in;
2. complete code-only OAuth/passwordless callback where used;
3. establish and refresh one active session;
4. enter onboarding or the authenticated shell from authoritative identity;
5. recover access through the existing recovery flow;
6. sign out fully; and
7. request, view, and cancel account deletion where the server policy permits.

"Delete account" means a server-authoritative deletion **request**, status, or
cancel action. It does not claim immediate hard deletion or anonymization.

## Deliberate scope boundary

| In this release | Deferred, retained as scaffolding only |
| --- | --- |
| One active account/session per app install or browser profile | Remembered-account chooser and account switching UX |
| Password, passwordless, and code-only OAuth completion | Offline command reconciliation and account-local PowerSync expansion |
| Sign-out, session expiry/recovery, onboarding handoff | Multi-device conflict/revocation UX beyond current session invalidation |
| Deletion request/status/cancel | Final deletion worker, retention adjudication, reactivation, data export |

Existing multi-account and `AccountTransitionPort` code is not removed. No new
consumer is added in this release.

## Platform contract

| Capability | Next web | Expo mobile |
| --- | --- | --- |
| Active identity | One server-cookie session per browser profile | One active Supabase/native session per install |
| Sign in/sign up | Existing forms and Supabase browser client | Existing `AuthScreen` and native/browser providers |
| OAuth/passwordless completion | `/auth/complete` route handler exchanges one code and writes response cookies | `DeepLinkManager` exchanges one code; URL token callbacks fail closed |
| Session refresh | Proxy/server `getClaims` plus browser bootstrap | Existing listener-before-bootstrap lifecycle hook |
| Sign-out | `POST /auth/signout`, server cookie mutation, no-store response | Existing local sign-out and scoped local cleanup |
| Deletion request | Authenticated API/RPC adapter and public support path | Existing `useAccountDeletion` request/status/cancel adapter |

## Existing tools and dependencies

No package installation is authorized for this slice.

| Need | Existing dependency or utility | Use |
| --- | --- | --- |
| Auth provider/session | `@supabase/supabase-js` | Mobile/client auth and code exchange |
| Server cookie bridge | `@supabase/ssr` | Next route handlers and server client |
| Native redirect browser | `expo-auth-session`, `expo-web-browser` | Construct and complete native OAuth redirect |
| Native secrets | `expo-secure-store`, `react-native-mmkv` | Existing session/account persistence only; never callback URL tokens |
| State/lifecycle | `zustand`, `effect` | Existing scoped state and serial lifecycle work; no new global auth store |
| Callback safety | `classifyAuthCallback`, `DeepLinkManager` | Code-only validation and exchange |
| Identity routing | `useAuthLifecycle`, `authorizedEntry` | Resolve onboarding/authenticated shell from session plus authority |

## Implementation order

1. Verify provider redirect allowlists and PKCE/code flow in Development.
2. Finish callback-attempt persistence/one-time consumption for the single
   active session. Do not add account-switch behavior.
3. Exercise sign-up/sign-in/passwordless/recovery → callback → onboarding on
   web and mobile.
4. Wire/verify deletion request, status, and cancel affordances for the active
   account only.
5. Add session-expiry and sign-out cleanup/retry behavior.
6. Obtain real-runtime evidence before calling the slice complete.

## 2026-09-21 implementation record

### FEATURE SPEC: Native confirmation and passkey code completion

**Blast Zone:** RED (auth port/manager) and AMBER (shared Auth screen)  
**Target files:** `auth.port.ts`, `AuthManager.ts`, Supabase and memory auth
adapters, `auth.ts`, and `AuthScreen.tsx`  
**Reuses:** `getRedirectUrl`, `DeepLinkManager`, `classifyAuthCallback`, and
the existing sign-up API.  
**Does NOT:** add a second session store, restore URL-token parsing, alter
account-switch behavior, or change provider policy.  
**Complexity budget:** additive optional redirect field; no new lifecycle
branch beyond existing code-only callback handling.

The web callback and sign-out boundary now complete on the server with
private, no-store responses. Password, passwordless, recovery, and OAuth
entry point at `/auth/complete`; only a code callback may establish the
server cookie session. URL access/refresh-token callbacks are intentionally
unsupported.

The web Profile page now consumes the same authenticated deletion RPCs as
mobile through `GET`, `POST`, and `DELETE /auth/deletion`: status, request,
and cancel. Mobile already used the same shared lifecycle hook; its Profile
surface now exposes cancel for `pending_verification` and `scheduled` states.
The operation remains a deletion request rather than an immediate purge.

No dependency was added. The implementation uses the existing
`@supabase/ssr`, `@supabase/supabase-js`, Expo auth/secure-storage packages,
React state/hooks, and the existing core lifecycle contracts. `effect`,
Zustand, MMKV, and PowerSync remain existing supporting infrastructure; this
release adds no new use of them.

The native email/password sign-up now passes `gurudevi://auth/callback` to
the existing Supabase sign-up option, and passkey completion now uses the
same code-only deep-link exchange as OAuth and magic links. There is no
access-token, refresh-token, or `setSession` fallback remaining in the shared
mobile Auth screen.

Known G1 evidence: `pnpm --filter gurudevi-web run test:g1:auth-callback`
ran on 2026-09-21 with Vitest 5.0.0, 3 files and 8 test cases. Under mocked
Supabase SSR it proves code-only exchange/retry, local server sign-out, and
authenticated deletion status/request/cancel route dispatch with no-store
responses. It does not prove live Supabase policy/RPC deployment, browser
cookie behavior, a real Next runtime, mobile runtime, accessibility, or
device behavior. `pnpm --filter @repo/profile run check-types` and
`pnpm --filter gurudevi-web run check-types` completed successfully; they are
static checks, not functional runtime evidence.

The live Supabase project remains an external runtime check: email confirmation
must use PKCE/code flow, and the three deletion RPC migrations must be deployed.
The local `supabase/config.toml` does not prove those hosted settings.

### 2026-09-21 linked-project CLI evidence

Read-only Supabase CLI checks identified the linked active **Gurudevi** project
and reported `db push --linked --dry-run` as up to date. The remote migration
ledger includes `20260901100000`, `20260901120000`, and `20260907180000`.
The deletion RPCs exist; each is `SECURITY DEFINER`, has an empty search path,
and is granted only to `authenticated` and `postgres`.

On 2026-09-21, the linked project `qzoawolfkuwiuyaoiybz` received the minimal
production configuration update required by the new web flow:

- `https://gurudevi.app/auth/complete`
- `https://sanctuary.gurudevi.app/auth/complete`

The change was made from an isolated configuration pulled from that exact
project, then verified with `supabase config diff`: there are zero declared
updates remaining. The pre-existing, undeclared Twilio enablement was observed
as remote-only and was not changed. This avoids the unsafe broad push that the
checkout configuration would have created. Hosted WebAuthn enrollment and
verification are both currently disabled, so passkey remains fail-safe
unavailable until it is separately enabled and validated.

## Evidence required

- G1 boundary: Supabase error, expired/replayed code, storage failure, sign-out
  failure, deletion RPC outcomes.
- G2 scenario: one account travels through sign-in or sign-up → callback →
  onboarding → sign-out, and through deletion request/status/cancel.
- G3: actual Next runtime and Expo runtime, with real configured storage
  adapters. No mock evidence is accepted.
- G4: real browser callback/sign-out/refresh and private-storage fallback.
- G5: Android and iOS cold start, callback, recovery, sign-out, and deletion
  request/status/cancel.
