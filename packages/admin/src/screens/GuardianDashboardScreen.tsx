import { Box, Button, ButtonText, ScrollView, Text, VStack } from '@repo/ui/primitives';

import type React from 'react';
import { GuardianEvents } from '@repo/admin/components/guardian/GuardianEvents';
import { GuardianNotifications } from '@repo/admin/components/guardian/GuardianNotifications';
import { GuardianChildrenList } from '@repo/admin/components/poa/GuardianChildrenList';
import { GuardianHeader } from '@repo/admin/components/poa/GuardianHeader';
import type { StudentOverview } from '@repo/admin/guardian/types';
import { useGuardianWorkspaceData } from '@repo/admin/guardian/useGuardianWorkspaceData';

interface GuardianDashboardScreenProps {
  guardianId: string;
  onStudentPress: (student: StudentOverview) => void;
  onNotificationPress: (notification: any) => void;
  onEventPress: (event: any) => void;
}

export const GuardianDashboardScreen: React.FC<GuardianDashboardScreenProps> = ({
  guardianId,
  onStudentPress,
  onNotificationPress,
  onEventPress,
}) => {
  const { dashboard, isLoading, error, refreshData } = useGuardianWorkspaceData(guardianId);

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-canvas">
        <Text className="text-phaseText-secondary text-base">Loading dashboard...</Text>
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-canvas p-5">
        <Text className="text-phase-danger text-base font-semibold text-center">
          {error || 'Failed to load dashboard'}
        </Text>
        <Button
          variant="outline"
          onPress={() => void refreshData()}
          className="mt-5 border-phase-danger/30"
          accessibilityLabel="Retry loading guardian dashboard"
        >
          <ButtonText className="text-phase-danger font-bold">Try again</ButtonText>
        </Button>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      <GuardianHeader studentCount={dashboard.students.length} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack className="gap-6">
          <GuardianChildrenList students={dashboard.students} onStudentPress={onStudentPress} />

          <Box className="flex-col md:flex-row gap-6">
            <VStack className="flex-1 gap-4">
              <Text className="text-phaseText-primary font-bold text-lg">Recent Notifications</Text>
              <GuardianNotifications
                notifications={dashboard.notifications}
                onNotificationPress={onNotificationPress}
                limit={5}
              />
            </VStack>

            <VStack className="flex-1 gap-4">
              <Text className="text-phaseText-primary font-bold text-lg">Upcoming Events</Text>
              <GuardianEvents
                events={dashboard.upcomingEvents}
                onEventPress={onEventPress}
                limit={5}
              />
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};
