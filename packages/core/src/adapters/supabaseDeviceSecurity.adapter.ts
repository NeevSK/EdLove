import {
  type AuthEvent,
  type DeviceSecurityEvent,
  type DeviceSecuritySession,
  type DeviceTrustSummary,
  deviceTrustAPI,
} from '@repo/core/api/deviceTrust';
import type { IDeviceSecurityPort } from '@repo/core/logic/ports/deviceSecurity.port';

/**
 * SupabaseDeviceSecurityAdapter
 *
 * Maps the Device Security Port to the Supabase-backed API.
 */
export class SupabaseDeviceSecurityAdapter implements IDeviceSecurityPort {
  async getSecuritySummary(): Promise<{
    devices: DeviceTrustSummary[];
    events: DeviceSecurityEvent[];
    authEvents: AuthEvent[];
    sessions: DeviceSecuritySession[];
    currentDevice: DeviceTrustSummary | null;
  }> {
    return deviceTrustAPI.getSecuritySummary();
  }

  async revokeSession(sessionId: string): Promise<void> {
    await deviceTrustAPI.revokeSession(sessionId);
  }

  async unlinkDevice(deviceId: string): Promise<void> {
    await deviceTrustAPI.unlinkDevice(deviceId);
  }

  async revokeAllSessions(): Promise<void> {
    await deviceTrustAPI.revokeAllSessions();
  }

  async trustDevice(deviceId: string): Promise<void> {
    await deviceTrustAPI.trustDevice(deviceId);
  }
}
