import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PerspectiveStoreState {
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

export const DEFAULT_PERSONAL_PERSPECTIVE: SanctuaryPerspective = {
  id: 'personal',
  kind: 'personal',
  displayName: 'Personal Sanctuary',
};

/**
 * usePerspectiveStore
 *
 * Sovereign, atomic store for managing Sanctuary Perspectives (Personal vs School vs Guardian).
 * Handles synchronous in-memory state eviction and Cedar permission tree swapping on perspective transition.
 */
export const usePerspectiveStore = create<PerspectiveStoreState>()(
  persist(
    (set, get) => ({
      activePerspective: DEFAULT_PERSONAL_PERSPECTIVE,
      availablePerspectives: [DEFAULT_PERSONAL_PERSPECTIVE],
      isTransitioning: false,

      setAvailablePerspectives: (perspectives) => {
        const currentActive = get().activePerspective;
        const matchingActive =
          perspectives.find((p) => p.id === currentActive.id) ??
          perspectives[0] ??
          DEFAULT_PERSONAL_PERSPECTIVE;

        set({
          availablePerspectives:
            perspectives.length > 0 ? perspectives : [DEFAULT_PERSONAL_PERSPECTIVE],
          activePerspective: matchingActive,
        });
      },

      addPerspective: (perspective) => {
        set((state) => {
          const exists = state.availablePerspectives.some((p) => p.id === perspective.id);
          if (exists) {
            return {
              availablePerspectives: state.availablePerspectives.map((p) =>
                p.id === perspective.id ? perspective : p,
              ),
            };
          }
          return {
            availablePerspectives: [...state.availablePerspectives, perspective],
          };
        });
      },

      removePerspective: (perspectiveId) => {
        if (perspectiveId === 'personal') return; // Cannot delete personal sanctuary
        set((state) => {
          const filtered = state.availablePerspectives.filter((p) => p.id !== perspectiveId);
          const nextActive =
            state.activePerspective.id === perspectiveId
              ? DEFAULT_PERSONAL_PERSPECTIVE
              : state.activePerspective;
          return {
            availablePerspectives: filtered.length > 0 ? filtered : [DEFAULT_PERSONAL_PERSPECTIVE],
            activePerspective: nextActive,
          };
        });
      },

      updatePerspective: (perspectiveId, updates) => {
        set((state) => {
          const updatedPerspectives = state.availablePerspectives.map((p) =>
            p.id === perspectiveId ? ({ ...p, ...updates } as SanctuaryPerspective) : p,
          );
          const nextActive =
            state.activePerspective.id === perspectiveId
              ? ({ ...state.activePerspective, ...updates } as SanctuaryPerspective)
              : state.activePerspective;
          return {
            availablePerspectives: updatedPerspectives,
            activePerspective: nextActive,
          };
        });
      },

      hydratePerspectivesFromDatabase: async (userId, dependencies) => {
        try {
          const personal = DEFAULT_PERSONAL_PERSPECTIVE;
          const [institutional = [], commercial = [], guardian = []] = await Promise.all([
            dependencies.getInstitutionalBonds
              ? dependencies.getInstitutionalBonds()
              : Promise.resolve([]),
            dependencies.getCommercialBatches
              ? dependencies.getCommercialBatches()
              : Promise.resolve([]),
            dependencies.getGuardianBonds ? dependencies.getGuardianBonds() : Promise.resolve([]),
          ]);

          const combined = [personal, ...institutional, ...commercial, ...guardian];
          const currentActive = get().activePerspective;
          const stillValidActive = combined.find((p) => p.id === currentActive.id) ?? personal;

          set({
            availablePerspectives: combined,
            activePerspective: stillValidActive,
          });
        } catch (error) {
          console.error('[usePerspectiveStore] Error hydrating perspectives from database:', error);
        }
      },

      switchPerspective: async (perspectiveId: string) => {
        const { availablePerspectives, activePerspective } = get();
        if (activePerspective.id === perspectiveId) return;

        const targetPerspective = availablePerspectives.find((p) => p.id === perspectiveId);
        if (!targetPerspective) {
          console.warn(
            `[usePerspectiveStore] Target perspective '${perspectiveId}' not found in available perspectives.`,
          );
          return;
        }

        set({ isTransitioning: true });

        try {
          const previousPerspective = activePerspective;

          // 1. Evict / Invalidate previous Cedar permission decision snapshot
          useCedarDecisionStore.getState().clearDecisions();

          // 2. Emit perspective transition event over Sovereign Event Bus for cache flushing
          sovereignBus.emit('perspective:transition_started' as any, {
            from: previousPerspective,
            to: targetPerspective,
          });

          // 3. Atomically update active perspective pointer
          set({
            activePerspective: targetPerspective,
          });

          // 4. Reload Cedar decisions for the new perspective scope if user is available
          const userId = useAuthStore.getState().user?.id;
          if (userId) {
            const targetScopeId =
              targetPerspective.kind === 'institutional'
                ? targetPerspective.schoolId
                : targetPerspective.id;

            await useCedarDecisionStore.getState().loadDecisions(userId, targetScopeId);
          }

          sovereignBus.emit('perspective:transition_completed' as any, {
            activePerspective: targetPerspective,
          });
        } catch (error) {
          console.error('[usePerspectiveStore] Error during perspective switch:', error);
        } finally {
          set({ isTransitioning: false });
        }
      },

      resetToPersonalPerspective: () => {
        useCedarDecisionStore.getState().clearDecisions();
        set({
          activePerspective: DEFAULT_PERSONAL_PERSPECTIVE,
          isTransitioning: false,
        });
      },
    }),
    {
      name: 'gurudevi-perspective-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        activePerspective: state.activePerspective,
        availablePerspectives: state.availablePerspectives,
      }),
    },
  ),
);
