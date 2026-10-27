'use client';

import type { WorldMode, WorldPhase } from '@repo/ui/world/types';
import { useEffect, useRef } from 'react';

interface ProceduralWewaCanvasProps {
  mode: WorldMode;
  phase: WorldPhase;
  hour: number;
}

// ---------------------------------------------------------------------------
// 1. Procedural Multi-Octave Fractal Noise Engine (FBM)
// ---------------------------------------------------------------------------
class SimpleNoise {
  private p: number[] = [];

  constructor(seed = 42) {
    const permutation = Array.from({ length: 256 }, (_, i) => i);
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      const pi = permutation[i] ?? 0;
      const pj = permutation[j] ?? 0;
      permutation[i] = pj;
      permutation[j] = pi;
    }
    this.p = [...permutation, ...permutation];
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number) {
    return (hash & 1) === 0 ? x : -x;
  }

  noise1D(x: number): number {
    const xi = Math.floor(x) & 255;
    const xf = x - Math.floor(x);
    const u = this.fade(xf);
    const h1 = this.p[xi] ?? 0;
    const h2 = this.p[xi + 1] ?? 0;
    return this.lerp(u, this.grad(h1, xf), this.grad(h2, xf - 1));
  }

  // Fractal Brownian Motion (FBM) for natural rugged mountain ridgelines
  fbm(x: number, octaves = 4, persistence = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise1D(x * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxValue;
  }
}

const noise = new SimpleNoise(108);

// ---------------------------------------------------------------------------
// 2. Diurnal Color Palettes & Lighting Curves (24-Hour Horizon Math)
// ---------------------------------------------------------------------------
interface SkyTheme {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  sunGlow: string;
  mountainFar: string;
  mountainMid: string;
  mountainNear: string;
  waterBase: string;
  waterShimmer: string;
  waterReflectAlpha: number;
  rimLight: string;
  ambientHaze: string;
}

