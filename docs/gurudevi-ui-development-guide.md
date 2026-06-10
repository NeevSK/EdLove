# Gurudevi UI Development Guide
## Screen Architecture, Data Flow, Caching, Performance, Quality
### For React Native / Expo Developers

---

## PART 0: FOUNDATIONAL PRINCIPLES (Not Patterns)

Before code, understand what code serves:

```
Every screen in Gurudevi embodies:

1. PERSPECTIVE BOND INTEGRITY
   The user's role (Teacher, Student, Principal) defines what they see.
   Not by hiding/showing UI. By fetching only data they have rights to.
   
2. HOLON BOUNDARIES
   A screen shows a complete context (classroom, self, community).
   It does not drill up into parent's private data.
   It does not drill down into children's sovereign spaces.
   
3. AUTOPOIETIC ARCHITECTURE
   The screen is self-maintaining: it fetches data, caches locally,
   syncs when online, handles offline gracefully.
   It doesn't depend on global state dictating its behavior.
   
4. I-THOU FACILITATION
   The UI gets out of the way. It shows what matters.
   It doesn't gamify, doesn't pressure, doesn't distract.
   It creates conditions for genuine connection.
```

Now code.

---

## PART 1: THE ANATOMY OF A GURUDEVI SCREEN

### Structure Template

