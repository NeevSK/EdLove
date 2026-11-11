/**
 * The app PIN, asked on the world's own dialog: set it, enter it, change it or remove it. Same
 * rules and words as the shared PIN modal, drawn by the kit (the world's surface, fields, buttons
 * and motion), so the gateway never drops out of the world the person chose.
 */

import type {
  AccountPinModalMode,
  AccountPinModalSubmit,
} from '@repo/ui/components/AccountPinModal';
import { Button, Dialog, TextField } from '@repo/ui/components/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export interface AccountPinDialogProps {
  isOpen: boolean;
  mode: AccountPinModalMode;
  onClose: () => void;
  onSubmit: (values: AccountPinModalSubmit) => Promise<void> | void;
  accountLabel?: string | null;
  isLoading?: boolean;
  error?: string | null;
  allowClose?: boolean;
}

const COPY: Readonly<
  Record<
    AccountPinModalMode,
    { title: string; describe: (label: string) => string; submit: string }
  >
> = {
  create: {
    title: 'Set app PIN',
    describe: (l) =>
      `Add a simple PIN for ${l} on this device. This protects switching and re-opening, but it does not encrypt local storage yet.`,
    submit: 'Save PIN',
  },
  verify: {
    title: 'Enter app PIN',
    describe: (l) => `Enter the PIN for ${l} before Gurudevi opens that account on this device.`,
    submit: 'Unlock',
  },
  update: {
    title: 'Change app PIN',
    describe: (l) =>
      `Update the device PIN for ${l}. This is still phase 1 prototype protection, not encrypted vault recovery.`,
    submit: 'Update PIN',
  },
  remove: {
    title: 'Remove app PIN',
    describe: (l) =>
      `Enter the current PIN for ${l} to remove device-level protection from this shared device.`,
    submit: 'Remove PIN',
  },
};

const clean = (v: string) => v.replace(/\s+/g, '').trim();

/** What to submit, or why not: the PIN rules in one pure place. */
export function checkPin(
  mode: AccountPinModalMode,
  entry: { pin: string; confirmPin: string; currentPin: string },
): { ok: AccountPinModalSubmit } | { error: string } {
  const pin = clean(entry.pin);
  const current = clean(entry.currentPin);
  const confirm = clean(entry.confirmPin);
  if (mode === 'verify') {
    return pin ? { ok: { pin } } : { error: 'Enter the PIN for this account.' };
  }
  if (mode === 'remove') {
    return current ? { ok: { pin: current } } : { error: 'Enter the current PIN first.' };
  }
  if (!/^\d{4,8}$/.test(pin)) return { error: 'Use 4 to 8 digits for the app PIN.' };
  if (mode === 'create') {
    return pin === confirm ? { ok: { pin } } : { error: 'The two PIN entries do not match.' };
  }
  if (!/^\d{4,8}$/.test(current)) return { error: 'Enter the current PIN before changing it.' };
  if (pin !== confirm) return { error: 'The new PIN entries do not match.' };
  return { ok: { currentPin: current, nextPin: pin } };
}

export function AccountPinDialog({
  isOpen,
  mode,
  onClose,
  onSubmit,
  accountLabel,
  isLoading = false,
  error,
  allowClose = true,
}: AccountPinDialogProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPin('');
    setConfirmPin('');
    setCurrentPin('');
    setLocalError(null);
  }, [isOpen]);

  const copy = COPY[mode];
  const shown = localError || error || undefined;
  const submit = () => {
    const result = checkPin(mode, { pin, confirmPin, currentPin });
    if ('error' in result) {
      setLocalError(result.error);
      return;
    }
    setLocalError(null);
    void onSubmit(result.ok);
  };

  const pinField = (label: string, value: string, set: (v: string) => void, err?: string) => (
    <TextField
      label={label}
      value={value}
      onChangeText={set}
      secureTextEntry
      keyboardType="number-pad"
      autoComplete="off"
      maxLength={8}
      placeholder="4 to 8 digits"
      error={err}
      onSubmitEditing={submit}
    />
  );

  return (
    <Dialog
      open={isOpen}
      onClose={allowClose ? onClose : () => undefined}
      dismissable={allowClose}
      title={copy.title}
      description={copy.describe(accountLabel || 'this account')}
      actions={
        <>
          {allowClose ? (
            <Button label="Cancel" variant="quiet" disabled={isLoading} onPress={onClose} />
          ) : null}
          <Button
            label={isLoading ? 'Working…' : copy.submit}
            variant={mode === 'remove' ? 'danger' : 'primary'}
            loading={isLoading}
            onPress={submit}
          />
        </>
      }
    >
      <View style={{ gap: 14 }}>
        {mode === 'update' || mode === 'remove'
          ? pinField(
              'Current PIN',
              currentPin,
              setCurrentPin,
              mode === 'remove' ? shown : undefined,
            )
          : null}
        {mode !== 'remove'
          ? pinField(
              mode === 'verify' ? 'PIN' : 'New PIN',
              pin,
              setPin,
              mode === 'verify' ? shown : undefined,
            )
          : null}
        {mode === 'create' || mode === 'update'
          ? pinField('Confirm PIN', confirmPin, setConfirmPin, shown)
          : null}
      </View>
    </Dialog>
  );
}
