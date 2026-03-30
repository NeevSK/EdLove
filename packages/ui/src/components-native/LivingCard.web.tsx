import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface LivingCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    width: number;
    height: number;
    phase?: string;
    baseColor?: string;
    warmCenter?: boolean;
    cornerRadius?: number;
    grainOpacity?: number;
}

export const LivingCard: React.FC<LivingCardProps> = ({
    children,
    style,
    width,
    height,
    phase,
    baseColor,
    warmCenter = true,
    cornerRadius = 16,
    grainOpacity = 0.04,
}) => {
    const isDark = phase === 'night' || phase === 'predawn' || phase === 'dusk';
    
    // Theme-aligned colors (matching native)
    const warmCenterColor = isDark
        ? 'rgba(61, 53, 40, 0.98)'
        : 'rgba(253, 245, 228, 0.98)';
    const coolEdgeColor = isDark
        ? 'rgba(26, 22, 16, 0.95)'
        : 'rgba(235, 228, 215, 0.98)';
    
    const bg = baseColor ?? (isDark ? '#2A2318' : '#F5EDD6');

    // Filter ID for grain
    const filterId = `grain-filter-${phase || 'default'}`;

    return (
        <View
            style={[
                {
                    width,
                    height,
                    backgroundColor: bg,
                    borderRadius: cornerRadius,
                    overflow: 'hidden',
                },
                style,
            ]}
        
            {/* High-fidelity CSS/SVG "Un-shimming" Layer */}
            {warmCenter && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundImage: `radial-gradient(circle at 50% 30%, ${warmCenterColor} 0%, ${coolEdgeColor} 100%)`,
                        } as any, // BackgroundImage is web-only in RNW
                    ]}
                /
            )}

            {/* Organic Grain Texture (SVG Filter) */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        opacity: grainOpacity * 10, // Adjust for web rendering intensity
                        pointerEvents: 'none',
                    } as any,
                ]}
            
                <svg width="100%" height="100%" style={{ position: 'absolute' }}
                    <filter id={filterId}
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" /
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /
                    </filter
                    <rect width="100%" height="100%" filter={`url(#${filterId})`} /
                </svg
            </View

            {/* Card Content layer */}
            <View style={StyleSheet.absoluteFill}
                {children}
            </View
        </View
    );
};
