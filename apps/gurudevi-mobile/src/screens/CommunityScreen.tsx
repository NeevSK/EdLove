
import React from 'react';
import { Box, Text, Center } from "@gluestack-ui/themed";
import GlobalHeader from '../components/shared/GlobalHeader';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';

export default function CommunityScreen() {
    const { t } = useTranslation();
    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={t('tabs.community') || 'Community'}
                subtitle="Connect & Grow"
            />
            <Center sx={{ flex: 1 }}>
                <Text color={Theme.colors.mistGray}>
                    Community features coming soon...
                </Text>
            </Center>
        </Box>
    );
}
