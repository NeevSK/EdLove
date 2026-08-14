import type { GradeMarkLifecycleContext } from '@repo/classroom/hooks/useGradebook';
import { api, type StudentObservation } from '@repo/core/api/client';
import type { AttendanceRecord, StudentGrade } from '@repo/core/types';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Card } from '@repo/ui/components/SanctuaryCard';
import { Activity, Calendar, ChevronRight, TrendingUp } from '@repo/ui/icons';
import { Box, Center, Heading, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ClassroomHolisticInsightsProps {
  classroomId: string;
  gradeMarkLifecycleContext?: GradeMarkLifecycleContext;
}

export default function ClassroomHolisticInsights({
  classroomId,
  gradeMarkLifecycleContext,
}: ClassroomHolisticInsightsProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    attendance: AttendanceRecord[];
    grades: StudentGrade[];
    observations: StudentObservation[];
  }>({ attendance: [], grades: [], observations: [] });
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      if (!gradeMarkLifecycleContext) {
        throw new Error(
          'Insights require GradeMark lifecycle context: schoolId, academicCycleId, gradeClassId, termId, and subjectId.',
        );
      }
      const today = new Date().toISOString().split('T')[0] ?? '';
      const [attendanceSnapshot, gradebookSnapshot, obsData] = await Promise.all([
        api.attendance.getClassroomAttendanceSnapshot(classroomId ?? '', today),
        api.grading.getGradebookSnapshot(gradeMarkLifecycleContext, today),
        api.studentObservations.getForClassroom(classroomId ?? ''),
      ]);

      setData({
        attendance: (attendanceSnapshot.records as any[]).map((r) => ({
          ...r,
          id: r.id || `temp-${Math.random()}`,
        })) as AttendanceRecord[],
        grades: gradebookSnapshot.gradeMarks,
        observations: obsData,
      });
    } catch (error) {
      console.error('Failed to fetch classroom insights:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to fetch classroom insights');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, gradeMarkLifecycleContext]);

  useEffect(() => {
    if (classroomId) {
      fetchData();
    }
  }, [classroomId, fetchData]);

  const stats = useMemo(() => {
    const totalGrades = data.grades.length;
    const avgGpa =
      totalGrades > 0
        ? (data.grades.reduce((acc, g) => acc + (g.gpa || 0), 0) / totalGrades).toFixed(2)
        : '0.00';

    const positiveObs = data.observations.filter((o) => o.observation_type === 'positive').length;
    const concernObs = data.observations.filter((o) => o.observation_type === 'concern').length;

    const attendanceRate =
      data.attendance.length > 0
        ? Math.round(
            (data.attendance.filter((a) => a.status === 'present').length /
              data.attendance.length) *
              100,
          )
        : 0;

    return { avgGpa, positiveObs, concernObs, attendanceRate };
  }, [data]);

  if (isLoading) {
    return (
      <Center className="flex-1 p-10">
        <BrandPulse size={28} tintColor="#F6BF8C" accessibilityLabel="Loading classroom insights" />
      </Center>
    );
  }

  if (loadError) {
    return (
      <Center className="flex-1 p-10">
        <Text className="text-chestnutRed font-bold text-center">{loadError}</Text>
      </Center>
    );
  }

  return (
    <VStack className="gap-6 p-4">
      <HStack className="gap-4">
        <Card className="flex-1 p-4 bg-phase-surface rounded-comfortable border-0">
          <VStack className="gap-1">
            <HStack className="items-center gap-1.5">
              <Icon as={TrendingUp} size="xs" className="text-templeGold" />
              <Text className="text-[10px] text-phaseText-secondary font-black uppercase tracking-widest">
                {t('insights.avgGpa') || 'AVG GPA'}
              </Text>
            </HStack>
            <Heading className="text-2xl font-black text-phaseText-primary">{stats.avgGpa}</Heading>
          </VStack>
        </Card>
        <Card className="flex-1 p-4 bg-phase-surface rounded-comfortable border-0">
          <VStack className="gap-1">
            <HStack className="items-center gap-1.5">
              <Icon as={Calendar} size="xs" className="text-templeGold" />
              <Text className="text-[10px] text-phaseText-secondary font-black uppercase tracking-widest">
                {t('insights.attendance') || 'TODAY'}
              </Text>
            </HStack>
            <Heading className="text-2xl font-black text-phaseText-primary">
              {stats.attendanceRate}%
            </Heading>
          </VStack>
        </Card>
      </HStack>

      <Card className="p-6 bg-phase-surface rounded-generous border-0">
        <VStack className="gap-6">
          <HStack className="justify-between items-center">
            <VStack>
              <Heading className="text-lg font-black text-phaseText-primary">
                {t('insights.growthPulse') || 'Growth Pulse'}
              </Heading>
              <Text className="text-xs text-phaseText-secondary">
                {t('insights.observationSummary') || 'Collective teacher observations'}
              </Text>
            </VStack>
            <Icon as={Activity} size="md" className="text-templeGold" />
          </HStack>

          <HStack className="gap-4">
            <VStack className="flex-1 bg-templeGold/10 p-4 rounded-comfortable">
              <Heading className="text-templeGold text-xl font-black">{stats.positiveObs}</Heading>
              <Text className="text-[10px] text-phaseText-secondary font-bold uppercase">
                {t('insights.positiveNotes') || 'Positive'}
              </Text>
            </VStack>
            <VStack className="flex-1 bg-emberRed/10 p-4 rounded-comfortable">
              <Heading className="text-emberRed text-xl font-black">{stats.concernObs}</Heading>
              <Text className="text-[10px] text-phaseText-secondary font-bold uppercase">
                {t('insights.areasOfConcern') || 'Concerns'}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>

      <VStack className="gap-3">
        <Heading className="text-xs text-phaseText-secondary font-black uppercase tracking-[0.2em]">
          {t('insights.recentActivity') || 'Recent Class Activity'}
        </Heading>
        {data.observations.length === 0 && (
          <Text className="text-phaseText-tertiary italic text-center py-5">
            {t('insights.noActivity') || 'No recent activity recorded.'}
          </Text>
        )}
        {data.observations.slice(0, 4).map((obs) => (
          <Box
            key={obs.id}
            className={`p-4 bg-phase-surface rounded-comfortable border-l-4 ${obs.observation_type === 'positive' ? 'border-templeGold' : 'border-phase-canvas'}`}
          >
            <HStack className="justify-between items-start">
              <VStack className="flex-1 pr-2">
                <Text className="text-phaseText-primary text-sm font-medium leading-relaxed">
                  {obs.content}
                </Text>
                <Text className="text-[10px] text-phaseText-tertiary mt-1.5 font-bold">
                  {obs.author?.full_name} &bull; {new Date(obs.created_at).toLocaleDateString()}
                </Text>
              </VStack>
              <Icon as={ChevronRight} size="sm" className="text-phaseText-tertiary" />
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
}
