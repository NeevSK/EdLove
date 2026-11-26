/**
 * A list and the thing chosen from it, side by side where there is room (a tablet, a phone on
 * its side with the rail), one at a time where there is not. On a phone the screen shows the
 * list, and the chosen thing takes the whole screen (the caller's back returns to the list).
 * Side by side, nothing chosen shows a quiet note in the detail's place, never an empty hole.
 *
 * The split follows the space the panes actually have, not the screen, so it is right beside a
 * rail, in split screen, and inside a sheet.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWorld } from '../../../theme/native/WorldContext';
import { EmptyState } from '../States/States';
import { useContainerWidth } from './useContainerWidth';

/** Below this width the two panes would both be cramped: one at a time. */
export const TWO_PANE_MIN = 720;

/** Whether to split, and how wide the list is: a third of the space, held between 300 and 400. */
export function twoPaneOf(width: number): { split: boolean; listWidth: number } {
  if (width < TWO_PANE_MIN) return { split: false, listWidth: width };
  return { split: true, listWidth: Math.round(Math.min(400, Math.max(300, width * 0.36))) };
}

export interface TwoPaneProps {
  list: ReactNode;
  /** The chosen thing; null when nothing is chosen. */
  detail: ReactNode | null;
  /** Said in the detail's place, side by side, while nothing is chosen. */
  emptyTitle?: string;
  emptyMessage?: string;
}

export function TwoPane({
  list,
  detail,
  emptyTitle = 'Nothing open',
  emptyMessage = 'Choose something from the list to see it here.',
}: TwoPaneProps) {
  const t = useWorld().tokens;
  const { width, onLayout } = useContainerWidth();
  const { split, listWidth } = twoPaneOf(width);

  if (!split) {
    return (
      <View style={styles.fill} onLayout={onLayout}>
        {detail ?? list}
      </View>
    );
  }
  return (
    <View style={[styles.fill, styles.row]} onLayout={onLayout}>
      <View
        style={[
          { width: listWidth, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: t.line },
        ]}
      >
        {list}
      </View>
      <View style={styles.fill}>
        {detail ?? (
          <View style={styles.empty}>
            <EmptyState title={emptyTitle} message={emptyMessage} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  empty: { flex: 1, justifyContent: 'center', padding: 24 },
});
