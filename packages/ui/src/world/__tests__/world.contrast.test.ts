import { contrastRatio } from '../color';
import { resolveWorld } from '../resolve';
import type { WorldMode, WorldPhase } from '../types';
import { WORLD_IDS } from '../worlds';

const PHASES: WorldPhase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const MODES: WorldMode[] = ['light', 'dark'];

/**
 * Every world must stay legible at every hour, in light and dark.
 * Thresholds follow WCAG 2.2: 4.5 for text, 3 for large text and UI marks.
 */
const PAIRS: Array<{ fg: string; bg: string; min: number; why: string }> = [
  { fg: 'ink', bg: 'ground', min: 7, why: 'body text on the page' },
  { fg: 'ink', bg: 'raised', min: 7, why: 'body text on a sheet' },
  { fg: 'ink', bg: 'sunken', min: 4.5, why: 'text in an inset well' },
  { fg: 'inkSoft', bg: 'ground', min: 4.5, why: 'secondary text' },
  { fg: 'inkSoft', bg: 'raised', min: 4.5, why: 'secondary text on a sheet' },
  { fg: 'inkFaint', bg: 'ground', min: 3, why: 'decorative and disabled marks' },
  { fg: 'onLamp', bg: 'lamp', min: 4.5, why: 'label on the primary action' },
  { fg: 'lampDeep', bg: 'ground', min: 4.5, why: 'signal text in the lamp colour' },
  { fg: 'danger', bg: 'ground', min: 4.5, why: 'error and destructive text' },
  { fg: 'onDanger', bg: 'danger', min: 4.5, why: 'label on a filled danger action' },
  { fg: 'focus', bg: 'ground', min: 3, why: 'focus ring and field focus line' },
];

describe('world contrast', { tags: ['a11y', 'unit'] }, () => {
  for (const id of WORLD_IDS) {
    for (const mode of MODES) {
      for (const phase of PHASES) {
        const { tokens } = resolveWorld(id, phase, mode);
        for (const pair of PAIRS) {
          const fg = tokens[pair.fg as keyof typeof tokens];
          const bg = tokens[pair.bg as keyof typeof tokens];
          it(`${id} ${mode} ${phase}: ${pair.fg} on ${pair.bg} (${pair.why})`, () => {
            expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(pair.min);
          });
        }
      }
    }
  }
});
