import type {
  AuthEvent,
  DeviceSecurityEvent,
  DeviceSecuritySession,
  DeviceTrustSummary,
} from '@repo/core/api/deviceTrust';
import type { IDeviceSecurityPort } from '@repo/core/logic/ports/deviceSecurity.port';

/**
 * DeviceSecurityManager
 *
 * The Orchestrator for Device Trust.
 * Handles the logic of syncing device state and managing revocations.
 */
export class DeviceSecurityManager implements IDeviceSecurityPort {
  constructor(private adapter: IDeviceSecurityPort) {}

  async getSecuritySummary(): Promise<{
    devices: DeviceTrustSummary[];
    events: DeviceSecurityEvent[];
    authEvents: AuthEvent[];
    sessions: DeviceSecuritySession[];
    currentDevice: DeviceTrustSummary | null;
  }> {
    return this.adapter.getSecuritySummary();
  }

  async revokeSession(sessionId: string): Promise<void> {
    return this.adapter.revokeSession(sessionId);
  }

  async unlinkDevice(deviceId: string): Promise<void> {
    return this.adapter.unlinkDevice(deviceId);
  }

  async revokeAllSessions(): Promise<void> {
    return this.adapter.revokeAllSessions();
  }

  async trustDevice(deviceId: string): Promise<void> {
    return this.adapter.trustDevice(deviceId);
  }
}
