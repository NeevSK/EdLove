import type {
  AuthEvent,
  DeviceSecurityEvent,
  DeviceSecuritySession,
  DeviceTrustSummary,
} from '@repo/core/api/deviceTrust';
import type {
  DeviceSecurityMutationResult,
  DeviceSecuritySummary,
  IDeviceSecurityPort,
} from '@repo/core/logic/ports/deviceSecurity.port';

export class DeviceSecurityManager implements IDeviceSecurityPort {
  constructor(private adapter: IDeviceSecurityPort) {}

  async getSecuritySummary(): Promise<DeviceSecuritySummary> {
    return this.adapter.getSecuritySummary();
  }

  async revokeSession(sessionId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return this.adapter.revokeSession(sessionId);
  }

  async unlinkDevice(deviceId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return this.adapter.unlinkDevice(deviceId);
  }

  async revokeAllSessions(): Promise<DeviceSecurityMutationResult<unknown>> {
    return this.adapter.revokeAllSessions();
  }

  async trustDevice(deviceId: string): Promise<DeviceSecurityMutationResult<unknown>> {
    return this.adapter.trustDevice(deviceId);
  }
}
