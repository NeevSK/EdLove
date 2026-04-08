import React from 'react';
import { Pressable, Text, Platform } from 'react-native';
import { openExternalURL } from '../../../utils/linking';

/**
 * Link Component
 * 
 * Hardened primitive for navigational links.
 */
export const Link = ({ 
    children, 
    href, 
    onPress, 
    className,
    isExternal = true,
    ...props 
}: any) => {
    const handlePress = (e: any) => {
        if (onPress) {
            onPress(e);
            return;
        }
        
        if (href && isExternal) {
            openExternalURL(href);
        }
    };

    return (
        <Pressable 
            onPress={handlePress}
            accessibilityRole="link"
            className={`${className || ''}`}
            {...props}
        >
            {children}
        </Pressable>
    );
};

export const LinkText = ({ children, className }: any) => (
    <Text 
        className={`
            text-phase-accent font-medium
            ${Platform.OS === 'web' ? 'hover:underline' : ''}
            ${className || ''}
        `}
    >
        {children}
    </Text>
);
