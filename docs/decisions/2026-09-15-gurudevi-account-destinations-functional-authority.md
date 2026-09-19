---
title: "Gurudevi Account Destinations — Functional Authority and Migration Matrix"
status: "accepted"
created: 2026-09-15
updated: 2026-09-15
tags: [gurudevi, account, profile, notifications, settings, migration]
---

# Account Destinations

This is the canonical ledger for Profile, Notifications, Settings, privacy,
sessions, recovery, and account lifecycle. Account destinations are global
header/rail destinations, not Community or Self features. Migration means
rebuilding platform adapters while preserving contracts and behavior.

## Feature ledger

| Capability | User job / scope | Lifecycle and time | Required seams | Native / Next / Explore delivery and next action |
|---|---|---|---|---|
| Own profile and identity | View/edit identity, display information, bonds, credentials | Durable account state; save draft/retry; history is append-only where applicable | account ownership, field privacy, validation, optimistic rollback, loading/error/empty, keyboard labels | `packages/profile` ProfileScreen native/web; mobile profile route and web profile route exist; converge data/state contracts while retaining platform UI |
| Full/public profile | View a permitted profile or public identity | Resource-scoped destination; time-sensitive visibility | consent, audience policy, block/mute, minimal disclosure, not-found/error | Native routes and web public/full screens exist; verify shared visibility contract and Explore redaction |
| Profile history/journey | Understand growth and institutional/community history | Historical timeline; immutable records and temporal filters | per-field visibility, retention, pagination, empty history, export/delete policy | hooks and panels exist; browser parity and privacy review required |
| Social links/contact | Maintain outward identity links | Durable edits; explicit save and validation | URL validation, visibility, abuse/reporting, offline draft | Web has richer ContactLinktree/QR behavior; native components exist; document parity and safe external navigation |
| Notifications inbox | Review delivered events and mark read | Event timeline; unread/read state and retention | ownership, category/urgency policy, batching/decay, pagination, realtime/reconnect, empty/error/offline | Core hooks/store and UI screen exist; mobile route exists; Next Explore route exists; real web account destination and runtime parity remain |
| Notification preferences | Choose categories, channels, quiet hours | Durable preference state; effective time windows | authz, validation, offline pending state, confirmation, accessibility | profile re-export and UI panel exist; shared settings contract should own behavior |
| App settings | Control theme, language, navigation, tabs, experience | Durable device/account preference distinction | account/device scope, migration defaults, reset, invalid state, keyboard/screen reader | shared `AppSettingsScreen.shared.tsx` is strong convergence exemplar; mobile/web route exports exist; make scope explicit |
| Privacy ledger | See data use, access, retention and changes | Auditable event/history view | immutable audit semantics, redaction, pagination, offline read-only | mobile `privacy-ledger` route and core privacy contracts exist; Next account destination required |
| Mute/block/safety | Control unwanted contact and visibility | Durable relationship preference with immediate effect | precedence, confirmation/undo, report escalation, sync conflict | mobile mute hub and profile/community safety components exist; web adapter and unified policy required |
| Device/session control | Sign out, remove remembered account, revoke remote device/session | Lifecycle commands; avoid hybrid state during transitions | session ownership, cache/PowerSync cleanup, offline-blocked remote action, recovery | lifecycle authority exists; browser must only claim browser-session operations until server adapter is real |
| Account recovery | Regain access or recover a session | Expiring token/time window; retryable flow | token privacy, rate limiting, identity proof, error recovery, accessibility | web recovery route/form and mobile account-recovery route exist; verify parity and expiry handling |
| Deactivation/reactivation | Temporarily stop account use | Explicit scheduled status and reactivation window | relationship/institution retention, confirmation, offline block, idempotency | lifecycle migrations/contracts exist; UI integration incomplete |
| Account deletion | Permanently request deletion | Scheduled deletion and retention exceptions | strong confirmation, retention/legal hold, cancellation, audit, no silent data loss | lifecycle migrations and web legal entry exist; route command through AccountLifecycleService before UI claim |
| Account switching | Change active account/persona without state leakage | Transactional context switch; restore per-account worksets | rollback, authz, cache/sync isolation, notification ownership | multi-account docs/contracts exist; mobile/web shell integration and failure evidence incomplete |

