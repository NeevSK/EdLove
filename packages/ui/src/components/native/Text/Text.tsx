import type { ComponentRef, ReactNode, Ref } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';
import type { TextContract } from '../../../theme/contracts';
import { systemTextAllowance, typeStyle } from '../../../theme/native/style';
import { useLivingStyle } from '../../../theme/native/motion';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { TextTone, WorldTokens } from '../../../theme/types';

export interface TextProps extends TextContract, Omit<RNTextProps, 'children'> {
  ref?: Ref<ComponentRef<typeof RNText>>;
  /**
   * Text contents: accepts standard React nodes, or in Reanimated 4.8.0+,
   * a `SharedValue<string>` or `SharedValue<number>` directly to animate on the UI thread
   * without triggering React re-renders.
   */
  children?: ReactNode | SharedValue<string> | SharedValue<number> | SharedValue<string | number>;
}

export function toneColor(t: WorldTokens, tone: TextTone): string {
  switch (tone) {
    case 'ink':
      return t.ink;
    case 'soft':
      return t.inkSoft;
    case 'faint':
      return t.inkFaint;
    case 'lamp':
      return t.lampDeep;
    case 'danger':
      return t.danger;
    case 'onLamp':
      return t.onLamp;
  }
}

export function Text({
  kind = 'body',
  tone,
  align,
  style,
  ref,
  maxFontSizeMultiplier,
  children,
  ...rest
}: TextProps) {
  const { world, language } = useWorldContext();
  const recipe = world.recipes.text[kind];
  const resolvedColor = tone ? toneColor(world.tokens, tone) : (recipe.color ?? world.tokens.ink);
  const living = useLivingStyle({ color: resolvedColor });

  const isSharedValue =
    children !== null &&
    typeof children === 'object' &&
    ('_isReanimatedSharedValue' in (children as any) ||
      ('get' in (children as any) && typeof (children as any).get === 'function'));

  // If running in an environment without native Fabric C++ shadow tree (such as unit test runner or web mock),
  // resolve primitive value so the JS React fiber reconciler doesn't reject non-element object
  const hasNativeFabricText = Boolean((globalThis as Record<string, unknown>).nativeFabricUIManager);
  const content =
    isSharedValue && !hasNativeFabricText
      ? ((children as any).get?.() ?? (children as any).value)
      : children;

  return (
    <Animated.Text
      ref={ref as any}
      accessibilityRole={kind === 'display' ? 'header' : undefined}
      // The phone's text size and the reading size together stay under one cap.
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? systemTextAllowance()}
      {...rest}
      style={[
        typeStyle(recipe, language, world),
        align ? { textAlign: align } : null,
        living,
        style,
      ]}
    >
      {content}
    </Animated.Text>
  );
}
