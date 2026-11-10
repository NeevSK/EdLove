/**
 * What the floating action offers in a room, from three sources, so it always has something real
 * to do (it used to stay hidden unless a screen registered itself):
 *
 * 1. Here: the screen's own actions, when the screen in front registered them (its primary first).
 * 2. Pinned: the features the person pinned for this room, opened in one tap.
 * 3. Always: a few common actions every room keeps (a breathing reset, asking for help).
 *
 * Nothing here is final: the sources are open, and each list is the person's or the screen's.
 */

import type { ComponentType } from 'react';
import type { FabAction, KitIconProps } from '@repo/ui/theme';

export type Room = 'workspace' | 'self' | 'library' | 'community' | 'profile';

export interface ScreenFab {
  primary?: { label: string; onPress: () => void; icon?: ComponentType<KitIconProps> };
  actions: readonly { label: string; onPress: () => void; icon?: ComponentType<KitIconProps> }[];
}

export interface PinnedFeature {
  id: string;
  title: string;
  icon?: ComponentType<KitIconProps>;
  open: () => void;
}

export interface CommonActions {
  breathe?: { label: string; icon?: ComponentType<KitIconProps>; onPress: () => void };
  ask?: { label: string; icon?: ComponentType<KitIconProps>; onPress: () => void };
  more?: { label: string; icon?: ComponentType<KitIconProps>; onPress: () => void };
}

export const ROOM_NAMES: Readonly<Record<Room, string>> = {
  workspace: 'Workspace',
  self: 'Self',
  library: 'Library',
  community: 'Community',
  profile: 'Profile',
};

export function roomActions({
  room,
  screen,
  pinned,
  common,
}: {
  room: Room;
  screen?: ScreenFab | null;
  pinned: readonly PinnedFeature[];
  common: CommonActions;
}): FabAction[] {
  const out: FabAction[] = [];
  const here = 'Here';
  if (screen?.primary)
    out.push({ key: 'screen-primary', group: here, tone: 'lamp', ...screen.primary });
  screen?.actions.forEach((a, i) => out.push({ key: `screen-${i}`, group: here, ...a }));
  const pinnedGroup = `Pinned in ${ROOM_NAMES[room]}`;
  for (const p of pinned)
    out.push({
      key: `pin-${p.id}`,
      group: pinnedGroup,
      label: p.title,
      icon: p.icon,
      onPress: p.open,
    });
  const always = 'Always here';
  if (common.breathe) out.push({ key: 'breathe', group: always, ...common.breathe });
  if (common.ask) out.push({ key: 'ask', group: always, ...common.ask });
  if (common.more) out.push({ key: 'more', group: always, ...common.more });
  return out;
}

/** The action the button itself names: the screen's primary, else the room's first action. */
export function fabLabelOf(room: Room, screen?: ScreenFab | null): string {
  return screen?.primary?.label ?? `${ROOM_NAMES[room]} actions`;
}
