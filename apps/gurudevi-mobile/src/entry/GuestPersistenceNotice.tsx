import { isLocalOnlyIdentity } from '@repo/core/logic';
import {
  dismissGuestLeaseReminder,
  type GuestLeaseStatus,
  getOrCreateGuestLease,
} from '@repo/core/native';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { Button, IconButton, Surface, Text } from '@repo/ui/components/native';
import { X } from '@repo/ui/icons';
import type { KitIconProps } from '@repo/ui/theme';
import { usePathname } from 'expo-router';
import { type ComponentType, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigator } from '@repo/ui/components/native/navigation';

/**
 * Nudges a guest to sign in on the lease's reminder days, and on every launch after the
 * last one. It never blocks and nothing is deleted: guest work stays on this device.
 */
export function GuestPersistenceNotice() {
  const router = useNavigator();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<GuestLeaseStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
    if (!user || !isLocalOnlyIdentity(user)) {
      setStatus(null);
      return;
    }
    let active = true;
    const guestUserId = user.id;
    void getOrCreateGuestLease(guestUserId).then((next) => {
      if (active) setStatus(next);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const isEntryRoute =
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname === '/auth' ||
    pathname === '/onboarding' ||
    pathname === '/account-recovery';
  if (!user || !isLocalOnlyIdentity(user) || isEntryRoute || isDismissed || !status?.reminderDay)
    return null;

  const reminderDay = status.reminderDay;
  const dismiss = () => {
    setIsDismissed(true);
    void dismissGuestLeaseReminder(user.id, reminderDay);
  };

  return (
    <Surface
      tone="raised"
      style={{
        position: 'absolute',
        bottom: 96,
        left: 16,
        right: 16,
        zIndex: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text kind="label">Guest mode · saved on this device</Text>
        <Text kind="caption" tone="soft">
          Create an account to keep your work safe and use it on your other devices.
        </Text>
      </View>
      <Button
        label="Create account"
        variant="primary"
        size="sm"
        accessibilityLabel="Create an account to save across devices"
        onPress={() => router.push('/auth')}
      />
      <IconButton
        icon={X as ComponentType<KitIconProps>}
        label="Dismiss guest storage reminder"
        variant="quiet"
        size="sm"
        onPress={dismiss}
      />
    </Surface>
  );
}