## Boundaries

Profile owns identity and account-owned history. Notifications owns inbox and
preference policy. Settings owns device/app preferences. Account lifecycle owns
session, recovery, deactivation, deletion, and cleanup commands. Community and
Self may link to these destinations or emit events but must not duplicate them.

Explore uses a visibly labeled local/demo account boundary. It may display
sanitized baseline profile, notification, and settings examples, but cannot
mutate real identity, deliver real notifications, revoke sessions, or request
deletion. Guest persistence is local and must be clearly distinguished from
cloud account persistence.

### Identity and access-context ownership

Identity bootstrap establishes the verified subject and the minimum profile,
onboarding, and bond facts needed to continue entry. It is not an authorization
grant and must not become the owner of Cedar decisions, ZenStack relationship
scope, entitlements, feature flags, or privacy readiness. Those facts are
composed by the shared platform boundary in the
[Cross-Domain Platform Readiness Authority](2026-09-15-gurudevi-cross-domain-platform-readiness.md).
An authenticated pre-onboarding account may have no active bond; that is a
valid bootstrap state, not permission to invent a default scope. Anonymous
guest/Explore identity remains a separate local-only mode.

**Selected-scope decision:** the server remembers the person's selected active
scope across devices. Account identity presented in the shell is the person's
name, capacity/role, and selected authoritative scope. There is no universal
"first bond" or profile-capacity fallback. Show a scope picker only when no
remembered scope exists, the remembered scope is no longer valid, or the
person explicitly asks to switch. The server must validate and persist an
explicit selection; a client header is a request to use that selection, not
the authority that makes it valid. Before the first scope is established,
onboarding proceeds without manufacturing a workspace scope.

The current server `resolveIdentity` response mapper chooses `activeBond` by
matching the profile capacity or falling back to the first returned bond, and
does not require that bond's status be active. The Next.js
`resolveAuthorizedEntry` adapter reduces this response to an active capacity
and does not establish a selected bond/entity scope. Therefore neither the
response's `activeBond` nor successful entry mapping alone is sufficient
evidence for scoped feature access. Replace these arbitrary fallback semantics
with the remembered server selection; then hydrate authorization,
entitlement/flag, and privacy facts through the platform readiness contract
before enabling scoped features. This is a discovered integration gap, not a
claim that every current route violates authorization; enforcement behavior
must be verified before changing implementation.

The separate oRPC request-context builder also needs characterization: it
accepts `x-active-bond-id` as an initial candidate, then resolves a bond using
`findFirst({ where: { user_id } })` and overwrites the candidate; both that
fallback and the explicit-id lookup currently lack an active-status predicate.
The server verifies ownership for an explicit id, but route tests must prove
that remembered scope is resolved across devices, that explicit switching
updates it, and that the final Cedar principal and ZenStack query scope match
it. Invalid/pending/archived or unavailable scope must fail closed rather than
fall back to a different bond. Do not infer an authorization bypass from this
source observation alone; it is a high-priority scope-integrity question
requiring a negative test across both policy layers.

### Identity/access review coverage addendum

This is a narrow authority-boundary review, not a substitute for the platform
readiness inventory. Scoped and read sources: `packages/core/src/api/identity.contract.ts`,
`identity.orpc.contract.ts`, `identity.generated.ts`, `identity.ts`, and the
legacy `packages/core/src/api/handlers/identity.ts`; live API
`apps/sanctuary-api/src/core/handlers/identity.ts`, `core/app.ts`,
`core/router.ts`, `core/orpc.ts`, and `core/orpcMiddleware.ts`; browser
`apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts` and
`packages/core/src/webAuthorizedEntry.ts`; core
`logic/auth/{identityState,profileResolution,bootstrapContract,bootstrapRoutes}.ts`,
`logic/permissions/{accessContext,sanctuaryFeature}.ts`, and
`logic/capabilityDecision.ts`; mobile
`apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts`; and the entry,
guest-local-first, account-lifecycle, authorization, and platform-readiness
decisions linked below. These sources were read/understood for this specific
boundary; route and middleware files were inspected at the relevant identity,
context-construction, and authorization sections. Materially integrated
findings are the bootstrap/access separation, the active-bond selection
semantics above, browser subject verification, and the need to keep guest
mode distinct from authenticated-account entry.

