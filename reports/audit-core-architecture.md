# 🏛️ sovereign_audit:architecture - @repo/core
> **Timestamp:** 2026-04-27T02:55:11.299Z
> **Target Path:** `C:\Users\Naween\projects\polymath-platform\packages\core`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 48 |
| **Hygiene Warnings** | 25 |
| **Subpath Exports** | 9 subpaths |

## ⚠️ Hygiene Warnings
- Mixed UUID versions detected: v4 (1 files) and v7 (7 files). Standardize on v7.
- Wildcard export in src/index.ts
- Wildcard export in src/api/index.ts
- Wildcard export in src/logic/experience/index.ts
- Wildcard export in src/logic/workspace/index.ts
- Wildcard export in src/logic/entities/index.ts
- Wildcard export in src/logic/utils/index.ts
- Wildcard export in src/logic/index.ts
- Wildcard export in src/logic/store-slices/index.ts
- Wildcard export in src/logic/domains/attendanceProjection/index.ts
- Wildcard export in src/lib/sync/index.ts
- Wildcard export in src/logic/permissions/index.ts
- Wildcard export in src/logic/schemas/index.ts
- Wildcard export in src/logic/i18n/index.ts
- Wildcard export in src/logic/domains/workspaceLayout/index.ts
- Wildcard export in src/logic/domains/gradingProjection/index.ts
- Wildcard export in src/logic/generated/index.ts
- Wildcard export in src/logic/domains/educational/index.ts
- Wildcard export in src/logic/domains/index.ts
- Wildcard export in src/logic/forms/index.ts
- Wildcard export in src/logic/domains/teacherInsights/index.ts
- Wildcard export in src/logic/domains/founder/index.ts
- Wildcard export in src/logic/domains/classroomNotes/index.ts
- Wildcard export in src/logic/domains/principalWorkspace/index.ts
- Wildcard export in src/logic/domains/guardian/index.ts

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **NATIVE POLLUTION** | `./hooks/useClassroomCreation.ts` | 1:import AsyncStorage from '@react-native-async-storage/async-storage'; | N/A |
| **NATIVE POLLUTION** | `./hooks/useAuthorityLifecycle.ts` | 3:import { Platform } from 'react-native'; | N/A |
| **STATE DENSITY** | `native/useWorkspaceLayoutSync.ts` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `native/useAuthorityLifecycle.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useEntity.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useDeviceAccounts.ts` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useTeacherClassroom.ts` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useStudentGoals.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useSafeMutation.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useClassroomCreation.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useBanyanGrowth.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/usePendingGateAction.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useAuthorityLifecycle.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/usePendingActions.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useNotifications.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useNaturePaths.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useGroupCreation.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **SUBSCRIPTION** | `./store/useStore.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./store/useStore.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./store/useStore.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./store/useStore.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./hooks/useManualSnapshot.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./hooks/useJourneyHistory.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **PLATFORM LEAK** | `./adapters/WebNetworkAdapter.ts` | Web-only API usage detected in mobile/shared file: 9:    return typeof navigator !== 'undefined' ? navigator.onLine : true; | N/A |
| **PLATFORM LEAK** | `./adapters/supabase/guardianRepository.ts` | Web-only API usage detected in mobile/shared file: 102:      for (const document of documents) { | N/A |
| **PLATFORM LEAK** | `./adapters/supabase/guardianRepository.ts` | Web-only API usage detected in mobile/shared file: 105:          id: document.id ?? crypto.randomUUID(), | N/A |
| **PLATFORM LEAK** | `./adapters/supabase/guardianRepository.ts` | Web-only API usage detected in mobile/shared file: 107:          uploadedAt: document.uploadedAt ?? new Date().toISOString(), | N/A |
| **PLATFORM LEAK** | `./adapters/supabase/guardianRepository.ts` | Web-only API usage detected in mobile/shared file: 108:          status: document.status ?? 'pending', | N/A |
| **PLATFORM LEAK** | `./adapters/supabase/guardianRepository.ts` | Web-only API usage detected in mobile/shared file: 112:          throw new APIError('Failed to upload guardian verification document', error.code, error); | N/A |
| **PLATFORM LEAK** | `./api/contextualChallenges.ts` | Web-only API usage detected in mobile/shared file: 58:  | 'expired' // Time window passed; not yet reached (no shame, just reset) | N/A |
| **PLATFORM LEAK** | `./api/growthSignals.ts` | Web-only API usage detected in mobile/shared file: 376:      // 3+ fire journal entries within any 7-day window | N/A |
| **PLATFORM LEAK** | `./logic/forms/analytics.ts` | Web-only API usage detected in mobile/shared file: 125:    const publicURL = `${window.location.origin}/form/${slug}`; | N/A |
| **PLATFORM LEAK** | `./api/impactRipples.ts` | Web-only API usage detected in mobile/shared file: 232:   * Returns the last N delivered ripples within the specified window. | N/A |
| **SHIM DEBT** | `./native/useWorkspaceLayoutSync.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/supabaseAuthStorage.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/supabaseAuthStorage.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/supabaseAuthStorage.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/supabase.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/storage.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/storage.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/storage.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/sentry.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/sentry.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/sentry.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/sentry.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/sentry.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/runtime.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
| **SHIM DEBT** | `./native/bootstrap.ts` | Inline platform branching detected. Prefer .native.ts / .web.ts shims for logic. | N/A |
