/**
 * The floor: the active world's scene under every screen, drawn as cheaply as the stage allows.
 *
 * - rich and middle: the still picture on one canvas (records once a minute), the front layers,
 *   particles and shader on a second canvas that alone redraws, at the stage's frame rate.
 * - floor: the still picture without its finest layers, plus two or three soft overlays moved by
 *   CSS animations on the UI thread (no frame loop, no redraw). Still alive, almost free. Where a
 *   baked picture of the world at this phase is registered, it is shown instead (no canvas); a
 *   wide screen gets the wide bake.
 *
 * The scene is composed for the screen's own width and height, so turning the phone redraws it
 * for the new frame (the horizon, the sun's path and the reading wash all follow).
 * - bare, or a world whose floor is plain (Classic): no canvas; the ground, tinted by the hour.
 *
 * Over it, veils of the world's ground ease in and out with the screen's presence (full, band,
 * quiet), so words written on the floor always keep their contrast.
 */

import { useVergerSnapshot } from '@repo/verger-react';
import { Image } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Canvas, LinearGradient, Rect, vec } from 'react-native-skia';
import { GROUND_PRESENCE_VEILS, type GroundPlan } from '@repo/core/logic/workspace/groundPlan';
import { photoUrlFor } from '@repo/core/logic/workspace/worldBackdrops';
import { groundLimitsOf } from '../../../theme/groundLimits';
import { GURUDEVI_APP } from '../../../utils/urls';
import { useVisualCapabilities } from '../../../context/VisualCapabilities';
import { quietVeilOf, veilGradientOf } from '../../../theme/scene/screenGround';
import { alpha } from '../../../theme/color';
import { useWorld } from '../../../theme/native/WorldContext';
import { type ArtLayer, type ScenePresence, resolveScene, sceneArtOf } from '../../../theme/scene';
import type { Stage } from '../../../theme/stage';
import { SceneBackdrop } from '../Scene/SceneBackdrop';
import { useMinuteClock } from '../Scene/useScene';
import { ArtLife } from './ArtLife';
import { ArtStill, layerShows } from './ArtStill';
import { CompanionOnFloor } from './CompanionOnFloor';
import { FloorOverlays } from './FloorOverlays';
import { floorPictureFor } from './floorPictures';
import { useStagePreview } from './StagePreview';

export interface WorldFloorProps {
  stage: Stage;
  presence: ScenePresence;
  scrolling: boolean;
  /**
   * The planned ground for the room on screen (the world's look or the room's own, already
   * limited by verger): a still sky, a photo, or the world's plain paper instead of the live sky.
   */
  ground?: GroundPlan | null;
}

/** The trailing run of moving layers: they go on the live canvas, everything before stays still. */
export function splitLayers(layers: readonly ArtLayer[], live: boolean) {
  if (!live) return { still: layers, moving: [] as ArtLayer[] };
  let cut = layers.length;
  while (cut > 0 && layers[cut - 1]?.motion) cut -= 1;
  return { still: layers.slice(0, cut), moving: layers.slice(cut) };
}

const VEIL_MS = 420;

