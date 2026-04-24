// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://neevsk.edlove.org',
    vite: {
        plugins: [tailwindcss()],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "variables" as *; `,
                    loadPaths: ['src/styles']
                }
            }
        }
    },
    integrations: [svelte(), react(), sitemap()]
});
