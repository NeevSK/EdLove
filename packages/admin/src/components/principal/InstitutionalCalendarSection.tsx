/**
 * InstitutionalCalendarSection
 *
 * This module was impacted by bulk "missing special characters" corruption.
 * Current goal: keep the workspace parsing/building while recovery continues.
 */

import React from 'react';
import { Box, Text, Theme, VStack, useThemedColors } from '@repo/ui';

interface InstitutionalCalendarSectionProps {
  schoolId: string;
  principalId: string;
  onAddEvent?: () => void;
}

export default function InstitutionalCalendarSection({
  schoolId,
  principalId,
}: InstitutionalCalendarSectionProps) {
  const colors = useThemedColors();

  return (
    <Box
      sx={{
        padding: Theme.spacing.lg,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.secondary,
      }}
    >
      <VStack sx={{ gap: Theme.spacing.xs }}>
        <Text sx={{ fontWeight: '700' }} color={colors.text}>
          Calendar
        </Text>
        <Text sx={{ fontSize: 12 }} color={colors.textSecondary}>
          schoolId: {schoolId} · principalId: {principalId}
        </Text>
      </VStack>
    </Box>
  );
}
