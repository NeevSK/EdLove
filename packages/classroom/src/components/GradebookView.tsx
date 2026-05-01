import { ClassroomGradingSettings } from '@repo/core/logic';
import { Box, Button } from '@repo/ui/primitives';
import { ButtonText, HStack, Spinner, Text, VStack } from '@repo/ui/primitives';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGradebook } from '../hooks/useGradebook';
import GradebookTable from './grading/GradebookTable';
import GradingSettings from './grading/GradingSettings';

interface GradebookViewProps {
  classroomId: string;
}

export default function GradebookView({ classroomId }: GradebookViewProps) {
  const { t } = useTranslation();
  const {
    grades,
    studentNames,
    gradingSettings,
    isLoading,
    error,
    sortBy,
    setSortBy,
    sortedGrades,
    stats,
    updateSettings,
  } = useGradebook(classroomId);

  const [showSettings, setShowSettings] = useState(false);

  const handleSaveSettings = async (settings: Omit<ClassroomGradingSettings, 'classroom_id'>) => {
    try {
      await updateSettings(settings);
      setShowSettings(false);
    } catch (err: any) {
      console.error('Failed to save settings in UI:', err);
    }
  };

  if (showSettings) {
    return gradingSettings ? (
      <GradingSettings
        currentSettings={gradingSettings as any}
        onSave={handleSaveSettings}
        onCancel={() => setShowSettings(false)}
      />
    ) : null;
  }

  return (
    <VStack className="flex-1 bg-sanctuary-surface">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack className="gap-6">
          {/* Header Stats & Controls */}
          <VStack className="gap-4">
            {/* Stats Summary */}
            <HStack className="gap-4 p-4 bg-sanctuary-surface-secondary rounded-[24px] border border-sanctuary-border shadow-sm">
              <VStack className="flex-1">
                <Text className="text-sanctuary-text-tertiary text-xs">
                  {t('grading.gradebook.totalStudents') || 'Total Students'}
                </Text>
                <Text className="text-sanctuary-text font-bold text-xl">{grades.length}</Text>
              </VStack>

              <VStack className="flex-1">
                <Text className="text-sanctuary-text-tertiary text-xs">
                  {t('grading.gradebook.averageMarks') || 'Average'}
                </Text>
                <Text className="text-sanctuary-text font-bold text-xl">{stats.averageMarks}</Text>
              </VStack>

              <Button
                variant="outline"
                action="secondary"
                onPress={() => {
                  hapticLight();
                  setShowSettings(true);
                }}
                className="self-center h-9 rounded-full px-4 border-sanctuary-border"
              >
                <ButtonText className="text-xs text-sanctuary-text-secondary font-medium">
                  {t('grading.settings.button') || 'Settings'}
                </ButtonText>
              </Button>
            </HStack>

            {/* Sort Options */}
            <HStack className="flex-wrap gap-2 items-center px-1">
              <Text className="text-sanctuary-text-tertiary text-sm mr-1">
                {t('grading.gradebook.sortBy') || 'Sort by:'}
              </Text>

              {(['rank', 'marks', 'name'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    hapticLight();
                    setSortBy(option);
                  }}
                  className="active:opacity-80"
                >
                  <Box
                    className={`py-1.5 px-4 rounded-full border ${
                      sortBy === option
                        ? 'bg-sanctuarySaffron border-sanctuarySaffron'
                        : 'bg-sanctuary-surface-secondary border-sanctuary-border'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        sortBy === option ? 'text-white font-bold' : 'text-sanctuary-text-secondary'
                      }`}
                    >
                      {t(
                        `grading.gradebook.sort${option.charAt(0).toUpperCase() + option.slice(1)}`,
                      ) || option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </VStack>

          {/* Content Area */}
          <Box className="flex-1">
            {isLoading && (
              <Box className="py-12 items-center">
                <Spinner className="text-sanctuarySaffron" />
                <Text className="text-sanctuary-text-tertiary mt-4 animate-pulse">
                  Synchronizing Gradebook...
                </Text>
              </Box>
            )}

            {error && !isLoading && (
              <Box className="p-4 bg-sanctuary-error-transparent rounded-2xl border border-sanctuary-error">
                <Text className="text-sanctuary-error text-sm font-medium">{error}</Text>
              </Box>
            )}

            {!isLoading && !error && grades.length > 0 && gradingSettings && (
              <GradebookTable
                grades={sortedGrades as any}
                gradingSettings={gradingSettings}
                studentNames={studentNames}
              />
            )}

            {!isLoading && !error && grades.length === 0 && (
              <Box className="py-20 items-center justify-center bg-sanctuary-surface-secondary rounded-[32px] border border-dashed border-sanctuary-border">
                <Text className="text-sanctuary-text-tertiary text-base text-center px-8">
                  {t('grading.gradebook.noGrades') ||
                    'No grades found in the sacred archives for this classroom.'}
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
}
