import type { CommercialPerspective, MediumOfInstruction } from '@repo/core/types/Perspective';
import { Briefcase, Check, Sparkles, X } from '@repo/ui/icons';
import { Box, HStack, Modal, ModalContent, Pressable, ScrollView, Text, TextInput, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface CommercialBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBatch: (batch: CommercialPerspective) => void;
}

export function CommercialBatchModal({
  isOpen,
  onClose,
  onCreateBatch,
}: CommercialBatchModalProps) {
  const { t } = useTranslation();
  const [instituteName, setInstituteName] = useState('Apex Institute - Nugegoda');
  const [subjectName, setSubjectName] = useState('Physics');
  const [grade, setGrade] = useState('2026 A/L');
  const [medium, setMedium] = useState<MediumOfInstruction>('sinhala');
  const [batchName, setBatchName] = useState('Sunday Morning Theory (7:30 AM)');
  const [customAlias, setCustomAlias] = useState('');
  const [role, setRole] = useState<'lead_tutor' | 'assistant_tutor'>('lead_tutor');

  const handleSubmit = () => {
    if (!instituteName || !subjectName || !grade || !batchName) return;
    hapticSuccess();

    const batchId = `batch_${Date.now().toString(36)}`;
    const newBatch: CommercialPerspective = {
      id: batchId,
      kind: 'commercial',
      displayName: customAlias.trim() || `${instituteName} · ${subjectName} ${grade}`,
      instituteId: `inst_${instituteName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      instituteName: instituteName.trim(),
      subjectId: `sub_${subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      subjectName: subjectName.trim(),
      grade: grade.trim(),
      medium,
      batchId,
      batchName: batchName.trim(),
      role,
      customAlias: customAlias.trim() || null,
      displayTitle: customAlias.trim() || `${instituteName} · ${subjectName} ${grade} (${medium.toUpperCase()})`,
    };

    onCreateBatch(newBatch);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        style={{
          backgroundColor: tokens.colors.background,
          borderColor: tokens.semantic.border.base,
          borderWidth: 1,
          maxWidth: 520,
          maxHeight: '90%',
          width: '100%',
          borderRadius: tokens.radii.lg,
          alignSelf: 'center',
          padding: tokens.spacing.lg,
          shadowColor: tokens.colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.md }}>
          <HStack style={{ alignItems: 'center', gap: 8 }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: tokens.radii.md,
                backgroundColor: 'rgba(79, 125, 163, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={18} color={tokens.colors.info} />
            </Box>
            <VStack>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: '800',
                  color: tokens.semantic.text.primary,
                }}
              >
                {t('commercial.createTitle', 'Add Tuition Batch')}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                }}
              >
                {t('commercial.createSubtitle', 'Register an independent or institute tuition class.')}
              </Text>
            </VStack>
          </HStack>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: tokens.colors.surfaceInteractive,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color={tokens.colors.ink} />
          </Pressable>
        </HStack>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
          <VStack style={{ gap: tokens.spacing.md, paddingBottom: tokens.spacing.md }}>
            <VStack style={{ gap: 4 }}>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                Institute / Hall Name
              </Text>
              <TextInput
                value={instituteName}
                onChangeText={setInstituteName}
                placeholder="e.g. Apex Institute - Nugegoda or Private Home Studio"
                placeholderTextColor={tokens.semantic.text.muted}
                style={{
                  borderWidth: 1,
                  borderColor: tokens.semantic.border.base,
                  borderRadius: tokens.radii.md,
                  backgroundColor: tokens.colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: tokens.typography.sizes.sm,
                  color: tokens.semantic.text.primary,
                }}
              />
            </VStack>

            <HStack style={{ gap: tokens.spacing.md }}>
              <VStack style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                  Subject
                </Text>
                <TextInput
                  value={subjectName}
                  onChangeText={setSubjectName}
                  placeholder="e.g. Physics"
                  placeholderTextColor={tokens.semantic.text.muted}
                  style={{
                    borderWidth: 1,
                    borderColor: tokens.semantic.border.base,
                    borderRadius: tokens.radii.md,
                    backgroundColor: tokens.colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    fontSize: tokens.typography.sizes.sm,
                    color: tokens.semantic.text.primary,
                  }}
                />
              </VStack>

              <VStack style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                  Target Grade / Exam
                </Text>
                <TextInput
                  value={grade}
                  onChangeText={setGrade}
                  placeholder="e.g. 2026 A/L"
                  placeholderTextColor={tokens.semantic.text.muted}
                  style={{
                    borderWidth: 1,
                    borderColor: tokens.semantic.border.base,
                    borderRadius: tokens.radii.md,
                    backgroundColor: tokens.colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    fontSize: tokens.typography.sizes.sm,
                    color: tokens.semantic.text.primary,
                  }}
                />
              </VStack>
            </HStack>

            <VStack style={{ gap: 4 }}>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                Medium of Instruction
              </Text>
              <HStack style={{ gap: tokens.spacing.sm }}>
                {(['sinhala', 'english', 'tamil'] as MediumOfInstruction[]).map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMedium(m)}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: tokens.radii.full,
                      borderWidth: 1,
                      borderColor: medium === m ? tokens.colors.info : tokens.semantic.border.base,
                      backgroundColor: medium === m ? 'rgba(79, 125, 163, 0.15)' : tokens.colors.surface,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.sizes.xs,
                        fontWeight: '700',
                        color: medium === m ? tokens.colors.info : tokens.semantic.text.secondary,
                        textTransform: 'capitalize',
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            <VStack style={{ gap: 4 }}>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                Batch Slot & Schedule
              </Text>
              <TextInput
                value={batchName}
                onChangeText={setBatchName}
                placeholder="e.g. Sunday Morning Theory (7:30 AM - 12:30 PM)"
                placeholderTextColor={tokens.semantic.text.muted}
                style={{
                  borderWidth: 1,
                  borderColor: tokens.semantic.border.base,
                  borderRadius: tokens.radii.md,
                  backgroundColor: tokens.colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: tokens.typography.sizes.sm,
                  color: tokens.semantic.text.primary,
                }}
              />
            </VStack>

            <VStack style={{ gap: 4 }}>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                Personal Custom Alias (Optional)
              </Text>
              <TextInput
                value={customAlias}
                onChangeText={setCustomAlias}
                placeholder="e.g. My Main Sunday Theory 🚀"
                placeholderTextColor={tokens.semantic.text.muted}
                style={{
                  borderWidth: 1,
                  borderColor: tokens.semantic.border.base,
                  borderRadius: tokens.radii.md,
                  backgroundColor: tokens.colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: tokens.typography.sizes.sm,
                  color: tokens.semantic.text.primary,
                }}
              />
            </VStack>
          </VStack>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create tuition batch"
          onPress={handleSubmit}
          style={{
            backgroundColor: tokens.colors.primary,
            paddingVertical: 12,
            borderRadius: tokens.radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <HStack style={{ alignItems: 'center', gap: 6 }}>
            <Check size={16} color="#FFFFFF" />
            <Text style={{ fontSize: tokens.typography.sizes.sm, fontWeight: '700', color: '#FFFFFF' }}>
              Create Commercial Perspective
            </Text>
          </HStack>
        </Pressable>
      </ModalContent>
    </Modal>
  );
}

export default CommercialBatchModal;
