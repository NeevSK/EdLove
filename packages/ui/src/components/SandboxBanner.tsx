import React from 'react';
import { Box, HStack, Text, Theme, useThemedColors } from '@repo/ui';
import { useStore } from '@repo/core';
import { useTranslation } from 'react-i18next';

const SandboxBanner: React.FC = () => {
    const { isDemoMode } = useStore();
    const colors = useThemedColors();
    const { t } = useTranslation();

    if (!isDemoMode) return null;

    return (
        <Box
            sx={{
                backgroundColor: colors.warning,
                paddingVertical: Theme.spacing.xs,
                paddingHorizontal: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
            }}
        >
            <HStack alignItems="center" justifyContent="center" sx={{ gap: Theme.spacing.sm }}>
                <Text color="white" sx={{ fontSize: 12, fontWeight: 'bold' }}>
                    {t('classroom.demo.sandbox_active')}
                </Text>
            </HStack>
        </Box>
    );
};

export default SandboxBanner;
