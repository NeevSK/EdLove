import React from 'react';
import type { SceneLayerProps } from './types';

export function TeaWorldScene({
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
  return (
    <g data-world-layer="tea-mountain-terraces">
      <defs>
        {/* Distant Misty Mountain Peak Gradient */}
        <linearGradient id={`${id}-tea-peak`} x1="0" x2="0" y1={hy - 140} y2={hy + 50} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.horizon} stopOpacity={0.6} />
          <stop offset="50%" stopColor={inkColor} stopOpacity={0.5} />
          <stop offset="100%" stopColor={ornamentColor} stopOpacity={0.8} />
        </linearGradient>

        {/* Sloping Tea Estate Ridge Gradient */}
        <linearGradient id={`${id}-tea-terraces-grad`} x1="0" x2="0" y1={hy - 60} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} stopOpacity={0.8} />
          <stop offset="35%" stopColor={lampColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.95} />
        </linearGradient>

        {/* Mountain Mist Layers */}
        <linearGradient id={`${id}-tea-mountain-mist`} x1="0" x2="0" y1={hy - 20} y2={hy + 40} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.horizon} stopOpacity={0} />
          <stop offset="50%" stopColor={palette.horizon} stopOpacity={0.55 * veil} />
          <stop offset="100%" stopColor={palette.horizon} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Layer 1: Distant Knuckles / Central Highlands Jagged Peak Ridge */}
      <path
        d={`M0 ${hy - 50} L180 ${hy - 110} L340 ${hy - 65} L520 ${hy - 135} L760 ${hy - 70} L940 ${hy - 125} L1180 ${hy - 60} L1320 ${hy - 95} L${W} ${hy - 40} L${W} ${H} L0 ${H} Z`}
        fill={`url(#${id}-tea-peak)`}
      />

      {/* Layer 2: Drifting Mountain Gap Mist */}
      <rect x={0} y={hy - 30} width={W} height={70} fill={`url(#${id}-tea-mountain-mist)`} />

      {/* Layer 3: Sweeping Undulating Tea Estate Slope */}
      <path
        d={`M0 ${hy - 20} Q320 ${hy - 90} 700 ${hy - 35} T1250 ${hy - 70} Q1380 ${hy - 45} ${W} ${hy - 10} L${W} ${H} L0 ${H} Z`}
        fill={`url(#${id}-tea-terraces-grad)`}
      />

      {/* Layer 4: Contour Planting Lines (Curving Along the Slope of the Mountain) */}
      {Array.from({ length: 9 }, (_, i) => {
        const yBase = hy + 20 + i * 42;
        const dip = 25 + (i % 3) * 15;
        return (
          <g key={`tea-contour-group-${i}`}>
            {/* Primary contour line */}
            <path
              d={`M0 ${yBase} Q340 ${yBase - dip} 720 ${yBase + 10} T1260 ${yBase - dip * 0.8} Q1380 ${yBase - 5} ${W} ${yBase + 15}`}
              fill="none"
              stroke={ornamentColor}
              strokeOpacity={0.45 - i * 0.03}
              strokeWidth={2}
            />
            {/* Dotted texture of tea bushes along contour */}
            <path
              d={`M0 ${yBase - 4} Q340 ${yBase - dip - 4} 720 ${yBase + 6} T1260 ${yBase - dip * 0.8 - 4} Q1380 ${yBase - 9} ${W} ${yBase + 11}`}
              fill="none"
              stroke={groundColor}
              strokeOpacity={0.35}
              strokeWidth={1.2}
              strokeDasharray="4 6"
            />
          </g>
        );
      })}

      {/* Layer 5: Tall Slender Silver Oak Shade Trees (Windbreaks) */}
      {[0.16, 0.42, 0.68, 0.86].map((ratio, idx) => {
        const tx = W * ratio;
        const ty = hy + 40 + idx * 30;
        const h = 110 + ((idx * 29) % 35);
        return (
          <g key={`shade-tree-${idx}`}>
            {/* Slender trunk */}
            <line
              x1={tx}
              y1={ty}
              x2={tx}
              y2={ty - h}
              stroke={inkColor}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeOpacity={0.8}
            />
            {/* Light feathery canopy tufts */}
            <ellipse cx={tx} cy={ty - h} rx={16} ry={24} fill={ornamentColor} fillOpacity={0.7} />
            <ellipse cx={tx - 7} cy={ty - h + 18} rx={14} ry={20} fill={lampColor} fillOpacity={0.65} />
            <ellipse cx={tx + 8} cy={ty - h + 22} rx={13} ry={18} fill={inkColor} fillOpacity={0.75} />
          </g>
        );
      })}
    </g>
  );
}
