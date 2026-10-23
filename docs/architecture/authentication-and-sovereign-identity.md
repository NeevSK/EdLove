---
title: "Gurudevi Authentication and Sovereign Identity Authority"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, authentication, identity, authorization, supabase, mobile, web, ai, passkeys]
---

# Gurudevi Authentication and Sovereign Identity Authority

> **Canonical policy:** a credential proves control of a provider subject; it
> does not define a Gurudevi person, role, school, scope, or authorization.

This is the current cross-platform authority for authentication (`authn`),
account identity, provider linking, and identity-bearing non-human actors. It
does not replace the authorization policies that decide what a resolved account
may do. Historical characterization, progress, and provider documents remain
evidence; they must defer to this document where they conflict.

## 1. Decisions

1. `public.users.id` is the durable Gurudevi citizen/account identifier. It is
   never an auth-provider subject, email address, phone number, device ID, or
   AI-agent ID.
2. Supabase Auth is the live human credential issuer for the first production
   convergence. It owns password, OAuth, email OTP/magic link, phone OTP,
   token refresh, and supported MFA/passkey ceremonies.
3. `@repo/core` owns the provider-neutral client contract. `sanctuary-api`
   owns token verification, provider-subject-to-account resolution, lifecycle
   evaluation, and authorization context construction. Web and mobile must not
   reimplement those decisions.
4. Better Auth, Neon, and Databricks are not production human-session issuers
   unless a separately approved adapter, migration, rollback, and runtime
   evidence packet exists. Their presence in code is not an authorization to
   route live human requests to them.
5. Provider linking is explicit, recent-authenticated, server-audited, and
   reversible where policy permits. A matching email, remembered provider, or
   phone number alone must never merge accounts.
6. One entry experience says **Continue**. It does not disclose whether an
   address is registered or force people to choose "login" versus "signup".
   The verified issuer response and account lifecycle choose the next step.
7. AI agents, school devices, and messaging channels have separate identities
   and narrowly delegated authority. They never reuse a human's bearer token
   or silently become a human account.

## 2. Identity model

```text
credential issuer / external channel
        │ verifies a credential
        ▼
provider subject (opaque, provider-scoped)
        │ explicit server-owned binding
        ▼
Gurudevi account: public.users.id
        │ lifecycle + verified relationships
        ▼
principal and selected scope
        │ Cedar/oRPC/domain authorization
        ▼
allowed action on a specific resource
```

| Term | Meaning | Must not be confused with |
|---|---|---|
| Credential | Password, passkey, OTP, OAuth identity, or recovery factor that proves control. | A citizen account or role. |
| Provider subject | Opaque issuer-specific identifier such as a Supabase `sub`. | `public.users.id`. |
| Account/citizen | The durable Gurudevi person represented by `public.users.id`. | School membership or current selected capacity. |
| Provider link | A server-owned row mapping `(provider, provider_subject)` to exactly one account. | An unverified email/phone match. |
| Session | Time-bounded evidence issued by the provider. | Lifecycle state or authorization grant. |
| Scope | A server-verified school, class, or community relationship selected for a request. | A client-provided identifier. |
| Delegation | Short-lived permission from an account/service to a non-human principal for named actions. | A transferable human login. |

`auth_identities` is the binding ledger. It is server-owned: clients may read
only the current binding where necessary and may request linking, but cannot
write or heal bindings directly.

## 3. Canonical account and session state

The lifecycle is `visitor`, `guest`, `identity_created`, `onboarding`,
`active_personal`, `active_scoped`, `deletion_requested`, `deactivated`, and
`deleted`. Session validity is a separate condition. A valid session does not
imply onboarding completion, a selected scope, or permission.

```text
visitor ──verified credential──> identity_created ──required profile──> onboarding
guest   ──explicit conversion──> identity_created ──completion───────> active_personal
active_personal ──verified relationship──> active_scoped
active_* ──deletion request──> deletion_requested ──approved erasure──> deleted
active_* ──administrative safety action──> deactivated
```

Forbidden shortcuts:

- a provider signup, display-name trigger, or matching email must not mark
  onboarding complete;
- a client-selected role, school, class, or account ID must not grant scope;
- anonymous/mobile guest cleanup must not delete a server account;
- a passed WebAuthn ceremony must not bypass lifecycle or authorization;
- an AI/channel/device credential must not create a citizen without an explicit
  linking or onboarding transition.

## 4. Human entry and credential policy

### One entry, different verified outcomes

