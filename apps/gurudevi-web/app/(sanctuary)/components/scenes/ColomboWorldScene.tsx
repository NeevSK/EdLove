import React from 'react';
import type { SceneLayerProps } from './types';

export function ColomboWorldScene({
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
  const oceanTop = hy + 20;
  const breakwaterTop = H * 0.78;

  return (
    <g data-world-layer="colombo-harbour-coast">
      <defs>
        {/* Ocean Horizon & Deep Water Gradient */}
        <linearGradient id={`${id}-colombo-ocean`} x1="0" x2="0" y1={oceanTop} y2={breakwaterTop} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.horizon} stopOpacity={0.65} />
          <stop offset="40%" stopColor={inkColor} stopOpacity={0.8} />
          <stop offset="100%" stopColor={lampColor} stopOpacity={0.7} />
        </linearGradient>

        {/* Breakwater & Granite Pier Gradient */}
        <linearGradient id={`${id}-colombo-pier`} x1="0" x2="0" y1={breakwaterTop} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={inkColor} />
          <stop offset="50%" stopColor={ornamentColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={groundColor} stopOpacity={0.9} />
        </linearGradient>

        {/* Lighthouse Sweeping Beam Gradient */}
        <linearGradient id={`${id}-lighthouse-beam`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
          <stop offset="25%" stopColor={effectiveGlow} stopOpacity={0.4} />
          <stop offset="100%" stopColor={effectiveGlow} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 1. Distant Coastal Horizon Line */}
      <line x1={0} y1={oceanTop} x2={W} y2={oceanTop} stroke={palette.horizon} strokeWidth={1.5} />

      {/* 2. Indian Ocean Waters with Coastal Swell Lines */}
      <rect
        fill={`url(#${id}-colombo-ocean)`}
        height={breakwaterTop - oceanTop}
        width={W}
        x={0}
        y={oceanTop}
      />

      {/* Gentle horizontal ocean swell lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const y = oceanTop + 15 + i * 22;
        const w = 140 + ((i * 59) % 220);
        const x = (i * 163) % (W - w);
        return (
          <line
            key={`ocean-swell-${i}`}
            x1={x}
            y1={y}
            x2={x + w}
            y2={y}
            stroke={effectiveGlow}
            strokeWidth={1.2}
            strokeOpacity={0.25 * veil}
          />
        );
      })}

      {/* 3. Distant Colombo Port Cranes & Maritime Silhouettes */}
      {[0.15, 0.28, 0.42].map((ratio, idx) => {
        const cx = W * ratio;
        const cy = oceanTop;
        const craneH = 42 + idx * 6;
        return (
          <g key={`port-crane-${idx}`} stroke={inkColor} strokeWidth={1.5} fill="none" opacity={0.65}>
            {/* Crane A-frame leg */}
            <line x1={cx - 10} y1={cy} x2={cx} y2={cy - craneH} />
            <line x1={cx + 10} y1={cy} x2={cx} y2={cy - craneH} />
            {/* Horizontal boom arm */}
            <line x1={cx - 15} y1={cy - craneH + 8} x2={cx + 36} y2={cy - craneH + 8} />
            {/* Cable tie */}
            <line x1={cx} y1={cy - craneH} x2={cx + 34} y2={cy - craneH + 8} strokeWidth={0.8} />
            {/* Warning beacon light */}
            <circle cx={cx} cy={cy - craneH} r={1.5} fill="#FF5252" stroke="none" />
          </g>
        );
      })}

      {/* 4. Colombo Harbour Lighthouse on the Point */}
      <g>
        const lhX = W * 0.78;
        const lhY = oceanTop - 4;
        {/* Lighthouse tower */}
        <polygon
          points={`${W * 0.78 - 6},${oceanTop + 30} ${W * 0.78 + 6},${oceanTop + 30} ${W * 0.78 + 4},${oceanTop - 36} ${W * 0.78 - 4},${oceanTop - 36}`}
          fill={inkColor}
          stroke={groundColor}
          strokeWidth={0.8}
        />
        {/* Lantern room */}
        <rect
          x={W * 0.78 - 5}
          y={oceanTop - 46}
          width={10}
          height={10}
          fill={effectiveGlow}
          stroke={inkColor}
          strokeWidth={1}
        />
        {/* Sweeping lighthouse light beam across night water */}
        {!day && (
          <polygon
            points={`${W * 0.78 + 5},${oceanTop - 41} ${W},${oceanTop - 70} ${W},${oceanTop + 10}`}
            fill={`url(#${id}-lighthouse-beam)`}
            opacity={0.65}
          />
        )}
      </g>

      {/* 5. Granite Breakwater Promenade & Port Pier */}
      <rect
        x={0}
        y={breakwaterTop}
        width={W}
        height={H - breakwaterTop}
        fill={`url(#${id}-colombo-pier)`}
      />
      <line x1={0} y1={breakwaterTop} x2={W} y2={breakwaterTop} stroke={lampColor} strokeWidth={2} />
      <line x1={0} y1={breakwaterTop + 5} x2={W} y2={breakwaterTop + 5} stroke={ornamentColor} strokeWidth={1} strokeOpacity={0.6} />

      {/* Harbour city navigational buoy lights */}
      {Array.from({ length: 6 }, (_, i) => {
        const bx = W * 0.12 + i * (W * 0.14);
        const by = oceanTop + 45 + ((i * 17) % 35);
        return (
          <g key={`buoy-${i}`}>
            <circle cx={bx} cy={by} r={2} fill={i % 2 === 0 ? '#00E676' : '#FF1744'} />
            {!day && <circle cx={bx} cy={by} r={6} fill={i % 2 === 0 ? '#00E676' : '#FF1744'} fillOpacity={0.3} />}
          </g>
        );
      })}
    </g>
  );
}
