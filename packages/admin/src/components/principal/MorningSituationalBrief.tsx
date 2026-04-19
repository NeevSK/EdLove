/**
 * MorningSituationalBrief
 *
 * First thing the principal sees each morning:
 *  - Staff presence strip (X of Y teachers present)
 *  - Student attendance pulse (today % + delta vs yesterday)
 *  - At-risk student count badge
 *  - Pending leave approvals badge
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    SkeletonCard,
    useTheme,
    Pressable,
    Theme
} from '@repo/ui';
import { staffManagementAPI, StaffPresenceSummary, StudentAttendancePulse } from '@repo/core';

interface MorningSituationalBriefProps {
    schoolId: string;
    onViewStaff?: () => void;
    onViewApprovals?: () => void;
}

export default function MorningSituationalBrief({
    schoolId,
    onViewStaff,
    onViewApprovals
}: MorningSituationalBriefProps) {
    const [loading, setLoading] = useState(true);
    const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
    const [pulse, setPulse] = useState<StudentAttendancePulse | null>(null);
    const [pendingLeaves, setPendingLeaves] = useState(0);

    const getPresenceColorClass = (present: number, total: number): string => {
        if (total === 0) return 'bg-phaseText-muted';
        const pct = present / total;
        if (pct >= 0.9) return 'bg-phase-success';
        if (pct >= 0.7) return 'bg-phase-interactive';
        return 'bg-phase-danger';
    };

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const [pres, puls, leaves] = await Promise.all([
                    staffManagementAPI.getStaffPresenceSummary(schoolId),
                    staffManagementAPI.getStudentAttendancePulse(schoolId),
                    staffManagementAPI.getPendingLeaves(schoolId)
                ]);
                if (!mounted) return;
                setPresence(pres);
                setPulse(puls);
                setPendingLeaves(leaves.length);
            } catch (error) {
                console.error('Error fetching morning brief:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [schoolId]);

    if (loading) {
        return (
            <VStack className="gap-2">
                <SkeletonCard height={56} />
                <SkeletonCard height={56} />
            </VStack>
        );
    }

    const dotColorClass = presence ? getPresenceColorClass(presence.present, presence.total) : 'bg-phaseText-secondary';
    const attendanceDelta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
    const deltaLabel =
        attendanceDelta > 0
            ? `+${attendanceDelta}% vs yesterday`
            : attendanceDelta < 0
                ? `${attendanceDelta}% vs yesterday`
                : 'same as yesterday';

    return (
        <VStack className="gap-2">
            {/* Staff presence strip */}
            <Pressable onPress={onViewStaff}>
                <Box className="bg-phase-surface rounded-2xl p-4 border border-phase-border">
                    <HStack className="items-center gap-3">
                        <Box
                            className={`w-2.5 h-2.5 rounded-full ${dotColorClass}`}
                        />
                        <Text className="flex-1 text-[13px] text-phaseText-primary font-bold">
                            {presence
                                ? `${presence.present} of ${presence.total} teachers present`
                                : 'No attendance data yet'}
                        </Text>
                        {onViewStaff && (
                            <Text className="text-[10px] font-black uppercase text-phase-interactive tracking-tighter">View Details</Text>
                        )}
                    </HStack>
                </Box>
            </Pressable>

            {/* Student pulse + at-risk + pending approvals */}
            <HStack className="gap-2">
                {/* Attendance pulse */}
                <Box className="flex-1 bg-phase-surface rounded-2xl p-4 border border-phase-border">
                    <Text className="text-[10px] font-black text-phaseText-muted mb-1 uppercase tracking-widest">
                        Pulse
                    </Text>
                    <Text className="text-xl font-black text-phaseText-primary">
                        {pulse ? `${pulse.todayRate}%` : '—'}
                    </Text>
                    <Text
                        className={`text-[9px] font-bold ${attendanceDelta >= 0 ? 'text-phase-success' : 'text-phase-danger'}`}
                    >
                        {pulse ? deltaLabel : ''}
                    </Text>
                </Box>

                {/* At-risk badge */}
                <Box className="flex-1 bg-phase-surface rounded-2xl p-4 border border-phase-border">
                    <Text className="text-[10px] font-black text-phaseText-muted mb-1 uppercase tracking-widest">
                        At-Risk
                    </Text>
                    <Text
                        className={`text-xl font-black ${
                            (pulse?.atRiskCount ?? 0) > 0 ? 'text-phase-danger' : 'text-phaseText-primary'
                        }`}
                    >
                        {pulse?.atRiskCount ?? 0}
                    </Text>
                    <Text className="text-[9px] font-bold text-phaseText-muted">{'Attendance < 75%'}</Text>
                </Box>

                {/* Pending approvals */}
                <Pressable onPress={onViewApprovals} className="flex-1">
                    <Box className="flex-1 bg-phase-surface rounded-2xl p-4 border border-phase-border active:scale-95 transition-all">
                        <Text className="text-[10px] font-black text-phaseText-muted mb-1 uppercase tracking-widest">
                            Pending
                        </Text>
                        <Text
                            className={`text-xl font-black ${
                                pendingLeaves > 0 ? 'text-phase-interactive' : 'text-phaseText-primary'
                            }`}
                        >
                            {pendingLeaves}
                        </Text>
                        <Text className="text-[9px] font-black uppercase text-phase-interactive tracking-tighter">Review</Text>
                    </Box>
                </Pressable>
            </HStack>
        </VStack>
    );
}
