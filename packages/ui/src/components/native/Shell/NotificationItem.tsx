import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { NotificationItemContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion } from '../../../theme/native/motion';
import { glowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { iconSize } from '../../../tokens/sizes';
import { NOTIFICATION_ENGLISH } from '../../shared/notifications';

export type NotificationItemProps = NotificationItemContract;

/**
 * One notification, in rows that sit in a day's `Group`. Unread ones carry
 * the world's lit mark and say "Unread" first; pressing brightens it from
 * within; marking read is an action screen readers can reach without a swipe.
 */
export function NotificationItem({
  title,
  body,
  time,
  unread,
  icon: Glyph,
  tone = 'plain',
  onPress,
  onMarkRead,
  labels,
}: NotificationItemProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const press = usePressMotion();
  const l = { ...NOTIFICATION_ENGLISH, ...labels };
  const t = world.tokens;
  const text = world.recipes.text;
  const name = [unread ? l.unread : null, title, body, time].filter(Boolean).join(', ');

  const content = (
    <View style={styles.row}>
      <View style={styles.mark}>
        {unread ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: tone === 'danger' ? t.danger : t.lamp },
              tone === 'danger' ? null : glowStyle(world.recipes.row.signal.glow),
            ]}
          />
        ) : null}
      </View>
      {Glyph ? (
        <Glyph
          size={iconSize.md}
          color={tone === 'danger' ? t.danger : unread ? t.ink : t.inkSoft}
          aria-hidden
        />
      ) : null}
      <View style={styles.words}>
        <RNText
          numberOfLines={2}
          style={[
            typeStyle(text.body, language, world),
            unread ? { fontWeight: '600' } : { color: t.inkSoft },
          ]}
        >
          {title}
        </RNText>
        {body ? (
          <RNText numberOfLines={2} style={typeStyle(text.caption, language, world)}>
            {body}
          </RNText>
        ) : null}
      </View>
      <RNText style={[typeStyle(text.caption, language, world), styles.time]}>{time}</RNText>
    </View>
  );

  const actions = unread && onMarkRead ? [{ name: 'markRead', label: l.markRead }] : undefined;
  return (
    <Pressable
      role={onPress ? 'button' : undefined}
      accessible
      accessibilityLabel={name}
      accessibilityActions={actions}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'markRead') onMarkRead?.();
      }}
      disabled={!onPress}
      onPressIn={() => {
        press.pressIn();
        feedback('press');
      }}
      onPressOut={press.pressOut}
      onPress={onPress}
      style={styles.press}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: press.light.color }, press.light.style]}
      />
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { minHeight: 56, justifyContent: 'center', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mark: { width: 10, paddingTop: 7, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  words: { flex: 1, gap: 2, minWidth: 0 },
  time: { paddingTop: 2 },
});
