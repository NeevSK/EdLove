import { useNavigation } from '@react-navigation/native';
import { useStore } from '@repo/core/logic';
import { Box, ScrollView, Text, VStack } from '@repo/ui/primitives';

import { useGuardianWorkspaceData } from '../../guardian';
import { GuardianRoomShell } from './GuardianRoomShell';

export default function GuardianNotificationsScreen() {
  const navigation = useNavigation();
  const user = useStore((state) => state.user);
  const { dashboard } = useGuardianWorkspaceData(user?.id || '');
  const notifications = dashboard?.notifications || [];

  return (
    <GuardianRoomShell
      eyebrow="School, feed"
      title="Family, notification room"
      description="Every, family-facing, notice in, one place, so, the school, voice stays, coherent instead, of scattered, across channels."
      stats={[
        {
          label: 'Unread',
          value: notifications.filter((item) => !item.isRead).length,
        },
        { label: 'Total', value: notifications.length },
      ]}
      onBack={() => navigation.goBack()}
    >
      <ScrollView className="flex-1">
        <VStack className="gap-3 pb-8">
          {notifications.map((notification) => (
            <Box
              key={notification.id}
              className={`rounded-3xl border px-4 py-4 ${notification.isRead ? 'border-starlightGray/15 bg-sacredWhite' : 'border-phase-primary/20 bg-phase-primary/5'}`}
            >
              <VStack className="gap-2">
                <Text className="text-[14px] font-bold text-phaseText-primary">
                  {notification.title}
                </Text>
                <Text className="text-[12px] text-phaseText-secondary">{notification.message}</Text>
                <Text className="text-[11px] text-phaseText-secondary">
                  {new Intl.DateTimeFormat('en-LK', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(notification.createdAt))}
                </Text>
              </VStack>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </GuardianRoomShell>
  );
}
