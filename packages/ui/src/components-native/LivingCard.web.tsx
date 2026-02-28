/**
 * Web fallback for LivingCard.
 *
 * On native, LivingCard uses @shopify/react-native-skia to draw a living
 * vellum background with subsurface scattering and film grain.  Skia's web
 * (CanvasKit/WASM) build requires extra server setup that is out of scope for
 * the initial web release.
 *
 * On web, Metro resolves this .web.tsx file instead of LivingCard.tsx.
 * The fallback renders a plain View with the same bg colour derived from the
 * phase prop so the card still carries the Sanctuary's visual identity.
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';

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
    cornerRadius = 16,
}) => {
    const isDark = phase === 'night' || phase === 'predawn' || phase === 'dusk';
    const bg = baseColor ?? (isDark ? '#2A2318' : '#F5EDD6');

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
        >
            {children}
        </View>
    );
};
