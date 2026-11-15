import {
  type DetailTier,
  type FloorSpace,
  layoutFloor,
  lintFloor,
  roomCatalogOf,
  roomFloorInput,
} from '@repo/core/logic/floor';
import type { TabDomain } from '@repo/core/logic/registry/domainEntry';
import {
  Card,
  Chip,
  Chips,
  FloorInspector,
  FloorView,
  SegmentedControl,
  Stack,
  Text,
} from '@repo/ui/components/native';
import { floorFitOf, type KitPiece } from '@repo/ui/theme';
import { WorldScope } from '@repo/ui/theme/native';
import { useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { APP_CATALOG } from '@/boot/registerAppCatalog';

const CHROME: FloorSpace['chrome'] = [
  { id: 'status', height: 24, giveWayRank: 0, essential: true },
  { id: 'header', height: 56, giveWayRank: 2 },
  { id: 'stripe', height: 32, giveWayRank: 4 },
  { id: 'rooms', height: 64, giveWayRank: 3 },
];

const SCREENS = {
  here: 'This screen',
  a24: 'A24 phone',
  large: 'Large text',
  landscape: 'Phone landscape',
  tablet: 'Tablet',
} as const;
type ScreenId = keyof typeof SCREENS;

const ROLES = {
  teacher: 'Teacher',
  student: 'Student',
  guardian: 'Guardian',
  principal: 'Principal',
} as const;
type RoleId = keyof typeof ROLES;

const ROOMS: Record<string, TabDomain> = {
  Self: 'self',
  Work: 'workspace',
  Community: 'community',
  Library: 'library',
};

/**
 * Try the floor engine on a phone: each room's catalog as each role sees it,
 * at each test screen and detail tier, drawn with the kit, with the
 * inspector's reasons beside it. Nothing here touches the real rooms.
 */
export function FloorLab() {
  const here = useWindowDimensions();
  const [role, setRole] = useState<RoleId>('teacher');
  const [room, setRoom] = useState<TabDomain>('workspace');
  const [screen, setScreen] = useState<ScreenId>('here');
  const [detail, setDetail] = useState<DetailTier>('rich');
  const [view, setView] = useState<'floor' | 'why'>('floor');

  const space: FloorSpace = useMemo(() => {
    const sizes: Record<ScreenId, Omit<FloorSpace, 'chrome'>> = {
      here: { width: here.width, height: here.height, fontScale: here.fontScale },
      a24: { width: 360, height: 780, fontScale: 1 },
      large: { width: 320, height: 640, fontScale: 1.3 },
      landscape: { width: 780, height: 360, fontScale: 1 },
      tablet: { width: 1280, height: 800, fontScale: 1 },
    };
    return { ...sizes[screen], chrome: CHROME };
  }, [screen, here.width, here.height, here.fontScale]);

  const tree = useMemo(
    () =>
      layoutFloor(
        roomFloorInput({
          catalog: roomCatalogOf(APP_CATALOG, room, role, 'mobile'),
          fitOf: (shape) =>
            floorFitOf(shape as KitPiece, Platform.OS === 'android' ? 'android' : 'ios'),
          space,
          controls: { detail, motion: 'full' },
        }),
      ),
    [room, role, space, detail],
  );
  const findings = useMemo(() => lintFloor(tree, space), [tree, space]);
  const frame = screen === 'here' ? null : { width: space.width, height: space.height * 0.8 };

  return (
    <WorldScope world="sanctuary" phase="morning" mode="light">
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.controls}>
          <Stack gap="between">
            <Text kind="title">Floor lab</Text>
            <SegmentedControl
              label="Room"
              value={room}
              onChange={setRoom}
              options={Object.entries(ROOMS).map(([label, value]) => ({ value, label }))}
            />
            <SegmentedControl
              label="Role"
              value={role}
              onChange={setRole}
              options={(Object.keys(ROLES) as RoleId[]).map((v) => ({ value: v, label: ROLES[v] }))}
            />
            <Chips label="Screen" single>
              {(Object.keys(SCREENS) as ScreenId[]).map((v) => (
                <Chip
                  key={v}
                  kind="radio"
                  label={SCREENS[v]}
                  selected={screen === v}
                  onPress={() => setScreen(v)}
                />
              ))}
            </Chips>
            <SegmentedControl
              label="Detail"
              value={detail}
              onChange={setDetail}
              options={[
                { value: 'rich', label: 'Rich' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'essential', label: 'Essential' },
              ]}
            />
            <SegmentedControl
              label="Show"
              value={view}
              onChange={setView}
              options={[
                { value: 'floor', label: 'Floor' },
                { value: 'why', label: `Why${findings.length ? ` (${findings.length})` : ''}` },
              ]}
            />
          </Stack>
          <View style={[styles.frame, frame]}>
            {view === 'floor' ? (
              <FloorView
                tree={tree}
                renderPiece={(p) => (
                  <View style={{ minHeight: p.footprint.h * 0.6 }}>
                    <Card title={p.label} meta={p.why[0] ?? `${Math.round(p.footprint.h)} tall`} />
                  </View>
                )}
              />
            ) : (
              <FloorInspector tree={tree} findings={findings} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </WorldScope>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  controls: { padding: 16, gap: 16 },
  frame: { alignSelf: 'flex-start', maxWidth: '100%', overflow: 'hidden', minHeight: 400 },
});
