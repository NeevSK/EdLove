---
title: "Mobile Guest-to-Durable-Account Conversion: Completion Plan"
status: "active"
created: 2026-10-23
updated: 2026-10-25
author: "Naveen"
scribe: "Codex"
tags: [gurudevi-mobile, auth, guest, offline, supabase, identity]
---

# Mobile Guest-to-Durable-Account Conversion: Completion Plan

> **2026-10-25 account-policy correction:** the [canonical UUIDv8 cutover](2026-10-25-canonical-uuidv8-account-cutover.md)
> replaces the historical side-ID writer/worker described in section E and
> dated evidence tables below. The database now assigns the canonical account
> primary key at cloud account creation; durable credential conversion retains
> that key. Hosted rollout remains unverified. Remote transfer is still disabled
> by product policy, and the unfinished callback/device/channel work remains.

The durable product contract is [Gurudevi Identity, App, Device, and Account
Lifecycle](../../apps/gurudevi-mobile/docs/architecture/identity-app-device-lifecycle.md).
This document records the dated delivery state and remaining evidence.
For messaging providers and AI agents, see the platform-wide
[Cross-Channel Identity and Guest Conversion Contract](../architecture/2026-10-23-cross-channel-identity-and-guest-conversion-contract.md).
The current transfer authority is [Guest Data Transfer Policy
Authority](../architecture/2026-10-24-guest-data-transfer-policy.md): it
deliberately authorizes no remote record transfer until one record kind has a
product-and-Sanctuary-approved contract.

## Corrected baseline

This phase is **in active implementation, not complete**. The mobile Welcome
route now owns the guest identity decision: it first attempts the existing
Supabase anonymous sign-in while online, then creates a durable device-local
principal when it is offline or that request fails. The local principal is a
`local-<uuid-v4>` storage identity, never an Auth session, capability grant,
or EdLove account identifier.

Existing components are useful, but do not establish a production conversion:

- local guest identity, lease, data manager, and persistence namespaces exist;
- a pending guest source identifier survives an external auth callback;
- the conversion modal currently offers keep-local, confirmed discard, and
  empty-state actions while transfer is unavailable;
- dormant legacy uploader tests demonstrate payload shapes only; they do not
  authorize or prove a current remote migration.

### Route correction — 2026-10-24

The default native `SanctuaryWelcomeScreen` had exposed its guest button
without receiving the route-owned `onStartGuest` handler. That bypassed the
offline-first decision in the route and could navigate to onboarding without
first creating an anonymous Auth subject or a device-local guest principal.
The route now supplies `onStartGuest={handleStartGuest}` to the default native
surface, matching the legacy `WelcomeScreen` path. The handler attempts
anonymous Auth only while online and otherwise persists the local
`local-<uuid-v4>` principal before routing. Web remains outside this native
correction.

The current implementation additionally has a versioned conversion ledger
which records an anonymous-auth or device-local source and binds only to the
actual durable Auth subject after sign-in. Its stable conversion ID is
reserved as the future server-operation idempotency key; no current upload is
submitted. Source data remains local through every unavailable or ambiguous
transfer outcome.

It does **not** establish an authorized product policy for transfer of any
guest record kind: timetable, mood, journal, or students; nor does it have
end-to-end physical-device evidence.
The generic PowerSync handler does not support timetable, mood, or journal
tables and a local student list does not carry a classroom authorization.
Those records must remain recoverable rather than being silently mapped into
institutional data.

## Invariants

1. A fresh offline guest receives a local-only principal and may not gain a
   fabricated Supabase session, server capability, institutional membership,
   or EdLove identifier.
2. A later credential link for a new account preserves the anonymous Supabase
   subject; signing into an existing account is a distinct, explicit local
   data migration, never an identity merge.
3. The source guest scope is bound to the actual pre-transition subject and a
   durable conversion attempt. An arbitrary persisted string is insufficient.
4. Source data remains until a durable, idempotent server receipt confirms the
   selected transfer. Timeout, 503, process death, and replay must be safe.
5. Existing-account conflicts use an explicit per-data-kind policy. The target
   account remains authoritative for profile, membership, and institutional
   capacity.
6. EdLove assignment stays server-only and occurs only after canonical durable
   account resolution. A guest is never assigned one; a transfer failure does
   not change canonical identity.

## Delivery sequence

### A. Local-only entry contract

Introduce a typed local-guest entry state owned by the existing session route
gate. The Welcome button may enter it only after its local persistence record
is durably created. It must route to local onboarding and show a truthful
offline state. It must not impersonate a Supabase user.

### B. Conversion ledger and source binding

Replace the loose pending source string with a versioned conversion record:
source guest principal, source-auth subject when present, intended target only
after it is server-resolved, stable operation key, state, and no credentials or
callback payload. A mismatch, stale record, or account switch pauses and asks
the person to discard or retry; it cannot upload data.

### C. New-account versus existing-account paths

For a new email/OAuth credential, use Supabase identity linking on the current
anonymous subject. For an existing credential, authenticate the existing
account then show a conscious local-data transfer/discard choice. No provider
subject, email, or device datum selects or merges an account automatically.

