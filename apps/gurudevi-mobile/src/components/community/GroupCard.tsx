import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Box, HStack, VStack, Text } from '@/ui';
import { Users, Lock, Globe } from 'lucide-react-native';
import SanctuaryCard from '../shared/SanctuaryCard';
import { Theme } from '../../constants/Theme';

interface GroupCardProps {
    id: string;
    name: string;
    memberCount: number;
    type: 'class' | 'interest' | 'staff' | 'public';
    description?: string;
    onPress: () => void;
}

const GroupCard = React.memo(function GroupCard({
    id,
    name,
    memberCount,
    type,
    description,
    onPress
}: GroupCardProps) {

    const getIcon = () => {
        switch (type) {
            case 'staff': return <Lock size={16} color={Theme.colors.emberRed} />;
            case 'public': return <Globe size={16} color={Theme.colors.sageGreen} />;
            default: return <Users size={16} color={Theme.colors.sanctuarySaffron} />;
        }
    };

    return (
        <SanctuaryCard onPress={onPress}>
            <HStack space="md" alignItems="center">
                {/* Icon Box */}
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: Theme.colors.deepIndigo,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text size="xl" bold color={Theme.colors.sanctuarySaffron}>
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </Box>

                <VStack flex={1}>
                    <HStack space="sm" alignItems="center">
                        <Text color={Theme.colors.sacredWhite} bold size="lg">{name}</Text>
                        {getIcon()}
                    </HStack>

                    {description && (
                        <Text color={Theme.colors.mistGray} size="sm" numberOfLines={1}>
                            {description}
                        </Text>
                    )}

                    <Text color={Theme.colors.dimGray} size="xs" mt="$1">
                        {memberCount} members • {type.charAt(0).toUpperCase() + type.slice(1)} Group
                    </Text>
                </VStack>
            </HStack>
        </SanctuaryCard>
    );
});

export default GroupCard;
