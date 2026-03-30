import React, { useEffect, useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Theme,
    useThemedColors,
    GlobalHeader,
    ScrollView,
    SkeletonCard,
    hapticLight
} from '@repo/ui';
import {
    TrendingUp,
    Users,
    AlertTriangle,
    Calendar,
    ChevronRight,
    TrendingDown,
    Activity
} from 'lucide-react-native';
import { reportingAPI } from '@repo/admin';
import { api, AttendanceReport, AcademicCycle } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

interface AttendanceReportScreenProps {
    schoolId: string;
    classroomId?: string;
    onBack: () => void;
}

export default function AttendanceReportScreen({ schoolId, classroomId, onBack }: AttendanceReportScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [report, setReport] = useState<AttendanceReport | null>(null);
    const [cycles, setCycles] = useState<AcademicCycle[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (cycleId?: string) => {
        setLoading(true);
        try {
            const allCycles = await api.academicCycles.getAll(schoolId);
            setCycles(allCycles);

            const targetCycle = cycleId
                ? allCycles.find(c => c.id === cycleId)
                : allCycles.find(c => c.is_current) || allCycles[0];

            if (targetCycle) {
                setSelectedCycleId(targetCycle.id);
                const data = await reportingAPI.getAttendanceReport(
                    schoolId,
                    targetCycle.start_date,
                    targetCycle.end_date,
                    classroomId
                );
                setReport(data);
            }
        } catch (error) {
            console.error('Failed to fetch attendance report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [schoolId]);

    const handleCycleSelect = (id: string) => {
        hapticLight();
        setSelectedCycleId(id);
        fetchData(id);
    };

    if (loading && !report) {
        return (
            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                <GlobalHeader title="Attendance Report" onBack={onBack} /
                ><VStack space="lg" sx={{ padding: Theme.spacing.lg }}
                    <SkeletonCard height={150} /
                    ><SkeletonCard height={300} /
                ></VStack
            ></Box>
        );
    }

    const selectedCycle = cycles.find(c => c.id === selectedCycleId);

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
            <GlobalHeader>
                title={classroomId ? 'Class Attendance' : (t('principal.attendance.reportTitle') || 'Institutional Attendance')}
                onBack={onBack}
            /

            ><ScrollView contentContainerStyle={{ padding: Theme.spacing.lg }}
                <VStack space="xl">
                    {/* Cycle Selector */}>
                    <Box>
                        <Text >sx={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: Theme.spacing.sm, textTransform: 'uppercase' }}
                            Select Academic Cycle
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack space="sm">
                                {cycles.map(cycle => (
                                    <TouchableOpacity key={cycle.id} onPress={() => handleCycleSelect(cycle.id)}
                                        <Box sx={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            backgroundColor: selectedCycleId === cycle.id ? colors.action : colors.secondary,
                                            borderWidth: 1,
                                            borderColor: selectedCycleId === cycle.id ? colors.action : colors.border
                                        }}>
                                            <Text sx={{ fontSize: 13, fontWeight: '600', color: selectedCycleId === cycle.id ? '#fff' : colors.text }}>
                                                {cycle.name}>
                                            </Text>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </HStack>
                        </ScrollView>
                    </Box>

                    {/* Key Metrics */}
                    {report && (
                        <HStack space="md">
                            <Box sx={{ flex: 1, backgroundColor: colors.secondary, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                                <VStack space="xs">
                                    <Activity size={20} color={colors.action} /
                                    ><Text sx={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{report.overallRate}%</Text
                                    ><Text sx={{ fontSize: 11, color: colors.textSecondary }}>Average Rate</Text
                                ></VStack
                            ></Box>
                            <Box sx={{ flex: 1, backgroundColor: colors.secondary, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                                <VStack space="xs">
                                    <AlertTriangle size={20} color={Theme.colors.amberGlow ?? '#ffcc00'} /
                                    ><Text sx={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{report.totalAbsences}</Text
                                    ><Text sx={{ fontSize: 11, color: colors.textSecondary }}>Total Absences</Text
                                ></VStack
                            ></Box>
                        </HStack>
                    )}

                    {/* Trend Chart (Simple Bar Representation) */}
                    <Box sx={{
                        backgroundColor: colors.secondary,
                        padding: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <VStack space="md">
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text sx={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Attendance Trend</Text
                                ><TrendingUp size={18} color={colors.success} /
                            ></HStack

                            >{report && report.trend.length > 0 ? (
                                <VStack space="sm">
                                    <HStack sx={{ height: 150, alignItems: 'flex-end', gap: 4 }}>
                                        {report.trend.slice(-10).map((point, i) => (
                                            <VStack key={point.date} sx={{ flex: 1, alignItems: 'center' }} space="xs">
                                                <Box sx={{
                                                    width: '100%',
                                                    height: `${point.rate}%`,
                                                    backgroundColor: point.rate > 90 ? colors.success : (point.rate > 75 ? colors.warning : colors.error),
                                                    borderRadius: 4
                                                }} /
                                                ><Text sx={{ fontSize: 8, color: colors.textTertiary }}>{point.date.split('-')[2]}</Text
                                            ></VStack
                                        >))}
                                    </HStack>
                                    <Text sx={{ fontSize: 10, color: colors.textTertiary, textAlign: 'center' }}>Showing last 10 session days</Text
                                ></VStack>
                            ) : (
                                <Box sx={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text sx={{ color: colors.textTertiary }}>No data for this period</Text
                                ></Box
                            >)}
                        </VStack>
                    </Box>

                    {/* Daily Table */}
                    <VStack space="sm">
                        <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.text, marginLeft: 4 }}>Attendance Log</Text
                        >{report?.trend.slice().reverse().map((point) => (
                            <Box key={point.date} sx={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <VStack>
                                        <Text >sx={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{point.date}</Text
                                        ><Text sx={{ fontSize: 11, color: colors.textSecondary }}
                                            {point.presentCount} present \u00B7 {point.absentCount} absent
                                        </Text>
                                    </VStack>
                                    <Box sx={{
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                        backgroundColor: point.rate > 90 ? colors.success + '22' : colors.action + '22'
                                    }}
                                        <Text sx={{ fontSize: 12, fontWeight: '700', color: point.rate > 90 ? colors.success : colors.action }}
                                            {point.rate}%
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </VStack>
            </ScrollView>
        </Box>
    );
}
