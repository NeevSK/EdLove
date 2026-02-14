/**
 * GradeHeadView Component
 * 
 * Grade Overview for Grade Heads
 * Displays all classes in a specific grade
 */

import React from 'react';
import { Box, Text, Heading, VStack, Center } from "@/ui";
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

// Shared container styling for role-based views removed in favor of ScreenWrapper and useThemedColors

export default function GradeHeadView() {
    const { t } = useTranslation();
    const colors = useThemedColors();

    return (
        <ScreenWrapper>
            <VStack space="lg" sx={{ padding: Theme.spacing.lg, flex: 1, backgroundColor: colors.primary }}>
                <GlobalHeader title={t('role.grade_head') || 'Grade Overview'} />

                <Center sx={{ flex: 1, marginTop: Theme.spacing.xl }}>
                    <VStack space="md" alignItems="center">
                        <Text
                            size="lg"
                            color={colors.text}
                            textAlign="center"
                        >
                            {t('classroom.gradeHeadWelcome') || 'Welcome, Grade Head!'}
                        </Text>
                        <Text
                            size="md"
                            color={colors.textSecondary}
                            textAlign="center"
                        >
                            {t('classroom.gradeHeadDescription') || 'Manage all classes in your grade'}
                        </Text>
                    </VStack>
                </Center>
            </VStack>
        </ScreenWrapper>
    );
}
