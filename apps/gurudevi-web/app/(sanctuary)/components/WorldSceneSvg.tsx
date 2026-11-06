'use client';

import { DEFAULT_WORLD, isWorldId, WORLDS } from '@repo/ui/theme';
import {
  daylightAt,
  SCENE_LIGHT as L,
  type Landscape,
  type LandscapeColours,
  mixHex,
  type Scene,
  WEATHER,
} from '@repo/ui/theme/scene';
import React, { useId } from 'react';
import {
  AngamporaWorldScene,
  ColomboWorldScene,
  KandyanWorldScene,
  KeleWorldScene,
  PeraheraWorldScene,
  RatnaWorldScene,
  RosaWorldScene,
  SanctuaryWorldScene,
  SparkWorldScene,
  TeaWorldScene,
  WewaWorldScene,
} from './scenes';

export interface WorldSceneSvgProps {
  scene: Scene;
  landscape?: Landscape | null;
  colours?: LandscapeColours | null;
  worldId?: string;
  glow?: string;
  className?: string;
  style?: React.CSSProperties;
  customSvg?: React.ReactNode;
}

export function WorldSceneSvg({
  scene,
  landscape: ls,
  colours: c,
  worldId = 'sanctuary',
  glow,
  className,
  style,
  customSvg,
}: Readonly<WorldSceneSvgProps>) {
  const id = useId().replace(/:/g, '_');
  const palette = scene.palette;
  if (!palette) return null;

  const resolvedWorldId = isWorldId(worldId) ? worldId : DEFAULT_WORLD;
  const worldDef = WORLDS[resolvedWorldId];
  const tokens = worldDef?.palette?.light;
  const effectiveGlow = glow ?? tokens?.glow ?? palette.halo;

  const W = ls?.width ?? 1440;
  const H = ls?.height ?? 900;
  const hy = ls?.horizonY ?? H * 0.6;
  const wx = WEATHER[scene.weather] ?? WEATHER.clear;
  const veil = 1 - wx.cloud * 0.8;
  const light = daylightAt(scene.minute);
  const cel = scene.celestial;
  const cx = W * cel.x;
  const cy = hy - cel.lift * hy + 10;
  const day = cel.body === 'sun';
  const sunLow = day ? Math.max(0, 1 - cel.lift * 2.8) : 0;
  const moonR = Math.max(12, W * 0.014);
  const moonShift =
    scene.moonPhase < 0.5
      ? -moonR * 2 * (scene.moonPhase / 0.5)
      : moonR * 2 * ((1 - scene.moonPhase) / 0.5);

  const groundColor = tokens?.ground ?? palette.land;
  const ornamentColor = tokens?.ornament ?? palette.horizon;
  const lampColor = tokens?.lamp ?? palette.halo;
  const inkColor = tokens?.ink ?? palette.hillNear;

  const sceneProps = {
    id,
    W,
    H,
    hy,
    day,
    light,
    veil,
    palette,
    groundColor,
    ornamentColor,
    lampColor,
    inkColor,
    effectiveGlow,
    landscape: ls,
    colours: c,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-scene-world={resolvedWorldId}
      preserveAspectRatio="xMidYMid slice"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2={hy}>
          <stop offset="0%" stopColor={palette.top} />
          <stop offset="72%" stopColor={mixHex(palette.top, palette.horizon, 0.7)} />
          <stop offset="100%" stopColor={palette.horizon} />
        </linearGradient>

        {/* Sun Halo radial gradient */}
        {day && (
          <radialGradient
            cx={cx}
            cy={cy}
            id={`${id}-halo`}
            r={Math.max(W, H) * 0.45}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={palette.halo} stopOpacity={0.75 * veil + 0.12} />
            <stop offset="15%" stopColor={palette.halo} stopOpacity={0.32 * veil + 0.05} />
            <stop offset="100%" stopColor={palette.halo} stopOpacity={0} />
          </radialGradient>
        )}

        {/* Moon Glow radial gradient */}
        {!day && (
          <radialGradient
            cx={cx}
            cy={cy}
            id={`${id}-moon-glow`}
            r={moonR * 9}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={L.moonGlow} stopOpacity={0.28 * veil + 0.04} />
            <stop offset="100%" stopColor={L.moonGlow} stopOpacity={0} />
          </radialGradient>
        )}

        {/* Moon shadow clip */}
        {!day && (
          <clipPath id={`${id}-moon-clip`}>
            <circle cx={cx} cy={cy} r={moonR} />
          </clipPath>
        )}

        {/* Sun low atmospheric warmth */}
        {sunLow > 0 && (
          <linearGradient
            id={`${id}-sun-low`}
            x1="0"
            x2="0"
            y1={hy - H * 0.22}
            y2={hy}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={effectiveGlow} stopOpacity={0} />
            <stop
              offset="100%"
              stopColor={mixHex(L.sunLow, effectiveGlow, 0.3)}
              stopOpacity={0.35 * sunLow * veil + 0.05}
            />
          </linearGradient>
        )}

        {/* Cloud gradients */}
        {ls?.clouds?.map((cl, i) => (
          <radialGradient
            cx={cl.cx}
            cy={cl.cy}
            id={`${id}-cloud-${i}`}
            key={`cgrad-${i}`}
            r={cl.rx}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={L.white} stopOpacity={0.25} />
            <stop offset="85%" stopColor={palette.horizon} stopOpacity={0.15} />
            <stop offset="100%" stopColor={palette.horizon} stopOpacity={0} />
          </radialGradient>
        ))}

        {/* Lake Water gradient for Wewa */}
        {ls && c && (
          <linearGradient
            id={`${id}-water`}
            x1="0"
            x2="0"
            y1={ls.waterTop}
            y2={ls.waterBottom}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={c.waterStops[0]} />
            <stop offset="55%" stopColor={c.waterStops[1]} />
            <stop offset="100%" stopColor={c.waterStops[2]} />
          </linearGradient>
        )}
      </defs>

      {/* 1. Universal Sky Backdrop */}
      <rect fill={`url(#${id}-sky)`} height={hy + 2} width={W} x={0} y={0} />

      {/* 2. Stars */}
      {scene.particles.stars > 0 &&
        ls?.stars
          ?.slice(0, scene.particles.stars * 4)
          .map((s, i) => (
            <circle
              key={`star-${i}`}
              cx={s.x}
              cy={s.y}
              fill={L.white}
              fillOpacity={0.25 + (s.r % 0.5)}
              r={s.r}
            />
          ))}

      {/* 3. Celestial Body (Sun or Moon) */}
      {day ? (
        <g>
          {veil > 0.08 && <circle cx={cx} cy={cy} fill={`url(#${id}-halo)`} r={W * 0.45} />}
          <circle cx={cx} cy={cy} fill={L.sunDisc} fillOpacity={0.92 * veil + 0.08} r={W * 0.016} />
        </g>
      ) : (
        <g>
          <circle cx={cx} cy={cy} fill={`url(#${id}-moon-glow)`} r={moonR * 9} />
          {veil > 0.3 && (
            <g clipPath={`url(#${id}-moon-clip)`}>
              <circle cx={cx} cy={cy} fill={L.moonDisc} fillOpacity={veil} r={moonR} />
              <circle
                cx={cx + moonShift}
                cy={cy}
                fill={palette.top}
                fillOpacity={0.93}
                r={moonR * 1.04}
              />
            </g>
          )}
        </g>
      )}

      {/* 4. Sun Low Horizon Warmth */}
      {sunLow > 0 && (
        <rect fill={`url(#${id}-sun-low)`} height={H * 0.22} width={W} x={0} y={hy - H * 0.22} />
      )}

      {/* 5. Clouds */}
      {ls?.clouds?.map((cl, i) => (
        <ellipse
          key={`cloud-${i}`}
          cx={cl.cx}
          cy={cl.cy}
          fill={`url(#${id}-cloud-${i})`}
          rx={cl.rx}
          ry={cl.ry}
        />
      ))}

      {/* 6. Living World-Specific Scenery Layer for All 11 Worlds */}
      {resolvedWorldId === 'sanctuary' ? (
        <SanctuaryWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'wewa' ? (
        <WewaWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'kele' ? (
        <KeleWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'tea' ? (
        <TeaWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'kandyan' ? (
        <KandyanWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'angampora' ? (
        <AngamporaWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'perahera' ? (
        <PeraheraWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'ratna' ? (
        <RatnaWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'rosa' ? (
        <RosaWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'colombo' ? (
        <ColomboWorldScene {...sceneProps} />
      ) : resolvedWorldId === 'spark' ? (
        <SparkWorldScene {...sceneProps} />
      ) : (
        <SanctuaryWorldScene {...sceneProps} />
      )}

      {/* 7. Custom Caller-Provided SVG Injection Slot */}
      {customSvg}
    </svg>
  );
}
