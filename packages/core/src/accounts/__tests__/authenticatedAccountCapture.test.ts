import type { Session } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const captureCurrentAccount = vi.hoisted(() => vi.fn());

vi.mock('../deviceAccounts', () => ({
  deviceAccounts: { captureCurrentAccount },
}));

import { captureAuthenticatedDeviceAccount } from '../authenticatedAccountCapture';

function session(accessToken = 'access-token'): Session {
  return {
    access_token: accessToken,
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: 4_102_444_800,
    token_type: 'bearer',
    user: {
      id: 'account-1',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'member@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-09-01T00:00:00.000Z',
    },
  } as Session;
}

const identity = {
  id: 'account-1',
  email: 'member@example.com',
  display_name: 'Member',
  availableBonds: [],
  activeBond: { id: 'bond-1', capacity: 'guardian' },
  schoolId: 'school-1',
};

describe('captureAuthenticatedDeviceAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captureCurrentAccount.mockResolvedValue(undefined);
  });

  it('captures a verified identity once for a session token', async () => {
    const capturedSessionKeys = new Set<string>();
    const capturingSessionKeys = new Set<string>();

    await captureAuthenticatedDeviceAccount({
      capturedSessionKeys,
      capturingSessionKeys,
      identity,
      session: session(),
    });
    await captureAuthenticatedDeviceAccount({
      capturedSessionKeys,
      capturingSessionKeys,
      identity,
      session: session(),
    });

    expect(captureCurrentAccount).toHaveBeenCalledOnce();
    expect(captureCurrentAccount).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: 'access-token' }),
      expect.objectContaining({ id: 'account-1', capacity: 'guardian' }),
    );
  });

  it('captures a mapped account whose account ID differs from the auth subject', async () => {
    const capturedSessionKeys = new Set<string>();
    const capturingSessionKeys = new Set<string>();

    await captureAuthenticatedDeviceAccount({
      capturedSessionKeys,
      capturingSessionKeys,
      identity: { ...identity, id: 'public-account-1' },
      session: session(),
    });

    expect(captureCurrentAccount).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: 'access-token' }),
      expect.objectContaining({ id: 'public-account-1' }),
    );
  });

  it('leaves a failed capture eligible for a later session refresh retry', async () => {
    const capturedSessionKeys = new Set<string>();
    const capturingSessionKeys = new Set<string>();
    captureCurrentAccount.mockRejectedValueOnce(new Error('registry unavailable'));

    await captureAuthenticatedDeviceAccount({
      capturedSessionKeys,
      capturingSessionKeys,
      identity,
      session: session(),
    });
    await captureAuthenticatedDeviceAccount({
      capturedSessionKeys,
      capturingSessionKeys,
      identity,
      session: session(),
    });

    expect(captureCurrentAccount).toHaveBeenCalledTimes(2);
    expect(capturedSessionKeys).toEqual(new Set(['account-1:access-token']));
    expect(capturingSessionKeys).toEqual(new Set());
  });
});
