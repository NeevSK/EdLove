import { describe, expect, it } from 'vitest';
import { getFirstValueRoute } from '@/entry/firstValueRoute';

describe('getFirstValueRoute', () => {
  it('routes every capacity to /workspace by default (dynamic overrides live in landingPolicy)', () => {
    for (const capacity of [
      'teacher',
      'student',
      'principal',
      'founder',
      'guardian',
      'member',
      null,
      undefined,
    ]) {
      expect(getFirstValueRoute(capacity)).toBe('/workspace');
    }
  });
});
