---
title: "Mobile state audit 1: existing holders and consumers"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, state, audit, inventory, zustand]
---

# Mobile state audit 1: existing holders and consumers

1. [Existing holders and consumers](2026-10-26-mobile-state-01-existing-inventory.md)
2. [Installed runtime capabilities](2026-10-26-mobile-state-02-runtime-capabilities.md)
3. [Existing documentation audit](2026-10-26-mobile-state-03-documentation-audit.md)
4. [Reconciliation and proposed direction](2026-10-26-mobile-state-04-reconciliation-and-direction.md)

## Snapshot, scope and evidence

Audited 2026-10-26 in the existing, dirty C:/x checkout; HEAD e0c32b3fbdd5e3212aa2c6f8f484cd0e3f2f050c. Findings describe saved working-tree source, including pre-existing uncommitted work, not just HEAD or a deployed APK. This report changes no application behavior.

The existing audit script scans 2,950 TypeScript files and reports 18 named stores, 17 persisted holders, 45 context-bearing files, 53 reducer-bearing files and 48 bare useXStore() matches. These are lexical measurements. Its store regex requires a name ending in Store: it misses useMutationQueue, useMutationAuditLog and useProvisionalWorkspaceQueue. The registry has 21 entries and one discovered unregistered path; registry completeness is not semantic correctness.

A second, in-memory AST inspection used the installed @babel/parser 7.29.8 across 2,931 source files, with zero parse failures. It excludes node_modules, build/output/generated trees, docs, reports, __tests__ and conventional .test/.spec files; platform source variants are retained. It finds **21 actual Zustand create/createStore declarations**, **17 persist-middleware holders**, and custom persistence in selfCanvasStore. The 19-file scope difference from the existing scanner reflects its broader generated/platform-tree traversal. The AST records **616 calls** to the identified store symbols/facade or the traced pendingIntentStore accessor. Calls inside defining modules are included; table counts explicitly identify those. It also finds 48 createContext calls and 68 useReducer calls across the wider workspace; these are call counts, not comparable to the lexical file counts.

“Exhaustive” here means all discovered named Zustand holders, their declared contracts and every statically identified direct call in the stated TS/TSX scope. It does not claim whole-program dynamic data-flow proof, production mounting, runtime import reachability, JS-only source coverage, or timing evidence. Named import aliases are followed. Namespace calls are recognized for @repo imports. pendingIntentStore forwarding is explicitly traced. Arbitrary function reassignment, computed properties, runtime injection and reflection can escape this map. Local React state is surveyed as context/reducer sites, not falsely counted as global stores. Nonconventional test-support modules (for example core/testing/scenarioHarness.ts) remain in this source scope and are not evidence of product mounting. Shared-package and .web.tsx references are retained as compatibility impact, never described as native bundle proof.

## What actually happened to useStore

[packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) contains a facade over exactly **four** stores: Auth, Tenant, UI and Feature. It is not a facade over all 21. Each hook call subscribes to all four complete snapshots, creates a merged object, and then runs the caller selector. A selected primitive does not undo those four subscriptions. This is a source-proven subscription problem; the resulting commit/CPU cost still requires profiling.

There are **218 calls in 130 files: 185 hook calls and 33 imperative calls**. Only six hook calls omit a selector, but **all 185 hook calls pass through the broad subscription implementation**. The current policy regex requires characters between use and Store, so it does not match the plain useStore name at all; even a corrected bare-call rule would miss the 179 selected facade hook calls. Direct useAuthStore/useTemporalStore/etc. calls also exist, so “everyone calls useStore” is false; “the facade is retired because stores were split” is equally false.

Spread order is Auth → Tenant → UI → Feature. Both AuthSlice and TenantSlice define activePerspective with different shapes; Tenant wins at runtime. Auth and UI also share dismissedSampleIds; UI wins. TotalState is an intersection, and the facade ends with an as unknown as assertion. That assertion does not reconcile the conflicting contracts. Migration must preserve each consumer's intended meaning rather than blindly changing its import.

## Holder overview

Calls/files below include defining modules and shared/browser variants. M is direct mobile-app files; S is shared package files; O is other apps. Zero means no call identified by this method, not a safe deletion decision.

