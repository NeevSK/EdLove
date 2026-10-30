import { type GestureResponderEvent, Text as RNText, type TextProps as RNTextProps } from 'react-native';
import type { LinkContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface LinkProps extends LinkContract, Omit<RNTextProps, 'children' | 'onPress'> {
  onPress: (event: GestureResponderEvent) => void;
}

/**
 * Words that go somewhere. Drawn in the world's deep lamp (legible on its
 * ground) and underlined, so a link never relies on colour alone.
 */
export function Link({ label, onPress, style, ...rest }: LinkProps) {
  const { world, language } = useWorldContext();
  return (
    <RNText
      role="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        typeStyle(world.recipes.text.body, language, world),
        { color: world.tokens.lampDeep, textDecorationLine: 'underline' },
        style,
      ]}
      {...rest}
    >
      {label}
    </RNText>
  );
}
