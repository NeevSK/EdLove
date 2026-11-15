import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { KitIconProps, MoveBy, MoveControlContract } from '../../../theme/contracts';
import { IconButton } from '../IconButton/IconButton';

export interface MoveControlProps extends MoveControlContract {
  testID?: string;
}

const upWord = (label: string) => `Move ${label} up`;
const downWord = (label: string) => `Move ${label} down`;
const placeWord = (label: string, place: number, total: number) => `${label}, ${place} of ${total}`;

function Chevron({ size = 20, color, up }: KitIconProps & { up: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" pointerEvents="none">
      <Path
        d={up ? 'M5 12.5 L10 7.5 L15 12.5' : 'M5 7.5 L10 12.5 L15 7.5'}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
const Up = (p: KitIconProps) => <Chevron {...p} up />;
const Down = (p: KitIconProps) => <Chevron {...p} up={false} />;

/**
 * Up and down beside a piece being arranged. Each button is its own stop
 * for a screen reader (a grouped "adjustable" would hide them on iOS), and the
 * new place is spoken once the floor has redrawn. The first piece has no "up", the last no
 * "down", so nothing offered is a dead end.
 */
export function MoveControl({ label, place, total, onMove, words, testID }: MoveControlProps) {
  const say = words?.place ?? placeWord;
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    AccessibilityInfo.announceForAccessibility(say(label, place, total));
  }, [label, place, total, say]);
  const move = (by: MoveBy) => {
    moved.current = true;
    onMove(by);
  };
  const canUp = place > 1;
  const canDown = place < total;

  return (
    <View testID={testID} style={styles.pair} accessibilityRole="none">
      <IconButton
        icon={Up}
        label={(words?.up ?? upWord)(label)}
        size="sm"
        disabled={!canUp}
        onPress={() => move(-1)}
      />
      <IconButton
        icon={Down}
        label={(words?.down ?? downWord)(label)}
        size="sm"
        disabled={!canDown}
        onPress={() => move(1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', alignItems: 'center' },
});
