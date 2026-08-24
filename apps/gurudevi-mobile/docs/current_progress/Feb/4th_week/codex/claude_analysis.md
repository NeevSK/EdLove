---
title: "claude analysis"
status: "active"
created: 2026-02-25
updated: 2026-03-20
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

## Codebase Exploration Report — polymath-platform
Show less
### 1. Error Handling Patterns
**Centralized Error Handler:**
- **File**: `C:\Users\Naween\projects\polymath-platform\packages\core\src\lib\apiInterceptor.ts`
- **Key Pattern**: 
  - `handleAPIError(error, silent?)` function that:
    - Maps technical errors to teacher-friendly "Sanctuary" messages
    - Handles network errors, auth errors (JWT, PGRST116), PostgREST DB codes (23505, 23503, 42P01, 42501)
    - Logs original error to console + friendly message
    - Shows toast via `useStore.getState().showToast()`
    - Includes placeholder for Sentry integration
**API Error Class:**
- **File**: `C:\Users\Naween\projects\polymath-platform\packages\core\src\api\types.ts`
- **Structure**:
  ```typescript
  export class APIError extends Error {
      constructor(message: string, public code?: string, public details?: any)
  }
  ```
**API Implementation Pattern:**
- **Files**: `packages/core/src/api/school.ts`, `packages/core/src/api/rewards.ts`, `packages/core/src/api/inventory.ts`, `packages/core/src/api/tracking.ts`
- **Pattern**: Every API method wraps Supabase calls in try-catch, throws `new APIError()` with error.code
- **Example** (school.ts):
  ```typescript
  try {
      const { data, error } = await supabase.from('schools').insert([...]).select().single();
      if (error) {
          throw new APIError('Failed to create school', error.code, error);
      }
      return data;
  } catch (error: any) {
      throw new APIError('Failed to create school', 'CREATE_FAILED', error);
  }
  ```
**Hook-Level Error Handling:**
- **File**: `C:\Users\Naween\projects\polymath-platform\packages\core\src\hooks\useSafeMutation.ts`
- **Features**:
  - Optimistic updates via `onMutate` callback
  - Exponential backoff retries (configurable, default 3)
  - Network status awareness via `NetInfo`
  - Offline detection → automatic queueing
  - `onError` callback for custom error handling
---
### 2. Core Utilities in `packages/core/src/lib/`
| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client init (AsyncStorage for auth persistence) |
| `storage.ts` | Dual-layer storage: **MMKV** (primary, fast) + **RobustAsyncStorage** fallback (Expo Go) with in-memory cache |
| `storageWrapper.ts` | `SafeZustandStorage` — Zustand middleware wrapping MMKV/AsyncStorage |
| `apiInterceptor.ts` | Global error mapper + `handleAPIError()`, `withErrorHandling()` wrapper |
| `grading.ts` | Grading calculation utilities |
| `cloudinary.ts` | Media upload integration |
| `mediaUtils.ts` | Image/media processing |
| `permissions.ts` | Role-based access control |
| `authorization.ts` | Auth state validation |
| `guestDataManager.ts` | Guest/demo data lifecycle |
| `sync/types.ts` | Mutation queue type definitions |
| `sync/useMutationQueue.ts` | Zustand store for offline mutation queue |
| `monitoring/sentry.ts` | Error tracking setup |
| `monitoring/posthog.ts` | Analytics integration |
---
### 3. Store Architecture
**File**: `C:\Users\Naween\projects\polymath-platform\packages\core\src\store\useStore.ts`
**Tech**: Zustand + persist middleware + `SafeZustandStorage`
**AppState Shape**:
```typescript
interface AppState {
    // User/Auth
    user: User | null;
    userRole: UserRole | null;
    teacherName: string;
    schoolType: SchoolType | null;
    
    // UI/Theme
    themeMode: ThemeMode; // 'light' | 'dark' | 'auto' | 'system'
    toast: { message: string; type: 'success' | 'error' | 'info'; visible: boolean };
    
    // Onboarding
    onboardingCompleted: boolean;
    justFinishedOnboarding: boolean;
    
    // Mode/Feature Flags
    isDemoMode: boolean;
    isExplorerMode: boolean;
    isBridging: boolean;
    
    // Network
    isOnline: boolean;
    networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
    
    // Local State
    dismissedSampleIds: string[];
    demoLogs: Array<{ module: string; method: string; payload: any; timestamp: number }>;
    deskItems: DeskItem[]; // Personal Desk items
}
```
**Persistence**: `partialize` includes user, userRole, schoolType, themeMode, onboardingCompleted, isExplorerMode, dismissedSampleIds, deskItems — NOT demoLogs, justFinishedOnboarding, isBridging, toast (session-only).
---
### 4. Async Storage & Persistence Patterns
**Dual-Layer Storage** (`packages/core/src/lib/storage.ts`):
1. **MMKV** (react-native-mmkv) — fast, native, primary
2. **RobustAsyncStorage** — fallback for Expo Go, in-memory cache + AsyncStorage
   - Synchronous `getString()` / `getBoolean()` / `getNumber()` (from cache)
   - Async `getStringAsync()` (resolves from storage)
   - Background persistence via `AsyncStorage.setItem()`
