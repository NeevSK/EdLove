import { type ComponentRef, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { KitIconProps, SplitButtonContract } from '../../../theme/contracts';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Menu } from '../Menu/Menu';

export interface SplitButtonProps extends SplitButtonContract {
  onPress: () => void;
  testID?: string;
}

function Caret({ size = 20, color }: KitIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" pointerEvents="none">
      <Path
        d="M5 7.5 L10 12.5 L15 7.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * The main action, and beside it a small arrow for its close relatives. Two
 * separate stops for a screen reader: the action itself, then "More ways to
 * send", which opens the menu. Both reach the touch minimum on their own.
 */
export function SplitButton({
  label,
  onPress,
  more,
  moreLabel,
  variant = 'primary',
  size = 'md',
  disabled,
  testID,
}: SplitButtonProps) {
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.row} testID={testID}>
      <Button label={label} variant={variant} size={size} disabled={disabled} onPress={onPress} />
      <View ref={anchor} collapsable={false}>
        <IconButton
          icon={Caret}
          label={moreLabel}
          variant={variant}
          size={size}
          disabled={disabled || more.length === 0}
          accessibilityState={{ expanded: open, disabled: !!disabled || more.length === 0 }}
          onPress={() => setOpen(true)}
        />
      </View>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        label={moreLabel}
        items={more}
        anchorRef={anchor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
});
