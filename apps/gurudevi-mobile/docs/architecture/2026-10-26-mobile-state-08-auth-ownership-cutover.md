---
title: "Auth ownership: credential, identity and scope cutover"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, foundation, auth, identity, state]
---

# Auth ownership cutover

## Architecture decision

No new credential store. The existing AuthProvider owns one useAuthLifecycle instance and publishes its credential/readiness snapshot through useAuth. The SDK/auth port remains the credential transport and refresh authority; remembered-device credential storage remains a separate secure retention obligation. Do not persist tokens into profile/preferences or Query. Services that require a current authenticated request use the existing auth port, verified account binding and admission barriers, not a copied React session.

Canonical identity remains one narrow synchronous observable because database guards, replay, imperative transports and account-cache disposal require getState/subscription outside React. Retain the existing Zustand substrate for that requirement while removing unrelated fields; do not write a bespoke useSyncExternalStore engine just to avoid the word store. Credentials, identity and selected scope are different facts, not interchangeable IDs or replicas. scopeSession remains the selected bond/entity/perspective owner.

## Responsibility disposition and caller contracts

| Current responsibility | Authoritative destination | Caller migration / acceptance |
| --- | --- | --- |
| session in lifecycle plus authSession/authSessionResolved in AuthStore | One provider-owned session; lifecycle loading expresses bootstrap resolution | useAuth consumers remain; useSanctuaryVisitor moves to provider session/readiness. Remove mirror setters, reset fields and fixture-only writes. The mirror was not persisted by AuthStore partialize; no persisted credential migration is required. Do not remove SDK/remembered credentials. |
| canonical user/profile | Narrow existing identity observable, populated by verified lifecycle resolution | Preserve synchronous account guard/replay/cache consumers. Later rename only after mixed fields move; no new useAuthStore facade forwarding everything. Profile edits must update the same authoritative identity, not a second Query copy. |
| resolved credential subject / availability / lifecycle status | Identity-resolution result published by the lifecycle; scope commits remain generation guarded | Preserve canonical-versus-subject binding, old-response rejection, inactive handling and verified offline fallback. Consolidate duplicated status representations only with transition tests. |
| selected bond/entity/perspective | scopeSession/coordinator | Never restore these mirrors in the identity owner. Bond change must not destroy account database/drafts. |
| onboardingCompleted | Profile-derived completion plus an explicitly owned guest/local journey record | Audit all writers and recovery before removing the current persisted field; completion is not inferred from a session. justFinishedOnboarding belongs to journey feedback lifetime. |
| toast/showToast/hideToast | Existing ToastProvider/feedback service | Migrate imperative and React consumers to existing feedback contracts; preserve duration/error visibility and native host mounting. No new toast store or silent loss of feedback. |
| demoLogs / bridge actions | Demo-to-real workflow owner, separate from credentials/identity | useDemoBridge reads these as simulated write intents and can execute them against real APIs; they are not disposable diagnostic logs. Trace producers, confirmation, principal binding, failures and recovery before relocation. Preserve required simulation/bridge behavior; do not replace the journal with observability breadcrumbs. |
| isExplorerMode/isDemoMode/isBridging | Existing experience/guest transition owner or derived identity mode; transition activity stays with its workflow | Do not equate no network with guest or infer permission from a display mode. Trace all writers before consolidation. |
| userName | Derive from canonical profile when it is display data; keep an unfinished name input with its form | Preserve onboarding input and guest display fallback rather than blindly dropping a persisted value. |
| isStoreHydrated | Profile snapshot hydration boundary | Distinct from credential bootstrap and scope readiness. No one all-app ready flag. Keep current gate until its real startup callers migrate. |

## Execution order

1. Eliminate credential duplication and stale session capture in the existing lifecycle. Prove subscribe-before-bootstrap, newer-event precedence, refresh retention, signout, cleanup, provider visibility and visitor readiness. Use installed React useEffectEvent for the effect-owned native wake event if verified by installed exports/types; do not resubscribe auth on every token update.
2. Migrate unrelated feedback and experience/journey responsibilities to their established owners, auditing writer/readers in semantic groups. Do not move a mixed bag into another store or weaken recovery tests. Record each old API's replacement and caller reachability.
3. Narrow/rename the remaining identity observable and migrate all imports/selectors/imperative subscribers together. Retain storage compatibility/read-back for existing profile snapshots and explicit readiness. Persisted profile is a qualified offline candidate, never a substitute for credential/account verification.
4. Reconcile lifecycle orchestration into explicit credential observation, verified identity acquisition/commit and resource admission. Reuse the existing accountTransition, profileResolution, authenticatedAccountCapture and scope coordinator. Shared resource cancellation/close/replay barriers remain independently verified; no second root orchestrator.
5. Accept through bootstrap/offline/restart/account-switch/credential-rebind/inactive and failure scenarios, then matched native/device evidence. Store removal is not the acceptance criterion.

## First cut specification

AMBER: packages/core hooks, AuthSlice/reset/harness, core bootstrap tests and mobile mounted tests. Reuses AuthProvider, authAPI, scope coordinator and existing identity observable. Removes the nonpersisted session mirror after its sole production reader migrates; no account/profile/credential bytes are deleted. Keeps the public useAuth session contract. No native ABI, database schema, upstream merge, SDK auth adapter or dependency change. All old bootstrap assertions remain at the actual provider-owned state boundary. Boundaries must compile, mounted/session tests must exercise real React, and required gates retain failures honestly.

