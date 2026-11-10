/**
 * The room's floating action: the world's lit control, bottom right, above the rooms bar (or the
 * bottom edge when the rooms sit in a rail). It shows on every room's front screen, and deeper
 * in only when the screen in front gave it something to do. Press opens the room's actions.
 */

import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { ActionFab, FabMenu } from '@repo/ui/components/native';
import { fabBelongsTo } from '@repo/ui/components/LotusPetalFAB';
import { useFAB } from '@repo/ui/context/FABContext';
import { Plus } from '@repo/ui/icons/native';
import type { KitIconProps } from '@repo/ui/theme';
import { useRouter } from 'expo-router';
import { type ComponentType, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getCurrentFabTab } from '@/lib/navigation/fabTab';
import { getDomainFeatureRegistry } from '@/navigation/registries';
import {
  type CommonActions,
  fabLabelOf,
  type PinnedFeature,
  type Room,
  roomActions,
  type ScreenFab,
} from './roomActions';

export interface RoomFabProps {
  room: Room;
  pathname: string;
  /** A room's front screen: the action always shows there. */
  atHome: boolean;
  /** Space below it: the rooms bar's height, or the safe area with a rail. */
  bottom: number;
  right: number;
  common: CommonActions;
  hidden?: boolean;
}

/** Screen icons draw with a stroke width; the menu draws kit icons at its own size and tone. */
function kitIcon(
  Glyph?: ComponentType<{ size: number; color: string; strokeWidth: number }>,
): ComponentType<KitIconProps> | undefined {
  if (!Glyph) return undefined;
  return function Icon({ size = 20, color = 'currentColor' }: KitIconProps) {
    return <Glyph size={size} color={color} strokeWidth={2} />;
  };
}

export function RoomFab({ room, pathname, atHome, bottom, right, common, hidden }: RoomFabProps) {
  const router = useRouter();
  const { state } = useFAB();
  const [open, setOpen] = useState(false);
  const pinnedIds = useActiveSubTabsStore((s) => s.pinnedFeatureIdsByDomain[room]);

  // The screen's own actions count only when the screen in front registered them.
  const tab = getCurrentFabTab(pathname);
  const screen: ScreenFab | null = useMemo(() => {
    if (!state.visible || !tab || !fabBelongsTo(tab, state.tabType)) return null;
    return {
      primary: state.onPress
        ? { label: state.primaryActionLabel ?? 'New', onPress: state.onPress, icon: Plus }
        : undefined,
      actions: state.actions.map((a) => ({
        label: a.label,
        onPress: a.onPress,
        icon: kitIcon(a.icon),
      })),
    };
  }, [state, tab]);

  const pinned: PinnedFeature[] = useMemo(() => {
    if (room !== 'self' && room !== 'workspace') return [];
    const ids = new Set(pinnedIds ?? []);
    return getDomainFeatureRegistry(room)
      .items.filter((item) => ids.has(item.id))
      .map((item) => ({
        id: item.id,
        title: item.title,
        icon: item.icon as ComponentType<KitIconProps> | undefined,
        open: () =>
          router.push({ pathname: item.route, params: item.params } as Parameters<
            typeof router.push
          >[0]),
      }));
  }, [pinnedIds, room, router]);

  const actions = useMemo(
    () => roomActions({ room, screen, pinned, common }),
    [room, screen, pinned, common],
  );

  if (hidden || (!atHome && !screen) || actions.length === 0) return null;
  const label = fabLabelOf(room, screen);

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.layer]}>
      <ActionFab
        label={label}
        icon={Plus}
        onPress={() => setOpen(true)}
        signal={state.hasActiveGaps && Boolean(screen)}
        signalLabel="something needs you"
        style={{ position: 'absolute', right, bottom }}
      />
      <FabMenu open={open} onClose={() => setOpen(false)} label={label} actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({ layer: { zIndex: 20 } });
