/**
 * Web fallback for TemporalGlass.
 *
 * On native, TemporalGlass draws a phase-aware luminous Skia border around a
 * BlurView container.  On web, Metro resolves this .web.tsx file.
 * The fallback uses a CSS box-shadow + border to approximate the glass border
 * effect without any native canvas APIs.
 */
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface TemporalGlassProps {
    children: React.ReactNode;
    style?: ViewStyle;
    width: number;
    height: number;
    phase: 'predawn' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'dusk' | 'night';
    cornerRadius?: number;
}

// Phase-specific top border colour — matches the Skia palette
const PHASE_BORDER: Record<string, string> = {
    predawn: 'rgba(184,169,224,0.20)',
    dawn: 'rgba(212,132,58,0.22)',
    morning: 'rgba(212,132,58,0.18)',
    midday: 'rgba(125,212,192,0.18)',
    afternoon: 'rgba(212,132,58,0.20)',
    evening: 'rgba(212,132,58,0.28)',
    dusk: 'rgba(184,169,224,0.22)',
    night: 'rgba(184,169,224,0.24)',
};

export const TemporalGlass: React.FC<TemporalGlassProps> = ({
    children,
    style,
    width,
    height,
    phase,
    cornerRadius = 20,
}) => {
    const borderColor = PHASE_BORDER[phase] ?? PHASE_BORDER.midday;

    return (
        <View
            style={[
                {
                    width,
                    height,
                    borderRadius: cornerRadius,
                    borderWidth: 1,
                    borderColor,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};
