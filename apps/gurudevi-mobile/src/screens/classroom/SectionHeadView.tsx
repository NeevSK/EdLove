/**
 * SectionHeadView Component
 * 
 * Section Overview for Section Heads
 * Displays Primary/Junior/Senior section
 */

import React from 'react';
import { Box, Text, Heading, VStack, Center } from "@/ui";
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import RoleInitialState from '../../components/classroom/RoleInitialState';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

// Shared container styling for role-based views removed in favor of ScreenWrapper and useThemedColors

export default function SectionHeadView() {
    const { t } = useTranslation();
    const colors = useThemedColors();

    return (
        <ScreenWrapper>
            <VStack space="lg" sx={{ padding: Theme.spacing.lg, flex: 1, backgroundColor: colors.primary }}>
                <GlobalHeader title={t('role.section_head') || 'Section Overview'} />

                <RoleInitialState
                    role="section_head"
                    onCreatePress={() => {
                        console.log('Section Head creating first report/view');
                    }}
                    onSamplePress={(item) => {
                        console.log('Section Head Sample pressed:', item.title);
                    }}
                />
            </VStack>
        </ScreenWrapper>
    );
}