```typescript
// screens/ClassroomScreen.tsx

/**
 * PHILOSOPHY: A classroom is a holon—a complete microsystem.
 * This screen shows ONE teacher's classroom through their perspective bond.
 *
 * DATA FLOW:
 *   Route params (classroom_id)
 *     ↓ (passed to hook)
 *   useClassroomWithBond(classroom_id)
 *     ↓ (fetches with perspective bond)
 *   Local SQLite cache
 *     ↓ (reads from)
 *   React Query cache
 *     ↓ (invalidates/refetches)
 *   PowerSync (queues mutations offline)
 *     ↓ (syncs when online)
 *   Component state (loading, error, offline)
 *     ↓ (renders)
 *   UI (screen user sees)
 *
 * CACHING STRATEGY:
 *   - useClassroomWithBond: React Query cached by key ['classroom', classroom_id, perspective_bond]
 *   - Mutations invalidate: ['classroom', classroom_id, 'lessons']
 *   - Offline: reads from SQLite via useClassroomLocalData
 *   - Sync: PowerSync watches classroom_lessons table
 *
 * STATE MANAGEMENT:
 *   - UI state (modals, sheets, selection): useReducer
 *   - Device state (online, syncing): useDeviceState context
 *   - Perspective bond (who am I? what can I see?): useAuth context
 *
 * ERROR HANDLING:
 *   - Network error: show error boundary with retry
 *   - Permission error: show "access denied" (not data)
 *   - Sync conflict: show resolution UI (not data loss)
 *   - Offline: show cached data with "offline" badge
 *
 * ACCESSIBILITY:
 *   - All interactive: accessibilityRole, accessibilityLabel
 *   - Focus management: explicit tab order
 *   - Dark mode: themed colors via useColorMode
 *   - Multilingual: all text via i18n
 */

import { useMemo, useReducer, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceState } from '@/contexts/DeviceContext';
import { useClassroomWithBond } from '@/hooks/useClassroomWithBond';
import { useClassroomLocalData } from '@/hooks/useClassroomLocalData';
import { useUpdateLesson } from '@/hooks/useUpdateLesson';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { View, ScrollView, Pressable } from 'react-native';
import { Text, Box, VStack, HStack, Spinner, Icon } from '@repo/ui/primitives';
import { AlertCircle, Wifi, WifiOff } from '@repo/ui/icons';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { LessonCard } from '@/components/LessonCard';
import { OfflineBadge } from '@/components/OfflineBadge';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ============================================================================
// STEP 1: TYPE DEFINITIONS & STATE MACHINE
// ============================================================================

type UIState = {
  selectedLessonId: string | null;
  isEditingLesson: boolean;
  editingLessonId: string | null;
  showNewLessonSheet: boolean;
  sortBy: 'date' | 'status';
};

type UIAction =
  | { type: 'SELECT_LESSON'; payload: string }
  | { type: 'DESELECT_LESSON' }
  | { type: 'START_EDIT_LESSON'; payload: string }
  | { type: 'CANCEL_EDIT_LESSON' }
  | { type: 'OPEN_NEW_LESSON_SHEET' }
  | { type: 'CLOSE_NEW_LESSON_SHEET' }
  | { type: 'SET_SORT'; payload: 'date' | 'status' };

const initialUIState: UIState = {
  selectedLessonId: null,
  isEditingLesson: false,
  editingLessonId: null,
  showNewLessonSheet: false,
  sortBy: 'date',
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SELECT_LESSON':
      return { ...state, selectedLessonId: action.payload };
    case 'DESELECT_LESSON':
      return { ...state, selectedLessonId: null };
    case 'START_EDIT_LESSON':
      return { ...state, isEditingLesson: true, editingLessonId: action.payload };
    case 'CANCEL_EDIT_LESSON':
      return { ...state, isEditingLesson: false, editingLessonId: null };
    case 'OPEN_NEW_LESSON_SHEET':
      return { ...state, showNewLessonSheet: true };
    case 'CLOSE_NEW_LESSON_SHEET':
      return { ...state, showNewLessonSheet: false };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    default:
      return state;
  }
}

// ============================================================================
// STEP 2: MAIN COMPONENT
// ============================================================================

export function ClassroomScreen() {
  const route = useRoute();
  const { classroomId } = route.params as { classroomId: string };
  
  const { user } = useAuth();
  const { isOnline, isSyncing } = useDeviceState();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // UI state machine
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);

  // =========================================================================
  // DATA FETCHING & CACHING
  // =========================================================================

  /**
   * PRIMARY HOOK: useClassroomWithBond
   * 
   * This hook is THE contract for this screen.
   * It returns classroom data ONLY within the user's perspective bond.
   * 
   * Key principles:
   * 1. Enforces perspective bond at hook level (not UI level)
   * 2. Cache key includes perspective bond to avoid cross-bond data leaks
   * 3. Invalidation triggers when classroom structure changes
   * 4. Handles offline via local SQLite fallback
   */
  const {
    data: classroom,
    isLoading,
    error,
    refetch,
  } = useClassroomWithBond(classroomId, {
    // React Query options
    staleTime: 5 * 60 * 1000, // 5 minutes (classroom is relatively stable)
    retry: 2,                  // Retry twice before failing
    enabled: !!classroomId && !!user, // Only fetch if we have both params and user
  });

  /**
   * FALLBACK HOOK: useClassroomLocalData
   * 
   * If online fetch fails, falls back to local SQLite cache.
   * This is the "graceful degradation" for offline.
   */
  const localClassroom = useClassroomLocalData(classroomId);

  /**
   * MUTATION HOOK: useUpdateLesson
   * 
   * This hook handles lesson updates with:
   * - Optimistic updates (UI updates immediately)
   * - Rollback on failure (if server says no)
   * - Offline queuing (mutation saved locally, synced later)
   * - Cache invalidation (other screens see update)
   */
  const updateLesson = useUpdateLesson({
    onSuccess: () => {
      // Invalidate classroom data so it refetches with updated lesson
      queryClient.invalidateQueries({
        queryKey: ['classroom', classroomId],
      });
      // Close edit sheet
      dispatch({ type: 'CANCEL_EDIT_LESSON' });
    },
    onError: (error) => {
      console.error('Failed to update lesson:', error);
      // Error boundary will show error state
    },
  });

  // =========================================================================
  // DERIVED STATE & MEMOIZATION
  // =========================================================================

  /**
   * Compute sortedLessons from classroom data.
   * Memoize to avoid recalculating on every render.
   * 
   * Why memoize? FlatList performance.
   * If we recalculate on every render, FlatList thinks data changed
   * and re-renders every item even if data didn't actually change.
   */
  const sortedLessons = useMemo(() => {
    if (!classroom?.lessons) return [];

    const lessons = [...classroom.lessons];

    switch (uiState.sortBy) {
      case 'date':
        return lessons.sort(
          (a, b) =>
            new Date(b.scheduled_at).getTime() -
            new Date(a.scheduled_at).getTime()
        );
      case 'status':
        return lessons.sort((a, b) => {
          const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
      default:
        return lessons;
    }
  }, [classroom?.lessons, uiState.sortBy]);

  /**
   * Compute selected lesson detail.
   * Used to avoid re-finding in array.
   */
  const selectedLesson = useMemo(
    () =>
      sortedLessons.find((l) => l.id === uiState.selectedLessonId),
    [sortedLessons, uiState.selectedLessonId]
  );

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle lesson update mutation.
   * 
   * Flow:
   * 1. User edits lesson and taps save
   * 2. Call updateLesson.mutate(updatedData)
   * 3. Mutation hook does optimistic update (UI updates immediately)
   * 4. Mutation sent to server (or queued if offline)
   * 5. On success: invalidate cache, close edit sheet
   * 6. On error: rollback UI, show error
   */
  const handleSaveLesson = useCallback(
    (updatedLesson: any) => {
      updateLesson.mutate({
        classroomId,
        lessonId: uiState.editingLessonId!,
        updates: updatedLesson,
      });
    },
    [classroomId, uiState.editingLessonId, updateLesson]
  );

  /**
   * Handle lesson selection for detail view.
   */
  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      dispatch({ type: 'SELECT_LESSON', payload: lessonId });
    },
    []
  );

  /**
   * Handle starting edit mode.
   */
  const handleStartEdit = useCallback((lessonId: string) => {
    dispatch({ type: 'START_EDIT_LESSON', payload: lessonId });
  }, []);

  /**
   * Handle retry after error.
   */
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // =========================================================================
  // RENDER STATE MACHINE
  // =========================================================================

  // Loading state (first fetch)
  if (isLoading && !classroom && !localClassroom) {
    return (
      <ScreenWrapper scroll={false}>
        <GlobalHeader title={t('classroom.title')} showBack />
        <Box className="flex-1 items-center justify-center">
          <Spinner />
          <Text className="mt-4 text-ink/40 text-xs font-bold uppercase tracking-widest">
            {t('common.loading')}
          </Text>
        </Box>
      </ScreenWrapper>
    );
  }

  // Error state (no data, no cache, network error)
  if (error && !classroom && !localClassroom) {
    return (
      <ScreenWrapper scroll={false}>
        <GlobalHeader title={t('classroom.title')} showBack />
        <Box className="flex-1 items-center justify-center px-6">
          <Box className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
            <Icon as={AlertCircle} size="lg" className="text-red-500" />
          </Box>
          <Text className="text-center font-bold text-ink mb-2">
            {t('common.error.title')}
          </Text>
          <Text className="text-center text-ink/60 text-sm mb-6">
            {error instanceof Error ? error.message : t('common.error.unknown')}
          </Text>
          <Pressable
            onPress={handleRetry}
            className="px-6 py-3 rounded-lg bg-phase-interactive"
            accessibilityRole="button"
            accessibilityLabel={t('common.retry')}
          >
            <Text className="text-white font-bold">{t('common.retry')}</Text>
          </Pressable>
        </Box>
      </ScreenWrapper>
    );
  }

  // Use online data if available, fallback to local cache
  const displayClassroom = classroom || localClassroom;

  // Offline state (using cached data)
  const isUsingCachedData = !classroom && !!localClassroom;

  // Happy path (data exists)
  return (
    <ScreenWrapper scroll={false} noTopInset={false}>
      <GlobalHeader
        title={displayClassroom?.name || t('classroom.title')}
        subtitle={
          isUsingCachedData
            ? t('common.offline.subtitle')
            : isSyncing
            ? t('common.syncing')
            : undefined
        }
        showBack
      />

      {/* Status badges */}
      <Box className="px-4 py-3 flex-row gap-2">
        {!isOnline && <OfflineBadge />}
        {isSyncing && (
          <Box className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-phase-surface">
            <Spinner size="small" />
            <Text className="text-xs font-bold">{t('common.syncing')}</Text>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box className="flex-1">
        {sortedLessons.length === 0 ? (
          <EmptyClassroomState
            onNewLesson={() => dispatch({ type: 'OPEN_NEW_LESSON_SHEET' })}
            isOffline={isUsingCachedData}
          />
        ) : (
          <FlatList
            data={sortedLessons}
            renderItem={({ item }) => (
              <LessonCard
                lesson={item}
                isSelected={item.id === uiState.selectedLessonId}
                isEditing={item.id === uiState.editingLessonId}
                onPress={() => handleSelectLesson(item.id)}
                onEdit={() => handleStartEdit(item.id)}
                disabled={isUsingCachedData}
                accessibilityLabel={`Lesson: ${item.title}`}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            scrollEnabled={true}
            ListEmptyComponent={<EmptyClassroomState />}
            // Performance: recycle items, don't re-render visible items unnecessarily
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
          />
        )}
      </Box>

      {/* Action button */}
      {!isUsingCachedData && (
        <Box className="px-4 py-4 bg-phase-surface border-t border-border">
          <Pressable
            onPress={() => dispatch({ type: 'OPEN_NEW_LESSON_SHEET' })}
            className="py-3 px-4 rounded-lg bg-phase-interactive items-center"
            disabled={isSyncing}
            accessibilityRole="button"
            accessibilityLabel={t('classroom.newLesson')}
          >
            <Text className="text-white font-bold">{t('classroom.newLesson')}</Text>
          </Pressable>
        </Box>
      )}

      {/* Edit lesson sheet */}
      {uiState.isEditingLesson && selectedLesson && (
        <LessonEditSheet
          lesson={selectedLesson}
          isLoading={updateLesson.isPending}
          onSave={handleSaveLesson}
          onCancel={() => dispatch({ type: 'CANCEL_EDIT_LESSON' })}
        />
      )}

      {/* Error boundary to catch render errors */}
      <ErrorBoundary />
    </ScreenWrapper>
  );
}

// ============================================================================
// STEP 3: HELPER COMPONENTS (Extracted, Memoized)
// ============================================================================

/**
 * EmptyClassroomState
 * 
 * Extracted to keep main component clean.
 * Memoized because it doesn't change often.
 */
const EmptyClassroomState = React.memo(function EmptyClassroomState({
  onNewLesson,
  isOffline,
}: {
  onNewLesson?: () => void;
  isOffline?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Box className="flex-1 items-center justify-center px-6">
      <Box className="w-16 h-16 rounded-full bg-ink/5 items-center justify-center mb-4">
        <Icon as={BookOpen} size="lg" className="text-ink/20" />
      </Box>
      <Text className="text-center text-ink/40 text-sm font-medium">
        {isOffline ? t('classroom.empty.offline') : t('classroom.empty')}
      </Text>
      {!isOffline && onNewLesson && (
        <Pressable
          onPress={onNewLesson}
          className="mt-4 px-4 py-2 rounded-lg bg-phase-interactive"
        >
          <Text className="text-white text-sm font-bold">
            {t('classroom.createFirst')}
          </Text>
        </Pressable>
      )}
    </Box>
  );
});

export default ClassroomScreen;
```

