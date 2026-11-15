/**
 * "You": the person's own sheet, opened from their photo in the header. Everything about the
 * person and how the app wears for them lives here, so the header keeps only what a room needs:
 *
 * - who you are and which perspective you are in (switchable);
 * - your world, how much life the floor shows (handed to verger), reading;
 * - the shell's shape: header layout, tab bar, and who answers help (Tutii or AI);
 * - Tutii's guide, help and support, and every other setting.
 */

import { SwitchRow } from './SwitchRow';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ChoiceOption } from '../../../theme/contracts';
import { Group } from '../Group/Group';
import { Row } from '../Row/Row';
import { ChoiceRow, LinkRow } from '../Settings/SettingsRows';
import { Sheet } from '../Sheet/Sheet';
import { Avatar } from '../Status/Status';
import { Text } from '../Text/Text';

export type HeaderLayoutChoice = 'greeting' | 'compact' | 'classic';
export type TabBarLayoutChoice = 'auto' | 'docked' | 'floating';
export type AssistantChoice = 'tutii' | 'ai';
export type VisualDetailChoice = 'auto' | 'low' | 'high';

export interface YouSheetProps {
  open: boolean;
  onClose: () => void;
  person: { name: string; src?: string; detail?: string };
  perspective?: { label: string; onPress: () => void };
  world: { name: string; onPress: () => void };
  visualDetail: { value: VisualDetailChoice; onChange: (v: VisualDetailChoice) => void };
  reading?: { detail?: string; onPress: () => void };
  /** One tap for outdoors: strongest inks on a plain light ground. */
  sunlight?: { value: boolean; onChange: (v: boolean) => void };
  companions?: { detail?: string; onPress: () => void };
  /** Every world, tier and hour on this phone, with the real shell: the World Showcase. */
  showcase?: { onPress: () => void };
  shell: {
    headerLayout: HeaderLayoutChoice;
    onHeaderLayout: (v: HeaderLayoutChoice) => void;
    tabBarLayout: TabBarLayoutChoice;
    onTabBarLayout: (v: TabBarLayoutChoice) => void;
    /** On a tablet the rail is always used; the choice then applies to phones only. */
    tabBarNote?: string;
    assistant: AssistantChoice;
    onAssistant: (v: AssistantChoice) => void;
  };
  onProfile: () => void;
  onGuide: () => void;
  onHelp: () => void;
  onSettings: () => void;
}

const HEADER_LAYOUTS: readonly ChoiceOption<HeaderLayoutChoice>[] = [
  { value: 'greeting', label: 'Greeting', hint: 'Your photo, a greeting and the room, large' },
  { value: 'compact', label: 'Compact', hint: 'One quiet line; more of your world shows' },
  { value: 'classic', label: 'Classic', hint: 'The room on the left, every control on the right' },
];

const TAB_LAYOUTS: readonly ChoiceOption<TabBarLayoutChoice>[] = [
  { value: 'auto', label: 'Fit my screen', hint: 'Docked on small phones, floating on others' },
  { value: 'floating', label: 'Floating', hint: 'Lifted off the edge; your world shows around it' },
  { value: 'docked', label: 'Docked', hint: 'Along the bottom edge' },
];

const ASSISTANTS: readonly ChoiceOption<AssistantChoice>[] = [
  { value: 'tutii', label: 'Tutii', hint: 'Tutii answers, guides and helps' },
  { value: 'ai', label: 'AI button', hint: 'A plain button for the assistant' },
];

const DETAIL: readonly ChoiceOption<VisualDetailChoice>[] = [
  { value: 'auto', label: 'Fit my phone', hint: 'Your world as alive as this phone allows' },
  { value: 'high', label: 'Rich', hint: 'All the life your phone can give, using more battery' },
  { value: 'low', label: 'Light', hint: 'A still world with gentle movement; saves battery' },
];

export function YouSheet({
  open,
  onClose,
  person,
  perspective,
  world,
  visualDetail,
  reading,
  sunlight,
  companions,
  showcase,
  shell,
  onProfile,
  onGuide,
  onHelp,
  onSettings,
}: YouSheetProps) {
  // Going somewhere closes the sheet first, so focus and the back gesture land on the new screen.
  const go = (fn: () => void) => () => {
    onClose();
    fn();
  };
  return (
    <Sheet open={open} onClose={onClose} title="You">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.who}>
          <Avatar name={person.name} src={person.src} size="lg" />
          <View style={styles.whoText}>
            <Text kind="title" numberOfLines={1}>
              {person.name}
            </Text>
            {person.detail ? (
              <Text kind="caption" numberOfLines={1}>
                {person.detail}
              </Text>
            ) : null}
          </View>
        </View>

        <Group label="You">
          <Row label="Your profile" onPress={go(onProfile)} />
          {perspective ? (
            <Row label="Perspective" detail={perspective.label} onPress={go(perspective.onPress)} />
          ) : null}
        </Group>

        <Group label="Your world">
          <LinkRow label="World" detail={world.name} onPress={go(world.onPress)} />
          <ChoiceRow
            label="Life on screen"
            value={visualDetail.value}
            options={DETAIL}
            onChange={visualDetail.onChange}
            note="Your phone's own limits are always kept"
          />
          {sunlight ? (
            <SwitchRow
              label="Bright sunlight"
              hint="Strongest words on a plain light ground, for outdoors"
              value={sunlight.value}
              onChange={sunlight.onChange}
            />
          ) : null}
          {reading ? (
            <LinkRow label="Reading and comfort" detail={reading.detail} onPress={go(reading.onPress)} />
          ) : null}
          {companions ? (
            <LinkRow
              label="Companions"
              detail={companions.detail}
              onPress={go(companions.onPress)}
            />
          ) : null}
          {showcase ? (
            <LinkRow
              label="See every world"
              detail="Try each one here, at any hour"
              onPress={go(showcase.onPress)}
            />
          ) : null}
        </Group>

        <Group label="Shape of the app">
          <ChoiceRow
            label="Header"
            value={shell.headerLayout}
            options={HEADER_LAYOUTS}
            onChange={shell.onHeaderLayout}
          />
          <ChoiceRow
            label="Rooms bar"
            value={shell.tabBarLayout}
            options={TAB_LAYOUTS}
            onChange={shell.onTabBarLayout}
            note={shell.tabBarNote}
          />
          <ChoiceRow
            label="Help button"
            value={shell.assistant}
            options={ASSISTANTS}
            onChange={shell.onAssistant}
          />
        </Group>

        <Group label="Help">
          <LinkRow
            label="Tutii's guide"
            note="A short walk through this room"
            onPress={go(onGuide)}
          />
          <LinkRow label="Help and support" onPress={go(onHelp)} />
          <LinkRow label="All settings" onPress={go(onSettings)} />
        </Group>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flexShrink: 1 },
  body: { gap: 18, paddingBottom: 12 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  whoText: { flex: 1, minWidth: 0, gap: 2 },
});
