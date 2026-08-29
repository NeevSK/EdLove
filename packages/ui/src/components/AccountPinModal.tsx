import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryInput from '@repo/ui/components/SanctuaryInput';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { Lock, Shield, Smartphone } from '@repo/ui/icons';
import { Theme } from '@repo/ui/theme/Theme';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

export type AccountPinModalMode = 'create' | 'verify' | 'update' | 'remove';

export type AccountPinModalSubmit = { pin: string } | { currentPin: string; nextPin: string };

interface AccountPinModalProps {
  isOpen: boolean;
  mode: AccountPinModalMode;
  onClose: () => void;
  onSubmit: (values: AccountPinModalSubmit) => Promise<void> | void;
  accountLabel?: string | null;
  isLoading?: boolean;
  error?: string | null;
  allowClose?: boolean;
}

function getCopy(mode: AccountPinModalMode, accountLabel?: string | null) {
  const label = accountLabel || 'this account';

  switch (mode) {
    case 'create':
      return {
        title: 'Set app PIN',
        icon: <Shield color={Theme.colors.sanctuarySaffron} size={20} />,
        description: `Add a simple PIN for ${label} on this device. This protects switching and re-opening, but it does not encrypt local storage yet.`,
        submitLabel: 'Save PIN',
      };
    case 'verify':
      return {
        title: 'Enter app PIN',
        icon: <Lock color={Theme.colors.sanctuarySaffron} size={20} />,
        description: `Enter the PIN for ${label} before Gurudevi opens that account on this device.`,
        submitLabel: 'Unlock',
      };
    case 'update':
      return {
        title: 'Change app PIN',
        icon: <Smartphone color={Theme.colors.sanctuarySaffron} size={20} />,
        description: `Update the device PIN for ${label}. This is still phase 1 prototype protection, not encrypted vault recovery.`,
        submitLabel: 'Update PIN',
      };
    case 'remove':
      return {
        title: 'Remove app PIN',
        icon: <Shield color={Theme.colors.error} size={20} />,
        description: `Enter the current PIN for ${label} to remove device-level protection from this shared device.`,
        submitLabel: 'Remove PIN',
      };
    default:
      return {
        title: 'App PIN',
        icon: <Lock color={Theme.colors.sanctuarySaffron} size={20} />,
        description: '',
        submitLabel: 'Continue',
      };
  }
}

interface PinState {
  pin: string;
  confirmPin: string;
  currentPin: string;
  localError: string | null;
}