| Holder | Calls | Files | Whole-hook calls | M / S / O files | Purpose |
| --- | ---: | ---: | ---: | --- | --- |
| [useMutationAuditLog](#usemutationauditlog) | 5 | 4 | 1 | 0 / 4 / 0 | Durable mutation outcome history; entries, attempts, terminal/error summaries. |
| [useMutationQueue](#usemutationqueue) | 51 | 24 | 3 | 1 / 16 / 7 | Durable offline commands, dead letters, idempotency, retry and dispatch state. |
| [useVersionGatingStore](#useversiongatingstore) | 9 | 2 | 0 | 1 / 1 / 0 | Installed/remote version comparison, hard block, soft nudge, dismissal, bus events. |
| [usePendingIntentStore](#usependingintentstore) | 8 | 3 | 0 | 3 / 0 / 0 | TTL-bounded deep-link intent; get, drain, clear, and legacy deferred_deep_link write-through. |
| [useProvisionalWorkspaceQueue](#useprovisionalworkspacequeue) | 12 | 2 | 0 | 1 / 1 / 0 | Principal-bound commercial/guardian provisioning requests; claim, receipt-check, reject and reconcile. |
| [useScopeSessionStore](#usescopesessionstore) | 18 | 8 | 0 | 0 / 8 / 0 | Canonical active principal, perspective, bond and tenant snapshot; transition/error state. |
| [useActiveSubTabsStore](#useactivesubtabsstore) | 22 | 7 | 0 | 4 / 3 / 0 | Domain workbench task descriptors, focus, pinned features, chrome and navigation preferences. |
| [useAuthStore](#useauthstore) | 93 | 60 | 1 | 4 / 56 / 0 | Session and profile alongside onboarding, demo/explore mode, network, toast and hydration flags. |
| [useCedarDecisionStore](#usecedardecisionstore) | 19 | 8 | 0 | 2 / 6 / 0 | Loads and verifies local permission snapshots; principal/scope, signature, policy version, expiry and safe denial. |
| [useConflictStore](#useconflictstore) | 3 | 3 | 2 | 0 / 3 / 0 | Active data conflicts plus bounded resolved history; resolution emits bus events. |
| [useConsentStore](#useconsentstore) | 1 | 1 | 1 | 1 / 0 / 0 | Device consent decision and analytics permission; grant and deny. |
| [useDraftsStore](#usedraftsstore) | 0 | 0 | 0 | 0 / 0 / 0 | Generic timestamped draft map; set/get/delete/clear. |
| [useEntitlementStore](#useentitlementstore) | 9 | 6 | 4 | 1 / 5 / 0 | Commercial entitlement snapshot, pricing, readiness/freshness and async adapter loading. |
| [useFeatureStore](#usefeaturestore) | 18 | 13 | 1 | 1 / 12 / 0 | Resolved feature flags and rollout snapshot; freshness policy and applied defaults. |
| [useGrowthStore](#usegrowthstore) | 11 | 3 | 0 | 0 / 3 / 0 | Growth path stages, counters, previous counters and update/reset actions. |
| [usePerspectiveStore](#useperspectivestore) | 12 | 6 | 0 | 1 / 5 / 0 | Available/active workspace perspectives and transition flag, plus legacy mutation actions. |
| [useSensoryStore](#usesensorystore) | 0 | 0 | 0 | 0 / 0 / 0 | Three persisted haptics/sound/quiet preferences and setters. |
| [useTemporalStore](#usetemporalstore) | 84 | 64 | 36 | 0 / 64 / 0 | Temporal date/scale/view/focus, offline state, phase/past flags and animated intensity. |
| [useTenantStore](#usetenantstore) | 13 | 5 | 1 | 0 / 5 / 0 | School metadata, academic cycle, tenant readiness and perspective compatibility model. |
| [useUIStore](#useuistore) | 9 | 5 | 1 | 2 / 3 / 0 | Sidebar, theme/themeMode, dismissed samples, desk resources and breathing overlay. |
| [useSelfCanvasStore](#useselfcanvasstore) | 1 | 1 | 1 | 0 / 1 / 0 | User canvas preferences plus local persistence, guest handling, debounce, retry, circuit breaker and remote writes. |

## Per-holder contracts, persistence and complete call ledger

Each contract is extracted from the current declaration, including its fields and action signatures. Referenced domain types remain linked source contracts rather than being expanded repeatedly. The ledger records call expressions, not import declarations; forwarded handle references are listed separately. Hook expression excerpts are shortened to 220 characters for readability; source links and exact line numbers identify the complete expression. Self/definition calls are intentional and remain visible.

### useMutationAuditLog

Definition: [packages/core/src/lib/sync/MutationAuditLog.ts:35](../../../../packages/core/src/lib/sync/MutationAuditLog.ts).

Durable mutation outcome history; entries, attempts, terminal/error summaries.

Review finding: Preserve linkage to command IDs and retention before considering storage changes. A history is not a preference.

Persistence: `gurudevi-mutation-audit-log`; version: false; migrate: false; partialize: false. Options present: `name`, `storage`.

No partialize option: ordinary persist serialization includes serializable state fields; functions are omitted by JSON. Do not infer an approved retention policy from this behavior.

Declared contract: [packages/core/src/lib/sync/MutationAuditLog.ts:20](../../../../packages/core/src/lib/sync/MutationAuditLog.ts).

```ts
interface MutationAuditLogState {
  entries: AuditEntry[];
  logEntry: (entry: Omit<AuditEntry, 'updatedAt'>) => void;
  updateEntry: (id: string, status: MutationOutcome, error?: string) => void;
  clearLog: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/admin/src/admin/adminControl.ts](../../../../packages/admin/src/admin/adminControl.ts) | 61 | getState | `useMutationAuditLog.getState()` |
| [packages/admin/src/admin/adminControl.ts](../../../../packages/admin/src/admin/adminControl.ts) | 190 | getState | `useMutationAuditLog .getState()` |
| [packages/core/src/hooks/useSafeMutation.ts](../../../../packages/core/src/hooks/useSafeMutation.ts) | 109 | hook / selected | `useMutationAuditLog((s) => s.logEntry)` |
| [packages/core/src/lib/sync/deviceSecurityIntents.ts](../../../../packages/core/src/lib/sync/deviceSecurityIntents.ts) | 37 | getState | `useMutationAuditLog.getState()` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 57 | hook / whole | `useMutationAuditLog()` |

### useMutationQueue

Definition: [packages/core/src/lib/sync/useMutationQueue.ts:16](../../../../packages/core/src/lib/sync/useMutationQueue.ts).

Durable offline commands, dead letters, idempotency, retry and dispatch state.

Review finding: A store API is incidental; the command journal contract is essential. React optimistic state and Query MutationCache alone are not equivalent.

Persistence: `gurudevi-mutation-queue`; version: false; migrate: false; partialize: false. Options present: `name`, `storage`.

No partialize option: ordinary persist serialization includes serializable state fields; functions are omitted by JSON. Do not infer an approved retention policy from this behavior.

Declared contract: [packages/core/src/lib/sync/types.ts:62](../../../../packages/core/src/lib/sync/types.ts).

```ts
interface MutationQueueState {
  queue: QueuedMutation[];
  deadLetterQueue: QueuedMutation[]; // Permanent failures
  isSyncing: boolean;
  addToQueue: (
    mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'idempotencyKey'>,
  ) => Promise<void>;
  removeFromQueue: (id: string) => void;
  moveToDeadLetter: (id: string, reason: string) => void;
  /** Imports recoverable records from a retired local store without rebinding ownership. */
  importDeadLetterMutations: (mutations: QueuedMutation[]) => void;
  restoreDeadLetterMutation: (id: string) => boolean;
  /** Atomically acquires a replay lease; false means another coordinator owns it. */
  tryAcquireMutationLease: (id: string, leaseDurationMs: number, now?: number) => boolean;
  updateMutation: (id: string, updates: Partial<QueuedMutation>) => void;
  clearQueue: () => void;
  clearDeadLetterQueue: () => void;
  /** Explicitly resumes commands after the owning account has a fresh session. */
  resumePausedMutationsForUser: (userId: string) => void;
  setSyncing: (isSyncing: boolean) => void;
  getQueueForUser: (userId?: string) => QueuedMutation[];
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 89 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 101 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 106 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 117 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 121 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 149 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 241 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 300 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 382 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-mobile/src/lib/backgroundSync.ts](../../src/lib/backgroundSync.ts) | 395 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/domain/adapters/academic/academicHexagonalService.ts](../../../gurudevi-web/lib/domain/adapters/academic/academicHexagonalService.ts) | 184 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/domain/adapters/academic/academicHexagonalService.ts](../../../gurudevi-web/lib/domain/adapters/academic/academicHexagonalService.ts) | 241 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/domain/adapters/tuition/tuitionHexagonalService.ts](../../../gurudevi-web/lib/domain/adapters/tuition/tuitionHexagonalService.ts) | 199 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/repositories/academicSubmissionsRepository.ts](../../../gurudevi-web/lib/repositories/academicSubmissionsRepository.ts) | 133 | hook / selected | `useMutationQueue( (s) => s.queue.filter((item) => item.scope === 'classroom').length, )` |
| [apps/gurudevi-web/lib/repositories/academicSubmissionsRepository.ts](../../../gurudevi-web/lib/repositories/academicSubmissionsRepository.ts) | 187 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/repositories/academicSubmissionsRepository.ts](../../../gurudevi-web/lib/repositories/academicSubmissionsRepository.ts) | 235 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/repositories/climateSensingRepository.ts](../../../gurudevi-web/lib/repositories/climateSensingRepository.ts) | 72 | hook / selected | `useMutationQueue( (s) => s.queue.filter((item) => item.scope === 'classroom' && item.name === 'submitClimateSensing') .length, )` |
| [apps/gurudevi-web/lib/repositories/climateSensingRepository.ts](../../../gurudevi-web/lib/repositories/climateSensingRepository.ts) | 135 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/repositories/communityChatRepository.ts](../../../gurudevi-web/lib/repositories/communityChatRepository.ts) | 95 | hook / selected | `useMutationQueue( (s) => s.queue.filter((item) => item.scope === 'community' && item.name === 'sendChatMessage') .length, )` |
| [apps/gurudevi-web/lib/repositories/communityChatRepository.ts](../../../gurudevi-web/lib/repositories/communityChatRepository.ts) | 139 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/repositories/tuitionRepository.ts](../../../gurudevi-web/lib/repositories/tuitionRepository.ts) | 141 | hook / selected | `useMutationQueue( (s) => s.queue.filter((item) => item.scope === 'accounting').length, )` |
| [apps/gurudevi-web/lib/repositories/tuitionRepository.ts](../../../gurudevi-web/lib/repositories/tuitionRepository.ts) | 189 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/workspace/assignmentSubmissions.ts](../../../gurudevi-web/lib/workspace/assignmentSubmissions.ts) | 173 | getState | `useMutationQueue .getState()` |
| [apps/gurudevi-web/lib/workspace/assignmentSubmissions.ts](../../../gurudevi-web/lib/workspace/assignmentSubmissions.ts) | 178 | getState | `useMutationQueue .getState()` |
| [apps/gurudevi-web/lib/workspace/assignmentSubmissions.ts](../../../gurudevi-web/lib/workspace/assignmentSubmissions.ts) | 184 | getState | `useMutationQueue.getState()` |
| [apps/gurudevi-web/lib/workspace/assignmentSubmissions.ts](../../../gurudevi-web/lib/workspace/assignmentSubmissions.ts) | 191 | getState | `useMutationQueue .getState()` |
| [apps/gurudevi-web/lib/workspace/assignmentSubmissions.ts](../../../gurudevi-web/lib/workspace/assignmentSubmissions.ts) | 213 | getState | `useMutationQueue.getState()` |
| [packages/classroom/src/hooks/useClassroomProfile.ts](../../../../packages/classroom/src/hooks/useClassroomProfile.ts) | 14 | hook / selected | `useMutationQueue((state) => state.addToQueue)` |
| [packages/classroom/src/screens/TeacherClassroomDashboard.tsx](../../../../packages/classroom/src/screens/TeacherClassroomDashboard.tsx) | 551 | hook / whole | `useMutationQueue()` |
| [packages/core/src/accounts/accountTransition.ts](../../../../packages/core/src/accounts/accountTransition.ts) | 36 | getState | `useMutationQueue.getState()` |
| [packages/core/src/accounts/accountTransition.ts](../../../../packages/core/src/accounts/accountTransition.ts) | 46 | setState | `useMutationQueue.setState({ isSyncing: false, queue: state.queue.map((command) => ownedByPrincipal(command.userId, request.outgoingPrincipalId) ? { ...command, commandState: 'auth_paused', backoffUntil: undefined, loc...` |
| [packages/core/src/accounts/accountTransition.ts](../../../../packages/core/src/accounts/accountTransition.ts) | 60 | setState | `useMutationQueue.setState({ isSyncing: false, queue: state.queue.filter( (command) => !ownedByPrincipal(command.userId, request.outgoingPrincipalId), ), deadLetterQueue: state.deadLetterQueue.filter( (command) => !own...` |
| [packages/core/src/adapters/powersync/syncData.adapter.ts](../../../../packages/core/src/adapters/powersync/syncData.adapter.ts) | 21 | getState | `useMutationQueue.getState()` |
| [packages/core/src/adapters/powersync/syncData.adapter.ts](../../../../packages/core/src/adapters/powersync/syncData.adapter.ts) | 42 | subscribe | `useMutationQueue.subscribe(() => { const health = readOutboxHealth(this.accountId); this.outboxListeners.forEach((listener) => listener(health)); })` |
| [packages/core/src/adapters/powersync/syncData.adapter.ts](../../../../packages/core/src/adapters/powersync/syncData.adapter.ts) | 85 | getState | `useMutationQueue.getState()` |
| [packages/core/src/hooks/useDeviceSecurity.ts](../../../../packages/core/src/hooks/useDeviceSecurity.ts) | 37 | hook / selected | `useMutationQueue( (s) => s.queue.filter(isQueuedDeviceSecurityMutation).length, )` |
| [packages/core/src/hooks/useSafeMutation.ts](../../../../packages/core/src/hooks/useSafeMutation.ts) | 108 | hook / selected | `useMutationQueue((s) => s.addToQueue)` |
| [packages/core/src/lib/sync/deviceSecurityIntents.ts](../../../../packages/core/src/lib/sync/deviceSecurityIntents.ts) | 47 | getState | `useMutationQueue.getState()` |
| [packages/core/src/lib/sync/hooks/useOptimisticMerge.ts](../../../../packages/core/src/lib/sync/hooks/useOptimisticMerge.ts) | 61 | hook / selected | `useMutationQueue((s) => s.queue)` |
| [packages/core/src/lib/sync/hooks/useSyncStatus.ts](../../../../packages/core/src/lib/sync/hooks/useSyncStatus.ts) | 33 | hook / selected | `useMutationQueue((s) => s.queue.length)` |
| [packages/core/src/lib/sync/hooks/useSyncStatus.ts](../../../../packages/core/src/lib/sync/hooks/useSyncStatus.ts) | 34 | hook / selected | `useMutationQueue((s) => s.isSyncing)` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 56 | hook / whole | `useMutationQueue()` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 398 | getState | `useMutationQueue.getState()` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 77 | setState | `useMutationQueue.setState({ isSyncing: false })` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 87 | persist.rehydrate | `useMutationQueue.persist?.rehydrate?.()` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 59 | getState | `useMutationQueue.getState()` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 60 | getState | `useMutationQueue.getState()` |
| [packages/profile/src/hooks/useProfile.ts](../../../../packages/profile/src/hooks/useProfile.ts) | 69 | hook / selected | `useMutationQueue((s) => s.addToQueue)` |
| [packages/profile/src/hooks/useSchoolProfile.ts](../../../../packages/profile/src/hooks/useSchoolProfile.ts) | 46 | hook / selected | `useMutationQueue((state) => state.addToQueue)` |
| [packages/ui/src/components/NetworkStatusBanner.tsx](../../../../packages/ui/src/components/NetworkStatusBanner.tsx) | 17 | hook / whole | `useMutationQueue()` |
| [packages/ui/src/components/SyncStatusIndicator.tsx](../../../../packages/ui/src/components/SyncStatusIndicator.tsx) | 37 | getState | `useMutationQueue.getState()` |

### useVersionGatingStore

Definition: [packages/core/src/lib/sync/versionGating.ts:53](../../../../packages/core/src/lib/sync/versionGating.ts).

Installed/remote version comparison, hard block, soft nudge, dismissal, bus events.

Review finding: status and isBlocked overlap; manifest facts and dismissal preferences have different lifetimes. Test derivation before considering an actor.

Persistence: `gurudevi-version-gating`; version: false; migrate: false; partialize: false. Options present: `name`, `storage`.

No partialize option: ordinary persist serialization includes serializable state fields; functions are omitted by JSON. Do not infer an approved retention policy from this behavior.

Declared contract: [packages/core/src/lib/sync/versionGating.ts:16](../../../../packages/core/src/lib/sync/versionGating.ts).

```ts
interface VersionGatingState {
  currentInstalledVersion: string;
  status: UpdateSeverity;
  minSupportedVersion: string;
  latestVersion: string;
  updateUrl: string;
  releaseNotes?: string;
  isBlocked: boolean;
  hasDismissedSoftNudge: boolean;
  evaluateVersion: (manifest: RemoteVersionManifest) => UpdateSeverity;
  dismissSoftNudge: () => void;
  setInstalledVersion: (version: string) => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 15 | hook / selected | `useVersionGatingStore((state) => state.isBlocked)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 16 | hook / selected | `useVersionGatingStore((state) => state.status)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 17 | hook / selected | `useVersionGatingStore((state) => state.updateUrl)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 18 | hook / selected | `useVersionGatingStore((state) => state.minSupportedVersion)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 19 | hook / selected | `useVersionGatingStore((state) => state.currentInstalledVersion)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 20 | hook / selected | `useVersionGatingStore((state) => state.releaseNotes)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 21 | hook / selected | `useVersionGatingStore((state) => state.hasDismissedSoftNudge)` |
| [apps/gurudevi-mobile/src/components/AppVersionGateOverlay.tsx](../../src/components/AppVersionGateOverlay.tsx) | 22 | hook / selected | `useVersionGatingStore((state) => state.dismissSoftNudge)` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 75 | getState | `useVersionGatingStore.getState()` |

### usePendingIntentStore

Definition: [packages/core/src/logic/deeplink/pendingIntentStore.ts:45](../../../../packages/core/src/logic/deeplink/pendingIntentStore.ts).

TTL-bounded deep-link intent; get, drain, clear, and legacy deferred_deep_link write-through.

Review finding: Consumers use pendingIntentStore.getState(), not the hook name. Zero hook calls does not imply dead behavior.

Persistence: `PENDING_INTENT_STORAGE_KEY = gurudevi_pending_deep_link_intent`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({ pendingIntent: state.pendingIntent })
```

Declared contract: [packages/core/src/logic/deeplink/pendingIntentStore.ts:25](../../../../packages/core/src/logic/deeplink/pendingIntentStore.ts).

```ts
interface PendingIntentStoreState {
  readonly pendingIntent: PendingDeepLinkIntent | null;
  readonly setPendingIntent: (
    intent: Omit<PendingDeepLinkIntent, 'timestamp'> & { timestamp?: number },
  ) => void;
  readonly getPendingIntent: () => PendingDeepLinkIntent | null;
  readonly drainPendingIntent: () => PendingDeepLinkIntent | null;
  readonly clearPendingIntent: () => void;
  readonly isPendingIntentActive: () => boolean;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/app/+native-intent.tsx](../../app/+native-intent.tsx) | 35 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/app/+native-intent.tsx](../../app/+native-intent.tsx) | 48 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/app/+native-intent.tsx](../../app/+native-intent.tsx) | 72 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/src/entry/SessionRouteGate.tsx](../../src/entry/SessionRouteGate.tsx) | 63 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/src/entry/SessionRouteGate.tsx](../../src/entry/SessionRouteGate.tsx) | 69 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/src/lib/deepLinks/installReferrerBridge.ts](../../src/lib/deepLinks/installReferrerBridge.ts) | 20 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/src/lib/deepLinks/installReferrerBridge.ts](../../src/lib/deepLinks/installReferrerBridge.ts) | 32 | alias.getState | `pendingIntentStore.getState()` |
| [apps/gurudevi-mobile/src/lib/deepLinks/installReferrerBridge.ts](../../src/lib/deepLinks/installReferrerBridge.ts) | 50 | alias.getState | `pendingIntentStore.getState()` |

### useProvisionalWorkspaceQueue

Definition: [packages/core/src/logic/workspace/provisionalWorkspace.ts:57](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts).

Principal-bound commercial/guardian provisioning requests; claim, receipt-check, reject and reconcile.

Review finding: Dispatch interruption and server receipt/idempotency are actual requirements. A local request must never authorize a workspace.

Persistence: `gurudevi-provisional-workspace-queue`; version: true; migrate: true; partialize: false. Options present: `name`, `storage`, `version`, `migrate`.

No partialize option: ordinary persist serialization includes serializable state fields; functions are omitted by JSON. Do not infer an approved retention policy from this behavior.

Declared contract: [packages/core/src/logic/workspace/provisionalWorkspace.ts:39](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts).

```ts
interface ProvisionalWorkspaceQueueState {
  readonly commands: readonly ProvisionalWorkspaceCommand[];
  enqueue: (command: ProvisionalWorkspaceCommand) => void;
  claim: (id: string, principalId: string) => boolean;
  resolve: (
    id: string,
    principalId: string,
    perspective: CommercialPerspective | GuardianBondPerspective,
  ) => void;
  reject: (id: string, principalId: string, error: string) => void;
  recoverInterrupted: (principalId: string) => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 340 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 395 | getState | `useProvisionalWorkspaceQueue .getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 152 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 169 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 185 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 186 | getState | `useProvisionalWorkspaceQueue .getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 200 | setState | `useProvisionalWorkspaceQueue.setState((state) => ({ commands: state.commands.map((candidate) => candidate.id === command.id ? { ...candidate, status: 'queued' as const } : candidate, ), }))` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 207 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 214 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 217 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 232 | getState | `useProvisionalWorkspaceQueue.getState()` |
| [packages/core/src/logic/workspace/provisionalWorkspace.ts](../../../../packages/core/src/logic/workspace/provisionalWorkspace.ts) | 233 | getState | `useProvisionalWorkspaceQueue.getState()` |

### useScopeSessionStore

Definition: [packages/core/src/store/scopeSession.ts:122](../../../../packages/core/src/store/scopeSession.ts).

Canonical active principal, perspective, bond and tenant snapshot; transition/error state.

Review finding: Coordinator still writes Auth/Tenant/Perspective mirrors. Single supported writer is progress; four materialized representations remain.

Persistence: no persist middleware in this declaration. Other authorities or snapshots may still be durable.

Declared contract: [packages/core/src/store/scopeSession.ts:22](../../../../packages/core/src/store/scopeSession.ts).

```ts
interface ScopeSessionState {
  readonly snapshot: ScopeSessionSnapshot | null;
  readonly isTransitioning: boolean;
  beginTransition: () => void;
  commit: (snapshot: ScopeSessionSnapshot) => void;
  abortTransition: () => void;
  clear: () => void;
}
```

Snapshot contract and validation: [packages/core/src/store/scopeSession.ts](../../../../packages/core/src/store/scopeSession.ts). Transition writes and rollback: [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts).

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/classroom/src/hooks/useScopedAttendanceRegister.ts](../../../../packages/classroom/src/hooks/useScopedAttendanceRegister.ts) | 68 | hook / selected | `useScopeSessionStore((state) => state.snapshot)` |
| [packages/classroom/src/hooks/useScopedAttendanceRegister.ts](../../../../packages/classroom/src/hooks/useScopedAttendanceRegister.ts) | 69 | hook / selected | `useScopeSessionStore((state) => state.isTransitioning)` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 283 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 32 | hook / selected | `useScopeSessionStore((state) => state.snapshot)` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 33 | hook / selected | `useScopeSessionStore((state) => state.isTransitioning)` |
| [packages/core/src/hooks/useScopedDeviceSecurity.ts](../../../../packages/core/src/hooks/useScopedDeviceSecurity.ts) | 58 | hook / selected | `useScopeSessionStore((state) => state.snapshot)` |
| [packages/core/src/hooks/useScopedDeviceSecurity.ts](../../../../packages/core/src/hooks/useScopedDeviceSecurity.ts) | 59 | hook / selected | `useScopeSessionStore((state) => state.isTransitioning)` |
| [packages/core/src/hooks/useScopedNotifications.ts](../../../../packages/core/src/hooks/useScopedNotifications.ts) | 172 | hook / selected | `useScopeSessionStore((state) => state.snapshot)` |
| [packages/core/src/hooks/useScopedNotifications.ts](../../../../packages/core/src/hooks/useScopedNotifications.ts) | 173 | hook / selected | `useScopeSessionStore((state) => state.isTransitioning)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 58 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSession.ts](../../../../packages/core/src/store/scopeSession.ts) | 137 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSession.ts](../../../../packages/core/src/store/scopeSession.ts) | 151 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 72 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 77 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 109 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 119 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 144 | getState | `useScopeSessionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 224 | getState | `useScopeSessionStore.getState()` |

### useActiveSubTabsStore

Definition: [packages/core/src/store/useActiveSubTabsStore.ts:246](../../../../packages/core/src/store/useActiveSubTabsStore.ts).

Domain workbench task descriptors, focus, pinned features, chrome and navigation preferences.

Review finding: Contains real task identity/capacity/eviction semantics. Do not replace the whole model with independent MMKV keys; classify routing facts and preferences separately.

Persistence: `gurudevi-active-subtabs-storage`; version: true; migrate: true; partialize: true. Options present: `name`, `storage`, `version`, `migrate`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        tabsByDomain: state.tabsByDomain,
        activeTabByDomain: state.activeTabByDomain,
        pinnedFeatureIdsByDomain: state.pinnedFeatureIdsByDomain,
        preferences: state.preferences,
      })
```

Declared contract: [packages/core/src/store/useActiveSubTabsStore.ts:59](../../../../packages/core/src/store/useActiveSubTabsStore.ts).

```ts
interface ActiveSubTabsState {
  tabsByDomain: Record<string, ActiveSubTabItem[]>;
  activeTabByDomain: Record<string, string>;
  pinnedFeatureIdsByDomain: Record<string, string[]>;
  preferences: NavigationPreferences;
  isChromeVisible: boolean;
  openTab: (tab: ActiveSubTabInput) => void;
  closeTab: (domain: ActiveSubTabDomain, tabId: string) => ActiveSubTabCloseResult;
  setActiveTab: (domain: ActiveSubTabDomain, tabId: string) => void;
  reorderTab: (domain: ActiveSubTabDomain, tabId: string, destinationIndex: number) => void;
  clearTabs: (domain?: ActiveSubTabDomain) => void;
  togglePinFeature: (domain: string, featureId: string) => void;
  isFeaturePinned: (domain: string, featureId: string) => boolean;
  reorderPinnedFeatures: (domain: string, featureIds: string[]) => void;
  setChromeVisible: (visible: boolean) => void;
  updatePreferences: (updates: Partial<NavigationPreferences>) => void;
  resetPreferences: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 434 | hook / selected | `useActiveSubTabsStore( (s) => s.tabsByDomain[currentDomain] ?? EMPTY_DOMAIN_TABS, )` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 437 | hook / selected | `useActiveSubTabsStore((s) => s.preferences.showActiveSubTabs)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 438 | hook / selected | `useActiveSubTabsStore((s) => s.preferences.headerStyle)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 439 | hook / selected | `useActiveSubTabsStore((s) => s.preferences.autoHideChromeOnScroll)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 440 | hook / selected | `useActiveSubTabsStore((s) => s.isChromeVisible)` |
| [apps/gurudevi-mobile/src/components/navigation/TabFeatureCatalogSheet.tsx](../../src/components/navigation/TabFeatureCatalogSheet.tsx) | 46 | hook / selected | `useActiveSubTabsStore((s) => s.openTab)` |
| [apps/gurudevi-mobile/src/components/navigation/TabFeatureCatalogSheet.tsx](../../src/components/navigation/TabFeatureCatalogSheet.tsx) | 47 | hook / selected | `useActiveSubTabsStore((s) => s.preferences)` |
| [apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts](../../src/hooks/useSelfCanvas.ts) | 53 | hook / selected | `useActiveSubTabsStore((state) => state.openTab)` |
| [apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts](../../src/hooks/useSelfCanvas.ts) | 54 | hook / selected | `useActiveSubTabsStore((state) => state.pinnedFeatureIdsByDomain.self \|\| [])` |
| [apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts](../../src/hooks/useSelfCanvas.ts) | 55 | hook / selected | `useActiveSubTabsStore((state) => state.togglePinFeature)` |
| [apps/gurudevi-mobile/src/hooks/useTrackActiveSubTab.ts](../../src/hooks/useTrackActiveSubTab.ts) | 12 | hook / selected | `useActiveSubTabsStore((s) => s.openTab)` |
| [packages/ui/src/components/ActiveSubTabStrip.tsx](../../../../packages/ui/src/components/ActiveSubTabStrip.tsx) | 200 | hook / selected | `useActiveSubTabsStore((state) => state.tabsByDomain[domain] ?? EMPTY_TABS)` |
| [packages/ui/src/components/ActiveSubTabStrip.tsx](../../../../packages/ui/src/components/ActiveSubTabStrip.tsx) | 201 | hook / selected | `useActiveSubTabsStore((state) => state.activeTabByDomain[domain] \|\| '')` |
| [packages/ui/src/components/ActiveSubTabStrip.tsx](../../../../packages/ui/src/components/ActiveSubTabStrip.tsx) | 202 | hook / selected | `useActiveSubTabsStore((state) => state.preferences.showActiveSubTabs)` |
| [packages/ui/src/components/ActiveSubTabStrip.tsx](../../../../packages/ui/src/components/ActiveSubTabStrip.tsx) | 203 | hook / selected | `useActiveSubTabsStore((state) => state.setActiveTab)` |
| [packages/ui/src/components/ActiveSubTabStrip.tsx](../../../../packages/ui/src/components/ActiveSubTabStrip.tsx) | 204 | hook / selected | `useActiveSubTabsStore((state) => state.closeTab)` |
| [packages/ui/src/components/ActiveSubTabStrip.tsx](../../../../packages/ui/src/components/ActiveSubTabStrip.tsx) | 205 | hook / selected | `useActiveSubTabsStore((state) => state.reorderTab)` |
| [packages/ui/src/hooks/useScrollChromeCollapser.ts](../../../../packages/ui/src/hooks/useScrollChromeCollapser.ts) | 19 | hook / selected | `useActiveSubTabsStore((s) => s.preferences.autoHideChromeOnScroll)` |
| [packages/ui/src/hooks/useScrollChromeCollapser.ts](../../../../packages/ui/src/hooks/useScrollChromeCollapser.ts) | 20 | hook / selected | `useActiveSubTabsStore((s) => s.isChromeVisible)` |
| [packages/ui/src/hooks/useScrollChromeCollapser.ts](../../../../packages/ui/src/hooks/useScrollChromeCollapser.ts) | 21 | hook / selected | `useActiveSubTabsStore((s) => s.setChromeVisible)` |
| [packages/ui/src/screens/AppSettingsScreen.shared.tsx](../../../../packages/ui/src/screens/AppSettingsScreen.shared.tsx) | 69 | hook / selected | `useActiveSubTabsStore((s) => s.preferences)` |
| [packages/ui/src/screens/AppSettingsScreen.shared.tsx](../../../../packages/ui/src/screens/AppSettingsScreen.shared.tsx) | 70 | hook / selected | `useActiveSubTabsStore((s) => s.updatePreferences)` |

### useAuthStore

Definition: [packages/core/src/store/useAuthStore.ts:14](../../../../packages/core/src/store/useAuthStore.ts).

Session and profile alongside onboarding, demo/explore mode, network, toast and hydration flags.

Review finding: This is mixed ownership, not a clean authentication domain. Snapshot/account acquisition, transient notifications and network observations should be challenged separately.

Persistence: `gurudevi-auth-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`, `onRehydrateStorage`.

Persisted projection:

```ts
partialize: (state) => ({
        userName: state.userName,
        user: state.user,
        onboardingCompleted: state.onboardingCompleted,
        isExplorerMode: state.isExplorerMode,
        dismissedSampleIds: state.dismissedSampleIds,
      })
```

Declared contract: [packages/core/src/store/slices/auth.slice.ts:8](../../../../packages/core/src/store/slices/auth.slice.ts).

```ts
interface AuthSlice {
  // Sovereign Identity (ReBAC)
  activePerspective: Perspective | null;
  activeBond: Bond | null;
  availableBonds: Bond[];
  setPerspective: (perspective: Perspective | null) => void;
  setAvailableBonds: (bonds: Bond[]) => void;

  // Profile & User
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;

  // Auth Session
  authSession: AuthSession | null;
  authSessionResolved: boolean;
  setAuthSession: (session: AuthSession | null) => void;
  setAuthSessionResolved: (resolved: boolean) => void;

  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  justFinishedOnboarding: boolean;
  setJustFinishedOnboarding: (justFinished: boolean) => void;

  // Modes & Misc
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
  isExplorerMode: boolean;
  setExplorerMode: (isExplorer: boolean) => void;
  isBridging: boolean;
  setBridging: (isBridging: boolean) => void;
  dismissedSampleIds: string[];
  dismissSample: (id: string) => void;
  demoLogs: Array<{
    module: string;
    method: string;
    payload: unknown;
    timestamp: number;
  }>;
  addDemoLog: (log: { module: string; method: string; payload: unknown }) => void;
  clearDemoLogs: () => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  } | null;
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  hideToast: () => void;

  // DEPRECATED fields removed

  // ── Hydration Gate (Fix 6: Race Condition) ───────────────────────────────
  // This flag is set to `true` by Zustand's `onRehydrateStorage` callback
  // in useAuthStore.ts AFTER all persisted state has been restored from MMKV.
  //
  // WHY: There is a window during app bootstrap where Zustand stores are
  // in-flight (reading from MMKV). If components render in this window,
  // `usePermissions` evaluates with empty `bonds: []` — causing
  // "flash of unauthorized" or incorrect redirects to the onboarding flow.
  //
  // The SanctuaryProvider checks this flag in AssetLoaderWatcher and keeps
  // the loading spinner until `isStoreHydrated === true`.
  isStoreHydrated: boolean;
  setStoreHydrated: (hydrated: boolean) => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/entry/GuestLeaseBoundary.tsx](../../src/entry/GuestLeaseBoundary.tsx) | 12 | hook / selected | `useAuthStore((state) => state.user)` |
| [apps/gurudevi-mobile/src/entry/GuestPersistenceNotice.tsx](../../src/entry/GuestPersistenceNotice.tsx) | 19 | hook / selected | `useAuthStore((state) => state.user)` |
| [apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts](../../src/hooks/useSelfCanvas.ts) | 48 | hook / selected | `useAuthStore((state) => state.user)` |
| [apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts](../../src/hooks/useSelfCanvas.ts) | 49 | hook / selected | `useAuthStore((state) => state.availableBonds)` |
| [apps/gurudevi-mobile/src/lib/inngestEvents.ts](../../src/lib/inngestEvents.ts) | 88 | getState | `useAuthStore.getState()` |
| [packages/admin/src/screens/PrincipalDashboard.web.tsx](../../../../packages/admin/src/screens/PrincipalDashboard.web.tsx) | 173 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/ai/src/screens/AIAssistantScreen.web.tsx](../../../../packages/ai/src/screens/AIAssistantScreen.web.tsx) | 30 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/components/student/StudentGradesOverview.tsx](../../../../packages/classroom/src/components/student/StudentGradesOverview.tsx) | 36 | hook / selected | `useAuthStore((state) => state.isExplorerMode)` |
| [packages/classroom/src/components/student/StudentGradesOverview.tsx](../../../../packages/classroom/src/components/student/StudentGradesOverview.tsx) | 37 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useClassroomRoleData.ts](../../../../packages/classroom/src/hooks/useClassroomRoleData.ts) | 37 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useClassroomRoleData.ts](../../../../packages/classroom/src/hooks/useClassroomRoleData.ts) | 40 | hook / selected | `useAuthStore((state) => state.setUser)` |
| [packages/classroom/src/hooks/useStudentDashboardHooks.ts](../../../../packages/classroom/src/hooks/useStudentDashboardHooks.ts) | 17 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useStudentDashboardHooks.ts](../../../../packages/classroom/src/hooks/useStudentDashboardHooks.ts) | 34 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 15 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 32 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 54 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 84 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/screens/AttendanceScreen.web.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.web.tsx) | 128 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/screens/ClassroomScreen.web.tsx](../../../../packages/classroom/src/screens/ClassroomScreen.web.tsx) | 24 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/screens/GradebookScreen.web.tsx](../../../../packages/classroom/src/screens/GradebookScreen.web.tsx) | 251 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/screens/NoSchoolView.web.tsx](../../../../packages/classroom/src/screens/NoSchoolView.web.tsx) | 161 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/screens/NoSchoolView.web.tsx](../../../../packages/classroom/src/screens/NoSchoolView.web.tsx) | 202 | getState | `useAuthStore.getState()` |
| [packages/classroom/src/screens/NoSchoolView.web.tsx](../../../../packages/classroom/src/screens/NoSchoolView.web.tsx) | 383 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/screens/NoSchoolView.web.tsx](../../../../packages/classroom/src/screens/NoSchoolView.web.tsx) | 442 | getState | `useAuthStore.getState()` |
| [packages/classroom/src/screens/TimetableScreen.web.tsx](../../../../packages/classroom/src/screens/TimetableScreen.web.tsx) | 33 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts](../../../../packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts) | 32 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/classroom/src/workspace/useStudentWorkspaceData.ts](../../../../packages/classroom/src/workspace/useStudentWorkspaceData.ts) | 17 | hook / selected | `useAuthStore((state) => state.isExplorerMode)` |
| [packages/classroom/src/workspace/useStudentWorkspaceData.ts](../../../../packages/classroom/src/workspace/useStudentWorkspaceData.ts) | 18 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/community/src/screens/CommunityScreen.tsx](../../../../packages/community/src/screens/CommunityScreen.tsx) | 188 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/community/src/screens/CommunityScreen.web.tsx](../../../../packages/community/src/screens/CommunityScreen.web.tsx) | 123 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/community/src/screens/DirectMessageScreen.tsx](../../../../packages/community/src/screens/DirectMessageScreen.tsx) | 25 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/community/src/screens/DirectMessageScreen.web.tsx](../../../../packages/community/src/screens/DirectMessageScreen.web.tsx) | 40 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/community/src/screens/GroupChatScreen.web.tsx](../../../../packages/community/src/screens/GroupChatScreen.web.tsx) | 41 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 213 | getState | `useAuthStore.getState()` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 433 | getState | `useAuthStore.getState()` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 454 | getState | `useAuthStore.getState()` |
| [packages/core/src/api/hooks/comment.hooks.ts](../../../../packages/core/src/api/hooks/comment.hooks.ts) | 17 | hook / selected | `useAuthStore((state) => state.activeBond)` |
| [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 84 | hook / selected | `useAuthStore((state) => state.activeBond)` |
| [packages/core/src/api/hooks/poll.hooks.ts](../../../../packages/core/src/api/hooks/poll.hooks.ts) | 18 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/core/src/hooks/useDeviceSecurity.ts](../../../../packages/core/src/hooks/useDeviceSecurity.ts) | 24 | hook / selected | `useAuthStore((state) => state.user?.id ?? null)` |
| [packages/core/src/hooks/useIsGuest.ts](../../../../packages/core/src/hooks/useIsGuest.ts) | 8 | hook / selected | `useAuthStore((s) => !s.user)` |
| [packages/core/src/hooks/useLocalFirstQuery.ts](../../../../packages/core/src/hooks/useLocalFirstQuery.ts) | 45 | hook / selected | `useAuthStore((s) => s.user)` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 46 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 47 | hook / selected | `useAuthStore((state) => state.availableBonds)` |
| [packages/core/src/hooks/useRewards.ts](../../../../packages/core/src/hooks/useRewards.ts) | 21 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/core/src/hooks/useSafeMutation.ts](../../../../packages/core/src/hooks/useSafeMutation.ts) | 107 | hook / selected | `useAuthStore((s) => s.showToast)` |
| [packages/core/src/hooks/useSafeMutation.ts](../../../../packages/core/src/hooks/useSafeMutation.ts) | 122 | getState | `useAuthStore.getState()` |
| [packages/core/src/hooks/useSanctuaryVisitor.ts](../../../../packages/core/src/hooks/useSanctuaryVisitor.ts) | 28 | hook / selected | `useAuthStore((state) => state.authSession)` |
| [packages/core/src/hooks/useSanctuaryVisitor.ts](../../../../packages/core/src/hooks/useSanctuaryVisitor.ts) | 29 | hook / selected | `useAuthStore((state) => state.onboardingCompleted)` |
| [packages/core/src/hooks/useScopedNotifications.ts](../../../../packages/core/src/hooks/useScopedNotifications.ts) | 174 | hook / selected | `useAuthStore((state) => state.isExplorerMode)` |
| [packages/core/src/hooks/useScopedNotifications.ts](../../../../packages/core/src/hooks/useScopedNotifications.ts) | 175 | hook / selected | `useAuthStore((state) => Boolean(state.user?.is_anonymous))` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 46 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 47 | hook / selected | `useAuthStore((state) => state.activeBond)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 57 | getState | `useAuthStore.getState()` |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 59 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 60 | setState | `useAuthStore.setState(authScopedDefaults)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 82 | persist.rehydrate | `useAuthStore.persist?.rehydrate?.()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 73 | getState | `useAuthStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 94 | setState | `useAuthStore.setState({ activePerspective: authPerspectiveMirror(next), activeBond: next.activeBond, availableBonds: [...next.availableBonds], })` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 136 | setState | `useAuthStore.setState({ activePerspective: previousAuth.activePerspective, activeBond: previousAuth.activeBond, availableBonds: previousAuth.availableBonds, })` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 238 | setState | `useAuthStore.setState({ activePerspective: null, activeBond: null, availableBonds: [] })` |
| [packages/core/src/store/useAuthStore.ts](../../../../packages/core/src/store/useAuthStore.ts) | 34 | getState | `useAuthStore.getState()` |
| [packages/core/src/store/usePerspectiveStore.ts](../../../../packages/core/src/store/usePerspectiveStore.ts) | 176 | getState | `useAuthStore.getState()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 33 | hook / whole | `useAuthStore()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 59 | getState | `useAuthStore.getState()` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 19 | setState | `useAuthStore.setState({ isOnline })` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 23 | setState | `useAuthStore.setState({ user: { id: 'guest', email: null, is_anonymous: true, user_metadata: { display_name: 'Guest Explorer' }, app_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:00.000Z', } as any...` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 39 | setState | `useAuthStore.setState({ user: { id: userId, email: 'user@example.com', is_anonymous: false, user_metadata: { display_name: 'Authenticated User' }, app_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:...` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 62 | setState | `useAuthStore.setState({ isOnline: true })` |
| [packages/library/src/hooks/useLibrary.ts](../../../../packages/library/src/hooks/useLibrary.ts) | 39 | hook / selected | `useAuthStore((state) => state.isDemoMode)` |
| [packages/library/src/screens/CollectionDetailScreen.tsx](../../../../packages/library/src/screens/CollectionDetailScreen.tsx) | 51 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/library/src/screens/CollectionDetailScreen.web.tsx](../../../../packages/library/src/screens/CollectionDetailScreen.web.tsx) | 526 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/library/src/screens/ReaderScreen.tsx](../../../../packages/library/src/screens/ReaderScreen.tsx) | 70 | hook / selected | `useAuthStore((s) => s.user)` |
| [packages/library/src/screens/ResourceHubScreen.tsx](../../../../packages/library/src/screens/ResourceHubScreen.tsx) | 155 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/library/src/screens/ResourceHubScreen.tsx](../../../../packages/library/src/screens/ResourceHubScreen.tsx) | 156 | hook / selected | `useAuthStore((state) => state.isOnline)` |
| [packages/profile/src/hooks/useProfile.ts](../../../../packages/profile/src/hooks/useProfile.ts) | 64 | hook / selected | `useAuthStore((s) => s.user)` |
| [packages/profile/src/hooks/useProfileHistory.ts](../../../../packages/profile/src/hooks/useProfileHistory.ts) | 38 | hook / selected | `useAuthStore((s) => s.user)` |
| [packages/profile/src/hooks/useSocialLinks.ts](../../../../packages/profile/src/hooks/useSocialLinks.ts) | 48 | hook / selected | `useAuthStore((s) => s.user)` |
| [packages/profile/src/screens/FullProfileScreen.tsx](../../../../packages/profile/src/screens/FullProfileScreen.tsx) | 71 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/profile/src/screens/FullProfileScreen.web.tsx](../../../../packages/profile/src/screens/FullProfileScreen.web.tsx) | 44 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/profile/src/screens/ProfileScreen.web.tsx](../../../../packages/profile/src/screens/ProfileScreen.web.tsx) | 46 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/self/src/features/selfCanvasStore.ts](../../../../packages/self/src/features/selfCanvasStore.ts) | 69 | getState | `useAuthStore.getState()` |
| [packages/ui/src/components/DeviceSecurityCenter.tsx](../../../../packages/ui/src/components/DeviceSecurityCenter.tsx) | 148 | hook / selected | `useAuthStore((state) => state.isOnline)` |
| [packages/ui/src/components/SandboxBanner.tsx](../../../../packages/ui/src/components/SandboxBanner.tsx) | 13 | hook / selected | `useAuthStore((state) => state.isDemoMode)` |
| [packages/ui/src/components/WebScreenHeader.web.tsx](../../../../packages/ui/src/components/WebScreenHeader.web.tsx) | 27 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/ui/src/context/EnvironmentContext.tsx](../../../../packages/ui/src/context/EnvironmentContext.tsx) | 41 | hook / selected | `useAuthStore((state: any) => state.user)` |
| [packages/ui/src/hooks/useDemoBridge.ts](../../../../packages/ui/src/hooks/useDemoBridge.ts) | 14 | hook / selected | `useAuthStore((state) => state.demoLogs)` |
| [packages/ui/src/hooks/useDemoBridge.ts](../../../../packages/ui/src/hooks/useDemoBridge.ts) | 15 | hook / selected | `useAuthStore((state) => state.clearDemoLogs)` |
| [packages/ui/src/hooks/useDemoBridge.ts](../../../../packages/ui/src/hooks/useDemoBridge.ts) | 16 | hook / selected | `useAuthStore((state) => state.setDemoMode)` |
| [packages/ui/src/hooks/useDemoBridge.ts](../../../../packages/ui/src/hooks/useDemoBridge.ts) | 67 | getState | `useAuthStore.getState()` |
| [packages/ui/src/hooks/useDemoBridge.ts](../../../../packages/ui/src/hooks/useDemoBridge.ts) | 103 | getState | `useAuthStore.getState()` |
| [packages/ui/src/screens/NotificationsScreen.web.tsx](../../../../packages/ui/src/screens/NotificationsScreen.web.tsx) | 169 | hook / selected | `useAuthStore((state) => state.user)` |
| [packages/ui/src/screens/NotificationsScreen.web.tsx](../../../../packages/ui/src/screens/NotificationsScreen.web.tsx) | 170 | hook / selected | `useAuthStore((state) => state.isOnline)` |

