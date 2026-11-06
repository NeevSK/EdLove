import { View, Text, ScrollView } from 'react-native';
import { useAIAgent } from '@repo/ai';
import { Button } from '@repo/ui/components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { Calendar, CalendarCheck, CircleAlert, Users } from '@repo/ui/icons';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import React from 'react';

export default function SectionHeadDashboard() {
  const { showToast } = useSanctuaryToast();
  const { startSession, isThinking } = useAIAgent();

  // Register Autonomous Agent FAB
  useRegisterFAB({
    id: 'section-head-assistant',
    label: 'Section Coordinator Agent',
    icon: 'sparkles',
    priority: 10,
    onPress: () => {
      startSession({
        systemPrompt:
          'You are the Section Head Autonomous Coordinator. Assist the section head with teacher coverage, timetable management, and workload distribution.',
        initialMessage:
          'Section Head Coordinator initialized. Would you like an overview of section coverage or timetable optimizations?',
      });
    },
  });

  const pendingGaps = [
    {
      id: '1',
      title: 'Primary Section Science Coverage Needed',
      description: 'Grade 4 Science requires relief teacher for periods 1-2',
      suggestedAction: 'Assign available relief teacher',
    },
  ];

  const lastTimetableDraft = null;

  const handleExecuteRelief = (_actionText: string) => {
    showToast({
      message: 'Relief assignment is not connected yet. The suggested action has been noted.',
      type: 'info',
    });
  };

  const handleReviewDraft = () => {
    showToast({
      message: 'Timetable draft review is coming soon.',
      type: 'info',
    });
  };

  const generateTimetable = (_schoolId: string) => {
    showToast({
      message: 'Autonomous timetable generation is processing.',
      type: 'info',
    });
  };

  const handleGenericAction = (name: string) => {
    showToast({
      message: `${name} is coming soon.`,
      type: 'info',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-phase-canvas">
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-phaseText-primary">Section Oversight</Text>
            <Text className="text-sm text-phaseText-secondary mt-1">
              Curriculum delivery, teacher coverage, and section pacing
            </Text>
          </View>

          {/* Urgent Coverage Alerts */}
          {pendingGaps.length > 0 && (
            <View className="gap-3">
              <Text className="font-bold text-xs text-phaseText-muted uppercase tracking-widest px-1">
                ATTENTION REQUIRED
              </Text>
              {pendingGaps.map((gap) => (
                <View
                  key={gap.id}
                  className="p-5 rounded-2xl border bg-phase-surface border-phase-interactive/20"
                >
                  <View className="flex-row items-center gap-3">
                    <CircleAlert size={20} className="text-phase-interactive" />
                    <View className="flex-1">
                      <Text className="font-bold text-base text-phaseText-primary">
                        {gap.title}
                      </Text>
                      <Text className="text-sm text-phaseText-secondary">{gap.description}</Text>
                    </View>
                  </View>
                  <View className="mt-4">
                    <Button
                      label="Relief assignment unavailable"
                      variant="quiet"
                      disabled
                      size="sm"
                      onPress={() => handleExecuteRelief(gap.suggestedAction)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Agentic Structural Repair: Timetable */}
          <View className="p-6 rounded-3xl border mt-4 bg-phase-interactive/5 border-phase-interactive/10">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <View className="p-1.5 bg-phase-interactive/10 rounded-lg">
                  <CalendarCheck size={20} className="text-phase-interactive" />
                </View>
                <Text className="font-bold text-phaseText-primary">Timetable Review</Text>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-phase-interactive/10">
                <Text className="text-[10px] font-black text-phase-interactive uppercase tracking-widest">
                  AGENTIC
                </Text>
              </View>
            </View>

            {lastTimetableDraft ? (
              <View className="gap-3">
                <View className="flex-row items-center gap-2 bg-phase-canvas p-3 rounded-xl border border-phase-border">
                  <CircleAlert size={16} className="text-phase-warning" />
                  <Text className="text-[13px] text-phaseText-primary font-medium">
                    Draft generated for your section.
                  </Text>
                </View>
                <Button
                  label="Draft review unavailable"
                  variant="quiet"
                  disabled
                  size="sm"
                  onPress={handleReviewDraft}
                />
              </View>
            ) : (
              <View className="gap-4">
                <Text className="text-sm leading-relaxed text-phaseText-secondary">
                  I can help you review and update the current schedule for this section.
                </Text>
                <Button
                  label={isThinking ? 'Creating Draft...' : 'Create Schedule Draft'}
                  loading={isThinking}
                  variant="primary"
                  size="md"
                  onPress={() => generateTimetable('current-school')}
                />
              </View>
            )}
          </View>

          {/* Metrics Overview */}
          <View className="flex-row items-center gap-4">
            <View className="flex-1 p-4 rounded-2xl border bg-phase-surface border-phase-border">
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest">
                CLASSROOMS
              </Text>
              <Text className="font-black text-2xl text-phaseText-primary mt-1">4 Active</Text>
              <Text className="text-xs text-phase-interactive mt-1">Full coverage</Text>
            </View>
            <View className="flex-1 p-4 rounded-2xl border bg-phase-surface border-phase-border">
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest">
                TEACHERS
              </Text>
              <Text className="font-black text-2xl text-phaseText-primary mt-1">—</Text>
              <Text className="text-xs text-phaseText-secondary mt-1">Roster sync pending</Text>
            </View>
          </View>

          {/* Quick Coordination */}
          <View className="gap-3">
            <Text className="font-bold text-xs text-phaseText-muted uppercase tracking-widest px-1">
              QUICK COORDINATION
            </Text>
            <Button
              label="Review Section Schedule"
              icon={Calendar}
              variant="secondary"
              disabled
              onPress={() => handleGenericAction('Section schedule review')}
            />
            <Button
              label="Staff Workload Balance"
              icon={Users}
              variant="secondary"
              disabled
              onPress={() => handleGenericAction('Staff workload balance')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
