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
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
    const [pulse, setPulse] = useState<StudentAttendancePulse | null>(null);
    const [pendingLeaves, setPendingLeaves] = useState(0);

    const getPresenceColor = (present: number, total: number): string => {
        if (total === 0) return theme.scene.text.muted;
        const pct = present / total;
        if (pct >= 0.9) return theme.accent.sageGreen;
        if (pct >= 0.7) return theme.accent.action;
        return theme.accent.danger;
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

    const dotColor = presence ? getPresenceColor(presence.present, presence.total) : theme.text.secondary;
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
                <Box className="bg-phase-surface rounded-xl p-md border border-phase-border">
                    <HStack className="items-center gap-2">
                        <Box
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: dotColor }}
                        />
                        <Text className="flex-1 text-sm text-phaseText-primary font-semibold">
                            {presence
                                ? `${presence.present} of ${presence.total} teachers present today`
                                : 'No attendance data yet'}
                        </Text>
                        {onViewStaff && (
                            <Text className="text-xs text-phaseText-secondary">View →</Text>
                        )}
                    </HStack>
                </Box>
            </Pressable>

            {/* Student pulse + at-risk + pending approvals */}
            <HStack className="gap-2">
                {/* Attendance pulse */}
                <Box className="flex-1 bg-phase-surface rounded-xl p-md border border-phase-border">
                    <Text className="text-[11px] text-phaseText-secondary mb-1 uppercase">
                        Attendance
                    </Text>
                    <Text className="text-xl font-bold text-phaseText-primary">
                        {pulse ? `${pulse.todayRate}%` : '—'}
                    </Text>
                    <Text
                        className="text-[10px]"
                        style={{ color: attendanceDelta >= 0 ? theme.accent.sageGreen : theme.accent.danger }}
                    >
                        {pulse ? deltaLabel : ''}
                    </Text>
                </Box>

                {/* At-risk badge */}
                <Box className="flex-1 bg-phase-surface rounded-xl p-md border border-phase-border">
                    <Text className="text-[11px] text-phaseText-secondary mb-1 uppercase">
                        At-Risk
                    </Text>
                    <Text
                        className={`text-xl font-bold ${
                            (pulse?.atRiskCount ?? 0) > 0 ? 'text-phase-accent' : 'text-phaseText-primary'
                        }`}
                    >
                        {pulse?.atRiskCount ?? 0}
                    </Text>
                    <Text className="text-[10px] text-phaseText-secondary">{'attendance < 75%'}</Text>
                </Box>

                {/* Pending approvals */}
                <Pressable onPress={onViewApprovals} className="flex-1">
                    <Box className="flex-1 bg-phase-surface rounded-xl p-md border border-phase-border">
                        <Text className="text-[11px] text-phaseText-secondary mb-1 uppercase">
                            Pending
                        </Text>
                        <Text
                            className={`text-xl font-bold ${
                                pendingLeaves > 0 ? 'text-phase-accent' : 'text-phaseText-primary'
                            }`}
                        >
                            {pendingLeaves}
                        </Text>
                        {onViewApprovals && (
                            <Text className="text-[10px] text-phaseText-secondary">Tap to review</Text>
                        )}
                    </Box>
                </Pressable>
            </HStack>
        </VStack>
    );
}

