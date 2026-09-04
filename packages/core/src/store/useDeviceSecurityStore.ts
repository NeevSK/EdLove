import type {
  AuthEvent,
  DeviceSecurityEvent,
  DeviceSecurityMutationResult,
  DeviceSecuritySession,
  DeviceTrustSummary,
} from '@repo/core/api/deviceTrust';
import { deviceSecurity } from '@repo/core/logic/managers/factory';
import { create } from 'zustand';

interface DeviceSecurityState {
  devices: DeviceTrustSummary[];
  events: DeviceSecurityEvent[];
  authEvents: AuthEvent[];
  sessions: DeviceSecuritySession[];
  currentDevice: DeviceTrustSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;

  // Actions
  fetchSecuritySummary: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<DeviceSecurityMutationResult<unknown>>;
  unlinkDevice: (deviceId: string) => Promise<DeviceSecurityMutationResult<unknown>>;
  revokeAllSessions: () => Promise<DeviceSecurityMutationResult<unknown>>;
  trustDevice: (deviceId: string) => Promise<DeviceSecurityMutationResult<unknown>>;
}

export const useDeviceSecurityStore = create<DeviceSecurityState>((set, get) => ({
  devices: [],
  events: [],
  authEvents: [],
  sessions: [],
  currentDevice: null,
  loading: false,
  error: null,
  lastUpdated: 0,

  fetchSecuritySummary: async () => {
    // Throttling: Avoid fetching more than once every 30 seconds unless forced
    const now = Date.now();
    if (get().loading || (now - get().lastUpdated < 30000 && get().devices.length > 0)) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const summary = await deviceSecurity.getSecuritySummary();
      set({
        ...summary,
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  revokeSession: async (sessionId) => {
    set({ loading: true });
    try {
      const result = await deviceSecurity.revokeSession(sessionId);
      if (result.queued) {
        set({ loading: false });
      } else {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.sessionId === sessionId ? { ...s, status: 'revoked' } : s,
          ),
          loading: false,
        }));
        await get().fetchSecuritySummary();
      }
      return result;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  unlinkDevice: async (deviceId) => {
    set({ loading: true });
    try {
      const result = await deviceSecurity.unlinkDevice(deviceId);
      if (result.queued) {
        set({ loading: false });
      } else {
        set((state) => ({
          devices: state.devices.filter((d) => d.deviceId !== deviceId),
          loading: false,
        }));
        await get().fetchSecuritySummary();
      }
      return result;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  revokeAllSessions: async () => {
    set({ loading: true });
    try {
      const result = await deviceSecurity.revokeAllSessions();
      if (result.queued) {
        set({ loading: false });
      } else {
        await get().fetchSecuritySummary();
      }
      return result;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  trustDevice: async (deviceId) => {
    set({ loading: true });
    try {
      const result = await deviceSecurity.trustDevice(deviceId);
      if (result.queued) {
        set({ loading: false });
      } else {
        await get().fetchSecuritySummary();
      }
      return result;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