Sources: inspected current repo contracts and installed React 19.3.1 runtime export. Official [state ownership guidance](https://react.dev/learn/scaling-up-with-reducer-and-context), [effect-event contract](https://react.dev/reference/react/useEffectEvent), and [exact 19.3.1 release](https://github.com/react/react/releases/tag/v19.3.1). No recommendation here implies that every remote datum should move into Context or that an external store is obsolete.

## First cut implemented; remaining cuts open

Removed authSession/authSessionResolved and their setters from AuthSlice, lifecycle mirror writes, scoped reset and fixtures. The sole production mirror reader, useSanctuaryVisitor, now consumes useAuth under AuthProvider and derives first-time status only after credential bootstrap resolves. Its return contract remains; provider placement is now required. SDK credentials and remembered-device records are unchanged; these removed fields were absent from persisted partialize. No mirror aliases remain in the bounded app/package TS/TSX search.

Native wake now invokes an effect-owned useEffectEvent that sees the latest committed session without resubscribing the auth observer. This fixes the initial null-session closure while preserving the one-minute throttle, current-session authAPI lookup and generation guards. Installed React 19.3.1 runtime and @types/react declaration confirm the API.

G1/G2 Vitest substituted boundaries: 29/29 assertions across bootstrap and account-transition suites. G3 actual React/provider with substituted SDK/native/storage: three new mounted scenarios, combined with existing startup/cache-boundary coverage for 10 assertions across three mobile files. Core/mobile typechecks exit 0; scoped Biome/state-policy, seam and test-evidence checks complete. Full anti-slop remains failed at AIslop: 35 errors, 1,213 warnings, 4,063 files; chained later stages did not execute. Lifecycle Fallow inspection reports retained complexity findings, zero clone groups; no suppressions or raised budgets. No G5 proof. Exact reports and open obligations are in the execution log.

This establishes one application credential snapshot; it does not retire AuthStore, finish field-by-field identity/experience/journey/feedback separation, or prove physical offline recovery. Continue steps 2–5 through shared ownership contracts.

## Mixed-field cut implemented

AuthSlice now contains only user, setUser, isStoreHydrated and setStoreHydrated. The existing useAuthStore is a narrow canonical-profile observable, not an aggregate forwarding facade. No replacement credential store was created.

| Retired AuthStore field/API | Canonical replacement |
| --- | --- |
| toast/showToast/hideToast | Imperative showToast in core lib/feedback emits typed requests on sovereignBus; existing ToastProvider owns display/timers/dismissal. Scoped reset emits feedback:clear. No toast store. |
| isDemoMode/isExplorerMode/isBridging/demoLogs and their actions | core lib/experienceState: one bounded shared workflow model used by API interception, demo bridge and observers. Only explorer choice persists under account/guest-qualified keys; bridge bypass and simulated journal remain transient as before. |
| justFinishedOnboarding/setJustFinishedOnboarding | Existing UI slice; transient celebration feedback, excluded from persisted partialize. |
| onboardingCompleted/setOnboardingCompleted | Derive completion from user.onboarding_completed. Verified profile resolution publishes the field; confirmed guest completion updates the same profile field. No independent completion mirror. |
| userName/setUserName | Display derives from profile.display_name with existing fallback. Migration adopts legacy name only when profile name is absent/empty and retains original bytes. |

Direct production references migrated in 57 files across core/domain/UI/mobile source, including existing migration-source web counterparts. No removed field remains in the targeted AuthStore-reference search. The single new experience model is justified by imperative interception plus shared UI workflow subscribers; it does not own identity, credentials, authorization, network truth or durable outbox completion. Existing demo bridge confirmation/replay behavior was retained, including its outstanding failure/recovery limitations; relocating it is not proof that its protocol is correct.

Persistence is version 2 at the existing profile key, narrowed to user. Before a legacy record can be rewritten, authProfileStorage validates the required profile shape, acknowledges and reads back a retained copy at gurudevi-auth-storage:legacy-retained-v1, and migrates only a proven account/anonymous explorer preference without overwriting an existing owner-qualified value. Original profile completion/name take precedence over legacy mirrors. A conflicting retained copy stops migration rather than overwriting either source. Profile writes stay blocked after validation, backup or readback failure; hydration generations prevent an older read from reopening that gate after a newer failure. Experience preference writes stay blocked until successful explicit hydration; account initialization/reset/rehydration include that owner. No retained legacy bytes are deleted by this cut.

Source grounding found ActiveCitizen does not promise created_at. User.created_at is now optional to match the actual bootstrap substrate; migration accepts its omission and does not fabricate a date. The lifecycle's as-unknown-as-User assertion is removed. This guard checks the profile's required shape, not every optional profile property or authorization validity; credential/account verification remains mandatory.

Evidence and exact unresolved gate results are in the execution log. Mocked/component suites cover actual relocated reads/writes, profile migration failure/readback/races, notification sample decisions, scoped resets, onboarding retry and feedback host behavior. No phone, real storage power-loss, real auth-server or demo-to-real transport acceptance is claimed. Remaining foundational work includes complete identity/resource transaction semantics and physical offline acceptance; this field cut does not complete the full modernization goal.