---

## PART 2: THE HOOK LAYER (Where Philosophy Becomes Data)

### Rule: A Hook = A Data Contract

Every hook must answer:
1. **What data?** (scope)
2. **Whose data?** (perspective bond check)
3. **Fresh or cached?** (stale time)
4. **Offline fallback?** (SQLite query)
5. **When to refetch?** (invalidation trigger)

### Example: useClassroomWithBond

```typescript
// hooks/useClassroomWithBond.ts

/**
 * HOOK: useClassroomWithBond
 * 
 * CONTRACT:
 * - Returns classroom data for the current user's perspective bond
 * - Teacher sees: assigned classroom only
 * - Principal sees: all classrooms in school
 * - Student sees: assigned classroom only
 * 
 * SAFETY:
 * - Uses perspective bond to scope query
 * - Verifies user has access (Cedar policy check in Hono)
 * - Falls back to local SQLite if offline
 * 
 * CACHING:
 * - Cached by: ['classroom', classroomId, perspectiveBond]
 * - Stale after: 5 minutes
 * - Invalidated when: classroom, lessons, or student enrollment changes
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceState } from '@/contexts/DeviceContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { hono } from '@/api/client';
import type { Classroom, ClassroomLesson } from '@/types/schema';

export interface UseClassroomWithBondOptions {
  staleTime?: number;
  retry?: number;
  enabled?: boolean;
}

export function useClassroomWithBond(
  classroomId: string,
  options: UseClassroomWithBondOptions = {}
) {
  const { user, perspectiveBond } = useAuth();
  const { isOnline } = useDeviceState();
  const database = useDatabase();

  const {
    staleTime = 5 * 60 * 1000,
    retry = 2,
    enabled = true,
  } = options;

  /**
   * The actual fetcher function.
   * 
   * This is called by React Query when:
   * 1. Component mounts (if cache is empty)
   * 2. Cache becomes stale
   * 3. Manual refetch is called
   * 4. Focus returns to window
   */
  const fetchClassroom = async (): Promise<Classroom> => {
    // Step 1: Call Hono API with perspective bond
    // The API enforces Cedar policy: "Can this user see this classroom?"
    const response = await hono.api.classrooms[classroomId].$get({
      query: {
        // perspectiveBond is sent so server can filter data appropriately
        perspectiveBond: perspectiveBond.id,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch classroom');
    }

    const classroom: Classroom = await response.json();

    // Step 2: Persist to local SQLite for offline access
    // This happens in background, doesn't block the fetch
    if (database && user) {
      database.classrooms.upsert({
        id: classroom.id,
        data: classroom,
        userId: user.id,
        perspectiveBond: perspectiveBond.id,
        cachedAt: new Date(),
      }).catch((err) => {
        console.warn('Failed to cache classroom locally:', err);
        // Don't throw; caching is optional
      });
    }

    return classroom;
  };

  /**
   * The actual React Query hook.
   */
  return useQuery({
    queryKey: ['classroom', classroomId, perspectiveBond.id],
    queryFn: fetchClassroom,
    staleTime,
    retry,
    enabled: enabled && !!classroomId && !!user,
  });
}

/**
 * FALLBACK HOOK: useClassroomLocalData
 * 
 * When online fetch fails, this reads from local SQLite.
 * Used in screen to implement graceful degradation.
 */
export function useClassroomLocalData(classroomId: string): Classroom | null {
  const { user, perspectiveBond } = useAuth();
  const database = useDatabase();
  const [classroom, setClassroom] = useState<Classroom | null>(null);

  useEffect(() => {
    if (!database || !user || !classroomId) return;

    const loadLocal = async () => {
      const cached = await database.classrooms.findOne({
        id: classroomId,
        userId: user.id,
        perspectiveBond: perspectiveBond.id,
      });

      setClassroom(cached?.data || null);
    };

    loadLocal();
  }, [database, user, classroomId, perspectiveBond.id]);

  return classroom;
}
```

