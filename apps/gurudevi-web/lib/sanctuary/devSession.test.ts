import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveSanctuaryDevSession } from './devSession';

describe('resolveSanctuaryDevSession', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('preserves the chosen role and name', () => {
    expect(resolveSanctuaryDevSession({ host: 'sanctuary.localhost:3000', searchParams: { dev: 'true', role: 'student', name: 'Naveen' } }))
      .toMatchObject({ isDevSession: true, displayName: 'Naveen', capacity: 'STUDENT' });
  });
  it('supports a principal preview', () => {
    expect(resolveSanctuaryDevSession({ host: 'sanctuary.localhost:3000', searchParams: { dev: 'true', role: 'principal' } }))
      .toMatchObject({ isDevSession: true, capacity: 'PRINCIPAL' });
  });
  it('preserves local Sanctuary and Explore defaults', () => {
    expect(resolveSanctuaryDevSession({ host: 'sanctuary.localhost:3000' }))
      .toMatchObject({ isDevSession: true, displayName: 'Dev Member', capacity: 'TEACHER' });
    expect(resolveSanctuaryDevSession({ host: 'explore.localhost:3000' }).isDevSession).toBe(false);
  });
  it('never creates a development session in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(resolveSanctuaryDevSession({ host: 'sanctuary.localhost:3000', searchParams: { dev: 'true' } }).isDevSession).toBe(false);
  });
});
