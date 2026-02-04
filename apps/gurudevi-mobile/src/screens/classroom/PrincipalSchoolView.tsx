/**
 * PrincipalSchoolView Component
 * 
 * School Overview for Principals
 * Displays entire school hierarchy with sections
 */

import React from 'react';
import { Box, Text, Heading, VStack, Center } from "@gluestack-ui/themed";
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';

// Shared container styling for role-based views
const ROLE_VIEW_CONTAINER_STYLE = {
    flex: 1,
    backgroundColor: Theme.colors.voidIndigo,
    padding: Theme.spacing.lg,
};

export default function PrincipalSchoolView() {
    const { t } = useTranslation();
    
    return (
        <Box sx={ROLE_VIEW_CONTAINER_STYLE}>
            <VStack space="lg">
                <Heading 
                    size="2xl" 
                    color={Theme.colors.sanctuarySaffron}
                >
                    {t('classroom.schoolOverview') || 'School Overview'}
                </Heading>
                
                <Center sx={{ flex: 1, marginTop: Theme.spacing.xl }}>
                    <VStack space="md" alignItems="center">
                        <Text 
                            size="lg" 
                            color={Theme.colors.sacredWhite}
                            textAlign="center"
                        >
                            {t('classroom.principalWelcome') || 'Welcome, Principal!'}
                        </Text>
                        <Text 
                            size="md" 
                            color={Theme.colors.pearlGray}
                            textAlign="center"
                        >
                            {t('classroom.principalDescription') || 'View and manage all sections of your school'}
                        </Text>
                    </VStack>
                </Center>
            </VStack>
        </Box>
    );
}
