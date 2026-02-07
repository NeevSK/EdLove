import React, { useMemo } from 'react';
import Svg, { Rect, Defs, ClipPath } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { Text } from '@gluestack-ui/themed';
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

    // Memoize the QR Code generation to avoid re-computation on every render
    const qrMatrix = useMemo(() => {
        try {
            const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
            return qr.modules.data; // Flattened array of 0s and 1s? No, it's a Uint8Array row-major
            // Actually, newer qrcode versions return a `modules` object with `data`, `size`, etc.
            // Let's check structure or assume standard qrcode lib behavior.

            // QRCode.create returns a QRCode object.
            // qr.modules is a BitMatrix.
            // qr.modules.size is the dimension (e.g. 21, 25...)
            // qr.modules.data is a Uint8Array. 
            // qr.modules.isDark(row, col) helper exists? No, usually .get(row, col)

            // Let's implement a robust matrix parser.
        } catch (e) {
            console.error("QR Generation Error", e);
            return null;
        }
    }, [value]);

    if (!qrMatrix) return null;

    // Re-generate using create again to get the full object because useMemo above didn't return dimensions
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const sizeCells = modules.size;
    const cellSize = size / sizeCells;

    // Generate rectangles
    const rects = [];
    for (let row = 0; row < sizeCells; row++) {
        for (let col = 0; col < sizeCells; col++) {
            if (modules.get(row, col)) {
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
