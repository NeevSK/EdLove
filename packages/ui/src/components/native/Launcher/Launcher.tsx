import { useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  Text as RNText,
  ScrollView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { mix } from '../../../theme/color';
import type { LauncherContract, LauncherItem } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion } from '../../../theme/native/motion';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { iconSize } from '../../../tokens/sizes';
import { LAUNCHER_ENGLISH, launcherSections } from '../../shared/basics';
import { SearchField } from '../Basics/SearchField';
import { Grid } from '../Layout/Grid';

export interface LauncherProps extends LauncherContract {
  style?: StyleProp<ViewStyle>;
}

interface TileProps {
  item: LauncherItem;
  keepLabel: string;
  onOpen: () => void;
  onKeep?: () => void;
}

/**
 * One room or tool: an icon in a soft lit well, its name, one line on what it
 * is for. No box around it; pressing brightens it from within and settles it
 * in the world's motion. A long press keeps it in the task strip.
 */
function Tile({ item, keepLabel, onOpen, onKeep }: TileProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const press = usePressMotion();
  const t = world.tokens;
  const text = world.recipes.text;
  const Glyph = item.icon;
  const name = [item.title, item.badge, item.description].filter(Boolean).join(', ');
  return (
    <Animated.View style={press.style}>
      <Pressable
        role="button"
        accessibilityLabel={name}
        accessibilityActions={onKeep ? [{ name: 'keep', label: keepLabel }] : undefined}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'keep') onKeep?.();
        }}
        onPressIn={() => {
          press.pressIn();
          feedback('press');
        }}
        onPressOut={press.pressOut}
        onPress={onOpen}
        onLongPress={onKeep}
        delayLongPress={380}
        style={[styles.tile, radiusStyle(world.recipes.group.surface.radius)]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            radiusStyle(world.recipes.group.surface.radius),
            { backgroundColor: press.light.color },
            press.light.style,
          ]}
        />
        <View style={[styles.well, { backgroundColor: mix(t.sunken, t.lamp, 0.12) }]}>
          {Glyph ? (
            <Glyph size={iconSize.lg} color={t.lampDeep} aria-hidden />
          ) : (
            <RNText style={[typeStyle(text.title, language, world), { color: t.lampDeep }]}>
              {item.title.charAt(0)}
            </RNText>
          )}
          {item.badge ? (
            <View
              style={[styles.dot, { backgroundColor: t.lamp, borderColor: t.ground }]}
              aria-hidden
            />
          ) : null}
        </View>
        <View style={styles.words}>
          <RNText numberOfLines={1} style={typeStyle(text.label, language, world)}>
            {item.title}
          </RNText>
          {item.badge ? (
            <RNText
              numberOfLines={1}
              style={[typeStyle(text.caption, language, world), { color: t.lampDeep }]}
            >
              {item.badge}
            </RNText>
          ) : null}
          {item.description ? (
            <RNText numberOfLines={2} style={typeStyle(text.caption, language, world)}>
              {item.description}
            </RNText>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * The rooms, tools and actions a place offers: search at the top, Recent
 * first, then each kind under its name, as quiet tiles that reflow from two
 * columns on a phone to more on a tablet. Search says how many it found.
 */
export function Launcher({
  label,
  items,
  onOpen,
  onKeep,
  recent,
  placeholder,
  labels,
  style,
}: LauncherProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...LAUNCHER_ENGLISH, ...labels };
  const [query, setQuery] = useState('');
  const sections = launcherSections(items, query, recent, l);
  const count = new Set(sections.flatMap((s) => s.items.map((i) => i.id))).size;
  const keep = (item: LauncherItem) =>
    onKeep
      ? () => {
          feedback('commit');
          onKeep(item.id);
          AccessibilityInfo.announceForAccessibility(l.kept(item.title));
        }
      : undefined;
  return (
    <View accessibilityLabel={label} style={[styles.launcher, style]}>
      <SearchField
        label={l.search}
        value={query}
        onChange={setQuery}
        placeholder={placeholder ?? l.search}
        resultCount={count}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sections}
      >
        {sections.length === 0 ? (
          <RNText style={[typeStyle(world.recipes.text.body, language, world), styles.empty]}>
            {l.empty}
          </RNText>
        ) : null}
        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            {section.title ? (
              <RNText role="heading" style={typeStyle(world.recipes.group.label, language, world)}>
                {section.title}
              </RNText>
            ) : null}
            <Grid min="sm" max={4} gap="inside">
              {section.items.map((item) => (
                <Tile
                  key={item.id}
                  item={item}
                  keepLabel={l.keep}
                  onOpen={() => onOpen(item.id)}
                  onKeep={keep(item)}
                />
              ))}
            </Grid>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  launcher: { gap: 12, flexShrink: 1 },
  sections: { gap: 20, paddingBottom: 8 },
  section: { gap: 8 },
  tile: { padding: 12, gap: 10, minHeight: 120 },
  well: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  words: { gap: 2 },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
