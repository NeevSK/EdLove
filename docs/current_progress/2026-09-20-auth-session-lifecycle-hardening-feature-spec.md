---
title: "Feature Spec — Authentication and Session Lifecycle Hardening"
status: "proposed"
created: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [authentication, session, account-lifecycle, oauth, callback, production-hardening]
---

# Feature Spec — Authentication and Session Lifecycle Hardening

## Outcome

People can start sign-in or recovery on either Gurudevi client and complete it
only once, within a short window, for the intent they started. A callback must
not select an arbitrary destination, silently replace another account, or leave
the person stranded when the network, app, or session changes.

This is a **proposal and inventory**, not a production-readiness claim or
permission to implement all account lifecycle phases at once.

## Blast zone

**RED.** The work crosses identity, bearer credentials, browser cookies,
mobile deep links, local secure storage, account switching, recovery, and
deletion-request boundaries.

## Priority decision

The current delivery priority is the complete authentication and session seam:
sign-in initiation, callback completion, session bootstrap/refresh, sign-out,
recovery, onboarding handoff, and their platform-specific storage/redirect
adapters. Account switching remains part of that seam only where it changes
the active authenticated session. Broader multi-account UX, offline data
retention, and PowerSync expansion follow after this end-to-end seam has its
specified compatibility contract and runtime evidence.

### Breaking callback policy

The legacy implicit OAuth callback that carries access or refresh tokens in a
URL query or fragment is intentionally unsupported. Both platforms accept one
authorization code only; token-bearing callback URLs fail closed and ask the
person to start sign-in again. Provider and Supabase configuration must use
PKCE/code flow before this slice can be promoted beyond development evidence.

## Inventory

| Lifecycle area | Mobile | Web | Current assessment |
| --- | --- | --- | --- |
| Password sign-in | `AuthScreen` through shared `authAPI` | `SignInForm` calls `signInWithPassword` | Implemented; end-to-end expiry, throttling, and recovery proof are unproven. |
| Passwordless / OAuth initiation | Shared Supabase adapter exposes magic-link and Google OAuth methods | `PasswordlessEntry` sends magic links and OAuth callbacks to `/auth/callback` | Web return paths are sanitized, but initiation-to-callback binding is unproven. |
| Callback completion | Expo callback route dispatches `window.location.href` only on web; native handling is through the shared deep-link manager | `CallbackHandler` exchanges the query `code` in the browser | No durable, per-attempt binding or callback-consumption contract is currently wired. |
| Session bootstrap / refresh | `useAuthLifecycle` subscribes before its initial read and rejects stale bootstrap reads | proxy calls `getClaims`; browser bootstraps with `getSession` | Mobile race protection is implemented with focused tests. Web session refresh and cross-tab/account-change recovery are unproven. |
| Local sign-out / account switch | `deviceAccounts` clears scoped local state and manages remembered account sessions | `AccountSignOut` invokes browser Supabase sign-out | Mobile has a defined local-first authority. Web has no corresponding remembered-account lifecycle; parity is intentionally not claimed. |
| Onboarding | Route gate derives entry from the resolved identity | Sanctuary authorized entry reads authoritative onboarding state | The route decision is present; a complete new-account-to-onboarding runtime proof is unproven. |
| Deactivation / deletion | Request/status infrastructure and recovery flow exist | Public deletion page exists | Final purge, retention/custody decisions, privileged-worker execution, and runtime proof remain blocked by the lifecycle roadmap. |

## Known

- `apps/gurudevi-web/app/(sanctuary)/auth/routeSafety.ts` constrains a supplied
  return path before forms use it.
- `apps/gurudevi-web/app/(sanctuary)/auth/CallbackHandler.tsx` requires a
  `code` and calls Supabase `exchangeCodeForSession(code)` before navigating.
- `packages/core/src/logic/auth/deepLinkStateGuard.ts` can create a random
  state, expire it after 15 minutes, and consume it once; the only production
  consumer found is `DeepLinkManager`, not either auth initiation path.
- `packages/core/src/hooks/useAuthLifecycle.ts` registers its auth listener
  before reading the initial session and has freshness protection against a
  late initial read.
- `apps/gurudevi-mobile/docs/current_progress/2026-09-01-account-lifecycle-roadmap.md`
  explicitly separates local sign-out, remote revocation, deactivation,
  deletion request, and final deletion/anonymization.

## Inferred

- Supabase's code exchange may supply PKCE handling when configured by its
  client, but Gurudevi has not proved the actual storage, verifier lifetime,
  callback binding, or failure behavior in the deployed web/mobile runtimes.
