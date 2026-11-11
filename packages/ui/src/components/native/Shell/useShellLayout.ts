/**
 * The shell's layout for the screen as it is held right now (width, height, aspect), plus the
 * safe edges content must keep clear of. Turning the phone re-renders with the new stance.
 *
 * `edges` is the side padding content adds on top of its gutter: on its side, a phone's camera
 * cutout lands on the left or the right. The rail already clears the left, so content only adds
 * the left inset where there is no rail.
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ShellLayout, shellLayoutOf } from '../../../theme/size';

export function useShellLayout(
  choice: 'auto' | 'docked' | 'floating' = 'auto',
): ShellLayout & { width: number; height: number; edges: { left: number; right: number } } {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return useMemo(() => {
    const layout = shellLayoutOf(width, choice, height);
    return {
      ...layout,
      width,
      height,
      edges: { left: layout.tabs === 'rail' ? 0 : insets.left, right: insets.right },
    };
  }, [width, height, choice, insets.left, insets.right]);
}
