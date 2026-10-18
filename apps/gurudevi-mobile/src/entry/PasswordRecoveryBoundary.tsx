import { authAPI } from '@repo/core/api/auth';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import {
  Button,
  ButtonSpinner,
  ButtonText,
  Input,
  InputField,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useCallback, useEffect, useState } from 'react';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Supabase emits PASSWORD_RECOVERY only after it has accepted a recovery link.
 * Keeping this above the route gate prevents a valid recovery session from
 * being routed into the sanctuary before its password is replaced.
 */
export function PasswordRecoveryBoundary() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const { data } = authAPI.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user && !session.user.is_anonymous) {
        setPassword('');
        setConfirmation('');
        setError(null);
        setIsOpen(true);
      }
    });
    return data.subscription.unsubscribe;
  }, []);

  const savePassword = useCallback(async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError('The two passwords do not match.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await authAPI.updatePassword(password);
      setPassword('');
      setConfirmation('');
      setIsOpen(false);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Could not save the new password.');
    } finally {
      setIsSaving(false);
    }
  }, [confirmation, password]);

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Set a new password"
      subtitle="Your recovery link is verified. Choose a new password to finish securely."
    >
      <VStack className="gap-4">
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="New password"
            autoComplete="new-password"
            onChangeText={setPassword}
            placeholder="New password"
            secureTextEntry
            value={password}
          />
        </Input>
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="Confirm new password"
            autoComplete="new-password"
            onChangeText={setConfirmation}
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmation}
          />
        </Input>
        {error ? <Text className="text-sm text-phase-danger">{error}</Text> : null}
        <Button
          className="mt-2 h-14 rounded-2xl"
          isDisabled={isSaving}
          onPress={() => void savePassword()}
        >
          {isSaving ? <ButtonSpinner /> : <ButtonText>Save new password</ButtonText>}
        </Button>
      </VStack>
    </SanctuaryModal>
  );
}