### Another Example: useUpdateLesson (Mutation Hook)

```typescript
// hooks/useUpdateLesson.ts

/**
 * HOOK: useUpdateLesson
 * 
 * CONTRACT:
 * - Updates a lesson in a classroom
 * - Uses optimistic updates (UI updates immediately)
 * - Queues mutation if offline (PowerSync)
 * - Invalidates relevant caches on success
 * - Rolls back on error
 * 
 * SAFETY:
 * - Cedar policy check on server (can user edit this lesson?)
 * - Only data user has access to is updated
 * 
 * OFFLINE:
 * - Write to local SQLite immediately
 * - Mark as "pending sync"
 * - PowerSync watches table and syncs when online
 * - On sync, server validates again (defense in depth)
 */

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceState } from '@/contexts/DeviceContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { hono } from '@/api/client';
import type { ClassroomLesson } from '@/types/schema';

interface UpdateLessonParams {
  classroomId: string;
  lessonId: string;
  updates: Partial<ClassroomLesson>;
}

interface UseUpdateLessonOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateLesson(options: UseUpdateLessonOptions = {}) {
  const { user } = useAuth();
  const { isOnline } = useDeviceState();
  const database = useDatabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, lessonId, updates }: UpdateLessonParams) => {
      // Step 1: Write to local SQLite immediately (optimistic)
      if (database && user && isOnline === false) {
        // Offline: write to SQLite, PowerSync will sync later
        await database.classroomLessons.update(lessonId, {
          ...updates,
          _pending_sync: true,
          _sync_error: null,
        });
      }

      // Step 2: Send to server (if online)
      if (isOnline) {
        const response = await hono.api.classrooms[classroomId].lessons[lessonId].$patch({
          json: updates,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update lesson');
        }

        const updated: ClassroomLesson = await response.json();

        // Step 3: Update local SQLite with server response
        if (database && user) {
          await database.classroomLessons.update(lessonId, {
            ...updated,
            _pending_sync: false,
          });
        }

        return updated;
      }

      // Offline: return optimistic version
      return {
        id: lessonId,
        ...updates,
      } as ClassroomLesson;
    },

    // Optimistic update: update UI before server responds
    onMutate: async ({ classroomId, lessonId, updates }) => {
      // Cancel any pending refetches for this classroom
      await queryClient.cancelQueries({
        queryKey: ['classroom', classroomId],
      });

      // Snapshot previous data (for rollback)
      const previousClassroom = queryClient.getQueryData<Classroom>([
        'classroom',
        classroomId,
      ]);

      if (previousClassroom) {
        // Update optimistically in cache
        queryClient.setQueryData(
          ['classroom', classroomId],
          {
            ...previousClassroom,
            lessons: previousClassroom.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            ),
          }
        );
      }

      return { previousClassroom };
    },

    // On success: invalidate related caches
    onSuccess: () => {
      // Tell React Query these caches are stale, refetch them
      queryClient.invalidateQueries({
        queryKey: ['classroom'],
      });

      options.onSuccess?.();
    },

    // On error: rollback optimistic update
    onError: (error, variables, context: any) => {
      if (context?.previousClassroom) {
        queryClient.setQueryData(
          ['classroom', variables.classroomId],
          context.previousClassroom
        );
      }

      options.onError?.(error as Error);
    },
  });
}
```

