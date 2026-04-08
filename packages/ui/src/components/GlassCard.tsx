import React from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Box } from '../gluestack';

interface GlassCardProps {
    children: React.ReactNode;
    style?: any;
    onLayout?: (event: LayoutChangeEvent) => void;
    className?: string;
}

/**
 * GlassCard - Implements the "Glass Protocol"
 * Hardened v3 implementation using NativeWind primitives.
 */
export const GlassCard = ({ children, style, onLayout, className, ...props }: GlassCardProps) => {
    return (
        <Box
            className={`rounded-[32px] p-4 bg-phase-surface border border-white/10 shadow-xl ${className || ''}`}
            style={style}
            onLayout={onLayout}
            {...props}
        >
            {children}
        </Box>
    );
};
