import type { StaffLeave as StaffLeaveDTO } from '@repo/core';
import {
  Box,
  Button,
  ButtonText,
  ClipboardList,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  hapticLight,
} from '@repo/ui';

import type React from 'react';
import { useTranslation } from 'react-i18next';

interface PendingApprovalsProps {
  leaves: StaffLeaveDTO[];
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  leaves,
  processingId,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation();

  const formatLeaveLabel = (leave: StaffLeaveDTO) => {
    if (!leave.leave_type) return 'Leave Request';
    return leave.leave_type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-phase-success';
      case 'pending':
        return 'bg-phase-warning';
      case 'rejected':
        return 'bg-phase-danger';
      default:
        return 'bg-phaseText-muted';
    }
  };

  return (
    <Box className="bg-phase-surface p-6 rounded-[32px] border border-phase-border gap-6 shadow-sm">
      <HStack className="items-center gap-4">
        <Box className="bg-phase-warning/10 p-3.5 rounded-2xl shadow-inner">
          <Icon as={ClipboardList} size="md" className="text-phase-warning" />
        </Box>
        <VStack className="gap-0.5">
          <Heading className="text-[18px] font-black text-phaseText-primary tracking-tight">
            {t('approvals.pendingTitle') || 'Pending Operations'}
          </Heading>
          <Text className="text-[12px] text-phaseText-muted font-bold uppercase tracking-widest">
            {t('approvals.pendingSubtitle') || 'Staff Leave and Resource Rights'}
          </Text>
        </VStack>
      </HStack>

      {leaves.length === 0 ? (
        <Box className="p-10 items-center justify-center border border-dashed border-phase-border rounded-2xl bg-phase-canvas">
          <Text className="text-[13px] font-bold text-phaseText-muted uppercase tracking-widest">
            {t('approvals.noPending') || 'Cleared for action.'}
          </Text>
        </Box>
      ) : (
        <VStack className="gap-4">
          {leaves.map((leave) => (
            <HStack
              key={leave.id}
              className="p-5 rounded-2xl bg-phase-surface border border-phase-border justify-between items-center shadow-sm"
            >
              <HStack className="items-center gap-4 flex-1">
                <Box
                  className={`w-3 h-3 rounded-full shadow-sm ${getStatusColorClass(leave.status)}`}
                />
                <VStack className="gap-0.5 flex-1">
                  <Text className="text-[15px] font-black text-phaseText-primary tracking-tight">
                    Staff ID: {leave.user_id}
                  </Text>
                  <Text className="text-[10px] text-phaseText-muted font-black uppercase tracking-wider leading-relaxed">
                    {formatLeaveLabel(leave)} · {leave.start_date} to {leave.end_date}
                  </Text>
                </VStack>
              </HStack>
              <HStack className="gap-2.5 ml-2">
                <Button
                  onPress={() => {
                    hapticLight();
                    onReject(leave.id);
                  }}
                  isDisabled={processingId === leave.id}
                  className="px-4 h-10 rounded-xl border border-phase-danger/30 bg-transparent active:bg-phase-danger shadow-inner transition-all"
                >
                  <ButtonText className="text-phase-danger text-[11px] font-black uppercase tracking-widest">
                    {t('common.reject') || 'Reject'}
                  </ButtonText>
                </Button>
                <Button
                  onPress={() => {
                    hapticLight();
                    onApprove(leave.id);
                  }}
                  isDisabled={processingId === leave.id}
                  className="px-5 h-10 rounded-xl bg-phase-interactive shadow-sm active:scale-95 transition-all"
                >
                  <ButtonText className="text-white text-[11px] font-black uppercase tracking-widest">
                    {processingId === leave.id ? '...' : t('common.approve') || 'Approve'}
                  </ButtonText>
                </Button>
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export type { PendingApprovalsProps };