- An in-memory callback state cannot cover browser refresh, app termination,
  or an externally opened mobile link. It is not a sufficient authority record
  for the proposed lifecycle contract.

## Unproven

- Redirect allowlists in deployed Supabase/provider configuration; provider
  nonce validation and PKCE verifier storage; callback replay after success;
  expiry and restart recovery; and token/PII redaction from client logs,
  telemetry, browser history, and errors.
- Web cross-tab sign-out, token refresh, account switch, and stale-page denial.
- Real browser, iOS, Android, offline, background/resume, and deployed HTTPS
  behavior for the journeys below.
- The policy/authority basis for reactivation, final deletion, custody records,
  legal retention, backups, and vendors. Those are explicitly outside this
  callback slice.

## First bounded implementation slice

### Target files

- `packages/core/src/logic/auth/` — a platform-neutral callback-attempt
  contract and deterministic state transitions only.
- `apps/gurudevi-web/app/(sanctuary)/auth/PasswordlessEntry.tsx`
- `apps/gurudevi-web/app/(sanctuary)/auth/RecoveryForm.tsx`
- `apps/gurudevi-web/app/(sanctuary)/auth/CallbackHandler.tsx`
- `apps/gurudevi-mobile/app/auth/callback.tsx` and the existing mobile auth
  initiation owner discovered during implementation.
- Focused contract and boundary tests adjacent to the owners above.

### Contract

1. Initiation creates one opaque attempt with purpose (`sign-in`, `sign-up`,
   `recovery`, or `link-identity`), a validated local return intent, issuance
   time, expiry, and single-use status. The return intent is never trusted from
   the callback URL.
2. The platform adapter stores the attempt in a platform-appropriate durable
   protected location. It retains only what is necessary and deletes it on
   expiry, failure, cancellation, and consumption.
3. Completion accepts only a callback with an issued, unexpired, unconsumed
   attempt that matches its purpose and PKCE/nonce requirements. It consumes
   the attempt before navigation or privileged follow-up action.
4. A missing, malformed, expired, mismatched, or replayed callback fails
   closed, clears untrusted URL material, gives a neutral recovery action, and
   does not create, link, or replace an account.
5. Starting a new sign-in, recovery, or identity-link operation while another
   account is active first presents an explicit account-switch confirmation.
   On confirmation, the app must finish or safely persist account-scoped work,
   run the existing platform lifecycle cleanup, and sign out before issuing a
   new attempt. Cancelling preserves the active account.
6. A callback arriving after the account changed is discarded without code
   exchange. The app preserves the active account, explains that the secure
   link is no longer usable in this account context, and offers the explicit
   switch path above. It does not retain a callback code or browser session
   token for later exchange.
7. Successful session establishment still enters the existing authoritative
   profile/onboarding route gate; a raw bearer session does not decide product
   authorization or onboarding.

### Does not

- Does not change provider, Supabase, or legal retention configuration without
  Naveen's explicit approval and deployment access.
- Does not build final account deletion, reactivation, remote-device
  management, or a web multi-account registry.
- Does not move Expo/Next routing, secure storage, cookies, or UI into
  `packages/core`.
- Does not treat G0/G1 checks as deployed, device, or production evidence.

## Threat and recovery matrix

| Case | Required safe result |
| --- | --- |
| Forged/missing/mismatched state or nonce | No exchange or navigation; neutral retry path. |
| Replayed callback | No second exchange/action; existing session is not replaced. |
| Expired attempt or app/browser restart | Old attempt is discarded; user can start again without exposing credentials. |
| Provider denial or malformed/oversized callback | Fail closed; no token/identifier in UI or telemetry. |
| Offline/timeout during exchange | Preserve a valid unconsumed attempt only when safe; otherwise give an explicit restart path. |
| Account changes while callback is pending | Do not exchange the callback code. Preserve the active account; offer an explicit switch flow that saves/reconciles scoped work, runs lifecycle cleanup and sign-out, then starts a fresh sign-in. |
| Session expires after completion | Route gate returns to authenticated entry without rendering protected data for the stale subject. |

## Evidence plan

- **G0:** pure attempt-state tests for allowlisted return intent, issuance,
  expiry, single consumption, replay, purpose mismatch, and hostile inputs.
- **G1:** web and mobile adapter tests for storage loss, malformed callback,
  exchange failure, and account-change boundaries using explicit Supabase and
  platform substitutions.