type PinAction =
  | { type: 'SET_PIN'; pin: string }
  | { type: 'SET_CONFIRM_PIN'; pin: string }
  | { type: 'SET_CURRENT_PIN'; pin: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

function pinReducer(state: PinState, action: PinAction): PinState {
  switch (action.type) {
    case 'SET_PIN':
      return { ...state, pin: action.pin };
    case 'SET_CONFIRM_PIN':
      return { ...state, confirmPin: action.pin };
    case 'SET_CURRENT_PIN':
      return { ...state, currentPin: action.pin };
    case 'SET_ERROR':
      return { ...state, localError: action.error };
    case 'RESET':
      return { pin: '', confirmPin: '', currentPin: '', localError: null };
    default:
      return state;
  }
}

export default function AccountPinModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  accountLabel,
  isLoading = false,
  error,
  allowClose = true,
}: AccountPinModalProps) {
  const [state, dispatch] = useReducer(pinReducer, {
    pin: '',
    confirmPin: '',
    currentPin: '',
    localError: null,
  });

  const { pin, confirmPin, currentPin, localError } = state;

  const copy = useMemo(() => getCopy(mode, accountLabel), [accountLabel, mode]);

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET' });
    }
  }, [isOpen]);

  const resolvedError = localError || error || null;

  const handleSubmit = useCallback(async () => {
    const normalizedPin = pin.replace(/\s+/g, '').trim();
    const normalizedCurrentPin = currentPin.replace(/\s+/g, '').trim();

    if (mode === 'verify') {
      if (!normalizedPin) {
        dispatch({ type: 'SET_ERROR', error: 'Enter the PIN for this account.' });
        return;
      }

      dispatch({ type: 'SET_ERROR', error: null });
      await onSubmit({ pin: normalizedPin });
      return;
    }

    if (mode === 'remove') {
      if (!normalizedCurrentPin) {
        dispatch({ type: 'SET_ERROR', error: 'Enter the current PIN first.' });
        return;
      }

      dispatch({ type: 'SET_ERROR', error: null });
      await onSubmit({ pin: normalizedCurrentPin });
      return;
    }

    if (!/^\d{4,8}$/.test(normalizedPin)) {
      dispatch({ type: 'SET_ERROR', error: 'Use 4 to 8 digits for the app PIN.' });
      return;
    }

    if (mode === 'create') {
      if (normalizedPin !== confirmPin.replace(/\s+/g, '').trim()) {
        dispatch({ type: 'SET_ERROR', error: 'The two PIN entries do not match.' });
        return;
      }

      dispatch({ type: 'SET_ERROR', error: null });
      await onSubmit({ pin: normalizedPin });
      return;
    }

    if (!/^\d{4,8}$/.test(normalizedCurrentPin)) {
      dispatch({ type: 'SET_ERROR', error: 'Enter the current PIN before changing it.' });
      return;
    }

    if (normalizedPin !== confirmPin.replace(/\s+/g, '').trim()) {
      dispatch({ type: 'SET_ERROR', error: 'The new PIN entries do not match.' });
      return;
    }

    dispatch({ type: 'SET_ERROR', error: null });
    await onSubmit({
      currentPin: normalizedCurrentPin,
      nextPin: normalizedPin,
    });
  }, [mode, pin, currentPin, confirmPin, onSubmit]);

  const footer = (
    <HStack className="w-full gap-3">
      {allowClose ? (
        <Box className="flex-1">
          <SanctuaryButton
            variant="ghost"
            action="secondary"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </SanctuaryButton>
        </Box>
      ) : null}
      <Box className={allowClose ? 'flex-[1.5]' : 'flex-1'}>
        <SanctuaryButton
          action={mode === 'remove' ? 'negative' : 'primary'}
          onPress={() => {
            void handleSubmit();
          }}
          isLoading={isLoading}
        >
          {isLoading ? 'Working...' : copy.submitLabel}
        </SanctuaryButton>
      </Box>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={allowClose ? onClose : () => {}}
      title={copy.title}
      icon={copy.icon}
      footer={footer}
      className="text-md"
    >
      <VStack className="py-2 gap-4">
        <Text className="text-phase-text-secondary text-base">{copy.description}</Text>

        {mode === 'verify' || mode === 'create' ? (
          <SanctuaryInput
            label={mode === 'verify' ? 'PIN' : 'New PIN'}
            value={pin}
            onChangeText={(text) => dispatch({ type: 'SET_PIN', pin: text })}
            type="password"
            keyboardType="number-pad"
            placeholder="4 to 8 digits"
            error={resolvedError ?? undefined}
          />
        ) : null}

        {mode === 'remove' ? (
          <SanctuaryInput
            label="Current PIN"
            value={currentPin}
            onChangeText={(text) => dispatch({ type: 'SET_CURRENT_PIN', pin: text })}
            type="password"
            keyboardType="number-pad"
            placeholder="Enter current PIN"
            error={resolvedError ?? undefined}
          />
        ) : null}

        {mode === 'create' ? (
          <SanctuaryInput
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={(text) => dispatch({ type: 'SET_CONFIRM_PIN', pin: text })}
            type="password"
            keyboardType="number-pad"
            placeholder="Enter it again"
          />
        ) : null}

        {mode === 'update' ? (
          <>
            <SanctuaryInput
              label="Current PIN"
              value={currentPin}
              onChangeText={(text) => dispatch({ type: 'SET_CURRENT_PIN', pin: text })}
              type="password"
              keyboardType="number-pad"
              placeholder="Current PIN"
              error={resolvedError ?? undefined}
            />
            <SanctuaryInput
              label="New PIN"
              value={pin}
              onChangeText={(text) => dispatch({ type: 'SET_PIN', pin: text })}
              type="password"
              keyboardType="number-pad"
              placeholder="4 to 8 digits"
            />
            <SanctuaryInput
              label="Confirm new PIN"
              value={confirmPin}
              onChangeText={(text) => dispatch({ type: 'SET_CONFIRM_PIN', pin: text })}
              type="password"
              keyboardType="number-pad"
              placeholder="Enter it again"
            />
          </>
        ) : null}

        <Box className="bg-phase-accent/10 p-4 rounded-xl border border-phase-accent/20">
          <Text className="text-phase-text-secondary text-sm">
            Phase 1 note: this PIN controls access flow on this device. It is not yet full offline
            vault encryption.
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