function getDiurnalTheme(hour: number, mode: WorldMode): SkyTheme {
  const isDark = mode === 'dark';

  // 04:00 - 06:00: Predawn (Brahma Muhurta)
  if (hour >= 4 && hour < 6) {
    return {
      skyTop: isDark ? '#050B14' : '#1A2436',
      skyMid: isDark ? '#0D1B2A' : '#2D3F59',
      skyHorizon: isDark ? '#1C3144' : '#6A7F9D',
      sunGlow: '#E2E8F0',
      mountainFar: isDark ? '#09131F' : '#22324A',
      mountainMid: isDark ? '#0F1E2E' : '#2F435E',
      mountainNear: isDark ? '#14273A' : '#3C526F',
      waterBase: isDark ? '#070E17' : '#1A293D',
      waterShimmer: 'rgba(203, 213, 225, 0.25)',
      waterReflectAlpha: 0.35,
      rimLight: 'rgba(226, 232, 240, 0.45)',
      ambientHaze: isDark ? 'rgba(13, 27, 42, 0.65)' : 'rgba(106, 127, 157, 0.4)',
    };
  }

  // 06:00 - 08:30: Dawn (Udaya - Sunrise over Wewa)
  if (hour >= 6 && hour < 9) {
    return {
      skyTop: isDark ? '#1F1218' : '#7C2D12',
      skyMid: isDark ? '#431407' : '#EA580C',
      skyHorizon: isDark ? '#7C2D12' : '#FDBA74',
      sunGlow: '#FDE047',
      mountainFar: isDark ? '#1F141A' : '#5C2D3A',
      mountainMid: isDark ? '#331B24' : '#7C3A4A',
      mountainNear: isDark ? '#4A232E' : '#9A4658',
      waterBase: isDark ? '#180E14' : '#3F202B',
      waterShimmer: 'rgba(253, 224, 71, 0.45)',
      waterReflectAlpha: 0.65,
      rimLight: 'rgba(254, 215, 170, 0.85)',
      ambientHaze: isDark ? 'rgba(67, 20, 7, 0.55)' : 'rgba(251, 146, 60, 0.4)',
    };
  }

  // 09:00 - 12:00: Morning (Prabhata - Crisp Golden Light)
  if (hour >= 9 && hour < 12) {
    return {
      skyTop: isDark ? '#0B1D28' : '#0284C7',
      skyMid: isDark ? '#133348' : '#38BDF8',
      skyHorizon: isDark ? '#1E4964' : '#BAE6FD',
      sunGlow: '#FFFBEB',
      mountainFar: isDark ? '#0E2331' : '#1E5A7A',
      mountainMid: isDark ? '#153346' : '#2A729A',
      mountainNear: isDark ? '#1C425A' : '#338BB7',
      waterBase: isDark ? '#0A1822' : '#144662',
      waterShimmer: 'rgba(255, 255, 255, 0.55)',
      waterReflectAlpha: 0.5,
      rimLight: 'rgba(255, 255, 255, 0.75)',
      ambientHaze: isDark ? 'rgba(19, 51, 72, 0.45)' : 'rgba(186, 230, 253, 0.35)',
    };
  }

  // 12:00 - 16:30: Afternoon (Madhyahna - Solar Radiance)
  if (hour >= 12 && hour < 17) {
    return {
      skyTop: isDark ? '#14181E' : '#0369A1',
      skyMid: isDark ? '#232D38' : '#0EA5E9',
      skyHorizon: isDark ? '#3E4D5D' : '#7DD3FC',
      sunGlow: '#FEF08A',
      mountainFar: isDark ? '#17202B' : '#256382',
      mountainMid: isDark ? '#23303F' : '#327D9F',
      mountainNear: isDark ? '#2D3F52' : '#3D95BC',
      waterBase: isDark ? '#10161E' : '#19516E',
      waterShimmer: 'rgba(254, 240, 138, 0.6)',
      waterReflectAlpha: 0.55,
      rimLight: 'rgba(254, 240, 138, 0.8)',
      ambientHaze: isDark ? 'rgba(35, 45, 56, 0.4)' : 'rgba(125, 211, 252, 0.3)',
    };
  }

  // 17:00 - 19:30: Dusk (Sandhya - Terracotta & Purple Sunset)
  if (hour >= 17 && hour < 20) {
    return {
      skyTop: isDark ? '#1B0E1E' : '#4C1D95',
      skyMid: isDark ? '#3B1229' : '#BE123C',
      skyHorizon: isDark ? '#6E1F2A' : '#FB923C',
      sunGlow: '#FDE047',
      mountainFar: isDark ? '#1D0F21' : '#4C1D54',
      mountainMid: isDark ? '#311434' : '#68266E',
      mountainNear: isDark ? '#46194A' : '#842F88',
      waterBase: isDark ? '#160918' : '#3D1342',
      waterShimmer: 'rgba(251, 146, 60, 0.6)',
      waterReflectAlpha: 0.7,
      rimLight: 'rgba(253, 224, 71, 0.9)',
      ambientHaze: isDark ? 'rgba(59, 18, 41, 0.5)' : 'rgba(244, 63, 94, 0.35)',
    };
  }

  // 20:00 - 04:00: Night (Ratri - Starlit Moonlit Reservoir Waters)
  return {
    skyTop: isDark ? '#020409' : '#0B1222',
    skyMid: isDark ? '#060B14' : '#111D35',
    skyHorizon: isDark ? '#0D1726' : '#1C2C4C',
    sunGlow: '#E2E8F0',
    mountainFar: isDark ? '#050912' : '#121D33',
    mountainMid: isDark ? '#0A1220' : '#192845',
    mountainNear: isDark ? '#0F1A2D' : '#223558',
    waterBase: isDark ? '#03060C' : '#0E1729',
    waterShimmer: 'rgba(226, 232, 240, 0.35)',
    waterReflectAlpha: 0.45,
    rimLight: 'rgba(226, 232, 240, 0.4)',
    ambientHaze: isDark ? 'rgba(6, 11, 20, 0.7)' : 'rgba(28, 44, 76, 0.55)',
  };
}

