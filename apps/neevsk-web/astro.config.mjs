// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://neevsk.edlove.org',
  vite: {
    plugins: [tailwindcss()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "variables" as *; `,
          loadPaths: ['src/styles'],
        },
      },
    },
  },
  integrations: [svelte(), react(), sitemap()],
});
