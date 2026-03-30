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
            case 'staff': return <Lock size={14} color={Theme.colors.emberRed} />;
            case 'public': return <Globe size={14} color={Theme.colors.sageGreen} />;
            default: return <Users size={14} color={Theme.colors.sanctuarySaffron} />;
        }
    };

    return (
        <SanctuaryCard 
            onPress={onPress}
            style={{
                marginBottom: 8,
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
        
            <HStack space="md" alignItems="center"
                {/* Avatar with Modern Gradient/Placeholder */}
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: type === 'public' ? 'rgba(108, 92, 231, 0.15)' : 'rgba(247, 183, 49, 0.15)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                
                    <Text 
                        sx={{ 
                            fontSize: 22, 
                            fontWeight: '700',
                            color: type === 'public' ? Theme.colors.gurudeviViolet : Theme.colors.sanctuarySaffron,
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    
                        {(name || 'G').charAt(0).toUpperCase()}
                    </Text
                </Box

                <VStack flex={1}
                    <HStack justifyContent="space-between" alignItems="center"
                        <Text 
                            sx={{ 
                                color: Theme.colors.sacredWhite, 
                                fontWeight: '600', 
                                fontSize: 17 
                            }} 
                            numberOfLines={1}
                        
                            {name}
                        </Text
                        <HStack space="xs" alignItems="center"
                            {getIcon()}
                        </HStack
                    </HStack

                    {description ? (
                        <Text 
                            sx={{ 
                                color: Theme.colors.mistGray, 
                                fontSize: 13, 
                                marginTop: 2,
                                lineHeight: 18
                            }} 
                            numberOfLines={1}
                        
                            {description}
                        </Text
                    ) : (
                        <Text 
                            sx={{ 
                                color: Theme.colors.dimGray, 
                                fontSize: 13, 
                                marginTop: 2,
                                fontStyle: 'italic'
                            }}
                        
                            No description available
                        </Text
                    )}

                    <HStack space="sm" alignItems="center" mt={6}
                        <HStack space="xs" alignItems="center"
                            <Users size={12} color={Theme.colors.dimGray} /
                            <Text sx={{ color: Theme.colors.dimGray, fontSize: 12 }}
                                {memberCount} members
                            </Text
                        </HStack
                        <Text sx={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>"</Text
                        <Text sx={{ color: Theme.colors.dimGray, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}
                            {type}
                        </Text
                    </HStack
                </VStack
            </HStack
        </SanctuaryCard
    );
});

export default GroupCard;
