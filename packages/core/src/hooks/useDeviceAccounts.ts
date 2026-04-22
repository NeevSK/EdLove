import { useCallback, useEffect, useState } from 'react';
import { type DeviceAccountRecord, deviceAccounts } from '../accounts/deviceAccounts';

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
    })();

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

  return {
    accounts,
    activeAccountId,
    loading,
    busyAccountId,
    refresh,
    switchAccount,
    removeAccount,
    signOutCurrentAccount,
  };
}
