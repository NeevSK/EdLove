import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import type { AutocompleteContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorld } from '../../../theme/native/WorldContext';
import { Divider } from '../Status/Status';
import { Text } from '../Text/Text';
import { TextField } from '../TextField/TextField';
import { TOUCH_MIN } from '../touch';

export interface AutocompleteProps<V extends string = string> extends AutocompleteContract<V> {
  /** At most this many suggestions show; the caller ranks them. Default 6. */
  limit?: number;
  testID?: string;
}

const defaultCount = (n: number) => (n === 1 ? '1 suggestion' : `${n} suggestions`);

/**
 * A field that suggests as you type. Suggestions open in place under the
 * field (not over the screen), so the keyboard, the field and the choices are
 * all in view on a small phone. The count is spoken when it changes, and each
 * suggestion is its own stop with its hint read after it.
 */
export function Autocomplete<V extends string = string>({
  label,
  query,
  onQueryChange,
  suggestions,
  onPick,
  placeholder,
  hint,
  emptyText = 'No matches',
  countText = defaultCount,
  limit = 6,
  testID,
}: AutocompleteProps<V>) {
  const t = useWorld().tokens;
  const feedback = useFeedback();
  const [focused, setFocused] = useState(false);
  const shown = suggestions.slice(0, limit);
  const open = focused && query.trim().length > 0;
  const spoken = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      spoken.current = null;
      return;
    }
    const say = shown.length === 0 ? emptyText : countText(shown.length);
    if (say === spoken.current) return;
    spoken.current = say;
    AccessibilityInfo.announceForAccessibility(say);
  }, [open, shown.length, emptyText, countText]);

  return (
    <View testID={testID}>
      <TextField
        label={label}
        hint={hint}
        value={query}
        placeholder={placeholder}
        onChangeText={onQueryChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityState={{ expanded: open }}
      />
      {open ? (
        <View style={[styles.list, { borderColor: t.line }]}>
          {shown.length === 0 ? (
            <Text kind="caption" tone="soft" style={styles.empty}>
              {emptyText}
            </Text>
          ) : (
            shown.map((s, i) => (
              <View key={s.value}>
                {i > 0 ? <Divider /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={s.label}
                  accessibilityHint={s.hint}
                  accessibilityState={{ disabled: !!s.disabled }}
                  disabled={s.disabled}
                  // Pick on press-in: on Android a blur from the tap can close the list first.
                  onPressIn={() => {
                    feedback('select');
                    onPick(s.value);
                    setFocused(false);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    { opacity: s.disabled ? 0.5 : pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text kind="body">{s.label}</Text>
                  {s.hint ? (
                    <Text kind="caption" tone="soft">
                      {s.hint}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  row: { minHeight: TOUCH_MIN, justifyContent: 'center', paddingVertical: 6 },
  empty: { minHeight: TOUCH_MIN, textAlignVertical: 'center', paddingTop: 12 },
});
