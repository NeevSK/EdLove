import type { DeviceTrustSummary } from '@repo/core/native/deviceTrust';
export type AuthEvent = Record<string, unknown>;
export type DeviceSecurityEvent = Record<string, unknown>;
export type DeviceSecuritySession = Record<string, unknown>;

export interface DeviceSecuritySummary {
  readonly devices: DeviceTrustSummary[];
  readonly events: DeviceSecurityEvent[];
  readonly authEvents: AuthEvent[];
  readonly sessions: DeviceSecuritySession[];
  readonly currentDevice: DeviceTrustSummary | null;
}

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
  getSecuritySummary(): Promise<DeviceSecuritySummary>;

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
