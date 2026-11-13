/**
 * The room's floating action: the world's lit control, bottom right, above the rooms bar (or the
 * bottom edge when the rooms sit in a rail). It shows on every room's front screen, and deeper
 * in only when the screen in front gave it something to do. Press opens the room's actions.
 * Reading down, typing, or its own sheet being open tucks it away; it comes back the world's way.
 */

import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { ActionFab, FabMenu } from '@repo/ui/components/native';
import { fabBelongsTo } from '@repo/ui/components/LotusPetalFAB';
import { useFAB } from '@repo/ui/context/FABContext';
import { Plus } from '@repo/ui/icons/native';
import type { KitIconProps } from '@repo/ui/theme';
import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
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
import { buildHref } from '@repo/core/routing/internalHref';
import { useNavigator } from '@/navigation/navigator';

export interface RoomFabProps {
  room: Room;
  pathname: string;
  /** A room's front screen: the action always shows there. */
  atHome: boolean;
  /** Space below it: the rooms bar's height, or the safe area with a rail. */
  bottom: number;
  /** Distance from the edge it sits on. */
  right: number;
  /** The edge: the person's hand (left-handed people get it on the left). */
  side?: 'left' | 'right';
  common: CommonActions;
  hidden?: boolean;
  /** The room as the person sees it named (the work room follows their role). */
  roomName?: string;
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

export function RoomFab({
  room,
  pathname,
  atHome,
  bottom,
  right,
  side = 'right',
  common,
  hidden,
  roomName,
}: RoomFabProps) {
  const router = useNavigator();
  const { state } = useFAB();
  const [open, setOpen] = useState(false);
  const pinnedIds = useActiveSubTabsStore((s) => s.pinnedFeatureIdsByDomain[room]);

  // The screen's own actions count only when the screen in front registered them.
  const tab = getCurrentFabTab(pathname);
  const screen: ScreenFab | null = useMemo(() => {
    if (!state.visible || !tab || !fabBelongsTo(tab, state.tabType)) return null;
    return {
      primary: state.onPress
        ? {
            label: state.primaryActionLabel ?? 'New',
            onPress: state.onPress,
            icon: Plus,
          }
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
          router.follow(buildHref(item.route, item.params), 'room-fab'),
      }));
  }, [pinnedIds, room, router]);

  const actions = useMemo(
    () => roomActions({ room, screen, pinned, common, roomName }),
    [room, screen, pinned, common, roomName],
  );

  // Typing tucks the action away too, so it never sits on the keyboard's edge.
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setTyping(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setTyping(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if ((!atHome && !screen) || actions.length === 0) return null;
  const label = fabLabelOf(room, screen, roomName);

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.layer]}>
      <ActionFab
        label={label}
        icon={Plus}
        onPress={() => setOpen(true)}
        signal={state.hasActiveGaps && Boolean(screen)}
        signalLabel="something needs you"
        hidden={hidden || typing || open}
        style={
          side === 'left'
            ? { position: 'absolute', left: right, bottom }
            : { position: 'absolute', right, bottom }
        }
      />
      <FabMenu open={open} onClose={() => setOpen(false)} label={label} actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({ layer: { zIndex: 20 } });
