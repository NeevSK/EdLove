import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentRef, ComponentType, Ref } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  Text as RNText,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { BrandPulse } from '../../components/BrandPulse';
import { type HapticImpact, hapticImpact } from '../../utils/haptics';
import type { ButtonSize, ButtonVariant } from '../types';
import { edgeStyle, glowStyle, insetRadius, radiusStyle, typeStyle } from './style';
import { useWorldContext } from './WorldContext';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** The words on the button. Also its accessible name. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading icon, drawn in the button's ink colour. */
  icon?: ComponentType<{ size?: number; color?: string }>;
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: HapticImpact | false;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/**
 * The generic action. Variants say how much weight the action carries; the
 * world decides what that weight looks like (a lit lamp, a framed red panel,
 * a brass plate, or an underlined word).
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  haptic = 'light',
  disabled,
  onPressIn,
  style,
  ref,
  accessibilityHint,
  ...rest
}: ButtonProps) {
  const { world, language } = useWorldContext();
  const recipe = world.recipes.button;
  const v = recipe.variants[variant];
  const dims = recipe.sizes[size];
  const isText = v.form === 'text';
  const isDisabled = !!disabled || loading;
  const radius = isText ? 0 : recipe.radius;
  const gradient = v.fill && typeof v.fill !== 'string' ? v.fill : null;

  const container: ViewStyle = isText
    ? { minHeight: 44, paddingVertical: 4, alignSelf: fullWidth ? 'stretch' : 'flex-start' }
    : {
        height: dims.height,
        paddingHorizontal: dims.paddingX,
        backgroundColor: typeof v.fill === 'string' ? v.fill : undefined,
        ...radiusStyle(radius),
        ...edgeStyle(v.edge),
        ...glowStyle(v.glow),
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
      };

  const labelStyle = typeStyle(recipe.label, language, dims.fontSize);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={isText ? { top: 4, bottom: 4, left: 8, right: 8 } : undefined}
      onPressIn={(event: GestureResponderEvent) => {
        if (haptic !== false && !isDisabled) hapticImpact(haptic);
        onPressIn?.(event);
      }}
      style={({ pressed }) => [
        styles.base,
        container,
        pressed && !isDisabled ? { opacity: recipe.pressedOpacity } : null,
        isDisabled && !loading ? { opacity: recipe.disabledOpacity } : null,
        style,
      ]}
      {...rest}
    >
      {gradient ? (
        <LinearGradient
          pointerEvents="none"
          colors={[gradient.from, gradient.to]}
          style={[StyleSheet.absoluteFill, radiusStyle(radius)]}
        />
      ) : null}
      {v.innerEdge ? (
        <View
          pointerEvents="none"
          style={[
            styles.frame,
            {
              top: v.innerEdge.inset ?? 0,
              left: v.innerEdge.inset ?? 0,
              right: v.innerEdge.inset ?? 0,
              bottom: v.innerEdge.inset ?? 0,
              borderWidth: v.innerEdge.width,
              borderColor: v.innerEdge.color,
            },
            radiusStyle(insetRadius(radius, v.innerEdge.inset ?? 0)),
          ]}
        />
      ) : null}
      <View
        style={[
          styles.content,
          { gap: recipe.gap },
          isText && v.underline
            ? {
                borderBottomWidth: Math.max(1, v.underline.width),
                borderBottomColor: v.underline.color,
                paddingBottom: 2,
              }
            : null,
        ]}
      >
        {loading ? (
          <BrandPulse size={Math.round(dims.fontSize * 1.3)} tintColor={v.ink} />
        ) : Icon ? (
          <Icon size={Math.round(dims.fontSize * 1.2)} color={v.ink} />
        ) : null}
        <RNText numberOfLines={1} style={[labelStyle, { color: v.ink }]}>
          {label}
        </RNText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  frame: { position: 'absolute' },
  content: { flexDirection: 'row', alignItems: 'center' },
});
