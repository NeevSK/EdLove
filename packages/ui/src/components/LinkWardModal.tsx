import type { GuardianBondPerspective } from '@repo/core/types/Perspective';
import { Check, Users, X } from '@repo/ui/icons';
import { Box, HStack, Modal, ModalContent, Pressable, Text, TextInput, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface LinkWardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkWard: (wardPerspective: GuardianBondPerspective) => void;
}

export function LinkWardModal({
  isOpen,
  onClose,
  onLinkWard,
}: LinkWardModalProps) {
  const { t } = useTranslation();
  const [studentId, setStudentId] = useState('');
  const [childName, setChildName] = useState('');
  const [parentPin, setParentPin] = useState('');

  const handleSubmit = () => {
    if (!studentId || !childName) return;
    hapticSuccess();

    const bondId = `gbond_${Date.now().toString(36)}`;
    const newWard: GuardianBondPerspective = {
      id: bondId,
      kind: 'guardian',
      displayName: `Parent of ${childName.trim()}`,
      wardUserId: `usr_${studentId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      wardName: childName.trim(),
    };

    onLinkWard(newWard);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        style={{
          backgroundColor: tokens.colors.background,
          borderColor: tokens.semantic.border.base,
          borderWidth: 1,
          maxWidth: 480,
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
                backgroundColor: 'rgba(123, 97, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#7B61FF" />
            </Box>
            <VStack>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: '800',
                  color: tokens.semantic.text.primary,
                }}
              >
                {t('guardian.linkTitle', 'Link Student Ward')}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                }}
              >
                {t('guardian.linkSubtitle', 'Connect your child to view attendance & school updates.')}
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

        <VStack style={{ gap: tokens.spacing.md }}>
          <VStack style={{ gap: 4 }}>
            <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
              Child / Student Full Name
            </Text>
            <TextInput
              value={childName}
              onChangeText={setChildName}
              placeholder="e.g. Maya Sandeepa"
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
              Student Registration ID / Index Number
            </Text>
            <TextInput
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. STU-2026-9482"
              placeholderTextColor={tokens.semantic.text.muted}
              autoCapitalize="characters"
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
              Parent Verification PIN (Provided by School)
            </Text>
            <TextInput
              value={parentPin}
              onChangeText={setParentPin}
              placeholder="e.g. 4-digit PIN"
              placeholderTextColor={tokens.semantic.text.muted}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirm linking"
            onPress={handleSubmit}
            disabled={!studentId || !childName}
            style={{
              backgroundColor: studentId && childName ? '#7B61FF' : tokens.colors.surfaceSubtle,
              paddingVertical: 12,
              borderRadius: tokens.radii.md,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: studentId && childName ? 1 : 0.5,
              marginTop: 4,
            }}
          >
            <HStack style={{ alignItems: 'center', gap: 6 }}>
              <Check size={16} color={studentId && childName ? '#FFFFFF' : tokens.semantic.text.muted} />
              <Text style={{ fontSize: tokens.typography.sizes.sm, fontWeight: '700', color: studentId && childName ? '#FFFFFF' : tokens.semantic.text.muted }}>
                Link Student Ward
              </Text>
            </HStack>
          </Pressable>
        </VStack>
      </ModalContent>
    </Modal>
  );
}

export default LinkWardModal;
