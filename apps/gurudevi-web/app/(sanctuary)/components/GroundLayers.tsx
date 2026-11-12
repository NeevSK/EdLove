'use client';

import type { GroundPlan } from '@repo/core/logic/workspace/groundPlan';
import type { SceneGroundMode } from '@repo/core/types';
import { isWorldId, WORLDS, washLimitOf } from '@repo/ui/theme';
import type { SceneRoom } from '@repo/ui/theme/scene';
import type React from 'react';
import { useMemo } from 'react';
import { useFloorSlideshow } from '../../../lib/canvas/useFloorSlideshow';
import { useWorldTheme } from '../../../lib/theme/useWorldTheme';
import { FloorAtmosphere } from './FloorAtmosphere';
import { WorldGroundSurface } from './WorldGroundSurface';

const SURFACE_TO_MODE = {
  live: 'live',
  still: 'still',
  photo: 'image',
  paper: 'quiet',
} as const satisfies Record<GroundPlan['surface'], SceneGroundMode>;

/** A 0 to 1 alpha as the two hex digits appended to a #RRGGBB colour. */
function alphaHex(alpha: number): string {
  return Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
}

export interface GroundLayersProps {
  plan: GroundPlan;
  worldId: string;
  room: SceneRoom;
  customScene?: React.ReactNode;
  customSvg?: React.ReactNode;
}

/**
 * Draws one ground plan from the floor engine: the scene or photo, its tint and its texture.
 * The app shell draws it once behind every screen; a room draws it only for its own look.
 */
export function GroundLayers({
  plan,
  worldId,
  room,
  customScene,
  customSvg,
}: Readonly<GroundLayersProps>) {
  const { resolvedMode } = useWorldTheme();
  const { activeWallpaper, nextWallpaper, isCrossFading } = useFloorSlideshow(
    plan.slideshow
      ? {
          mode: 'slideshow',
          items: plan.slideshow.items,
          slideshowIntervalSeconds: plan.slideshow.seconds,
          activeId: plan.slideshow.startId,
        }
      : null,
    plan.photo,
  );
  const drawnPhoto = plan.surface === 'photo' ? (activeWallpaper ?? plan.photo) : null;

  // A tint shows through a photo; the world caps how strong it may be so words stay readable.
  const wash = plan.tint?.color ?? null;
  const tokens = WORLDS[isWorldId(worldId) ? worldId : 'sanctuary'].palette[resolvedMode];
  const washAlpha = useMemo(
    () => (wash ? Math.min(0.15, washLimitOf(tokens, wash)) : 0),
    [wash, tokens],
  );

  return (
    <>
      {wash && washAlpha > 0 ? (
        <div
          aria-hidden="true"
          data-layer="ground-tint"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            backgroundImage: `radial-gradient(circle at 88% 6%, ${wash}${alphaHex(washAlpha)}, transparent 30rem), radial-gradient(circle at 10% 90%, ${wash}${alphaHex(washAlpha * 0.6)}, transparent 32rem)`,
          }}
        />
      ) : null}
      <WorldGroundSurface
        customScene={customScene}
        customSvg={customSvg}
        dim={plan.dim}
        fixed
        groundMode={SURFACE_TO_MODE[plan.surface]}
        isCrossFading={isCrossFading}
        nextWallpaper={plan.surface === 'photo' ? nextWallpaper : null}
        pure={plan.pure}
        room={room}
        wallpaper={drawnPhoto}
        worldId={worldId}
      />
      <FloorAtmosphere kind={plan.texture} preset={plan.tint?.preset ?? 'default'} />
      {plan.veil > 0 ? (
        <div
          aria-hidden="true"
          data-layer="ground-veil"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: 'var(--w-ground, var(--paper))',
            opacity: plan.veil,
          }}
        />
      ) : null}
    </>
  );
}

/** Which scene a route stands in (the scene draws a little differently per room). */
export function sceneRoomOf(domainOrPath: string): SceneRoom {
  const first = domainOrPath.replace(/^\//, '').split('/')[0] ?? '';
  if (first === 'workspace' || first === 'admin' || first === 'school') return 'classroom';
  if (first === 'self' || first === 'community' || first === 'library') return first;
  return 'self';
}
