import type { ComponentRef, ReactNode, Ref } from 'react';
import { type StyleProp, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { SurfaceContract } from '../../../theme/contracts';
import { edgeStyle, insetRadius, radiusStyle, shadowStyle } from '../../../theme/native/style';
import { useLivingStyle } from '../../../theme/native/motion';
import { useWorld } from '../../../theme/native/WorldContext';
import type { SurfaceToneRecipe } from '../../../theme/types';

export interface SurfaceProps extends SurfaceContract, ViewProps {
  /** Remove the recipe's padding when the content manages its own. */
  flush?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

export function surfaceStyle(r: SurfaceToneRecipe, flush = false): ViewStyle {
  return {
    backgroundColor: r.fill ?? undefined,
    ...radiusStyle(r.radius),
    ...(flush ? null : { paddingVertical: r.padding, paddingHorizontal: r.paddingX }),
    ...edgeStyle(r.edge),
    ...shadowStyle(r.shadow),
    ...(r.ruleTop ? { borderTopWidth: r.ruleTop.width, borderTopColor: r.ruleTop.color } : null),
    ...(r.ruleBottom
      ? { borderBottomWidth: r.ruleBottom.width, borderBottomColor: r.ruleBottom.color }
      : null),
    ...(r.wash && r.fill
      ? {
          backgroundImage: `radial-gradient(120% 100% at 50% 35%, ${r.wash.centre}, ${r.wash.edge})`,
        }
      : null),
  };
}

/** The inner frame some worlds draw inside a raised surface (a painted border). */
export function InnerFrame({ recipe }: { recipe: SurfaceToneRecipe }) {
  const e = recipe.innerEdge;
  if (!e) return null;
  const inset = e.inset ?? 0;
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { margin: inset, borderWidth: e.width, borderColor: e.color },
        radiusStyle(insetRadius(recipe.radius, inset)),
      ]}
    />
  );
}

export function Surface({ tone = 'raised', flush, style, children, ref, ...rest }: SurfaceProps) {
  const recipe = useWorld().recipes.surface[tone];
  const staticStyle = surfaceStyle(recipe, flush);
  const living = useLivingStyle({
    backgroundColor: recipe.fill ?? undefined,
    borderColor: recipe.edge?.color,
  });

  return (
    <Animated.View ref={ref as any} {...rest} style={[staticStyle, living, style]}>
      <InnerFrame recipe={recipe} />
      {children}
    </Animated.View>
  );
}
