import { clearPowerSyncAccount } from '@repo/core/adapters/powersync/database';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import type {
  AccountTransitionOutcome,
  AccountTransitionPort,
  AccountTransitionRequest,
} from '@repo/core/logic/ports/accountTransition.port';

function ownedByPrincipal(userId: string | undefined, principalId: string | null): boolean {
  return principalId !== null && userId === principalId;
}

class LocalAccountTransitionAdapter implements AccountTransitionPort {
  async transition(request: AccountTransitionRequest): Promise<AccountTransitionOutcome> {
    if (request.outgoingPrincipalId === request.incomingPrincipalId) {
      return {
        disposition: request.disposition,
        outgoingPrincipalId: request.outgoingPrincipalId,
        incomingPrincipalId: request.incomingPrincipalId,
        quarantinedCommandCount: 0,
        discardedCommandCount: 0,
        untouchedUnboundCommandCount: 0,
        replicatedDataCleared: false,
      };
    }

    if (request.clearReplicatedData) {
      await clearPowerSyncAccount();
    }

    const state = useMutationQueue.getState();
    const unboundCommandCount = state.queue.filter((command) => !command.userId).length;
    const ownedQueue = state.queue.filter((command) =>
      ownedByPrincipal(command.userId, request.outgoingPrincipalId),
    );
    const ownedDeadLetters = state.deadLetterQueue.filter((command) =>
      ownedByPrincipal(command.userId, request.outgoingPrincipalId),
    );

    if (request.disposition === 'preserve-and-quarantine') {
      useMutationQueue.setState({
        isSyncing: false,
        queue: state.queue.map((command) =>
          ownedByPrincipal(command.userId, request.outgoingPrincipalId)
            ? {
                ...command,
                commandState: 'auth_paused',
                backoffUntil: undefined,
                lockLeaseExpiresAt: undefined,
              }
            : command,
        ),
      });
    } else {
      useMutationQueue.setState({
        isSyncing: false,
        queue: state.queue.filter(
          (command) => !ownedByPrincipal(command.userId, request.outgoingPrincipalId),
        ),
        deadLetterQueue: state.deadLetterQueue.filter(
          (command) => !ownedByPrincipal(command.userId, request.outgoingPrincipalId),
        ),
      });
    }

    return {
      disposition: request.disposition,
      outgoingPrincipalId: request.outgoingPrincipalId,
      incomingPrincipalId: request.incomingPrincipalId,
      quarantinedCommandCount:
        request.disposition === 'preserve-and-quarantine' ? ownedQueue.length : 0,
      discardedCommandCount:
        request.disposition === 'discard' ? ownedQueue.length + ownedDeadLetters.length : 0,
      untouchedUnboundCommandCount: unboundCommandCount,
      replicatedDataCleared: request.clearReplicatedData,
    };
  }
}

export const accountTransition: AccountTransitionPort = new LocalAccountTransitionAdapter();
