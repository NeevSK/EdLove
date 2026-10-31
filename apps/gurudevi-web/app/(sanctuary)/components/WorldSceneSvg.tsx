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

const alpha = (hex: string, a: number): string => {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${v}`;
};

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

  const worldDef = WORLDS[isWorldId(worldId) ? worldId : DEFAULT_WORLD];
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
  const moonR = Math.max(11, W * 0.013);
  const moonShift =
    scene.moonPhase < 0.5
      ? -moonR * 2 * (scene.moonPhase / 0.5)
      : moonR * 2 * ((1 - scene.moonPhase) / 0.5);
  const cloudColour = mixHex(palette.horizon, light > 0.3 ? L.white : L.cloudNight, 0.35);
  const cloudAlpha = 0.14 + wx.cloud * 0.36;
  const showStars = scene.particles.stars > 0;

  const groundColor = tokens?.ground ?? palette.land;
  const ornamentColor = tokens?.ornament ?? palette.horizon;
  const lampColor = tokens?.lamp ?? palette.halo;
  const inkColor = tokens?.ink ?? palette.hillNear;

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-scene-world={worldId}
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
            r={Math.max(W, H) * 0.42}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={palette.halo} stopOpacity={0.75 * veil + 0.1} />
            <stop offset="12%" stopColor={palette.halo} stopOpacity={0.32 * veil + 0.05} />
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

        {/* Clouds */}
        {ls?.clouds?.map((cl, i) => (
          <radialGradient
            key={`cg-${i}`}
            cx={cl.cx}
            cy={cl.cy}
            id={`${id}-cloud-${i}`}
            r={cl.rx}
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={cloudColour}
              stopOpacity={i < 6 + wx.cloud * 24 ? cloudAlpha : 0}
            />
            <stop offset="100%" stopColor={cloudColour} stopOpacity={0} />
          </radialGradient>
        ))}

        {/* Hills gradients */}
        {ls &&
          c &&
          ls.hills.map((hill, i) => {
            const hillCols = c.hills[i] ?? [palette.hillFar, palette.horizon];
            return (
              <linearGradient
                key={`hg-${i}`}
                id={`${id}-hill-${i}`}
                x1="0"
                x2="0"
                y1={hill.top}
                y2={hy}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={hillCols[0]} />
                <stop offset="100%" stopColor={hillCols[1]} />
              </linearGradient>
            );
          })}

        {/* Lake Water gradient */}
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

        {/* Kandyan Mural Earth Gradient */}
        {worldId === 'kandyan' && (
          <linearGradient
            id={`${id}-kandyan-mural`}
            x1="0"
            x2="0"
            y1={hy}
            y2={H}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={inkColor} />
            <stop offset="40%" stopColor={lampColor} />
            <stop offset="100%" stopColor={groundColor} />
          </linearGradient>
        )}

        {/* Tea Mountain Terraces Gradient */}
        {worldId === 'tea' && (
          <linearGradient
            id={`${id}-tea-hills`}
            x1="0"
            x2="0"
            y1={hy - 80}
            y2={H}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={inkColor} />
            <stop offset="50%" stopColor={ornamentColor} />
            <stop offset="100%" stopColor={groundColor} />
          </linearGradient>
        )}

        {/* Kele Rainforest Canopy Gradient */}
        {worldId === 'kele' && (
          <linearGradient
            id={`${id}-kele-canopy`}
            x1="0"
            x2="0"
            y1={0}
            y2={H}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={inkColor} stopOpacity={0.65} />
            <stop offset="60%" stopColor={ornamentColor} stopOpacity={0.85} />
            <stop offset="100%" stopColor={groundColor} stopOpacity={0.95} />
          </linearGradient>
        )}
      </defs>

      {/* 1. Universal Sky Backdrop */}
      <rect fill={`url(#${id}-sky)`} height={hy + 2} width={W} x={0} y={0} />

      {/* 2. Stars */}
      {showStars &&
        ls?.stars
          ?.slice(0, scene.particles.stars * 4)
          .map((s, i) => (
            <circle
              key={`star-${i}`}
              cx={s.x}
              cy={s.y}
              fill={L.star}
              fillOpacity={(0.45 + (i % 5) * 0.08) * (1 - wx.cloud)}
              r={s.r * 0.8}
            />
          ))}

      {/* 3. Celestial Body (Sun or Moon) */}
      {day ? (
        <g>
          <rect fill={`url(#${id}-halo)`} height={hy} width={W} x={0} y={0} />
          {veil > 0.25 && (
            <circle
              cx={cx}
              cy={cy}
              fill={L.sunDisc}
              fillOpacity={Math.min(1, veil + 0.1)}
              r={Math.max(14, W * 0.018)}
            />
          )}
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

      {/* 6. World-Specific Scenery Rendering */}
      {/* 6A: Kandyan Temple Mural Earth & Liyawela Vine Band */}
      {worldId === 'kandyan' ? (
        <g data-world-layer="kandyan-mural">
          <path
            d={`M0 ${hy + 10} Q360 ${hy - 45} 720 ${hy - 15} T1440 ${hy - 35} L1440 ${H} L0 ${H} Z`}
            fill={`url(#${id}-kandyan-mural)`}
          />
          <rect fill={groundColor} fillOpacity={0.15} height={H - hy} width={W} x={0} y={hy} />

          <g opacity={0.65}>
            {Array.from({ length: Math.ceil(W / 120) }, (_, i) => {
              const xOffset = i * 120;
              return (
                <path
                  key={`liyawela-${i}`}
                  d={`M${xOffset} ${hy + 20} C${xOffset + 30} ${hy - 10}, ${xOffset + 60} ${hy + 50}, ${xOffset + 90} ${hy + 15} S${xOffset + 120} ${hy + 20}, ${xOffset + 120} ${hy + 20}`}
                  fill="none"
                  stroke={ornamentColor}
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              );
            })}
          </g>

          <line
            stroke={ornamentColor}
            strokeOpacity={0.45}
            strokeWidth="1.5"
            x1="0"
            x2={W}
            y1={hy + 6}
            y2={hy + 6}
          />
          <line
            stroke={lampColor}
            strokeOpacity={0.35}
            strokeWidth="1"
            x1="0"
            x2={W}
            y1={hy + 10}
            y2={hy + 10}
          />
        </g>
      ) : worldId === 'tea' ? (
        /* 6B: Tea Country Mountain Slopes & Misty Terraces */
        <g data-world-layer="tea-terraces">
          <path
            d={`M0 ${hy - 30} Q280 ${hy - 90} 600 ${hy - 40} T1100 ${hy - 80} Q1280 ${hy - 60} 1440 ${hy - 20} L1440 ${H} L0 ${H} Z`}
            fill={`url(#${id}-tea-hills)`}
          />
          {Array.from({ length: 8 }, (_, i) => {
            const yPos = hy + 30 + i * 45;
            return (
              <path
                key={`tea-contour-${i}`}
                d={`M0 ${yPos} Q400 ${yPos - 15} 800 ${yPos + 10} T1440 ${yPos - 8}`}
                fill="none"
                stroke={ornamentColor}
                strokeOpacity={0.35 - i * 0.03}
                strokeWidth={1.8}
              />
            );
          })}
        </g>
      ) : worldId === 'kele' ? (
        /* 6C: Kele Sinharaja Rainforest Canopy Silhouette */
        <g data-world-layer="kele-canopy">
          <path
            d={`M0 ${hy - 40} Q200 ${hy - 80} 450 ${hy - 50} T900 ${hy - 95} Q1150 ${hy - 65} 1440 ${hy - 45} L1440 ${H} L0 ${H} Z`}
            fill={inkColor}
          />
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={`canopy-tuft-${i}`}
              cx={i * 130 + 40}
              cy={hy - 40 - ((i * 17) % 35)}
              fill={ornamentColor}
              fillOpacity={0.65}
              rx={65}
              ry={35}
            />
          ))}
          <rect fill={`url(#${id}-kele-canopy)`} height={H - hy} width={W} x={0} y={hy} />
        </g>
      ) : ls && c ? (
        /* 6D: Universal / Wewa / Sanctuary Living Landscape (Hills, Lake, Palms, Terraces) */
        <g data-world-layer="wewa-landscape">
          {ls.hills.map((hill, i) => (
            <path key={`hill-${i}`} d={hill.d} fill={`url(#${id}-hill-${i})`} />
          ))}

          <path d={ls.shore} fill={c.shore} />

          <rect
            fill={`url(#${id}-water)`}
            height={ls.waterBottom - ls.waterTop}
            width={W}
            x={0}
            y={ls.waterTop}
          />

          <path d={ls.shoreReflection} fill={c.shore} fillOpacity={0.35} />

          {(day ? veil > 0.2 : veil > 0.35) &&
            Array.from({ length: 18 }, (_, i) => {
              const y = ls.waterTop + (i / 18) * (ls.waterBottom - ls.waterTop);
              const w = (14 + ((i * 37) % 23)) * (1 + i / 9);
              return (
                <rect
                  key={`water-glint-${i}`}
                  fill={c.glint}
                  fillOpacity={(0.5 - i / 44) * veil}
                  height={1.4}
                  width={w}
                  x={cx - w / 2}
                  y={y}
                />
              );
            })}

          {ls.glints.map((g, i) => (
            <rect
              key={`glint-${i}`}
              fill={L.white}
              fillOpacity={g.a * (0.3 + light)}
              height={1}
              width={g.w}
              x={g.x}
              y={g.y}
            />
          ))}

          <path d={ls.lotusPads} fill={c.lotus} />
          {light > 0.3 &&
            ls.lotusFlowers.map((f, i) => (
              <ellipse
                key={`lotus-${i}`}
                cx={f.cx}
                cy={f.cy}
                fill={c.lotusFlower}
                fillOpacity={0.9}
                rx={f.rx}
                ry={f.ry}
              />
            ))}

          <rect
            fill={c.paddyBase}
            height={H - ls.waterBottom + 2}
            width={W}
            x={0}
            y={ls.waterBottom - 2}
          />
          {ls.terraces.map((d, i) => (
            <path key={`terrace-${i}`} d={d} fill={c.terraces[i] ?? c.paddyBase} />
          ))}
          {ls.bunds.map((b, i) => (
            <path
              key={`bund-${i}`}
              d={b.d}
              fill="none"
              stroke={c.bund}
              strokeOpacity={0.55}
              strokeWidth={b.width}
            />
          ))}

          {scene.tier === 'rich' && ls.stalks && (
            <path
              d={ls.stalks}
              fill="none"
              stroke={c.stalk}
              strokeOpacity={0.25 + light * 0.2}
              strokeWidth={1}
            />
          )}

          {ls.palms.map((p, i) => (
            <g key={`palm-${i}`}>
              <path
                d={p.trunk}
                fill="none"
                stroke={c.silhouette}
                strokeLinecap="round"
                strokeWidth={p.trunkWidth}
              />
              <path
                d={p.fronds}
                fill="none"
                stroke={c.silhouette}
                strokeLinecap="round"
                strokeWidth={p.frondWidth}
              />
              <path d={p.leaflets} fill="none" stroke={c.silhouette} strokeWidth={1} />
              <circle cx={p.crown.cx} cy={p.crown.cy} fill={c.silhouette} r={p.crown.r} />
            </g>
          ))}

          {ls.kumbuk && (
            <g>
              <path d={ls.kumbuk.trunk} fill={c.silhouette} />
              {ls.kumbuk.crowns.map((e, i) => (
                <ellipse
                  key={`kumbuk-crown-${i}`}
                  cx={e.cx}
                  cy={e.cy}
                  fill={c.silhouette}
                  rx={e.rx}
                  ry={e.ry}
                />
              ))}
            </g>
          )}
        </g>
      ) : (
        <rect fill={palette.horizon} fillOpacity={0.3} height={H - hy} width={W} x={0} y={hy} />
      )}

      {/* 7. Custom Caller-Provided SVG Injection Slot */}
      {customSvg}
    </svg>
  );
}
