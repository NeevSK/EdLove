import { describe, expect, it } from 'vitest';
import { classifyAuthCallback } from '../authCallbackPolicy';

describe('auth callback policy', () => {
  it('accepts exactly one code on each approved callback transport', () => {
    expect(classifyAuthCallback('gurudevi://auth/callback?code=one')).toEqual({
      kind: 'code',
      code: 'one',
    });
    expect(classifyAuthCallback('https://gurudevi.app/auth/callback?code=two')).toEqual({
      kind: 'code',
      code: 'two',
    });
    expect(classifyAuthCallback('https://gurudevi.app/auth/complete?code=three')).toEqual({
      kind: 'code',
      code: 'three',
    });
  });

  it.each([
    'gurudevi://auth/callback?access_token=secret&refresh_token=refresh',
    'gurudevi://auth/callback?code=one&access_token=secret',
    'gurudevi://auth/callback?code=one&code=two',
    'https://evil.example/auth/callback?code=one',
  ])('rejects hostile credentials without returning them: %s', (url) => {
    expect(classifyAuthCallback(url).kind).toBe('rejected');
  });

  it('permanently rejects the legacy implicit-flow token callback', () => {
    expect(
      classifyAuthCallback('gurudevi://auth/callback#access_token=legacy&refresh_token=legacy'),
    ).toEqual({ kind: 'rejected', reason: 'mixed-credentials' });
  });

  it('preserves a provider error category without its description', () => {
    expect(
      classifyAuthCallback('gurudevi://auth/callback#error=access_denied&error_description=secret'),
    ).toEqual({ kind: 'providerError', code: 'access_denied' });
  });
});
