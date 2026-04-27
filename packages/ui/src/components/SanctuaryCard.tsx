/**
 * SANCTUARY CARD - Reusable Card Component
 *
 * A versatile card component that follows sanctuary design principles:
 * - Organic corners (never sharp)
 * - Soft shadows when elevated
 * - Lift animation when pressable
 *
 * Philosophy: Simple, reusable foundation for UI cards
 */

import { type FC, useState } from 'react';
import { Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Box, Pressable, Text, VStack } from '../gluestack';

// ============================================================================
// TYPES
// ============================================================================

interface SanctuaryCardProps {
  title?: string;
  children: any;
  footer?: any;
  onPress?: () => void;
  onLongPress?: () => void;
  href?: string;
  target?: '_blank' | '_self';
  elevated?: boolean;
  style?: any;
  accessibilityLabel?: string;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LIFT_SCALE_NORMAL = 1.0;
const LIFT_SCALE_PRESSED = 1.02;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SanctuaryCard: FC<SanctuaryCardProps> = ({
  title,
  children,
  footer,
  onPress,
  onLongPress,
  href,
  target = '_self',
  elevated = false,
  style,
  accessibilityLabel,
  className,
}) => {
  // Hover state - only meaningful on web (desktop pointer devices)
  const [hovered, setHovered] = useState(false);

  // Shared value for lift animation
  const scale = useSharedValue(LIFT_SCALE_NORMAL);

  // ============================================================================
  // ANIMATION: LIFT EFFECT (when pressable)
  // ============================================================================

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress || href) {
      scale.value = withSpring(LIFT_SCALE_PRESSED, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const handlePressOut = () => {
    if (onPress || href) {
      scale.value = withSpring(LIFT_SCALE_NORMAL, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  // ============================================================================
  // RENDER: Container Level
  // ============================================================================

  const content = (
    <Animated.View
      style={[onPress || href ? animatedStyle : undefined, style]}
      className={`
                bg-phase-surface border border-white/5 rounded-3xl overflow-hidden
                ${elevated ? 'shadow-xl shadow-black/20' : ''}
                ${hovered && Platform.OS === 'web' ? 'opacity-90 scale-[1.01]' : ''}
                ${className || ''}
            `}
    >
      <VStack className="p-6">
        {/* Title Section */}
        {title && <Text className="text-xl font-bold text-phase-text-primary mb-4">{title}</Text>}

        {/* Children Content */}
        <Box className="gap-4">{children}</Box>

        {/* Footer Section */}
        {footer && (
          <VStack className="mt-4 gap-4">
            <Box className="h-px bg-white/5 opacity-30" />
            {footer}
          </VStack>
        )}
      </VStack>
    </Animated.View>
  );

  if (onPress || href) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
        onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
        accessibilityRole={href ? 'link' : 'button'}
        accessibilityLabel={accessibilityLabel}
        href={href}
        hrefAttrs={{
          target: target,
          rel: target === '_blank' ? 'noopener noreferrer' : undefined,
        }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

export default SanctuaryCard;
