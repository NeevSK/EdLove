import React, { useState } from 'react';
import { View, ViewProps, LayoutChangeEvent, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { LivingCard } from '../components-native/LivingCard';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    sx?: any; // For compatibility with existing patterns if needed
}

/**
 * GlassCard - Implements the "Glass Protocol"
 * A translucent, layered card for sanctuary depth, now powered by Skia LivingCard.
 */
export const GlassCard = ({ children, style, onLayout, ...props }: GlassCardProps) => {
    const { phase } = useTheme();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
        if (onLayout) onLayout(event);
    };

    return (
        <View
            style={[
                {
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.md,
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                },
                style,
            ]}
            onLayout={handleLayout}
            {...props}
        >
            {dimensions.width > 0 && (
                <View style={StyleSheet.absoluteFill}>
                    <LivingCard
                        width={dimensions.width}
                        height={dimensions.height}
                        {...({ phase } as any)}
                        cornerRadius={Theme.corners.generous}
                    >
                        {null}
                    </LivingCard>
                </View>
            )}
            {children}
        </View>
    );
};

