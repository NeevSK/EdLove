import { api, type StudentObservation } from '@repo/core/api';
import { useTemporalStore } from '@repo/core/logic';
import type { StudentLongitudinalEvent } from '@repo/core';
import type { StudentGrade } from '@repo/core/types';
import type { AttendanceRecord } from '@repo/core/types';

import { Card } from '@repo/ui/components/SanctuaryCard';
import { useThemedColors } from '@repo/ui/hooks';
import { ArrowLeft, Calendar, Clock3, Lock, ShieldCheck, Trophy } from '@repo/ui/icons';
import {
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Pressable,
  RefreshControl,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticMedium } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StudentProfileScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const router = useRouter();
  const {
    studentId = '',
    classroomId = '',
    studentName = 'Student',
    classroomStudentId = '',
  } = useLocalSearchParams<{
    studentId?: string;
    classroomId?: string;
    studentName?: string;
    classroomStudentId?: string;
  }>();
  const { viewDate } = useTemporalStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'academics' | 'observations' | 'timeline'
  >('overview');

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
        api.attendance.getStudentAttendanceTimeline(studentId, {
          classroomId,
        }),
        api.grading.getStudentGradeTimeline(studentId, { classroomId }),
        api.studentObservations.getForEnrollment(classroomStudentId),
        api.longitudinal.getStudentTimeline(studentId, viewDate, [
          'enrollment',
          'attendance',
          'grade',
          'observation',
          'submission',
          'study_note',
        ]),
        api.longitudinal.getStudentSnapshotAsOf(studentId, viewDate, [
          'enrollment',
          'attendance',
          'grade',
          'observation',
          'submission',
          'study_note',
        ]),
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
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const attendanceRate =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100,
        )
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

  const formatTimelineTitle = (event: StudentLongitudinalEvent): string => {
    const snap = event.snapshot as any;
    switch (event.entity_type) {
      case 'attendance':
        return `Attendance ${snap?.status ?? event.operation}`;
      case 'grade':
        return `Grade ${snap?.grade ?? snap?.marks ?? ''}`.trim();
      case 'observation':
        return 'Observation recorded';
      case 'enrollment':
        return 'Enrollment update';
      case 'guardian_relationship':
        return 'Guardian relationship update';
      case 'submission':
        return `Submission ${snap?.assignment_id ? 'recorded' : event.operation}`;
      case 'study_note':
        return 'Study note updated';
      default:
        return (event.entity_type as string) || '';
    }
  };

  const formatTimelineMeta = (event: StudentLongitudinalEvent): any => {
    const snap = event.snapshot as any;
    switch (event.entity_type) {
      case 'attendance':
        return snap?.date ?? event.occurred_at;
      case 'grade':
        return snap?.published_at ?? snap?.updated_at ?? event.occurred_at;
      case 'observation':
        return snap?.observation_type ?? event.occurred_at;
      case 'enrollment':
        return snap?.classroom_id ?? event.occurred_at;
      case 'submission':
        return snap?.submitted_at ?? event.occurred_at;
      case 'study_note':
        return snap?.updated_at ?? snap?.created_at ?? event.occurred_at;
      default:
        return event.occurred_at;
    }
  };

  const renderOverview = () => (
    <VStack className="gap-lg p-md">
      <HStack className="gap-md">
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <VStack className="items-center gap-xs">
            <Icon as={Calendar} size={20} color={Theme.colors.sanctuarySaffron} />
            <Heading className="text-xl text-phase-text-primary">{attendanceRate}%</Heading>
            <Text className="text-[10px] text-phase-text-secondary">
              {t('student.attendance') || 'Attendance'}
            </Text>
          </VStack>
        </Card>
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <VStack className="items-center gap-xs">
            <Icon as={Trophy} size={20} color={Theme.colors.amberGlow} />
            <Heading className="text-xl text-phase-text-primary">
              {latestGrade?.grade ? latestGrade.grade : 'N/A'}
            </Heading>
            <Text className="text-[10px] text-phase-text-secondary">
              {(t('student.currentGrade') as any) || 'Current Grade'}
            </Text>
          </VStack>
        </Card>
      </HStack>
      <HStack className="gap-md">
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <VStack className="items-center gap-xs">
            <Icon as={Clock3} size={20} color={Theme.colors.gurudeviBlue} />
            <Heading className="text-xl text-phase-text-primary">{snapshotRecords.length}</Heading>
            <Text className="text-[10px] text-phase-text-secondary">
              {(t('student.snapshotRecords') as any) || 'As-of Records'}
            </Text>
          </VStack>
        </Card>
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <VStack className="items-center gap-xs">
            <Icon as={ShieldCheck} size={20} color={Theme.colors.sageGreen} />
            <Heading className="text-xl text-phase-text-primary">{timeline.length}</Heading>
            <Text className="text-[10px] text-phase-text-secondary">
              {(t('student.timelineEvents') as any) || 'Timeline Events'}
            </Text>
          </VStack>
        </Card>
      </HStack>
      <VStack className="gap-sm">
        <Heading size="sm" className="text-phase-text-primary">
          {(t('student.recentActivity') as any) || 'Recent Activity'}
        </Heading>
        {latestTimelineEvents.map((event: any) => (
          <Box
            key={event.id}
            className="p-md rounded-comfortable border-l-[4px] bg-phase-surface-secondary"
            style={{
              borderLeftColor:
                event.entity_type === 'grade' ? Theme.colors.amberGlow : colors.border,
            }}
          >
            <Text className="text-sm text-phase-text-primary">{formatTimelineTitle(event)}</Text>
            <Text className="text-[10px] mt-1 text-phase-text-tertiary">
              {new Date(formatTimelineMeta(event)).toLocaleDateString()}
            </Text>
          </Box>
        ))}
        {latestTimelineEvents.length === 0 && (
          <Text className="italic text-center p-5 text-phase-text-tertiary">
            {t('student.noTimelineEvents') || 'No longitudinal events recorded yet.'}
          </Text>
        )}
      </VStack>
    </VStack>
  );

  const renderTimeline = () => (
    <VStack className="gap-md p-md">
      <HStack className="gap-md">
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <Text className="text-[11px] text-phase-text-secondary">{'Attendance'}</Text>
          <Heading size="md" className="text-phase-text-primary">
            {timelineSummary.attendanceEvents}
          </Heading>
        </Card>
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <Text className="text-[11px] text-phase-text-secondary">{'Grades'}</Text>
          <Heading size="md" className="text-phase-text-primary">
            {timelineSummary.gradeEvents}
          </Heading>
        </Card>
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <Text className="text-[11px] text-phase-text-secondary">{'Observations'}</Text>
          <Heading size="md" className="text-phase-text-primary">
            {timelineSummary.observationEvents}
          </Heading>
        </Card>
      </HStack>
      <HStack className="gap-md">
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <Text className="text-[11px] text-phase-text-secondary">{'Submissions'}</Text>
          <Heading size="md" className="text-phase-text-primary">
            {timelineSummary.submissionEvents}
          </Heading>
        </Card>
        <Card className="flex-1 p-md bg-phase-surface-secondary">
          <Text className="text-[11px] text-phase-text-secondary">{'Notes'}</Text>
          <Heading size="md" className="text-phase-text-primary">
            {timelineSummary.studyNoteEvents}
          </Heading>
        </Card>
      </HStack>
      {timeline.length === 0 ? (
        <Text className="italic text-center p-10 text-phase-text-tertiary">
          {t('student.noTimeline') || 'No timeline data available for this student yet.'}
        </Text>
      ) : (
        timeline.map((event: any) => (
          <Box key={event.id} className="p-md rounded-comfortable bg-phase-surface-secondary">
            <HStack className="justify-between items-center mb-1.5">
              <Text className="font-bold capitalize text-phase-text-primary">
                {formatTimelineTitle(event)}
              </Text>
              <Text className="text-[10px] text-phase-text-tertiary">
                {new Date(event.recorded_at).toLocaleDateString()}
              </Text>
            </HStack>
            <Text className="text-xs text-phase-text-secondary">
              {event.snapshot
                ? `${JSON.stringify(event.snapshot).slice(0, 100)}...`
                : t('student.detailsInHistory') || 'Details noted in history'}
            </Text>
          </Box>
        ))
      )}
    </VStack>
  );

  const renderAcademics = () => (
    <VStack className="gap-md p-md">
      {grades.length === 0 && (
        <Text className="italic text-center p-10 text-phase-text-tertiary">
          {t('student.noGrades') || 'No academic records found.'}
        </Text>
      )}
      {grades.map((grade) => (
        <HStack
          key={grade.id}
          className="justify-between items-center p-md rounded-comfortable bg-phase-surface-secondary"
        >
          <VStack>
            <Text className="font-bold text-phase-text-primary">
              {t('common.assignment') || 'Assignment'} {grade.assignment_id?.slice(0, 4)}
            </Text>
            <Text className="text-xs text-phase-text-secondary">
              {grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </VStack>
          <Box className="px-3 py-1 rounded-tight bg-phase-surface">
            <Text className="font-bold text-sanctuarySaffron">{grade.marks}%</Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  );

  const renderObservations = () => (
    <VStack className="gap-md p-md">
      <HStack className="justify-between items-center">
        <Heading size="sm" className="text-phase-text-primary">
          {t('student.governanceNotes') || 'Professional Governance'}
        </Heading>
        <Icon as={Lock} size={16} color={colors.textTertiary} />
      </HStack>
      {observations.length === 0 && (
        <Text className="italic text-center p-10 text-phase-text-tertiary">
          {t('student.noNotes') || 'No professional notes recorded.'}
        </Text>
      )}
      {observations.map((obs) => (
        <Box key={obs.id} className="p-md rounded-comfortable bg-phase-surface-secondary">
          <HStack className="justify-between mb-2">
            <Box
              className="px-2 py-0.5 rounded"
              style={{
                backgroundColor:
                  obs.observation_type === 'positive' ? 'rgba(255,184,0,0.1)' : colors.tertiary,
              }}
            >
              <Text
                className="text-[10px] font-bold uppercase"
                style={{
                  color:
                    obs.observation_type === 'positive'
                      ? Theme.colors.sanctuarySaffron
                      : colors.textSecondary,
                }}
              >
                {obs.observation_type}
              </Text>
            </Box>
          </HStack>
          <Text className="text-phase-text-primary">{obs.content}</Text>
          <HStack className="gap-2 mt-2 items-center">
            <Text className="text-[10px] text-phase-text-tertiary">
              {obs.created_at ? new Date(obs.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </HStack>
        </Box>
      ))}
    </VStack>
  );

  return (
    <VStack className="flex-1 bg-phase-canvas">
      <Box className="p-md pt-xl border-b border-phase-border bg-phase-surface">
        <HStack className="items-center gap-md mb-lg">
          <Pressable onPress={() => safeBack('/workspace')} onPressIn={() => hapticMedium()}>
            <Icon as={ArrowLeft} size="xl" className="text-phase-text-primary" />
          </Pressable>
          <VStack>
            <Heading size="md" className="text-phase-text-primary">
              {studentName}
            </Heading>
            <Text className="text-xs text-phase-text-secondary">
              Classroom ID: {classroomId?.slice(0, 8)}
            </Text>
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
                className={`text-sm capitalize ${activeTab === tab ? 'text-phase-text-primary font-bold' : 'text-phase-text-secondary font-normal'}`}
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
            <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
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
