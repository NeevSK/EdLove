import { SupabaseAuthAdapter } from '../../adapters/supabase/auth.adapter';
import { storage } from '../../lib/storage';
import { AuthManager } from './AuthManager';
import { identity } from './identity.factory';
import { Platform } from 'react-native';

/**
 * auth: The Global Sovereign Auth Instance.
 */
export const auth = new AuthManager(new SupabaseAuthAdapter(), identity, {
  onSignOut: async () => {
    if (Platform.OS === 'web') {
      return;
    }

    const { disconnectPowerSync } = await import('../../adapters/powersync/database');
    await disconnectPowerSync();
  },
  storage: {
    clearAll: () => storage.clearAll(),
  },
});
