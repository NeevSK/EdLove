import { Pressable, Text as RNText, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { SegmentedContract } from '../../../theme/contracts';
import { insetRadius, radiusStyle, shadowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { hapticImpact } from '../../../utils/haptics';

export interface SegmentedControlProps<V extends string = string> extends SegmentedContract<V> {
  style?: StyleProp<ViewStyle>;
}

const PAD = 3;

/**
 * Two to four short choices that switch a view in place ("Day", "Week").
 * The track is the world's inset well; the chosen segment is lifted in its
 * raised surface.
 */
export function SegmentedControl<V extends string = string>({
  value,
  onChange,
  label,
  options,
  style,
}: SegmentedControlProps<V>) {
  const { world, language } = useWorldContext();
  const inset = world.recipes.surface.inset;
  const raised = world.recipes.surface.raised;
  const labelStyle = typeStyle(world.recipes.chip.label, language, world);

  return (
    <View
      role="radiogroup"
      aria-label={label}
      style={[styles.track, { backgroundColor: inset.fill ?? undefined }, radiusStyle(inset.radius), style]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="radio"
            aria-checked={selected}
            aria-disabled={option.disabled}
            accessibilityLabel={option.label}
            disabled={option.disabled}
            onPress={() => {
              if (selected) return;
              hapticImpact('light');
              onChange(option.value);
            }}
            style={({ pressed }) => [
              styles.segment,
              radiusStyle(insetRadius(inset.radius, PAD)),
              selected ? [{ backgroundColor: raised.fill ?? undefined }, shadowStyle(raised.shadow)] : null,
              { opacity: option.disabled ? 0.4 : pressed ? 0.8 : 1 },
            ]}
          >
            <RNText
              numberOfLines={1}
              style={[labelStyle, { color: selected ? world.tokens.ink : world.tokens.inkSoft }]}
            >
              {option.label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: PAD, gap: PAD },
  segment: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
});
