import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { useWorld } from '../../../theme/native/WorldContext';
import { getToasts, subscribeToasts, type ToastItem, toast } from '../../shared/toasts';
import { Button } from '../Button/Button';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';
import { Text } from '../Text/Text';

function ToastCard({ item }: { item: ToastItem }) {
  const overlay = useWorld().recipes.overlay;
  const { animates } = useWorldMotion();
  const panel = { ...overlay.panel, padding: 12, paddingX: 16 };
  return (
    <Animated.View
      entering={animates ? FadeInDown : undefined}
      exiting={animates ? FadeOut : undefined}
      accessibilityLiveRegion={item.tone === 'danger' ? 'assertive' : 'polite'}
      role={item.tone === 'danger' ? 'alert' : 'status'}
      style={[
        surfaceStyle(panel),
        styles.card,
        { borderLeftWidth: 3, borderLeftColor: overlay.toast[item.tone].edge },
      ]}
    >
      <InnerFrame recipe={panel} />
      <Text kind="body" style={styles.message}>
        {item.message}
      </Text>
      {item.action ? (
        <Button
          label={item.action.label}
          variant="quiet"
          size="sm"
          onPress={() => toast.act(item.id)}
        />
      ) : null}
    </Animated.View>
  );
}

/**
 * Where toasts appear: above the bottom edge, clear of the home indicator.
 * Place it once near the root, after the navigator. It renders nothing while
 * there are no toasts, so it costs no views or layout the rest of the time.
 */
export function ToastHost({ bottomOffset = 72 }: { bottomOffset?: number }) {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  const insets = useSafeAreaInsets();
  const announced = useRef(new Set<number>());
  const feedback = useFeedback();

  useEffect(() => {
    for (const item of items) {
      if (announced.current.has(item.id)) continue;
      announced.current.add(item.id);
      // Live regions are announced on Android; iOS needs the explicit call.
      AccessibilityInfo.announceForAccessibility(item.message);
      if (item.tone === 'success') feedback('success');
      else if (item.tone === 'danger') feedback('error');
    }
  }, [items, feedback]);

  if (items.length === 0) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: insets.bottom + bottomOffset }]}
      testID="toast-host"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, gap: 8, alignItems: 'stretch' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  message: { flex: 1 },
});
