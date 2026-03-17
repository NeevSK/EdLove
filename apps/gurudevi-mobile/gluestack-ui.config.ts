import { createConfig } from '@gluestack-ui/themed';
import { config as defaultConfig } from '@gluestack-ui/config';
import { Theme } from '@repo/ui';

// Extend the default config with our Sanctuary colors
// This allows using bg="$sanctuarySaffron" instead of Theme.colors.sanctuarySaffron
export const config = createConfig({
    ...defaultConfig,
    tokens: {
        ...defaultConfig.tokens,
        colors: {
            ...defaultConfig.tokens.colors,
            // Core
            sanctuarySaffron: Theme.colors.sanctuarySaffron,
            saffronMuted: Theme.colors.saffronMuted,
            gurudeviBlue: Theme.colors.gurudeviBlue,
            gurudeviViolet: Theme.colors.gurudeviViolet,
            // Dark Mode
            obsidian: Theme.colors.obsidian,
            ink: Theme.colors.ink,
            shroud: Theme.colors.shroud,
            sacredWhite: Theme.colors.sacredWhite,
            starlightGray: Theme.colors.starlightGray,
            // Light Mode
            vellum: Theme.colors.vellum,
            silk: Theme.colors.silk,
            linen: Theme.colors.linen,
            inkTruth: Theme.colors.inkTruth,
            bark: Theme.colors.bark,
            // Functional
            emberRed: Theme.colors.emberRed,
            sageGreen: Theme.colors.sageGreen,
            mossGreen: Theme.colors.mossGreen,
            amberGlow: Theme.colors.amberGlow,
            shadowViolet: Theme.colors.shadowViolet,
            mistGray: Theme.colors.mistGray,
        },
    },
});