### useCedarDecisionStore

Definition: [packages/core/src/store/useCedarDecisionStore.ts:42](../../../../packages/core/src/store/useCedarDecisionStore.ts).

Loads and verifies local permission snapshots; principal/scope, signature, policy version, expiry and safe denial.

Review finding: Security validation belongs in a dedicated verified read boundary regardless of which hook observes it. Replacing the cache must not weaken verification or cancellation.

Persistence: no persist middleware in this declaration. Other authorities or snapshots may still be durable.

Declared contract: [packages/core/src/store/useCedarDecisionStore.ts:28](../../../../packages/core/src/store/useCedarDecisionStore.ts).

```ts
interface CedarDecisionState {
  decisions: DecisionMap | null;
  snapshotLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  snapshotScopeId: string | null;

  loadDecisions: (userId: string, scopeId?: string | null) => Promise<void>;

  getDecision: (subject: string, action: string) => CedarDecision;

  clearDecisions: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx](../../app/%28tabs%29/workspace/index.tsx) | 20 | hook / selected | `useCedarDecisionStore((state) => state.isLoading)` |
| [apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx](../../app/%28tabs%29/workspace/index.tsx) | 21 | hook / selected | `useCedarDecisionStore((state) => state.error)` |
| [apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx](../../app/%28tabs%29/workspace/index.tsx) | 22 | hook / selected | `useCedarDecisionStore((state) => state.snapshotLoaded)` |
| [apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx](../../app/%28tabs%29/workspace/index.tsx) | 23 | hook / selected | `useCedarDecisionStore((state) => state.loadDecisions)` |
| [apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx](../../app/%28tabs%29/workspace/principal.tsx) | 12 | hook / selected | `useCedarDecisionStore((state: any) => state.isLoading)` |
| [packages/core/src/hooks/useFeatureRegistry.ts](../../../../packages/core/src/hooks/useFeatureRegistry.ts) | 26 | hook / selected | `useCedarDecisionStore((s) => s.snapshotLoaded)` |
| [packages/core/src/hooks/useFeatureRegistry.ts](../../../../packages/core/src/hooks/useFeatureRegistry.ts) | 27 | hook / selected | `useCedarDecisionStore((s) => s.getDecision)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 51 | hook / selected | `useCedarDecisionStore((state) => state.snapshotLoaded)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 52 | hook / selected | `useCedarDecisionStore((state) => state.getDecision)` |
| [packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts](../../../../packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts) | 25 | hook / selected | `useCedarDecisionStore((s) => s.snapshotLoaded)` |
| [packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts](../../../../packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts) | 26 | hook / selected | `useCedarDecisionStore((s) => s.getDecision)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 59 | getState | `useCedarDecisionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 81 | getState | `useCedarDecisionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 103 | getState | `useCedarDecisionStore .getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 146 | getState | `useCedarDecisionStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 225 | getState | `useCedarDecisionStore.getState()` |
| [packages/core/src/store/usePerspectiveStore.ts](../../../../packages/core/src/store/usePerspectiveStore.ts) | 162 | getState | `useCedarDecisionStore.getState()` |
| [packages/core/src/store/usePerspectiveStore.ts](../../../../packages/core/src/store/usePerspectiveStore.ts) | 183 | getState | `useCedarDecisionStore.getState()` |
| [packages/core/src/store/usePerspectiveStore.ts](../../../../packages/core/src/store/usePerspectiveStore.ts) | 198 | getState | `useCedarDecisionStore.getState()` |

### useConflictStore

Definition: [packages/core/src/store/useConflictStore.ts:38](../../../../packages/core/src/store/useConflictStore.ts).

Active data conflicts plus bounded resolved history; resolution emits bus events.

Review finding: Two whole-state UI consumers exist. Durable local/remote payload retention and account binding need explicit review.

Persistence: `gurudevi-conflict-store`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        activeConflicts: state.activeConflicts,
        resolvedConflicts: state.resolvedConflicts,
      })
```

Declared contract: [packages/core/src/store/useConflictStore.ts:17](../../../../packages/core/src/store/useConflictStore.ts).

```ts
interface ConflictStore {
  activeConflicts: DataConflict[];
  resolvedConflicts: DataConflict[]; // Ring buffer for audit — last 50
  addConflict: (conflict: DataConflict) => void;
  resolveConflict: (id: string, resolution: DataConflict['resolution']) => void;
  clearConflicts: () => void;
  clearResolved: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/classroom/src/screens/TeacherClassroomDashboard.tsx](../../../../packages/classroom/src/screens/TeacherClassroomDashboard.tsx) | 550 | hook / whole | `useConflictStore()` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 58 | hook / whole | `useConflictStore()` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 61 | setState | `useConflictStore.setState({ activeConflicts: [] })` |

### useConsentStore

Definition: [packages/core/src/store/useConsentStore.ts:12](../../../../packages/core/src/store/useConsentStore.ts).

Device consent decision and analytics permission; grant and deny.

Review finding: Two booleans encode a small finite value; direct persisted preference is a candidate, with a migration and explicit consent semantics.

Persistence: `gurudevi-pdpa-consent-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        hasDecidedConsent: state.hasDecidedConsent,
        analyticsConsentGranted: state.analyticsConsentGranted,
      })
```

Declared contract: [packages/core/src/store/useConsentStore.ts:5](../../../../packages/core/src/store/useConsentStore.ts).

```ts
interface ConsentState {
  hasDecidedConsent: boolean;
  analyticsConsentGranted: boolean;
  grantConsent: () => void;
  denyConsent: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/components/PDPAConsentModal.tsx](../../src/components/PDPAConsentModal.tsx) | 14 | hook / whole | `useConsentStore()` |

### useDraftsStore

Definition: [packages/core/src/store/useDraftsStore.ts:24](../../../../packages/core/src/store/useDraftsStore.ts).

Generic timestamped draft map; set/get/delete/clear.

Review finding: No direct production calls or imports found beyond barrel exports/registry. This is a dormancy candidate, not authorization to delete stored user work.

Persistence: `gurudevi-drafts-storage`; version: false; migrate: false; partialize: false. Options present: `name`, `storage`.

No partialize option: ordinary persist serialization includes serializable state fields; functions are omitted by JSON. Do not infer an approved retention policy from this behavior.

Declared contract: [packages/core/src/store/useDraftsStore.ts:10](../../../../packages/core/src/store/useDraftsStore.ts).

```ts
interface DraftsState {
  drafts: Record<string, DraftEntry>;
  setDraft: <T>(key: string, data: T) => void;
  getDraft: <T>(key: string) => T | null;
  clearDraft: (key: string) => void;
  clearAllDrafts: () => void;
}
```

No statically identified production call. Check exports, import-side effects, stored data and test-only consumers before retirement.

### useEntitlementStore

Definition: [packages/core/src/store/useEntitlementStore.ts:59](../../../../packages/core/src/store/useEntitlementStore.ts).

Commercial entitlement snapshot, pricing, readiness/freshness and async adapter loading.

Review finding: Remote read cache plus offline continuity rules. Inspect principal AND bond on failure; a fresh same-principal snapshot is not automatically valid for a different bond.

Persistence: `gurudevi-entitlement-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`, `onRehydrateStorage`.

Persisted projection:

```ts
partialize: (state) => ({
        activeEntitlements: state.activeEntitlements,
        grants: state.grants,
        pricingTier: state.pricingTier,
        manifestLoaded: state.manifestLoaded,
        readiness: state.readiness,
        snapshotRefreshedAt: state.snapshotRefreshedAt,
        snapshotUserId: state.snapshotUserId,
        snapshotActiveBondId: state.snapshotActiveBondId,
      })
```

Declared contract: [packages/core/src/store/useEntitlementStore.ts:15](../../../../packages/core/src/store/useEntitlementStore.ts).

```ts
interface EntitlementState {
  activeEntitlements: string[];
  grants: EntitlementGrant[];
  pricingTier: 'FREE' | 'PRO' | 'INSTITUTIONAL';
  manifestLoaded: boolean;
  readiness: EntitlementReadiness;
  snapshotRefreshedAt: string | null;
  snapshotUserId: string | null;
  snapshotActiveBondId: string | null;
  isLoading: boolean;
  error: string | null;

  loadEntitlements: (userId: string, scope?: EntitlementScopeContext) => Promise<void>;

  clearEntitlements: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts](../../src/entry/bootstrapRouteState.ts) | 129 | hook / whole | `useEntitlementStore()` |
| [packages/core/src/hooks/useFeatureRegistry.ts](../../../../packages/core/src/hooks/useFeatureRegistry.ts) | 29 | hook / whole | `useEntitlementStore()` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 54 | hook / whole | `useEntitlementStore()` |
| [packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts](../../../../packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts) | 28 | hook / whole | `useEntitlementStore()` |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 61 | hook / selected | `useEntitlementStore((state) => state.loadEntitlements)` |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 62 | hook / selected | `useEntitlementStore((state) => state.clearEntitlements)` |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 63 | hook / selected | `useEntitlementStore((state) => state.error)` |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 64 | hook / selected | `useEntitlementStore((state) => state.isLoading)` |
| [packages/core/src/store/useEntitlementStore.ts](../../../../packages/core/src/store/useEntitlementStore.ts) | 158 | setState | `useEntitlementStore.setState({ manifestLoaded: fresh, readiness: fresh ? 'cached' : 'stale', })` |

