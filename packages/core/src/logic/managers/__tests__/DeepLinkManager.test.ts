import { describe, expect, it, vi } from 'vitest';

import { DeepLinkManager, DeepLinkType } from '../DeepLinkManager';

describe('DeepLinkManager', () => {
  it('merges query and hash callback parameters without exposing parser ambiguity', async () => {
    const authManager = {
      exchangeCodeForSession: vi.fn(),
      setSession: vi.fn().mockResolvedValue(undefined),
    };
    const manager = new DeepLinkManager(authManager as never);

    const result = await manager.handleURL(
      'gurudevi://auth/callback?source=oauth#access_token=access&refresh_token=refresh',
    );

    expect(authManager.setSession).toHaveBeenCalledWith('access', 'refresh');
    expect(result).toMatchObject({ type: DeepLinkType.AUTH_CALLBACK, isHandled: true });
    expect(result.params).toMatchObject({ source: 'oauth', access_token: 'access' });
  });

  it.each([
    'gurudevi://auth/callback?code=one-time-code',
    'https://platform.gurudevi.edlove.org/auth/callback?error=access_denied',
    'gurudevi://qr?access_token=not-an-auth-callback',
  ])('does not classify non-token callback URLs as a successful auth exchange: %s', async (url) => {
    const authManager = {
      exchangeCodeForSession: vi.fn(),
      setSession: vi.fn(),
    };
    const manager = new DeepLinkManager(authManager as never);

    const result = await manager.handleURL(url);

    if (url.includes('auth/callback') && url.includes('code=')) {
      expect(authManager.exchangeCodeForSession).toHaveBeenCalledWith('one-time-code');
      expect(result.type).toBe(DeepLinkType.AUTH_CALLBACK);
    } else if (url.includes('/auth/callback')) {
      expect(authManager.exchangeCodeForSession).not.toHaveBeenCalled();
      expect(authManager.setSession).not.toHaveBeenCalled();
      expect(result).toMatchObject({ type: DeepLinkType.AUTH_CALLBACK, isHandled: false });
    } else {
      expect(authManager.exchangeCodeForSession).not.toHaveBeenCalled();
      expect(authManager.setSession).not.toHaveBeenCalled();
      expect(result.type).not.toBe(DeepLinkType.AUTH_CALLBACK);
    }
  });

  it('handles classroom invite paths in both app and web URL forms', async () => {
    const authManager = { exchangeCodeForSession: vi.fn(), setSession: vi.fn() };
    const manager = new DeepLinkManager(authManager as never);

    const nativeResult = await manager.handleURL('gurudevi://invite/classroom/abc%20123');
    const webResult = await manager.handleURL(
      'https://platform.gurudevi.edlove.org/invite/classroom/abc%20123?source=qr',
    );

    expect(nativeResult).toMatchObject({
      type: DeepLinkType.CLASSROOM_INVITE,
      params: { inviteCode: 'abc 123' },
    });
    expect(webResult).toMatchObject({
      type: DeepLinkType.CLASSROOM_INVITE,
      params: { inviteCode: 'abc 123', source: 'qr' },
    });
  });

  it('returns a safe unknown result for malformed input', async () => {
    const authManager = { exchangeCodeForSession: vi.fn(), setSession: vi.fn() };
    const manager = new DeepLinkManager(authManager as never);

    await expect(manager.handleURL('not a URL')).resolves.toMatchObject({
      type: DeepLinkType.UNKNOWN,
      isHandled: false,
      message: 'Malformed URL',
      params: {},
    });
    expect(authManager.setSession).not.toHaveBeenCalled();
    expect(authManager.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('does not turn an invalid encoded invite segment into a navigation target', async () => {
    const authManager = { exchangeCodeForSession: vi.fn(), setSession: vi.fn() };
    const manager = new DeepLinkManager(authManager as never);

    await expect(manager.handleURL('gurudevi://invite/classroom/%E0%A4%A')).resolves.toMatchObject({
      type: DeepLinkType.UNKNOWN,
      isHandled: false,
      message: 'Malformed URL',
      params: {},
    });
  });
});
