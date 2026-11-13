/**
 * Web Visuo-Acoustic Synthesizer (0 KB Assets)
 *
 * Plays the app's sound cues on the web with the Web Audio API, from the
 * shared recipes, without downloading audio files.
 */

import type { SoundCue } from '../theme/feedback';
import { CUES } from './cues';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

/**
 * Plays a cue from the shared recipes (`./cues.ts`), the same sounds the
 * phone plays from files. Presses and choices make no sound.
 */
export function playWebSound(cue: SoundCue | 'press' | 'selection') {
  if (cue === 'press' || cue === 'selection') return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const t of CUES[cue]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + t.at;
    const end = start + t.for;
    osc.type = t.wave;
    osc.frequency.setValueAtTime(t.from, start);
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, end);
    gain.gain.setValueAtTime(t.gain, start);
    if (t.peak !== undefined && t.peakAt !== undefined) {
      gain.gain.linearRampToValueAtTime(t.peak, start + t.peakAt);
    }
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.05);
  }
}
