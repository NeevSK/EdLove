import type { FormField, FormPage, PageJumpRule } from '@intuitui-labs/form-builder-engine/schema';
import { ArrowRight, GitBranch, Plus, Trash2, X } from '@repo/ui/icons';
import {
  Box,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import React, { useState } from 'react';
import { studioColors } from '../theme';

export interface BranchingSheetProps {
  isOpen: boolean;
  activePage: FormPage | null;
  allPages: FormPage[];
  onClose: () => void;
  onAddJumpRule: (pageId: string, rule: PageJumpRule) => void;
  onRemoveJumpRule: (pageId: string, ruleIndex: number) => void;
}

export function BranchingSheet({
  isOpen,
  activePage,
  allPages,
  onClose,
  onAddJumpRule,
  onRemoveJumpRule,
}: BranchingSheetProps) {
  const colors = studioColors;

  const [targetField, setTargetField] = useState('');
  const [operator, setOperator] = useState<'equals' | 'notEquals' | 'greaterThan'>('equals');
  const [targetValue, setTargetValue] = useState('');
  const [targetPageId, setTargetPageId] = useState(
    allPages.find((p) => p.id !== activePage?.id)?.id ?? '',
  );

  if (!isOpen || !activePage) return null;

  const handleAddRule = () => {
    if (!targetField.trim() || !targetPageId) return;

    onAddJumpRule(activePage.id, {
      condition: {
        field: targetField.trim(),
        operator,
        value: targetValue.trim(),
      },
      targetPageId,
    });

    setTargetField('');
    setTargetValue('');
  };

  const jumpRules = activePage.jumpRules ?? [];

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
          <Box className="p-2 rounded-xl bg-purple-100">
            <Icon as={GitBranch} size={20} color="#7C3AED" />
          </Box>
          <VStack>
            <Text className="text-lg font-black text-slate-900">Branching Flow & Directions</Text>
            <Text className="text-xs text-slate-500">{activePage.title || 'Step'}</Text>
          </VStack>
        </HStack>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close branching sheet"
          className="p-2 rounded-full bg-slate-100"
        >
          <Icon as={X} size={18} color={colors.textSecondary ?? '#64748B'} />
        </Pressable>
      </HStack>

      <ScrollView className="mt-4 max-h-[460px] pb-6" showsVerticalScrollIndicator={false}>
        <VStack className="gap-5">
          {/* Active Jump Rules */}
          <VStack className="gap-2">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Active Exit Rules ({jumpRules.length})
            </Text>
            {jumpRules.length === 0 ? (
              <Box className="p-4 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center">
                <Text className="text-xs text-slate-400">
                  No jump rules configured. Proceeds to next step by default.
                </Text>
              </Box>
            ) : (
              jumpRules.map((rule, idx) => {
                const targetPage = allPages.find((p) => p.id === rule.targetPageId);
                const cond = rule.condition as any;
                return (
                  <HStack
                    key={idx}
                    className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 items-center justify-between"
                  >
                    <VStack className="flex-1">
                      <HStack className="items-center gap-1.5">
                        <Text className="text-xs font-bold text-purple-900">
                          If [{cond?.field ?? 'field'}] {cond?.operator} "{String(cond?.value)}"
                        </Text>
                        <Icon as={ArrowRight} size={12} color="#7C3AED" />
                        <Text className="text-xs font-black text-purple-900">
                          {targetPage?.title ?? rule.targetPageId}
                        </Text>
                      </HStack>
                    </VStack>
                    <Pressable
                      onPress={() => onRemoveJumpRule(activePage.id, idx)}
                      className="p-1 rounded bg-purple-100"
                    >
                      <Icon as={Trash2} size={14} color="#EF4444" />
                    </Pressable>
                  </HStack>
                );
              })
            )}
          </VStack>

          {/* Add New Exit Rule Card */}
          <VStack className="p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-3">
            <Text className="text-xs font-black text-slate-800 uppercase tracking-wider">
              + Add Jump Rule
            </Text>

            <VStack className="gap-1">
              <Text className="text-[11px] font-bold text-slate-600">Question Name / Field ID</Text>
              <Input className="h-10 rounded-xl bg-white border border-slate-200">
                <InputField
                  value={targetField}
                  onChangeText={setTargetField}
                  placeholder="e.g. favorite_subject"
                  className="text-xs"
                />
              </Input>
            </VStack>

            <VStack className="gap-1">
              <Text className="text-[11px] font-bold text-slate-600">Expected Value</Text>
              <Input className="h-10 rounded-xl bg-white border border-slate-200">
                <InputField
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="e.g. Math or Yes"
                  className="text-xs"
                />
              </Input>
            </VStack>

            <VStack className="gap-1">
              <Text className="text-[11px] font-bold text-slate-600">Destination Step</Text>
              <HStack className="flex-wrap gap-2">
                {allPages
                  .filter((p) => p.id !== activePage.id)
                  .map((page) => {
                    const isSelected = targetPageId === page.id;
                    return (
                      <Pressable
                        key={page.id}
                        onPress={() => setTargetPageId(page.id)}
                        className={`px-3 py-1.5 rounded-xl border ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? 'text-white' : 'text-slate-700'
                          }`}
                        >
                          {page.title || page.id}
                        </Text>
                      </Pressable>
                    );
                  })}
              </HStack>
            </VStack>

            <Pressable
              onPress={handleAddRule}
              className="h-11 rounded-xl bg-purple-600 justify-center items-center mt-2"
            >
              <Text className="text-xs font-black text-white">+ Add Rule to Step</Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
