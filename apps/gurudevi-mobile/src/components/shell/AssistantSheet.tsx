/**
 * Where Tutii lives: the help button in the header opens this home. Tutii (or the plain AI button,
 * while the two are compared) offers three things, always in the same order:
 *
 * - Ask: the assistant, for anything.
 * - Guide: a short walk through the room you are in.
 * - Help and support: the help pages and a person to write to.
 */

import { GURUDEVI_SUPPORT_EMAIL } from '@repo/core/config/publicUrls';
import { Group, LinkRow, Row, Sheet, Text } from '@repo/ui/components/native';
import { Mascot } from '@repo/ui/components/Mascot';
import { useWorld } from '@repo/ui/theme/native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { fireflyPrototypeArtwork } from '@/brand/mascotArtwork';
import { ROOM_NAMES, type Room } from './roomActions';

const GUIDES: Readonly<Record<Room, readonly string[]>> = {
  self: [
    'Self is yours alone: your rhythm, moods, journal and goals.',
    'Hold the Self tab to see everything Self can do.',
    'The round button at the bottom right keeps your pinned things one tap away.',
  ],
  workspace: [
    '{room} is where your daily school work happens.',
    'Your perspective, under the header, says whose work you are seeing. Tap it to switch.',
    'Hold the {room} tab for every tool; pin the ones you use daily.',
  ],
  library: [
    'Library keeps lessons, books and the things you save.',
    'Search from the top; what you open most comes first.',
  ],
  community: [
    'Community is your school and the people in it.',
    'Notifications, at the top right, gather everything that needs you.',
  ],
  profile: [
    'Profile is how others see you.',
    'Your photo, top left, opens You: your world, reading, and how the app is shaped.',
  ],
};

export interface AssistantSheetProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  mode: 'tutii' | 'ai';
  onAsk: () => void;
  /** Starts on the guide (from the You sheet's "Tutii's guide"). */
  startOnGuide?: boolean;
  /** The room as the person sees it named (the work room follows their role). */
  roomName?: string;
}

export function AssistantSheet({
  open,
  onClose,
  room,
  mode,
  onAsk,
  startOnGuide,
  roomName = ROOM_NAMES[room],
}: AssistantSheetProps) {
  const t = useWorld().tokens;
  const [guide, setGuide] = useState(false);
  const showGuide = guide || Boolean(startOnGuide);
  const name = mode === 'tutii' ? 'Tutii' : 'Assistant';
  const close = () => {
    setGuide(false);
    onClose();
  };
  return (
    <Sheet open={open} onClose={close} title={showGuide ? `${roomName}, in a minute` : name}>
      {showGuide ? (
        <View style={styles.guide}>
          {GUIDES[room].map((template, i) => {
            const line = template.replaceAll('{room}', roomName);
            return (
              <View key={line} style={styles.step}>
                <Text kind="label" style={{ color: t.lampDeep }}>
                  {String(i + 1)}
                </Text>
                <Text kind="body" style={styles.stepText}>
                  {line}
                </Text>
              </View>
            );
          })}
          <Row label="Back to Tutii" onPress={() => setGuide(false)} />
        </View>
      ) : (
        <View style={styles.body}>
          {mode === 'tutii' ? (
            <View
              style={styles.home}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Mascot
                artwork={fireflyPrototypeArtwork}
                mode="glowing"
                glowColor={t.lamp}
                podVariant="halo"
                size={96}
                state="guiding"
              />
              <Text kind="body" tone="soft" style={styles.hello}>
                I am here whenever you need me.
              </Text>
            </View>
          ) : null}
          <Group>
            <Row
              label={mode === 'tutii' ? 'Ask Tutii' : 'Ask the assistant'}
              note="Anything about your work, your class or the app"
              onPress={() => {
                close();
                onAsk();
              }}
            />
            <Row label={`Guide me through ${roomName}`} onPress={() => setGuide(true)} />
          </Group>
          <Group label="Help and support">
            <LinkRow label="Help pages" href="https://gurudevi.app/help" external />
            <LinkRow
              label="Write to us"
              detail={GURUDEVI_SUPPORT_EMAIL}
              href={`mailto:${GURUDEVI_SUPPORT_EMAIL}`}
              external
            />
          </Group>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  home: { alignItems: 'center', gap: 6 },
  hello: { textAlign: 'center' },
  guide: { gap: 14 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepText: { flex: 1 },
});
