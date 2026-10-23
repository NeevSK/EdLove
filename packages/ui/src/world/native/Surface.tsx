import type { ComponentRef, ReactNode, Ref } from 'react';
import { StyleSheet, type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';
import type { SurfaceTone, SurfaceToneRecipe } from '../types';
import { edgeStyle, insetRadius, radiusStyle, shadowStyle } from './style';
import { useWorld } from './WorldContext';

export interface SurfaceProps extends ViewProps {
  /** `plain`: ruled lines, no box. `raised`: a held sheet. `inset`: a quiet well. */
  tone?: SurfaceTone;
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
  return (
    <View ref={ref} {...rest} style={[surfaceStyle(recipe, flush), style]}>
      <InnerFrame recipe={recipe} />
      {children}
    </View>
  );
}
