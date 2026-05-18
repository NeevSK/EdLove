import { AuthManager } from './AuthManager';
import { SupabaseAuthAdapter } from '../../adapters/supabase/auth.adapter';
import { identity } from './identity.factory';
import { disconnectPowerSync } from '../../adapters/powersync/database';
import { storage } from '../../lib/storage';

/**
 * auth: The Global Sovereign Auth Instance.
 */
export const auth = new AuthManager(
  new SupabaseAuthAdapter(),
  identity, 
  {
    onSignOut: async () => {
      await disconnectPowerSync();
    },
    storage: {
      clearAll: () => storage.clearAll(),
    },
  }
);
