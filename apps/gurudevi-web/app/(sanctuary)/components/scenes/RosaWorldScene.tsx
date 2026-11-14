import React, { useId, useMemo } from 'react';
import { roundTo } from './artisticMath';
import type { SceneLayerProps } from './types';

/**
 * Botanical Pichcha (Jasminum sambac / පිච්ච මල)
 * Hand-picked morning temple jasmine:
 * - 5 curved, velvety ivory petals (creamy white with translucent blush borders)
 * - Delicate central green calyx cup with golden-amber pollen anthers
 * - Morning dewdrops with specular reflections
 */
function createBotanicalPichcha(cx: number, cy: number, r: number, rot = 0) {
  const petals: { d: string; highlightD: string }[] = [];
  const numPetals = 5;

  for (let i = 0; i < numPetals; i++) {
    const angle = (i * (360 / numPetals) + rot) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const perpCos = Math.cos(angle + Math.PI / 2);
    const perpSin = Math.sin(angle + Math.PI / 2);

    const tipX = cx + cos * r;
    const tipY = cy + sin * r;
    const midW = r * 0.42;
    const midL = r * 0.55;
    const midX = cx + cos * midL;
    const midY = cy + sin * midL;

    const leftX = midX - perpCos * midW;
    const leftY = midY - perpSin * midW;
    const rightX = midX + perpCos * midW;
    const rightY = midY + perpSin * midW;

    // Organic petal path with soft natural curve
    const d = `M${roundTo(cx)} ${roundTo(cy)} Q${roundTo(leftX)} ${roundTo(leftY)} ${roundTo(tipX)} ${roundTo(tipY)} Q${roundTo(rightX)} ${roundTo(rightY)} ${roundTo(cx)} ${roundTo(cy)} Z`;

    // Translucent dewy highlight vein running down center
    const highlightD = `M${roundTo(cx + cos * (r * 0.2))} ${roundTo(cy + sin * (r * 0.2))} Q${roundTo(midX + perpCos * (midW * 0.1))} ${roundTo(midY + perpSin * (midW * 0.1))} ${roundTo(tipX - cos * 2)} ${roundTo(tipY - sin * 2)}`;

    petals.push({ d, highlightD });
  }

  return petals;
}

/**
 * Botanical Ceylon Damask Rose (ලංකා රෝස මල)
 * Multi-tiered concentric watercolor petals with velvety shadow pooling:
 * - Deep guard petals at base
 * - Layered cupped petal whorls (spiraling golden ratio)
 * - Velvety inner core with tender floral heart
 */
