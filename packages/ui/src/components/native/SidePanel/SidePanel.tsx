import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useEffect, useState } from 'react';
import { I18nManager, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import type { SidePanelContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';
import { Text } from '../Text/Text';

export type SidePanelProps = SidePanelContract;

/** A panel never takes more than this much of the width, nor more than this many points. */
const WIDTH_SHARE = 0.86;
const MAX_WIDTH = 420;
/** Dragged further toward its edge than this share of its width, or flicked faster, it lets go. */
const DISMISS_SHARE = 0.3;
const DISMISS_VELOCITY = 900;
const SETTLE = { damping: 22, stiffness: 260 } as const;
const LEAVE_MS = 200;

/**
 * The sheet's rounding, turned on its side: a side panel is round only on the edge that faces the
 * place, as a bottom sheet is round only on its top.
 */
function innerEdgeRadius(
  radius: number | readonly [number, number, number, number],
  fromRight: boolean,
): readonly [number, number, number, number] {
  const r = typeof radius === 'number' ? radius : Math.max(radius[0], radius[1]);
  // [top-left, top-right, bottom-right, bottom-left]
  return fromRight ? [r, 0, 0, r] : [0, r, r, 0];
}

/**
 * A panel that slides in from a side edge over the current place: details beside a list, filters,
 * a conversation next to its work. It is the world's raised surface, rounded on its inner edge, over
 * a scrim that fades with it. While it is open it covers the screen, so the shell tucks its chrome
 * (the tab bar and header) away with the same motion as scrolling, and brings it back as it leaves.
 *
 * Drag it toward its edge, tap the scrim, press Back or Escape, or use a screen reader's dismiss
 * action to let it go, unless `dismissable` is false. Dragging is horizontal only, so content inside
 * scrolls vertically as usual. With reduced motion it appears and leaves without sliding.
 */
export function SidePanel({
  open,
  onClose,
  title,
  children,
  side = 'end',
  dismissable = true,
}: SidePanelProps) {
  const overlay = useWorld().recipes.overlay;
  const { animates } = useWorldMotion();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const feedback = useFeedback();
  const panelWidth = Math.min(width * WIDTH_SHARE, MAX_WIDTH);
  // `end` is the right in a left-to-right layout; the sign points from the panel toward its edge.
  const fromRight = (side === 'end') !== I18nManager.isRTL;
  const sign = fromRight ? 1 : -1;

  // Stays mounted through the leaving slide, so it can be seen going. Opening mounts it at once,
  // and so does closing without motion: there is no slide to wait for.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  if (!open && mounted && !animates) setMounted(false);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (open) {
      drag.set(0);
      progress.set(animates ? withSpring(1, SETTLE) : 1);
    } else if (!animates) {
      progress.set(0);
    } else {
      progress.set(
        withTiming(0, { duration: LEAVE_MS }, (finished) => {
          'worklet';
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [open, animates, drag, progress]);

  // Covering the screen tucks the shell's chrome away until the panel closes.
  useEffect(() => {
    if (!open) return;
    return useActiveSubTabsStore.getState().coverChrome();
  }, [open]);

  const letGo = () => {
    feedback('commit');
    onClose();
  };
  // Without a way to dismiss, the scrim, Back and Escape have nothing to do.
  const dismiss = dismissable ? onClose : ignore;

  const pan = usePanGesture({
    enabled: dismissable,
    activeOffsetX: [-12, 12],
    // A vertical move belongs to the content's scrolling, not to the panel.
    failOffsetY: [-12, 12],
    onActivate: () => {
      'worklet';
      drag.set(0);
    },
    onUpdate: (event) => {
      'worklet';
      const toward = event.translationX * sign;
      // Follows the finger toward the edge; resists being pulled the other way.
      drag.set(toward > 0 ? toward : toward * 0.2);
    },
    onDeactivate: (event) => {
      'worklet';
      if (
        event.translationX * sign > panelWidth * DISMISS_SHARE ||
        event.velocityX * sign > DISMISS_VELOCITY
      ) {
        scheduleOnRN(letGo);
        return;
      }
      drag.set(withSpring(0, SETTLE));
    },
  });

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: sign * ((1 - progress.get()) * panelWidth + drag.get()) }],
  }));
  const veil = useAnimatedStyle(() => ({
    opacity: progress.get() * Math.max(0, 1 - drag.get() / panelWidth),
  }));

  const panel = { ...overlay.panel, radius: innerEdgeRadius(overlay.sheetRadius, fromRight) };

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={dismiss}
    >
      <View style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, veil]}>
          <Pressable
            accessible={false}
            importantForAccessibility="no"
            onPress={dismiss}
            style={[StyleSheet.absoluteFill, { backgroundColor: overlay.scrim }]}
            testID="side-panel-scrim"
          />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            role="dialog"
            aria-modal
            aria-label={title}
            accessibilityViewIsModal
            onAccessibilityEscape={dismiss}
            style={[
              surfaceStyle(panel),
              radiusStyle(panel.radius),
              styles.panel,
              fromRight ? styles.right : styles.left,
              {
                width: panelWidth,
                paddingTop: Math.max(insets.top, 16) + 8,
                paddingBottom: Math.max(insets.bottom, 16) + 8,
              },
              slide,
            ]}
          >
            <InnerFrame recipe={panel} />
            <Text kind="title" role="heading">
              {title}
            </Text>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

/** A panel that can't be dismissed keeps its place when asked to close. */
function ignore() {}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  panel: { position: 'absolute', top: 0, bottom: 0, gap: 12 },
  right: { right: 0 },
  left: { left: 0 },
});
