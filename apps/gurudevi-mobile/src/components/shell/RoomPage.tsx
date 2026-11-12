/**
 * A page inside a room, under the room's own header: the world's floor shows as a band behind
 * it, the content sits on the world's surfaces in a readable column that centres on a tablet,
 * and the bottom clears the rooms bar. No page draws its own background; the world does.
 */

import {
  Badge,
  Stack,
  Text,
  useScreenGround,
  useRoomScroll,
  useKeypadSpace,
  useShellLayout,
} from '@repo/ui/components/native';
import type { BadgeTone } from '@repo/ui/theme';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RoomPage({
  title,
  intro,
  mark,
  children,
}: {
  title: string;
  intro?: string;
  /** A short status beside the title. */
  mark?: { label: string; tone?: BadgeTone };
  children: ReactNode;
}) {
  useScreenGround('screen');
  const scroll = useRoomScroll();
  const insets = useSafeAreaInsets();
  // Width, height and the cutouts on both sides: the column holds its reading width either way up.
  const layout = useShellLayout();
  // The focused field scrolls clear of the keyboard and its typing bar, or of our keypad.
  const pad = useKeypadSpace();
  return (
    <KeyboardAwareScrollView
      bottomOffset={64}
      {...scroll}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingLeft: layout.gutter + layout.edges.left + pad.left,
        paddingRight: layout.gutter + layout.edges.right + pad.right,
        paddingTop: layout.rhythm.top,
        paddingBottom: insets.bottom + (layout.tabs === 'rail' ? 96 : 120) + pad.bottom,
        gap: layout.rhythm.gap,
        width: '100%',
        maxWidth: layout.readable,
        alignSelf: 'center',
      }}
    >
      <Stack gap="inside">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Text kind="title" style={{ flexShrink: 1 }}>
            {title}
          </Text>
          {mark ? <Badge label={mark.label} tone={mark.tone ?? 'neutral'} /> : null}
        </View>
        {intro ? (
          <Text kind="body" tone="soft">
            {intro}
          </Text>
        ) : null}
      </Stack>
      {children}
    </KeyboardAwareScrollView>
  );
}

/** A titled line with a status mark at its end, for cards on a room page. */
export function MarkedLine({
  title,
  detail,
  mark,
}: {
  title: string;
  detail?: string;
  mark?: { label: string; tone?: BadgeTone };
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text kind="label">{title}</Text>
        {detail ? (
          <Text kind="caption" tone="soft">
            {detail}
          </Text>
        ) : null}
      </View>
      {mark ? <Badge label={mark.label} tone={mark.tone ?? 'neutral'} /> : null}
    </View>
  );
}