The entry page offers **Continue with email**, **Continue with Google**,
**Use a passkey**, and, when approved for the region, **Continue with phone**.
It returns neutral language such as “If this address can continue, we sent the
next step.” It does not say whether an account exists.

| Credential path | New verified person | Returning person | Linking rule |
|---|---|---|---|
| Email magic link / email OTP | Create issuer identity, then `identity_created`. | Resume the bound account and route by lifecycle. | Email is a recovery/contact factor; it is not permission to merge a second account. |
| Password | Only where password policy and verified-email recovery are operated. | Sign in without revealing whether the address exists. | Add/remove password only after recent auth and audit. |
| Google/OAuth | Create provider subject and account only after issuer verification. | Resume only an existing provider binding. | Link from authenticated settings after recent auth; do not auto-merge by guessed identity. |
| Passkey | Not a signup shortcut. Register only for an existing confirmed, non-anonymous account. | Discoverable passkey sign-in resolves the issuer user, then the Gurudevi binding. | Add/revoke only after recent auth and with a recovery factor retained. |
| Phone OTP | Only if regional delivery, abuse controls, and number-recycling policy are operated. | Resume the bound account. | Never link merely because a number was observed by a channel. |

The device may remember a last successful method to make the next entry less
frictional. That preference is local, expires, is user-clearable, and never
changes account resolution or reveals account existence.

### Passkeys and MFA

Passkeys are a planned enhancement, not a release claim. Supabase marks its
passkey API experimental, requires a stable WebAuthn relying-party ID/origin
configuration, and says changing the RP ID invalidates enrolled passkeys.
Before enrolment, production must prove web origins, Android signing-origin
configuration, native ceremony support, recovery, revocation, and a real-device
journey. TOTP/other MFA is required as a step-up policy for sensitive actions
(provider linking/unlinking, email or password change, account recovery,
deletion, institutional administration, and high-impact exports), not as an
undifferentiated prompt after every login.

## 5. Surface contracts

| Surface | Session transport | Required shared behavior | Prohibited bypass |
|---|---|---|---|
| Web / Next.js | Supabase SSR cookie-backed PKCE session. Proxy refreshes verified claims and writes refreshed cookies. | Subscribe to auth changes in the browser; resolve account and lifecycle server-side before protected data. | Trusting browser `getSession()` user data as authorization; direct provider fallback that bypasses the canonical policy/telemetry path. |
| Native mobile | Secure platform storage plus controlled deep-link/PKCE or verified native ID-token exchange. | Use `IAuthPort`/`AuthManager`, consume a callback once, reconcile session on wake, and route through the shared lifecycle gate. | A separate mobile account model or unvalidated URL token handling. |
| Sanctuary API | Bearer token verified with issuer/audience/algorithm/JWKS controls. | Resolve subject through `auth_identities`, construct server-derived account/scope, then apply oRPC/Cedar/domain authorization. | Accepting caller-supplied account, role, school, or classroom as authority. |
| AI chat acting for a person | Current human request context plus server-side authorization and data minimization. | Persist the initiating account, action, model/tool call, and receipt; require step-up where the human action would require it. | Storing the human bearer token in agent state or treating generated text as authorization. |
| Autonomous AI / jobs | Dedicated workload credential and short-lived, audience-bound delegated capability. | Verify issuer, audience, expiry, task, tenant/account scope, and idempotency. | Using a person’s session or a general service-role key as the agent identity. |
| WhatsApp, Telegram, SMS | Webhook/provider proof followed by an external subject lookup. | Unknown contacts enter an ingress holding session and complete an explicit claim/link challenge. | Auto-creating or merging a citizen from email/phone similarity. |
| Shared school device/kiosk | Device registration plus a narrowly scoped operator/session ceremony. | Show account switching, local teardown, expiry, and audit events. | Long-lived shared human sessions or badges as a general authentication factor. |

## 6. Provider-neutral seams

The existing `IAuthPort` is the client-facing starting point. It must evolve
additively into three concerns rather than a provider-shaped grab bag:

1. **Credential issuer adapter** — initiates and completes provider-specific
   ceremonies; returns only verified provider subject and session material.
2. **Identity authority API** — resolves that subject to a Gurudevi account,
   evaluates lifecycle, records link/unlink events, and returns a safe account
   projection. This is the only source of account identity outside the server.
3. **Session/lifecycle coordinator** — subscribes to session changes, cancels
   account-bound queries on change, clears derived state, and routes to the
   lifecycle-appropriate surface.

The API's composite verifier must become configuration-gated: its fallback
between issuers is unsuitable for ordinary human requests. A request is
verified by the issuer selected for its entrypoint and environment; accepted
issuer, audience, algorithm, and key source are explicit policy.

