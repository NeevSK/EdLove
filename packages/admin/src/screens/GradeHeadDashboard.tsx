import { View, Text, ScrollView } from 'react-native';
import { useAIAgent } from '@repo/ai';
import { Button } from '@repo/ui/components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { BookOpen, CircleAlert, Users } from '@repo/ui/icons';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import React from 'react';

export default function GradeHeadDashboard() {
  const { showToast } = useSanctuaryToast();
  const { startSession } = useAIAgent();

  // Primary Agent FAB Integration
  useRegisterFAB({
    id: 'grade-head-assistant',
    label: 'Grade Ops Assistant',
    icon: 'sparkles',
    priority: 10,
    onPress: () => {
      startSession({
        systemPrompt:
          'You are the Grade Head Coordination Agent. Assist the grade head with teacher coverage, curriculum distribution, and student cohort observations.',
        initialMessage:
          'Grade Head active. Would you like an overview of grade coverage or lesson pace?',
      });
    },
  });

  // Presentation State
  const pendingGaps = [
    { id: '1', title: 'Grade 10-A Math Uncovered', description: 'Period 3 requires relief teacher' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-phase-canvas">
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-phaseText-primary">Grade Coordination</Text>
            <Text className="text-sm text-phaseText-secondary mt-1">
              Operational oversight across classrooms and cohorts
            </Text>
          </View>

          {/* Urgent Coverage Alerts */}
          {pendingGaps.length > 0 && (
            <View className="gap-3">
              <Text className="font-semibold text-sm text-phaseText-secondary uppercase">
                ATTENTION REQUIRED
              </Text>
              {pendingGaps.map((gap) => (
                <View
                  key={gap.id}
                  className="bg-phase-surface border border-phase-interactive/20 rounded-2xl p-4"
                >
                  <View className="flex-row items-center gap-3">
                    <CircleAlert size={24} className="text-phase-interactive" />
                    <View className="flex-1">
                      <Text className="font-bold text-phaseText-primary">{gap.title}</Text>
                      <Text className="text-sm text-phaseText-secondary">{gap.description}</Text>
                    </View>
                  </View>
                  <View className="mt-3">
                    <Button
                      label="Relief assignment unavailable"
                      variant="quiet"
                      disabled
                      size="sm"
                      onPress={() =>
                        showToast({
                          message: 'Relief assignment is not connected yet. The suggested action has been noted.',
                          type: 'info',
                        })
                      }
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Metrics Grid */}
          <View className="flex-row items-center gap-4">
            <View className="flex-1 bg-phase-surface border border-phase-interactive/10 rounded-2xl p-4">
              <Text className="text-sm text-phaseText-secondary">Classrooms Active</Text>
              <Text className="text-2xl font-bold text-phaseText-primary mt-1">4 / 4</Text>
              <Text className="text-xs text-phase-interactive mt-1">Nominal cadence</Text>
            </View>
            <View className="flex-1 bg-phase-surface border border-phase-interactive/10 rounded-2xl p-4">
              <Text className="text-sm text-phaseText-secondary">Students Observed</Text>
              <Text className="text-2xl font-bold text-phaseText-primary mt-1">128</Text>
              <Text className="text-xs text-phaseText-secondary mt-1">Roster sync pending</Text>
            </View>
          </View>

          {/* Quick Coordination */}
          <View className="gap-2">
            <Text className="font-semibold text-sm text-phaseText-secondary uppercase">
              GRADE MANAGEMENT
            </Text>
            <Button
              label="Curriculum Alignment Pulse"
              icon={BookOpen}
              variant="secondary"
              disabled
              onPress={() => showToast({ message: 'Curriculum pulse is coming soon.', type: 'info' })}
            />
            <Button
              label="Student Wellbeing Reports"
              icon={Users}
              variant="secondary"
              disabled
              onPress={() => showToast({ message: 'Wellbeing reports are coming soon.', type: 'info' })}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
