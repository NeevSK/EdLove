import { createSupabaseEducationalRepository } from '../../adapters/supabase/educationalRepository';
import { createEducationalServices } from '../../logic/domains/educational/services';
import { useStore } from '../../store/useStore';

const educationalRepository = createSupabaseEducationalRepository();

const sideEffects = {
  getCurrentUserId: async () => useStore.getState().user?.id || null,
  emitGrowthSignal: (userId: string, signal: string, payload: Record<string, unknown>) => {
    if (__DEV__) {
      console.log(`[GrowthSignal] ${signal} for ${userId}`, payload);
    }
  },
};

export const educationalServices = createEducationalServices(educationalRepository, sideEffects);
