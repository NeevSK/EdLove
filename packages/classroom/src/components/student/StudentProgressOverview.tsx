import React, { useMemo } from 'react';
import { CheckCircle2, Sparkles, Target } from 'lucide-react-native';
import { Assignment } from '@repo/core';
import { Box, HStack, Text, VStack, Theme, colors } from '@repo/ui';

type GoalCard = {
  id: string;
  status: 'pending' | 'completed' | 'in_progress';
};

interface StudentProgressOverviewProps {
  assignments: Assignment[];
  goals: GoalCard[];
  growthPoints: number;
  badgeCount: number;
  isDemo?: boolean;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <Box className="h-[6px] rounded-[3px] bg-phase-innerCircle" style={{ overflow: 'hidden' }}>
      <Box className="h-[6px] rounded-[3px]" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
    </Box>
  );
}

export function StudentProgressOverview({
  assignments,
  goals,
  growthPoints,
  badgeCount,
  isDemo = false }: StudentProgressOverviewProps) {
  const metrics = useMemo(() => {
    const totalAssignments = isDemo ? 5 : assignments.length;
    const submittedAssignments = isDemo ? 3 : assignments.filter((assignment) => assignment.submitted).length;
    const completedGoals = isDemo ? 1 : goals.filter((goal) => goal.status === 'completed').length;
    const totalGoals = isDemo ? 3 : goals.length;

    return {
      assignmentRate: totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0,
      goalRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      submittedAssignments,
      totalAssignments,
      completedGoals,
      totalGoals
    };
  }, [assignments, goals, isDemo]);

  return (
    <VStack className="gap-3">
      <HStack className="gap-3">
        <Box className="flex-1 rounded-xl border border-phase-border bg-phase-sunlight p-4">
          <HStack className="items-center gap-2">
            <CheckCircle2 size={16} color={colors.sageGreen} />
            <Text className="text-phaseText-secondary text-[11px] font-bold uppercase">Assignments</Text>
          </HStack>
          <Text className="mt-2 text-2xl font-bold text-phaseText-primary">
            {metrics.submittedAssignments}/{metrics.totalAssignments || 0}
          </Text>
          <Text className="mt-1 text-phaseText-secondary text-[12px]">Submitted work this cycle</Text>
          <Box className="mt-3">
            <ProgressBar value={metrics.assignmentRate} color={colors.sageGreen} />
          </Box>
        </Box>

        <Box className="flex-1 rounded-xl border border-phase-border bg-phase-sunlight p-4">
          <HStack className="items-center gap-2">
            <Target size={16} color={colors.gurudeviBlue} />
            <Text className="text-phaseText-secondary text-[11px] font-bold uppercase">Goals</Text>
          </HStack>
          <Text className="mt-2 text-2xl font-bold text-phaseText-primary">
            {metrics.completedGoals}/{metrics.totalGoals || 0}
          </Text>
          <Text className="mt-1 text-phaseText-secondary text-[12px]">Completed learning goals</Text>
          <Box className="mt-3">
            <ProgressBar value={metrics.goalRate} color={colors.gurudeviBlue} />
          </Box>
        </Box>
      </HStack>

      <Box className="rounded-xl border border-phase-border bg-phase-sunlight p-4">
        <HStack className="items-start gap-3">
          <Sparkles size={18} color={colors.sanctuarySaffron} />
          <VStack className="flex-1 gap-1">
            <Text className="text-phaseText-primary text-[13px] font-bold">Growth momentum</Text>
            <Text className="text-phaseText-secondary text-[12px]">
              {growthPoints} points gathered and {badgeCount} badge{badgeCount === 1 ? '' : 's'} earned.
            </Text>
            <Text className="text-phaseText-secondary text-[12px]">
              Progress here is academic and school-facing, even when it feels personal.
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
}

