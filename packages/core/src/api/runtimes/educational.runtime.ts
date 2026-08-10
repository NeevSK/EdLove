import { createSupabaseEducationalRepository } from '@repo/core/adapters/supabase/educationalRepository';
import { createEducationalServices } from '@repo/core/logic/domains/educational/services';
import { useStore } from '@repo/core/store/useStore';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const educationalRepository = createSupabaseEducationalRepository(
  supabaseClient,
);

const sideEffects = {
  getCurrentUserId: async () => useStore.getState().user?.id || null,
  emitGrowthSignal: async (userId: string, signal: string, payload: Record<string, unknown>) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[GrowthSignal] ${signal} for ${userId}`, payload);
    }
  },
};

export const educationalServices = createEducationalServices(educationalRepository, sideEffects);
