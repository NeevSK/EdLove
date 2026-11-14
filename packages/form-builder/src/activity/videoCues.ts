/**
 * Questions placed on a video's timeline, as in Coursera's in-video quizzes. Pure: the player
 * reports where playback went, and this says which questions are due, where playback should
 * stand and whether it should pause. It works with any player (expo-video on mobile, the
 * HTML video element on the web) and runs offline.
 *
 * Players report time in ticks a few hundred milliseconds apart, so a cue is due when playback
 * crosses it, not when it lands exactly on it. A jump (the person drags the scrubber) is a
 * seek, and a seek past a required question that hasn't been answered stops at that question
 * when the policy says so.
 */

export interface VideoCue {
  readonly id: string;
  readonly atMs: number;
  /** The questions shown at this point: form field names, or one activity id. */
  readonly parts: readonly string[];
  /** Pause the video while the questions are open. */
  readonly pause: boolean;
  /** Must be answered before playback may go past it. */
  readonly required: boolean;
}

export interface CuePolicy {
  /** What a seek past an unanswered required cue does. */
  readonly seekPastRequired: 'stop-at-cue' | 'allow';
  /** Whether a seek also opens the optional cues it jumps over. */
  readonly openSkippedOptional: boolean;
  /** Whether an answered cue opens again when playback crosses it later. */
  readonly reopenAnswered: boolean;
  /** Forward ticks longer than this are treated as seeks, since players report steady time. */
  readonly maxTickMs: number;
}

export const DEFAULT_CUE_POLICY: CuePolicy = {
  seekPastRequired: 'stop-at-cue',
  openSkippedOptional: false,
  reopenAnswered: false,
  maxTickMs: 2000,
};

export interface CueState {
  readonly positionMs: number;
  readonly answered: ReadonlySet<string>;
  /** Cues opened and not yet answered or dismissed. */
  readonly open: readonly string[];
}

export const initialCueState = (positionMs = 0): CueState => ({
  positionMs,
  answered: new Set(),
  open: [],
});

export interface CueStep {
  readonly next: CueState;
  /** Cues to open now, earliest first. */
  readonly due: readonly VideoCue[];
  /** Where playback should be. Differs from the reported time when a cue stops it. */
  readonly positionMs: number;
  readonly pause: boolean;
}

export type CueProblem =
  | { readonly code: 'duplicate_id'; readonly cueId: string }
  | { readonly code: 'invalid_time'; readonly cueId: string }
  | { readonly code: 'after_end'; readonly cueId: string }
  | { readonly code: 'no_questions'; readonly cueId: string };

/**
 * Checks an author's cues and sorts them by time. `durationMs`, when known, catches cues placed
 * after the video ends, which would never open.
 */
export function prepareCues(
  cues: readonly VideoCue[],
  durationMs?: number,
): { readonly cues: readonly VideoCue[]; readonly problems: readonly CueProblem[] } {
  const ids = new Set<string>();
  const problems: CueProblem[] = [];
  for (const cue of cues) {
    if (ids.has(cue.id)) problems.push({ code: 'duplicate_id', cueId: cue.id });
    else if (!Number.isFinite(cue.atMs) || cue.atMs < 0)
      problems.push({ code: 'invalid_time', cueId: cue.id });
    else if (durationMs !== undefined && cue.atMs > durationMs)
      problems.push({ code: 'after_end', cueId: cue.id });
    else if (cue.parts.length === 0) problems.push({ code: 'no_questions', cueId: cue.id });
    ids.add(cue.id);
  }
  const usable = problems.length > 0 ? [] : [...cues];
  return { cues: usable.sort((a, b) => a.atMs - b.atMs || a.id.localeCompare(b.id)), problems };
}

/**
 * Moves playback to `toMs`, as reported by the player. `seeked` is true when the person moved
 * the scrubber; long forward ticks count as seeks too.
 */
export function advanceCues(
  cues: readonly VideoCue[],
  state: CueState,
  toMs: number,
  seeked: boolean,
  policy: CuePolicy = DEFAULT_CUE_POLICY,
): CueStep {
  const fromMs = state.positionMs;
  const isSeek = seeked || toMs < fromMs || toMs - fromMs > policy.maxTickMs;

  if (toMs <= fromMs) {
    return { next: { ...state, positionMs: toMs }, due: [], positionMs: toMs, pause: false };
  }

  const crossed = cues.filter(
    (c) =>
      c.atMs > fromMs &&
      c.atMs <= toMs &&
      (policy.reopenAnswered || !state.answered.has(c.id)) &&
      !state.open.includes(c.id),
  );

  const due: VideoCue[] = [];
  let positionMs = toMs;
  let pause = false;
  for (const cue of crossed) {
    const stops = isSeek
      ? cue.required && !state.answered.has(cue.id) && policy.seekPastRequired === 'stop-at-cue'
      : cue.pause;
    const opens = !isSeek || stops || (policy.openSkippedOptional && !cue.required);
    if (opens) due.push(cue);
    if (stops) {
      positionMs = cue.atMs;
      pause = true;
      break;
    }
  }

  return {
    next: { ...state, positionMs, open: [...state.open, ...due.map((c) => c.id)] },
    due,
    positionMs,
    pause,
  };
}

/** The person answered a cue's questions. */
export function answerCue(state: CueState, cueId: string): CueState {
  const answered = new Set(state.answered);
  answered.add(cueId);
  return { ...state, answered, open: state.open.filter((id) => id !== cueId) };
}

/** The person closed an optional cue without answering. A required cue can't be dismissed. */
export function dismissCue(cues: readonly VideoCue[], state: CueState, cueId: string): CueState {
  const cue = cues.find((c) => c.id === cueId);
  if (cue === undefined || cue.required) return state;
  return { ...state, open: state.open.filter((id) => id !== cueId) };
}

/** Whether playback may resume: no open cue is holding it. */
export function canResume(cues: readonly VideoCue[], state: CueState): boolean {
  return !state.open.some((id) => cues.find((c) => c.id === id)?.pause === true);
}
