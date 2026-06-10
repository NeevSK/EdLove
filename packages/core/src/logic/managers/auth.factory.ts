import { SupabaseAuthAdapter } from '../../adapters/supabase/auth.adapter';
import { storage } from '../../lib/storage';
import { AuthManager } from './AuthManager';
import { identity } from './identity.factory';

/**
 * auth: The Global Sovereign Auth Instance.
 */
export const auth = new AuthManager(new SupabaseAuthAdapter(), identity, {
  onSignOut: async () => {
    if (typeof window !== 'undefined') {
      return;
    }

    const { disconnectPowerSync } = await import('../../adapters/powersync/database');
    await disconnectPowerSync();
  },
  storage: {
    clearAll: () => storage.clearAll(),
  },
});
