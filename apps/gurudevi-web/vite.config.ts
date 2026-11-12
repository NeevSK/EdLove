import path from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The client-app build of this same folder (decision: docs/decisions/2026-11-12-web-stack-astro-vite.md).
 * It runs the existing screens unchanged while they still import `next/*`: those three modules are
 * swapped for thin stand-ins on TanStack Router. Next keeps building from `app/` until each journey
 * is accepted here.
 *
 *   vite build --mode explore     the Explore build: no account, no API, no database
 */
export default defineConfig(({ mode }) => {
  const explore = mode === 'explore';
  const root = path.resolve(__dirname, 'spa');
  return {
    root,
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [
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
      ],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
      // Explore has no backend by definition: every connection setting is empty in that build.
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(explore ? '' : (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
        explore ? '' : (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''),
      ),
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(explore ? '' : (process.env.NEXT_PUBLIC_API_URL ?? '')),
      'import.meta.env.VITE_SURFACE': JSON.stringify(explore ? 'explore' : 'sanctuary'),
    },
    build: {
      outDir: path.resolve(__dirname, explore ? 'dist-explore' : 'dist-sanctuary'),
      emptyOutDir: true,
    },
  };
});
