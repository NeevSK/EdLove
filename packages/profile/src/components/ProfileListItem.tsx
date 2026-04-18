import React from 'react';
import { Box, HStack, VStack, Text, Pressable, hapticLight } from '@repo/ui';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ProfileListItemProps {
    icon: LucideIcon;
    iconColor?: string;
    label: string;
    onPress: () => void;
    accessibilityLabel?: string;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
}

/**
 * PROFILE LIST ITEM
 * Sanctuary V3 standard for settings and navigation items within profiles.
 */
const ProfileListItem: React.FC<ProfileListItemProps> = ({
    icon: Icon,
    iconColor,
    label,
    onPress,
    accessibilityLabel,
    rightElement,
    showChevron = true
}) => {
    const { t } = useTranslation();

    const handlePress = () => {
        hapticLight();
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            className="bg-phase-canvas/50 rounded-2xl p-4 border border-phase-surface min-h-[52px] justify-center"
        >
            <HStack className="justify-between items-center">
                <HStack space="md" className="items-center">
                    <Box className="p-2 bg-phase-interactive/10 rounded-full">
                        <Icon size={18} color={iconColor || '#4A90E2'} />
                    </Box>
                    <Text className="text-phase-text-primary text-sm font-bold">
                        {label}
                    </Text>
                </HStack>

                <HStack space="xs" className="items-center">
                    {rightElement}
                    {showChevron && <ChevronRight size={16} color="#9DA1A3" />}
                </HStack>
            </HStack>
        </Pressable>
    );
};

export default ProfileListItem;
