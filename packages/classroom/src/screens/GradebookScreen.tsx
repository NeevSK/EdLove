/**
 * GRADEBOOK SCREEN
 */

import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GradebookTable from '../components/grading/GradebookTable';
import GradeEntryForm from '../components/grading/GradeEntryForm';
import GradingSettings from '../components/grading/GradingSettings';
import { useGradebook } from '../hooks/useGradebook';

interface GradebookScreenProps {
  classroomId: string;
  onEditGrade?: (studentId: string) => void;
}

export default function GradebookScreen({ classroomId }: GradebookScreenProps) {
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
    submitGrade,
    publishGrade,
  } = useGradebook(classroomId) as any;

  const [showSettings, setShowSettings] = useState(false);
  // studentId of the student whose grade entry form is open, or null when closed
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);

  const handleSaveSettings = async (settings: any) => {
    try {
      await updateSettings(settings);
      setShowSettings(false);
    } catch (err: any) {
      console.error('Failed to save settings in UI:', err);
    }
  };

  const handleSaveGrade = async (marks: number, feedback: string) => {
    if (!gradingStudentId) return;
    try {
      await submitGrade(gradingStudentId, marks, feedback || undefined);
    } catch (err: any) {
      console.error('[GradebookScreen] submitGrade failed:', err);
    } finally {
      setGradingStudentId(null);
    }
  };

  if (showSettings && gradingSettings) {
    return (
      <GradingSettings
        currentSettings={gradingSettings}
        onSave={handleSaveSettings}
        onCancel={() => setShowSettings(false)}
      />
    );
  }

  if (gradingStudentId) {
    const existingGrade = grades.find((g: any) => g.student_id === gradingStudentId);
    return (
      <GradeEntryForm
        studentName={studentNames[gradingStudentId] ?? 'Student'}
        initialMarks={existingGrade?.marks}
        initialFeedback={existingGrade?.feedback ?? ''}
        onSave={handleSaveGrade}
        onCancel={() => setGradingStudentId(null)}
      />
    );
  }

  return (
    <Box className="flex-1 bg-phase-world">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="p-lg gap-6">
          {/* Header */}
          <HStack className="justify-between items-center">
            <Heading className="text-3xl text-templeGold font-black">
              {t('grading.gradebook.title') || 'Gradebook'}
            </Heading>

            <Button
              variant="outline"
              size="sm"
              className="border-templeGold"
              onPress={() => setShowSettings(true)}
            >
              <ButtonText className="text-templeGold">
                {t('grading.settings.button') || 'Settings'}
              </ButtonText>
            </Button>
          </HStack>

          {/* Stats Summary */}
          <HStack className="p-md bg-phase-surface rounded-comfortable gap-4">
            <VStack className="flex-1">
              <Text className="text-sm text-phaseText-secondary">
                {t('grading.gradebook.totalStudents') || 'Total Students'}
              </Text>
              <Text className="text-xl font-bold text-phaseText-primary">{grades.length}</Text>
            </VStack>

            <VStack className="flex-1">
              <Text className="text-sm text-phaseText-secondary">
                {t('grading.gradebook.averageMarks') || 'Average'}
              </Text>
              <Text className="text-xl font-bold text-phaseText-primary">
                {stats.averageMarks}%
              </Text>
            </VStack>
          </HStack>

          {/* Sort Options */}
          <HStack className="flex-wrap gap-2 items-center">
            <Text className="text-phaseText-secondary mr-2">
              {t('grading.gradebook.sortBy') || 'Sort by:'}
            </Text>

            {(['rank', 'marks', 'name'] as const).map((option) => (
              <Pressable key={option} onPress={() => setSortBy(option)}>
                <Box
                  className={`p-sm px-md rounded-tight ${sortBy === option ? 'bg-templeGold' : 'bg-phase-surface'}`}
                >
                  <Text
                    className={`text-sm ${sortBy === option ? 'text-ink font-bold' : 'text-phaseText-primary'}`}
                  >
                    {t(
                      `grading.gradebook.sort${option.charAt(0).toUpperCase() + option.slice(1)}`,
                    ) || option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>

          {/* Loading State */}
          {isLoading && (
            <Box className="p-xl items-center">
              <Spinner className="text-templeGold" />
              <Text className="mt-md text-phaseText-secondary">
                {t('common.loading') || 'Loading...'}
              </Text>
            </Box>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Box className="p-md bg-emberRed rounded-comfortable">
              <Text className="text-sacredWhite">{error}</Text>
            </Box>
          )}

          {/* Gradebook Table */}
          {!isLoading && !error && grades.length > 0 && gradingSettings && (
            <VStack className="gap-md">
              <GradebookTable
                grades={sortedGrades}
                gradingSettings={gradingSettings}
                studentNames={studentNames}
              />
              <Text className="text-xs text-center text-phaseText-secondary">
                {t('grading.gradebook.tapToGrade') ||
                  'Tap a student row to enter or update their grade'}
              </Text>

              {/* Per-student grade list for mobile-friendly editing */}
              <VStack className="gap-2 mt-2">
                {sortedGrades.map((g: any) => (
                  <Pressable key={g.student_id} onPress={() => setGradingStudentId(g.student_id)}>
                    <HStack className="justify-between items-center p-md bg-phase-surface rounded-comfortable">
                      <VStack>
                        <Text className="font-semibold text-phaseText-primary">
                          {studentNames[g.student_id] ?? g.student_id}
                        </Text>
                        <Text
                          className={`text-[11px] font-bold ${g.publication_state === 'published' ? 'text-sageGreen' : 'text-phaseText-secondary'}`}
                        >
                          {g.publication_state === 'published' ? 'Published' : 'Draft'}
                        </Text>
                      </VStack>

                      <HStack className="gap-3 items-center">
                        <Text className="text-lg font-bold text-templeGold">{g.marks}/100</Text>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-templeGold h-8 px-3"
                          onPress={() => setGradingStudentId(g.student_id)}
                        >
                          <ButtonText className="text-templeGold text-[11px]">
                            {t('grading.gradebook.grade') || 'Edit'}
                          </ButtonText>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-sageGreen h-8 px-3"
                          onPress={() => publishGrade(g.id)}
                        >
                          <ButtonText className="text-sageGreen text-[11px]">
                            {g.publication_state === 'published' ? 'Republish' : 'Publish'}
                          </ButtonText>
                        </Button>
                      </HStack>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          )}

          {/* Empty State */}
          {!isLoading && !error && grades.length === 0 && (
            <Box className="p-xl items-center gap-4">
              <Text className="text-center text-lg text-phaseText-secondary">
                {t('grading.gradebook.noGrades') || 'No grades recorded yet'}
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
