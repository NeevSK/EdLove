import { accountPin, type DeviceAccountRecord, useDeviceAccounts, useStore } from '@repo/core/logic';
import { AlertTriangle, Shield } from 'lucide-react-native';
import { useEffect, useReducer } from 'react';
import { Alert, Platform } from 'react-native';
import { Box, Button, ButtonText, Heading, HStack, Text, VStack } from '../gluestack';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';
import AccountPinModal, {
  type AccountPinModalMode,
  type AccountPinModalSubmit,
} from './AccountPinModal';
import SanctuaryModal from './SanctuaryModal';

type PendingPinAction = {
  mode: AccountPinModalMode;
  account: DeviceAccountRecord;
} | null;

type OfflineConfirmAction =
  | { type: 'signOutCurrent' }
  | { type: 'signOutAll' }
  | { type: 'removeAccount'; account: DeviceAccountRecord }
  | null;

type State = {
  pinProtectedIds: Record<string, boolean>;
  pinAction: PendingPinAction;
  pinBusy: boolean;
  offlineConfirm: OfflineConfirmAction;
};

type Action =
  | { type: 'setPinProtectedIds'; value: Record<string, boolean> }
  | { type: 'setPinAction'; value: PendingPinAction }
  | { type: 'setPinBusy'; value: boolean }
  | { type: 'setOfflineConfirm'; value: OfflineConfirmAction };

const initialState: State = {
  pinProtectedIds: {},
  pinAction: null,
  pinBusy: false,
  offlineConfirm: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setPinProtectedIds':
      return { ...state, pinProtectedIds: action.value };
    case 'setPinAction':
      return { ...state, pinAction: action.value };
    case 'setPinBusy':
      return { ...state, pinBusy: action.value };
    case 'setOfflineConfirm':
      return { ...state, offlineConfirm: action.value };
    default:
      return state;
  }
}

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name || email || 'A';
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A'
  );
}

