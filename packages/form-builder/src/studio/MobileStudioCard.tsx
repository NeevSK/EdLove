import type { QuestionRubric } from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField } from '@intuitui-labs/form-builder-engine/schema';
import { useThemedColors } from '@repo/ui/hooks';
import { Award, ChevronDown, ChevronUp, GripVertical, Settings2, Trash2 } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import React, { memo } from 'react';

export interface MobileStudioCardProps {
  field: FormField & { rubric?: QuestionRubric };
  index: number;
  totalFields: number;
  onSelect: (fieldId: string) => void;
  onEditConfig: (fieldId: string) => void;
  onEditRubric: (fieldId: string) => void;
  onRemove: (fieldId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const MobileStudioCard = memo(function MobileStudioCard({
  field,
  index,
  totalFields,
  onSelect,
  onEditConfig,
  onEditRubric,
  onRemove,
  onMoveUp,
  onMoveDown,
}: MobileStudioCardProps) {
  const colors = useThemedColors();
  const hasRubric = Boolean(field.rubric);

  return (
    <Box
      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-3"
      sx={{
        backgroundColor: colors.surface ?? '#FFFFFF',
        borderColor: colors.border ?? '#E2E8F0',
      }}
    >
      <HStack className="items-center justify-between">
        {/* Left Drag Affordance Handle */}
        <HStack className="items-center gap-2">
          <Icon as={GripVertical} color={colors.textTertiary ?? '#94A3B8'} size={20} />
          <Text
            className="text-[11px] font-black tracking-wider"
            sx={{ color: Theme.colors.sanctuarySaffron ?? '#D97706' }}
          >
            QUESTION {index + 1}
          </Text>
          <Box className="px-2 py-0.5 rounded-full bg-slate-100">
            <Text className="text-[10px] font-bold text-slate-600 uppercase">{field.type}</Text>
          </Box>
        </HStack>

        {/* Accessible Move Controls ([▲] [▼]) */}
        <HStack className="items-center gap-1">
          {index > 0 && onMoveUp && (
            <Pressable
              onPress={onMoveUp}
              accessibilityLabel={`Move Question ${index + 1} Up`}
              className="p-1 rounded-md bg-slate-50 border border-slate-200"
            >
              <Icon as={ChevronUp} size={14} color={colors.textSecondary ?? '#64748B'} />
            </Pressable>
          )}
          {index < totalFields - 1 && onMoveDown && (
            <Pressable
              onPress={onMoveDown}
              accessibilityLabel={`Move Question ${index + 1} Down`}
              className="p-1 rounded-md bg-slate-50 border border-slate-200"
            >
              <Icon as={ChevronDown} size={14} color={colors.textSecondary ?? '#64748B'} />
            </Pressable>
          )}
          <Pressable
            onPress={() => onRemove(field.id)}
            accessibilityLabel={`Delete Question ${index + 1}`}
            className="p-1.5 rounded-lg bg-red-50 ml-1"
          >
            <Icon as={Trash2} size={16} color={Theme.colors.emberRed ?? '#EF4444'} />
          </Pressable>
        </HStack>
      </HStack>

      {/* Question Label / Preview */}
      <VStack className="mt-2.5">
        <Text className="text-base font-bold text-slate-800">
          {field.label || 'Untitled Question'}
        </Text>
        {field.placeholder && (
          <Text className="text-xs text-slate-400 mt-0.5 italic">Hint: {field.placeholder}</Text>
        )}
      </VStack>

      {/* Quiz Rubric Badge if attached */}
      {hasRubric && (
        <HStack className="mt-3 p-2 rounded-xl bg-amber-50/80 border border-amber-200 items-center justify-between">
          <HStack className="items-center gap-1.5">
            <Icon as={Award} size={16} color="#D97706" />
            <Text className="text-xs font-bold text-amber-900">
              Graded Quiz Question ({field.rubric?.points ?? 10} pts)
            </Text>
          </HStack>
          <Text className="text-[10px] font-semibold text-amber-700 capitalize">
            {field.rubric?.kind}
          </Text>
        </HStack>
      )}

      {/* Action Pills */}
      <HStack className="mt-3 pt-2.5 border-t border-slate-100 justify-end gap-2">
        <Pressable
          onPress={() => onEditRubric(field.id)}
          className={`px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 ${
            hasRubric ? 'bg-amber-100/60 border-amber-300' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <Icon as={Award} size={14} color={hasRubric ? '#B45309' : '#64748B'} />
          <Text className={`text-xs font-bold ${hasRubric ? 'text-amber-900' : 'text-slate-600'}`}>
            {hasRubric ? 'Edit Rubric' : '+ Add Quiz Grading'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onEditConfig(field.id)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex-row items-center gap-1.5"
        >
          <Icon as={Settings2} size={14} color="#64748B" />
          <Text className="text-xs font-bold text-slate-600">Configure</Text>
        </Pressable>
      </HStack>
    </Box>
  );
});
