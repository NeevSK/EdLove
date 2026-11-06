'use client';

import type { SceneGroundMode, WorkspaceWallpaper } from '@repo/core/types';
import { experienceOf } from '@repo/core/verger';
import { DEFAULT_WORLD, isWorldId, phaseTokens, resolveWorld, WORLDS } from '@repo/ui/theme';
import {
  daylightAt,
  landscapeColours,
  landscapeOf,
  resolveScene,
  type SceneRoom,
} from '@repo/ui/theme/scene';
import React, { useEffect, useMemo, useState } from 'react';
import { useGurudeviView } from '../../../lib/runtime/useGurudeviView';
import { useWebFidelity } from '../../../lib/runtime/webFidelity';
import { SceneImageLayer } from './SceneImageLayer';
import { WorldSceneSvg } from './WorldSceneSvg';

/** Before verger is read (server, hydration) nothing is known about the device: no floor. */
const UNGOVERNED = { levels: {}, capacityClass: 'unknown' } as const;

export interface WorldGroundSurfaceProps {
  groundMode?: SceneGroundMode;
  worldId?: string;
  room?: SceneRoom;
  wallpaper?: WorkspaceWallpaper | null;
  nextWallpaper?: WorkspaceWallpaper | null;
  isCrossFading?: boolean;
  fixed?: boolean;
  pure?: boolean;
  customScene?: React.ReactNode;
  customSvg?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function WorldGroundSurface({
  groundMode = 'live',
  worldId = 'sanctuary',
  room = 'self',
  wallpaper,
  nextWallpaper,
  isCrossFading = false,
  fixed = true,
  pure = false,
  customScene,
  customSvg,
  children,
  className,
  style,
}: Readonly<WorldGroundSurfaceProps>) {
  // Clock state for live diurnal updates
  const [minute, setMinute] = useState<number>(12 * 60);

  useEffect(() => {
    if (groundMode !== 'live') return;
    const updateMinute = () => {
      const d = new Date();
      setMinute(d.getHours() * 60 + d.getMinutes());
    };

    updateMinute();
    const interval = setInterval(updateMinute, 60000);

    const handleVisibility = () => {
      if (!document.hidden) updateMinute();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [groundMode]);

  const worldDef = WORLDS[isWorldId(worldId) ? worldId : DEFAULT_WORLD];
  const effectiveGlow = worldDef.palette.light.glow;

  // Verger decides what the scene may spend, as `useScene` does on the phone.
  const view = useGurudeviView();
  const fidelity = useWebFidelity();
  const budget = useMemo(
    () => view?.experience ?? experienceOf(UNGOVERNED, { fidelity }),
    [view, fidelity],
  );
  const visible = view === null || view.reading.visibility === 'active';

  // Resolved scene representation
  const scene = useMemo(() => {
    const effectiveMinute = groundMode === 'still' ? 12 * 60 : minute;
    return resolveScene({
      now: new Date(),
      minute: effectiveMinute,
      world: { id: worldId, glow: effectiveGlow },
      room,
      presence: 'full',
      budget,
      visible,
    });
  }, [groundMode, minute, worldId, effectiveGlow, room, budget, visible]);

  const landscape = useMemo(
    () => landscapeOf(scene.view, 1440, 900, scene.tier === 'rich'),
    [scene.view, scene.tier],
  );

  const colours = useMemo(
    () =>
      scene.palette
        ? landscapeColours(scene.palette, daylightAt(scene.minute), effectiveGlow)
        : null,
    [scene.palette, scene.minute, effectiveGlow],
  );

  // If in image mode or wallpaper specified
  if (groundMode === 'image' && (wallpaper || nextWallpaper)) {
    return (
      <div
        aria-hidden="true"
        className={className}
        data-ground-surface="image"
        data-world={worldId}
        style={{
          position: fixed ? 'fixed' : 'absolute',
          zIndex: 0,
          inset: 0,
          width: fixed ? '100vw' : '100%',
          height: fixed ? '100vh' : '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          ...style,
        }}
      >
        <SceneImageLayer
          fixed={fixed}
          isCrossFading={isCrossFading}
          nextWallpaper={nextWallpaper}
          pure={pure}
          wallpaper={wallpaper}
        />
        {children}
      </div>
    );
  }

  // A quiet ground is the world's own paper, without a scene.
  if (groundMode === 'quiet') {
    const solidColor = phaseTokens(worldDef.palette.light, 'light', 'morning').ground;
    return (
      <div
        aria-hidden="true"
        className={className}
        data-ground-surface={groundMode}
        data-world={worldId}
        style={{
          position: fixed ? 'fixed' : 'absolute',
          zIndex: 0,
          inset: 0,
          width: fixed ? '100vw' : '100%',
          height: fixed ? '100vh' : '100%',
          backgroundColor: solidColor,
          pointerEvents: 'none',
          overflow: 'hidden',
          transition: 'background-color 0.8s ease',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // Default: Live or Still procedural SVG / Canvas scene
  return (
    <div
      aria-hidden="true"
      className={className}
      data-ground-surface={groundMode}
      data-layer={groundMode === 'live' ? 'scene-live' : 'scene-still'}
      data-testid={groundMode === 'live' ? 'scene-live' : 'scene-still'}
      data-world={worldId}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        zIndex: 0,
        inset: 0,
        width: fixed ? '100vw' : '100%',
        height: fixed ? '100vh' : '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        transition: 'opacity 0.8s ease-in-out',
        ...style,
      }}
    >
      {customScene ? (
        customScene
      ) : (
        <WorldSceneSvg
          colours={colours}
          customSvg={customSvg}
          glow={effectiveGlow}
          landscape={landscape}
          scene={scene}
          worldId={worldId}
        />
      )}
      {children}
    </div>
  );
}
