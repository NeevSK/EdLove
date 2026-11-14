import React, { useId, useMemo } from 'react';
import { createHarmonicPath } from './artisticMath';
import { mixHex } from '@repo/ui/theme/scene';
import type { SceneLayerProps } from './types';

/**
 * World 1: Sanctuary (The Universal Breath of Space & Infinite Light)
 *
 * Visual Concept:
 * Completely unbounded, pure, and serene.
 * ZERO dark bounding boxes, zero heavy brown slabs, zero artificial walls.
 * An immense, breathtaking horizon where soft dawn/twilight sky grades
 * seamlessly into vast, warm, golden ground.
 *
 * Far gentle mountain ridges whisper in the morning mist.
 * Soft cathedral-like light beams filter from the upper sky.
 * A delicate, living shelter branch drapes gracefully from the corner.
 * A pure, serene reflecting pool mirrors the clouds and celestial sun/moon.
 */
export function SanctuaryWorldScene({
  id: baseId,
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
  const localId = useId().replace(/:/g, '_');
  const id = `${baseId}_${localId}`;

  // Vast, open horizon placed low to maximize vertical cathedral breathing space
  const horizonY = hy + H * 0.05;

  // Distant majestic mountain ridges
  const distantPeaks = useMemo(() => {
    return createHarmonicPath(0, W, horizonY - 28, 22, 1.8, 36, [
      { freq: 0.65, amp: 0.65, phase: 0.4 },
      { freq: 1.5, amp: 0.25, phase: 1.8 },
      { freq: 3.2, amp: 0.1, phase: 0.9 },
    ]);
  }, [W, horizonY]);

  // Gentle, calm water ripples across the lower half
  const ripples = useMemo(() => {
    const list: { d: string; opacity: number }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const y = horizonY + 35 + progress * (H - horizonY - 45);
      const span = 140 + ((i * 67) % 280);
      const cx = (i * 179) % (W - span) + span / 2;
      const d = createHarmonicPath(cx - span / 2, cx + span / 2, y, 1.2, i * 2.3, 20);
      list.push({
        d,
        opacity: (0.12 + (day ? 0.14 : 0.05) + (i % 2) * 0.06) * veil,
      });
    }
    return list;
  }, [horizonY, H, W, day, veil]);

  return (
    <g data-world-layer="sanctuary-infinite-spacious-haven">
      <defs>
        {/* Atmospheric diffusion filter */}
        <filter id={`${id}-haze`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
        </filter>

        {/* Seamless Soft Golden Earth Gradient (No hard brown edges) */}
        <linearGradient
          id={`${id}-golden-earth-blend`}
          x1="0"
          x2="0"
          y1={horizonY - 40}
          y2={H}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={palette.horizon} stopOpacity={0} />
          <stop offset="25%" stopColor={palette.horizon} stopOpacity={0.65} />
          <stop offset="50%" stopColor={groundColor} stopOpacity={0.88} />
          <stop offset="100%" stopColor={mixHex(groundColor, '#E8DCBF', 0.6)} />
        </linearGradient>

        {/* Cathedral Sunbeams / Heavenly Light Streams */}
        <linearGradient id={`${id}-cathedral-rays`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.28 * veil} />
          <stop offset="45%" stopColor={effectiveGlow} stopOpacity={0.12 * veil} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>

        {/* Water Sheen Gradient */}
        <linearGradient id={`${id}-water-sheen`} x1="0" x2="0" y1={horizonY} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.horizon} stopOpacity={0.4} />
          <stop offset="40%" stopColor={effectiveGlow} stopOpacity={0.15} />
          <stop offset="100%" stopColor={palette.horizon} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* =========================================================================
          PLANE 1: NOBLE DISTANT NATURE & TRANSCENDENT HORIZON
          ========================================================================= */}
      {/* Majestic far mountains whispering on the horizon */}
      <path
        d={`${distantPeaks} L${W} ${horizonY + 15} L0 ${horizonY + 15} Z`}
        fill={inkColor}
        fillOpacity={0.15 + (day ? 0.08 : 0.03)}
      />

      {/* Atmospheric Horizon Veil (Seamless mist dissolve) */}
      <rect
        x={0}
        y={horizonY - 35}
        width={W}
        height={70}
        fill={palette.horizon}
        fillOpacity={0.55 * veil}
        filter={`url(#${id}-haze)`}
      />

      {/* Cathedral light streams pouring down from the heavens */}
      {day && (
        <g opacity={0.85}>
          <polygon
            points={`${W * 0.18},0 ${W * 0.4},0 ${W * 0.65},${H} ${W * 0.35},${H}`}
            fill={`url(#${id}-cathedral-rays)`}
          />
          <polygon
            points={`${W * 0.52},0 ${W * 0.74},0 ${W * 0.98},${H} ${W * 0.68},${H}`}
            fill={`url(#${id}-cathedral-rays)`}
          />
        </g>
      )}

      {/* =========================================================================
          PLANE 2: SEAMLESS VAST GOLDEN GROUND & WATER MIRROR
          (ZERO DARK BOXES, PURE OPEN BREATH)
          ========================================================================= */}
      <rect
        x={0}
        y={horizonY - 20}
        width={W}
        height={H - horizonY + 20}
        fill={`url(#${id}-golden-earth-blend)`}
      />

      {/* Soft reflective water sheen over the ground */}
      <rect
        x={0}
        y={horizonY + 10}
        width={W}
        height={H - horizonY - 10}
        fill={`url(#${id}-water-sheen)`}
      />

      {/* Natural horizontal light ripples across the calm surface */}
      {ripples.map((rip, i) => (
        <path
          key={`calm-ripple-${i}`}
          d={rip.d}
          fill="none"
          stroke={effectiveGlow}
          strokeWidth={1.2}
          strokeOpacity={rip.opacity}
          strokeLinecap="round"
        />
      ))}

      {/* Celestial light pool reflection in the center */}
      <ellipse
        cx={W * 0.5}
        cy={horizonY + (H - horizonY) * 0.38}
        rx={90}
        ry={18}
        fill={effectiveGlow}
        fillOpacity={day ? 0.22 : 0.45}
        filter={`url(#${id}-haze)`}
      />

      {/* =========================================================================
          PLANE 3: THE LIVING SHELTER CANOPY (UPPER CORNER - LIFE & PROTECTION)
          ========================================================================= */}
      <g opacity={0.85}>
        {/* Graceful limb sweeping across top-left */}
        <path
          d={`M-30 -20 Q110 32 230 52 Q350 68 480 42 Q370 85 210 74 Q80 68 -30 45 Z`}
          fill={inkColor}
        />
        {/* Soft living leaf clusters */}
        {[
          { cx: 140, cy: 75, rx: 32, ry: 18, rot: 20 },
          { cx: 220, cy: 90, rx: 38, ry: 20, rot: 10 },
          { cx: 310, cy: 98, rx: 42, ry: 22, rot: -8 },
          { cx: 400, cy: 85, rx: 36, ry: 19, rot: 25 },
          { cx: 460, cy: 62, rx: 30, ry: 16, rot: 15 },
          { cx: 340, cy: 50, rx: 34, ry: 18, rot: -15 },
          { cx: 240, cy: 38, rx: 40, ry: 20, rot: 5 },
        ].map((c, idx) => (
          <ellipse
            key={`canopy-cluster-${idx}`}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill={ornamentColor}
            fillOpacity={0.65 + (idx % 2) * 0.1}
            transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}
          />
        ))}
      </g>
    </g>
  );
}

