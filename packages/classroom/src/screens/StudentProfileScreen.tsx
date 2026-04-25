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
    Pressable,
    Card,
    Center,
} from '@repo/ui';
import {
    ArrowLeft,
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
        <VStack className="gap-lg p-md">
            <HStack className="gap-md">
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <VStack className="items-center gap-xs">
                        <Calendar size={20} color={Theme.colors.sanctuarySaffron} />
                        <Heading className="text-xl" style={{ color: colors.text }}>
                            {attendanceRate}%
                        </Heading>
                        <Text className="text-[10px]" style={{ color: colors.textSecondary }}>{t('student.attendance') || 'Attendance'}</Text>
                    </VStack>
                </Card>
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <VStack className="items-center gap-xs">
                        <Trophy size={20} color={Theme.colors.amberGlow} />
                        <Heading className="text-xl" style={{ color: colors.text }}>
                            {latestGrade?.grade ? latestGrade.grade : 'N/A'}
                        </Heading>
                        <Text className="text-[10px]" style={{ color: colors.textSecondary }}>{t('student.currentGrade') || 'Current Grade'}</Text>
                    </VStack>
                </Card>
            </HStack>
            <HStack className="gap-md">
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <VStack className="items-center gap-xs">
                        <Clock3 size={20} color={Theme.colors.gurudeviBlue} />
                        <Heading className="text-xl" style={{ color: colors.text }}>
                            {snapshotRecords.length}
                        </Heading>
                        <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                            {t('student.snapshotRecords') || 'As-of Records'}
                        </Text>
                    </VStack>
                </Card>
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <VStack className="items-center gap-xs">
                        <ShieldCheck size={20} color={Theme.colors.sageGreen} />
                        <Heading className="text-xl" style={{ color: colors.text }}>
                            {timeline.length}
                        </Heading>
                        <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                            {t('student.timelineEvents') || 'Timeline Events'}
                        </Text>
                    </VStack>
                </Card>
            </HStack>
            <VStack className="gap-sm">
                <Heading className="text-md" style={{ color: colors.text }}>
                    {t('student.recentActivity') || 'Recent Activity'}
                </Heading>
                {latestTimelineEvents.map((event) => (
                    <Box
                        key={event.id}
                        className="p-md rounded-comfortable border-l-[4px]"
                        style={{
                            backgroundColor: colors.secondary,
                            borderLeftColor: event.entity_type === 'grade' ? Theme.colors.amberGlow : Theme.colors.border,
                        }}
                    >
                        <Text className="text-sm" style={{ color: colors.text }}>
                            {formatTimelineTitle(event)}
                        </Text>
                        <Text className="text-[10px] mt-1" style={{ color: colors.textTertiary }}>
                            {new Date(formatTimelineMeta(event)).toLocaleDateString()}
                        </Text>
                    </Box>
                ))}
                {latestTimelineEvents.length === 0 && (
                    <Text className="italic text-center p-5" style={{ color: colors.textTertiary }}>
                        {t('student.noTimelineEvents') || 'No longitudinal events recorded yet.'}
                    </Text>
                )}
            </VStack>
        </VStack>
    );

    const renderTimeline = () => (
        <VStack className="gap-md p-md">
            <HStack className="gap-md">
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <Text className="text-[11px]" style={{ color: colors.textSecondary }}>{'Attendance'}</Text>
                    <Heading className="text-lg" style={{ color: colors.text }}>{timelineSummary.attendanceEvents}</Heading>
                </Card>
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <Text className="text-[11px]" style={{ color: colors.textSecondary }}>{'Grades'}</Text>
                    <Heading className="text-lg" style={{ color: colors.text }}>{timelineSummary.gradeEvents}</Heading>
                </Card>
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <Text className="text-[11px]" style={{ color: colors.textSecondary }}>{'Observations'}</Text>
                    <Heading className="text-lg" style={{ color: colors.text }}>{timelineSummary.observationEvents}</Heading>
                </Card>
            </HStack>
            <HStack className="gap-md">
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <Text className="text-[11px]" style={{ color: colors.textSecondary }}>{'Submissions'}</Text>
                    <Heading className="text-lg" style={{ color: colors.text }}>{timelineSummary.submissionEvents}</Heading>
                </Card>
                <Card className="flex-1 p-md" style={{ backgroundColor: colors.secondary }}>
                    <Text className="text-[11px]" style={{ color: colors.textSecondary }}>{'Notes'}</Text>
                    <Heading className="text-lg" style={{ color: colors.text }}>{timelineSummary.studyNoteEvents}</Heading>
                </Card>
            </HStack>
            {timeline.length === 0 ? (
                <Text className="italic text-center p-10" style={{ color: colors.textTertiary }}>
                    {t('student.noTimeline') || 'No timeline data available for this student yet.'}
                </Text>
            ) : (
                timeline.map((event) => (
                    <Box key={event.id} className="p-md rounded-comfortable" style={{ backgroundColor: colors.secondary }}>
                        <HStack className="justify-between items-center mb-1.5">
                            <Text className="font-bold capitalize" style={{ color: colors.text }}>
                                {formatTimelineTitle(event)}
                            </Text>
                            <Text className="text-[10px]" style={{ color: colors.textTertiary }}>
                                {new Date(event.recorded_at).toLocaleDateString()}
                            </Text>
                        </HStack>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            {event.snapshot ? JSON.stringify(event.snapshot).slice(0, 100) + '...' : 'Details noted in history'}
                        </Text>
                    </Box>
                ))
            )}
        </VStack>
    );

    const renderAcademics = () => (
        <VStack className="gap-md p-md">
            {grades.length === 0 && (
                <Text className="italic text-center p-10" style={{ color: colors.textTertiary }}>
                    {t('student.noGrades') || 'No academic records found.'}
                </Text>
            )}
            {grades.map((grade) => (
                <HStack key={grade.id} className="justify-between items-center p-md rounded-comfortable" style={{ backgroundColor: colors.secondary }}>
                    <VStack>
                        <Text className="font-bold" style={{ color: colors.text }}>{t('common.assignment') || 'Assignment'} {grade.assignment_id?.slice(0, 4)}</Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'}</Text>
                    </VStack>
                    <Box className="px-3 py-1 rounded-tight" style={{ backgroundColor: colors.tertiary }}>
                        <Text className="font-bold" style={{ color: Theme.colors.amberGlow }}>{grade.marks}%</Text>
                    </Box>
                </HStack>
            ))}
        </VStack>
    );

    const renderObservations = () => (
        <VStack className="gap-md p-md">
            <HStack className="justify-between items-center">
                <Heading className="text-md" style={{ color: colors.text }}>
                    {t('student.governanceNotes') || 'Professional Governance'}
                </Heading>
                <Lock size={16} color={colors.textTertiary} />
            </HStack>
            {observations.length === 0 && (
                <Text className="italic text-center p-10" style={{ color: colors.textTertiary }}>
                    {t('student.noNotes') || 'No professional notes recorded.'}
                </Text>
            )}
            {observations.map((obs) => (
                <Box key={obs.id} className="p-md rounded-comfortable" style={{ backgroundColor: colors.secondary }}>
                    <HStack className="justify-between mb-2">
                        <Box className="px-2 py-0.5 rounded" style={{ backgroundColor: obs.observation_type === 'positive' ? 'rgba(255,184,0,0.1)' : colors.tertiary }}>
                            <Text className="text-[10px] font-bold uppercase" style={{ color: obs.observation_type === 'positive' ? Theme.colors.sanctuarySaffron : colors.textSecondary }}>
                                {obs.observation_type}
                            </Text>
                        </Box>
                    </HStack>
                    <Text style={{ color: colors.text }}>{obs.content}</Text>
                    <HStack className="gap-2 mt-2 items-center">
                        <Text className="text-[10px]" style={{ color: colors.textTertiary }}>{obs.created_at ? new Date(obs.created_at).toLocaleDateString() : 'N/A'}</Text>
                    </HStack>
                </Box>
            ))}
        </VStack>
    );

    return (
        <VStack className="flex-1" style={{ backgroundColor: colors.primary }}>
            <Box className="p-md pt-xl border-b" style={{ backgroundColor: colors.secondary, borderBottomColor: colors.border }}>
                <HStack className="items-center gap-md mb-lg">
                    <Pressable onPress={() => navigation.goBack()} onPressIn={() => hapticMedium()}>
                        <Icon as={ArrowLeft} size="xl" color={colors.text} />
                    </Pressable>
                    <VStack>
                        <Heading className="text-lg" style={{ color: colors.text }}>{studentName}</Heading>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Classroom ID: {classroomId?.slice(0, 8)}</Text>
                    </VStack>
                </HStack>

                <HStack className="gap-md">
                    {(['overview', 'academics', 'observations', 'timeline'] as const).map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => {
                                hapticMedium();
                                setActiveTab(tab);
                            }}
                            className="pb-sm"
                            style={{
                                borderBottomWidth: activeTab === tab ? 2 : 0,
                                borderBottomColor: Theme.colors.sanctuarySaffron,
                            }}
                        >
                            <Text 
                                className="text-sm capitalize"
                                style={{
                                    color: activeTab === tab ? colors.text : colors.textSecondary,
                                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                                }}
                            >
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
                    <Center className="p-10">
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
