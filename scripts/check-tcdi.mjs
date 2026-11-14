#!/usr/bin/env node
// scripts/check-tcdi.mjs
// Sovereign Bridge: Connects c:/projects/rn-terrain TCDI Engine to c:/x monorepo

import { existsSync } from 'node:fs';
import { resolve, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');

// Path to TCDI engine in rn-terrain
const TCDI_ENGINE_PATH = resolve('c:/projects/rn-terrain/docs/changelog-intelligence/engine/project-kernel.mjs');
const MOBILE_MANIFEST_PATH = join(rootDir, 'apps/gurudevi-mobile/package.json');

console.log('🛡️  [TCDI GATEWAY] Temporal Convolutional Dependency Intelligence Bridge');
console.log(`📌 Engine Substrate:   ${TCDI_ENGINE_PATH}`);
console.log(`📱 Audited Manifest:   ${MOBILE_MANIFEST_PATH}`);

if (!existsSync(TCDI_ENGINE_PATH)) {
    console.warn('⚠️  [TCDI GATEWAY] Warning: rn-terrain TCDI engine not detected at local disk path. Skipping external TCDI check.');
    process.exit(0);
}

if (!existsSync(MOBILE_MANIFEST_PATH)) {
    console.error('❌ [TCDI GATEWAY] Error: apps/gurudevi-mobile/package.json not found.');
    process.exit(1);
}

const args = process.argv.slice(2);
const passThroughArgs =
  args.length > 0
    ? args.map((arg) => (arg.endsWith('.json') && !isAbsolute(arg) ? resolve(rootDir, arg) : arg))
    : ['--check', MOBILE_MANIFEST_PATH];

const proc = spawnSync(process.execPath, [TCDI_ENGINE_PATH, ...passThroughArgs], {
    stdio: 'inherit',
    env: process.env,
    cwd: resolve('c:/projects/rn-terrain/docs/changelog-intelligence')
});

if (proc.status !== 0) {
    process.exit(proc.status || 1);
}

console.log('\n✅ [TCDI GATEWAY] Dependency Convolution Audit Complete.');
