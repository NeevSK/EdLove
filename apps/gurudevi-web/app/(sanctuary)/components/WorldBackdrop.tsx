'use client';

import {
  type GroundStage,
  groundAllowanceOf,
  NOTHING_ALLOWED,
  planGround,
} from '@repo/core/logic/workspace/groundPlan';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { getBackdropsForWorld, groundDefaultsFor } from '../../../lib/canvas/appearanceConstants';
import { useWorldLook, worldLookStore } from '../../../lib/canvas/worldLookStore';
import { useGurudeviView } from '../../../lib/runtime/useGurudeviView';
import { useWorldTheme } from '../../../lib/theme/useWorldTheme';
import { GroundLayers, sceneRoomOf } from './GroundLayers';

/**
 * Screens where people read or work for long: they get a calmer version of the world's ground
 * (see `GROUND_STAGE_DEFAULTS`). Everything else stands on the full ground.
 */
const FOCUS_ROUTES: readonly RegExp[] = [
  /^\/library\/(reader|video)\//,
  /^\/community\/(chat|dm)\//,
  /^\/admin\/forms\//,
  /^\/workspace\/(kiosk|attendance|timetable|submissions)(\/|$)/,
  /^\/school\/[^/]+\/articles\//,
];

/** The rooms themselves: built from cards, so they keep the full scene with no veil. */
const ROOM_ROUTES: readonly RegExp[] = [/^\/(self|workspace|community|library)\/?$/];

export function groundStageOf(pathname: string): GroundStage {
  if (FOCUS_ROUTES.some((route) => route.test(pathname))) return 'focus';
  if (ROOM_ROUTES.some((route) => route.test(pathname))) return 'room';
  return 'screen';
}

/**
 * The world's ground behind every screen of the app: drawn once, in the app shell, from the one
 * world look. Rooms draw over it only when they keep their own look.
 */
export function WorldBackdrop({ isExplore = false }: Readonly<{ isExplore?: boolean }>) {
  const pathname = usePathname() ?? '/';
  const { world } = useWorldTheme();
  const { look } = useWorldLook();
  const view = useGurudeviView();

  useEffect(() => worldLookStore.holdShellGround(), []);

  const allowance = useMemo(
    () => (view ? groundAllowanceOf(view.experience, view.reading) : NOTHING_ALLOWED),
    [view],
  );
  const defaults = useMemo(() => groundDefaultsFor(world, isExplore), [world, isExplore]);
  const plan = planGround(
    look ? { ...defaults, ...look } : defaults,
    getBackdropsForWorld(world),
    allowance,
    undefined,
    groundStageOf(pathname),
  );

  return (
    <div
      aria-hidden="true"
      data-ground-drawn={plan.surface}
      data-ground-stage={groundStageOf(pathname)}
      data-testid="world-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    >
      <GroundLayers plan={plan} room={sceneRoomOf(pathname)} worldId={world} />
    </div>
  );
}
