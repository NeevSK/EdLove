import { useAuthStore } from '@repo/core/store';

import { Box, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';

import { useGuardianWorkspaceData } from '@repo/admin/guardian/useGuardianWorkspaceData';
import { GuardianRoomShell } from '@repo/admin/screens/guardian/GuardianRoomShell';

export default function GuardianEventsScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { dashboard } = useGuardianWorkspaceData(user?.id || '');
  const events = dashboard?.upcomingEvents || [];

  return (
    <GuardianRoomShell
      eyebrow="Calendar Bridge"
      title="Family Event Room"
      description="A calmer look ahead for the dates that shape home planning, school participation, and family presence."
      stats={[
        { label: 'Events', value: events.length },
        {
          label: 'RSVP',
          value: events.filter((event) => event.requiresRsvp).length,
        },
      ]}
      onBack={() => safeBack('/workspace')}
    >
      <ScrollView className="flex-1">
        <VStack className="gap-3 pb-8">
          {events.map((event) => (
            <Box
              key={event.id}
              className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4"
            >
              <VStack className="gap-2">
                <Text className="text-[14px] font-bold text-phaseText-primary">{event.title}</Text>
                <Text className="text-[12px] text-phaseText-secondary">{event.description}</Text>
                <Text className="text-[12px] text-phaseText-secondary">
                  {new Intl.DateTimeFormat('en-LK', {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(event.date))}{' '}
                  - {event.time}
                  {event.location ? ` - ${event.location}` : ''}
                </Text>
                {event.requiresRsvp ? (
                  <Text className="text-[11px] font-bold uppercase text-phaseText-primary">
                    RSVP, requested
                  </Text>
                ) : null}
              </VStack>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </GuardianRoomShell>
  );
}
