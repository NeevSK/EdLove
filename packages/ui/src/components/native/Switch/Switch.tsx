import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';
import type { SwitchContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorld } from '../../../theme/native/WorldContext';

export interface SwitchProps
  extends SwitchContract,
    Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'value' | 'onValueChange'> {}

/** An on/off setting. Lit with the world's lamp when on, a quiet line when off. */
export function Switch({ value, onValueChange, label, disabled, ...rest }: SwitchProps) {
  const world = useWorld();
  const t = world.tokens;
  const feedback = useFeedback();
  return (
    <RNSwitch
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        feedback('select');
        onValueChange(next);
      }}
      trackColor={{ false: t.line, true: world.recipes.toggle.track.on }}
      thumbColor={t.raised}
      ios_backgroundColor={t.line}
      {...rest}
    />
  );
}
