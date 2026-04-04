import React from 'react';
import { VStack, HStack, Text, Box, useThemedColors } from '@repo/ui';
import { Building2, MapPin } from 'lucide-react-native';
import { type School } from '@repo/core';

interface SchoolOverviewProps {
    school: School;
}

export default function SchoolOverview({ school }: SchoolOverviewProps) {
    const colors = useThemedColors();
    
    if (!school) return null;

    return (
        <VStack space="md" p="$4">
            <HStack space="md" alignItems="center">
                <Box sx={{ p: '$2', borderRadius: '$md', backgroundColor: 'var(--sanctuary-blue-soft)' }}>
                    <Building2 size={24} color="var(--sanctuary-blue)" />
                </Box>
                <VStack>
                    <Text bold size="lg" color={colors.text}>{school.name}</Text>
                    <HStack space="xs" alignItems="center">
                        <MapPin size={12} color={colors.textSecondary} />
                        <Text size="xs" color={colors.textSecondary}>{school.address || 'No address provided'}</Text>
                    </HStack>
                </VStack>
            </HStack>
        </VStack>
    );
}
