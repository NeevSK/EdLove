import {
  type AccountLifecycleCommand,
  type AccountLifecycleResult,
  failAccountLifecycleCommand,
} from '@repo/core/logic/accountLifecycle';
import { useCallback, useReducer, useRef } from 'react';

export type AccountLifecycleExecutor = (
  command: AccountLifecycleCommand,
) => Promise<AccountLifecycleResult>;

export type AccountLifecycleState =
  | { phase: 'idle' }
  | { phase: 'pending'; command: AccountLifecycleCommand }
  | { phase: 'completed'; result: AccountLifecycleResult }
  | { phase: 'failed'; command: AccountLifecycleCommand; error: string };

type Action =
  | { type: 'start'; command: AccountLifecycleCommand }
  | { type: 'complete'; result: AccountLifecycleResult }
  | { type: 'fail'; command: AccountLifecycleCommand; error: string }
  | { type: 'reset' };

export const initialAccountLifecycleState: AccountLifecycleState = { phase: 'idle' };

export function accountLifecycleReducer(
  state: AccountLifecycleState,
  action: Action,
): AccountLifecycleState {
  switch (action.type) {
    case 'start':
      return { phase: 'pending', command: action.command };
    case 'complete':
      return { phase: 'completed', result: action.result };
    case 'fail':
      return { phase: 'failed', command: action.command, error: action.error };
    case 'reset':
      return initialAccountLifecycleState;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Account action failed.';
}

export function useAccountLifecycle(execute: AccountLifecycleExecutor) {
  const [state, dispatch] = useReducer(accountLifecycleReducer, initialAccountLifecycleState);
  const pending = useRef(false);

  const run = useCallback(
    async (command: AccountLifecycleCommand): Promise<AccountLifecycleResult | null> => {
      if (pending.current) return null;

      pending.current = true;
      dispatch({ type: 'start', command });
      try {
        const result = await execute(command);
        if (result.phase === 'failed') {
          dispatch({ type: 'fail', command, error: result.error });
          return result;
        }
        if (result.phase === 'pending') {
          const error = 'Account lifecycle executors must return a terminal result.';
          dispatch({ type: 'fail', command, error });
          return failAccountLifecycleCommand(command, error);
        }
        dispatch({ type: 'complete', result });
        return result;
      } catch (error) {
        const message = getErrorMessage(error);
        dispatch({ type: 'fail', command, error: message });
        return failAccountLifecycleCommand(command, message);
      } finally {
        pending.current = false;
      }
    },
    [execute],
  );

  const reset = useCallback(() => {
    if (pending.current) return;
    dispatch({ type: 'reset' });
  }, []);

  return {
    state,
    isPending: state.phase === 'pending',
    run,
    reset,
  };
}
