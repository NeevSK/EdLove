import React from 'react';
import type { SceneLayerProps } from './types';

export function WewaWorldScene({
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
}: Readonly<SceneLayerProps>) {
  if (!ls || !c) {
    return <rect fill={palette.horizon} fillOpacity={0.3} height={H - hy} width={W} x={0} y={hy} />;
  }

  return (
    <g data-world-layer="wewa-landscape">
      {/* 1. Distant Mountain Ridges */}
      {ls.hills.map((hill, i) => (
        <path key={`hill-${i}`} d={hill.d} fill={`url(#${id}-hill-${i})`} />
      ))}

      {/* 2. Reservoir Shoreline with Distant Foliage Tree Canopy */}
      <path d={ls.shore} fill={c.shore} />

      {/* 3. Deep Reservoir Waters */}
      <rect
        fill={`url(#${id}-water)`}
        height={ls.waterBottom - ls.waterTop}
        width={W}
        x={0}
        y={ls.waterTop}
      />

      {/* 4. Mirrored Shore Reflections */}
      <path d={ls.shoreReflection} fill={c.shore} fillOpacity={0.32} />

      {/* 5. Natural Water Glints & Light Reflections */}
      {Array.from({ length: 18 }, (_, i) => {
        const y = ls.waterTop + (i / 18) * (ls.waterBottom - ls.waterTop);
        const w = (16 + ((i * 37) % 25)) * (1 + i / 9);
        const cx = W * 0.5 + Math.sin(i * 1.5) * 60;
        return (
          <rect
            key={`water-glint-${i}`}
            fill={c.glint}
            fillOpacity={(0.55 - i / 40) * veil}
            height={1.5}
            width={w}
            x={cx - w / 2}
            y={y}
          />
        );
      })}

      {ls.glints.map((g, i) => (
        <rect
          key={`glint-${i}`}
          fill="#FFFFFF"
          fillOpacity={g.a * (0.35 + light * 0.6)}
          height={1}
          width={g.w}
          x={g.x}
          y={g.y}
        />
      ))}

      {/* 6. Lotus Beds floating in calm shallow water */}
      <path d={ls.lotusPads} fill={c.lotus} />
      {light > 0.25 &&
        ls.lotusFlowers.map((f, i) => (
          <ellipse
            key={`lotus-${i}`}
            cx={f.cx}
            cy={f.cy}
            fill={c.lotusFlower}
            fillOpacity={0.92}
            rx={f.rx}
            ry={f.ry}
          />
        ))}

      {/* 7. Lower Paddy Terraces & Bunds (Vaniya / Niyara) */}
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
          strokeOpacity={0.58}
          strokeWidth={b.width}
        />
      ))}

      {/* 8. Graceful Coconut Palms Along Bund */}
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

      {/* 9. Majestic Ancient Kumbuk Tree by the Water's Edge */}
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
  );
}
