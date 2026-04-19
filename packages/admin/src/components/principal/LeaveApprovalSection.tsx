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
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState<StaffLeaveDTO[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getLeaveTypeColorClass = (type: string): string => {
        const t = type.toLowerCase();
        if (t.includes('sick')) return 'bg-phase-danger';
        if (t.includes('annual')) return 'bg-phase-success';
        if (t.includes('casual')) return 'bg-phase-interactive';
        return 'bg-phase-warning';
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
        <Box className="bg-phase-surface rounded-3xl border border-phase-border p-5 shadow-sm">
            <HStack className="justify-between items-center mb-5">
                <HStack className="items-center gap-2">
                    <Text className="text-[17px] font-black text-phaseText-primary">
                        Leave Requests
                    </Text>
                    {leaves.length > 0 && (
                        <Box className="bg-phase-interactive rounded-full px-2 py-0.5">
                            <Text className="text-[10px] font-black text-white">
                                {leaves.length}
                            </Text>
                        </Box>
                    )}
                </HStack>
            </HStack>

            {loading && (
                <VStack className="gap-3">
                    <Box className="h-24 bg-phase-canvas border border-phase-border rounded-2xl opacity-50 overflow-hidden" />
                </VStack>
            )}

            {!loading && leaves.length === 0 && (
                <VStack className="items-center py-8 gap-3 bg-phase-canvas rounded-2xl border border-dashed border-phase-border">
                    <Box className="w-12 h-12 rounded-full bg-phase-success/10 items-center justify-center">
                        <Icon as={Check} size="md" className="text-phase-success" />
                    </Box>
                    <Text className="text-[13px] font-bold text-phaseText-muted text-center">
                        All clear! No pending leave requests.
                    </Text>
                </VStack>
            )}

            {!loading && leaves.map((leave) => {
                const isProcessing = processingId === leave.id;
                return (
                    <VStack
                        key={leave.id}
                        className="py-4 border-b border-phase-border last:border-b-0 gap-4"
                    >
                        <HStack className="justify-between items-start">
                            <VStack className="gap-2 flex-1">
                                <HStack className="items-center gap-2">
                                    <Box
                                        className={`rounded-lg px-2 py-0.5 ${getLeaveTypeColorClass(leave.leave_type)}`}
                                    >
                                        <Text className="text-[10px] font-black text-white uppercase tracking-wider">
                                            {leave.leave_type}
                                        </Text>
                                    </Box>
                                    <Text className="text-[13px] font-black text-phaseText-primary">
                                        Staff ID: {leave.user_id.substring(0, 8)}
                                    </Text>
                                </HStack>
                                <Text className="text-[12px] font-bold text-phaseText-muted">
                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                </Text>
                            </VStack>
                        </HStack>

                        {leave.reason && (
                            <Box className="bg-phase-canvas p-3 rounded-xl border border-phase-border">
                                <Text className="text-[12px] leading-relaxed text-phaseText-secondary italic">
                                    "{leave.reason}"
                                </Text>
                            </Box>
                        )}

                        <HStack className="gap-3">
                            <Pressable
                                onPress={() => handleDecision(leave.id, true)}
                                disabled={isProcessing}
                                className={`flex-1 flex-row items-center justify-center gap-2 bg-phase-interactive rounded-2xl py-3 active:scale-95 transition-all ${isProcessing ? 'opacity-50' : ''}`}
                            >
                                <Icon as={Check} size="xs" className="text-white" />
                                <Text className="text-[13px] font-black text-white uppercase tracking-wider">Approve</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => handleDecision(leave.id, false)}
                                disabled={isProcessing}
                                className={`flex-1 flex-row items-center justify-center gap-2 border-2 border-phase-danger rounded-2xl py-3 active:scale-95 transition-all ${isProcessing ? 'opacity-50' : ''}`}
                            >
                                <Icon as={X} size="xs" className="text-phase-danger" />
                                <Text className="text-[13px] font-black text-phase-danger uppercase tracking-wider">Reject</Text>
                            </Pressable>
                        </HStack>
                    </VStack>
                );
            })}
        </Box>
    );
}
