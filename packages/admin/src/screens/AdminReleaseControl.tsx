import React from 'react';
import { ScreenWrapper, Text, VStack } from '@repo/ui';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';

export default function AdminReleaseControl() {
  const data = useAdminWorkspaceData();
  return (
    <ScreenWrapper scroll={false}>
      <VStack className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-lg font-bold text-phaseText-primary">Release control</Text>
        <Text className="text-center text-sm text-phaseText-secondary">
          {data.schoolCount > 0
            ? `Release watch is scoped across ${data.schoolCount} schools with live platform visibility.`
            : 'This room will watch deployments, migrations, feature flags, and post-release health.'}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