function createBotanicalRose(cx: number, cy: number, r: number, rot = 0) {
  const whorls: { d: string; opacity: number; tone: 'outer' | 'mid' | 'inner' | 'core' }[] = [];

  // 1. Outer broad reflexed petals (5 large flared petals)
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 + rot) * (Math.PI / 180);
    const px = cx + Math.cos(a) * (r * 0.52);
    const py = cy + Math.sin(a) * (r * 0.52);
    const pr = r * 0.62;
    const d = `M${roundTo(px - pr)} ${roundTo(py)} C${roundTo(px - pr * 1.15)} ${roundTo(py - pr * 1.2)}, ${roundTo(px + pr * 1.15)} ${roundTo(py - pr * 1.2)}, ${roundTo(px + pr)} ${roundTo(py)} C${roundTo(px + pr * 0.9)} ${roundTo(py + pr * 1.15)}, ${roundTo(px - pr * 0.9)} ${roundTo(py + pr * 1.15)}, ${roundTo(px - pr)} ${roundTo(py)} Z`;
    whorls.push({ d, opacity: 0.88, tone: 'outer' });
  }

  // 2. Middle cupped petals (nested, offset by 36 degrees)
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 + rot + 36) * (Math.PI / 180);
    const px = cx + Math.cos(a) * (r * 0.34);
    const py = cy + Math.sin(a) * (r * 0.34);
    const pr = r * 0.45;
    const d = `M${roundTo(px - pr)} ${roundTo(py)} C${roundTo(px - pr)} ${roundTo(py - pr * 1.1)}, ${roundTo(px + pr)} ${roundTo(py - pr * 1.1)}, ${roundTo(px + pr)} ${roundTo(py)} C${roundTo(px + pr * 0.8)} ${roundTo(py + pr * 1.05)}, ${roundTo(px - pr * 0.8)} ${roundTo(py + pr * 1.05)}, ${roundTo(px - pr)} ${roundTo(py)} Z`;
    whorls.push({ d, opacity: 0.92, tone: 'mid' });
  }

  // 3. Inner folded petals
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + rot + 18) * (Math.PI / 180);
    const px = cx + Math.cos(a) * (r * 0.18);
    const py = cy + Math.sin(a) * (r * 0.18);
    const pr = r * 0.28;
    const d = `M${roundTo(px - pr)} ${roundTo(py)} C${roundTo(px - pr)} ${roundTo(py - pr * 1.1)}, ${roundTo(px + pr)} ${roundTo(py - pr * 1.1)}, ${roundTo(px + pr)} ${roundTo(py)} C${roundTo(px + pr * 0.7)} ${roundTo(py + pr * 0.95)}, ${roundTo(px - pr * 0.7)} ${roundTo(py + pr * 0.95)}, ${roundTo(px - pr)} ${roundTo(py)} Z`;
    whorls.push({ d, opacity: 0.96, tone: 'inner' });
  }

  // 4. Central bud swirl (the heart)
  const budR = r * 0.16;
  const coreD = `M${roundTo(cx - budR)} ${roundTo(cy)} C${roundTo(cx - budR)} ${roundTo(cy - budR * 1.3)}, ${roundTo(cx + budR)} ${roundTo(cy - budR * 1.3)}, ${roundTo(cx + budR)} ${roundTo(cy)} C${roundTo(cx + budR * 0.6)} ${roundTo(cy + budR * 1.2)}, ${roundTo(cx - budR * 0.6)} ${roundTo(cy + budR * 1.2)}, ${roundTo(cx - budR)} ${roundTo(cy)} Z`;
  whorls.push({ d: coreD, opacity: 1.0, tone: 'core' });

  return whorls;
}

/**
 * World: Rosa Pichcha (රෝස සහ පිච්ච) - Version 4 "Aroma & High Botanical Realism"
 *
 * Implements full sensory visual fragrance:
 * 1. Aromatic Mist Clouds & Nectar Haze (Visible scent trail).
 * 2. Realistic Botanical Ceylon Roses with deep shadow pooling & velvety glazes.
 * 3. Delicate 5-petaled White Pichcha (Jasmine) with morning dewdrops & amber anthers.
 * 4. Realistic thorny rose branches with serrated foliage leaves and sepals.
 * 5. Golden pollen dust & dancing scent particles drifting on the warm thermal air currents.
 */
