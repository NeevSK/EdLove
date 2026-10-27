import { getSessionIdentityMode } from '@repo/core/logic/auth/identityState';
import { useAuth } from '@repo/core/providers/AuthProvider';
import { useEntitlementQuery } from '@repo/core/hooks/useEntitlementQuery';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { Bond } from '@repo/core/types/Identity';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

type CapabilityHydrationProviderProps = {
  children: ReactNode;
};

type CapabilityHydrationContextValue = {
  error: string | null;
  isLoading: boolean;
  retry: () => void;
};

const CapabilityHydrationContext = createContext<CapabilityHydrationContextValue | null>(null);

function getEntitlementScope(activeBond: Bond | null) {
  return {
    activeBondId: activeBond?.id ?? null,
    activeEntityId: activeBond?.entity_id ?? null,
    activeEntityType: activeBond?.entity_type ?? null,
  };
}

export function useCapabilityHydration(): CapabilityHydrationContextValue {
  const context = useContext(CapabilityHydrationContext);
  if (!context) {
    throw new Error('useCapabilityHydration must be used within CapabilityHydrationProvider');
  }
  return context;
}

/**
 * Hydrates commercial capability state once per authenticated account and
 * active perspective. Domain screens may render their baseline shell while
 * this runs; paid and privileged actions continue to fail closed.
 */
export function CapabilityHydrationProvider({ children }: CapabilityHydrationProviderProps) {
  const { identityAvailability, loading, session, resolvedAuthSubjectId } = useAuth();
  const user = useAuthStore((state) => state.user);
  const scopeSnapshot = useScopeSessionStore((state) => state.snapshot);
  const scopeTransitioning = useScopeSessionStore((state) => state.isTransitioning);
  const activeBond =
    !scopeTransitioning && scopeSnapshot?.principalId === (user?.id ?? null)
      ? (scopeSnapshot?.activeBond ?? null)
      : null;
  const isCloudAccount = getSessionIdentityMode(session) === 'authenticated';
  const canLoad = Boolean(
    !loading &&
      session?.user.id &&
      user?.id &&
      resolvedAuthSubjectId === session.user.id &&
      identityAvailability === 'active' &&
      !scopeTransitioning &&
      scopeSnapshot?.principalId === user.id &&
      isCloudAccount,
  );
  const entitlement = useEntitlementQuery(
    user?.id ?? null,
    getEntitlementScope(activeBond),
    canLoad,
  );
  const retry = useCallback(() => {
    if (canLoad) void entitlement.refetch();
  }, [canLoad, entitlement.refetch]);
  const value = useMemo(
    () => ({ error: entitlement.error, isLoading: entitlement.isLoading, retry }),
    [entitlement.error, entitlement.isLoading, retry],
  );

  return (
    <CapabilityHydrationContext.Provider value={value}>
      {children}
    </CapabilityHydrationContext.Provider>
  );
}
