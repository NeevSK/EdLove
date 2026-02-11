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

// Shared container styling for role-based views
const ROLE_VIEW_CONTAINER_STYLE = {
    flex: 1,
    backgroundColor: Theme.colors.voidIndigo,
    padding: Theme.spacing.lg,
};

export default function GradeHeadView() {
    const { t } = useTranslation();

    return (
        <Box sx={ROLE_VIEW_CONTAINER_STYLE}>
            <VStack space="lg">
                <GlobalHeader title={t('classroom.gradeOverview') || 'Grade Overview'} />

                <Center sx={{ flex: 1, marginTop: Theme.spacing.xl }}>
                    <VStack space="md" alignItems="center">
                        <Text
                            size="lg"
                            color={Theme.colors.sacredWhite}
                            textAlign="center"
                        >
                            {t('classroom.gradeHeadWelcome') || 'Welcome, Grade Head!'}
                        </Text>
                        <Text
                            size="md"
                            color={Theme.colors.pearlGray}
                            textAlign="center"
                        >
                            {t('classroom.gradeHeadDescription') || 'Manage all classes in your grade'}
                        </Text>
                    </VStack>
                </Center>
            </VStack>
        </Box>
    );
}
