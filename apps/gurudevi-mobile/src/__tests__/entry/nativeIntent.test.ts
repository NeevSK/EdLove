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

  it('admits explore.gurudevi.app universal links directly into internal routes and stashes pending intent', async () => {
    const result = await redirectSystemPath({
      path: 'https://explore.gurudevi.app/workspace',
      initial: true,
    });
    expect(result).toBe('/workspace');

    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending).toMatchObject({
      targetPath: '/workspace',
      intentKind: 'generic',
      originalUrl: 'https://explore.gurudevi.app/workspace',
    });
  });

  it('strips ad-tech attribution tracking from route path and preserves clean route params', async () => {
    const result = await redirectSystemPath({
      path: 'https://explore.gurudevi.app/workspace?tab=canvas&utm_source=meta&fbclid=AQD123',
      initial: true,
    });
    // Ad-tech params stripped from navigation route path
    expect(result).toBe('/workspace?tab=canvas');

    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending?.targetPath).toBe('/workspace?tab=canvas');
    expect(pending?.params).toEqual({
      path: '/workspace?tab=canvas',
      tab: 'canvas',
    });
  });

  it('routes pulse intents directly to /pulse without pending intent gating', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://pulse',
      initial: false,
    });
    expect(result).toBe('/pulse');
  });

  it('rejects retired classroom invite routes without creating pending work', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://invite/classroom/TEACHER2026',
      initial: true,
    });
    expect(result).toBe('/');

    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending).toBeNull();
  });

  it('does not route first-party classroom vanity paths to retired surfaces', async () => {
    const result = await redirectSystemPath({
      path: 'https://gurudevi.app/c/CHEMISTRY-ADV',
      initial: true,
    });
    expect(result).toBe('/');
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('rejects QR links without creating pending scanner work', async () => {
    const result = await redirectSystemPath({
      path: 'gurudevi://qr?v=1&action=join_class&classroom_id=c123',
      initial: true,
    });
    expect(result).toBe('/');
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
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
