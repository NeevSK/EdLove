import { useCallback, useEffect, useMemo, useState } from 'react';
import { type DeviceAccountRecord, deviceAccounts } from '../accounts/deviceAccounts';

export type { DeviceAccountRecord };

export function useDeviceAccounts() {
  const [accounts, setAccounts] = useState<DeviceAccountRecord[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAccountId, setBusyAccountId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextAccounts, nextActiveId] = await Promise.all([
      deviceAccounts.list(),
      deviceAccounts.getActiveAccountId(),
    ]);
    setAccounts(nextAccounts);
    setActiveAccountId(nextActiveId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [nextAccounts, nextActiveId] = await Promise.all([
          deviceAccounts.list(),
          deviceAccounts.getActiveAccountId(),
        ]);

        if (cancelled) return;
        setAccounts(nextAccounts);
        setActiveAccountId(nextActiveId);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })().catch((e) => {
      console.error('DeviceAccounts: Initial hydration failed', e);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const switchAccount = useCallback(
    async (accountId: string) => {
      setBusyAccountId(accountId);
      try {
        await deviceAccounts.switchTo(accountId);
        await refresh();
      } finally {
        setBusyAccountId(null);
      }
    },
    [refresh],
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      setBusyAccountId(accountId);
      try {
        await deviceAccounts.removeAccount(accountId);
        await refresh();
      } finally {
        setBusyAccountId(null);
      }
    },
    [refresh],
  );

  const signOutCurrentAccount = useCallback(async () => {
    const currentId = activeAccountId;
    setBusyAccountId(currentId);
    try {
      await deviceAccounts.signOutCurrentAccount();
      await refresh();
    } finally {
      setBusyAccountId(null);
    }
  }, [activeAccountId, refresh]);

  const signOutAllAccounts = useCallback(async () => {
    setBusyAccountId(activeAccountId);
    try {
      await deviceAccounts.signOutAllAccounts();
      await refresh();
    } finally {
      setBusyAccountId(null);
    }
  }, [activeAccountId, refresh]);

  return useMemo(
    () => ({
      accounts,
      activeAccountId,
      loading,
      busyAccountId,
      refresh,
      switchAccount,
      removeAccount,
      signOutCurrentAccount,
      signOutAllAccounts,
    }),
    [
      accounts,
      activeAccountId,
      loading,
      busyAccountId,
      refresh,
      switchAccount,
      removeAccount,
      signOutCurrentAccount,
      signOutAllAccounts,
    ],
  );
}