## 7. Linking, recovery, and audit

Every link, unlink, recovery, credential enrollment/revocation, session-wide
sign-out, and lifecycle transition creates an immutable security audit event
with account ID, credential class (not raw credential), provider, request ID,
surface, result, and safe failure reason. Never store passwords, OTP values,
access tokens, refresh tokens, complete phone numbers, or raw WebAuthn
attestation in application logs.

Linking requires all of:

1. an authenticated active or onboarding account;
2. recent authentication appropriate to risk, with MFA where policy requires;
3. proof from the new provider credential;
4. collision detection: a provider subject can bind to one account only;
5. an explicit confirmation describing the account and credential being linked;
6. a recovery-safe postcondition: users cannot remove their final viable
   credential without a separately approved recovery path.

Account recovery and deletion are product workflows, not raw provider calls.
They require rate/abuse controls, truthful receipts, support escalation, and
server-side lifecycle policy.

## 8. Identifier policy: EdLove UUIDv8 for sovereign identity

The internal account identifier must be independent of Supabase, Better Auth,
or any other issuer. EdLove owns the durable identifier profile; Gurudevi is a
participating EdLove domain, not an identifier universe of its own.

New durable cross-product account/identity entities adopt the EdLove UUIDv8
profile in
[`edlove-sovereign-uuidv8-specification.md`](edlove-sovereign-uuidv8-specification.md)
after a dedicated implementation and migration proposal. UUIDv7 remains the
default for high-volume operational or event rows that do not need durable
cross-product segmentation. Existing primary keys are not rewritten merely to
standardize them.

The UUIDv8 profile has a versioned bit layout, CSPRNG-only entropy, retry and
clock rules, database/TypeScript conformance vectors, and a controlled
segmentation registry. It never encodes roles, tenancy, authorization, provider
identity, or secret material. Those values change, leak information, and are
already authoritative in server data.

## 9. Production exit criteria

No migration phase is complete until it proves the relevant layer:

- **G0/G1:** types, route policy, issuer adapter, state transitions, link
  collision, redirect validation, no-enumeration responses, and error mapping.
- **G2:** email/OAuth/passkey/phone flows across interrupted callback, retry,
  expiry, sign-out during mutation, guest conversion, account switch, and
  recovery/deletion scenarios.
- **G3/G4:** real browser and mobile component/bundled journeys, cookie refresh,
  cross-tab update, deep links, secure storage, and accessible recovery UX.
- **G5:** physical Android/iOS proof for OAuth, magic link, passkey where
  enabled, app wake, offline recovery, and account switching.
- **R1:** rate-limit and abuse telemetry, key rotation/revocation drill,
  provider outage behavior, audit receipt retrieval, rollback rehearsal, and
  privacy/security review.

## 10. Additive migration order

1. Publish an issuer and environment matrix; Supabase is the only enabled human
   issuer in production until an approved change.
2. Add the server Identity Authority API and tests around existing bindings.
   Preserve legacy callers through compatibility adapters.
3. Move web and mobile session observation to the shared coordinator; remove
   provider fallbacks only after their replacement is proven.
4. Deliver explicit credential management and recovery, then gate passkey/MFA
   rollout behind the evidence criteria above.
5. Bring AI, channels, and devices onto dedicated identity/delegation contracts.
6. Retire a legacy path only with characterization evidence, a migration
   receipt, rollback plan, and explicit human approval.

## 11. Related records

- `docs/current_progress/2026-10-08-auth-seam-characterization.md` — current
  implementation characterization.
- `docs/current_progress/2026-10-08-account-lifecycle-contract.md` — lifecycle
  state detail.
- `docs/current_progress/2026-10-08-account-foundation-contradiction-register.md`
  — unresolved conflicts to close through this migration.
- `docs/architecture/2026-10-22-sovereign-identity-omnichannel-and-uuidv8-architecture.md`
  — channel-binding and UUIDv8 historical proposal; this document governs its
  UUID policy.
- `docs/architecture/edlove-sovereign-uuidv8-specification.md` — canonical
  EdLove UUIDv8 layout, registry, and adoption controls.
- `docs/architecture/edlove-identity-convergence-program.md` — phase order,
  dependencies, and program-level evidence gates.

## External standards and provider references

- [RFC 9562: UUID Version 7 and Version 8](https://www.rfc-editor.org/rfc/rfc9562.html)
- [Supabase SSR authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework)
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [Supabase passkeys](https://supabase.com/docs/guides/auth/passkeys)
- [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits)
