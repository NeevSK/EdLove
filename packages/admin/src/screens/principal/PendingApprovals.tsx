import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react-native';
import { LEAVE_STATUS_COLORS } from '../../principal/workspace';
import type { StaffLeave as StaffLeaveDTO } from '@repo/core';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Button,
    ButtonText,
    Icon
} from '@repo/ui';

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
    onReject 
}) => {
    const { t } = useTranslation();

    const formatLeaveLabel = (leave: StaffLeaveDTO) => {
        if (!leave.leave_type) return 'Leave Request';
        return leave.leave_type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <Box className="bg-silk p-6 rounded-3xl border border-border gap-5">
            <HStack className="items-center gap-3">
                <Box className="bg-amber-500/10 p-3 rounded-xl">
                    <Icon as={ClipboardList} size="md" className="text-amber-600" />
                </Box>
                <VStack>
                    <Heading className="text-lg font-black text-ink">
                        {t('approvals.pendingTitle') || 'Pending Approvals'}
                    </Heading>
                    <Text className="text-[13px] text-ink/40 font-bold">
                        {t('approvals.pendingSubtitle') || 'Staff leave and resource requests'}
                    </Text>
                </VStack>
            </HStack>

            {leaves.length === 0 ? (
                <Box className="p-8 items-center justify-center border border-dashed border-border rounded-2xl bg-white/50">
                    <Text className="text-sm font-bold text-ink/40">
                        {t('approvals.noPending') || 'No pending requests at this time.'}
                    </Text>
                </Box>
            ) : (
                <VStack className="gap-3">
                    {leaves.map((leave) => (
                        <HStack 
                            key={leave.id} 
                            className="p-4 rounded-2xl bg-white border border-border justify-between items-center shadow-sm"
                        >
                            <HStack className="items-center gap-3">
                                <Box 
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ 
                                        backgroundColor: (LEAVE_STATUS_COLORS as any)[leave.status] || '#cbd5e1' 
                                    }} 
                                />
                                <VStack>
                                    <Text className="text-sm font-bold text-ink">{leave.user_id}</Text>
                                    <Text className="text-[11px] text-ink/40 font-black uppercase tracking-wider">
                                        {formatLeaveLabel(leave)} · {leave.start_date} to {leave.end_date}
                                    </Text>
                                </VStack>
                            </HStack>
                            <HStack className="gap-2">
                                <Button
                                    onPress={() => onReject(leave.id)}
                                    isDisabled={processingId === leave.id}
                                    className="px-3 h-9 rounded-xl border border-red-500/20 bg-transparent active:bg-red-500/5 group"
                                >
                                    <ButtonText className="text-red-500 text-xs font-bold group-active:text-red-600">{t('common.reject') || 'Reject'}</ButtonText>
                                </Button>
                                <Button
                                    onPress={() => onApprove(leave.id)}
                                    isDisabled={processingId === leave.id}
                                    className="px-4 h-9 rounded-xl bg-phase-interactive shadow-sm active:opacity-90"
                                >
                                    <ButtonText className="text-inverted text-xs font-bold">
                                        {processingId === leave.id ? '...' : (t('common.approve') || 'Approve')}
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
