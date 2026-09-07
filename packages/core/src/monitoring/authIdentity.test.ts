import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearSentryUser: vi.fn(),
  identifyUser: vi.fn(),
  resetUser: vi.fn(),
  setSentryUser: vi.fn(),
}));

vi.mock('./posthog', () => ({
  identifyUser: mocks.identifyUser,
  resetUser: mocks.resetUser,
}));

vi.mock('./sentry', () => ({
  clearSentryUser: mocks.clearSentryUser,
  setSentryUser: mocks.setSentryUser,
}));

import { clearAuthSubject, identifyAuthSubject } from './authIdentity';

describe('auth monitoring identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies the same authenticated subject in error and product telemetry', () => {
    identifyAuthSubject({
      id: 'account-1',
      email: 'member@example.com',
      displayName: 'Member',
    });

    expect(mocks.setSentryUser).toHaveBeenCalledWith({
      id: 'account-1',
      email: 'member@example.com',
      username: 'Member',
    });
    expect(mocks.identifyUser).toHaveBeenCalledWith('account-1');
  });

  it('clears both telemetry identities on sign-out', () => {
    clearAuthSubject();

    expect(mocks.clearSentryUser).toHaveBeenCalledOnce();
    expect(mocks.resetUser).toHaveBeenCalledOnce();
  });
});
