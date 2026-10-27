import {
  type AuthEvent,
  type DeviceSecurityEvent,
  type DeviceSecurityMutationResult,
  type DeviceSecuritySession,
  type DeviceTrustSummary,
  deviceTrustAPI,
} from '@repo/core/api/deviceTrust';
import type {
  DeviceSecuritySummary,
  IDeviceSecurityPort,
} from '@repo/core/logic/ports/deviceSecurity.port';

/**
 * SupabaseDeviceSecurityAdapter
 *
 * Maps the Device Security Port to the Supabase-backed API.
 */
export class SupabaseDeviceSecurityAdapter implements IDeviceSecurityPort {
  async getSecuritySummary(): Promise<DeviceSecuritySummary> {
    return deviceTrustAPI.getSecuritySummary();
  }

  async revokeSession(sessionId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return deviceTrustAPI.revokeSession(sessionId);
  }

  async unlinkDevice(deviceId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return deviceTrustAPI.unlinkDevice(deviceId);
  }

  async revokeAllSessions(): Promise<DeviceSecurityMutationResult<unknown>> {
    return deviceTrustAPI.revokeAllSessions();
  }

  async trustDevice(deviceId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return deviceTrustAPI.trustDevice(deviceId);
  }
}
