import React from 'react';
import type { SceneLayerProps } from './types';

export function PeraheraWorldScene({
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
  const roadTop = hy + 50;

  return (
    <g data-world-layer="perahera-procession-night">
      <defs>
        {/* Festive Procession Boulevard Dusk Gradient */}
        <linearGradient id={`${id}-perahera-ground`} x1="0" x2="0" y1={hy} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} />
          <stop offset="45%" stopColor={lampColor} stopOpacity={0.8} />
          <stop offset="85%" stopColor={ornamentColor} stopOpacity={0.65} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.9} />
        </linearGradient>

        {/* Torch Flame Radial Glow */}
        <radialGradient id={`${id}-torch-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFE082" />
          <stop offset="60%" stopColor={lampColor} />
          <stop offset="100%" stopColor={ornamentColor} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* 1. Distant Palace & Temple Roof Silhouette on Horizon */}
      <path
        d={`M0 ${hy + 10} L220 ${hy + 10} L240 ${hy - 25} L260 ${hy + 10} L480 ${hy + 10} L520 ${hy - 45} L540 ${hy - 75} L560 ${hy - 45} L600 ${hy + 10} L900 ${hy + 10} L930 ${hy - 35} L960 ${hy + 10} L${W} ${hy + 10} L${W} ${roadTop} L0 ${roadTop} Z`}
        fill={inkColor}
        fillOpacity={0.7}
      />

      {/* 2. Processional Flags and Streamers (Kodi) hung between posts */}
      <path
        d={`M0 ${hy - 15} Q${W * 0.12} ${hy + 15} ${W * 0.25} ${hy - 15} Q${W * 0.37} ${hy + 15} ${W * 0.5} ${hy - 15} Q${W * 0.62} ${hy + 15} ${W * 0.75} ${hy - 15} Q${W * 0.87} ${hy + 15} ${W} ${hy - 15}`}
        fill="none"
        stroke={ornamentColor}
        strokeWidth={1.5}
        strokeOpacity={0.7}
      />
      {/* Hanging triangular pennants */}
      {Array.from({ length: 24 }, (_, i) => {
        const px = i * (W / 24) + 16;
        const py = hy + Math.sin(i * 0.5) * 8;
        return (
          <polygon
            key={`pennant-${i}`}
            points={`${px - 8},${py} ${px + 8},${py} ${px},${py + 18}`}
            fill={i % 2 === 0 ? lampColor : ornamentColor}
            fillOpacity={0.75}
          />
        );
      })}

      {/* 3. Broad Stone Boulevard (Procession Route) */}
      <rect
        x={0}
        y={roadTop}
        width={W}
        height={H - roadTop}
        fill={`url(#${id}-perahera-ground)`}
      />
      <line x1={0} y1={roadTop} x2={W} y2={roadTop} stroke={lampColor} strokeWidth={2.5} />
      <line x1={0} y1={roadTop + 6} x2={W} y2={roadTop + 6} stroke={ornamentColor} strokeWidth={1} strokeOpacity={0.5} />

      {/* 4. Ceremonial Coconut-Oil Torch Poles (Koppara Pandam) Along Boulevard */}
      {[0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92].map((ratio, idx) => {
        const tx = W * ratio;
        const poleH = 125;
        const ty = roadTop + 20;
        return (
          <g key={`torch-${idx}`}>
            {/* Wooden torch pole */}
            <line
              x1={tx}
              y1={ty + 40}
              x2={tx}
              y2={ty - poleH}
              stroke={inkColor}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* Iron bracket cage basket holding coconut husks */}
            <path
              d={`M${tx - 12} ${ty - poleH} L${tx + 12} ${ty - poleH} L${tx + 8} ${ty - poleH + 18} L${tx - 8} ${ty - poleH + 18} Z`}
              fill={ornamentColor}
              stroke={inkColor}
              strokeWidth={1.2}
            />
            {/* Radiant Torch Flame Tongue */}
            <ellipse
              cx={tx}
              cy={ty - poleH - 8}
              rx={10}
              ry={18}
              fill={`url(#${id}-torch-glow)`}
            />
            <path
              d={`M${tx - 6} ${ty - poleH - 4} Q${tx - 12} ${ty - poleH - 26} ${tx} ${ty - poleH - 36} Q${tx + 10} ${ty - poleH - 22} ${tx + 6} ${ty - poleH - 4} Z`}
              fill="#FFF8E1"
              fillOpacity={0.9}
            />

            {/* Night Radiance Flare */}
            {!day && (
              <circle
                cx={tx}
                cy={ty - poleH - 12}
                r={45}
                fill={effectiveGlow}
                fillOpacity={0.25}
              />
            )}
          </g>
        );
      })}

      {/* 5. Rising Festive Embers & Sparks in the Night Air */}
      {Array.from({ length: 22 }, (_, i) => {
        const ex = ((i * 67 + 31) % W);
        const ey = hy - 40 + ((i * 43) % 110);
        return (
          <circle
            key={`spark-ember-${i}`}
            cx={ex}
            cy={ey}
            r={1.2 + (i % 3) * 0.7}
            fill={effectiveGlow}
            fillOpacity={0.8}
          />
        );
      })}
    </g>
  );
}
