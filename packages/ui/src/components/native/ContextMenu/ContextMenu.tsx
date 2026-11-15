import { type ComponentRef, type ReactNode, useRef, useState } from 'react';
import {
  type AccessibilityActionEvent,
  Pressable,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import type { ContextMenuContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { Menu } from '../Menu/Menu';

export interface ContextMenuProps extends ContextMenuContract {
  /** What the thing does on a plain tap, if anything (open it). */
  onPress?: () => void;
  /** The thing's own name, read before its actions ("Grade 7 Maths"). */
  accessibilityLabel?: string;
  /** Content only: the thing is one stop, so nothing inside should take a tap. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  width?: number;
  testID?: string;
}

const OPEN = 'longpress';

/**
 * A thing that keeps its actions behind a long press. A screen reader gets the
 * same actions as the item's own (the actions rotor on iOS, the actions menu
 * on Android), and "Show actions" opens the menu itself, so the long press is
 * never the only way in. Haptics mark the moment the menu appears.
 */
export function ContextMenu({
  label,
  items,
  disabled,
  onPress,
  accessibilityLabel,
  children,
  style,
  width,
  testID,
}: ContextMenuProps) {
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const [open, setOpen] = useState(false);
  const feedback = useFeedback();
  const usable = disabled ? [] : items.filter((i) => !i.disabled);

  const show = () => {
    if (usable.length === 0) return;
    feedback('press');
    setOpen(true);
  };

  const actions = [
    ...(onPress ? [{ name: 'activate' }] : []),
    ...(usable.length > 0 ? [{ name: OPEN, label }] : []),
    ...usable.map((i) => ({ name: `item:${i.key}`, label: i.label })),
  ];

  const onAction = (e: AccessibilityActionEvent) => {
    const name = e.nativeEvent.actionName;
    if (name === 'activate') onPress?.();
    else if (name === OPEN) show();
    else usable.find((i) => `item:${i.key}` === name)?.onSelect();
  };

  return (
    <View ref={anchor} collapsable={false} style={style}>
      <Pressable
        testID={testID}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityActions={actions}
        onAccessibilityAction={onAction}
        onPress={onPress}
        onLongPress={show}
        delayLongPress={400}
      >
        {children}
      </Pressable>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        items={items}
        anchorRef={anchor}
        width={width}
      />
    </View>
  );
}
