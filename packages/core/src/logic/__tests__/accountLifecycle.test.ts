import {
  type AccountLifecycleAvailableCapability,
  type AccountLifecycleCommand,
  beginAccountLifecycleCommand,
  completeAccountLifecycleCommand,
  failAccountLifecycleCommand,
  getAccountLifecycleCapability,
  markAccountLifecycleCommandUnsupported,
} from '@repo/core/logic/accountLifecycle';
import { describe, expect, it } from 'vitest';

describe('account lifecycle contracts', () => {
  it('exposes local commands and the server-backed deletion request on every platform', () => {
    const commands: readonly AccountLifecycleCommand[] = [
      { kind: 'sign-out-current-device' },
      { kind: 'remove-remembered-account', accountId: 'account-1' },
      { kind: 'sign-out-all-local-accounts' },
      { kind: 'revoke-remote-session', sessionId: 'session-1' },
      { kind: 'request-deactivation', accountId: 'account-1' },
      { kind: 'request-deletion', accountId: 'account-1' },
    ];

    expect(
      commands.map((command) => getAccountLifecycleCapability(command, 'web').availability),
    ).toEqual(['supported', 'supported', 'supported', 'unavailable', 'unavailable', 'supported']);
  });

  it('keeps local lifecycle capability parity between web and native', () => {
    const commands: readonly AccountLifecycleCommand[] = [
      { kind: 'sign-out-current-device' },
      { kind: 'remove-remembered-account', accountId: 'account-1' },
      { kind: 'sign-out-all-local-accounts' },
    ];

    for (const command of commands) {
      expect(getAccountLifecycleCapability(command, 'web')).toMatchObject({
        availability: 'supported',
      });
      expect(getAccountLifecycleCapability(command, 'native')).toMatchObject({
        availability: 'supported',
      });
    }
  });

  it('models a local command through pending and completed phases', () => {
    const command = { kind: 'sign-out-current-device' } as const;
    const capability: AccountLifecycleAvailableCapability<typeof command> = {
      command: command.kind,
      availability: 'supported',
    };

    expect(beginAccountLifecycleCommand(command)).toEqual({
      command,
      effects: [],
      phase: 'pending',
    });
    expect(
      completeAccountLifecycleCommand(capability, command, [{ kind: 'clear-current-session' }]),
    ).toEqual({
      command,
      effects: [{ kind: 'clear-current-session' }],
      phase: 'completed',
    });
  });

  it('rejects effects outside a command boundary', () => {
    const command = { kind: 'remove-remembered-account', accountId: 'account-1' } as const;
    const capability: AccountLifecycleAvailableCapability<typeof command> = {
      command: command.kind,
      availability: 'supported',
    };

    expect(() =>
      completeAccountLifecycleCommand(capability, command, [{ kind: 'clear-current-session' }]),
    ).toThrow('forbidden effect');
    expect(() =>
      completeAccountLifecycleCommand(capability, command, [
        { kind: 'remove-remembered-account', accountId: 'another-account' },
      ]),
    ).toThrow('forbidden effect');
  });

  it('keeps remote-session revocation unsupported until its lifecycle adapter exists', () => {
    const command = { kind: 'revoke-remote-session', sessionId: 'session-1' } as const;
    const capability = getAccountLifecycleCapability(command, 'web');

    expect(capability.availability).toBe('unavailable');
    if (capability.availability === 'supported') {
      throw new Error('Web must not report remote-session revocation as supported.');
    }
    expect(markAccountLifecycleCommandUnsupported(capability, command)).toEqual({
      command,
      effects: [],
      phase: 'unsupported',
      reason: 'This command is not available on this platform.',
    });

    expect(() => {
      // A default capability is unavailable, so it cannot be passed to completion.
      // @ts-expect-error Unsupported commands must not be represented as completed.
      completeAccountLifecycleCommand(capability, command, [
        { kind: 'revoke-remote-session', sessionId: 'session-1' },
      ]);
    }).toThrow('Unsupported account lifecycle commands cannot be completed.');
  });

  it('keeps native remote-session capability distinct from the web capability', () => {
    const command = { kind: 'revoke-remote-session', sessionId: 'session-1' } as const;

    expect(getAccountLifecycleCapability(command, 'native')).toMatchObject({
      availability: 'adapter-required',
    });
    expect(getAccountLifecycleCapability(command, 'web')).toMatchObject({
      availability: 'unavailable',
    });
  });

  it('preserves failure as a no-effect terminal phase', () => {
    const command = { kind: 'request-deletion', accountId: 'account-1' } as const;

    expect(failAccountLifecycleCommand(command, 'Fresh authentication is required.')).toEqual({
      command,
      effects: [],
      error: 'Fresh authentication is required.',
      phase: 'failed',
    });
  });
});
