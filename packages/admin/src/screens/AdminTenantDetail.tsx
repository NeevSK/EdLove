import React from 'react';
import { ScreenWrapper, Text, VStack } from '@repo/ui';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';

export default function AdminTenantDetail() {
  const data = useAdminWorkspaceData();
  return (
    <ScreenWrapper scroll={false}>
      <VStack className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-lg font-bold text-phaseText-primary">Tenant detail</Text>
        <Text className="text-center text-sm text-phaseText-secondary">
          {data.recentSchools.length > 0
            ? `Latest tenant in view: ${data.recentSchools[0].name ?? data.recentSchools[0].id}`
            : 'This room will drill into a single tenant, school, or platform customer context.'}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
