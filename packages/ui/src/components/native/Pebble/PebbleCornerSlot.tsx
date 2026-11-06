import { useState } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PebbleCornerBadgeSpec } from '../../../theme/contracts';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface PebbleCornerSlotProps {
  badge?: PebbleCornerBadgeSpec;
  compact?: boolean;
}

export function PebbleCornerSlot({ badge, compact = false }: PebbleCornerSlotProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const { world } = useWorldContext();
  const t = world.tokens;

  if (!badge) return null;

  const {
    mode,
    isPinned = false,
    count = 0,
    status = 'ready',
    dotOrientation = 'vertical',
    guidanceTooltip,
    menuActions,
    onAction,
  } = badge;

  const isPermanentActive =
    (mode === 'pin' && isPinned) ||
    (mode === 'menu' && isOpenMenu) ||
    (mode === 'counter' && count > 0);

  const handlePress = (e: GestureResponderEvent) => {
    e.stopPropagation?.();

    switch (mode) {
      case 'pin':
        onAction?.('toggle-pin');
        break;
      case 'menu':
        setIsOpenMenu((prev) => !prev);
        onAction?.('toggle-menu');
        break;
      case 'counter':
        onAction?.('click-counter');
        break;
      case 'status':
        onAction?.('cycle-status');
        break;
      default:
        onAction?.(mode);
        break;
    }
  };

  const stickerSize = compact ? 26 : 34;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mode} option`}
      hitSlop={8}
      onPress={handlePress}
      onPressIn={() => setIsPressing(true)}
      onPressOut={() => setIsPressing(false)}
      style={styles.hitbox}
    >
      <View
        style={[
          styles.stickerFace,
          {
            width: stickerSize,
            height: stickerSize,
            backgroundColor: isPermanentActive
              ? t.raised
              : t.ground,
            borderColor: isPermanentActive ? t.lamp : t.line,
          },
          isPressing && styles.stickerPressing,
        ]}
      >
        {mode === 'pin' && (
          <Text style={[styles.glyphText, compact && styles.compactGlyph]}>
            {isPinned ? '📍' : '📌'}
          </Text>
        )}

        {mode === 'menu' && (
          <View
            style={[
              dotOrientation === 'vertical' ? styles.dotsCol : styles.dotsRow,
              compact && styles.compactDots,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: isPermanentActive ? t.lamp : t.inkSoft }]} />
            <View style={[styles.dot, { backgroundColor: isPermanentActive ? t.lamp : t.inkSoft }]} />
            <View style={[styles.dot, { backgroundColor: isPermanentActive ? t.lamp : t.inkSoft }]} />
          </View>
        )}

        {mode === 'counter' && (
          <Text style={[styles.counterText, { color: t.lamp }, compact && styles.compactCounter]}>
            {count > 99 ? '99+' : count}
          </Text>
        )}

        {mode === 'tooltip' && (
          <Text style={[styles.glyphText, compact && styles.compactGlyph]}>💡</Text>
        )}

        {mode === 'status' && (
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  status === 'ready'
                    ? t.success
                    : status === 'busy'
                    ? t.lamp
                    : t.inkSoft,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitbox: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  stickerFace: {
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 34,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
    paddingLeft: 2,
  },
  stickerPressing: {
    transform: [{ scale: 0.88 }],
    opacity: 0.9,
  },
  glyphText: {
    fontSize: 13,
    transform: [{ translateX: 1 }, { translateY: -1 }],
  },
  compactGlyph: {
    fontSize: 10,
  },
  dotsCol: {
    flexDirection: 'column',
    gap: 2,
    transform: [{ translateX: 1 }, { translateY: -1 }],
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    transform: [{ translateX: 1 }, { translateY: -1 }],
  },
  compactDots: {
    gap: 1.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    transform: [{ translateX: 1 }, { translateY: -1 }],
  },
  compactCounter: {
    fontSize: 9,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    transform: [{ translateX: 1 }, { translateY: -1 }],
  },
});
