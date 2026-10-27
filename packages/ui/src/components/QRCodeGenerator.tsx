// QRCodeGenerator — part of @repo/ui
//
// WHY SVG?
// QR codes are resolution-independent by nature. Using react-native-svg to render
// the matrix means the code looks crisp at any screen density (1x, 2x, 3x) and print size.
//
// AESTHETICS & BRANDING:
// 1. Organic module shapes (dots, rounded squircles, or classic squares)
// 2. Styled Finder Patterns (Concentric sacred sanctum "Eyes")
// 3. Central Canonical Gurudevi Lotus Mark vector emblem (Teacher, Student, Bond petals)
// 4. "Scan Me" branding frame with custom text support

import { Text, View } from '@repo/ui/primitives';
import QRCode from 'qrcode';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/** Canonical Gurudevi Lotus Mark SVG petal paths (Teacher, Student, and Bond petals) */
const GURUDEVI_LOTUS_TEACHER_PATH =
  'M 180.26 282.24 L 144.92 284.98 L 106.29 295.39 L 70.68 312.93 L 51.78 326.07 L 40.00 336.76 L 57.81 367.17 L 84.93 396.75 L 116.43 418.94 L 150.67 433.73 L 174.78 439.21 L 204.09 440.58 L 232.30 435.92 L 256.14 425.79 L 255.59 425.51 L 244.08 416.75 L 227.65 400.86 L 215.05 385.25 L 202.99 365.80 L 193.41 344.70 L 187.10 324.98 L 182.45 303.06 L 180.53 282.52 Z';

const GURUDEVI_LOTUS_STUDENT_PATH =
  'M 256.14 425.79 L 277.78 435.38 L 303.53 440.31 L 333.11 439.76 L 361.60 433.73 L 394.48 419.76 L 427.90 396.20 L 452.82 369.08 L 472.00 336.21 L 441.05 312.65 L 406.53 295.67 L 367.63 284.98 L 331.47 282.24 L 328.46 308.27 L 323.80 328.27 L 318.05 345.52 L 308.73 366.07 L 300.24 380.31 L 286.54 398.39 L 271.48 413.73 L 256.96 425.24 Z';

const GURUDEVI_LOTUS_BOND_PATH =
  'M 180.26 282.24 L 179.71 254.58 L 181.90 231.84 L 187.10 207.19 L 195.87 181.16 L 207.65 156.51 L 222.17 133.22 L 238.06 112.95 L 255.86 95.42 L 271.20 109.66 L 289.56 132.67 L 304.90 157.60 L 316.13 181.16 L 324.07 204.17 L 329.83 230.47 L 332.29 257.86 L 331.47 282.24 L 318.05 283.61 L 303.53 286.90 L 295.58 289.92 L 282.98 297.04 L 271.48 307.45 L 266.27 314.02 L 259.97 324.98 L 255.86 335.94 L 252.58 326.62 L 244.63 312.65 L 234.22 301.15 L 228.74 296.76 L 216.14 289.64 L 207.10 286.35 L 194.23 283.61 L 180.53 282.52 Z';

export interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  /** Foreground (module) color */
  color?: string;
  backgroundColor?: string;
  label?: string;
  /** Error correction level — H = 30% recovery (default), M = 15%, L = 7% */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Border radius for the container */
  borderRadius?: number;
  /** Padding inside the container */
  padding?: number;
  /** Show the central canonical Gurudevi Lotus Mark */
  showLotus?: boolean;
  /** Color of the central Lotus emblem (defaults to Gurudevi Saffron #EF841F) */
  lotusColor?: string;
  /** Visual module shape: dots (default), rounded squircles, or classic squares */
  moduleShape?: 'dots' | 'rounded' | 'squares';
  /** Show the "SCAN ME" frame */
  showFrame?: boolean;
  /** Custom text for the frame label (defaults to "SCAN ME") */
  frameText?: string;
}

