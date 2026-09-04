import type {
  AuthEvent,
  DeviceSecurityEvent,
  DeviceSecuritySession,
  DeviceTrustSummary,
} from '@repo/core/api/deviceTrust';

/**
 * IDeviceSecurityPort
 *
 * The Sovereign Port for Device Security & Trust.
 * Decouples the UI from the underlying Supabase/Realtime implementation.
 */
export interface IDeviceSecurityPort {
  /**
   * Fetches all security-related data for the current user.
   */
  getSecuritySummary(): Promise<{
    devices: DeviceTrustSummary[];
    events: DeviceSecurityEvent[];
    authEvents: AuthEvent[];
    sessions: DeviceSecuritySession[];
    currentDevice: DeviceTrustSummary | null;
  }>;

  /**
   * Revokes a specific session.
   */
  revokeSession(sessionId: string): Promise<DeviceSecurityMutationResult<unknown>>;

  /**
   * Unlinks (untrusts) a specific device.
   */
  unlinkDevice(deviceId: string): Promise<DeviceSecurityMutationResult<unknown>>;

  /**
   * Revokes all active sessions for the user.
   */
  revokeAllSessions(): Promise<DeviceSecurityMutationResult<unknown>>;

  /**
   * Marks a device as trusted (elevation).
   */
  trustDevice(deviceId: string): Promise<DeviceSecurityMutationResult<unknown>>;
}

export interface DeviceSecurityMutationResult<T> {
  queued: boolean;
  data: T;
}
