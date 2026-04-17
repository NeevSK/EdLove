import React from 'react';
import { ScreenWrapper, Text, VStack } from '@repo/ui';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';

export default function AdminJobControl() {
  const data = useAdminWorkspaceData();
  return (
    <ScreenWrapper scroll={false}>
      <VStack className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-lg font-bold text-phaseText-primary">Job control</Text>
        <Text className="text-center text-sm text-phaseText-secondary">
          {data.pendingApprovalCount > 0
            ? `${data.pendingApprovalCount} pending operational approvals are ready for guarded handling.`
            : 'This room will expose guarded operator actions, retries, and controlled remediation flows.'}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
