import { isNotFound } from '@tanstack/react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { devOnly } from './devOnly';

afterEach(() => vi.unstubAllEnvs());

describe('developer tools guard (G1 / Vitest)', () => {
  it('answers not found in a production build', () => {
    vi.stubEnv('DEV', false);
    let thrown: unknown;
    try {
      devOnly();
    } catch (error) {
      thrown = error;
    }
    expect(isNotFound(thrown)).toBe(true);
  });

  it('opens in local development', () => {
    vi.stubEnv('DEV', true);
    expect(() => devOnly()).not.toThrow();
  });
});
