import React from 'react';
import { VStack, HStack, Text, Box, useTheme, Icon } from '@repo/ui';
import { Building2, MapPin } from 'lucide-react-native';
import { type School } from '@repo/core';

interface SchoolOverviewProps {
    school: School;
}

export default function SchoolOverview({ school }: SchoolOverviewProps) {
    const theme = useTheme();
    
    if (!school) return null;

    return (
        <VStack className="gap-md p-4">
            <HStack className="gap-md items-center">
                <Box className="p-2 rounded-md bg-phase-interactive/10">
                    <Icon as={Building2} size={24} color={theme.accent.action} />
                </Box>
                <VStack>
                    <Text className="font-bold text-lg text-phase-text-primary">{school.name}</Text>
                    <HStack className="gap-xs items-center">
                        <Icon as={MapPin} size={12} color={theme.text.secondary} />
                        <Text className="text-xs text-phase-text-secondary">{school.address || 'No address provided'}</Text>
                    </HStack>
                </VStack>
            </HStack>
        </VStack>
    );
}

