import type { ComponentRef, Ref } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { ThemeSwitcherContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { worldName } from '../../../theme/worlds';

export interface ThemeSwitcherProps extends ThemeSwitcherContract {
  style?: ViewStyle;
  ref?: Ref<ComponentRef<typeof View>>;
}

export function ThemeSwitcher({
  world,
  onWorldChange,
  mode = 'system',
  onModeChange,
  resolvedMode = 'light',
  variant = 'auto',
  label = 'Appearance & Diurnal World',
  lang = 'en',
  style,
  ref,
}: ThemeSwitcherProps) {
  const { world: activeWorld } = useWorldContext();
  const feedback = useFeedback();

  const toggleMode = () => {
    feedback('select');
    if (!onModeChange) return;
    const next = resolvedMode === 'light' ? 'dark' : 'light';
    onModeChange(next);
  };

  return (
    <View ref={ref} accessibilityLabel={label} style={[styles.container, style]}>
      <Pressable
        role="button"
        accessibilityLabel={`${label}: ${worldName(world, lang)}, ${resolvedMode} mode`}
        onPress={toggleMode}
        style={[
          styles.pill,
          {
            backgroundColor: activeWorld.tokens.raised,
            borderColor: activeWorld.tokens.line,
          },
        ]}
      >
        <Text style={[styles.text, { color: activeWorld.tokens.ink }]}>
          {worldName(world, lang)} · {resolvedMode === 'light' ? '☀️' : '🌙'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
