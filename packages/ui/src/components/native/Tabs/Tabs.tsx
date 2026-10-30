import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import type { TabsContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { chipStyle } from '../Chip/Chip';

export interface TabsProps<V extends string = string> extends TabsContract<V> {
  style?: StyleProp<ViewStyle>;
}

/**
 * Switch between sibling views of one thing ("Overview", "Students", "Notes").
 * Tabs wear the world's chip look (an underline in some worlds, a filled pill
 * in others). A long set wraps onto a second line rather than hiding off-screen.
 */
export function Tabs<V extends string = string>({
  value,
  onChange,
  label,
  tabs,
  children,
  style,
}: TabsProps<V>) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const r = world.recipes.chip;
  const current = tabs.find((t) => t.value === value);

  return (
    <View style={[styles.wrap, style]}>
      <View role="tablist" aria-label={label} style={[styles.list, { gap: r.gap }]}>
        {tabs.map((tab) => {
          const selected = tab.value === value;
          const s = selected ? r.selected : r.rest;
          return (
            <Pressable
              key={tab.value}
              role="tab"
              aria-selected={selected}
              aria-disabled={tab.disabled}
              accessibilityLabel={tab.label}
              disabled={tab.disabled}
              onPress={() => {
                if (selected) return;
                feedback('select');
                onChange(tab.value);
              }}
              style={({ pressed }) => [
                chipStyle(r, s),
                styles.tab,
                { opacity: tab.disabled ? 0.4 : pressed ? 0.8 : 1 },
              ]}
            >
              <RNText style={[typeStyle(r.label, language, world), { color: s.ink }]}>
                {tab.label}
              </RNText>
            </Pressable>
          );
        })}
      </View>
      {children === undefined ? null : (
        <View role="tabpanel" aria-label={current?.label}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  list: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 4 },
  tab: { minHeight: 44, justifyContent: 'center' },
});
