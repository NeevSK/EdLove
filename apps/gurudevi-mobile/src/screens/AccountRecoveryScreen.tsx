import { Button, ErrorState, Surface, Text } from '@repo/ui/components/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface AccountRecoveryScreenProps {
  deactivatedAt: string | null;
  scheduledFor: string | null;
  isSigningOut: boolean;
  onRetry: () => void;
  onSignOut: () => void;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

/** A policy-neutral screen for a server-confirmed inactive account, on the world's floor. */
export function AccountRecoveryScreen({
  deactivatedAt,
  scheduledFor,
  isSigningOut,
  onRetry,
  onSignOut,
}: AccountRecoveryScreenProps) {
  const deactivatedDate = formatDate(deactivatedAt);
  const scheduledDate = formatDate(scheduledFor);

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Surface tone="raised" style={styles.card}>
          <ErrorState
            title="This account is unavailable"
            message="Your account is not available for app access right now. This screen has not deleted any data."
          />
          {deactivatedDate || scheduledDate ? (
            <View style={styles.dates}>
              {deactivatedDate ? (
                <Text kind="caption" tone="soft" align="center" selectable>
                  Access was paused on {deactivatedDate}.
                </Text>
              ) : null}
              {scheduledDate ? (
                <Text kind="caption" tone="soft" align="center" selectable>
                  A server-managed lifecycle review is scheduled for {scheduledDate}.
                </Text>
              ) : null}
            </View>
          ) : null}
          <View style={styles.actions}>
            <Button
              label="Try again"
              variant="secondary"
              accessibilityLabel="Retry restoring account status"
              onPress={onRetry}
            />
            <Button
              label={isSigningOut ? 'Signing out…' : 'Sign out on this device'}
              variant="primary"
              loading={isSigningOut}
              disabled={isSigningOut}
              onPress={onSignOut}
            />
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 20, padding: 24 },
  dates: { gap: 6 },
  actions: { gap: 12 },
});
