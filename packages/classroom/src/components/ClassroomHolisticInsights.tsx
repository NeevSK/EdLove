import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    Theme,
    useThemedColors,
    Card,
    Icon,
    ChevronRightIcon,
    Center
} from '@repo/ui';
import {
    TrendingUp,
    Activity,
    Calendar,
    ChevronRight
} from 'lucide-react-native';
import { api, StudentObservation, AttendanceRecord, StudentGrade } from '@repo/core';
import { ActivityIndicator } from 'react-native';

interface ClassroomHolisticInsightsProps {
    classroomId: string;
}

export default function ClassroomHolisticInsights({ classroomId }: ClassroomHolisticInsightsProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{
        attendance: AttendanceRecord[];
        grades: StudentGrade[];
        observations: StudentObservation[];
    }>({ attendance: [], grades: [], observations: [] });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0] ?? '';
            const [attendanceSnapshot, gradebookSnapshot, obsData] = await Promise.all([
                api.attendance.getClassroomAttendanceSnapshot(classroomId ?? '', today),
                api.grading.getGradebookSnapshot(classroomId ?? '', today),
                api.studentObservations.getForClassroom(classroomId ?? '')
            ]);

            setData({
                attendance: attendanceSnapshot.records,
                grades: gradebookSnapshot.grades,
                observations: obsData
            });
        } catch (error) {
            console.error('Failed to fetch classroom insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (classroomId) {
            fetchData();
        }
    }, [classroomId]);

    const stats = useMemo(() => {
        const totalGrades = data.grades.length;
        const avgGpa = totalGrades > 0
            ? (data.grades.reduce((acc, g) => acc + (g.gpa || 0), 0) / totalGrades).toFixed(2)
            : '0.00';

        const positiveObs = data.observations.filter(o => o.observation_type === 'positive').length;
        const concernObs = data.observations.filter(o => o.observation_type === 'concern').length;

        const attendanceRate = data.attendance.length > 0
            ? Math.round((data.attendance.filter(a => a.status === 'present').length / data.attendance.length) * 100)
            : 0;

        return { avgGpa, positiveObs, concernObs, attendanceRate };
    }, [data]);

    if (isLoading) {
        return (
            <Center sx={{ flex: 1, padding: 40 }}
                <ActivityIndicator color={Theme.colors.sanctuarySaffron} /
            </Center
        );
    }

    return (
        <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.md }}
            <HStack sx={{ gap: Theme.spacing.md }}
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}
                    <VStack sx={{ gap: 4 }}
                        <HStack sx={{ alignItems: 'center', gap: 6 }}
                            <TrendingUp size={14} color={Theme.colors.sanctuarySaffron} /
                            <Text sx={{ fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' }}>{t('insights.avgGpa') || 'AVG GPA'}</Text
                        </HStack
                        <Heading sx={{ fontSize: 24, color: colors.text }}>{stats.avgGpa}</Heading
                    </VStack
                </Card
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}
                    <VStack sx={{ gap: 4 }}
                        <HStack sx={{ alignItems: 'center', gap: 6 }}
                            <Calendar size={14} color={Theme.colors.amberGlow} /
                            <Text sx={{ fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' }}>{t('insights.attendance') || 'TODAY'}</Text
                        </HStack
                        <Heading sx={{ fontSize: 24, color: colors.text }}>{stats.attendanceRate}%</Heading
                    </VStack
                </Card
            </HStack

            <Card sx={{ padding: Theme.spacing.lg, backgroundColor: colors.secondary }}
                <VStack sx={{ gap: Theme.spacing.md }}
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        <VStack
                            <Heading sx={{ fontSize: Theme.typography.fontSize.md, color: colors.text }}
                                {t('insights.growthPulse') || 'Growth Pulse'}
                            </Heading
                            <Text sx={{ fontSize: 12, color: colors.textSecondary }}
                                {t('insights.observationSummary') || 'Collective teacher observations'}
                            </Text
                        </VStack
                        <Activity size={20} color={Theme.colors.sanctuarySaffron} /
                    </HStack

                    <HStack sx={{ gap: Theme.spacing.md }}
                        <VStack sx={{ flex: 1, backgroundColor: 'rgba(255,184,0,0.1)', padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable }}
                            <Heading sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 20 }}>{stats.positiveObs}</Heading
                            <Text sx={{ fontSize: 10, color: colors.textSecondary }}>{t('insights.positiveNotes') || 'Positive'}</Text
                        </VStack
                        <VStack sx={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable }}
                            <Heading sx={{ color: '#EF4444', fontSize: 20 }}>{stats.concernObs}</Heading
                            <Text sx={{ fontSize: 10, color: colors.textSecondary }}>{t('insights.areasOfConcern') || 'Concerns'}</Text
                        </VStack
                    </HStack
                </VStack
            </Card

            <VStack sx={{ gap: Theme.spacing.sm }}
                <Heading sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}
                    {t('insights.recentActivity') || 'Recent Class Activity'}
                </Heading
                {data.observations.length === 0 && (
                    <Text sx={{ color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', py: 20 }}
                        {t('insights.noActivity') || 'No recent activity recorded.'}
                    </Text
                )}
                {data.observations.slice(0, 4).map((obs) => (
                    <Box key={obs.id} sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, borderLeftWidth: 3, borderLeftColor: obs.observation_type === 'positive' ? Theme.colors.sanctuarySaffron : colors.border }}
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                            <VStack sx={{ flex: 1 }}
                                <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.sm }}>{obs.content}</Text
                                <Text sx={{ fontSize: 10, color: colors.textTertiary, marginTop: 4 }}
                                    {obs.author?.full_name} " {new Date(obs.created_at).toLocaleDateString()}
                                </Text
                            </VStack
                            <Icon as={ChevronRightIcon} size="sm" color={colors.textTertiary} /
                        </HStack
                    </Box
                ))}
            </VStack
        </VStack
    );
}
