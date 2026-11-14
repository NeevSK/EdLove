import React from 'react';
import type { SceneLayerProps } from './types';

export function SparkWorldScene({
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
  const pylonTop = hy + 30;

  return (
    <g data-world-layer="spark-neon-skyline">
      <defs>
        {/* Angular High-Voltage Gradient */}
        <linearGradient id={`${id}-spark-ground`} x1="0" x2="0" y1={hy} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} />
          <stop offset="45%" stopColor={lampColor} stopOpacity={0.8} />
          <stop offset="85%" stopColor={ornamentColor} stopOpacity={0.65} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.9} />
        </linearGradient>

        {/* Diagonal Neon Vector Beam Gradient */}
        <linearGradient id={`${id}-spark-beam`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={effectiveGlow} stopOpacity={0.9} />
          <stop offset="60%" stopColor={ornamentColor} stopOpacity={0.4} />
          <stop offset="100%" stopColor={inkColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 1. Sharp Angular Skyline Silhouettes on Horizon */}
      <polygon
        points={`0,${hy + 20} 180,${hy - 65} 240,${hy - 25} 380,${hy - 95} 440,${hy + 10} 620,${hy - 45} 780,${hy - 120} 860,${hy + 5} 1040,${hy - 70} 1180,${hy - 30} 1320,${hy - 85} ${W},${hy} ${W},${pylonTop} 0,${pylonTop}`}
        fill={inkColor}
        fillOpacity={0.85}
      />

      {/* 2. Dynamic Diagonal Light Guides / Vector Traces */}
      {[0.12, 0.34, 0.58, 0.82].map((ratio, idx) => {
        const sx = W * ratio;
        const sy = hy - 140;
        return (
          <line
            key={`beam-trace-${idx}`}
            x1={sx}
            y1={sy}
            x2={sx + 160}
            y2={pylonTop}
            stroke={`url(#${id}-spark-beam)`}
            strokeWidth={1.8}
            strokeDasharray="8 6"
          />
        );
      })}

      {/* 3. High-Contrast Electric Grid Ground */}
      <rect
        x={0}
        y={pylonTop}
        width={W}
        height={H - pylonTop}
        fill={`url(#${id}-spark-ground)`}
      />

      {/* Razor-sharp Neon Horizon Guide Lines */}
      <line x1={0} y1={pylonTop} x2={W} y2={pylonTop} stroke={effectiveGlow} strokeWidth={2} />
      <line x1={0} y1={pylonTop + 4} x2={W} y2={pylonTop + 4} stroke={ornamentColor} strokeWidth={1} strokeOpacity={0.7} />

      {/* 4. High-Voltage Transmission Mast & Floodlight Posts */}
      {[0.22, 0.72].map((ratio, idx) => {
        const mx = W * ratio;
        const my = pylonTop;
        const mastH = 130;
        return (
          <g key={`pylon-mast-${idx}`} stroke={groundColor} strokeWidth={1.4} fill="none">
            {/* Tapered triangular lattice mast */}
            <line x1={mx - 18} y1={my} x2={mx - 4} y2={my - mastH} />
            <line x1={mx + 18} y1={my} x2={mx + 4} y2={my - mastH} />
            {/* Cross braces */}
            <line x1={mx - 16} y1={my - 30} x2={mx + 12} y2={my - 65} strokeOpacity={0.6} />
            <line x1={mx + 16} y1={my - 30} x2={mx - 12} y2={my - 65} strokeOpacity={0.6} />
            <line x1={mx - 12} y1={my - 65} x2={mx + 8} y2={my - 100} strokeOpacity={0.6} />
            <line x1={mx + 12} y1={my - 65} x2={mx - 8} y2={my - 100} strokeOpacity={0.6} />
            {/* Mast top floodlight head */}
            <rect
              x={mx - 12}
              y={my - mastH - 8}
              width={24}
              height={8}
              fill={effectiveGlow}
              stroke="none"
            />
            {/* Neon halo emitter */}
            <circle cx={mx} cy={my - mastH - 4} r={3} fill="#FFFFFF" stroke="none" />
            {!day && (
              <circle
                cx={mx}
                cy={my - mastH - 4}
                r={36}
                fill={effectiveGlow}
                fillOpacity={0.25}
                stroke="none"
              />
            )}
          </g>
        );
      })}

      {/* 5. Electric Kinetic Sparks / High Energy Particles */}
      {Array.from({ length: 18 }, (_, i) => {
        const kx = (i * 79 + 41) % W;
        const ky = hy - 60 + ((i * 53) % 120);
        return (
          <g key={`spark-particle-${i}`}>
            <rect
              x={kx}
              y={ky}
              width={2.5}
              height={2.5}
              fill={effectiveGlow}
              transform={`rotate(45 ${kx} ${ky})`}
            />
          </g>
        );
      })}
    </g>
  );
}
