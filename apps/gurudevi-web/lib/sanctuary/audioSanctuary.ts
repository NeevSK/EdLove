/**
 * Audio Sanctuary: Pure Web Audio API Harmonic Chimes
 * Generates Tibetan singing bowl resonance without external audio files.
 * Zero network payload, zero latency, runs entirely client-side.
 * Honors user consent with persistent audio mute control.
 */

const AUDIO_MUTE_STORAGE_KEY = 'sanctuary_audio_muted';
const AUDIO_CHANGE_EVENT = 'sanctuary_audio_mute_changed';

/**
 * Checks whether ambient sanctuary chimes are muted.
 * Defaults to unmuted (false) unless explicitly muted by the user.
 */
export function isSanctuaryAudioMuted(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(AUDIO_MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sets the audio mute state and broadcasts a change event.
 */
export function setSanctuaryAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIO_MUTE_STORAGE_KEY, muted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(AUDIO_CHANGE_EVENT, { detail: { muted } }));
  } catch {
    // Ignore storage failures
  }
}

/**
 * Toggles the audio mute state and returns the new muted status.
 */
export function toggleSanctuaryAudio(): boolean {
  const current = isSanctuaryAudioMuted();
  const next = !current;
  setSanctuaryAudioMuted(next);
  return next;
}

/**
 * Subscribes a listener to audio mute state changes.
 */
export function subscribeSanctuaryAudio(listener: (muted: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ muted: boolean }>;
    listener(custom.detail?.muted ?? isSanctuaryAudioMuted());
  };
  window.addEventListener(AUDIO_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener(AUDIO_CHANGE_EVENT, handler);
  };
}

/**
 * Plays a resonant harmonic singing bowl tone at the requested frequency.
 * Standard frequencies:
 * - 432 Hz: Universal grounding & heart resonance
 * - 528 Hz: Transformation & solar calm
 * - 396 Hz: Release, liberation & fire catharsis
 */
export function playSingingBowlChime(fundamentalHz: number = 432): void {
  if (typeof window === 'undefined') return;
  if (isSanctuaryAudioMuted()) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 2.8;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    // Fundamental tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(fundamentalHz, now);
    osc1.connect(masterGain);

    // Harmonic overtone 1 (gentle shimmer)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fundamentalHz * 2.01, now);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Harmonic overtone 2 (warm depth)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(fundamentalHz * 3.02, now);
    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.03, now);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);

    setTimeout(() => {
      void ctx.close();
    }, (duration + 0.2) * 1000);
  } catch {
    // Graceful fallback in environments restricting Web Audio
  }
}
