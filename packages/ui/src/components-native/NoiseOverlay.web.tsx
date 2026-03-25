import React from 'react';
import { View, StyleSheet } from 'react-native';

interface NoiseOverlayProps {
    opacity?: number;
    warm?: boolean;
    frequency?: number;
}

export const NoiseOverlay: React.FC<NoiseOverlayProps> = ({
    opacity = 0.05,
    warm = false,
    frequency = 0.8,
}) => {
    const filterId = 'noise-overlay-filter';
    
    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                {
                    pointerEvents: 'none',
                    opacity: opacity * 2, // Adjust for web intensity
                } as any,
            ]}
        >
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <filter id={filterId}>
                    <feTurbulence 
                        type="fractalNoise" 
                        baseFrequency={frequency} 
                        numOctaves="3" 
                        stitchTiles="stitch" 
                    />
                    {warm && (
                        <feColorMatrix 
                            type="matrix" 
                            values="1.1 0 0 0 0  0 1.05 0 0 0  0 0 0.9 0 0  0 0 0 1 0" 
                        />
                    )}
                </filter>
                <rect width="100%" height="100%" filter={`url(#${filterId})`} />
            </svg>
        </View>
    );
};
