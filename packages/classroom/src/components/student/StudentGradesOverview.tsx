import React, { useEffect, useMemo, useState } from 'react';
import { Award, BookMarked } from 'lucide-react-native';
import { Box, HStack, SkeletonCard, Text, VStack, Theme, colors } from '@repo/ui';
import { supabase } from '@repo/core';

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
    classrooms: { name: 'Grade 10 Mathematics' }
  },
  {
    id: 'demo-grade-2',
    grade: 73,
    feedback: 'Good improvement. Keep refining your lab conclusions.',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    assignments: { title: 'Photosynthesis Lab Report' },
    classrooms: { name: 'Grade 11 Science' }
  },
];

function resolveGradeTone(grade: number) {
  if (grade >= 75) return colors.sageGreen;
  if (grade >= 50) return colors.amberGlow;
  return colors.emberRed;
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
        const { data } = await supabase
          .from('submissions')
          .select('id, grade, feedback, submitted_at, assignments(title), classrooms(name)')
          .eq('student_id', userId)
          .not('grade', 'is', null)
          .order('submitted_at', { ascending: false })
          .limit(4);

        if (!isActive) return;

        setGrades(((data as GradeRow[] | null) ?? []).filter((row) => typeof row.grade === 'number'));
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
      average: Math.round(total / grades.length)
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
    <VStack className="gap-3">
      <HStack className="gap-3">
        <Box className="flex-1 rounded-xl border border-phase-border bg-phase-sunlight p-4">
          <Text className="text-phaseText-secondary text-[11px] font-bold uppercase">Recent grades</Text>
          <Text className="mt-1 text-2xl font-bold text-phaseText-primary">{summary.count}</Text>
        </Box>
        <Box className="flex-1 rounded-xl border border-phase-border bg-phase-sunlight p-4">
          <Text className="text-phaseText-secondary text-[11px] font-bold uppercase">Average</Text>
          <Text className="mt-1 text-2xl font-bold"
            style={{ color: summary.average === null ? colors.textSecondary : resolveGradeTone(summary.average) }}
          >
            {summary.average === null ? '--' : `${summary.average}%`}
          </Text>
        </Box>
      </HStack>

      {grades.length > 0 ? (
        grades.slice(0, 3).map((item) => (
          <HStack
            key={item.id}
            className="items-start gap-3 rounded-xl border border-phase-border bg-phase-sunlight p-4"
          >
            <Box
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.silk,
                borderWidth: 1,
                borderColor: resolveGradeTone(item.grade)
              }}
            >
              <Award size={18} color={resolveGradeTone(item.grade)} />
            </Box>
            <VStack className="flex-1 gap-1">
              <Text className="text-phaseText-primary text-[13px] font-bold">
                {item.assignments?.title ?? 'Assignment'}
              </Text>
              <Text className="text-phaseText-secondary text-[12px]">
                {item.classrooms?.name ?? 'Classroom'}
              </Text>
              {item.feedback ? (
                <Text className="text-phaseText-secondary text-[12px]">{item.feedback}</Text>
              ) : null}
            </VStack>
            <Text className="text-[13px] font-bold" style={{ color: resolveGradeTone(item.grade) }}>
              {item.grade}%
            </Text>
          </HStack>
        ))
      ) : (
        <Box className="rounded-xl border border-phase-border bg-phase-sunlight p-4">
          <HStack className="items-start gap-3">
            <BookMarked size={18} className="text-phaseText-secondary" />
            <VStack className="flex-1 gap-1">
              <Text className="text-phaseText-primary text-[13px] font-bold">
                No graded submissions yet
              </Text>
              <Text className="text-phaseText-secondary text-[12px]">
                Your academic mirror will fill in as teachers mark your work.
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}

