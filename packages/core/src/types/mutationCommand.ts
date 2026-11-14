export const MUTATION_COMMAND_STATES = [
  'queued',
  'dispatching',
  'retry_scheduled',
  'auth_paused',
  'conflict',
  'rejected',
  'reconciled',
  'discarded',
] as const;

export type MutationCommandState = (typeof MUTATION_COMMAND_STATES)[number];

const transitions: Readonly<Record<MutationCommandState, readonly MutationCommandState[]>> = {
  queued: ['dispatching', 'discarded'],
  // Re-entry is allowed only after the coordinator observes an expired lease.
  dispatching: [
    'dispatching',
    'queued',
    'retry_scheduled',
    'auth_paused',
    'conflict',
    'rejected',
    'reconciled',
  ],
  retry_scheduled: ['dispatching', 'discarded'],
  auth_paused: ['queued', 'discarded'],
  conflict: ['queued', 'discarded'],
  // Recovery UI may explicitly requeue a rejected command after inspection.
  rejected: ['queued', 'discarded'],
  reconciled: [],
  discarded: [],
};

/** A command may only settle after a server receipt, never after event enqueue. */
export function canTransitionMutationCommand(
  from: MutationCommandState,
  to: MutationCommandState,
): boolean {
  return transitions[from].includes(to);
}

export function assertMutationCommandTransition(
  from: MutationCommandState,
  to: MutationCommandState,
): void {
  if (!canTransitionMutationCommand(from, to)) {
    throw new Error(`Invalid mutation command transition: ${from} -> ${to}`);
  }
}
