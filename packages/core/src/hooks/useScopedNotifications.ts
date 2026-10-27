import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { socialAPI } from '@repo/core/api/social';
import type { QueryScope } from '@repo/core/lib/clientStateFoundation';
import { useExperienceState } from '@repo/core/lib/experienceState';
import {
  NOTIFICATION_LIST_LIMIT,
  notificationQueryKeys,
} from '@repo/core/lib/notificationQueryKeys';
import { notification } from '@repo/core/logic/managers/factory';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { AppNotification, NotificationStatus } from '@repo/core/types';
import {
  type QueryClient,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

const disabledListKey = ['notifications', 'disabled'] as const;
const disabledCountKey = ['notifications', 'disabled-count'] as const;

/**
 * Notifications are principal-owned. Tenant, bond, and perspective deliberately
 * do not participate in this cache namespace: changing workspace must not erase
 * an account's inbox. A hydrated mismatching ScopeSession is a hard denial.
 */
export function resolveNotificationQueryScope(
  requestedPrincipalId: string | null | undefined,
  snapshot: { principalId: string | null } | null,
): QueryScope | null {
  const principalId = requestedPrincipalId?.trim() || null;
  if (!principalId || !snapshot || snapshot.principalId !== principalId) return null;
  return { principalId };
}

export { notificationQueryKeys } from '@repo/core/lib/notificationQueryKeys';

function errorMessage(...errors: unknown[]): string | null {
  const error = errors.find((candidate) => candidate != null);
  if (typeof error === 'string') return error;
  return error instanceof Error
    ? error.message
    : error
      ? 'Notification synchronization failed.'
      : null;
}

export function mergeNotification(
  current: AppNotification[] | undefined,
  incoming: AppNotification,
): AppNotification[] {
  const prior = current ?? [];
  const existing = prior.findIndex((item) => item.id === incoming.id);
  if (existing < 0) return [incoming, ...prior].slice(0, NOTIFICATION_LIST_LIMIT);
  return prior.map((item) => (item.id === incoming.id ? { ...item, ...incoming } : item));
}

export function markSampleNotificationAsRead(
  current: readonly AppNotification[],
  notificationId: string,
): AppNotification[] {
  return current.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item));
}

export function markAllSampleNotificationsAsRead(
  current: readonly AppNotification[],
): AppNotification[] {
  return current.map((item) => ({ ...item, is_read: true }));
}

type RealtimeListener = (status: NotificationStatus) => void;

interface RealtimeEntry {
  readonly listeners: Set<RealtimeListener>;
  readonly cleanup: () => void;
  references: number;
}

const clientIds = new WeakMap<object, number>();
const realtimeEntries = new Map<string, RealtimeEntry>();
let nextClientId = 1;

function realtimeEntryId(queryClient: object, principalId: string): string {
  let clientId = clientIds.get(queryClient);
  if (!clientId) {
    clientId = nextClientId++;
    clientIds.set(queryClient, clientId);
  }
  return `${clientId}:${principalId}`;
}

/**
 * One app QueryClient gets one channel per principal, regardless of how many
 * notification surfaces observe the same scoped cache.
 */
export function acquireScopedNotificationRealtime(
  queryClient: QueryClient,
  scope: QueryScope,
  listKey: ReturnType<typeof notificationQueryKeys.list>,
  countKey: ReturnType<typeof notificationQueryKeys.count>,
  listener: RealtimeListener,
): () => void {
  const entryId = realtimeEntryId(queryClient, scope.principalId);
  let entry = realtimeEntries.get(entryId);
  if (!entry) {
    const listeners = new Set<RealtimeListener>();
    let active = true;
    const notify = (status: NotificationStatus) =>
      listeners.forEach((candidate) => candidate(status));
    const cleanup = notification.subscribe(
      scope.principalId,
      (incoming) => {
        if (!active) return;
        queryClient.setQueryData<AppNotification[]>(listKey, (current) =>
          mergeNotification(current, incoming),
        );
        void queryClient.invalidateQueries({ queryKey: countKey, exact: true });
      },
      (incoming) => {
        if (!active) return;
        queryClient.setQueryData<AppNotification[]>(listKey, (current) =>
          mergeNotification(current, incoming),
        );
        void queryClient.invalidateQueries({ queryKey: countKey, exact: true });
      },
      (status) => {
        if (!active) return;
        notify(status);
        if (status === 'CONNECTED') {
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: listKey, exact: true }),
            queryClient.invalidateQueries({ queryKey: countKey, exact: true }),
          ]);
        }
      },
    );
    entry = {
      listeners,
      cleanup: () => {
        active = false;
        cleanup();
      },
      references: 0,
    };
    realtimeEntries.set(entryId, entry);
  }
  entry.references += 1;
  entry.listeners.add(listener);
  return () => {
    const current = realtimeEntries.get(entryId);
    if (!current) return;
    current.listeners.delete(listener);
    current.references -= 1;
    if (current.references === 0) {
      current.cleanup();
      realtimeEntries.delete(entryId);
    }
  };
}

export interface ScopedNotificationsResult {
  readonly notifications: AppNotification[];
  readonly unreadCount: number;
  readonly isLoading: boolean;
  readonly isRealtimeConnected: boolean;
  readonly error: string | null;
  readonly isMarkingRead: boolean;
  readonly markAsRead: (id: string) => Promise<void>;
  readonly markAllRead: () => Promise<void>;
  readonly refresh: () => void;
}

