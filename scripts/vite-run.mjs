#!/usr/bin/env node
/**
 * Sovereign Vite Module Runner CLI Wrapper
 * 
 * Executes workspace automation scripts within Vite's cached transform graph
 * using Vite 8's native Module Runner API (V9 capability).
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

async function run() {
  const targetScript = process.argv[2];
  if (!targetScript) {
    console.error('Usage: node scripts/vite-run.mjs <path-to-script>');
    process.exit(1);
  }

  const workspaceRoot = process.cwd();
  const scriptPath = path.isAbsolute(targetScript)
    ? targetScript
    : path.resolve(workspaceRoot, targetScript);

  // Resolve vitest/vite from a package that has vitest installed (e.g. packages/core)
  const coreDir = path.resolve(workspaceRoot, 'packages/core');
  const vitestPath = require.resolve('vitest', { paths: [coreDir, workspaceRoot] });
  const vitePath = require.resolve('vite', { paths: [vitestPath, coreDir, workspaceRoot] });
  const { createServer, createServerModuleRunner } = await import(pathToFileURL(vitePath).href);

  const server = await createServer({
    configFile: false,
    root: workspaceRoot,
    server: {
      middlewareMode: true,
    },
  });

  try {
    const runner = createServerModuleRunner(server.environments.ssr);
    await runner.import(pathToFileURL(scriptPath).href);
  } catch (err) {
    console.error('Execution failed via Vite Module Runner:', err);
    process.exitCode = 1;
  } finally {
    await server.close();
  }
}

run();
