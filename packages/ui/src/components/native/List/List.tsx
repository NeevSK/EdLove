import { FlashList } from '@shopify/flash-list';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { ListContract } from '../../../theme/contracts';
import { EmptyState } from '../States/States';
import { Divider } from '../Status/Status';
import { WorldSkeleton } from '../Waiting/Waiting';

export interface ListProps<T> extends ListContract<T> {
  /** Pull to refresh. */
  onRefresh?: () => void;
  refreshing?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** How many placeholder rows stand in while the first page loads. */
const PLACEHOLDERS = 5;

function Separator() {
  return <Divider />;
}

/**
 * A long, scrolling collection (students, notes, messages), virtualized so
 * only what is on screen is drawn. Rows are separated by the world's
 * hairline; an empty list shows its EmptyState, a loading one quiet bones.
 */
export function List<T>({
  items,
  keyOf,
  renderItem,
  label,
  empty,
  loading,
  onEndReached,
  onRefresh,
  refreshing,
  style,
}: ListProps<T>) {
  if (loading && items.length === 0) {
    return (
      <View role="list" aria-label={label} aria-busy style={[styles.bones, style]}>
        {Array.from({ length: PLACEHOLDERS }, (_, i) => (
          <WorldSkeleton key={i} height={52} />
        ))}
      </View>
    );
  }

  // An empty list is its empty state, not an empty scroller.
  if (items.length === 0 && empty) return <EmptyState {...empty} />;

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => keyOf(item)}
      renderItem={({ item, index }) => <View role="listitem">{renderItem(item, index)}</View>}
      ItemSeparatorComponent={Separator}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing ?? false}
      role="list"
      aria-label={label}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  bones: { gap: 12, paddingVertical: 8 },
});
