import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  Pressable,
  type PressableProps,
  Text as RNText,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { hapticImpact } from '../../utils/haptics';
import { edgeStyle, glowStyle, radiusStyle, typeStyle } from './style';
import { useWorldContext } from './WorldContext';

export interface ChipProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
  /**
   * `radio` inside a single-choice group, `checkbox` for multi-select,
   * `button` (default) for a toggle that stands alone.
   */
  kind?: 'button' | 'radio' | 'checkbox';
  /** Language of the label, when it differs from the app (e.g. a language picker). */
  lang?: 'en' | 'si' | 'ta';
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
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
      hitSlop={underline ? { top: 10, bottom: 10, left: 6, right: 6 } : { top: 6, bottom: 6 }}
      onPress={(e) => {
        hapticImpact('light');
        onPress?.(e);
      }}
      style={({ pressed }) => [
        {
          paddingVertical: r.paddingY,
          paddingHorizontal: r.paddingX,
          backgroundColor: s.fill ?? undefined,
          ...radiusStyle(r.radius),
          ...edgeStyle(s.edge),
          ...glowStyle(s.glow),
          ...(s.underline
            ? { borderBottomWidth: s.underline.width, borderBottomColor: s.underline.color }
            : null),
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <RNText style={[typeStyle(r.label, lang ?? language, world), { color: s.ink }]}>
        {label}
      </RNText>
    </Pressable>
  );
}

export interface ChipsProps {
  children: ReactNode;
  /** Accessible name of the group, e.g. "Language". */
  label?: string;
  /** Single choice groups are announced as radio groups. */
  single?: boolean;
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
