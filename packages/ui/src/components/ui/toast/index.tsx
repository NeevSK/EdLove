import React from 'react';
import { Box } from '../box';
import { Text } from '../text';
import { VStack } from '../vstack';

/**
 * Toast Component
 * 
 * Hardened primitive for system notifications.
 */
export const Toast = ({ children, className, action = 'attention', variant = 'solid' }: any) => {
    return (
        <Box 
            className={`p-4 rounded-xl border border-white/10 shadow-xl ${className || ''}`}
        >
            {children}
        </Box>
    );
};

export const ToastTitle = ({ children, className }: any) => (
    <Text className={`text-white font-bold ${className || ''}`}>
        {children}
    </Text>
);

export const ToastDescription = ({ children, className }: any) => (
    <Text className={`text-white/80 text-sm ${className || ''}`}>
        {children}
    </Text>
);
