import { deviceSecurity } from '@repo/core/logic/managers/factory';
import {
  abortableQueryRead,
  type QueryScope,
} from '@repo/core/lib/clientStateFoundation';
import { deviceSecurityQueryKeys } from '@repo/core/lib/deviceSecurityQueryKeys';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import type { DeviceSecuritySummary } from '@repo/core/logic/ports/deviceSecurity.port';
import { useCallback, useMemo } from 'react';
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

const disabledSummaryKey = ['device-security', 'disabled-summary'] as const;

/** Security data is account-owned: workspace switches must not reset its cache. */
export function resolveDeviceSecurityQueryScope(
  requestedPrincipalId: string | null | undefined,
  snapshot: { principalId: string | null } | null,
): QueryScope | null {
  const principalId = requestedPrincipalId?.trim() || null;
  if (!principalId || !snapshot || snapshot.principalId !== principalId) return null;
  return { principalId };
}

function shouldRetryDeviceSecurityRead(failureCount: number, error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  if (/unauthori[sz]ed|forbidden|scope|authenticated account/i.test(message)) return false;
  return failureCount < 2;
}

function readError(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : 'Device-security synchronization failed.';
}

export interface ScopedDeviceSecurityResult {
  readonly scope: QueryScope | null;
  readonly summary: DeviceSecuritySummary | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

export async function invalidateDeviceSecuritySummary(
  queryClient: QueryClient,
  scope: QueryScope,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: deviceSecurityQueryKeys.summary(scope),
    exact: true,
  });
}

/** Query-owned device-security summary read. Commands retain their durable manager/outbox path. */
export function useScopedDeviceSecurity(
  requestedPrincipalId: string | null | undefined,
): ScopedDeviceSecurityResult {
  const queryClient = useQueryClient();
  const snapshot = useScopeSessionStore((state) => state.snapshot);
  const isTransitioning = useScopeSessionStore((state) => state.isTransitioning);
  const scope = useMemo(
    () =>
      isTransitioning
        ? null
        : resolveDeviceSecurityQueryScope(requestedPrincipalId, {
            principalId: snapshot?.principalId ?? null,
          }),
    [isTransitioning, requestedPrincipalId, snapshot?.principalId],
  );
  const summaryKey = useMemo(
    () => (scope ? deviceSecurityQueryKeys.summary(scope) : disabledSummaryKey),
    [scope?.principalId],
  );
  const query = useQuery({
    queryKey: summaryKey,
    queryFn: ({ signal }) => abortableQueryRead(signal, () => deviceSecurity.getSecuritySummary()),
    enabled: scope !== null,
    retry: shouldRetryDeviceSecurityRead,
    staleTime: 30_000,
  });
  const scopeUnavailable =
    scope === null ||
    isTransitioning ||
    snapshot === null ||
    snapshot.principalId !== requestedPrincipalId?.trim();
  const refresh = useCallback(async () => {
    if (!scope) return;
    await invalidateDeviceSecuritySummary(queryClient, scope);
  }, [queryClient, scope]);

  return {
    scope,
    summary: query.data ?? null,
    isLoading: scope !== null && query.isLoading,
    error:
      (scopeUnavailable
        ? 'Device security is unavailable until the active account scope is ready.'
        : null) ?? readError(query.error),
    refresh,
  };
}

export { deviceSecurityQueryKeys } from '@repo/core/lib/deviceSecurityQueryKeys';
