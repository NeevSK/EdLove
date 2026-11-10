/**
 * A page inside a room, under the room's own header: the world's floor shows as a band behind
 * it, the content sits on the world's surfaces in a readable column that centres on a tablet,
 * and the bottom clears the rooms bar. No page draws its own background; the world does.
 */

import { Badge, Stack, Text, useFloorPresence } from '@repo/ui/components/native';
import { shellLayoutOf } from '@repo/ui/theme';
import type { BadgeTone } from '@repo/ui/theme';
import type { ReactNode } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
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
  useFloorPresence('band');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const layout = shellLayoutOf(width);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingHorizontal: layout.gutter,
        paddingTop: 18,
        paddingBottom: insets.bottom + 120,
        gap: 22,
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
    </ScrollView>
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
