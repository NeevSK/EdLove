import path from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin, runnerImport } from 'vite';
import { androidAssetLinks, appleAppSiteAssociation } from './lib/appLinks';
import { architectureSourcePlugin } from './lib/dev/architectureSource';
import { connectOrigins, headersBlock, securityHeaders } from '@repo/core/security/responseHeaders';

/**
 * Gurudevi's web app, built once per host (decision: docs/decisions/2026-11-12-web-stack-astro-vite.md).
 *
 *   vite build --mode explore     explore.gurudevi.app: no account, no API, no database
 *   vite build                    sanctuary.gurudevi.app: signed-in people, the v1 API
 */
/**
 * What the host serves with each build (Cloudflare Pages reads both files): the security headers,
 * with Explore allowed to connect to nothing but itself, so the browser enforces that it never
 * reaches the backend; long caching for hashed assets; the app-link files phones read; and every
 * path answered by the app, so a shared link or a refresh opens directly.
 */
function hostFiles(connect: readonly string[]): Plugin {
  return {
    name: 'gurudevi-host-files',
    apply: 'build',
    async generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: [
          headersBlock(securityHeaders({ connect, development: false })),
          '/assets/*\n  Cache-Control: public, max-age=31536000, immutable',
          '/index.html\n  Cache-Control: no-cache',
          // Apple reads this file only as JSON, and it has no extension to say so.
          '/.well-known/*\n  Content-Type: application/json\n  Cache-Control: public, max-age=86400',
        ].join('\n\n') + '\n',
      });
      // Every host follows the one crawler policy, which keeps the app's private paths unindexed.
      // Core is TypeScript source, so it is loaded through Vite rather than by Node directly.
      const { module: site } = await runnerImport<typeof import('@repo/core/site')>(
        '@repo/core/site',
        { configFile: false },
      );
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: site.robotsTxt() });
      this.emitFile({
        type: 'asset',
        fileName: '.well-known/apple-app-site-association',
        source: JSON.stringify(appleAppSiteAssociation()),
      });
      this.emitFile({
        type: 'asset',
        fileName: '.well-known/assetlinks.json',
        source: JSON.stringify(androidAssetLinks()),
      });
      this.emitFile({ type: 'asset', fileName: '_redirects', source: '/* /index.html 200\n' });
    },
  };
}

export default defineConfig(({ mode }) => {
  const explore = mode === 'explore';
  const root = path.resolve(__dirname, 'spa');
  return {
    root,
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [
      hostFiles(
        explore
          ? []
          : connectOrigins({
              authUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
            }),
      ),
      tanstackRouter({
        target: 'react',
        routesDirectory: path.join(root, 'routes'),
        // Explore has no accounts, so its routes leave out sign-in and recovery entirely (their
        // addresses forward to sanctuary from the root route). The full tree types every link.
        generatedRouteTree: path.join(
          root,
          explore ? 'generated/routeTree.explore.gen.ts' : 'generated/routeTree.gen.ts',
        ),
        ...(explore ? { routeFileIgnorePattern: '^_account(\\.tsx)?$' } : {}),
        autoCodeSplitting: true,
      }),
      react(),
      architectureSourcePlugin(),
    ],
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${__dirname}/` },
        ...(explore
          ? [
              {
                find: /^\.\/generated\/routeTree\.gen$/,
                replacement: path.join(root, 'generated/routeTree.explore.gen.ts'),
              },
            ]
          : []),
        // One surface per build: Explore's bundle never contains the account surface, and the reverse.
        {
          find: /^#surface$/,
          replacement: path.join(root, explore ? 'surface/explore.tsx' : 'surface/account.tsx'),
        },
      ],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
      // Explore has no backend by definition: every connection setting is empty in that build.
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
        explore ? '' : (process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
        explore ? '' : (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''),
      ),
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(
        explore ? '' : (process.env.NEXT_PUBLIC_API_URL ?? ''),
      ),
      'process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION ?? '',
      ),
    },
    build: {
      outDir: path.resolve(__dirname, explore ? 'dist-explore' : 'dist-sanctuary'),
      emptyOutDir: true,
    },
  };
});
