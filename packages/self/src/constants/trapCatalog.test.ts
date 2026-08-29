import {
  getTrapById,
  getTrapsBySlope,
  resolveTraps,
  TRAP_CATALOG,
} from '@repo/self/constants/trapCatalog';
import { describe, expect, it } from 'vitest';

describe('Thinking-trap catalog', () => {
  it('keeps ids unique and stable slugs', () => {
    const ids = TRAP_CATALOG.map((trap) => trap.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z_]+$/.test(id))).toBe(true);
  });

  it('has complete fields on every trap', () => {
    for (const trap of TRAP_CATALOG) {
      expect(trap.label.trim().length).toBeGreaterThan(0);
      expect(trap.description.trim().length).toBeGreaterThan(0);
      expect(trap.example.trim().length).toBeGreaterThan(0);
      expect(trap.challengePrompt.trim().length).toBeGreaterThan(0);
      expect(['general', 'learning']).toContain(trap.slope);
    }
  });

  it('includes a general slope for everyday reflection and a learning slope for the classroom reuse', () => {
    const general = getTrapsBySlope('general');
    const learning = getTrapsBySlope('learning');
    expect(general.length).toBeGreaterThanOrEqual(10);
    expect(learning.length).toBeGreaterThanOrEqual(4);
    expect(learning.map((trap) => trap.id)).toContain('fixed_mindset');
  });

  it('resolves trap ids and ignores unknowns', () => {
    expect(getTrapById('all_or_nothing')?.slope).toBe('general');
    expect(getTrapById('missing_trap')).toBeUndefined();
    const resolved = resolveTraps(['all_or_nothing', 'does_not_exist']);
    expect(resolved.map((trap) => trap.id)).toEqual(['all_or_nothing']);
  });

  it('appends a user-defined trap when custom text is given', () => {
    const resolved = resolveTraps([], 'My own pattern');
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.id).toBe('custom');
    expect(resolved[0]?.slope).toBe('general');
  });

  it('classifies a learning-flavoured custom trap into the learning slope', () => {
    const resolved = resolveTraps([], 'My study doubt pattern');
    expect(resolved[0]?.slope).toBe('learning');
  });
});
