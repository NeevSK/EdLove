import { BrandedErrorState } from '@repo/ui';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Text, View, Pressable } from '@repo/ui/primitives';

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

/** A policy-neutral screen for a server-confirmed inactive account. */
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
    <ScreenWrapper title="Account status" scroll>
      <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 48, gap: 24 }}>
        <BrandedErrorState
          title="This account is unavailable"
          message="Your account is not available for app access right now. This screen has not deleted any data."
        />

        <View style={{ gap: 8 }}>
          {deactivatedDate ? (
            <Text selectable style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
              Access was paused on {deactivatedDate}.
            </Text>
          ) : null}
          {scheduledDate ? (
            <Text selectable style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
              A server-managed lifecycle review is scheduled for {scheduledDate}.
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry restoring account status"
          onPress={onRetry}
          style={{ alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20 }}
        >
          <Text style={{ color: '#D4843A', fontSize: 16, fontWeight: '700' }}>Try again</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out on this device"
          accessibilityState={{ disabled: isSigningOut }}
          disabled={isSigningOut}
          onPress={onSignOut}
          style={{
            alignSelf: 'center',
            backgroundColor: '#D4843A',
            borderRadius: 12,
            opacity: isSigningOut ? 0.6 : 1,
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            {isSigningOut ? 'Signing out…' : 'Sign out on this device'}
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
