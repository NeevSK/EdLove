---
title: "Phone Entry and Canonical Account Integration Proposal"
status: "active"
created: 2026-10-15
updated: 2026-10-15
author: "Naveen"
scribe: "Codex"
tags: [foundation, auth, phone, identity, integration, proposal]
---

# Phone Entry and Canonical Account Integration Proposal

Shared phone boundary and opt-in browser phone-entry source are implemented;
live-provider end-to-end phone entry remains unverified. It extends the existing
[identity contract](2026-10-14-multi-channel-identity-and-delegation-contract.md)
and [foundation programme](../current_progress/2026-10-15-integrated-foundation-programme.md).
The shared auth/phone boundary has G1 verification. Browser component behavior
has G3 mounted evidence with provider/router mocked; live OTP and integrated
acceptance remain open. Approved for implementation on 2026-10-15; existing
email/social/passkey entry remains intact.

### Browser phone-entry implementation seam

`browser_phone_entry` (Luna) owns additive `PhoneOtpEntry.tsx` and its component
test, embedded additively in `PasswordlessEntry`. Visibility is controlled by
`NEXT_PUBLIC_PHONE_AUTH_ENABLED`, explicitly enabled with `true` and defaulting
off; no environment/provider configuration changes are included. The browser
retains its cookie client and reuses the shared phone helper. Account creation
defaults to false and requires an explicit choice. Requesting an SMS is not
sign-in: navigation follows only successful verification with a provider
session and the existing safe server-gated entry flow. G3 / React Testing
Library + Vitest: 11/11 mounted component assertions, with provider/router mocked
and the real shared phone helper and route-safety logic. A separate authorized-
entry boundary suite contributes G1 10/10. This does not establish live
SMS/provider behavior, production CAPTCHA, spend or rate-limit configuration.
The flag remains default-off; no provider/environment configuration was enabled.

## Grounded findings

Audited pre-implementation on 2026-10-15; these findings describe the substrate
before the approved implementation work.

1. `packages/core/src/logic/ports/auth.port.ts`, `AuthManager.ts` and
   `packages/core/src/api/auth.ts` have no phone OTP methods. AuthUser also has no
   declared phone field. Accepting a signed phone-only JWT is not a sign-in flow.
2. SupabaseAuthAdapter owns native/shared provider calls. MemoryAuthAdapter is
   its other implementation. No fake OTP verification may be added to memory
   storage as if it proved ownership of a phone.
3. Current Next.js PasswordlessEntry and its tests use the app's browserAuthRuntime
   and cookie-aware Supabase SSR client for email/social sign-in. They do not
   currently expose phone entry. Earlier phone-shaped test mocks are not evidence
   of current functionality.
4. Next.js authorizedEntry currently rejects an API identity whose id differs
   from the verified provider subject. Its test explicitly asserts this behavior.
   That conflicts with the approved persisted mapping: canonical users.id may
   differ from the Supabase subject. The same authSubjectId field is also passed
   to account-scoped Self, Workspace, Profile, Community and Library consumers.
5. BrowserAuthRuntime.bootstrapIdentity reads a provider session; its name does
   not mean canonical account or membership bootstrap has occurred. The protected
   server entry separately calls Sanctuary identity resolution.

These are source observations on 2026-10-15, not production incident claims.

## First gate: distinguish proof subject from account

- [ ] Keep the verified provider subject and persisted application account ID as
  distinct fields in shared authorized-entry facts/results.
- [ ] Keep claims/session binding: the bearer session user must match the verified
  claims subject before forwarding credentials to the configured Sanctuary API.
- [ ] Obtain canonical account ID only from the authenticated API response. Never
  accept it from a URL, header, local cache, user metadata or phone lookup.
- [ ] Replace raw-subject equality with the correct authenticated-response
  provenance checks; do not just remove a guard and trust arbitrary JSON.
- [ ] Use canonical account ID for account-owned API operations, practice-document
  namespaces, cache ownership and component account keys. Keep provider subject
  only where a provider-session comparison actually requires it.
- [ ] Test a genuinely decoupled account, mismatched claims/session, malformed
  account response, revoked/missing mapping, unavailable API and account switch.

Explore owns app web files. This foundation work owns shared entry/account
contracts. Any change to the previous equality-denial behavior must preserve
session-binding denial rather than weaken the existing assertion silently.

## FEATURE SPEC: Shared phone OTP boundary

### Blast Zone: RED

### Target files

- `packages/core/src/logic/ports/auth.port.ts`
- `packages/core/src/logic/managers/AuthManager.ts`
- `packages/core/src/adapters/supabase/auth.adapter.ts`
- `packages/core/src/adapters/memory/MemoryAuthAdapter.ts`
- `packages/core/src/api/auth.ts`
- Proposed `packages/core/src/api/phoneAuth.ts`: platform-neutral validation,
  provider result interpretation and safe errors, reused by native and browser
  adapters rather than duplicated in two clients.
