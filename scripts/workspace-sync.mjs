#!/usr/bin/env node
/**
 * @file workspace-sync.mjs
 * High-Speed Bidirectional Workspace Sync between Windows and Linux WSL2 (/home/nsk/projects/...)
 *
 * Usage:
 *   node scripts/workspace-sync.mjs                   # Auto-detect direction and sync
 *   node scripts/workspace-sync.mjs --to-wsl          # Push: Windows -> WSL
 *   node scripts/workspace-sync.mjs --to-win          # Pull: WSL -> Windows
 *   node scripts/workspace-sync.mjs --target terrain  # Target /home/nsk/projects/edlove-terrain (default)
 *   node scripts/workspace-sync.mjs --target ui       # Target /home/nsk/projects/polymath-platform
 *   node scripts/workspace-sync.mjs --dry-run         # Preview files without copying
 *   node scripts/workspace-sync.mjs --delete          # Mirror file deletions from source
 *   node scripts/workspace-sync.mjs --watch           # Continuous live file sync
 */

import { execSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirmWorkspacePull } from './lib/workspace-pull-safety.mjs';

const isWindows = process.platform === 'win32';
const args = process.argv.slice(2);

const hasFlag = (flag) => args.includes(flag);
const getArgValue = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const dryRun = hasFlag('--dry-run') || hasFlag('-n');
const deleteExtraneous = hasFlag('--delete');
const verbose = hasFlag('--verbose') || hasFlag('-v');
const watchMode = hasFlag('--watch') || hasFlag('-w');

const targetArg = getArgValue('--target') || 'terrain';
let wslTargetPath = '/home/nsk/projects/edlove-terrain';
if (targetArg === 'ui' || targetArg === 'polymath-platform') {
  wslTargetPath = '/home/nsk/projects/polymath-platform';
} else if (targetArg === 'terrain' || targetArg === 'edlove-terrain') {
  wslTargetPath = '/home/nsk/projects/edlove-terrain';
} else if (targetArg.startsWith('/') || targetArg.startsWith('~')) {
  wslTargetPath = targetArg.replace(/^~/, '/home/nsk');
}

// Windows Source / Destination resolution
let winSourcePath = 'C:\\x';
let winAsWslMount = '/mnt/c/x';

// Detect if running inside a specific repo directory
const currentDir = process.cwd();
if (currentDir.toLowerCase().includes('projects\\rn-terrain') || currentDir.toLowerCase().includes('projects/rn-terrain')) {
  winSourcePath = 'C:\\projects\\rn-terrain';
  winAsWslMount = '/mnt/c/projects/rn-terrain';
  if (targetArg === 'terrain') {
    wslTargetPath = '/home/nsk/projects/rn-terrain';
  }
} else if (currentDir.toLowerCase().includes('c:\\x') || currentDir.toLowerCase().includes('/mnt/c/x')) {
  winSourcePath = 'C:\\x';
  winAsWslMount = '/mnt/c/x';
}

// Direction resolution
let direction = 'to-wsl';
if (hasFlag('--to-win') || hasFlag('--pull')) {
  direction = 'to-win';
} else if (hasFlag('--to-wsl') || hasFlag('--push')) {
  direction = 'to-wsl';
} else {
  // If running in WSL from within /home/nsk, default to pushing back to Windows, otherwise to WSL
  if (!isWindows && currentDir.startsWith('/home/nsk')) {
    direction = 'to-win';
  } else {
    direction = 'to-wsl';
  }
}

const EXCLUDES = [
  '--exclude=node_modules',
  '--exclude=.git',
  '--exclude=.turbo',
  '--exclude=.expo',
  '--exclude=.next',
  '--exclude=.astro',
  '--exclude=dist',
  '--exclude=build',
  '--exclude=.gradle',
  '--exclude=android/build',
  '--exclude=android/app/build',
  '--exclude=android/.cxx',
  '--exclude=ios/build',
  '--exclude=ios/Pods',
  '--exclude=coverage',
  '--exclude=.cache',
  '--exclude=.pnpm-store',
  '--exclude=*.log',
  '--exclude=reports',
  '--exclude=docs',
  '--exclude=docs/research/edu-audit/data/raw'
].join(' ');

console.log('\n============================================================');
console.log('🔄 EdLove High-Speed Workspace Sync Engine');
console.log('============================================================');
console.log(`• Host Environment : ${isWindows ? 'Windows (via WSL bridge)' : 'Linux WSL2 (Native)'}`);
console.log(`• Direction        : ${direction === 'to-wsl' ? 'Windows -> WSL (Push)' : 'WSL -> Windows (Pull)'}`);
console.log(`• Windows Location : ${winSourcePath} (${winAsWslMount})`);
console.log(`• WSL Location     : ${wslTargetPath}`);
console.log(`• Options          : dry-run=${dryRun}, delete=${deleteExtraneous}, verbose=${verbose}`);
console.log('────────────────────────────────────────────────────────────');

let syncRunning = false;

async function runSync() {
  if (syncRunning) return;
  syncRunning = true;
  const startTime = Date.now();

  const src = direction === 'to-wsl' ? `${winAsWslMount}/` : `${wslTargetPath}/`;
  const dest = direction === 'to-wsl' ? `${wslTargetPath}/` : `${winAsWslMount}/`;

  const buildCommand = (preview) => {
    const flags = [
      '-a',
      preview || verbose ? '-v' : '-q',
      preview ? '--dry-run --itemize-changes' : '',
      deleteExtraneous ? '--delete' : '',
      ...EXCLUDES
    ].filter(Boolean).join(' ');

    return `mkdir -p "${wslTargetPath}" && rsync ${flags} "${src}" "${dest}"`;
  };

  const executeSync = (preview) => {
    const rsyncCmd = buildCommand(preview);
    if (isWindows) {
      const res = spawnSync('wsl.exe', ['-e', 'bash', '-c', rsyncCmd], { stdio: 'inherit' });
      if (res.status !== 0) {
        throw new Error(`wsl.exe exited with code ${res.status}`);
      }
    } else {
      execSync(rsyncCmd, { stdio: 'inherit' });
    }
  };

  try {
    if (direction === 'to-win' && !dryRun) {
      await confirmWorkspacePull(isWindows ? winSourcePath : winAsWslMount, () => executeSync(true));
    }
    executeSync(dryRun);
    const elapsed = Date.now() - startTime;
    console.log(`✅ Sync completed in ${elapsed}ms ${dryRun ? '(DRY RUN - No files modified)' : ''}`);
  } catch (error) {
    console.error(`❌ Sync failed:`, error.message);
    if (!watchMode) process.exit(1);
  } finally {
    syncRunning = false;
  }
}

await runSync();

if (watchMode) {
  console.log('\n👀 Watch mode enabled. Monitoring for file changes (press Ctrl+C to stop)...');
  const watchPath = direction === 'to-wsl' ? (isWindows ? winSourcePath : winAsWslMount) : wslTargetPath;

  let debounceTimer = null;
  try {
    fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('.turbo')) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`\n⚡ File change detected (${filename}). Synchronizing...`);
        runSync();
      }, 300);
    });
  } catch (err) {
    console.warn(`Watch not supported on this path: ${err.message}`);
  }
}
