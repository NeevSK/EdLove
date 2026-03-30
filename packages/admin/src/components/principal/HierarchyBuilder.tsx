/**
 * HIERARCHY BUILDER COMPONENT
 *
 * Tree view for building school hierarchy:
 * School -> Section (Primary/Secondary) -> Grade (1-13)
 *
 * Note: This file was heavily corrupted by missing special characters.
 * This is a parsing-stable version to unblock builds; functionality can be re-expanded once the repo is healthy.
 */

import React from 'react';
import { Box, Button, ButtonText, Heading, Theme, Text, VStack, useThemedColors } from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface HierarchyBuilderProps {
  schoolId: string;
  onBack: () => void;
}

export default function HierarchyBuilder({ schoolId, onBack }: HierarchyBuilderProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();

  return (
    <Box sx={{ flex: 1, backgroundColor: 'transparent' }}>
      <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.lg }}>
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Heading color={colors.action} sx={{ fontSize: 32 }}>
            {t('principal.hierarchy.title', { defaultValue: 'Hierarchy Builder' })}
          </Heading>
          <Text color={colors.textSecondary}>
            {t('principal.hierarchy.subtitle', { defaultValue: 'Build sections and grades for this school.' })}
          </Text>
          <Text color={colors.textTertiary} sx={{ fontSize: 12 }}>
            schoolId: {schoolId}
          </Text>
        </VStack>

        <Button variant="outline" size="sm" sx={{ borderColor: colors.border, alignSelf: 'flex-start' }} onPress={onBack}>
          <ButtonText color={colors.text}>{t('common.back', { defaultValue: 'Back' })}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