export default function QRCodeGenerator({
  value,
  size = 180,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  label,
  errorCorrectionLevel = 'H',
  borderRadius = 20,
  padding = 24,
  showLotus = true,
  lotusColor = '#EF841F',
  moduleShape = 'dots',
  showFrame = true,
  frameText = 'SCAN ME',
}: QRCodeGeneratorProps) {
  // Enforce level 'H' when lotus emblem is shown to guarantee optical scannability with center clearance
  const effectiveEcc = showLotus ? 'H' : errorCorrectionLevel;

  // Hook order must not depend on props: compute defensively, render-null below.
  const matrix = useMemo(() => {
    if (!value) return null;
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel: effectiveEcc });
      return qr.modules;
    } catch (e) {
      console.error('QR Generation Error', e);
      return null;
    }
  }, [value, effectiveEcc]);

  if (!value) return null;

  if (!matrix || matrix.size === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Invalid QR data</Text>
      </View>
    );
  }

  const sizeCells = matrix.size;
  const cellSize = size / sizeCells;

  // Area to clear for the central logo (in module coordinates)
  // For 'H' error correction, we safely clear ~24-26% center area
  const centerClearance = showLotus ? Math.min(Math.floor(sizeCells * 0.26), 9) : 0;
  const centerStart = Math.floor((sizeCells - centerClearance) / 2);
  const centerEnd = centerStart + centerClearance;

  const renderModule = (cell: number, row: number, col: number) => {
    if (!cell) return null;

    // 1. Check if it's a Finder Pattern (the 3 eyes: top-left, top-right, bottom-left 7x7)
    const isEye =
      (row < 7 && col < 7) ||
      (row < 7 && col >= sizeCells - 7) ||
      (row >= sizeCells - 7 && col < 7);

    if (isEye) {
      // Eyes are rendered separately with sacred concentric geometry
      return null;
    }

    // 2. Check if it's in the center logo area
    const isCenter =
      showLotus && row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd;

    if (isCenter) return null;

    // 3. Render data module by shape preference
    const x = col * cellSize;
    const y = row * cellSize;

    if (moduleShape === 'dots') {
      return (
        <Circle
          key={`dot-${row}-${col}`}
          cx={x + cellSize / 2}
          cy={y + cellSize / 2}
          r={cellSize / 2.3}
          fill={color}
        />
      );
    }

    if (moduleShape === 'rounded') {
      const pad = cellSize * 0.08;
      return (
        <Rect
          key={`round-${row}-${col}`}
          x={x + pad}
          y={y + pad}
          width={cellSize - pad * 2}
          height={cellSize - pad * 2}
          rx={cellSize * 0.28}
          fill={color}
        />
      );
    }

    // Default squares
    return (
      <Rect
        key={`sq-${row}-${col}`}
        x={x}
        y={y}
        width={cellSize}
        height={cellSize}
        fill={color}
      />
    );
  };

  const renderEye = (x: number, y: number) => {
    const eyeSize = 7 * cellSize;
    const innerSize = 3 * cellSize;
    const innerOffset = 2 * cellSize;

    return (
      <G x={x} y={y}>
        {/* Outer Ring */}
        <Rect
          x={cellSize * 0.5}
          y={cellSize * 0.5}
          width={eyeSize - cellSize}
          height={eyeSize - cellSize}
          rx={cellSize * 1.5}
          fill="none"
          stroke={color}
          strokeWidth={cellSize}
        />
        {/* Inner Core */}
        <Rect
          x={innerOffset + cellSize * 0.5}
          y={innerOffset + cellSize * 0.5}
          width={innerSize - cellSize}
          height={innerSize - cellSize}
          rx={cellSize * 0.75}
          fill={color}
        />
      </G>
    );
  };

  const renderCenterEmblem = () => {
    if (!showLotus) return null;

    const badgePixelSize = centerClearance * cellSize;
    const badgeRadius = badgePixelSize / 2 + cellSize * 0.25;
    const targetEmblemSize = badgePixelSize * 0.85;
    const scale = targetEmblemSize / 512;
    const centerCoord = size / 2;
    const translateX = centerCoord - 256 * scale;
    const translateY = centerCoord - 268 * scale;

    return (
      <G>
        {/* Protective quiet-margin circular badge */}
        <Circle
          cx={centerCoord}
          cy={centerCoord}
          r={badgeRadius}
          fill={backgroundColor}
          stroke={color}
          strokeWidth={1}
        />
        {/* Subtle sanctuary inner gold aura line */}
        <Circle
          cx={centerCoord}
          cy={centerCoord}
          r={badgeRadius - 1.5}
          fill="none"
          stroke={`${lotusColor}40`}
          strokeWidth={1}
        />
        {/* Canonical Gurudevi Lotus Mark SVG vector */}
        <G
          transform={`translate(${translateX}, ${translateY}) scale(${scale})`}
        >
          <Path d={GURUDEVI_LOTUS_TEACHER_PATH} fill={lotusColor} />
          <Path d={GURUDEVI_LOTUS_STUDENT_PATH} fill={lotusColor} />
          <Path d={GURUDEVI_LOTUS_BOND_PATH} fill={lotusColor} />
        </G>
      </G>
    );
  };

  return (
    <View style={styles.outerContainer}>
      {showFrame && (
        <View style={[styles.frameLabel, { backgroundColor: color }]}>
          <Text style={styles.frameLabelText}>{frameText.toUpperCase()}</Text>
        </View>
      )}

      <View
        style={[
          styles.qrWrapper,
          {
            borderRadius,
            padding,
            backgroundColor,
            borderColor: showFrame ? color : 'transparent',
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background fill */}
          <Rect x="0" y="0" width={size} height={size} fill={backgroundColor} />

          {/* Render Eyes first */}
          {renderEye(0, 0)}
          {renderEye((sizeCells - 7) * cellSize, 0)}
          {renderEye(0, (sizeCells - 7) * cellSize)}

          {/* QR data modules */}
          {[...matrix.data].map((cell, index) => {
            const row = Math.floor(index / sizeCells);
            const col = index % sizeCells;
            return renderModule(cell, row, col);
          })}

          {/* Canonical Gurudevi Lotus Vector Emblem */}
          {renderCenterEmblem()}
        </Svg>
      </View>

      {label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  frameLabel: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: -2, // Slight overlap
    zIndex: 1,
  },
  frameLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
