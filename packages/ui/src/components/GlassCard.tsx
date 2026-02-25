import React from 'react';
import { View, ViewProps } from 'react-native';
import { Theme } from '../theme/Theme';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    sx?: any; // For compatibility with existing patterns if needed
}

/**
 * GlassCard - Implements the "Glass Protocol"
 * A translucent, layered card for sanctuary depth.
 */
export const GlassCard = ({ children, style, ...props }: GlassCardProps) => {
    return (
        <View
            style={[
                {
                    backgroundColor: Theme.colors.glassHighlight,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: Theme.colors.glassBorder,
                    padding: Theme.spacing.md,
                    overflow: 'hidden',
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};
