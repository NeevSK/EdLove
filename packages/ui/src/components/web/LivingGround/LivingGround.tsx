import type { HTMLAttributes, ReactNode, Ref } from 'react';
import type { LivingGroundContract } from '../../../theme/contracts';
import { LIVING_MOTIFS } from '../../shared/livingMotifs';
import { cx } from '../cx';

export interface LivingGroundProps extends LivingGroundContract, HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function LivingGround({
  atmosphere = 'canopy',
  dither = true,
  worldId,
  className,
  children,
  ref,
  ...rest
}: LivingGroundProps) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx('gd-living-ground', className)}
      data-atmosphere={atmosphere}
      data-dither={dither ? 'true' : 'false'}
      data-world={worldId}
    >
      {dither ? (
        <svg
          className="gd-living-ground-surface"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            {/* 1. Light Mode: Sunlit Fibrous Paper Tooth */}
            <filter id="gd-paper-relief" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.04" numOctaves="4" result="noise" />
              <feDiffuseLighting in="noise" lightingColor="var(--w-raised, white)" surfaceScale="1.4" diffuseConstant="1.1" result="light">
                <feDistantLight azimuth="55" elevation="65" />
              </feDiffuseLighting>
              <feComponentTransfer in="light" result="paper">
                <feFuncR type="linear" slope="0.94" />
                <feFuncG type="linear" slope="0.95" />
                <feFuncB type="linear" slope="0.90" />
              </feComponentTransfer>
            </filter>

            {/* 2. Dark Mode: Nocturnal Moon Milk (Sanda-Kiri) & Silken Fluid Caustics */}
            <filter id="gd-moon-milk" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.005 0.018" numOctaves="3" result="waves" />
              <feTurbulence type="turbulence" baseFrequency="0.015 0.035" numOctaves="2" result="sheen" />
              <feComposite in="waves" in2="sheen" operator="arithmetic" k1="0" k2="0.75" k3="0.25" k4="0" result="silkSurface" />
              <feDiffuseLighting in="silkSurface" lightingColor="var(--w-glow, white)" surfaceScale="2.2" diffuseConstant="1.25" result="lunarLight">
                <feDistantLight azimuth="225" elevation="42" />
              </feDiffuseLighting>
              <feComponentTransfer in="lunarLight" result="moonMilk">
                <feFuncR type="gamma" amplitude="1" exponent="1.7" offset="0" />
                <feFuncG type="gamma" amplitude="1" exponent="1.5" offset="0" />
                <feFuncB type="gamma" amplitude="1" exponent="1.3" offset="0" />
              </feComponentTransfer>
            </filter>
          </defs>

          {/* Dual-Personality Material Surfaces */}
          <rect width="100%" height="100%" filter="url(#gd-paper-relief)" className="gd-paper-rect gd-light-texture" />
          <rect width="100%" height="100%" filter="url(#gd-moon-milk)" className="gd-paper-rect gd-dark-texture" />

          {/* World-wise Watermark Motifs with Restrained Dual-Tone Relief */}
          {Object.values(LIVING_MOTIFS).map((motif) => (
            <g key={motif.id} className="gd-world-motif gd-living-vein-group" data-world={motif.id}>
              {motif.paths.map((p, idx) => (
                <g key={idx}>
                  <path
                    d={p.d}
                    className="gd-motif-shadow gd-vein-shadow"
                    strokeWidth={p.width + 1.2}
                    strokeLinecap="round"
                    transform="translate(0.8, 1.2)"
                  />
                  <path
                    d={p.d}
                    className="gd-motif-light gd-vein-light"
                    strokeWidth={p.width}
                    strokeLinecap="round"
                    transform="translate(-0.4, -0.6)"
                  />
                </g>
              ))}
            </g>
          ))}
        </svg>
      ) : null}
      <div className="gd-living-ground-content">{children}</div>
    </div>
  );
}
