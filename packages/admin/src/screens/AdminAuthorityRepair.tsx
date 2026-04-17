import React from 'react';
import { ScreenWrapper, Text, VStack } from '@repo/ui';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';

export default function AdminAuthorityRepair() {
  const data = useAdminWorkspaceData();
  return (
    <ScreenWrapper scroll={false}>
      <VStack className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-lg font-bold text-phaseText-primary">Authority repair</Text>
        <Text className="text-center text-sm text-phaseText-secondary">
          {data.userCount > 0
            ? `Platform user base available for repair context: ${data.userCount} users.`
            : 'This room will handle role drift, POA repairs, and access-boundary investigations.'}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
