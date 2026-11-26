import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://edlove.org',

  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  integrations: [svelte(), sitemap()],

  redirects: {
    '/cosmos': '/research/cosmos',
    '/cosmos/[slug]': '/research/cosmos/[slug]',
    '/library': '/research/library',
    '/library/[...slug]': '/research/library/[...slug]',
    '/sri-lanka': '/research/sri-lanka',
    '/innovations': '/tech/innovations',
    '/innovations/[...slug]': '/tech/innovations/[...slug]',
    '/care/innovations': '/tech/innovations',
    '/care/innovations/[...slug]': '/tech/innovations/[...slug]',
    '/community': '/care/sangha',
    '/gurudevi': '/tech/gurudevi',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'si', 'ta'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
