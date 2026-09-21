import {
  assertMutationCommandTransition,
  canTransitionMutationCommand,
} from '@repo/core/lib/sync/commandLifecycle';

describe('mutation command lifecycle', () => {
  it('allows only recovery paths from a queued command', () => {
    expect(canTransitionMutationCommand('queued', 'dispatching')).toBe(true);
    expect(canTransitionMutationCommand('queued', 'reconciled')).toBe(false);
  });

  it('allows a crashed dispatch lease to be reacquired without settling the command', () => {
    expect(canTransitionMutationCommand('dispatching', 'dispatching')).toBe(true);
    expect(canTransitionMutationCommand('dispatching', 'reconciled')).toBe(true);
  });

  it('rejects terminal-state replay', () => {
    expect(() => assertMutationCommandTransition('reconciled', 'dispatching')).toThrow(
      'Invalid mutation command transition',
    );
    expect(() => assertMutationCommandTransition('discarded', 'queued')).toThrow(
      'Invalid mutation command transition',
    );
  });

  it('allows explicit recovery from the dead-letter state only through the queue', () => {
    expect(canTransitionMutationCommand('rejected', 'queued')).toBe(true);
    expect(canTransitionMutationCommand('rejected', 'dispatching')).toBe(false);
  });
});