### D. Receipt-backed transfer

The server must own target identity and record-level idempotency. The mobile
client uses a stable operation key, keeps source data through ambiguous
outcomes, and clears it only after a durable receipt. This requires an
explicit contract for timetable, journal, mood, and student conflict handling;
it cannot be safely inferred from the existing bulk upload.

### E. Account and EdLove completion

After durable account resolution, Sanctuary may idempotently assign the
EdLove UUID through its existing private server-only seam. This is independent
of guest-data transfer and cannot be called by the mobile client.

### F. Explicit external-channel linking

WhatsApp-first or Telegram-first contact creates only a verified, unlinked
provider identity. It must never create a guest or durable account. After a
person authenticates in Gurudevi, they explicitly initiate a short-lived,
one-time link ceremony and confirm it from the same private channel. Account
status, revocation, expiry, support recovery, and consent/delegation controls
belong to this later phase. See the [Cross-Channel Identity and Guest
Conversion Contract](../architecture/2026-10-23-cross-channel-identity-and-guest-conversion-contract.md).

## Hostile completion audit — 2026-10-23

The prior plan is **not complete**. This is the delivery ledger used to keep
the implemented foundation separate from production claims:

| Delivery | Status | Bounded finding |
| --- | --- | --- |
| A. Local-only entry | Complete for the route contract | Offline entry persists only a device-local UUIDv4 principal; G2 tests show cloud services remain unmounted. Device proof is still required. |
| B. Conversion ledger | Partial | It records and binds source/target identities, but it is client storage and does not prove the planned server-resolved target authority. |
| C. Credential paths | Partial | Anonymous credential linking and explicit existing-account sign-in are separated. Callback cancellation, account-switch, and real-provider end-to-end evidence are outstanding. |
| D. Receipt-backed transfer | Fail closed / incomplete | Transfer is intentionally unavailable until a server-owned, receipt-backed policy exists for each data kind. |
| E. EdLove completion | Locally verified; hosted rollout pending | A private durable-account handoff and Sanctuary worker now run after durable confirmation. Fresh local Supabase replay and focused role/queue assertions are complete; a hosted forward reconciliation and worker-role preflight remain required. |
| F. External channels | Server lifecycle exists; app experience incomplete | Provider verification and authenticated server link/consent/delegation endpoints exist; mobile/web connection, status, revocation, recovery, and production-provider evidence do not. |

The review also found that a failed existing-account sign-in could leave its
local authorization marker available for a later attempt. The marker is now
cleared on failed Google/password paths, expires after one hour for deferred
email callbacks, and is consumed on successful target binding. This is a
client-side defense only; it is not a substitute for the required server
transfer authority.

## Implemented transfer guard

The dormant client transfer seam requires a bound ledger target, derives that
target from the current server-authenticated session rather than its caller
argument, reserves the stable conversion ID, and is designed to retain source
data on every failure. It remains disabled before payload submission and is
not evidence that any guest data category is safely transferable.

Until the server contract exists, the conversion presentation explicitly offers
**Keep on device** or a separately confirmed **Discard** action. It does not
promise migration, and `GuestDataSync` itself fails closed before submitting
any payload. This prevents an alternate caller from bypassing the UI guard.

### F. Evidence

- G1/G2: fresh offline entry, reconnect, cached anonymous resumption, new
  identity link, existing-account choice, stale ledger, interrupted callback,
  timeout-after-commit, 503, duplicate retry, target-account switch, discard,
  and no anonymous cloud write.
- G3: mounted Welcome/route-gate/onboarding/conversion presentation tests.
- G5: Android development-client airplane-mode, process-death, callback, and
  reconnect evidence.

## Decision required before transfer implementation

The existing-account conflict policy is product authority, not an engineering
default. Before enabling remote transfer, the owner must choose whether each
data kind is skipped, appended, deduplicated, or presented for review. Until
then, only local-only entry and safe conversion-ledger work may proceed; the
existing remote bulk transfer must not be broadened.

## Current hostile-review verdict

- **Pass:** offline entry cannot fabricate a Supabase session or EdLove ID;
  provider linking retains the anonymous Auth subject; local-device conversion
  is always classified as an existing-account transfer; direct client input
  cannot choose the transfer target; ambiguous uploads retain local data.
- **Fail closed:** unsupported guest payloads cannot be claimed as migrated.
- **Still required for phase completion:** product owner policy for each
  data kind, a dedicated server conversion/receipt contract enforcing those
  policies, target-profile conflict presentation, and G3/G5 evidence.

## Current evidence and boundary

- **G1 boundary / Vitest:** 38 focused core assertions cover local-principal
  persistence, local onboarding, source/target binding, explicit
  cross-account authorization, and receipt preconditions. They prove those
  contracts under mocked storage/auth boundaries; they do not prove Supabase,
  PowerSync, or a device runtime.
