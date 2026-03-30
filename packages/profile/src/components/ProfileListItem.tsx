import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, Theme, useThemedColors, hapticLight } from '@repo/ui';
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

const ProfileListItem: React.FC<ProfileListItemProps> = ({
    icon: Icon,
    iconColor,
    label,
    onPress,
    accessibilityLabel,
    rightElement,
    showChevron = true
}) => {
    const colors = useThemedColors() as any;
    const { t } = useTranslation();

    const handlePress = () => {
        hapticLight();
        onPress();
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            style={{
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 52,
                justifyContent: 'center',
                ...Theme.shadows.none
            }}
        
            <HStack justifyContent="space-between" alignItems="center"
                <HStack space="md" alignItems="center"
                    <Box
                        sx={{
                            p: '$2',
                            bg: colors.isDark ? 'rgba(255,255,255,0.05)' : colors.secondary,
                            borderRadius: '$full'
                        }}
                    
                        <Icon size={18} color={iconColor || colors.action} /
                    </Box
                    <Text color={colors.text} size="sm" bold
                        {label}
                    </Text
                </HStack

                <HStack space="xs" alignItems="center"
                    {rightElement}
                    {showChevron && <ChevronRight size={16} color={colors.textTertiary} />}
                </HStack
            </HStack
        </TouchableOpacity
    );
};

export default ProfileListItem;
