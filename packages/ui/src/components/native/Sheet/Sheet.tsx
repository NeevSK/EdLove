import {
  ModalBottomSheet,
  type ModalDetent,
  type SurfaceStyle,
} from '@swmansion/react-native-bottom-sheet';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SheetContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { shadowStyle } from '../../../theme/native/style';
import type { Radius, Shadow } from '../../../theme/types';
import { useWorld } from '../../../theme/native/WorldContext';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';
import { Text } from '../Text/Text';

export type SheetProps = SheetContract;

/** On its side, or on a tablet, a sheet is a centred card no wider than this. */
const SIDEWAYS_WIDTH = 600;

/**
 * A panel that rises from the bottom edge for a short task or a list of choices. It is the world's
 * raised surface with only its top corners round.
 *
 * Built on Software Mansion's native sheet (`@swmansion/react-native-bottom-sheet`): dragging,
 * snapping and the hand-off between dragging the sheet and scrolling its content run in native
 * code, so a busy JS thread never makes it stutter, and content can scroll from anywhere, not just
 * below a drag handle. It sizes to its content up to nearly the full height, and sits above
 * everything, native modal screens included (`windowOverlay`), so a sheet opened from a modal
 * route still covers the window.
 *
 * Drag it down, tap the backdrop, press Back (predictive Back included) or Escape, or use a screen
 * reader's dismiss action to let it go, unless `dismissable` is false: then only `open` closes it.
 */
export function Sheet({ open, onClose, title, children, dismissable = true }: SheetProps) {
  const overlay = useWorld().recipes.overlay;
  const { animates } = useWorldMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const feedback = useFeedback();
  const sideways = width > height || width >= SIDEWAYS_WIDTH;
  const side = sideways ? Math.max(0, (width - SIDEWAYS_WIDTH) / 2) : 0;
  const panel = { ...overlay.panel, radius: overlay.sheetRadius };

  const detents: ModalDetent[] = [
    // Not dismissable: dragging can't reach the closed detent; only `open` takes it there.
    dismissable ? 0 : { value: 0, programmatic: true },
    { value: 'content', insets: { left: side, right: side } },
  ];

  return (
    <ModalBottomSheet
      windowOverlay
      lazy
      index={open ? 1 : 0}
      detents={detents}
      // Up to 90% of the screen (94% on a short landscape screen), as before.
      topInset={height * (sideways && height < 520 ? 0.06 : 0.1)}
      animateIn={animates}
      // Reduced motion: the spring settles at once rather than carrying the sheet into place.
      settleDuration={animates ? undefined : 1}
      scrimColor={overlay.scrim}
      scrimAccessibilityLabel={`Close ${title}`}
      // A drag that lets go is a deliberate act, so it gets the commit feel; other closes don't.
      onIndexChange={(index) => {
        if (index !== 0) return;
        feedback('commit');
        onClose();
      }}
      onCloseRequest={dismissable ? onClose : ignore}
      surface={
        <View style={[StyleSheet.absoluteFill, surfaceStyle(panel, true)]}>
          <InnerFrame recipe={panel} />
        </View>
      }
      surfaceStyle={sheetSurface(overlay.sheetRadius, panel.shadow)}
    >
      <View
        role="dialog"
        aria-modal
        aria-label={title}
        accessibilityViewIsModal
        onAccessibilityEscape={dismissable ? onClose : undefined}
        style={[
          styles.sheet,
          {
            paddingTop: panel.padding,
            paddingHorizontal: panel.paddingX,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.head}>
          {dismissable ? (
            <View style={[styles.grabber, { backgroundColor: overlay.grabber }]} aria-hidden />
          ) : null}
          <Text kind="title" role="heading">
            {title}
          </Text>
        </View>
        {children}
      </View>
    </ModalBottomSheet>
  );
}

/**
 * The card's shape and shadow as the native sheet takes them: it clips the fill and the content to
 * these corners and casts the shadow outside them.
 */
function sheetSurface(radius: Radius, shadow: Shadow | null): SurfaceStyle {
  const { shadowColor, shadowOpacity, shadowRadius, shadowOffset, elevation } = shadowStyle(shadow);
  const corners =
    typeof radius === 'number'
      ? { borderRadius: radius }
      : {
          borderTopLeftRadius: radius[0],
          borderTopRightRadius: radius[1],
          borderBottomRightRadius: radius[2],
          borderBottomLeftRadius: radius[3],
        };
  return { ...corners, borderCurve: 'continuous', shadowColor, shadowOpacity, shadowRadius, shadowOffset, elevation };
}

/** A sheet that can't be dismissed keeps its place on a close request. */
const ignore = () => {};

const styles = StyleSheet.create({
  sheet: { gap: 12 },
  head: { gap: 12, paddingTop: 4 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 4 },
});