### useFeatureStore

Definition: [packages/core/src/store/useFeatureStore.ts:11](../../../../packages/core/src/store/useFeatureStore.ts).

Resolved feature flags and rollout snapshot; freshness policy and applied defaults.

Review finding: Keep rollout metadata separate from authorization. Persisted flags and snapshot duplicate derived data; classify before moving lifecycle ownership.

Persistence: `gurudevi-feature-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `onRehydrateStorage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({ flags: state.flags, snapshot: state.snapshot })
```

Declared contract: [packages/core/src/store/slices/feature.slice.ts:9](../../../../packages/core/src/store/slices/feature.slice.ts).

```ts
interface FeatureSlice {
  flags: FeatureFlags;
  snapshot: FeatureRolloutSnapshot | null;

  applySnapshot: (snapshot: FeatureRolloutSnapshot) => void;

  recomputeFlags: (context: UserContext) => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/lib/fetchFn.ts](../../src/lib/fetchFn.ts) | 40 | getState | `useFeatureStore.getState()` |
| [apps/gurudevi-mobile/src/lib/fetchFn.ts](../../src/lib/fetchFn.ts) | 49 | getState | `useFeatureStore.getState()` |
| [packages/admin/src/screens/AdminFeatureRegistry.tsx](../../../../packages/admin/src/screens/AdminFeatureRegistry.tsx) | 16 | hook / selected | `useFeatureStore((state) => state.flags)` |
| [packages/admin/src/screens/AdminFeatureRegistry.tsx](../../../../packages/admin/src/screens/AdminFeatureRegistry.tsx) | 17 | hook / selected | `useFeatureStore((state) => state.snapshot)` |
| [packages/community/src/screens/CommunityScreen.tsx](../../../../packages/community/src/screens/CommunityScreen.tsx) | 189 | hook / selected | `useFeatureStore((state) => state.flags)` |
| [packages/community/src/screens/CommunityScreen.web.tsx](../../../../packages/community/src/screens/CommunityScreen.web.tsx) | 124 | hook / selected | `useFeatureStore((state) => state.flags)` |
| [packages/core/src/hooks/useDomainRollout.ts](../../../../packages/core/src/hooks/useDomainRollout.ts) | 7 | hook / selected | `useFeatureStore((state) => state.flags)` |
| [packages/core/src/hooks/useFeatureRegistry.ts](../../../../packages/core/src/hooks/useFeatureRegistry.ts) | 30 | hook / selected | `useFeatureStore((s) => s.flags)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 50 | hook / selected | `useFeatureStore((state) => state.flags)` |
| [packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts](../../../../packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts) | 29 | hook / selected | `useFeatureStore((s) => s.flags)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 69 | setState | `useFeatureStore.setState((state) => ({ ...state, flags: featureScopedDefaults, snapshot: null, }))` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 86 | persist.rehydrate | `useFeatureStore.persist?.rehydrate?.()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 36 | hook / whole | `useFeatureStore()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 62 | getState | `useFeatureStore.getState()` |
| [packages/self/src/hooks/useSanctuaryRegistry.ts](../../../../packages/self/src/hooks/useSanctuaryRegistry.ts) | 12 | hook / selected | `useFeatureStore((state) => state.flags)` |
| [packages/self/src/hooks/useSelfNavigatorMode.ts](../../../../packages/self/src/hooks/useSelfNavigatorMode.ts) | 16 | hook / selected | `useFeatureStore((state) => state.flags as unknown as Record<string, unknown>)` |
| [packages/ui/src/providers/FeatureProvider.tsx](../../../../packages/ui/src/providers/FeatureProvider.tsx) | 18 | hook / selected | `useFeatureStore((state) => state.recomputeFlags)` |
| [packages/ui/src/providers/FeatureProvider.tsx](../../../../packages/ui/src/providers/FeatureProvider.tsx) | 26 | getState | `useFeatureStore.getState()` |

### useGrowthStore

Definition: [packages/core/src/store/useGrowthStore.ts:69](../../../../packages/core/src/store/useGrowthStore.ts).

Growth path stages, counters, previous counters and update/reset actions.

Review finding: Previous values serve delta presentation; classify independently from durable domain facts. Do not persist a second authoritative growth model.

Persistence: `gurudevi-growth-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        bhumi_stage: state.bhumi_stage,
        presence_signals: state.presence_signals,
        nourishing_signals: state.nourishing_signals,
        witnessing_signals: state.witnessing_signals,
        weaving_signals: state.weaving_signals,
        blooming_signals: state.blooming_signals,
        banyan_stage: state.banyan_stage,
        peer_mentored_count: state.peer_mentored_count,
        circles_facilitated_count: state.circles_facilitated_count,
        river_stage: state.river_stage,
        lessons_completed_count: state.lessons_completed_count,
        reflections_submitted_count: state.reflections_submitted_count,
        crystal_tier: state.crystal_tier,
        crystals_found_count: state.crystals_found_count,
        fractal_moments_count: state.fractal_moments_count,
      })
```

Declared contract: [packages/core/src/store/useGrowthStore.ts:6](../../../../packages/core/src/store/useGrowthStore.ts).

```ts
interface GrowthState {
  // Bhumi (Lotus) path
  bhumi_stage: BhumiStage;
  presence_signals: number;
  nourishing_signals: number;
  witnessing_signals: number;
  weaving_signals: number;
  blooming_signals: number;

  // Banyan (Vata) path
  banyan_stage: BanyanStage | null;
  peer_mentored_count: number;
  circles_facilitated_count: number;

  // River (Ganga) path
  river_stage: RiverStage | null;
  lessons_completed_count: number;
  reflections_submitted_count: number;

  // Crystal (Spatika) path
  crystal_tier: CrystalTier | null;
  crystals_found_count: number;
  fractal_moments_count: number;

  // Previous values for delta/change detection
  prev_presence_signals: number;
  prev_nourishing_signals: number;
  prev_witnessing_signals: number;
  prev_weaving_signals: number;
  prev_blooming_signals: number;

  // Actions
  setGrowthState: (state: Partial<GrowthState>) => void;
  resetGrowthState: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/core/src/hooks/useBanyanGrowth.ts](../../../../packages/core/src/hooks/useBanyanGrowth.ts) | 15 | hook / selected | `useGrowthStore((state) => state.banyan_stage)` |
| [packages/core/src/hooks/useBanyanGrowth.ts](../../../../packages/core/src/hooks/useBanyanGrowth.ts) | 16 | hook / selected | `useGrowthStore((state) => state.peer_mentored_count)` |
| [packages/core/src/hooks/useBanyanGrowth.ts](../../../../packages/core/src/hooks/useBanyanGrowth.ts) | 17 | hook / selected | `useGrowthStore((state) => state.circles_facilitated_count)` |
| [packages/core/src/hooks/useBanyanGrowth.ts](../../../../packages/core/src/hooks/useBanyanGrowth.ts) | 27 | getState | `useGrowthStore.getState()` |
| [packages/core/src/hooks/useNaturePaths.ts](../../../../packages/core/src/hooks/useNaturePaths.ts) | 15 | hook / selected | `useGrowthStore((state) => state.river_stage)` |
| [packages/core/src/hooks/useNaturePaths.ts](../../../../packages/core/src/hooks/useNaturePaths.ts) | 16 | hook / selected | `useGrowthStore((state) => state.crystal_tier)` |
| [packages/core/src/hooks/useNaturePaths.ts](../../../../packages/core/src/hooks/useNaturePaths.ts) | 17 | hook / selected | `useGrowthStore((state) => state.crystals_found_count)` |
| [packages/core/src/hooks/useNaturePaths.ts](../../../../packages/core/src/hooks/useNaturePaths.ts) | 18 | hook / selected | `useGrowthStore((state) => state.fractal_moments_count)` |
| [packages/core/src/hooks/useNaturePaths.ts](../../../../packages/core/src/hooks/useNaturePaths.ts) | 28 | getState | `useGrowthStore.getState()` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 68 | getState | `useGrowthStore.getState()` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 85 | persist.rehydrate | `useGrowthStore.persist?.rehydrate?.()` |

### usePerspectiveStore

Definition: [packages/core/src/store/usePerspectiveStore.ts:44](../../../../packages/core/src/store/usePerspectiveStore.ts).

Available/active workspace perspectives and transition flag, plus legacy mutation actions.

Review finding: Supported switching uses the coordinator; persisted mirrors and pre-snapshot legacy behavior remain. Consumer migration must precede retirement.

Persistence: `gurudevi-perspective-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        activePerspective: state.activePerspective,
        availablePerspectives: state.availablePerspectives,
      })
```

Declared contract: [packages/core/src/store/usePerspectiveStore.ts:10](../../../../packages/core/src/store/usePerspectiveStore.ts).

```ts
interface PerspectiveStoreState {
  activePerspective: SanctuaryPerspective;
  availablePerspectives: SanctuaryPerspective[];
  isTransitioning: boolean;

  // Actions
  setAvailablePerspectives: (perspectives: SanctuaryPerspective[]) => void;
  switchPerspective: (perspectiveId: string) => Promise<void>;
  resetToPersonalPerspective: () => void;
  addPerspective: (perspective: SanctuaryPerspective) => void;
  removePerspective: (perspectiveId: string) => void;
  updatePerspective: (perspectiveId: string, updates: Partial<SanctuaryPerspective>) => void;
  hydratePerspectivesFromDatabase: (
    userId: string,
    dependencies: {
      getInstitutionalBonds?: () => Promise<SanctuaryPerspective[]>;
      getCommercialBatches?: () => Promise<SanctuaryPerspective[]>;
      getGuardianBonds?: () => Promise<SanctuaryPerspective[]>;
    },
  ) => Promise<void>;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/src/components/navigation/TabFeatureCatalogSheet.tsx](../../src/components/navigation/TabFeatureCatalogSheet.tsx) | 45 | hook / selected | `usePerspectiveStore((s) => s.activePerspective)` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 34 | hook / selected | `usePerspectiveStore((state) => state.activePerspective)` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 35 | hook / selected | `usePerspectiveStore((state) => state.availablePerspectives)` |
| [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 36 | hook / selected | `usePerspectiveStore((state) => state.isTransitioning)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 48 | hook / selected | `usePerspectiveStore((state) => state.activePerspective)` |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 60 | hook / selected | `usePerspectiveStore((state) => state.activePerspective)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 62 | setState | `usePerspectiveStore.setState({ activePerspective: DEFAULT_PERSONAL_PERSPECTIVE, availablePerspectives: [DEFAULT_PERSONAL_PERSPECTIVE], isTransitioning: false, })` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 75 | getState | `usePerspectiveStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 78 | setState | `usePerspectiveStore.setState({ isTransitioning: true })` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 88 | setState | `usePerspectiveStore.setState({ activePerspective: next.activePerspective, availablePerspectives: [...next.availablePerspectives], isTransitioning: false, })` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 124 | setState | `usePerspectiveStore.setState({ activePerspective: previousPerspective.activePerspective, availablePerspectives: previousPerspective.availablePerspectives, isTransitioning: false, })` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 226 | setState | `usePerspectiveStore.setState({ activePerspective: PERSONAL_SCOPE_PERSPECTIVE, availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE], isTransitioning: false, })` |

### useSensoryStore

Definition: [packages/core/src/store/useSensoryStore.ts:23](../../../../packages/core/src/store/useSensoryStore.ts).

Three persisted haptics/sound/quiet preferences and setters.

Review finding: No production imports/calls found beyond a barrel export. SensoryProvider still uses another key; the singleton has another preference copy. Creating this store did not complete convergence.

Persistence: `gurudevi_sensory_preferences_v1`; version: false; migrate: false; partialize: false. Options present: `name`, `storage`.

No partialize option: ordinary persist serialization includes serializable state fields; functions are omitted by JSON. Do not infer an approved retention policy from this behavior.

Declared contract: [packages/core/src/store/useSensoryStore.ts:5](../../../../packages/core/src/store/useSensoryStore.ts).

```ts
interface SensoryPreferencesState {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  quietMode: boolean;

  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setQuietMode: (enabled: boolean) => void;
  setPreference: (key: 'hapticsEnabled' | 'soundEnabled' | 'quietMode', value: boolean) => void;
  resetPreferences: () => void;
}
```

No statically identified production call. Check exports, import-side effects, stored data and test-only consumers before retirement.

### useTemporalStore

Definition: [packages/core/src/store/useTemporalStore.ts:37](../../../../packages/core/src/store/useTemporalStore.ts).

Temporal date/scale/view/focus, offline state, phase/past flags and animated intensity.

Review finding: 36 whole subscriptions. phase/isPastView are derived from date; intensity plus an uncancelled timeout is presentation work mixed into domain navigation.

Persistence: no persist middleware in this declaration. Other authorities or snapshots may still be durable.

Declared contract: [packages/core/src/store/useTemporalStore.ts:13](../../../../packages/core/src/store/useTemporalStore.ts).

```ts
interface TemporalState {
  viewDate: string;
  intensity: number;
  phase: TemporalPhase;
  viewScale: TemporalScale;
  isOffline: boolean;
  viewMode: TemporalViewMode;
  timelineFocus: string;
  isPastView: boolean;
  setViewDate: (date: string) => void;
  setIntensity: (value: number) => void;
  resetToToday: () => void;
  setScale: (scale: TemporalScale) => void;
  setOffline: (offline: boolean) => void;
  setViewMode: (mode: TemporalViewMode) => void;
  setTimelineFocus: (focus: string) => void;
  isPast: () => boolean;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/admin/src/bridge/founderWorkspace.ts](../../../../packages/admin/src/bridge/founderWorkspace.ts) | 277 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx](../../../../packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx) | 150 | hook / whole | `useTemporalStore()` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 22 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 23 | hook / selected | `useTemporalStore((s) => s.viewScale)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 40 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 55 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 97 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 125 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 147 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/hooks/useSchoolStats.ts](../../../../packages/admin/src/hooks/useSchoolStats.ts) | 12 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/screens/FounderDashboard.web.tsx](../../../../packages/admin/src/screens/FounderDashboard.web.tsx) | 54 | hook / selected | `useTemporalStore((s) => s.isPastView)` |
| [packages/admin/src/screens/PrincipalDashboard.web.tsx](../../../../packages/admin/src/screens/PrincipalDashboard.web.tsx) | 176 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/admin/src/screens/PrincipalDashboard.web.tsx](../../../../packages/admin/src/screens/PrincipalDashboard.web.tsx) | 177 | hook / selected | `useTemporalStore((s) => s.isPastView)` |
| [packages/classroom/src/hooks/useLearningReflections.ts](../../../../packages/classroom/src/hooks/useLearningReflections.ts) | 25 | hook / whole | `useTemporalStore()` |
| [packages/classroom/src/hooks/useSchoolStats.ts](../../../../packages/classroom/src/hooks/useSchoolStats.ts) | 20 | hook / whole | `useTemporalStore()` |
| [packages/classroom/src/screens/StudentDashboard.tsx](../../../../packages/classroom/src/screens/StudentDashboard.tsx) | 28 | hook / whole | `useTemporalStore()` |
| [packages/classroom/src/screens/StudentDashboard.web.tsx](../../../../packages/classroom/src/screens/StudentDashboard.web.tsx) | 29 | hook / whole | `useTemporalStore()` |
| [packages/classroom/src/screens/StudentProfileScreen.tsx](../../../../packages/classroom/src/screens/StudentProfileScreen.tsx) | 49 | hook / whole | `useTemporalStore()` |
| [packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx](../../../../packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx) | 26 | hook / whole | `useTemporalStore()` |
| [packages/community/src/hooks/useCommunity.ts](../../../../packages/community/src/hooks/useCommunity.ts) | 25 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/community/src/hooks/useCommunity.ts](../../../../packages/community/src/hooks/useCommunity.ts) | 26 | hook / selected | `useTemporalStore((state) => state.viewScale)` |
| [packages/community/src/screens/AnnouncementsScreen.tsx](../../../../packages/community/src/screens/AnnouncementsScreen.tsx) | 109 | hook / selected | `useTemporalStore((store) => store.isOffline)` |
| [packages/community/src/screens/BaseChatScreen.tsx](../../../../packages/community/src/screens/BaseChatScreen.tsx) | 69 | hook / selected | `useTemporalStore((state) => state.isOffline)` |
| [packages/community/src/screens/CommunityScreen.tsx](../../../../packages/community/src/screens/CommunityScreen.tsx) | 187 | hook / whole | `useTemporalStore()` |
| [packages/community/src/screens/CommunityScreen.web.tsx](../../../../packages/community/src/screens/CommunityScreen.web.tsx) | 130 | hook / selected | `useTemporalStore((state) => state.isOffline)` |
| [packages/community/src/screens/DirectMessageScreen.tsx](../../../../packages/community/src/screens/DirectMessageScreen.tsx) | 28 | hook / whole | `useTemporalStore()` |
| [packages/community/src/screens/DirectMessageScreen.web.tsx](../../../../packages/community/src/screens/DirectMessageScreen.web.tsx) | 50 | hook / whole | `useTemporalStore()` |
| [packages/community/src/screens/DirectMessagesListScreen.tsx](../../../../packages/community/src/screens/DirectMessagesListScreen.tsx) | 45 | hook / selected | `useTemporalStore((state) => state.isOffline)` |
| [packages/community/src/screens/GroupChatScreen.tsx](../../../../packages/community/src/screens/GroupChatScreen.tsx) | 26 | hook / whole | `useTemporalStore()` |
| [packages/community/src/screens/GroupChatScreen.web.tsx](../../../../packages/community/src/screens/GroupChatScreen.web.tsx) | 42 | hook / whole | `useTemporalStore()` |
| [packages/community/src/screens/GroupDetailsScreen.tsx](../../../../packages/community/src/screens/GroupDetailsScreen.tsx) | 57 | hook / selected | `useTemporalStore((state) => state.isOffline)` |
| [packages/community/src/screens/GroupDetailsScreen.web.tsx](../../../../packages/community/src/screens/GroupDetailsScreen.web.tsx) | 19 | hook / selected | `useTemporalStore((state) => state.isOffline)` |
| [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 58 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 59 | hook / selected | `useTemporalStore((state) => state.viewScale)` |
| [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 116 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 117 | hook / selected | `useTemporalStore((state) => state.viewScale)` |
| [packages/core/src/api/temporalProxy.ts](../../../../packages/core/src/api/temporalProxy.ts) | 16 | getState | `useTemporalStore.getState()` |
| [packages/core/src/hooks/useJourneyHistory.ts](../../../../packages/core/src/hooks/useJourneyHistory.ts) | 32 | hook / whole | `useTemporalStore()` |
| [packages/core/src/hooks/useLocalFirstQuery.ts](../../../../packages/core/src/hooks/useLocalFirstQuery.ts) | 49 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/core/src/hooks/useManualSnapshot.ts](../../../../packages/core/src/hooks/useManualSnapshot.ts) | 25 | hook / whole | `useTemporalStore()` |
| [packages/core/src/hooks/useRewards.ts](../../../../packages/core/src/hooks/useRewards.ts) | 23 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/core/src/hooks/useRewards.ts](../../../../packages/core/src/hooks/useRewards.ts) | 24 | hook / selected | `useTemporalStore((state) => state.viewScale)` |
| [packages/core/src/hooks/useRewards.ts](../../../../packages/core/src/hooks/useRewards.ts) | 25 | hook / selected | `useTemporalStore((state) => state.phase)` |
| [packages/core/src/logic/utils/temporalUtils.ts](../../../../packages/core/src/logic/utils/temporalUtils.ts) | 82 | getState | `useTemporalStore.getState()` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 55 | setState | `useTemporalStore.setState({ viewDate: date })` |
| [packages/core/src/testing/scenarioHarness.ts](../../../../packages/core/src/testing/scenarioHarness.ts) | 63 | setState | `useTemporalStore.setState({ viewDate: '2026-09-07' })` |
| [packages/library/src/screens/LibraryScreen.tsx](../../../../packages/library/src/screens/LibraryScreen.tsx) | 231 | hook / selected | `useTemporalStore((state) => state.isPastView)` |
| [packages/library/src/screens/LibraryScreen.web.tsx](../../../../packages/library/src/screens/LibraryScreen.web.tsx) | 126 | hook / whole | `useTemporalStore()` |
| [packages/profile/src/components/LivingJourneyPanel.tsx](../../../../packages/profile/src/components/LivingJourneyPanel.tsx) | 365 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/profile/src/components/LivingJourneyPanel.tsx](../../../../packages/profile/src/components/LivingJourneyPanel.tsx) | 366 | hook / selected | `useTemporalStore((state) => state.viewScale)` |
| [packages/profile/src/components/LivingJourneyPanel.tsx](../../../../packages/profile/src/components/LivingJourneyPanel.tsx) | 367 | hook / selected | `useTemporalStore((state) => state.phase)` |
| [packages/profile/src/hooks/useCommunityProfile.ts](../../../../packages/profile/src/hooks/useCommunityProfile.ts) | 42 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/profile/src/hooks/useCommunityProfile.ts](../../../../packages/profile/src/hooks/useCommunityProfile.ts) | 43 | hook / selected | `useTemporalStore((state) => state.phase)` |
| [packages/profile/src/hooks/useProfile.ts](../../../../packages/profile/src/hooks/useProfile.ts) | 70 | hook / selected | `useTemporalStore((s) => s.viewDate)` |
| [packages/profile/src/hooks/useProfile.ts](../../../../packages/profile/src/hooks/useProfile.ts) | 71 | hook / selected | `useTemporalStore((s) => s.phase)` |
| [packages/profile/src/hooks/useSchoolPulse.ts](../../../../packages/profile/src/hooks/useSchoolPulse.ts) | 44 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/profile/src/hooks/useSchoolPulse.ts](../../../../packages/profile/src/hooks/useSchoolPulse.ts) | 45 | hook / selected | `useTemporalStore((state) => state.viewScale)` |
| [packages/self/src/components/BaseSelfView.tsx](../../../../packages/self/src/components/BaseSelfView.tsx) | 47 | hook / whole | `useTemporalStore()` |
| [packages/self/src/components/BaseSelfView.web.tsx](../../../../packages/self/src/components/BaseSelfView.web.tsx) | 44 | hook / whole | `useTemporalStore()` |
| [packages/self/src/components/EnergyForecast.web.tsx](../../../../packages/self/src/components/EnergyForecast.web.tsx) | 73 | hook / whole | `useTemporalStore()` |
| [packages/self/src/components/FireJournal.tsx](../../../../packages/self/src/components/FireJournal.tsx) | 57 | hook / selected | `useTemporalStore((state) => state.isPastView)` |
| [packages/self/src/components/MoodLotus.web.tsx](../../../../packages/self/src/components/MoodLotus.web.tsx) | 67 | hook / selected | `useTemporalStore((s) => s.isPastView)` |
| [packages/self/src/components/ProgressTree.web.tsx](../../../../packages/self/src/components/ProgressTree.web.tsx) | 66 | hook / whole | `useTemporalStore()` |
| [packages/self/src/components/ResonanceTimeline.tsx](../../../../packages/self/src/components/ResonanceTimeline.tsx) | 18 | hook / whole | `useTemporalStore()` |
| [packages/self/src/components/SleepTracker.web.tsx](../../../../packages/self/src/components/SleepTracker.web.tsx) | 35 | hook / selected | `useTemporalStore((state) => state.isPastView)` |
| [packages/self/src/components/TomorrowPrep.web.tsx](../../../../packages/self/src/components/TomorrowPrep.web.tsx) | 43 | hook / selected | `useTemporalStore((s) => s.isPastView)` |
| [packages/self/src/hooks/useDecisionJournal.ts](../../../../packages/self/src/hooks/useDecisionJournal.ts) | 17 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useEnergyForecast.ts](../../../../packages/self/src/hooks/useEnergyForecast.ts) | 20 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useFireJournal.ts](../../../../packages/self/src/hooks/useFireJournal.ts) | 23 | hook / selected | `useTemporalStore((state) => state.viewDate)` |
| [packages/self/src/hooks/useFireJournal.ts](../../../../packages/self/src/hooks/useFireJournal.ts) | 24 | hook / selected | `useTemporalStore((state) => state.isPastView)` |
| [packages/self/src/hooks/useJournalEntries.ts](../../../../packages/self/src/hooks/useJournalEntries.ts) | 17 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useJourneyData.ts](../../../../packages/self/src/hooks/useJourneyData.ts) | 31 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useMoodLogs.ts](../../../../packages/self/src/hooks/useMoodLogs.ts) | 25 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useProgressTree.ts](../../../../packages/self/src/hooks/useProgressTree.ts) | 10 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useStudentGoals.ts](../../../../packages/self/src/hooks/useStudentGoals.ts) | 17 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useThoughtRecords.ts](../../../../packages/self/src/hooks/useThoughtRecords.ts) | 24 | hook / whole | `useTemporalStore()` |
| [packages/self/src/hooks/useWisdom.ts](../../../../packages/self/src/hooks/useWisdom.ts) | 17 | hook / whole | `useTemporalStore()` |
| [packages/self/src/screens/self/TeacherSelfView.web.tsx](../../../../packages/self/src/screens/self/TeacherSelfView.web.tsx) | 43 | hook / whole | `useTemporalStore()` |
| [packages/ui/src/components/TemporalNavigator.tsx](../../../../packages/ui/src/components/TemporalNavigator.tsx) | 24 | hook / whole | `useTemporalStore()` |
| [packages/ui/src/components/TemporalPilot.tsx](../../../../packages/ui/src/components/TemporalPilot.tsx) | 30 | hook / whole | `useTemporalStore()` |
| [packages/ui/src/components/TemporalProvider.tsx](../../../../packages/ui/src/components/TemporalProvider.tsx) | 23 | hook / whole | `useTemporalStore()` |
| [packages/ui/src/components/TemporalProvider.web.tsx](../../../../packages/ui/src/components/TemporalProvider.web.tsx) | 20 | hook / whole | `useTemporalStore()` |
| [packages/ui/src/components/TemporalScrubber.tsx](../../../../packages/ui/src/components/TemporalScrubber.tsx) | 24 | hook / whole | `useTemporalStore()` |
| [packages/ui/src/components/TemporalShield.tsx](../../../../packages/ui/src/components/TemporalShield.tsx) | 23 | hook / whole | `useTemporalStore()` |

### useTenantStore

Definition: [packages/core/src/store/useTenantStore.ts:9](../../../../packages/core/src/store/useTenantStore.ts).

School metadata, academic cycle, tenant readiness and perspective compatibility model.

Review finding: Tenant-derived facts overlap the canonical snapshot. Facade spread order also shadows AuthSlice.activePerspective with a different contract.

Persistence: `gurudevi-tenant-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        schoolId: state.schoolId,
        schoolName: state.schoolName,
        schoolType: state.schoolType,
        realClassCount: state.realClassCount,
        activePerspective: state.activePerspective,
        availablePerspectives: state.availablePerspectives,
      })