export function WorldFloor({ stage, presence, scrolling, ground: plan = null }: WorldFloorProps) {
  const world = useWorld();
  const budget = useVisualCapabilities();
  const visibility = useVergerSnapshot()?.visibility ?? 'active';
  const now = useMinuteClock();
  const pins = useStagePreview();
  const { width, height } = useWindowDimensions();
  const plainWorld = world.definition.floor === 'plain' || stage.tier === 'bare';
  // The planned ground: paper is the world's plain ground; a photo replaces the sky.
  const photo = !plainWorld && plan?.surface === 'photo' && plan.photo ? plan.photo : null;
  const plain = plainWorld || plan?.surface === 'paper' || photo !== null;

  const scene = useMemo(
    () =>
      resolveScene({
        now,
        minute: pins.minute ?? null,
        weather: pins.weather ?? null,
        world: { id: world.id, glow: world.tokens.glow },
        room: 'self',
        follows: 'world',
        presence: 'full',
        budget,
        visible: visibility === 'active',
      }),
    [now, pins.minute, pins.weather, world.id, world.tokens.glow, budget, visibility],
  );

  // The world's own art, drawn from its light palette (the scene darkens itself at night).
  const light = world.definition.palette.light;
  const art = useMemo(
    () =>
      plain || !scene.palette
        ? null
        : sceneArtOf(world.id, { width, height, scene, tokens: light }),
    [plain, scene, world.id, width, height, light],
  );

  const live =
    plan?.surface !== 'still' &&
    stage.fps > 0 &&
    (art?.particles.length ?? 0) + (art?.layers.length ?? 0) > 0;
  const { still, moving } = useMemo(
    () =>
      splitLayers(
        (art?.layers ?? []).filter((l) => layerShows(l, stage.tier)),
        live,
      ),
    [art, live, stage.tier],
  );
  const active = live && presence !== 'quiet' && !scrolling && visibility === 'active';

  // Veils: a band veil keeps the floor visible behind the header only. Quiet (settings, forms,
  // reading) stills the floor and veils it calmly, but never hides it: every screen still stands
  // on the world's ground. A plain world (Classic) has only its ground.
  const quietTo = plainWorld ? 1 : presence === 'quiet' ? quietVeilOf() : 0;
  const band = useSharedValue(presence === 'band' ? 1 : 0);
  const quiet = useSharedValue(quietTo);
  useEffect(() => {
    const ms = stage.transition === 'none' ? 0 : VEIL_MS;
    band.set(withTiming(presence === 'band' ? 1 : 0, { duration: ms }));
    quiet.set(withTiming(quietTo, { duration: ms }));
  }, [presence, quietTo, stage.transition, band, quiet]);
  const bandStyle = useAnimatedStyle(() => ({ opacity: band.get() }));
  const quietStyle = useAnimatedStyle(() => ({ opacity: quiet.get() }));

  const ground = world.tokens.ground;
  // Turned on its side, the floor shows a picture composed for the wide frame, not a crop.
  const picture =
    !plain && stage.tier === 'floor'
      ? floorPictureFor(world.id, scene.phase, width > height)
      : null;
  const sun: [number, number] = [
    width * scene.celestial.x,
    height * 0.58 * (1 - scene.celestial.lift * 0.92) + 10,
  ];

  return (
    // The floor is scenery: screen readers skip it, touches pass through it.
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {photo ? (
        // A photo stays inside the world's limit, so words written over it keep their contrast.
        <Image
          source={{ uri: photoUrlFor(photo, GURUDEVI_APP) }}
          style={{
            width,
            height,
            opacity: groundLimitsOf(world.tokens).photoOpacity * (plan?.dim ? 0.6 : 1),
          }}
          contentFit="cover"
          transition={stage.transition === 'none' ? 0 : 600}
          cachePolicy="disk"
          accessible={false}
        />
      ) : null}
      {picture && art ? (
        <>
          <Image
            source={picture}
            style={{ width, height }}
            contentFit="cover"
            transition={stage.transition === 'none' ? 0 : 600}
            cachePolicy="memory"
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundImage: `linear-gradient(to bottom, ${alpha(ground, 0.08)} 0%, ${alpha(ground, 0.08)} 28%, ${alpha(ground, 0.5)} 45%, ${alpha(ground, 0.62)} 100%)`,
              },
            ]}
          />
          {stage.overlays && presence !== 'quiet' ? (
            <FloorOverlays overlays={art.overlays} />
          ) : null}
        </>
      ) : plain ? null : art ? (
        <>
          <Canvas style={{ width, height }}>
            <ArtStill layers={still} tier={stage.tier} />
            {/* The reading wash: the floor softens where words sit. */}
            <Rect x={0} y={0} width={width} height={height}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height)}
                colors={[
                  alpha(ground, 0.08),
                  alpha(ground, 0.08),
                  alpha(ground, 0.5),
                  alpha(ground, 0.62),
                ]}
                positions={[0, 0.28, 0.45, 1]}
              />
            </Rect>
          </Canvas>
          {live ? (
            <ArtLife art={art} layers={moving} stage={stage} active={active} sun={sun} />
          ) : null}
          {stage.fps === 0 && stage.overlays && presence !== 'quiet' ? (
            <FloorOverlays overlays={art.overlays} />
          ) : null}
        </>
      ) : (
        // A world without its own art yet keeps the shared landscape.
        <SceneBackdrop
          scene={{ ...scene, fps: active ? scene.fps : 0 }}
          wash={{ colour: ground, edge: 0.15, text: 0.62, textFrom: 0.42 }}
        />
      )}
      {/* The person's companion lives on the floor, under the veils, on a room's front screen. */}
      {presence === 'full' ? <CompanionOnFloor stage={stage} /> : null}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          bandStyle,
          {
            backgroundImage: veilGradientOf(GROUND_PRESENCE_VEILS.band, (a) => alpha(ground, a)),
          },
        ]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, quietStyle, { backgroundColor: ground }]} />
    </View>
  );
}
