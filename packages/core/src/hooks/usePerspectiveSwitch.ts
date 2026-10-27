import { storage } from '@repo/core/lib/storage';
import { TenantPartitionedStorageAdapter } from '@repo/core/lib/tenantStorage';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';
import type { Bond } from '@repo/core/types/Identity';
import {
  PERSONAL_SCOPE_PERSPECTIVE,
  replaceScopeSessionPerspectives,
  transitionScopeSession,
  useAuthStore,
  useScopeSessionStore,
} from '@repo/core/store';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { useCallback, useMemo } from 'react';

function bondForPerspective(
  perspective: SanctuaryPerspective,
  bonds: readonly Bond[],
) {
  if (perspective.kind !== 'institutional') return undefined;
  return bonds.find(
    (bond) =>
      bond.id === perspective.id &&
      bond.entity_type === 'SCHOOL' &&
      bond.entity_id === perspective.schoolId &&
      bond.capacity === perspective.capacity,
  );
}

function mergeAccountOwnedWorkspaceMetadata(
  canonical: readonly SanctuaryPerspective[],
  hydrated: readonly SanctuaryPerspective[],
): SanctuaryPerspective[] {
  return [
    ...canonical,
    ...hydrated.filter((candidate) => !canonical.some((item) => item.id === candidate.id)),
  ];
}

function assertCurrentScopeOwner(
  snapshot: ReturnType<typeof useScopeSessionStore.getState>['snapshot'],
  principalId: string | null | undefined,
): void {
  if (snapshot?.principalId !== (principalId ?? null)) {
    throw new Error('Perspective changes require the canonical scope for the current account.');
  }
}

/**
 * usePerspectiveSwitch
 *
 * Hook for managing the canonical scope session and its account-owned workspace metadata.
 */
