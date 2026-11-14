import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import type { SheetContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle } from '../../../theme/native/style';
import { useWorld } from '../../../theme/native/WorldContext';
import { Scrim } from '../Dialog/Scrim';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';
import { Text } from '../Text/Text';

export type SheetProps = SheetContract;

/** Dragged further than this, or flicked faster than this, the sheet lets go. */
const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 900;
const SETTLE = { damping: 20, stiffness: 240 } as const;

/**
 * A panel that rises from the bottom edge for a short task or a list of
 * choices. It is the world's raised surface with only its top corners round.
 * Drag the handle (or the sheet) down to let it go, unless `dismissable` is
 * false; Android back and the backdrop dismiss the same way.
 */
export function Sheet({ open, onClose, title, children, dismissable = true }: SheetProps) {
  const overlay = useWorld().recipes.overlay;
  const { animates } = useWorldMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // On its side (or on a tablet) a sheet is a centred panel, not a strip across the whole width.
  const sideways = width > height || width >= 600;
  const drag = useSharedValue(0);
  const feedback = useFeedback();
  const letGo = () => {
    feedback('commit');
    onClose();
  };
  const dismiss = dismissable ? onClose : undefined;

  const pan = usePanGesture({
    enabled: dismissable,
    activeOffsetY: [-12, 12],
    onActivate: () => {
      'worklet';
      drag.set(0);
    },
    onUpdate: (event) => {
      'worklet';
      // Follows the finger down; resists being pulled up past its resting place.
      drag.set(event.translationY > 0 ? event.translationY : event.translationY * 0.2);
    },
    onDeactivate: (event) => {
      'worklet';
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(letGo);
        return;
      }
      drag.set(withSpring(0, SETTLE));
    },
  });

  const follow = useAnimatedStyle(() => ({ transform: [{ translateY: drag.get() }] }));
  const panel = { ...overlay.panel, radius: overlay.sheetRadius };

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType={animates ? 'fade' : 'none'}
      onRequestClose={() => dismiss?.()}
      onShow={() => drag.set(0)}
    >
      <View style={styles.fill}>
        <Scrim onPress={dismiss} />
        <Animated.View
          role="dialog"
          aria-modal
          aria-label={title}
          accessibilityViewIsModal
          onAccessibilityEscape={dismiss}
          entering={animates ? SlideInDown.springify().damping(SETTLE.damping) : undefined}
          style={[
            surfaceStyle(panel),
            radiusStyle(overlay.sheetRadius),
            styles.sheet,
            {
              maxHeight: height * (sideways && height < 520 ? 0.94 : 0.9),
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
            sideways ? styles.sideways : null,
            follow,
          ]}
        >
          <InnerFrame recipe={panel} />
          {/* Dragging starts from the top only, so content inside can scroll freely. */}
          <GestureDetector gesture={pan}>
            <View collapsable={false} style={styles.head}>
              {dismissable ? (
                <View style={[styles.grabber, { backgroundColor: overlay.grabber }]} aria-hidden />
              ) : null}
              <Text kind="title" role="heading">
                {title}
              </Text>
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  sheet: { width: '100%', gap: 12 },
  sideways: { maxWidth: 600, alignSelf: 'center' },
  head: { gap: 12, paddingTop: 4 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 4 },
});
