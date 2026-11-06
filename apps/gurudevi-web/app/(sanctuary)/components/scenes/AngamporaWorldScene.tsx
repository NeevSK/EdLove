import React from 'react';
import type { SceneLayerProps } from './types';

export function AngamporaWorldScene({
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
  const arenaTop = hy + 40;

  return (
    <g data-world-layer="angampora-arena">
      <defs>
        {/* Packed Red Earth & Clay Rampart Gradient */}
        <linearGradient id={`${id}-angam-earth`} x1="0" x2="0" y1={hy - 20} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} stopOpacity={0.85} />
          <stop offset="35%" stopColor={lampColor} stopOpacity={0.75} />
          <stop offset="80%" stopColor={ornamentColor} stopOpacity={0.65} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.9} />
        </linearGradient>

        {/* Timber Post Gradient */}
        <linearGradient id={`${id}-angam-timber`} x1="0" x2="0" y1={hy - 80} y2={arenaTop} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} />
          <stop offset="100%" stopColor={lampColor} stopOpacity={0.9} />
        </linearGradient>

        {/* Brass Cauldron Fire Radial Gradient */}
        <radialGradient id={`${id}-angam-flame`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF2D6" />
          <stop offset="30%" stopColor={effectiveGlow} />
          <stop offset="70%" stopColor={lampColor} />
          <stop offset="100%" stopColor={inkColor} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* 1. Grounded Earthen Arena Boundary Ridge */}
      <path
        d={`M0 ${hy - 15} Q350 ${hy - 55} 700 ${hy - 20} T1400 ${hy - 45} L${W} ${arenaTop} L0 ${arenaTop} Z`}
        fill={`url(#${id}-angam-earth)`}
      />

      {/* 2. Heavy Square Carved Wooden Pillars (Angam Maduva Frame) */}
      {[0.14, 0.38, 0.62, 0.86].map((ratio, idx) => {
        const px = W * ratio;
        const postW = 16;
        const postH = 110;
        return (
          <g key={`angam-pillar-${idx}`}>
            {/* Main square pillar shaft */}
            <rect
              x={px - postW / 2}
              y={arenaTop - postH}
              width={postW}
              height={postH}
              fill={`url(#${id}-angam-timber)`}
              stroke={inkColor}
              strokeWidth={1.5}
            />
            {/* Squared capital block (Pekada bracket) */}
            <rect
              x={px - postW}
              y={arenaTop - postH - 12}
              width={postW * 2}
              height={12}
              fill={ornamentColor}
              stroke={inkColor}
              strokeWidth={1.5}
            />
            {/* Post stone footing base */}
            <polygon
              points={`${px - postW - 4},${arenaTop} ${px + postW + 4},${arenaTop} ${px + postW},${arenaTop - 14} ${px - postW},${arenaTop - 14}`}
              fill={inkColor}
              stroke={ornamentColor}
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* Heavy Cross Beam Lintel connecting pillars */}
      <rect
        x={0}
        y={arenaTop - 122}
        width={W}
        height={10}
        fill={inkColor}
        fillOpacity={0.88}
      />
      <rect
        x={0}
        y={arenaTop - 114}
        width={W}
        height={2}
        fill={ornamentColor}
        fillOpacity={0.6}
      />

      {/* 3. Deep Packed Earth Platform / Arena Floor */}
      <rect
        x={0}
        y={arenaTop}
        width={W}
        height={H - arenaTop}
        fill={`url(#${id}-angam-earth)`}
      />

      {/* Ground boundary stepping edge */}
      <line x1={0} y1={arenaTop} x2={W} y2={arenaTop} stroke={ornamentColor} strokeWidth={2.5} />
      <line x1={0} y1={arenaTop + 6} x2={W} y2={arenaTop + 6} stroke={inkColor} strokeWidth={1} strokeOpacity={0.6} />

      {/* 4. Traditional Brass Fire Cauldrons (Pandam) on Tripod Stands */}
      {[0.26, 0.74].map((ratio, idx) => {
        const bx = W * ratio;
        const by = arenaTop + 35;
        return (
          <g key={`angam-cauldron-${idx}`}>
            {/* Tripod legs */}
            <line x1={bx} y1={by} x2={bx - 14} y2={by + 36} stroke={ornamentColor} strokeWidth={2} />
            <line x1={bx} y1={by} x2={bx + 14} y2={by + 36} stroke={ornamentColor} strokeWidth={2} />
            <line x1={bx} y1={by} x2={bx} y2={by + 38} stroke={ornamentColor} strokeWidth={2.5} />

            {/* Brass bowl */}
            <path
              d={`M${bx - 18} ${by} Q${bx} ${by + 16} ${bx + 18} ${by} Z`}
              fill={ornamentColor}
              stroke={inkColor}
              strokeWidth={1.2}
            />

            {/* Luminous Fire / Charcoal Core */}
            <ellipse
              cx={bx}
              cy={by - 2}
              rx={12}
              ry={5}
              fill={effectiveGlow}
            />
            {/* Flame tongue */}
            <path
              d={`M${bx - 10} ${by - 2} Q${bx - 12} ${by - 22} ${bx} ${by - 32} Q${bx + 12} ${by - 20} ${bx + 10} ${by - 2} Z`}
              fill={`url(#${id}-angam-flame)`}
            />

            {/* Ambient flame halo at dusk / night */}
            {!day && (
              <circle
                cx={bx}
                cy={by - 12}
                r={44}
                fill={effectiveGlow}
                fillOpacity={0.22}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
