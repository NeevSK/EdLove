import type { Assignment } from '@repo/core';
import { CheckCircle2, Sparkles, Target } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { useMemo } from 'react';

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

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <Box className="h-2 rounded-full bg-sanctuary-border/20 overflow-hidden">
      <Box
        className={`h-full rounded-full ${className}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </Box>
  );
}

export function StudentProgressOverview({
  assignments,
  goals,
  growthPoints,
  badgeCount,
  isDemo = false,
}: StudentProgressOverviewProps) {
  const metrics = useMemo(() => {
    const totalAssignments = isDemo ? 5 : assignments.length;
    const submittedAssignments = isDemo
      ? 3
      : assignments.filter((assignment: any) => assignment.submitted).length;
    const completedGoals = isDemo ? 1 : goals.filter((goal) => goal.status === 'completed').length;
    const totalGoals = isDemo ? 3 : goals.length;

    return {
      assignmentRate:
        totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0,
      goalRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      submittedAssignments,
      totalAssignments,
      completedGoals,
      totalGoals,
    };
  }, [assignments, goals, isDemo]);

  return (
    <VStack className="gap-4">
      <HStack className="gap-4">
        <Box className="flex-1 rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-5">
          <HStack className="items-center gap-2">
            <Icon as={CheckCircle2} size="xs" className="text-sanctuary-success" />
            <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-widest">
              Assignments
            </Text>
          </HStack>
          <HStack className="items-baseline gap-1 mt-3">
            <Text className="text-2xl font-black text-sanctuary-text tracking-tighter">
              {metrics.submittedAssignments}
            </Text>
            <Text className="text-base font-bold text-sanctuary-text-tertiary">
              /{metrics.totalAssignments || 0}
            </Text>
          </HStack>
          <Text className="mt-1 text-sanctuary-text-secondary text-xs font-medium leading-tight">
            Submitted work this cycle
          </Text>
          <Box className="mt-4">
            <ProgressBar value={metrics.assignmentRate} className="bg-sanctuary-success" />
          </Box>
        </Box>

        <Box className="flex-1 rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-5">
          <HStack className="items-center gap-2">
            <Icon as={Target} size="xs" className="text-sanctuary-info" />
            <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-widest">
              Goals
            </Text>
          </HStack>
          <HStack className="items-baseline gap-1 mt-3">
            <Text className="text-2xl font-black text-sanctuary-text tracking-tighter">
              {metrics.completedGoals}
            </Text>
            <Text className="text-base font-bold text-sanctuary-text-tertiary">
              /{metrics.totalGoals || 0}
            </Text>
          </HStack>
          <Text className="mt-1 text-sanctuary-text-secondary text-xs font-medium leading-tight">
            Completed learning goals
          </Text>
          <Box className="mt-4">
            <ProgressBar value={metrics.goalRate} className="bg-sanctuary-info" />
          </Box>
        </Box>
      </HStack>

      <Box className="rounded-[24px] border border-sanctuary-border bg-sanctuary-surface-secondary p-5">
        <HStack className="items-start gap-4">
          <Box className="bg-sanctuarySaffron/10 p-2.5 rounded-2xl border border-sanctuarySaffron/20">
            <Icon as={Sparkles} size="sm" className="text-sanctuarySaffron" />
          </Box>
          <VStack className="flex-1 gap-1.5">
            <Text className="text-sanctuary-text text-sm font-black tracking-tight">
              Growth momentum
            </Text>
            <Text className="text-sanctuary-text-secondary text-xs leading-5 font-medium">
              <Text className="text-sanctuary-text font-black">{growthPoints}</Text> points gathered
              and <Text className="text-sanctuary-text font-black">{badgeCount}</Text> badge
              {badgeCount === 1 ? '' : 's'} earned.
            </Text>
            <Text className="text-sanctuary-text-tertiary text-[11px] leading-relaxed italic">
              Progress here is academic and school-facing, even when it feels personal.
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
}
