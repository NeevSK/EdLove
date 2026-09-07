import { useAIAgent } from '@repo/ai';
import { useStore } from '@repo/core/logic';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { Calendar, CalendarCheck, CircleAlert, Users } from '@repo/ui/icons';
import { Box, HStack, Icon, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';

import React from 'react';

export default function SectionHeadDashboard({
  schoolId,
  userId,
}: {
  schoolId?: string;
  userId?: string;
}) {
  const { activeGaps, refreshStatus, generateTimetable, isThinking, lastTimetableDraft } =
    useAIAgent();
  const { showToast } = useSanctuaryToast();
  const _userRole = useStore((state: any) => state.userRole);

  const handleExecuteRelief = React.useCallback((action: string) => {
    showToast({
      message: `Relief suggestion ready: ${action}. Assignment workflow is coming soon.`,
      type: 'info',
    });
  }, [showToast]);

  const handleReviewDraft = React.useCallback(() => {
    showToast({ message: 'Draft review is coming soon.', type: 'info' });
  }, [showToast]);

  const _handleCreateDraft = React.useCallback(() => {
    generateTimetable('current-school');
  }, [generateTimetable]);

  const handleGenericAction = React.useCallback(
    (label: string) => {
      showToast({ message: `${label} is coming soon.`, type: 'info' });
    },
    [showToast],
  );

  // Register FAB globally
  useRegisterFAB({
    tabType: 'section',
    hasActiveGaps: activeGaps.length > 0,
    onPress: () => refreshStatus(),
  });

  return (
    <ScreenWrapper className="bg-phase-canvas" noTopInset>
      <ScrollView contentContainerClassName="p-6 pb-24">
        <VStack className="gap-4">
          {/* Header */}
          <Box className="py-8">
            <Text className="text-2xl font-bold text-phaseText-primary">Section Coordination</Text>
            <Text className="text-phaseText-secondary">
              Monitoring section activity and teacher coordination.
            </Text>
          </Box>

          {/* Proactive Agent Notifications */}
          {activeGaps.length > 0 && (
            <VStack className="gap-3">
              <Text className="font-bold text-xs text-phase-warning uppercase tracking-widest px-1">
                AI SUGGESTIONS
              </Text>
              {activeGaps.map((gap: any) => (
                <Box
                  key={gap.id}
                  className="p-4 rounded-2xl border bg-phase-reward/5 border-phase-reward/20"
                >
                  <HStack className="gap-3 items-center">
                    <Icon as={CircleAlert} className="text-phase-reward" size="md" />
                    <VStack className="flex-1">
                      <Text className="font-bold text-phaseText-primary tracking-tight">
                        {gap.title}
                      </Text>
                      <Text className="text-sm text-phaseText-secondary">{gap.description}</Text>
                    </VStack>
                  </HStack>
                  <Box className="mt-4">
                    <SanctuaryButton
                      onPress={() => handleExecuteRelief(gap.suggestedAction)}
                      size="sm"
                      isDisabled
                    >
                      <Text className="font-bold">Relief assignment unavailable</Text>
                    </SanctuaryButton>
                  </Box>
                </Box>
              ))}
            </VStack>
          )}

          {/* Agentic Structural Repair: Timetable */}
          <Box className="p-6 rounded-3xl border mt-4 bg-phase-interactive/5 border-phase-interactive/10">
            <HStack className="justify-between items-center mb-4">
              <HStack className="gap-2 items-center">
                <Box className="p-1.5 bg-phase-interactive/10 rounded-lg">
                  <Icon as={CalendarCheck} size="md" className="text-phase-interactive" />
                </Box>
                <Text className="font-bold text-phaseText-primary">Timetable Review</Text>
              </HStack>
              <Box className="px-2.5 py-1 rounded-full bg-phase-interactive/10">
                <Text className="text-[10px] font-black text-phase-interactive uppercase tracking-widest">
                  AGENTIC
                </Text>
              </Box>
            </HStack>

            {lastTimetableDraft ? (
              <VStack className="gap-3">
                <HStack className="gap-2 items-center bg-phase-canvas p-3 rounded-xl border border-phase-border">
                  <Icon as={CircleAlert} size={16} className="text-phase-warning" />
                  <Text className="text-[13px] text-phaseText-primary font-medium">
                    Draft generated for your section.
                  </Text>
                </HStack>
                <SanctuaryButton onPress={handleReviewDraft} size="sm" isDisabled>
                  Draft review unavailable
                </SanctuaryButton>
              </VStack>
            ) : (
              <VStack className="gap-4">
                <Text className="text-sm leading-relaxed text-phaseText-secondary">
                  I can help you review and update the current schedule for this section.
                </Text>
                <SanctuaryButton
                  onPress={() => generateTimetable('current-school')}
                  size="md"
                  isLoading={isThinking}
                >
                  {isThinking ? 'Creating Draft...' : 'Create Schedule Draft'}
                </SanctuaryButton>
              </VStack>
            )}
          </Box>

          {/* Operational Overview */}
          <HStack className="gap-3">
            <Box className="flex-1 p-4 rounded-2xl border bg-phase-surface border-phase-border">
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest">
                CLASSES
              </Text>
              <Text className="font-black text-2xl text-phaseText-primary mt-1">—</Text>
              <Text className="text-xs text-phaseText-secondary mt-1">Roster sync pending</Text>
            </Box>
            <Box className="flex-1 p-4 rounded-2xl border bg-phase-surface border-phase-border">
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest">
                TEACHERS
              </Text>
              <Text className="font-black text-2xl text-phaseText-primary mt-1">—</Text>
              <Text className="text-xs text-phaseText-secondary mt-1">Roster sync pending</Text>
            </Box>
          </HStack>

          {/* Quick Coordination */}
          <VStack className="gap-3">
            <Text className="font-bold text-xs text-phaseText-muted uppercase tracking-widest px-1">
              QUICK COORDINATION
            </Text>
            <SanctuaryButton
              onPress={() => handleGenericAction('Section schedule review')}
              variant="outline"
              isDisabled
            >
              <HStack className="gap-3 items-center">
                <Icon as={Calendar} size="sm" className="text-phaseText-primary" />
                <Text className="font-bold text-phaseText-primary">Review Section Schedule</Text>
              </HStack>
            </SanctuaryButton>
            <SanctuaryButton
              onPress={() => handleGenericAction('Staff workload balance')}
              variant="outline"
              isDisabled
            >
              <HStack className="gap-3 items-center">
                <Icon as={Users} size="sm" className="text-phaseText-primary" />
                <Text className="font-bold text-phaseText-primary">Staff Workload Balance</Text>
              </HStack>
            </SanctuaryButton>
          </VStack>
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
}
