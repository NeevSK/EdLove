import { createConfig } from '@gluestack-ui/themed';
import { config as defaultConfig } from '@gluestack-ui/config';
import { Theme } from './src/constants/Theme';

// Extend the default config with our Sanctuary colors
// This allows using bg="$sanctuarySaffron" instead of Theme.colors.sanctuarySaffron
export const config = createConfig({
    ...defaultConfig,
    tokens: {
        ...defaultConfig.tokens,
        colors: {
            ...defaultConfig.tokens.colors,
            sanctuarySaffron: Theme.colors.sanctuarySaffron,
            sageGreen: Theme.colors.sageGreen,
            mossGreen: Theme.colors.mossGreen,
            amberGlow: Theme.colors.amberGlow,
            emberRed: Theme.colors.emberRed,
            creamSilence: Theme.colors.creamSilence,
            lotusWhite: Theme.colors.lotusWhite,
            sandStone: Theme.colors.sandStone,
            voidIndigo: Theme.colors.voidIndigo,
            deepIndigo: Theme.colors.deepIndigo,
            midnightBlue: Theme.colors.midnightBlue,
            sacredWhite: Theme.colors.sacredWhite,
            pearlGray: Theme.colors.pearlGray,
            mistGray: Theme.colors.mistGray,
        },
    },
});
