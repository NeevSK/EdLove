/**
 * GRADE ENTRY FORM COMPONENT
 *
 * Form for teachers to enter student grades.
 */

import { marksToGPA } from '@repo/analytics';
import { Box, Button, Input, Textarea } from '@repo/ui/primitives';
import { ButtonText, HStack, Heading, InputField, Text, TextareaInput, VStack } from '@repo/ui/primitives';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GradeEntryFormProps {
  studentName: string;
  initialMarks?: number;
  initialFeedback?: string;
  showGPA?: boolean;
  onSave: (marks: number, feedback: string) => void;
  onCancel?: () => void;
}

export default function GradeEntryForm({
  studentName,
  initialMarks = 0,
  initialFeedback = '',
  showGPA = true,
  onSave,
  onCancel,
}: GradeEntryFormProps) {
  const { t } = useTranslation();
  const [marks, setMarks] = useState(initialMarks.toString());
  const [feedback, setFeedback] = useState(initialFeedback);
  const [error, setError] = useState('');

  const marksNumber = marks === '' ? 0 : parseFloat(marks) || 0;
  const { grade, gpa } = marksToGPA(marksNumber);

  const handleSave = () => {
    const marksValue = parseFloat(marks);

    // Validation
    if (Number.isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
      setError(t('grades.invalidMarks') || 'Invalid marks');
      return;
    }

    setError('');
    onSave(marksValue, feedback);
  };

  return (
    <VStack className="gap-8 p-6 bg-phase-surface rounded-[32px] border border-phase-canvas shadow-md">
      {/* Student Name Header */}
      <VStack className="gap-1.5">
        <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
          {t('grades.student') || 'STUDENT'}
        </Text>
        <Heading className="text-3xl font-black text-phaseText-primary -ml-0.5">
          {studentName}
        </Heading>
      </VStack>

      {/* Marks Input */}
      <VStack className="gap-3">
        <Text className="text-[11px] font-black text-phaseText-secondary uppercase tracking-[0.15em] ml-1">
          {t('grades.marks') || 'Marks'} *
        </Text>
        <Input
          className={`h-16 px-5 bg-phase-canvas/50 rounded-generous border ${error ? 'border-phase-danger' : 'border-phase-canvas'}`}
        >
          <InputField
            placeholder="0-100"
            keyboardType="numeric"
            value={marks}
            onChangeText={(val: string) => {
              setMarks(val);
              setError('');
            }}
            className="text-phaseText-primary font-black text-xl"
          />
        </Input>
        {error && (
          <Text className="text-[10px] font-black text-phase-danger uppercase tracking-wider ml-2">
            {error}
          </Text>
        )}
      </VStack>

      {/* Auto-computed GPA Preview */}
      {showGPA && marks !== '' && marksNumber > 0 && (
        <Box className="p-6 bg-templeGold/5 rounded-generous border border-templeGold/20 overflow-hidden relative">
          <HStack className="justify-between items-center relative z-10">
            <VStack className="gap-1.5">
              <Text className="text-[10px] font-black text-templeGold uppercase tracking-[0.2em]">
                {t('grades.grade') || 'GRADE'}
              </Text>
              <Text className="text-4xl font-black text-templeGold">{grade}</Text>
            </VStack>
            <VStack className="gap-1.5 items-end">
              <Text className="text-[10px] font-black text-templeGold uppercase tracking-[0.2em]">
                {t('grades.gpa') || 'GPA'}
              </Text>
              <Text className="text-4xl font-black text-templeGold">{gpa.toFixed(1)}</Text>
            </VStack>
          </HStack>
          <Box className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-templeGold/10 opacity-20" />
        </Box>
      )}

      {/* Feedback Textarea */}
      <VStack className="gap-3">
        <Text className="text-[11px] font-black text-phaseText-secondary uppercase tracking-[0.15em] ml-1">
          {t('grades.feedback') || 'Feedback'}{' '}
          <Text className="lowercase opacity-40">({t('grades.optional') || 'optional'})</Text>
        </Text>
        <Textarea className="min-h-[120px] px-5 py-4 bg-phase-canvas/50 rounded-generous border border-phase-canvas">
          <TextareaInput
            placeholder={t('grades.feedbackPlaceholder') || 'Enter feedback...'}
            value={feedback}
            onChangeText={setFeedback}
            className="text-phaseText-primary font-black text-base"
          />
        </Textarea>
      </VStack>

      {/* Action Buttons */}
      <HStack className="gap-4 pt-2">
        {onCancel && (
          <Button
            variant="outline"
            className="flex-1 h-14 rounded-full border-phase-canvas bg-phase-surface shadow-sm active:bg-phase-canvas"
            onPress={onCancel}
          >
            <ButtonText className="text-phaseText-secondary font-black uppercase text-[11px] tracking-[0.2em]">
              {t('common.cancel') || 'Cancel'}
            </ButtonText>
          </Button>
        )}
        <Button
          className="flex-[1.5] h-14 bg-templeGold rounded-full shadow-lg shadow-templeGold/20 active:opacity-85"
          onPress={handleSave}
        >
          <ButtonText className="text-black font-black uppercase text-[11px] tracking-[0.2em]">
            {t('common.save') || 'Save'}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}
