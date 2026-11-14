import { FlashList } from '@shopify/flash-list';
import {
  Text as RNText,
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import type { RailContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { cardWidth } from '../../../tokens/sizes';
import { gapFor } from '../../../tokens/space';
import { Button } from '../Button/Button';

export interface RailProps<T> extends RailContract<T> {
  style?: StyleProp<ViewStyle>;
}

/**
 * A short horizontal run (recent lessons, classes, worlds). Items snap to
 * their start so a card is never left half under the edge.
 */
export function Rail<T>({
  label,
  items,
  keyOf,
  renderItem,
  size = 'md',
  seeAll,
  style,
}: RailProps<T>) {
  const { world, language } = useWorldContext();
  const { fontScale } = useWindowDimensions();
  const gap = gapFor('between', 'comfortable', fontScale);
  const width = cardWidth[size];
  return (
    <View style={[{ gap: gapFor('inside', 'comfortable', fontScale) }, style]}>
      <View style={styles.head}>
        <RNText
          accessibilityRole="header"
          style={[typeStyle(world.recipes.group.label, language, world), styles.label]}
        >
          {label}
        </RNText>
        {seeAll ? (
          <Button label={seeAll.label} variant="quiet" size="sm" onPress={seeAll.onPress} />
        ) : null}
      </View>
      <FlashList
        horizontal
        data={items}
        keyExtractor={(item) => keyOf(item)}
        renderItem={({ item, index }) => (
          <View role="listitem" style={{ width, marginRight: index < items.length - 1 ? gap : 0 }}>
            {renderItem(item, index)}
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width + gap}
        decelerationRate="fast"
        role="list"
        aria-label={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { flexShrink: 1 },
});
