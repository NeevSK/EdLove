import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Get changed files compared to remote tracking branch
let changedFilesStr = '';
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  const remoteBranch = `origin/${currentBranch}`;

  // Verify if remote branch exists
  try {
    execSync(`git rev-parse --verify ${remoteBranch}`, { stdio: 'ignore' });
    changedFilesStr = execSync(`git diff --name-only ${remoteBranch}`, { encoding: 'utf8' }).trim();
  } catch {
    // If remote branch does not exist, fall back to comparing against HEAD~1 or HEAD
    try {
      changedFilesStr = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' }).trim();
    } catch {
      changedFilesStr = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    }
  }
} catch (err) {
  console.warn('⚠️  Could not determine git diff. Defaulting to empty.', err.message);
}

const changedFiles = changedFilesStr
  .split('\n')
  .map((f) => f.trim())
  .filter(Boolean);

if (changedFiles.length === 0) {
  console.log('>>> No changed files detected. Skipping surgical check.');
  process.exit(0);
}

const affectedPackages = new Set();
for (const file of changedFiles) {
  const parts = file.split(path.sep === '\\' ? /\\|\// : '/');
  if (parts[0] === 'packages' || parts[0] === 'apps') {
    const pkgRelPath = `${parts[0]}/${parts[1]}`;
    if (fs.existsSync(pkgRelPath)) {
      affectedPackages.add(pkgRelPath);
    }
  }
}

if (affectedPackages.size === 0) {
  console.log('>>> No package-level changes. Skipping surgical check.');
  process.exit(0);
}

const filterArgs = Array.from(affectedPackages)
  .map((pkg) => `--filter=./${pkg}`)
  .join(' ');

console.log(
  `>>> 🛡️  Surgical Push Sentinel: Auditing affected packages: ${Array.from(affectedPackages).join(', ')}`,
);

try {
  console.log('>>> 🛡️  Surgical Push Sentinel: Verifying architectural & evidence gates...');
  execSync('node scripts/audit-test-evidence-levels.mjs --changed', { stdio: 'inherit' });
  execSync('node scripts/check-effect-boundaries.mjs', { stdio: 'inherit' });

  const cmd = `pnpm exec turbo run lint check-types ${filterArgs} --continue --concurrency=1`;
  console.log(`>>> Executing: ${cmd}`);
  execSync(cmd, { stdio: ['ignore', 'inherit', 'inherit'] });
  console.log('\n✅ Surgical Push Sentinel: Affected packages integrity verified.');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Surgical Push Sentinel: Impurities detected in affected packages or verification gates.');
  process.exit(1);
}
