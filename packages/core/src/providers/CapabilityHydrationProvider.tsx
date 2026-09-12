import { useAuth } from '@repo/core/providers/AuthProvider';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

type CapabilityHydrationProviderProps = {
  children: ReactNode;
};

type CapabilityHydrationContextValue = {
  error: string | null;
  isLoading: boolean;
  retry: () => void;
};

const CapabilityHydrationContext = createContext<CapabilityHydrationContextValue | null>(null);

function getEntitlementScope(activePerspective: SanctuaryPerspective) {
  return {
    activeBondId: activePerspective.kind === 'personal' ? null : activePerspective.id,
    activeEntityId:
      activePerspective.kind === 'institutional'
        ? activePerspective.schoolId
        : activePerspective.kind === 'commercial'
          ? activePerspective.batchId
          : activePerspective.kind === 'guardian'
            ? activePerspective.wardUserId
            : null,
    activeEntityType:
      activePerspective.kind === 'institutional'
        ? ('SCHOOL' as const)
        : activePerspective.kind === 'commercial'
          ? ('COMMERCIAL_BATCH' as const)
          : activePerspective.kind === 'guardian'
            ? ('GUARDIAN_BOND' as const)
            : null,
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
  const { identityAvailability, loading, session } = useAuth();
  const user = useAuthStore((state) => state.user);
  const activePerspective = usePerspectiveStore((state) => state.activePerspective);
  const loadEntitlements = useEntitlementStore((state) => state.loadEntitlements);
  const clearEntitlements = useEntitlementStore((state) => state.clearEntitlements);
  const error = useEntitlementStore((state) => state.error);
  const isLoading = useEntitlementStore((state) => state.isLoading);

  const retry = useCallback(() => {
    if (
      loading ||
      !session?.user.id ||
      !user?.id ||
      session.user.id !== user.id ||
      identityAvailability !== 'active'
    ) {
      return;
    }

    void loadEntitlements(user.id, getEntitlementScope(activePerspective));
  }, [
    activePerspective,
    identityAvailability,
    loadEntitlements,
    loading,
    session?.user.id,
    user?.id,
  ]);

  useEffect(() => {
    // Do not erase a cached snapshot while auth/profile state is still booting.
    if (loading) return;

    if (!session?.user.id && !user?.id) {
      clearEntitlements();
      return;
    }

    if (
      !session?.user.id ||
      !user?.id ||
      session.user.id !== user.id ||
      identityAvailability !== 'active'
    ) {
      return;
    }

    void loadEntitlements(user.id, getEntitlementScope(activePerspective));
  }, [
    activePerspective,
    clearEntitlements,
    identityAvailability,
    loading,
    loadEntitlements,
    session?.user.id,
    user?.id,
  ]);

  const value = useMemo(() => ({ error, isLoading, retry }), [error, isLoading, retry]);

  return (
    <CapabilityHydrationContext.Provider value={value}>
      {children}
    </CapabilityHydrationContext.Provider>
  );
}