export function usePerspectiveSwitch() {
  const scopeSnapshot = useScopeSessionStore((state) => state.snapshot);
  const scopeTransitioning = useScopeSessionStore((state) => state.isTransitioning);
  const activePerspective = scopeSnapshot?.activePerspective ?? PERSONAL_SCOPE_PERSPECTIVE;
  const availablePerspectives = useMemo(
    () => [...(scopeSnapshot?.availablePerspectives ?? [PERSONAL_SCOPE_PERSPECTIVE])],
    [scopeSnapshot],
  );
  const isTransitioning = scopeTransitioning;

  const user = useAuthStore((state) => state.user);
  const availableBonds = scopeSnapshot?.availableBonds ?? [];

  const isPersonal = useMemo(() => activePerspective.kind === 'personal', [activePerspective]);

  const switchPerspective = useCallback(
    async (perspectiveId: string) => {
      assertCurrentScopeOwner(scopeSnapshot, user?.id);
      const target = availablePerspectives.find((p) => p.id === perspectiveId);
      if (!target) {
        throw new Error(`Perspective '${perspectiveId}' is not available to the current scope.`);
      }
      await transitionScopeSession({
        principalId: user?.id ?? null,
        activePerspective: target,
        availablePerspectives,
        availableBonds,
        selectedBond: bondForPerspective(target, availableBonds),
      });
    },
    [availableBonds, availablePerspectives, scopeSnapshot, user?.id],
  );

  const setAvailablePerspectives = useCallback(
    async (perspectives: SanctuaryPerspective[]) => {
      assertCurrentScopeOwner(scopeSnapshot, user?.id);
      await replaceScopeSessionPerspectives({
        principalId: user?.id ?? null,
        currentPerspective: activePerspective,
        availablePerspectives: perspectives,
        availableBonds,
      });
    },
    [activePerspective, availableBonds, scopeSnapshot, user?.id],
  );

  const resetToPersonal = useCallback(async () => {
    assertCurrentScopeOwner(scopeSnapshot, user?.id);
    const perspectives = availablePerspectives.some(
      (perspective) => perspective.id === PERSONAL_SCOPE_PERSPECTIVE.id,
    )
      ? availablePerspectives
      : [PERSONAL_SCOPE_PERSPECTIVE, ...availablePerspectives];
    await transitionScopeSession({
      principalId: user?.id ?? null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: perspectives,
      availableBonds,
      selectedBond: undefined,
    });
  }, [availableBonds, availablePerspectives, scopeSnapshot, user?.id]);

  const addPerspective = useCallback(
    async (perspective: SanctuaryPerspective) => {
      assertCurrentScopeOwner(scopeSnapshot, user?.id);
      const nextAvailable = [
        ...availablePerspectives.filter((candidate) => candidate.id !== perspective.id),
        perspective,
      ];
      await transitionScopeSession({
        principalId: user?.id ?? null,
        activePerspective:
          activePerspective.id === perspective.id ? perspective : activePerspective,
        availablePerspectives: nextAvailable,
        availableBonds,
        selectedBond: bondForPerspective(
          activePerspective.id === perspective.id ? perspective : activePerspective,
          availableBonds,
        ),
      });
    },
    [activePerspective, availableBonds, availablePerspectives, scopeSnapshot, user?.id],
  );

  const removePerspective = useCallback(
    async (perspectiveId: string) => {
      assertCurrentScopeOwner(scopeSnapshot, user?.id);
      if (perspectiveId === PERSONAL_SCOPE_PERSPECTIVE.id) {
        throw new Error('Personal Sanctuary cannot be removed from scope availability.');
      }
      const nextAvailable = availablePerspectives.filter(
        (perspective) => perspective.id !== perspectiveId,
      );
      const nextActive =
        activePerspective.id === perspectiveId ? PERSONAL_SCOPE_PERSPECTIVE : activePerspective;
      await replaceScopeSessionPerspectives({
        principalId: user?.id ?? null,
        currentPerspective: nextActive,
        availablePerspectives: nextAvailable,
        availableBonds,
        selectedBond: bondForPerspective(nextActive, availableBonds),
      });
    },
    [activePerspective, availableBonds, availablePerspectives, scopeSnapshot, user?.id],
  );

  const updatePerspective = useCallback(
    async (perspectiveId: string, updates: Partial<SanctuaryPerspective>) => {
      assertCurrentScopeOwner(scopeSnapshot, user?.id);
      const existing = availablePerspectives.find(
        (perspective) => perspective.id === perspectiveId,
      );
      if (!existing) {
        throw new Error(`Perspective '${perspectiveId}' is not available to the current scope.`);
      }
      const updated = { ...existing, ...updates } as SanctuaryPerspective;
      const nextAvailable = availablePerspectives.map((perspective) =>
        perspective.id === perspectiveId ? updated : perspective,
      );
      await transitionScopeSession({
        principalId: user?.id ?? null,
        activePerspective: activePerspective.id === perspectiveId ? updated : activePerspective,
        availablePerspectives: nextAvailable,
        availableBonds,
        selectedBond: bondForPerspective(
          activePerspective.id === perspectiveId ? updated : activePerspective,
          availableBonds,
        ),
      });
    },
    [activePerspective, availableBonds, availablePerspectives, scopeSnapshot, user?.id],
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

  const hydratePerspectivesFromDatabase = useCallback(
    async (
      userId: string,
      dependencies: {
        getInstitutionalBonds?: () => Promise<SanctuaryPerspective[]>;
        getCommercialBatches?: () => Promise<SanctuaryPerspective[]>;
        getGuardianBonds?: () => Promise<SanctuaryPerspective[]>;
      },
    ) => {
      if (
        !userId ||
        userId !== user?.id ||
        useAuthStore.getState().user?.id !== userId
      ) {
        throw new Error('Perspective metadata cannot be hydrated for a different account.');
      }
      if (useScopeSessionStore.getState().snapshot?.principalId !== userId) return;
      const [commercial = [], guardian = []] = await Promise.all([
        dependencies.getCommercialBatches
          ? dependencies.getCommercialBatches()
          : Promise.resolve([]),
        dependencies.getGuardianBonds ? dependencies.getGuardianBonds() : Promise.resolve([]),
      ]);
      if (
        useAuthStore.getState().user?.id !== userId ||
        useScopeSessionStore.getState().snapshot?.principalId !== userId
      ) {
        return;
      }
      const retainedAvailability = availablePerspectives.filter(
        (perspective) =>
          perspective.kind === 'personal' ||
          (perspective.kind === 'institutional' && bondForPerspective(perspective, availableBonds)) ||
          perspective.kind === 'commercial' ||
          perspective.kind === 'guardian',
      );
      const nextAvailable = mergeAccountOwnedWorkspaceMetadata(
        retainedAvailability.length > 0 ? retainedAvailability : [PERSONAL_SCOPE_PERSPECTIVE],
        [...commercial, ...guardian],
      );
      await replaceScopeSessionPerspectives({
        principalId: userId,
        currentPerspective: activePerspective,
        availablePerspectives: nextAvailable,
        availableBonds,
        selectedBond: bondForPerspective(activePerspective, availableBonds),
      });
    },
    [activePerspective, availableBonds, availablePerspectives, user?.id],
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
