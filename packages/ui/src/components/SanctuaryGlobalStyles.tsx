import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * SanctuaryGlobalStyles (Web-only)
 * 
 * Injects global CSS for the web platform to resolve "Aesthetic Decay"
 * and align with superior browser standards (e.g., custom scrollbars).
 */
export function SanctuaryGlobalStyles() {
    if (Platform.OS !== 'web') return null;

    const { accent, glass, text, isDark, gradientNodes } = useTheme();

    const scrollbarCss = `
        :root {
            /* Sanctuary Design Tokens as CSS Variables */
            --color-background: ${gradientNodes[0]};
            --color-text-primary: ${text.primary};
            --color-text-secondary: ${text.secondary};
            --color-accent: ${accent.action};
            --color-reward: ${accent.reward};
            --color-danger: ${accent.danger};
            --color-glass-border: ${glass.surface.border};
            
            /* Bridge Variables for LibraryScreen and legacy web components */
            --sanctuary-primary: ${gradientNodes[0]};
            --sanctuary-primary-rgb: ${isDark ? '26, 22, 16' : '245, 237, 214'};
            --sanctuary-text-primary: ${text.primary};
            --sanctuary-text-secondary: ${text.secondary};
            --sanctuary-saffron: ${accent.action};
            --sanctuary-saffron-rgb: 230, 126, 34;

            --spacing-md: 16px;
            --corner-md: 16px;
            --shadow-sm: 0 2px 4px rgba(107, 100, 128, 0.12);
        }

        /* Sanctuary Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--color-background);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--color-accent)44;
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--color-accent)88;
            border: 2px solid transparent;
            background-clip: content-box;
        }

        /* Smoothing for Web */
        * {
            scrollbar-width: thin;
            scrollbar-color: var(--color-accent)44 transparent;
            box-sizing: border-box;
        }

        /* Base web layout fixes */
        body {
            overscroll-behavior-y: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: var(--color-background);
            color: var(--color-text-primary);
        }
    `;

    return (
        <style dangerouslySetInnerHTML={{ __html: scrollbarCss }} />
    );
}

