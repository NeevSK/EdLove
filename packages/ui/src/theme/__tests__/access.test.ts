import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../color';
import { kitStylesheet } from '../kitCss';
import { resolveWorld, STANDARD_ACCESS } from '../resolve';
import type { Phase, WorldMode } from '../types';
import { WORLD_IDS, WORLDS } from '../worlds';

const PHASES: Phase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const MODES: WorldMode[] = ['light', 'dark'];
const MORE = { contrast: 'more', transparency: 'standard' } as const;
const SOLID = { contrast: 'standard', transparency: 'reduced' } as const;

describe('system accessibility settings reach every world', { tags: ['a11y', 'unit'] }, () => {
  it('more contrast: secondary text 7:1, faint text 4.5:1, hairlines 3:1, lines at least 1', () => {
    for (const id of WORLD_IDS)
      for (const mode of MODES)
        for (const phase of PHASES) {
          const w = resolveWorld(id, phase, mode, MORE);
          const t = w.tokens;
          const where = `${id}/${mode}/${phase}`;
          expect(contrastRatio(t.inkSoft, t.ground), where).toBeGreaterThanOrEqual(7);
          expect(contrastRatio(t.inkFaint, t.ground), where).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(t.line, t.ground), where).toBeGreaterThanOrEqual(3);
          expect(w.recipes.group.divider.width).toBeGreaterThanOrEqual(1);
        }
  });

  it('more contrast never weakens a colour the standard world already had', () => {
    for (const id of WORLD_IDS) {
      const std = resolveWorld(id).tokens;
      const more = resolveWorld(id, 'morning', 'light', MORE).tokens;
      expect(more.ink).toBe(std.ink);
      expect(more.lamp).toBe(std.lamp);
      expect(contrastRatio(more.inkSoft, more.ground)).toBeGreaterThanOrEqual(
        contrastRatio(std.inkSoft, std.ground),
      );
    }
  });

  it('reduced transparency: no glows, and the veils go solid', () => {
    for (const id of WORLD_IDS) {
      const w = resolveWorld(id, 'morning', 'light', SOLID);
      expect(w.recipes.material.light).toBe('none');
      for (const l of Object.values(w.recipes.material.states)) expect(l.glowOpacity).toBe(0);
      expect(w.recipes.card.veilOpacity).toBeGreaterThanOrEqual(0.9);
      expect(w.recipes.overlay.scrim).toMatch(/0\.92\)$/);
    }
  });

  it('standard access is the default and is cached separately', () => {
    const id = WORLD_IDS[0] ?? 'sanctuary';
    expect(resolveWorld(id).access).toEqual(STANDARD_ACCESS);
    expect(resolveWorld(id, 'morning', 'light', MORE)).not.toBe(resolveWorld(id));
    expect(WORLDS[id].style.lineWeight).toBeGreaterThan(0);
  });

  it('the web follows prefers-contrast and prefers-reduced-transparency', () => {
    const css = kitStylesheet();
    expect(css).toContain('@media (prefers-contrast:more){:root:root:root:root:root');
    expect(css).toContain('@media (prefers-reduced-transparency:reduce)');
    expect(css).toContain('--w-light-focus-glow-opacity:0');
  });
});
