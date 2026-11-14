import type {
  DeviceSecurityMutationResult,
  DeviceSecuritySummary,
  IDeviceSecurityPort,
} from '@repo/core/logic/ports/deviceSecurity.port';
import { APIError } from '@repo/core/types/API';

const unsupported = (): never => {
  throw new APIError(
    'Device security operations are not admitted by the v1 foundation.',
    'UNSUPPORTED',
  );
};

export class SupabaseDeviceSecurityAdapter implements IDeviceSecurityPort {
  getSecuritySummary(): Promise<DeviceSecuritySummary> {
    return Promise.reject(unsupported());
  }
  revokeSession(_sessionId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return Promise.reject(unsupported());
  }
  unlinkDevice(_deviceId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return Promise.reject(unsupported());
  }
  revokeAllSessions(): Promise<DeviceSecurityMutationResult<unknown>> {
    return Promise.reject(unsupported());
  }
  trustDevice(_deviceId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return Promise.reject(unsupported());
  }
}

export const supabaseDeviceSecurityAdapter = new SupabaseDeviceSecurityAdapter();
