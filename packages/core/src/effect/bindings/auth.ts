import { captureAuthenticatedDeviceAccount } from '@repo/core/accounts/authenticatedAccountCapture.adapter';
import { deviceAccounts } from '@repo/core/accounts/deviceAccounts.adapter';
import { disconnectPowerSync } from '@repo/core/adapters/powersync/database';
import { supabaseRealtimeAdapter } from '@repo/core/adapters/realtime/supabase.adapter';
import { supabaseIdentityAdapter } from '@repo/core/adapters/supabaseIdentity.adapter';
import { clearAuthSubject, identifyAuthSubject, initSentry } from '@repo/core/monitoring';

/**
 * What the auth lifecycle drives on sign-in, refresh and sign-out: the accounts kept on this
 * device, the identity read, the realtime channel, the local database connection and the
 * telemetry subject.
 */
export const authLifecycle = {
  deviceAccounts,
  captureAuthenticatedDeviceAccount,
  identity: supabaseIdentityAdapter,
  realtime: supabaseRealtimeAdapter,
  disconnectPowerSync,
  telemetry: { initSentry, identifyAuthSubject, clearAuthSubject },
};