function useNotificationRealtime(scope: QueryScope | null): NotificationStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<NotificationStatus>('DISCONNECTED');
  useEffect(() => {
    setStatus('DISCONNECTED');
    if (!scope) return;
    return acquireScopedNotificationRealtime(
      queryClient,
      scope,
      notificationQueryKeys.list(scope),
      notificationQueryKeys.count(scope),
      setStatus,
    );
  }, [queryClient, scope]);
  return status;
}

/** Query-owned notification read, mutation, and realtime lifecycle. */
export function useScopedNotifications(
  requestedPrincipalId: string | null | undefined,
): ScopedNotificationsResult {
  const queryClient = useQueryClient();
  const snapshot = useScopeSessionStore((state) => state.snapshot);
  const isScopeTransitioning = useScopeSessionStore((state) => state.isTransitioning);
  const isExplorerMode = useExperienceState((state) => state.isExplorerMode);
  const isGuest = useAuthStore((state) => Boolean(state.user?.is_anonymous));
  const allowsSamples = isExplorerMode || isGuest;
  const scope = useMemo(
    () =>
      isScopeTransitioning
        ? null
        : resolveNotificationQueryScope(requestedPrincipalId, {
            principalId: snapshot?.principalId ?? null,
          }),
    [isScopeTransitioning, requestedPrincipalId, snapshot?.principalId],
  );
  const realtimeStatus = useNotificationRealtime(scope);
  const sampleKey = requestedPrincipalId?.trim()
    ? notificationQueryKeys.samples({ principalId: requestedPrincipalId.trim() })
    : (['notifications', 'guest-samples'] as const);
  const { data: sampleNotifications } = useQuery<AppNotification[]>({
    queryKey: sampleKey,
    queryFn: skipToken,
    initialData: () => getSandboxSamples<AppNotification[]>('social', 'getNotifications', [], []),
    enabled: false,
    staleTime: Infinity,
  });
  const listKey = useMemo(
    () => (scope ? notificationQueryKeys.list(scope) : null),
    [scope?.principalId],
  );
  const countKey = useMemo(
    () => (scope ? notificationQueryKeys.count(scope) : null),
    [scope?.principalId],
  );

  const listQuery = useQuery({
    queryKey: listKey ?? disabledListKey,
    queryFn: () => socialAPI.getNotifications(NOTIFICATION_LIST_LIMIT),
    enabled: scope !== null,
    staleTime: 60_000,
  });
  const countQuery = useQuery({
    queryKey: countKey ?? disabledCountKey,
    queryFn: () => socialAPI.getUnreadNotificationCount(),
    enabled: scope !== null,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const scopeUnavailable = Boolean(requestedPrincipalId?.trim()) && scope === null;
  const realNotifications = listQuery.data ?? [];
  const usesSamples =
    allowsSamples &&
    !scopeUnavailable &&
    (!scope || listQuery.isFetched) &&
    realNotifications.length === 0;

  const invalidate = useCallback(async () => {
    if (!listKey || !countKey) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: listKey, exact: true }),
      queryClient.invalidateQueries({ queryKey: countKey, exact: true }),
    ]);
  }, [countKey, listKey, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!scope) throw new Error('An authenticated notification scope is required.');
      await socialAPI.markNotificationRead(notificationId);
    },
    onSuccess: invalidate,
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!scope) throw new Error('An authenticated notification scope is required.');
      await socialAPI.markAllNotificationsRead();
    },
    onSuccess: invalidate,
  });

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (usesSamples) {
        queryClient.setQueryData<AppNotification[]>(sampleKey, (current) =>
          markSampleNotificationAsRead(
            current ?? getSandboxSamples<AppNotification[]>('social', 'getNotifications', [], []),
            notificationId,
          ),
        );
        return;
      }
      await markAsReadMutation.mutateAsync(notificationId);
    },
    [markAsReadMutation.mutateAsync, queryClient, sampleKey, usesSamples],
  );
  const markAllRead = useCallback(async () => {
    if (usesSamples) {
      queryClient.setQueryData<AppNotification[]>(sampleKey, (current) =>
        markAllSampleNotificationsAsRead(
          current ?? getSandboxSamples<AppNotification[]>('social', 'getNotifications', [], []),
        ),
      );
      return;
    }
    await markAllReadMutation.mutateAsync();
  }, [markAllReadMutation.mutateAsync, queryClient, sampleKey, usesSamples]);
  const samples = usesSamples
    ? (sampleNotifications ??
      getSandboxSamples<AppNotification[]>('social', 'getNotifications', [], []))
    : [];
  const error = errorMessage(
    scopeUnavailable
      ? 'Notifications are unavailable until the active account scope is ready.'
      : null,
    realtimeStatus === 'ERROR' ? 'Realtime notification synchronization failed.' : null,
    listQuery.error,
    countQuery.error,
    markAsReadMutation.error,
    markAllReadMutation.error,
  );

  return useMemo(
    () => ({
      notifications: usesSamples ? samples : realNotifications,
      unreadCount: usesSamples
        ? samples.filter((item) => !item.is_read).length
        : (countQuery.data ?? 0),
      isLoading: scope !== null && (listQuery.isLoading || countQuery.isLoading),
      isRealtimeConnected: realtimeStatus === 'CONNECTED',
      error,
      isMarkingRead: markAsReadMutation.isPending || markAllReadMutation.isPending,
      markAsRead,
      markAllRead,
      refresh: () => void invalidate(),
    }),
    [
      countQuery.data,
      error,
      invalidate,
      realNotifications,
      listQuery.isLoading,
      countQuery.isLoading,
      markAllRead,
      markAllReadMutation.isPending,
      markAsRead,
      markAsReadMutation.isPending,
      realtimeStatus,
      samples,
      scope,
      usesSamples,
    ],
  );
}
