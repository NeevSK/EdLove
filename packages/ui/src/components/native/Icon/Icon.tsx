import { View } from 'react-native';
import type { IconContract } from '../../../theme/contracts';
import { useWorld } from '../../../theme/native/WorldContext';
import { iconSize } from '../../../tokens/sizes';
import { toneColor } from '../Text/Text';

export type IconProps = IconContract;

/** An icon in a text tone. Hidden from screen readers unless it has a label. */
export function Icon({ icon: Glyph, size = 'md', tone = 'ink', label }: IconProps) {
  const t = useWorld().tokens;
  const glyph = <Glyph size={iconSize[size]} color={toneColor(t, tone)} aria-hidden />;
  if (!label) {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {glyph}
      </View>
    );
  }
  return (
    <View accessible role="img" accessibilityLabel={label}>
      {glyph}
    </View>
  );
}
