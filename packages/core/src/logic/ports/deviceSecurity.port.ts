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
  revokeSession(sessionId: string): Promise<void>;

  /**
   * Unlinks (untrusts) a specific device.
   */
  unlinkDevice(deviceId: string): Promise<void>;

  /**
   * Revokes all active sessions for the user.
   */
  revokeAllSessions(): Promise<void>;

  /**
   * Marks a device as trusted (elevation).
   */
  trustDevice(deviceId: string): Promise<void>;
}
