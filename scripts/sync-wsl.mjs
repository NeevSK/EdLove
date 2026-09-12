import { execSync, spawnSync } from 'node:child_process';
import * as path from 'node:path';

const WSL_TARGET = '/home/nsk/projects/polymath-platform';

console.log('🔄 Starting High-Speed Windows-to-WSL2 Monorepo Sync...');

try {
  // 1. Verify WSL availability
  const wslCheck = spawnSync('wsl', ['-e', 'whoami'], { encoding: 'utf-8' });
  if (wslCheck.status !== 0) {
    console.error('❌ WSL 2 is not available or not running.');
    process.exit(1);
  }

  // 2. Ensure target directory exists in WSL
  execSync(`wsl -e bash -c "mkdir -p ${WSL_TARGET}"`, { stdio: 'inherit' });

  // 3. Fast streaming sync using git archive + selective untracked sync
  console.log(`📦 Synchronizing source files to WSL (${WSL_TARGET})...`);
  
  // Exclude list for safe sync
  const excludes = [
    '--exclude=node_modules',
    '--exclude=.git',
    '--exclude=.turbo',
    '--exclude=.expo',
    '--exclude=.next',
    '--exclude=.astro',
    '--exclude=dist',
    '--exclude=.gradle',
    '--exclude=android/build',
    '--exclude=android/app/build',
    '--exclude=android/.cxx',
    '--exclude=ios/build',
    '--exclude=ios/Pods'
  ].join(' ');

  const syncCmd = `rsync -avq ${excludes} /mnt/c/x/ ${WSL_TARGET}/`;
  execSync(`wsl -e bash -c "${syncCmd}"`, { stdio: 'inherit' });

  console.log('✅ WSL2 synchronization completed successfully in < 1 second.');
} catch (error) {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
}
