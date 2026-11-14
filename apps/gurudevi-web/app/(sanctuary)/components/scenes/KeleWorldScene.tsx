import React from 'react';
import { roundTo } from './artisticMath';
import type { SceneLayerProps } from './types';

export function KeleWorldScene({
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
    <g data-world-layer="kele-sinharaja-canopy">
      <defs>
        {/* Deep Rainforest Gradient */}
        <linearGradient id={`${id}-kele-deep-sky`} x1="0" x2="0" y1={hy - 150} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} stopOpacity={0.5} />
          <stop offset="40%" stopColor={ornamentColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.95} />
        </linearGradient>

        <linearGradient id={`${id}-kele-canopy-grad`} x1="0" x2="0" y1={hy - 80} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} stopOpacity={0.85} />
          <stop offset="50%" stopColor={lampColor} stopOpacity={0.75} />
          <stop offset="100%" stopColor={inkColor} stopOpacity={0.95} />
        </linearGradient>

        {/* Ambient Mist Valley Gradient */}
        <linearGradient id={`${id}-kele-mist`} x1="0" x2="0" y1={hy - 30} y2={hy + 90} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.horizon} stopOpacity={0} />
          <stop offset="50%" stopColor={palette.horizon} stopOpacity={0.4 * veil + 0.1} />
          <stop offset="100%" stopColor={palette.horizon} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Layer 1: Distant Misty Ridge of Rainforest Trees */}
      <path
        d={`M0 ${hy - 60} Q220 ${hy - 110} 500 ${hy - 75} T1000 ${hy - 120} Q1220 ${hy - 85} ${W} ${hy - 50} L${W} ${H} L0 ${H} Z`}
        fill={`url(#${id}-kele-deep-sky)`}
      />

      {/* Layer 2: Intermediate Rolling Forest Valley Canopy */}
      {Array.from({ length: 14 }, (_, i) => {
        const cx = i * 115 + 20;
        const cy = roundTo(hy - 40 - Math.sin(i * 0.8) * 35, 3);
        const rx = 75 + ((i * 19) % 30);
        const ry = 42 + ((i * 13) % 20);
        return (
          <ellipse
            key={`canopy-mid-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={ornamentColor}
            fillOpacity={0.65}
          />
        );
      })}

      {/* Layer 3: Soft Valley Mist Band */}
      <rect x={0} y={hy - 30} width={W} height={120} fill={`url(#${id}-kele-mist)`} />

      {/* Layer 4: Close Sinharaja Emergent Canopy & Hanging Foliage */}
      <path
        d={`M0 ${hy + 10} Q180 ${hy - 30} 380 ${hy + 15} T800 ${hy - 20} Q1120 ${hy + 25} ${W} ${hy} L${W} ${H} L0 ${H} Z`}
        fill={`url(#${id}-kele-canopy-grad)`}
      />

      {/* Majestic emergent tree crowns */}
      {[0.12, 0.38, 0.64, 0.88].map((ratio, idx) => {
        const cx = W * ratio;
        const cy = hy + 15 + ((idx * 23) % 30);
        return (
          <g key={`emergent-${idx}`}>
            {/* Trunk silhouette */}
            <path
              d={`M${cx - 4} ${H} L${cx - 2} ${cy + 30} Q${cx - 1} ${cy + 10} ${cx} ${cy} Q${cx + 2} ${cy + 10} ${cx + 3} ${cy + 30} L${cx + 5} ${H} Z`}
              fill={inkColor}
              fillOpacity={0.85}
            />
            {/* Crown cluster */}
            <ellipse cx={cx} cy={cy} rx={95} ry={48} fill={inkColor} fillOpacity={0.9} />
            <ellipse cx={cx - 35} cy={cy - 12} rx={60} ry={35} fill={lampColor} fillOpacity={0.55} />
            <ellipse cx={cx + 38} cy={cy - 8} rx={65} ry={38} fill={ornamentColor} fillOpacity={0.65} />
            <ellipse cx={cx} cy={cy - 18} rx={55} ry={30} fill={groundColor} fillOpacity={0.2} />
          </g>
        );
      })}

      {/* Delicate Hanging Creepers / Lianas from Canopy */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = 80 + i * 160 + ((i * 31) % 40);
        const startY = hy + 25;
        const len = 70 + ((i * 47) % 85);
        return (
          <path
            key={`liana-${i}`}
            d={`M${x} ${startY} Q${x + 12} ${startY + len * 0.5} ${x - 4} ${startY + len}`}
            fill="none"
            stroke={inkColor}
            strokeWidth={1.4}
            strokeOpacity={0.6}
            strokeLinecap="round"
          />
        );
      })}

      {/* Bioluminescent Forest Floor Fireflies (active at twilight & night) */}
      {!day &&
        Array.from({ length: 16 }, (_, i) => {
          const fx = ((i * 97 + 53) % W);
          const fy = hy + 60 + ((i * 61 + 23) % (H - hy - 90));
          return (
            <g key={`firefly-${i}`}>
              <circle cx={fx} cy={fy} r={2} fill={effectiveGlow} fillOpacity={0.85} />
              <circle cx={fx} cy={fy} r={6} fill={effectiveGlow} fillOpacity={0.25} />
            </g>
          );
        })}
    </g>
  );
}
