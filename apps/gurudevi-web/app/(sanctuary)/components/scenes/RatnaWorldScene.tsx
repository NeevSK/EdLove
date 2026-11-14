import React from 'react';
import type { SceneLayerProps } from './types';

export function RatnaWorldScene({
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
}: Readonly<SceneLayerProps>) {
  const riverTop = hy + 35;
  const riverBottom = H * 0.85;

  return (
    <g data-world-layer="ratna-gems-lace">
      <defs>
        {/* Alluvial Gem River Bed Gradient */}
        <linearGradient id={`${id}-ratna-river`} x1="0" x2="0" y1={riverTop} y2={riverBottom} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={lampColor} stopOpacity={0.4} />
          <stop offset="50%" stopColor={inkColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={lampColor} stopOpacity={0.85} />
        </linearGradient>

        {/* Ivory & Lace Tracery Gradient */}
        <linearGradient id={`${id}-ratna-arch`} x1="0" x2="0" y1={hy - 80} y2={riverTop} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={groundColor} stopOpacity={0.85} />
          <stop offset="100%" stopColor={inkColor} stopOpacity={0.9} />
        </linearGradient>
      </defs>

      {/* 1. Distant Silvery Moonstone Hills */}
      <path
        d={`M0 ${hy + 10} Q320 ${hy - 35} 640 ${hy - 5} T1280 ${hy - 30} Q1380 ${hy - 10} ${W} ${hy + 5} L${W} ${riverTop} L0 ${riverTop} Z`}
        fill={inkColor}
        fillOpacity={0.3}
      />

      {/* 2. Crystalline Alluvial Gravel Banks & Sapphire River */}
      <rect
        fill={`url(#${id}-ratna-river)`}
        height={riverBottom - riverTop}
        width={W}
        x={0}
        y={riverTop}
      />

      {/* Shimmering facets on the river water */}
      {Array.from({ length: 14 }, (_, i) => {
        const y = riverTop + 20 + i * 18;
        const w = 50 + ((i * 37) % 90);
        const x = (i * 123) % (W - w);
        return (
          <ellipse
            key={`ratna-glimmer-${i}`}
            cx={x + w / 2}
            cy={y}
            rx={w / 2}
            ry={1.5}
            fill={effectiveGlow}
            fillOpacity={0.45 * veil}
          />
        );
      })}

      {/* 3. Faceted Gemstone Silhouettes in the Riverbed Gravel */}
      {[0.18, 0.35, 0.52, 0.68, 0.84].map((ratio, idx) => {
        const gx = W * ratio;
        const gy = riverBottom - 24 + ((idx * 17) % 20);
        const r = 10 + (idx % 3) * 4;
        return (
          <g key={`gem-stone-${idx}`}>
            {/* Faceted cut crystal geometry */}
            <polygon
              points={`${gx},${gy - r} ${gx + r * 1.2},${gy - r * 0.4} ${gx + r},${gy + r * 0.8} ${gx - r},${gy + r * 0.8} ${gx - r * 1.2},${gy - r * 0.4}`}
              fill={lampColor}
              fillOpacity={0.7}
              stroke={groundColor}
              strokeWidth={1}
            />
            {/* Facet lines */}
            <line x1={gx} y1={gy - r} x2={gx} y2={gy + r * 0.8} stroke={groundColor} strokeWidth={0.7} strokeOpacity={0.6} />
            <line x1={gx - r * 1.2} y1={gy - r * 0.4} x2={gx + r * 1.2} y2={gy - r * 0.4} stroke={groundColor} strokeWidth={0.7} strokeOpacity={0.6} />
            {/* Gem inner brilliance glint */}
            <circle cx={gx - r * 0.2} cy={gy - r * 0.3} r={1.5} fill="#FFFFFF" fillOpacity={0.9} />
          </g>
        );
      })}

      {/* 4. Fine Southern Beeralu Lace Lattice Arches (Overhead Border) */}
      <g stroke={groundColor} strokeWidth={1} fill="none" opacity={0.85}>
        {Array.from({ length: Math.ceil(W / 120) }, (_, i) => {
          const ax = i * 120;
          return (
            <g key={`beeralu-arch-${i}`}>
              {/* Arch silhouette */}
              <path
                d={`M${ax} ${riverTop} V${hy - 20} A60 40 0 0 1 ${ax + 120} ${hy - 20} V${riverTop}`}
                strokeWidth={1.4}
              />
              {/* Lace lattice diamond netting */}
              <line x1={ax + 20} y1={hy - 15} x2={ax + 60} y2={hy + 15} strokeOpacity={0.5} />
              <line x1={ax + 60} y1={hy - 28} x2={ax + 100} y2={hy + 5} strokeOpacity={0.5} />
              <line x1={ax + 100} y1={hy - 15} x2={ax + 60} y2={hy + 15} strokeOpacity={0.5} />
              <line x1={ax + 60} y1={hy - 28} x2={ax + 20} y2={hy + 5} strokeOpacity={0.5} />
              {/* Lace dot picots */}
              <circle cx={ax + 60} cy={hy - 28} r={2} fill={groundColor} stroke="none" />
              <circle cx={ax + 60} cy={hy + 15} r={2} fill={groundColor} stroke="none" />
            </g>
          );
        })}
      </g>

      {/* 5. Polished Ivory Stone Floor Balustrade */}
      <rect
        x={0}
        y={riverBottom}
        width={W}
        height={H - riverBottom}
        fill={inkColor}
        fillOpacity={0.95}
      />
      <line x1={0} y1={riverBottom} x2={W} y2={riverBottom} stroke={groundColor} strokeWidth={2} />
      <line x1={0} y1={riverBottom + 4} x2={W} y2={riverBottom + 4} stroke={lampColor} strokeWidth={1} strokeOpacity={0.7} />
    </g>
  );
}
