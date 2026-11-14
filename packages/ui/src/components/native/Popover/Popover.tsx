import { type ComponentRef, type RefObject, useLayoutEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PopoverContract } from '../../../theme/contracts';
import { useWorldMotion } from '../../../theme/native/motion';
import { useWorld } from '../../../theme/native/WorldContext';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';

export interface PopoverProps extends PopoverContract {
  /** The control the popover belongs to; it opens just below it. */
  anchorRef: RefObject<ComponentRef<typeof View> | null>;
  /** Width in dp; the popover never leaves the screen. */
  width?: number;
  /** A menu of actions announces itself as one. */
  role?: 'dialog' | 'menu';
}

interface Place {
  top: number;
  left: number;
}

const GAP = 6;
const EDGE = 12;

/**
 * A small panel tied to a control: a menu, a few options, a short note. It
 * opens below its anchor (above it when there is no room) in the world's
 * raised surface. A tap outside or Android back closes it.
 */
export function Popover({
  open,
  onClose,
  label,
  children,
  anchorRef,
  width = 260,
  role = 'dialog',
}: PopoverProps) {
  const panel = useWorld().recipes.overlay.panel;
  const { animates } = useWorldMotion();
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [place, setPlace] = useState<Place | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!open) {
      setPlace(null);
      return;
    }
    anchorRef.current?.measureInWindow((x, y, w, h) => {
      const left = Math.min(Math.max(EDGE, x + w / 2 - width / 2), screen.width - width - EDGE);
      const below = y + h + GAP;
      const fitsBelow = below + height < screen.height - insets.bottom - EDGE;
      setPlace({
        left,
        top: fitsBelow || height === 0 ? below : Math.max(insets.top + EDGE, y - GAP - height),
      });
    });
  }, [open, anchorRef, width, height, screen.width, screen.height, insets.top, insets.bottom]);

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      animationType={animates ? 'fade' : 'none'}
      onRequestClose={onClose}
    >
      <Pressable accessible={false} style={StyleSheet.absoluteFill} onPress={onClose} />
      {place ? (
        <View
          role={role}
          aria-label={label}
          accessibilityViewIsModal
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          style={[surfaceStyle(panel), styles.panel, { width, top: place.top, left: place.left }]}
        >
          <InnerFrame recipe={panel} />
          {children}
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', gap: 8 },
});
