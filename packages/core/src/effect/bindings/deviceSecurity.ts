import { supabaseDeviceSecurityAdapter } from '@repo/core/adapters/supabaseDeviceSecurity.adapter';
import type { IDeviceSecurityPort } from '@repo/core/logic/ports/deviceSecurity.port';

/** Sessions and devices on the account: list, revoke, unlink, trust. */
export const deviceSecurity: IDeviceSecurityPort = supabaseDeviceSecurityAdapter;