---

## PART 3: CACHING STRATEGY (The Critical Foundation)

### Cache Hierarchy

```
Level 1: React Query Cache (In-Memory)
  - Fast (immediate)
  - Fresh data (can be stale by 5 min)
  - Lost on app restart
  - Used by all screens

Level 2: SQLite Cache (On-Device Storage)
  - Medium (sub-100ms)
  - Persists across app restarts
  - Can be offline
  - Used as fallback when online fetch fails

Level 3: PowerSync Queue
  - Background sync
  - Queues mutations while offline
  - Syncs when online
  - Ensures data reaches server

Level 4: Supabase (Server Source of Truth)
  - Authoritative
  - Shared across all users
  - Real-time updates (via realtime channel)
  - Backups, security, audit logs
```

### Invalidation Rules

```typescript
/**
 * When a mutation succeeds, what caches become stale?
 * 
 * LESSON CREATED:
 *   - Invalidate: ['classroom', classroomId]
 *   - Invalidate: ['lessons']
 *   - Do NOT invalidate: ['students'] (unrelated)
 * 
 * LESSON UPDATED:
 *   - Invalidate: ['classroom', classroomId]
 *   - Invalidate: ['lesson', lessonId]
 *   - Do NOT invalidate: ['lessons'] (filtered query might be affected)
 * 
 * STUDENT ENROLLMENT CHANGED:
 *   - Invalidate: ['classroom', classroomId]
 *   - Invalidate: ['students', classroomId]
 *   - Invalidate: ['enrollment']
 */

const invalidationMap = {
  'lesson:create': ['classroom', 'lessons'],
  'lesson:update': ['classroom', 'lesson'],
  'lesson:delete': ['classroom', 'lessons'],
  'student:enroll': ['classroom', 'enrollment', 'students'],
  'attendance:record': ['attendance', 'lesson'],
  'grade:record': ['grades', 'student', 'classroom'],
};
```

### Offline-First Cache Rules

```typescript
/**
 * When user is OFFLINE:
 * 
 * READS:
 *   - Read from SQLite (first choice)
 *   - React Query in-memory cache (second choice)
 *   - Show "offline" badge
 *   - Don't attempt network fetch
 * 
 * WRITES:
 *   - Write to SQLite immediately
 *   - Mark as pending_sync
 *   - Queue in PowerSync
 *   - Show "syncing..." indicator
 *   - When online: PowerSync syncs
 * 
 * When user comes ONLINE:
 *   - PowerSync syncs pending mutations
 *   - Server validates Cedar policies again
 *   - On success: mark as synced, clear pending_sync
 *   - On error: show "sync failed" error, user must retry
 *   - Invalidate React Query caches (refetch fresh)
 */
```

---

## PART 4: STATE MANAGEMENT (UI State, Not Data State)

### Golden Rule

```
useReducer:  UI state (modals, selections, sheets, filters)
useContext:  Global state (auth, device, theme)
React Query: Server data (todos, lessons, students)
useQuery:    Individual pieces of server data
useMutation: Server mutations
```

### Pattern: useReducer for Complex UI

