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

  // Ground environment variables with canonical VITE_* priority, falling back to legacy Doppler/Expo keys
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    '';
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    '';
  const apiUrl =
    process.env.VITE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    '';
  const supportAction =
    process.env.VITE_SUPPORT_FORM_ACTION ??
    process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION ??
    '';

  return {
    root,
    publicDir: path.resolve(__dirname, 'public'),
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
    plugins: [
      hostFiles(
        explore
          ? []
          : connectOrigins({
              authUrl: supabaseUrl,
              apiUrl: apiUrl,
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
        // In local development, devSurface dynamically dispatches by hostname (explore.localhost vs sanctuary.localhost).
        {
          find: /^#surface$/,
          replacement: path.join(
            root,
            explore
              ? 'surface/explore.tsx'
              : mode === 'development'
                ? 'surface/devSurface.tsx'
                : 'surface/account.tsx',
          ),
        },
      ],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
      // Canonical Vite environment variables
      'process.env.VITE_SUPABASE_URL': JSON.stringify(explore ? '' : supabaseUrl),
      'process.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(explore ? '' : supabaseKey),
      'process.env.VITE_API_URL': JSON.stringify(explore ? '' : apiUrl),
      'process.env.VITE_SUPPORT_FORM_ACTION': JSON.stringify(supportAction),

      // Backward-compatible aliases for legacy references
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(explore ? '' : supabaseUrl),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(explore ? '' : supabaseKey),
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(explore ? '' : apiUrl),
      'process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION': JSON.stringify(supportAction),

      // Doppler / Expo aliases
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(explore ? '' : supabaseUrl),
      'process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(explore ? '' : supabaseKey),
      'process.env.EXPO_PUBLIC_API_URL': JSON.stringify(explore ? '' : apiUrl),
      'process.env.SUPABASE_URL': JSON.stringify(explore ? '' : supabaseUrl),
    },
    build: {
      outDir: path.resolve(__dirname, explore ? 'dist-explore' : 'dist-sanctuary'),
      emptyOutDir: true,
    },
  };
});
