// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    site: 'https://gurudevi.edlove.org',
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                'expo-linear-gradient': fileURLToPath(new URL('./src/shims/expo-linear-gradient.tsx', import.meta.url)),
                'react-native-get-random-values': fileURLToPath(new URL('./src/shims/react-native-get-random-values.ts', import.meta.url))
            }
        }
    },
    integrations: [svelte(), sitemap()],
    adapter: vercel()
});
