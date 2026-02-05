// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [svelte()],
  
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'si', 'ta'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});