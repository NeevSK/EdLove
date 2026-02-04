/**
 * SectionHeadView Component
 * 
 * Section Overview for Section Heads
 * Displays Primary/Junior/Senior section
 */

import React from 'react';
import { Box, Text, Heading, VStack, Center } from "@gluestack-ui/themed";
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';

export default function SectionHeadView() {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ 
            flex: 1, 
            backgroundColor: Theme.colors.voidIndigo, 
            padding: Theme.spacing.lg 
        }}>
            <VStack space="lg">
                <Heading 
                    size="2xl" 
                    color={Theme.colors.sanctuarySaffron}
                >
                    {t('classroom.sectionOverview') || 'Section Overview'}
                </Heading>
                
                <Center sx={{ flex: 1, marginTop: Theme.spacing.xl }}>
                    <VStack space="md" alignItems="center">
                        <Text 
                            size="lg" 
                            color={Theme.colors.sacredWhite}
                            textAlign="center"
                        >
                            {t('classroom.sectionHeadWelcome') || 'Welcome, Section Head!'}
                        </Text>
                        <Text 
                            size="md" 
                            color={Theme.colors.pearlGray}
                            textAlign="center"
                        >
                            {t('classroom.sectionHeadDescription') || 'Manage your section (Primary/Junior/Senior)'}
                        </Text>
                    </VStack>
                </Center>
            </VStack>
        </Box>
    );
}
