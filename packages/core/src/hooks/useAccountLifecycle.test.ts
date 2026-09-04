import {
  type AccountLifecycleState,
  accountLifecycleReducer,
  initialAccountLifecycleState,
} from '@repo/core/hooks/useAccountLifecycle';
import {
  completeAccountLifecycleCommand,
  failAccountLifecycleCommand,
} from '@repo/core/logic/accountLifecycle';

const command = { kind: 'sign-out-current-device' } as const;

describe('accountLifecycleReducer', () => {
  it('tracks a command through pending and completed states', () => {
    const pending = accountLifecycleReducer(initialAccountLifecycleState, {
      type: 'start',
      command,
    });
    expect(pending).toEqual({ phase: 'pending', command });

    const result = completeAccountLifecycleCommand(
      { command: command.kind, availability: 'supported' },
      command,
      [{ kind: 'clear-current-session' }],
    );
    expect(accountLifecycleReducer(pending, { type: 'complete', result })).toEqual({
      phase: 'completed',
      result,
    });
  });

  it('retains a normalized failure and can reset for a retry', () => {
    const failure = failAccountLifecycleCommand(command, 'Session cleanup failed.');
    const failed = accountLifecycleReducer(
      { phase: 'pending', command },
      { type: 'fail', command, error: failure.error },
    );
    expect(failed).toEqual({
      phase: 'failed',
      command,
      error: 'Session cleanup failed.',
    });
    expect(accountLifecycleReducer(failed, { type: 'reset' })).toEqual(
      initialAccountLifecycleState,
    );
  });

  it('does not blur unsupported results into successful effects', () => {
    const unsupported: AccountLifecycleState = {
      phase: 'completed',
      result: {
        command: { kind: 'request-deletion', accountId: 'account-1' },
        effects: [],
        phase: 'unsupported',
        reason: 'No adapter',
      },
    };
    expect(unsupported.result.phase).toBe('unsupported');
  });
});
