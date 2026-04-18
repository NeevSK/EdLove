/**
 * LeaveApprovalSection
 *
 * Compact leave approval widget for the principal:
 *  - Lists pending leave requests
 *  - Approve / Reject buttons per request
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    useTheme,
    Pressable,
    Icon,
    Theme,
    hapticLight
} from '@repo/ui';
import { Check, X, AlertCircle } from 'lucide-react-native';
import { staffManagementAPI, type StaffLeaveDTO } from '@repo/core';

interface LeaveApprovalSectionProps {
    schoolId: string;
    principalId: string;
}

export default function LeaveApprovalSection({
    schoolId,
    principalId
}: LeaveApprovalSectionProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState<StaffLeaveDTO[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getLeaveTypeColor = (type: string): string => {
        const t = type.toLowerCase();
        if (t.includes('sick')) return theme.accent.danger;
        if (t.includes('annual')) return theme.accent.sageGreen;
        if (t.includes('casual')) return theme.accent.action;
        return theme.accent.templeGold;
    };

    async function fetchLeaves() {
        try {
            const data = await staffManagementAPI.getPendingLeaves(schoolId);
            setLeaves(data);
        } catch (err) {
            console.error('LeaveApprovalSection: fetch error', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchLeaves();
    }, [schoolId]);

    async function handleDecision(leaveId: string, approve: boolean) {
        hapticLight();
        setProcessingId(leaveId);
        try {
            await staffManagementAPI.approveLeave(leaveId, principalId, approve);
            await fetchLeaves();
        } catch (err) {
            console.error('LeaveApprovalSection: decision error', err);
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <Box className="bg-phase-surface rounded-2xl border border-phase-border p-md">
            <HStack className="justify-between items-center mb-4">
                <HStack className="items-center gap-2">
                    <Text className="text-base font-bold text-phaseText-primary">
                        Leave Requests
                    </Text>
                    {leaves.length > 0 && (
                        <Box className="bg-phase-accent rounded-full px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-white">
                                {leaves.length}
                            </Text>
                        </Box>
                    )}
                </HStack>
            </HStack>

            {loading && (
                <VStack className="gap-2">
                    <Box className="h-20 bg-phase-surface border border-phase-border rounded-xl opacity-50" />
                </VStack>
            )}

            {!loading && leaves.length === 0 && (
                <VStack className="items-center py-md gap-2">
                    <Icon as={Check} size="md" className="text-phase-accent opacity-20" />
                    <Text className="text-sm text-phaseText-secondary text-center">
                        All clear! No pending leave requests.
                    </Text>
                </VStack>
            )}

            {!loading && leaves.map((leave) => {
                const isProcessing = processingId === leave.id;
                return (
                    <VStack
                        key={leave.id}
                        className="py-3 border-b border-phase-border last:border-b-0 gap-3"
                    >
                        <HStack className="justify-between items-start">
                            <VStack className="gap-1 flex-1">
                                <HStack className="items-center gap-2">
                                    <Box
                                        className="rounded-lg px-2 py-0.5"
                                        style={{ backgroundColor: getLeaveTypeColor(leave.leave_type) }}
                                    >
                                        <Text className="text-[10px] font-bold text-white uppercase">
                                            {leave.leave_type}
                                        </Text>
                                    </Box>
                                    <Text className="text-sm font-bold text-phaseText-primary">
                                        Staff ID: {leave.user_id.substring(0, 8)}
                                    </Text>
                                </HStack>
                                <Text className="text-xs text-phaseText-secondary">
                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                </Text>
                            </VStack>
                        </HStack>

                        {leave.reason && (
                            <Box className="bg-phase-surface-tertiary p-2 rounded-lg border border-phase-border">
                                <Text className="text-xs text-phaseText-primary italic">
                                    "{leave.reason}"
                                </Text>
                            </Box>
                        )}

                        <HStack className="gap-2">
                            <Pressable
                                onPress={() => handleDecision(leave.id, true)}
                                disabled={isProcessing}
                                className={`flex-1 flex-row items-center justify-center gap-2 bg-phase-accent rounded-xl py-2 ${isProcessing ? 'opacity-50' : ''}`}
                            >
                                <Icon as={Check} size="xs" className="text-white" />
                                <Text className="text-xs font-bold text-white">Approve</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => handleDecision(leave.id, false)}
                                disabled={isProcessing}
                                className={`flex-1 flex-row items-center justify-center gap-2 border border-phase-danger rounded-xl py-2 ${isProcessing ? 'opacity-50' : ''}`}
                            >
                                <Icon as={X} size="xs" className="text-phase-danger" />
                                <Text className="text-xs font-bold text-phase-danger">Reject</Text>
                            </Pressable>
                        </HStack>
                    </VStack>
                );
            })}
        </Box>
    );
}
