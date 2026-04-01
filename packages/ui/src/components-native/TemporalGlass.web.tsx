import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useActivityPulse } from '@repo/core';

interface TemporalGlassProps {
    children: React.ReactNode;
    style?: ViewStyle;
    width: number;
    height: number;
    phase: 'predawn' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'dusk' | 'night';
    cornerRadius?: number;
}

// Phase-specific luminous palette (matching native)
const PHASE_EDGES = {
    predawn: { top: 'rgba(184,169,224,0.30)', bottom: 'rgba(107,100,128,0.08)' },
    dawn: { top: 'rgba(212,132,58,0.35)', bottom: 'rgba(139,191,122,0.08)' },
    morning: { top: 'rgba(212,132,58,0.25)', bottom: 'rgba(139,191,122,0.12)' },
    midday: { top: 'rgba(125,212,192,0.25)', bottom: 'rgba(107,100,128,0.08)' },
    afternoon: { top: 'rgba(212,132,58,0.30)', bottom: 'rgba(184,169,224,0.08)' },
    evening: { top: 'rgba(212,132,58,0.40)', bottom: 'rgba(184,169,224,0.10)' },
    dusk: { top: 'rgba(184,169,224,0.35)', bottom: 'rgba(107,100,128,0.12)' },
    night: { top: 'rgba(184,169,224,0.35)', bottom: 'rgba(125,212,192,0.08)' },
};

export const TemporalGlass: React.FC<TemporalGlassProps> = ({
    children,
    style,
    width,
    height,
    phase,
    cornerRadius = 20,
}) => {
    const edges = PHASE_EDGES[phase] || PHASE_EDGES.midday;
    const { state } = useActivityPulse();
    const resonanceShift = state.pulse * 0.5;

    return (
        <View
            style={[
                {
                    width,
                    height,
                    borderRadius: cornerRadius,
                    overflow: 'hidden',
                    // High-fidelity web "Un-shimming" layer with Quantum Resonance
                    boxShadow: `inset 0 1px 0 0 ${edges.top}, 0 0 0 1px ${edges.bottom}, 0 4px 24px 0 rgba(0,0,0,${0.1 + resonanceShift})`,
                    // @ts-ignore
                    backdropFilter: `blur(${20 + resonanceShift * 20}px) saturate(${180 + resonanceShift * 100}%)`,
                    backgroundColor: `rgba(255, 255, 255, ${0.05 + resonanceShift * 0.05})`,
                } as any,
                style,
            ]}
        >
            <View style={StyleSheet.absoluteFill}>
                {children}
            </View>
        </View>
    );
};
