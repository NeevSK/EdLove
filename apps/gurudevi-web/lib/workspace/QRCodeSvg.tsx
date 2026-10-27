'use client';

import QRCode from 'qrcode';
import { useMemo } from 'react';

/** Canonical Gurudevi Lotus Mark SVG petal paths (Teacher, Student, and Bond petals) */
const GURUDEVI_LOTUS_TEACHER_PATH =
  'M 180.26 282.24 L 144.92 284.98 L 106.29 295.39 L 70.68 312.93 L 51.78 326.07 L 40.00 336.76 L 57.81 367.17 L 84.93 396.75 L 116.43 418.94 L 150.67 433.73 L 174.78 439.21 L 204.09 440.58 L 232.30 435.92 L 256.14 425.79 L 255.59 425.51 L 244.08 416.75 L 227.65 400.86 L 215.05 385.25 L 202.99 365.80 L 193.41 344.70 L 187.10 324.98 L 182.45 303.06 L 180.53 282.52 Z';

const GURUDEVI_LOTUS_STUDENT_PATH =
  'M 256.14 425.79 L 277.78 435.38 L 303.53 440.31 L 333.11 439.76 L 361.60 433.73 L 394.48 419.76 L 427.90 396.20 L 452.82 369.08 L 472.00 336.21 L 441.05 312.65 L 406.53 295.67 L 367.63 284.98 L 331.47 282.24 L 328.46 308.27 L 323.80 328.27 L 318.05 345.52 L 308.73 366.07 L 300.24 380.31 L 286.54 398.39 L 271.48 413.73 L 256.96 425.24 Z';

const GURUDEVI_LOTUS_BOND_PATH =
  'M 180.26 282.24 L 179.71 254.58 L 181.90 231.84 L 187.10 207.19 L 195.87 181.16 L 207.65 156.51 L 222.17 133.22 L 238.06 112.95 L 255.86 95.42 L 271.20 109.66 L 289.56 132.67 L 304.90 157.60 L 316.13 181.16 L 324.07 204.17 L 329.83 230.47 L 332.29 257.86 L 331.47 282.24 L 318.05 283.61 L 303.53 286.90 L 295.58 289.92 L 282.98 297.04 L 271.48 307.45 L 266.27 314.02 L 259.97 324.98 L 255.86 335.94 L 252.58 326.62 L 244.63 312.65 L 234.22 301.15 L 228.74 296.76 L 216.14 289.64 L 207.10 286.35 L 194.23 283.61 L 180.53 282.52 Z';

type QRCodeSvgProps = Readonly<{
  value: string;
  size?: number;
  className?: string;
  color?: string;
  bgColor?: string;
  showLotus?: boolean;
  lotusColor?: string;
}>;

export function QRCodeSvg({
  value,
  size = 120,
  className,
  color = '#131e27',
  bgColor = '#ffffff',
  showLotus = false,
  lotusColor = '#EF841F',
}: QRCodeSvgProps) {
  const qr = useMemo(() => {
    if (!value) return null;
    try {
      const ecc = showLotus ? 'H' : 'M';
      return QRCode.create(value, { errorCorrectionLevel: ecc });
    } catch {
      return null;
    }
  }, [value, showLotus]);

  if (!qr) return null;

  const moduleCount = qr.modules.size;

  // Compute center clearance area for lotus emblem if requested
  const centerClearance = showLotus ? Math.min(Math.floor(moduleCount * 0.26), 9) : 0;
  const centerStart = Math.floor((moduleCount - centerClearance) / 2);
  const centerEnd = centerStart + centerClearance;

  // Compile all QR data modules into a single high-performance compound path string
  let pathData = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.modules.get(row, col)) continue;

      if (
        showLotus &&
        row >= centerStart &&
        row < centerEnd &&
        col >= centerStart &&
        col < centerEnd
      ) {
        continue;
      }

      // Compact rectangle path: Move to (col, row), horizontal 1, vertical 1, horizontal -1, close
      pathData += `M${col},${row}h1v1h-1z`;
    }
  }

  // Sizing for central lotus emblem if enabled
  const centerCoord = moduleCount / 2;
  const badgeRadius = (centerClearance / 2) + 0.25;
  const targetEmblemSize = centerClearance * 0.85;
  const scale = targetEmblemSize / 512;
  const translateX = centerCoord - 256 * scale;
  const translateY = centerCoord - 268 * scale;

  return (
    <svg
      viewBox={`0 0 ${moduleCount} ${moduleCount}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      style={{ display: 'block', background: bgColor }}
      aria-label={`QR Code for ${value}`}
    >
      {/* Background fill */}
      <rect width={moduleCount} height={moduleCount} fill={bgColor} />

      {/* Single compound path for entire QR code matrix (1 draw call) */}
      <path d={pathData} fill={color} />

      {/* Optional central Gurudevi Lotus emblem */}
      {showLotus && (
        <g>
          {/* Quiet-margin circular shield */}
          <circle
            cx={centerCoord}
            cy={centerCoord}
            r={badgeRadius}
            fill={bgColor}
            stroke={color}
            strokeWidth={0.15}
          />
          {/* Inner gold aura line */}
          <circle
            cx={centerCoord}
            cy={centerCoord}
            r={badgeRadius - 0.2}
            fill="none"
            stroke={lotusColor}
            strokeWidth={0.08}
            opacity={0.4}
          />
          {/* Canonical Gurudevi Lotus Mark SVG vector */}
          <g
            transform={`translate(${translateX}, ${translateY}) scale(${scale})`}
            fill={lotusColor}
          >
            <path d={GURUDEVI_LOTUS_TEACHER_PATH} />
            <path d={GURUDEVI_LOTUS_STUDENT_PATH} />
            <path d={GURUDEVI_LOTUS_BOND_PATH} />
          </g>
        </g>
      )}
    </svg>
  );
}
