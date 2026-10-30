import {
  Children,
  type ComponentRef,
  Fragment,
  isValidElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Text as RNText,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import type { GroupContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';

export interface GroupProps extends GroupContract, ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/**
 * Rows that belong together on one held surface. Only the outer corners
 * round; hairlines start at the row inset so the group reads as one thing.
 */
export function Group({ label, footer, children, style, ref, ...rest }: GroupProps) {
  const { world, language } = useWorldContext();
  const { fontScale } = useWindowDimensions();
  const g = world.recipes.group;
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View
      ref={ref}
      accessibilityLabel={label}
      {...rest}
      style={[{ gap: gapFor('inside', 'comfortable', fontScale) }, style]}
    >
      {label ? (
        <RNText accessibilityRole="header" style={typeStyle(g.label, language, world)}>
          {label}
        </RNText>
      ) : null}
      <View style={[surfaceStyle(g.surface, true), { overflow: 'hidden' }]}>
        <InnerFrame recipe={g.surface} />
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? (
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  marginLeft: g.indent,
                  height: g.divider.width,
                  backgroundColor: g.divider.color,
                }}
              />
            ) : null}
            <View style={{ paddingHorizontal: g.indent }}>{row}</View>
          </Fragment>
        ))}
      </View>
      {footer ? <RNText style={typeStyle(g.footer, language, world)}>{footer}</RNText> : null}
    </View>
  );
}
