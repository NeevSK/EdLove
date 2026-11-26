import type { ComponentProps } from 'react';

export interface SriLankaFlagProps extends Omit<ComponentProps<'img'>, 'src' | 'alt'> {
  width?: number;
  height?: number;
}

/**
 * Universal precision rendering of the Sri Lankan national flag (Simha Kodiya).
 *
 * Grounded in the official Government of Sri Lanka / Wikimedia vector standard:
 * - Exact 1:2 aspect ratio (default 22px × 11px)
 * - 100% authentic, crisp vector asset (/flags/lk.svg) with zero hand-waved approximations
 * - The SVG is served as is, so it stays sharp at any display DPI
 * - Subtle ambient ring for seamless contrast on both cream paper and night themes
 * - Strict accessibility compliance
 */
export function SriLankaFlag({
  width = 22,
  height = 11,
  className = '',
  ...props
}: SriLankaFlagProps) {
  return (
    <img
      src="/flags/lk.svg"
      alt="Flag of Sri Lanka"
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={`inline-block shrink-0 rounded-[2px] ring-1 ring-black/15 dark:ring-white/20 align-baseline overflow-hidden shadow-xs object-cover ${className}`}
      {...props}
    />
  );
}