**StorageKeys Enum**:
```typescript
export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};
```
**Mutation Queue Persistence**:
- **File**: `packages/core/src/lib/sync/useMutationQueue.ts`
- Zustand store with `persist()` middleware
- Persisted to `SafeZustandStorage` with key `'gurudevi-mutation-queue'`
---
### 5. Mutation Queue & Sync Architecture
**Offline-First Design**:
**Types** (`packages/core/src/lib/sync/types.ts`):
```typescript
export type MutationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';
export interface QueuedMutation {
    id: string; // UUID
    type: MutationType;
    scope: string; // 'community', 'classroom', 'self'
    name: string; // 'createPost', 'updateAttendance'
    variables: any;
    timestamp: number;
    retryCount: number;
}
export interface MutationQueueState {
    queue: QueuedMutation[];
    isSyncing: boolean;
    addToQueue: (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => void;
    removeFromQueue: (id: string) => void;
    updateMutation: (id: string, updates: Partial<QueuedMutation>) => void;
    clearQueue: () => void;
    setSyncing: (isSyncing: boolean) => void;
}
```
**Outbox Pattern**:
**File**: `apps/gurudevi-mobile/src/lib/sync/SyncManager.tsx`
- Headless component that watches `useStore.isOnline` + `useMutationQueue.queue`
- When online + queue > 0: starts `processQueue()`
- Replays each mutation via `MUTATION_REGISTRY[item.name](item.variables)`
- Removes on success, increments `retryCount` on failure
- Discards after MAX_RETRIES (3)
- Shows toast: `"Synced N pending actions"` or `"N actions failed to sync"`
**Mutation Registry** (`apps/gurudevi-mobile/src/lib/sync/registry.ts`):
```typescript
export const MUTATION_REGISTRY: Record<string, MutationFunction> = {
    'createPost': async (vars) => api.community.createPost(...),
    'createInventoryRequest': async (vars) => api.inventory.createRequest(vars),
    'createResource': async (vars) => api.resources.create(vars),
    'toggleResourcePin': async (vars) => api.resources.togglePin(vars.id, vars.isPinned),
    'deleteResource': async (vars) => api.resources.delete(vars),
    'saveJournalEntry': async (vars) => supabase.from('journal_entries').insert(vars),
    'saveDecision': async (vars) => supabase.from('decision_journals').insert(vars),
};
```
**useSafeMutation Hook** (the enqueuing mechanism):
- Detects offline via `NetInfo.fetch()`
- On offline or exhausted retries: calls `addToQueue()` with mutation name + scope
- Returns optimistic null result
- Toast: `"Saved to Outbox (Offline)"`
---
### 6. Component Performance Patterns
**Found `useMemo`/`useCallback` usage in**:
- `GradebookTable.tsx` — memo-ized rows for large datasets
- `ReportCard.tsx` — computed stats (memoized)
- `AddStudentModal.tsx` — form submission handlers
- `ClassroomList.tsx` — list item rendering
**TeacherDashboard** (`packages/classroom/src/components/TeacherDashboard.tsx`):
- ~200+ lines
- Uses local state: `classrooms`, `stats`, `pendingRequests`
- Callback: `handleClassroomsLoaded()` to update on list change
- Modal state management for create/feedback/admin/scanner
---
### 7. API Structure Summary
All API modules follow **consistent error handling**:
- Wrap Supabase calls
- Check `if (error) throw new APIError(...)`
- Return data or empty arrays
- Exported as singleton objects (schoolAPI, inventoryAPI, rewardsAPI, trackingAPI, etc.)
**Sample APIs in packages/core/src/api/**:
- assignments, attendance, auth, classroom, classrooms, classroomStudents
- demo, demoProvider, grading, groups, inventory, lessonMaterials
- resources, rewards, sacredMissions, teacher, tracking, onboarding
- school, agents, thuthimal, dailyContent
---
## Summary Table
| Aspect | Location | Key Details |
|--------|----------|------------|
| **Error Handling** | `lib/apiInterceptor.ts` | `handleAPIError()`, friendly Sanctuary messages, toast integration |
| **Store** | `store/useStore.ts` | Zustand + persist, user/auth/ui/theme/network state |
| **Storage** | `lib/storage.ts` | MMKV + RobustAsyncStorage fallback, in-memory cache |
| **Mutation Queue** | `lib/sync/{types,useMutationQueue}.ts` | Persistent outbox, QueuedMutation type, Zustand-backed |
| **Offline Sync** | `apps/.../lib/sync/SyncManager.tsx` | Headless orchestrator, retry logic, MUTATION_REGISTRY |
| **Safe Mutations** | `hooks/useSafeMutation.ts` | Optimistic updates, exponential backoff, offline detection, queueing |
| **APIs** | `api/*.ts` | Consistent error wrapping with APIError class |
| **Utilities** | `lib/{supabase, permissions, authorization, grading, media}` | Config, RBAC, calculation, upload helpers |
