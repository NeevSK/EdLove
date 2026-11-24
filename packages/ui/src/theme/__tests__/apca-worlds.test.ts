import { describe, expect, it } from 'vitest';
import { calculateApca, evaluateApca, simulateCvd, getDeltaE } from '@intuitui-labs/a11y-gate';
import { resolveWorld } from '../resolve';
import type { Phase, WorldMode } from '../types';
import { WORLD_IDS } from '../worlds';

const PHASES: Phase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const MODES: WorldMode[] = ['light', 'dark'];

describe('11-World APCA (WCAG 3 Candidate) & CVD Perception Suite', { tags: ['a11y', 'unit'] }, () => {
  describe('APCA Perceptual Contrast on Core Tokens', () => {
    for (const worldId of WORLD_IDS) {
      for (const mode of MODES) {
        for (const phase of PHASES) {
          const { tokens } = resolveWorld(worldId, phase, mode);

          it(`${worldId} [${mode}/${phase}]: body ink on ground reaches APCA Lc >= 75 (Bronze Body Reading Floor)`, () => {
            const lc = calculateApca(tokens.ink, tokens.ground);
            const absLc = Math.abs(lc);
            // APCA 75 is the strict minimum for body text legibility at normal reading sizes
            expect(absLc).toBeGreaterThanOrEqual(75);
          });

          it(`${worldId} [${mode}/${phase}]: primary CTA onLamp on lamp reaches APCA Lc >= 45 (UI Action / Large Control Floor)`, () => {
            const lc = calculateApca(tokens.onLamp, tokens.lamp);
            const absLc = Math.abs(lc);
            // APCA 45 is the standard threshold for UI controls, active button fills, and bold badges
            expect(absLc).toBeGreaterThanOrEqual(45);
          });

          it(`${worldId} [${mode}/${phase}]: destructive danger on ground reaches APCA Lc >= 45 (Signal / Warning Floor)`, () => {
            const lc = calculateApca(tokens.danger, tokens.ground);
            const absLc = Math.abs(lc);
            // APCA 45 is the threshold for graphical signal indicators and warning badges
            expect(absLc).toBeGreaterThanOrEqual(45);
          });
        }
      }
    }
  });

  describe('Color Vision Deficiency (CVD) Simulation Distinguishability', () => {
    const CVD_TYPES = ['protanopia', 'deuteranopia', 'tritanopia'] as const;

    for (const worldId of WORLD_IDS) {
      for (const mode of MODES) {
        it(`${worldId} [${mode}]: action lamp vs ground maintains Delta E >= 15 across protanopia, deuteranopia, tritanopia`, () => {
          const { tokens } = resolveWorld(worldId, 'morning', mode);
          for (const cvd of CVD_TYPES) {
            const simLamp = simulateCvd(tokens.lamp, cvd);
            const simGround = simulateCvd(tokens.ground, cvd);
            const deltaE = getDeltaE(simLamp, simGround);
            expect(deltaE).toBeGreaterThanOrEqual(15);
          }
        });

        it(`${worldId} [${mode}]: primary ink maintains APCA Lc >= 65 under achromatopsia (monochromacy)`, () => {
          const { tokens } = resolveWorld(worldId, 'morning', mode);
          const simInk = simulateCvd(tokens.ink, 'achromatopsia');
          const simGround = simulateCvd(tokens.ground, 'achromatopsia');
          const lc = calculateApca(simInk, simGround);
          expect(Math.abs(lc)).toBeGreaterThanOrEqual(65);
        });
      }
    }
  });
});
