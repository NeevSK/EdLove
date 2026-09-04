import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deviceSecurity } = vi.hoisted(() => ({
  deviceSecurity: {
    getSecuritySummary: vi.fn(),
    revokeSession: vi.fn(),
    unlinkDevice: vi.fn(),
    revokeAllSessions: vi.fn(),
    trustDevice: vi.fn(),
  },
}));

vi.mock('@repo/core/logic/managers/factory', () => ({ deviceSecurity }));

import { useDeviceSecurityStore } from '../useDeviceSecurityStore';

const activeSession = {
  sessionId: 'session-1',
  accountId: 'account-1',
  deviceId: 'device-1',
  installId: 'install-1',
  authUserId: 'auth-1',
  platform: 'android',
  modelName: 'Pixel',
  osVersion: '15',
  status: 'active' as const,
  authStrength: 'session',
  trustStatus: 'trusted' as const,
  startedAt: '2026-09-01T00:00:00.000Z',
  lastSeenAt: '2026-09-01T00:00:00.000Z',
  revokedAt: null,
  revokeReason: null,
};

describe('useDeviceSecurityStore mutation outcomes', { tags: ['security', 'fast'] }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDeviceSecurityStore.setState({
      devices: [],
      events: [],
      authEvents: [],
      sessions: [activeSession],
      currentDevice: null,
      loading: false,
      error: null,
      lastUpdated: Date.now(),
    });
  });

  it('keeps a queued remote revocation visibly pending instead of marking it revoked', async () => {
    vi.when(deviceSecurity.revokeSession)
      .calledWith('session-1')
      .thenReturn(Promise.resolve({ queued: true, data: null }));

    await expect(useDeviceSecurityStore.getState().revokeSession('session-1')).resolves.toEqual({
      queued: true,
      data: null,
    });

    expect(useDeviceSecurityStore.getState()).toMatchObject({
      loading: false,
      error: null,
      sessions: [{ sessionId: 'session-1', status: 'active' }],
    });
  });

  it('preserves and rethrows a rejected remote mutation', async () => {
    deviceSecurity.revokeSession.mockRejectedValue(new Error('Remote session revocation failed.'));

    await expect(useDeviceSecurityStore.getState().revokeSession('session-1')).rejects.toThrow(
      'Remote session revocation failed.',
    );
    expect(useDeviceSecurityStore.getState()).toMatchObject({
      loading: false,
      error: 'Remote session revocation failed.',
      sessions: [{ sessionId: 'session-1', status: 'active' }],
    });
  });
});
