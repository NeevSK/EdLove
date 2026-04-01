import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
    Canvas,
    Rect,
    Turbulence,
    ColorMatrix,
    Paint,
} from '@shopify/react-native-skia';

interface NoiseOverlayProps {
    opacity?: number;        // Default 0.03 - 3% warm grain
    warm?: boolean;          // Default true - warm tinted grain
    frequency?: number;      // Default 0.65 - grain fineness
}

export const NoiseOverlay: React.FC<NoiseOverlayProps> = ({
    opacity = 0.03,
    warm = true,
    frequency = 0.65,
}) => {
    const { width, height } = useWindowDimensions();

    // Warm grain color matrix - slight saffron tint
    const warmMatrix = [
        1, 0, 0, 0, 0.02,   // R: slight warm boost
        0, 1, 0, 0, 0.01,   // G: slight warm boost  
        0, 0, 1, 0, -0.01,   // B: slight cool reduction
        0, 0, 0, opacity, 0, // A: controlled opacity
    ];

    // Cool grain color matrix - slight aurora tint
    const coolMatrix = [
        1, 0, 0, 0, -0.01,   // R: slight cool reduction
        0, 1, 0, 0, 0.01,   // G: neutral
        0, 0, 1, 0, 0.02,   // B: slight cool boost
        0, 0, 0, opacity, 0,
    ];

    return (
        <Canvas
            style={[StyleSheet.absoluteFill, styles.canvas]}
            pointerEvents="none"  // Never intercepts touches
        >
            <Rect x={0} y={0} width={width} height={height}>
                <Paint>
                    <Turbulence
                        freqX={frequency}
                        freqY={frequency}
                        octaves={4}
                        seed={2}
                    />
                    <ColorMatrix matrix={warm ? warmMatrix : coolMatrix} />
                </Paint>
            </Rect>
        </Canvas>
    );
};

const styles = StyleSheet.create({
    canvas: {
        zIndex: 9999,           // Above everything
    },
});
