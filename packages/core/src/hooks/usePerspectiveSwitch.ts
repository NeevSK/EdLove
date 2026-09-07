import { storage } from '@repo/core/lib/storage';
import { TenantPartitionedStorageAdapter } from '@repo/core/lib/tenantStorage';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import { useStore } from '@repo/core/store/useStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { useCallback, useMemo } from 'react';

/**
 * usePerspectiveSwitch
 *
 * Hook for managing active sanctuary perspectives (Personal Sanctuary vs School Bonds vs Guardian Links).
 * Provides fast atomic context switching, Cedar decision re-hydration, and 0ms state swap.
 */
export function usePerspectiveSwitch() {
  const activePerspective = usePerspectiveStore((state) => state.activePerspective);
  const availablePerspectives = usePerspectiveStore((state) => state.availablePerspectives);
  const isTransitioning = usePerspectiveStore((state) => state.isTransitioning);
  const switchPerspectiveState = usePerspectiveStore((state) => state.switchPerspective);
  const resetToPersonal = usePerspectiveStore((state) => state.resetToPersonalPerspective);
  const setAvailablePerspectivesState = usePerspectiveStore((state) => state.setAvailablePerspectives);

  const user = useStore((state) => state.user);
  const availableBonds = useStore((state) => state.availableBonds);
  const setPerspective = useStore((state) => state.setPerspective);

  const addPerspectiveState = usePerspectiveStore((state) => state.addPerspective);
  const removePerspectiveState = usePerspectiveStore((state) => state.removePerspective);
  const updatePerspectiveState = usePerspectiveStore((state) => state.updatePerspective);

  const isPersonal = useMemo(() => activePerspective.kind === 'personal', [activePerspective]);

  const switchPerspective = useCallback(
    async (perspectiveId: string) => {
      await switchPerspectiveState(perspectiveId);

      // Keep legacy tenant slice updated for backward compatibility
      const target = availablePerspectives.find((p) => p.id === perspectiveId);
      if (target && target.kind === 'institutional') {
        useTenantStore.getState().setSchool(target.schoolId, target.schoolName);
      } else {
        useTenantStore.getState().setSchool(null, null);
      }

      // Synchronize active bond in root identity store
      const matchingBond = availableBonds?.find(
        (b) => b.id === perspectiveId || `bond:${b.entity_id}` === perspectiveId || b.entity_id === perspectiveId,
      );
      setPerspective({
        activeBond: matchingBond,
        availableBonds: availableBonds ?? [],
      });
    },
    [availableBonds, availablePerspectives, setPerspective, switchPerspectiveState],
  );

  const setAvailablePerspectives = useCallback(
    (perspectives: SanctuaryPerspective[]) => {
      setAvailablePerspectivesState(perspectives);
      useTenantStore.getState().setAvailablePerspectives(perspectives);
    },
    [setAvailablePerspectivesState],
  );

  const addPerspective = useCallback(
    (perspective: SanctuaryPerspective) => {
      addPerspectiveState(perspective);
    },
    [addPerspectiveState],
  );

  const removePerspective = useCallback(
    (perspectiveId: string) => {
      removePerspectiveState(perspectiveId);
    },
    [removePerspectiveState],
  );

  const updatePerspective = useCallback(
    (perspectiveId: string, updates: Partial<SanctuaryPerspective>) => {
      updatePerspectiveState(perspectiveId, updates);
    },
    [updatePerspectiveState],
  );

  /**
   * Returns an isolated, sandboxed storage adapter bound strictly to the specified perspective
   * or the currently active perspective. Prevents cross-perspective state leakage.
   */
  const getPerspectiveStorage = useCallback(
    (perspectiveId?: string): IStorage => {
      const targetId = perspectiveId || activePerspective.id;
      const targetUserId = user?.id || 'anonymous';
      return new TenantPartitionedStorageAdapter(storage, `perspective:${targetId}`, targetUserId);
    },
    [activePerspective.id, user?.id],
  );

  const hydratePerspectivesFromDatabaseState = usePerspectiveStore(
    (state) => state.hydratePerspectivesFromDatabase,
  );

  const hydratePerspectivesFromDatabase = useCallback(
    async (userId: string, dependencies: {
      getInstitutionalBonds?: () => Promise<SanctuaryPerspective[]>;
      getCommercialBatches?: () => Promise<SanctuaryPerspective[]>;
      getGuardianBonds?: () => Promise<SanctuaryPerspective[]>;
    }) => {
      await hydratePerspectivesFromDatabaseState(userId, dependencies);
    },
    [hydratePerspectivesFromDatabaseState],
  );

  return {
    activePerspective,
    availablePerspectives,
    isTransitioning,
    isPersonal,
    switchPerspective,
    resetToPersonal,
    setAvailablePerspectives,
    addPerspective,
    removePerspective,
    updatePerspective,
    getPerspectiveStorage,
    hydratePerspectivesFromDatabase,
  };
}