```

Declared contract: [packages/core/src/store/slices/tenant.slice.ts:5](../../../../packages/core/src/store/slices/tenant.slice.ts).

```ts
interface TenantSlice {
  // Legacy / Facade compatibility fields
  schoolId: string | null;
  schoolName: string | null;
  setSchool: (id: string | null, name: string | null) => void;
  tenantResolved: boolean;
  setTenantResolved: (resolved: boolean) => void;
  schoolType?: string | null;
  setSchoolType: (type: string | null) => void;
  realClassCount?: number;
  setRealClassCount: (count: number) => void;
  academicCycleId: string | null;
  setAcademicCycleId: (id: string | null) => void;

  // First-class Sanctuary Perspective & Bond State
  activePerspective: SanctuaryPerspective;
  availablePerspectives: SanctuaryPerspective[];
  setAvailablePerspectives: (perspectives: SanctuaryPerspective[]) => void;
  switchPerspective: (perspectiveId: string) => void;
  resetToPersonalPerspective: () => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/classroom/src/hooks/useClassroomRoleData.ts](../../../../packages/classroom/src/hooks/useClassroomRoleData.ts) | 38 | hook / selected | `useTenantStore((state) => state.realClassCount)` |
| [packages/classroom/src/hooks/useClassroomRoleData.ts](../../../../packages/classroom/src/hooks/useClassroomRoleData.ts) | 39 | hook / selected | `useTenantStore((state) => state.setRealClassCount)` |
| [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 49 | hook / selected | `useTenantStore((state) => state.schoolType)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 61 | setState | `useTenantStore.setState(tenantScopedDefaults)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 83 | persist.rehydrate | `useTenantStore.persist?.rehydrate?.()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 46 | getState | `useTenantStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 47 | getState | `useTenantStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 74 | getState | `useTenantStore.getState()` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 93 | setState | `useTenantStore.setState(tenantMirror(next))` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 129 | setState | `useTenantStore.setState({ activePerspective: previousTenant.activePerspective, availablePerspectives: previousTenant.availablePerspectives, schoolId: previousTenant.schoolId, schoolName: previousTenant.schoolName, sch...` |
| [packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) | 231 | setState | `useTenantStore.setState({ activePerspective: PERSONAL_SCOPE_PERSPECTIVE, availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE], schoolId: null, schoolName: null, schoolType: null, })` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 34 | hook / whole | `useTenantStore()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 60 | getState | `useTenantStore.getState()` |

### useUIStore

Definition: [packages/core/src/store/useUIStore.ts:9](../../../../packages/core/src/store/useUIStore.ts).

Sidebar, theme/themeMode, dismissed samples, desk resources and breathing overlay.

Review finding: theme/themeMode are synchronized copies; overlays are transient; desk resources are structured user data. One label does not imply one lifetime.

Persistence: `gurudevi-ui-storage`; version: false; migrate: false; partialize: true. Options present: `name`, `storage`, `partialize`.

Persisted projection:

```ts
partialize: (state) => ({
        theme: state.theme,
        themeMode: state.themeMode,
        dismissedSampleIds: state.dismissedSampleIds,
        deskItems: state.deskItems,
      })
```

Declared contract: [packages/core/src/store/slices/ui.slice.ts:13](../../../../packages/core/src/store/slices/ui.slice.ts).

```ts
interface UISlice {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  themeMode?: 'light' | 'dark' | 'system';
  dismissedSampleIds?: string[];
  deskItems?: DeskItem[];
  isBreathingOpen: boolean;
  setBreathingOpen: (open: boolean) => void;
  addToDesk: (item: DeskItem) => void;
}
```

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/app/pulse.tsx](../../app/pulse.tsx) | 21 | hook / selected | `useUIStore((s) => s.isBreathingOpen)` |
| [apps/gurudevi-mobile/app/pulse.tsx](../../app/pulse.tsx) | 22 | hook / selected | `useUIStore((s) => s.setBreathingOpen)` |
| [apps/gurudevi-mobile/src/entry/EntryShell.tsx](../../src/entry/EntryShell.tsx) | 52 | hook / selected | `useUIStore((s) => s.isBreathingOpen)` |
| [apps/gurudevi-mobile/src/entry/EntryShell.tsx](../../src/entry/EntryShell.tsx) | 53 | hook / selected | `useUIStore((s) => s.setBreathingOpen)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 67 | setState | `useUIStore.setState(uiScopedDefaults)` |
| [packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) | 84 | persist.rehydrate | `useUIStore.persist?.rehydrate?.()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 35 | hook / whole | `useUIStore()` |
| [packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) | 61 | getState | `useUIStore.getState()` |
| [packages/self/src/screens/SelfScreen.unified.tsx](../../../../packages/self/src/screens/SelfScreen.unified.tsx) | 47 | hook / selected | `useUIStore((s) => s.setBreathingOpen)` |

### useSelfCanvasStore

Definition: [packages/self/src/features/selfCanvasStore.ts:179](../../../../packages/self/src/features/selfCanvasStore.ts).

User canvas preferences plus local persistence, guest handling, debounce, retry, circuit breaker and remote writes.

Review finding: Custom persistence is invisible to the persist(...) scanner. Module-level pending/retry slots and timers deserve account-switch and late-completion scenarios.

Persistence: custom user-keyed SafeZustandStorage writes plus remote synchronization; no persist middleware. Module-level debounce/pending/retry state sits outside the declared store.

Declared contract: [packages/self/src/features/selfCanvasStore.ts:18](../../../../packages/self/src/features/selfCanvasStore.ts).

```ts
type StoreState = SelfCanvasPreferences & {
  userId: string | null;
  isHydrated: boolean;
  lastIdempotencyKey: string | null;
  persistenceState: SelfCanvasPersistenceState;
  hydrate: (userId?: string | null) => Promise<void>;
  retryPersist: () => void;
  setHidden: (featureId: string, hidden: boolean) => void;
  setZone: (featureId: string, zone: SelfFeatureZone) => void;
  setOrder: (order: string[]) => void;
  setSelected: (selectedIds: string[]) => void;
  setRoleWeights: (weights: Partial<Record<SelfViewRole, number>>) => void;
  setViewMode: (mode: SelfCanvasViewMode) => void;
  reset: () => void;
};
```

The contract intersects SelfCanvasPreferences from [packages/self/src/features/userPreferences.ts](../../../../packages/self/src/features/userPreferences.ts); that nested preference contract is part of the stored payload.

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [packages/self/src/screens/SelfScreen.unified.tsx](../../../../packages/self/src/screens/SelfScreen.unified.tsx) | 53 | hook / whole | `useSelfCanvasStore()` |

## Complete facade consumer ledger

The following includes all 218 identified facade calls, including imperative getState and selected hooks. Whole-state subscriptions in the four underlying stores occur inside the facade definition and are separately listed above.

| Consumer source | Line | Access | Expression excerpt |
| --- | ---: | --- | --- |
| [apps/gurudevi-mobile/app/(tabs)/self/index.tsx](../../app/%28tabs%29/self/index.tsx) | 42 | hook / selected | `useStore((state) => state.user)` |
| [apps/gurudevi-mobile/app/(tabs)/self/wisdom/[id].tsx](../../app/%28tabs%29/self/wisdom/%5Bid%5D.tsx) | 15 | hook / selected | `useStore((state) => state.user?.id)` |
| [apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx](../../app/%28tabs%29/workspace/principal.tsx) | 13 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 87 | hook / selected | `useStore((state) => state.user)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 88 | hook / selected | `useStore((state) => state.isOnline)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 93 | hook / selected | `useStore((state) => state.showToast)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 98 | hook / selected | `useStore((state) => state.isBreathingOpen ?? false)` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 99 | hook / selected | `useStore((state) => state.setBreathingOpen ?? (() => {}))` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 191 | getState | `useStore.getState()` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 194 | getState | `useStore.getState()` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 339 | getState | `useStore.getState()` |
| [apps/gurudevi-mobile/app/(tabs)/_layout.tsx](../../app/%28tabs%29/_layout.tsx) | 389 | getState | `useStore.getState()` |
| [apps/gurudevi-mobile/app/welcome.tsx](../../app/welcome.tsx) | 33 | hook / selected | `useStore((state) => state.isOnline)` |
| [apps/gurudevi-mobile/app/welcome.tsx](../../app/welcome.tsx) | 34 | hook / selected | `useStore((state) => state.showToast)` |
| [apps/gurudevi-mobile/src/entry/AuthenticatedSyncService.tsx](../../src/entry/AuthenticatedSyncService.tsx) | 13 | hook / selected | `useStore((state) => state.user !== null)` |
| [apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts](../../src/entry/bootstrapRouteState.ts) | 120 | hook / selected | `useStore((state) => state.user)` |
| [apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts](../../src/entry/bootstrapRouteState.ts) | 121 | hook / selected | `useStore((state) => state.activeBond)` |
| [apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts](../../src/entry/bootstrapRouteState.ts) | 122 | hook / selected | `useStore((state) => state.onboardingCompleted)` |
| [apps/gurudevi-mobile/src/entry/GuestConversionBoundary.tsx](../../src/entry/GuestConversionBoundary.tsx) | 19 | hook / selected | `useStore((state) => state.user)` |
| [apps/gurudevi-mobile/src/hooks/useJourneyContext.ts](../../src/hooks/useJourneyContext.ts) | 35 | hook / selected | `useStore((state) => state.onboardingCompleted)` |
| [apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx](../../src/providers/PowerSyncProvider.tsx) | 37 | hook / selected | `useStore((state) => state.user?.id ?? null)` |
| [apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx](../../src/providers/PowerSyncProvider.tsx) | 38 | hook / selected | `useStore((state) => state.user)` |
| [apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx](../../src/providers/PowerSyncProvider.tsx) | 39 | hook / selected | `useStore((state) => state.flags.isPowerSyncEnabled)` |
| [apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx](../../src/providers/PowerSyncProvider.tsx) | 69 | getState | `useStore.getState()` |
| [packages/admin/src/bridge/founderWorkspace.ts](../../../../packages/admin/src/bridge/founderWorkspace.ts) | 112 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/admin/src/bridge/founderWorkspace.ts](../../../../packages/admin/src/bridge/founderWorkspace.ts) | 278 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/admin/src/components/principal/DashboardEcho.tsx](../../../../packages/admin/src/components/principal/DashboardEcho.tsx) | 59 | hook / selected | `useStore((s) => s.user)` |
| [packages/admin/src/components/school/CreateSchoolModal.tsx](../../../../packages/admin/src/components/school/CreateSchoolModal.tsx) | 62 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/components/school/CreateSchoolModal.tsx](../../../../packages/admin/src/components/school/CreateSchoolModal.tsx) | 63 | hook / selected | `useStore((state) => state.setUser)` |
| [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 56 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/admin/src/hooks/useSchoolStats.ts](../../../../packages/admin/src/hooks/useSchoolStats.ts) | 11 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/admin/src/hooks/useSchoolStats.ts](../../../../packages/admin/src/hooks/useSchoolStats.ts) | 13 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/admin/src/screens/AdminDashboard.tsx](../../../../packages/admin/src/screens/AdminDashboard.tsx) | 22 | hook / selected | `useStore((state) => state.user?.id ?? null)` |
| [packages/admin/src/screens/FounderDashboard.tsx](../../../../packages/admin/src/screens/FounderDashboard.tsx) | 35 | hook / selected | `useStore((s) => s.user)` |
| [packages/admin/src/screens/FounderDashboard.tsx](../../../../packages/admin/src/screens/FounderDashboard.tsx) | 36 | hook / selected | `useStore((s) => s.setBreathingOpen)` |
| [packages/admin/src/screens/FounderDashboard.tsx](../../../../packages/admin/src/screens/FounderDashboard.tsx) | 37 | hook / selected | `useStore((s) => s.isDemoMode)` |
| [packages/admin/src/screens/FounderDashboard.web.tsx](../../../../packages/admin/src/screens/FounderDashboard.web.tsx) | 53 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/screens/FounderSchoolDashboard.tsx](../../../../packages/admin/src/screens/FounderSchoolDashboard.tsx) | 41 | hook / selected | `useStore((s) => s.isDemoMode)` |
| [packages/admin/src/screens/GradeHeadDashboard.tsx](../../../../packages/admin/src/screens/GradeHeadDashboard.tsx) | 19 | hook / selected | `useStore((state: any) => state.userRole)` |
| [packages/admin/src/screens/guardian/GuardianEventsScreen.tsx](../../../../packages/admin/src/screens/guardian/GuardianEventsScreen.tsx) | 11 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/screens/guardian/GuardianNotificationsScreen.tsx](../../../../packages/admin/src/screens/guardian/GuardianNotificationsScreen.tsx) | 11 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx](../../../../packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx) | 16 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx](../../../../packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx) | 11 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/screens/GuardianDashboard.tsx](../../../../packages/admin/src/screens/GuardianDashboard.tsx) | 34 | hook / selected | `useStore((state) => state.user)` |
| [packages/admin/src/screens/PrincipalDashboard.tsx](../../../../packages/admin/src/screens/PrincipalDashboard.tsx) | 40 | hook / selected | `useStore((state: TotalState) => state.isDemoMode)` |
| [packages/admin/src/screens/PrincipalDashboard.tsx](../../../../packages/admin/src/screens/PrincipalDashboard.tsx) | 41 | hook / selected | `useStore((state: TotalState) => state.setBreathingOpen)` |
| [packages/admin/src/screens/SchoolCreationScreen.tsx](../../../../packages/admin/src/screens/SchoolCreationScreen.tsx) | 36 | hook / selected | `useStore((s) => s.user)` |
| [packages/admin/src/screens/SchoolCreationScreen.tsx](../../../../packages/admin/src/screens/SchoolCreationScreen.tsx) | 37 | hook / selected | `useStore((s) => s.setUser)` |
| [packages/admin/src/screens/SchoolCreationScreen.tsx](../../../../packages/admin/src/screens/SchoolCreationScreen.tsx) | 38 | hook / selected | `useStore((s) => s.setDemoMode)` |
| [packages/admin/src/screens/SectionHeadDashboard.tsx](../../../../packages/admin/src/screens/SectionHeadDashboard.tsx) | 22 | hook / selected | `useStore((state: any) => state.userRole)` |
| [packages/ai/src/hooks/useAIAgent.ts](../../../../packages/ai/src/hooks/useAIAgent.ts) | 121 | hook / selected | `useStore((state) => state.activeBond?.capacity ?? null)` |
| [packages/ai/src/hooks/useAIAgent.ts](../../../../packages/ai/src/hooks/useAIAgent.ts) | 122 | hook / selected | `useStore((state) => state.user)` |
| [packages/ai/src/screens/AIAssistantScreen.tsx](../../../../packages/ai/src/screens/AIAssistantScreen.tsx) | 42 | hook / selected | `useStore((state) => state.activeBond?.capacity ?? null)` |
| [packages/classroom/src/api/learningReflections.ts](../../../../packages/classroom/src/api/learningReflections.ts) | 6 | getState | `useStore.getState()` |
| [packages/classroom/src/components/ClassroomEchoSection.tsx](../../../../packages/classroom/src/components/ClassroomEchoSection.tsx) | 48 | hook / whole | `useStore()` |
| [packages/classroom/src/components/ClassroomList.tsx](../../../../packages/classroom/src/components/ClassroomList.tsx) | 64 | hook / selected | `useStore((state) => state.dismissedSampleIds)` |
| [packages/classroom/src/components/ClassroomList.tsx](../../../../packages/classroom/src/components/ClassroomList.tsx) | 65 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/classroom/src/components/ClassroomList.tsx](../../../../packages/classroom/src/components/ClassroomList.tsx) | 66 | hook / selected | `useStore((state) => state.isExplorerMode)` |
| [packages/classroom/src/components/ClassroomList.tsx](../../../../packages/classroom/src/components/ClassroomList.tsx) | 318 | getState | `useStore.getState()` |
| [packages/classroom/src/components/ClassroomList.tsx](../../../../packages/classroom/src/components/ClassroomList.tsx) | 352 | getState | `useStore.getState()` |
| [packages/classroom/src/components/IdentityInitialState.tsx](../../../../packages/classroom/src/components/IdentityInitialState.tsx) | 58 | hook / selected | `useStore((state) => state.setDemoMode)` |
| [packages/classroom/src/components/InventoryView.tsx](../../../../packages/classroom/src/components/InventoryView.tsx) | 114 | hook / whole | `useStore()` |
| [packages/classroom/src/components/InventoryView.tsx](../../../../packages/classroom/src/components/InventoryView.tsx) | 115 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/classroom/src/components/ResourcesView.tsx](../../../../packages/classroom/src/components/ResourcesView.tsx) | 37 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/classroom/src/components/ResourcesView.tsx](../../../../packages/classroom/src/components/ResourcesView.tsx) | 38 | hook / selected | `useStore((state) => state.user)` |
| [packages/classroom/src/components/student/StudentHeader.tsx](../../../../packages/classroom/src/components/student/StudentHeader.tsx) | 7 | hook / whole | `useStore()` |
| [packages/classroom/src/hooks/useGradebook.ts](../../../../packages/classroom/src/hooks/useGradebook.ts) | 40 | hook / selected | `useStore((state) => state.user)` |
| [packages/classroom/src/hooks/useLearningReflections.ts](../../../../packages/classroom/src/hooks/useLearningReflections.ts) | 24 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/classroom/src/hooks/useResources.ts](../../../../packages/classroom/src/hooks/useResources.ts) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/classroom/src/hooks/useSchoolStats.ts](../../../../packages/classroom/src/hooks/useSchoolStats.ts) | 19 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/classroom/src/hooks/useSchoolStats.ts](../../../../packages/classroom/src/hooks/useSchoolStats.ts) | 21 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/classroom/src/hooks/useSchoolStats.ts](../../../../packages/classroom/src/hooks/useSchoolStats.ts) | 22 | hook / selected | `useStore((state) => state.isExplorerMode)` |
| [packages/classroom/src/planBridge/usePlanBridge.ts](../../../../packages/classroom/src/planBridge/usePlanBridge.ts) | 25 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/classroom/src/screens/AttendanceScreen.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.tsx) | 33 | hook / selected | `useStore((state) => state.schoolId)` |
| [packages/classroom/src/screens/AttendanceScreen.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.tsx) | 34 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/classroom/src/screens/AttendanceScreen.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.tsx) | 35 | hook / selected | `useStore((state) => state.academicCycleId)` |
| [packages/classroom/src/screens/AttendanceScreen.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.tsx) | 36 | hook / selected | `useStore((state) => state.setAcademicCycleId)` |
| [packages/classroom/src/screens/AttendanceScreen.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.tsx) | 37 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/classroom/src/screens/AttendanceScreen.tsx](../../../../packages/classroom/src/screens/AttendanceScreen.tsx) | 38 | hook / selected | `useStore((state) => state.user)` |
| [packages/classroom/src/screens/ClassroomScreen.tsx](../../../../packages/classroom/src/screens/ClassroomScreen.tsx) | 27 | hook / selected | `useStore((state) => state.user?.school_id)` |
| [packages/classroom/src/screens/ClassroomScreen.tsx](../../../../packages/classroom/src/screens/ClassroomScreen.tsx) | 28 | hook / selected | `useStore((state) => state.user?.id)` |
| [packages/classroom/src/screens/ClassroomScreen.tsx](../../../../packages/classroom/src/screens/ClassroomScreen.tsx) | 29 | hook / selected | `useStore((state) => state.setBreathingOpen)` |
| [packages/classroom/src/screens/ContentLibrary.tsx](../../../../packages/classroom/src/screens/ContentLibrary.tsx) | 70 | hook / selected | `useStore((state) => state.user)` |
| [packages/classroom/src/screens/ContentLibrary.tsx](../../../../packages/classroom/src/screens/ContentLibrary.tsx) | 71 | hook / selected | `useStore((state) => state.addToDesk)` |
| [packages/classroom/src/screens/ContentLibrary.tsx](../../../../packages/classroom/src/screens/ContentLibrary.tsx) | 72 | hook / selected | `useStore((state) => state.deskItems \|\| [])` |
| [packages/classroom/src/screens/StudentDashboard.tsx](../../../../packages/classroom/src/screens/StudentDashboard.tsx) | 26 | hook / selected | `useStore((state: any) => state.showToast)` |
| [packages/classroom/src/screens/StudentDashboard.tsx](../../../../packages/classroom/src/screens/StudentDashboard.tsx) | 55 | getState | `useStore.getState()` |
| [packages/classroom/src/screens/StudentDashboard.web.tsx](../../../../packages/classroom/src/screens/StudentDashboard.web.tsx) | 27 | hook / selected | `useStore((state: any) => state.showToast)` |
| [packages/classroom/src/screens/StudentDashboard.web.tsx](../../../../packages/classroom/src/screens/StudentDashboard.web.tsx) | 56 | getState | `useStore.getState()` |
| [packages/classroom/src/screens/TeacherClassroomDashboard.tsx](../../../../packages/classroom/src/screens/TeacherClassroomDashboard.tsx) | 214 | hook / selected | `useStore((state) => state.user?.id ?? '')` |
| [packages/classroom/src/workspace/useStudentWorkspaceData.ts](../../../../packages/classroom/src/workspace/useStudentWorkspaceData.ts) | 16 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts](../../../../packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts) | 15 | hook / selected | `useStore((state) => state.user?.id ?? '')` |
| [packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx](../../../../packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx) | 23 | hook / whole | `useStore()` |
| [packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx](../../../../packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx) | 72 | hook / selected | `useStore((state) => state.setBreathingOpen ?? (() => {}))` |
| [packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx](../../../../packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx) | 73 | hook / selected | `useStore((state) => state.isBreathingOpen ?? false)` |
| [packages/community/src/hooks/useCommunity.ts](../../../../packages/community/src/hooks/useCommunity.ts) | 24 | hook / selected | `useStore((state) => state.user)` |
| [packages/community/src/hooks/useSocialShield.ts](../../../../packages/community/src/hooks/useSocialShield.ts) | 10 | hook / selected | `useStore((state) => state.user)` |
| [packages/community/src/screens/BaseChatScreen.tsx](../../../../packages/community/src/screens/BaseChatScreen.tsx) | 68 | hook / selected | `useStore((state) => state.user)` |
| [packages/community/src/screens/GroupDetailsScreen.tsx](../../../../packages/community/src/screens/GroupDetailsScreen.tsx) | 56 | hook / selected | `useStore((state) => state.user)` |
| [packages/community/src/screens/GroupDetailsScreen.web.tsx](../../../../packages/community/src/screens/GroupDetailsScreen.web.tsx) | 18 | hook / selected | `useStore((state) => state.user?.id)` |
| [packages/community/src/screens/UserPublicProfileScreen.tsx](../../../../packages/community/src/screens/UserPublicProfileScreen.tsx) | 64 | hook / selected | `useStore((state) => state.user?.id)` |
| [packages/community/src/screens/UserPublicProfileScreen.web.tsx](../../../../packages/community/src/screens/UserPublicProfileScreen.web.tsx) | 57 | hook / selected | `useStore((state) => state.user)` |
| [packages/core/src/adapters/clientDomainServices.ts](../../../../packages/core/src/adapters/clientDomainServices.ts) | 35 | getState | `useStore.getState()` |
| [packages/core/src/adapters/NetworkBusAdapter.ts](../../../../packages/core/src/adapters/NetworkBusAdapter.ts) | 22 | getState | `useStore.getState()` |
| [packages/core/src/adapters/NetworkBusAdapter.ts](../../../../packages/core/src/adapters/NetworkBusAdapter.ts) | 32 | getState | `useStore.getState()` |
| [packages/core/src/adapters/powersync/PowerSyncGate.tsx](../../../../packages/core/src/adapters/powersync/PowerSyncGate.tsx) | 29 | hook / selected | `useStore((s) => s.flags.isPowerSyncEnabled)` |
| [packages/core/src/adapters/powersync/PowerSyncGate.tsx](../../../../packages/core/src/adapters/powersync/PowerSyncGate.tsx) | 30 | hook / selected | `useStore((s) => s.user)` |
| [packages/core/src/adapters/powersync/secureDrizzleProxy.ts](../../../../packages/core/src/adapters/powersync/secureDrizzleProxy.ts) | 126 | getState | `useStore.getState()` |
| [packages/core/src/api/classroom.ts](../../../../packages/core/src/api/classroom.ts) | 16 | getState | `useStore.getState()` |
| [packages/core/src/api/demo.ts](../../../../packages/core/src/api/demo.ts) | 14 | getState | `useStore.getState()` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 139 | getState | `useStore.getState()` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 212 | getState | `useStore.getState()` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 432 | getState | `useStore.getState()` |
| [packages/core/src/api/demoProvider.ts](../../../../packages/core/src/api/demoProvider.ts) | 453 | getState | `useStore.getState()` |
| [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 83 | hook / whole | `useStore()` |
| [packages/core/src/api/hooks/social.hooks.ts](../../../../packages/core/src/api/hooks/social.hooks.ts) | 10 | hook / whole | `useStore()` |
| [packages/core/src/api/profile.ts](../../../../packages/core/src/api/profile.ts) | 27 | getState | `useStore.getState()` |
| [packages/core/src/api/profile.ts](../../../../packages/core/src/api/profile.ts) | 135 | getState | `useStore.getState()` |
| [packages/core/src/api/profile.ts](../../../../packages/core/src/api/profile.ts) | 143 | getState | `useStore.getState()` |
| [packages/core/src/api/runtimes/educational.runtime.ts](../../../../packages/core/src/api/runtimes/educational.runtime.ts) | 9 | getState | `useStore.getState()` |
| [packages/core/src/api/runtimes/profile.runtime.ts](../../../../packages/core/src/api/runtimes/profile.runtime.ts) | 12 | getState | `useStore.getState()` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 62 | hook / selected | `useStore((state) => state.setUser)` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 63 | hook / selected | `useStore((state) => state.setOnboardingCompleted)` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 64 | hook / selected | `useStore((state) => state.setAuthSession)` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 65 | hook / selected | `useStore((state) => state.setAuthSessionResolved)` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 66 | hook / selected | `useStore((state) => state.setDemoMode)` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 124 | getState | `useStore.getState()` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 284 | getState | `useStore.getState()` |
| [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 412 | hook / selected | `useStore((state) => state.user)` |
| [packages/core/src/hooks/useLocalFirstQuery.ts](../../../../packages/core/src/hooks/useLocalFirstQuery.ts) | 48 | hook / selected | `useStore((s) => s.isOnline)` |
| [packages/core/src/hooks/useTenantContext.ts](../../../../packages/core/src/hooks/useTenantContext.ts) | 7 | hook / selected | `useStore((state) => state.academicCycleId)` |
| [packages/core/src/lib/sync/deviceSecurityIntents.ts](../../../../packages/core/src/lib/sync/deviceSecurityIntents.ts) | 22 | getState | `useStore.getState()` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 47 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 59 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/core/src/lib/sync/sync/SyncManager.tsx](../../../../packages/core/src/lib/sync/sync/SyncManager.tsx) | 90 | getState | `useStore.getState()` |
| [packages/core/src/logic/apiInterceptor.ts](../../../../packages/core/src/logic/apiInterceptor.ts) | 81 | getState | `useStore.getState()` |
| [packages/library/src/components/ResourceList.tsx](../../../../packages/library/src/components/ResourceList.tsx) | 59 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/library/src/screens/CuratorReviewScreen.tsx](../../../../packages/library/src/screens/CuratorReviewScreen.tsx) | 78 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/library/src/screens/LibraryScreen.tsx](../../../../packages/library/src/screens/LibraryScreen.tsx) | 232 | hook / selected | `useStore((state) => state.deskItems)` |
| [packages/library/src/screens/LibraryScreen.tsx](../../../../packages/library/src/screens/LibraryScreen.tsx) | 233 | hook / selected | `useStore((state) => state.user)` |
| [packages/library/src/screens/LibraryScreen.tsx](../../../../packages/library/src/screens/LibraryScreen.tsx) | 234 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/library/src/screens/LibraryScreen.tsx](../../../../packages/library/src/screens/LibraryScreen.tsx) | 235 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/library/src/screens/LibraryScreen.web.tsx](../../../../packages/library/src/screens/LibraryScreen.web.tsx) | 129 | hook / selected | `useStore((state) => state.user)` |
| [packages/library/src/screens/LibraryScreen.web.tsx](../../../../packages/library/src/screens/LibraryScreen.web.tsx) | 130 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/library/src/screens/MapScreen.tsx](../../../../packages/library/src/screens/MapScreen.tsx) | 113 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/profile/src/hooks/useCommunityProfile.ts](../../../../packages/profile/src/hooks/useCommunityProfile.ts) | 40 | hook / selected | `useStore((state) => state.user?.id)` |
| [packages/profile/src/hooks/useCommunityProfile.ts](../../../../packages/profile/src/hooks/useCommunityProfile.ts) | 41 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/profile/src/hooks/useProfile.ts](../../../../packages/profile/src/hooks/useProfile.ts) | 66 | hook / selected | `useStore((s) => s.isOnline)` |
| [packages/profile/src/hooks/useProfileHistory.ts](../../../../packages/profile/src/hooks/useProfileHistory.ts) | 40 | hook / selected | `useStore((s) => s.isOnline)` |
| [packages/profile/src/hooks/useRewardedAdHub.ts](../../../../packages/profile/src/hooks/useRewardedAdHub.ts) | 14 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/profile/src/hooks/useSocialLinks.ts](../../../../packages/profile/src/hooks/useSocialLinks.ts) | 50 | hook / selected | `useStore((s) => s.isOnline)` |
| [packages/profile/src/screens/ProfileScreen.tsx](../../../../packages/profile/src/screens/ProfileScreen.tsx) | 194 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/profile/src/screens/ProfileScreen.tsx](../../../../packages/profile/src/screens/ProfileScreen.tsx) | 251 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/profile/src/screens/ProfileScreen.tsx](../../../../packages/profile/src/screens/ProfileScreen.tsx) | 351 | hook / selected | `useStore((state) => state.user)` |
| [packages/profile/src/screens/ProfileScreen.tsx](../../../../packages/profile/src/screens/ProfileScreen.tsx) | 395 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/self/src/api/self.ts](../../../../packages/self/src/api/self.ts) | 12 | getState | `useStore.getState()` |
| [packages/self/src/components/BaseSelfView.tsx](../../../../packages/self/src/components/BaseSelfView.tsx) | 51 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/components/BaseSelfView.web.tsx](../../../../packages/self/src/components/BaseSelfView.web.tsx) | 30 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/components/PulseDashboard.tsx](../../../../packages/self/src/components/PulseDashboard.tsx) | 33 | hook / selected | `useStore((state) => state.user)` |
| [packages/self/src/components/PulseDashboard.tsx](../../../../packages/self/src/components/PulseDashboard.tsx) | 34 | hook / selected | `useStore((state) => state.userName)` |
| [packages/self/src/hooks/useDecisionJournal.ts](../../../../packages/self/src/hooks/useDecisionJournal.ts) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useEnergyForecast.ts](../../../../packages/self/src/hooks/useEnergyForecast.ts) | 19 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useFireJournal.ts](../../../../packages/self/src/hooks/useFireJournal.ts) | 22 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useGratitude.ts](../../../../packages/self/src/hooks/useGratitude.ts) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useJournalEntries.ts](../../../../packages/self/src/hooks/useJournalEntries.ts) | 12 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useJoyJar.ts](../../../../packages/self/src/hooks/useJoyJar.ts) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useMoodLogs.ts](../../../../packages/self/src/hooks/useMoodLogs.ts) | 24 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useProgressTree.ts](../../../../packages/self/src/hooks/useProgressTree.ts) | 9 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useSleepTracker.ts](../../../../packages/self/src/hooks/useSleepTracker.ts) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useStudentGoals.ts](../../../../packages/self/src/hooks/useStudentGoals.ts) | 13 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useStudentGrades.ts](../../../../packages/self/src/hooks/useStudentGrades.ts) | 18 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useThoughtRecords.ts](../../../../packages/self/src/hooks/useThoughtRecords.ts) | 23 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useTimetable.ts](../../../../packages/self/src/hooks/useTimetable.ts) | 17 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useTomorrowPrep.ts](../../../../packages/self/src/hooks/useTomorrowPrep.ts) | 14 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/hooks/useWisdom.ts](../../../../packages/self/src/hooks/useWisdom.ts) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/self/src/screens/self/AdminSelfView.tsx](../../../../packages/self/src/screens/self/AdminSelfView.tsx) | 30 | hook / selected | `useStore((state) => state.user)` |
| [packages/self/src/screens/self/AdminSelfView.tsx](../../../../packages/self/src/screens/self/AdminSelfView.tsx) | 45 | hook / selected | `useStore((state) => state.justFinishedOnboarding)` |
| [packages/self/src/screens/self/AdminSelfView.tsx](../../../../packages/self/src/screens/self/AdminSelfView.tsx) | 46 | hook / selected | `useStore((state) => state.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/FounderSelfView.tsx](../../../../packages/self/src/screens/self/FounderSelfView.tsx) | 54 | hook / selected | `useStore((state) => state.justFinishedOnboarding)` |
| [packages/self/src/screens/self/FounderSelfView.tsx](../../../../packages/self/src/screens/self/FounderSelfView.tsx) | 55 | hook / selected | `useStore((state) => state.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/FounderSelfView.web.tsx](../../../../packages/self/src/screens/self/FounderSelfView.web.tsx) | 32 | hook / selected | `useStore((s) => s.justFinishedOnboarding)` |
| [packages/self/src/screens/self/FounderSelfView.web.tsx](../../../../packages/self/src/screens/self/FounderSelfView.web.tsx) | 33 | hook / selected | `useStore((s) => s.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/GuardianSelfView.tsx](../../../../packages/self/src/screens/self/GuardianSelfView.tsx) | 30 | hook / selected | `useStore((state) => state.justFinishedOnboarding)` |
| [packages/self/src/screens/self/GuardianSelfView.tsx](../../../../packages/self/src/screens/self/GuardianSelfView.tsx) | 31 | hook / selected | `useStore((state) => state.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/PrincipalSelfView.tsx](../../../../packages/self/src/screens/self/PrincipalSelfView.tsx) | 56 | hook / selected | `useStore((state) => state.justFinishedOnboarding)` |
| [packages/self/src/screens/self/PrincipalSelfView.tsx](../../../../packages/self/src/screens/self/PrincipalSelfView.tsx) | 57 | hook / selected | `useStore((state) => state.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/PrincipalSelfView.web.tsx](../../../../packages/self/src/screens/self/PrincipalSelfView.web.tsx) | 34 | hook / selected | `useStore((s) => s.justFinishedOnboarding)` |
| [packages/self/src/screens/self/PrincipalSelfView.web.tsx](../../../../packages/self/src/screens/self/PrincipalSelfView.web.tsx) | 35 | hook / selected | `useStore((s) => s.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/StudentSelfView.tsx](../../../../packages/self/src/screens/self/StudentSelfView.tsx) | 30 | hook / selected | `useStore((state) => state.justFinishedOnboarding)` |
| [packages/self/src/screens/self/StudentSelfView.tsx](../../../../packages/self/src/screens/self/StudentSelfView.tsx) | 31 | hook / selected | `useStore((state) => state.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/StudentSelfView.web.tsx](../../../../packages/self/src/screens/self/StudentSelfView.web.tsx) | 31 | hook / selected | `useStore((s) => s.justFinishedOnboarding)` |
| [packages/self/src/screens/self/StudentSelfView.web.tsx](../../../../packages/self/src/screens/self/StudentSelfView.web.tsx) | 32 | hook / selected | `useStore((s) => s.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/TeacherSelfView.tsx](../../../../packages/self/src/screens/self/TeacherSelfView.tsx) | 61 | hook / selected | `useStore((state) => state.justFinishedOnboarding)` |
| [packages/self/src/screens/self/TeacherSelfView.tsx](../../../../packages/self/src/screens/self/TeacherSelfView.tsx) | 62 | hook / selected | `useStore((state) => state.setJustFinishedOnboarding)` |
| [packages/self/src/screens/self/TeacherSelfView.web.tsx](../../../../packages/self/src/screens/self/TeacherSelfView.web.tsx) | 44 | hook / selected | `useStore((s) => s.justFinishedOnboarding)` |
| [packages/self/src/screens/self/TeacherSelfView.web.tsx](../../../../packages/self/src/screens/self/TeacherSelfView.web.tsx) | 45 | hook / selected | `useStore((s) => s.setJustFinishedOnboarding)` |
| [packages/self/src/screens/SelfScreen.unified.tsx](../../../../packages/self/src/screens/SelfScreen.unified.tsx) | 43 | hook / selected | `useStore((s) => s.user?.id)` |
| [packages/ui/src/components/GlobalHeader.tsx](../../../../packages/ui/src/components/GlobalHeader.tsx) | 92 | hook / selected | `useStore((state: TotalState) => state.user)` |
| [packages/ui/src/components/GlobalHeader.web.tsx](../../../../packages/ui/src/components/GlobalHeader.web.tsx) | 77 | hook / selected | `useStore((state: TotalState) => state.user)` |
| [packages/ui/src/components/NetworkStatusBanner.tsx](../../../../packages/ui/src/components/NetworkStatusBanner.tsx) | 16 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/ui/src/components/NotificationDrawer.tsx](../../../../packages/ui/src/components/NotificationDrawer.tsx) | 84 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/ui/src/components/NotificationSettingsPanel.tsx](../../../../packages/ui/src/components/NotificationSettingsPanel.tsx) | 31 | hook / selected | `useStore((state) => state.user?.id)` |
| [packages/ui/src/context/RealityProvider.tsx](../../../../packages/ui/src/context/RealityProvider.tsx) | 90 | getState | `useStore.getState()` |
| [packages/ui/src/context/ThemeProvider.tsx](../../../../packages/ui/src/context/ThemeProvider.tsx) | 41 | hook / selected | `useStore((state: any) => state.themeMode ?? state.theme ?? 'system')` |
| [packages/ui/src/context/ThemeProvider.tsx](../../../../packages/ui/src/context/ThemeProvider.tsx) | 42 | hook / selected | `useStore((state: any) => state.setTheme ?? state.setThemeMode)` |
| [packages/ui/src/hooks/useNotificationPreferences.ts](../../../../packages/ui/src/hooks/useNotificationPreferences.ts) | 5 | hook / selected | `useStore((state) => state.user?.id)` |
| [packages/ui/src/screens/AppSettingsScreen.shared.tsx](../../../../packages/ui/src/screens/AppSettingsScreen.shared.tsx) | 64 | hook / selected | `useStore((state) => state.isDemoMode)` |
| [packages/ui/src/screens/AppSettingsScreen.shared.tsx](../../../../packages/ui/src/screens/AppSettingsScreen.shared.tsx) | 65 | hook / selected | `useStore((state) => state.setDemoMode)` |
| [packages/ui/src/screens/AppSettingsScreen.shared.tsx](../../../../packages/ui/src/screens/AppSettingsScreen.shared.tsx) | 66 | hook / selected | `useStore((state) => state.user)` |
| [packages/ui/src/screens/NotificationsScreen.tsx](../../../../packages/ui/src/screens/NotificationsScreen.tsx) | 108 | hook / selected | `useStore((state) => state.user)` |
| [packages/ui/src/screens/NotificationsScreen.tsx](../../../../packages/ui/src/screens/NotificationsScreen.tsx) | 109 | hook / selected | `useStore((state) => state.isOnline)` |
| [packages/ui/src/screens/OnboardingScreen.tsx](../../../../packages/ui/src/screens/OnboardingScreen.tsx) | 646 | hook / selected | `useStore((s) => s.isOnline)` |
| [packages/ui/src/screens/OnboardingScreen.tsx](../../../../packages/ui/src/screens/OnboardingScreen.tsx) | 647 | hook / selected | `useStore((s) => s.showToast)` |
| [packages/ui/src/screens/OnboardingScreen.web.tsx](../../../../packages/ui/src/screens/OnboardingScreen.web.tsx) | 513 | hook / selected | `useStore((s) => s.isOnline)` |
| [packages/ui/src/screens/OnboardingScreen.web.tsx](../../../../packages/ui/src/screens/OnboardingScreen.web.tsx) | 514 | hook / selected | `useStore((s) => s.showToast)` |
| [packages/ui/src/screens/OnboardingWrapper.tsx](../../../../packages/ui/src/screens/OnboardingWrapper.tsx) | 22 | hook / selected | `useStore((state) => state.user)` |
| [packages/ui/src/screens/OnboardingWrapper.tsx](../../../../packages/ui/src/screens/OnboardingWrapper.tsx) | 23 | hook / selected | `useStore((state) => state.showToast)` |
| [packages/ui/src/screens/OnboardingWrapper.tsx](../../../../packages/ui/src/screens/OnboardingWrapper.tsx) | 77 | getState | `useStore.getState()` |

## Reset, hydration and write ownership

[packages/core/src/store/resetScopedStores.ts](../../../../packages/core/src/store/resetScopedStores.ts) clears canonical scope and Cedar, resets Auth/Tenant/Perspective/UI/Growth/Feature, and clears only the queue's isSyncing flag. It deliberately retains queued commands. rehydrateScopedStores manually rehydrates Auth/Tenant/UI/Growth/Feature/MutationQueue. The middleware declarations also hydrate automatically unless skipHydration is set. This report does not infer a proven double-hydration bug, but the ordering and purpose of each hydration must be characterized.

Consent, sensory, drafts, conflict, audit, subtabs, entitlements, version gating and pending intent are not all covered by that one reset helper. Absence from this helper is a review lead, not proof of cross-account leakage: inspect accountTransition, guest leases, capability hydration, each resource's scope, and its dedicated reset path. An account switch must preserve pending work for its original principal while preventing it from entering the new principal's UI or replay lane.

[packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) is the supported scope writer and explicitly writes three compatibility stores before committing the canonical snapshot. Its generation guards and rollback are working behavior to preserve. Event-bus listeners provide Query disposal and capability invalidation; a file-local inspection alone cannot prove the complete ordering.

Storage route: stores → SafeZustandStorage → lib/storage → StorageManager → registered platform adapter. StorageManager begins with a MemoryStorageAdapter. Main native bootstrap selects AsyncStorage by default and opts into MMKV only under EXPO_PUBLIC_USE_MMKV=true plus runtime readiness. A second native/storage implementation also creates gurudevi-store. Trace actual import and boot reachability before consolidating these paths. The port exposes no reactive key subscription; direct MMKV hooks would need one stable app-owned instance and must respect core's platform-neutral boundary.

Sources: [packages/core/src/lib/storageWrapper.ts](../../../../packages/core/src/lib/storageWrapper.ts), [packages/core/src/logic/managers/StorageManager.ts](../../../../packages/core/src/logic/managers/StorageManager.ts), [packages/core/src/native/bootstrap.ts](../../../../packages/core/src/native/bootstrap.ts), [packages/core/src/native/storage.ts](../../../../packages/core/src/native/storage.ts).

## State outside named Zustand holders

| Holder or path | What it contributes | Review implication |
| --- | --- | --- |
| AuthProvider → useAuthLifecycle | Auth context plus lifecycle-local state/effects and store writes | Changing only useAuthStore leaves the actual acquisition/lifecycle owner untouched. |
| useScopedNotifications | Query-owned principal reads/counts/mutations and a reference-counted realtime registry | Already migrated; do not recreate a notification store. |
| useScopedDeviceSecurity → useDeviceSecurity | Query-owned summary, local command feedback, manager/outbox commands | Already migrated; do not recreate a security store. |
| useLocalFirstQuery and live-query helpers | Database observation / local-first reads | Assess by underlying owner; “data fetching” does not imply a Query cache is always needed. |
| SensoryProvider / sensoryFeedback / soundFeedback | Persisted context preferences, imperative service preference copy and player lifecycle | New dormant sensory store is a fourth arrangement, not convergence. |
| RealityProvider / FidelityProvider / experiencePolicy / VisualCapabilities | Device observations, user fidelity preference, derived policy, compatibility projection | They are not automatically duplicate GPU probes; measurement, preference and derivation are different roles. |
| CircadianProvider / TemporalProvider | Time-derived styling and context | Similar names do not prove identical semantics; CircadianProvider publishes styling variables. |
| FABProvider / MascotProvider | Route action registration/lifecycle and configurable mascot context | A static default does not prove all callers can use a constant; globalizing either could leak route/subtree ownership. |
| Portal host / WorldContext / WorldFonts | Native host structure and external subscriptions | A context is not automatically a redundant global store. |
| sovereignBus / managers / service caches | Event dispatch, observer sets, runtime adapters and lifecycle coordination | These are real state even when there is no useStore hook. |

The full context creation survey in the scanned scope follows. Low-level primitive contexts are included to prevent equating a context count with architectural debt. The wider-workspace reducer call count is 68; reducers are not presumed candidates for replacement.

| Source | Creation line |
| --- | ---: |
| [apps/edlove-web/app/components/ThemeProvider.tsx](../../../edlove-web/app/components/ThemeProvider.tsx) | 13 |
| [apps/gurudevi-mobile/src/interaction/soundFeedback.tsx](../../src/interaction/soundFeedback.tsx) | 17 |
| [apps/gurudevi-mobile/src/providers/AssetProvider.tsx](../../src/providers/AssetProvider.tsx) | 10 |
| [apps/gurudevi-mobile/src/somatic/SomaticPulseProvider.tsx](../../src/somatic/SomaticPulseProvider.tsx) | 22 |
| [apps/gurudevi-web/app/(sanctuary)/auth/AuthProvider.tsx](../../../gurudevi-web/app/%28sanctuary%29/auth/AuthProvider.tsx) | 13 |
| [apps/gurudevi-web/lib/workbench/WorkbenchScope.tsx](../../../gurudevi-web/lib/workbench/WorkbenchScope.tsx) | 6 |
| [packages/analytics/src/components/AnalyticsProvider.tsx](../../../../packages/analytics/src/components/AnalyticsProvider.tsx) | 11 |
| [packages/analytics/src/context/ActivityPulseContext.tsx](../../../../packages/analytics/src/context/ActivityPulseContext.tsx) | 15 |
| [packages/core/src/logic/experience/ActivityPulseContext.tsx](../../../../packages/core/src/logic/experience/ActivityPulseContext.tsx) | 22 |
| [packages/core/src/providers/AuthProvider.tsx](../../../../packages/core/src/providers/AuthProvider.tsx) | 19 |
| [packages/core/src/providers/CapabilityHydrationProvider.tsx](../../../../packages/core/src/providers/CapabilityHydrationProvider.tsx) | 20 |
| [packages/profile/src/navigation/ProfileNavigationContext.tsx](../../../../packages/profile/src/navigation/ProfileNavigationContext.tsx) | 20 |
| [packages/ui/src/components/maps/MapProvider.tsx](../../../../packages/ui/src/components/maps/MapProvider.tsx) | 10 |
| [packages/ui/src/components/Mascot.tsx](../../../../packages/ui/src/components/Mascot.tsx) | 37 |
| [packages/ui/src/components/TemporalProvider.tsx](../../../../packages/ui/src/components/TemporalProvider.tsx) | 13 |
| [packages/ui/src/components/TemporalProvider.web.tsx](../../../../packages/ui/src/components/TemporalProvider.web.tsx) | 11 |
| [packages/ui/src/components/ui/actionsheet/index.tsx](../../../../packages/ui/src/components/ui/actionsheet/index.tsx) | 33 |
| [packages/ui/src/components/ui/avatar/index.tsx](../../../../packages/ui/src/components/ui/avatar/index.tsx) | 13 |
| [packages/ui/src/components/ui/badge/index.tsx](../../../../packages/ui/src/components/ui/badge/index.tsx) | 16 |
| [packages/ui/src/components/ui/button/index.tsx](../../../../packages/ui/src/components/ui/button/index.tsx) | 24 |
| [packages/ui/src/components/ui/checkbox/index.tsx](../../../../packages/ui/src/components/ui/checkbox/index.tsx) | 26 |
| [packages/ui/src/components/ui/checkbox/index.tsx](../../../../packages/ui/src/components/ui/checkbox/index.tsx) | 34 |
| [packages/ui/src/components/ui/command/index.tsx](../../../../packages/ui/src/components/ui/command/index.tsx) | 15 |
| [packages/ui/src/components/ui/fab/index.tsx](../../../../packages/ui/src/components/ui/fab/index.tsx) | 19 |
| [packages/ui/src/components/ui/input/index.tsx](../../../../packages/ui/src/components/ui/input/index.tsx) | 20 |
| [packages/ui/src/components/ui/modal/index.tsx](../../../../packages/ui/src/components/ui/modal/index.tsx) | 30 |
| [packages/ui/src/components/ui/popover/index.tsx](../../../../packages/ui/src/components/ui/popover/index.tsx) | 12 |
| [packages/ui/src/components/ui/portal/index.tsx](../../../../packages/ui/src/components/ui/portal/index.tsx) | 54 |
| [packages/ui/src/components/ui/progress/index.tsx](../../../../packages/ui/src/components/ui/progress/index.tsx) | 18 |
| [packages/ui/src/components/ui/radio/index.tsx](../../../../packages/ui/src/components/ui/radio/index.tsx) | 22 |
| [packages/ui/src/components/ui/radio/index.tsx](../../../../packages/ui/src/components/ui/radio/index.tsx) | 30 |
| [packages/ui/src/components/ui/select/index.tsx](../../../../packages/ui/src/components/ui/select/index.tsx) | 20 |
| [packages/ui/src/components/ui/tabs/index.tsx](../../../../packages/ui/src/components/ui/tabs/index.tsx) | 13 |
| [packages/ui/src/components/ui/toast/index.tsx](../../../../packages/ui/src/components/ui/toast/index.tsx) | 23 |
| [packages/ui/src/components/workspace/shared.tsx](../../../../packages/ui/src/components/workspace/shared.tsx) | 24 |
| [packages/ui/src/context/ChatContext.tsx](../../../../packages/ui/src/context/ChatContext.tsx) | 42 |
| [packages/ui/src/context/CircadianProvider.tsx](../../../../packages/ui/src/context/CircadianProvider.tsx) | 16 |
| [packages/ui/src/context/FABContext.tsx](../../../../packages/ui/src/context/FABContext.tsx) | 37 |
| [packages/ui/src/context/FeedbackProvider.tsx](../../../../packages/ui/src/context/FeedbackProvider.tsx) | 14 |
| [packages/ui/src/context/FidelityProvider.tsx](../../../../packages/ui/src/context/FidelityProvider.tsx) | 21 |
| [packages/ui/src/context/LanguageProvider.tsx](../../../../packages/ui/src/context/LanguageProvider.tsx) | 19 |
| [packages/ui/src/context/RealityProvider.tsx](../../../../packages/ui/src/context/RealityProvider.tsx) | 35 |
| [packages/ui/src/context/SensoryProvider.tsx](../../../../packages/ui/src/context/SensoryProvider.tsx) | 28 |
| [packages/ui/src/context/ThemeProvider.tsx](../../../../packages/ui/src/context/ThemeProvider.tsx) | 32 |
| [packages/ui/src/providers/ErrorResolutionProvider.tsx](../../../../packages/ui/src/providers/ErrorResolutionProvider.tsx) | 15 |
| [packages/ui/src/providers/ToastProvider.tsx](../../../../packages/ui/src/providers/ToastProvider.tsx) | 45 |
| [packages/ui/src/world/native/WorldContext.tsx](../../../../packages/ui/src/world/native/WorldContext.tsx) | 25 |
| [packages/verger-react/src/VergerProvider.tsx](../../../../packages/verger-react/src/VergerProvider.tsx) | 28 |

External-subscription sites:

| Source | Line |
| --- | ---: |
| [apps/edlove-web/app/components/ThemeToggle.tsx](../../../edlove-web/app/components/ThemeToggle.tsx) | 10 |
| [apps/gurudevi-web/app/(sanctuary)/workspace/timetable/TimetableFloor.tsx](../../../gurudevi-web/app/%28sanctuary%29/workspace/timetable/TimetableFloor.tsx) | 368 |
| [apps/gurudevi-web/lib/explore/exploreCapacity.ts](../../../gurudevi-web/lib/explore/exploreCapacity.ts) | 145 |
| [apps/gurudevi-web/lib/workbench/useDomainWorkbench.ts](../../../gurudevi-web/lib/workbench/useDomainWorkbench.ts) | 41 |
| [packages/ui/src/components/ui/portal/index.tsx](../../../../packages/ui/src/components/ui/portal/index.tsx) | 65 |
| [packages/ui/src/world/native/WorldContext.tsx](../../../../packages/ui/src/world/native/WorldContext.tsx) | 29 |
| [packages/verger-react/src/VergerProvider.tsx](../../../../packages/verger-react/src/VergerProvider.tsx) | 150 |
| [packages/verger-react/src/VergerProvider.tsx](../../../../packages/verger-react/src/VergerProvider.tsx) | 161 |
| [packages/verger-react/src/VergerProvider.tsx](../../../../packages/verger-react/src/VergerProvider.tsx) | 170 |

## Wrapper hooks and indirect entry paths

The following 95 exported named use* hooks contain mapped calls to the audited holders. They are actual indirect access boundaries: a screen importing one may depend on a store without spelling its name. This table is derived from each exported declaration's source span, not a guess based on its filename. The full direct call ledger above includes calls inside these hooks. It does not automatically prove every importer executes the hook, nor follow arbitrary re-export/default/dynamic data flow. AuthProvider/useAuth also distributes the useAuthLifecycle result through context, so context consumers are another indirect path.

| Exported hook | Definition | Line | Store/facade calls | Owners read/accessed |
| --- | --- | ---: | ---: | --- |
| `useBootstrapRouteState` | [apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts](../../src/entry/bootstrapRouteState.ts) | 111 | 4 | `useStore`, `useEntitlementStore` |
| `useJourneyContext` | [apps/gurudevi-mobile/src/hooks/useJourneyContext.ts](../../src/hooks/useJourneyContext.ts) | 33 | 1 | `useStore` |
| `useSelfCanvas` | [apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts](../../src/hooks/useSelfCanvas.ts) | 45 | 5 | `useAuthStore`, `useActiveSubTabsStore` |
| `useTrackActiveSubTab` | [apps/gurudevi-mobile/src/hooks/useTrackActiveSubTab.ts](../../src/hooks/useTrackActiveSubTab.ts) | 11 | 1 | `useActiveSubTabsStore` |
| `useAcademicSubmissions` | [apps/gurudevi-web/lib/repositories/academicSubmissionsRepository.ts](../../../gurudevi-web/lib/repositories/academicSubmissionsRepository.ts) | 127 | 3 | `useMutationQueue` |
| `useClimateSensing` | [apps/gurudevi-web/lib/repositories/climateSensingRepository.ts](../../../gurudevi-web/lib/repositories/climateSensingRepository.ts) | 69 | 2 | `useMutationQueue` |
| `useCommunityChat` | [apps/gurudevi-web/lib/repositories/communityChatRepository.ts](../../../gurudevi-web/lib/repositories/communityChatRepository.ts) | 92 | 2 | `useMutationQueue` |
| `useTuition` | [apps/gurudevi-web/lib/repositories/tuitionRepository.ts](../../../gurudevi-web/lib/repositories/tuitionRepository.ts) | 137 | 2 | `useMutationQueue` |
| `useFounderEcosystemStats` | [packages/admin/src/bridge/founderWorkspace.ts](../../../../packages/admin/src/bridge/founderWorkspace.ts) | 111 | 1 | `useStore` |
| `useFounderSchoolStats` | [packages/admin/src/bridge/founderWorkspace.ts](../../../../packages/admin/src/bridge/founderWorkspace.ts) | 276 | 2 | `useTemporalStore`, `useStore` |
| `useSchoolPulseQuery` | [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 21 | 2 | `useTemporalStore` |
| `useMappingTopologyQuery` | [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 39 | 1 | `useTemporalStore` |
| `useSchoolStatsQuery` | [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 54 | 2 | `useTemporalStore`, `useStore` |
| `useStaffResonance` | [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 96 | 1 | `useTemporalStore` |
| `useCurriculumPulse` | [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 124 | 1 | `useTemporalStore` |
| `useOperationalAwareness` | [packages/admin/src/hooks/useDashboardHooks.ts](../../../../packages/admin/src/hooks/useDashboardHooks.ts) | 146 | 1 | `useTemporalStore` |
| `useSchoolStats` | [packages/admin/src/hooks/useSchoolStats.ts](../../../../packages/admin/src/hooks/useSchoolStats.ts) | 10 | 3 | `useStore`, `useTemporalStore` |
| `useAIAgent` | [packages/ai/src/hooks/useAIAgent.ts](../../../../packages/ai/src/hooks/useAIAgent.ts) | 119 | 2 | `useStore` |
| `useClassroomProfile` | [packages/classroom/src/hooks/useClassroomProfile.ts](../../../../packages/classroom/src/hooks/useClassroomProfile.ts) | 7 | 1 | `useMutationQueue` |
| `useClassroomRoleData` | [packages/classroom/src/hooks/useClassroomRoleData.ts](../../../../packages/classroom/src/hooks/useClassroomRoleData.ts) | 34 | 4 | `useAuthStore`, `useTenantStore` |
| `useGradebook` | [packages/classroom/src/hooks/useGradebook.ts](../../../../packages/classroom/src/hooks/useGradebook.ts) | 30 | 1 | `useStore` |
| `useLearningReflections` | [packages/classroom/src/hooks/useLearningReflections.ts](../../../../packages/classroom/src/hooks/useLearningReflections.ts) | 23 | 2 | `useStore`, `useTemporalStore` |
| `useResources` | [packages/classroom/src/hooks/useResources.ts](../../../../packages/classroom/src/hooks/useResources.ts) | 15 | 1 | `useStore` |
| `useSchoolStats` | [packages/classroom/src/hooks/useSchoolStats.ts](../../../../packages/classroom/src/hooks/useSchoolStats.ts) | 18 | 4 | `useStore`, `useTemporalStore` |
| `useScopedAttendanceRegister` | [packages/classroom/src/hooks/useScopedAttendanceRegister.ts](../../../../packages/classroom/src/hooks/useScopedAttendanceRegister.ts) | 66 | 2 | `useScopeSessionStore` |
| `useStudentRegistry` | [packages/classroom/src/hooks/useStudentDashboardHooks.ts](../../../../packages/classroom/src/hooks/useStudentDashboardHooks.ts) | 16 | 1 | `useAuthStore` |
| `useStudentQuestsPulse` | [packages/classroom/src/hooks/useStudentDashboardHooks.ts](../../../../packages/classroom/src/hooks/useStudentDashboardHooks.ts) | 33 | 1 | `useAuthStore` |
| `useTeacherRegistry` | [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 14 | 1 | `useAuthStore` |
| `useTeacherAssignmentsPulse` | [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 31 | 1 | `useAuthStore` |
| `useTeacherEchoesPulse` | [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 53 | 1 | `useAuthStore` |
| `useTeacherTemporalSnapshot` | [packages/classroom/src/hooks/useTeacherDashboardHooks.ts](../../../../packages/classroom/src/hooks/useTeacherDashboardHooks.ts) | 83 | 1 | `useAuthStore` |
| `usePlanBridge` | [packages/classroom/src/planBridge/usePlanBridge.ts](../../../../packages/classroom/src/planBridge/usePlanBridge.ts) | 23 | 1 | `useStore` |
| `useStudentClassroomWorkspaceData` | [packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts](../../../../packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts) | 31 | 1 | `useAuthStore` |
| `useStudentWorkspaceData` | [packages/classroom/src/workspace/useStudentWorkspaceData.ts](../../../../packages/classroom/src/workspace/useStudentWorkspaceData.ts) | 15 | 3 | `useStore`, `useAuthStore` |
| `useTeacherClassroomWorkspaceData` | [packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts](../../../../packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts) | 13 | 1 | `useStore` |
| `useTeacherWorkspaceShell` | [packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx](../../../../packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx) | 21 | 4 | `useStore`, `useTemporalStore` |
| `useCommunity` | [packages/community/src/hooks/useCommunity.ts](../../../../packages/community/src/hooks/useCommunity.ts) | 19 | 3 | `useStore`, `useTemporalStore` |
| `useSocialShield` | [packages/community/src/hooks/useSocialShield.ts](../../../../packages/community/src/hooks/useSocialShield.ts) | 9 | 1 | `useStore` |
| `useCommentHooks` | [packages/core/src/api/hooks/comment.hooks.ts](../../../../packages/core/src/api/hooks/comment.hooks.ts) | 15 | 1 | `useAuthStore` |
| `usePostsInfiniteQuery` | [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 57 | 2 | `useTemporalStore` |
| `useCreatePostMutation` | [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 81 | 2 | `useStore`, `useAuthStore` |
| `useToggleReactionMutation` | [packages/core/src/api/hooks/community.hooks.ts](../../../../packages/core/src/api/hooks/community.hooks.ts) | 114 | 2 | `useTemporalStore` |
| `usePollHooks` | [packages/core/src/api/hooks/poll.hooks.ts](../../../../packages/core/src/api/hooks/poll.hooks.ts) | 16 | 1 | `useAuthStore` |
| `useSocialShieldHooks` | [packages/core/src/api/hooks/social.hooks.ts](../../../../packages/core/src/api/hooks/social.hooks.ts) | 9 | 1 | `useStore` |
| `useAuthLifecycle` | [packages/core/src/hooks/useAuthLifecycle.ts](../../../../packages/core/src/hooks/useAuthLifecycle.ts) | 42 | 9 | `useStore`, `useScopeSessionStore` |
| `useBanyanGrowth` | [packages/core/src/hooks/useBanyanGrowth.ts](../../../../packages/core/src/hooks/useBanyanGrowth.ts) | 11 | 4 | `useGrowthStore` |
| `useDeviceSecurity` | [packages/core/src/hooks/useDeviceSecurity.ts](../../../../packages/core/src/hooks/useDeviceSecurity.ts) | 23 | 2 | `useAuthStore`, `useMutationQueue` |
| `useDomainRollout` | [packages/core/src/hooks/useDomainRollout.ts](../../../../packages/core/src/hooks/useDomainRollout.ts) | 6 | 1 | `useFeatureStore` |
| `useFeatureRegistry` | [packages/core/src/hooks/useFeatureRegistry.ts](../../../../packages/core/src/hooks/useFeatureRegistry.ts) | 22 | 4 | `useCedarDecisionStore`, `useEntitlementStore`, `useFeatureStore` |
| `useIsGuest` | [packages/core/src/hooks/useIsGuest.ts](../../../../packages/core/src/hooks/useIsGuest.ts) | 7 | 1 | `useAuthStore` |
| `useJourneyHistory` | [packages/core/src/hooks/useJourneyHistory.ts](../../../../packages/core/src/hooks/useJourneyHistory.ts) | 29 | 1 | `useTemporalStore` |
| `useLocalFirstQuery` | [packages/core/src/hooks/useLocalFirstQuery.ts](../../../../packages/core/src/hooks/useLocalFirstQuery.ts) | 37 | 3 | `useAuthStore`, `useStore`, `useTemporalStore` |
| `useManualSnapshot` | [packages/core/src/hooks/useManualSnapshot.ts](../../../../packages/core/src/hooks/useManualSnapshot.ts) | 22 | 1 | `useTemporalStore` |
| `useNaturePaths` | [packages/core/src/hooks/useNaturePaths.ts](../../../../packages/core/src/hooks/useNaturePaths.ts) | 11 | 5 | `useGrowthStore` |
| `usePerspectiveSwitch` | [packages/core/src/hooks/usePerspectiveSwitch.ts](../../../../packages/core/src/hooks/usePerspectiveSwitch.ts) | 31 | 7 | `useScopeSessionStore`, `usePerspectiveStore`, `useAuthStore` |
| `useRewards` | [packages/core/src/hooks/useRewards.ts](../../../../packages/core/src/hooks/useRewards.ts) | 16 | 4 | `useAuthStore`, `useTemporalStore` |
| `useSafeMutation` | [packages/core/src/hooks/useSafeMutation.ts](../../../../packages/core/src/hooks/useSafeMutation.ts) | 96 | 4 | `useAuthStore`, `useMutationQueue`, `useMutationAuditLog` |
| `useSanctuaryVisitor` | [packages/core/src/hooks/useSanctuaryVisitor.ts](../../../../packages/core/src/hooks/useSanctuaryVisitor.ts) | 27 | 2 | `useAuthStore` |
| `useScopedDeviceSecurity` | [packages/core/src/hooks/useScopedDeviceSecurity.ts](../../../../packages/core/src/hooks/useScopedDeviceSecurity.ts) | 54 | 2 | `useScopeSessionStore` |
| `useScopedNotifications` | [packages/core/src/hooks/useScopedNotifications.ts](../../../../packages/core/src/hooks/useScopedNotifications.ts) | 168 | 4 | `useScopeSessionStore`, `useAuthStore` |
| `useTenantContext` | [packages/core/src/hooks/useTenantContext.ts](../../../../packages/core/src/hooks/useTenantContext.ts) | 5 | 1 | `useStore` |
| `useOptimisticMerge` | [packages/core/src/lib/sync/hooks/useOptimisticMerge.ts](../../../../packages/core/src/lib/sync/hooks/useOptimisticMerge.ts) | 55 | 1 | `useMutationQueue` |
| `useSyncStatus` | [packages/core/src/lib/sync/hooks/useSyncStatus.ts](../../../../packages/core/src/lib/sync/hooks/useSyncStatus.ts) | 32 | 2 | `useMutationQueue` |
| `usePermissions` | [packages/core/src/logic/permissions/hooks/usePermissions.ts](../../../../packages/core/src/logic/permissions/hooks/usePermissions.ts) | 45 | 9 | `useAuthStore`, `usePerspectiveStore`, `useTenantStore`, `useFeatureStore`, `useCedarDecisionStore`, `useEntitlementStore` |
| `useSanctuaryFeature` | [packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts](../../../../packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts) | 17 | 4 | `useCedarDecisionStore`, `useEntitlementStore`, `useFeatureStore` |
| `useLibraryRealtime` | [packages/library/src/hooks/useLibrary.ts](../../../../packages/library/src/hooks/useLibrary.ts) | 37 | 1 | `useAuthStore` |
| `useCommunityProfile` | [packages/profile/src/hooks/useCommunityProfile.ts](../../../../packages/profile/src/hooks/useCommunityProfile.ts) | 39 | 4 | `useStore`, `useTemporalStore` |
| `useProfile` | [packages/profile/src/hooks/useProfile.ts](../../../../packages/profile/src/hooks/useProfile.ts) | 60 | 5 | `useAuthStore`, `useStore`, `useMutationQueue`, `useTemporalStore` |
| `useProfileHistory` | [packages/profile/src/hooks/useProfileHistory.ts](../../../../packages/profile/src/hooks/useProfileHistory.ts) | 32 | 2 | `useAuthStore`, `useStore` |
| `useRewardedAdHub` | [packages/profile/src/hooks/useRewardedAdHub.ts](../../../../packages/profile/src/hooks/useRewardedAdHub.ts) | 11 | 1 | `useStore` |
| `useSchoolProfile` | [packages/profile/src/hooks/useSchoolProfile.ts](../../../../packages/profile/src/hooks/useSchoolProfile.ts) | 33 | 1 | `useMutationQueue` |
| `useSchoolPulse` | [packages/profile/src/hooks/useSchoolPulse.ts](../../../../packages/profile/src/hooks/useSchoolPulse.ts) | 36 | 2 | `useTemporalStore` |
| `useSocialLinks` | [packages/profile/src/hooks/useSocialLinks.ts](../../../../packages/profile/src/hooks/useSocialLinks.ts) | 42 | 2 | `useAuthStore`, `useStore` |
| `useDecisionJournal` | [packages/self/src/hooks/useDecisionJournal.ts](../../../../packages/self/src/hooks/useDecisionJournal.ts) | 15 | 2 | `useStore`, `useTemporalStore` |
| `useEnergyForecast` | [packages/self/src/hooks/useEnergyForecast.ts](../../../../packages/self/src/hooks/useEnergyForecast.ts) | 18 | 2 | `useStore`, `useTemporalStore` |
| `useFireJournal` | [packages/self/src/hooks/useFireJournal.ts](../../../../packages/self/src/hooks/useFireJournal.ts) | 21 | 3 | `useStore`, `useTemporalStore` |
| `useGratitude` | [packages/self/src/hooks/useGratitude.ts](../../../../packages/self/src/hooks/useGratitude.ts) | 15 | 1 | `useStore` |
| `useJournalEntries` | [packages/self/src/hooks/useJournalEntries.ts](../../../../packages/self/src/hooks/useJournalEntries.ts) | 11 | 2 | `useStore`, `useTemporalStore` |
| `useJourneyData` | [packages/self/src/hooks/useJourneyData.ts](../../../../packages/self/src/hooks/useJourneyData.ts) | 30 | 1 | `useTemporalStore` |
| `useJoyJar` | [packages/self/src/hooks/useJoyJar.ts](../../../../packages/self/src/hooks/useJoyJar.ts) | 15 | 1 | `useStore` |
| `useMoodLogs` | [packages/self/src/hooks/useMoodLogs.ts](../../../../packages/self/src/hooks/useMoodLogs.ts) | 23 | 2 | `useStore`, `useTemporalStore` |
| `useProgressTree` | [packages/self/src/hooks/useProgressTree.ts](../../../../packages/self/src/hooks/useProgressTree.ts) | 8 | 2 | `useStore`, `useTemporalStore` |
| `useSanctuaryRegistry` | [packages/self/src/hooks/useSanctuaryRegistry.ts](../../../../packages/self/src/hooks/useSanctuaryRegistry.ts) | 10 | 1 | `useFeatureStore` |
| `useSelfNavigatorMode` | [packages/self/src/hooks/useSelfNavigatorMode.ts](../../../../packages/self/src/hooks/useSelfNavigatorMode.ts) | 15 | 1 | `useFeatureStore` |
| `useSleepTracker` | [packages/self/src/hooks/useSleepTracker.ts](../../../../packages/self/src/hooks/useSleepTracker.ts) | 15 | 1 | `useStore` |
| `useStudentGoals` | [packages/self/src/hooks/useStudentGoals.ts](../../../../packages/self/src/hooks/useStudentGoals.ts) | 12 | 2 | `useStore`, `useTemporalStore` |
| `useStudentGrades` | [packages/self/src/hooks/useStudentGrades.ts](../../../../packages/self/src/hooks/useStudentGrades.ts) | 17 | 1 | `useStore` |
| `useThoughtRecords` | [packages/self/src/hooks/useThoughtRecords.ts](../../../../packages/self/src/hooks/useThoughtRecords.ts) | 22 | 2 | `useStore`, `useTemporalStore` |
| `useTimetable` | [packages/self/src/hooks/useTimetable.ts](../../../../packages/self/src/hooks/useTimetable.ts) | 16 | 1 | `useStore` |
| `useTomorrowPrep` | [packages/self/src/hooks/useTomorrowPrep.ts](../../../../packages/self/src/hooks/useTomorrowPrep.ts) | 13 | 1 | `useStore` |
| `useWisdom` | [packages/self/src/hooks/useWisdom.ts](../../../../packages/self/src/hooks/useWisdom.ts) | 15 | 2 | `useStore`, `useTemporalStore` |
| `useEnvironment` | [packages/ui/src/context/EnvironmentContext.tsx](../../../../packages/ui/src/context/EnvironmentContext.tsx) | 40 | 1 | `useAuthStore` |
| `useDemoBridge` | [packages/ui/src/hooks/useDemoBridge.ts](../../../../packages/ui/src/hooks/useDemoBridge.ts) | 12 | 5 | `useAuthStore` |
| `useNotificationPreferences` | [packages/ui/src/hooks/useNotificationPreferences.ts](../../../../packages/ui/src/hooks/useNotificationPreferences.ts) | 4 | 1 | `useStore` |
| `useScrollChromeCollapser` | [packages/ui/src/hooks/useScrollChromeCollapser.ts](../../../../packages/ui/src/hooks/useScrollChromeCollapser.ts) | 16 | 3 | `useActiveSubTabsStore` |

Representative entry trace: EntryShell → GlobalProvider → AuthProvider → useAuthLifecycle → underlying store/facade calls. CapabilityHydrationProvider and authenticated services form additional scope/entitlement/decision paths. The source-linked tables preserve each actual direct boundary; they do not pretend source import reachability is a measured mount graph.

## Reproduction and limitations

Run the existing tools first:

~~~powershell
node scripts/audit-state-architecture.mjs
node scripts/audit-state-architecture.mjs --json
node scripts/codegraph.mjs callers useStore --json
node scripts/codegraph.mjs blast-radius packages/core/src/store/useStore.ts --json
rg -n 'useStore|useAuthStore|useTemporalStore|pendingIntentStore' apps packages -g '*.ts' -g '*.tsx' -g '!**/node_modules/**' -g '!**/docs/**'
~~~

The supplemental AST traversal was performed in the persistent analysis session using the installed Babel parser; no new production scanner or report pipeline was added. It enumerated imports and create/createStore initializers, classified direct call/member-call expressions, followed named aliases and the pendingIntentStore forwarding object, and retained exact source/line locations in the ledger above. The appendix is the retained inspection artifact; the existing lexical scanner cannot reproduce its counts exactly. This limitation is explicit rather than describing CodeGraph's lexical importer index as whole-program AST truth.

G0 source inspection / Babel parser + existing lexical audit: 2,931 supplemental files parsed; zero parse failures. Proves the named source declarations and mapped call expressions within the stated traversal. Does not prove mounting, native bundling, render frequency, account-transition correctness, disk durability, or physical-device performance. No runtime tests or G5 journey were executed for this inventory.

## Post-inventory Feature retirement (2026-10-26)

The tables above are the original audit snapshot. createFeatureSlice/FeatureSlice, both feature.slice.ts paths and the old flags/snapshot persistence facade are now retired. Current useFeatureStore owns one SDK evaluation with bindContext/clear, qualified snapshot restore and expiry. Existing flag readers remain consumers of its atomic projection. Consult the execution log for current evidence and open SDK freshness/offline-context limits; old line numbers and recomputeFlags/applySnapshot entries above describe the pre-cut substrate.