- **G2 route contract / Vitest:** 32 focused mobile assertions cover the
  device-local route admission and confirm that it does not mount cloud sync
  or capability services. They do not prove visual behavior or OS airplane
  mode.
- **G3 modal / React mock-native engine:** the conversion-modal scenario proves
  that unavailable transfer leaves a nonempty guest payload recoverable, while
  discard requires its separate confirmation. Three mounted
  `GuestConversionBoundary` prop-contract scenarios additionally prove that an
  actual `local-<uuid-v4>` ledger source is bound only after a durable subject,
  anonymous sessions do not invoke binding, and an unauthorized target retains
  the pending record. The boundary test mocks the modal, so it does not prove
  rendered choice controls; that remains the separate modal scenario. Neither
  test proves a physical device or server transfer behavior.
- **Static contracts:** `@repo/core` and `@repo/ui` type checks pass. The full
  mobile typecheck remains blocked by 20 pre-existing errors outside this
  conversion seam (classroom/workspace test types, `EntryShell`, Tutii, and
  community contracts); none names the modified guest files.
- **G1 route wiring / Vitest:** 2 focused mobile assertions cover the default
  native welcome surface receiving `onStartGuest` and the route retaining its
  anonymous-then-device-local fallback. They prove source-level route wiring
  and component callback behavior under mocks; they do not prove OS airplane
  mode or real Supabase availability.

The phase remains **active**. Its safe mobile-entry and local-conversion
foundation is implemented; production remote transfer is deliberately not
enabled until the server policy and physical-device evidence above exist.

## Requirement-by-requirement audit — 2026-10-24

This audit is the current completion boundary for this phase. A green focused
test is evidence only for the named contract; it is not a production claim.

| Objective requirement | Current evidence | Verdict |
| --- | --- | --- |
| Default native **Explore as Guest** is offline-first | The default `SanctuaryWelcomeScreen` receives the route-owned `onStartGuest`; its handler tries anonymous Auth only while online, then persists the device-local guest principal before navigation. Focused route-wiring tests pass. | Implemented at G1/source-contract level; G5 airplane-mode proof remains required. |
| New credential keeps the anonymous subject | `AuthScreen` begins a conversion ledger before linking email/OAuth; the core manager uses the anonymous-link API rather than ordinary sign-in. Focused ledger/manager tests cover same-subject binding. | Implemented at G1; real provider callback evidence remains required. |
| Existing-account path is explicit and recoverable | A different durable target requires deliberate existing-account authorization for anonymous sources. The modal presents keep-on-device and separately confirmed discard while transfer is unavailable; focused UI/core tests pass. | Implemented as a safe local choice. It is not remote migration. |
| Local guest data cannot be silently or ambiguously transferred | `GuestDataSync` is fail-closed until a server policy and complete receipt exist; source data is retained on failure. | Implemented fail-closed. |
| EdLove is server-only and follows durable confirmation | The mobile flow never mints or transmits an EdLove ID. Fresh local Supabase replay plus 47 pgTAP assertions prove the UUIDv8 validator, server-only writer, durable handoff, role isolation, and queue leases; Sanctuary worker boundary tests cover recovery. | Locally verified. Not a hosted rollout claim until a forward reconciliation migration and the deployed worker database role are verified. |
| Existing IDs/providers/unrelated flows remain unchanged | No migration/backfill is invoked by the mobile flow; account transfer remains data-only and explicit. Raw diff review found no deletion or provider configuration change in this phase. | Preserved in the staged source diff; production verification remains deferred. |
| Canonical documentation is current | This ledger, the cross-channel contract, and the current EdLove identity-foundation ledger record the same no-auto-merge/no-client-ID rules. | Complete for current source state. |

### Remaining exit evidence

1. **Per-kind approval:** the canonical policy currently disables transfer.
   Product and Sanctuary must approve one concrete conflict/retention contract
   for timetable, mood/journal, or students, including an authorized
   classroom-selection rule for student records, before enabling that kind.
2. **Server contract:** a scoped Sanctuary migration endpoint with server
   target resolution, per-record authorization, idempotency receipt, audit,
   and retry semantics derived from that policy.
3. **Hosted database preflight:** create a forward reconciliation migration
   from the hosted migration ledger and actual schema, then verify the deployed
   Sanctuary direct database role can consume the private handoff while client
   and `service_role` paths cannot. The equivalent fresh local replay and
   role-isolation proof are complete.
4. **G5 mobile proof:** development-client airplane-mode entry, process death,
   credential callback, existing-account choice, reconnect, and discard
   recovery on Android and iOS.

### Device-harness observation — 2026-10-24

The Callstack `agent-device` Android discovery command still fails before
device selection: its daemon cannot establish a reachable owner and retains an
unverified lock state. The independent Argent discovery surface reports no
Android device or AVD. No device or simulator was opened, changed, reset, or
updated. The tool's recovery guidance requires confirmation that every earlier
client is stopped before manual daemon recovery, so this phase does not perform
that potentially disruptive action. G5 remains required; the next operator
should restore the device harness or attach a known development device, then
run the listed journey unchanged.

