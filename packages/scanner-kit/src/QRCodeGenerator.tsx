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

import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'qrcode';

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
    if (!value) return null;

    const matrix = useMemo(() => {
        try {
            const qr = QRCode.create(value, { errorCorrectionLevel });
            return qr.modules;
        } catch (e) {
            console.error('QR Generation Error', e);
            return null;
        }
    }, [value, errorCorrectionLevel]);

    if (!matrix) return null;

    const sizeCells = matrix.size;
    const cellSize = size / sizeCells;

    // Build SVG <Rect> elements for each dark module
    const rects: React.ReactElement[] = [];
    const data = matrix.data; // Uint8Array, row-major order

    for (let row = 0; row < sizeCells; row++) {
        for (let col = 0; col < sizeCells; col++) {
            if (data[row * sizeCells + col]) {
                rects.push(
                    <Rect
                        key={`${row}-${col}`}
                        x={col * cellSize}
                        y={row * cellSize}
                        width={cellSize}
                        height={cellSize}
                        fill={color}
                    />
                );
            }
        }
    }

    return (
        <View style={styles.center}>
            <View style={[styles.container, { backgroundColor, borderRadius, padding }]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background fill */}
                    <Rect x="0" y="0" width={size} height={size} fill={backgroundColor} />
                    {/* QR modules */}
                    {rects}
                </Svg>
            </View>
            {label && (
                <Text style={[styles.label, { color }]}>{label}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    container: { alignItems: 'center', justifyContent: 'center' },
    label: { marginTop: 8, fontSize: 12, textAlign: 'center' },
});
