import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';
import { beforeEach, describe, expect, it } from 'vitest';

import { redirectSystemPath } from '../../../app/+native-intent';

describe('Expo Router +native-intent Middleware', () => {
  beforeEach(() => {
    pendingIntentStore.getState().clearPendingIntent();
  });

  it('rewrites auth callback URLs to the internal /auth/callback route', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://auth/callback?code=one-time-code&state=xyz',
      initial: true,
    });
    expect(result).toBe('/auth/callback?code=one-time-code&state=xyz');
  });

  it('rewrites HTTPS auth callbacks to the internal /auth/callback route', async () => {
    const result = await redirectSystemPath({
      path: 'https://gurudevi.app/auth/callback?code=pkce-verifier-123',
      initial: false,
    });
    expect(result).toBe('/auth/callback?code=pkce-verifier-123');
  });

  it('stashes unauthenticated classroom invites in pendingIntentStore and returns target community route', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://invite/classroom/TEACHER2026',
      initial: true,
    });
    expect(result).toBe('/community?inviteCode=TEACHER2026');

    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending).not.toBeNull();
    expect(pending?.intentKind).toBe('classroomInvite');
    expect(pending?.params.inviteCode).toBe('TEACHER2026');
    expect(pending?.targetPath).toBe('/community?inviteCode=TEACHER2026');
  });

  it('handles first-party vanity path /c/:code seamlessly', async () => {
    const result = await redirectSystemPath({
      path: 'https://gurudevi.app/c/CHEMISTRY-ADV',
      initial: true,
    });
    expect(result).toBe('/community?inviteCode=CHEMISTRY-ADV');

    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending?.params.inviteCode).toBe('CHEMISTRY-ADV');
  });

  it('rewrites typed QR links to /qr route with serialized payload', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://qr?v=1&action=join_class&classroom_id=c123',
      initial: true,
    });
    expect(result).toContain('/qr?payload=');
    expect(decodeURIComponent(result)).toContain('join_class');
    expect(decodeURIComponent(result)).toContain('c123');

    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending).toMatchObject({
      intentKind: 'qr',
      targetPath: result,
      params: { payload: JSON.stringify({ v: 1, action: 'join_class', classroom_id: 'c123' }) },
    });
  });

  it('does not persist a QR action whose payload fails validation', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://qr?v=1&action=steal_credentials&token=bad',
      initial: true,
    });

    expect(result).toBe('/');
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('fails closed and returns safe fallback route "/" for path traversal attempts', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://auth/callback/../../admin/secret',
      initial: true,
    });
    expect(result).toBe('/');
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('fails closed and returns safe fallback route "/" for untrusted external origins', async () => {
    const result = await redirectSystemPath({
      path: 'https://attacker.evil.com/auth/callback',
      initial: true,
    });
    expect(result).toBe('/');
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });
});
