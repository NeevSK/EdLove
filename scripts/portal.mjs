#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';

const rootDir = process.cwd();
const serverScript = path.join(rootDir, 'tooling', 'portal', 'server', 'portalServer.mjs');

console.log('[Sovereign Portal] Starting Polymath Dev-Console daemon on port 4242...');
const child = spawn(process.execPath, [serverScript], {
  stdio: 'inherit',
  cwd: rootDir
});

child.on('error', (err) => {
  console.error('[Sovereign Portal] Failed to start:', err);
});
