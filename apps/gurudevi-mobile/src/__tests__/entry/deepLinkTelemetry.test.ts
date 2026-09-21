import { DeepLinkType } from '@repo/core/logic';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { trackDeepLink } from '@/lib/deepLinks/trackDeepLink';

describe('deep-link telemetry', () => {
  const capture = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(globalThis, { posthog: { capture } });
  });

  it('redacts auth credentials, callback state, and provider errors', () => {
    trackDeepLink(
      'gurudevi://auth/callback#access_token=secret&refresh_token=refresh',
      DeepLinkType.AUTH_CALLBACK,
      {
        access_token: 'secret',
        refresh_token: 'refresh',
        code: 'one-time-code',
        state: 'correlation-secret',
        error: 'access_denied',
        error_code: 'provider-detail',
        error_description: 'sensitive provider text',
        inviteCode: 'safe-invite',
      },
    );

    const properties = capture.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(properties).not.toHaveProperty('url');
    expect(properties.params).toEqual({ inviteCode: 'safe-invite' });
    expect(JSON.stringify(properties)).not.toContain('secret');
    expect(JSON.stringify(properties)).not.toContain('refresh');
    expect(JSON.stringify(properties)).not.toContain('one-time-code');
    expect(JSON.stringify(properties)).not.toContain('correlation-secret');
    expect(JSON.stringify(properties)).not.toContain('access_denied');
    expect(JSON.stringify(properties)).not.toContain('provider-detail');
    expect(JSON.stringify(properties)).not.toContain('sensitive provider text');
    expect(properties).toMatchObject({
      hasAccessToken: true,
      hasAuthCode: true,
      hasRefreshToken: true,
    });
  });
});
