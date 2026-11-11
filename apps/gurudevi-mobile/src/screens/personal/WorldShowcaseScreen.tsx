/**
 * The World Showcase, on the phone: every world worn by the real shell and the real kit, over the
 * real floor. Pick a world and the whole app changes for real (the stage, the header, the rooms
 * bar, the floating action, every control); pin a tier, an hour and a sky to see what a small
 * phone, a night or a monsoon looks like without waiting for one. Nothing here is a picture.
 *
 * Leaving puts the person's own world back, unless they chose "Keep this look"; the pins are
 * always cleared, so the stage returns to verger and the clock.
 */

import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import {
  ActionFab,
  Badge,
  Button,
  Chip,
  Chips,
  clearStagePreview,
  FabMenu,
  Group,
  Notice,
  Progress,
  Row,
  SegmentedControl,
  Slider,
  type StagePreview,
  setStagePreview,
  Surface,
  SwitchRow,
  Text,
  TextField,
  useFloorPresence,
  useStage,
  useStagePreview,
  WorldHeader,
  type WorldHeaderLayout,
  WorldTabBar,
  type WorldTabItem,
} from '@repo/ui/components/native';
import { useThemeContextOptional } from '@repo/ui/context';
import {
  BookOpen,
  Bell,
  CalendarDays,
  Camera,
  ChevronLeft,
  Heart,
  Library,
  Plus,
  School,
  Sparkles,
  Trash2,
  User,
  Users,
} from '@repo/ui/icons/native';
import {
  type KitIconProps,
  roomMarkOf,
  STAGE_TIERS,
  type StageTier,
  WORLD_IDS,
  type WorldId,
  worldName,
} from '@repo/ui/theme';
import { router } from 'expo-router';
import { type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SceneWeather = NonNullable<StagePreview['weather']>;
type BarLayout = 'floating' | 'docked' | 'rail';
type Posture = 'home' | 'inside';

const icon = (Glyph: unknown) => Glyph as ComponentType<KitIconProps>;

const ROOMS = [
  { key: 'self', label: 'Self', icon: icon(Heart) },
  { key: 'workspace', label: 'Classroom', icon: icon(School) },
  { key: 'community', label: 'Community', icon: icon(Users) },
  { key: 'library', label: 'Library', icon: icon(Library) },
  { key: 'profile', label: 'Profile', icon: icon(User) },
] as const;

const TIER_NAMES: Readonly<Record<StageTier, string>> = {
  rich: 'Rich',
  middle: 'Middle',
  floor: 'Small phone',
  bare: 'Still',
};

const SKIES: readonly { value: SceneWeather | 'live'; label: string }[] = [
  { value: 'live', label: 'Today' },
  { value: 'clear', label: 'Clear' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'drizzle', label: 'Drizzle' },
  { value: 'monsoon', label: 'Monsoon' },
  { value: 'storm', label: 'Storm' },
  { value: 'mist', label: 'Mist' },
];

const MARK_NAMES = {
  well: 'a well in its chip shape',
  underline: 'a lamp line',
  glow: 'a halo',
  frame: 'an ornament frame',
} as const;

function hourText(minute: number): string {
  const h = Math.floor(minute / 60) % 24;
  const m = minute % 60;
  const suffix = h < 12 ? 'am' : 'pm';
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:${m === 0 ? '00' : m} ${suffix}`;
}

function greetingAt(minute: number): string {
  const h = minute / 60;
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WorldShowcaseScreen() {
  useFloorPresence('full');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { worldId, setWorld } = useThemeContextOptional();
  const stage = useStage();
  const pins = useStagePreview();
  const user = useAuthStore((s) => s.user);
  const savedHeader = useActiveSubTabsStore((s) => s.preferences.headerLayout) ?? 'greeting';
  const updatePreferences = useActiveSubTabsStore((s) => s.updatePreferences);

  const [header, setHeader] = useState<WorldHeaderLayout>(savedHeader);
  const [posture, setPosture] = useState<Posture>('home');
  const [bar, setBar] = useState<BarLayout>(width >= 700 ? 'rail' : 'floating');
  const [room, setRoom] = useState<string>('self');
  const [menuOpen, setMenuOpen] = useState(false);
  const [signal, setSignal] = useState(true);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(0.4);

  // The person's own world comes back on leave unless they keep this one.
  const original = useRef<WorldId>(worldId);
  const kept = useRef(false);
  const setWorldRef = useRef(setWorld);
  setWorldRef.current = setWorld;
  useEffect(
    () => () => {
      clearStagePreview();
      if (!kept.current) void setWorldRef.current(original.current);
    },
    [],
  );

  const now = new Date();
  const minute = pins.minute ?? now.getHours() * 60 + now.getMinutes();
  const person = { name: user?.display_name || 'Friend', src: user?.avatar_url ?? undefined };
  const roomName = ROOMS.find((r) => r.key === room)?.label ?? 'Self';

  const items: WorldTabItem[] = useMemo(
    () =>
      ROOMS.map((r) => ({
        key: r.key,
        label: r.label,
        icon: r.icon,
        focused: r.key === room,
        signal: signal && r.key === 'community',
        onPress: () => setRoom(r.key),
      })),
    [room, signal],
  );

  const keep = () => {
    kept.current = true;
    updatePreferences({
      headerLayout: header,
      tabBarLayout: bar === 'rail' ? 'auto' : bar,
    });
    router.back();
  };

  const railed = bar === 'rail';
  const railWidth = railed ? 88 + insets.left : 0;
  const barSpace = railed ? insets.bottom + 24 : Math.max(insets.bottom, 8) + 96;

  return (
    <View style={styles.screen}>
      <View style={{ paddingLeft: railWidth }}>
        <WorldHeader
          layout={header}
          posture={posture}
          room={roomName}
          title={posture === 'inside' ? 'World Showcase' : undefined}
          greeting={`${greetingAt(minute)}, ${person.name.split(' ')[0]}`}
          person={person}
          onYou={() => router.back()}
          onBack={() => setPosture('home')}
          notifications={{
            count: signal ? 3 : 0,
            label: 'Notifications',
            onPress: () => setSignal((s) => !s),
            icon: icon(Bell),
          }}
          assistant={{ label: 'Tutii', icon: icon(Sparkles), onPress: () => setMenuOpen(true) }}
          icons={{ back: icon(ChevronLeft) }}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingLeft: railWidth + 18, paddingBottom: barSpace + 24 },
        ]}
      >
        <Group
          label="World"
          footer={`It marks the room you are in with ${MARK_NAMES[roomMarkOf(worldId)]}.`}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chips label="World" single>
              {WORLD_IDS.map((id) => (
                <Chip
                  key={id}
                  kind="radio"
                  label={worldName(id)}
                  selected={id === worldId}
                  onPress={() => void setWorld(id)}
                />
              ))}
            </Chips>
          </ScrollView>
        </Group>

        <Group
          label="Stage"
          footer={`Drawing at ${TIER_NAMES[stage.tier]}, ${stage.fps} frames a second. Your phone's limits always win.`}
        >
          <Chips label="Tier" single>
            <Chip
              kind="radio"
              label="This phone"
              selected={pins.cap === undefined}
              onPress={() => setStagePreview({ cap: undefined })}
            />
            {STAGE_TIERS.map((tier) => (
              <Chip
                key={tier}
                kind="radio"
                label={TIER_NAMES[tier]}
                selected={pins.cap === tier}
                onPress={() => setStagePreview({ cap: tier })}
              />
            ))}
          </Chips>
          <View style={styles.pad}>
            <Slider
              label="Hour"
              value={minute}
              min={0}
              max={1410}
              step={30}
              valueText={hourText}
              onChange={(m) => setStagePreview({ minute: m })}
            />
          </View>
          <Button
            label="Follow the clock"
            variant="quiet"
            size="sm"
            onPress={() => setStagePreview({ minute: undefined })}
          />
          <Chips label="Sky" single>
            {SKIES.map((sky) => (
              <Chip
                key={sky.value}
                kind="radio"
                label={sky.label}
                selected={(pins.weather ?? 'live') === sky.value}
                onPress={() =>
                  setStagePreview({ weather: sky.value === 'live' ? undefined : sky.value })
                }
              />
            ))}
          </Chips>
        </Group>

        <Group label="Shell">
          <View style={styles.pad}>
            <SegmentedControl
              label="Header"
              value={header}
              onChange={setHeader}
              options={[
                { value: 'greeting', label: 'Greeting' },
                { value: 'compact', label: 'Compact' },
                { value: 'classic', label: 'Classic' },
              ]}
            />
            <SegmentedControl
              label="Screen"
              value={posture}
              onChange={setPosture}
              options={[
                { value: 'home', label: 'Room home' },
                { value: 'inside', label: 'Inside' },
              ]}
            />
            <SegmentedControl
              label="Rooms bar"
              value={bar}
              onChange={setBar}
              options={[
                { value: 'floating', label: 'Floating' },
                { value: 'docked', label: 'Docked' },
                { value: 'rail', label: 'Rail' },
              ]}
            />
          </View>
          <SwitchRow
            label="Something waits"
            hint="The quiet signal on a room, the bell and the action"
            value={signal}
            onChange={setSignal}
          />
        </Group>

        <Surface tone="raised" style={styles.card}>
          <View style={styles.line}>
            <Text kind="title" style={{ flexShrink: 1 }}>
              {worldName(worldId)}
            </Text>
            <Badge label="Live" tone="lamp" />
          </View>
          <Text kind="body">
            Every control below is the real one, in this world's shapes, light and motion.
          </Text>
          <View style={styles.buttons}>
            <Button
              label="Primary"
              variant="primary"
              onPress={() => setProgress((p) => (p >= 1 ? 0 : p + 0.2))}
            />
            <Button label="Secondary" variant="secondary" onPress={() => setMenuOpen(true)} />
            <Button label="Quiet" variant="quiet" onPress={() => undefined} />
            <Button label="Delete" variant="danger" icon={icon(Trash2)} onPress={() => undefined} />
          </View>
          <Progress value={progress} label="Lesson progress" />
          <TextField
            label="Your name"
            hint="Fields wear the world too"
            value={name}
            onChangeText={setName}
          />
        </Surface>

        <Group label="Rows and marks">
          <Row label="Today's lesson" detail="Mathematics" onPress={() => undefined} />
          <Row label="Reading" detail="Size and spacing" onPress={() => router.push('/reading')} />
          <View style={[styles.line, styles.pad]}>
            <Badge label="Neutral" />
            <Badge label="Lamp" tone="lamp" />
            <Badge label="Done" tone="success" />
            <Badge label="Late" tone="danger" />
          </View>
        </Group>

        <Notice
          tone="lamp"
          title="A notice"
          message="Notices, toasts and empty pages follow the world as well."
        />

        <View style={styles.buttons}>
          <Button label="Keep this look" variant="primary" onPress={keep} />
          <Button label="Leave as it was" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={railed ? [styles.railDock, { width: railWidth }] : styles.barDock}
      >
        <WorldTabBar items={items} layout={bar} insets={insets} label="Rooms" />
      </View>
      <ActionFab
        label="Room actions"
        icon={icon(Plus)}
        signal={signal}
        signalLabel="something waits"
        onPress={() => setMenuOpen(true)}
        style={[styles.fab, { right: 18 + insets.right, bottom: barSpace }]}
      />
      <FabMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        label={`${roomName} actions`}
        actions={[
          {
            key: 'lesson',
            label: 'Start a lesson',
            tone: 'lamp',
            icon: icon(BookOpen),
            onPress: () => undefined,
          },
          {
            key: 'event',
            label: 'Plan an event',
            icon: icon(CalendarDays),
            onPress: () => undefined,
          },
          { key: 'photo', label: 'Share a photo', icon: icon(Camera), onPress: () => undefined },
          {
            key: 'ask',
            label: 'Ask Tutii',
            group: 'AI companion',
            icon: icon(Sparkles),
            onPress: () => undefined,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { paddingRight: 18, paddingTop: 12, gap: 22, maxWidth: 720, width: '100%' },
  pad: { gap: 14, paddingVertical: 8 },
  card: { padding: 18, gap: 14 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  barDock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  railDock: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  fab: { position: 'absolute' },
});
