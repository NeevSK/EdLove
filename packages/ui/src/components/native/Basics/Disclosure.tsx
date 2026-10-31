import { useState } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { DisclosureContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion, useWorldMotion } from '../../../theme/native/motion';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface DisclosureProps extends DisclosureContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * A part that folds open and shut. The whole title line is the control,
 * says whether it is open, and brightens from within when pressed; the
 * content fades in the world's time, or simply appears when motion is off.
 */
export function Disclosure({
  title,
  summary,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
}: DisclosureProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const press = usePressMotion();
  const motion = useWorldMotion();
  const [own, setOwn] = useState(defaultOpen);
  const open = controlled ?? own;
  const text = world.recipes.text;
  const toggle = () => {
    feedback('select');
    if (controlled === undefined) setOwn(!open);
    onOpenChange?.(!open);
  };
  return (
    <View style={style}>
      <Pressable
        role="button"
        accessibilityLabel={summary ? `${title}, ${summary}` : title}
        accessibilityState={{ expanded: open }}
        onPressIn={press.pressIn}
        onPressOut={press.pressOut}
        onPress={toggle}
        style={styles.head}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: press.light.color },
            press.light.style,
          ]}
        />
        <View style={styles.words}>
          <RNText style={typeStyle(text.label, language, world)}>{title}</RNText>
          {summary ? (
            <RNText style={typeStyle(text.caption, language, world)}>{summary}</RNText>
          ) : null}
        </View>
        <RNText
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.chevron,
            { color: world.tokens.inkSoft, transform: [{ rotate: open ? '90deg' : '0deg' }] },
          ]}
        >
          ›
        </RNText>
      </Pressable>
      {open ? (
        <Animated.View
          entering={motion.animates ? FadeIn.duration(world.recipes.motion.settleMs) : undefined}
          exiting={
            motion.animates ? FadeOut.duration(world.recipes.motion.settleMs / 2) : undefined
          }
          style={styles.body}
        >
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 8 },
  words: { flex: 1, gap: 2 },
  chevron: { fontSize: 20, lineHeight: 22, width: 16, textAlign: 'center' },
  body: { paddingBottom: 8 },
});
