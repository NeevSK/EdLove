import { assignmentsAPI } from '@repo/core/api';

import { Award, BookMarked } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';

import { useEffect, useMemo, useState } from 'react';

interface GradeRow {
  id: string;
  grade: number;
  feedback: string | null;
  submitted_at: string;
  assignments: { title: string } | null;
  classrooms: { name: string } | null;
}

interface StudentGradesOverviewProps {
  userId?: string;
  isDemo?: boolean;
}

const DEMO_GRADES: GradeRow[] = [
  {
    id: 'demo-grade-1',
    grade: 86,
    feedback: 'Clear reasoning and careful presentation.',
    submitted_at: new Date().toISOString(),
    assignments: { title: 'Wave Function Practice' },
    classrooms: { name: 'Grade 10 Mathematics' },
  },
  {
    id: 'demo-grade-2',
    grade: 73,
    feedback: 'Good improvement. Keep refining your lab conclusions.',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    assignments: { title: 'Photosynthesis Lab Report' },
    classrooms: { name: 'Grade 11 Science' },
  },
];

function resolveGradeColorClass(grade: number) {
  if (grade >= 75) return 'text-sanctuary-success';
  if (grade >= 50) return 'text-sanctuarySaffron';
  return 'text-sanctuary-error';
}

function resolveGradeBgClass(grade: number) {
  if (grade >= 75) return 'bg-sanctuary-success/10 border-sanctuary-success/20';
  if (grade >= 50) return 'bg-sanctuarySaffron/10 border-sanctuarySaffron/20';
  return 'bg-sanctuary-error/10 border-sanctuary-error/20';
}

export function StudentGradesOverview({ userId, isDemo = false }: StudentGradesOverviewProps) {
  const [grades, setGrades] = useState<GradeRow[]>(isDemo ? DEMO_GRADES : []);
  const [isLoading, setIsLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) {
      setGrades(DEMO_GRADES);
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setGrades([]);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadGrades = async () => {
      setIsLoading(true);

      try {
        const data = await assignmentsAPI.getRecentGradesOverviewForStudent(userId, 4);

        if (!isActive) return;

        setGrades(
          ((data as GradeRow[] | null) ?? []).filter((row) => typeof row.grade === 'number'),
        );
      } catch {
        if (!isActive) return;
        setGrades([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadGrades();

    return () => {
      isActive = false;
    };
  }, [isDemo, userId]);

  const summary = useMemo(() => {
    if (grades.length === 0) {
      return { count: 0, average: null as number | null };
    }

    const total = grades.reduce((sum, item) => sum + item.grade, 0);
    return {
      count: grades.length,
      average: Math.round(total / grades.length),
    };
  }, [grades]);

  if (isLoading) {
    return (
      <VStack className="gap-3">
        <SkeletonCard height={84} />
        <SkeletonCard height={84} />
      </VStack>
    );
  }

  return (
    <VStack className="gap-4">
      <HStack className="gap-4">
        <Box className="flex-1 rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-5">
          <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-widest">
            Recent grades
          </Text>
          <Text className="mt-2 text-2xl font-black text-sanctuary-text tracking-tighter">
            {summary.count}
          </Text>
        </Box>
        <Box className="flex-1 rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-5">
          <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-widest">
            Average
          </Text>
          <Text
            className={`mt-2 text-2xl font-black tracking-tighter ${summary.average === null ? 'text-sanctuary-text-tertiary' : resolveGradeColorClass(summary.average)}`}
          >
            {summary.average === null ? '--' : `${summary.average}%`}
          </Text>
        </Box>
      </HStack>

      {grades.length > 0 ? (
        grades.slice(0, 3).map((item) => (
          <HStack
            key={item.id}
            className="items-center gap-4 rounded-[24px] border border-sanctuary-border bg-sanctuary-surface p-5"
          >
            <Box
              className={`w-12 h-12 items-center justify-center rounded-2xl border ${resolveGradeBgClass(item.grade)}`}
            >
              <Icon as={Award} size="sm" className={resolveGradeColorClass(item.grade)} />
            </Box>
            <VStack className="flex-1 gap-1">
              <Text className="text-sanctuary-text text-sm font-black tracking-tight">
                {item.assignments?.title ?? 'Assignment'}
              </Text>
              <Text className="text-sanctuary-text-secondary text-xs font-semibold">
                {item.classrooms?.name ?? 'Classroom'}
              </Text>
              {item.feedback ? (
                <Text
                  className="text-sanctuary-text-tertiary text-[11px] leading-relaxed italic mt-1"
                  numberOfLines={1}
                >
                  {item.feedback}
                </Text>
              ) : null}
            </VStack>
            <Text
              className={`text-base font-black tracking-tighter ${resolveGradeColorClass(item.grade)}`}
            >
              {item.grade}%
            </Text>
          </HStack>
        ))
      ) : (
        <Box className="rounded-[24px] border border-sanctuary-border bg-sanctuary-surface-secondary p-5">
          <HStack className="items-start gap-4">
            <Box className="w-10 h-10 bg-sanctuary-surface-tertiary rounded-xl items-center justify-center border border-sanctuary-border/30">
              <Icon as={BookMarked} size="xs" className="text-sanctuary-text-tertiary" />
            </Box>
            <VStack className="flex-1 gap-1">
              <Text className="text-sanctuary-text text-sm font-black tracking-tight">
                No graded submissions yet
              </Text>
              <Text className="text-sanctuary-text-secondary text-xs font-medium leading-relaxed">
                Your academic mirror will fill in as teachers mark your work.
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}