```typescript
/**
 * When a screen has complex UI state (many modals, sheets, selections),
 * use useReducer instead of multiple useState calls.
 * 
 * Why?
 * - Single source of truth for UI state
 * - Easier to debug (print state, understand what's happening)
 * - Explicit transitions (dispatch actions, not scattered setState)
 * - Fewer bugs (state machine is predictable)
 */

type AppState = {
  // What's visible?
  isLessonDetailOpen: boolean;
  isEditSheetOpen: boolean;
  isDeleteConfirmOpen: boolean;
  
  // What's selected?
  selectedLessonId: string | null;
  selectedStudentIds: Set<string>;
  
  // What's being edited?
  editingLessonId: string | null;
  
  // What's the current mode?
  mode: 'view' | 'edit' | 'multi-select';
  
  // Filters?
  filterStatus: 'all' | 'pending' | 'completed';
  sortBy: 'date' | 'status' | 'name';
};

type Action =
  | { type: 'OPEN_LESSON_DETAIL'; payload: string }
  | { type: 'CLOSE_LESSON_DETAIL' }
  | { type: 'OPEN_EDIT_SHEET'; payload: string }
  | { type: 'CLOSE_EDIT_SHEET' }
  | { type: 'OPEN_DELETE_CONFIRM'; payload: string }
  | { type: 'CLOSE_DELETE_CONFIRM' }
  | { type: 'SELECT_STUDENT'; payload: string }
  | { type: 'DESELECT_STUDENT'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ENTER_MULTI_SELECT_MODE' }
  | { type: 'EXIT_MULTI_SELECT_MODE' }
  | { type: 'SET_FILTER'; payload: AppState['filterStatus'] }
  | { type: 'SET_SORT'; payload: AppState['sortBy'] };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'OPEN_LESSON_DETAIL':
      return { ...state, isLessonDetailOpen: true, selectedLessonId: action.payload };
    case 'CLOSE_LESSON_DETAIL':
      return { ...state, isLessonDetailOpen: false, selectedLessonId: null };
    // ... more cases
    default:
      return state;
  }
}
```

---

## PART 5: PERFORMANCE OPTIMIZATION (Code Quality)

### Rule 1: Memoize Derived Data

```typescript
/**
 * ❌ WRONG: Recalculates on every render
 */
function ClassroomList() {
  const { data: lessons } = useQuery(...);
  
  // This recalculates on every render!
  // Even if lessons didn't change!
  const sorted = lessons
    .slice()
    .sort((a, b) => a.date - b.date);
  
  return <FlatList data={sorted} />;
}

/**
 * ✅ RIGHT: Memoized, only recalculates when lessons change
 */
function ClassroomList() {
  const { data: lessons } = useQuery(...);
  
  // Memoized: only recalculates if lessons actually changed
  const sorted = useMemo(() => {
    return lessons
      .slice()
      .sort((a, b) => a.date - b.date);
  }, [lessons]);
  
  return <FlatList data={sorted} />;
}
```

### Rule 2: Memoize Callbacks

```typescript
/**
 * ❌ WRONG: New function on every render = child re-renders unnecessarily
 */
function Parent() {
  const handlePress = () => {
    console.log('pressed');
  };
  
  return <Child onPress={handlePress} />; // New function every render
}

/**
 * ✅ RIGHT: Same function reference = child doesn't re-render
 */
function Parent() {
  const handlePress = useCallback(() => {
    console.log('pressed');
  }, []); // No dependencies = function never changes
  
  return <Child onPress={handlePress} />;
}
```

### Rule 3: Extract Large Renders

```typescript
/**
 * ❌ WRONG: ClassroomList component is 500 lines, renders everything
 */
function ClassroomScreen() {
  return (
    <View>
      <FlatList
        data={lessons}
        renderItem={({ item }) => (
          <View style={{ padding: 16 }}>
            {/* 50 lines of JSX per item */}
          </View>
        )}
      />
    </View>
  );
}

/**
 * ✅ RIGHT: Extracted LessonCard, each item is independent
 */
function ClassroomScreen() {
  return (
    <View>
      <FlatList
        data={lessons}
        renderItem={({ item }) => <LessonCard lesson={item} />}
      />
    </View>
  );
}

function LessonCard({ lesson }: { lesson: ClassroomLesson }) {
  return (
    <View style={{ padding: 16 }}>
      {/* 50 lines of JSX */}
    </View>
  );
}
```

### Rule 4: FlatList Performance

```typescript
/**
 * For large lists (100+ items), use these FlatList props:
 */
<FlatList
  data={items}
  renderItem={renderItem}
  
  // Recycle views (don't keep every item in memory)
  removeClippedSubviews={true}
  
  // Render in batches, not all at once
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  
  // Scroll indicator only when scrolling
  scrollIndicatorInsets={{ right: 1 }}
  
  // Key extractor (must be consistent)
  keyExtractor={(item) => item.id}
/>
```

---

## PART 6: ERROR HANDLING (User-Facing & Logging)

### State-by-State Error Handling

```typescript
// Loading: show spinner
if (isLoading && !data) {
  return <LoadingState />;
}

// Error with fallback: show error, allow retry
if (error && data) {
  return (
    <View>
      <Data data={data} />
      <Box className="bg-red-100 p-4">
        <Text className="text-red-700">Data might be stale: {error.message}</Text>
        <Button onPress={refetch}>Refresh</Button>
      </Box>
    </View>
  );
}

// Error without fallback: show error screen
if (error && !data) {
  return <ErrorScreen error={error} onRetry={refetch} />;
}

// Success
return <View>{/* render data */}</View>;
```

