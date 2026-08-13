import { growthSignalsAPI } from '@repo/core/api/client';
import { type ClassroomGradingSettings } from '@repo/core/types';
import { useStore } from '@repo/core/logic';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { Award, Check, ChevronLeft, Settings2, SquarePen, TrendingUp, Users } from '@repo/ui/icons';
import {
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';
import { useState } from 'react';
import type { SortOption } from '@repo/classroom/hooks/useGradebook';
import { useGradebook } from '@repo/classroom/hooks/useGradebook';

// -- Helpers --------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[1px] mb-2">
      {children}
    </Text>
  );
}

// -- Windows / Modals -----------------------------------------

function GradeModal({
  studentName,
  current,
  maxMarks,
  onSave,
  onClose,
}: {
  studentName: string;
  current?: { marks: number; feedback?: string };
  maxMarks: number;
  onSave: (marks: number, feedback: string) => Promise<void>;
  onClose: () => void;
}) {
  const [marks, setMarks] = useState(String(current?.marks ?? ''));
  const [feedback, setFeedback] = useState(current?.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const numericMarks = Number(marks);
    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > maxMarks) {
      setError(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setSaving(true);
    try {
      await onSave(numericMarks, feedback);
      onClose();
    } catch (caughtError: any) {
      setError(caughtError?.message || 'Failed to save grade');
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-[400px]">
        <ModalHeader className="justify-between items-start">
          <VStack>
            <Heading size="sm" className="font-black text-phaseText-primary">
              Grade Entry
            </Heading>
            <Text className="text-xs text-phaseText-muted">{studentName}</Text>
          </VStack>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody className="gap-5">
          <VStack>
            <SectionLabel>Marks (0-{maxMarks})</SectionLabel>
            <Input
              className={`bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12 ${error ? 'border-phase-error' : ''}`}
            >
              <InputField
                type="text"
                value={marks}
                onChangeText={(v) => {
                  setMarks(v);
                  setError('');
                }}
                keyboardType="numeric"
                className="text-lg font-bold text-phaseText-primary"
              />
            </Input>
            {error && <Text className="mt-1 text-[11px] text-phase-error">{error}</Text>}
          </VStack>
          <VStack>
            <SectionLabel>Feedback (optional)</SectionLabel>
            <Textarea className="bg-phase-surface-secondary border-phase-border rounded-xl p-4">
              <TextareaInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="e.g. Excellent work on the last question..."
                className="text-sm text-phaseText-primary"
              />
            </Textarea>
          </VStack>
        </ModalBody>
        <ModalFooter className="gap-3">
          <SanctuaryButton action="secondary" onPress={onClose} className="flex-1">
            <Text className="font-bold text-phaseText-secondary">Cancel</Text>
          </SanctuaryButton>
          <SanctuaryButton
            onPress={handleSave}
            isDisabled={saving}
            className="flex-[2] bg-phase-interactive"
          >
            <HStack className="items-center justify-center gap-2">
              {saving ? (
                <Spinner size="small" color="#FFFFFF" />
              ) : (
                <Icon as={Check} size="xs" className="text-white" />
              )}
              <Text className="text-white font-bold">Save Draft</Text>
            </HStack>
          </SanctuaryButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function SettingsModal({
  current,
  onSave,
  onClose,
}: {
  current: ClassroomGradingSettings;
  onSave: (
    settings: Omit<ClassroomGradingSettings, 'classroom_id'>,
  ) => Promise<ClassroomGradingSettings>;
  onClose: () => void;
}) {
  const [gradingMode, setGradingMode] = useState<ClassroomGradingSettings['grading_mode']>(
    current.grading_mode,
  );
  const [showRanks, setShowRanks] = useState(current.show_ranks);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ grading_mode: gradingMode, show_ranks: showRanks });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-[360px]">
        <ModalHeader>
          <Heading size="sm" className="font-black text-phaseText-primary">
            Grading Settings
          </Heading>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody className="gap-6">
          <VStack>
            <SectionLabel>Grading Mode</SectionLabel>
            <HStack className="gap-2">
              {(['marks', 'gpa', 'both'] as const).map((mode) => {
                const isActive = gradingMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setGradingMode(mode)}
                    className={`flex-1 py-3 items-center rounded-xl border-2 ${isActive ? 'bg-phase-interactive/5 border-phase-interactive' : 'bg-phase-surface-secondary border-phase-border'}`}
                  >
                    <Text
                      className={`text-xs font-bold ${isActive ? 'text-phase-interactive' : 'text-phaseText-primary'}`}
                    >
                      {mode === 'marks' ? 'Marks' : mode === 'gpa' ? 'GPA' : 'Both'}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>
          <Pressable
            onPress={() => setShowRanks(!showRanks)}
            className="flex-row items-center gap-3"
          >
            <Box
              className={`w-5 h-5 rounded border-2 items-center justify-center ${showRanks ? 'bg-phase-interactive border-phase-interactive' : 'border-phase-border'}`}
            >
              {showRanks && <Icon as={Check} size="xs" className="text-white" />}
            </Box>
            <Text className="text-sm font-bold text-phaseText-primary">Show student ranks</Text>
          </Pressable>
        </ModalBody>
        <ModalFooter className="gap-3">
          <SanctuaryButton action="secondary" onPress={onClose} className="flex-1">
            <Text className="font-bold text-phaseText-secondary">Cancel</Text>
          </SanctuaryButton>
          <SanctuaryButton
            onPress={handleSave}
            isDisabled={saving}
            className="flex-[2] bg-phase-interactive"
          >
            <HStack className="items-center justify-center gap-2">
              {saving && <Spinner size="small" color="#FFFFFF" />}
              <Text className="text-white font-bold">{saving ? 'Saving...' : 'Save Settings'}</Text>
            </HStack>
          </SanctuaryButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// -- Main Component -------------------------------------------

export default function GradebookScreenWeb() {
  const router = useRouter();
  const { classroomId = '', classroomName = 'Classroom' } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const { user } = useStore();

  const {
    sortedGrades,
    studentNames,
    gradingSettings,
    isLoading,
    error,
    sortBy,
    setSortBy,
    stats,
    updateSettings,
    submitGrade,
    publishGrade,
  } = useGradebook(classroomId ?? '');

  const [gradingId, setGradingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const maxMarks = 100;
  const passingMarks = 50;
  const passRate =
    stats.totalStudents > 0
      ? Math.round(
          (sortedGrades.filter((grade) => (grade.marks ?? 0) >= passingMarks).length /
            stats.totalStudents) *
            100,
        )
      : 0;
  const sorts: { id: SortOption; label: string }[] = [
    { id: 'rank', label: 'By Rank' },
    { id: 'marks', label: 'By Marks' },
    { id: 'name', label: 'By Name' },
  ];

  const gradingStudent = gradingId
    ? sortedGrades.find((grade) => grade.student_id === gradingId)
    : null;

  const handleSave = async (marks: number, feedback: string) => {
    if (!gradingId) return;
    await (submitGrade as any)(gradingId, marks, feedback);
    if (user?.id) {
      growthSignalsAPI.emitSilent({
        user_id: user.id,
        event_type: 'assignment_graded',
        event_metadata: { classroom_id: classroomId },
      });
    }
  };

  return (
    <ScrollView className="bg-phase-canvas">
      <VStack className="max-w-[780px] mx-auto py-12 px-6 w-full">
        <HStack className="items-center justify-between mb-8 gap-4 flex-wrap">
          <SanctuaryButton
            action="secondary"
            onPress={() => safeBack('/workspace')}
            className="px-4 py-2 bg-phase-surface/40 border-phase-border/20"
          >
            <HStack className="items-center gap-1.5">
              <Icon as={ChevronLeft} size="xs" className="text-phaseText-muted" />
              <Text className="text-xs font-bold text-phaseText-muted">Back</Text>
            </HStack>
          </SanctuaryButton>
          <Box className="flex-1">
            <Heading size="md" className="font-black text-phaseText-primary">
              Gradebook - {classroomName}
            </Heading>
          </Box>
          <SanctuaryButton
            action="secondary"
            onPress={() => setShowSettings(true)}
            className="px-4 py-2 bg-phase-surface/40 border-phase-border/20"
          >
            <HStack className="items-center gap-2">
              <Icon as={Settings2} size="xs" className="text-phaseText-muted" />
              <Text className="text-xs font-black uppercase tracking-widest text-phaseText-muted">
                Settings
              </Text>
            </HStack>
          </SanctuaryButton>
        </HStack>

        {isLoading ? (
          <Center className="py-20">
            <Spinner size="large" className="text-phase-interactive" />
            <Text className="mt-4 text-phaseText-muted font-bold">Loading gradebook...</Text>
          </Center>
        ) : error ? (
          <Box className="p-4 bg-phase-error/10 border border-phase-error/20 rounded-xl">
            <Text className="text-phase-error font-bold text-sm text-center">{error}</Text>
          </Box>
        ) : (
          <VStack className="gap-6">
            {/* Stats Grid */}
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Box className="bg-phase-surface p-5 rounded-[24px] border border-phase-border/40 shadow-sm">
                <HStack className="items-center gap-2 mb-3">
                  <Icon as={Users} size="xs" className="text-phase-interactive" />
                  <SectionLabel>Students</SectionLabel>
                </HStack>
                <Text className="text-3xl font-black text-phaseText-primary leading-none">
                  {stats.totalStudents}
                </Text>
              </Box>
              <Box className="bg-phase-surface p-5 rounded-[24px] border border-phase-border/40 shadow-sm">
                <HStack className="items-center gap-2 mb-3">
                  <Icon as={TrendingUp} size="xs" className="text-phase-success" />
                  <SectionLabel>Average</SectionLabel>
                </HStack>
                <Text className="text-3xl font-black text-phaseText-primary leading-none">
                  {stats.averageMarks}
                </Text>
              </Box>
              <Box className="bg-phase-surface p-5 rounded-[24px] border border-phase-border/40 shadow-sm">
                <HStack className="items-center gap-2 mb-3">
                  <Icon as={Award} size="xs" className="text-phase-warning" />
                  <SectionLabel>Pass Rate</SectionLabel>
                </HStack>
                <Text className="text-3xl font-black text-phaseText-primary leading-none">
                  {passRate}%
                </Text>
              </Box>
              <Box className="bg-phase-surface p-5 rounded-[24px] border border-phase-border/40 shadow-sm">
                <HStack className="items-center gap-2 mb-3">
                  <Icon as={SquarePen} size="xs" className="text-phase-interactive" />
                  <SectionLabel>Mode</SectionLabel>
                </HStack>
                <Text className="text-xl font-black text-phaseText-primary leading-none capitalize">
                  {gradingSettings?.grading_mode ?? 'marks'}
                </Text>
              </Box>
            </Box>

            {/* Sorting */}
            <HStack className="gap-2 flex-wrap">
              {sorts.map((sort) => {
                const isActive = sortBy === sort.id;
                return (
                  <SanctuaryButton
                    key={sort.id}
                    action={isActive ? 'primary' : 'secondary'}
                    onPress={() => setSortBy(sort.id)}
                    className={`px-4 py-2 h-auto ${isActive ? 'bg-phase-interactive border-transparent' : 'bg-phase-surface/40 border-phase-border/20'}`}
                  >
                    <Text
                      className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-phaseText-muted'}`}
                    >
                      {sort.label}
                    </Text>
                  </SanctuaryButton>
                );
              })}
            </HStack>

            {/* Grade Table */}
            <Box className="bg-phase-surface rounded-[32px] border border-phase-border/40 shadow-xl overflow-hidden">
              <Box className="grid grid-cols-5 gap-4 p-5 border-bottom border-phase-border/20 bg-phase-surface-secondary/30">
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[1px]">
                  Rank
                </Text>
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[1px] col-span-1">
                  Student
                </Text>
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[1px]">
                  Marks
                </Text>
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[1px]">
                  Status
                </Text>
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[1px]">
                  Action
                </Text>
              </Box>

              <VStack>
                {sortedGrades.map((grade) => {
                  const marks = grade.marks ?? 0;
                  const isPassing = marks >= passingMarks;
                  return (
                    <Box
                      key={grade.student_id}
                      className="grid grid-cols-5 gap-4 p-6 border-bottom border-phase-border/10 items-center hover:bg-phase-interactive/5 transition-all"
                    >
                      <Text className="text-sm font-black text-phaseText-primary">
                        #{grade.rank ?? '-'}
                      </Text>
                      <VStack className="col-span-1">
                        <Text className="text-sm font-bold text-phaseText-primary">
                          {studentNames[grade.student_id] ?? 'Student'}
                        </Text>
                        {grade.feedback && (
                          <Text className="text-[11px] text-phaseText-muted mt-1 italic">
                            "{grade.feedback}"
                          </Text>
                        )}
                      </VStack>
                      <Text className="text-sm font-black text-phaseText-primary">
                        {marks}/{maxMarks}
                      </Text>
                      <VStack className="gap-1">
                        <Text
                          className={`text-[11px] font-black uppercase tracking-widest ${isPassing ? 'text-phase-success' : 'text-phase-error'}`}
                        >
                          {isPassing ? 'Passing' : 'Failed'}
                        </Text>
                        <Text
                          className={`text-[10px] font-bold ${grade.publication_state === 'published' ? 'text-phase-success' : 'text-phaseText-muted/50'}`}
                        >
                          {grade.publication_state === 'published' ? 'Published' : 'Draft'}
                        </Text>
                      </VStack>
                      <HStack className="gap-2">
                        <SanctuaryButton
                          action="secondary"
                          onPress={() => setGradingId(grade.student_id)}
                          className="h-9 px-3 flex-1 bg-phase-surface/40 border-phase-border/30"
                        >
                          <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-primary text-center">
                            {grade.marks === null || grade.marks === undefined ? 'Grade' : 'Edit'}
                          </Text>
                        </SanctuaryButton>
                        {grade.id && (
                          <SanctuaryButton
                            action="secondary"
                            onPress={() => publishGrade(grade.id)}
                            className={`h-9 px-3 flex-1 border-2 ${grade.publication_state === 'published' ? 'border-phase-success/40 bg-phase-success/5' : 'border-phase-interactive/40 bg-phase-interactive/5'}`}
                          >
                            <Text
                              className={`text-[10px] font-black uppercase tracking-widest text-center ${grade.publication_state === 'published' ? 'text-phase-success' : 'text-phase-interactive'}`}
                            >
                              {grade.publication_state === 'published' ? 'Republish' : 'Publish'}
                            </Text>
                          </SanctuaryButton>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            {gradingStudent && (
              <GradeModal
                studentName={studentNames[gradingStudent.student_id] ?? 'Student'}
                current={
                  gradingStudent.marks === null || gradingStudent.marks === undefined
                    ? undefined
                    : {
                        marks: gradingStudent.marks,
                        feedback: gradingStudent.feedback ?? '',
                      }
                }
                maxMarks={maxMarks}
                onSave={handleSave}
                onClose={() => setGradingId(null)}
              />
            )}

            {showSettings && gradingSettings && (
              <SettingsModal
                current={gradingSettings}
                onSave={updateSettings}
                onClose={() => setShowSettings(false)}
              />
            )}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
