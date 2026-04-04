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
    Pressable,
    Card,
    Center,
} from '@repo/ui';
import {
    Calendar,
    Trophy,
    ShieldCheck,
    Lock,
    Clock3
} from 'lucide-react-native';
import { api, StudentObservation, AttendanceRecord, StudentGrade, StudentLongitudinalEvent, useTemporalStore } from '@repo/core';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function StudentProfileScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { studentId, classroomId, studentName, classroomStudentId } = route.params;
    const { viewDate } = useTemporalStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'observations' | 'timeline'>('overview');

    // Data states
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [observations, setObservations] = useState<StudentObservation[]>([]);
    const [timeline, setTimeline] = useState<StudentLongitudinalEvent[]>([]);
    const [snapshotRecords, setSnapshotRecords] = useState<StudentLongitudinalEvent[]>([]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [attData, gradeData, obsData, timelineData, snapshotData] = await Promise.all([
                api.attendance.getStudentAttendanceTimeline(studentId, { classroomId }),
                api.grading.getStudentGradeTimeline(studentId, { classroomId }),
                api.studentObservations.getForEnrollment(classroomStudentId),
                api.longitudinal.getStudentTimeline(studentId, viewDate, ['enrollment', 'attendance', 'grade', 'observation', 'submission', 'study_note']),
                api.longitudinal.getStudentSnapshotAsOf(studentId, viewDate, ['enrollment', 'attendance', 'grade', 'observation', 'submission', 'study_note']),
            ]);
            setAttendance(attData || []);
            setGrades(gradeData || []);
            setObservations(obsData || []);
            setTimeline(timelineData?.events || []);
            setSnapshotRecords(snapshotData?.records || []);
        } catch (error) {
            console.error('Failed to fetch student data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentId, classroomId, viewDate]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        : 100;
    const latestGrade = grades[0];
    const latestTimelineEvents = timeline.slice(0, 6);

    const timelineSummary = {
        attendanceEvents: timeline.filter((event) => event.entity_type === 'attendance').length,
        gradeEvents: timeline.filter((event) => event.entity_type === 'grade').length,
        observationEvents: timeline.filter((event) => event.entity_type === 'observation').length,
        submissionEvents: timeline.filter((event) => event.entity_type === 'submission').length,
        studyNoteEvents: timeline.filter((event) => event.entity_type === 'study_note').length,
    };

    const formatTimelineTitle = (event: StudentLongitudinalEvent) => {
        switch (event.entity_type) {
            case 'attendance':
                return `Attendance ${event.snapshot?.status ?? event.operation}`;
            case 'grade':
                return `Grade ${event.snapshot?.grade ?? event.snapshot?.marks ?? ''}`.trim();
            case 'observation':
                return 'Observation recorded';
            case 'enrollment':
                return 'Enrollment update';
            case 'guardian_relationship':
                return 'Guardian relationship update';
            case 'submission':
                return `Submission ${event.snapshot?.assignment_id ? 'recorded' : event.operation}`;
            case 'study_note':
                return 'Study note updated';
            default:
                return event.entity_type;
        }
    };

    const formatTimelineMeta = (event: StudentLongitudinalEvent) => {
        switch (event.entity_type) {
            case 'attendance':
                return event.snapshot?.date ?? event.occurred_at;
            case 'grade':
                return event.snapshot?.published_at ?? event.snapshot?.updated_at ?? event.occurred_at;
            case 'observation':
                return event.snapshot?.observation_type ?? event.occurred_at;
            case 'enrollment':
                return event.snapshot?.classroom_id ?? event.occurred_at;
            case 'submission':
                return event.snapshot?.submitted_at ?? event.occurred_at;
            case 'study_note':
                return event.snapshot?.updated_at ?? event.snapshot?.created_at ?? event.occurred_at;
            default:
                return event.occurred_at;
        }
    };

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
                            {latestGrade?.grade ? latestGrade.grade : 'N/A'}
                        </Heading>
                        <Text sx={{ fontSize: 10, color: colors.textSecondary }}>{t('student.currentGrade') || 'Current Grade'}</Text>
                    </VStack>
                </Card>
            </HStack>
            <HStack sx={{ gap: Theme.spacing.md }}>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <VStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                        <Clock3 size={20} color={Theme.colors.gurudeviBlue} />
                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: colors.text }}>
                            {snapshotRecords.length}
                        </Heading>
                        <Text sx={{ fontSize: 10, color: colors.textSecondary }}>
                            {t('student.snapshotRecords') || 'As-of Records'}
                        </Text>
                    </VStack>
                </Card>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <VStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                        <ShieldCheck size={20} color={Theme.colors.sageGreen} />
                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: colors.text }}>
                            {timeline.length}
                        </Heading>
                        <Text sx={{ fontSize: 10, color: colors.textSecondary }}>
                            {t('student.timelineEvents') || 'Timeline Events'}
                        </Text>
                    </VStack>
                </Card>
            </HStack>
            <VStack sx={{ gap: Theme.spacing.sm }}>
                <Heading sx={{ fontSize: Theme.typography.fontSize.md, color: colors.text }}>
                    {t('student.recentActivity') || 'Recent Activity'}
                </Heading>
                {latestTimelineEvents.map((event) => (
                    <Box
                        key={event.id}
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            borderLeftWidth: 4,
                            borderLeftColor: event.entity_type === 'grade' ? Theme.colors.amberGlow : Theme.colors.border,
                        }}
                    >
                        <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.sm }}>
                            {formatTimelineTitle(event)}
                        </Text>
                        <Text sx={{ color: colors.textTertiary, fontSize: 10, marginTop: 4 }}>
                            {new Date(formatTimelineMeta(event)).toLocaleDateString()}
                        </Text>
                    </Box>
                ))}
                {latestTimelineEvents.length === 0 && (
                    <Text sx={{ color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                        {t('student.noTimelineEvents') || 'No longitudinal events recorded yet.'}
                    </Text>
                )}
            </VStack>
        </VStack>
    );

    const renderTimeline = () => (
        <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}>
            <HStack sx={{ gap: Theme.spacing.md }}>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 11 }}>{'Attendance'}</Text>
                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>{timelineSummary.attendanceEvents}</Heading>
                </Card>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 11 }}>{'Grades'}</Text>
                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>{timelineSummary.gradeEvents}</Heading>
                </Card>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 11 }}>{'Observations'}</Text>
                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>{timelineSummary.observationEvents}</Heading>
                </Card>
            </HStack>
            <HStack sx={{ gap: Theme.spacing.md }}>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 11 }}>{'Submissions'}</Text>
                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>{timelineSummary.submissionEvents}</Heading>
                </Card>
                <Card sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 11 }}>{'Notes'}</Text>
                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>{timelineSummary.studyNoteEvents}</Heading>
                </Card>
            </HStack>
            {timeline.length === 0 ? (
                <Text sx={{ color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', padding: 40 }}>
                    {t('student.noTimeline') || 'No timeline data available for this student yet.'}
                </Text>
            ) : (
                timeline.map((event) => (
                    <Box key={event.id} sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text sx={{ color: colors.text, fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {formatTimelineTitle(event)}
                            </Text>
                            <Text sx={{ color: colors.textTertiary, fontSize: 10 }}>
                                {new Date(event.recorded_at).toLocaleDateString()}
                            </Text>
                        </HStack>
                        <Text sx={{ color: colors.textSecondary, fontSize: 12 }}>
                            {event.snapshot ? JSON.stringify(event.snapshot).slice(0, 100) + '...' : 'Details noted in history'}
                        </Text>
                    </Box>
                ))
            )}
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
                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>{grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'}</Text>
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
                    </HStack>
                    <Text sx={{ color: colors.text }}>{obs.content}</Text>
                    <HStack sx={{ gap: 8, marginTop: 8, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>{obs.created_at ? new Date(obs.created_at).toLocaleDateString() : 'N/A'}</Text>
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
                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>Classroom ID: {classroomId?.slice(0, 8)}</Text>
                    </VStack>
                </HStack>

                <HStack sx={{ gap: Theme.spacing.md }}>
                    {(['overview', 'academics', 'observations', 'timeline'] as const).map((tab) => (
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
                        {activeTab === 'timeline' && renderTimeline()}
                    </>
                )}
            </ScrollView>
        </VStack>
    );
}
