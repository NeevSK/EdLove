import { type ReactNode, useState, useRef } from 'react';
import { Pressable, View, Animated } from 'react-native';
import { color } from './motion';

export interface FocusRingProps {
  children: ReactNode;
  /** Ring color. Default brand orange. */
  ringColor?: string;
  /** Ring width in px. Default 2. */
  ringWidth?: number;
  /** Ring offset in px. Default 2. */
  ringOffset?: number;
  /** Whether to show focus ring. Default true. */
  enabled?: boolean;
  /** Called when the wrapped element is pressed. */
  onPress?: () => void;
}

/**
 * FocusRing (web) — keyboard focus indicator using :focus-visible.
 *
 * On web, uses onFocus/onBlur to track keyboard focus and renders an
 * absolutely-positioned outline ring. The ring only appears on keyboard
 * focus (not pointer click) via CSS :focus-visible class.
 *
 * Contract: wrap an interactive element (the ring only makes sense around
 * something focusable/pressable), hence the button role.
 *
 * Subtle scale animation (1.02x) on focus for better visual feedback.
 */
export function FocusRing({
  children,
  ringColor = color.brand.orange,
  ringWidth = 2,
  ringOffset = 2,
  enabled = true,
  onPress,
}: FocusRingProps) {
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      accessibilityRole="button"
      onFocus={() => {
        setFocused(true);
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 120,
          useNativeDriver: false,
        }).start();
      }}
      onBlur={() => {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }).start(() => setFocused(false));
      }}
      onPress={onPress}
      style={{ position: 'relative' }}
    >
      {focused && enabled && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              inset: -ringOffset,
              borderColor: ringColor,
              borderWidth: ringWidth,
              borderRadius: 8,
            },
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      )}
      {children}
    </Pressable>
  );
}
