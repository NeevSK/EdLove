import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import type { BanyanStage, BhumiStage, CrystalTier, RiverStage } from '../types/Growth';

export interface GrowthState {
  // Bhumi (Lotus) path
  bhumi_stage: BhumiStage;
  presence_signals: number;
  nourishing_signals: number;
  witnessing_signals: number;
  weaving_signals: number;
  blooming_signals: number;

  // Banyan (Vata) path
  banyan_stage: BanyanStage | null;
  peer_mentored_count: number;
  circles_facilitated_count: number;

  // River (Ganga) path
  river_stage: RiverStage | null;
  lessons_completed_count: number;
  reflections_submitted_count: number;

  // Crystal (Spatika) path
  crystal_tier: CrystalTier | null;
  crystals_found_count: number;
  fractal_moments_count: number;

  // Previous values for delta/change detection
  prev_presence_signals: number;
  prev_nourishing_signals: number;
  prev_witnessing_signals: number;
  prev_weaving_signals: number;
  prev_blooming_signals: number;

  // Actions
  setGrowthState: (state: Partial<GrowthState>) => void;
  resetGrowthState: () => void;
}

const DEFAULT_GROWTH_STATE = {
  bhumi_stage: 'bijam' as BhumiStage,
  presence_signals: 0,
  nourishing_signals: 0,
  witnessing_signals: 0,
  weaving_signals: 0,
  blooming_signals: 0,

  banyan_stage: null,
  peer_mentored_count: 0,
  circles_facilitated_count: 0,

  river_stage: null,
  lessons_completed_count: 0,
  reflections_submitted_count: 0,

  crystal_tier: null,
  crystals_found_count: 0,
  fractal_moments_count: 0,

  prev_presence_signals: 0,
  prev_nourishing_signals: 0,
  prev_witnessing_signals: 0,
  prev_weaving_signals: 0,
  prev_blooming_signals: 0,
};

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_GROWTH_STATE,

      setGrowthState: (newState) => {
        const currentState = get();

        // Track the deltas by storing the previous signal values
        const updatedDeltas: Partial<GrowthState> = {};
        if (newState.presence_signals !== undefined) {
          updatedDeltas.prev_presence_signals = currentState.presence_signals;
        }
        if (newState.nourishing_signals !== undefined) {
          updatedDeltas.prev_nourishing_signals = currentState.nourishing_signals;
        }
        if (newState.witnessing_signals !== undefined) {
          updatedDeltas.prev_witnessing_signals = currentState.witnessing_signals;
        }
        if (newState.weaving_signals !== undefined) {
          updatedDeltas.prev_weaving_signals = currentState.weaving_signals;
        }
        if (newState.blooming_signals !== undefined) {
          updatedDeltas.prev_blooming_signals = currentState.blooming_signals;
        }

        set({
          ...newState,
          ...updatedDeltas,
        });
      },

      resetGrowthState: () => set(DEFAULT_GROWTH_STATE),
    }),
    {
      name: 'gurudevi-growth-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        bhumi_stage: state.bhumi_stage,
        presence_signals: state.presence_signals,
        nourishing_signals: state.nourishing_signals,
        witnessing_signals: state.witnessing_signals,
        weaving_signals: state.weaving_signals,
        blooming_signals: state.blooming_signals,
        banyan_stage: state.banyan_stage,
        peer_mentored_count: state.peer_mentored_count,
        circles_facilitated_count: state.circles_facilitated_count,
        river_stage: state.river_stage,
        lessons_completed_count: state.lessons_completed_count,
        reflections_submitted_count: state.reflections_submitted_count,
        crystal_tier: state.crystal_tier,
        crystals_found_count: state.crystals_found_count,
        fractal_moments_count: state.fractal_moments_count,
      }),
    },
  ),
);
