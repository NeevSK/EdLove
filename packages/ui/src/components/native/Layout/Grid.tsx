import { Children, type ComponentRef, isValidElement, type ReactNode, type Ref } from 'react';
import {
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import type { GridContract } from '../../../theme/contracts';
import { columnsFor, gridMin } from '../../../tokens/sizes';
import { gapFor } from '../../../tokens/space';
import { useContainerWidth } from './useContainerWidth';

export interface GridProps extends GridContract, ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/** Equal columns that come and go with the width the grid is given. */
export function Grid({
  min = 'md',
  max,
  gap = 'between',
  children,
  style,
  ref,
  onLayout: onLayoutProp,
  ...rest
}: GridProps) {
  const { fontScale } = useWindowDimensions();
  const { width, onLayout } = useContainerWidth();
  const g = gapFor(gap, 'comfortable', fontScale);
  const columns = columnsFor(width, gridMin[min], g, max);
  const cell = (width - g * (columns - 1)) / columns;
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View
      ref={ref}
      {...rest}
      onLayout={(e) => {
        onLayout(e);
        onLayoutProp?.(e);
      }}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: g }, style]}
    >
      {items.map((item, i) => (
        <View key={item.key ?? i} style={{ width: cell }}>
          {item}
        </View>
      ))}
    </View>
  );
}
