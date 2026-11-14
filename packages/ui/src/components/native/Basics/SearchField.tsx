import { useState } from 'react';
import { Text as RNText, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { SearchFieldContract } from '../../../theme/contracts';
import { useLivingStyle } from '../../../theme/native/motion';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { iconSize } from '../../../tokens/sizes';
import { BASICS_ENGLISH } from '../../shared/basics';
import { IconButton } from '../IconButton/IconButton';

export type SearchFieldProps = SearchFieldContract;

function Clear({ size = 18, color }: { size?: number; color?: string }) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>×</RNText>;
}

/**
 * Search in a round well that warms while focused; a clear control once
 * there is something to clear, and the result count said politely.
 */
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  icon: Glyph,
  onSubmit,
  resultCount,
  labels,
}: SearchFieldProps) {
  const { world, language } = useWorldContext();
  const l = { ...BASICS_ENGLISH, ...labels };
  const t = world.tokens;
  const f = world.recipes.field;
  const [focused, setFocused] = useState(false);
  const edge = useLivingStyle({ borderColor: focused ? f.states.focus.edge.color : t.line });
  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.well, { backgroundColor: t.sunken }, edge]}>
        {Glyph ? <Glyph size={iconSize.sm} color={t.inkSoft} aria-hidden /> : null}
        <TextInput
          accessibilityLabel={label}
          role="searchbox"
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={f.placeholder.color}
          returnKeyType="search"
          onSubmitEditing={() => onSubmit?.(value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[typeStyle(f.value, language, world), styles.input]}
        />
        {value ? (
          <IconButton icon={Clear} label={l.clear} size="sm" onPress={() => onChange('')} />
        ) : null}
      </Animated.View>
      {resultCount !== undefined && value ? (
        <RNText
          accessibilityLiveRegion="polite"
          style={typeStyle(world.recipes.text.caption, language, world)}
        >
          {l.results(resultCount)}
        </RNText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  well: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 4,
  },
  input: { flex: 1, paddingVertical: 8 },
});
