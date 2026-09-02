// @ts-check

import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://gurudevi.edlove.org',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [svelte(), sitemap()],
});
