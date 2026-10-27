'use client';

import type { WorldMode, WorldPhase } from '@repo/ui/world/types';
import { useEffect, useRef } from 'react';

interface ProceduralKandyanArtProps {
  mode: WorldMode;
  phase: WorldPhase;
  hour: number;
}

// ---------------------------------------------------------------------------
// 1. Procedural Fine-Art Color Palettes for Kandyan Temple Fresco
// ---------------------------------------------------------------------------
interface FrescoPalette {
  skyTop: string;
  skyHorizon: string;
  sunGlow: string;
  mountainHaze: string;
  terracottaRoof: string;
  timberWood: string;
  pekadaGold: string;
  stoneWall: string;
  sandStupa: string;
  brassLampGlow: string;
  paperTone: string;
  inkContour: string;
}

function getKandyanPalette(hour: number, mode: WorldMode): FrescoPalette {
  const isDark = mode === 'dark';

  // Night / Predawn (Moonlit Sacred Maligawa Court)
  if (hour < 6 || hour >= 20) {
    return {
      skyTop: isDark ? '#06070C' : '#0F1523',
      skyHorizon: isDark ? '#111726' : '#1D2A44',
      sunGlow: '#E2E8F0',
      mountainHaze: isDark ? '#0B0F1A' : '#162035',
      terracottaRoof: isDark ? '#2D1515' : '#4C2424',
      timberWood: isDark ? '#1E120D' : '#3D251A',
      pekadaGold: isDark ? '#B45309' : '#D97706',
      stoneWall: isDark ? '#1C2230' : '#334155',
      sandStupa: isDark ? '#1E293B' : '#475569',
      brassLampGlow: 'rgba(251, 191, 36, 0.45)',
      paperTone: isDark ? 'rgba(8, 12, 22, 0.95)' : 'rgba(245, 238, 225, 0.92)',
      inkContour: isDark ? 'rgba(2, 4, 8, 0.85)' : 'rgba(40, 25, 18, 0.75)',
    };
  }

  // Dawn / Sunrise (Golden Morning Pujas)
  if (hour >= 6 && hour < 9) {
    return {
      skyTop: isDark ? '#220D12' : '#881337',
      skyHorizon: isDark ? '#501B1D' : '#F97316',
      sunGlow: '#FDE047',
      mountainHaze: isDark ? '#2A1118' : '#A21CAF',
      terracottaRoof: isDark ? '#4A1D1D' : '#991B1B',
      timberWood: isDark ? '#2C160E' : '#572614',
      pekadaGold: isDark ? '#D97706' : '#F59E0B',
      stoneWall: isDark ? '#2C3240' : '#E2E8F0',
      sandStupa: isDark ? '#3E4658' : '#FEF3C7',
      brassLampGlow: 'rgba(253, 224, 71, 0.65)',
      paperTone: isDark ? 'rgba(20, 10, 14, 0.95)' : 'rgba(254, 243, 199, 0.92)',
      inkContour: isDark ? 'rgba(8, 2, 4, 0.9)' : 'rgba(67, 20, 7, 0.85)',
    };
  }

  // Daylight / Afternoon (Crisp Highland Sun over Hantana & Asgiriya)
  if (hour >= 9 && hour < 17) {
    return {
      skyTop: isDark ? '#0C1322' : '#0284C7',
      skyHorizon: isDark ? '#1E293B' : '#BAE6FD',
      sunGlow: '#FFFBEB',
      mountainHaze: isDark ? '#141E33' : '#38BDF8',
      terracottaRoof: isDark ? '#421E1E' : '#B91C1C',
      timberWood: isDark ? '#2B170E' : '#6B2D19',
      pekadaGold: isDark ? '#D97706' : '#FBBF24',
      stoneWall: isDark ? '#333D4F' : '#F1F5F9',
      sandStupa: isDark ? '#475569' : '#FFFFFF',
      brassLampGlow: 'rgba(251, 191, 36, 0.55)',
      paperTone: isDark ? 'rgba(12, 18, 30, 0.95)' : 'rgba(254, 252, 246, 0.92)',
      inkContour: isDark ? 'rgba(4, 6, 12, 0.9)' : 'rgba(30, 18, 12, 0.85)',
    };
  }

  // Dusk (Sandhya - Deep Wine Red & Ochre Sunset)
  return {
    skyTop: isDark ? '#200D28' : '#581C87',
    skyHorizon: isDark ? '#4A1525' : '#E11D48',
    sunGlow: '#FDE047',
    mountainHaze: isDark ? '#2E1026' : '#BE123C',
    terracottaRoof: isDark ? '#48191D' : '#881337',
    timberWood: isDark ? '#2C1410' : '#451A03',
    pekadaGold: isDark ? '#D97706' : '#F59E0B',
    stoneWall: isDark ? '#2A2938' : '#CBD5E1',
    sandStupa: isDark ? '#3E3447' : '#FDE047',
    brassLampGlow: 'rgba(253, 224, 71, 0.75)',
    paperTone: isDark ? 'rgba(22, 10, 24, 0.95)' : 'rgba(254, 242, 242, 0.92)',
    inkContour: isDark ? 'rgba(10, 2, 12, 0.9)' : 'rgba(56, 10, 20, 0.85)',
  };
}

