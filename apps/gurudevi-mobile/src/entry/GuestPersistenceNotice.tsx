import { View, Text, Pressable } from 'react-native';
import { isLocalOnlyIdentity } from '@repo/core/logic';
import {
  dismissGuestLeaseReminder,
  type GuestLeaseStatus,
  getOrCreateGuestLease,
} from '@repo/core/native';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

/**
 * Nudges a guest to sign in on the lease's reminder days, and on every launch after the
 * last one. It never blocks and nothing is deleted: guest work stays on this device.
 */
export function GuestPersistenceNotice() {
  const router = useRouter();
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
    <View className="absolute bottom-24 left-4 right-4 z-40 flex-row items-center gap-3 rounded-2xl border border-phase-border bg-phase-surface px-4 py-3 shadow-lg">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-phase-text-primary">
          Guest mode · saved on this device
        </Text>
        <Text className="mt-0.5 text-xs leading-4 text-phase-text-secondary">
          Create an account to keep your work safe and use it on your other devices.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create an account to save across devices"
        className="rounded-full bg-phase-interactive px-3 py-2"
        onPress={() => router.push('/auth')}
      >
        <Text className="text-xs font-bold text-white">Create account</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss guest storage reminder"
        onPress={dismiss}
      >
        <Text className="text-base text-phase-text-secondary">×</Text>
      </Pressable>
    </View>
  );
}
