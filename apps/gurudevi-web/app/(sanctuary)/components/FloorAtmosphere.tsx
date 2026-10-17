'use client';

import React, { useEffect, useRef } from 'react';
import styles from './floor-atmosphere.module.css';

export type FloorAtmosphereKind = 'none' | 'washi-grain' | 'aurora-mesh' | 'celestial-embers';

export type SanctuaryPreset = 'default' | 'dawn' | 'garden' | 'night';

const PRESET_PARTICLE_COLORS: Record<SanctuaryPreset, { r: number; g: number; b: number }> = {
  night: { r: 192, g: 205, b: 235 },
  dawn: { r: 235, g: 168, b: 120 },
  garden: { r: 145, g: 195, b: 130 },
  default: { r: 212, g: 132, b: 58 },
};

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  growth: number;
}

export function FloorAtmosphere({
  kind = 'none',
  preset = 'default',
}: Readonly<{
  kind?: FloorAtmosphereKind;
  preset?: SanctuaryPreset;
}>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (kind !== 'celestial-embers') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return () => window.removeEventListener('resize', onResize);
    }

    const count = 30;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.2 + Math.random() * 0.45),
        alpha: Math.random() * 0.5,
        maxAlpha: 0.3 + Math.random() * 0.4,
        growth: 0.003 + Math.random() * 0.005,
      });
    }

    let isVisible = !document.hidden;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const color = PRESET_PARTICLE_COLORS[preset] ?? PRESET_PARTICLE_COLORS.default;
    let lastFrameTime = 0;
    const minFrameIntervalMs = 28; // ~35fps cap to conserve fill-rate on low-memory devices

    const render = (timestamp: number) => {
      if (timestamp - lastFrameTime >= minFrameIntervalMs) {
        lastFrameTime = timestamp;

        if (isVisible) {
          ctx.clearRect(0, 0, width, height);

          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += p.growth;

            if (p.alpha > p.maxAlpha || p.alpha < 0.05) {
              p.growth = -p.growth;
            }

            if (p.y < -10) {
              p.y = height + 10;
              p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, p.alpha)})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [kind, preset]);

  if (kind === 'none') {
    return null;
  }

  return (
    <div aria-hidden="true" className={styles.atmosphereContainer} data-testid="floor-atmosphere">
      {kind === 'washi-grain' ? <div className={styles.washiGrain} /> : null}
      {kind === 'aurora-mesh' ? <div className={styles.auroraMesh} /> : null}
      {kind === 'celestial-embers' ? (
        <canvas className={styles.embersCanvas} ref={canvasRef} />
      ) : null}
      <div className={styles.vignetteOverlay} />
    </div>
  );
}
