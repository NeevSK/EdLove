import { describe, expect, it } from 'vitest';

import { getFirstValueRoute } from '@/entry/firstValueRoute';

describe('first-value route policy', () => {
  it.each([
    'teacher',
    'gradeHead',
    'sectionHead',
    'principal',
    'assistantPrincipal',
    'admin',
    'founder',
    'developer',
    'guardian',
    'parent',
    'librarian',
    'nurse',
  ])('opens the existing workspace dispatcher for %s', (capacity) => {
    expect(getFirstValueRoute(capacity)).toBe('/workspace');
  });

  it.each(['student', undefined, null, 'unknown'])(
    'keeps the safe self fallback for %s',
    (capacity) => {
      expect(getFirstValueRoute(capacity)).toBe('/self');
    },
  );
});
