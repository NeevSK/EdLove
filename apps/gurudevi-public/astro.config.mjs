// @ts-check
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// gurudevi.app is content that is the same for every visitor, so every page is built once at
// deploy time and served as a file. React renders on the build machine; it only reaches the
// browser for an island marked client:*.
export default defineConfig({
  output: 'static',
  site: 'https://gurudevi.app',
  // Transitional: the public assets still live with the Next app until its (marketing) routes
  // retire; then the folder moves here. Reading it in place avoids a second copy.
  publicDir: '../gurudevi-web/public',
  i18n: {
    locales: ['en', 'si', 'ta'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [react(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en-LK', si: 'si-LK', ta: 'ta-LK' } } })],
});
