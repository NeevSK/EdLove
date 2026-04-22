import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Box, Button, ButtonText, Heading, HStack, Text, VStack } from '../gluestack';
import { useDeviceAccounts, accountPin, type DeviceAccountRecord } from '@repo/core/logic';
import AccountPinModal, { type AccountPinModalMode } from './AccountPinModal';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { Shield } from 'lucide-react-native';

type PendingPinAction =
  | { mode: AccountPinModalMode; account: DeviceAccountRecord }
  | null;

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name || email || 'A';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A';
}

export default function DeviceAccountManager({
  title = 'Shared device accounts',
  subtitle = 'Switch between accounts stored on this device, protect them with a PIN, and remove them locally when needed.',
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const { accounts, activeAccountId, busyAccountId, loading, switchAccount, removeAccount, refresh } = useDeviceAccounts();
  const { showToast } = useSanctuaryToast();
  const [pinProtectedIds, setPinProtectedIds] = useState<Record<string, boolean>>({});
  const [pinAction, setPinAction] = useState<PendingPinAction>(null);
  const [pinBusy, setPinBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        accounts.map(async (account) => [account.accountId, await accountPin.hasPin(account.accountId)] as const)
      );

      if (cancelled) return;
      setPinProtectedIds(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, [accounts]);

  const accountLabel = (account: DeviceAccountRecord) => account.fullName || account.email || 'This account';

  const askForPin = (mode: AccountPinModalMode, account: DeviceAccountRecord) => {
    hapticLight();
    setPinAction({ mode, account });
  };

  const handleSwitch = async (account: DeviceAccountRecord) => {
    const protectedByPin = !!pinProtectedIds[account.accountId];
    if (protectedByPin) {
      askForPin('verify', account);
      return;
    }

    setPinBusy(true);
    try {
      await switchAccount(account.accountId);
      hapticSuccess();
      showToast?.({ message: `Switched to ${accountLabel(account)}`, type: 'success' });
    } catch (error: any) {
      hapticError();
      showToast?.({ message: error?.message ?? 'Could not switch account', type: 'error' });
    } finally {
      setPinBusy(false);
    }
  };

  const handleRemove = async (account: DeviceAccountRecord) => {
    const protectedByPin = !!pinProtectedIds[account.accountId];
    if (protectedByPin) {
      askForPin('remove', account);
      return;
    }

    const proceed = () => removeAccount(account.accountId).then(() => {
      hapticSuccess();
      showToast?.({ message: `Removed ${accountLabel(account)} from this device`, type: 'success' });
      refresh();
    }).catch((error: any) => {
      hapticError();
      showToast?.({ message: error?.message ?? 'Could not remove account', type: 'error' });
    });

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Remove ${accountLabel(account)} from this device?`);
      if (!confirmed) return;
      setPinBusy(true);
      try {
        await proceed();
      } finally {
        setPinBusy(false);
      }
      return;
    }

    Alert.alert(
      'Remove account',
      `Remove ${accountLabel(account)} from this device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setPinBusy(true);
            try {
              await proceed();
            } finally {
              setPinBusy(false);
            }
          },
        },
      ]
    );
  };

  const handlePinSubmit = async (values: any) => {
    if (!pinAction) return;
    const { mode, account } = pinAction;
    setPinBusy(true);
    try {
      if (mode === 'verify') {
        const ok = await accountPin.verifyPin(account.accountId, values.pin);
        if (!ok) {
          throw new Error('PIN did not match this account.');
        }
        await switchAccount(account.accountId);
        showToast?.({ message: `Switched to ${accountLabel(account)}`, type: 'success' });
        return;
      }

      if (mode === 'create') {
        await accountPin.setPin(account.accountId, values.pin);
        setPinProtectedIds((current) => ({ ...current, [account.accountId]: true }));
        showToast?.({ message: `PIN added for ${accountLabel(account)}`, type: 'success' });
        return;
      }

      if (mode === 'update') {
        const ok = await accountPin.verifyPin(account.accountId, values.currentPin);
        if (!ok) {
          throw new Error('Current PIN did not match this account.');
        }
        await accountPin.setPin(account.accountId, values.nextPin);
        setPinProtectedIds((current) => ({ ...current, [account.accountId]: true }));
        showToast?.({ message: `PIN updated for ${accountLabel(account)}`, type: 'success' });
        return;
      }

      if (mode === 'remove') {
        const ok = await accountPin.verifyPin(account.accountId, values.pin);
        if (!ok) {
          throw new Error('PIN did not match this account.');
        }
        await accountPin.removePin(account.accountId);
        setPinProtectedIds((current) => ({ ...current, [account.accountId]: false }));
        await removeAccount(account.accountId);
        showToast?.({ message: `Removed ${accountLabel(account)} from this device`, type: 'success' });
        return;
      }
    } catch (error: any) {
      hapticError();
      showToast?.({ message: error?.message ?? 'Action failed', type: 'error' });
    } finally {
      setPinBusy(false);
      setPinAction(null);
      refresh();
    }
  };

  return (
    <Box className={`rounded-[28px] border border-phase-border bg-phase-surface ${compact ? 'p-4' : 'p-5'}`}>
      <VStack className="gap-3">
        <HStack className="items-start justify-between gap-3">
          <VStack className="flex-1 gap-1">
            <Heading className="text-lg font-bold text-phase-primary">{title}</Heading>
            <Text className="text-sm leading-relaxed text-phase-secondary">{subtitle}</Text>
          </VStack>
          <Box className="h-11 w-11 items-center justify-center rounded-[14px] bg-phase-world border border-phase-border">
            <Shield size={18} className="text-phase-primary" />
          </Box>
        </HStack>

        {loading ? (
          <Text className="text-sm text-phase-secondary">Loading accounts…</Text>
        ) : accounts.length === 0 ? (
          <Box className="rounded-[20px] border border-dashed border-phase-border bg-phase-world p-4">
            <Text className="text-sm text-phase-secondary">
              No shared device accounts are stored here yet.
            </Text>
          </Box>
        ) : (
          <VStack className="gap-3">
            {accounts.map((account) => {
              const isActive = account.accountId === activeAccountId;
              const busy = busyAccountId === account.accountId || pinBusy;
              return (
                <Box
                  key={account.accountId}
                  className={`rounded-[24px] border p-4 ${isActive ? 'border-phase-primary bg-phase-world' : 'border-phase-border bg-phase-surface'}`}
                >
                  <HStack className="items-start gap-3">
                    <Box className="h-12 w-12 items-center justify-center rounded-[16px] bg-phase-accent/10 border border-phase-border">
                      <Text className="text-sm font-bold text-phase-primary">{getInitials(account.fullName, account.email)}</Text>
                    </Box>
                    <VStack className="flex-1 gap-1">
                      <HStack className="items-center gap-2">
                        <Text className="text-base font-semibold text-phase-primary">
                          {account.fullName || account.email || account.accountId}
                        </Text>
                        {isActive && (
                          <Box className="rounded-full bg-phase-primary px-2 py-1">
                            <Text className="text-[10px] font-bold uppercase text-white">Active</Text>
                          </Box>
                        )}
                      </HStack>
                      <Text className="text-sm text-phase-secondary">{account.email || 'No email saved'}</Text>
                      <Text className="text-xs text-phase-secondary">
                        {pinProtectedIds[account.accountId] ? 'PIN protected on this device' : 'No local PIN yet'}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack className="mt-4 gap-2">
                    {!isActive ? (
                      <Button
                        className="flex-1 rounded-2xl"
                        variant="outline"
                        onPress={() => handleSwitch(account)}
                        isDisabled={busy}
                      >
                        <ButtonText>Switch</ButtonText>
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 rounded-2xl"
                        variant="outline"
                        onPress={() => askForPin(pinProtectedIds[account.accountId] ? 'update' : 'create', account)}
                        isDisabled={busy}
                      >
                        <ButtonText>{pinProtectedIds[account.accountId] ? 'Change PIN' : 'Set PIN'}</ButtonText>
                      </Button>
                    )}
                    <Button
                      className="rounded-2xl"
                      variant="solid"
                      action="negative"
                      onPress={() => handleRemove(account)}
                      isDisabled={busy}
                    >
                      <ButtonText>Remove</ButtonText>
                    </Button>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </VStack>

      <AccountPinModal
        isOpen={!!pinAction}
        mode={pinAction?.mode ?? 'verify'}
        accountLabel={pinAction ? accountLabel(pinAction.account) : null}
        allowClose={!pinBusy}
        isLoading={pinBusy}
        onClose={() => setPinAction(null)}
        onSubmit={handlePinSubmit}
      />
    </Box>
  );
}
