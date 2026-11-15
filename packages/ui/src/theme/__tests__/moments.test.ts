import { describe, expect, it } from 'vitest';
import { momentOf, momentPieces } from '../moments';
import { WORLD_IDS, WORLDS } from '../worlds';

describe('world moments', () => {
  it('gives every world a moment whose colours are real tokens', () => {
    for (const id of WORLD_IDS) {
      const m = momentOf(id);
      expect(m.colours.length).toBeGreaterThan(0);
      const tokens = WORLDS[id].palette.light as unknown as Record<string, unknown>;
      for (const c of m.colours) expect(typeof tokens[c]).toBe('string');
    }
  });

  it('lets verger and the stage decide how many pieces fly', () => {
    expect(momentPieces('off', 'rich')).toBe(0);
    expect(momentPieces('rich', 'bare')).toBe(0);
    expect(momentPieces('rich', 'floor')).toBeLessThanOrEqual(8);
    expect(momentPieces('essential', 'rich')).toBe(6);
    expect(momentPieces('rich', 'rich')).toBeGreaterThan(momentPieces('refined', 'rich'));
  });
});
