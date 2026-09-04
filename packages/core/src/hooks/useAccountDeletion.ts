import { useAccountLifecycle } from '@repo/core/hooks/useAccountLifecycle';
import { authAPI } from '@repo/core/api/auth';
import {
  type AccountLifecycleCommand,
  completeAccountLifecycleCommand,
  getAccountLifecycleCapability,
} from '@repo/core/logic/accountLifecycle';
import type { AccountDeletionRequest } from '@repo/core/logic/ports/auth.port';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const deletionCommand = { kind: 'request-deletion', accountId: 'current-account' } as const;

export function getAccountDeletionUnavailableReason(): string | null {
  const platform = Platform.OS === 'web' ? 'web' : 'native';
  const capability = getAccountLifecycleCapability(deletionCommand, platform);

  return capability.availability === 'supported' ? null : capability.reason;
}
/**
 * Account deletion submits a request only; server policy controls later review,
 * soft deactivation, retention, and permanent purge.
 */
export function useAccountDeletion() {
  const unavailableReason = getAccountDeletionUnavailableReason();
  const latestRequest = useRef<AccountDeletionRequest | null>(null);
  const [request, setRequest] = useState<AccountDeletionRequest | null>(null);

  useEffect(() => {
    let cancelled = false;

    void authAPI
      .getAccountDeletionRequestStatus()
      .then((nextRequest) => {
        if (!cancelled) setRequest(nextRequest);
      })
      .catch((error: unknown) => {
        console.warn('[useAccountDeletion] unable to load deletion request status', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const execute = useCallback(async (command: AccountLifecycleCommand) => {
    if (command.kind !== 'request-deletion') {
      throw new Error(`Account deletion cannot execute lifecycle command "${command.kind}".`);
    }
    const platform = Platform.OS === 'web' ? 'web' : 'native';
    const capability = getAccountLifecycleCapability(command, platform);

    if (capability.availability !== 'supported') {
      throw new Error(capability.reason);
    }
    const accountDeletionRequest = await authAPI.requestAccountDeletion();
    latestRequest.current = accountDeletionRequest;
    setRequest(accountDeletionRequest);
    return completeAccountLifecycleCommand(capability, command, [
      { kind: 'request-deletion', accountId: command.accountId },
    ]);
  }, []);
  const lifecycle = useAccountLifecycle(execute);

  const deleteAccount = useCallback(async (): Promise<AccountDeletionRequest> => {
    const result = await lifecycle.run(deletionCommand);
    if (!result) {
      throw new Error('Another account lifecycle action is already in progress.');
    }
    if (result.phase === 'failed') {
      throw new Error(result.error);
    }
    if (result.phase !== 'completed' || !latestRequest.current) {
      throw new Error('Account deletion request did not reach a valid terminal state.');
    }
    return latestRequest.current;
  }, [lifecycle]);

  return {
    deleteAccount,
    unavailableReason,
    request,
    isDeleting: lifecycle.isPending,
    error: lifecycle.state.phase === 'failed' ? new Error(lifecycle.state.error) : null,
    reset: lifecycle.reset,
    state: lifecycle.state,
  };
}
