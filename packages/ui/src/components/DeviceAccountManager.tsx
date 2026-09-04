import { useAccountLifecycle } from '@repo/core/hooks';
import {
  type AccountLifecycleCommand,
  accountPin,
  type DeviceAccountRecord,
  useDeviceAccounts,
} from '@repo/core/logic';
import AccountPinModal, {
  type AccountPinModalMode,
  type AccountPinModalSubmit,
} from '@repo/ui/components/AccountPinModal';
import { Key, UserMinus, Users } from '@repo/ui/icons';
import { Box, Button, ButtonText, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { hapticError, hapticSuccess } from '@repo/ui/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Platform, StyleSheet } from 'react-native';

// ── Types & Reducer ──────────────────────────────────────────────────────────

type PendingPinAction = {
  mode: AccountPinModalMode;
  account: DeviceAccountRecord;
} | null;

type State = {
  pinProtectedIds: Record<string, boolean>;
  pinAction: PendingPinAction;
  pinBusy: boolean;
  pinError: string | null;
};

type Action =
  | { type: 'setPinProtectedIds'; value: Record<string, boolean> }
  | { type: 'setPinAction'; value: PendingPinAction }
  | { type: 'setPinBusy'; value: boolean }
  | { type: 'setPinError'; value: string | null };

const initialState: State = {
  pinProtectedIds: {},
  pinAction: null,
  pinBusy: false,
  pinError: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setPinProtectedIds':
      return { ...state, pinProtectedIds: action.value };
    case 'setPinAction':
      return { ...state, pinAction: action.value, pinError: null };
    case 'setPinBusy':
      return { ...state, pinBusy: action.value };
    case 'setPinError':
      return { ...state, pinError: action.value };
    default:
      return state;
  }
}

// ── Utils ───────────────────────────────────────────────────────────────────

const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
  const source = name || email || 'A';
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || 'A'
  );
};

function getActionError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

type DeviceAccountRow =
  | { type: 'LOADING' }
  | { type: 'EMPTY' }
  | {
      type: 'ACCOUNT';
      account: DeviceAccountRecord;
      isActive: boolean;
      isPinProtected: boolean;
    };

// ── Row Components ──────────────────────────────────────────────────────────

const AccountCard = React.memo(
  ({
    account,
    isActive,
    isPinProtected,
    supportsPin,
    onSwitch,
    onRemove,
    onPinAction,
    busy,
  }: {
    account: DeviceAccountRecord;
    isActive: boolean;
    isPinProtected: boolean;
    supportsPin: boolean;
    onSwitch: (a: DeviceAccountRecord) => void;
    onRemove: (a: DeviceAccountRecord) => void;
    onPinAction: (mode: AccountPinModalMode, a: DeviceAccountRecord) => void;
    busy: boolean;
  }) => (
    <Box
      className={`rounded-[24px] border p-4 shadow-sm transition-all ${isActive ? 'border-phase-primary bg-phase-world' : 'border-phase-border bg-phase-surface'}`}
    >
      <HStack className="items-start gap-4">
        <Box className="h-12 w-12 items-center justify-center rounded-[18px] bg-phase-accent/10 border border-phase-border">
          <Text className="text-sm font-bold text-phase-primary">
            {getInitials(account.displayName ?? '', account.email)}
          </Text>
        </Box>
        <VStack className="flex-1 gap-1">
          <HStack className="items-center gap-2">
            <Text className="text-base font-bold text-phase-primary" numberOfLines={1}>
              {account.displayName || account.email || 'Anonymous'}
            </Text>
            {isActive && (
              <Box className="rounded-full bg-phase-primary px-2 py-0.5">
                <Text className="text-[10px] font-bold uppercase text-white">Active</Text>
              </Box>
            )}
          </HStack>
          <Text className="text-xs text-phase-secondary opacity-70" numberOfLines={1}>
            {account.email || 'Cloud Identity'}
          </Text>
          <HStack className="items-center gap-1.5 mt-1">
            {supportsPin && isPinProtected ? (
              <HStack className="items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Key size={10} className="text-emerald-600" />
                <Text className="text-[10px] font-bold text-emerald-600 uppercase">
                  PIN Encrypted
                </Text>
              </HStack>
            ) : supportsPin ? (
              <HStack className="items-center gap-1 bg-phase-surface px-2 py-0.5 rounded-full border border-phase-border">
                <Text className="text-[10px] font-bold text-phase-secondary uppercase opacity-50">
                  Local Only
                </Text>
              </HStack>
            ) : null}
          </HStack>
        </VStack>
      </HStack>

      <HStack className="mt-5 gap-3">
        {!isActive ? (
          <Button
            className="flex-1 rounded-2xl h-10"
            variant="outline"
            onPress={() => onSwitch(account)}
            isDisabled={busy}
          >
            <ButtonText className="text-sm">Switch</ButtonText>
          </Button>
        ) : supportsPin ? (
          <Button
            className="flex-1 rounded-2xl h-10"
            variant="outline"
            onPress={() => onPinAction(isPinProtected ? 'update' : 'create', account)}
            isDisabled={busy}
          >
            <ButtonText className="text-sm">{isPinProtected ? 'Change PIN' : 'Add PIN'}</ButtonText>
          </Button>
        ) : null}
        <Button
          className="rounded-2xl h-10 px-4"
          variant="solid"
          action="negative"
          onPress={() => onRemove(account)}
          isDisabled={busy}
        >
          <UserMinus size={16} color="white" />
        </Button>
      </HStack>
    </Box>
  ),
);

