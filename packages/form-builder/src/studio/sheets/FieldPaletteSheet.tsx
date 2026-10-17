import type { FieldDefinition, FieldType } from '@intuitui-labs/form-builder-engine/schema';
import {
  Award,
  Camera,
  Check,
  ChevronDown,
  FileText,
  FolderCheck,
  Hash,
  Mail,
  Star,
  X,
} from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import React from 'react';
import { studioColors } from '../theme';

export interface FieldPaletteOption {
  type: FieldType;
  label: string;
  description: string;
  icon: any;
  category: 'input' | 'choice' | 'quiz' | 'media';
  isQuizGraded?: boolean;
}

const PALETTE_OPTIONS: FieldPaletteOption[] = [
  // Standard Inputs
  {
    type: 'text',
    label: 'Short Answer',
    description: 'Single-line text entry',
    icon: FileText,
    category: 'input',
  },
  {
    type: 'textarea',
    label: 'Paragraph',
    description: 'Multi-line detailed text entry',
    icon: FileText,
    category: 'input',
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric keypad input with validation',
    icon: Hash,
    category: 'input',
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address with validation mask',
    icon: Mail,
    category: 'input',
  },

  // Choice & Scales
  {
    type: 'select',
    label: 'Single Choice Dropdown',
    description: 'Pick one option from a list',
    icon: ChevronDown,
    category: 'choice',
  },
  {
    type: 'likert',
    label: 'Likert Rating Scale',
    description: '1–5 satisfaction rating or agreement scale',
    icon: Star,
    category: 'choice',
  },
  {
    type: 'slider',
    label: 'Numeric Slider',
    description: 'Continuous value selection slider',
    icon: Check,
    category: 'choice',
  },

  // Quiz Questions (Pre-configured rubrics)
  {
    type: 'select',
    label: 'Quiz Multiple Choice',
    description: 'Single correct answer with instant feedback and points',
    icon: Award,
    category: 'quiz',
    isQuizGraded: true,
  },
  {
    type: 'number',
    label: 'Quiz Numeric Range',
    description: 'Graded number answer with margin of error tolerance',
    icon: Hash,
    category: 'quiz',
    isQuizGraded: true,
  },

  // Multimedia
  {
    type: 'image-capture',
    label: 'Photo / Camera',
    description: 'Take photo or upload image',
    icon: Camera,
    category: 'media',
  },
  {
    type: 'file',
    label: 'File Attachment',
    description: 'PDF or document upload',
    icon: FolderCheck,
    category: 'media',
  },
];

export interface FieldPaletteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: FieldPaletteOption) => void;
}

export function FieldPaletteSheet({ isOpen, onClose, onSelectOption }: FieldPaletteSheetProps) {
  const colors = studioColors;

  if (!isOpen) return null;

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
        <VStack>
          <Text className="text-lg font-black text-slate-900">Add Question</Text>
          <Text className="text-xs text-slate-500">Choose a question type to insert</Text>
        </VStack>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close palette"
          className="p-2 rounded-full bg-slate-100"
        >
          <Icon as={X} size={18} color={colors.textSecondary ?? '#64748B'} />
        </Pressable>
      </HStack>

      {/* Categories & Options List */}
      <ScrollView className="mt-3 max-h-[460px] pb-6" showsVerticalScrollIndicator={false}>
        <VStack className="gap-2">
          {PALETTE_OPTIONS.map((item, idx) => {
            const isQuiz = item.category === 'quiz';
            return (
              <Pressable
                key={`${item.type}-${idx}`}
                onPress={() => onSelectOption(item)}
                className={`p-3.5 rounded-2xl border flex-row items-center gap-3.5 active:opacity-75 ${
                  isQuiz ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <Box
                  className={`p-2.5 rounded-xl ${
                    isQuiz ? 'bg-amber-100 text-amber-900' : 'bg-white shadow-xs'
                  }`}
                >
                  <Icon
                    as={item.icon}
                    size={20}
                    color={isQuiz ? '#D97706' : (colors.textPrimary ?? '#0F172A')}
                  />
                </Box>
                <VStack className="flex-1">
                  <HStack className="items-center gap-2">
                    <Text className="text-sm font-bold text-slate-900">{item.label}</Text>
                    {isQuiz && (
                      <Box className="px-1.5 py-0.5 rounded bg-amber-200/80">
                        <Text className="text-[9px] font-extrabold text-amber-900 uppercase">
                          GRADED
                        </Text>
                      </Box>
                    )}
                  </HStack>
                  <Text className="text-xs text-slate-500 mt-0.5">{item.description}</Text>
                </VStack>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </Box>
  );
}
