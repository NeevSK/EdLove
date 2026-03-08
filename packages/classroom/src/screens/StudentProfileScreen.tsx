import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    VStack,
    HStack,
    Box,
    Text,
    ScrollView,
    Heading,
    Theme,
    useThemedColors,
    hapticMedium,
    Icon,
    ArrowLeftIcon,
    ChevronLeftIcon,
    Pressable,
    Button,
    ButtonText,
    Card,
    Center,
} from '@repo/ui';
import {
    Calendar,
    Trophy,
    ShieldCheck,
    Lock
} from 'lucide-react-native';
import { api, StudentObservation, AttendanceRecord, StudentGrade } from '@repo/core';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function StudentProfileScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { studentId, classroomId, studentName, classroomStudentId } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'observations'>('overview');

    // Data states
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [observations, setObservations] = useState<StudentObservation[]>([]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [attData, gradeData, obsData] = await Promise.all([
                api.attendance.getForStudent(studentId, classroomId),
                api.grading.getReportCard(studentId),
                api.studentObservations.getForEnrollment(classroomStudentId)
            ]);
            setAttendance(attData);
            setGrades(gradeData);
            setObservations(obsData);
        } catch (error) {
            console.error('Failed to fetch student data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentId, classroomId]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        : 100;

    const renderOverview = () => (
        <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.md }}>
            <HStack sx={{ gap: Theme.spacing.md }}>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <VStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                        <Calendar size={20} color={Theme.colors.sanctuarySaffron} />
                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: colors.text }}>
                            {attendanceRate}%
                        </Heading>
                        <Text sx={{ fontSize: 10, color: colors.textSecondary }}>{t('student.attendance') || 'Attendance'}</Text>
                    </VStack>
                </Card>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <VStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                        <Trophy size={20} color={Theme.colors.amberGlow} />
                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: colors.text }}>
                            {grades.length > 0 && grades[0]?.grade ? grades[0].grade : 'N/A'}
                        </Heading>
                        <Text sx={{ fontSize: 10, color: colors.textSecondary }}>{t('student.currentGrade') || 'Current Grade'}</Text>
                    </VStack>
                </Card>
            </HStack>

            <VStack sx={{ gap: Theme.spacing.sm }}>
                <Heading sx={{ fontSize: Theme.typography.fontSize.md, color: colors.text }}>
                    {t('student.recentObservations') || 'Recent Observations'}
                </Heading>
                {observations.slice(0, 3).map((obs) => (
                    <Box key={obs.id} sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, borderLeftWidth: 4, borderLeftColor: obs.observation_type === 'positive' ? Theme.colors.sanctuarySaffron : Theme.colors.border }}>
                        <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.sm }}>{obs.content}</Text>
                        <Text sx={{ color: colors.textTertiary, fontSize: 10, marginTop: 4 }}>
                            {new Date(obs.created_at).toLocaleDateString()}
                        </Text>
                    </Box>
                ))}
                {observations.length === 0 && (
                    <Text sx={{ color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                        {t('student.noObservations') || 'No observations recorded yet.'}
                    </Text>
                )}
            </VStack>
        </VStack>
    );

    const renderAcademics = () => (
        <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}>
            {grades.length === 0 && (
                <Text sx={{ color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', padding: 40 }}>
                    {t('student.noGrades') || 'No academic records found.'}
                </Text>
            )}
            {grades.map((grade) => (
                <HStack key={grade.id} sx={{ justifyContent: 'space-between', alignItems: 'center', padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                    <VStack>
                        <Text sx={{ fontWeight: 'bold', color: colors.text }}>{t('common.assignment') || 'Assignment'} {grade.assignment_id?.slice(0, 4)}</Text>
                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>{new Date(grade.graded_at).toLocaleDateString()}</Text>
                    </VStack>
                    <Box sx={{ backgroundColor: colors.tertiary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Theme.corners.tight }}>
                        <Text sx={{ color: Theme.colors.amberGlow, fontWeight: 'bold' }}>{grade.marks}%</Text>
                    </Box>
                </HStack>
            ))}
        </VStack>
    );

    const renderObservations = () => (
        <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}>
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Heading sx={{ fontSize: Theme.typography.fontSize.md, color: colors.text }}>
                    {t('student.governanceNotes') || 'Professional Governance'}
                </Heading>
                <Lock size={16} color={colors.textTertiary} />
            </HStack>
            {observations.length === 0 && (
                <Text sx={{ color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', padding: 40 }}>
                    {t('student.noNotes') || 'No professional notes recorded.'}
                </Text>
            )}
            {observations.map((obs) => (
                <Box key={obs.id} sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                    <HStack sx={{ justifyContent: 'space-between', marginBottom: 8 }}>
                        <Box sx={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: obs.observation_type === 'positive' ? 'rgba(255,184,0,0.1)' : colors.tertiary }}>
                            <Text sx={{ fontSize: 10, color: obs.observation_type === 'positive' ? Theme.colors.sanctuarySaffron : colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {obs.observation_type}
                            </Text>
                        </Box>
                        {obs.is_finalized && (
                            <HStack sx={{ gap: 4, alignItems: 'center' }}>
                                <ShieldCheck size={12} color={Theme.colors.sanctuarySaffron} />
                                <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron }}>{t('student.finalized') || 'Finalized'}</Text>
                            </HStack>
                        )}
                    </HStack>
                    <Text sx={{ color: colors.text }}>{obs.content}</Text>
                    <HStack sx={{ gap: 8, marginTop: 8, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>{obs.author?.full_name}</Text>
                        <Box sx={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textTertiary }} />
                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>{new Date(obs.created_at).toLocaleDateString()}</Text>
                    </HStack>
                </Box>
            ))}
        </VStack>
    );

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary }}>
            <Box sx={{ padding: Theme.spacing.md, paddingTop: Theme.spacing.xl, backgroundColor: colors.secondary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <HStack sx={{ alignItems: 'center', gap: Theme.spacing.md, marginBottom: Theme.spacing.lg }}>
                    <Pressable onPress={() => navigation.goBack()} onPressIn={() => hapticMedium()}>
                        <Icon as={ArrowLeftIcon} size="xl" color={colors.text} />
                    </Pressable>
                    <VStack>
                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>{studentName}</Heading>
                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>Classroom ID: {classroomId.slice(0, 8)}</Text>
                    </VStack>
                </HStack>

                <HStack sx={{ gap: Theme.spacing.md }}>
                    {(['overview', 'academics', 'observations'] as const).map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => {
                                hapticMedium();
                                setActiveTab(tab);
                            }}
                            sx={{
                                paddingBottom: Theme.spacing.sm,
                                borderBottomWidth: activeTab === tab ? 2 : 0,
                                borderBottomColor: Theme.colors.sanctuarySaffron,
                            }}
                        >
                            <Text sx={{
                                color: activeTab === tab ? colors.text : colors.textSecondary,
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                fontSize: Theme.typography.fontSize.sm,
                                textTransform: 'capitalize'
                            }}>
                                {t(`common.${tab}`) || tab}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
            </Box>

            <ScrollView
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {isLoading ? (
                    <Center sx={{ padding: 40 }}>
                        <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
                    </Center>
                ) : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'academics' && renderAcademics()}
                        {activeTab === 'observations' && renderObservations()}
                    </>
                )}
            </ScrollView>
        </VStack>
    );
}
