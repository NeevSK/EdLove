/**
 * The scene for this screen: the person's world, the hour (once a minute), the room the route is
 * in, and what verger allows now. Screens only say how present the scene may be.
 */

import {
  resolveScene,
  roomOfPath,
  type Scene,
  type SceneFollows,
  type SceneGround,
  type ScenePresence,
  type SceneRoom,
  type SceneSurface,
  type SceneWeather,
} from '@repo/core/scene';
import { useVergerSnapshot } from '@repo/verger-react';
import { useIsFocused, usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useVisualCapabilities } from '../../context/VisualCapabilities';
import { useWorld } from '../../world/native/WorldContext';

export interface UseSceneOptions {
  presence: ScenePresence;
  /** The room, when the route does not say it (previews); otherwise from the route. */
  room?: SceneRoom;
  follows?: SceneFollows;
  ground?: SceneGround;
  surface?: SceneSurface;
  weather?: SceneWeather | null;
  /** A pinned minute (previews, play the day); the clock otherwise. */
  minute?: number | null;
}

/** The time now, re-read on each minute boundary, so the sky moves without a frame loop. */
export function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const date = new Date();
      setNow(date);
      timer = setTimeout(tick, 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds()) + 50);
    };
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    return () => clearTimeout(timer);
  }, []);
  return now;
}

export function useScene(options: UseSceneOptions): Scene {
  const world = useWorld();
  const budget = useVisualCapabilities();
  const visibility = useVergerSnapshot()?.visibility ?? 'active';
  // A screen left under another in the stack stays mounted: it must not keep raining.
  const focused = useIsFocused();
  const pathname = usePathname();
  const now = useMinuteClock();
  const room = options.room ?? roomOfPath(pathname ?? '/');
  const { presence, follows, ground, surface, weather, minute } = options;
  return useMemo(
    () =>
      resolveScene({
        now,
        minute,
        weather,
        world: { id: world.id, glow: world.tokens.glow },
        room,
        follows,
        presence,
        ground,
        surface,
        budget,
        visible: visibility === 'active' && focused,
      }),
    [
      now,
      minute,
      weather,
      world.id,
      world.tokens.glow,
      room,
      follows,
      presence,
      ground,
      surface,
      budget,
      visibility,
      focused,
    ],
  );
}