- Existing adapter/manager tests and focused new phone-boundary tests.

### Reuses

Installed Supabase Auth 2.117.2 signInWithOtp/verifyOtp, AuthUser/AuthSession,
existing platform session storage, canonical API identity bootstrap, server scope
selection and existing safe authorized-entry mapping. Next.js retains its SSR
cookie client; it must not import the native auth factory or authStorage.

### Contract and behavior proposed

- Add phone to AuthUser as optional contact data, never authority or an account ID.
- Add signInWithPhoneOtp and verifyPhoneOtp to the port, manager and facade with
  one declared request shape. No positional compatibility aliases are needed:
  the current methods and production callers do not exist.
- Request accepts international +digits phone, explicit account-creation intent,
  and an optional CAPTCHA proof. Default account creation to false; signup UI
  must deliberately request true. Do not infer a country or merge by contact.
- First delivery channel is SMS only. A WhatsApp OTP delivery option is not a
  linked WhatsApp application client and is not silently enabled by this seam.
- Successful request means code requested, not authenticated. Verification must
  return an actual provider session before canonical bootstrap can begin.
- Validate a bounded digit token without assuming a hardcoded deployment OTP
  length/expiry. The Auth service remains authoritative for validity and expiry.
- No queued OTPs, background resends or automatic retry after uncertain delivery.
  Provider rejection and thrown network errors must both settle loading state.
- No phone, OTP, CAPTCHA proof, bearer token, raw provider exception or redirect
  URL in the new audit/error payloads. Do not reuse raw-subject account audit
  attribution as if it were canonical account attribution.
- Memory implementation reports unavailable; it never mints a phone session.
- Verification authenticates only. Canonical account resolution, lifecycle and
  selected-scope checks still decide Sanctuary entry and domain authority.

### Does NOT

No account linking/merging, recovery-by-phone, phone-change ceremony, SMS service
credentials, provider enablement, remote migration, replacement session storage,
new policy engine, webhook authority or agent delegation. No existing auth flow
or test is deleted. No device-attestation step is added for ordinary teachers.

### Complexity budget

Each new function stays below cognitive complexity 15. No new auth framework,
generic factory or one-consumer forwarding abstraction. Client UI work follows
the canonical-account gate and the approved shared boundary, not the reverse.

## Evidence and rollout gates

- [ ] G0: shared port implementations, typed fixtures and web/native import graph
  compile; no native storage enters the Next.js bundle.
- [ ] G1: exact provider arguments, explicit signup/default sign-in behavior,
  CAPTCHA forwarding on request, no deprecated verification CAPTCHA option,
  invalid input, rate-limit/provider denial, thrown network failure, missing
  verification session and memory-unavailable behavior.
- [ ] G2: verified session then canonical bootstrap, decoupled IDs, no selected
  scope, account switch, mapping revocation/outage and failed retry retain input.
- [ ] Browser component tests: pending duplicate-submit prevention, safe failure,
  retry, number edit resets challenge, and no ready state from a sent SMS alone.
- [ ] Real Auth test runtime: test-number OTP verification followed by API/DB
  bootstrap under actual roles. SQL trigger tests alone do not satisfy this gate.
- [ ] G4 web/native bundling and applicable native device evidence remain separate.
- [ ] Before real SMS: verify provider configuration, destination coverage,
  CAPTCHA/accessibility path, server-side send/verify limits, spend ceiling and
  operational delivery failure handling. UI countdowns are not abuse prevention.

Latest SQL ownership fixture is G2 PostgreSQL/pgTAP 37/37, rolled back; the
earlier 30/30 checkpoint is superseded. It proves the named migration mechanics,
not GoTrue, SMS delivery or this proposal.

## Dependency grounding

Inspected installed `@supabase/auth-js@2.117.2/src/lib/types.ts` and
`src/GoTrueClient.ts`: phone requests support shouldCreateUser/captchaToken/channel;
request success returns no user/session. SMS verification uses phone/token/type
and saves/notifies a returned session. Verification captchaToken is deprecated in
the installed declarations and is not proposed. The attempted standalone upstream
v2.117.2 source URL returned 404; no release-tag compatibility claim is made.

Official references checked on 2026-10-15:
[phone sign-in](https://supabase.com/docs/guides/auth/phone-login),
[request OTP](https://supabase.com/docs/reference/javascript/auth-signinwithotp),
[verify OTP](https://supabase.com/docs/reference/javascript/auth-verifyotp), and
[Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).

## Cross-chat ownership

The user authorized coordination with both **Explore a Gurudevi subdomain** and
**Plan Gurudevi messaging integration**. The latter owns channel authority,
verified ingress, linking, proposal/media and delivery state-machine source,
including migration 20261015160000. This foundation owns canonical-account
resolution and migration 20261015150000. Neither local source nor mocked channel
tests imply full-chain migration acceptance. Live provider effects remain outside
this proposal. Contract changes and remaining real-DB gates must be reconciled
before either workstream claims integrated acceptance.
