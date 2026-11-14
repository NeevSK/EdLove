import { cloneElement, type ReactElement, useEffect, useState } from 'react';
import { type GestureResponderEvent, Text as RNText, StyleSheet, View } from 'react-native';
import type { TooltipContract } from '../../../theme/contracts';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

interface PressableChildProps {
  accessibilityHint?: string;
  onLongPress?: (event: GestureResponderEvent) => void;
}

export interface TooltipProps extends TooltipContract {
  /** One pressable control (an icon button). It gains the label as its hint. */
  children: ReactElement<PressableChildProps>;
}

/** How long a tip stays after the long press that showed it. */
const SHOW_MS = 1800;

/**
 * A short label for a control whose meaning is not written on it. Touch has no
 * hover, so the label is the control's accessibility hint and a long press
 * shows it in the world's tip colours above the control.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const { world, language } = useWorldContext();
  const tip = world.recipes.overlay.tip;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  const child = cloneElement(children, {
    accessibilityHint: children.props.accessibilityHint ?? label,
    onLongPress: (event: GestureResponderEvent) => {
      children.props.onLongPress?.(event);
      setShown(true);
    },
  });

  return (
    <View style={styles.anchor}>
      {child}
      {shown ? (
        <View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          style={[styles.tip, radiusStyle(tip.radius), { backgroundColor: tip.fill }]}
        >
          <RNText
            style={[typeStyle(world.recipes.text.caption, language, world), { color: tip.ink }]}
          >
            {label}
          </RNText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'relative', alignSelf: 'flex-start' },
  tip: {
    position: 'absolute',
    bottom: '100%',
    alignSelf: 'center',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 240,
  },
});
