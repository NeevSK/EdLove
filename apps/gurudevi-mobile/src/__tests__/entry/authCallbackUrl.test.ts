import { describe, expect, it } from 'vitest';

import { createNativeAuthCallbackUrl } from '@/entry/authCallbackUrl';

describe('createNativeAuthCallbackUrl', () => {
  it('reconstructs the canonical native callback after Expo Router normalization', () => {
    expect(createNativeAuthCallbackUrl({ code: 'one-time-code', state: 'csrf-state' })).toBe(
      'gurudevi://auth/callback?code=one-time-code&state=csrf-state',
    );
  });

  it('preserves repeated keys so the core callback policy can reject them', () => {
    expect(createNativeAuthCallbackUrl({ code: ['first', 'second'] })).toBe(
      'gurudevi://auth/callback?code=first&code=second',
    );
  });
});