// ---------------------------------------------------------------------------
// 2. Procedural Fine-Art Canvas Component
// ---------------------------------------------------------------------------
export function ProceduralKandyanArt({ mode, phase, hour }: ProceduralKandyanArtProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2.0); // Capped for low-end safety
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const updateDimensions = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.0);
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

    const palette = getKandyanPalette(hour, mode);
    const isNight = hour < 6 || hour >= 20;

    // -----------------------------------------------------------------------
    // A. Generate Handmade Fibrous Cotton Paper Grain Once (Offscreen Texture)
    // -----------------------------------------------------------------------
    const paperCanvas = document.createElement('canvas');
    paperCanvas.width = 256;
    paperCanvas.height = 256;
    const pCtx = paperCanvas.getContext('2d')!;
    const imgData = pCtx.createImageData(256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const grain = 240 + Math.floor(Math.random() * 16);
      imgData.data[i] = grain;
      imgData.data[i + 1] = grain;
      imgData.data[i + 2] = grain;
      imgData.data[i + 3] = 255;
    }
    pCtx.putImageData(imgData, 0, 0);

    // -----------------------------------------------------------------------
    // B. Autonomous Sacred Maligawa Brass Lamp Flickers (Gentle Micro-motion)
    // -----------------------------------------------------------------------
    const lamps = [
      { x: cssWidth * 0.18, y: cssHeight * 0.58, baseRadius: 18 },
      { x: cssWidth * 0.5, y: cssHeight * 0.52, baseRadius: 26 },
      { x: cssWidth * 0.82, y: cssHeight * 0.58, baseRadius: 18 },
    ];

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const width = cssWidth;
      const height = cssHeight;

      // 1. Sky Dome Wash (Watercolor Glaze)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
      skyGrad.addColorStop(0, palette.skyTop);
      skyGrad.addColorStop(1, palette.skyHorizon);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.55);

      // 2. Distant Hantana Mountain Ridgeline (Watercolor Ink Wash)
      ctx.save();
      ctx.fillStyle = palette.mountainHaze;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.42);
      ctx.bezierCurveTo(
        width * 0.25, height * 0.32,
        width * 0.45, height * 0.38,
        width * 0.65, height * 0.28
      );
      ctx.bezierCurveTo(
        width * 0.85, height * 0.36,
        width * 0.95, height * 0.34,
        width, height * 0.42
      );
      ctx.lineTo(width, height * 0.55);
      ctx.lineTo(0, height * 0.55);
      ctx.closePath();
      ctx.fill();

      // Atmospheric mist between mountain and courtyard
      const mistGrad = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.48);
      mistGrad.addColorStop(0, 'transparent');
      mistGrad.addColorStop(1, mode === 'dark' ? 'rgba(10, 15, 26, 0.75)' : 'rgba(255, 255, 255, 0.65)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height * 0.35, width, height * 0.13);
      ctx.restore();

      // 3. Sacred White Stupa Dome (Mahiyangana / Sri Dalada Pinnacle in Distance)
      ctx.save();
      const stupaX = width * 0.5;
      const stupaBaseY = height * 0.46;
      const stupaR = 48;

      ctx.beginPath();
      ctx.arc(stupaX, stupaBaseY, stupaR, Math.PI, 0, false);
      ctx.fillStyle = palette.sandStupa;
      ctx.fill();

      // Pinnacle (Kotha & Spire)
      ctx.beginPath();
      ctx.moveTo(stupaX - 12, stupaBaseY - stupaR);
      ctx.lineTo(stupaX + 12, stupaBaseY - stupaR);
      ctx.lineTo(stupaX, stupaBaseY - stupaR - 35);
      ctx.closePath();
      ctx.fillStyle = palette.pekadaGold;
      ctx.fill();
      ctx.restore();

      // 4. Kandyan Multi-Tier Terracotta Tiled Roof (Uda Vihara Architecture)
      ctx.save();
      const roofY = height * 0.48;
      const eavesWidth = width * 0.88;
      const eavesStartX = (width - eavesWidth) / 2;

      // Tier 1: Upper Eaves with Sweeping Curvature
      ctx.beginPath();
      ctx.moveTo(eavesStartX, roofY);
      ctx.quadraticCurveTo(width * 0.5, roofY - 55, eavesStartX + eavesWidth, roofY);
      ctx.lineTo(eavesStartX + eavesWidth - 30, roofY + 45);
      ctx.quadraticCurveTo(width * 0.5, roofY - 15, eavesStartX + 30, roofY + 45);
      ctx.closePath();
      ctx.fillStyle = palette.terracottaRoof;
      ctx.shadowBlur = 18;
      ctx.shadowColor = palette.inkContour;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Individual Terracotta Tile Ridges (Hand-Drawn Line Glaze)
      ctx.strokeStyle = palette.inkContour;
      ctx.lineWidth = 1.6;
      for (let t = 0; t <= 24; t++) {
        const tx = eavesStartX + 40 + (t / 24) * (eavesWidth - 80);
        ctx.beginPath();
        ctx.moveTo(tx, roofY - 20);
        ctx.lineTo(tx + (t - 12) * 1.5, roofY + 42);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Hand-Carved Pekada Wooden Capital Pillars (Traditional Timber Architecture)
      const pillarCount = 5;
      const pillarSpacing = (width * 0.76) / (pillarCount - 1);
      const pillarStartX = width * 0.12;
      const pillarTopY = roofY + 42;
      const pillarBottomY = height * 0.86;

      for (let p = 0; p < pillarCount; p++) {
        const px = pillarStartX + p * pillarSpacing;

        ctx.save();
        // Pekada Capital (Intricate Lotus-Carved Bracket Arch)
        ctx.fillStyle = palette.pekadaGold;
        ctx.beginPath();
        ctx.moveTo(px - 36, pillarTopY);
        ctx.lineTo(px + 36, pillarTopY);
        ctx.bezierCurveTo(px + 28, pillarTopY + 22, px + 12, pillarTopY + 28, px + 8, pillarTopY + 36);
        ctx.lineTo(px - 8, pillarTopY + 36);
        ctx.bezierCurveTo(px - 12, pillarTopY + 28, px - 28, pillarTopY + 22, px - 36, pillarTopY);
        ctx.closePath();
        ctx.fill();

        // Pillar Shaft (Dense Ironwood / Jackwood Timber)
        ctx.fillStyle = palette.timberWood;
        ctx.fillRect(px - 9, pillarTopY + 36, 18, pillarBottomY - (pillarTopY + 36));

        // Stone Base Plinth (Padanama)
        ctx.fillStyle = palette.stoneWall;
        ctx.fillRect(px - 16, pillarBottomY - 14, 32, 14);

        ctx.restore();
      }

      // 6. Sacred Walakulu Bamma (Cloud-Wall Parapet Crest) & Temple Fresco Murals
      ctx.save();
      const wallY = height * 0.72;
      const crenellationWidth = 44;
      const numClouds = Math.ceil(width / crenellationWidth);

      // A. Lower Fresco Wall Plinth (Deep Ochre / Terracotta Temple Plaster)
      ctx.fillStyle = palette.stoneWall;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, wallY);

      for (let c = 0; c < numClouds; c++) {
        const cx = c * crenellationWidth;
        ctx.lineTo(cx + crenellationWidth * 0.5, wallY - 26);
        ctx.lineTo(cx + crenellationWidth, wallY);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // B. Oil Lamp Niches in the Cloud Wall (Filled with Warm Flame Glow)
      for (let c = 0; c < numClouds; c++) {
        const cx = c * crenellationWidth + crenellationWidth * 0.5;
        const nicheY = wallY - 8;

        // Triangular niche cutout
        ctx.beginPath();
        ctx.moveTo(cx - 8, nicheY + 6);
        ctx.lineTo(cx + 8, nicheY + 6);
        ctx.lineTo(cx, nicheY - 8);
        ctx.closePath();
        ctx.fillStyle = palette.inkContour;
        ctx.fill();

        // Flame core
        ctx.beginPath();
        ctx.arc(cx, nicheY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isNight ? '#FEF08A' : '#F59E0B';
        ctx.fill();

        if (isNight) {
          ctx.beginPath();
          ctx.arc(cx, nicheY, 10 + Math.sin(time * 3 + c) * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = palette.brassLampGlow;
          ctx.fill();
        }
      }

      // C. FINE-ART DETAIL: Traditional Kandyan Liyawela (Flowing Floral Vine Band)
      const vineY = wallY + 36;
      ctx.save();
      ctx.strokeStyle = palette.pekadaGold;
      ctx.lineWidth = 2.2;
      ctx.fillStyle = palette.pekadaGold;

      // Draw continuous wavy rhythm vine
      ctx.beginPath();
      ctx.moveTo(0, vineY);
      const waveSpan = 70;
      for (let vx = 0; vx <= width + waveSpan; vx += waveSpan) {
        ctx.quadraticCurveTo(vx + waveSpan * 0.25, vineY - 14, vx + waveSpan * 0.5, vineY);
        ctx.quadraticCurveTo(vx + waveSpan * 0.75, vineY + 14, vx + waveSpan, vineY);
      }
      ctx.stroke();

      // Hand-drawn spiral vine tendrils & Palapethi lotus petal rosettes
      for (let vx = 35; vx <= width; vx += waveSpan) {
        // Spiral tendril
        ctx.beginPath();
        ctx.arc(vx, vineY - 8, 8, 0.4, Math.PI * 1.8);
        ctx.stroke();

        // Rosette blossom (Lotus rosette)
        ctx.beginPath();
        ctx.arc(vx + waveSpan * 0.5, vineY + 8, 5, 0, Math.PI * 2);
        ctx.fill();

        // Petal leaflets
        for (let lp = 0; lp < 4; lp++) {
          const lAngle = (lp / 4) * Math.PI * 2;
          const lx = vx + waveSpan * 0.5 + Math.cos(lAngle) * 9;
          const ly = vineY + 8 + Math.sin(lAngle) * 9;
          ctx.beginPath();
          ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = mode === 'dark' ? '#F59E0B' : '#B91C1C';
          ctx.fill();
        }
        ctx.fillStyle = palette.pekadaGold;
      }
      ctx.restore();

      // D. FINE-ART DETAIL: Sacred Hansa Poottuwa (Sacred Swan Motif Panels on Wall)
      const hansaCount = Math.floor(width / 320);
      for (let h = 0; h < hansaCount; h++) {
        const hx = (width / (hansaCount + 1)) * (h + 1);
        const hy = wallY + 95;

        ctx.save();
        ctx.translate(hx, hy);

        // Circular Medallion Frame
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.strokeStyle = palette.pekadaGold;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 27, 0, Math.PI * 2);
        ctx.strokeStyle = palette.inkContour;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Sacred Swan (Hansa) Stylized Contour (Kandyan Line Art)
        ctx.beginPath();
        ctx.moveTo(-16, 6);
        ctx.bezierCurveTo(-12, 16, 8, 18, 14, 8); // Swan Body
        ctx.bezierCurveTo(18, -4, 10, -16, 2, -18); // Swan Arching Neck
        ctx.bezierCurveTo(-4, -18, -6, -14, -2, -10); // Beak
        ctx.bezierCurveTo(4, -8, 6, -2, 0, 4); // Breast
        ctx.closePath();
        ctx.fillStyle = mode === 'dark' ? 'rgba(254, 243, 199, 0.85)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = palette.inkContour;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Plumed Feathers (Kandyan stylized flowing tail feathers)
        ctx.beginPath();
        ctx.moveTo(-12, 8);
        ctx.quadraticCurveTo(-26, 4, -24, -12);
        ctx.quadraticCurveTo(-18, -4, -10, 2);
        ctx.strokeStyle = palette.pekadaGold;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      // 7. Sacred Hanging Brass Oil Lamps (Deep Focal Atmosphere)
      lamps.forEach((lamp, idx) => {
        ctx.save();
        const flicker = Math.sin(time * 4 + idx * 2.1) * 3;
        const currentR = lamp.baseRadius + flicker;

        // Lamp Flame Glow Halo
        const lampGlowGrad = ctx.createRadialGradient(
          lamp.x, lamp.y, 4,
          lamp.x, lamp.y, currentR * 3
        );
        lampGlowGrad.addColorStop(0, '#FEF08A');
        lampGlowGrad.addColorStop(0.35, '#F59E0B');
        lampGlowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lampGlowGrad;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y, currentR * 3, 0, Math.PI * 2);
        ctx.fill();

        // Brass Lamp Vessel (Deep Golden Metal)
        ctx.fillStyle = palette.pekadaGold;
        ctx.beginPath();
        ctx.ellipse(lamp.x, lamp.y + 8, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hanging Brass Chain up to the Timber Roof
        ctx.strokeStyle = palette.pekadaGold;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lamp.x, roofY + 30);
        ctx.lineTo(lamp.x, lamp.y + 6);
        ctx.stroke();

        ctx.restore();
      });

      // 8. TACTILE FIBROUS PAPER GRAIN OVERLAY (Transforms Digital into Fine Art)
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = mode === 'dark' ? 0.35 : 0.65;
      const paperPattern = ctx.createPattern(paperCanvas, 'repeat');
      if (paperPattern) {
        ctx.fillStyle = paperPattern;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      ctx.restore(); // Restore dpr scale

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [hour, mode, phase]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
