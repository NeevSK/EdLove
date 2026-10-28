import { BatteryEngine } from '@intuitui-labs/form-builder-engine';
import type { BatteryNode, FormSubmissionHistoryItem } from '@intuitui-labs/form-builder-engine/schema';
import { useThemedColors } from '@repo/ui/hooks';
import { Award, ChevronRight, Clock, Lock, ShieldCheck, Sparkles, Trophy } from '@repo/ui/icons';
import { Badge, BadgeText, Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import React, { memo, useMemo } from 'react';

export interface BatterySequenceCardProps {
  node: BatteryNode;
  history: FormSubmissionHistoryItem[];
  onStart: (node: BatteryNode) => void;
  formTitles?: Record<string, string>;
  rewardPoints?: number;
}

/**
 * BatterySequenceCard
 *
 * Renders an accessible, interactive survey battery node evaluated against
 * the respondent's submission history using BatteryEngine.
 */
export const BatterySequenceCard = memo(function BatterySequenceCard({
  node,
  history,
  onStart,
  formTitles,
  rewardPoints = 10,
}: BatterySequenceCardProps) {
  const colors = useThemedColors();

  const evaluation = useMemo(
    () => BatteryEngine.evaluateNodeAccess(node, history),
    [node, history],
  );

  const humanReadableStatus = useMemo(
    () => BatteryEngine.describeAccessEvaluation(evaluation, { formTitles }),
    [evaluation, formTitles],
  );

  const sanitizedReward = useMemo(() => {
    const policy = node.accessPolicy ?? BatteryEngine.getDefaultAccessPolicy(node.kind);
    return BatteryEngine.calculateSanitizedReward(
      policy,
      evaluation.attemptsUsed + 1,
      rewardPoints,
    );
  }, [node, evaluation, rewardPoints]);

  const isLocked = evaluation.isLocked || !evaluation.canStart;
  const isCompleted = evaluation.isCompleted;

  return (
    <Box
      className="p-4 rounded-2xl border shadow-sm mb-3"
      sx={{
        backgroundColor: colors.surface ?? '#FFFFFF',
        borderColor: isLocked
          ? (colors.border ?? '#E2E8F0')
          : (Theme.colors.sanctuarySaffron ?? '#D97706'),
        opacity: isLocked ? 0.75 : 1,
      }}
    >
      <HStack className="items-center justify-between">
        <HStack className="items-center gap-2">
          <Badge
            action={isLocked ? 'muted' : isCompleted ? 'success' : 'warning'}
            size="sm"
            className="px-2 py-0.5 rounded-full"
          >
            <BadgeText className="text-[10px] font-bold uppercase tracking-wider">
              {isLocked
                ? 'Locked'
                : isCompleted
                  ? `Completed (${evaluation.attemptsUsed})`
                  : 'Ready to Start'}
            </BadgeText>
          </Badge>

          {node.kind && (
            <Badge action="muted" size="sm" className="px-2 py-0.5 rounded-full">
              <BadgeText className="text-[10px] font-medium uppercase">
                {node.kind}
              </BadgeText>
            </Badge>
          )}
        </HStack>

        {sanitizedReward.pointsAwarded > 0 && (
          <HStack className="items-center gap-1">
            <Icon as={Trophy} color="#D97706" size={14} />
            <Text className="text-xs font-bold text-amber-700">
              +{sanitizedReward.pointsAwarded} XP
            </Text>
          </HStack>
        )}
      </HStack>

      <VStack className="mt-2.5">
        <Text
          className="text-base font-bold"
          sx={{ color: colors.textPrimary ?? '#0F172A' }}
        >
          {node.title}
        </Text>
        {node.description && (
          <Text
            className="text-xs mt-1"
            sx={{ color: colors.textSecondary ?? '#475569' }}
          >
            {node.description}
          </Text>
        )}
      </VStack>

      {/* Access Evaluation Reason or Prerequisite Alert */}
      {isLocked && humanReadableStatus && (
        <HStack className="items-center gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <Icon as={Lock} color="#64748B" size={14} />
          <Text className="text-xs text-slate-600 flex-1">
            {humanReadableStatus}
          </Text>
        </HStack>
      )}

      {/* Action Trigger */}
      <HStack className="mt-3.5 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLocked ? `Locked: ${node.title}` : `Start ${node.title}`}
          disabled={isLocked}
          onPress={() => onStart(node)}
          className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 ${
            isLocked ? 'bg-slate-300' : 'bg-amber-600'
          }`}
        >
          <Text
            className="text-xs font-bold"
            sx={{ color: isLocked ? '#64748B' : '#FFFFFF' }}
          >
            {isCompleted ? 'Retake Assessment' : 'Start Assessment'}
          </Text>
          <Icon
            as={isLocked ? Lock : ChevronRight}
            color={isLocked ? '#64748B' : '#FFFFFF'}
            size={14}
          />
        </Pressable>
      </HStack>
    </Box>
  );
});
