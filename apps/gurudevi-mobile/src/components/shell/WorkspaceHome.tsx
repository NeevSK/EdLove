/**
 * The Workspace room's front screen, calm: the world's floor in full, one line on whose work this
 * is, and the places the workspace has, as cards in the world's shape. Open work stays in the task
 * strip under the header. Places still on sample data say so, so nobody mistakes them for records.
 */

import {
  Card,
  Grid,
  Notice,
  Surface,
  Text,
  useFloorPresence,
  useRoomScroll,
  useShellLayout,
} from '@repo/ui/components/native';
import {
  Banknote,
  Briefcase,
  CalendarDays,
  Heart,
  Map as MapIcon,
  Package,
  Wifi,
} from '@repo/ui/icons/native';
import type { KitIconProps } from '@repo/ui/theme';
import { WorldEnter } from '@repo/ui/theme/native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const kit = (Glyph: unknown) => Glyph as ComponentType<KitIconProps>;

const PLACES = [
  {
    href: '/workspace/events',
    title: 'Programs',
    meta: 'Meals, trips and schedules',
    icon: kit(CalendarDays),
  },
  {
    href: '/workspace/welfare',
    title: 'Welfare',
    meta: 'Waivers and sibling concessions',
    icon: kit(Heart),
  },
  {
    href: '/workspace/inventory',
    title: 'Materials',
    meta: 'Equipment and stock',
    icon: kit(Package),
  },
  {
    href: '/workspace/peers',
    title: 'Nearby',
    meta: 'Share without the internet',
    icon: kit(Wifi),
  },
  {
    href: '/workspace/atlas',
    title: 'School Atlas',
    meta: 'Places in the school',
    icon: kit(MapIcon),
  },
  {
    href: '/workspace/workforce-role',
    title: 'Roles',
    meta: 'Who does what',
    icon: kit(Briefcase),
  },
  { href: '/workspace/demo-fee', title: 'Fees', meta: 'A demo payment', icon: kit(Banknote) },
] as const;

export function WorkspaceHome({ perspective, note }: { perspective?: string; note?: string }) {
  useFloorPresence('full');
  const scroll = useRoomScroll();
  const insets = useSafeAreaInsets();
  const layout = useShellLayout();
  return (
    <ScrollView
      {...scroll}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingLeft: layout.gutter + layout.edges.left,
        paddingRight: layout.gutter + layout.edges.right,
        paddingTop: layout.stance === 'hud' ? layout.rhythm.top : 8,
        paddingBottom: insets.bottom + (layout.tabs === 'rail' ? 96 : 140),
        gap: layout.rhythm.gap,
        width: '100%',
        maxWidth: layout.readable,
        alignSelf: 'center',
      }}
    >
      <WorldEnter index={0}>
        <Surface tone="raised" style={{ padding: 20, gap: 8 }}>
          <Text kind="title">Your workspace</Text>
          <Text kind="body" tone="soft">
            {perspective
              ? `Working as ${perspective}. Open work waits in the strip above.`
              : 'Open work waits in the strip above.'}
          </Text>
        </Surface>
      </WorldEnter>
      <WorldEnter index={1}>
        <Notice
          tone="neutral"
          title="Sample data for now"
          message={
            note ??
            "These places show sample records until your school's own data is connected. Nothing here changes your account."
          }
        />
      </WorldEnter>
      <WorldEnter index={2}>
        <Grid min="sm">
          {PLACES.map((place) => (
            <View key={place.href}>
              <Card
                title={place.title}
                meta={place.meta}
                icon={place.icon}
                shape="tile"
                size="sm"
                onPress={() => router.push(place.href as never)}
              />
            </View>
          ))}
        </Grid>
      </WorldEnter>
    </ScrollView>
  );
}
