import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  type Insets,
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
import { slopFor } from '../touch';

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

/** Edge widths a chip keeps in every state, so selecting never shifts layout. */
function chipEdges(r: ChipRecipe) {
  const edge = Math.max(r.rest.edge?.width ?? 0, r.selected.edge?.width ?? 0);
  const line = Math.max(r.rest.underline?.width ?? 0, r.selected.underline?.width ?? 0);
  return { edge, line };
}

/** A chip's frame (padding, corners, glow) when its paint is a `ChipPaint` layer. */
/**
 * Touch area around a chip so the finger gets the platform minimum: the drawn
 * height is padding plus one line of label (about 20), never less than the old 6.
 */
function chipSlop(r: ChipRecipe, underline: boolean): Insets {
  const drawn = (r.paddingY + chipEdges(r).edge) * 2 + 20;
  const v = Math.max(underline ? 10 : 6, slopFor(drawn)?.top ?? 0);
  return underline ? { top: v, bottom: v, left: 6, right: 6 } : { top: v, bottom: v };
}

export function chipFrame(r: ChipRecipe, s: ChipStateRecipe): ViewStyle {
  const { edge, line } = chipEdges(r);
  return {
    // The paint layer draws edges outside the flow; padding keeps their room.
    paddingVertical: r.paddingY + (edge || line),
    paddingHorizontal: r.paddingX + edge,
    ...radiusStyle(r.radius),
    ...glowStyle(s.glow),
  };
}

/**
 * Living light for chips and tabs: fill and edges glide between rest and
 * selected. A state without an edge holds the other state's colour at zero,
 * so the blend fades rather than passing through grey.
 */
export function ChipPaint({ recipe: r, selected }: { recipe: ChipRecipe; selected: boolean }) {
  const ink = useWorldContext().world.tokens.ink;
  const s = selected ? r.selected : r.rest;
  const other = selected ? r.rest : r.selected;
  const { edge, line } = chipEdges(r);
  const clear = (colour: string | null | undefined) => alpha(colour ?? ink, 0);
  const paint = useLivingStyle({
    backgroundColor: s.fill ?? clear(other.fill),
    ...(edge > 0 ? { borderColor: s.edge?.color ?? clear(other.edge?.color) } : null),
    ...(line > 0 && edge === 0
      ? { borderBottomColor: s.underline?.color ?? clear(other.underline?.color) }
      : null),
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        radiusStyle(r.radius),
        edge > 0 ? { borderWidth: edge } : line > 0 ? { borderBottomWidth: line } : null,
        paint,
      ]}
    />
  );
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
  const underline = r.form === 'underline';

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
      hitSlop={chipSlop(r, underline)}
      onPress={(e) => {
        feedback(kind === 'button' ? 'press' : 'select');
        onPress?.(e);
      }}
      style={({ pressed }) => [
        chipFrame(r, s),
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
      {...rest}
    >
      <ChipPaint recipe={r} selected={selected} />
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