- **G2:** composed account-switch, sign-out, and callback scenarios using the
  actual lifecycle, queue, and platform adapter code. Only unavailable external
  services are substituted. This remains contract evidence, not runtime proof.
- **G3:** focused React runtime tests of callback UI/recovery and session-gate
  handoff with actual platform adapters. Mocks are not acceptance evidence from
  this level onward.
- **G4:** real browser tests for redirect, refresh/replay, cross-tab sign-out,
  keyboard flow, and redaction.
- **G5:** iOS and Android physical-device tests for cold start, background /
  resume, offline recovery, and universal/custom-link completion.

No production-hardening label is available until the stated runtime and
operational evidence is earned. **Decision (2026-09-20):** an active account
is preserved. Switching is confirmed before a new authentication attempt
begins; confirmation must preserve or reconcile account-scoped work, invoke
the platform lifecycle authority, and sign out before a fresh attempt is
issued. A callback that arrives after an account change is discarded rather
than exchanged into the active browser/app session.

## Rollback

Keep the existing callback path behind a narrowly scoped, temporary rollout
control until G4/G5 verification is complete. Rollback disables the new
attempt issuer/consumer and directs new callbacks to a safe, neutral
"start again" screen; it must not reinstate acceptance of an unbound callback.

## Follow-on slice — Multi-device, browser offline, and multi-account safety

This is a separate RED slice after callback safety. It must not be bundled into
the callback implementation.

Canonical shared sequencing: [Cross-Platform Local-First Implementation Plan](2026-09-20-cross-platform-local-first-implementation-plan.md).
The account-switch adapter depends on that plan's `AccountTransitionPort`; it
must not implement switching through `resetScopedStores` or any global cache/
queue clear.

### Product model

- A person may use the same account concurrently on mobile, web, and multiple
  devices. The server remains the authority for identity, authorization,
  revocation, and conflict resolution.
- A native install may remember multiple authenticated accounts through the
  existing device-account authority, but only one account is active at a time.
- A browser profile may have only one active Gurudevi account at a time. It may
  remember non-secret account labels for an account chooser, but it must not
  retain multiple refresh tokens in JavaScript storage. Concurrent use of
  different accounts requires separate browser profiles; tabs in one profile
  coordinate to the single active account.
- Offline work belongs to the account and scope that created it. It cannot be
  replayed, displayed, or reconciled after a switch until that same account is
  active and server authority accepts it. The shared command-store foundation
  owns that work; auth lifecycle requests preservation/quarantine or an
  explicitly confirmed destructive discard and never clears it globally.

### Architecture decision

PowerSync is an optional synchronization adapter, not the browser app shell,
session authority, or general-purpose persistence mechanism. Next owns its
browser/session adapter; `@repo/core` owns only ports and pure lifecycle
contracts. The mutation-sync foundation owns the principal-bound command-store
port, queue, dead-letter/recovery behavior, and reconciliation; Next must
consume that port rather than add a browser queue. Browser preferences,
recoverable drafts, and UI state use a
namespaced browser persistence adapter (with a Zustand persistence adapter
where state-store persistence is appropriate). Auth credentials stay in the
Next/Supabase cookie session and are never copied into Zustand, localStorage,
or a multi-account browser registry. AsyncStorage remains a React Native
adapter, not the Next browser persistence default.

### Known

- Mobile `deviceAccounts` keeps per-account stored sessions and has account
  cleanup/switch behavior. `SupabasePowerSyncConnector` checks the expected
  active account before credential fetch/upload and reports `account_switched`
  rather than uploading under the changed session.
- The Expo web build contains `PowerSyncProvider.web.tsx`, using
  `@powersync/web`, a per-account OPFS database filename, and a
  `BrowserPowerSyncAccountCoordinator` that tells another tab to deactivate
  when its active account changes.
- The Next.js app has no discovered `PowerSyncProvider`, `@powersync/web`, or
  coordinator wiring. It therefore must not claim PowerSync-backed offline
  capability yet.
- Browser coordination currently has focused mocked tests for same-profile
  BroadcastChannel behavior. It is not a server authority, nor a real-browser
  persistence/synchronization proof.

### Required contract

1. Every local database, draft, mutation/outbox item, capability snapshot, and
   reconciliation record carries immutable `accountId`, `authSubjectId`,
   active scope, operation idempotency key, creation time, and lifecycle
   status.
2. Before an account switch or sign-out, the client classifies each pending
   item: synchronized, safely persisted for its originating account, needs
   user resolution, or blocked. It never silently transfers or discards an
   account-scoped mutation.
