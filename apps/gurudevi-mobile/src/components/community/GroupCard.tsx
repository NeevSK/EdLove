import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Box, HStack, VStack, Text } from '@repo/ui';
import { Users, Lock, Globe } from 'lucide-react-native';
import { SanctuaryCard } from '@repo/ui';
import { Theme } from '@repo/ui';

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
                {/* Icon Box: Glass Protocol Refinement */}
                <Box
                    sx={{
                        width: 52,
                        height: 52,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                    }}
                >
                    <Text size="xl" bold color={type === 'public' ? Theme.colors.gurudeviViolet : Theme.colors.sanctuarySaffron}>
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </Box>

                <VStack flex={1}>
                    <HStack space="sm" alignItems="center">
                        <Text color={Theme.colors.sacredWhite} bold size="lg">{name}</Text>
                        {getIcon()}
                    </HStack>

                    {description && (
                        <Text color={Theme.colors.mistGray} size="sm" numberOfLines={2}>
                            {description}
                        </Text>
                    )}

                    <HStack space="xs" alignItems="center" mt="$1">
                        <Users size={12} color={Theme.colors.dimGray} />
                        <Text color={Theme.colors.dimGray} size="xs">
                            {memberCount} • {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </HStack>
                </VStack>
            </HStack>
        </SanctuaryCard>
    );
});

export default GroupCard;
