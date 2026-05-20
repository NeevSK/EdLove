import { disconnectPowerSync } from '../../adapters/powersync/database';
import { SupabaseAuthAdapter } from '../../adapters/supabase/auth.adapter';
import { storage } from '../../lib/storage';
import { AuthManager } from './AuthManager';
import { identity } from './identity.factory';

/**
 * auth: The Global Sovereign Auth Instance.
 */
export const auth = new AuthManager(new SupabaseAuthAdapter(), identity, {
  onSignOut: async () => {
    await disconnectPowerSync();
  },
  storage: {
    clearAll: () => storage.clearAll(),
  },
});
