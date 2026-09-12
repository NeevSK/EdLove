import { isLocalOnlyIdentity } from '@repo/core/logic';
import {
  dismissGuestLeaseReminder,
  getOrCreateGuestLease,
  type GuestLeaseStatus,
} from '@repo/core/native';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

/**
 * Makes the guest retention boundary visible without blocking exploration.
 * Personal writes remain local; the account route is required for durable sync.
 */
export function GuestPersistenceNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<GuestLeaseStatus | null>(null);

  useEffect(() => {
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

  if (!user || !isLocalOnlyIdentity(user) || isEntryRoute || !status?.reminderDay || status.isExpired) return null;

  const remainingDays = Math.max(0, 15 - status.day);
  const dismiss = () => {
    const reminderDay = status.reminderDay;
    if (!reminderDay) return;
    void dismissGuestLeaseReminder(user.id, reminderDay).then(() => setStatus(null));
  };

  return (
    <Box className="absolute bottom-4 left-4 right-4 z-40 flex-row items-center gap-3 rounded-2xl border border-phase-border bg-phase-surface px-4 py-3 shadow-lg">
      <Box className="flex-1">
        <Text className="text-sm font-semibold text-phase-text-primary">
          Guest mode · {remainingDays} day{remainingDays === 1 ? '' : 's'} left
        </Text>
        <Text className="mt-0.5 text-xs leading-4 text-phase-text-secondary">
          Your work is saved only on this device until you create an account.
        </Text>
      </Box>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create an account to save across devices"
        className="rounded-full bg-phase-interactive px-3 py-2"
        onPress={() => router.push('/auth')}
      >
        <Text className="text-xs font-bold text-white">Keep work</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss guest storage reminder" onPress={dismiss}>
        <Text className="text-base text-phase-text-secondary">×</Text>
      </Pressable>
    </Box>
  );
}
