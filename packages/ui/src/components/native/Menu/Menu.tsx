import type { ComponentRef, RefObject } from 'react';
import { Pressable, Text as RNText, StyleSheet, type View } from 'react-native';
import type { MenuContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { Popover } from '../Popover/Popover';

export interface MenuProps extends MenuContract {
  anchorRef: RefObject<ComponentRef<typeof View> | null>;
  width?: number;
}

/** A short list of actions for one thing, opened from a control (a "more" button). */
export function Menu({ open, onClose, label, items, anchorRef, width = 240 }: MenuProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const row = world.recipes.row;
  return (
    <Popover
      open={open}
      onClose={onClose}
      label={label}
      anchorRef={anchorRef}
      width={width}
      role="menu"
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          role="menuitem"
          aria-disabled={item.disabled}
          accessibilityLabel={item.label}
          disabled={item.disabled}
          onPress={() => {
            feedback(item.destructive ? 'destructive' : 'select');
            onClose();
            item.onSelect();
          }}
          style={({ pressed }) => [
            styles.item,
            { opacity: item.disabled ? 0.5 : pressed ? 0.7 : 1 },
          ]}
        >
          <RNText
            style={[
              typeStyle(row.label, language, world),
              item.destructive ? { color: world.tokens.danger } : null,
            ]}
          >
            {item.label}
          </RNText>
        </Pressable>
      ))}
    </Popover>
  );
}

const styles = StyleSheet.create({
  item: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
});
