import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  Pressable,
  type PressableProps,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { alpha } from '../../../theme/color';
import type { ChipContract, ChipsContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle } from '../../../theme/native/motion';
import { edgeStyle, glowStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { ChipRecipe, ChipStateRecipe } from '../../../theme/types';

export interface ChipProps extends ChipContract, Omit<PressableProps, 'children' | 'style'> {
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/** A chip's shape and paint in one state: shared with Tabs, which wear the same look. */
export function chipStyle(r: ChipRecipe, s: ChipStateRecipe): ViewStyle {
  return {
    paddingVertical: r.paddingY,
    paddingHorizontal: r.paddingX,
    backgroundColor: s.fill ?? undefined,
    ...radiusStyle(r.radius),
    ...edgeStyle(s.edge),
    ...glowStyle(s.glow),
    ...(s.underline
      ? { borderBottomWidth: s.underline.width, borderBottomColor: s.underline.color }
      : null),
  };
}

export function Chip({
  label,
  selected = false,
  kind = 'button',
  lang,
  disabled,
  onPress,
  style,
  ref,
  ...rest
}: ChipProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.chip;
  const feedback = useFeedback();
  const s = selected ? r.selected : r.rest;
  const other = selected ? r.rest : r.selected;
  const underline = r.form === 'underline';
  // Living light: fill and edges glide between rest and selected. A state
  // without an edge holds the other state's colour at zero, so the blend
  // fades rather than passing through grey.
  const edgeWidth = Math.max(s.edge?.width ?? 0, other.edge?.width ?? 0);
  const lineWidth = Math.max(s.underline?.width ?? 0, other.underline?.width ?? 0);
  const clear = (colour: string | undefined) => alpha(colour ?? world.tokens.ink, 0);
  const paint = useLivingStyle({
    backgroundColor: s.fill ?? clear(other.fill ?? undefined),
    ...(edgeWidth > 0 ? { borderColor: s.edge?.color ?? clear(other.edge?.color) } : null),
    ...(lineWidth > 0 && edgeWidth === 0
      ? { borderBottomColor: s.underline?.color ?? clear(other.underline?.color) }
      : null),
  });

  return (
    <Pressable
      ref={ref}
      accessibilityRole={kind}
      accessibilityLabel={label}
      accessibilityState={
        kind === 'button'
          ? { selected, disabled: !!disabled }
          : { checked: selected, disabled: !!disabled }
      }
      disabled={disabled}
      hitSlop={underline ? { top: 10, bottom: 10, left: 6, right: 6 } : { top: 6, bottom: 6 }}
      onPress={(e) => {
        feedback(kind === 'button' ? 'press' : 'select');
        onPress?.(e);
      }}
      style={({ pressed }) => [
        {
          // The paint layer draws edges outside the flow; padding keeps their room.
          paddingVertical: r.paddingY + (edgeWidth || lineWidth),
          paddingHorizontal: r.paddingX + edgeWidth,
          ...radiusStyle(r.radius),
          ...glowStyle(s.glow),
        },
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
      {...rest}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          radiusStyle(r.radius),
          edgeWidth > 0
            ? { borderWidth: edgeWidth }
            : lineWidth > 0
              ? { borderBottomWidth: lineWidth }
              : null,
          paint,
        ]}
      />
      <RNText style={[typeStyle(r.label, lang ?? language, world), { color: s.ink }]}>
        {label}
      </RNText>
    </Pressable>
  );
}

export interface ChipsProps extends ChipsContract {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Lays chips out with the world's spacing. */
export function Chips({ children, label, single = false, style }: ChipsProps) {
  const gap = useWorldContext().world.recipes.chip.gap;
  return (
    <View
      accessibilityRole={single ? 'radiogroup' : undefined}
      accessibilityLabel={label}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', columnGap: gap, rowGap: 10 }, style]}
    >
      {children}
    </View>
  );
}
