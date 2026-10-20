'use client';

import QRCode from 'qrcode';
import { useMemo } from 'react';

type QRCodeSvgProps = Readonly<{
  value: string;
  size?: number;
  className?: string;
  color?: string;
  bgColor?: string;
}>;

export function QRCodeSvg({
  value,
  size = 120,
  className,
  color = '#131e27',
  bgColor = '#ffffff',
}: QRCodeSvgProps) {
  const qr = useMemo(() => {
    if (!value) return null;
    try {
      return QRCode.create(value, { errorCorrectionLevel: 'M' });
    } catch {
      return null;
    }
  }, [value]);

  if (!qr) return null;

  const moduleCount = qr.modules.size;
  const rects: Array<{ x: number; y: number }> = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.modules.get(row, col)) {
        rects.push({ x: col, y: row });
      }
    }
  }

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
      <rect width={moduleCount} height={moduleCount} fill={bgColor} />
      {rects.map((r) => (
        <rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={1}
          height={1}
          fill={color}
        />
      ))}
    </svg>
  );
}
