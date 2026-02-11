import React, { useMemo } from 'react';
import Svg, { Rect, Defs, ClipPath } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/ui';
import QRCode from 'qrcode';
import { Theme } from '../../constants/Theme';

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    label?: string;
}

export default function QRCodeGenerator({
    value,
    size = 150,
    color = 'black',
    backgroundColor = 'white',
    label
}: QRCodeGeneratorProps) {
    if (!value) return null;

    // Generate QR Code Matrix
    const matrix = useMemo(() => {
        try {
            const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
            return qr.modules;
        } catch (e) {
            console.error("QR Generation Error", e);
            return null;
        }
    }, [value]);

    if (!matrix) return null;

    const sizeCells = matrix.size;
    const cellSize = size / sizeCells;

    // Generate rectangles
    const rects = [];
    const data = matrix.data; // Uint8Array

    for (let row = 0; row < sizeCells; row++) {
        for (let col = 0; col < sizeCells; col++) {
            // Safe access using formula: index = row * size + col
            // The qrcode library uses row-major order
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
            <View style={[styles.qrContainer, { backgroundColor, borderRadius: Theme.corners.comfortable, padding: Theme.spacing.md }]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <Rect x="0" y="0" width={size} height={size} fill={backgroundColor} />
                    {rects}
                </Svg>
            </View>
            {label && (
                <Text color={Theme.colors.pearlGray} size="sm" mt={Theme.spacing.xs as any} textAlign="center">
                    {label}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
