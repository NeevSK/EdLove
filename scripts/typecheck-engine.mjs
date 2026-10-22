#!/usr/bin/env node
/**
 * Polymath Platform: Sovereign Dual-Engine Typechecker
 * 
 * Orchestrates:
 * 1. Primary Engine (`tsgo` / `tsc`): Official multi-threaded Go-based compiler in TypeScript 7.1.0-beta.
 *    Full composite project reference awareness, declaration emission, and cross-platform reliability.
 * 2. Velocity Engine (`tsrs`): High-throughput, zero-GC Rust type checker (oxc-project).
 *    Optimized for Linux/WSL2, CI runners (Dagger alpine containers), and sub-second fast feedback.
 * 
 * Auto-detects platform capabilities with seamless graceful fallback.
 */

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);

// Options parsing
let engine = 'auto'; // 'auto' | 'tsgo' | 'tsrs'
let fastMode = false;
let buildMode = false;
let profiling = false;
let trackTiming = true;
const forwardArgs = [];

for (const arg of args) {
  if (arg.startsWith('--engine=')) {
    engine = arg.split('=')[1];
  } else if (arg === '--fast') {
    fastMode = true;
  } else if (arg === '--profile') {
    profiling = true;
  } else if (arg === '--no-timing') {
    trackTiming = false;
  } else if (arg === '--build' || arg === '-b') {
    buildMode = true;
    forwardArgs.push(arg);
  } else {
    forwardArgs.push(arg);
  }
}

// TypeScript 7.1 Go Runtime Profiling
if (profiling) {
  const profileDir = resolve(root, '.profiles', 'tsgo');
  mkdirSync(profileDir, { recursive: true });
  forwardArgs.push('--pprofDir', profileDir);
  console.log(`\x1b[35m[typecheck-engine] TS 7.1 pprof Go runtime profiling active -> ${profileDir}\x1b[0m`);
}

// Ensure default flags if none provided
if (!buildMode && !forwardArgs.includes('--noEmit') && !forwardArgs.includes('--project') && !forwardArgs.includes('-p')) {
  if (profiling) {
    // Single project / root mode allows --pprofDir
    forwardArgs.unshift('--noEmit');
  } else {
    // Default composite build check
    buildMode = true;
    forwardArgs.unshift('--build', '--noEmit');
  }
}

const isWin = process.platform === 'win32';
const hasCustomTsrs = Boolean(process.env.TSRS_BINARY && existsSync(process.env.TSRS_BINARY));

// Determine active engine
let selectedEngine = 'tsgo';
if (engine === 'tsrs') {
  if (isWin && !hasCustomTsrs) {
    console.warn('\x1b[33m[typecheck-engine] Warning: tsrs is not published with pre-built win32-x64 binaries on npm yet.\x1b[0m');
    console.warn('\x1b[33m[typecheck-engine] Falling back to sovereign Go-based engine (tsc @ TypeScript 7.1.0-beta).\x1b[0m');
    selectedEngine = 'tsgo';
  } else {
    selectedEngine = 'tsrs';
  }
} else if (engine === 'tsgo') {
  selectedEngine = 'tsgo';
} else {
  // auto mode
  if (fastMode && (!isWin || hasCustomTsrs) && !buildMode) {
    selectedEngine = 'tsrs';
  } else {
    selectedEngine = 'tsgo';
  }
}

console.log(`\x1b[36m[typecheck-engine] Platform: ${process.platform} (${process.arch}) | Engine: ${selectedEngine.toUpperCase()}\x1b[0m`);

const executable = (name) => (isWin ? `${name}.cmd` : name);

let result;
const startTime = performance.now();
if (selectedEngine === 'tsrs') {
  const binary = process.env.TSRS_BINARY || executable('tsrs');
  console.log(`\x1b[32m[typecheck-engine] Executing tsrs (Rust / Oxc) with args: ${forwardArgs.join(' ')}\x1b[0m`);
  result = spawnSync(binary, forwardArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: isWin,
    env: process.env,
  });
} else {
  // Sovereign Go-powered tsc (TS 7.1.0-beta)
  const tscBin = resolve(root, 'node_modules', '.bin', executable('tsc'));
  console.log(`\x1b[34m[typecheck-engine] Executing tsc (Go / tsgo v7.1.0-beta) with args: ${forwardArgs.join(' ')}\x1b[0m`);
  result = spawnSync(tscBin, forwardArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: isWin,
    env: process.env,
  });
}
const durationMs = (performance.now() - startTime).toFixed(1);

if (trackTiming) {
  console.log(`\x1b[36m[typecheck-engine] Elapsed: ${durationMs}ms | Exit: ${result.status ?? 0}\x1b[0m`);
}

if (result.error) {
  console.error(`\x1b[31m[typecheck-engine] Failed to spawn ${selectedEngine}: ${result.error.message}\x1b[0m`);
  process.exit(1);
}

process.exit(result.status ?? 0);

