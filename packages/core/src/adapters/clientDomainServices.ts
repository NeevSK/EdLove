import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createDomainServices, type DomainServices } from '@repo/core/logic/domains/factory';
import { useStore } from '@repo/core/store/useStore';

let clientDomainServicesInstance: DomainServices | null = null;

/**
 * Returns the singleton DomainServices initialized with the client-bound Supabase client.
 */
export function getClientDomainServices(): DomainServices {
  if (!clientDomainServicesInstance) {
    clientDomainServicesInstance = createDomainServices(supabaseClient, {
      educationalSideEffects: {
        getCurrentUserId: async () => useStore.getState().user?.id || null,
        emitGrowthSignal: async (userId, signal, payload) => {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.log(`[GrowthSignal] ${signal} for ${userId}`, payload);
          }
        },
      },
    });
  }
  return clientDomainServicesInstance;
}
