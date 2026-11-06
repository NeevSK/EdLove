import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import type { PebbleContract } from '../../../theme/contracts';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { PebbleCornerSlot } from './PebbleCornerSlot';

export interface PebbleProps extends PebbleContract {
  style?: StyleProp<ViewStyle>;
  width?: number;
}

/**
 * Pebble: A 1:1 squircle tactile instrument for focus tools and practices in React Native.
 * Supports autonomous corner affordance slots and compact mobile calibration (dropping 3rd line).
 */
export function Pebble({
  title,
  emoji,
  media,
  icon: IconGlyph,
  rhythm,
  cornerBadge,
  gear = 'auto',
  selected = false,
  disabled = false,
  onPress,
  style,
  width,
}: PebbleProps) {
  const { world } = useWorldContext();
  const t = world.tokens;
  const isCompact = gear === 'compact' || (width !== undefined && width < 115);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: t.raised,
          borderColor: selected ? t.lamp : t.line,
          shadowColor: t.ink,
        },
        width !== undefined && { width, height: width },
        isCompact && styles.compactTile,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {/* Autonomous Corner Affordance Slot */}
      {cornerBadge && (
        <PebbleCornerSlot badge={cornerBadge} compact={isCompact} />
      )}

      {/* Central Illustration Area */}
      <View style={styles.topArea}>
        {media ? (
          media
        ) : IconGlyph ? (
          <IconGlyph size={isCompact ? 22 : 30} color={t.ink} />
        ) : emoji ? (
          <Text style={[styles.emojiText, isCompact && styles.compactEmoji]}>
            {emoji}
          </Text>
        ) : null}
      </View>

      {/* Bottom Words Area */}
      <View style={styles.bottomArea}>
        <Text
          numberOfLines={1}
          style={[styles.titleText, { color: t.ink }, isCompact && styles.compactTitle]}
        >
          {title}
        </Text>
        {rhythm && !isCompact && (
          <View style={styles.rhythmRow}>
            <View style={[styles.pulseDot, { backgroundColor: t.lamp }]} />
            <Text numberOfLines={1} style={[styles.rhythmText, { color: t.inkSoft }]}>
              {rhythm}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compactTile: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  topArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emojiText: {
    fontSize: 32,
    textAlign: 'center',
  },
  compactEmoji: {
    fontSize: 24,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  compactTitle: {
    fontSize: 11,
    lineHeight: 14,
  },
  rhythmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  rhythmText: {
    fontSize: 10,
  },
});
