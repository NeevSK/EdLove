import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { CheckboxContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { radiusStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import { Text } from '../Text/Text';

export interface CheckboxProps extends CheckboxContract {
  style?: StyleProp<ViewStyle>;
}

/** The mark inside a checked box (a tick), or a bar when partly checked. */
export function ToggleMark({
  mixed,
  size,
  color,
}: {
  mixed: boolean;
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" pointerEvents="none">
      <Path
        d={mixed ? 'M6 11 H16' : 'M6 11.5 L9.5 15 L16 7.5'}
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** One yes/no choice with its words beside it. The whole row is the target. */
export function Checkbox({ checked, onChange, label, hint, disabled, style }: CheckboxProps) {
  const r = useWorld().recipes.toggle;
  const feedback = useFeedback();
  const on = checked !== false;
  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={hint}
      disabled={disabled}
      onPress={() => {
        feedback('select');
        onChange(checked !== true);
      }}
      style={({ pressed }) => [styles.row, { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}
    >
      <View
        style={[
          {
            width: r.size,
            height: r.size,
            borderWidth: r.edge.width,
            borderColor: on ? r.on.fill : r.edge.color,
          },
          radiusStyle(r.radius),
          on ? { backgroundColor: r.on.fill } : null,
        ]}
      >
        {on ? (
          <ToggleMark
            mixed={checked === 'mixed'}
            size={r.size - r.edge.width * 2}
            color={r.on.mark}
          />
        ) : null}
      </View>
      <View style={styles.words}>
        <Text kind="body">{label}</Text>
        {hint ? (
          <Text kind="caption" tone="soft">
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 44,
    paddingVertical: 10,
  },
  words: { flex: 1, gap: 2, paddingTop: 1 },
});
