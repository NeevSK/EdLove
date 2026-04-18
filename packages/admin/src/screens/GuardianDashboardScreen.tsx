import React from 'react';
import { ScrollView } from 'react-native';
import { Box, VStack, HStack, Text } from '@repo/ui';
import type { StudentOverview } from '../guardian';
import { useGuardianWorkspaceData } from '../guardian/useGuardianWorkspaceData';
import { GuardianHeader } from '../components/poa/GuardianHeader';
import { GuardianChildrenList } from '../components/poa/GuardianChildrenList';
import { GuardianNotifications } from '../components/guardian/GuardianNotifications';
import { GuardianEvents } from '../components/guardian/GuardianEvents';

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
  const { dashboard, isLoading, error } = useGuardianWorkspaceData(guardianId);

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-background">
        <Text className="text-secondary text-base">Loading dashboard...</Text>
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box className="flex-1 justify-center items-center bg-background p-5">
        <Text className="text-error text-base font-semibold text-center">
          {error || 'Failed to load dashboard'}
        </Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background">
      <GuardianHeader studentCount={dashboard.students.length} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <VStack className="gap-6">
          <GuardianChildrenList 
            students={dashboard.students}
            onStudentPress={onStudentPress}
          />

          <Box className="flex-col md:flex-row gap-6">
            <VStack className="flex-1 gap-4">
              <Text className="text-primary font-bold text-lg">
                Recent Notifications
              </Text>
              <GuardianNotifications 
                notifications={dashboard.notifications}
                onNotificationPress={onNotificationPress}
                limit={5}
              />
            </VStack>

            <VStack className="flex-1 gap-4">
              <Text className="text-primary font-bold text-lg">
                Upcoming Events
              </Text>
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