### Logging Strategy

```typescript
/**
 * Log at the right level:
 * 
 * warn: Expected failures (offline, slow network, 404)
 * error: Unexpected failures (500, parsing error, auth failed)
 * info: Important events (user logged in, sync completed)
 * debug: Development-only detailed info
 */

try {
  const data = await fetch(url);
  if (!data.ok) {
    // Expected: 404, 403
    console.warn(`[API] ${data.status} from ${url}`);
    throw new NotFoundError();
  }
} catch (err) {
  // Unexpected: network error, parsing error
  console.error(`[API] Unexpected error from ${url}:`, err);
  throw err;
}
```

---

## PART 7: ACCESSIBILITY & INTERNATIONALIZATION

### Accessibility (Required, Not Optional)

```typescript
/**
 * Every interactive element needs:
 */

<Pressable
  onPress={handlePress}
  
  // What is this button? Screen reader users need to know.
  accessibilityRole="button"
  accessibilityLabel="Delete lesson"
  
  // Hint: what happens when pressed?
  accessibilityHint="Deletes the selected lesson. This cannot be undone."
  
  // State: is it disabled?
  disabled={isLoading}
  accessibilityState={{ disabled: isLoading }}
/>

/**
 * Forms need labels:
 */
<TextInput
  accessibilityLabel="Lesson title"
  accessibilityRole="none" // Because there's a separate label component
/>

/**
 * Lists need structure:
 */
<FlatList
  accessibilityRole="list"
  renderItem={({ item }) => (
    <View accessibilityRole="listitem">
      {item.name}
    </View>
  )}
/>
```

### Internationalization (i18next)

```typescript
/**
 * NEVER hardcode strings.
 * ALL user-facing text goes through i18n.
 */

// ❌ WRONG
<Text>Hello, {name}</Text>
<Text>You have {count} lessons</Text>

// ✅ RIGHT
const { t } = useTranslation();
<Text>{t('greeting.hello', { name })}</Text>
<Text>{t('lesson.count', { count })}</Text>

/**
 * Translation file (en.json):
 */
{
  "greeting": {
    "hello": "Hello, {{name}}"
  },
  "lesson": {
    "count_one": "You have 1 lesson",
    "count_other": "You have {{count}} lessons"
  }
}

/**
 * Translation file (si.json):
 */
{
  "greeting": {
    "hello": "ආයුබෝවන්, {{name}}"
  },
  "lesson": {
    "count_one": "ඔබට පාඩම් 1 ක් ඇත",
    "count_other": "ඔබට පාඩම් {{count}} ක් ඇත"
  }
}
```

---

## PART 8: MULTI-DEVICE & PERSPECTIVE BOND CONSISTENCY

### Ensuring Cross-Device Consistency

