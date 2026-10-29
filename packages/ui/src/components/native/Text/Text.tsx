import type { ComponentRef, Ref } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import type { TextContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { TextTone, WorldTokens } from '../../../theme/types';

export interface TextProps extends TextContract, RNTextProps {
  ref?: Ref<ComponentRef<typeof RNText>>;
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

export function Text({ kind = 'body', tone, align, style, ref, ...rest }: TextProps) {
  const { world, language } = useWorldContext();
  const recipe = world.recipes.text[kind];
  return (
    <RNText
      ref={ref}
      accessibilityRole={kind === 'display' ? 'header' : undefined}
      {...rest}
      style={[
        typeStyle(recipe, language, world),
        tone ? { color: toneColor(world.tokens, tone) } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
