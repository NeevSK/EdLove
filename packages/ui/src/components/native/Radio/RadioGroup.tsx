import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { RadioGroupContract } from '../../../theme/contracts';
import { useWorld } from '../../../theme/native/WorldContext';
import { hapticImpact } from '../../../utils/haptics';
import { Text } from '../Text/Text';

export interface RadioGroupProps<V extends string = string> extends RadioGroupContract<V> {
  style?: StyleProp<ViewStyle>;
}

/** One choice from a short list, all visible at once. */
export function RadioGroup<V extends string = string>({
  value,
  onChange,
  label,
  options,
  style,
}: RadioGroupProps<V>) {
  const r = useWorld().recipes.toggle;
  return (
    <View role="radiogroup" aria-label={label} style={[styles.group, style]}>
      <Text kind="label" tone="soft">
        {label}
      </Text>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="radio"
            aria-checked={selected}
            aria-disabled={option.disabled}
            accessibilityLabel={option.label}
            accessibilityHint={option.hint}
            disabled={option.disabled}
            onPress={() => {
              if (selected) return;
              hapticImpact('light');
              onChange(option.value);
            }}
            style={({ pressed }) => [styles.row, { opacity: option.disabled ? 0.5 : pressed ? 0.85 : 1 }]}
          >
            <View
              style={[
                styles.ring,
                {
                  width: r.size,
                  height: r.size,
                  borderRadius: r.size / 2,
                  borderWidth: r.edge.width,
                  borderColor: selected ? r.on.fill : r.edge.color,
                },
              ]}
            >
              {selected ? (
                <View
                  style={{ width: r.size / 2, height: r.size / 2, borderRadius: r.size / 4, backgroundColor: r.on.fill }}
                />
              ) : null}
            </View>
            <View style={styles.words}>
              <Text kind="body">{option.label}</Text>
              {option.hint ? (
                <Text kind="caption" tone="soft">
                  {option.hint}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 44, paddingVertical: 10 },
  ring: { alignItems: 'center', justifyContent: 'center' },
  words: { flex: 1, gap: 2, paddingTop: 1 },
});
