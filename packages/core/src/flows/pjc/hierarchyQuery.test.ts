import { describe, expect, it } from 'vitest';
import { validateHierarchy } from './hierarchy';

describe('hierarchy format boundary', () => {
  it('rejects a version 1 catalog even when it has no records', () => {
    const result = validateHierarchy({ schemaVersion: 1, records: [] });
    expect(result.catalog).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
