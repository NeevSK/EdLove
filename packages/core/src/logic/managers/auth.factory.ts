import { SupabaseAuthAdapter } from '@repo/core/adapters/supabase/auth.adapter';
import { storage } from '@repo/core/lib/storage';
import { AuthManager } from '@repo/core/logic/managers/AuthManager';
import { identity } from '@repo/core/logic/managers/identity.factory';

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
