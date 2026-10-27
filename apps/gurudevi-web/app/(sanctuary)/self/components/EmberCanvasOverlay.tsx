'use client';

import { useEffect, useRef } from 'react';
import styles from './ember-canvas-overlay.module.css';

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  swaySpeed: number;
  swayOffset: number;
}

const EMBER_COLORS = [
  '#ffffff', // bright spark
  '#fff4cc', // warm white
  '#ffd166', // amber gold
  '#f77f00', // orange flame
  '#ea580c', // deep ember
  '#dc2626', // ruby heat
];

export function EmberCanvasOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 80 particles
    const particles: EmberParticle[] = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: height * 0.4 + Math.random() * (height * 0.6),
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1.4 + Math.random() * 2.8),
      size: 1.8 + Math.random() * 3.2,
      color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)] ?? '#ffd166',
      alpha: 0.7 + Math.random() * 0.3,
      decay: 0.005 + Math.random() * 0.012,
      swaySpeed: 0.03 + Math.random() * 0.05,
      swayOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        p.y += p.vy;
        p.x += p.vx + Math.sin(frame * p.swaySpeed + p.swayOffset) * 0.6;
        p.alpha -= p.decay;

        // Reset particle when it fades or rises out of bounds
        if (p.alpha <= 0 || p.y < -10) {
          p.x = Math.random() * width;
          p.y = height + Math.random() * 20;
          p.alpha = 0.8 + Math.random() * 0.2;
          p.vy = -(1.4 + Math.random() * 2.8);
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.overlayContainer} aria-hidden="true">
      <div className={styles.heatHaze} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
