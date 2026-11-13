// @ts-check
import { writeFile } from 'node:fs/promises';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { BASE_HEADERS, CONTENT_DIRECTIVES, headersBlock } from '@repo/core/security/responseHeaders';
import { defineConfig } from 'astro/config';
import { sitemapMeta } from './src/lib/sitemap.ts';
import { statusApiOrigin } from './src/lib/statusApi.ts';

/**
 * The headers every response carries, from the definition the app hosts share. The content
 * policy itself is per page: Astro hashes each page's inline scripts and styles into it.
 */
const hostHeaders = {
  name: 'gurudevi-host-headers',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const body = [
        // A meta tag cannot forbid framing; only the header can.
        headersBlock({ ...BASE_HEADERS, 'Content-Security-Policy': "frame-ancestors 'none'" }),
        '/_astro/*\n  Cache-Control: public, max-age=31536000, immutable',
      ].join('\n\n');
      await writeFile(new URL('_headers', dir), `${body}\n`);
    },
  },
};

// gurudevi.app is content that is the same for every visitor, so every page is built once at
// deploy time and served as a file. React renders on the build machine; it only reaches the
// browser for an island marked client:*.
export default defineConfig({
  output: 'static',
  site: 'https://gurudevi.app',
  i18n: {
    locales: ['en', 'si', 'ta'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
  // Code is never highlighted here; Shiki's inline styles would also break the content policy.
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      // The status page reads the API's health; nothing else here connects anywhere.
      directives: [
        ...CONTENT_DIRECTIVES,
        `connect-src 'self' ${statusApiOrigin(process.env.PUBLIC_SANCTUARY_API_ORIGIN)}`,
      ],
      styleDirective: { resources: ["'self'", 'https://fonts.googleapis.com'] },
    },
  },
  integrations: [
    hostHeaders,
    react(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-LK', si: 'si-LK', ta: 'ta-LK' } },
      serialize: (item) => ({ ...item, ...sitemapMeta(new URL(item.url).pathname) }),
    }),
  ],
});
