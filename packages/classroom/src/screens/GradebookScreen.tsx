/**
 * GRADEBOOK SCREEN
 */

import GradebookTable from '@repo/classroom/components/grading/GradebookTable';
import GradeEntryForm from '@repo/classroom/components/grading/GradeEntryForm';
import GradingSettings from '@repo/classroom/components/grading/GradingSettings';
import { useGradebook } from '@repo/classroom/hooks/useGradebook';
import { BrandPulse } from '@repo/ui';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Canvas, Path, Skia } from 'react-native-skia';
import { Platform } from 'react-native';
import { ObserveInteractiveMarker } from 'expo-observe';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';

interface GradebookScreenProps {
  classroomId: string;
  onEditGrade?: (studentId: string) => void;
}

export default function GradebookScreen({ classroomId }: GradebookScreenProps) {
  const params = useLocalSearchParams<{ classroomId?: string }>();
  const activeClassroomId = classroomId || params.classroomId || 'demo-class';
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();
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
  } = useGradebook(activeClassroomId) as any;

  const [showSettings, setShowSettings] = useState(false);
  // studentId of the student whose grade entry form is open, or null when closed
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);

  // GPA analytics (Sri Lankan scale) + Skia micro-chart
  const gpaStats = useMemo(() => {
    if (!grades || grades.length === 0) return { avgGPA: 0, distribution: { A: 0, B: 0, C: 0, S: 0, F: 0 } };
    const toGPA = (m: number) => (m >= 75 ? 4 : m >= 65 ? 3 : m >= 50 ? 2 : m >= 35 ? 1 : 0);
    let sum = 0;
    const dist = { A: 0, B: 0, C: 0, S: 0, F: 0 } as Record<string, number>;
    for (const g of grades as { marks: number }[]) {
      const grade = g.marks >= 75 ? 'A' : g.marks >= 65 ? 'B' : g.marks >= 50 ? 'C' : g.marks >= 35 ? 'S' : 'F';
      dist[grade] = (dist[grade] ?? 0) + 1;
      sum += toGPA(g.marks);
    }
    return { avgGPA: sum / grades.length, distribution: dist };
  }, [grades]);

  const chartPath = useMemo(() => {
    if (Platform.OS === 'web' || !grades || grades.length < 2) return null;
    try {
      const w = 200;
      const h = 40;
      const pad = 4;
      const points = (grades as { marks: number }[]).slice(0, 20).map((g) => g.marks);
      const min = Math.min(...points);
      const max = Math.max(...points);
      const range = max - min || 1;
      const builder = Skia.PathBuilder.Make();
      points.forEach((m, i) => {
        const x = pad + (i / (points.length - 1)) * (w - pad * 2);
        const y = h - pad - ((m - min) / range) * (h - pad * 2);
        if (i === 0) builder.moveTo(x, y);
        else builder.lineTo(x, y);
      });
      return builder.build();
    } catch {
      return null;
    }
  }, [grades]);

  const handleSaveSettings = async (settings: any) => {
    try {
      await updateSettings(settings);
      setShowSettings(false);
    } catch (err: any) {
      console.error('Failed to save settings in UI:', err);
      showToast({
        message: err?.message || 'Settings could not be saved. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSaveGrade = async (marks: number, feedback: string) => {
    if (!gradingStudentId) return;
    try {
      await submitGrade(gradingStudentId, marks, feedback || undefined);
    } catch (err: any) {
      console.error('[GradebookScreen] submitGrade failed:', err);
      showToast({
        message: err?.message || 'Grade could not be saved. Please try again.',
        type: 'error',
      });
      return;
    }
    setGradingStudentId(null);
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
      <ObserveInteractiveMarker />
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

          {/* GPA Analytics (Skia micro-chart) */}
          <Box className="p-md bg-phase-surface rounded-comfortable gap-3">
            <HStack className="justify-between items-center">
              <VStack>
                <Text className="text-sm text-phaseText-secondary">Average GPA (SL)</Text>
                <Text className="text-xl font-bold text-templeGold">{gpaStats.avgGPA.toFixed(2)} / 4.0</Text>
                <Text className="text-[11px] text-phaseText-secondary">
                  A:{gpaStats.distribution.A} B:{gpaStats.distribution.B} C:{gpaStats.distribution.C} S:{gpaStats.distribution.S} F:
                  {gpaStats.distribution.F}
                </Text>
              </VStack>
              {Platform.OS !== 'web' && chartPath ? (
                <Canvas style={{ width: 200, height: 40 }}>
                  <Path path={chartPath} color="#D4843A" style="stroke" strokeWidth={2} strokeCap="round" strokeJoin="round" />
                </Canvas>
              ) : (
                <Text className="text-xs text-phaseText-secondary">Trend chart on device</Text>
              )}
            </HStack>
            <Text className="text-[11px] text-phaseText-secondary">Sri Lankan scale: A 75+ (4.0) · B 65+ (3.0) · C 50+ (2.0) · S 35+ (1.0) · F &lt;35</Text>
          </Box>

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
            <Box
              className="p-xl items-center"
              accessibilityRole="progressbar"
              accessibilityLabel="Loading gradebook"
            >
              <BrandPulse size={28} tintColor="#D4843A" />
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
