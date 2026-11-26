import { describe, expect, it } from 'vitest';
import { BondSchema, PerspectiveSchema } from '../identity.schema';

const bond = {
  id: 'bond-1',
  user_id: 'user-1',
  entity_id: 'school-1',
  entity_type: 'SCHOOL',
  capacity: 'teacher',
};

describe('BondSchema', () => {
  it('reads stored citizenship, mapping the legacy WANDERER alias to THIRD_CLASS', () => {
    expect(BondSchema.parse({ ...bond, citizenship: 'FIRST_CLASS' }).citizenship).toBe('FIRST_CLASS');
    expect(BondSchema.parse({ ...bond, citizenship: 'WANDERER' }).citizenship).toBe('THIRD_CLASS');
  });

  it('treats an unknown citizenship as unset rather than rejecting the bond', () => {
    expect(BondSchema.parse({ ...bond, citizenship: 'ROYALTY' }).citizenship).toBeUndefined();
  });

  it('accepts every capacity in the one capacity list, including the founder-side ones', () => {
    for (const capacity of ['coFounder', 'director', 'systemEngineer', 'librarian', 'member']) {
      expect(BondSchema.safeParse({ ...bond, capacity }).success).toBe(true);
    }
  });

  it('accepts community group bonds', () => {
    expect(BondSchema.safeParse({ ...bond, entity_type: 'GROUP' }).success).toBe(true);
  });
});

describe('PerspectiveSchema', () => {
  it('always has an activeBond key, null when none is chosen', () => {
    const parsed = PerspectiveSchema.parse({ activeBond: null, availableBonds: [bond] });
    expect(parsed.activeBond).toBeNull();
    expect(parsed.availableBonds).toHaveLength(1);
  });
});
