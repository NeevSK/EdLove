import React from 'react';
import { View } from 'react-native';
import { Box, HStack, VStack, Text, SanctuaryCard, Theme } from '@repo/ui';
import { Users, Lock, Globe } from 'lucide-react-native';

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
            case 'staff': return <Lock size={14} color="#FF6F61" />; // Theme.colors.emberRed
            case 'public': return <Globe size={14} color="#8BBF7A" />; // Theme.colors.sageGreen
            default: return <Users size={14} color="#F6BF8C" />; // Theme.colors.sanctuarySaffron
        }
    };

    return (
        <SanctuaryCard
            onPress={onPress}
            className="mb-2 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
        >
            <HStack space="md" className="items-center">
                {/* Avatar with Modern Gradient/Placeholder */}
                <Box
                    className="w-14 h-14 rounded-full justify-center items-center border-2 border-white/10"
                    style={{ backgroundColor: type === 'public' ? 'rgba(108, 92, 231, 0.15)' : 'rgba(247, 183, 49, 0.15)' }}
                >
                    <Text
                        className={`text-[22px] font-bold ${type === 'public' ? 'text-gurudeviViolet' : 'text-sanctuarySaffron'}`}
                        style={{ textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}
                    >
                        {(name || 'G').charAt(0).toUpperCase()}
                    </Text>
                </Box>

                <VStack className="flex-1">
                    <HStack className="justify-between items-center">
                        <Text
                            className="text-sacredWhite font-semibold text-[17px] flex-1 mr-2"
                            numberOfLines={1}
                        >
                            {name}
                        </Text>
                        <HStack space="xs" className="items-center">
                            {getIcon()}
                        </HStack>
                    </HStack>

                    {description ? (
                        <Text
                            className="text-mistGray text-[13px] mt-0.5 leading-[18px]"
                            numberOfLines={1}
                        >
                            {description}
                        </Text>
                    ) : (
                        <Text
                            className="text-willow text-[13px] mt-0.5 italic"
                        >
                            No description available
                        </Text>
                    )}

                    <HStack space="sm" className="items-center mt-1.5">
                        <HStack space="xs" className="items-center">
                            <Users size={12} color="#968E80" />
                            <Text className="text-mistGray text-xs">
                                {memberCount} members
                            </Text>
                        </HStack>
                        <Text className="text-white/15 text-xs">•</Text>
                        <Text className="text-mistGray text-[11px] uppercase tracking-wider">
                            {type}
                        </Text>
                    </HStack>
                </VStack>
            </HStack>
        </SanctuaryCard>
    );
});

export default GroupCard;
