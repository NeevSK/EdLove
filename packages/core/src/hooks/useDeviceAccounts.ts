import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { type DeviceAccountRecord, deviceAccounts } from '../accounts/deviceAccounts';

export type { DeviceAccountRecord };

type State = {
  accounts: DeviceAccountRecord[];
  activeAccountId: string | null;
  loading: boolean;
  busyAccountId: string | null;
};

type Action =
  | { type: 'HYDRATE_START' }
  | {
      type: 'HYDRATE_SUCCESS';
      payload: { accounts: DeviceAccountRecord[]; activeAccountId: string | null };
    }
  | { type: 'SET_BUSY'; payload: string | null }
  | {
      type: 'REFRESH_SUCCESS';
      payload: { accounts: DeviceAccountRecord[]; activeAccountId: string | null };
    };

function accountsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE_START':
      return { ...state, loading: true };
    case 'HYDRATE_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: action.payload.accounts,
        activeAccountId: action.payload.activeAccountId,
      };
    case 'SET_BUSY':
      return { ...state, busyAccountId: action.payload };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        accounts: action.payload.accounts,
        activeAccountId: action.payload.activeAccountId,
      };
    default:
      return state;
  }
}

const initialState: State = {
  accounts: [],
  activeAccountId: null,
  loading: true,
  busyAccountId: null,
};

export function useDeviceAccounts() {
  const [state, dispatch] = useReducer(accountsReducer, initialState);

  const refresh = useCallback(async () => {
    const [nextAccounts, nextActiveId] = await Promise.all([
      deviceAccounts.list(),
      deviceAccounts.getActiveAccountId(),
    ]);
    dispatch({
      type: 'REFRESH_SUCCESS',
      payload: { accounts: nextAccounts, activeAccountId: nextActiveId },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      dispatch({ type: 'HYDRATE_START' });
      try {
        const [nextAccounts, nextActiveId] = await Promise.all([
          deviceAccounts.list(),
          deviceAccounts.getActiveAccountId(),
        ]);

        if (cancelled) return;
        dispatch({
          type: 'HYDRATE_SUCCESS',
          payload: { accounts: nextAccounts, activeAccountId: nextActiveId },
        });
      } catch (e) {
        console.error('DeviceAccounts: Initial hydration failed', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const switchAccount = useCallback(
    async (accountId: string) => {
      dispatch({ type: 'SET_BUSY', payload: accountId });
      try {
        await deviceAccounts.switchTo(accountId);
        await refresh();
      } finally {
        dispatch({ type: 'SET_BUSY', payload: null });
      }
    },
    [refresh],
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      dispatch({ type: 'SET_BUSY', payload: accountId });
      try {
        await deviceAccounts.removeAccount(accountId);
        await refresh();
      } finally {
        dispatch({ type: 'SET_BUSY', payload: null });
      }
    },
    [refresh],
  );

  const signOutCurrentAccount = useCallback(async () => {
    const currentId = state.activeAccountId;
    dispatch({ type: 'SET_BUSY', payload: currentId });
    try {
      await deviceAccounts.signOutCurrentAccount();
      await refresh();
    } finally {
      dispatch({ type: 'SET_BUSY', payload: null });
    }
  }, [state.activeAccountId, refresh]);

  const signOutAllAccounts = useCallback(async () => {
    dispatch({ type: 'SET_BUSY', payload: state.activeAccountId });
    try {
      await deviceAccounts.signOutAllAccounts();
      await refresh();
    } finally {
      dispatch({ type: 'SET_BUSY', payload: null });
    }
  }, [state.activeAccountId, refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
      switchAccount,
      removeAccount,
      signOutCurrentAccount,
      signOutAllAccounts,
    }),
    [state, refresh, switchAccount, removeAccount, signOutCurrentAccount, signOutAllAccounts],
  );
}
