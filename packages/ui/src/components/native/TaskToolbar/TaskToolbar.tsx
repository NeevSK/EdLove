import { type ComponentRef, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { KitIconProps, TaskToolbarContract } from '../../../theme/contracts';
import { actionsThatFit, TOOLBAR_GAP } from '../../../theme/taskToolbar';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { useContainerWidth } from '../Layout/useContainerWidth';
import { Menu } from '../Menu/Menu';
import { TOUCH_MIN } from '../touch';

export interface TaskToolbarProps extends TaskToolbarContract {
  testID?: string;
}

function Dots({ size = 20, color }: KitIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" pointerEvents="none">
      <Circle cx={4} cy={10} r={1.8} fill={color} />
      <Circle cx={10} cy={10} r={1.8} fill={color} />
      <Circle cx={16} cy={10} r={1.8} fill={color} />
    </Svg>
  );
}

/**
 * The actions for what the person is doing now. As many as fit are shown, in
 * the order given (most used first); the rest wait behind "More". Narrow
 * screens show icons alone for actions that have one, each still spoken by
 * name and named again on a long press.
 */
export function TaskToolbar({ label, actions, moreLabel = 'More', testID }: TaskToolbarProps) {
  const { width, onLayout } = useContainerWidth();
  const { fontScale } = useWindowDimensions();
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const [open, setOpen] = useState(false);
  const { shown, iconsOnly } = actionsThatFit(actions, width, { touchMin: TOUCH_MIN, fontScale });
  const visible = actions.slice(0, shown);
  const folded = actions.slice(shown);

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="toolbar"
      accessibilityLabel={label}
      style={styles.row}
      testID={testID}
    >
      {visible.map((a) =>
        a.icon && iconsOnly ? (
          <IconButton
            key={a.key}
            icon={a.icon}
            label={a.label}
            variant="quiet"
            disabled={a.disabled}
            onPress={a.onPress}
          />
        ) : (
          <Button
            key={a.key}
            label={a.label}
            icon={a.icon}
            variant={a.destructive ? 'danger' : 'quiet'}
            size="sm"
            disabled={a.disabled}
            onPress={a.onPress}
          />
        ),
      )}
      {folded.length > 0 ? (
        <View ref={anchor} collapsable={false} style={styles.more}>
          <IconButton icon={Dots} label={moreLabel} variant="quiet" onPress={() => setOpen(true)} />
          <Menu
            open={open}
            onClose={() => setOpen(false)}
            label={moreLabel}
            anchorRef={anchor}
            items={folded.map((a) => ({
              key: a.key,
              label: a.label,
              onSelect: a.onPress,
              disabled: a.disabled,
              destructive: a.destructive,
            }))}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: TOOLBAR_GAP },
  more: { marginLeft: 'auto' },
});
