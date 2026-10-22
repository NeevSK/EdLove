import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';
import { hapticImpact } from '../../utils/haptics';
import { useWorld } from './WorldContext';

export interface SwitchProps
  extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'onValueChange'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** The setting's name. Required: a switch on its own says nothing. */
  label: string;
}

/** An on/off setting. Lit with the world's lamp when on, a quiet line when off. */
export function Switch({ value, onValueChange, label, disabled, ...rest }: SwitchProps) {
  const t = useWorld().tokens;
  return (
    <RNSwitch
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        hapticImpact('light');
        onValueChange(next);
      }}
      trackColor={{ false: t.line, true: t.lamp }}
      thumbColor={t.raised}
      ios_backgroundColor={t.line}
      {...rest}
    />
  );
}
