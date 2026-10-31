import type { AgentLabels, ChatPrivacy, FabAction } from '../../theme/contracts';

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

/** English words for task tabs. */
export const TASK_TABS_ENGLISH = {
  close: (title: string) => `Close ${title}`,
  reorder: (title: string) => `Reorder ${title}`,
  moveEarlier: 'Move earlier',
  moveLater: 'Move later',
  reorderHint: 'Hold and drag to reorder. Screen reader users can move it earlier or later.',
};

/** Where a dragged tab lands, from its new centre among the others' centres. */
export function dropIndex(
  movedId: string,
  translationX: number,
  centres: ReadonlyMap<string, number>,
  order: readonly string[],
): number | null {
  const from = centres.get(movedId);
  if (from === undefined) return null;
  const target = from + translationX;
  const others = order
    .filter((id) => id !== movedId)
    .map((id) => ({ id, c: centres.get(id) }))
    .filter((x): x is { id: string; c: number } => x.c !== undefined)
    .sort((a, b) => a.c - b.c);
  const i = others.findIndex((x) => target < x.c);
  return i < 0 ? others.length : i;
}

/**
 * Menu actions in sections: ungrouped ones first, then each named group in
 * the order its first action appears, so callers decide the order by listing.
 */
export function groupFabActions(
  actions: readonly FabAction[],
): { group: string | undefined; actions: FabAction[] }[] {
  const sections: { group: string | undefined; actions: FabAction[] }[] = [];
  const loose: FabAction[] = [];
  for (const action of actions) {
    if (!action.group) {
      loose.push(action);
      continue;
    }
    const section = sections.find((s) => s.group === action.group);
    if (section) section.actions.push(action);
    else sections.push({ group: action.group, actions: [action] });
  }
  return loose.length ? [{ group: undefined, actions: loose }, ...sections] : sections;
}
