import { createSupabaseEducationalRepository } from '../../adapters/supabase/educationalRepository';
import { growthSignalsAPI } from '../../api/growthSignals';
import { identityAPI } from '../../api/identity';
import { createEducationalServices } from './services';

const educationalRepository = createSupabaseEducationalRepository();

export const educationalServices = createEducationalServices(educationalRepository, {
  getCurrentUserId: () => identityAPI.getMyInternalId(),
  emitGrowthSignal: (userId, signal, payload) =>
    growthSignalsAPI.emitSignal({
      user_id: userId,
      event_type: signal as any,
      event_metadata: payload as any,
    }),
});
