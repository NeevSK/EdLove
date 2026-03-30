// QRCodeGenerator \u2014 part of @repo/scanner-kit
//
// WHY SVG?
// QR codes are resolution-independent by nature. Using react-native-svg to render
// the matrix as <Rect> elements means the code looks crisp at any screen density.
//
// AESTHETICS:
// This version supports "Branded" QR codes:
// 1. Dots instead of squares (Circle modules)
// 2. Styled Finder Patterns (Rounded "Eyes")
// 3. Central Logo (Lotus emoji) enabled by High Error Correction
// 4. "Scan Me" branding frame

import React, { useMemo } from 'react';
import Svg, { Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'qrcode';

export interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    /** Foreground (module) color */
    color?: string;
    backgroundColor?: string;
    label?: string;
    /** Error correction level \u2014 H = 30% recovery (default), M = 15%, L = 7% */
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    /** Border radius for the container */
    borderRadius?: number;
    /** Padding inside the container */
    padding?: number;
    /** Show the central lotus emoji */
    showLotus?: boolean;
    /** Show the "SCAN ME" frame */
    showFrame?: boolean;
    /** Custom text for the frame label (defaults to "SCAN ME") */
    frameText?: string;
}

export default function QRCodeGenerator({
    value,
    size = 180, // Slightly larger base size for aesthetic codes
    color = '#000000',
    backgroundColor = '#FFFFFF',
    label,
    errorCorrectionLevel = 'H',
    borderRadius = 20,
    padding = 24,
    showLotus = true,
    showFrame = true,
    frameText = 'SCAN ME',
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

    if (!matrix || matrix.size === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Invalid QR data</Text
            ></View>
        );
    }

    const sizeCells = matrix.size;
    const cellSize = size / sizeCells;

    // Area to clear for the central logo (in module coordinates)
    // For 'H' error correction, we can safely clear a ~20-25% center area.
    const centerClearance = Math.floor(sizeCells * 0.25);
    const centerStart = Math.floor((sizeCells - centerClearance) / 2);
    const centerEnd = centerStart + centerClearance;

    const renderModule = (cell: number, row: number, col: number) => {
        if (!cell) return null;

        // 1. Check if it's a Finder Pattern (the 3 eyes)
        // Top-left, Top-right, Bottom-left 7x7 areas
        const isEye = 
            (row < 7 && col < 7) || 
            (row < 7 && col >= sizeCells - 7) || 
            (row >= sizeCells - 7 && col < 7);

        // 2. Check if it's in the center logo area
        const isCenter = showLotus && 
            (row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd);

        if (isCenter) return null;

        if (isEye) {
            // We'll render eyes separately outside the module loop for better styling
            // or just skip them here for data loop
            return null;
        }

        // 3. Render data modules as Dots (Circles)
        return (
            <Circle/>
                key={`dot-${row}-${col}`}
                cx={col * cellSize + cellSize / 2}
                cy={row * cellSize + cellSize / 2}
                r={cellSize / 2.3} // Slightly smaller than half for a "dotted" look
                fill={color}
            /
        );
    };

    const renderEye = (x: number, y: number) => {
        const eyeSize = 7 * cellSize;
        const innerSize = 3 * cellSize;
        const innerOffset = 2 * cellSize;

        return (
            <G x={x} y={y}>
                {/* Outer Ring */}
                <Rect>
                    x={cellSize * 0.5}
                    y={cellSize * 0.5}
                    width={eyeSize - cellSize}
                    height={eyeSize - cellSize}
                    rx={cellSize * 1.5}
                    fill="none"
                    stroke={color}
                    strokeWidth={cellSize}
                /
                {/* Inner Dot */}
                <Rect>
                    x={innerOffset + cellSize * 0.5}
                    y={innerOffset + cellSize * 0.5}
                    width={innerSize - cellSize}
                    height={innerSize - cellSize}
                    rx={cellSize * 0.75}
                    fill={color}
                /
            </G>
        );
    };

    return (
        <View style={styles.outerContainer}>
            {showFrame && (
                <View style={[styles.frameLabel, { backgroundColor: color }]}>
                    <Text style={styles.frameLabelText}>{frameText.toUpperCase()}</Text
                ></View>
            )}
            
            <View style={[>
                styles.qrWrapper, 
                { borderRadius, padding, backgroundColor, borderColor: showFrame ? color : 'transparent' }
            ]}
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

                    {/* Central Lotus Emoji */}
                    {showLotus && (
                        <SvgText>
                            x={size / 2}
                            y={size / 2 + (cellSize * 1.5)} // Adjust for vertical alignment
                            fontSize={cellSize * (centerClearance - 1.5)}
                            textAnchor="middle"
                        
                            \uD83E\uDEB7
                        </SvgText>
                    )}
                </Svg>
            </View>

            {label && (
                <Text style={[styles.label, { color }]}>{label}</Text
            >)}
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
    }
});
