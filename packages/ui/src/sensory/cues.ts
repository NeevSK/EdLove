/**
 * The app's sounds, as recipes: one owner for web and phone.
 *
 * The web plays these live with Web Audio (no files). The phone plays WAV
 * files rendered from the same recipes by `scripts/sounds/build-cues.ts`, so a
 * success chime is the same chime everywhere. Change a recipe, run the script.
 *
 * Each tone: a wave that may glide from `from` to `to` hertz, starting `at`
 * seconds in, lasting `for` seconds, shaped by a gain envelope.
 */

import type { SoundCue } from '../theme/feedback';

export interface Tone {
  wave: 'sine' | 'triangle';
  from: number;
  /** Glide target (exponential), reached at the end of the tone. */
  to?: number;
  at: number;
  for: number;
  /** Starting gain, an optional linear swell to `peak` by `peakAt`, then an exponential fade to silence at the end. */
  gain: number;
  peak?: number;
  peakAt?: number;
}

export const CUES: Readonly<Record<SoundCue, readonly Tone[]>> = {
  // Gentle harmonic bell.
  success: [
    { wave: 'sine', from: 528, at: 0, for: 0.4, gain: 0.12 },
    { wave: 'sine', from: 792, at: 0.04, for: 0.4, gain: 0.12 },
  ],
  'sync-restored': [
    { wave: 'sine', from: 528, at: 0, for: 0.4, gain: 0.12 },
    { wave: 'sine', from: 792, at: 0.04, for: 0.4, gain: 0.12 },
  ],
  // A soft, dull wooden knock: noticed, never alarming.
  error: [{ wave: 'triangle', from: 90, to: 40, at: 0, for: 0.08, gain: 0.12 }],
  // Singing bowl with a long decay.
  milestone: [
    { wave: 'sine', from: 432, at: 0, for: 1.8, gain: 0.15 },
    { wave: 'sine', from: 864, at: 0, for: 1.8, gain: 0.075 },
    { wave: 'sine', from: 1296, at: 0, for: 1.8, gain: 0.05 },
  ],
  // Rising swell for breathing in, falling release for breathing out.
  'breath-start': [{ wave: 'sine', from: 180, to: 260, at: 0, for: 1.5, gain: 0.01, peak: 0.06, peakAt: 0.8 }],
  'breath-end': [{ wave: 'sine', from: 260, to: 140, at: 0, for: 1.8, gain: 0.06 }],
};

/** Length of a cue in seconds. */
export function cueLength(cue: SoundCue): number {
  return Math.max(...CUES[cue].map((t) => t.at + t.for));
}

/** The cue's waveform at `rate` samples per second, -1..1 (for rendering files). */
export function renderCue(cue: SoundCue, rate: number): Float32Array {
  const out = new Float32Array(Math.ceil((cueLength(cue) + 0.02) * rate));
  for (const t of CUES[cue]) {
    let phase = 0;
    const start = Math.round(t.at * rate);
    const n = Math.round(t.for * rate);
    for (let i = 0; i < n; i++) {
      const x = i / n;
      const s = i / rate;
      const f = t.to ? t.from * (t.to / t.from) ** x : t.from;
      phase += (2 * Math.PI * f) / rate;
      const w = t.wave === 'sine' ? Math.sin(phase) : (2 / Math.PI) * Math.asin(Math.sin(phase));
      let g: number;
      if (t.peak !== undefined && t.peakAt !== undefined && s < t.peakAt) {
        g = t.gain + (t.peak - t.gain) * (s / t.peakAt);
      } else {
        const top = t.peak ?? t.gain;
        const from = t.peakAt ?? 0;
        const y = (s - from) / (t.for - from);
        g = top * (0.001 / top) ** y;
      }
      const k = start + i;
      if (k < out.length) out[k] = (out[k] ?? 0) + w * g;
    }
  }
  return out;
}
