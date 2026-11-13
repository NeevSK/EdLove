import {
  sampleGuardianDesk,
  samplePrincipalDesk,
  sampleStudentDesk,
  sampleTeacherDesk,
} from '@repo/classroom/deskPort';
import {
  type DetailTier,
  type FloorSpace,
  layoutFloor,
  lintFloor,
  ROOM_PLANS,
  roomFloorInput,
} from '@repo/core/logic/floor';
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
import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { type WorkDesk, workPiece } from '@/components/workspace/pieces';

const SAMPLE_DESKS: Record<string, WorkDesk> = {
  teacher: { capacity: 'teacher', desk: sampleTeacherDesk() },
  student: { capacity: 'student', desk: sampleStudentDesk() },
  guardian: { capacity: 'guardian', desk: sampleGuardianDesk() },
  principal: { capacity: 'principal', desk: samplePrincipalDesk() },
};

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

const PLANS = {
  teacher: 'Classroom',
  student: 'Learning',
  guardian: 'Family',
  principal: 'School',
} as const;
type PlanId = keyof typeof PLANS;

/**
 * Try the floor engine on a phone: each role's work room at each test screen
 * and detail tier, drawn with the kit, with the inspector's reasons beside it.
 * Nothing here touches the real work room.
 */
export function FloorLab() {
  const here = useWindowDimensions();
  const [plan, setPlan] = useState<PlanId>('teacher');
  const { t, i18n } = useTranslation();
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
          plan: ROOM_PLANS[`workspace:${plan}`]!,
          fitOf: (kit) =>
            floorFitOf(kit as KitPiece, Platform.OS === 'android' ? 'android' : 'ios'),
          space,
          controls: { detail, motion: 'full' },
        }),
      ),
    [plan, space, detail],
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
              label="Role"
              value={plan}
              onChange={setPlan}
              options={(Object.keys(PLANS) as PlanId[]).map((v) => ({ value: v, label: PLANS[v] }))}
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
                renderPiece={(p) =>
                  (SAMPLE_DESKS[plan]
                    ? workPiece(p.id, p.label, SAMPLE_DESKS[plan]!, {
                        t,
                        locale: i18n.language || 'en',
                        canOpen: () => false,
                      })
                    : null) ?? (
                    <View style={{ minHeight: p.footprint.h * 0.6 }}>
                      <Card
                        title={p.label}
                        meta={p.why[0] ?? `${Math.round(p.footprint.h)} tall`}
                      />
                    </View>
                  )
                }
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
