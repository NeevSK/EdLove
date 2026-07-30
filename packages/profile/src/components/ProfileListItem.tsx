import { ChevronRight, type LucideIcon } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import type React from 'react';
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
  showChevron = true,
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
      className="bg-phase-canvas border border-phase-surface rounded-3xl p-5 mb-2 active:scale-[0.98] transition-all shadow-sm"
    >
      <HStack className="justify-between items-center">
        <HStack space="md" className="items-center">
          <Box className="w-10 h-10 bg-phase-interactive/10 rounded-2xl items-center justify-center border border-phase-interactive/10">
            <Icon size={18} color={iconColor || '#4A90E2'} strokeWidth={2.5} />
          </Box>
          <Text className="text-phase-text-primary text-base font-bold tracking-tight">
            {label}
          </Text>
        </HStack>

        <HStack space="sm" className="items-center">
          {rightElement}
          {showChevron && (
            <Box className="p-1 rounded-full bg-phase-surface/30">
              <ChevronRight size={16} color="#9DA1A3" strokeWidth={3} />
            </Box>
          )}
        </HStack>
      </HStack>
    </Pressable>
  );
};

export default ProfileListItem;
