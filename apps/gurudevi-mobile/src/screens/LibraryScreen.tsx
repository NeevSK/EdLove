import React from 'react';
import { Box, Text, Center } from "@gluestack-ui/themed";
import GlobalHeader from '../components/shared/GlobalHeader';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';

export default function LibraryScreen() {
    const { t } = useTranslation();
    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={t('tabs.library') || 'Library'}
                subtitle="Knowledge Sanctuary"
            />
            <Center sx={{ flex: 1 }}>
                <Text color={Theme.colors.mistGray}>
                    Explore our vast collection of knowledge.
                </Text>
            </Center>
        </Box>
    );
}
