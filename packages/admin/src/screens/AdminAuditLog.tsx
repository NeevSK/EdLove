import React from 'react';
import { ScreenWrapper, Text, VStack } from '@repo/ui';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';

export default function AdminAuditLog() {
  const data = useAdminWorkspaceData();
  return (
    <ScreenWrapper scroll={false}>
      <VStack className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-lg font-bold text-phaseText-primary">Audit log</Text>
        <Text className="text-center text-sm text-phaseText-secondary">
          {data.recentUsers.length > 0
            ? `Most recent operator context: ${data.recentUsers[0]?.full_name ?? data.recentUsers[0]?.id}`
            : 'This room will show operator history, approvals, and accountability traces.'}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
