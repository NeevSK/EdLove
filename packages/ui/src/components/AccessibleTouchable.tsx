import { Box } from '@repo/ui/primitives';
import type React from 'react';
import {
  AccessibilityRole,
  AccessibilityState,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

/**
 * AccessibleTouchable
 *
 * A wrapper around Pressable that enforces accessibility best practices:
 * - Minimum 44×44 touch target (iOS HIG / Android Material)
 * - Proper `accessibilityRole` and `accessibilityState`
 * - `importantForAccessibility` on Android
 * - `accessibilityElementsHidden` / `accessibilityViewIsModal` support
 * - `hitSlop` for easier tapping
 * - `accessibilityActions` for custom actions
 */

export interface AccessibleTouchableProps
  extends Omit<
    React.ComponentProps<typeof Pressable>,
    | 'onPress'
    | 'onLongPress'
    | 'style'
    | 'children'
    | 'accessibilityRole'
    | 'accessibilityState'
    | 'accessibilityActions'
    | 'accessibilityLabel'
    | 'accessibilityHint'
    | 'hitSlop'
    | 'android_importantForAccessibility'
  > {
  /** Minimum touch target size (default: 44) */
  minTouchTarget?: number;
  /** Hit slop for easier tapping (default: 12) */
  hitSlopSize?: number;
  /** Accessibility role (default: 'button') */
  accessibilityRole?: AccessibilityRole;
  /** Accessibility label (required for screen readers) */
  accessibilityLabel?: string;
  /** Accessibility hint for additional context */
  accessibilityHint?: string;
  /** Whether the element is disabled */
  disabled?: boolean;
  /** Whether the element is selected */
  selected?: boolean;
  /** Whether the element is busy/loading */
  busy?: boolean;
  /** Custom accessibility actions */
  accessibilityActions?: Array<{ name: string; label: string }>;
  /** Android: importantForAccessibility */
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  /** onPress handler */
  onPress?: (event: GestureResponderEvent) => void;
  /** onLongPress handler */
  onLongPress?: (event: GestureResponderEvent) => void;
  /** Style for the pressable */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children: React.ReactNode;
  /** Test ID for E2E testing */
  testID?: string;
}

const DEFAULT_MIN_TOUCH_TARGET = 44;
const DEFAULT_HIT_SLOP = 12;

export function AccessibleTouchable({
  minTouchTarget = DEFAULT_MIN_TOUCH_TARGET,
  hitSlopSize = DEFAULT_HIT_SLOP,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  selected = false,
  busy = false,
  accessibilityActions,
  importantForAccessibility = 'yes',
  onPress,
  onLongPress,
  style,
  children,
  testID,
  ...props
}: AccessibleTouchableProps) {
  const hitSlop = {
    top: hitSlopSize,
    bottom: hitSlopSize,
    left: hitSlopSize,
    right: hitSlopSize,
  };

  const accessibilityState: AccessibilityState = {
    disabled,
    selected,
    busy,
  };

  const androidImportantForAccessibility =
    Platform.OS === 'android' ? importantForAccessibility : undefined;

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || busy) return;
    onPress?.(event);
  };

  const handleLongPress = (event: GestureResponderEvent) => {
    if (disabled || busy) return;
    onLongPress?.(event);
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        {
          minHeight: minTouchTarget,
          minWidth: minTouchTarget,
          // Ensure touch target meets minimum
          ...(Platform.OS === 'web' ? { minHeight: minTouchTarget, minWidth: minTouchTarget } : {}),
        },
        style,
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.5 },
      ]}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      accessibilityActions={accessibilityActions}
      importantForAccessibility={androidImportantForAccessibility}
      disabled={disabled}
      testID={testID}
      {...props}
    >
      {({ pressed }) => (
        <Box
          className="flex-1 items-center justify-center"
          style={[
            { minHeight: minTouchTarget, minWidth: minTouchTarget },
            pressed && { opacity: 0.8 },
          ]}
        >
          {children}
        </Box>
      )}
    </Pressable>
  );
}

/**
 * AccessibleIconButton
 *
 * Convenience wrapper for icon-only buttons with proper accessibility.
 */
import { LucideIcon } from '@repo/ui/icons';

export interface AccessibleIconButtonProps
  extends Omit<AccessibleTouchableProps, 'children' | 'accessibilityLabel'> {
  icon: LucideIcon;
  size?: number;
  accessibilityLabel: string; // Required for icon buttons
  color?: string;
}

export function AccessibleIconButton({
  icon: Icon,
  size = 24,
  accessibilityLabel,
  color,
  ...props
}: AccessibleIconButtonProps) {
  return (
    <AccessibleTouchable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      minTouchTarget={48} // Larger target for icon buttons
      {...props}
    >
      <Icon size={size} color={color} strokeWidth={2} />
    </AccessibleTouchable>
  );
}

/**
 * AccessibleTextLink
 *
 * For text-based links/buttons that need proper accessibility.
 */
export interface AccessibleTextLinkProps extends Omit<AccessibleTouchableProps, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export function AccessibleTextLink({
  children,
  variant = 'primary',
  ...props
}: AccessibleTextLinkProps) {
  return (
    <AccessibleTouchable accessibilityRole="link" minTouchTarget={44} {...props}>
      {children}
    </AccessibleTouchable>
  );
}
