import path from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { connectOrigins, securityHeaders } from './lib/security/responseHeaders';

/**
 * The client-app build of this same folder (decision: docs/decisions/2026-11-12-web-stack-astro-vite.md).
 * It runs the existing screens unchanged while they still import `next/*`: those three modules are
 * swapped for thin stand-ins on TanStack Router. Next keeps building from `app/` until each journey
 * is accepted here.
 *
 *   vite build --mode explore     explore.gurudevi.app: no account, no API, no database
 *   vite build                    sanctuary.gurudevi.app: signed-in people, the v1 API
 */
/**
 * What the host serves with each build (Cloudflare Pages reads both files): the security headers,
 * with Explore allowed to connect to nothing but itself, so the browser enforces that it never
 * reaches the backend; long caching for hashed assets; and every path answered by the app, so a
 * shared link or a refresh opens directly.
 */
function hostFiles(connect: readonly string[]): Plugin {
  return {
    name: 'gurudevi-host-files',
    apply: 'build',
    generateBundle() {
      const headers = Object.entries(
        securityHeaders({ connect, inlineScripts: false, development: false }),
      )
        .map(([name, value]) => `  ${name}: ${value}`)
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: `/*\n${headers}\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/index.html\n  Cache-Control: no-cache\n`,
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
        generatedRouteTree: path.join(root, 'generated/routeTree.gen.ts'),
        autoCodeSplitting: true,
      }),
      react(),
    ],
    resolve: {
      alias: [
        { find: /^next\/link$/, replacement: path.join(root, 'next/link.tsx') },
        { find: /^next\/navigation$/, replacement: path.join(root, 'next/navigation.ts') },
        { find: /^next\/image$/, replacement: path.join(root, 'next/image.tsx') },
        { find: /^@\//, replacement: `${__dirname}/` },
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
      // The browser client holds the session here; no server sets session cookies (see signOut.ts).
      'process.env.GURUDEVI_SESSION_COOKIES': JSON.stringify('browser'),
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
