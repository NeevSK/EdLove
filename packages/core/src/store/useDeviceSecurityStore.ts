import { create } from 'zustand';
import type {
  DeviceSecurityEvent,
  DeviceSecuritySession,
  DeviceTrustSummary,
} from '../api/deviceTrust';
import { deviceSecurity } from '../logic/managers/factory';

interface DeviceSecurityState {
  devices: DeviceTrustSummary[];
  events: DeviceSecurityEvent[];
  sessions: DeviceSecuritySession[];
  currentDevice: DeviceTrustSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;

  // Actions
  fetchSecuritySummary: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  unlinkDevice: (deviceId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  trustDevice: (deviceId: string) => Promise<void>;
}

export const useDeviceSecurityStore = create<DeviceSecurityState>((set, get) => ({
  devices: [],
  events: [],
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
      await deviceSecurity.revokeSession(sessionId);
      // Optimistic update
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === sessionId ? { ...s, status: 'revoked' } : s,
        ),
        loading: false,
      }));
      // Actual refresh
      await get().fetchSecuritySummary();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  unlinkDevice: async (deviceId) => {
    set({ loading: true });
    try {
      await deviceSecurity.unlinkDevice(deviceId);
      // Optimistic remove
      set((state) => ({
        devices: state.devices.filter((d) => d.deviceId !== deviceId),
        loading: false,
      }));
      // Actual refresh
      await get().fetchSecuritySummary();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  revokeAllSessions: async () => {
    set({ loading: true });
    try {
      await deviceSecurity.revokeAllSessions();
      await get().fetchSecuritySummary();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  trustDevice: async (deviceId) => {
    set({ loading: true });
    try {
      await deviceSecurity.trustDevice(deviceId);
      await get().fetchSecuritySummary();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
