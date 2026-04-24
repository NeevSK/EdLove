// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://edlove.org',

  vite: {
    plugins: [/** @type {any} */ (tailwindcss())]
  },

  integrations: [svelte(), sitemap()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'si', 'ta'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