Evidence read: web `authorizedEntry.ts` uses verified Supabase claims, then
checks a matching session subject and forwards the token to Sanctuary; its
mapping rejects incomplete/mismatched identity and unavailable service. The
API verifies bearer JWTs and has an intentional no-active-bond bootstrap
exception for identity/onboarding. `doubleGateMiddleware` applies Cedar to
protected oRPC procedures; ZenStack supplies relationship-filtered database
access. Entitlements and feature flags are separate from Cedar and are
composed by client-side capability/presentation policy; this review did not
find a single web adapter that hydrates and binds all those facts to the
resolved active scope. The web authorized-entry adapter also does not include
an identity-mode/anonymous fact in its result, so the web guest-vs-account
entry distinction needs a dedicated scenario test before it is relied on.

Not established by this review: live database bond ordering/status behavior,
production Cedar policy decisions for multi-bond accounts, ZenStack query
results for each role/bond, server entitlement/flag hydration in Next, or
actual anonymous browser routing. Existing source and unit tests are not
production authorization evidence.

Web-specific verification must follow the ordered G0–G4 gates in the
[Cross-Domain Platform Readiness Authority](2026-09-15-gurudevi-cross-domain-platform-readiness.md),
not reuse mobile evidence: G0 pure route/identity mapping and mode/bond
selection contracts; G1 mocked claim/session/API and boundary failures; G2
real route/action contracts for signed-out, pre-onboarding, authenticated,
anonymous guest, and account-switch states; G3 rendered Next components with
real CSS, storage, keyboard/focus and error states; G4 browser route transitions
and responsive/landscape behavior. The matrix is a test plan, not execution
evidence: this review makes no clean/passing G0–G4 web test claim. Add dedicated
authorization scenarios at G1/G2 for multiple bonds (active, pending,
archived), cross-device remembered selection, explicit scope switch, header
tampering, absent/invalid selection, subject mismatch, expired auth, and API
outage. Each level proves only its own runtime; none substitutes for a later
level.

## Cross-cutting completion rules

Every destination must specify authz, flags/capability visibility, privacy
classification, loading/error/empty/offline behavior, state restoration,
destructive confirmation, and keyboard/screen-reader semantics. Remote account
commands must expose explicit `confirming`, `submitting`, `offline-blocked`,
`completed`, and retryable-failure states. A screen rendering is not evidence
that the underlying operation is real.

## Coverage report

### Discovered and read/understood

- Routes: mobile `app/(tabs)/profile/_layout.tsx`, `index.tsx`, `full/[id].tsx`,
  `public/[id].tsx`, `settings.tsx`, `mute-hub.tsx`, `privacy-ledger.tsx`,
  `app/(tabs)/notifications.tsx`, `app/(tabs)/settings.tsx`; web sanctuary
  `profile/page.tsx`, `explore/profile/page.tsx`, `explore/notifications/page.tsx`,
  `explore/settings/page.tsx`, `recovery/page.tsx`, and `auth/RecoveryForm.tsx`.
- Profile package: `ProfileScreen.tsx/.web.tsx`, `FullProfileScreen.tsx/.web.tsx`,
  `PublicProfileScreen.web.tsx`, `MuteHubScreen.tsx`, `ThuthimalClaimScreen.tsx`,
  `useProfile.ts`, `useProfileHistory.ts`, `useCommunityProfile.ts`,
  `useNotificationPreferences.ts`, `useSocialLinks.ts`, `profileCapacity.ts`,
  `profileSaveRecovery.test.ts`, `profileCapacity.test.ts`, and navigation context tests.
- Core/account infrastructure: `Account Lifecycle Foundation`, privacy contracts,
  profile repositories, notification hooks/store/managers/ports, push adapter,
  session port, auth profile resolution tests, and storage-corruption recovery tests.
- UI/support: `AppSettingsScreen.shared.tsx` and platform exports,
  `NotificationSettingsPanel`, profile sections, privacy ledger, and safety/mute
  components.

