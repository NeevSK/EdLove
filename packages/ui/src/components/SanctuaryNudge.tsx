import { BlurView } from 'expo-blur';
import type React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemedColors } from '@/hooks/useThemedColors';
import { Text, View } from '@/primitives';
import { Theme } from '@/theme/Theme';
import { SanctuaryButton } from '@/components/SanctuaryButton';

interface SanctuaryNudgeProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: string | React.ComponentType<any>;
}

export const SanctuaryNudge: React.FC<SanctuaryNudgeProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = '✨',
}) => {
  const _colors = useThemedColors();

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Text style={styles.icon}>{icon}</Text>;
    }
    const IconComponent = icon as React.ComponentType<any>;
    return <IconComponent size={24} color={Theme.colors.sanctuarySaffron} />;
  };

  return (
    <Animated.View entering={FadeInUp.delay(300)} style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>{renderIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <SanctuaryButton onPress={onAction} variant="solid" size="sm">
            {actionLabel}
          </SanctuaryButton>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: Theme.spacing.lg,
    borderRadius: Theme.corners.generous,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  blur: {
    padding: Theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 191, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 191, 0, 0.2)',
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Theme.colors.sacredWhite,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.starlightGray,
    lineHeight: 20,
    opacity: 0.9,
  },
});
