import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
    Box,
    HStack,
    VStack,
    Text,
    SkeletonCard,
    useTheme,
    Icon,
    Pressable,
    Theme
} from '@repo/ui';
import { ChevronRight, TrendingUp } from 'lucide-react-native';
import { staffOperationsAPI, type StudentPrincipalPulse } from '../../staff';

interface StudentPulseSectionProps {
    schoolId: string;
    classroomId?: string;
    onViewAtRisk?: () => void;
    onViewEnrollments?: () => void;
    onViewFullReport?: () => void;
}

export default function StudentPulseSection({
    schoolId,
    classroomId,
    onViewAtRisk,
    onViewEnrollments,
    onViewFullReport
}: StudentPulseSectionProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [pulse, setPulse] = useState<StudentPrincipalPulse | null>(null);

    const attendanceColor = (rate: number): string => {
        if (rate >= 90) return theme.accent.sageGreen;
        if (rate >= 75) return theme.accent.action; // Amber equivalent in V3
        return theme.accent.danger;
    };

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const pulseData = await staffOperationsAPI.getStudentPrincipalPulse(schoolId, classroomId);
                if (!mounted) return;
                setPulse(pulseData);
            } catch (error) {
                console.error('Error fetching student pulse:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [schoolId, classroomId]);

    if (loading) {
        return (
            <VStack className="gap-2">
                <SkeletonCard height={80} />
                <SkeletonCard height={56} />
            </VStack>
        );
    }

    const delta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
    const deltaLabel = delta > 0 ? `+${delta}% vs yesterday` : delta < 0 ? `${delta}% vs yesterday` : 'same as yesterday';
    const deltaColor = delta >= 0 ? theme.accent.sageGreen : theme.accent.danger;

    return (
        <VStack className="gap-2">
            {/* Attendance and Submissions Row */}
            <HStack className="gap-2">
                <Box className="flex-1 bg-phase-surface rounded-xl p-md border border-phase-border">
                    <Text className="text-[11px] text-phaseText-secondary mb-1 uppercase">
                        Attendance Today
                    </Text>
                    <Text
                        className="text-2xl font-bold"
                        style={{ color: pulse ? attendanceColor(pulse.todayRate) : theme.text.primary }}
                    >
                        {pulse ? `${pulse.todayRate}%` : '-'}
                    </Text>
                    <Text className="text-[10px]" style={{ color: deltaColor }}>
                        {pulse ? deltaLabel : ''}
                    </Text>
                </Box>

                <Box className="flex-1 bg-phase-surface rounded-xl p-md border border-phase-border">
                    <Text className="text-[11px] text-phaseText-secondary mb-1 uppercase">
                        Submissions This Week
                    </Text>
                    <Text className="text-2xl font-bold text-phaseText-primary">
                        {pulse?.submissionRate !== null && pulse?.submissionRate !== undefined ? `${pulse.submissionRate}%` : '-'}
                    </Text>
                    <Text className="text-[10px] text-phaseText-secondary">
                        of assignments
                    </Text>
                </Box>
            </HStack>

            {/* At-Risk and Pending Enrollments Row */}
            <HStack className="gap-2">
                <Pressable
                    onPress={onViewAtRisk}
                    className="flex-1"
                    disabled={!onViewAtRisk}
                >
                    <Box
                        className={`flex-1 p-md rounded-xl border ${
                            (pulse?.atRiskCount ?? 0) > 0 ? 'border-phase-danger' : 'border-phase-border'
                        } bg-phase-surface`}
                    >
                        <HStack className="items-center gap-1.5">
                            <Box className="bg-phase-danger rounded-lg px-2 py-0.5">
                                <Text className="text-xs font-bold text-white">
                                    {pulse?.atRiskCount ?? 0}
                                </Text>
                            </Box>
                            <Text className="text-[12px] text-phaseText-primary flex-1">
                                At-risk students
                            </Text>
                            <Icon as={ChevronRight} size="sm" className="text-phaseText-muted" />
                        </HStack>
                        {onViewAtRisk && (
                            <Text className="text-[10px] text-phaseText-secondary mt-1">
                                Tap to review
                            </Text>
                        )}
                    </Box>
                </Pressable>

                {!classroomId && (
                    <Pressable
                        onPress={onViewEnrollments}
                        className="flex-1"
                        disabled={!onViewEnrollments}
                    >
                        <Box
                            className={`flex-1 p-md rounded-xl border ${
                                (pulse?.pendingEnrollments ?? 0) > 0 ? 'border-phase-accent' : 'border-phase-border'
                            } bg-phase-surface`}
                        >
                            <HStack className="items-center gap-1.5">
                                <Box className="bg-phase-accent rounded-lg px-2 py-0.5">
                                    <Text className="text-xs font-bold text-white">
                                        {pulse?.pendingEnrollments ?? 0}
                                    </Text>
                                </Box>
                                <Text className="text-[12px] text-phaseText-primary flex-1">
                                    Pending enrollments
                                </Text>
                                <Icon as={ChevronRight} size="sm" className="text-phaseText-muted" />
                            </HStack>
                            {onViewEnrollments && (
                                <Text className="text-[10px] text-phaseText-secondary mt-1">
                                    Tap to review
                                </Text>
                            )}
                        </Box>
                    </Pressable>
                )}
            </HStack>

            {/* Footer Full Analytics */}
            {onViewFullReport && (
                <Pressable
                    onPress={onViewFullReport}
                    className="mt-2 py-2 border-t border-phase-border items-center justify-center flex-row gap-1"
                >
                    <Text className="text-xs font-bold text-phase-accent">
                        VIEW FULL ANALYTICS
                    </Text>
                    <Icon as={TrendingUp} size="xs" className="text-phase-accent" />
                </Pressable>
            )}
        </VStack>
    );
}

