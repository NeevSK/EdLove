import { StorageKeys, storage } from '@repo/core/logic';
import type { BulkStudent } from '@repo/core/types';
import { useActorSnapshot } from '@repo/core/hooks/useActorSnapshot';
import {
  createBulkStudentCreationActor,
  executeBulkStudentImportEffect,
  restoreBulkStudentDraftSnapshot,
  saveBulkStudentDraftSnapshot,
  type BulkStudentStep,
  type DraftStudent,
} from '@repo/classroom/machines/bulkStudentCreationMachine';
import { Plus, Save, Trash2, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { Theme } from '@repo/ui/theme';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { confirmAction } from '@repo/ui/utils/dialogs';

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface BulkStudentCreationProps {
  onStudentsCreated: (students: BulkStudent[]) => void;
  onCancel: () => void;
}

export default function BulkStudentCreation({
  onStudentsCreated,
  onCancel,
}: BulkStudentCreationProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const actor = useMemo(() => createBulkStudentCreationActor(), []);
  const snapshot = useActorSnapshot(actor);
  const { totalCount, students, currentIndex, error } = snapshot.context;
  const step = snapshot.value as BulkStudentStep;

  // Restore draft on mount
  useEffect(() => {
    restoreBulkStudentDraftSnapshot(actor);
  }, [actor]);

  // Auto-save logic
  useEffect(() => {
    saveBulkStudentDraftSnapshot(actor);
  }, [actor, students, step, currentIndex]);

  // Show error via toast and clear it in machine
  useEffect(() => {
    if (error) {
      toast.showToast({ message: error, type: 'error' });
      actor.send({ type: 'CLEAR_ERROR' });
    }
  }, [error, toast, actor]);

  const currentStudent = students[currentIndex];
  const validStudentsCount = useMemo(
    () => students.filter((student) => student.name.trim() && student.index_number.trim()).length,
    [students],
  );

  const showError = (message: string) => {
    toast.showToast({ message, type: 'error' });
  };

  const initializeStudents = () => {
    hapticLight();
    actor.send({ type: 'START_ENTRY' });
  };

  const updateCurrentStudent = (field: keyof BulkStudent, value: string) => {
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field, value });
  };

  const moveToPrevious = () => {
    hapticLight();
    actor.send({ type: 'PREV_STUDENT' });
  };

  const moveToNext = () => {
    hapticLight();
    actor.send({ type: 'NEXT_STUDENT' });
  };

  const skipStudent = () => {
    hapticLight();
    actor.send({ type: 'SKIP_STUDENT' });
  };

  const addOneMore = () => {
    hapticLight();
    actor.send({ type: 'ADD_ONE_MORE' });
  };

  const removeStudent = async (index: number) => {
    const student = students[index];
    const confirmed = await confirmAction(
      'Remove student from draft?',
      `${student?.name || `Student ${index + 1}`} will be removed from this draft.`,
    );
    if (!confirmed) return;

    hapticLight();
    actor.send({ type: 'REMOVE_STUDENT', index });
  };

  const handleCancel = async () => {
    if (students.length > 0) {
      const confirmed = await confirmAction(
        'Discard student draft?',
        'Your entered student details are saved locally and will be discarded.',
      );
      if (!confirmed) return;
      storage.delete(StorageKeys.DRAFT_STUDENTS);
      actor.send({ type: 'RESET' });
    }
    onCancel();
  };

  const confirmImport = async () => {
    const result = await executeBulkStudentImportEffect(
      actor,
      (validList) => onStudentsCreated(validList),
      () => storage.delete(StorageKeys.DRAFT_STUDENTS),
    );

    if (result.success) {
      hapticSuccess();
    } else if (result.error) {
      showError(result.error);
    }
  };

  return (
    <Box className="flex-1 bg-phase-canvas">
      <HStack className="items-center justify-between border-b border-phase-border/40 px-6 py-5">
        <VStack className="gap-1">
          <Heading className="text-xl font-black text-phase-text-primary">
            {t('bulk_creation.title') || 'Bulk Add Students'}
          </Heading>
          <Text className="text-sm text-phase-text-secondary">
            {t('bulk_creation.subtitle') || 'Create students in one guided flow'}
          </Text>
        </VStack>
        <Pressable
          onPress={() => void handleCancel()}
          className="rounded-full bg-phase-surface-secondary p-3"
          accessibilityRole="button"
          accessibilityLabel="Close bulk student creation"
          accessibilityHint="Closes this flow and asks before discarding the draft"
        >
          <Icon as={X} size={20} color="#1F2937" />
        </Pressable>
      </HStack>

      <ScrollView contentContainerClassName="px-6 py-6 pb-24">
        {step === 'count' && (
          <VStack className="gap-5">
            <Text className="text-center text-base font-medium text-phase-text-secondary">
              {t('bulk_creation.howMany') || 'How many students do you want to add?'}
            </Text>

            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">
                {t('bulk_creation.countLabel') || 'Student count'}
              </Text>
              <Input className="rounded-[20px] border border-phase-border/40 bg-phase-surface">
                <InputField
                  placeholder={t('bulk_creation.countPlaceholder') || 'Enter number (e.g., 35)'}
                  value={totalCount}
                  onChangeText={(value) => actor.send({ type: 'SET_TOTAL_COUNT', totalCount: value })}
                  keyboardType="number-pad"
                  className="py-4 text-center text-2xl font-black text-phase-text-primary"
                />
              </Input>
            </VStack>

            <Button onPress={initializeStudents} className="rounded-full bg-sanctuarySaffron">
              <ButtonText className="font-black uppercase tracking-wider text-sanctuary-ink">
                {t('bulk_creation.startEntry') || 'Start Entry'}
              </ButtonText>
            </Button>

            <Text className="text-center text-xs text-phase-text-tertiary">
              {t('bulk_creation.maxLimit') || 'Maximum 100 students at once'}
            </Text>
          </VStack>
        )}

        {step === 'entry' && currentStudent && (
          <VStack className="gap-6">
            <HStack className="items-center justify-between">
              <Text className="text-xs font-black uppercase tracking-[0.2em] text-phase-text-tertiary">
                {t('bulk_creation.progress', {
                  current: currentIndex + 1,
                  total: students.length,
                }) || `Student ${currentIndex + 1} of ${students.length}`}
              </Text>
              <Text className="text-xs font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
                {t('bulk_creation.completedCount', {
                  count: validStudentsCount,
                }) || `${validStudentsCount} completed`}
              </Text>
            </HStack>

            <Box className="h-1.5 overflow-hidden rounded-full bg-phase-surface-secondary">
              <Box
                className="h-full rounded-full bg-sanctuarySaffron"
                style={{
                  width: `${((currentIndex + 1) / students.length) * 100}%`,
                }}
              />
            </Box>

            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">
                {t('bulk_creation.studentName') || 'Student Name *'}
              </Text>
              <Input className="rounded-[20px] border border-phase-border/40 bg-phase-surface">
                <InputField
                  placeholder={t('bulk_creation.namePlaceholder') || 'Enter full name'}
                  value={currentStudent.name}
                  onChangeText={(value) => updateCurrentStudent('name', value)}
                  className="py-4 text-phase-text-primary"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">
                {t('bulk_creation.indexNumber') || 'Index Number *'}
              </Text>
              <Input className="rounded-[20px] border border-phase-border/40 bg-phase-surface">
                <InputField
                  placeholder={t('bulk_creation.indexPlaceholder') || 'Enter index number'}
                  value={currentStudent.index_number}
                  onChangeText={(value) => updateCurrentStudent('index_number', value)}
                  className="py-4 text-phase-text-primary"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">
                {t('bulk_creation.optionalNotes') || 'Notes (Optional)'}
              </Text>
              <Textarea className="min-h-[110px] rounded-[20px] border border-phase-border/40 bg-phase-surface">
                <TextareaInput
                  placeholder={
                    t('bulk_creation.notesPlaceholder') || 'Add any notes about this student...'
                  }
                  value={currentStudent.notes}
                  onChangeText={(value) => updateCurrentStudent('notes', value)}
                  className="p-4 text-phase-text-primary"
                />
              </Textarea>
            </VStack>

            <HStack className="gap-3">
              <Button
                variant="outline"
                onPress={moveToPrevious}
                isDisabled={currentIndex === 0}
                className="flex-1 rounded-full border-phase-border/40"
              >
                <ButtonText className="font-black uppercase tracking-wider text-phase-text-secondary">
                  {t('bulk_creation.previous') || 'Previous'}
                </ButtonText>
              </Button>
              <Button
                variant="outline"
                onPress={skipStudent}
                className="flex-1 rounded-full border-phase-border/40"
              >
                <ButtonText className="font-black uppercase tracking-wider text-phase-text-secondary">
                  {t('bulk_creation.skip') || 'Skip'}
                </ButtonText>
              </Button>
            </HStack>

            <Button onPress={moveToNext} className="rounded-full bg-sanctuarySaffron">
              <ButtonText className="font-black uppercase tracking-wider text-sanctuary-ink">
                {currentIndex === students.length - 1
                  ? t('bulk_creation.finishReview') || 'Finish & Review'
                  : t('bulk_creation.saveNext') || 'Save & Next'}
              </ButtonText>
            </Button>

            <Pressable
              onPress={() => {
                hapticLight();
                actor.send({ type: 'GO_TO_REVIEW' });
              }}
              className="items-center py-2"
            >
              <Text className="text-sm font-bold text-phase-text-secondary">
                {t('bulk_creation.reviewAll', { count: validStudentsCount }) ||
                  `Review All (${validStudentsCount})`}
              </Text>
            </Pressable>
          </VStack>
        )}

        {step === 'review' && (
          <VStack className="gap-6">
            <Text className="text-center text-base font-medium text-phase-text-secondary">
              {t('bulk_creation.reviewDesc') || 'Review all students before adding to classroom'}
            </Text>
            <Text className="text-center text-lg font-black text-sanctuarySaffron">
              {t('bulk_creation.validCount', { count: validStudentsCount }) ||
                `${validStudentsCount} valid student(s)`}
            </Text>

            <VStack className="gap-3">
              {students.map((student, index) => {
                const isValid = student.name.trim() && student.index_number.trim();
                return (
                  <Box
                    key={student.id}
                    className={`rounded-[24px] border p-4 ${isValid ? 'border-sageGreen/40' : 'border-chestnutRed/40'} bg-phase-surface-secondary`}
                  >
                    <HStack className="items-start justify-between gap-4">
                      <VStack className="flex-1 gap-1">
                        <HStack className="items-center gap-2">
                          <Text className="text-xs font-bold text-phase-text-tertiary">
                            #{index + 1}
                          </Text>
                          <Text className="text-base font-black text-phase-text-primary">
                            {student.name || t('bulk_creation.noName') || 'No name'}
                          </Text>
                        </HStack>
                        <Text className="text-xs text-phase-text-secondary">
                          {t('students.rollNumber') || 'Index'}:{' '}
                          {student.index_number || t('bulk_creation.noIndex') || 'No index'}
                        </Text>
                        {!!student.notes && (
                          <Text className="text-xs italic text-phase-text-secondary">
                            {student.notes}
                          </Text>
                        )}
                      </VStack>
                      <HStack className="items-center gap-3">
                        <Pressable
                          onPress={() => {
                            hapticLight();
                            actor.send({ type: 'EDIT_STUDENT', index });
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Edit ${student.name || `student ${index + 1}`}`}
                        >
                          <Text className="text-sm font-bold text-sanctuarySaffron">
                            {t('common.edit') || 'Edit'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => void removeStudent(index)}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${student.name || `student ${index + 1}`}`}
                          accessibilityHint="Removes this student from the draft"
                        >
                          <Icon as={Trash2} size={18} color={Theme.colors.emberRed} />
                        </Pressable>
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            <VStack className="gap-3">
              <Button
                variant="outline"
                onPress={addOneMore}
                className="rounded-full border-sanctuarySaffron"
              >
                <HStack className="items-center gap-2">
                  <Icon as={Plus} size={18} color={Theme.colors.sanctuarySaffron} />
                  <ButtonText className="font-black uppercase tracking-wider text-sanctuarySaffron">
                    {t('bulk_creation.addOneMore') || 'Add One More'}
                  </ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={confirmImport}
                isDisabled={validStudentsCount === 0}
                className="rounded-full bg-sanctuarySaffron"
              >
                <HStack className="items-center gap-2">
                  <Icon as={Save} size={18} color={Theme.colors.sanctuaryInk} />
                  <ButtonText className="font-black uppercase tracking-wider text-sanctuary-ink">
                    {t('bulk_creation.addStudentsAction', {
                      count: validStudentsCount,
                    }) || `Add ${validStudentsCount} Student(s)`}
                  </ButtonText>
                </HStack>
              </Button>

              <Pressable
                onPress={() => {
                  hapticLight();
                  actor.send({ type: 'BACK_TO_ENTRY' });
                }}
                className="items-center py-2"
              >
                <Text className="text-sm font-bold text-phase-text-secondary">
                  {t('bulk_creation.backToEntry') || 'Back to Entry'}
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
