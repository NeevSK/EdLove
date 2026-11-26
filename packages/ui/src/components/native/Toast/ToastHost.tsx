import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  AccessibilityInfo,
  type AccessibilityActionEvent,
  AppState,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useAccessibility } from '../../../hooks/useAccessibility';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { useWorld } from '../../../theme/native/WorldContext';
import { getToasts, subscribeToasts, type ToastItem, toast } from '../../shared/toasts';
import { Button } from '../Button/Button';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';
import { Text } from '../Text/Text';
import { WaitingSign } from '../WaitingSign/WaitingSign';

/** How much of each older toast shows above the one in front while the stack is gathered. */
const PEEK = 10;
const GAP = 8;
/** Swiped further than this, or flicked faster, a toast leaves. */
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 800;
/** Behind the third, older toasts fade out of the stack. */
const DEPTH_SHOWN = 3;

type Motion = ReturnType<typeof useWorldMotion>;

/** Moves a value the way the world moves: its spring, or its timing when it has none. */
function settle(motion: Motion, to: number) {
  'worklet';
  if (!motion.animates) return to;
  return motion.spring ? withSpring(to, motion.spring) : withTiming(to, { duration: motion.duration.transition });
}

interface CardProps {
  item: ToastItem;
  /** 0 is the newest, in front. */
  depth: number;
  /** Where the card sits above the stack's bottom edge. */
  offset: number;
  gathered: boolean;
  onHeight: (id: number, height: number) => void;
}

/** Danger and important toasts interrupt; everything else waits its turn. */
const urgent = (item: ToastItem) => item.important || item.tone === 'danger';

