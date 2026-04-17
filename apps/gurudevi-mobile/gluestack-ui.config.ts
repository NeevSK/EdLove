import { createConfig, gluestackConfig as defaultConfig,  } from '@repo/ui';

// Extend the default config with our Sanctuary colors
// This allows using bg="$sanctuarySaffron" instead of sanctuarySaffron
export const config = createConfig({
    ...defaultConfig,
    tokens: {
        ...defaultConfig.tokens,
        colors: {
            ...defaultConfig.tokens.colors,
            // Core
            sanctuarySaffron: sanctuarySaffron,
            saffronMuted: saffronMuted,
            gurudeviBlue: gurudeviBlue,
            gurudeviViolet: gurudeviViolet,
            // Dark Mode
            obsidian: obsidian,
            ink: '#2A2318',
            shroud: shroud,
            sacredWhite: sacredWhite,
            starlightGray: starlightGray,
            // Light Mode
            vellum: vellum,
            silk: silk,
            linen: linen,
            inkTruth: '#2A2318'Truth,
            bark: bark,
            // Functional
            emberRed: emberRed,
            sageGreen: sageGreen,
            mossGreen: mossGreen,
            amberGlow: amberGlow,
            shadowViolet: shadowViolet,
            mistGray: mistGray}}});
