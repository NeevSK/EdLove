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
});
