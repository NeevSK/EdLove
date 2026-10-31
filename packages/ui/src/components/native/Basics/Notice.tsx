import { Text as RNText, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { NoticeContract } from '../../../theme/contracts';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { BASICS_ENGLISH } from '../../shared/basics';
import { Button } from '../Button/Button';

export interface NoticeProps extends NoticeContract {
  style?: StyleProp<ViewStyle>;
}

function Dismiss({ size = 18, color }: { size?: number; color?: string }) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>×</RNText>;
}

/**
 * A calm message in the flow of the page: a quiet well with an accent bar
 * in its tone. Danger is announced at once, the rest politely; the tone is
 * also in the words, never colour alone.
 */
export function Notice({
  tone = 'neutral',
  title,
  message,
  action,
  onDismiss,
  dismissLabel = BASICS_ENGLISH.dismiss,
  style,
}: NoticeProps) {
  const { world, language } = useWorldContext();
  const n = world.recipes.notice[tone];
  const text = world.recipes.text;
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: n.fill },
        radiusStyle(world.recipes.group.surface.radius),
        style,
      ]}
    >
      <View style={[styles.accent, { backgroundColor: n.accent }]} />
      <View style={styles.words}>
        {/* The words are one announced unit; the controls stay separate. */}
        <View
          accessible
          accessibilityRole={tone === 'danger' ? 'alert' : 'summary'}
          accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'polite'}
          style={styles.words}
        >
          {title ? (
            <RNText style={[typeStyle(text.label, language, world), { color: n.ink }]}>
              {title}
            </RNText>
          ) : null}
          <RNText style={[typeStyle(text.body, language, world), { color: n.ink }]}>
            {message}
          </RNText>
        </View>
        {action ? (
          <View style={styles.action}>
            <Button size="sm" variant="secondary" label={action.label} onPress={action.onPress} />
          </View>
        ) : null}
      </View>
      {onDismiss ? (
        <View style={styles.dismiss}>
          <Button
            size="sm"
            variant="quiet"
            label={dismissLabel}
            icon={Dismiss}
            onPress={onDismiss}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 12,
    paddingVertical: 12,
    paddingRight: 8,
  },
  accent: { width: 3, alignSelf: 'stretch' },
  words: { flex: 1, gap: 4 },
  action: { alignItems: 'flex-start', paddingTop: 4 },
  dismiss: { alignSelf: 'flex-start' },
});
