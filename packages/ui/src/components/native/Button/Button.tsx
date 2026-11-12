import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentRef, Ref } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { ButtonContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useFocusRing } from '../../../theme/native/focus';
import { usePressMotion } from '../../../theme/native/motion';
import {
  edgeStyle,
  glowStyle,
  insetRadius,
  radiusStyle,
  systemTextAllowance,
  typeStyle,
} from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { type HapticImpact, hapticImpact } from '../../../utils/haptics';
import { slopFor, TOUCH_MIN } from '../touch';
import { ButtonPulse } from './ButtonPulse';

export interface ButtonProps extends ButtonContract, Omit<PressableProps, 'children' | 'style'> {
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
  haptic,
  disabled,
  onPressIn,
  onPressOut,
  style,
  ref,
  accessibilityHint,
  onFocus,
  onBlur,
  ...rest
}: ButtonProps) {
  // A hardware keyboard's focus shows as a ring in the world's focus colour.
  const focusRing = useFocusRing(onFocus, onBlur);
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const press = usePressMotion();
  const recipe = world.recipes.button;
  const v = recipe.variants[variant];
  const dims = recipe.sizes[size];
  const isText = v.form === 'text';
  const isDisabled = !!disabled || loading;
  const radius = isText ? 0 : recipe.radius;
  const gradient = v.fill && typeof v.fill !== 'string' ? v.fill : null;

  const container: ViewStyle = isText
    ? { minHeight: TOUCH_MIN, paddingVertical: 4, alignSelf: fullWidth ? 'stretch' : 'flex-start' }
    : {
        height: dims.height,
        paddingHorizontal: dims.paddingX,
        backgroundColor: typeof v.fill === 'string' ? v.fill : undefined,
        ...radiusStyle(radius),
        ...edgeStyle(v.edge),
        ...glowStyle(v.glow),
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
      };

  const labelStyle = typeStyle(recipe.label, language, world, dims.fontSize);

  return (
    // A disabled button takes no touches at all, wrapper included.
    <Animated.View
      pointerEvents={isDisabled ? 'none' : 'box-none'}
      style={[{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }, press.style]}
    >
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        hitSlop={isText ? { top: 4, bottom: 4, left: 8, right: 8 } : slopFor(dims.height)}
        onPressIn={(event: GestureResponderEvent) => {
          if (!isDisabled) {
            press.pressIn();
            // An explicit impact still wins; false turns haptics off for this button.
            if (haptic) hapticImpact(haptic);
            else if (haptic !== false) feedback('press');
          }
          onPressIn?.(event);
        }}
        onPressOut={(event: GestureResponderEvent) => {
          press.pressOut();
          onPressOut?.(event);
        }}
        onFocus={focusRing.onFocus}
        onBlur={focusRing.onBlur}
        style={({ pressed }) => [
          styles.base,
          container,
          focusRing.ring,
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
        {isText ? null : (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              radiusStyle(radius),
              { backgroundColor: press.light.color },
              press.light.style,
            ]}
          />
        )}
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
            <ButtonPulse size={dims.fontSize} color={v.ink} />
          ) : Icon ? (
            <Icon size={Math.round(dims.fontSize * 1.2)} color={v.ink} />
          ) : null}
          <RNText
            numberOfLines={1}
            maxFontSizeMultiplier={systemTextAllowance()}
            style={[labelStyle, { color: v.ink }]}
          >
            {label}
          </RNText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  frame: { position: 'absolute' },
  content: { flexDirection: 'row', alignItems: 'center' },
});
