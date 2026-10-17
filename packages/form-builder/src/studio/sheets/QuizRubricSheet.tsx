import type {
  QuestionRubric,
  SingleChoiceRubric,
} from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField } from '@intuitui-labs/form-builder-engine/schema';
import { Award, Check, Minus, Plus, X } from '@repo/ui/icons';
import {
  Box,
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
import { Theme } from '@repo/ui/theme';
import React, { useEffect, useState } from 'react';
import { studioColors } from '../theme';

export interface QuizRubricSheetProps {
  isOpen: boolean;
  field: (FormField & { rubric?: QuestionRubric }) | null;
  onClose: () => void;
  onSaveRubric: (fieldId: string, rubric: QuestionRubric | undefined) => void;
}

export function QuizRubricSheet({ isOpen, field, onClose, onSaveRubric }: QuizRubricSheetProps) {
  const colors = studioColors;

  const [points, setPoints] = useState(10);
  const [correctValue, setCorrectValue] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGraded, setIsGraded] = useState(false);

  useEffect(() => {
    if (field) {
      if (field.rubric) {
        setIsGraded(true);
        setPoints(field.rubric.points ?? 10);
        setExplanation(field.rubric.explanation ?? '');
        if (field.rubric.kind === 'single-choice') {
          setCorrectValue(
            typeof field.rubric.correctValue === 'string' ? field.rubric.correctValue : '',
          );
        }
      } else {
        setIsGraded(false);
        setPoints(10);
        setCorrectValue('');
        setExplanation('');
      }
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const handleSave = () => {
    if (!isGraded) {
      onSaveRubric(field.id, undefined);
      onClose();
      return;
    }

    const rubric: SingleChoiceRubric = {
      kind: 'single-choice',
      points: Math.max(1, points),
      correctValue: correctValue.trim() || 'Option 1',
      explanation: explanation.trim() || undefined,
    };

    onSaveRubric(field.id, rubric);
    onClose();
  };

  return (
    <Box
      className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl z-50 p-5"
      sx={{
        backgroundColor: colors.surface ?? '#FFFFFF',
        borderColor: colors.border ?? '#E2E8F0',
      }}
    >
      {/* Header */}
      <HStack className="items-center justify-between pb-3 border-b border-slate-100">
        <HStack className="items-center gap-2">
          <Box className="p-2 rounded-xl bg-amber-100">
            <Icon as={Award} size={20} color="#D97706" />
          </Box>
          <VStack>
            <Text className="text-lg font-black text-slate-900">Quiz Grading & Rubric</Text>
            <Text className="text-xs text-slate-500">{field.label || 'Question'}</Text>
          </VStack>
        </HStack>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close rubric sheet"
          className="p-2 rounded-full bg-slate-100"
        >
          <Icon as={X} size={18} color={colors.textSecondary ?? '#64748B'} />
        </Pressable>
      </HStack>

      <ScrollView className="mt-4 max-h-[460px] pb-6" showsVerticalScrollIndicator={false}>
        <VStack className="gap-5">
          {/* Graded Toggle */}
          <HStack className="items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <VStack>
              <Text className="text-sm font-bold text-slate-900">Enable Scoring</Text>
              <Text className="text-xs text-slate-500">Award points and evaluate answer</Text>
            </VStack>
            <Pressable
              onPress={() => setIsGraded((prev) => !prev)}
              className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                isGraded ? 'bg-amber-500 items-end' : 'bg-slate-300 items-start'
              }`}
            >
              <Box className="w-6 h-6 rounded-full bg-white shadow-xs" />
            </Pressable>
          </HStack>

          {isGraded && (
            <>
              {/* Points Tuner */}
              <VStack className="gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Points Awarded
                </Text>
                <HStack className="items-center gap-3">
                  <Pressable
                    onPress={() => setPoints((p) => Math.max(1, p - 1))}
                    className="p-3 rounded-xl bg-slate-100 border border-slate-200"
                  >
                    <Icon as={Minus} size={18} color="#475569" />
                  </Pressable>
                  <Box className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-200 justify-center items-center">
                    <Text className="text-lg font-black text-amber-900">{points} pts</Text>
                  </Box>
                  <Pressable
                    onPress={() => setPoints((p) => p + 1)}
                    className="p-3 rounded-xl bg-slate-100 border border-slate-200"
                  >
                    <Icon as={Plus} size={18} color="#475569" />
                  </Pressable>
                </HStack>
              </VStack>

              {/* Correct Answer Key */}
              <VStack className="gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Correct Answer Key
                </Text>
                <Input className="h-12 rounded-xl bg-slate-50 border border-slate-200">
                  <InputField
                    value={correctValue}
                    onChangeText={setCorrectValue}
                    placeholder="Enter expected answer value..."
                    className="text-sm"
                  />
                </Input>
              </VStack>

              {/* Explanation Card */}
              <VStack className="gap-2">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Explanation (Revealed on Answer)
                </Text>
                <Textarea className="rounded-xl bg-slate-50 border border-slate-200 h-24">
                  <TextareaInput
                    value={explanation}
                    onChangeText={setExplanation}
                    placeholder="Explain why this answer is correct..."
                    className="text-sm"
                  />
                </Textarea>
              </VStack>
            </>
          )}

          {/* Action Buttons */}
          <HStack className="gap-3 mt-2">
            <Pressable
              onPress={handleSave}
              className="flex-1 h-12 rounded-xl bg-amber-500 justify-center items-center shadow-sm"
            >
              <Text className="text-sm font-black text-white">Save Rubric</Text>
            </Pressable>
          </HStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
