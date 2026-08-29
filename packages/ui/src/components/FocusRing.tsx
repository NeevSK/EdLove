import { type ReactNode } from 'react';
import { K } from 'react-native-external-keyboard';
import { color } from './motion';

export interface FocusRingProps {
  children: ReactNode;
  /** Ring color. Default brand orange. */
  ringColor?: string;
  /** Ring width in px. Default 2. */
  ringWidth?: number;
  /** Whether to show focus ring. Default true. */
  enabled?: boolean;
  /** Called when the wrapped element is pressed. */
  onPress?: () => void;
}

/**
 * FocusRing — keyboard focus indicator.
 *
 * Native (iOS + Android): Uses react-native-external-keyboard's K.Pressable
 * to leverage iOS UIFocusHaloEffect and Android defaultFocusHighlightEnabled.
 * Web: Uses CSS :focus-visible via FocusRing.web.tsx.
 *
 * Focus traps are avoided by not setting custom orderId or direction locking.
 */
export function FocusRing({
  children,
  ringColor = color.brand.orange,
  ringWidth = 2,
  enabled = true,
  onPress,
}: FocusRingProps) {
  return (
    <K.Pressable
      style={({ focused }) => ({
        borderColor: focused && enabled ? ringColor : 'transparent',
        borderWidth: focused && enabled ? ringWidth : 0,
        borderRadius: 8,
      })}
      onPress={onPress}
    >
      {children}
    </K.Pressable>
  );
}
