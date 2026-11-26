#!/usr/bin/env node
// Forwarding wrapper ensuring single source of truth for portal server
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const serverScript = path.join(rootDir, 'tooling', 'portal', 'server', 'portalServer.mjs');

console.log('[Dashboard Service] Delegating to Sovereign Portal Server at http://localhost:4242/...');
const child = spawn(process.execPath, [serverScript], {
  stdio: 'inherit',
  cwd: rootDir
});

child.on('error', (err) => {
  console.error('[Dashboard Service] Failed to start portal server:', err);
});