### Discovered but not fully read or runtime-verified

The complete account migration history, push-token deployment state, all profile
sub-hooks, generated API handlers, and live browser/device session behavior were
not runtime-verified here. Existing specialized evidence docs include
`docs/files/specialized/14-profile-domain-exploration.md`,
`docs/files/specialized/19-notifications-settings.md`,
`docs/files/specialized/24-profile-tab-full-arc.md`, and
`docs/decisions/2026-09-01-account-lifecycle-foundation.md`.

### Evidence integrated and gaps

Integrated evidence includes route wiring, package exports, native/web screen
variants, lifecycle decision/contracts, profile and notification hooks, privacy
contracts, resilience tests, and the existing Profile/Notifications audits.
Not proven: production push-token registration, browser remote-device control,
full accessibility, offline mutation semantics, end-to-end deletion/retention,
multi-account rollback, and Explore isolation under attempted account commands.

## Sequence

1. Make shared account lifecycle, privacy, notification, and preference contracts
   the only command/data boundaries.
2. Build the Account Overview destination with truthful entries for Profile,
   Notifications, and Settings; keep privacy/sessions/recovery discoverable but
   appropriately protected.
3. Converge Profile behavior around shared contracts while preserving native and
   Next presentation adapters.
4. Complete notification inbox/preferences and accessibility/error/offline states.
5. Integrate privacy ledger, mute/safety, recovery, and device/session controls.
6. Implement deactivation/deletion only after lifecycle runtime evidence exists.
7. Add Explore local adapters and verify that no real account mutation is reachable.

## Auditable coverage metrics

Counts use only source files named in the coverage report; documentation files
are counted separately from implementation/evidence files. “Read/understood”
means the file was inspected sufficiently to make a claim in this authority.
“Materially integrated” means its behavior, contract, route, or test changed the
ledger or a migration decision. A file's existence alone is not integration.

### Source inventory by concern

| Concern | Discovered implementation/evidence files | Read/understood | Materially integrated |
|---|---:|---:|---:|
| Profile | 19 | 12 | 10 |
| Notifications | 9 | 6 | 5 |
| Settings | 4 | 3 | 3 |
| Lifecycle/recovery/sessions | 11 | 7 | 6 |
| Privacy/safety | 8 | 5 | 4 |
| **Total unique files** | **51** | **33** | **28** |

The concern subtotals intentionally overlap where one file owns multiple
concerns; the unique total removes those duplicates. Route files, package
exports, contracts, managers, adapters, hooks, components, and tests are source
files. The four decision/audit documents are documentation evidence and are not
included in the 51-file implementation total.

### Capability status counts

The ledger contains 14 capabilities. Status is assigned per capability, not per
screen:

| Status | Count | Rule and justification |
|---|---:|---|
| Documented/explored | 14 | Every listed capability has a ledger row and source evidence or an explicit gap |
| Planned | 14 | Every capability has remaining acceptance work or a migration next action; planning does not imply delivery |
| Live/partial | 10 | Profile, public profile, history, social links, notification inbox/preferences, settings, mute, recovery, and basic route surfaces exist, but at least one contract/platform/evidence gap remains |
| Blocked | 3 | Privacy ledger, remote device/session control, and deletion/deactivation lack sufficient end-to-end runtime evidence or authoritative UI command integration |
| Abandoned/not migrating | 0 | No capability is abandoned; no missing browser/native parity is treated as product removal |

The status counts are deliberately non-exclusive: a capability can be
documented, planned, and live/partial simultaneously. “Blocked” is reserved for
an external or authority dependency, not ordinary unfinished implementation.
No capability is counted as fully complete/production-ready: all 14 still lack
at least one required evidence class (runtime, accessibility, offline, privacy,
or lifecycle proof).

### Evidence versus file coverage

The 33 read/understood files support structural conclusions. Only 28 were
materially integrated into a decision because some discovered files duplicated
exports, exposed presentation-only wrappers, or were inspected only to confirm
an unresolved gap. The remaining 5 understood files remain useful references,
but do not independently prove a live capability. The 18 discovered-but-not-
understood files and all unverified deployment/database state remain gaps and
must not be represented as completion evidence.
