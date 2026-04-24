import React, { useEffect, useMemo, useState } from 'react';
import { Box, HStack, Text, VStack } from '../gluestack';
import SanctuaryButton from './SanctuaryButton';
import SanctuaryInput from './SanctuaryInput';
import SanctuaryModal from './SanctuaryModal';
import { Lock, Shield, Smartphone } from 'lucide-react-native';
import { Theme } from '../theme/Theme';

export type AccountPinModalMode = 'create' | 'verify' | 'update' | 'remove';

type AccountPinModalSubmit = { pin: string } | { currentPin: string; nextPin: string };

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
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const copy = useMemo(() => getCopy(mode, accountLabel), [accountLabel, mode]);

  useEffect(() => {
    if (!isOpen) return;

    setPin('');
    setConfirmPin('');
    setCurrentPin('');
    setLocalError(null);
  }, [isOpen, mode]);

  const resolvedError = localError || error || null;

  const handleSubmit = async () => {
    const normalizedPin = pin.replace(/\s+/g, '').trim();
    const normalizedCurrentPin = currentPin.replace(/\s+/g, '').trim();

    if (mode === 'verify') {
      if (!normalizedPin) {
        setLocalError('Enter the PIN for this account.');
        return;
      }

      setLocalError(null);
      await onSubmit({ pin: normalizedPin });
      return;
    }

    if (mode === 'remove') {
      if (!normalizedCurrentPin) {
        setLocalError('Enter the current PIN first.');
        return;
      }

      setLocalError(null);
      await onSubmit({ pin: normalizedCurrentPin });
      return;
    }

    if (!/^\d{4,8}$/.test(normalizedPin)) {
      setLocalError('Use 4 to 8 digits for the app PIN.');
      return;
    }

    if (mode === 'create') {
      if (normalizedPin !== confirmPin.replace(/\s+/g, '').trim()) {
        setLocalError('The two PIN entries do not match.');
        return;
      }

      setLocalError(null);
      await onSubmit({ pin: normalizedPin });
      return;
    }

    if (!/^\d{4,8}$/.test(normalizedCurrentPin)) {
      setLocalError('Enter the current PIN before changing it.');
      return;
    }

    if (normalizedPin !== confirmPin.replace(/\s+/g, '').trim()) {
      setLocalError('The new PIN entries do not match.');
      return;
    }

    setLocalError(null);
    await onSubmit({ currentPin: normalizedCurrentPin, nextPin: normalizedPin });
  };

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
          onPress={handleSubmit}
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
            onChangeText={setPin}
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
            onChangeText={setCurrentPin}
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
            onChangeText={setConfirmPin}
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
              onChangeText={setCurrentPin}
              type="password"
              keyboardType="number-pad"
              placeholder="Current PIN"
              error={resolvedError ?? undefined}
            />
            <SanctuaryInput
              label="New PIN"
              value={pin}
              onChangeText={setPin}
              type="password"
              keyboardType="number-pad"
              placeholder="4 to 8 digits"
            />
            <SanctuaryInput
              label="Confirm new PIN"
              value={confirmPin}
              onChangeText={setConfirmPin}
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
