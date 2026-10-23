import type { ComponentRef, Ref } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import type { TextRole, TextTone, WorldTokens } from '../types';
import { typeStyle } from './style';
import { useWorldContext } from './WorldContext';

export interface TextProps extends RNTextProps {
  /** What the words are for. The world decides how each kind looks. */
  kind?: TextRole;
  /** Override the role's colour with another semantic ink. */
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
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
        typeStyle(recipe, language),
        tone ? { color: toneColor(world.tokens, tone) } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
