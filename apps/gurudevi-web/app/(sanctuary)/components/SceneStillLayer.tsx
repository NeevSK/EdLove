'use client';

import {
  celestialAt,
  isDarkPhase,
  phaseOfMinute,
  seasonOfMonth,
  skyPaletteAt,
} from '@repo/core/scene';
import { useMemo } from 'react';

export interface SceneStillLayerProps {
  fixed?: boolean;
  worldGlow?: string;
}

export function SceneStillLayer({
  fixed = true,
  worldGlow = '#FFE3A8',
}: Readonly<SceneStillLayerProps>) {
  const { palette, celestial, dark } = useMemo(() => {
    const d = new Date();
    const minute = d.getHours() * 60 + d.getMinutes();
    const month = d.getMonth();
    const season = seasonOfMonth(month);
    const pal = skyPaletteAt(minute, season, 'clear', worldGlow);
    const cel = celestialAt(minute);
    const phase = phaseOfMinute(minute);
    const isDark = isDarkPhase(phase);
    return { palette: pal, celestial: cel, dark: isDark };
  }, [worldGlow]);

  const celestialColor =
    celestial.body === 'sun'
      ? 'radial-gradient(circle, #FFF4D0 0%, #F5C564 60%, rgba(245, 197, 100, 0) 100%)'
      : 'radial-gradient(circle, #F8FAFC 0%, #CBD5E1 65%, rgba(203, 213, 225, 0) 100%)';

  const celestialGlow =
    celestial.body === 'sun'
      ? '0 0 45px rgba(245, 197, 100, 0.45)'
      : '0 0 35px rgba(226, 232, 240, 0.35)';

  return (
    <div
      aria-hidden="true"
      data-layer="scene-still"
      data-testid="scene-still"
      style={{
        position: fixed ? 'fixed' : 'absolute',
        zIndex: 0,
        inset: 0,
        width: fixed ? '100vw' : '100%',
        height: fixed ? '100vh' : '100%',
        background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.horizon} 85%)`,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 90%, ${palette.halo} 0%, transparent 60%)`,
          opacity: dark ? 0.35 : 0.65,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${Math.round(celestial.x * 100)}%`,
          bottom: `${Math.round(celestial.lift * 65 + 15)}%`,
          width: celestial.body === 'sun' ? '64px' : '48px',
          height: celestial.body === 'sun' ? '64px' : '48px',
          transform: 'translate(-50%, 50%)',
          borderRadius: '50%',
          background: celestialColor,
          boxShadow: celestialGlow,
          opacity: celestial.lift > 0.05 ? 0.95 : 0.2,
        }}
      />
    </div>
  );
}