export default function DeviceAccountManager({
  title = 'Accounts remembered on this device',
  subtitle = 'These can belong to completely different people. Switch carefully, protect them with a PIN, and remove or sign out locally when needed.',
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const isOnline = useStore((state) => state.isOnline);
  const {
    accounts,
    activeAccountId,
    busyAccountId,
    loading,
    switchAccount,
    removeAccount,
    signOutCurrentAccount,
    signOutAllAccounts,
    refresh,
  } = useDeviceAccounts();
  const { showToast } = useSanctuaryToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { pinProtectedIds, pinAction, pinBusy, offlineConfirm } = state;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        accounts.map(
          async (account) =>
            [account.accountId, await accountPin.hasPin(account.accountId)] as const,
        ),
      );

      if (cancelled) return;
      dispatch({
        type: 'setPinProtectedIds',
        value: Object.fromEntries(entries),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [accounts]);

  const accountLabel = (account: DeviceAccountRecord) =>
    account.fullName || account.email || 'This account';

  const setPinBusy = (value: boolean) => dispatch({ type: 'setPinBusy', value });

  const askForPin = (mode: AccountPinModalMode, account: DeviceAccountRecord) => {
    hapticLight();
    dispatch({ type: 'setPinAction', value: { mode, account } });
  };

  const openOfflineConfirm = (value: OfflineConfirmAction) => {
    hapticLight();
    dispatch({ type: 'setOfflineConfirm', value });
  };

  const closeOfflineConfirm = () => {
    dispatch({ type: 'setOfflineConfirm', value: null });
  };

  const handleSignOutCurrent = async () => {
    if (!isOnline) {
      openOfflineConfirm({ type: 'signOutCurrent' });
      return;
    }

    setPinBusy(true);
    try {
      await signOutCurrentAccount();
      hapticSuccess();
      showToast?.({
        message: 'Signed out the current account from this device',
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not sign out current account';
      hapticError();
      showToast?.({
        message,
        type: 'error',
      });
    } finally {
      setPinBusy(false);
      refresh();
    }
  };

  const performSignOutAll = async () => {
    setPinBusy(true);
    try {
      await signOutAllAccounts();
      hapticSuccess();
      showToast?.({
        message: 'Signed out all remembered accounts from this device',
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not sign out all accounts';
      hapticError();
      showToast?.({
        message,
        type: 'error',
      });
    } finally {
      setPinBusy(false);
      refresh();
    }
  };

  const handleSignOutAll = async () => {
    if (!isOnline) {
      openOfflineConfirm({ type: 'signOutAll' });
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Sign out every remembered account from this device? This affects only this device install.',
      );
      if (!confirmed) return;
      await performSignOutAll();
      return;
    }

    Alert.alert(
      'Sign out all accounts',
      'Sign out every remembered account from this device? This affects only this device install.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out all',
          style: 'destructive',
          onPress: () => {
            void performSignOutAll();
          },
        },
      ],
    );
  };

  const handleSwitch = async (account: DeviceAccountRecord) => {
    if (pinProtectedIds[account.accountId]) {
      askForPin('verify', account);
      return;
    }

    setPinBusy(true);
    try {
      await switchAccount(account.accountId);
      hapticSuccess();
      showToast?.({
        message: `Switched to ${accountLabel(account)}`,
        type: 'success',
      });
    } catch (error) {
      hapticError();
      showToast?.({
        message: error instanceof Error ? error.message : 'Could not switch account',
        type: 'error',
      });
    } finally {
      setPinBusy(false);
    }
  };

  const performRemoveAccount = async (account: DeviceAccountRecord) => {
    setPinBusy(true);
    try {
      await removeAccount(account.accountId);
      hapticSuccess();
      showToast?.({
        message: `Removed ${accountLabel(account)} from this device`,
        type: 'success',
      });
      refresh();
    } catch (error) {
      hapticError();
      showToast?.({
        message: error instanceof Error ? error.message : 'Could not remove account',
        type: 'error',
      });
    } finally {
      setPinBusy(false);
    }
  };

  const handleRemove = async (account: DeviceAccountRecord) => {
    if (pinProtectedIds[account.accountId]) {
      askForPin('remove', account);
      return;
    }

    if (!isOnline) {
      openOfflineConfirm({ type: 'removeAccount', account });
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Remove ${accountLabel(account)} from this device?`);
      if (!confirmed) return;
      await performRemoveAccount(account);
      return;
    }

    Alert.alert('Remove account', `Remove ${accountLabel(account)} from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void performRemoveAccount(account);
        },
      },
    ]);
  };

  const confirmOfflineAction = async () => {
    if (!offlineConfirm) return;

    setPinBusy(true);
    try {
      if (offlineConfirm.type === 'signOutCurrent') {
        await signOutCurrentAccount();
        hapticSuccess();
        showToast?.({
          message:
            'Signed out this account on the device. You may need internet before signing in again.',
          type: 'success',
        });
      } else if (offlineConfirm.type === 'signOutAll') {
        await signOutAllAccounts();
        hapticSuccess();
        showToast?.({
          message:
            'Signed out all remembered accounts on this device. You may need internet before signing in again.',
          type: 'success',
        });
      } else if (offlineConfirm.type === 'removeAccount') {
        await removeAccount(offlineConfirm.account.accountId);
        hapticSuccess();
        showToast?.({
          message: `Removed ${accountLabel(offlineConfirm.account)} from this device while offline`,
          type: 'success',
        });
      }
    } catch (error) {
      hapticError();
      showToast?.({
        message: error instanceof Error ? error.message : 'Action failed',
        type: 'error',
      });
    } finally {
      setPinBusy(false);
      closeOfflineConfirm();
      refresh();
    }
  };

  const handlePinSubmit = async (values: AccountPinModalSubmit) => {
    if (!pinAction) return;

    const { mode, account } = pinAction;
    setPinBusy(true);
    try {
      if (mode === 'verify') {
        const ok = await accountPin.verifyPin(account.accountId, 'pin' in values ? values.pin : '');
        if (!ok) {
          throw new Error('PIN did not match this account.');
        }
        await switchAccount(account.accountId);
        showToast?.({
          message: `Switched to ${accountLabel(account)}`,
          type: 'success',
        });
        return;
      }

      if (mode === 'create') {
        await accountPin.setPin(account.accountId, 'pin' in values ? values.pin : '');
        dispatch({
          type: 'setPinProtectedIds',
          value: {
            ...pinProtectedIds,
            [account.accountId]: true,
          },
        });
        showToast?.({
          message: `PIN added for ${accountLabel(account)}`,
          type: 'success',
        });
        return;
      }

      if (mode === 'update') {
        const ok = await accountPin.verifyPin(
          account.accountId,
          'currentPin' in values ? values.currentPin : '',
        );
        if (!ok) {
          throw new Error('Current PIN did not match this account.');
        }
        await accountPin.setPin(account.accountId, 'nextPin' in values ? values.nextPin : '');
        dispatch({
          type: 'setPinProtectedIds',
          value: {
            ...pinProtectedIds,
            [account.accountId]: true,
          },
        });
        showToast?.({
          message: `PIN updated for ${accountLabel(account)}`,
          type: 'success',
        });
        return;
      }

      if (mode === 'remove') {
        const ok = await accountPin.verifyPin(account.accountId, 'pin' in values ? values.pin : '');
        if (!ok) {
          throw new Error('PIN did not match this account.');
        }
        await accountPin.removePin(account.accountId);
        dispatch({
          type: 'setPinProtectedIds',
          value: {
            ...pinProtectedIds,
            [account.accountId]: false,
          },
        });
        await removeAccount(account.accountId);
        showToast?.({
          message: `Removed ${accountLabel(account)} from this device`,
          type: 'success',
        });
        return;
      }
    } catch (error) {
      hapticError();
      showToast?.({
        message: error instanceof Error ? error.message : 'Action failed',
        type: 'error',
      });
    } finally {
      setPinBusy(false);
      dispatch({ type: 'setPinAction', value: null });
      refresh();
    }
  };

  const offlineTitle =
    offlineConfirm?.type === 'signOutAll'
      ? 'Sign out all while offline?'
      : offlineConfirm?.type === 'removeAccount'
        ? 'Remove account while offline?'
        : 'Sign out while offline?';

  const offlineBody =
    offlineConfirm?.type === 'signOutAll'
      ? 'This will remove all remembered accounts from this device immediately. Because there is no internet connection, you may not be able to sign back in until connectivity returns.'
      : offlineConfirm?.type === 'removeAccount'
        ? `This will remove ${accountLabel(offlineConfirm.account)} from this device immediately. Because there is no internet connection, adding the account back may require waiting until connectivity returns.`
        : 'This will remove the current account from this device immediately. Because there is no internet connection, you may not be able to sign back in until connectivity returns.';

  const offlineFooter = (
    <HStack className="w-full gap-3">
      <Box className="flex-1">
        <Button className="rounded-2xl" variant="outline" onPress={closeOfflineConfirm}>
          <ButtonText>Stay here</ButtonText>
        </Button>
      </Box>
      <Box className="flex-[1.4]">
        <Button
          className="rounded-2xl"
          action="negative"
          onPress={() => {
            void confirmOfflineAction();
          }}
          isDisabled={pinBusy}
        >
          <ButtonText>{pinBusy ? 'Working…' : 'Continue offline'}</ButtonText>
        </Button>
      </Box>
    </HStack>
  );

  return (
    <Box
      className={`rounded-[28px] border border-phase-border bg-phase-surface ${compact ? 'p-4' : 'p-5'}`}
    >
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
              No remembered accounts are stored on this device yet.
            </Text>
          </Box>
        ) : (
          <VStack className="gap-3">
            <HStack className="flex-wrap gap-2">
              <Button
                className="rounded-2xl"
                variant="outline"
                onPress={() => {
                  void handleSignOutCurrent();
                }}
                isDisabled={pinBusy || !activeAccountId}
              >
                <ButtonText>Sign out current</ButtonText>
              </Button>
              <Button
                className="rounded-2xl"
                variant="outline"
                action="negative"
                onPress={() => {
                  void handleSignOutAll();
                }}
                isDisabled={pinBusy || accounts.length === 0}
              >
                <ButtonText>Sign out all on this device</ButtonText>
              </Button>
            </HStack>

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
                      <Text className="text-sm font-bold text-phase-primary">
                        {getInitials(account.fullName, account.email)}
                      </Text>
                    </Box>
                    <VStack className="flex-1 gap-1">
                      <HStack className="items-center gap-2">
                        <Text className="text-base font-semibold text-phase-primary">
                          {account.fullName || account.email || account.accountId}
                        </Text>
                        {isActive ? (
                          <Box className="rounded-full bg-phase-primary px-2 py-1">
                            <Text className="text-[10px] font-bold uppercase text-white">
                              Active
                            </Text>
                          </Box>
                        ) : null}
                      </HStack>
                      <Text className="text-sm text-phase-secondary">
                        {account.email || 'No email saved'}
                      </Text>
                      <Text className="text-xs text-phase-secondary">
                        {pinProtectedIds[account.accountId]
                          ? 'PIN protected on this device'
                          : 'No local PIN yet'}
                      </Text>
                      <Text className="text-xs text-phase-secondary">
                        This remembered account may belong to a different person than the currently active one.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack className="mt-4 gap-2">
                    {!isActive ? (
                      <Button
                        className="flex-1 rounded-2xl"
                        variant="outline"
                        onPress={() => {
                          void handleSwitch(account);
                        }}
                        isDisabled={busy}
                      >
                        <ButtonText>Switch</ButtonText>
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 rounded-2xl"
                        variant="outline"
                        onPress={() => {
                          askForPin(
                            pinProtectedIds[account.accountId] ? 'update' : 'create',
                            account,
                          );
                        }}
                        isDisabled={busy}
                      >
                        <ButtonText>
                          {pinProtectedIds[account.accountId] ? 'Change PIN' : 'Set PIN'}
                        </ButtonText>
                      </Button>
                    )}
                    <Button
                      className="rounded-2xl"
                      variant="solid"
                      action="negative"
                      onPress={() => {
                        void handleRemove(account);
                      }}
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

      <SanctuaryModal
        isOpen={!!offlineConfirm}
        onClose={closeOfflineConfirm}
        title={offlineTitle}
        subtitle="Local privacy and shared-device safety happen first."
        icon={<AlertTriangle size={20} className="text-amber-500" />}
        footer={offlineFooter}
      >
        <VStack className="gap-4 py-2">
          <Text className="text-base text-phase-text-secondary">{offlineBody}</Text>
          <Box className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Text className="text-sm text-phase-text-secondary">
              The local sign-out or removal will happen now. Server security sync and audit will
              finish later when the internet connection comes back.
            </Text>
          </Box>
        </VStack>
      </SanctuaryModal>

      <AccountPinModal
        isOpen={!!pinAction}
        mode={pinAction?.mode ?? 'verify'}
        accountLabel={pinAction ? accountLabel(pinAction.account) : null}
        allowClose={!pinBusy}
        isLoading={pinBusy}
        onClose={() => {
          dispatch({ type: 'setPinAction', value: null });
        }}
        onSubmit={handlePinSubmit}
      />
    </Box>
  );
}
