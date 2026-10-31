import { Text as RNText, StyleSheet, View } from 'react-native';
import type { NumberStepperContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { BASICS_ENGLISH, clampStep } from '../../shared/basics';
import { IconButton } from '../IconButton/IconButton';

export type NumberStepperProps = NumberStepperContract;

function Minus({ size = 20, color }: { size?: number; color?: string }) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>−</RNText>;
}
function Plus({ size = 20, color }: { size?: number; color?: string }) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>+</RNText>;
}

/**
 * A number set by steps in the world's inset well. For screen readers the
 * number is one adjustable control (swipe up or down); at a bound the step
 * that would pass it is off.
 */
export function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  hint,
  disabled,
  labels,
}: NumberStepperProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...BASICS_ENGLISH, ...labels };
  const text = world.recipes.text;
  const inset = world.recipes.surface.inset;
  const set = (by: number) => {
    const next = clampStep(value + by, min, max, step);
    if (next === value || disabled) return;
    feedback('step');
    onChange(next);
  };
  const low = min !== undefined && value <= min;
  const high = max !== undefined && value >= max;
  const shown = unit ? `${value} ${unit}` : String(value);
  return (
    <View style={styles.wrap}>
      <RNText style={typeStyle(world.recipes.field.label, language, world)}>{label}</RNText>
      <View
        style={[
          styles.well,
          { backgroundColor: inset.fill ?? undefined },
          radiusStyle(inset.radius),
        ]}
      >
        <IconButton
          icon={Minus}
          label={`${l.decrease}, ${label}`}
          disabled={disabled || low}
          onPress={() => set(-step)}
        />
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityHint={hint}
          accessibilityValue={{ min, max, now: value, text: shown }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={({ nativeEvent }) =>
            set(nativeEvent.actionName === 'increment' ? step : -step)
          }
          style={styles.value}
        >
          <RNText
            style={[typeStyle(text.title, language, world), { fontVariant: ['tabular-nums'] }]}
          >
            {value}
          </RNText>
          {unit ? <RNText style={typeStyle(text.caption, language, world)}>{unit}</RNText> : null}
        </View>
        <IconButton
          icon={Plus}
          label={`${l.increase}, ${label}`}
          disabled={disabled || high}
          onPress={() => set(step)}
        />
      </View>
      {hint ? (
        <RNText style={typeStyle(world.recipes.field.hint, language, world)}>{hint}</RNText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  well: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', padding: 3 },
  value: { minWidth: 64, alignItems: 'center', paddingHorizontal: 8 },
});
