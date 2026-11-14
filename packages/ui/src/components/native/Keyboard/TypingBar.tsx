/**
 * The bar above the phone's keyboard, worn by the world: previous and next field on the left,
 * Done on the right. Held sideways, the keyboard covers most of a short screen, so the bar also
 * echoes the field you are in and what you are typing (dots for a secret), the in-world answer
 * to Android's grey full-screen edit box (which `TextField` turns off). Mount once, at the root,
 * inside `KeyboardProvider`.
 */

import { Text as RNText, StyleSheet, useWindowDimensions, View } from 'react-native';
import { KeyboardToolbar } from 'react-native-keyboard-controller';
import { alpha } from '../../../theme/color';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { useTypingFocus } from './focus';

export function TypingBar({ doneLabel = 'Done' }: { doneLabel?: string }) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const focus = useTypingFocus();
  const { width, height } = useWindowDimensions();
  const sideways = width > height;
  const theme = {
    primary: t.lampDeep,
    disabled: t.inkFaint,
    background: t.raised,
    ripple: alpha(t.lamp, 0.2),
  };
  const shown = focus?.secret ? '•'.repeat(focus.value.length) : focus?.value;

  return (
    <KeyboardToolbar theme={{ light: theme, dark: theme }}>
      <KeyboardToolbar.Prev />
      <KeyboardToolbar.Next />
      <KeyboardToolbar.Content>
        {sideways && focus ? (
          <View style={styles.echo} accessibilityLiveRegion="polite">
            <RNText
              numberOfLines={1}
              style={[typeStyle(world.recipes.text.caption, language, world), { color: t.inkSoft }]}
            >
              {focus.label}
            </RNText>
            <RNText
              numberOfLines={1}
              ellipsizeMode="head"
              style={[typeStyle(world.recipes.text.label, language, world), { color: t.ink }]}
            >
              {shown || ' '}
            </RNText>
          </View>
        ) : null}
      </KeyboardToolbar.Content>
      <KeyboardToolbar.Done text={doneLabel} />
    </KeyboardToolbar>
  );
}

const styles = StyleSheet.create({
  echo: { flex: 1, justifyContent: 'center', paddingHorizontal: 8 },
});
