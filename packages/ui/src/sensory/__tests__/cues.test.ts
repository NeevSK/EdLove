import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { SoundCue } from '../../theme/feedback';
import { CUES, cueLength, renderCue } from '../cues';

const PHONE_SOUNDS = join(__dirname, '../../../../../apps/gurudevi-mobile/src/assets/sounds');

describe('sound cues: one recipe for web and phone', () => {
  for (const cue of Object.keys(CUES) as SoundCue[]) {
    it(`${cue} renders a short, soft, finite sound`, () => {
      const wave = renderCue(cue, 8000);
      expect(cueLength(cue)).toBeLessThanOrEqual(2);
      expect(wave.every(Number.isFinite)).toBe(true);
      const peak = Math.max(...Array.from(wave, Math.abs));
      expect(peak).toBeGreaterThan(0.01);
      expect(peak).toBeLessThan(0.5);
    });
    it(`${cue} has a phone file (run scripts/sounds/build-cues.ts after changing a recipe)`, () => {
      expect(existsSync(join(PHONE_SOUNDS, `${cue}.wav`))).toBe(true);
    });
  }
});
