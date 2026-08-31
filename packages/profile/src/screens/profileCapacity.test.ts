import { describe, expect, it } from 'vitest';
import { toProfileCapacity } from './profileCapacity';

describe('profile capacity boundary', () => {
  it('accepts declared capacities and rejects unknown permission strings', () => {
    expect(toProfileCapacity('teacher')).toBe('teacher');
    expect(toProfileCapacity('founder')).toBe('founder');
    expect(toProfileCapacity('unverified-role')).toBeNull();
    expect(toProfileCapacity(null)).toBeNull();
  });
});
