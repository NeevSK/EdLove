import React from 'react';
import { ScreenWrapper, Text, VStack } from '@repo/ui';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';

export default function AdminIncidentQueue() {
  const data = useAdminWorkspaceData();
  return (
    <ScreenWrapper scroll={false}>
      <VStack className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-lg font-bold text-phaseText-primary">Incident queue</Text>
        <Text className="text-center text-sm text-phaseText-secondary">
          {data.isLoading
            ? 'Loading recent signals...'
            : `There are ${data.incidentCount} current incident-like pending operational items in view.`}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
