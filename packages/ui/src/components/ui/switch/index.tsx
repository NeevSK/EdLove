import { CLASSIC_TOKENS } from '@repo/ui/theme/Theme';
import { Platform, Switch as RNSwitch, type SwitchProps } from 'react-native';

/**
 * Switch Component
 *
 * A high-impact, hardened binary toggle primitive.
 * Optimized for platform-native feel with design system color synchronization.
 */

export interface ISwitchProps extends SwitchProps {
  className?: string;
  isDisabled?: boolean;
}

export const Switch = ({
  value,
  onValueChange,
  isDisabled,
  className,
  trackColor: trackColorProp,
  ...props
}: ISwitchProps) => {
  const activeColor = CLASSIC_TOKENS.accent.action;
  const inactiveTrackColor = Platform.OS === 'ios' ? '#E9E9EA' : '#ccc';

  const defaultTrackColor = {
    false: inactiveTrackColor,
    true: activeColor,
  };

  const handleValueChange = isDisabled ? undefined : onValueChange;

  return (
    <RNSwitch
      {...props}
      value={value}
      onValueChange={handleValueChange}
      disabled={isDisabled}
      trackColor={trackColorProp || defaultTrackColor}
      thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : '#f4f3f4'}
      ios_backgroundColor={inactiveTrackColor}
      // Apply className via style bridge if needed, but NativeWind handles RNSwitch
      style={[{ transform: [{ scale: Platform.OS === 'ios' ? 0.8 : 1 }] }]}
    />
  );
};

Switch.displayName = 'Switch';

export { Switch as default };