```typescript
/**
 * When same user is on 2 devices:
 * 
 * Device A: Teacher edits lesson
 *   1. Write to local SQLite
 *   2. PowerSync syncs to server
 *   3. Server broadcasts via realtime channel
 * 
 * Device B (listening to realtime):
 *   1. Receives broadcast from server
 *   2. Updates local SQLite
 *   3. React Query invalidates cache
 *   4. Screen refetches and re-renders
 */

// Subscribe to realtime updates for this classroom
useEffect(() => {
  const channel = supabase
    .channel(`classroom-${classroomId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'classroom_lessons',
        filter: `classroom_id=eq.${classroomId}`,
      },
      (payload) => {
        // When lesson changes on another device/user:
        if (payload.eventType === 'UPDATE') {
          // Invalidate cache so this device refetches
          queryClient.invalidateQueries({
            queryKey: ['classroom', classroomId],
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [classroomId, queryClient]);
```

### Perspective Bond Protection

```typescript
/**
 * NEVER trust the client's perspective bond claim.
 * 
 * WRONG (client could lie):
 * ```
 * const perspective = route.params.perspective; // From user input
 * const data = await fetch(url, {
 *   headers: { perspective }
 * });
 * ```
 * 
 * RIGHT (server verifies):
 * ```
 * // Client sends request
 * const response = await hono.api.classrooms[id].$get();
 * 
 * // Server:
 * // 1. Checks who is authenticated (via JWT)
 * // 2. Looks up user's perspective bonds
 * // 3. Filters data to only what user can see
 * // 4. Returns filtered data
 * // User cannot see beyond their bonds, no matter what they send
 * ```
 */
```

---

## PART 9: SCROLLABILITY, LAYOUT, AND DEVICE CONSTRAINTS

### Low-End Device Optimization

```typescript
/**
 * Gurudevi targets low-end devices (2GB RAM).
 * 
 * ❌ DON'T use:
 * - Heavy animations (blur, complex shadows)
 * - Large uncompressed images
 * - Deep nesting (RN renders slower with deep trees)
 * - Many renders per second
 * 
 * ✅ DO use:
 * - `@shopify/flash-list` instead of FlatList (faster recycling)
 * - Simple CSS shadows (no blur)
 * - WebP images (smaller file size)
 * - Flat component trees
 * - Memoization (prevent unnecessary renders)
 */

// ❌ WRONG: Too many renders
<View>
  <View>
    <View>
      <View>
        <View>
          <Text>Deep nesting is slow</Text>
        </View>
      </View>
    </View>
  </View>
</View>

// ✅ RIGHT: Flat structure
<View>
  <Text>Flat nesting is fast</Text>
</View>

// ❌ WRONG: Heavy animation
<Animated.View
  style={{
    opacity: fadeAnimation,
    transform: [{ scale: scaleAnimation }],
    // blur on low-end = janky
    filter: 'blur(10px)',
  }}
>
  Content
</Animated.View>

// ✅ RIGHT: Simple animation
<Animated.View
  style={{
    opacity: fadeAnimation,
    // No blur, just opacity
  }}
>
  Content
</Animated.View>
```

### Tri-lingual Layout

```typescript
/**
 * Sinhala script is taller than Latin.
 * Must adjust line heights and spacing.
 */

const getLineHeight = (language: string) => {
  switch (language) {
    case 'si': // Sinhala
      return 1.5; // Taller
    case 'ta': // Tamil
      return 1.4; // Taller
    default:
      return 1.2; // English
  }
};

<Text
  style={{
    lineHeight: getLineHeight(language) * fontSize,
  }}
>
  {t('some.key')}
</Text>
```

---

## PART 10: CODE QUALITY & TESTING

### Type Safety (Required)

```typescript
/**
 * ❌ WRONG: Any types, no type safety
 */
function updateLesson(lesson: any): any {
  return lesson;
}

/**
 * ✅ RIGHT: Full type safety
 */
function updateLesson(lesson: ClassroomLesson): Promise<ClassroomLesson> {
  return fetch(`/lessons/${lesson.id}`, {
    method: 'PATCH',
    body: JSON.stringify(lesson),
  }).then(r => r.json());
}
```

### Testing Strategy

```typescript
/**
 * What to test:
 * 
 * 1. Hooks (data fetching, caching)
 * 2. State machines (useReducer logic)
 * 3. Mutations (offline queuing, optimistic updates)
 * 4. Error boundaries
 * 
 * What NOT to test:
 * - UI rendering details
 * - Component styling
 * - Snapshot tests (brittle)
 */

describe('useClassroomWithBond', () => {
  it('fetches classroom for user perspective bond', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useClassroomWithBond('classroom-1'),
      { wrapper: TestProviders }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for fetch
    await waitForNextUpdate();

    // Fetched successfully
    expect(result.current.data).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('falls back to local cache when offline', async () => {
    // Mock offline
    useDeviceState.mockReturnValue({ isOnline: false });

    const { result } = renderHook(
      () => useClassroomWithBond('classroom-1'),
      { wrapper: TestProviders }
    );

    // Should load from SQLite cache
    expect(result.current.data).toBeDefined();
  });
});
```

---

## SUMMARY: THE CHECKLIST

Before shipping a screen, verify:

```
[ ] Data Fetching
    [ ] Uses custom hook (useClassroomWithBond, etc.)
    [ ] Hook enforces perspective bond
    [ ] Has offline fallback (SQLite)
    [ ] Has loading state
    [ ] Has error state with retry
    [ ] Has empty state

[ ] Caching
    [ ] Uses React Query for online data
    [ ] Invalidation on mutations
    [ ] Memoized derived data (useMemo)
    [ ] Memoized callbacks (useCallback)

[ ] Mutations
    [ ] Uses useMutation
    [ ] Optimistic updates
    [ ] Rollback on error
    [ ] Queues offline

[ ] State Management
    [ ] UI state in useReducer (not useState)
    [ ] Device state from context
    [ ] Auth from context
    [ ] No global state unless necessary

[ ] Performance
    [ ] FlatList with proper props
    [ ] Extracted/memoized components
    [ ] No re-renders on every render
    [ ] Low-end device optimized

[ ] Accessibility
    [ ] accessibilityRole on interactive
    [ ] accessibilityLabel on all buttons
    [ ] Keyboard navigation works
    [ ] Screen reader friendly

[ ] Internationalization
    [ ] No hardcoded strings
    [ ] All text via t()
    [ ] Plural handling
    [ ] RTL ready (if needed)

[ ] Errors
    [ ] Network errors caught
    [ ] Sync errors shown
    [ ] Permission errors show "access denied"
    [ ] Conflict resolution UI (if applicable)

[ ] Offline
    [ ] Works with cached data
    [ ] "Offline" badge shown
    [ ] Mutations queued (not sent)
    [ ] Graceful degradation

[ ] Multi-device
    [ ] Realtime subscriptions
    [ ] Cache invalidation on realtime events
    [ ] Perspective bond consistent across devices

[ ] Code Quality
    [ ] TypeScript strict mode
    [ ] No console.log in production
    [ ] Error logging to Sentry
    [ ] Comments on non-obvious code
```

---

## FINAL THOUGHT

Every screen is a tiny philosophy made manifest.

It's not just "render a list of lessons."

It's: "Render what this teacher can see (holon boundary), from their local cache if offline (autopoiesis), synced when online (eventual consistency), showing only their assigned classroom (perspective bond), with clear error states and accessibility for all (I-Thou), without pressure or gamification (Gurudevi philosophy)."

Write code that embodies that.
