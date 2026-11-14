import { Button, Dialog, Text, TextField } from '@repo/ui/components/native';
import { View } from 'react-native';
import { usePasswordRecovery } from '@/entry/usePasswordRecovery';

/**
 * Supabase emits PASSWORD_RECOVERY only after it has accepted a recovery link.
 * Keeping this above the route gate prevents a valid recovery session from
 * being routed into the sanctuary before its password is replaced.
 */
export function PasswordRecoveryBoundary() {
  const recovery = usePasswordRecovery();
  const busy = recovery.pending;

  return (
    <Dialog
      open={recovery.isOpen}
      onClose={recovery.close}
      title="Set a new password"
      description="Your recovery link is verified. Verify your authenticator and choose a new password."
    >
      <View style={{ gap: 14 }}>
        <TextField
          label="New password"
          accessibilityLabel="New password"
          autoComplete="new-password"
          disabled={busy}
          onChangeText={(value: string) => recovery.edit('password', value)}
          secureTextEntry
          value={recovery.draft.password}
        />
        <TextField
          label="Confirm new password"
          accessibilityLabel="Confirm new password"
          autoComplete="new-password"
          disabled={busy}
          onChangeText={(value: string) => recovery.edit('confirmation', value)}
          secureTextEntry
          value={recovery.draft.confirmation}
        />
        <Button
          label="Load authenticators"
          variant="secondary"
          disabled={busy}
          onPress={() => void recovery.loadFactors()}
        />
        {recovery.factors.map((factor, index) => {
          const selected = recovery.factorId === factor.id;
          const name = factor.friendly_name || `Authenticator ${index + 1}`;
          return (
            <Button
              key={factor.id}
              label={selected ? `${name} (selected)` : name}
              variant={selected ? 'primary' : 'secondary'}
              disabled={busy}
              accessibilityState={{ selected, disabled: busy }}
              onPress={() => recovery.selectFactor(factor.id)}
            />
          );
        })}
        <TextField
          label="Authenticator code"
          accessibilityLabel="Authenticator code"
          placeholder="Six-digit authenticator code"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          maxLength={6}
          disabled={busy}
          value={recovery.draft.totpCode}
          onChangeText={(value: string) => recovery.edit('totpCode', value)}
        />
        <TextField
          label="Current password, if required"
          accessibilityLabel="Current password if required"
          autoComplete="current-password"
          secureTextEntry
          disabled={busy}
          value={recovery.draft.currentPassword}
          onChangeText={(value: string) => recovery.edit('currentPassword', value)}
        />
        <Button
          label="Request confirmation code"
          variant="secondary"
          disabled={busy}
          onPress={() => void recovery.requestCode()}
        />
        <TextField
          label="Confirmation code, if requested"
          accessibilityLabel="Password confirmation code if required"
          autoComplete="one-time-code"
          disabled={busy}
          value={recovery.draft.nonce}
          onChangeText={(value: string) => recovery.edit('nonce', value)}
        />
        {recovery.notice ? (
          <Text kind="body" accessibilityLiveRegion="polite">
            {recovery.notice}
          </Text>
        ) : null}
        {recovery.error ? (
          <Text kind="body" tone="danger" accessibilityLiveRegion="polite">
            {recovery.error}
          </Text>
        ) : null}
        <Button
          label="Save new password"
          variant="primary"
          size="lg"
          fullWidth
          loading={busy}
          disabled={busy}
          onPress={() => void recovery.save()}
        />
      </View>
    </Dialog>
  );
}
