---
title: "Real browser auth acceptance"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, identity, browser, verification]
---

# Current evidence and next implementation boundary

Local Sanctuary runs on port 3001 and Next.js development on port 3000 using
runtime Doppler gurudevi-mobile:dev injection. NEXT_PUBLIC_API_URL is explicitly
http://localhost:3001 under NODE_ENV development. No paid Render service is
required. Both services reached their ready/listening state. Logs:
reports/auth-local-api-runtime.log and reports/auth-local-web-runtime.log.

Browser observation only: the actual /sign-in page renders Welcome back, email
entry, Google/Apple controls and a password disclosure. No credentials were
entered and no account was created. This is not authenticated acceptance.

The existing tests/e2e/auth-flows.spec.ts expects a different heading and treats
a signed-out private prompt as successful password entry without Sanctuary.
Current /self source renders Guest Explorer for signed-out entry. Preserve these
tests while adding a distinct actual-API acceptance target; do not loosen them
and call a guest route authenticated proof.

Source finding: app/(sanctuary)/auth/SignInForm.tsx saves accountId: data.user.id
and authUserId: data.user.id into lib/sanctuary/deviceAccountRegistry.ts after
password login. data.user is a provider user, so this reintroduces a provider
UUID as the purported canonical account. Identity must instead come from the
existing authenticated Sanctuary bootstrap, with the captured provider subject
used only as continuity assertion. Local profile metadata does not establish
canonical account or server permissions.

Maintain mode; bounded next targets are SignInForm, an existing browser auth/
identity seam, the registry contract if necessary, and matching integration/
acceptance tests. Reuse browserAuthRuntime, secureApiFetch, canonical UUIDv8
validation and Sanctuary identity bootstrap. Preserve password, passwordless,
account-picker and onboarding flows; inspect all registry writers before
changing its contract. No new auth framework or parallel database mapping.

Implementation spec: add a browser-only canonical device-account resolver using
the existing OpenAPI identity route, IdentityBootstrapSchema, canonical UUIDv8
and capacity schemas, no-store/redirect-denial transport and a captured session
token/subject assertion checked before and after the response. Password sign-in
must resolve that identity before recording a profile or navigating. Account
picker selection must verify the current canonical account matches the selected
profile; a local PIN must not choose the current server principal. Missing or
mismatched proof returns to credential entry with a visible message. Preserve
all credential methods and local PIN/profile operations. Extend the presentation
capacity type to include validated platform capacities instead of unsafe casts.

Real run expansion: password entry reached a distinct DB-issued UUIDv8 and the
browser registry assertion succeeded, but onboarding failed before RPC dispatch.
Inspecting the actual client identified missing browser token-resolver wiring and
CORS omissions for transport-generated headers. Extend the existing browser
client factory to register its current-session resolver, pass optional captured
session context through shared onboarding commands, and admit only the exact
existing transport headers at CORS. Preserve existing native/unbound call shapes.
Bind both onboarding commands to the captured session and retain one completion
idempotency key per mounted enrollment attempt. Authorization and origin checks
remain enforced. This extends the computed impact set to browser.ts,
OnboardingForm, core onboardingClient, the existing API CORS list and their tests.

Acceptance must prove provider subject differs from UUIDv8 account, actual
Sanctuary response is consumed, browser registry stores canonical identity,
onboarding/private entry resolves through the real API, stale sessions and API
outage do not write an invented identity, and real sign-out denies re-entry.
Report fixture/account cleanup and all substitutions precisely. Credential
values must remain in runtime memory or managed secret injection.

Runtime inspection found no E2E_TEST_EMAIL/E2E_TEST_PASSWORD or named service-role
key in the active Doppler config; only names/presence were printed. The prior
programme used a CLI-connected modern Supabase secret key in process memory.
The workspace has a local supabase CLI shim under node_modules/.bin even though
supabase is absent from the global shell PATH. Verify that CLI's current account
and target before using it; do not infer that credentials are unavailable from
the global PATH or old service-role variable name alone.

Continuation handles at this checkpoint: API exec session 71305, web exec session
74996, browser IAB tab 1 at /sign-in. Poll these handles/current listeners before
starting replacements; an observation timeout is not a stopped server. These
are pointers, not proof of future liveness. No hosted mutation or authenticated
browser acceptance occurred in this preparatory work.