// ---------------------------------------------------------------------------
// 3. Main Procedural Wewa Canvas Component
// ---------------------------------------------------------------------------
export function ProceduralWewaCanvas({ mode, phase, hour }: ProceduralWewaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Solar / Lunar Transit Trajectory
  const isDay = hour >= 6 && hour < 18;
  const transitProgress = isDay ? (hour - 6) / 12 : hour >= 18 ? (hour - 18) / 12 : (hour + 6) / 12;
  const orbXRatio = 0.16 + transitProgress * 0.68;
  const orbYRatio = 0.54 - Math.sin(transitProgress * Math.PI) * 0.38;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const updateDimensions = () => {
      dpr = window.devicePixelRatio || 1;
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };
    updateDimensions();

    const onResize = () => {
      if (!canvas) return;
      updateDimensions();
    };
    window.addEventListener('resize', onResize);

    const theme = getDiurnalTheme(hour, mode);
    const isNight = phase === 'night' || phase === 'predawn';

    // Living Water Lily (Nil Manel) Clusters on Near Embankment along the waterLine (38% - 44% of height)
    const lilies = [
      { x: cssWidth * 0.16, y: cssHeight * 0.42, r: 36, petals: 9, bloom: isDay ? 1 : 0.3 },
      { x: cssWidth * 0.26, y: cssHeight * 0.44, r: 44, petals: 11, bloom: isDay ? 0.9 : 0.25 },
      { x: cssWidth * 0.38, y: cssHeight * 0.41, r: 32, petals: 8, bloom: isDay ? 0.8 : 0.2 },
      { x: cssWidth * 0.72, y: cssHeight * 0.43, r: 48, petals: 12, bloom: isDay ? 1 : 0.4 },
      { x: cssWidth * 0.86, y: cssHeight * 0.41, r: 38, petals: 9, bloom: isDay ? 0.85 : 0.3 },
    ];

    // Fireflies / Light Motes
    const motes = Array.from({ length: 36 }, () => ({
      x: Math.random() * cssWidth,
      y: Math.random() * cssHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const width = cssWidth;
      const height = cssHeight;

      // Horizon line placed at 42% height so 58% of the stage is the deep reservoir water & aquatic world
      const waterLineY = height * 0.42;
      const orbX = width * orbXRatio;
      const orbY = height * orbYRatio;

      // -------------------------------------------------------------
      // A. Atmospheric Sky Dome (Multi-Stop Watercolor Wash)
      // -------------------------------------------------------------
      const skyGrad = ctx.createLinearGradient(0, 0, 0, waterLineY);
      skyGrad.addColorStop(0, theme.skyTop);
      skyGrad.addColorStop(0.55, theme.skyMid);
      skyGrad.addColorStop(1, theme.skyHorizon);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, waterLineY);

      // Starfield (Night & Predawn)
      if (isNight || (mode === 'dark' && phase === 'dusk')) {
        for (let i = 0; i < 70; i++) {
          const sx = (Math.sin(i * 123.4) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 56.7) * 0.5 + 0.5) * (waterLineY * 0.85);
          const twinkle = (Math.sin(time * 2 + i) + 1) * 0.45 + 0.1;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.globalAlpha = twinkle;
          ctx.fill();
        }
      }

      // -------------------------------------------------------------
      // B. Celestial Body (Sun with Golden Corona or Moon with Glow)
      // -------------------------------------------------------------
      ctx.save();
      const coronaGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 80);
      coronaGrad.addColorStop(0, theme.sunGlow);
      coronaGrad.addColorStop(0.35, theme.sunGlow);
      coronaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coronaGrad;
      ctx.globalAlpha = isDay ? 0.65 : 0.45;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Solid Orb Core
      ctx.beginPath();
      ctx.arc(orbX, orbY, isDay ? 22 : 18, 0, Math.PI * 2);
      ctx.fillStyle = isDay ? '#FFFFFF' : '#F8FAFC';
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 24;
      ctx.shadowColor = theme.sunGlow;
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // C. Procedural Mountain Horizons (Gentle, low-slung Knuckles Ridges)
      // -------------------------------------------------------------
      const drawMountainRange = (
        baseY: number,
        heightScale: number,
        freq: number,
        color: string,
        roughness: number,
        drawRimLight = false,
      ) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, waterLineY);

        for (let x = 0; x <= width; x += 4) {
          const nx = x * freq;
          const elevation = noise.fbm(nx, roughness, 0.52);
          const y = baseY - elevation * heightScale;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, waterLineY);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.95;
        ctx.fill();

        if (drawRimLight) {
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = theme.rimLight;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
        }
        ctx.restore();
      };

      // Far peaks (low profile behind the water horizon)
      drawMountainRange(waterLineY - 45, 65, 0.0016, theme.mountainFar, 4, false);

      // Soft mist at mountain base
      ctx.fillStyle = theme.ambientHaze;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, waterLineY - 45, width, 45);

      // Mid-Range gentle hills
      drawMountainRange(waterLineY - 20, 42, 0.0032, theme.mountainMid, 4, true);

      // Near shoreline embankment / Kumbuk grove silhouette
      drawMountainRange(waterLineY - 6, 24, 0.0065, theme.mountainNear, 3, false);

      // -------------------------------------------------------------
      // D. Deep Subsurface Reservoir Waters (Lake Cross-Section)
      // -------------------------------------------------------------
      const waterHeight = height - waterLineY;

      // Deep aquatic gradient: Clear crystalline surface transitioning into deep emerald / sapphire abyss
      const waterGrad = ctx.createLinearGradient(0, waterLineY, 0, height);
      if (mode === 'dark') {
        waterGrad.addColorStop(0, '#0B2332');
        waterGrad.addColorStop(0.3, '#071824');
        waterGrad.addColorStop(0.7, '#030E17');
        waterGrad.addColorStop(1, '#01050A');
      } else {
        waterGrad.addColorStop(0, '#1E6B7B');
        waterGrad.addColorStop(0.25, '#155364');
        waterGrad.addColorStop(0.65, '#0E3B4A');
        waterGrad.addColorStop(1, '#072430');
      }
      ctx.fillStyle = waterGrad;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, waterLineY, width, waterHeight);

      // Underwater Volumetric God Rays / Light Shafts piercing from Sun/Moon into the deep
      ctx.save();
      const numRays = 7;
      for (let r = 0; r < numRays; r++) {
        const rayAngle = ((r - 3) * 0.08) + Math.sin(time * 0.5 + r) * 0.03;
        const rayStartX = orbX + (r - 3) * 25;
        const rayWidth = 45 + r * 12;

        ctx.beginPath();
        ctx.moveTo(rayStartX - rayWidth * 0.2, waterLineY);
        ctx.lineTo(rayStartX + rayWidth * 0.2, waterLineY);
        const bottomX = rayStartX + Math.sin(rayAngle) * waterHeight * 1.2;
        ctx.lineTo(bottomX + rayWidth * 1.5, height);
        ctx.lineTo(bottomX - rayWidth * 1.5, height);
        ctx.closePath();

        const rayGrad = ctx.createLinearGradient(0, waterLineY, 0, height);
        rayGrad.addColorStop(0, theme.sunGlow);
        rayGrad.addColorStop(0.6, isDay ? 'rgba(56, 189, 248, 0.15)' : 'rgba(165, 243, 252, 0.08)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.globalAlpha = isDay ? 0.22 + Math.sin(time + r) * 0.08 : 0.12 + Math.sin(time + r) * 0.04;
        ctx.fill();
      }
      ctx.restore();

      // Specular Celestial Reflection Column at Water Boundary
      ctx.save();
      const reflectWidth = 140;
      const reflectGrad = ctx.createLinearGradient(
        orbX - reflectWidth / 2,
        0,
        orbX + reflectWidth / 2,
        0,
      );
      reflectGrad.addColorStop(0, 'transparent');
      reflectGrad.addColorStop(0.5, theme.sunGlow);
      reflectGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = reflectGrad;
      ctx.globalAlpha = theme.waterReflectAlpha * 0.5;
      ctx.fillRect(orbX - reflectWidth / 2, waterLineY, reflectWidth, waterHeight * 0.4);
      ctx.restore();

      // Waterline Membrane & Wave Caustics at the Surface
      ctx.save();
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        const wy = waterLineY + (i + 1) * 8;
        ctx.beginPath();
        ctx.moveTo(0, wy);

        const waveFreq = 0.015 + i * 0.004;
        const waveSpeed = time * (1.5 + i * 0.4);
        const waveAmp = 2.2 + i * 0.5;

        for (let wx = 0; wx <= width; wx += 20) {
          const offset = Math.sin(wx * waveFreq + waveSpeed) * waveAmp;
          ctx.lineTo(wx, wy + offset);
        }

        ctx.strokeStyle = theme.waterShimmer;
        ctx.globalAlpha = 0.5 - (i * 0.07);
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // E. Underwater Biome: Aquatic Flora (Vallisneria Grasses & Roots)
      // -------------------------------------------------------------
      ctx.save();
      // Draw flowing freshwater grass fronds rooted on the lake bed
      const grassClusters = [
        { x: width * 0.08, count: 6, maxH: waterHeight * 0.72 },
        { x: width * 0.22, count: 8, maxH: waterHeight * 0.85 },
        { x: width * 0.54, count: 5, maxH: waterHeight * 0.6 },
        { x: width * 0.78, count: 9, maxH: waterHeight * 0.78 },
        { x: width * 0.92, count: 6, maxH: waterHeight * 0.68 },
      ];

      grassClusters.forEach((cluster) => {
        for (let g = 0; g < cluster.count; g++) {
          const gx = cluster.x + (g - cluster.count / 2) * 14;
          const bladeH = cluster.maxH * (0.65 + Math.sin(g * 3.1) * 0.35);
          const sway = Math.sin(time * 1.1 + gx * 0.02 + g) * 28;

          ctx.beginPath();
          ctx.moveTo(gx, height);
          ctx.bezierCurveTo(
            gx + sway * 0.4,
            height - bladeH * 0.4,
            gx + sway * 0.8,
            height - bladeH * 0.75,
            gx + sway,
            height - bladeH,
          );
          ctx.lineWidth = 3.5 - (g % 2);
          ctx.strokeStyle = mode === 'dark'
            ? `rgba(16, 75, 60, ${0.45 + (g / cluster.count) * 0.35})`
            : `rgba(20, 120, 95, ${0.5 + (g / cluster.count) * 0.35})`;
          ctx.stroke();
        }
      });
      ctx.restore();

      // Submerged Stems for Floating Lilies (Connecting surface petals down to murky roots)
      ctx.save();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = mode === 'dark' ? 'rgba(30, 80, 60, 0.55)' : 'rgba(40, 130, 95, 0.6)';
      lilies.forEach((lily, idx) => {
        const stemSway = Math.sin(time * 1.3 + idx * 1.5) * 14;
        ctx.beginPath();
        ctx.moveTo(lily.x, lily.y);
        ctx.bezierCurveTo(
          lily.x + stemSway,
          lily.y + (height - lily.y) * 0.45,
          lily.x - stemSway * 0.5,
          lily.y + (height - lily.y) * 0.8,
          lily.x + stemSway * 0.2,
          height,
        );
        ctx.stroke();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // F. Underwater Fauna: Schools of Indigenous Fishes (Labeo & Golden Tor)
      // -------------------------------------------------------------
      ctx.save();
      const fishSchools = [
        { baseX: (width * 0.35 + time * 32) % (width + 120) - 60, y: waterLineY + waterHeight * 0.35, size: 14, color: '#F97316' },
        { baseX: (width * 0.38 + time * 32) % (width + 120) - 60, y: waterLineY + waterHeight * 0.38, size: 11, color: '#FB923C' },
        { baseX: (width * 0.33 + time * 32) % (width + 120) - 60, y: waterLineY + waterHeight * 0.32, size: 12, color: '#FDBA74' },
        // Second school swimming leftward in deeper waters
        { baseX: width - ((width * 0.2 + time * 22) % (width + 120) - 60), y: waterLineY + waterHeight * 0.62, size: 16, color: '#38BDF8', flip: true },
        { baseX: width - ((width * 0.24 + time * 22) % (width + 120) - 60), y: waterLineY + waterHeight * 0.66, size: 13, color: '#7DD3FC', flip: true },
        { baseX: width - ((width * 0.18 + time * 22) % (width + 120) - 60), y: waterLineY + waterHeight * 0.59, size: 12, color: '#BAE6FD', flip: true },
      ];

      fishSchools.forEach((f) => {
        ctx.save();
        ctx.translate(f.baseX, f.y);
        if (f.flip) ctx.scale(-1, 1);

        const wiggle = Math.sin(time * 8 + f.baseX * 0.1) * 2.5;

        // Fish Body
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.36, 0, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.globalAlpha = mode === 'dark' ? 0.6 : 0.75;
        ctx.fill();

        // Tail Fin
        ctx.beginPath();
        ctx.moveTo(-f.size * 0.8, 0);
        ctx.lineTo(-f.size * 1.4, -f.size * 0.4 + wiggle);
        ctx.lineTo(-f.size * 1.4, f.size * 0.4 + wiggle);
        ctx.closePath();
        ctx.fillStyle = f.color;
        ctx.fill();

        ctx.restore();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // G. Rising Oxygen & Spring Bubbles from Reservoir Bed
      // -------------------------------------------------------------
      ctx.save();
      for (let b = 0; b < 22; b++) {
        const bubbleSeed = (b * 163.7);
        const bx = (Math.sin(bubbleSeed) * 0.5 + 0.5) * width + Math.sin(time * 2 + b) * 8;
        const speed = 25 + (b % 5) * 8;
        const by = height - ((time * speed + bubbleSeed * 10) % waterHeight);
        const br = 1.5 + (b % 3) * 0.9;

        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // H. Surface Nil Manel (Water Lily) Flower Blossoms
      // -------------------------------------------------------------
      lilies.forEach((lily) => {
        ctx.save();
        ctx.translate(lily.x, lily.y);

        // Water Lily Leaf Pad (with characteristic notch cut)
        ctx.beginPath();
        ctx.ellipse(0, 0, lily.r, lily.r * 0.32, 0, 0.25, Math.PI * 1.95);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fillStyle = mode === 'dark' ? '#0F3024' : '#1E583F';
        ctx.globalAlpha = 0.88;
        ctx.fill();
        ctx.strokeStyle = mode === 'dark' ? '#1E583F' : '#34D399';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        // Lotus Flower Petals (Blooming by Day, Resting by Night)
        const petalCount = lily.petals;
        const petalLength = lily.r * 0.55 * lily.bloom;
        for (let p = 0; p < petalCount; p++) {
          const angle = (p / petalCount) * Math.PI * 2 + time * 0.1;
          const px = Math.cos(angle) * petalLength;
          const py = Math.sin(angle) * (petalLength * 0.38);

          ctx.beginPath();
          ctx.ellipse(px, py, 6 * lily.bloom, 3 * lily.bloom, angle, 0, Math.PI * 2);
          ctx.fillStyle = p % 2 === 0 ? '#E879F9' : '#C084FC';
          ctx.globalAlpha = 0.82;
          ctx.fill();
        }

        // Golden Stamen Center
        ctx.beginPath();
        ctx.arc(0, 0, 3.5 * lily.bloom, 0, Math.PI * 2);
        ctx.fillStyle = '#FDE047';
        ctx.globalAlpha = 0.95;
        ctx.fill();

        ctx.restore();
      });

      // -------------------------------------------------------------
      // I. Autonomous Luminescent Fireflies / Atmospheric Motes
      // -------------------------------------------------------------
      motes.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;
        m.phase += 0.035;

        if (m.x < 0) m.x = width;
        if (m.x > width) m.x = 0;
        if (m.y < 0) m.y = height;
        if (m.y > height) m.y = 0;

        const pulseAlpha = Math.abs(Math.sin(m.phase)) * m.alpha;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);

        if (isNight) {
          ctx.fillStyle = '#FDE047';
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#EAB308';
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#FDE047';
        }
        ctx.globalAlpha = pulseAlpha * 0.85;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [hour, mode, phase, orbXRatio, orbYRatio, isDay]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
