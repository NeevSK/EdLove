// QRCodeGenerator — part of @repo/scanner-kit
//
// WHY SVG?
// QR codes are resolution-independent by nature. Using react-native-svg to render
// the matrix as <Rect> elements means the code looks crisp at any screen density
// (1x, 2x, 3x) and at any size — no pixelation. A PNG/Canvas approach would require
// re-rasterizing at every size. SVG is the correct choice for QR generation in RN.
//
// SECURITY: errorCorrectionLevel 'H' (30% recovery) is used here for maximum
// resilience — damaged or partially obscured codes still scan. Use 'M' if you
// need smaller codes.

import * as Brightness from 'expo-brightness';
import QRCode from 'qrcode';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

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
}

export default function QRCodeGenerator({
  value,
  size = 150,
  color = 'black',
  backgroundColor = 'white',
  label,
  errorCorrectionLevel = 'H',
  borderRadius = 12,
  padding = 12,
}: QRCodeGeneratorProps) {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let originalBrightness = 0.5;
    const boostBrightness = async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          originalBrightness = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1.0);
        }
      } catch (err) {
        console.warn('Failed to set brightness:', err);
      }
    };

    // Self-contained try/catch; intentionally not awaited by the effect.
    void boostBrightness();

    return () => {
      void Brightness.setBrightnessAsync(originalBrightness).catch((err) => {
        console.warn('Failed to restore brightness:', err);
      });
    };
  }, []);

  const matrix = useMemo(() => {
    if (!value) return null;
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel });
      return qr.modules;
    } catch (e) {
      console.error('QR Generation Error', e);
      return null;
    }
  }, [value, errorCorrectionLevel]);

  if (!matrix || matrix.size === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Invalid QR data</Text>
      </View>
    );
  }

  const sizeCells = matrix.size;
  const cellSize = size / sizeCells;

  return (
    <View style={[styles.center, { borderRadius, padding, backgroundColor }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background fill */}
        <Rect x="0" y="0" width={size} height={size} fill={backgroundColor} />

        {/* QR modules */}
        {[...matrix.data].map((cell, index) => {
          if (!cell) return null;
          const row = Math.floor(index / sizeCells);
          const col = index % sizeCells;
          return (
            <Rect
              key={`${row}-${col}`}
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color}
            />
          );
        })}
      </Svg>
      {label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  container: { alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: 8, fontSize: 12, textAlign: 'center' },
});
