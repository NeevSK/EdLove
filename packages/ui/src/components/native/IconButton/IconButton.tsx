import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { IconButtonContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion } from '../../../theme/native/motion';
import { edgeStyle, radiusStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import { type HapticImpact, hapticImpact } from '../../../utils/haptics';
import { Tooltip } from '../Tooltip/Tooltip';
import { useFocusRing } from '../../../theme/native/focus';

export interface IconButtonProps
  extends IconButtonContract,
    Omit<PressableProps, 'children' | 'style'> {
  haptic?: HapticImpact | false;
  style?: StyleProp<ViewStyle>;
}

/**
 * An action shown only as an icon (close, more, share). It has the same
 * variants as Button, as a square; quiet ones are bare icons. The label is its
 * accessible name, and a long press shows it, because an icon alone is a guess.
 */
export function IconButton({
  icon: Icon,
  label,
  variant = 'quiet',
  size = 'md',
  haptic,
  disabled,
  onPressIn,
  onPressOut,
  style,
  onFocus,
  onBlur,
  ...rest
}: IconButtonProps) {
  const recipe = useWorld().recipes.button;
  const focusRing = useFocusRing(onFocus, onBlur);
  const feedback = useFeedback();
  const press = usePressMotion();
  const v = recipe.variants[variant];
  const side = Math.max(44, recipe.sizes[size].height);
  const bare = v.form === 'text';
  const fill = typeof v.fill === 'string' ? v.fill : v.fill ? v.fill.from : undefined;

  return (
    <Animated.View pointerEvents={disabled ? 'none' : 'box-none'} style={press.style}>
      <Tooltip label={label}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !!disabled }}
          disabled={disabled}
          onPressIn={(event) => {
            if (!disabled) {
              press.pressIn();
              if (haptic) hapticImpact(haptic);
              else if (haptic !== false) feedback('press');
            }
            onPressIn?.(event);
          }}
          onPressOut={(event) => {
            press.pressOut();
            onPressOut?.(event);
          }}
          style={({ pressed }) => [
            styles.base,
            { width: side, height: side },
            bare
              ? { borderRadius: side / 2 }
              : [{ backgroundColor: fill }, radiusStyle(recipe.radius), edgeStyle(v.edge)],
            pressed && !disabled ? { opacity: recipe.pressedOpacity } : null,
            disabled ? { opacity: recipe.disabledOpacity } : null,
            focusRing.ring,
            style,
          ]}
          onFocus={focusRing.onFocus}
          onBlur={focusRing.onBlur}
          {...rest}
        >
          <Icon size={Math.round(recipe.sizes[size].fontSize * 1.45)} color={v.ink} />
        </Pressable>
      </Tooltip>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
