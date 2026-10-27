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
import { usePasswordRecovery } from '@/entry/usePasswordRecovery';

/**
 * Supabase emits PASSWORD_RECOVERY only after it has accepted a recovery link.
 * Keeping this above the route gate prevents a valid recovery session from
 * being routed into the sanctuary before its password is replaced.
 */
export function PasswordRecoveryBoundary() {
  const recovery = usePasswordRecovery();

  return (
    <SanctuaryModal
      isOpen={recovery.isOpen}
      onClose={recovery.close}
      title="Set a new password"
      subtitle="Your recovery link is verified. Verify your authenticator and choose a new password."
    >
      <VStack className="gap-4">
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="New password"
            autoComplete="new-password"
            editable={!recovery.pending}
            onChangeText={(value: string) => recovery.edit('password', value)}
            placeholder="New password"
            secureTextEntry
            value={recovery.draft.password}
          />
        </Input>
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="Confirm new password"
            autoComplete="new-password"
            editable={!recovery.pending}
            onChangeText={(value: string) => recovery.edit('confirmation', value)}
            placeholder="Confirm new password"
            secureTextEntry
            value={recovery.draft.confirmation}
          />
        </Input>
        <Button isDisabled={recovery.pending} onPress={() => void recovery.loadFactors()}>
          <ButtonText>Load authenticators</ButtonText>
        </Button>
        {recovery.factors.map((factor, index) => (
          <Button
            key={factor.id}
            isDisabled={recovery.pending}
            onPress={() => recovery.selectFactor(factor.id)}
            accessibilityState={{ selected: recovery.factorId === factor.id }}
          >
            <ButtonText>
              {factor.friendly_name || `Authenticator ${index + 1}`}
              {recovery.factorId === factor.id ? ' (selected)' : ''}
            </ButtonText>
          </Button>
        ))}
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="Authenticator code"
            placeholder="Six-digit authenticator code"
            autoComplete="one-time-code"
            keyboardType="number-pad"
            maxLength={6}
            editable={!recovery.pending}
            value={recovery.draft.totpCode}
            onChangeText={(value: string) => recovery.edit('totpCode', value)}
          />
        </Input>
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="Current password if required"
            placeholder="Current password, if required"
            autoComplete="current-password"
            secureTextEntry
            editable={!recovery.pending}
            value={recovery.draft.currentPassword}
            onChangeText={(value: string) => recovery.edit('currentPassword', value)}
          />
        </Input>
        <Button isDisabled={recovery.pending} onPress={() => void recovery.requestCode()}>
          <ButtonText>Request confirmation code</ButtonText>
        </Button>
        <Input className="rounded-xl border-phase-border bg-phase-surface">
          <InputField
            accessibilityLabel="Password confirmation code if required"
            placeholder="Confirmation code, if requested"
            autoComplete="one-time-code"
            editable={!recovery.pending}
            value={recovery.draft.nonce}
            onChangeText={(value: string) => recovery.edit('nonce', value)}
          />
        </Input>
        {recovery.notice ? <Text accessibilityLiveRegion="polite">{recovery.notice}</Text> : null}
        {recovery.error ? (
          <Text className="text-sm text-phase-danger" accessibilityLiveRegion="polite">
            {recovery.error}
          </Text>
        ) : null}
        <Button
          className="mt-2 h-14 rounded-2xl"
          isDisabled={recovery.pending}
          onPress={() => void recovery.save()}
        >
          {recovery.pending ? <ButtonSpinner /> : <ButtonText>Save new password</ButtonText>}
        </Button>
      </VStack>
    </SanctuaryModal>
  );
}
