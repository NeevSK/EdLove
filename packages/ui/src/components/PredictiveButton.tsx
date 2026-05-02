import React, { useRef } from 'react';
import { Pressable, Text, HStack, Icon } from '../primitives';
import { hapticLight } from '../utils/haptics';

interface PredictiveButtonProps {
  onPress: () => void;
  onHoverStart?: () => void; // The "Predictive" trigger
  label: string;
  icon?: any;
  className?: string;
  toneColor?: string;
}

/**
 * PredictiveButton
 * 
 * Implements "Hover-to-Hydrate" (H2H) patterns.
 * In 2026, we don't wait for the click; we fetch data when the user shows intent (hover).
 */
export const PredictiveButton: React.FC<PredictiveButtonProps> = ({
  onPress,
  onHoverStart,
  label,
  icon,
  className = "",
  toneColor
}) => {
  const hasTriggered = useRef(false);

  const handleMouseEnter = () => {
    if (!hasTriggered.current && onHoverStart) {
      onHoverStart();
      hasTriggered.current = true; // Only trigger once per session/mount
    }
  };

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      {...({ onMouseEnter: handleMouseEnter } as any)}
      onTouchStart={handleMouseEnter} // Mobile (Intent starts on touch down)
      className={`px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition-all ${className}`}
      style={toneColor ? { backgroundColor: toneColor } : {}}
    >
      <HStack className="items-center gap-2">
        {icon && <Icon as={icon} size="sm" />}
        <Text className="text-xs font-black uppercase tracking-wider">
          {label}
        </Text>
      </HStack>
    </Pressable>
  );
};