3. A device reconnecting after offline work revalidates session, account,
   scope, role/revocation, and server lifecycle state before upload. Server
   authorization and idempotency decide the final result; client cache never
   authorizes a stale mutation.
4. A remote sign-out, deletion/deactivation, or revoked role stops sync on all
   clients at their next validated session/reconnect boundary and presents a
   recoverable, non-data-leaking state.
5. On the web, account/sign-out signals across tabs deactivate local sync and
   clear only the prior account's in-memory query state. A missed browser
   signal is harmless because the next credential fetch/upload repeats the
   account and session checks.

### Browser capability policy

OPFS, WebAssembly, Workers, `BroadcastChannel`, and storage quotas are
capabilities, not assumptions. The Next.js web app must feature-detect them,
provide an online-only mode when unavailable, and never offer an offline-save
success state unless durable account-scoped persistence is confirmed. Private
browsing, storage eviction, disabled cookies/storage, background-tab
suspension, Safari/iOS behavior, Firefox behavior, and managed-browser policy
are all unproven until executed in the stated browser matrix.

### Low-end and mobile-browser efficiency contract

The Next application is a first-class mobile-web client. It must work on a
low-memory phone and an intermittent connection before optional offline sync,
large local databases, or background work are enabled.

| Layer | Required policy |
| --- | --- |
| Initial entry | Server-render the authenticated shell/essential content; defer PowerSync, inspectors, non-critical analytics, and large feature code until after interaction or an explicit need. |
| Capability tiers | Tier 0: online-only with no durable browser storage. Tier 1: small namespaced preferences/drafts. Tier 2: durable account-scoped offline data. Tier 3: PowerSync only after support, storage, authenticated account, and feature flag checks. A lower tier is a supported product state, not an error. |
| Storage | Set per-feature record-count and byte budgets, version every namespace, compact/expire drafts, expose clear-local-data, and handle quota/eviction as recoverable loss. Never hydrate an unbounded cache at startup. |
| Network | Batch and deduplicate reads, cancel obsolete requests, use bounded exponential retry with jitter, respect browser online/offline signals as hints only, and avoid retry loops in background tabs or under data-saver/poor-network conditions. |
| Sync | Start only for an active authenticated account, pause when hidden or constrained where the runtime permits, bound initial sync work, upload in idempotent batches, and make status visible without blocking navigation. |
| CPU and memory | Prefer pagination/windowing and incremental rendering; avoid eager in-memory copies of offline datasets; use workers only for bounded, cancellable work; release listeners, database handles, and query caches on account change. |
| Media | Serve responsive, compressed assets; lazy-load below-the-fold images/media; avoid autoplay and large preloads on cellular/low-memory paths. |
| Accessibility and resilience | Every deferred/offline/sync state has text status, retry, and keyboard/touch access. Reduced-motion, small viewport, background/resume, and screen-reader flow are required compatibility cases. |

#### Measurements before promotion

For one representative low-end Android browser and one Safari iOS browser,
record cold and warm entry time, interaction latency for the first protected
action, JavaScript transfer/parse cost, memory growth after a browsing session,
storage used/evicted, sync upload/download counts, and behavior on fast, slow,
and offline networks. Establish budgets from those measurements rather than
inventing universal thresholds. A regression fails the slice only after the
baseline and user-facing harm threshold are approved and recorded.

### Evidence matrix

| Evidence | Required cases |
| --- | --- |
| G0 | Account/scope-tagged outbox state machine; switch, revoke, replay, duplicate, conflict, and deletion-state transitions. |
| G1 | Storage quota/failure, BroadcastChannel unavailable, delayed cross-tab signal, stale token, revoked role, and account mismatch at upload. Explicit boundary substitutions only. |
| G2 | Real core composition for switch A → B, late callback discard, sign-out, quarantine, explicit discard, and no legacy-command rebinding. External service substitutions only. |
| G3 | Next and Expo web provider handoff with actual browser storage adapters, plus UI states for syncing, saved locally, blocked, and retry. No mock result is accepted as this evidence. |
| G4 | Chrome/Edge, Firefox, Safari desktop, and Safari iOS: two tabs, two accounts, offline/reconnect, refresh, quota/private-mode fallback, and account switch. |
| G5 | Android and iOS: two remembered accounts, cold restart, offline queue, remote revocation, conflict, and recovery. |

The exact PowerSync browser support matrix and supported fallback behavior must
be verified against the lock-resolved SDK and official documentation during the
slice; no compatibility claim is inferred from the presence of OPFS code.
