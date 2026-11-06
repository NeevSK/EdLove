import React from 'react';
import type { SceneLayerProps } from './types';

export function KandyanWorldScene({
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
  const wallTop = hy + 35;
  const unitW = 48; // Width of one Walakulu cloud scallop unit
  const scallopCount = Math.ceil(W / unitW) + 1;

  return (
    <g data-world-layer="kandyan-walakulu-temple">
      <defs>
        {/* Ochre & Terracotta Temple Fresco Earth Gradient */}
        <linearGradient id={`${id}-kandyan-terracotta`} x1="0" x2="0" y1={hy} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} stopOpacity={0.9} />
          <stop offset="30%" stopColor={lampColor} stopOpacity={0.8} />
          <stop offset="70%" stopColor={ornamentColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.95} />
        </linearGradient>

        <linearGradient id={`${id}-kandyan-plaster`} x1="0" x2="0" y1={wallTop} y2={wallTop + 80} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={groundColor} stopOpacity={0.95} />
          <stop offset="100%" stopColor={lampColor} stopOpacity={0.4} />
        </linearGradient>
      </defs>

      {/* Layer 1: Distant Hill Country Ridges Behind Temple */}
      <path
        d={`M0 ${hy - 25} Q360 ${hy - 75} 720 ${hy - 40} T1440 ${hy - 65} L${W} ${wallTop} L0 ${wallTop} Z`}
        fill={inkColor}
        fillOpacity={0.4}
      />

      {/* Layer 2: Traditional Kandyan Carved Timber Eaves & Overhangs */}
      <path
        d={`M0 ${hy - 10} Q360 ${hy - 35} 720 ${hy - 18} T${W} ${hy - 28} L${W} ${hy + 15} L0 ${hy + 15} Z`}
        fill={inkColor}
        fillOpacity={0.85}
      />
      {/* Decorative eave rafters */}
      {Array.from({ length: Math.ceil(W / 24) }, (_, i) => (
        <line
          key={`rafter-${i}`}
          x1={i * 24}
          y1={hy - 8}
          x2={i * 24 + 6}
          y2={hy + 15}
          stroke={ornamentColor}
          strokeWidth={1.4}
          strokeOpacity={0.5}
        />
      ))}

      {/* Layer 3: Lime-Washed "Walakulu Bamma" (Cloud Wall Parapet) */}
      {/* Wall Base Plaster */}
      <rect
        x={0}
        y={wallTop + 16}
        width={W}
        height={H - wallTop - 16}
        fill={`url(#${id}-kandyan-terracotta)`}
      />

      {/* Authentic Scalloped Cloud Wall Crenellations (Walakulu) */}
      <g fill={`url(#${id}-kandyan-plaster)`} stroke={inkColor} strokeWidth={1.2}>
        {Array.from({ length: scallopCount }, (_, i) => {
          const x = i * unitW;
          return (
            <g key={`walakulu-${i}`}>
              {/* Triangular peaked crenellation with circular cutout window */}
              <path
                d={`M${x} ${wallTop + 18} L${x + unitW * 0.5} ${wallTop} L${x + unitW} ${wallTop + 18} Z`}
              />
              {/* Pierced window niche (oil lamp alcove / deepa kuuduwa) */}
              <circle
                cx={x + unitW * 0.5}
                cy={wallTop + 11}
                r={4}
                fill={day ? inkColor : lampColor}
                stroke="none"
              />
              {/* Glowing lamp flame at dusk and night */}
              {!day && (
                <ellipse
                  cx={x + unitW * 0.5}
                  cy={wallTop + 11}
                  rx={2.2}
                  ry={3}
                  fill={effectiveGlow}
                  stroke="none"
                />
              )}
            </g>
          );
        })}
      </g>

      {/* Horizontal Stone String Courses */}
      <line x1={0} y1={wallTop + 18} x2={W} y2={wallTop + 18} stroke={inkColor} strokeWidth={2} />
      <line x1={0} y1={wallTop + 24} x2={W} y2={wallTop + 24} stroke={ornamentColor} strokeWidth={1} />

      {/* Layer 4: Classical Sri Lankan "Liyawela" (Flowing Vine Band) Fresco Motif */}
      <g opacity={0.75}>
        {Array.from({ length: Math.ceil(W / 96) }, (_, i) => {
          const x = i * 96;
          const y = wallTop + 55;
          return (
            <g key={`liyawela-${i}`}>
              {/* Flowing sinusoidal vine stem */}
              <path
                d={`M${x} ${y} C${x + 24} ${y - 20}, ${x + 48} ${y + 20}, ${x + 72} ${y - 12} S${x + 96} ${y}, ${x + 96} ${y}`}
                fill="none"
                stroke={ornamentColor}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
              {/* Curled leaf tendril buds */}
              <circle cx={x + 32} cy={y - 12} r={3.5} fill={lampColor} />
              <circle cx={x + 64} cy={y + 12} r={3} fill={groundColor} />
            </g>
          );
        })}
      </g>

      {/* Subtle lower horizontal ground borders */}
      <line x1={0} y1={wallTop + 85} x2={W} y2={wallTop + 85} stroke={ornamentColor} strokeWidth={1.5} strokeOpacity={0.4} />
      <line x1={0} y1={wallTop + 90} x2={W} y2={wallTop + 90} stroke={lampColor} strokeWidth={1} strokeOpacity={0.3} />
    </g>
  );
}
