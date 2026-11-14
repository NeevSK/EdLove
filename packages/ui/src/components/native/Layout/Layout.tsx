import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import type { InlineContract, StackContract } from '../../../theme/contracts';
import { gapFor } from '../../../tokens/space';

interface LayoutProps extends ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

export interface StackProps extends StackContract, LayoutProps {}
export interface InlineProps extends InlineContract, LayoutProps {}

const ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const;
const JUSTIFY = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
} as const;

function useGap(gap: StackContract['gap'], density: StackContract['density']): number {
  const { fontScale } = useWindowDimensions();
  return gap === 'none' ? 0 : gapFor(gap ?? 'between', density, fontScale);
}

/** One above another, spaced by their relation. */
export function Stack({ gap, density, align = 'stretch', style, ref, ...rest }: StackProps) {
  const g = useGap(gap, density);
  return <View ref={ref} {...rest} style={[{ gap: g, alignItems: ALIGN[align] }, style]} />;
}

/** Side by side, wrapping when there is no room. */
export function Inline({
  gap,
  density,
  align = 'center',
  justify = 'start',
  wrap = true,
  style,
  ref,
  ...rest
}: InlineProps) {
  const g = useGap(gap, density);
  return (
    <View
      ref={ref}
      {...rest}
      style={[
        {
          flexDirection: 'row',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: g,
          alignItems: ALIGN[align],
          justifyContent: JUSTIFY[justify],
        },
        style,
      ]}
    />
  );
}
