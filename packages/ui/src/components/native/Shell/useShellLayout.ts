/**
 * The shell's layout for the screen as it is held right now (width, height, aspect), plus the
 * safe edges content must keep clear of. Turning the phone re-renders with the new stance.
 *
 * `edges` is the side padding content adds on top of its gutter: on its side, a phone's camera
 * cutout lands on the left or the right. The rail already clears the left, so content only adds
 * the inset on the side where there is no rail.
 *
 * The person's hand moves things within reach: held sideways, a left-handed person gets the
 * action button by the left thumb and the rail on the right (`railSide`, `actionSide`); upright,
 * the action button moves to the left edge.
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComfort } from '../../../context/ComfortPreferences';
import { type ShellLayout, shellLayoutOf } from '../../../theme/size';

export function useShellLayout(choice: 'auto' | 'docked' | 'floating' = 'auto'): ShellLayout & {
  width: number;
  height: number;
  edges: { left: number; right: number };
  railSide: 'left' | 'right';
  actionSide: 'left' | 'right';
} {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { hand } = useComfort();
  return useMemo(() => {
    const layout = shellLayoutOf(width, choice, height);
    const railSide = layout.stance === 'hud' && hand === 'left' ? 'right' : 'left';
    const rail = layout.tabs === 'rail';
    return {
      ...layout,
      width,
      height,
      railSide,
      actionSide: hand === 'left' ? 'left' : 'right',
      edges: {
        left: rail && railSide === 'left' ? 0 : insets.left,
        right: rail && railSide === 'right' ? 0 : insets.right,
      },
    };
  }, [width, height, choice, hand, insets.left, insets.right]);
}
