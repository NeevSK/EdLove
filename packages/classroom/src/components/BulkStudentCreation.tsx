import type { BulkStudent } from '@repo/core';
import { Plus, Save, Trash2, X } from '@repo/ui/icons';
import { Box, Button, Input, Textarea } from '@repo/ui/primitives';
import { ButtonText, HStack, Heading, Icon, InputField, Text, TextareaInput, VStack } from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BulkStudentCreationProps {
  onStudentsCreated: (students: BulkStudent[]) => void;
  onCancel: () => void;
}

type Step = 'count' | 'entry' | 'review';

type DraftStudent = BulkStudent & { id: string };

const createDraftStudent = (): DraftStudent => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  index_number: '',
  notes: '',
});

export default function BulkStudentCreation({
  onStudentsCreated,
  onCancel,
}: BulkStudentCreationProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [totalCount, setTotalCount] = useState('');
  const [students, setStudents] = useState<DraftStudent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('count');

  const currentStudent = students[currentIndex];
  const validStudentsCount = useMemo(
    () => students.filter((student) => student.name.trim() && student.index_number.trim()).length,
    [students],
  );

  const showError = (message: string) => {
    toast.showToast({ message, type: 'error' });
  };

  const initializeStudents = () => {
    const count = Number.parseInt(totalCount, 10);
    if (!Number.isFinite(count) || count < 1 || count > 100) {
      showError(
        t('bulk_creation.errors.invalidNumber') || 'Please enter a number between 1 and 100',
      );
      return;
    }

    hapticLight();
    setStudents(Array.from({ length: count }, createDraftStudent));
    setCurrentIndex(0);
    setStep('entry');
  };

  const updateCurrentStudent = (field: keyof BulkStudent, value: string) => {
    setStudents((prev) =>
      prev.map((student, index) =>
        index === currentIndex ? { ...student, [field]: value } : student,
      ),
    );
  };

  const moveToPrevious = () => {
    hapticLight();
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const moveToNext = () => {
    const student = students[currentIndex];
    if (!student?.name.trim() || !student.index_number.trim()) {
      showError(t('bulk_creation.errors.requiredFields') || 'Name and Index are required');
      return;
    }

    hapticLight();
    if (currentIndex < students.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }
    setStep('review');
  };

  const skipStudent = () => {
    hapticLight();
    if (currentIndex < students.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  };

  const addOneMore = () => {
    hapticLight();
    setStudents((prev) => [...prev, createDraftStudent()]);
    setCurrentIndex(students.length);
    setStep('entry');
  };

  const removeStudent = (index: number) => {
    hapticLight();
    setStudents((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setStep('count');
        setTotalCount('');
        setCurrentIndex(0);
      } else if (currentIndex >= next.length) {
        setCurrentIndex(next.length - 1);
      }
      return next;
    });
  };

  const confirmImport = () => {
    const validStudents = students.filter(
      (student) => student.name.trim() && student.index_number.trim(),
    );
    if (validStudents.length === 0) {
      showError(t('bulk_creation.errors.noValidStudents') || 'No valid students to add');
      return;
    }

    hapticSuccess();
    onStudentsCreated(validStudents.map(({ id: _id, ...student }) => student));
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
        <Pressable onPress={onCancel} className="rounded-full bg-phase-surface-secondary p-3">
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
                  onChangeText={setTotalCount}
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
                {t('bulk_creation.completedCount', { count: validStudentsCount }) ||
                  `${validStudentsCount} completed`}
              </Text>
            </HStack>

            <Box className="h-1.5 overflow-hidden rounded-full bg-phase-surface-secondary">
              <Box
                className="h-full rounded-full bg-sanctuarySaffron"
                style={{ width: `${((currentIndex + 1) / students.length) * 100}%` }}
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
                setStep('review');
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
                            setCurrentIndex(index);
                            setStep('entry');
                          }}
                        >
                          <Text className="text-sm font-bold text-sanctuarySaffron">
                            {t('common.edit') || 'Edit'}
                          </Text>
                        </Pressable>
                        <Pressable onPress={() => removeStudent(index)}>
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
                    {t('bulk_creation.addStudentsAction', { count: validStudentsCount }) ||
                      `Add ${validStudentsCount} Student(s)`}
                  </ButtonText>
                </HStack>
              </Button>

              <Pressable
                onPress={() => {
                  hapticLight();
                  setStep('entry');
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
