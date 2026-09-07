export type AccountLifecycleCommand =
  | { kind: 'sign-out-current-device' }
  | { kind: 'remove-remembered-account'; accountId: string }
  | { kind: 'sign-out-all-local-accounts' }
  | { kind: 'revoke-remote-session'; sessionId: string }
  | { kind: 'request-deactivation'; accountId: string }
  | { kind: 'request-deletion'; accountId: string }
  | { kind: 'cancel-deletion-request'; accountId: string };

export type AccountLifecyclePhase = 'pending' | 'completed' | 'failed' | 'unsupported';
export type AccountLifecyclePlatform = 'native' | 'web';

export type AccountLifecycleEffect =
  | { kind: 'clear-current-session' }
  | { kind: 'remove-remembered-account'; accountId: string }
  | { kind: 'clear-all-remembered-accounts' }
  | { kind: 'revoke-remote-session'; sessionId: string }
  | { kind: 'request-deactivation'; accountId: string }
  | { kind: 'request-deletion'; accountId: string }
  | { kind: 'cancel-deletion-request'; accountId: string };

export type AccountLifecycleAvailableCapability<C extends AccountLifecycleCommand> = {
  command: C['kind'];
  availability: 'supported';
};

export type AccountLifecycleUnavailableCapability<C extends AccountLifecycleCommand> = {
  command: C['kind'];
  availability: 'adapter-required' | 'unavailable';
  reason: string;
};

export type AccountLifecycleCapability<
  C extends AccountLifecycleCommand = AccountLifecycleCommand,
> = AccountLifecycleAvailableCapability<C> | AccountLifecycleUnavailableCapability<C>;

export type AccountLifecyclePendingResult<C extends AccountLifecycleCommand> = {
  command: C;
  effects: readonly [];
  phase: 'pending';
};

export type AccountLifecycleCompletedResult<C extends AccountLifecycleCommand> = {
  command: C;
  effects: readonly AccountLifecycleEffect[];
  phase: 'completed';
};

export type AccountLifecycleFailedResult<C extends AccountLifecycleCommand> = {
  command: C;
  effects: readonly [];
  error: string;
  phase: 'failed';
};

export type AccountLifecycleUnsupportedResult<C extends AccountLifecycleCommand> = {
  command: C;
  effects: readonly [];
  phase: 'unsupported';
  reason: string;
};

export type AccountLifecycleResult<C extends AccountLifecycleCommand = AccountLifecycleCommand> =
  | AccountLifecyclePendingResult<C>
  | AccountLifecycleCompletedResult<C>
  | AccountLifecycleFailedResult<C>
  | AccountLifecycleUnsupportedResult<C>;

function requiresRemoteAdapter(command: AccountLifecycleCommand): boolean {
  return (
    command.kind === 'revoke-remote-session' ||
    command.kind === 'request-deactivation' ||
    command.kind === 'request-deletion'
  );
}

function isEffectAllowedForCommand(
  command: AccountLifecycleCommand,
  effect: AccountLifecycleEffect,
): boolean {
  switch (command.kind) {
    case 'sign-out-current-device':
      return effect.kind === 'clear-current-session';
    case 'remove-remembered-account':
      return effect.kind === 'remove-remembered-account' && effect.accountId === command.accountId;
    case 'sign-out-all-local-accounts':
      return effect.kind === 'clear-all-remembered-accounts';
    case 'revoke-remote-session':
      return effect.kind === 'revoke-remote-session' && effect.sessionId === command.sessionId;
    case 'request-deactivation':
      return effect.kind === 'request-deactivation' && effect.accountId === command.accountId;
    case 'request-deletion':
      return effect.kind === 'request-deletion' && effect.accountId === command.accountId;
    case 'cancel-deletion-request':
      return (
        effect.kind === 'cancel-deletion-request' && effect.accountId === command.accountId
      );
  }
}

export function getAccountLifecycleCapability<C extends AccountLifecycleCommand>(
  command: C,
  platform: AccountLifecyclePlatform,
): AccountLifecycleCapability<C> {
  if (
    command.kind === 'sign-out-current-device' ||
    command.kind === 'remove-remembered-account' ||
    command.kind === 'sign-out-all-local-accounts'
  ) {
    return {
      command: command.kind,
      availability: 'supported',
    };
  }

  const remotelyManagedOnNative = command.kind === 'revoke-remote-session';
  if (command.kind === 'request-deletion' || command.kind === 'cancel-deletion-request') {
    return { command: command.kind, availability: 'supported' };
  }
  const isUnavailable =
    requiresRemoteAdapter(command) && !(platform === 'native' && remotelyManagedOnNative);

  return {
    command: command.kind,
    availability: isUnavailable ? 'unavailable' : 'adapter-required',
    reason: isUnavailable
      ? 'This command is not available on this platform.'
      : 'This command requires a lifecycle adapter that has not been integrated.',
  };
}

export function beginAccountLifecycleCommand<C extends AccountLifecycleCommand>(
  command: C,
): AccountLifecyclePendingResult<C> {
  return { command, effects: [], phase: 'pending' };
}

export function completeAccountLifecycleCommand<C extends AccountLifecycleCommand>(
  capability: AccountLifecycleAvailableCapability<C>,
  command: C,
  effects: readonly AccountLifecycleEffect[],
): AccountLifecycleCompletedResult<C> {
  if (capability.availability !== 'supported') {
    throw new Error('Unsupported account lifecycle commands cannot be completed.');
  }

  if (capability.command !== command.kind) {
    throw new Error('Account lifecycle capability does not match the command.');
  }

  if (effects.some((effect) => !isEffectAllowedForCommand(command, effect))) {
    throw new Error(`Account lifecycle command "${command.kind}" received a forbidden effect.`);
  }

  return { command, effects, phase: 'completed' };
}

export function failAccountLifecycleCommand<C extends AccountLifecycleCommand>(
  command: C,
  error: string,
): AccountLifecycleFailedResult<C> {
  return { command, effects: [], error, phase: 'failed' };
}

export function markAccountLifecycleCommandUnsupported<C extends AccountLifecycleCommand>(
  capability: AccountLifecycleUnavailableCapability<C>,
  command: C,
): AccountLifecycleUnsupportedResult<C> {
  if (capability.command !== command.kind) {
    throw new Error('Account lifecycle capability does not match the command.');
  }

  return { command, effects: [], phase: 'unsupported', reason: capability.reason };
}
