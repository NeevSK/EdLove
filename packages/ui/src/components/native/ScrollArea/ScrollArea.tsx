import { useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  type ScrollViewInstance,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { type ScrollAreaContract, resolveScrollVariantForWorld, type ScrollAreaVariant } from '../../../theme/contracts';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface ScrollAreaProps extends ScrollAreaContract {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Sovereign ScrollArea (Native):
 * Cross-platform scroll container backed by ScrollAreaContract.
 * Matches web API and props for 100% platform-neutral screen authoring.
 */
export function ScrollArea({
  children,
  orientation = 'horizontal',
  variant = 'auto',
  tone = 'lamp',
  showEdgeGradients = true,
  scrollbarVisibility = 'hover',
  label,
  onScrollProgress,
  style,
  contentContainerStyle,
}: ScrollAreaProps) {
  const { world } = useWorldContext();
  const activeVariant: ScrollAreaVariant =
    variant && variant !== 'auto'
      ? variant
      : resolveScrollVariantForWorld(world?.id);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const isHorizontal = orientation !== 'vertical';

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onScrollProgress) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const maxScrollX = Math.max(0, contentSize.width - layoutMeasurement.width);
    const maxScrollY = Math.max(0, contentSize.height - layoutMeasurement.height);

    onScrollProgress({
      x: maxScrollX > 0 ? contentOffset.x / maxScrollX : 0,
      y: maxScrollY > 0 ? contentOffset.y / maxScrollY : 0,
    });
  };

  const showIndicator = scrollbarVisibility === 'always';

  return (
    <View
      style={[styles.root, style]}
      accessibilityRole="none"
      accessibilityLabel={label}
    >
      <ScrollView
        ref={scrollRef}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={isHorizontal && showIndicator}
        showsVerticalScrollIndicator={!isHorizontal && showIndicator}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          isHorizontal ? styles.horizontalContent : styles.verticalContent,
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    maxWidth: '100%',
  },
  horizontalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContent: {
    flexDirection: 'column',
  },
});