function ToastCard({ item, depth, offset, gathered, onHeight }: CardProps) {
  const overlay = useWorld().recipes.overlay;
  const motion = useWorldMotion();
  const { width } = useWindowDimensions();
  const feedback = useFeedback();

  // Arrives from the world's direction of travel; essential motion only fades.
  const from = motion.level === 'essential' ? 0 : motion.from.y || 16;
  const lift = useSharedValue(motion.animates ? -offset + from : -offset);
  const scale = useSharedValue(1);
  const fade = useSharedValue(motion.animates ? 0 : 1);
  const swipe = useSharedValue(0);
  const nudge = useSharedValue(0);

  const behind = gathered ? depth : 0;
  useEffect(() => {
    lift.set(settle(motion, -offset));
    scale.set(settle(motion, 1 - behind * 0.05));
    fade.set(
      motion.animates
        ? withTiming(behind >= DEPTH_SHOWN ? 0 : 1 - behind * 0.22, { duration: motion.duration.micro })
        : behind >= DEPTH_SHOWN
          ? 0
          : 1,
    );
  }, [offset, behind, motion, lift, scale, fade]);

  // A toast that changes while it is up gives a small nudge, so the change is seen.
  const seen = useRef(item.revision);
  useEffect(() => {
    if (item.revision === seen.current) return;
    seen.current = item.revision;
    if (!motion.animates || motion.level === 'essential') return;
    nudge.set(withSequence(withTiming(-3, { duration: 60 }), withTiming(3, { duration: 60 }), withTiming(0, { duration: 80 })));
  }, [item.revision, motion, nudge]);

  const leave = (direction: number) => {
    feedback('commit');
    if (!motion.animates) {
      toast.dismiss(item.id);
      return;
    }
    swipe.set(
      withTiming(direction * width, { duration: motion.duration.micro }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(toast.dismiss, item.id);
      }),
    );
  };

  const pan = usePanGesture({
    enabled: item.dismissible && (!gathered || depth === 0),
    activeOffsetX: [-10, 10],
    failOffsetY: [-10, 10],
    onUpdate: (event) => {
      'worklet';
      swipe.set(event.translationX);
    },
    onDeactivate: (event) => {
      'worklet';
      if (Math.abs(event.translationX) > SWIPE_DISTANCE || Math.abs(event.velocityX) > SWIPE_VELOCITY) {
        scheduleOnRN(leave, Math.sign(event.translationX || event.velocityX));
        return;
      }
      swipe.set(withSpring(0));
    },
  });

  const style = useAnimatedStyle(() => ({
    opacity: fade.get() * (1 - Math.min(1, Math.abs(swipe.get()) / (width * 0.6))),
    transform: [
      { translateY: lift.get() },
      { translateX: swipe.get() + nudge.get() },
      { scale: scale.get() },
    ],
  }));

  const pill = item.size === 'pill';
  const panel = pill
    ? { ...overlay.panel, padding: 10, paddingX: 16, radius: 999 }
    : { ...overlay.panel, padding: 12, paddingX: 16 };

  const onAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'escape' || event.nativeEvent.actionName === 'dismiss') {
      toast.dismiss(item.id);
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        exiting={motion.animates ? FadeOut.duration(motion.duration.micro) : undefined}
        onLayout={(event) => onHeight(item.id, event.nativeEvent.layout.height)}
        accessibilityLiveRegion={urgent(item) ? 'assertive' : 'polite'}
        role={urgent(item) ? 'alert' : 'status'}
        accessibilityActions={item.dismissible ? [{ name: 'dismiss', label: 'Dismiss' }] : undefined}
        onAccessibilityAction={onAction}
        onAccessibilityEscape={item.dismissible ? () => toast.dismiss(item.id) : undefined}
        // Behind the front toast in a gathered stack: seen, not read twice.
        importantForAccessibility={behind > 0 ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={behind > 0}
        style={[
          surfaceStyle(panel),
          styles.card,
          pill ? styles.pill : styles.wide,
          { borderLeftWidth: pill ? 0 : 3, borderLeftColor: overlay.toast[item.tone].edge, zIndex: 100 - depth },
          style,
        ]}
        testID={`toast-${item.size}`}
      >
        <InnerFrame recipe={panel} />
        <Pressable
          style={styles.body}
          onPressIn={() => toast.pause(item.id)}
          onPressOut={() => toast.resume(item.id)}
          accessible={false}
        >
          <View style={styles.line}>
            {item.pending ? <WaitingSign size={18} /> : null}
            <Text kind={pill ? 'label' : 'body'} style={styles.message} numberOfLines={pill ? 1 : 3}>
              {item.message}
            </Text>
            {item.count > 1 ? (
              <Text kind="caption" tone="soft" aria-label={`${item.count} times`}>
                {`×${item.count}`}
              </Text>
            ) : null}
            {item.action ? (
              <Button label={item.action.label} variant="quiet" size="sm" onPress={() => toast.act(item.id)} />
            ) : null}
          </View>
          {item.description && !pill ? (
            <Text kind="caption" tone="soft">
              {item.description}
            </Text>
          ) : null}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

function Banner({ item }: { item: ToastItem }) {
  const overlay = useWorld().recipes.overlay;
  const motion = useWorldMotion();
  const drop = useSharedValue(motion.animates ? -24 : 0);
  const fade = useSharedValue(motion.animates ? 0 : 1);
  useEffect(() => {
    drop.set(settle(motion, 0));
    fade.set(motion.animates ? withTiming(1, { duration: motion.duration.micro }) : 1);
  }, [motion, drop, fade]);
  const style = useAnimatedStyle(() => ({ opacity: fade.get(), transform: [{ translateY: drop.get() }] }));
  const panel = { ...overlay.panel, padding: 12, paddingX: 16 };
  return (
    <Animated.View
      exiting={motion.animates ? FadeOut.duration(motion.duration.micro) : undefined}
      role={urgent(item) ? 'alert' : 'status'}
      accessibilityLiveRegion={urgent(item) ? 'assertive' : 'polite'}
      onAccessibilityEscape={item.dismissible ? () => toast.dismiss(item.id) : undefined}
      style={[surfaceStyle(panel), styles.banner, { borderLeftWidth: 3, borderLeftColor: overlay.toast[item.tone].edge }, style]}
      testID="toast-banner"
    >
      <InnerFrame recipe={panel} />
      <View style={styles.line}>
        {item.pending ? <WaitingSign size={18} /> : null}
        <Text kind="body" style={styles.message}>
          {item.message}
        </Text>
        {item.action ? (
          <Button label={item.action.label} variant="quiet" size="sm" onPress={() => toast.act(item.id)} />
        ) : null}
        {item.dismissible ? (
          <Button label="Dismiss" variant="quiet" size="sm" onPress={() => toast.dismiss(item.id)} />
        ) : null}
      </View>
      {item.description ? (
        <Text kind="caption" tone="soft">
          {item.description}
        </Text>
      ) : null}
    </Animated.View>
  );
}

/**
 * Where toasts appear. Place it once near the root, after the navigator; it renders nothing while
 * there are none, so it costs no views or layout the rest of the time.
 *
 * Banners span the top, under the status bar, and stay until resolved. Everything else rises from
 * the bottom, above the tab bar (and down to the edge while the chrome is tucked away), in the
 * world's own motion. Several gather into a stack, the newest in front and the older ones peeking
 * behind; tap the stack to fan them out. Swipe a toast sideways to let it go; hold it to keep it.
 * The clock stops while the app is hidden, and for a screen reader a toast with an action waits to
 * be dealt with.
 */
export function ToastHost({ bottomOffset = 72 }: { bottomOffset?: number }) {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  const insets = useSafeAreaInsets();
  const motion = useWorldMotion();
  const feedback = useFeedback();
  const { isScreenReaderEnabled } = useAccessibility();
  const chromeTucked = useActiveSubTabsStore((s) => !s.isChromeVisible || s.chromeCovers > 0);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [fanned, setFanned] = useState(false);
  const announced = useRef(new Set<number>());

  const banners = items.filter((item) => item.size === 'banner');
  // Newest first: the front of the stack.
  const stack = items.filter((item) => item.size !== 'banner').reverse();
  const gathered = !fanned && stack.length > 1;
  if (fanned && stack.length <= 1) setFanned(false);

  useEffect(() => {
    for (const item of items) {
      const key = item.id * 1000 + item.revision;
      if (announced.current.has(key)) continue;
      announced.current.add(key);
      // Live regions are announced on Android; iOS needs the explicit call.
      AccessibilityInfo.announceForAccessibility(item.message);
      if (item.pending) continue;
      if (item.tone === 'success') feedback('success');
      else if (item.tone === 'warning') feedback('warning');
      else if (item.tone === 'danger') feedback('error');
      // A screen reader needs time to reach an action; it waits until dealt with.
      if (isScreenReaderEnabled && item.action) toast.pause(item.id);
    }
  }, [items, feedback, isScreenReaderEnabled]);

  // The clock stops while the app is in the background.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') toast.resume();
      else toast.pause();
    });
    return () => subscription.remove();
  }, []);

  // Fanned out, the person is reading: nothing leaves under them.
  useEffect(() => {
    if (!fanned) return;
    toast.pause();
    return () => toast.resume();
  }, [fanned]);

  // Above the tab bar while it shows; down near the edge while the chrome is tucked away.
  const raise = useSharedValue(chromeTucked ? 16 : bottomOffset);
  useEffect(() => {
    raise.set(settle(motion, chromeTucked ? 16 : bottomOffset));
  }, [chromeTucked, bottomOffset, motion, raise]);
  const rise = useAnimatedStyle(() => ({ transform: [{ translateY: -raise.get() }] }));

  if (items.length === 0) return null;

  const height = (id: number) => heights[id] ?? 56;
  let below = 0;
  const offsets = stack.map((item, depth) => {
    const at = gathered ? depth * PEEK : below;
    below += height(item.id) + GAP;
    return at;
  });
  const stackHeight = gathered
    ? height(stack[0]?.id ?? -1) + PEEK * Math.min(stack.length - 1, DEPTH_SHOWN - 1)
    : Math.max(0, below - GAP);

  return (
    <>
      {banners.length > 0 ? (
        <View pointerEvents="box-none" style={[styles.top, { top: insets.top + 8 }]} testID="toast-banners">
          {banners.map((item) => (
            <Banner key={item.id} item={item} />
          ))}
        </View>
      ) : null}
      {stack.length > 0 ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.host, { bottom: insets.bottom, height: stackHeight }, rise]}
          testID="toast-host"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={stack.length > 1 ? () => setFanned((f) => !f) : undefined}
            accessibilityRole={stack.length > 1 ? 'button' : undefined}
            accessibilityLabel={stack.length > 1 ? (fanned ? 'Gather notifications' : `Show all ${stack.length} notifications`) : undefined}
            accessible={stack.length > 1}
            testID="toast-stack"
          />
          {stack.map((item, depth) => (
            <ToastCard
              key={item.id}
              item={item}
              depth={depth}
              offset={offsets[depth] ?? 0}
              gathered={gathered}
              onHeight={(id, h) => setHeights((all) => (all[id] === h ? all : { ...all, [id]: h }))}
            />
          ))}
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16 },
  top: { position: 'absolute', left: 12, right: 12, gap: GAP },
  card: { position: 'absolute', bottom: 0, alignSelf: 'center' },
  wide: { width: '100%', maxWidth: 520 },
  pill: { maxWidth: 360 },
  banner: { width: '100%', gap: 4 },
  body: { gap: 4 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  message: { flexShrink: 1, flexGrow: 1 },
});
