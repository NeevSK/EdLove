import { createSupabaseEducationalRepository } from '../../adapters/supabase/educationalRepository';
import { createEducationalServices } from '../../logic/domains/educational/services';
import { useStore } from '../../store/useStore';
import { supabase } from '../supabase';

const educationalRepository = createSupabaseEducationalRepository(supabase);

const sideEffects = {
  getCurrentUserId: async () => useStore.getState().user?.id || null,
  emitGrowthSignal: async (userId: string, signal: string, payload: Record<string, unknown>) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[GrowthSignal] ${signal} for ${userId}`, payload);
    }
  },
};

export const educationalServices = createEducationalServices(educationalRepository, sideEffects);
