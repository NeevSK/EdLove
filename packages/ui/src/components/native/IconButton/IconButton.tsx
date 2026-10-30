import { Pressable, type PressableProps, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import type { IconButtonContract } from '../../../theme/contracts';
import { edgeStyle, radiusStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import { type HapticImpact, hapticImpact } from '../../../utils/haptics';
import { Tooltip } from '../Tooltip/Tooltip';

export interface IconButtonProps extends IconButtonContract, Omit<PressableProps, 'children' | 'style'> {
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
  haptic = 'light',
  disabled,
  onPressIn,
  style,
  ...rest
}: IconButtonProps) {
  const recipe = useWorld().recipes.button;
  const v = recipe.variants[variant];
  const side = Math.max(44, recipe.sizes[size].height);
  const bare = v.form === 'text';
  const fill = typeof v.fill === 'string' ? v.fill : v.fill ? v.fill.from : undefined;

  return (
    <Tooltip label={label}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={(event) => {
          if (haptic !== false && !disabled) hapticImpact(haptic);
          onPressIn?.(event);
        }}
        style={({ pressed }) => [
          styles.base,
          { width: side, height: side },
          bare ? { borderRadius: side / 2 } : [{ backgroundColor: fill }, radiusStyle(recipe.radius), edgeStyle(v.edge)],
          pressed && !disabled ? { opacity: recipe.pressedOpacity } : null,
          disabled ? { opacity: recipe.disabledOpacity } : null,
          style,
        ]}
        {...rest}
      >
        <Icon size={Math.round(recipe.sizes[size].fontSize * 1.45)} color={v.ink} />
      </Pressable>
    </Tooltip>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