// ── Main Component ──────────────────────────────────────────────────────────

export default function DeviceAccountManager({ compact = false }: { compact?: boolean }) {
  const {
    accounts,
    activeAccountId,
    busyAccountId,
    loading,
    switchAccount,
    removeAccount,
    signOutCurrentAccount,
    refresh,
  } = useDeviceAccounts();

  const executeLifecycle = useCallback(
    async (command: AccountLifecycleCommand) => {
      if (command.kind !== 'sign-out-current-device') {
        throw new Error('Unsupported account lifecycle action.');
      }
      return signOutCurrentAccount();
    },
    [signOutCurrentAccount],
  );
  const { run: runLifecycle, isPending: lifecyclePending } = useAccountLifecycle(executeLifecycle);

  const { showToast } = useSanctuaryToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { pinProtectedIds, pinAction, pinBusy, pinError } = state;
  const supportsPin = Platform.OS !== 'web';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        accounts.map(async (a) => [a.accountId, await accountPin.hasPin(a.accountId)] as const),
      );
      if (cancelled) return;
      dispatch({ type: 'setPinProtectedIds', value: Object.fromEntries(entries) });
    })();
    return () => {
      cancelled = true;
    };
  }, [accounts]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const setPinBusy = (value: boolean) => dispatch({ type: 'setPinBusy', value });

  const handleSignOutCurrent = async () => {
    const result = await runLifecycle({ kind: 'sign-out-current-device' });
    if (result?.phase === 'completed') {
      hapticSuccess();
      showToast?.({ message: 'Identity detached from device.', type: 'success' });
    } else if (result?.phase === 'failed') {
      hapticError();
      showToast?.({ message: result.error || 'Sign out failed.', type: 'error' });
    } else if (result?.phase === 'unsupported') {
      hapticError();
      showToast?.({ message: result.reason, type: 'error' });
    }
  };

  const handleRemove = async (account: DeviceAccountRecord) => {
    if (pinProtectedIds[account.accountId]) {
      dispatch({ type: 'setPinAction', value: { mode: 'remove', account } });
      return;
    }

    try {
      await removeAccount(account.accountId);
      hapticSuccess();
      showToast?.({ message: 'Identity removed from this device.', type: 'success' });
    } catch (error) {
      hapticError();
      showToast?.({
        message: getActionError(error, 'Could not remove this identity.'),
        type: 'error',
      });
    }
  };

  const handleSwitch = async (account: DeviceAccountRecord) => {
    if (pinProtectedIds[account.accountId]) {
      dispatch({ type: 'setPinAction', value: { mode: 'verify', account } });
      return;
    }
    setPinBusy(true);
    try {
      await switchAccount(account.accountId);
      hapticSuccess();
    } catch (error) {
      hapticError();
      showToast?.({ message: getActionError(error, 'Could not switch identity.'), type: 'error' });
    } finally {
      setPinBusy(false);
    }
  };

  const handlePinSubmit = async (values: AccountPinModalSubmit) => {
    if (!pinAction) return;

    const { account, mode } = pinAction;
    setPinBusy(true);
    dispatch({ type: 'setPinError', value: null });

    try {
      if (mode === 'verify') {
        if (!('pin' in values) || !(await accountPin.verifyPin(account.accountId, values.pin))) {
          throw new Error('That PIN does not match this identity.');
        }
        await switchAccount(account.accountId);
      } else if (mode === 'create') {
        if (!('pin' in values)) throw new Error('A new PIN is required.');
        await accountPin.setPin(account.accountId, values.pin);
      } else if (mode === 'update') {
        if (!('currentPin' in values)) throw new Error('The current and new PIN are required.');
        if (!(await accountPin.verifyPin(account.accountId, values.currentPin))) {
          throw new Error('That PIN does not match this identity.');
        }
        await accountPin.setPin(account.accountId, values.nextPin);
      } else {
        if (!('pin' in values) || !(await accountPin.verifyPin(account.accountId, values.pin))) {
          throw new Error('That PIN does not match this identity.');
        }
        await removeAccount(account.accountId);
      }

      hapticSuccess();
      dispatch({ type: 'setPinAction', value: null });
      await refresh();
    } catch (error) {
      hapticError();
      dispatch({
        type: 'setPinError',
        value: getActionError(error, 'Could not complete the PIN action.'),
      });
    } finally {
      setPinBusy(false);
    }
  };

  // ── Row Orchestrator ──────────────────────────────────────────────────────

  const rows = useMemo<DeviceAccountRow[]>(() => {
    if (loading) return [{ type: 'LOADING' }];
    const items: DeviceAccountRow[] = [];

    if (accounts.length === 0) {
      items.push({ type: 'EMPTY' });
    } else {
      accounts.forEach((account) => {
        items.push({
          type: 'ACCOUNT',
          account,
          isActive: account.accountId === activeAccountId,
          isPinProtected: supportsPin && !!pinProtectedIds[account.accountId],
        });
      });
    }

    return items;
  }, [loading, accounts, activeAccountId, pinProtectedIds, supportsPin]);

  return (
    <Box
      className={`rounded-[32px] border border-phase-border bg-phase-surface overflow-hidden ${compact ? 'p-1' : 'p-2'}`}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.03)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <VStack className={`gap-5 ${compact ? 'p-3' : 'p-5'}`}>
        <HStack className="items-center justify-between">
          <VStack className="gap-0.5">
            <Heading className="text-xl font-bold tracking-tight text-phase-primary">
              Identity Manager
            </Heading>
            <Text className="text-xs font-medium text-phase-secondary opacity-70">
              LOCAL ACCOUNT PERSISTENCE
            </Text>
          </VStack>
          <Box className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
            <Users size={20} color="white" />
          </Box>
        </HStack>

        <Text className="text-sm leading-relaxed text-phase-secondary mb-2">
          These identities are remembered on this device. You can securely switch between them or
          apply local PIN protection.
        </Text>

        <VStack className="gap-4">
          {rows.map((row, _idx) => {
            if (row.type === 'LOADING')
              return (
                <Text key="L" className="text-sm opacity-50">
                  Fetching vault...
                </Text>
              );
            if (row.type === 'EMPTY')
              return (
                <Text key="E" className="text-sm italic opacity-40 py-4 text-center">
                  No identities stored locally.
                </Text>
              );
            if (row.type === 'ACCOUNT')
              return (
                <AccountCard
                  key={row.account.accountId}
                  account={row.account}
                  isActive={row.isActive}
                  isPinProtected={row.isPinProtected}
                  supportsPin={supportsPin}
                  onSwitch={(a) => {
                    void handleSwitch(a);
                  }}
                  onRemove={(a) => {
                    void handleRemove(a);
                  }}
                  onPinAction={(mode, account) =>
                    dispatch({ type: 'setPinAction', value: { mode, account } })
                  }
                  busy={busyAccountId === row.account.accountId || pinBusy || lifecyclePending}
                />
              );
            return null;
          })}
        </VStack>

        {accounts.length > 0 && (
          <Button
            variant="outline"
            className="rounded-2xl mt-2"
            onPress={() => {
              void handleSignOutCurrent();
            }}
            isDisabled={pinBusy || lifecyclePending || !activeAccountId}
          >
            <ButtonText>Sign Out Current</ButtonText>
          </Button>
        )}
      </VStack>

      <AccountPinModal
        isOpen={!!pinAction}
        mode={pinAction?.mode ?? 'verify'}
        accountLabel={pinAction?.account.displayName || pinAction?.account.email}
        allowClose={!pinBusy}
        isLoading={pinBusy}
        error={pinError}
        onClose={() => dispatch({ type: 'setPinAction', value: null })}
        onSubmit={handlePinSubmit}
      />
    </Box>
  );
}
