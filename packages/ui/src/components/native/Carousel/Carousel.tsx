import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import type { CarouselContract } from '../../../theme/contracts';
import { useWorldMotion } from '../../../theme/native/motion';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { Button } from '../Button/Button';
import { useContainerWidth } from '../Layout/useContainerWidth';

export interface CarouselProps<T> extends CarouselContract<T> {
  style?: StyleProp<ViewStyle>;
}

const ENGLISH = {
  previous: 'Previous',
  next: 'Next',
  position: (n: number, total: number) => `${n} of ${total}`,
};

/**
 * One item per page. Swipe, or use the buttons (the path that works for
 * everyone); the position is announced when it changes. It never moves by
 * itself.
 */
export function Carousel<T>({
  label,
  items,
  keyOf,
  renderItem,
  labels = ENGLISH,
  onPageChange,
  style,
}: CarouselProps<T>) {
  const { world, language } = useWorldContext();
  const { animates } = useWorldMotion();
  const { width, onLayout } = useContainerWidth();
  const list = useRef<FlashListRef<T>>(null);
  const [page, setPage] = useState(0);
  const r = world.recipes.card;
  const total = items.length;

  const show = (index: number) => {
    const next = Math.max(0, Math.min(total - 1, index));
    if (next === page) return;
    setPage(next);
    onPageChange?.(next);
    list.current?.scrollToIndex({ index: next, animated: animates }).catch(() => {
      // The list was not mounted or measured yet; the page state still moved.
    });
  };

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== page) {
      setPage(index);
      onPageChange?.(index);
    }
  };

  return (
    <View onLayout={onLayout} aria-label={label} style={[{ gap: 8 }, style]}>
      <FlashList
        ref={list}
        horizontal
        pagingEnabled
        data={items}
        keyExtractor={(item) => keyOf(item)}
        renderItem={({ item, index }) => <View style={{ width }}>{renderItem(item, index)}</View>}
        onMomentumScrollEnd={settle}
        showsHorizontalScrollIndicator={false}
      />
      <View style={styles.controls}>
        <Button
          label={labels.previous}
          variant="quiet"
          size="sm"
          disabled={page === 0}
          onPress={() => show(page - 1)}
        />
        <View style={styles.position}>
          <View
            style={styles.dots}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {items.map((item, i) => (
              <View
                key={keyOf(item)}
                style={{
                  width: r.dot.size,
                  height: r.dot.size,
                  borderRadius: r.dot.size,
                  backgroundColor: i === page ? r.dot.on : r.dot.off,
                }}
              />
            ))}
          </View>
          <RNText
            accessibilityLiveRegion="polite"
            style={typeStyle(world.recipes.text.caption, language, world)}
          >
            {labels.position(page + 1, total)}
          </RNText>
        </View>
        <Button
          label={labels.next}
          variant="quiet"
          size="sm"
          disabled={page >= total - 1}
          onPress={() => show(page + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  position: { alignItems: 'center', gap: 4 },
  dots: { flexDirection: 'row', gap: 6 },
});
