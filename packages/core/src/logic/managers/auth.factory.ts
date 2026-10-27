import { SupabaseAuthAdapter } from '@repo/core/adapters/supabase/auth.adapter';
import { AuthManager } from '@repo/core/logic/managers/AuthManager';
import { identity } from '@repo/core/logic/managers/identity.factory';
import { resetScopedStores } from '@repo/core/store/resetScopedStores';

/**
 * auth: The Global Sovereign Auth Instance.
 */
export const auth = new AuthManager(new SupabaseAuthAdapter(), identity, {
  onSignOut: async () => {
    if (typeof document !== 'undefined') {
      return;
    }

    const { disconnectPowerSync } = await import('../../adapters/powersync/database');
    await disconnectPowerSync();
  },
  localState: {
    clear: resetScopedStores,
  },
});
