import type { AgentLabels, ChatPrivacy } from '../../theme/contracts';

/** English words for the agent kit; screens pass their own for si and ta. */
export const AGENT_ENGLISH: AgentLabels = {
  you: 'You',
  assistant: 'Gurudevi',
  send: 'Send',
  stop: 'Stop',
  attach: 'Attach a file',
  remove: 'Remove',
  retry: 'Try again',
  copy: 'Copy',
  regenerate: 'Answer again',
  edit: 'Edit',
  cancel: 'Cancel',
  stopped: 'Stopped before the end.',
  failed: 'This reply did not arrive.',
  charactersLeft: (n) => `${n} characters left`,
  thinking: 'Thinking',
  thoughtFor: (s) => `Thought for ${s} s`,
  showThinking: 'Show thinking',
  hideThinking: 'Hide thinking',
  running: 'Working',
  done: 'Done',
  toolFailed: 'Did not finish',
  accept: 'Accept',
  discard: 'Discard',
  submitting: 'Saving…',
  accepted: 'Accepted and saved.',
  discarded: 'Discarded. Nothing was changed.',
  approvalFailed: 'Could not save. Nothing was changed.',
  expired: 'This request expired. Ask again to see it.',
  open: 'Open',
  sandboxed: 'Opens in a sealed view',
  privacy: {
    saved: 'Saved to your history',
    temporary: 'Temporary: cleared when you leave',
    incognito: 'Incognito: not saved, not used to learn about you',
  },
  source: (n, title) => `Source ${n}: ${title}`,
  menu: 'Actions',
  close: 'Close',
};

export const PRIVACY_MODES: readonly ChatPrivacy[] = ['saved', 'temporary', 'incognito'];

/** A message is announced once: when it completes, never while it streams. */
export function shouldAnnounce(previous: string | undefined, next: string | undefined): boolean {
  return next === 'complete' && previous !== undefined && previous !== 'complete';
}

/** Characters left, shown only near the end (the last fifth). */
export function remainingNote(length: number, max: number | undefined): number | null {
  if (max === undefined) return null;
  const left = max - length;
  return left <= Math.ceil(max / 5) ? left : null;
}