export function RosaWorldScene({
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
  const horizonY = hy + 45;

  // Botanical thorny rose stems with organic curvature
  const botanicalStems = useMemo(() => {
    return [
      // Left dominant climbing rose branch
      {
        d: `M-20 40 C${W * 0.1} 50, ${W * 0.16} 140, ${W * 0.22} 260 C${W * 0.25} 350, ${W * 0.2} 480, ${W * 0.12} 600`,
        width: 4.2,
      },
      // Left delicate jasmine shoot
      {
        d: `M0 120 C${W * 0.08} 130, ${W * 0.14} 210, ${W * 0.18} 340`,
        width: 2.2,
      },
      // Right descending blooming rose cane
      {
        d: `M${W + 20} 30 C${W * 0.88} 50, ${W * 0.82} 130, ${W * 0.77} 250 C${W * 0.74} 340, ${W * 0.78} 470, ${W * 0.86} 580`,
        width: 3.8,
      },
      // Right fragrant jasmine tendril
      {
        d: `M${W} 110 C${W * 0.91} 130, ${W * 0.85} 220, ${W * 0.81} 330`,
        width: 2.0,
      },
    ];
  }, [W]);

  // Serrated botanical rose & jasmine leaves with central veins
  const botanicalLeaves = useMemo(() => {
    const list: {
      bladeD: string;
      veinD: string;
      fill: string;
      opacity: number;
    }[] = [];
    const count = 44;

    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const progress = i / count;
      const bx = isLeft ? W * (0.01 + progress * 0.22) : W * (0.99 - progress * 0.22);
      const by = 50 + progress * 500 + ((i * 31) % 40);
      const rot = (i * 49) % 360;
      const rad = (rot * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const length = 18 + (i % 4) * 5;
      const width = 8 + (i % 3) * 3;

      // Serrated botanical leaf curve
      const tipX = bx + cos * length;
      const tipY = by + sin * length;
      const midL = length * 0.55;
      const midX = bx + cos * midL;
      const midY = by + sin * midL;
      const perpCos = Math.cos(rad + Math.PI / 2);
      const perpSin = Math.sin(rad + Math.PI / 2);

      const lX = midX - perpCos * width;
      const lY = midY - perpSin * width;
      const rX = midX + perpCos * width;
      const rY = midY + perpSin * width;

      const bladeD = `M${roundTo(bx)} ${roundTo(by)} Q${roundTo(lX)} ${roundTo(lY)} ${roundTo(tipX)} ${roundTo(tipY)} Q${roundTo(rX)} ${roundTo(rY)} ${roundTo(bx)} ${roundTo(by)} Z`;
      const veinD = `M${roundTo(bx)} ${roundTo(by)} L${roundTo(tipX)} ${roundTo(tipY)}`;

      list.push({
        bladeD,
        veinD,
        fill: i % 3 === 0 ? '#4F6B3E' : i % 3 === 1 ? '#3F5732' : ornamentColor,
        opacity: 0.78 + (i % 3) * 0.1,
      });
    }
    return list;
  }, [W, ornamentColor]);

  // High-Realism Botanical Ceylon Roses
  const roses = useMemo(() => {
    const positions = [
      // Left arch major blooms
      { cx: W * 0.08, cy: 115, r: 32, rot: 15 },
      { cx: W * 0.18, cy: 210, r: 38, rot: 42 },
      { cx: W * 0.23, cy: 320, r: 30, rot: -20 },
      { cx: W * 0.16, cy: 460, r: 34, rot: 65 },
      // Right arch major blooms
      { cx: W * 0.91, cy: 100, r: 34, rot: -30 },
      { cx: W * 0.81, cy: 195, r: 40, rot: 25 },
      { cx: W * 0.76, cy: 305, r: 32, rot: -45 },
      { cx: W * 0.82, cy: 440, r: 36, rot: 55 },
      // Horizon meadow blooms
      { cx: W * 0.31, cy: horizonY - 18, r: 26, rot: 10 },
      { cx: W * 0.49, cy: horizonY - 24, r: 28, rot: -18 },
      { cx: W * 0.65, cy: horizonY - 20, r: 27, rot: 33 },
    ];

    return positions.map((p) => ({
      ...p,
      whorls: createBotanicalRose(p.cx, p.cy, p.r, p.rot),
    }));
  }, [W, horizonY]);

  // Pure White Pichcha (Jasmine) Star Blossoms
  const pichchas = useMemo(() => {
    const positions = [
      // Left trellis cascade
      { cx: W * 0.04, cy: 80, r: 20, rot: 12 },
      { cx: W * 0.12, cy: 155, r: 22, rot: 34 },
      { cx: W * 0.20, cy: 250, r: 19, rot: 78 },
      { cx: W * 0.25, cy: 385, r: 21, rot: -15 },
      { cx: W * 0.19, cy: 510, r: 23, rot: 48 },
      // Right trellis cascade
      { cx: W * 0.95, cy: 70, r: 21, rot: -22 },
      { cx: W * 0.87, cy: 145, r: 23, rot: 55 },
      { cx: W * 0.78, cy: 240, r: 20, rot: -60 },
      { cx: W * 0.74, cy: 365, r: 22, rot: 20 },
      { cx: W * 0.80, cy: 490, r: 21, rot: -40 },
      // Meadow scatter
      { cx: W * 0.24, cy: horizonY - 12, r: 18, rot: 18 },
      { cx: W * 0.41, cy: horizonY - 16, r: 19, rot: -30 },
      { cx: W * 0.57, cy: horizonY - 14, r: 20, rot: 45 },
      { cx: W * 0.73, cy: horizonY - 17, r: 18, rot: -10 },
    ];

    return positions.map((p) => ({
      ...p,
      petals: createBotanicalPichcha(p.cx, p.cy, p.r, p.rot),
    }));
  }, [W, horizonY]);

  // Visible Fragrance Wisps & Pollen Shimmer
  const fragranceVapors = useMemo(() => {
    return [
      { d: `M${W * 0.05} 200 C${W * 0.15} 170, ${W * 0.2} 240, ${W * 0.3} 210 S${W * 0.4} 180, ${W * 0.5} 220`, strokeW: 24, op: 0.18 },
      { d: `M${W * 0.95} 220 C${W * 0.85} 190, ${W * 0.8} 260, ${W * 0.7} 230 S${W * 0.6} 200, ${W * 0.5} 240`, strokeW: 28, op: 0.16 },
      { d: `M${W * 0.15} 400 C${W * 0.25} 370, ${W * 0.35} 430, ${W * 0.5} 390 S${W * 0.65} 360, ${W * 0.85} 410`, strokeW: 32, op: 0.14 },
    ];
  }, [W]);

  // Golden pollen and fragrant dew sparkles
  const pollenDust = useMemo(() => {
    const list: { cx: number; cy: number; r: number; opacity: number }[] = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      list.push({
        cx: (i * 73 + 19) % W,
        cy: 40 + ((i * 53) % (H - 80)),
        r: 1.0 + (i % 3) * 0.8,
        opacity: 0.45 + (i % 4) * 0.18,
      });
    }
    return list;
  }, [W, H]);

  // Drifting Petals fluttering on the scented morning breeze
  const driftingPetals = useMemo(() => {
    const list: { d: string; fill: string; opacity: number; cx: number; cy: number; rot: number }[] = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const cx = (i * 97 + 39) % W;
      const cy = 50 + ((i * 67) % (H - 100));
      const rot = (i * 41) % 360;
      const s = 1.1 + (i % 3) * 0.45;
      const isRose = i % 3 !== 0;

      // Realistic dished petal shape
      const d = `M${roundTo(cx)} ${roundTo(cy)} C${roundTo(cx + 10 * s)} ${roundTo(cy - 14 * s)}, ${roundTo(cx + 22 * s)} ${roundTo(cy - 5 * s)}, ${roundTo(cx + 19 * s)} ${roundTo(cy + 12 * s)} C${roundTo(cx + 8 * s)} ${roundTo(cy + 15 * s)}, ${roundTo(cx)} ${roundTo(cy)} Z`;

      list.push({
        d,
        fill: isRose ? lampColor : '#FFFFFF',
        opacity: isRose ? 0.65 + (i % 2) * 0.25 : 0.92,
        cx,
        cy,
        rot,
      });
    }
    return list;
  }, [W, H, lampColor]);

  return (
    <g data-world-layer="rosa-botanical-fragrance-v4">
      <style>{`
        @keyframes aromaWaveFlow {
          0% { transform: translateX(0px) translateY(0px); opacity: 0.12; }
          50% { transform: translateX(18px) translateY(-8px); opacity: 0.24; }
          100% { transform: translateX(0px) translateY(0px); opacity: 0.12; }
        }
        @keyframes pollenGlimmer {
          0% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.95; transform: scale(1.3); }
          100% { opacity: 0.3; transform: scale(0.9); }
        }
        @keyframes petalWindDance {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .aroma-wisp-flow {
          animation: aromaWaveFlow 18s ease-in-out infinite alternate;
        }
        .pollen-dust-sparkle {
          animation: pollenGlimmer 5s ease-in-out infinite alternate;
        }
        .petal-wind-stream {
          animation: petalWindDance 15s ease-in-out infinite alternate;
        }
      `}</style>

      <defs>
        {/* Handmade Cotton Botanical Paper Filter */}
        <filter id={`${id}-botanical-tooth`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.7" numOctaves="3" result="noise" type="fractalNoise" />
          <feColorMatrix
            result="faintGrain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.045 0"
          />
          <feComposite in="SourceGraphic" in2="faintGrain" operator="over" />
        </filter>

        {/* Soft Dewdrop Specular Highlight */}
        <filter id={`${id}-dew-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Scented Aromatic Mist Gradient */}
        <linearGradient id={`${id}-aroma-vapor`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#FFF2F6" stopOpacity="0" />
          <stop offset="35%" stopColor={effectiveGlow} stopOpacity="0.45" />
          <stop offset="70%" stopColor="#FFF9FA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFF2F6" stopOpacity="0" />
        </linearGradient>

        {/* Velvety Ceylon Damask Rose Outer Gradient */}
        <radialGradient cx="40%" cy="35%" id={`${id}-rose-outer`} r="65%">
          <stop offset="0%" stopColor="#FFF0F4" stopOpacity="0.98" />
          <stop offset="30%" stopColor="#F5B2C5" stopOpacity="0.95" />
          <stop offset="70%" stopColor={lampColor} stopOpacity="0.92" />
          <stop offset="100%" stopColor="#7A1C38" stopOpacity="0.98" />
        </radialGradient>

        {/* Deep Rose Heart Shadow Gradient */}
        <radialGradient cx="50%" cy="45%" id={`${id}-rose-heart`} r="55%">
          <stop offset="0%" stopColor="#FFF0F5" stopOpacity="1" />
          <stop offset="25%" stopColor={effectiveGlow} stopOpacity="0.95" />
          <stop offset="65%" stopColor={lampColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#5E1026" stopOpacity="1" />
        </radialGradient>

        {/* Pure Translucent Pichcha Jasmine Petal Gradient */}
        <linearGradient id={`${id}-pichcha-petal`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="75%" stopColor="#FFFBFD" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#FCE7EE" stopOpacity="0.88" />
        </linearGradient>

        {/* Soft Romantic Dawn Canopy */}
        <linearGradient id={`${id}-dawn-warmth`} x1="0" x2="0" y1="0" y2={horizonY}>
          <stop offset="0%" stopColor="#3F1E2C" stopOpacity="0.48" />
          <stop offset="40%" stopColor="#7E3753" stopOpacity="0.32" />
          <stop offset="80%" stopColor={effectiveGlow} stopOpacity="0.28" />
          <stop offset="100%" stopColor={groundColor} stopOpacity="0.85" />
        </linearGradient>

        {/* Garden Meadow Velvet Lawn */}
        <linearGradient id={`${id}-meadow-lawn`} x1="0" x2="0" y1={horizonY - 35} y2={H}>
          <stop offset="0%" stopColor="#4A613A" stopOpacity="0.35" />
          <stop offset="35%" stopColor="#6E4A55" stopOpacity="0.25" />
          <stop offset="85%" stopColor={groundColor} stopOpacity="0.88" />
          <stop offset="100%" stopColor={groundColor} stopOpacity="0.96" />
        </linearGradient>
      </defs>

      {/* --- 1. Warm Romantic Sky Canopy --- */}
      <rect
        fill={`url(#${id}-dawn-warmth)`}
        height={horizonY + 20}
        width={W}
        x={0}
        y={0}
      />

      {/* --- 2. Velvet Lawn Ground --- */}
      <rect
        fill={`url(#${id}-meadow-lawn)`}
        height={H - horizonY + 35}
        width={W}
        x={0}
        y={horizonY - 35}
      />

      {/* --- 3. Visible Scent & Fragrance Vapor Currents --- */}
      <g className="aroma-wisp-flow" filter={`url(#${id}-dew-glow)`} pointerEvents="none">
        {fragranceVapors.map((vapor, i) => (
          <path
            key={`fragrance-wisp-${i}`}
            d={vapor.d}
            fill="none"
            stroke={`url(#${id}-aroma-vapor)`}
            strokeLinecap="round"
            strokeOpacity={vapor.op}
            strokeWidth={vapor.strokeW}
          />
        ))}
      </g>

      {/* --- 4. Botanical Thorny Rose Canes & Foliage --- */}
      <g filter={`url(#${id}-botanical-tooth)`}>
        {/* Woody stems */}
        {botanicalStems.map((stem, i) => (
          <path
            key={`botanical-stem-${i}`}
            d={stem.d}
            fill="none"
            stroke="#3B4C2F"
            strokeLinecap="round"
            strokeOpacity={0.82}
            strokeWidth={stem.width}
          />
        ))}

        {/* Leaves with anatomical midrib veins */}
        {botanicalLeaves.map((leaf, i) => (
          <g key={`botanical-leaf-${i}`}>
            <path
              d={leaf.bladeD}
              fill={leaf.fill}
              fillOpacity={leaf.opacity}
            />
            <path
              d={leaf.veinD}
              fill="none"
              stroke="#2B3A22"
              strokeOpacity={0.5}
              strokeWidth={0.7}
            />
          </g>
        ))}
      </g>

      {/* --- 5. High-Realism Ceylon Damask Roses --- */}
      <g>
        {roses.map((rose, rIdx) => (
          <g key={`rose-blossom-${rIdx}`}>
            {rose.whorls.map((whorl, wIdx) => {
              const isOuter = whorl.tone === 'outer';
              const isCore = whorl.tone === 'core';
              const fill = isOuter
                ? `url(#${id}-rose-outer)`
                : isCore
                ? '#4A0C1D'
                : `url(#${id}-rose-heart)`;

              return (
                <path
                  key={`rose-whorl-${rIdx}-${wIdx}`}
                  d={whorl.d}
                  fill={fill}
                  fillOpacity={whorl.opacity}
                  stroke="#5E1026"
                  strokeOpacity={0.35}
                  strokeWidth={0.65}
                />
              );
            })}

            {/* Glowing morning dewdrop on outer rose petal */}
            <circle
              cx={rose.cx + rose.r * 0.42}
              cy={rose.cy - rose.r * 0.35}
              fill="#FFFFFF"
              fillOpacity={0.92}
              filter={`url(#${id}-dew-glow)`}
              r={2.0}
            />
            <circle
              cx={rose.cx + rose.r * 0.43}
              cy={rose.cy - rose.r * 0.36}
              fill="#FFFFFF"
              fillOpacity={1}
              r={0.8}
            />
          </g>
        ))}
      </g>

      {/* --- 6. True White Pichcha (Jasmine) Star Blossoms --- */}
      <g filter={`url(#${id}-dew-glow)`}>
        {pichchas.map((pichcha, pIdx) => (
          <g key={`pichcha-blossom-${pIdx}`}>
            {/* 5 curved ivory petals */}
            {pichcha.petals.map((pet, petIdx) => (
              <g key={`pichcha-pet-${pIdx}-${petIdx}`}>
                <path
                  d={pet.d}
                  fill={`url(#${id}-pichcha-petal)`}
                  stroke="#FFFFFF"
                  strokeOpacity={0.88}
                  strokeWidth={0.8}
                />
                <path
                  d={pet.highlightD}
                  fill="none"
                  stroke="#FFF2F6"
                  strokeOpacity={0.7}
                  strokeWidth={0.75}
                />
              </g>
            ))}

            {/* Emerald green calyx center */}
            <circle
              cx={pichcha.cx}
              cy={pichcha.cy}
              fill="#527041"
              fillOpacity={0.9}
              r={pichcha.r * 0.24}
            />

            {/* Golden amber pollen anthers */}
            <circle
              cx={pichcha.cx}
              cy={pichcha.cy}
              fill="#FFC933"
              fillOpacity={0.98}
              r={pichcha.r * 0.16}
            />

            {/* Central fresh nectar dot */}
            <circle
              cx={pichcha.cx}
              cy={pichcha.cy}
              fill="#FFFFFF"
              fillOpacity={0.9}
              r={pichcha.r * 0.08}
            />
          </g>
        ))}
      </g>

      {/* --- 7. Golden Pollen Dust & Scent Sparkles --- */}
      <g className="pollen-dust-sparkle" pointerEvents="none">
        {pollenDust.map((pollen, i) => (
          <circle
            key={`pollen-${i}`}
            cx={pollen.cx}
            cy={pollen.cy}
            fill={i % 2 === 0 ? '#FFE899' : '#FFFFFF'}
            fillOpacity={pollen.opacity}
            r={pollen.r}
          />
        ))}
      </g>

      {/* --- 8. Living Petal Wind Stream (Dancing Rose & Pichcha Petals) --- */}
      <g className="petal-wind-stream" pointerEvents="none">
        {driftingPetals.map((petal, i) => (
          <path
            key={`scented-petal-${i}`}
            d={petal.d}
            fill={petal.fill}
            fillOpacity={petal.opacity}
            transform={`rotate(${petal.rot} ${petal.cx} ${petal.cy})`}
          />
        ))}
      </g>
    </g>
  );
}
